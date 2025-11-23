# 入園管理システム - 実装計画書

## プロジェクト情報
- **プロジェクト名**: 入園管理システム（Web版）
- **バージョン**: 2.0.0
- **開発期間**: 2025-11-23 ～ 2025-11-24
- **ステータス**: ✅ 完了

## 1. プロジェクト概要

### 1.1 背景
既存のJava Swing版スタンドアロンアプリケーションを、イントラネット内で複数PCから同時アクセス可能なWebアプリケーションに刷新。

### 1.2 目標
- ✅ ブラウザベースのUIで操作性向上
- ✅ 複数端末からの同時アクセス対応
- ✅ データ共有の実現
- ✅ 導入・メンテナンスの簡素化

### 1.3 採用技術の選定理由

| 技術 | 選定理由 |
|------|---------|
| Flask | 軽量で学習コストが低い、REST API構築に最適 |
| SQLAlchemy | ORM採用でSQLインジェクション対策、DB移行が容易 |
| Vanilla JS | 外部ライブラリ依存なし、高速、学習コスト低 |
| SQLite | 導入が簡単、小規模運用に最適、ファイルベースでバックアップ容易 |

## 2. 開発フェーズ

### Phase 1: 要件分析・設計 ✅ 完了
**期間**: 2025-11-23 (2時間)

**実施内容**:
- [x] 既存Java版の機能分析
- [x] データモデル設計
- [x] REST API設計
- [x] UI/UX設計
- [x] プロジェクト構造設計

**成果物**:
- システム構成図
- データベース設計書
- API仕様書
- ディレクトリ構造

### Phase 2: 環境構築 ✅ 完了
**期間**: 2025-11-23 (30分)

**実施内容**:
- [x] Pythonプロジェクト初期化
- [x] 依存パッケージ定義（requirements.txt）
- [x] プロジェクトディレクトリ作成
- [x] 設定ファイル作成（config.py）

**成果物**:
- requirements.txt
- config.py
- .gitignore
- ディレクトリ構造

### Phase 3: バックエンド実装 ✅ 完了
**期間**: 2025-11-23 (4時間)

#### 3.1 データモデル層 ✅
- [x] Ticketモデル（models/ticket.py）
- [x] EntryLogモデル（models/entry_log.py）
- [x] データベース初期化処理（database/__init__.py）

#### 3.2 ビジネスロジック層 ✅
- [x] 入場判定サービス（services/entry_judgement.py）
- [x] バリデーションサービス（services/validation.py）

#### 3.3 API層 ✅
- [x] 入場判定API（routes/entry.py）
- [x] チケット管理API（routes/ticket.py）
- [x] 履歴管理API（routes/history.py）
- [x] エクスポートAPI（routes/export_data.py）

#### 3.4 メインアプリケーション ✅
- [x] Flaskアプリケーション初期化（app.py）
- [x] Blueprint登録
- [x] CORS設定

**成果物**:
- models/ticket.py
- models/entry_log.py
- services/entry_judgement.py
- services/validation.py
- routes/entry.py
- routes/ticket.py
- routes/history.py
- routes/export_data.py
- app.py

### Phase 4: フロントエンド実装 ✅ 完了
**期間**: 2025-11-23 ～ 2025-11-24 (5時間)

#### 4.1 スタイル ✅
- [x] 共通CSS（static/css/style.css）
- [x] レスポンシブ対応
- [x] カラースキーム統一

#### 4.2 HTMLテンプレート ✅
- [x] メイン画面（templates/index.html）
- [x] チケット管理画面（templates/tickets.html）
- [x] 履歴管理画面（templates/history.html）

#### 4.3 JavaScript ✅
- [x] メイン画面ロジック（static/js/main.js）
- [x] チケット管理ロジック（static/js/ticket.js）
- [x] 履歴管理ロジック（static/js/history.js）
- [x] Fetch API実装
- [x] エラーハンドリング

**成果物**:
- static/css/style.css
- templates/index.html
- templates/tickets.html
- templates/history.html
- static/js/main.js
- static/js/ticket.js
- static/js/history.js

### Phase 5: テスト・デバッグ ✅ 完了
**期間**: 2025-11-24 (2時間)

**実施内容**:
- [x] 依存パッケージインストール確認
- [x] サーバー起動確認
- [x] データベース初期化確認
- [x] REST APIエンドポイントテスト
- [x] フロントエンド動作確認
- [x] ブラウザアクセステスト
- [x] イントラネット接続確認

**テスト結果**:
- ✅ サーバー起動: 正常
- ✅ データベース初期化: 正常
- ✅ API応答: 正常（200 OK）
- ✅ HTML配信: 正常
- ✅ ブラウザアクセス: 正常
- ✅ イントラネット接続: 正常（http://192.168.1.4:5000）

### Phase 6: ドキュメント作成 ✅ 完了
**期間**: 2025-11-24 (1時間)

**実施内容**:
- [x] README.md（ユーザー向け）
- [x] SPECIFICATION.md（仕様書）
- [x] IMPLEMENTATION_PLAN.md（本ドキュメント）

**成果物**:
- README.md
- SPECIFICATION.md
- IMPLEMENTATION_PLAN.md

## 3. 実装詳細

### 3.1 ディレクトリ構成

```
entry-management-web/
├── app.py                      # Flaskアプリケーションエントリーポイント
├── config.py                   # 設定ファイル
├── requirements.txt            # Python依存関係
├── README.md                   # ユーザー向けドキュメント
├── SPECIFICATION.md            # システム仕様書
├── IMPLEMENTATION_PLAN.md      # 実装計画書
├── .gitignore                  # Git除外設定
│
├── database/                   # データベース管理
│   └── __init__.py            # DB初期化処理
│
├── models/                     # データモデル（SQLAlchemy）
│   ├── __init__.py
│   ├── ticket.py              # Ticketモデル
│   └── entry_log.py           # EntryLogモデル
│
├── routes/                     # REST APIエンドポイント
│   ├── __init__.py
│   ├── entry.py               # 入場判定API
│   ├── ticket.py              # チケット管理API
│   ├── history.py             # 履歴管理API
│   └── export_data.py         # エクスポートAPI
│
├── services/                   # ビジネスロジック
│   ├── __init__.py
│   ├── entry_judgement.py     # 入場判定ロジック
│   └── validation.py          # バリデーション
│
├── static/                     # 静的ファイル
│   ├── css/
│   │   └── style.css          # スタイルシート
│   ├── js/
│   │   ├── main.js            # メイン画面ロジック
│   │   ├── ticket.js          # チケット管理ロジック
│   │   └── history.js         # 履歴管理ロジック
│   └── uploads/               # アップロード一時保管
│       └── .gitkeep
│
└── templates/                  # HTMLテンプレート
    ├── index.html             # メイン画面
    ├── tickets.html           # チケット管理画面
    └── history.html           # 履歴管理画面
```

### 3.2 コード統計

| 言語/種類 | ファイル数 | 行数（概算） |
|----------|-----------|-------------|
| Python | 11 | 1,200 |
| JavaScript | 3 | 800 |
| HTML | 3 | 600 |
| CSS | 1 | 400 |
| Markdown | 3 | 800 |
| **合計** | **21** | **3,800** |

### 3.3 主要モジュール説明

#### app.py (70行)
Flaskアプリケーションのエントリーポイント。
- アプリケーションファクトリーパターン実装
- Blueprint登録
- CORS設定
- データベース初期化
- ルート定義

#### models/ticket.py (40行)
Ticketモデル定義。
- SQLAlchemyモデルクラス
- to_dict()メソッドでJSON変換対応

#### services/entry_judgement.py (95行)
入場判定ビジネスロジック。
- judge(): 入場判定メインロジック
- _is_expired(): 有効期限チェック
- _count_today_entries(): 当日入場回数カウント
- record_entry(): 履歴記録

#### routes/entry.py (35行)
入場判定REST API。
- POST /api/entry/judge
- バリデーション
- サービス層呼び出し
- エラーハンドリング

#### static/js/main.js (200行)
メイン画面のフロントエンドロジック。
- performJudgement(): 入場判定実行
- displayJudgementResult(): 結果表示
- loadRecentHistory(): 履歴読み込み
- Fetch APIでREST通信

## 4. 実装上の工夫・考慮点

### 4.1 セキュリティ
- SQLAlchemy ORMでSQLインジェクション対策
- HTMLエスケープでXSS対策
- CORS設定でクロスオリジン制御
- バリデーション強化（フロント・バック両方）

### 4.2 パフォーマンス
- データベースインデックス設定
- 不要なデータ取得を避ける（必要な項目のみ）
- フロントエンドでのキャッシュ活用（最小限）

### 4.3 保守性
- レイヤーアーキテクチャで責務分離
- Blueprintでルート管理を整理
- 共通処理のサービス化
- コメント・ドキュメント充実

### 4.4 拡張性
- ORM採用でDB変更が容易
- REST API設計でモバイルアプリ対応可能
- Blueprint構造で機能追加が容易

### 4.5 ユーザビリティ
- 既存Java版UIを踏襲し学習コスト削減
- Enterキーでの判定実行対応
- モーダルダイアログでの編集
- レスポンシブデザイン（基本対応）

## 5. 課題と解決策

### 5.1 開発中の課題

| 課題 | 解決策 | ステータス |
|------|--------|-----------|
| データベース設計 | 既存Java版を参考に設計 | ✅ 解決 |
| REST API設計 | RESTful原則に従い統一 | ✅ 解決 |
| フロントエンド実装 | Vanilla JSでシンプル実装 | ✅ 解決 |
| イントラネット接続 | 0.0.0.0でリッスン | ✅ 解決 |
| ブラウザアクセス確認 | curlテスト、ログ確認 | ✅ 解決 |

### 5.2 既知の制約

| 制約 | 影響 | 対策 |
|------|------|------|
| SQLite同時書き込み制限 | 10接続まで | PostgreSQL移行を推奨 |
| 認証機能なし | セキュリティリスク | イントラネット限定運用 |
| 開発用サーバー使用 | 本番運用不可 | Gunicorn + Nginx推奨 |

## 6. テスト計画

### 6.1 単体テスト（未実装）
今後の拡張として、以下のテストを追加推奨：
- [ ] モデル層のテスト
- [ ] サービス層のテスト
- [ ] API層のテスト

### 6.2 統合テスト（手動実施済み）
- [x] 入場判定フロー
- [x] チケット登録フロー
- [x] 履歴管理フロー
- [x] CSV入出力

### 6.3 システムテスト（手動実施済み）
- [x] ブラウザアクセス
- [x] 複数画面遷移
- [x] データ永続化
- [x] エラーハンドリング

## 7. デプロイメント計画

### 7.1 開発環境（現在）
- **OS**: Windows
- **Python**: 3.11
- **Webサーバー**: Werkzeug（Flask組み込み）
- **データベース**: SQLite
- **アクセス**: http://192.168.1.4:5000

### 7.2 本番環境推奨構成

```
┌─────────────────────────────┐
│  Nginx (Reverse Proxy)      │
│  - SSL/TLS終端              │
│  - 静的ファイル配信          │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│  Gunicorn (WSGI Server)     │
│  - ワーカープロセス: 4      │
│  - ポート: 8000             │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│  Flask Application          │
│  - DEBUG: False             │
│  - 環境変数で設定管理        │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│  PostgreSQL                 │
│  - ポート: 5432             │
│  - レプリケーション構成      │
└─────────────────────────────┘
```

### 7.3 デプロイ手順（本番環境）

```bash
# 1. リポジトリクローン
git clone <repository-url>
cd entry-management-web

# 2. 仮想環境作成
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 3. 依存パッケージインストール
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# 4. 環境変数設定
export FLASK_ENV=production
export DATABASE_URL=postgresql://user:pass@localhost/entry_management
export SECRET_KEY=<ランダム文字列>

# 5. データベースマイグレーション
python migrate.py  # 別途作成

# 6. Gunicorn起動
gunicorn -w 4 -b 0.0.0.0:8000 app:app

# 7. Nginx設定
# /etc/nginx/sites-available/entry-management
# （別途設定ファイル作成）
```

## 8. 保守・運用計画

### 8.1 バックアップ
- **頻度**: 日次（自動）
- **対象**: データベースファイル
- **保管期間**: 30日
- **方法**: cronジョブでファイルコピー

### 8.2 監視
- **サーバー死活監視**: uptime check
- **ログ監視**: エラーログ定期確認
- **ディスク容量監視**: 閾値80%でアラート

### 8.3 更新手順
```bash
# 1. バックアップ
cp entry_management.db entry_management.db.backup

# 2. コード更新
git pull origin main

# 3. 依存パッケージ更新
pip install -r requirements.txt

# 4. サーバー再起動
# Ctrl+C で停止
python app.py
```

## 9. 今後の拡張ロードマップ

### 9.1 Phase 7: 認証・権限管理 (未実装)
**優先度**: 高
**期間**: 2週間

- [ ] ユーザー登録・ログイン機能
- [ ] セッション管理
- [ ] 権限管理（管理者/一般）
- [ ] ログイン画面実装

### 9.2 Phase 8: ダッシュボード (未実装)
**優先度**: 中
**期間**: 1週間

- [ ] 統計情報表示
- [ ] グラフ・チャート表示
- [ ] リアルタイム更新

### 9.3 Phase 9: モバイル対応 (未実装)
**優先度**: 中
**期間**: 2週間

- [ ] レスポンシブデザイン強化
- [ ] タッチ操作対応
- [ ] PWA化

### 9.4 Phase 10: 本番環境構築 (未実装)
**優先度**: 高（本番運用時）
**期間**: 1週間

- [ ] PostgreSQL移行
- [ ] Gunicorn + Nginx設定
- [ ] SSL/TLS設定
- [ ] 自動デプロイ設定

## 10. プロジェクト完了報告

### 10.1 完了基準
- [x] 全機能実装完了
- [x] 動作確認完了
- [x] ドキュメント作成完了
- [x] ユーザー動作確認完了

### 10.2 成果物一覧
1. ✅ Webアプリケーション（22ファイル）
2. ✅ データベーススキーマ
3. ✅ REST API（13エンドポイント）
4. ✅ ユーザードキュメント（README.md）
5. ✅ 仕様書（SPECIFICATION.md）
6. ✅ 実装計画書（本ドキュメント）

### 10.3 達成状況

| 目標 | ステータス | 達成度 |
|------|-----------|--------|
| 複数PC同時アクセス | ✅ 完了 | 100% |
| ブラウザベースUI | ✅ 完了 | 100% |
| データ共有 | ✅ 完了 | 100% |
| 既存機能移植 | ✅ 完了 | 100% |
| CSV入出力 | ✅ 完了 | 100% |
| ドキュメント整備 | ✅ 完了 | 100% |

### 10.4 プロジェクトメトリクス

| 項目 | 計画 | 実績 | 備考 |
|------|------|------|------|
| 開発期間 | 2日 | 2日 | 予定通り |
| 実装ファイル数 | 20 | 22 | 若干増加 |
| コード行数 | 3,500 | 3,800 | ドキュメント充実 |
| 機能数 | 5 | 5 | 全て実装完了 |
| バグ数 | - | 0 | 重大バグなし |

### 10.5 教訓

**うまくいった点**:
- レイヤーアーキテクチャで保守性が高い
- 既存Java版を参考に仕様決定がスムーズ
- Flask + SQLAlchemyの組み合わせが効率的
- Vanilla JSで軽量・高速な実装

**改善点**:
- 単体テストの実装
- エラーハンドリングのさらなる強化
- ログ出力の充実
- 本番環境デプロイ手順の詳細化

**次回への提言**:
- 最初からPostgreSQLを採用
- CI/CD環境の構築
- テスト駆動開発（TDD）の採用
- Docker化

## 11. まとめ

入園管理システムWeb版（v2.0.0）は、当初の目標を全て達成し、計画通りに完了しました。

**主要成果**:
- イントラネット対応のWebアプリケーション実現
- 複数PCからの同時アクセス可能
- REST API設計で将来の拡張性確保
- 充実したドキュメント

**次のステップ**:
1. ユーザーフィードバック収集
2. 本番環境への移行準備
3. 認証・権限管理の実装検討
4. パフォーマンスチューニング

---

**プロジェクト完了日**: 2025-11-24
**作成者**: 入園管理システム開発チーム
