# 🚀 輸送見積もりシステム - AIドライブ完全復旧ガイド

**保存日時**: 2025年10月11日 11:05
**バックアップファイル**: transport_estimate_stable_20251011_110554.tar.gz  
**サイズ**: 70.4MB（完全版・全履歴・データベース含む）
**AIドライブ場所**: /mnt/aidrive/transport_estimate_stable_20251011_110554.tar.gz

---

## 🔧 **AIドライブからの完全復旧手順**

### **Step 1: AIドライブからバックアップ取得**
```bash
# サンドボックス環境で実行
cd /home/user

# AIドライブからバックアップをコピー
cp /mnt/aidrive/transport_estimate_stable_20251011_110554.tar.gz .

# アーカイブを解凍（webappディレクトリが作成される）
tar -xzf transport_estimate_stable_20251011_110554.tar.gz
```

### **Step 2: プロジェクトセットアップ**
```bash
cd /home/user/webapp
npm install
```

### **Step 3: データベース復旧**
```bash
rm -rf .wrangler/state/v3/d1
npm run db:migrate:local
npx wrangler d1 execute transport-estimate-production --local --file=./database_backup_20251011_110317.sql
```

### **Step 4: 起動**
```bash
fuser -k 3000/tcp 2>/dev/null || true
npm run build
pm2 start ecosystem.config.cjs
```

## ✅ **復旧後確認項目**
- 車両料金数字表示: 41000、52000等
- サービス料金: 5000円、3000円、1.2、1.5、2.0
- タブ切り替え正常動作
- キャッシュバスター: v=1760180166

**完全復旧可能！**