#!/bin/bash

echo "=== 案件管理機能の詳細確認 ==="

echo "1. 顧客データ確認:"
curl -s -X GET "http://localhost:3000/api/customers?status=active" -H "X-User-ID: test-user" | jq -r '.data | length'
echo "件の有効顧客が存在"

echo "2. 案件データ確認:"
curl -s -X GET "http://localhost:3000/api/projects" -H "X-User-ID: test-user" | jq -r '.data | length'
echo "件の案件が存在"

echo "3. HTMLに案件管理要素が存在するかチェック:"
curl -s "https://3000-ip60pndnnf5e5cmovjufh-6532622b.e2b.dev/masters" | grep -o "masterProjectCustomerId\|masterProjectForm\|新規案件追加" | sort -u

echo "4. 新規案件作成テスト (APIレベル):"
curl -s -X POST "http://localhost:3000/api/projects" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{
    "name": "ブラウザテスト案件",
    "customer_id": 17,
    "status": "initial",
    "priority": "medium",
    "description": "ブラウザ機能テスト用",
    "notes": "顧客プルダウンテスト"
  }' | jq .

echo "=== テスト完了 ==="
