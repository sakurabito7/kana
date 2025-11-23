from flask import request, jsonify
from datetime import datetime
from . import api
from models.entry_log import EntryLog
from database import db

@api.route('/history', methods=['GET'])
def get_history():
    """入園履歴一覧取得API"""
    try:
        # クエリパラメータ取得
        tkt_number = request.args.get('tkt_number')
        limit = request.args.get('limit', type=int)

        query = EntryLog.query

        # TKT番号でフィルタ
        if tkt_number:
            query = query.filter_by(tkt_number=tkt_number)

        # 新しい順にソート
        query = query.order_by(EntryLog.entry_time.desc())

        # 件数制限
        if limit:
            query = query.limit(limit)

        logs = query.all()

        return jsonify({
            'success': True,
            'logs': [log.to_dict() for log in logs]
        }), 200

    except Exception as e:
        return jsonify({'error': f'履歴取得エラー: {str(e)}'}), 500

@api.route('/history/<int:log_id>', methods=['GET'])
def get_history_detail(log_id):
    """入園履歴詳細取得API"""
    try:
        log = EntryLog.query.get(log_id)
        if not log:
            return jsonify({'error': '履歴が見つかりません'}), 404

        return jsonify({
            'success': True,
            'log': log.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': f'履歴取得エラー: {str(e)}'}), 500

@api.route('/history/<int:log_id>', methods=['PUT'])
def update_history(log_id):
    """入園履歴更新API"""
    try:
        log = EntryLog.query.get(log_id)
        if not log:
            return jsonify({'error': '履歴が見つかりません'}), 404

        data = request.get_json()

        # 更新可能なフィールドのみ更新
        if 'entry_time' in data:
            log.entry_time = datetime.fromisoformat(data['entry_time'])
        if 'result' in data:
            log.result = data['result']
        if 'comment' in data:
            log.comment = data['comment']
        if 'is_reentry' in data:
            log.is_reentry = data['is_reentry']

        db.session.commit()

        return jsonify({
            'success': True,
            'message': '履歴を更新しました',
            'log': log.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'履歴更新エラー: {str(e)}'}), 500

@api.route('/history/<int:log_id>', methods=['DELETE'])
def delete_history(log_id):
    """入園履歴削除API"""
    try:
        log = EntryLog.query.get(log_id)
        if not log:
            return jsonify({'error': '履歴が見つかりません'}), 404

        db.session.delete(log)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': '履歴を削除しました'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'履歴削除エラー: {str(e)}'}), 500
