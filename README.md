# 入園管理システム（Webアプリケーション版）

Flask（Python）ベースのWebアプリケーションによる年間パスポート入園管理システムです。

## 概要

このシステムは、年間パスポートを持つ来園者の入場判定を行い、履歴を記録・管理します。
ブラウザからアクセス可能で、イントラネット内の複数PCから同時利用が可能です。

### 主な機能

- **入場判定**: TKT番号を入力し、有効期限や入場回数をチェック
- **チケット管理**: 年間パスポート情報の登録・編集・削除
- **履歴管理**: 入場履歴の閲覧・編集・削除
- **データエクスポート**: CSV形式でデータ出力
- **CSV一括登録**: CSVファイルからチケット情報を一括登録

## システム要件

- Python 3.8 以上
- pip (Pythonパッケージマネージャ)
- Webブラウザ (Chrome, Firefox, Edge など)

## セットアップ

### 1. プロジェクトディレクトリへ移動

```bash
cd entry-management-web
```

### 2. 仮想環境の作成（推奨）

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

### 4. データベースの初期化

初回起動時に自動的にSQLiteデータベースが作成されます。

### 5. アプリケーションの起動

```bash
python app.py
```

サーバーが起動すると以下のように表示されます：

```
サーバーを起動します: http://0.0.0.0:5000
イントラネット内の他のPCからアクセス可能です
```

## アクセス方法

### ローカルPCからのアクセス

```
http://localhost:5000
```

### イントラネット内の他のPCからのアクセス

サーバーを起動しているPCのIPアドレスを確認し、以下のURLでアクセスします：

```
http://[サーバーのIPアドレス]:5000
```

**IPアドレスの確認方法：**

Windows:
```bash
ipconfig
```

Linux/Mac:
```bash
ifconfig
```

例：サーバーのIPアドレスが `192.168.1.100` の場合
```
http://192.168.1.100:5000
```

## 使い方

### 入場判定

1. メイン画面の「入場判定」フィールドにTKT番号を入力
2. Enterキーまたは「判定実行」ボタンをクリック
3. 判定結果が表示され、履歴に記録される

### チケット登録

1. 「チケット管理」ページを開く
2. 新規チケット登録フォームに情報を入力
   - TKT番号（4～5桁の数字）
   - 年齢
   - 性別（男性/女性/それ以外）
   - 券種（大人/子供）
   - 使用開始日
   - 備考（任意）
3. 「新規登録」ボタンをクリック

### CSV一括登録

1. CSVファイルを以下の形式で作成：

```csv
TKT番号,年齢,性別,券種,使用開始日,備考
1234,25,男性,大人,2025/11/23,テストユーザー
5678,10,女性,子供,2025/11/23,
```

2. メイン画面の「観客リスト読込」ボタンをクリック
3. CSVファイルを選択してアップロード

### データ出力

1. 「データ出力」ボタンをクリック
2. 入園履歴がCSV形式でダウンロードされる

## データベース

SQLiteを使用しています。データベースファイル `entry_management.db` は初回起動時に自動作成されます。

### テーブル構成

#### tickets（年間パスポートマスタ）
- tkt_number: TKT番号（主キー）
- age: 年齢
- gender: 性別
- ticket_type: 券種
- start_date: 使用開始日
- expiry_date: 有効期限
- is_transfer: 引継ぎフラグ
- previous_tkt_number: 前回TKT番号
- remarks: 備考
- created_at: 作成日時
- updated_at: 更新日時

#### entry_logs（入園履歴）
- id: ID（自動採番）
- tkt_number: TKT番号
- entry_time: 入園時間
- result: 判定結果（OK/NG）
- comment: コメント
- is_reentry: 再入場フラグ
- created_at: 作成日時

## 入場判定ロジック

以下の順序でチェックを行います：

1. **TKT番号の存在確認**
   - 登録されていない場合 → NG（登録なし）

2. **有効期限チェック**
   - 有効期限が切れている場合 → NG（有効期限切れ）

3. **当日入場回数チェック**
   - 本日すでに2回以上入場している場合 → NG（本日、入場回数2回以上）

4. **判定OK**
   - 上記すべてをクリアした場合 → OK

## プロジェクト構成

```
entry-management-web/
├── app.py                    # Flaskアプリケーションのエントリーポイント
├── config.py                 # 設定ファイル
├── requirements.txt          # Python依存関係
├── models/                   # データモデル
│   ├── ticket.py
│   └── entry_log.py
├── routes/                   # REST APIエンドポイント
│   ├── entry.py             # 入場判定API
│   ├── ticket.py            # チケット管理API
│   ├── history.py           # 履歴管理API
│   └── export_data.py       # データエクスポートAPI
├── services/                 # ビジネスロジック
│   ├── entry_judgement.py
│   └── validation.py
├── database/                 # データベース管理
│   └── __init__.py
├── static/                   # 静的ファイル
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js
│       ├── ticket.js
│       └── history.js
└── templates/                # HTMLテンプレート
    ├── index.html
    ├── tickets.html
    └── history.html
```

## REST API エンドポイント

### 入場判定
- `POST /api/entry/judge` - 入場判定実行

### チケット管理
- `GET /api/tickets` - チケット一覧取得
- `GET /api/tickets/<tkt_number>` - チケット詳細取得
- `POST /api/tickets` - チケット登録
- `PUT /api/tickets/<tkt_number>` - チケット更新
- `DELETE /api/tickets/<tkt_number>` - チケット削除
- `POST /api/tickets/import` - CSV一括登録

### 履歴管理
- `GET /api/history` - 履歴一覧取得
- `GET /api/history/<id>` - 履歴詳細取得
- `PUT /api/history/<id>` - 履歴更新
- `DELETE /api/history/<id>` - 履歴削除

### データエクスポート
- `GET /api/export/history` - 入園履歴CSV出力
- `GET /api/export/tickets` - チケット情報CSV出力

## トラブルシューティング

### ポート5000が既に使用されている

`config.py` の `PORT` を変更してください：

```python
PORT = 5001  # 別のポート番号に変更
```

### 他のPCからアクセスできない

1. ファイアウォールで5000番ポートが開放されているか確認
2. サーバーPCとクライアントPCが同じネットワークに接続されているか確認

### データベース接続エラー

データベースファイルが破損している場合は、`entry_management.db` を削除して再起動してください。

### 文字化け

CSVファイルの文字化けが発生する場合は、UTF-8（BOM付き）で保存してください。

## Web公開（無料ホスティング）

このアプリケーションは以下の無料サービスで公開できます。詳細な手順は **DEPLOY.md** を参照してください。

### PythonAnywhere（推奨）
- Pythonに特化したホスティング
- 無料プラン: 1つのWebアプリ、512MB RAM
- SQLite対応
- URL例: `yourusername.pythonanywhere.com`

### その他のオプション
- **Render**: 自動デプロイ、独自ドメイン対応
- **Railway**: $5/月の無料クレジット、PostgreSQL対応
- **Fly.io**: 3つの小規模アプリ無料、グローバル展開可能
- **Replit**: ブラウザ上で開発・公開

## 本番環境へのデプロイ

本番環境で使用する場合は、以下の設定変更を推奨します：

1. `config.py` で `DEBUG = False` に設定
2. `SECRET_KEY` を環境変数で設定
3. SQLiteではなくPostgreSQLやMySQLを使用（本格運用の場合）
4. Gunicorn + Nginxなどの本番用Webサーバーを使用

**セキュリティに関する注意:**
- 現在のアプリケーションには認証機能がありません
- 公開する場合はBasic認証やログイン機能の追加を推奨

## ライセンス

このプロジェクトは学習・教育目的で作成されました。

## 作成者

入園管理システム開発チーム
