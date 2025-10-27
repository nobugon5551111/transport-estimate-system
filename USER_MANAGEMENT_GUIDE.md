# ユーザー管理ガイド

## 📋 概要

バージョン2.2で**ユーザー管理画面**が追加されました。WebUIから直感的にユーザーの登録・変更・削除ができます。

---

## 🌐 アクセス方法

### URL
- **開発環境**: http://localhost:3000/admin/users.html
- **本番環境**: https://your-app.pages.dev/admin/users.html

### アクセス方法
1. トップページ（/）にアクセス
2. ヘッダーの「ユーザー管理」ボタンをクリック

---

## 🎯 主要機能

### 1. ユーザー一覧表示
- 登録されているすべてのユーザーを表示
- 表示項目：
  - ユーザーID
  - 表示名
  - 作成日時
  - 操作ボタン（パスワード変更・削除）

### 2. 新規ユーザー登録
**入力項目**:
- **ユーザーID**: ログイン時に使用（半角英数字推奨）
- **表示名**: 見積書に印刷される名前（日本語可）
- **パスワード**: 4文字以上

**登録手順**:
1. 画面上部のフォームに必要項目を入力
2. 「登録」ボタンをクリック
3. 成功メッセージが表示される
4. ユーザー一覧に即座に追加される

### 3. パスワード変更
**変更手順**:
1. ユーザー一覧から対象ユーザーの「パスワード変更」ボタンをクリック
2. モーダルダイアログが表示される
3. 新しいパスワード（4文字以上）を入力
4. 「変更」ボタンをクリック
5. 成功メッセージが表示される

**注意事項**:
- パスワード変更後、そのユーザーの既存セッションは削除されます
- 再度ログインが必要になります

### 4. ユーザー削除
**削除手順**:
1. ユーザー一覧から対象ユーザーの「削除」ボタンをクリック
2. 確認ダイアログが表示される
3. 「OK」をクリックして削除実行
4. 成功メッセージが表示される
5. ユーザー一覧から即座に削除される

**注意事項**:
- **削除は取り消せません**
- そのユーザーの既存セッションも同時に削除されます
- そのユーザーが作成した見積書は残ります（created_by_name）

---

## 🔌 API仕様

### 1. ユーザー一覧取得
```http
GET /api/auth/users

Response:
{
  "success": true,
  "data": [
    {
      "id": "yamada",
      "name": "山田太郎",
      "created_at": "2025-10-27 06:04:21"
    },
    ...
  ]
}
```

### 2. 新規ユーザー作成
```http
POST /api/auth/users
Content-Type: application/json

{
  "userId": "suzuki",
  "name": "鈴木一郎",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "ユーザーを作成しました",
  "data": {
    "userId": "suzuki",
    "name": "鈴木一郎"
  }
}
```

### 3. パスワード変更
```http
PUT /api/auth/users/:userId/password
Content-Type: application/json

{
  "newPassword": "newpassword123"
}

Response:
{
  "success": true,
  "message": "パスワードを変更しました"
}
```

### 4. ユーザー削除
```http
DELETE /api/auth/users/:userId

Response:
{
  "success": true,
  "message": "ユーザーを削除しました"
}
```

---

## 💻 コマンドライン操作（curlを使用）

### ユーザー一覧確認
```bash
curl http://localhost:3000/api/auth/users | jq
```

### 新規ユーザー作成
```bash
curl -X POST http://localhost:3000/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","name":"テストユーザー","password":"test123"}'
```

### パスワード変更
```bash
curl -X PUT http://localhost:3000/api/auth/users/test/password \
  -H "Content-Type: application/json" \
  -d '{"newPassword":"newpass123"}'
```

### ユーザー削除
```bash
curl -X DELETE http://localhost:3000/api/auth/users/test
```

---

## 📊 データベーススキーマ

### usersテーブル
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,        -- ユーザーID
  name TEXT NOT NULL,         -- 表示名（見積書に印刷）
  password TEXT NOT NULL,     -- ハッシュ化パスワード（SHA-256）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### sessionsテーブル
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,              -- セッションID（UUID）
  user_id TEXT NOT NULL,            -- ユーザーID
  expires_at DATETIME NOT NULL,     -- 有効期限（7日間）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔐 セキュリティ

### パスワードハッシュ化
- パスワードは平文で保存されません
- SHA-256ハッシュ化（Web Crypto API使用）
- Cloudflare Workers互換の実装

### セッション管理
- Cookie + HttpOnly で保護
- SameSite=Lax でCSRF対策
- 7日間の有効期限
- パスワード変更時に既存セッション削除

### データベース整合性
- 外部キー制約でセッション自動削除
- ユーザー削除時のカスケード処理

---

## 🎨 UI/UX特徴

### レスポンシブデザイン
- デスクトップ・タブレット・スマートフォン対応
- TailwindCSSによる美しいデザイン

### フィードバック
- 成功メッセージ（緑色）
- エラーメッセージ（赤色）
- 5秒後に自動的に非表示

### 確認ダイアログ
- ユーザー削除時に確認ダイアログ表示
- 誤操作防止

### モーダルダイアログ
- パスワード変更はモーダルで表示
- ESCキーまたはキャンセルボタンで閉じる

---

## 🐛 トラブルシューティング

### Q1: ユーザー管理画面が404エラー
**A**: ビルドと再起動を実行してください
```bash
cd /home/user/webapp
npm run build
pm2 restart transport-estimate-system
```

### Q2: パスワード変更が失敗する
**A**: パスワードは4文字以上で入力してください

### Q3: ユーザー削除ができない
**A**: 以下を確認してください：
- ユーザーが存在するか
- データベース接続が正常か
- ブラウザのコンソールでエラーメッセージを確認

### Q4: 作成したユーザーでログインできない
**A**: 以下を確認してください：
- ユーザーIDとパスワードが正しいか
- パスワードは4文字以上か
- セッションAPIが正常に動作しているか（`/api/auth/session`）

---

## 📝 初期ユーザー

開発環境で以下のテストユーザーが利用可能です：

| ユーザーID | 表示名 | パスワード |
|-----------|--------|-----------|
| admin | 管理者 | admin123 |
| yamada | 山田太郎 | password123 |
| tanaka | 田中花子 | password123 |

---

## 🚀 本番環境での初期セットアップ

### 1. 本番環境でユーザー作成
```bash
# 管理者ユーザーを作成
curl -X POST https://your-app.pages.dev/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{"userId":"admin","name":"管理者","password":"secure-password"}'

# 担当者を追加
curl -X POST https://your-app.pages.dev/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{"userId":"yamada","name":"山田太郎","password":"secure-password"}'
```

### 2. 動作確認
1. ブラウザで https://your-app.pages.dev/login.html にアクセス
2. 作成したユーザーでログイン
3. トップページから「ユーザー管理」をクリック
4. ユーザー一覧が表示されることを確認

---

## 🎯 ベストプラクティス

### ユーザーID命名規則
- 半角英数字のみ使用
- 短くて覚えやすいID（例: yamada, tanaka）
- スペースや特殊文字は避ける

### 表示名の使い方
- 日本語での本名（例: 山田太郎）
- 見積書PDFに印刷される名前
- フォーマルな名前を推奨

### パスワード管理
- 8文字以上を推奨（最低4文字）
- 英数字と記号の組み合わせ
- 定期的な変更を推奨
- 他のサービスと同じパスワードは避ける

### ユーザー削除の注意
- 退職者や不要なユーザーのみ削除
- 作成した見積書は残るため、履歴として重要
- 削除前にそのユーザーの見積書を確認

---

## 📚 関連ドキュメント

- [SIMPLE_AUTH_IMPLEMENTATION.md](./SIMPLE_AUTH_IMPLEMENTATION.md) - 認証システム実装ガイド
- [README.md](./README.md) - プロジェクト全体の概要

---

**最終更新**: 2025年10月27日  
**バージョン**: 2.2.0  
**機能ステータス**: ✅ 完全実装・動作確認済み
