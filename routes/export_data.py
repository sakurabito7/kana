from flask import jsonify, make_response
from datetime import datetime
from . import api
from models.entry_log import EntryLog
import csv
import io

@api.route('/export/history', methods=['GET'])
def export_history():
    """入園履歴CSV出力API"""
    try:
        # 全履歴を取得
        logs = EntryLog.query.order_by(EntryLog.entry_time.desc()).all()

        # CSV生成
        output = io.StringIO()
        writer = csv.writer(output)

        # ヘッダー
        writer.writerow(['ID', 'TKT番号', '入園時間', '判定結果', 'コメント', '再入場'])

        # データ行
        for log in logs:
            writer.writerow([
                log.id,
                log.tkt_number,
                log.entry_time.strftime('%Y/%m/%d %H:%M:%S') if log.entry_time else '',
                log.result,
                log.comment or '',
                '○' if log.is_reentry else ''
            ])

        # レスポンス作成
        output.seek(0)
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv; charset=utf-8-sig'
        response.headers['Content-Disposition'] = f'attachment; filename=entry_history_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'

        return response

    except Exception as e:
        return jsonify({'error': f'エクスポートエラー: {str(e)}'}), 500

@api.route('/export/tickets', methods=['GET'])
def export_tickets():
    """チケット情報CSV出力API"""
    try:
        from models.ticket import Ticket

        # 全チケットを取得
        tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()

        # CSV生成
        output = io.StringIO()
        writer = csv.writer(output)

        # ヘッダー
        writer.writerow(['TKT番号', '年齢', '性別', '券種', '使用開始日', '有効期限', '備考'])

        # データ行
        for ticket in tickets:
            writer.writerow([
                ticket.tkt_number,
                ticket.age,
                ticket.gender,
                ticket.ticket_type,
                ticket.start_date.strftime('%Y/%m/%d') if ticket.start_date else '',
                ticket.expiry_date.strftime('%Y/%m/%d') if ticket.expiry_date else '',
                ticket.remarks or ''
            ])

        # レスポンス作成
        output.seek(0)
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv; charset=utf-8-sig'
        response.headers['Content-Disposition'] = f'attachment; filename=tickets_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'

        return response

    except Exception as e:
        return jsonify({'error': f'エクスポートエラー: {str(e)}'}), 500
