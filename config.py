import os

class Config:
    """アプリケーション設定"""

    # データベース設定
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(BASE_DIR, "entry_management.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Flask設定
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # サーバ設定
    HOST = '0.0.0.0'  # すべてのネットワークインターフェースでリッスン
    PORT = 5000
    DEBUG = True  # 本番環境ではFalseに設定

    # アップロード設定
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 最大16MB
    ALLOWED_EXTENSIONS = {'csv'}

    @staticmethod
    def init_app(app):
        """アプリケーション初期化"""
        # アップロードフォルダが存在しない場合は作成
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
