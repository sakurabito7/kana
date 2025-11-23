from flask import Flask, render_template
from flask_cors import CORS
from config import Config
from database import db, init_db

def create_app(config_class=Config):
    """Flaskアプリケーションのファクトリー関数"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # CORS設定（クロスオリジン対応）
    CORS(app)

    # データベース初期化
    db.init_app(app)

    # ルート登録
    from routes import api
    app.register_blueprint(api)

    # メインページのルート
    @app.route('/')
    def index():
        """メイン画面"""
        return render_template('index.html')

    @app.route('/tickets-page')
    def tickets_page():
        """チケット管理画面"""
        return render_template('tickets.html')

    @app.route('/history-page')
    def history_page():
        """履歴管理画面"""
        return render_template('history.html')

    # データベーステーブルを作成
    with app.app_context():
        db.create_all()
        print("データベーステーブルを初期化しました")

    return app

if __name__ == '__main__':
    app = create_app()
    print(f"サーバーを起動します: http://{Config.HOST}:{Config.PORT}")
    print(f"イントラネット内の他のPCからアクセス可能です")
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
