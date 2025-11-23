from flask import Blueprint

# Blueprintの作成
api = Blueprint('api', __name__, url_prefix='/api')

# 各ルートのインポート
from . import entry, ticket, history, export_data

__all__ = ['api']
