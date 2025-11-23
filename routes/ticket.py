from flask import request, jsonify
from datetime import datetime, timedelta
from . import api
from models.ticket import Ticket
from database import db
from services.validation import ValidationService
import csv
import io

@api.route('/tickets', methods=['GET'])
def get_tickets():
    """チケット一覧取得API"""
    try:
        tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()
        return jsonify({
            'success': True,
            'tickets': [ticket.to_dict() for ticket in tickets]
        }), 200
    except Exception as e:
        return jsonify({'error': f'チケット取得エラー: {str(e)}'}), 500

@api.route('/tickets/<tkt_number>', methods=['GET'])
def get_ticket(tkt_number):
    """チケット詳細取得API"""
    try:
        ticket = Ticket.query.filter_by(tkt_number=tkt_number).first()
        if not ticket:
            return jsonify({'error': 'チケットが見つかりません'}), 404

        return jsonify({
            'success': True,
            'ticket': ticket.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': f'チケット取得エラー: {str(e)}'}), 500

@api.route('/tickets', methods=['POST'])
def create_ticket():
    """チケット登録API"""
    try:
        data = request.get_json()

        # バリデーション
        valid, errors = ValidationService.validate_ticket_data(data)
        if not valid:
            return jsonify({'error': errors}), 400

        # TKT番号の重複チェック
        existing = Ticket.query.filter_by(tkt_number=data['tkt_number']).first()
        if existing:
            return jsonify({'error': 'このTKT番号は既に登録されています'}), 400

        # 有効期限の計算（使用開始日 + 365日）
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        expiry_date = start_date + timedelta(days=365)

        # チケット作成
        ticket = Ticket(
            tkt_number=data['tkt_number'],
            age=int(data['age']),
            gender=data['gender'],
            ticket_type=data['ticket_type'],
            start_date=start_date,
            expiry_date=expiry_date,
            is_transfer=data.get('is_transfer', False),
            previous_tkt_number=data.get('previous_tkt_number'),
            remarks=data.get('remarks')
        )

        db.session.add(ticket)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'チケットを登録しました',
            'ticket': ticket.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'チケット登録エラー: {str(e)}'}), 500

@api.route('/tickets/<tkt_number>', methods=['PUT'])
def update_ticket(tkt_number):
    """チケット更新API"""
    try:
        ticket = Ticket.query.filter_by(tkt_number=tkt_number).first()
        if not ticket:
            return jsonify({'error': 'チケットが見つかりません'}), 404

        data = request.get_json()

        # 更新可能なフィールドのみ更新
        if 'age' in data:
            ticket.age = int(data['age'])
        if 'gender' in data:
            ticket.gender = data['gender']
        if 'ticket_type' in data:
            ticket.ticket_type = data['ticket_type']
        if 'start_date' in data:
            ticket.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        if 'expiry_date' in data:
            ticket.expiry_date = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
        if 'is_transfer' in data:
            ticket.is_transfer = data['is_transfer']
        if 'previous_tkt_number' in data:
            ticket.previous_tkt_number = data['previous_tkt_number']
        if 'remarks' in data:
            ticket.remarks = data['remarks']

        ticket.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'チケットを更新しました',
            'ticket': ticket.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'チケット更新エラー: {str(e)}'}), 500

@api.route('/tickets/<tkt_number>', methods=['DELETE'])
def delete_ticket(tkt_number):
    """チケット削除API"""
    try:
        ticket = Ticket.query.filter_by(tkt_number=tkt_number).first()
        if not ticket:
            return jsonify({'error': 'チケットが見つかりません'}), 404

        db.session.delete(ticket)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'チケットを削除しました'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'チケット削除エラー: {str(e)}'}), 500

@api.route('/tickets/import', methods=['POST'])
def import_tickets():
    """CSV一括登録API"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'ファイルが選択されていません'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'ファイルが選択されていません'}), 400

        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'CSVファイルを選択してください'}), 400

        # CSVを読み込み
        stream = io.StringIO(file.stream.read().decode("UTF-8"), newline=None)
        csv_reader = csv.DictReader(stream)

        success_count = 0
        error_count = 0
        errors = []

        for row in csv_reader:
            try:
                # 有効期限の計算
                start_date = datetime.strptime(row['使用開始日'], '%Y/%m/%d').date()
                expiry_date = start_date + timedelta(days=365)

                ticket = Ticket(
                    tkt_number=row['TKT番号'],
                    age=int(row['年齢']),
                    gender=row['性別'],
                    ticket_type=row['券種'],
                    start_date=start_date,
                    expiry_date=expiry_date,
                    remarks=row.get('備考', '')
                )

                db.session.add(ticket)
                db.session.commit()
                success_count += 1

            except Exception as e:
                db.session.rollback()
                error_count += 1
                errors.append(f"TKT番号 {row.get('TKT番号', '不明')}: {str(e)}")

        return jsonify({
            'success': True,
            'message': f'読み込み完了 成功: {success_count}件 エラー: {error_count}件',
            'success_count': success_count,
            'error_count': error_count,
            'errors': errors
        }), 200

    except Exception as e:
        return jsonify({'error': f'CSV読み込みエラー: {str(e)}'}), 500
