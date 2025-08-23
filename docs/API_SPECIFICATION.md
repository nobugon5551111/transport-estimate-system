# 輸送見積もりシステム API仕様書

## 目次
- [概要](#概要)
- [認証](#認証)
- [エラーレスポンス](#エラーレスポンス)
- [顧客管理API](#顧客管理api)
- [案件管理API](#案件管理api)
- [見積作成API](#見積作成api)
- [マスターデータAPI](#マスターデータapi)
- [PDF生成API](#pdf生成api)
- [AI機能API](#ai機能api)

## 概要

### ベースURL
- 開発環境: `http://localhost:3000`
- 本番環境: `https://your-project.pages.dev`

### リクエスト/レスポンス形式
- Content-Type: `application/json`
- 文字エンコーディング: `UTF-8`

### 日付形式
- ISO 8601形式: `YYYY-MM-DDTHH:mm:ss.sssZ`
- 日本語表示用: `YYYY年MM月DD日`

## 認証

現在の実装では認証機能は含まれていませんが、将来の拡張に備えて以下の形式を推奨：

```http
Authorization: Bearer {token}
```

## エラーレスポンス

### 標準エラー形式
```json
{
  "error": "エラーメッセージ",
  "detail": "詳細なエラー情報",
  "code": "ERROR_CODE",
  "timestamp": "2024-08-22T10:30:00.000Z"
}
```

### HTTPステータスコード
- `200`: 成功
- `400`: リクエストエラー
- `404`: リソースが見つからない
- `500`: サーバーエラー

---

## 顧客管理API

### GET /api/customers
顧客一覧を取得

**レスポンス**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "株式会社サンプル",
      "contact_person": "田中太郎", 
      "phone": "03-1234-5678",
      "email": "tanaka@sample.com",
      "address": "東京都渋谷区...",
      "created_at": "2024-08-22T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### GET /api/customers/:id
特定顧客の詳細を取得

**パラメーター**
- `id` (integer): 顧客ID

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "株式会社サンプル",
    "contact_person": "田中太郎",
    "phone": "03-1234-5678",
    "email": "tanaka@sample.com",
    "address": "東京都渋谷区...",
    "created_at": "2024-08-22T10:30:00.000Z"
  }
}
```

---

## 案件管理API

### GET /api/projects
案件一覧を取得

**クエリパラメーター**
- `customer_id` (integer, optional): 顧客IDでフィルタ

**レスポンス**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer_id": 1,
      "name": "オフィス移転プロジェクト",
      "description": "本社オフィスの移転作業",
      "status": "active",
      "created_at": "2024-08-22T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

## 見積作成API

### POST /api/estimates
見積を保存

**リクエストボディ**
```json
{
  "customer_id": 1,
  "project_id": 1,
  "delivery_address": "東京都新宿区...",
  "delivery_postal_code": "1600023",
  "delivery_area": "A",
  "vehicle_type": "2t車",
  "operation_type": "引越",
  "vehicle_cost": 15000,
  "vehicle_2t_count": 2,
  "vehicle_4t_count": 1,
  "uses_multiple_vehicles": true,
  "supervisor_count": 1,
  "leader_count": 1,
  "m2_staff_half_day": 2,
  "m2_staff_full_day": 1,
  "temp_staff_half_day": 0,
  "temp_staff_full_day": 0,
  "staff_cost": 62000,
  "parking_officer_hours": 4,
  "parking_officer_cost": 12000,
  "transport_vehicles": 1,
  "transport_within_20km": true,
  "transport_distance": 15,
  "transport_fuel_cost": 2000,
  "transport_cost": 8000,
  "waste_disposal_size": "small",
  "waste_disposal_cost": 5000,
  "protection_work": true,
  "protection_floors": 2,
  "protection_cost": 10000,
  "material_collection_size": "medium",
  "material_collection_cost": 8000,
  "construction_m2_staff": 2,
  "construction_partner": null,
  "construction_cost": 15000,
  "work_time_type": "normal",
  "work_time_multiplier": 1.0,
  "parking_fee": 3000,
  "highway_fee": 5000,
  "subtotal": 153000,
  "tax_rate": 0.1,
  "tax_amount": 15300,
  "total_amount": 168300,
  "notes": "特記事項",
  "user_id": "user-001"
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "estimate_number": "EST-2024-456",
    "customer_id": 1,
    "project_id": 1,
    "total_amount": 168300,
    "created_at": "2024-08-22T10:30:00.000Z"
  },
  "message": "見積を正常に保存しました"
}
```

### GET /api/estimates
見積一覧を取得

**クエリパラメーター**
- `customer_id` (integer, optional): 顧客IDでフィルタ
- `project_id` (integer, optional): 案件IDでフィルタ
- `limit` (integer, optional): 取得件数制限 (デフォルト: 50)
- `offset` (integer, optional): オフセット (デフォルト: 0)

**レスポンス**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "estimate_number": "EST-2024-456",
      "customer_name": "株式会社サンプル",
      "project_name": "オフィス移転プロジェクト",
      "total_amount": 168300,
      "created_at": "2024-08-22T10:30:00.000Z"
    }
  ],
  "count": 1,
  "total": 1
}
```

### GET /api/estimates/:id
特定見積の詳細を取得

**パラメーター**
- `id` (integer): 見積ID

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "estimate_number": "EST-2024-456",
    "customer": {
      "id": 1,
      "name": "株式会社サンプル",
      "contact_person": "田中太郎"
    },
    "project": {
      "id": 1,
      "name": "オフィス移転プロジェクト"
    },
    "delivery": {
      "address": "東京都新宿区...",
      "postal_code": "1600023",
      "area": "A"
    },
    "vehicle": {
      "type": "2t車",
      "operation": "引越",
      "cost": 15000,
      "uses_multiple_vehicles": true,
      "vehicle_2t_count": 2,
      "vehicle_4t_count": 1
    },
    "staff": {
      "supervisor_count": 1,
      "leader_count": 1,
      "m2_staff_half_day": 2,
      "m2_staff_full_day": 1,
      "temp_staff_half_day": 0,
      "temp_staff_full_day": 0,
      "staff_cost": 62000
    },
    "services": {
      "parking_officer_cost": 12000,
      "transport_cost": 8000,
      "waste_disposal_cost": 5000,
      "protection_cost": 10000,
      "material_collection_cost": 8000,
      "construction_cost": 15000
    },
    "totals": {
      "subtotal": 153000,
      "tax_amount": 15300,
      "total_amount": 168300
    },
    "notes": "特記事項",
    "created_at": "2024-08-22T10:30:00.000Z"
  }
}
```

---

## マスターデータAPI

### GET /api/vehicle-pricing
車両料金マスターを取得

**クエリパラメーター**
- `area` (string, optional): エリアでフィルタ (A/B/C/D)
- `vehicle_type` (string, optional): 車両種別でフィルタ

**レスポンス**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "area": "A",
      "vehicle_type": "2t車",
      "operation_type": "引越",
      "base_price": 12000,
      "distance_price": 1500,
      "time_price": 2000,
      "created_at": "2024-08-22T10:30:00.000Z"
    }
  ]
}
```

### GET /api/staff-rates
スタッフ料金マスターを取得

**レスポンス**
```json
{
  "success": true,
  "data": {
    "supervisor": 25000,
    "leader": 22000,
    "m2_half_day": 8500,
    "m2_full_day": 15000,
    "temp_half_day": 7500,
    "temp_full_day": 13500,
    "updated_at": "2024-08-22T10:30:00.000Z"
  }
}
```

### GET /api/service-rates
サービス料金マスターを取得

**レスポンス**
```json
{
  "success": true,
  "data": {
    "parking_officer_hourly": 3000,
    "transport_base": 5000,
    "transport_per_km": 200,
    "waste_disposal": {
      "small": 3000,
      "medium": 5000,
      "large": 8000
    },
    "protection_per_floor": 5000,
    "material_collection": {
      "small": 2000,
      "medium": 4000,
      "large": 6000
    },
    "construction_m2_rate": 7500,
    "updated_at": "2024-08-22T10:30:00.000Z"
  }
}
```

### GET /api/postal-areas/:postal_code
郵便番号からエリア判定を取得

**パラメーター**
- `postal_code` (string): 郵便番号（7桁数字）

**レスポンス**
```json
{
  "success": true,
  "data": {
    "postal_code": "1600023",
    "prefecture": "東京都",
    "city": "新宿区",
    "area": "A",
    "area_name": "Aエリア（都心部）"
  }
}
```

---

## PDF生成API

### GET /api/estimates/:id/pdf
見積書PDFを生成・ダウンロード

**パラメーター**
- `id` (integer): 見積ID

**レスポンス**
- Content-Type: `application/pdf`
- ファイル名: `見積書_EST-2024-456.pdf`

### POST /api/estimates/:id/regenerate-pdf
見積書PDFを再生成

**パラメーター**
- `id` (integer): 見積ID

**リクエストボディ**
```json
{
  "force_regenerate": true
}
```

**レスポンス**
```json
{
  "success": true,
  "message": "PDFを再生成しました",
  "pdf_url": "/api/estimates/123/pdf"
}
```

---

## AI機能API

### POST /api/ai-generate-email
AI見積メール文生成

**リクエストボディ**
```json
{
  "estimate_id": 123,
  "recipient_name": "田中様",
  "company_name": "株式会社サンプル",
  "project_name": "オフィス移転プロジェクト",
  "total_amount": 168300,
  "custom_message": "お世話になっております。"
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "subject": "【見積書送付】オフィス移転プロジェクトのお見積について",
    "body": "田中様\n\nいつもお世話になっております。...",
    "generated_at": "2024-08-22T10:30:00.000Z"
  }
}
```

---

## データ型定義

### 車両種別 (vehicle_type)
- `2t車`: 2トン車
- `4t車`: 4トン車
- `multiple`: 複数車両選択時

### 作業種別 (operation_type)
- `引越`: 引越作業
- `搬入`: 搬入作業
- `搬出`: 搬出作業

### エリア分類 (area)
- `A`: 都心部エリア
- `B`: 準都心エリア
- `C`: 郊外エリア
- `D`: 遠隔エリア

### 作業時間帯 (work_time_type)
- `normal`: 通常時間帯（9:00-17:00）
- `early`: 早朝時間帯（6:00-9:00）
- `late`: 夜間時間帯（17:00-22:00）
- `midnight`: 深夜時間帯（22:00-6:00）

### 廃棄物・資材サイズ
- `small`: 小
- `medium`: 中
- `large`: 大
- `none`: なし

---

## レート制限

現在の実装ではレート制限はありませんが、将来的に以下の制限を検討：

- 一般API: 1000リクエスト/時間
- PDF生成: 100リクエスト/時間
- AI機能: 50リクエスト/時間

---

## 更新履歴

| バージョン | 日付 | 変更内容 |
|---|---|---|
| 1.0 | 2024-08-22 | 初版作成 |