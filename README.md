# 輸送見積もりシステム (Transport Estimate System)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Hono](https://img.shields.io/badge/Hono-E36002?style=flat-square&logo=hono&logoColor=white)](https://hono.dev/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=flat-square&logo=Cloudflare&logoColor=white)](https://www.cloudflare.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📋 プロジェクト概要

輸送業務における見積作成・管理システム。6ステップの直感的なフローで見積を作成し、PDF生成やAIメール文生成が可能です。

### 🎯 主要機能

- **🔐 認証システム**: シンプルなID/パスワード認証（本番環境のみ）
- **👤 ユーザー管理**: WebUIでユーザーの登録・変更・削除
- **📝 見積作成フロー**: 6ステップの使いやすい見積作成プロセス
- **🚛 複数車両対応**: 2t車・4t車の混在選択と個別台数指定
- **👥 スタッフ管理**: 役職別・時間別のスタッフ配置と費用計算
- **🎛️ サービス管理**: 各種付帯サービスの詳細設定
- **📄 PDF生成**: プロフェッショナルな見積書PDF自動生成（担当者名印刷）
- **🤖 AI機能**: メール文の自動生成
- **📊 エリア別料金**: 郵便番号ベースの自動エリア判定と料金設定

### 🌟 最新の改善点

**v2.2 (2025-10-27) - ユーザー管理画面追加**
- ✅ **ユーザー管理画面**: WebUIでユーザーの登録・変更・削除が可能
- ✅ **パスワード変更**: ユーザーごとのパスワード変更機能
- ✅ **ユーザー削除**: 不要なユーザーを削除可能
- ✅ **新規登録**: 直感的なフォームでユーザー追加
- ✅ **ログアウト機能**: 確認ダイアログ付きログアウト
- ✅ **ユーザー表示**: ログイン中のユーザー名をヘッダーに表示

**v2.1 (2025-10-27) - シンプル認証システム追加**
- ✅ **ログイン認証**: ID/パスワードによるシンプルな認証システム
- ✅ **作成者名記録**: 見積書作成時に担当者名を自動記録
- ✅ **PDF印刷対応**: 見積書PDFに「見積もり制作担当者」として名前を表示
- ✅ **一覧表示**: 見積一覧で作成担当者名を表示
- ✅ **開発環境保護**: 環境変数で認証ON/OFF切り替え可能（既存システムに影響ゼロ）
- ✅ **権限管理なし**: 全ユーザーが全機能にアクセス可能（シンプル設計）

**v2.0 (2025-10-27) - レポート・AI機能完全実装**
- ✅ **レポート機能**: 売上分析・業務効率・予測分析の完全実装
- ✅ **Chart.js統合**: 折れ線・円・棒グラフの高品質可視化
- ✅ **AIヘルパー関数**: メール生成・スタッフ最適化の完全動作化
- ✅ **データベース整備**: AI学習テーブル・レポートキャッシュの追加
- ✅ **カスタムレポート**: CSV出力APIの動作確認完了

**v1.0 (2024-08-22) - スタッフ費用保存問題完全修正**
- ✅ STEP4→STEP5進行時のスタッフ費用データ保存問題を解決
- ✅ PDF生成時のスタッフ費用¥0表示問題を修正  
- ✅ 複数レベルのフォールバック処理により確実なデータ保持
- ✅ 詳細なデバッグログで問題の早期発見が可能

## 🚀 本番デプロイ状況

- **本番URL**: https://63d2ebe0.transport-estimate-system.pages.dev
- **ステータス**: ✅ Active
- **最終デプロイ**: 2025-01-27
- **技術スタック**: Hono + TypeScript + Cloudflare Pages/Workers
- **GitHub**: https://github.com/nobugon5551111/transport-estimate-system

## 📊 データアーキテクチャ

### データベース設計
```sql
-- 基本テーブル
customers (顧客マスター)
projects (案件マスター) 
estimates (見積データ)
vehicle_pricing (車両料金マスター)
staff_rates (スタッフ料金マスター)

-- AI機能テーブル
ai_email_templates (AIメールテンプレートマスター)
staff_optimization_patterns (スタッフ最適化パターン)
ai_optimization_feedback (AI最適化フィードバック)
ai_email_effectiveness (AIメール効果測定)
ai_prediction_accuracy (AI予測精度トラッキング)

-- レポート機能テーブル
report_cache (レポートキャッシュ)
```

### ストレージサービス
- **Cloudflare D1**: メインデータベース（SQLite分散版）
- **ローカル開発**: SQLite（--localモード）
- **セッション管理**: ブラウザのsessionStorage

## 🎮 ユーザーガイド

### 見積作成フロー

1. **STEP1: 顧客・案件選択**
   - 既存顧客の選択または新規作成
   - 案件の選択または新規作成

2. **STEP2: 配送先設定**
   - 配送先住所の入力
   - 郵便番号による自動エリア判定（A/B/C/D）

3. **STEP3: 車両選択**
   - 単一車両選択 または 複数車両選択
   - 2t車・4t車の台数個別指定
   - 作業種別の選択（引越・搬入・搬出）

4. **STEP4: スタッフ設定**
   - 現場監督・作業リーダーの人数設定
   - M2スタッフ（半日・全日）の人数設定  
   - 派遣スタッフ（半日・全日）の人数設定
   - リアルタイム費用計算表示

5. **STEP5: その他サービス**
   - 駐車対策員・人員輸送車両
   - 引き取り廃棄・養生作業
   - 資材回収・施工作業
   - 作業時間帯設定（通常・早朝・夜間・深夜）

6. **STEP6: 最終確認・保存**
   - 全体の費用確認
   - 見積保存・PDF生成・AIメール生成

### 主要機能の使用方法

#### PDF見積書生成
1. 見積作成完了後、STEP6で「PDF生成」ボタンをクリック
2. プロフェッショナルな見積書PDFが自動生成・ダウンロード
3. 会社情報・明細・合計金額が整理されたフォーマット

#### AIメール文生成
1. STEP6で「AIメール生成」ボタンをクリック
2. 見積内容に基づいた丁寧な営業メール文を自動生成
3. 件名・本文をクリップボードにコピーして利用

## 🛠️ 技術仕様

### フロントエンド
- **HTML/CSS/JavaScript**: バニラJS + TailwindCSS
- **アイコン**: Font Awesome 6.4.0
- **レスポンシブ対応**: モバイル・タブレット・デスクトップ

### バックエンド
- **フレームワーク**: Hono (軽量・高速)
- **言語**: TypeScript
- **ランタイム**: Cloudflare Workers (エッジコンピューティング)

### データベース・ストレージ
- **メインDB**: Cloudflare D1 (グローバル分散SQLite)
- **開発DB**: SQLite (ローカル)
- **ファイル**: Cloudflare R2 (将来対応)

## 📁 プロジェクト構造

```
webapp/
├── src/
│   ├── index.tsx              # メインアプリケーション
│   ├── renderer.tsx           # JSXレンダラー
│   └── types.ts              # TypeScript型定義
├── public/
│   └── static/
│       ├── app.js            # フロントエンドJS
│       └── style.css         # カスタムCSS
├── migrations/               # データベースマイグレーション
│   ├── 0001_initial_schema.sql
│   └── meta/
├── docs/                     # ドキュメント
│   ├── API_SPECIFICATION.md  # API仕様書
│   ├── DETAILED_DESIGN.md    # 詳細設計書
│   └── OPERATION_MANUAL.md   # 運用マニュアル
├── wrangler.jsonc           # Cloudflare設定
├── package.json             # 依存関係・スクリプト
├── ecosystem.config.cjs     # PM2設定（開発用）
└── README.md               # このファイル
```

## 🚀 クイックスタート

### 開発環境セットアップ

```bash
# 1. リポジトリクローン
git clone https://github.com/your-username/transport-estimate-system.git
cd transport-estimate-system

# 2. 依存関係インストール
npm install

# 3. ローカルデータベース初期化
npm run db:migrate:local
npm run db:seed

# 4. 開発サーバー起動
npm run dev:sandbox

# 5. ブラウザでアクセス
# http://localhost:3000
```

### 本番デプロイ

```bash
# 1. Cloudflare認証設定
# setup_cloudflare_api_key ツールを使用

# 2. プロジェクトビルド
npm run build

# 3. データベース準備
npm run db:migrate:prod

# 4. デプロイ実行
npm run deploy
```

## 📜 利用可能なスクリプト

```bash
# 開発
npm run dev                    # Vite開発サーバー（ローカル）
npm run dev:sandbox            # Wrangler開発サーバー（sandbox用）
npm run build                  # プロダクションビルド
npm run preview               # ビルド確認用プレビュー

# データベース
npm run db:migrate:local      # ローカルマイグレーション
npm run db:migrate:prod       # 本番マイグレーション
npm run db:seed              # サンプルデータ投入
npm run db:reset             # データベースリセット
npm run db:console:local     # ローカルDBコンソール
npm run db:console:prod      # 本番DBコンソール

# デプロイ
npm run deploy               # 本番デプロイ
npm run deploy:prod          # プロジェクト指定デプロイ

# ユーティリティ
npm run clean-port           # ポート3000をクリーンアップ
npm run test                 # サービステスト
```

## 🔧 設定

### 環境変数 (.dev.vars)
```bash
# 開発環境用設定
CLOUDFLARE_API_TOKEN=your_api_token
DATABASE_URL=local_sqlite
USER_ID=development_user
```

### Cloudflare設定 (wrangler.jsonc)
```jsonc
{
  "name": "transport-estimate-system",
  "main": "src/index.tsx",
  "compatibility_date": "2024-08-22",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "transport-estimate-production",
      "database_id": "your-database-id"
    }
  ]
}
```

## 🚨 トラブルシューティング

### よくある問題

#### 1. スタッフ費用が¥0で保存される
**解決済み** - v1.0で完全修正済み

#### 2. 車両料金が正しく計算されない
```bash
# マスターデータの確認
npm run db:console:local
> SELECT * FROM vehicle_pricing WHERE area='A';
```

#### 3. PDF生成が失敗する
```bash
# 見積データの確認
curl http://localhost:3000/api/estimates/1
```

#### 4. 開発サーバーが起動しない
```bash
# ポートクリーンアップして再起動
npm run clean-port
pm2 delete all
npm run dev:sandbox
```

## 📚 ドキュメント

- **[API仕様書](./docs/API_SPECIFICATION.md)**: 全APIエンドポイントの詳細
- **[詳細設計書](./docs/DETAILED_DESIGN.md)**: システム全体の詳細設計
- **[運用マニュアル](./docs/OPERATION_MANUAL.md)**: 運用・保守の手順書

## 🔐 セキュリティ

- **入力値検証**: SQLインジェクション・XSS対策実装済み
- **データ暗号化**: 将来のフェーズで実装予定
- **アクセス制御**: 認証機能は将来のフェーズで実装予定

## 📈 パフォーマンス

- **レスポンス時間**: 2秒以内（目標）
- **稼働率**: 99.9%（Cloudflareインフラ基盤）
- **グローバル配信**: エッジネットワーク活用

## 🔄 今後のロードマップ

### フェーズ2: 認証・権限管理
- [ ] ユーザー登録・ログイン機能
- [ ] ロールベースアクセス制御
- [ ] 操作ログ記録

### フェーズ3: 高度な機能
- [ ] ダッシュボード機能
- [ ] レポート・分析機能
- [ ] モバイルアプリ対応

### フェーズ4: 統合機能
- [ ] 会計システム連携
- [ ] 顧客管理システム連携
- [ ] API エコシステム構築

## 💾 バックアップ・ダウンロード

**完全プロジェクトバックアップ**: 
📦 [transport_estimate_system_v1.0.tar.gz](https://page.gensparksite.com/project_backups/tooluse_0Gc4eRXjS1qY9JXHA9Gjtg.tar.gz)

- サイズ: 71.4MB
- 内容: 完全なソースコード、設定ファイル、ドキュメント
- 更新日: 2024-08-22

## 🤝 コントリビューション

1. フォークしてブランチを作成
2. 機能追加・バグ修正
3. テスト実行（将来実装）
4. プルリクエスト送信

## 📄 ライセンス

このプロジェクトは MIT License の下で公開されています。

## 📞 サポート

- **Issue報告**: GitHub Issues
- **機能要望**: GitHub Discussions
- **技術サポート**: 開発チームに連絡

## ⭐ 謝辞

このプロジェクトは以下の優れたオープンソースプロジェクトを活用しています：

- [Hono](https://hono.dev/) - 高速軽量Webフレームワーク
- [Cloudflare](https://www.cloudflare.com/) - エッジコンピューティングプラットフォーム
- [TailwindCSS](https://tailwindcss.com/) - ユーティリティファーストCSSフレームワーク
- [TypeScript](https://www.typescriptlang.org/) - 型安全JavaScript

---

## 📊 プロジェクト統計

- **総行数**: 約15,000行
- **ファイル数**: 50+
- **機能数**: 20+ 
- **APIエンドポイント**: 15+
- **開発期間**: 2024年8月

**最終更新**: 2025年10月27日  
**バージョン**: 2.1.0  
**ステータス**: 本番運用中 🚀

---

## 🔐 認証システムの使い方

### 開発環境（認証スキップ）
`.dev.vars` ファイルで `ENABLE_AUTH=false` が設定されている場合、認証なしでシステムを利用できます。

### 本番環境（認証有効化）
本番環境では認証が有効化されます：

1. **ログイン画面**: `/login.html` にアクセス
2. **ユーザーID**: 管理者から付与されたID
3. **パスワード**: 初期パスワードまたは変更後のパスワード

### 初期ユーザー
開発環境用にテストユーザーが用意されています：
- ID: `yamada` / パスワード: `password123`（山田太郎）
- ID: `tanaka` / パスワード: `password123`（田中花子）

### 新規ユーザー作成
管理者は以下のAPIでユーザーを追加できます：
```bash
curl -X POST http://localhost:3000/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{"userId":"新ID","name":"表示名","password":"パスワード"}'
```

### 作成者名の表示
- **見積書PDF**: 最下部に「見積もり制作担当者: ○○」として印刷
- **見積一覧**: `created_by_name` カラムに担当者名が表示されます