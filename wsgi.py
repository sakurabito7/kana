"""WSGI エントリーポイント（本番環境用）"""
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run()
