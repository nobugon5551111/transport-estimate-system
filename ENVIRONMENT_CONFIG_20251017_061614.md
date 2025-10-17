# 環境設定バックアップ - 2025-10-17 06:16:14
# システム状態: Step4重複セクション削除完了, Step5養生作業フロア計算機能追加完了

## Node.js環境
Node.js バージョン: v20.19.3
npm バージョン: 10.8.2

## PM2設定
┌────┬──────────────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name                         │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼──────────────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ transport-estimate-system    │ default     │ N/A     │ fork    │ 648111   │ 25m    │ 6    │ online    │ 0%       │ 64.1mb   │ user     │ disabled │
└────┴──────────────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘

## パッケージ情報
### 依存関係
  "dependencies": {
    "hono": "^4.9.2",
    "node-fetch": "^2.7.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20250105.0",
    "@hono/vite-build": "^1.2.0",
    "@hono/vite-dev-server": "^0.18.2",
    "@tailwindcss/forms": "^0.5.10",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.12",
    "typescript": "^5.0.0",
    "vite": "^6.3.5",
    "wrangler": "^4.4.0"
  }
}

### 開発依存関係
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20250105.0",
    "@hono/vite-build": "^1.2.0",
    "@hono/vite-dev-server": "^0.18.2",
    "@tailwindcss/forms": "^0.5.10",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.12",
    "typescript": "^5.0.0",
    "vite": "^6.3.5",
    "wrangler": "^4.4.0"
  }
}

## 重要ファイル一覧
-rw-r--r--  1 user user   1485 Oct 11 11:08 AI_DRIVE_RECOVERY_GUIDE.md
-rw-r--r--  1 user user   3555 Oct 16 11:51 BACKUP_README.md
-rw-r--r--  1 user user   4052 Oct 11 11:03 BACKUP_RESTORE_GUIDE.md
-rw-r--r--  1 user user   1708 Oct 11 10:59 CONFIGURATION_BACKUP.md
-rw-r--r--  1 user user   2871 Oct 11 11:04 CURRENT_SETTINGS_SNAPSHOT.md
-rw-r--r--  1 user user   2893 Oct 17 06:17 ENVIRONMENT_CONFIG_20251017_061614.md
-rw-r--r--  1 user user    622 Oct  8 21:21 PROJECT_STATUS.md
-rw-r--r--  1 user user  11415 Aug 25 04:32 README.md
-rw-r--r--  1 user user   2572 Oct 11 10:59 RESTORE_INSTRUCTIONS.md
-rw-r--r--  1 user user    690 Oct 17 06:17 complete_data_export_20251017_061614.sql
-rw-r--r--  1 user user    883 Oct  8 13:35 complete_database_backup_2025_01_08.sql
-rw-r--r--  1 user user   7371 Oct 17 06:16 complete_database_schema_20251017_061614.sql
-rw-r--r--  1 user user   8412 Aug 21 10:38 correct_sample_data.sql
-rw-r--r--  1 user user    655 Oct 11 10:59 database_backup_20241011.sql
-rw-r--r--  1 user user  22971 Oct 11 11:03 database_backup_20251011_110317.sql
-rw-r--r--  1 user user   7638 Oct  8 13:35 database_schema_backup_2025_01_08.sql
-rw-r--r--  1 user user  18354 Oct 11 07:50 db_backup_20251011_075001.sql
-rw-r--r--  1 user user   2539 Aug 22 07:33 debug_real_rates.cjs
-rw-r--r--  1 user user   2495 Aug 22 07:33 debug_staff_cost.cjs
-rw-r--r--  1 user user   5241 Aug 22 08:24 debug_staff_cost.js
-rw-r--r--  1 user user    457 Oct 11 06:40 ecosystem.config.cjs
-rw-r--r--  1 user user   3484 Oct 17 06:16 export_database_data_20251017_061614.sql
-rw-r--r--  1 user user   5145 Aug 25 06:44 insert_vehicle_pricing.sql
-rw-r--r--  1 user user  95182 Oct 16 13:25 package-lock.json
-rw-r--r--  1 user user   2016 Oct 11 06:35 package.json
-rw-r--r--  1 user user   1434 Aug 25 05:30 restore_actual_data.sql
-rw-r--r--  1 user user   2853 Aug 25 05:47 restore_complete_data.sql
-rw-r--r--  1 user user   1207 Aug 25 05:48 restore_projects.sql
-rw-r--r--  1 user user   1195 Aug 25 05:51 restore_projects_remote.sql
-rw-r--r--  1 user user   8304 Aug 18 13:07 seed.sql
-rw-r--r--  1 user user   9817 Aug 21 10:36 setup_sample_data.sql
-rw-r--r--  1 user user   6636 Aug 21 10:37 simple_sample_data.sql
-rw-r--r--  1 user user   2093 Oct 11 14:39 test-projects.cjs
-rw-r--r--  1 user user    553 Aug 22 08:04 test_api_data.json
-rw-r--r--  1 user user   1702 Aug 22 08:05 test_api_fix.cjs
-rw-r--r--  1 user user   1688 Aug 22 08:23 test_estimate_flow.js
-rw-r--r--  1 user user   3459 Aug 22 07:35 test_fixed_staff_cost.cjs
-rw-r--r--  1 user user   3360 Aug 22 07:55 test_pdf_staff_cost.cjs
-rw-r--r--  1 user user   8735 Aug 22 06:49 test_pricing_flow.cjs
-rw-r--r--  1 user user   1452 Oct 11 14:32 test_project_modal.js
-rw-r--r--  1 user user   2092 Aug 22 08:12 test_staff_preservation.cjs
-rw-r--r--  1 user user    283 Aug 18 01:43 tsconfig.json
-rw-r--r--  1 user user    488 Aug 19 02:49 vite.config.ts
-rw-r--r--  1 user user    526 Sep  5 04:09 wrangler.jsonc
