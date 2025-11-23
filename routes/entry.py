from flask import request, jsonify
from . import api
from services.entry_judgement import EntryJudgementService
from services.validation import ValidationService

@api.route('/entry/judge', methods=['POST'])
def judge_entry():
    """入場判定API"""
    try:
        data = request.get_json()
        tkt_number = data.get('tkt_number', '').strip()

        # バリデーション
        valid, msg = ValidationService.validate_tkt_number(tkt_number)
        if not valid:
            return jsonify({'error': msg}), 400

        # 入場判定実行
        result = EntryJudgementService.judge(tkt_number)

        # 履歴記録（再入場フラグを判定結果から取得）
        entry_log = EntryJudgementService.record_entry(
            tkt_number=tkt_number,
            result=result['result'],
            comment=result['comment'],
            is_reentry=result.get('is_reentry', False)
        )

        # レスポンス
        response = {
            'success': True,
            'judgement': result,
            'entry_log': entry_log.to_dict()
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({'error': f'判定処理でエラーが発生しました: {str(e)}'}), 500
