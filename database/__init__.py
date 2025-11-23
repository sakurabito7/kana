from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    """データベースを初期化"""
    db.init_app(app)
    with app.app_context():
        db.create_all()
        print("データベースの初期化が完了しました")
