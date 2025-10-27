# 🗄️ データベーススキーマ詳細

## master_settings テーブル

### テーブル構造
```sql
CREATE TABLE master_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  data_type TEXT DEFAULT 'string',
  description TEXT,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, subcategory, key, user_id)
)
```

---

## 📊 マスターデータ一覧

### 1. スタッフ単価（`category='staff'`, `subcategory='daily_rate'`）

| key | value | description |
|-----|-------|-------------|
| supervisor | 40000 | スーパーバイザー日当 |
| leader | 30000 | リーダー以上日当 |
| m2_half_day | 10000 | M2スタッフ半日 |
| m2_full_day | 20000 | M2スタッフ終日 |
| temp_half_day | 9500 | 派遣スタッフ半日 |
| temp_full_day | 19000 | 派遣スタッフ終日 |

### 2. サービス単価

#### 引き取り廃棄（`category='service'`, `subcategory='waste_disposal'`）
| key | value | description |
|-----|-------|-------------|
| small | 10000 | 引き取り廃棄・小 |
| medium | 15000 | 引き取り廃棄・中 |
| large | 20000 | 引き取り廃棄・大 |

#### 残材回収（`category='service'`, `subcategory='material_collection'`）
| key | value | description |
|-----|-------|-------------|
| few | 5000 | 残材回収・少 |
| medium | 10000 | 残材回収・中 |
| many | 15000 | 残材回収・多 |

#### 養生作業（`category='service'`, `subcategory='protection_work'`）
| key | value | description |
|-----|-------|-------------|
| base_rate | 8000 | 養生作業基本料金 |
| floor_rate | 3000 | 養生作業フロア単価 |

#### 作業時間帯割増（`category='service'`, `subcategory='work_time'`）
| key | value | description |
|-----|-------|-------------|
| normal | 1.0 | 通常時間帯 |
| early | 1.2 | 早朝割増 |
| night | 1.5 | 夜間割増 |
| midnight | 2.0 | 深夜割増 |

#### その他サービス（`category='service'`）
| subcategory | key | value | description |
|-------------|-----|-------|-------------|
| parking_officer | hourly_rate | 2500 | 駐車対策員時間単価 |
| transport_vehicle | base_rate_20km | 15000 | 人員輸送車両基本料金（20km圏内） |
| transport_vehicle | rate_per_km | 150 | 人員輸送車両距離単価 |
| fuel | rate_per_liter | 160 | 燃料費（円/L） |
| construction | m2_staff_rate | 0 | 施工M2スタッフ単価 |

### 3. 車両単価（`category='vehicle'`）

#### 2t車（半日・A～Dエリア）
| subcategory | key | value |
|-------------|-----|-------|
| 2t_half_day_A | price | 25000 |
| 2t_half_day_B | price | 27000 |
| 2t_half_day_C | price | 30000 |
| 2t_half_day_D | price | 33000 |

#### 2t車（終日・A～Dエリア）
| subcategory | key | value |
|-------------|-----|-------|
| 2t_full_day_A | price | 35000 |
| 2t_full_day_B | price | 38000 |
| 2t_full_day_C | price | 42000 |
| 2t_full_day_D | price | 47000 |

#### 2t車（シェア・A～Dエリア）
| subcategory | key | value |
|-------------|-----|-------|
| 2t_shared_A | price | 18000 |
| 2t_shared_B | price | 20000 |
| 2t_shared_C | price | 22000 |
| 2t_shared_D | price | 25000 |

#### 4t車（半日・A～Dエリア）
| subcategory | key | value |
|-------------|-----|-------|
| 4t_half_day_A | price | 35000 |
| 4t_half_day_B | price | 38000 |
| 4t_half_day_C | price | 42000 |
| 4t_half_day_D | price | 47000 |

#### 4t車（終日・A～Dエリア）
| subcategory | key | value |
|-------------|-----|-------|
| 4t_full_day_A | price | 50000 |
| 4t_full_day_B | price | 54000 |
| 4t_full_day_C | price | 60000 |
| 4t_full_day_D | price | 67000 |

#### 4t車（シェア・A～Dエリア）
| subcategory | key | value |
|-------------|-----|-------|
| 4t_shared_A | price | 28000 |
| 4t_shared_B | price | 30000 |
| 4t_shared_C | price | 33000 |
| 4t_shared_D | price | 37000 |

---

## 🔍 データ検証クエリ

### スタッフ単価確認
```sql
SELECT key, value FROM master_settings 
WHERE category = 'staff' AND subcategory = 'daily_rate' 
ORDER BY key;
```

### サービス単価確認
```sql
SELECT subcategory, key, value FROM master_settings 
WHERE category = 'service' 
ORDER BY subcategory, key;
```

### 車両単価確認
```sql
SELECT subcategory, key, value FROM master_settings 
WHERE category = 'vehicle' 
ORDER BY subcategory;
```

### 全マスターデータ確認
```sql
SELECT category, subcategory, key, value, description 
FROM master_settings 
ORDER BY category, subcategory, key;
```

---

## estimates テーブル

### テーブル構造
```sql
CREATE TABLE estimates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estimate_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_contact_person TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  project_name TEXT NOT NULL,
  project_type TEXT,
  project_address TEXT,
  delivery_date TEXT NOT NULL,
  delivery_start_time TEXT,
  delivery_end_time TEXT,
  vehicle_cost INTEGER DEFAULT 0,
  staff_cost INTEGER DEFAULT 0,
  services_cost INTEGER DEFAULT 0,
  total_cost INTEGER DEFAULT 0,
  notes TEXT,
  line_items_json TEXT,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### 重要カラム

- **line_items_json**: STEP6完全転写方式用のJSON形式明細データ
  ```json
  {
    "vehicle": {
      "section_name": "車両費用",
      "items": [...],
      "subtotal": 115000
    },
    "staff": {
      "section_name": "スタッフ費用",
      "items": [...],
      "subtotal": 53500
    },
    "services": {
      "section_name": "その他サービス費用",
      "items": [...],
      "subtotal": 11000
    }
  }
  ```

---

**作成日時**: 2025年10月27日 01:24  
**バージョン**: v1.0
