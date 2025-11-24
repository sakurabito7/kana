import re
from datetime import datetime

class ValidationService:
    """バリデーションサービス"""

    @staticmethod
    def validate_tkt_number(tkt_number):
        """TKT番号のバリデーション"""
        if not tkt_number:
            return False, "TKT番号が入力されていません"

        return True, None

    @staticmethod
    def validate_age(age):
        """年齢のバリデーション"""
        try:
            age_int = int(age)
            if age_int < 0 or age_int > 150:
                return False, "年齢は0～150の範囲で入力してください"
            return True, None
        except (ValueError, TypeError):
            return False, "年齢は数値で入力してください"

    @staticmethod
    def validate_gender(gender):
        """性別のバリデーション"""
        valid_genders = ["男性", "女性", "それ以外"]
        if gender not in valid_genders:
            return False, f"性別は{', '.join(valid_genders)}のいずれかを選択してください"
        return True, None

    @staticmethod
    def validate_ticket_type(ticket_type):
        """券種のバリデーション"""
        valid_types = ["大人", "子供"]
        if ticket_type not in valid_types:
            return False, f"券種は{', '.join(valid_types)}のいずれかを選択してください"
        return True, None

    @staticmethod
    def validate_date(date_str):
        """日付のバリデーション"""
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
            return True, None
        except (ValueError, TypeError):
            return False, "日付は YYYY-MM-DD 形式で入力してください"

    @staticmethod
    def validate_ticket_data(data):
        """チケットデータ全体のバリデーション"""
        errors = []

        # TKT番号
        valid, msg = ValidationService.validate_tkt_number(data.get('tkt_number'))
        if not valid:
            errors.append(msg)

        # 年齢
        valid, msg = ValidationService.validate_age(data.get('age'))
        if not valid:
            errors.append(msg)

        # 性別
        valid, msg = ValidationService.validate_gender(data.get('gender'))
        if not valid:
            errors.append(msg)

        # 券種
        valid, msg = ValidationService.validate_ticket_type(data.get('ticket_type'))
        if not valid:
            errors.append(msg)

        # 使用開始日
        valid, msg = ValidationService.validate_date(data.get('start_date'))
        if not valid:
            errors.append(msg)

        if errors:
            return False, errors

        return True, None
