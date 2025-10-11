# 設定ファイル完全バックアップ

## 重要な設定情報
### Package.json Scripts
```json
{
  "dev": "wrangler pages dev dist --d1=transport-estimate-production --local --ip 0.0.0.0 --port 3000",
  "build": "vite build",
  "deploy": "npm run build && wrangler pages deploy dist --project-name transport-estimate-system",
  "db:migrate:local": "wrangler d1 migrations apply transport-estimate-production --local",
  "db:migrate:prod": "wrangler d1 migrations apply transport-estimate-production",
  "db:seed": "wrangler d1 execute transport-estimate-production --local --file=./seed.sql",
  "db:reset": "rm -rf .wrangler/state/v3/d1 && npm run db:migrate:local && npm run db:seed"
}
```

### PM2設定 (ecosystem.config.cjs)  
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
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
```

### Wrangler設定 (wrangler.jsonc)
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "transport-estimate-system",
  "main": "src/index.tsx",
  "compatibility_date": "2024-01-01",
  "compatibility_flags": ["nodejs_compat"],
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

### 現在のキャッシュバスター
- **タイムスタンプ**: `?v=1760180166`
- **状態**: 安定版（緊急ロールバック後）
