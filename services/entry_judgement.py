from datetime import datetime, date
from models.ticket import Ticket
from models.entry_log import EntryLog
from database import db

class EntryJudgementService:
    """入場判定サービス"""

    @staticmethod
    def judge(tkt_number):
        """
        TKT番号による入場判定を実行する

        Args:
            tkt_number: TKT番号

        Returns:
            dict: 判定結果 {
                'valid': bool,
                'result': str ('OK' or 'NG'),
                'comment': str,
                'is_reentry': bool,
                'ticket': dict or None
            }
        """
        # 1. TKT番号の存在確認
        ticket = Ticket.query.filter_by(tkt_number=tkt_number).first()
        if not ticket:
            return {
                'valid': False,
                'result': 'NG',
                'comment': '登録なし',
                'is_reentry': False,
                'ticket': None
            }

        # 2. 有効期限チェック
        if EntryJudgementService._is_expired(ticket.expiry_date):
            return {
                'valid': False,
                'result': 'NG',
                'comment': '有効期限切れ',
                'is_reentry': False,
                'ticket': ticket.to_dict()
            }

        # 3. 当日入場回数チェック（再入場判定）
        today_entries = EntryJudgementService._count_today_entries(tkt_number)
        is_reentry = today_entries >= 1

        # 4. 判定OK（入場回数制限なし）
        comment = '再入場' if is_reentry else ''
        return {
            'valid': True,
            'result': 'OK',
            'comment': comment,
            'is_reentry': is_reentry,
            'ticket': ticket.to_dict()
        }

    @staticmethod
    def _is_expired(expiry_date):
        """有効期限が切れているかチェック"""
        if not expiry_date:
            return True
        today = date.today()
        return expiry_date < today

    @staticmethod
    def _count_today_entries(tkt_number):
        """当日の入場回数をカウント"""
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = datetime.now().replace(hour=23, minute=59, second=59, microsecond=999999)

        count = EntryLog.query.filter(
            EntryLog.tkt_number == tkt_number,
            EntryLog.entry_time >= today_start,
            EntryLog.entry_time <= today_end,
            EntryLog.result == 'OK'
        ).count()

        return count

    @staticmethod
    def record_entry(tkt_number, result, comment, is_reentry=False):
        """
        入園履歴を記録する

        Args:
            tkt_number: TKT番号
            result: 判定結果 ('OK' or 'NG')
            comment: コメント
            is_reentry: 再入場フラグ

        Returns:
            EntryLog: 記録された入園履歴
        """
        entry_log = EntryLog(
            tkt_number=tkt_number,
            entry_time=datetime.now(),
            result=result,
            comment=comment,
            is_reentry=is_reentry
        )

        db.session.add(entry_log)
        db.session.commit()

        return entry_log
