# 入園管理システム - 仕様書

## バージョン情報
- **バージョン**: 2.0.0 (Web版)
- **作成日**: 2025-11-23
- **最終更新**: 2025-11-24

## 1. システム概要

### 1.1 目的
年間パスポートを持つ来園者の入場判定を行い、履歴を記録・管理するWebアプリケーション。
イントラネット内の複数PCから同時アクセス可能なクライアント・サーバー型システム。

### 1.2 旧システムとの違い

| 項目 | 旧システム (Java Swing) | 新システム (Flask Web) |
|------|------------------------|----------------------|
| アーキテクチャ | スタンドアロン | Client-Server |
| UI | デスクトップアプリ | Webブラウザ |
| 同時利用 | 不可（1台のみ） | 可能（複数台） |
| データ共有 | 不可 | 可能 |
| アクセス方法 | ローカル起動 | URL経由 |
| 導入の容易さ | Java環境必要 | ブラウザのみ |
| メンテナンス | クライアント配布 | サーバー更新のみ |

## 2. 技術スタック

### 2.1 バックエンド
- **言語**: Python 3.8+
- **フレームワーク**: Flask 3.0.0
- **ORM**: SQLAlchemy (Flask-SQLAlchemy 3.1.1)
- **CORS対応**: Flask-CORS 4.0.0
- **データベース**: SQLite3（開発・小規模運用）

### 2.2 フロントエンド
- **HTML5**: セマンティックマークアップ
- **CSS3**: カスタムスタイル（レスポンシブ対応）
- **JavaScript**: Vanilla JS (ES6+)
- **通信**: Fetch API (REST)

### 2.3 インフラ
- **Webサーバー**: Werkzeug (Flask組み込み、開発用)
- **推奨本番環境**: Gunicorn + Nginx
- **推奨本番DB**: PostgreSQL / MySQL

## 3. システムアーキテクチャ

### 3.1 全体構成

```
┌─────────────────────────────────────────┐
│  クライアント（Webブラウザ）             │
│  - PC-A, PC-B, PC-C...                  │
│  - イントラネット内のすべての端末        │
└─────────────┬───────────────────────────┘
              │ HTTP/HTTPS
              │ (REST API)
┌─────────────▼───────────────────────────┐
│  Flaskサーバー (ローカルサーバーPC)      │
│  ┌──────────────────────────────────┐   │
│  │  routes/     (REST APIエンドポイント) │
│  │  ├─ entry.py                     │   │
│  │  ├─ ticket.py                    │   │
│  │  ├─ history.py                   │   │
│  │  └─ export_data.py               │   │
│  └──────────┬───────────────────────┘   │
│             │                            │
│  ┌──────────▼───────────────────────┐   │
│  │  services/  (ビジネスロジック)   │   │
│  │  ├─ entry_judgement.py           │   │
│  │  └─ validation.py                │   │
│  └──────────┬───────────────────────┘   │
│             │                            │
│  ┌──────────▼───────────────────────┐   │
│  │  models/    (データモデル)       │   │
│  │  ├─ ticket.py                    │   │
│  │  └─ entry_log.py                 │   │
│  └──────────┬───────────────────────┘   │
└─────────────┼───────────────────────────┘
              │ SQLAlchemy
┌─────────────▼───────────────────────────┐
│  SQLite Database                         │
│  - entry_management.db                   │
│  - tickets テーブル                      │
│  - entry_logs テーブル                   │
└─────────────────────────────────────────┘
```

### 3.2 レイヤー構造

```
┌──────────────────────────────┐
│  Presentation Layer          │  templates/ + static/
│  (HTML/CSS/JavaScript)       │
├──────────────────────────────┤
│  API Layer                   │  routes/ (Blueprint)
│  (REST Endpoints)            │
├──────────────────────────────┤
│  Business Logic Layer        │  services/
│  (入場判定、バリデーション)   │
├──────────────────────────────┤
│  Data Access Layer           │  models/ (SQLAlchemy)
│  (ORM)                       │
├──────────────────────────────┤
│  Database Layer              │  SQLite / PostgreSQL
└──────────────────────────────┘
```

## 4. 機能仕様

### 4.1 入場判定機能

**画面**: メイン画面 (`/`)

**処理フロー**:
1. ユーザーがTKT番号を入力
2. フロントエンドがREST APIにPOSTリクエスト
3. バックエンドで判定処理実行
   - TKT番号の存在確認
   - 有効期限チェック
   - 当日入場回数チェック（2回以上でNG）
4. 判定結果を返却
5. 入園履歴をデータベースに記録
6. フロントエンドに結果を表示

**API**: `POST /api/entry/judge`

**リクエスト**:
```json
{
  "tkt_number": "1234"
}
```

**レスポンス**:
```json
{
  "success": true,
  "judgement": {
    "valid": true,
    "result": "OK",
    "comment": "",
    "ticket": {
      "tkt_number": "1234",
      "age": 25,
      "gender": "男性",
      "ticket_type": "大人",
      "expiry_date": "2026-11-23"
    }
  },
  "entry_log": {
    "id": 1,
    "tkt_number": "1234",
    "entry_time": "2025-11-24T06:00:00",
    "result": "OK",
    "comment": ""
  }
}
```

**判定ロジック**:
```
1. TKT番号が登録されているか？
   NO → NG「登録なし」
   YES → 次へ

2. 有効期限が切れていないか？
   YES（切れている） → NG「有効期限切れ」
   NO → 次へ

3. 本日の入場回数は2回未満か？
   NO（2回以上） → NG「本日、入場回数2回以上」
   YES → OK
```

### 4.2 チケット管理機能

**画面**: チケット管理画面 (`/tickets-page`)

#### 4.2.1 新規登録
- **API**: `POST /api/tickets`
- **必須項目**: TKT番号、年齢、性別、券種、使用開始日
- **任意項目**: 備考
- **自動計算**: 有効期限 = 使用開始日 + 365日

#### 4.2.2 一覧表示
- **API**: `GET /api/tickets`
- **表示項目**: TKT番号、年齢、性別、券種、使用開始日、有効期限、備考
- **ソート**: 作成日時の降順

#### 4.2.3 編集
- **API**: `PUT /api/tickets/<tkt_number>`
- **編集可能項目**: 年齢、性別、券種、使用開始日、有効期限、備考
- **編集不可項目**: TKT番号（主キー）

#### 4.2.4 削除
- **API**: `DELETE /api/tickets/<tkt_number>`
- **カスケード削除**: 関連する入園履歴も削除

#### 4.2.5 CSV一括登録
- **API**: `POST /api/tickets/import`
- **フォーマット**: UTF-8（BOM付き推奨）
- **ヘッダー**: TKT番号,年齢,性別,券種,使用開始日,備考
- **日付形式**: YYYY/MM/DD

### 4.3 履歴管理機能

**画面**: 履歴管理画面 (`/history-page`)

#### 4.3.1 一覧表示
- **API**: `GET /api/history`
- **フィルタ**: TKT番号による検索
- **ソート**: 入園時間の降順

#### 4.3.2 編集
- **API**: `PUT /api/history/<id>`
- **編集可能項目**: 入園時間、判定結果、コメント、再入場フラグ
- **編集不可項目**: ID、TKT番号

#### 4.3.3 削除
- **API**: `DELETE /api/history/<id>`

### 4.4 データエクスポート機能

#### 4.4.1 入園履歴エクスポート
- **API**: `GET /api/export/history`
- **形式**: CSV（UTF-8 BOM付き）
- **ファイル名**: `entry_history_YYYYMMDD_HHMMSS.csv`

#### 4.4.2 チケット情報エクスポート
- **API**: `GET /api/export/tickets`
- **形式**: CSV（UTF-8 BOM付き）
- **ファイル名**: `tickets_YYYYMMDD_HHMMSS.csv`

## 5. データベース設計

### 5.1 テーブル定義

#### tickets（年間パスポートマスタ）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| tkt_number | VARCHAR(10) | PRIMARY KEY | TKT番号 |
| age | INTEGER | NOT NULL | 年齢 |
| gender | VARCHAR(10) | NOT NULL | 性別（男性/女性/それ以外） |
| ticket_type | VARCHAR(10) | NOT NULL | 券種（大人/子供） |
| start_date | DATE | NOT NULL | 使用開始日 |
| expiry_date | DATE | NOT NULL | 有効期限 |
| is_transfer | BOOLEAN | DEFAULT FALSE | 引継ぎフラグ |
| previous_tkt_number | VARCHAR(10) | NULL | 前回TKT番号 |
| remarks | TEXT | NULL | 備考 |
| created_at | TIMESTAMP | DEFAULT NOW | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW | 更新日時 |

**インデックス**:
- `idx_tickets_expiry`: expiry_date

#### entry_logs（入園履歴）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID |
| tkt_number | VARCHAR(10) | NOT NULL, FK(tickets) | TKT番号 |
| entry_time | TIMESTAMP | NOT NULL | 入園時間 |
| result | VARCHAR(5) | NOT NULL | 判定結果（OK/NG） |
| comment | TEXT | NULL | コメント |
| is_reentry | BOOLEAN | DEFAULT FALSE | 再入場フラグ |
| created_at | TIMESTAMP | DEFAULT NOW | 作成日時 |

**インデックス**:
- `idx_entry_logs_tkt`: tkt_number
- `idx_entry_logs_time`: entry_time

**外部キー制約**:
- tkt_number → tickets(tkt_number) ON DELETE CASCADE

### 5.2 ER図

```
┌─────────────────────────────┐
│ tickets                     │
├─────────────────────────────┤
│ PK: tkt_number              │
│     age                     │
│     gender                  │
│     ticket_type             │
│     start_date              │
│     expiry_date             │
│     is_transfer             │
│     previous_tkt_number     │
│     remarks                 │
│     created_at              │
│     updated_at              │
└─────────┬───────────────────┘
          │ 1
          │
          │ N
┌─────────▼───────────────────┐
│ entry_logs                  │
├─────────────────────────────┤
│ PK: id                      │
│ FK: tkt_number              │
│     entry_time              │
│     result                  │
│     comment                 │
│     is_reentry              │
│     created_at              │
└─────────────────────────────┘
```

## 6. REST API仕様

### 6.1 エンドポイント一覧

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| POST | /api/entry/judge | 入場判定実行 |
| GET | /api/tickets | チケット一覧取得 |
| GET | /api/tickets/:tkt_number | チケット詳細取得 |
| POST | /api/tickets | チケット新規登録 |
| PUT | /api/tickets/:tkt_number | チケット更新 |
| DELETE | /api/tickets/:tkt_number | チケット削除 |
| POST | /api/tickets/import | CSV一括登録 |
| GET | /api/history | 履歴一覧取得 |
| GET | /api/history/:id | 履歴詳細取得 |
| PUT | /api/history/:id | 履歴更新 |
| DELETE | /api/history/:id | 履歴削除 |
| GET | /api/export/history | 履歴CSV出力 |
| GET | /api/export/tickets | チケットCSV出力 |

### 6.2 エラーレスポンス

全エンドポイント共通のエラーフォーマット:

```json
{
  "error": "エラーメッセージ"
}
```

HTTPステータスコード:
- `200`: 成功
- `201`: 作成成功
- `400`: リクエストエラー（バリデーション失敗）
- `404`: リソースが見つからない
- `500`: サーバーエラー

## 7. セキュリティ仕様

### 7.1 実装済み
- CORS対応（Flask-CORS）
- SQLインジェクション対策（SQLAlchemy ORM）
- XSS対策（HTMLエスケープ）

### 7.2 今後の拡張推奨
- 認証機能（JWT、セッション管理）
- 権限管理（管理者/一般ユーザー）
- HTTPS対応（本番環境）
- CSRF対策
- レート制限

## 8. 非機能要件

### 8.1 パフォーマンス
- 入場判定: 1秒以内
- データ取得: 2秒以内（100件まで）
- 同時接続: 最大10ユーザー（SQLite制約）

### 8.2 可用性
- 開発環境: 99%
- 本番環境推奨: 99.9%（冗長化構成）

### 8.3 スケーラビリティ
- 現在: 小規模（～100チケット、～1000履歴/日）
- 拡張時: PostgreSQL移行で～10万チケット対応可能

## 9. 運用仕様

### 9.1 バックアップ
- **対象**: entry_management.db
- **頻度**: 日次（推奨）
- **方法**: ファイルコピー

### 9.2 ログ
- **アクセスログ**: Flaskコンソール出力
- **エラーログ**: 標準エラー出力
- **本番推奨**: ファイル出力 + ログローテーション

### 9.3 メンテナンス
- **データベース最適化**: 月次（VACUUM）
- **アプリケーション更新**: サーバー再起動のみ

## 10. 今後の拡張可能性

### 10.1 短期（1～3ヶ月）
- [ ] ユーザー認証・権限管理
- [ ] ダッシュボード（統計情報表示）
- [ ] 検索機能の強化
- [ ] PDF出力機能

### 10.2 中期（3～6ヶ月）
- [ ] モバイル対応（レスポンシブデザイン強化）
- [ ] リアルタイム通知（WebSocket）
- [ ] バーコード/QRコードスキャン
- [ ] データ分析機能

### 10.3 長期（6ヶ月～）
- [ ] マイクロサービス化
- [ ] クラウド対応（AWS/Azure）
- [ ] 多言語対応
- [ ] APIバージョニング

## 11. 制約事項

### 11.1 現在の制約
- SQLiteは同時書き込みに弱い（10接続まで推奨）
- 大量データ（10万件以上）は性能劣化の可能性
- 認証機能なし（イントラネット限定を想定）

### 11.2 解決策
- PostgreSQL/MySQLへの移行
- Gunicorn + Nginx構成
- 認証機能の追加

## 12. 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-23 | Java Swing版リリース |
| 2.0.0 | 2025-11-24 | Flask Web版リリース |

---

**作成者**: 入園管理システム開発チーム
**最終更新**: 2025-11-24
