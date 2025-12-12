# 🤖 AGENT.md - AIエージェント完全運用ガイド

## 📋 基本方針

このファイルは、AIエージェント（Claude）がプロジェクト開発・運用を行う際の完全なガイドラインです。

**最終更新:** 2025-10-27  
**プロジェクト名:** 輸送見積もりシステム (Transport Estimate System)  
**コードネーム:** webapp  
**プロジェクトパス:** `/home/user/webapp/`  
**技術スタック:** Hono + TypeScript + Cloudflare Workers + D1 Database  
**適用範囲:** 全開発・運用作業

---

## 🔒 GitHub運用ルール（最重要）

### ✅ 基本原則
```
🎯 ユーザー主導の保存管理
- GitHubへの保存はユーザーの明示的な指示後のみ実行
- 修正・開発中はローカル環境のみで作業
- 未完成・未承認の状態でのGitHub保存は禁止
```

### 📊 作業フロー
```
Phase 1: ローカル開発
├── AIがコード修正・機能追加
├── ローカルでテスト・動作確認  
├── 問題があれば修正・調整
└── 完成版をユーザーに報告

Phase 2: ユーザー確認
├── ユーザーが機能確認・テスト
├── 要望・修正指示（必要に応じて）
├── 最終承認・品質確認
└── 「GitHubに保存して」の明示的指示

Phase 3: GitHub保存実行
├── ユーザー指示後のみ実行
├── 適切なコミットメッセージ付き
├── 完成・承認済み版のみ記録
└── 将来の安定復元ポイントとして保存
```

### 🚫 禁止事項
- 勝手な判断でのGitHub保存
- 「とりあえず保存」の考え方
- 未完成版のGitHub記録
- ユーザー確認なしの自動保存

### ✅ 許可事項
- ローカルでの自由な開発・修正
- 完成版の動作テスト・品質確認
- ユーザーへの完成報告
- GitHub保存の提案（強制ではない）

### 例外的GitHub保存
```
以下の場合のみ、GitHub保存を強く提案可能：
1. 重大バグ修正完了時
2. 長時間（3時間以上）作業完了時
3. 作業セッション終了前
4. システム停止回避のため

※ただし最終判断はユーザーに委ねる
```

---

## 🗣️ コミュニケーションルール

### 分かりやすい表現の使用
```
技術用語 → 分かりやすい表現
────────────────────────
プッシュ → 保存・送信・アップロード
コミット → 記録・保存
リポジトリ → プロジェクト保管庫
ブランチ → 作業用コピー
マージ → 統合・結合
```

### 推奨会話パターン
```
✅ 作業完了時
「○○の修正が完了しました。動作確認をお願いします」
「問題なければ、GitHubへの保存をご指示ください」

✅ 提案時
「この改修内容をGitHubに保存することをお勧めします」
「安全のため、GitHubにバックアップしませんか？」

❌ 避ける表現
「プッシュします」
「とりあえず保存しておきます」
「勝手に判断して保存します」
```

---

## 🛡️ 完成機能保護ルール（最重要）

### ✅ 完成機能の定義と保護対象
```
完成機能 = 以下の条件を満たした機能（絶対に壊してはいけない）:
1. ユーザーから「修正完了」の確認を得た機能
2. 動作テストを通過し、承認された機能
3. GitHubに保存済みの安定版機能
4. 本番運用中で問題なく稼働している機能

現在の保護対象機能:
✅ Step1-6: 全見積作成フロー
✅ マスターデータAPI連携機能  
✅ 動的ラベル更新機能（Step4/Step5）
✅ 養生作業フロア計算機能（Step5）
✅ PDF出力機能・データベース構造
✅ 完全バックアップシステム
```

### 🔒 修正作業時の必須手順
```
Step 1: 影響範囲分析（必須）
├── 修正対象機能の特定
├── 完成機能への影響「あり/なし」判定
├── 依存関係・データベース変更の影響確認
└── バックアップ・ロールバック手順準備

Step 2: 保護実装戦略（必須）
├── 新機能は独立したファイル・関数で実装
├── 既存コードの変更は最小限に限定
├── 完成機能との結合は最終段階で実施
└── 各段階でのテスト実行

Step 3: 完成機能保護テスト（必須）
├── 修正後に全完成機能の動作確認
├── データ整合性・API レスポンス確認
├── UI動作・計算結果の正確性確認
└── エラーケース・例外処理確認
```

### 🚫 絶対禁止事項
```
❌ 完成機能への無計画な変更
❌ データベーススキーマの破壊的変更
❌ APIエンドポイント・レスポンス形式変更
❌ 既存機能のHTML要素ID変更
❌ sessionStorageキー名の変更
❌ 複数機能の同時大幅変更
```

---

## 📦 完全バックアップシステム

### バックアップの重要性

このプロジェクトでは、**単一ZIPファイルによる完全バックアップシステム**を採用しています。

**バックアップに含まれる内容:**
- ✅ 完全なソースコード
- ✅ データベース完全バックアップ（SQL形式）
- ✅ Git履歴（全コミット履歴）
- ✅ すべての設定ファイル
- ✅ 自動復元スクリプト（RESTORE.sh）
- ✅ 復元手順書（README.md）

### バックアップの作成方法

#### 1. 自動バックアップスクリプトの実行

```bash
cd /home/user/webapp
./create_complete_backup.sh
```

このスクリプトは以下を自動的に実行します：

1. **データベースエクスポート**
   ```bash
   npx wrangler d1 export transport-estimate-production --local --output="database_backup.sql"
   ```

2. **ソースコードのコピー**
   - `node_modules/`、`.wrangler/`、`dist/`を除外
   - Git履歴を含むすべてのファイルをコピー

3. **自動復元スクリプトの生成**
   - `RESTORE.sh`を自動生成（実行可能権限付き）
   - 復元に必要なすべての手順を含む

4. **単一ZIPファイルの作成**
   ```bash
   zip -r webapp_complete_backup_YYYYMMDD_HHMMSS.zip backup_directory/
   ```

5. **ファイルの配置**
   - `/home/user/` にコピー（ダウンロード用）
   - `public/static/` にコピー（Web経由でのダウンロード用）

#### 2. バックアップファイルのダウンロード

**Web経由でダウンロード（推奨）：**

1. ダウンロードページにアクセス：
   ```
   https://[your-service-url]/backup-downloads.html
   ```

2. 「完全バックアップをダウンロード」ボタンをクリック

**直接ダウンロードURL：**
```
https://[your-service-url]/static/webapp_complete_backup_[timestamp].zip
```

### バックアップの復元方法

#### 自動復元（推奨）

```bash
# 1. ZIPファイルを展開
unzip webapp_complete_backup_20251027_030934.zip

# 2. ディレクトリに移動
cd webapp_complete_backup_20251027_030934

# 3. 自動復元スクリプトを実行
./RESTORE.sh
```

`RESTORE.sh`は以下を自動的に実行します：

1. 既存の`/home/user/webapp/`をバックアップ（`webapp_old_[timestamp]`に移動）
2. ソースコードを`/home/user/webapp/`に復元
3. 依存関係のインストール（`npm install`）
4. データベースの復元
5. プロジェクトのビルド（`npm run build`）
6. PM2でサービスを起動
7. サービスの動作確認（`curl http://localhost:3000`）

### ベストプラクティス

**推奨バックアップ頻度:**
- 重要な機能追加後：即座にバックアップ
- 大規模な変更前：事前バックアップ
- 定期バックアップ：週1回

**バックアップコマンド（重要）:**
```bash
cd /home/user/webapp && ./create_complete_backup.sh
```

---

## ☁️ データ永続化・環境分離戦略（New）

### 概要
サンドボックス環境の揮発性（リセットされる特性）に対応しつつ、本番データを保護するために、**「開発用リモートDB」と「本番用DB」を厳密に分離**します。

### 環境定義
| 環境 | 用途 | 接続先DB | 接続モード |
|------|------|----------|------------|
| **Development (Sandbox)** | 開発・テスト・実験 | `transport-estimate-dev` | Remote (`--remote`) |
| **Production (Cloudflare Pages)** | 実際の業務運用 | `transport-estimate-production` | Production |

### 🛡️ 安全な開発ルール
1. **本番DBへの直結禁止**:
   - サンドボックスから `transport-estimate-production` に接続してアプリを起動してはいけない（データ汚染のリスク）。
   - 必ず `transport-estimate-dev` を使用する。

2. **マイグレーションのフロー**:
   - Step 1: `transport-estimate-dev` にマイグレーションを適用し、テストする。
   - Step 2: 問題なければ、`transport-estimate-production` に同じマイグレーションを適用する。

3. **コードの永続化**:
   - サンドボックス上のコードは消える可能性があるため、必ず **GitHub** にプッシュして保存する。
   - 復旧時は GitHub から `git clone` し、`transport-estimate-dev` に接続することで即座に再開可能。

---

## ⚙️ 開発・修正ルール

### 基本開発方針
```
🎯 品質第一
- 完成まではローカルで完璧に仕上げる
- テスト・動作確認を徹底
- エラーハンドリングの実装
- ユーザビリティの考慮

🔧 技術方針  
- Hono + TypeScript + Cloudflare Workers
- PM2でのプロセス管理
- 300秒以上のタイムアウト設定（npm系コマンド）
- モジュラー設計・拡張性重視
```

### コード品質基準
```
✅ 必須事項
- エラーハンドリングの実装
- 適切なログ出力
- コメント・ドキュメント
- 一貫したコーディングスタイル

✅ 動作確認項目
- ローカルビルド成功
- PM2での起動成功
- 基本機能の動作テスト
- エラーケースの確認
```

### 品質管理チェックリスト

```
✅ 修正前必須確認項目
- [ ] 影響範囲分析完了（完成機能への影響確認）
- [ ] バックアップ作成完了（ローカル + GitHub状態確認）
- [ ] 修正計画策定完了（段階的実装手順決定）
- [ ] テスト項目リスト作成完了
- [ ] ロールバック手順準備完了

✅ 実装中必須チェック項目
- [ ] エラーハンドリング実装済み
- [ ] 適切なログ出力設定
- [ ] TypeScript型安全性確保
- [ ] 既存機能のHTML要素ID変更なし
- [ ] APIエンドポイント・レスポンス形式変更なし

✅ 修正後必須確認項目  
- [ ] npm run build 成功
- [ ] PM2起動成功（pm2 start ecosystem.config.cjs）
- [ ] curl http://localhost:3000 応答確認
- [ ] 全完成機能の動作テスト（Step1-6全て）
- [ ] マスターデータAPI応答確認
- [ ] 動的ラベル更新機能確認
- [ ] 養生作業フロア計算機能確認
- [ ] PDF出力機能確認
- [ ] データベース整合性確認
- [ ] エラーケース・例外処理確認
```

---

## 🚨 緊急時対応ルール

### 🔴 完成機能破損時の緊急対応
```
Step 1: 即座停止・現状保持
├── 作業を即座に中断・現状をローカル保持
├── 破損範囲・原因の特定
└── ユーザーへの緊急報告・状況説明

Step 2: 復旧方法検討・実行
├── バックアップからの部分復元
├── Git履歴からの特定ファイル復元
├── 手動コード修正・データベース部分ロールバック
└── 復旧手順の慎重実行

Step 3: 復旧後検証・再発防止
├── 全機能動作確認・データ整合性確認
├── 破損原因の根本分析・記録
└── 再発防止策実装・ルール見直し
```

### 🟡 問題対応優先順位
```
🔴 Priority 1: 即座対応
- 完成機能への影響・システム停止
- セキュリティ問題・データ損失リスク

🟡 Priority 2: 計画対応  
- 新機能改善・追加・パフォーマンス最適化
- UI/UX改善・開発負債整理
```

---

## 🔧 開発ワークフロー

### 1. 開発環境のセットアップ

```bash
cd /home/user/webapp
npm install
npm run build
pm2 start ecosystem.config.cjs
```

### 2. データベース操作

```bash
# マイグレーション適用
npx wrangler d1 migrations apply transport-estimate-production --local

# データベースリセット
npm run db:reset

# SQLコマンド実行
npx wrangler d1 execute transport-estimate-production --local --command="SELECT * FROM customers"
```

### 3. サービス管理

```bash
# サービス起動
pm2 start ecosystem.config.cjs

# 状態確認
pm2 list

# ログ確認
pm2 logs transport-estimate-system --nostream

# 再起動
fuser -k 3000/tcp 2>/dev/null || true
pm2 restart transport-estimate-system

# 停止
pm2 stop transport-estimate-system
```

### 4. ビルドとデプロイ

```bash
# ローカルビルド
npm run build

# 開発サーバー起動
pm2 start ecosystem.config.cjs

# 本番デプロイ（Cloudflare Pages）
npm run deploy:prod
```

---

## 🏗️ プロジェクト構造

```
webapp/
├── src/
│   ├── index.tsx              # メインアプリケーションエントリポイント
│   ├── renderer.tsx           # JSXレンダラー
│   └── types.ts               # TypeScript型定義
├── public/
│   └── static/
│       ├── app.js             # フロントエンドJavaScript
│       ├── style.css          # カスタムCSS
│       └── *.zip              # バックアップファイル（Web配信用）
├── migrations/
│   ├── 0001_initial_schema.sql
│   ├── 0002_add_features.sql
│   └── meta/
├── .git/                      # Git履歴
├── .wrangler/                 # Wrangler作業ディレクトリ（gitignore）
├── dist/                      # ビルド出力（gitignore）
├── node_modules/              # 依存関係（gitignore）
├── package.json               # 依存関係とスクリプト定義
├── wrangler.jsonc             # Cloudflare設定
├── tsconfig.json              # TypeScript設定
├── vite.config.ts             # Vite設定
├── ecosystem.config.cjs       # PM2設定
├── create_complete_backup.sh  # バックアップスクリプト
├── BACKUP_SYSTEM_GUIDE.md    # バックアップシステムガイド
├── AGENT.md                   # このファイル
└── README.md                  # プロジェクトREADME
```

---

## 🔧 技術仕様・制約事項

### Cloudflare Workers制約
```
🚫 使用不可機能
- Node.js専用API（fs, child_process等）
- ローカルファイルシステム操作
- 長時間実行プロセス
- WebSocketサーバー

✅ 推奨代替手段
- Web標準API使用
- Cloudflare D1データベース
- 外部API連携（REST）
- サーバーレス設計
```

### 開発環境制約
```
⚙️ PM2使用必須
- 直接的なnpmスクリプト実行禁止
- 必ずPM2経由でサービス管理
- ecosystem.config.cjs設定必須

⏱️ タイムアウト設定
- npm系コマンド: 300秒以上
- ビルド処理: 300秒以上
- API呼び出し: 120秒以内
```

---

## 🗄️ データベースマイグレーション管理（最重要）

### ⚠️ マイグレーション管理の重要性

**マイグレーションファイルの不適切な管理は、システム全体を破壊する可能性があります。**

このセクションは、以下の重大問題を防ぐために作成されました：
- ✗ ローカルで動作するのに本番で動かない
- ✗ 本番修正後、ローカルが壊れる
- ✗ PDF生成・データ保存などの機能が突然エラーになる
- ✗ マスターデータが取得できない

### 🔴 絶対に守るべき鉄則

#### **鉄則1: マイグレーションファイル番号は絶対に重複させない**

```bash
# ❌ 絶対に禁止（システム破壊の原因）
migrations/
├── 0002_add_multiple_vehicles.sql
├── 0002_add_report_and_ai_tables.sql    # 重複！
├── 0003_add_customer_status.sql
├── 0003_backup_system.sql              # 重複！
└── 0003_simple_auth.sql                # 重複！

# ✅ 正しい番号付け（必ず一意の連番）
migrations/
├── 0001_initial_schema.sql
├── 0002_add_multiple_vehicles.sql
├── 0003_add_report_and_ai_tables.sql
├── 0004_add_customer_status.sql
├── 0005_backup_system.sql
├── 0006_simple_auth.sql
└── 0007_add_master_data_tables.sql
```

**なぜ重複が危険なのか：**
- Wranglerは番号順にマイグレーションを実行する
- 同じ番号が複数あると、実行タイミングによって**異なるファイルが実行される**
- 結果：**ローカルと本番で異なるデータベース構造**になる
- 症状：「ローカルでは動くが本番で動かない」「テーブルが存在しない」エラー

#### **鉄則2: 既存のマイグレーションファイルは絶対に変更しない**

```sql
-- ❌ 既存ファイルの内容変更は禁止
-- 0003_simple_auth.sql（既に適用済み）
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL  -- ← 後から追加は禁止！
);

-- ✅ 新しいマイグレーションファイルで追加
-- 0008_add_user_password.sql
ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT 'changeme';
```

**なぜ変更が危険なのか：**
- ローカルでは旧バージョンが既に適用済み
- ファイル内容を変更しても、Wranglerは「適用済み」と認識
- 本番では新バージョンが適用される
- 結果：**ローカルと本番でスキーマが異なる**状態になる

#### **鉄則3: マイグレーションファイル名は変更しない**

```bash
# ❌ ファイル名の変更は禁止
git mv migrations/0003_simple_auth.sql migrations/0006_simple_auth.sql

# ✅ 新しいファイルとして追加
cp migrations/0003_simple_auth.sql migrations/0006_simple_auth_v2.sql
# その後、内容を修正
```

**なぜ名前変更が危険なのか：**
- Wranglerは「0003は適用済み、0006は未適用」と判断
- 同じテーブルを2回作成しようとする
- 結果：「table already exists」エラー

### 📋 マイグレーション作成の正しい手順

#### **新機能追加時のマイグレーション作成**

```bash
# Step 1: 既存のマイグレーション番号を確認
ls -1 migrations/ | grep "^[0-9]" | sort | tail -1
# 出力例: 0007_add_free_estimate_items.sql

# Step 2: 次の番号でファイル作成
# 例: 0008_add_report_tables.sql
cat > migrations/0008_add_report_tables.sql << 'EOF'
-- レポート機能のテーブル追加
CREATE TABLE IF NOT EXISTS report_cache (
  id TEXT PRIMARY KEY,
  report_type TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
EOF

# Step 3: ローカルで適用テスト
npm run db:migrate:local

# Step 4: 動作確認
curl http://localhost:3000/api/reports

# Step 5: 問題なければコミット
git add migrations/0008_add_report_tables.sql
git commit -m "Add report tables migration"
```

### 🔄 ローカルと本番のマイグレーション同期

#### **デプロイ時の必須手順**

```bash
# ========================================
# フェーズ1: ローカル完成確認
# ========================================

# 1. ローカルデータベース状態確認
npm run db:migrate:local
# すべてのマイグレーションが適用済みか確認

# 2. ローカル動作確認
npm run build
pm2 restart all
curl http://localhost:3000
# 全機能が正常動作するか確認

# ========================================
# フェーズ2: 本番デプロイ
# ========================================

# 3. 本番マイグレーション適用
npm run db:migrate:prod

# 4. 本番デプロイ
npm run deploy:prod

# 5. 本番動作確認
curl https://transport-estimate-system.pages.dev

# ========================================
# フェーズ3: ローカル再同期（重要）
# ========================================

# 6. ローカルのマイグレーション状態を確認
# 本番で新しいマイグレーションを適用した場合、
# ローカルにも同じマイグレーションを適用
npm run db:migrate:local

# 7. ローカル再起動・動作確認
pm2 restart all
curl http://localhost:3000
```

### 🚨 トラブルシューティング：マイグレーション問題

#### **問題1: ローカルで動くが本番で動かない**

**症状：**
```
ローカル: ✅ PDF生成成功
本番:     ❌ Error: table 'users' does not exist
```

**原因診断：**
```bash
# ローカルのマイグレーション確認
ls -1 migrations/ | grep "^[0-9]"

# 番号の重複をチェック
ls -1 migrations/ | grep "^[0-9]" | cut -d_ -f1 | sort | uniq -d
# 出力があれば重複あり
```

**解決方法：**
```bash
# オプションA: データベースリセット（推奨）
npm run db:reset
npm run build
pm2 restart all

# オプションB: マイグレーションファイル整理
# 1. 重複番号を特定
# 2. ファイル名を連番に修正（0001, 0002, 0003...）
# 3. データベースリセット
rm -rf .wrangler/state/v3/d1
npm run db:migrate:local
```

#### **問題2: 本番修正後にローカルが壊れる**

**症状：**
```
本番修正前: ローカル ✅ 正常動作
本番修正後: ローカル ❌ Error: table 'users' already exists
```

**原因：**
- 本番でマイグレーションファイルを修正・追加した
- ローカルのマイグレーション履歴と本番が不一致

**解決方法：**
```bash
# ステップ1: 現在のローカルデータをバックアップ（必要なら）
npx wrangler d1 export transport-estimate-production --local --output=backup_before_reset.sql

# ステップ2: ローカルデータベース完全リセット
npm run db:reset

# ステップ3: 動作確認
pm2 restart all
curl http://localhost:3000

# ステップ4: 必要ならデータ復元
npx wrangler d1 execute transport-estimate-production --local --file=backup_before_reset.sql
```

#### **問題3: マイグレーションエラーで進めない**

**症状：**
```bash
npm run db:migrate:local
# Error: FOREIGN KEY constraint failed
```

**原因：**
- マイグレーションの実行順序が不適切
- テーブル間の依存関係が解決されていない

**解決方法：**
```bash
# ステップ1: .wranglerディレクトリを削除
rm -rf .wrangler/state/v3/d1

# ステップ2: マイグレーションファイルの順序を確認
ls -1 migrations/ | grep "^[0-9]" | sort

# ステップ3: マイグレーションファイル内容を確認
# 外部キー制約のあるテーブルは、参照先テーブルより後に作成

# ステップ4: 必要なら番号を付け直し
# 例: projects テーブルは customers テーブルの後

# ステップ5: 再適用
npm run db:migrate:local
```

### ✅ マイグレーション管理チェックリスト

#### **新機能開発前の確認**
```
□ 既存マイグレーションファイルの番号を確認
□ 重複番号がないことを確認
□ 最新のマイグレーション番号を特定
□ 次の連番を決定
```

#### **マイグレーション作成時の確認**
```
□ ファイル名が連番になっている（例: 0008_）
□ CREATE TABLE には IF NOT EXISTS を含む
□ 外部キー制約がある場合、参照先テーブルが先に作成される
□ ALTER TABLE での変更は既存データに影響しない
```

#### **マイグレーション適用前の確認**
```
□ ローカルで npm run db:migrate:local を実行済み
□ ローカルでの動作確認完了
□ マイグレーションファイルをGitコミット済み
□ バックアップ作成済み（重要な変更の場合）
```

#### **デプロイ後の確認**
```
□ 本番で npm run db:migrate:prod を実行済み
□ 本番での動作確認完了
□ ローカルで npm run db:migrate:local を再実行（同期）
□ ローカルでの再動作確認完了
```

### 📚 参考：よくある質問

**Q1: マイグレーションファイルを削除してもいい？**
```
❌ 絶対にダメ
理由: 既にローカルや本番に適用済みの場合、
     削除すると次回のマイグレーション実行時にエラーになる

✅ 代わりにすべきこと:
- 新しいマイグレーションファイルで修正を追加
- または、データベースを完全リセットして再構築
```

**Q2: マイグレーションファイルの順序を変えたい**
```
❌ 既に適用済みのファイルの順序変更は禁止

✅ 代わりにすべきこと:
- データベースを完全リセット
- マイグレーションファイルを正しい順序に修正
- ローカルと本番の両方を再構築
```

**Q3: ローカルと本番で違うマイグレーションを適用してもいい？**
```
❌ 絶対にダメ
理由: ローカルと本番でデータベース構造が異なると、
     「ローカルでは動くが本番で動かない」問題が発生

✅ 正しいアプローチ:
- ローカルと本番は常に同じマイグレーションを適用
- デプロイ前にローカルで十分にテスト
- 本番デプロイ後、ローカルも同期
```

---

## 📞 トラブルシューティング

### 一般的な問題と対処

#### ビルドエラー
```bash
# 1. node_modules削除 → npm install
rm -rf node_modules && npm install

# 2. distディレクトリ削除 → npm run build
rm -rf dist && npm run build

# 3. PM2プロセスリセット
pm2 delete all
```

#### ポート競合
```bash
# 1. ポート3000を強制解放
fuser -k 3000/tcp

# 2. PM2プロセス削除
pm2 delete all  

# 3. 再起動
pm2 start ecosystem.config.cjs
```

#### バックアップが作成できない
```bash
# スクリプトに実行権限を付与
chmod +x /home/user/webapp/create_complete_backup.sh

# データベースエクスポートを個別にテスト
cd /home/user/webapp
npx wrangler d1 export transport-estimate-production --local --output=test_backup.sql
```

#### ZIPファイルがダウンロードできない
```bash
# 1. ZIPファイルを正しい場所にコピー
cp /home/user/webapp_complete_backup_*.zip /home/user/webapp/public/static/

# 2. 再ビルド
cd /home/user/webapp && npm run build

# 3. サービス再起動
fuser -k 3000/tcp 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.cjs

# 4. 確認
curl -I http://localhost:3000/static/webapp_complete_backup_*.zip
```

---

## 📊 定期確認事項

### 日常確認（作業開始時）
```
1. PM2サービス状態確認（pm2 list）
2. ポート3000の使用状況確認
3. 最新ファイル同期確認
4. ローカルビルド可能性確認
```

### 週次確認
```  
1. Dependencies脆弱性確認（npm audit）
2. 不要ファイルクリーンアップ
3. ログファイル整理
4. バックアップ整合性確認
5. 完全バックアップ作成
```

### 月次確認
```
1. 全機能動作テスト
2. パフォーマンス測定
3. セキュリティ監査
4. ドキュメント更新
```

---

## 📈 継続改善

### 定期見直し事項
```
📋 月次見直し
- 運用ルールの有効性確認
- 新しい技術・手法の検討
- ユーザーフィードバック反映
- 効率化・自動化の改善

📋 四半期見直し
- 全体アーキテクチャ見直し
- セキュリティ基準更新
- パフォーマンス基準見直し
- ドキュメント全体更新
```

### 改善提案プロセス
```
1. 問題・改善点の特定
2. 解決案の検討・提案
3. ユーザーとの協議・決定
4. AGENT.mdファイル更新
5. 新ルール適用開始
```

---

## ✅ 重要な設定ファイル

### ecosystem.config.cjs（PM2設定）
```javascript
module.exports = {
  apps: [
    {
      name: 'transport-estimate-system',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=transport-estimate-production --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    }
  ]
}
```

### wrangler.jsonc（Cloudflare設定）
```jsonc
{
  "name": "webapp",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "transport-estimate-production",
      "database_id": "your-database-id"
    }
  ]
}
```

---

## 🎯 まとめ

### キーポイント

**GitHub運用:**
- ✅ ユーザーの明示的指示後のみ保存
- ✅ ローカルで完成版を作成
- ✅ 未完成版の自動保存は禁止

**完成機能保護:**
- ✅ Step1-6の見積フロー完全保護
- ✅ 影響範囲分析を必ず実施
- ✅ 破壊的変更は絶対禁止

**バックアップシステム:**
- ✅ 単一ZIPファイルで完全バックアップ
- ✅ 3ステップで自動復元
- ✅ 重要な変更後は即座にバックアップ

**開発ワークフロー:**
- ✅ PM2でのサービス管理必須
- ✅ 300秒以上のタイムアウト設定
- ✅ 完成機能の動作確認を徹底

---

## 📝 承認・更新履歴

### Version 2.1 - 2025-10-29
```
👤 作成者: Claude (AIエージェント)
📋 承認者: ユーザー（承認待ち）
📅 更新日: 2025-10-29
🎯 対象: 輸送見積もりシステム開発・運用

📝 重要追加内容:
- 🗄️ データベースマイグレーション管理セクション追加（最重要）
- ⚠️ マイグレーションファイル重複問題の解説
- 🔄 ローカルと本番の同期手順の明確化
- 🚨 マイグレーション関連トラブルシューティング追加
- 📋 マイグレーション管理チェックリスト追加

📌 追加理由:
このセクションは、以下の重大問題を経験したことで追加されました：
- マイグレーションファイルの番号重複（0002, 0003が複数存在）
- ローカルで動作するが本番で動かない問題
- 本番修正後にローカルが壊れる問題
- PDF生成・データ保存機能の突然のエラー

これらの問題は、マイグレーション管理の知識不足が根本原因でした。
同じ問題の再発を防ぐため、詳細なガイドラインを追加しています。
```

### Version 2.0 - 2025-10-27
```
👤 作成者: Claude (AIエージェント)
📋 承認者: ユーザー（承認待ち）
📅 更新日: 2025-10-27
🎯 対象: 輸送見積もりシステム開発・運用

📝 統合版策定内容:
- 旧AGENT.md（2025-10-17版）の運用ルールを統合
- 新AGENT.md（2025-10-27版）の技術情報を統合
- 完全バックアップシステムの詳細追加
- トラブルシューティングセクション強化
- 定期確認事項の明確化
```

### Version 1.0 - 2025-10-17
```
📝 初期ルール策定内容:
- GitHub運用ルール（ユーザー主導保存）
- コミュニケーションルール（分かりやすい表現）
- 開発・修正ルール（品質第一）
- 緊急時対応ルール（例外規定）
```

---

**このAGENT.mdファイルに記載されたルールは、AIエージェント（Claude）が厳格に遵守する運用基準です。**
