# PythonAnywhereデプロイ手順

このドキュメントでは、入園管理システムをPythonAnywhereに無料でデプロイする手順を説明します。

## 前提条件
- GitHubリポジトリ: https://github.com/sakurabito7/kana.git
- PythonAnywhereの無料アカウント

## デプロイ手順

### 1. PythonAnywhereアカウント作成

1. https://www.pythonanywhere.com/ にアクセス
2. 右上の「Pricing & signup」をクリック
3. 「Create a Beginner account」（無料プラン）を選択
4. メールアドレス、ユーザー名、パスワードを入力して登録

### 2. Bashコンソールでリポジトリをクローン

1. PythonAnywhereのダッシュボードから「Consoles」タブをクリック
2. 「Bash」をクリックして新しいBashコンソールを開く
3. 以下のコマンドを実行:

```bash
# リポジトリをクローン
git clone https://github.com/sakurabito7/kana.git

# ディレクトリに移動
cd kana/entry-management-web

# ファイル構成を確認
ls -la
```

### 3. 仮想環境作成とライブラリインストール

```bash
# 仮想環境を作成（Python 3.10を使用）
mkvirtualenv --python=/usr/bin/python3.10 entrymanagement

# ライブラリをインストール
pip install -r requirements.txt

# インストール確認
pip list
```

### 4. Web appの設定

1. PythonAnywhereのダッシュボードから「Web」タブをクリック
2. 「Add a new web app」ボタンをクリック
3. ドメイン名を確認（`yourusername.pythonanywhere.com`）して「Next」
4. 「Manual configuration」を選択
5. Python version: 「Python 3.10」を選択

### 5. WSGI設定ファイルの編集

1. Webタブの「Code」セクションで「WSGI configuration file」のリンクをクリック
2. ファイル内容を**すべて削除**して、以下に置き換え:

```python
import sys
import os

# プロジェクトのパスを追加（yourusernameを実際のユーザー名に変更）
path = '/home/yourusername/kana/entry-management-web'
if path not in sys.path:
    sys.path.insert(0, path)

# 環境変数を設定
os.environ['FLASK_ENV'] = 'production'

# Flaskアプリケーションをインポート
from app import create_app
application = create_app()
```

**重要**: `yourusername` の部分を自分のPythonAnywhereユーザー名に変更してください。

3. 「Save」ボタンをクリック

### 6. 仮想環境のパスを設定

1. Webタブの「Virtualenv」セクションで「Enter path to a virtualenv」をクリック
2. 以下のパスを入力（yourusernameを実際のユーザー名に変更）:
   ```
   /home/yourusername/.virtualenvs/entrymanagement
   ```
3. チェックマークをクリック

### 7. Static filesの設定

1. Webタブの「Static files」セクションで「Enter URL」に以下を入力:
   ```
   /static/
   ```
2. 「Enter path」に以下を入力（yourusernameを実際のユーザー名に変更）:
   ```
   /home/yourusername/kana/entry-management-web/static
   ```
3. チェックマークをクリック

### 8. データベースの初期化（自動）

アプリケーションは初回起動時に自動的にデータベースを作成します。

### 9. Webアプリの起動

1. Webタブの上部にある緑色の「Reload yourusername.pythonanywhere.com」ボタンをクリック
2. 数秒待ってから、表示されているURLをクリック
3. 入園管理システムが表示されれば成功！

## アクセスURL

デプロイ後、以下のURLでアクセス可能です:
```
https://yourusername.pythonanywhere.com
```

## トラブルシューティング

### エラーログの確認方法

1. Webタブの「Log files」セクションを確認
2. 「Error log」をクリックしてエラー内容を確認

### よくあるエラー

**1. "ImportError: No module named 'flask'"**
- 解決方法: 仮想環境のパスが正しく設定されているか確認
- `pip list` で Flask がインストールされているか確認

**2. "Application failed to start"**
- 解決方法: WSGI設定ファイルのパスが正しいか確認
- Error logでスタックトレースを確認

**3. "Static files not loading"**
- 解決方法: Static filesのパスが正しいか確認
- パスの最後にスラッシュが無いことを確認

### コードの更新方法

コードを更新する場合:

```bash
# Bashコンソールで実行
cd ~/kana/entry-management-web
git pull origin main

# Webタブで「Reload」ボタンをクリック
```

## 無料プランの制限

- CPU時間: 100秒/日
- ディスク容量: 512MB
- 1つのWebアプリのみ
- カスタムドメインは使用不可
- HTTPS: 対応（pythonanywhere.comドメイン）

## セキュリティに関する注意

現在のアプリケーションには認証機能がありません。公開する場合は以下を検討してください:

1. Basic認証の追加
2. IPアドレス制限
3. ログイン機能の実装

## サポート

問題が発生した場合:
- PythonAnywhere Forum: https://www.pythonanywhere.com/forums/
- Help page: https://help.pythonanywhere.com/
