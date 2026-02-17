# Office M2 見積システム

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Hono](https://img.shields.io/badge/Hono-E36002?style=flat-square&logo=hono&logoColor=white)](https://hono.dev/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=flat-square&logo=Cloudflare&logoColor=white)](https://www.cloudflare.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## プロジェクト概要

Office M2の輸送業務における見積作成・管理システム。6ステップの直感的なフローで見積を作成し、PDF生成やAIメール文生成が可能です。

- **名前**: Office M2 見積システム (transport-estimate-system)
- **目標**: 輸送見積業務の完全デジタル化・自動化
- **本番URL**: https://transport-estimate-system.pages.dev
- **技術スタック**: Hono + TypeScript + Cloudflare Pages/Workers + D1

## 現在完了している機能

### 認証・ユーザー管理
- シンプルなID/パスワード認証（本番環境のみ有効）
- WebUIでユーザーの登録・変更・削除
- ログイン中のユーザー名をヘッダー表示

### 見積作成フロー（6ステップ）
- **STEP1**: 顧客・案件選択（新規作成可）
- **STEP2**: 配送先設定（郵便番号から自動エリア判定 A-I ランク対応）
- **STEP3**: 車両選択（2t車・4t車・専属便・2tチャーターの混在選択と個別台数指定）
- **STEP4**: スタッフ設定（役職別・時間帯別の人数設定とリアルタイム費用計算）
- **STEP5**: その他サービス（駐車対策員、人員輸送、廃棄、養生、施工、早朝/夜間割増）
- **STEP6**: 最終確認・保存（費用確認、見積保存、PDF生成、AIメール生成）

### エリア料金体系（2026年3月改定対応）
| ランク | エリア | 距離目安 |
|--------|--------|----------|
| A | 大阪市 | 15km圏内 |
| B | 大阪府・神戸・京都・奈良・阪神間・山城 | 30km圏内 |
| C | 南丹（亀岡・南丹） | 50km圏内 |
| D | 東播磨・滋賀・和歌山・姫路 | 100km圏内 |
| E | 淡路・西播磨・中丹（福知山・綾部）・三重 | 150km圏内 |
| F | 但馬・丹後（舞鶴・宮津）・愛知・岐阜・徳島・香川 | 200km圏内 |
| G | 岡山・鳥取・福井 | 300km圏内 |
| H | 広島・愛媛・高知・島根・石川・富山 | 400km圏内 |
| I | 山口 | 500km圏内 |

### 車両タイプ
- **2t車**: 共配/午前/午後/終日対応
- **4t車**: 共配/午前/午後/終日対応
- **専属便** (2026年3月新設): 終日対応、distance_area_pricingテーブルから料金取得
- **2tチャーター** (2026年3月新設): 終日対応、distance_area_pricingテーブルから料金取得

### PDF見積書
- プロフェッショナルな見積書HTML/PDF自動生成
- 会社ロゴ・住所・連絡先自動挿入
- A-Iランク名称・地域説明をPDFに表示
- 専属便/2tチャーターの単価・台数・小計を表示
- 付帯費用（輸送車両費、道路許可費等）の表示
- 消費税10%自動計算、割引対応

### その他
- レポート・分析機能（Chart.js統合）
- AIメール文自動生成
- フリー見積機能（品目自由入力）
- 見積一覧・検索・編集

## 主要APIエンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/` | トップページ |
| GET | `/estimate/step2` - `/estimate/step6` | 見積作成各ステップ |
| GET | `/estimates` | 見積一覧 |
| POST | `/api/estimates` | 見積保存 |
| GET | `/api/estimates/:id/pdf` | PDF見積書生成 |
| GET | `/api/postal-code/:code` | 郵便番号→エリア判定 |
| GET | `/api/vehicle-pricing?vehicle_type=&operation_type=&delivery_area=` | 車両料金取得 |
| GET | `/api/distance-area-pricing?area_rank=` | エリア別距離料金取得 |
| GET | `/api/customers` | 顧客一覧 |
| GET | `/api/staff-rates` | スタッフ料金取得 |
| GET | `/api/service-rates` | サービス料金取得 |
| GET | `/api/area-settings` | エリア設定取得 |
| GET | `/api/office-location` | 本社座標取得 |

## データアーキテクチャ

### データベーステーブル
```sql
-- 基本テーブル
customers          -- 顧客マスター
projects           -- 案件マスター
estimates          -- 見積データ（61カラム: 専属便/チャーター単価含む）
vehicle_pricing    -- 車両料金マスター（2t/4t）
staff_rates        -- スタッフ料金マスター
distance_area_pricing -- エリア別距離料金（A-I、専属便/チャーター料金含む）
master_settings    -- 会社基本設定
users              -- ユーザーマスター
free_estimate_items -- フリー見積品目

-- AI・レポートテーブル
ai_email_templates, staff_optimization_patterns, report_cache
```

### estimatesテーブル主要カラム
- `vehicle_2t_count`, `vehicle_4t_count` - 2t/4t車台数
- `vehicle_dedicated_count`, `vehicle_dedicated_unit_price` - 専属便台数・単価
- `vehicle_charter_count`, `vehicle_charter_unit_price` - 2tチャーター台数・単価
- `delivery_area` - エリアランク（A-I）
- `delivery_distance_km` - 配送距離
- `transport_vehicle_fee`, `road_permit_fee` - 付帯費用
- `discount_amount` - 値引額
- `subtotal`, `tax_rate`, `tax_amount`, `total_amount` - 金額

### ストレージサービス
- **Cloudflare D1**: メインデータベース（SQLite分散版）
- **ローカル開発**: SQLite（--localモード）
- **セッション管理**: ブラウザのsessionStorage

## ユーザーガイド

### 見積作成
1. トップページから「新規見積作成」をクリック
2. 顧客・案件を選択/作成（STEP1）
3. 配送先住所を入力、郵便番号でエリア自動判定（STEP2）
4. 車両タイプ・台数を選択、稼働形態を選択（STEP3）
5. スタッフ人数を設定（STEP4）
6. 付帯サービスを設定（STEP5）
7. 確認後「保存」→ PDF生成・AIメール生成が可能（STEP6）

### PDF見積書
- 保存後に「PDF出力」ボタンで見積書を表示
- ブラウザの印刷機能でPDF保存

### 初期管理者アカウント
- **ID**: `admin` / **パスワード**: `admin123`

## 開発セットアップ

```bash
# 依存関係インストール
npm install

# ローカルDB初期化
npm run db:migrate:local
npm run db:seed

# 開発サーバー起動
npm run build
npm run dev:sandbox   # http://localhost:3000

# 本番デプロイ
npm run deploy
```

## 未実装・今後の機能

- 見積書の郵送/メール送信機能
- 顧客別の過去見積検索・比較
- ダッシュボード（月次売上・案件数グラフ）
- モバイルアプリ対応
- 会計システム・顧客管理システム連携

## 最新の変更履歴

**v3.0 (2026-02-17) - 新料金体系・A-Iランク完全対応**
- エリアランクA-I（9段階）完全対応
- 専属便・2tチャーター車両タイプ追加
- distance_area_pricingテーブルによるエリア別料金管理
- 郵便番号→エリアランク判定ロジック全面改修
  - 淡路(656)→E、姫路(670)→D、西播磨(678)→E
  - 福知山(620)→E、舞鶴(624)→F、但馬(668)→F
  - 鳥取/島根の68x/69x競合解消
- PDF見積書: A-Iランク名称・地域説明、専属便/チャーター単価表示
- DB: estimatesテーブルに専属便/チャーター関連カラム追加（61列）
- Step3→Step6→保存のデータフロー修正（単価の保持・保存）

**v2.4 (2025-10-29) - PDF生成エラー修正**
- KVストレージからD1データベースへ移行
- 基本設定取得修正、車両料金API修正

---

**最終更新**: 2026年2月17日
**バージョン**: 3.0.0
**ステータス**: 本番運用中
**デプロイURL**: https://transport-estimate-system.pages.dev
