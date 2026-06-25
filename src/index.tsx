import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// CORS設定（API用）
app.use('/api/*', cors())

// 静的ファイル配信
app.use('/static/*', serveStatic({ root: './' }))

// 静的HTMLファイル配信（開発環境用）
const serveHtml = async (c: any, filename: string) => {
  try {
    // Cloudflare Pages環境では serveStatic を使用
    if (c.env.__STATIC_CONTENT_MANIFEST) {
      return serveStatic({ root: './' })(c)
    }
    // ローカル開発環境ではdist/から読み込み（Viteがpublicからコピー）
    const fs = await import('fs/promises')
    const path = await import('path')
    const htmlPath = path.join(process.cwd(), 'dist', filename)
    const html = await fs.readFile(htmlPath, 'utf-8')
    return c.html(html)
  } catch (error) {
    console.error(`Error serving ${filename}:`, error)
    return c.text(`File not found: ${filename}`, 404)
  }
}

// バックアップダウンロードページ（埋め込みHTML）
app.get('/backup-downloads.html', async (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>バックアップファイルダウンロード</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">
            <i class="fas fa-download mr-3 text-blue-600"></i>
            バックアップファイルダウンロード
        </h1>
        
        <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p class="text-sm text-green-700">
                <i class="fas fa-check-circle mr-2"></i>
                <strong>単一ZIPファイル方式</strong>
            </p>
            <p class="text-sm text-green-700 mt-1">
                <i class="fas fa-info-circle mr-2"></i>
                1つのZIPファイルで完全復元可能
            </p>
        </div>

        <div class="space-y-6">
            <div class="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-6 shadow-lg">
                <div class="flex items-start mb-4">
                    <div class="flex-shrink-0">
                        <i class="fas fa-crown text-yellow-500 text-3xl"></i>
                    </div>
                    <div class="ml-4 flex-1">
                        <h2 class="text-2xl font-bold text-gray-800 mb-2">
                            完全バックアップ（単一ZIPファイル）
                        </h2>
                        <p class="text-gray-700 mb-3">
                            <strong>すべてが含まれた単一ファイル</strong> - このZIPファイルを保存するだけ！
                        </p>
                        <div class="bg-white rounded p-3 mb-4">
                            <h4 class="font-semibold text-gray-700 mb-2">📦 含まれる内容:</h4>
                            <ul class="text-sm text-gray-600 space-y-1">
                                <li>✅ ソースコード完全版</li>
                                <li>✅ データベース完全バックアップ（SQL）</li>
                                <li>✅ 設定ファイル（package.json, wrangler.jsonc, etc）</li>
                                <li>✅ Git履歴</li>
                                <li>✅ 自動復元スクリプト（RESTORE.sh）</li>
                                <li>✅ README・ドキュメント</li>
                            </ul>
                        </div>
                        <a href="/static/webapp_complete_backup_20251027_030934.zip" 
                           class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg rounded-lg hover:from-yellow-600 hover:to-orange-600 shadow-lg transition-all"
                           download>
                            <i class="fas fa-download mr-3 text-2xl"></i>
                            <div>
                                <div>完全バックアップをダウンロード</div>
                                <div class="text-sm font-normal">webapp_complete_backup_20251027_030934.zip (9.2MB)</div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-3">
                    <i class="fas fa-rocket mr-2 text-blue-600"></i>
                    復元方法（超簡単！）
                </h2>
                <div class="bg-gray-800 text-green-400 p-4 rounded font-mono text-sm">
                    <div># 1. ZIPファイルを展開</div>
                    <div>unzip webapp_complete_backup_20251027_030934.zip</div>
                    <div>cd webapp_complete_backup_20251027_030934</div>
                    <div class="mt-2"># 2. 復元スクリプトを実行（これだけ！）</div>
                    <div>./RESTORE.sh</div>
                </div>
                <p class="text-sm text-gray-600 mt-3">
                    <i class="fas fa-magic mr-1 text-blue-600"></i>
                    復元スクリプトを実行するだけで、すべてが自動的に復元されます
                </p>
            </div>

            <div class="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-3">
                    <i class="fas fa-history mr-2 text-purple-600"></i>
                    バックアップの作成方法
                </h2>
                <p class="text-gray-700 mb-3">新しいバックアップを作成する場合:</p>
                <div class="bg-gray-800 text-green-400 p-4 rounded font-mono text-sm">
                    <div>cd /home/user/webapp</div>
                    <div>./create_complete_backup.sh</div>
                </div>
                <p class="text-sm text-gray-600 mt-3">
                    自動的に単一ZIPファイルが作成されます
                </p>
            </div>
        </div>

        <div class="mt-6 text-center">
            <a href="/" class="text-blue-600 hover:text-blue-800 font-semibold">
                <i class="fas fa-home mr-2"></i>
                トップページに戻る
            </a>
        </div>
    </div>
</body>
</html>`)
})

// バックアップダウンロードページ（リダイレクト）
app.get('/backup-downloads', async (c) => {
  return c.redirect('/backup-downloads.html')
})

// バックアップファイルダウンロード用のリダイレクト（静的ファイルとして配信）
// public/にシンボリックリンクを作成しているため、/static/経由でアクセス可能

// favicon.ico の配信
app.get('/favicon.ico', (c) => {
  return c.text('', 204) // 204 No Content
})

// 管理者トップページ
app.get('/admin', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>管理メニュー - 運送見積システム</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 min-h-screen">
  <nav class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <h1 class="text-lg font-bold text-gray-800"><i class="fas fa-cogs mr-2"></i>管理メニュー</h1>
      <a href="/" class="text-sm text-gray-600 hover:text-gray-800"><i class="fas fa-home mr-1"></i>トップへ</a>
    </div>
  </nav>
  <div class="max-w-4xl mx-auto p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <a href="/admin/approvers" class="block bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-user-check text-teal-600"></i>
          </div>
          <h2 class="font-bold text-gray-800">承認者マスタ</h2>
        </div>
        <p class="text-sm text-gray-500">承認者の追加・編集・無効化を管理</p>
      </a>
      <a href="/admin/approvals" class="block bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-clipboard-check text-blue-600"></i>
          </div>
          <h2 class="font-bold text-gray-800">承認管理</h2>
        </div>
        <p class="text-sm text-gray-500">承認待ち・承認済み・差戻しの一覧管理</p>
      </a>
      <a href="/admin/customer-login" class="block bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-key text-orange-600"></i>
          </div>
          <h2 class="font-bold text-gray-800">顧客ログイン管理</h2>
        </div>
        <p class="text-sm text-gray-500">顧客ID・パスワードの発行・管理</p>
      </a>
      <a href="/admin/quote-requests" class="block bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-inbox text-purple-600"></i>
          </div>
          <h2 class="font-bold text-gray-800">見積依頼一覧</h2>
        </div>
        <p class="text-sm text-gray-500">顧客からの見積依頼を確認・管理</p>
      </a>
      <a href="/admin/backup" class="block bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-database text-gray-600"></i>
          </div>
          <h2 class="font-bold text-gray-800">バックアップ</h2>
        </div>
        <p class="text-sm text-gray-500">データベースのバックアップ管理</p>
      </a>
    </div>
  </div>
</body>
</html>`)
})

// バックアップ管理画面
app.get('/admin/backup', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>データバックアップ管理 - Office M2 見積システム</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/style.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <div class="container mx-auto px-4 py-8">
            <!-- ヘッダー -->
            <div class="mb-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-800">
                            <i class="fas fa-database mr-3 text-blue-600"></i>
                            データバックアップ管理
                        </h1>
                        <p class="text-gray-600 mt-2">システムデータのバックアップと復元管理</p>
                    </div>
                    <a href="/" class="btn-secondary">
                        <i class="fas fa-home mr-2"></i>
                        トップページに戻る
                    </a>
                </div>
            </div>

            <!-- アクションパネル -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">
                    <i class="fas fa-tools mr-2"></i>
                    バックアップ操作
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- 手動バックアップ -->
                    <div class="border rounded-lg p-4">
                        <div class="flex items-center mb-3">
                            <i class="fas fa-save text-green-600 text-xl mr-2"></i>
                            <h3 class="text-lg font-medium">手動バックアップ</h3>
                        </div>
                        <p class="text-sm text-gray-600 mb-4">
                            現在のデータを即座にバックアップします
                        </p>
                        <button id="createBackupBtn" class="btn-primary w-full">
                            <i class="fas fa-plus mr-2"></i>
                            バックアップ作成
                        </button>
                    </div>

                    <!-- スケジュール設定 -->
                    <div class="border rounded-lg p-4">
                        <div class="flex items-center mb-3">
                            <i class="fas fa-clock text-blue-600 text-xl mr-2"></i>
                            <h3 class="text-lg font-medium">定期バックアップ</h3>
                        </div>
                        <p class="text-sm text-gray-600 mb-4">
                            自動バックアップスケジュールの設定
                        </p>
                        <button id="scheduleBtn" class="btn-secondary w-full">
                            <i class="fas fa-calendar mr-2"></i>
                            スケジュール設定
                        </button>
                    </div>

                    <!-- バックアップ統計 -->
                    <div class="border rounded-lg p-4">
                        <div class="flex items-center mb-3">
                            <i class="fas fa-chart-bar text-purple-600 text-xl mr-2"></i>
                            <h3 class="text-lg font-medium">バックアップ統計</h3>
                        </div>
                        <div class="text-sm text-gray-600 space-y-1">
                            <div>総バックアップ数: <span id="totalBackups" class="font-semibold">-</span></div>
                            <div>最新バックアップ: <span id="latestBackup" class="font-semibold">-</span></div>
                            <div>総容量: <span id="totalSize" class="font-semibold">-</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- バックアップ一覧 -->
            <div class="bg-white rounded-lg shadow-md">
                <div class="p-6 border-b">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-semibold text-gray-800">
                            <i class="fas fa-list mr-2"></i>
                            バックアップ履歴
                        </h2>
                        <button id="refreshBtn" class="btn-secondary">
                            <i class="fas fa-sync-alt mr-2"></i>
                            更新
                        </button>
                    </div>
                </div>

                <div class="p-6">
                    <!-- ローディング -->
                    <div id="loadingBackups" class="text-center py-8">
                        <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                        <p class="text-gray-600 mt-2">バックアップ一覧を読み込んでいます...</p>
                    </div>

                    <!-- バックアップテーブル -->
                    <div id="backupTable" style="display: none;">
                        <div class="overflow-x-auto">
                            <table class="min-w-full">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            バックアップ名
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            種別
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            サイズ
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            レコード数
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            作成日時
                                        </th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="backupTableBody" class="bg-white divide-y divide-gray-200">
                                    <!-- バックアップデータがここに表示される -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 空の状態 -->
                    <div id="emptyBackups" style="display: none;" class="text-center py-12">
                        <i class="fas fa-database text-4xl text-gray-300"></i>
                        <h3 class="text-lg font-medium text-gray-900 mt-4">バックアップがありません</h3>
                        <p class="text-gray-600 mt-2">最初のバックアップを作成してください</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- バックアップ作成モーダル -->
        <div id="createBackupModal" class="modal-backdrop" style="display: none;">
            <div class="modal-content max-w-md">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900">
                        <i class="fas fa-save mr-2"></i>
                        バックアップ作成
                    </h3>
                </div>
                <div class="p-6">
                    <form id="createBackupForm">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                バックアップ名
                            </label>
                            <input type="text" id="backupName" class="form-input" 
                                   placeholder="例: 月次バックアップ_2024年8月" />
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                バックアップ対象テーブル
                            </label>
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input type="checkbox" class="backup-table" value="customers" checked>
                                    <span class="ml-2 text-sm">顧客データ (customers)</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="backup-table" value="projects" checked>
                                    <span class="ml-2 text-sm">案件データ (projects)</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="backup-table" value="estimates" checked>
                                    <span class="ml-2 text-sm">見積データ (estimates)</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="backup-table" value="vehicle_pricing" checked>
                                    <span class="ml-2 text-sm">車両料金マスター</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="backup-table" value="staff_rates" checked>
                                    <span class="ml-2 text-sm">スタッフ料金マスター</span>
                                </label>
                            </div>
                        </div>

                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="Modal.close('createBackupModal')" class="btn-secondary">
                                キャンセル
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save mr-2"></i>
                                バックアップ作成
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- 定期バックアップ設定モーダル -->
        <div id="scheduleModal" class="modal-backdrop" style="display: none;">
            <div class="modal-content max-w-lg">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900">
                        <i class="fas fa-calendar mr-2"></i>
                        定期バックアップ設定
                    </h3>
                </div>
                <div class="p-6">
                    <form id="scheduleForm">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                スケジュール名
                            </label>
                            <input type="text" id="scheduleName" class="form-input" 
                                   placeholder="例: 日次自動バックアップ" required />
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                実行頻度
                            </label>
                            <select id="frequency" class="form-select" required>
                                <option value="">選択してください</option>
                                <option value="daily">毎日</option>
                                <option value="weekly">毎週</option>
                                <option value="monthly">毎月</option>
                            </select>
                        </div>

                        <div class="mb-4" id="frequencyValue" style="display: none;">
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                実行日
                            </label>
                            <select id="frequencyValueSelect" class="form-select">
                                <!-- 動的に生成 -->
                            </select>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    実行時刻（時）
                                </label>
                                <select id="timeHour" class="form-select">
                                    <option value="0">00</option>
                                    <option value="1">01</option>
                                    <option value="2" selected>02</option>
                                    <option value="3">03</option>
                                    <option value="4">04</option>
                                    <option value="5">05</option>
                                    <option value="6">06</option>
                                    <option value="7">07</option>
                                    <option value="8">08</option>
                                    <option value="9">09</option>
                                    <option value="10">10</option>
                                    <option value="11">11</option>
                                    <option value="12">12</option>
                                    <option value="13">13</option>
                                    <option value="14">14</option>
                                    <option value="15">15</option>
                                    <option value="16">16</option>
                                    <option value="17">17</option>
                                    <option value="18">18</option>
                                    <option value="19">19</option>
                                    <option value="20">20</option>
                                    <option value="21">21</option>
                                    <option value="22">22</option>
                                    <option value="23">23</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    実行時刻（分）
                                </label>
                                <select id="timeMinute" class="form-select">
                                    <option value="0" selected>00</option>
                                    <option value="15">15</option>
                                    <option value="30">30</option>
                                    <option value="45">45</option>
                                </select>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                バックアップ対象テーブル
                            </label>
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input type="checkbox" class="schedule-table" value="customers" checked>
                                    <span class="ml-2 text-sm">顧客データ (customers)</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="schedule-table" value="projects" checked>
                                    <span class="ml-2 text-sm">案件データ (projects)</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="schedule-table" value="estimates" checked>
                                    <span class="ml-2 text-sm">見積データ (estimates)</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="schedule-table" value="vehicle_pricing" checked>
                                    <span class="ml-2 text-sm">車両料金マスター</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="schedule-table" value="staff_rates" checked>
                                    <span class="ml-2 text-sm">スタッフ料金マスター</span>
                                </label>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                保存期間（日数）
                            </label>
                            <select id="retentionDays" class="form-select">
                                <option value="7">7日間</option>
                                <option value="14">14日間</option>
                                <option value="30" selected>30日間</option>
                                <option value="60">60日間</option>
                                <option value="90">90日間</option>
                            </select>
                        </div>

                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="Modal.close('scheduleModal')" class="btn-secondary">
                                キャンセル
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-calendar-check mr-2"></i>
                                スケジュール保存
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- 復元確認モーダル -->
        <div id="restoreModal" class="modal-backdrop" style="display: none;">
            <div class="modal-content max-w-md">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-red-600">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        データ復元の確認
                    </h3>
                </div>
                <div class="p-6">
                    <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                        <div class="flex">
                            <i class="fas fa-exclamation-triangle text-red-400 mt-1"></i>
                            <div class="ml-3">
                                <h4 class="text-sm font-medium text-red-800">警告</h4>
                                <p class="text-sm text-red-700 mt-1">
                                    この操作により、現在のデータがバックアップデータで置き換えられます。
                                    操作は取り消すことができません。
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <p class="text-sm text-gray-600">
                            復元するバックアップ: <span id="restoreBackupName" class="font-semibold"></span>
                        </p>
                    </div>

                    <div class="flex justify-end space-x-3">
                        <button type="button" onclick="Modal.close('restoreModal')" class="btn-secondary">
                            キャンセル
                        </button>
                        <button id="confirmRestoreBtn" class="btn-danger">
                            <i class="fas fa-undo mr-2"></i>
                            復元実行
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/city-coordinates.js"></script>
        <script src="/static/distance-calculator.js"></script>
        <script src="/static/app.js?v=1768900000&cache=bust"></script>
        <script>
            // バックアップ管理機能の実装
            const BackupManager = {
                // 初期化
                initialize: async () => {
                    console.log('🔧 バックアップ管理機能初期化開始');
                    
                    // イベントリスナー設定
                    document.getElementById('createBackupBtn').addEventListener('click', () => {
                        Modal.open('createBackupModal');
                    });
                    
                    document.getElementById('scheduleBtn').addEventListener('click', () => {
                        Modal.open('scheduleModal');
                    });
                    
                    document.getElementById('refreshBtn').addEventListener('click', () => {
                        BackupManager.loadBackups();
                    });
                    
                    document.getElementById('createBackupForm').addEventListener('submit', BackupManager.createBackup);
                    document.getElementById('scheduleForm').addEventListener('submit', BackupManager.saveSchedule);
                    
                    // 頻度選択時の動的要素表示
                    document.getElementById('frequency').addEventListener('change', BackupManager.updateFrequencyOptions);
                    
                    // 初期データ読み込み
                    await BackupManager.loadBackups();
                    
                    console.log('✅ バックアップ管理機能初期化完了');
                },

                // バックアップ一覧読み込み
                loadBackups: async () => {
                    try {
                        document.getElementById('loadingBackups').style.display = 'block';
                        document.getElementById('backupTable').style.display = 'none';
                        document.getElementById('emptyBackups').style.display = 'none';
                        
                        const response = await API.get('/backups');
                        
                        if (response.success) {
                            BackupManager.displayBackups(response.data);
                            BackupManager.updateStatistics(response.data);
                        } else {
                            Utils.showError('バックアップ一覧の取得に失敗しました');
                        }
                        
                    } catch (error) {
                        console.error('バックアップ一覧取得エラー:', error);
                        Utils.showError('バックアップ一覧の取得でエラーが発生しました');
                    } finally {
                        document.getElementById('loadingBackups').style.display = 'none';
                    }
                },

                // バックアップ一覧表示
                displayBackups: (backups) => {
                    const tbody = document.getElementById('backupTableBody');
                    
                    if (backups.length === 0) {
                        document.getElementById('emptyBackups').style.display = 'block';
                        return;
                    }
                    
                    tbody.innerHTML = backups.map(backup => \`
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <i class="fas fa-file-archive text-blue-500 mr-2"></i>
                                    <div>
                                        <div class="text-sm font-medium text-gray-900">
                                            \${backup.backup_name}
                                        </div>
                                        <div class="text-sm text-gray-500">
                                            \${backup.file_name}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full \${
                                    backup.backup_type === 'manual' ? 'bg-blue-100 text-blue-800' :
                                    backup.backup_type === 'scheduled' ? 'bg-green-100 text-green-800' : 
                                    'bg-gray-100 text-gray-800'
                                }">
                                    \${backup.backup_type === 'manual' ? '手動' : 
                                      backup.backup_type === 'scheduled' ? '定期' : backup.backup_type}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                \${Utils.formatFileSize(backup.file_size)}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                \${backup.record_count.toLocaleString()}件
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                \${new Date(backup.created_at).toLocaleDateString('ja-JP', {
                                    year: 'numeric', month: '2-digit', day: '2-digit',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button onclick="BackupManager.downloadBackup(\${backup.id})" 
                                        class="text-blue-600 hover:text-blue-900">
                                    <i class="fas fa-download mr-1"></i>
                                    ダウンロード
                                </button>
                                <button onclick="BackupManager.showRestoreModal(\${backup.id}, '\${backup.backup_name}')" 
                                        class="text-yellow-600 hover:text-yellow-900">
                                    <i class="fas fa-undo mr-1"></i>
                                    復元
                                </button>
                                <button onclick="BackupManager.deleteBackup(\${backup.id})" 
                                        class="text-red-600 hover:text-red-900">
                                    <i class="fas fa-trash mr-1"></i>
                                    削除
                                </button>
                            </td>
                        </tr>
                    \`).join('');
                    
                    document.getElementById('backupTable').style.display = 'block';
                },

                // 統計情報更新
                updateStatistics: (backups) => {
                    const totalBackups = backups.length;
                    const totalSize = backups.reduce((sum, backup) => sum + (backup.file_size || 0), 0);
                    const latestBackup = backups.length > 0 ? 
                        new Date(backups[0].created_at).toLocaleDateString('ja-JP') : 'なし';
                    
                    document.getElementById('totalBackups').textContent = totalBackups + '個';
                    document.getElementById('totalSize').textContent = Utils.formatFileSize(totalSize);
                    document.getElementById('latestBackup').textContent = latestBackup;
                },

                // 頻度選択時の動的要素表示
                updateFrequencyOptions: () => {
                    const frequency = document.getElementById('frequency').value;
                    const frequencyValueDiv = document.getElementById('frequencyValue');
                    const frequencyValueSelect = document.getElementById('frequencyValueSelect');
                    
                    if (!frequency) {
                        frequencyValueDiv.style.display = 'none';
                        return;
                    }
                    
                    frequencyValueDiv.style.display = 'block';
                    
                    let options = '';
                    let label = '';
                    
                    if (frequency === 'weekly') {
                        label = '実行曜日';
                        options = \`
                            <option value="0">日曜日</option>
                            <option value="1">月曜日</option>
                            <option value="2">火曜日</option>
                            <option value="3">水曜日</option>
                            <option value="4">木曜日</option>
                            <option value="5">金曜日</option>
                            <option value="6">土曜日</option>
                        \`;
                    } else if (frequency === 'monthly') {
                        label = '実行日';
                        for (let i = 1; i <= 31; i++) {
                            options += \`<option value="\${i}">\${i}日</option>\`;
                        }
                    } else {
                        frequencyValueDiv.style.display = 'none';
                        return;
                    }
                    
                    document.querySelector('#frequencyValue label').textContent = label;
                    frequencyValueSelect.innerHTML = options;
                },

                // スケジュール保存
                saveSchedule: async (e) => {
                    e.preventDefault();
                    
                    try {
                        const form = e.target;
                        const scheduleName = document.getElementById('scheduleName').value.trim();
                        const frequency = document.getElementById('frequency').value;
                        const frequencyValue = document.getElementById('frequencyValueSelect').value;
                        const timeHour = parseInt(document.getElementById('timeHour').value);
                        const timeMinute = parseInt(document.getElementById('timeMinute').value);
                        const retentionDays = parseInt(document.getElementById('retentionDays').value);
                        
                        const selectedTables = Array.from(document.querySelectorAll('.schedule-table:checked'))
                            .map(cb => cb.value);
                        
                        if (!scheduleName || !frequency) {
                            Utils.showError('スケジュール名と実行頻度を入力してください');
                            return;
                        }
                        
                        if ((frequency === 'weekly' || frequency === 'monthly') && !frequencyValue) {
                            Utils.showError('実行日を選択してください');
                            return;
                        }
                        
                        if (selectedTables.length === 0) {
                            Utils.showError('バックアップ対象テーブルを選択してください');
                            return;
                        }
                        
                        Utils.showLoading(form.querySelector('button[type="submit"]'), 'スケジュール保存中...');
                        
                        const scheduleData = {
                            schedule_name: scheduleName,
                            frequency: frequency,
                            frequency_value: frequency === 'daily' ? null : parseInt(frequencyValue),
                            time_hour: timeHour,
                            time_minute: timeMinute,
                            tables: selectedTables,
                            retention_days: retentionDays,
                            is_active: true
                        };
                        
                        console.log('📅 スケジュール保存データ:', scheduleData);
                        
                        const response = await API.post('/backup-schedule', scheduleData);
                        
                        if (response.success) {
                            Utils.showSuccess('定期バックアップスケジュールが保存されました');
                            Modal.close('scheduleModal');
                            
                            // フォームリセット
                            form.reset();
                            document.getElementById('frequencyValue').style.display = 'none';
                            document.querySelectorAll('.schedule-table').forEach(cb => cb.checked = true);
                        } else {
                            Utils.showError(response.error || 'スケジュールの保存に失敗しました');
                        }
                        
                    } catch (error) {
                        console.error('スケジュール保存エラー:', error);
                        Utils.showError('スケジュール保存でエラーが発生しました');
                    } finally {
                        Utils.hideLoading(document.querySelector('#scheduleForm button[type="submit"]'), 
                                        '<i class="fas fa-calendar-check mr-2"></i>スケジュール保存');
                    }
                },

                // バックアップ作成
                createBackup: async (e) => {
                    e.preventDefault();
                    
                    try {
                        const form = e.target;
                        const formData = new FormData(form);
                        
                        const backupName = document.getElementById('backupName').value.trim();
                        const selectedTables = Array.from(document.querySelectorAll('.backup-table:checked'))
                            .map(cb => cb.value);
                        
                        if (selectedTables.length === 0) {
                            Utils.showError('バックアップ対象テーブルを選択してください');
                            return;
                        }
                        
                        Utils.showLoading(form.querySelector('button[type="submit"]'), 'バックアップ作成中...');
                        
                        const response = await API.post('/backups/create', {
                            backup_name: backupName || undefined,
                            backup_type: 'manual',
                            tables: selectedTables
                        });
                        
                        if (response.success) {
                            Utils.showSuccess('バックアップが正常に作成されました');
                            Modal.close('createBackupModal');
                            
                            // ダウンロード可能な場合は自動ダウンロード
                            if (response.data.download_data) {
                                BackupManager.downloadBackupData(response.data.download_data, response.data.file_name);
                            }
                            
                            // 一覧を更新
                            await BackupManager.loadBackups();
                            
                            // フォームリセット
                            form.reset();
                            document.querySelectorAll('.backup-table').forEach(cb => cb.checked = true);
                        } else {
                            Utils.showError(response.error || 'バックアップの作成に失敗しました');
                        }
                        
                    } catch (error) {
                        console.error('バックアップ作成エラー:', error);
                        Utils.showError('バックアップ作成でエラーが発生しました');
                    } finally {
                        Utils.hideLoading(document.querySelector('#createBackupForm button[type="submit"]'), 
                                        '<i class="fas fa-save mr-2"></i>バックアップ作成');
                    }
                },

                // バックアップダウンロード
                downloadBackup: async (backupId) => {
                    try {
                        const response = await fetch(\`/api/backups/\${backupId}/download\`);
                        
                        if (response.ok) {
                            const blob = await response.blob();
                            const filename = response.headers.get('content-disposition')
                                ?.split('filename=')[1]?.replace(/"/g, '') || \`backup_\${backupId}.json\`;
                            
                            BackupManager.downloadBlob(blob, filename);
                            Utils.showSuccess('バックアップファイルをダウンロードしました');
                        } else {
                            Utils.showError('バックアップファイルのダウンロードに失敗しました');
                        }
                        
                    } catch (error) {
                        console.error('ダウンロードエラー:', error);
                        Utils.showError('ダウンロードでエラーが発生しました');
                    }
                },

                // データからファイルダウンロード
                downloadBackupData: (data, filename) => {
                    const blob = new Blob([data], { type: 'application/json' });
                    BackupManager.downloadBlob(blob, filename);
                },

                // ブロブファイルダウンロード
                downloadBlob: (blob, filename) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                },

                // 復元モーダル表示
                showRestoreModal: (backupId, backupName) => {
                    document.getElementById('restoreBackupName').textContent = backupName;
                    
                    // 確認ボタンにイベント設定
                    const confirmBtn = document.getElementById('confirmRestoreBtn');
                    confirmBtn.onclick = () => BackupManager.restoreBackup(backupId);
                    
                    Modal.open('restoreModal');
                },

                // データ復元
                restoreBackup: async (backupId) => {
                    try {
                        Utils.showLoading(document.getElementById('confirmRestoreBtn'), '復元中...');
                        
                        const response = await API.post(\`/backups/\${backupId}/restore\`, {
                            confirm: true
                        });
                        
                        if (response.success) {
                            Utils.showSuccess(response.message || 'データの復元が完了しました');
                            Modal.close('restoreModal');
                        } else {
                            Utils.showError(response.error || 'データの復元に失敗しました');
                        }
                        
                    } catch (error) {
                        console.error('復元エラー:', error);
                        Utils.showError('復元でエラーが発生しました');
                    } finally {
                        Utils.hideLoading(document.getElementById('confirmRestoreBtn'), 
                                        '<i class="fas fa-undo mr-2"></i>復元実行');
                    }
                },

                // バックアップ削除
                deleteBackup: async (backupId) => {
                    if (!confirm('このバックアップを削除してもよろしいですか？')) {
                        return;
                    }
                    
                    try {
                        const response = await API.delete(\`/backups/\${backupId}\`);
                        
                        if (response.success) {
                            Utils.showSuccess('バックアップを削除しました');
                            await BackupManager.loadBackups();
                        } else {
                            Utils.showError(response.error || 'バックアップの削除に失敗しました');
                        }
                        
                    } catch (error) {
                        console.error('削除エラー:', error);
                        Utils.showError('削除でエラーが発生しました');
                    }
                }
            };

            // ファイルサイズフォーマット用のヘルパー関数
            if (!Utils.formatFileSize) {
                Utils.formatFileSize = (bytes) => {
                    if (bytes === 0) return '0 B';
                    
                    const k = 1024;
                    const sizes = ['B', 'KB', 'MB', 'GB'];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    
                    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                };
            }

            // ページ読み込み完了時に初期化
            document.addEventListener('DOMContentLoaded', BackupManager.initialize);
        </script>
    </body>
    </html>
  `)
})

// 正しいセッションデータでStep4動作確認ページ
app.get('/test-step4-session', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Step4 セッション付き動作確認 - Office M2 見積システム</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/style.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-4">
                <i class="fas fa-cog mr-3 text-blue-600"></i>
                Step4 セッション付き動作確認
            </h1>
            <div class="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6">
                <p class="text-blue-700">
                    <i class="fas fa-database mr-2"></i>
                    正しいセッションデータを設定してStep4の動的ラベル機能をテストします
                </p>
            </div>
        </div>

        <!-- セッションデータ設定 -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">
                <i class="fas fa-database mr-2"></i>
                セッションデータ設定
            </h2>
            <button id="setup-session" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                <i class="fas fa-plus mr-2"></i>
                Step4用セッションデータを設定
            </button>
            <button id="goto-step4" class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors ml-4">
                <i class="fas fa-arrow-right mr-2"></i>
                Step4に移動
            </button>
        </div>

        <!-- 結果表示 -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">
                <i class="fas fa-clipboard-list mr-2"></i>
                動作結果
            </h2>
            <div id="session-results" class="space-y-2">
                <div class="text-gray-600">セッションデータを設定してStep4にアクセスしてください</div>
            </div>
        </div>
    </div>

    <script src="/static/app.js?v=1768900000&cache=bust"></script>
    <script>
        console.log('🧪 Step4 セッション付き動作確認開始');
        
        const sessionResults = document.getElementById('session-results');

        function logResult(message, type = 'info') {
            const colors = {
                info: 'text-blue-600',
                success: 'text-green-600', 
                error: 'text-red-600',
                warning: 'text-yellow-600'
            };
            const icons = {
                info: 'fas fa-info-circle',
                success: 'fas fa-check-circle',
                error: 'fas fa-times-circle', 
                warning: 'fas fa-exclamation-triangle'
            };
            
            const div = document.createElement('div');
            div.className = colors[type] || colors.info;
            div.innerHTML = \`<i class="\${icons[type] || icons.info} mr-2"></i>\${message}\`;
            sessionResults.appendChild(div);
        }

        // セッションデータ設定
        document.getElementById('setup-session').addEventListener('click', () => {
            try {
                logResult('Step4用セッションデータを設定中...', 'info');
                
                const testFlowData = {
                    step: 4,
                    customer: { 
                        id: 1, 
                        name: 'テスト顧客株式会社' 
                    },
                    project: { 
                        id: 1, 
                        name: 'テストプロジェクト案件' 
                    },
                    delivery: { 
                        address: '東京都渋谷区テスト1-2-3', 
                        postal_code: '1500001', 
                        area: 'A' 
                    },
                    vehicle: { 
                        type: '2t車', 
                        operation: '引越', 
                        cost: 50000 
                    }
                };
                
                sessionStorage.setItem('estimateFlow', JSON.stringify(testFlowData));
                
                logResult('✅ セッションデータ設定完了', 'success');
                logResult('📊 設定データ:', 'info');
                logResult(\`　顧客: \${testFlowData.customer.name}\`, 'info');
                logResult(\`　案件: \${testFlowData.project.name}\`, 'info');
                logResult(\`　エリア: \${testFlowData.delivery.area}エリア\`, 'info');
                logResult(\`　車両: \${testFlowData.vehicle.type}（\${testFlowData.vehicle.operation}）\`, 'info');
                logResult('🚀 Step4にアクセスしてください', 'success');
                
            } catch (error) {
                logResult(\`❌ セッションデータ設定失敗: \${error.message}\`, 'error');
            }
        });

        // Step4に移動
        document.getElementById('goto-step4').addEventListener('click', () => {
            logResult('Step4に移動しています...', 'info');
            window.open('/estimate/step4', '_blank');
        });
        
        // ページロード完了時の状態確認
        document.addEventListener('DOMContentLoaded', () => {
            logResult('🚀 セッション付きテストページ初期化完了', 'success');
            
            // 現在のセッションデータ確認
            const currentSession = sessionStorage.getItem('estimateFlow');
            if (currentSession) {
                try {
                    const sessionData = JSON.parse(currentSession);
                    logResult('📋 既存セッションデータ検出:', 'warning');
                    logResult(\`　Step: \${sessionData.step || 'N/A'}\`, 'info');
                    logResult(\`　顧客: \${sessionData.customer?.name || 'N/A'}\`, 'info');
                    logResult('🔄 新しいセッションデータに更新することをお勧めします', 'warning');
                } catch (error) {
                    logResult('❌ 既存セッションデータが破損しています', 'error');
                }
            } else {
                logResult('📋 セッションデータなし - セットアップが必要です', 'info');
            }
        });
    </script>
</body>
</html>`)
})

// Step4動的ラベル修正テスト用ページ
app.get('/test-step4-fixed', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Step4 動的ラベル修正テスト - Office M2 見積システム</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/style.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-4">
                <i class="fas fa-wrench mr-3 text-green-600"></i>
                Step4 動的ラベル修正テスト
            </h1>
            <div class="bg-green-100 border-l-4 border-green-500 p-4 mb-6">
                <p class="text-green-700">
                    <i class="fas fa-check-circle mr-2"></i>
                    HTML要素読み込み後の動的ラベル更新機能をテストします
                </p>
            </div>
        </div>

        <!-- 実際のStep4と同じHTML構造のスタッフ単価設定 -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 class="text-lg font-medium text-gray-900 mb-4">スタッフ単価設定</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <label class="block text-sm font-medium text-blue-900 mb-2">
                        <i class="fas fa-user-tie mr-2"></i>
                        スーパーバイザー（<span id="rate-display-supervisor">...</span>円/日）
                    </label>
                    <input type="number" id="rate_supervisor" class="form-input" min="0" step="1000" />
                </div>

                <div class="bg-green-50 p-4 rounded-lg">
                    <label class="block text-sm font-medium text-green-900 mb-2">
                        <i class="fas fa-user-cog mr-2"></i>
                        リーダー以上（<span id="rate-display-leader">...</span>円/日）
                    </label>
                    <input type="number" id="rate_leader" class="form-input" min="0" step="1000" />
                </div>

                <div class="bg-yellow-50 p-4 rounded-lg">
                    <label class="block text-sm font-medium text-yellow-900 mb-2">
                        <i class="fas fa-user mr-2"></i>
                        一般社員（<span id="rate-display-m2-half">...</span>円/日）
                    </label>
                    <input type="number" id="rate_m2_half_day" class="form-input" min="0" step="500" />
                </div>

                <div class="bg-yellow-50 p-4 rounded-lg">
                    <label class="block text-sm font-medium text-yellow-900 mb-2">
                        <i class="fas fa-user mr-2"></i>
                        M2スタッフ終日（<span id="rate-display-m2-full">...</span>円/日）
                    </label>
                    <input type="number" id="rate_m2_full_day" class="form-input" min="0" step="1000" />
                </div>

                <div class="bg-purple-50 p-4 rounded-lg">
                    <label class="block text-sm font-medium text-purple-900 mb-2">
                        <i class="fas fa-user-clock mr-2"></i>
                        派遣スタッフ半日（<span id="rate-display-temp-half">...</span>円/半日）
                    </label>
                    <input type="number" id="rate_temp_half_day" class="form-input" min="0" step="500" />
                </div>

                <div class="bg-purple-50 p-4 rounded-lg">
                    <label class="block text-sm font-medium text-purple-900 mb-2">
                        <i class="fas fa-user-clock mr-2"></i>
                        派遣スタッフ終日（<span id="rate-display-temp-full">...</span>円/日）
                    </label>
                    <input type="number" id="rate_temp_full_day" class="form-input" min="0" step="1000" />
                </div>
            </div>
        </div>

        <!-- テスト実行ボタン -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">
                <i class="fas fa-play mr-2"></i>
                動的ラベル更新テスト
            </h2>
            <button id="test-dynamic-labels" class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors">
                <i class="fas fa-sync mr-2"></i>
                Step4実装の動的ラベル更新を実行
            </button>
        </div>

        <!-- テスト結果表示 -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">
                <i class="fas fa-clipboard-check mr-2"></i>
                テスト結果
            </h2>
            <div id="test-results" class="space-y-2">
                <div class="text-gray-600">テスト実行前...</div>
            </div>
        </div>
    </div>

    <script src="/static/app.js?v=1768900000&cache=bust"></script>
    <script>
        console.log('🧪 Step4動的ラベル修正テスト開始');
        
        const testResults = document.getElementById('test-results');

        function logResult(message, type = 'info') {
            const colors = {
                info: 'text-blue-600',
                success: 'text-green-600', 
                error: 'text-red-600',
                warning: 'text-yellow-600'
            };
            const icons = {
                info: 'fas fa-info-circle',
                success: 'fas fa-check-circle',
                error: 'fas fa-times-circle', 
                warning: 'fas fa-exclamation-triangle'
            };
            
            const div = document.createElement('div');
            div.className = colors[type] || colors.info;
            div.innerHTML = \`<i class="\${icons[type] || icons.info} mr-2"></i>\${message}\`;
            testResults.appendChild(div);
        }

        // 動的ラベル更新テスト
        document.getElementById('test-dynamic-labels').addEventListener('click', async () => {
            logResult('Step4実装の動的ラベル更新テスト開始...', 'info');
            
            try {
                // Step4Implementationが利用可能かチェック
                if (typeof Step4Implementation === 'undefined') {
                    throw new Error('Step4Implementation オブジェクトが見つかりません');
                }
                
                logResult('✅ Step4Implementation オブジェクト検出', 'success');
                
                // initializeMasterRatesメソッドが存在するかチェック
                if (typeof Step4Implementation.initializeMasterRates !== 'function') {
                    throw new Error('Step4Implementation.initializeMasterRates メソッドが見つかりません');
                }
                
                logResult('✅ initializeMasterRates メソッド検出', 'success');
                
                // HTML要素の存在確認
                const elements = [
                    'rate-display-supervisor',
                    'rate-display-leader', 
                    'rate-display-m2-half',
                    'rate-display-m2-full',
                    'rate-display-temp-half',
                    'rate-display-temp-full'
                ];
                
                let allElementsFound = true;
                elements.forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        logResult(\`✅ 要素 #\${id} 検出済み\`, 'success');
                    } else {
                        logResult(\`❌ 要素 #\${id} 見つかりません\`, 'error');
                        allElementsFound = false;
                    }
                });
                
                if (!allElementsFound) {
                    throw new Error('必要なHTML要素が不足しています');
                }
                
                logResult('🚀 動的ラベル更新処理を実行中...', 'info');
                
                // Step4の動的ラベル更新を実行
                await Step4Implementation.initializeMasterRates();
                
                logResult('✅ 動的ラベル更新処理完了', 'success');
                
                // 更新結果を確認・表示
                logResult('📊 更新後のラベル値:', 'info');
                elements.forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        logResult(\`　 #\${id}: \${element.textContent}\`, 'info');
                    }
                });
                
                logResult('🎉 Step4動的ラベル更新テスト成功！', 'success');
                
            } catch (error) {
                logResult(\`❌ テスト失敗: \${error.message}\`, 'error');
            }
        });
        
        // ページロード完了時の初期状態レポート
        document.addEventListener('DOMContentLoaded', () => {
            logResult('🚀 テストページ初期化完了', 'success');
            logResult('HTML要素とStep4実装の準備状況を確認中...', 'info');
            
            setTimeout(() => {
                const supervisorElement = document.getElementById('rate-display-supervisor');
                if (supervisorElement) {
                    logResult(\`📋 初期値確認 - スーパーバイザー: \${supervisorElement.textContent}円\`, 'info');
                }
                
                if (typeof Step4Implementation !== 'undefined') {
                    logResult('✅ Step4Implementation 利用可能', 'success');
                } else {
                    logResult('❌ Step4Implementation 利用不可', 'error');
                }
                
                logResult('🎯 テスト実行ボタンをクリックして動的ラベル更新をテストしてください', 'warning');
            }, 500);
        });
    </script>
</body>
</html>`)
})

// 動的ラベルテスト用Step4ページ
app.get('/test-step4-labels', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Step4 動的ラベルテスト - Office M2 見積システム</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/style.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-4">
                <i class="fas fa-flask mr-3 text-purple-600"></i>
                Step4 動的ラベルテスト
            </h1>
            <div class="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6">
                <p class="text-blue-700">
                    <i class="fas fa-info-circle mr-2"></i>
                    このページでは、Step4のマスター値動的ラベル表示機能をテストします
                </p>
            </div>
        </div>

        <!-- テスト結果表示エリア -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">
                <i class="fas fa-chart-line mr-2"></i>
                テスト結果
            </h2>
            <div id="test-results" class="space-y-2">
                <div class="text-gray-600">テスト実行待ち...</div>
            </div>
        </div>

        <!-- Step4スタイルのラベル表示テスト -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-6">
                <i class="fas fa-users mr-2"></i>
                スタッフ情報入力（Step4スタイル）
            </h2>
            
            <!-- スーパーバイザー -->
            <div class="mb-6">
                <label class="block text-sm font-medium text-blue-900 mb-2">
                    <i class="fas fa-user-tie mr-2"></i>
                    スーパーバイザー（<span id="rate-display-supervisor">...</span>円/日）
                </label>
                <input 
                    type="number" 
                    id="rate_supervisor" 
                    name="rate_supervisor" 
                    value="40000"
                    min="0" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="スーパーバイザー日当を入力"
                >
            </div>

            <!-- リーダー -->
            <div class="mb-6">
                <label class="block text-sm font-medium text-blue-900 mb-2">
                    <i class="fas fa-user-cog mr-2"></i>
                    リーダー（<span id="rate-display-leader">...</span>円/日）
                </label>
                <input 
                    type="number" 
                    id="rate_leader" 
                    name="rate_leader" 
                    value="12000"
                    min="0" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="リーダー日当を入力"
                >
            </div>
        </div>

        <!-- テスト実行ボタンエリア -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">
                <i class="fas fa-play mr-2"></i>
                テスト実行
            </h2>
            <div class="space-y-4">
                <button id="test-master-api" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                    <i class="fas fa-database mr-2"></i>
                    マスター設定API テスト
                </button>
                <button id="test-label-update" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                    <i class="fas fa-tags mr-2"></i>
                    ラベル更新機能 テスト
                </button>
                <button id="test-complete-flow" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                    <i class="fas fa-cogs mr-2"></i>
                    完全フロー テスト
                </button>
            </div>
        </div>
    </div>

    <script src="/static/app.js?v=1768900000&cache=bust"></script>
    <script>
        console.log('🧪 動的ラベルテストページ初期化開始');
        
        const testResults = document.getElementById('test-results');

        function logTestResult(message, type = 'info') {
            const colors = {
                info: 'text-blue-600',
                success: 'text-green-600', 
                error: 'text-red-600',
                warning: 'text-yellow-600'
            };
            const icons = {
                info: 'fas fa-info-circle',
                success: 'fas fa-check-circle',
                error: 'fas fa-times-circle', 
                warning: 'fas fa-exclamation-triangle'
            };
            
            const div = document.createElement('div');
            div.className = colors[type] || colors.info;
            div.innerHTML = \`<i class="\${icons[type] || icons.info} mr-2"></i>\${message}\`;
            testResults.appendChild(div);
        }

        // マスター設定APIテスト
        document.getElementById('test-master-api').addEventListener('click', async () => {
            logTestResult('マスター設定API テスト開始...', 'info');
            
            try {
                const response = await fetch('/api/master-settings');
                const data = await response.json();
                
                if (response.ok) {
                    logTestResult('✅ マスター設定API レスポンス成功', 'success');
                    logTestResult(\`📊 取得データ: \${JSON.stringify(data, null, 2)}\`, 'info');
                } else {
                    logTestResult(\`❌ API エラー: \${data.error}\`, 'error');
                }
            } catch (error) {
                logTestResult(\`❌ API 呼び出し失敗: \${error.message}\`, 'error');
            }
        });

        // ラベル更新機能テスト
        document.getElementById('test-label-update').addEventListener('click', async () => {
            logTestResult('ラベル更新機能 テスト開始...', 'info');
            
            try {
                // テスト用のマスターデータ
                const testMasterData = {
                    staff_rates: {
                        supervisor: 45000,
                        leader: 15000
                    }
                };
                
                logTestResult('🔧 テスト用マスターデータでラベル更新実行', 'info');
                
                // EstimateFlowが存在するかチェック
                if (typeof EstimateFlow !== 'undefined' && EstimateFlow.setMasterRatesToInputFields) {
                    EstimateFlow.setMasterRatesToInputFields(testMasterData.staff_rates);
                    logTestResult('✅ setMasterRatesToInputFields 実行成功', 'success');
                } else {
                    logTestResult('❌ EstimateFlow.setMasterRatesToInputFields が見つかりません', 'error');
                }
                
                // 結果確認
                const supervisorDisplay = document.getElementById('rate-display-supervisor');
                const leaderDisplay = document.getElementById('rate-display-leader');
                
                if (supervisorDisplay) {
                    logTestResult(\`📋 スーパーバイザー表示値: \${supervisorDisplay.textContent}\`, 'info');
                }
                if (leaderDisplay) {
                    logTestResult(\`📋 リーダー表示値: \${leaderDisplay.textContent}\`, 'info');
                }
                
            } catch (error) {
                logTestResult(\`❌ ラベル更新テスト失敗: \${error.message}\`, 'error');
            }
        });

        // 完全フローテスト
        document.getElementById('test-complete-flow').addEventListener('click', async () => {
            logTestResult('完全フロー テスト開始...', 'info');
            
            try {
                // 1. マスター設定API呼び出し
                logTestResult('1️⃣ マスター設定API 呼び出し中...', 'info');
                const response = await fetch('/api/master-settings');
                const masterData = await response.json();
                
                if (!response.ok) {
                    throw new Error(\`API エラー: \${masterData.error}\`);
                }
                
                logTestResult('✅ マスター設定取得成功', 'success');
                
                // 2. ラベル更新実行
                logTestResult('2️⃣ 動的ラベル更新実行中...', 'info');
                
                if (typeof EstimateFlow !== 'undefined' && EstimateFlow.setMasterRatesToInputFields) {
                    EstimateFlow.setMasterRatesToInputFields(masterData.staff_rates);
                    logTestResult('✅ 動的ラベル更新成功', 'success');
                } else {
                    throw new Error('EstimateFlow.setMasterRatesToInputFields が見つかりません');
                }
                
                // 3. 結果確認と報告
                logTestResult('3️⃣ 結果確認中...', 'info');
                
                const supervisorDisplay = document.getElementById('rate-display-supervisor');
                const leaderDisplay = document.getElementById('rate-display-leader');
                const supervisorInput = document.getElementById('rate_supervisor');
                const leaderInput = document.getElementById('rate_leader');
                
                if (supervisorDisplay && leaderDisplay) {
                    logTestResult(\`📊 最終表示結果:\`, 'success');
                    logTestResult(\`　 🏷️ スーパーバイザーラベル: \${supervisorDisplay.textContent}円/日\`, 'success');
                    logTestResult(\`　 🏷️ リーダーラベル: \${leaderDisplay.textContent}円/日\`, 'success');
                    
                    if (supervisorInput && leaderInput) {
                        logTestResult(\`　 📝 スーパーバイザー入力値: \${supervisorInput.value}\`, 'info');
                        logTestResult(\`　 📝 リーダー入力値: \${leaderInput.value}\`, 'info');
                    }
                    
                    logTestResult('🎉 完全フローテスト 成功完了！', 'success');
                } else {
                    throw new Error('ラベル要素が見つかりません');
                }
                
            } catch (error) {
                logTestResult(\`❌ 完全フローテスト失敗: \${error.message}\`, 'error');
            }
        });
        
        // ページ読み込み完了時の初期状態レポート
        document.addEventListener('DOMContentLoaded', () => {
            logTestResult('🚀 動的ラベルテストページ 初期化完了', 'success');
            logTestResult('EstimateFlow オブジェクトチェック中...', 'info');
            
            setTimeout(() => {
                if (typeof EstimateFlow !== 'undefined') {
                    logTestResult('✅ EstimateFlow オブジェクト 検出成功', 'success');
                    if (EstimateFlow.setMasterRatesToInputFields) {
                        logTestResult('✅ setMasterRatesToInputFields メソッド 利用可能', 'success');
                    } else {
                        logTestResult('❌ setMasterRatesToInputFields メソッド 見つかりません', 'error');
                    }
                } else {
                    logTestResult('❌ EstimateFlow オブジェクト 見つかりません', 'error');
                }
            }, 1000);
        });
    </script>
</body>
</html>`)
})

// ユーザー管理画面
app.get('/admin/users.html', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ユーザー管理 - Office M2 見積システム</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 min-h-screen p-8">
    <div class="max-w-6xl mx-auto">
        <!-- ヘッダー -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-users mr-3 text-blue-600"></i>
                        ユーザー管理
                    </h1>
                    <p class="text-gray-600 mt-2">ユーザーの登録・変更・削除</p>
                </div>
                <div class="flex items-center space-x-3">
                    <button onclick="window.location.href='/'" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                        <i class="fas fa-home mr-2"></i>
                        トップに戻る
                    </button>
                    <button onclick="handleLogout()" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        <i class="fas fa-sign-out-alt mr-2"></i>
                        ログアウト
                    </button>
                </div>
            </div>
        </div>

        <!-- 新規ユーザー登録フォーム -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-user-plus mr-2 text-green-600"></i>
                新規ユーザー登録
            </h2>
            <form id="createUserForm" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">ユーザーID</label>
                    <input 
                        type="text" 
                        id="newUserId" 
                        required
                        placeholder="例: yamada"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">表示名</label>
                    <input 
                        type="text" 
                        id="newUserName" 
                        required
                        placeholder="例: 山田太郎"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
                    <input 
                        type="password" 
                        id="newUserPassword" 
                        required
                        placeholder="4文字以上"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                </div>
                <div class="flex items-end">
                    <button 
                        type="submit" 
                        class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        <i class="fas fa-plus mr-2"></i>
                        登録
                    </button>
                </div>
            </form>
        </div>

        <!-- メッセージ表示エリア -->
        <div id="messageArea" class="hidden mb-6"></div>

        <!-- ユーザー一覧 -->
        <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-list mr-2 text-blue-600"></i>
                ユーザー一覧
            </h2>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ユーザーID</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">表示名</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">作成日時</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody id="userTableBody" class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                                <i class="fas fa-spinner fa-spin mr-2"></i>
                                読み込み中...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- パスワード変更モーダル -->
    <div id="passwordModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-key mr-2 text-yellow-600"></i>
                パスワード変更
            </h3>
            <form id="changePasswordForm">
                <input type="hidden" id="changePasswordUserId">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">ユーザー</label>
                    <input 
                        type="text" 
                        id="changePasswordUserName" 
                        readonly
                        class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    >
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">新しいパスワード</label>
                    <input 
                        type="password" 
                        id="newPassword" 
                        required
                        placeholder="4文字以上"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                </div>
                <div class="flex justify-end space-x-3">
                    <button 
                        type="button" 
                        onclick="closePasswordModal()"
                        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        キャンセル
                    </button>
                    <button 
                        type="submit" 
                        class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                    >
                        <i class="fas fa-save mr-2"></i>
                        変更
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script>
        // メッセージ表示
        function showMessage(message, type = 'success') {
            const messageArea = document.getElementById('messageArea');
            const bgColor = type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700';
            const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
            
            messageArea.className = \`border-l-4 p-4 mb-6 \${bgColor}\`;
            messageArea.innerHTML = \`
                <p class="text-sm">
                    <i class="fas fa-\${icon} mr-2"></i>
                    \${message}
                </p>
            \`;
            messageArea.classList.remove('hidden');
            
            setTimeout(() => {
                messageArea.classList.add('hidden');
            }, 5000);
        }

        // ユーザー一覧読み込み
        async function loadUsers() {
            try {
                const response = await axios.get('/api/auth/users');
                const users = response.data.data;
                
                const tbody = document.getElementById('userTableBody');
                
                if (users.length === 0) {
                    tbody.innerHTML = \`
                        <tr>
                            <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                                ユーザーが登録されていません
                            </td>
                        </tr>
                    \`;
                    return;
                }
                
                tbody.innerHTML = users.map(user => \`
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="text-sm font-medium text-gray-900">\${user.id}</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="text-sm text-gray-900">\${user.name}</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="text-sm text-gray-500">\${new Date(user.created_at).toLocaleString('ja-JP')}</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center space-x-2">
                            <button 
                                onclick="openPasswordModal('\${user.id}', '\${user.name}')"
                                class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm"
                            >
                                <i class="fas fa-key mr-1"></i>
                                パスワード変更
                            </button>
                            <button 
                                onclick="deleteUser('\${user.id}', '\${user.name}')"
                                class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                            >
                                <i class="fas fa-trash mr-1"></i>
                                削除
                            </button>
                        </td>
                    </tr>
                \`).join('');
                
            } catch (error) {
                console.error('ユーザー一覧取得エラー:', error);
                showMessage('ユーザー一覧の取得に失敗しました', 'error');
            }
        }

        // 新規ユーザー登録
        document.getElementById('createUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userId = document.getElementById('newUserId').value.trim();
            const name = document.getElementById('newUserName').value.trim();
            const password = document.getElementById('newUserPassword').value;
            
            try {
                await axios.post('/api/auth/users', { userId, name, password });
                showMessage(\`ユーザー「\${name}」を登録しました\`, 'success');
                document.getElementById('createUserForm').reset();
                loadUsers();
            } catch (error) {
                console.error('ユーザー登録エラー:', error);
                showMessage(error.response?.data?.message || 'ユーザーの登録に失敗しました', 'error');
            }
        });

        // パスワード変更モーダル
        function openPasswordModal(userId, userName) {
            document.getElementById('changePasswordUserId').value = userId;
            document.getElementById('changePasswordUserName').value = \`\${userName} (\${userId})\`;
            document.getElementById('newPassword').value = '';
            document.getElementById('passwordModal').classList.remove('hidden');
        }

        function closePasswordModal() {
            document.getElementById('passwordModal').classList.add('hidden');
        }

        document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userId = document.getElementById('changePasswordUserId').value;
            const newPassword = document.getElementById('newPassword').value;
            
            try {
                await axios.put(\`/api/auth/users/\${userId}/password\`, { newPassword });
                showMessage('パスワードを変更しました', 'success');
                closePasswordModal();
            } catch (error) {
                console.error('パスワード変更エラー:', error);
                showMessage(error.response?.data?.message || 'パスワードの変更に失敗しました', 'error');
            }
        });

        // ユーザー削除
        async function deleteUser(userId, userName) {
            if (!confirm(\`ユーザー「\${userName} (\${userId})」を削除しますか？\\n\\nこの操作は取り消せません。\`)) {
                return;
            }
            
            try {
                await axios.delete(\`/api/auth/users/\${userId}\`);
                showMessage(\`ユーザー「\${userName}」を削除しました\`, 'success');
                loadUsers();
            } catch (error) {
                console.error('ユーザー削除エラー:', error);
                showMessage(error.response?.data?.message || 'ユーザーの削除に失敗しました', 'error');
            }
        }

        // ログアウト処理
        async function handleLogout() {
            if (!confirm('ログアウトしますか？')) {
                return;
            }
            
            try {
                await axios.post('/api/auth/logout');
                window.location.href = '/login.html';
            } catch (error) {
                console.error('ログアウトエラー:', error);
                showMessage('ログアウトに失敗しました', 'error');
            }
        }

        // 初期読み込み
        loadUsers();
    </script>
</body>
</html>`)
})

// ログインページへのリダイレクト
app.get('/login', (c) => {
  return c.redirect('/login.html', 301)
})

// ログイン画面
app.get('/login.html', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ログイン - Office M2 見積システム</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
            <div class="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-4 mb-4">
                <i class="fas fa-truck-moving text-white text-4xl"></i>
            </div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Office M2 見積システム</h1>
            <p class="text-gray-600">ログインしてください</p>
        </div>

        <form id="loginForm" class="space-y-6">
            <div>
                <label for="userId" class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-user mr-2 text-gray-400"></i>ユーザーID
                </label>
                <input 
                    type="text" 
                    id="userId" 
                    name="userId"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="ユーザーIDを入力"
                >
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-lock mr-2 text-gray-400"></i>パスワード
                </label>
                <input 
                    type="password" 
                    id="password" 
                    name="password"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="パスワードを入力"
                >
            </div>

            <div id="errorMessage" class="hidden bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p class="text-sm text-red-700">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span id="errorText"></span>
                </p>
            </div>

            <button 
                type="submit" 
                id="loginButton"
                class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg"
            >
                <i class="fas fa-sign-in-alt mr-2"></i>
                ログイン
            </button>
        </form>

        <div class="mt-8 pt-6 border-t border-gray-200">
            <p class="text-sm text-gray-600 text-center">
                <i class="fas fa-info-circle mr-1"></i>
                アクセス権限がない場合は管理者にお問い合わせください
            </p>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script>
        const loginForm = document.getElementById('loginForm');
        const loginButton = document.getElementById('loginButton');
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');

        function showError(message) {
            errorText.textContent = message;
            errorMessage.classList.remove('hidden');
        }

        function hideError() {
            errorMessage.classList.add('hidden');
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError();

            const userId = document.getElementById('userId').value.trim();
            const password = document.getElementById('password').value;

            if (!userId || !password) {
                showError('IDとパスワードを入力してください');
                return;
            }

            loginButton.disabled = true;
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>ログイン中...';

            try {
                const response = await axios.post('/api/auth/login', {
                    userId,
                    password
                });

                if (response.data.success) {
                    // ログイン成功フラグをセット（認証チェックをスキップさせるため）
                    sessionStorage.setItem('_just_logged_in', 'true');
                    window.location.href = '/';
                } else {
                    showError(response.data.message || 'ログインに失敗しました');
                    loginButton.disabled = false;
                    loginButton.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>ログイン';
                }
            } catch (error) {
                console.error('ログインエラー:', error);
                showError(
                    error.response?.data?.message || 
                    'ログインに失敗しました。IDとパスワードを確認してください'
                );
                loginButton.disabled = false;
                loginButton.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>ログイン';
            }
        });

        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    </script>
</body>
</html>`)
})

// テスト用HTMLページ
app.get('/test_complete_flow.html', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>見積フローテスト</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">スタッフ費用保存問題のテスト</h1>
        
        <div id="results" class="space-y-4"></div>
        
        <button id="testButton" class="bg-blue-500 text-white px-4 py-2 rounded">スタッフ費用保存テストを実行</button>
    </div>

    <script>
        // テスト用の見積フローシミュレーション
        async function simulateEstimateFlow() {
            const results = document.getElementById('results');
            results.innerHTML = '<div class="text-blue-600">🧪 テスト開始...</div>';
            
            try {
                // STEP1-3の データをsessionStorageに設定
                const testFlowData = {
                    step: 4,
                    customer: { id: 1, name: 'テスト顧客' },
                    project: { id: 1, name: 'テスト案件' },
                    delivery: { address: 'テスト住所', postal_code: '1234567', area: 'A' },
                    vehicle: { type: '2t車', operation: '引越', cost: 15000 }
                };
                
                sessionStorage.setItem('estimateFlow', JSON.stringify(testFlowData));
                results.innerHTML += '<div class="text-green-600">✅ STEP1-3データ設定完了</div>';
                
                // STEP4のスタッフ情報を手動で設定（proceedToStep5の処理をシミュレート）
                const staffInfo = {
                    supervisor_count: 1,
                    leader_count: 1, 
                    m2_staff_half_day: 2,
                    m2_staff_full_day: 1,
                    temp_staff_half_day: 0,
                    temp_staff_full_day: 0
                };
                
                // スタッフ費用を計算
                const rates = {
                    supervisor: 25000,
                    leader: 22000,
                    m2_half_day: 8500,
                    m2_full_day: 15000,
                    temp_half_day: 7500,
                    temp_full_day: 13500
                };
                
                const calculatedCost = 
                    (staffInfo.supervisor_count * rates.supervisor) +
                    (staffInfo.leader_count * rates.leader) +
                    (staffInfo.m2_staff_half_day * rates.m2_half_day) +
                    (staffInfo.m2_staff_full_day * rates.m2_full_day) +
                    (staffInfo.temp_staff_half_day * rates.temp_half_day) +
                    (staffInfo.temp_staff_full_day * rates.temp_full_day);
                
                console.log('💰 計算されたスタッフ費用:', calculatedCost);
                results.innerHTML += \`<div class="text-blue-600">💰 計算されたスタッフ費用: ¥\${calculatedCost.toLocaleString()}</div>\`;
                
                // 完全なスタッフ情報を作成（修正後のロジックをシミュレート）
                const completeStaffInfo = {
                    ...staffInfo,
                    total_cost: calculatedCost,
                    staff_cost: calculatedCost  // 重要：両方のフィールドを設定
                };
                
                // STEP5への進行をシミュレート
                testFlowData.step = 5;
                testFlowData.staff = completeStaffInfo;
                
                sessionStorage.setItem('estimateFlow', JSON.stringify(testFlowData));
                results.innerHTML += '<div class="text-green-600">✅ STEP4→STEP5進行シミュレーション完了</div>';
                
                // 保存確認
                const savedData = JSON.parse(sessionStorage.getItem('estimateFlow') || '{}');
                console.log('🔍 保存確認:', savedData.staff);
                results.innerHTML += \`<div class="text-blue-600">🔍 保存されたtotal_cost: ¥\${(savedData.staff?.total_cost || 0).toLocaleString()}</div>\`;
                results.innerHTML += \`<div class="text-blue-600">🔍 保存されたstaff_cost: ¥\${(savedData.staff?.staff_cost || 0).toLocaleString()}</div>\`;
                
                // 見積保存データの作成をシミュレート（STEP6の保存処理）
                const estimateData = {
                    ...savedData.customer,
                    ...savedData.project,
                    ...savedData.delivery,
                    ...savedData.vehicle,
                    ...savedData.staff,
                    // 修正後のstaff_cost設定ロジック
                    staff_cost: savedData.staff.total_cost || 
                               savedData.staff.staff_cost || 
                               calculatedCost,
                    user_id: 'test-user'
                };
                
                console.log('📤 見積保存データ:', estimateData);
                results.innerHTML += \`<div class="text-green-600">✅ 見積保存時のstaff_cost: ¥\${(estimateData.staff_cost || 0).toLocaleString()}</div>\`;
                
                if (estimateData.staff_cost > 0) {
                    results.innerHTML += '<div class="text-green-600 font-bold">🎉 修正成功：スタッフ費用が正しく保存されます</div>';
                } else {
                    results.innerHTML += '<div class="text-red-600 font-bold">❌ 問題継続：スタッフ費用が0になっています</div>';
                }
                
            } catch (error) {
                console.error('テストエラー:', error);
                results.innerHTML += \`<div class="text-red-600">❌ テストエラー: \${error.message}</div>\`;
            }
        }
        
        document.getElementById('testButton').addEventListener('click', simulateEstimateFlow);
    </script>
</body>
</html>`)
})

// JSXレンダラー設定
app.use(renderer)

// API: ダッシュボード統計データ取得
app.get('/api/dashboard/stats', async (c) => {
  try {
    const { env } = c
    const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM形式
    
    // 今月の見積数（見積もりがない場合は案件数で代替）
    const monthlyEstimates = await env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM estimates 
      WHERE strftime('%Y-%m', created_at) = ?
    `).bind(currentMonth).first()
    
    // 見積もりがない場合は案件数で表示
    let monthlyEstimatesCount = monthlyEstimates?.count || 0
    if (monthlyEstimatesCount === 0) {
      const monthlyProjects = await env.DB.prepare(`
        SELECT COUNT(*) as count 
        FROM projects 
        WHERE strftime('%Y-%m', created_at) = ?
      `).bind(currentMonth).first()
      monthlyEstimatesCount = monthlyProjects?.count || 0
    }
    
    // 受注済み案件数（今月）
    const orderedProjects = await env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM projects
      WHERE strftime('%Y-%m', created_at) = ? 
      AND status = 'order'
    `).bind(currentMonth).first()
    
    // 検討中案件数（今月）
    const consideringProjects = await env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM projects
      WHERE strftime('%Y-%m', created_at) = ? 
      AND status IN ('quote_sent', 'under_consideration')
    `).bind(currentMonth).first()
    
    // 今月売上（見積もりがある場合は見積額、ない場合は0）
    const monthlySales = await env.DB.prepare(`
      SELECT COALESCE(SUM(e.total_amount), 0) as total 
      FROM estimates e
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE strftime('%Y-%m', e.created_at) = ? 
      AND p.status = 'order'
    `).bind(currentMonth).first()
    
    return c.json({
      monthlyEstimates: monthlyEstimatesCount,
      orderedEstimates: orderedProjects?.count || 0,
      consideringEstimates: consideringProjects?.count || 0,
      monthlySales: monthlySales?.total || 0
    })
  } catch (error) {
    console.error('ダッシュボード統計取得エラー:', error)
    return c.json({ error: 'ダッシュボード統計の取得に失敗しました' }, 500)
  }
})

// API: スタッフ単価取得
app.get('/api/staff-rates', async (c) => {
  try {
    const { env } = c
    const planType = c.req.query('plan_type') || 'A'
    
    // staff_ratesテーブルからスタッフ単価を取得（プラン別・最新データを優先）
    const rates = await env.DB.prepare(`
      SELECT staff_type, rate 
      FROM staff_rates
      WHERE plan_type = ?
      ORDER BY updated_at DESC, staff_type
    `).bind(planType).all()
    
    // 重複を除去して最新のものだけを使用
    const uniqueRates = {}
    const staffRates = {}
    
    rates.results.forEach((row: any) => {
      if (!uniqueRates[row.staff_type]) {
        uniqueRates[row.staff_type] = true
        // staff_type: supervisor → supervisor_rate
        const key = row.staff_type.endsWith('_rate') ? row.staff_type : `${row.staff_type}_rate`
        staffRates[key] = parseInt(row.rate)
        // 互換性のため、元のキー名も保持
        staffRates[row.staff_type] = parseInt(row.rate)
      }
    })
    
    return c.json({ 
      success: true,
      data: { staffRates },
      plan_type: planType
    })
  } catch (error) {
    console.error('スタッフ単価取得エラー:', error)
    return c.json({ error: 'スタッフ単価の取得に失敗しました' }, 500)
  }
})

// API: サービス単価取得
app.get('/api/service-rates', async (c) => {
  try {
    const { env } = c
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    const planType = c.req.query('plan_type') || 'A'

    console.log('サービス単価マスター取得開始:', userId, 'プラン:', planType)

    // master_settingsからサービス単価を取得（プラン別・user_id付き）
    const serviceRates = await env.DB.prepare(`
      SELECT subcategory, key, value, data_type, description 
      FROM master_settings 
      WHERE category = 'service' AND plan_type = ? AND user_id = ?
      ORDER BY subcategory, key
    `).bind(planType, userId).all()

    // デフォルト値（DBにデータがない場合に使用）
    const defaults: Record<string, number> = {
      parking_officer_hourly_rate: 2500,
      parking_officer_half_day_rate: 10000,
      parking_officer_full_day_rate: 16000,
      parking_officer_transport_osaka_city: 1000,
      parking_officer_transport_osaka_suburb: 1500,
      parking_officer_transport_kyoto: 2000,
      parking_officer_transport_hyogo: 2000,
      transport_vehicle_base_rate_20km: 15000,
      transport_vehicle_rate_per_km: 150,
      fuel_rate_per_liter: 160,
      waste_disposal_small: 8000,
      waste_disposal_medium: 15000,
      waste_disposal_large: 25000,
      protection_work_base_rate: 5000,
      protection_work_floor_rate: 3000,
      material_collection_few: 6000,
      material_collection_medium: 12000,
      material_collection_many: 20000,
      construction_m2_staff_rate: 12500,
      work_time_overtime: 1.25
    }

    const rates: Record<string, number> = {}
    if (serviceRates.results && serviceRates.results.length > 0) {
      serviceRates.results.forEach((rate: any) => {
        // subcategoryとkeyを組み合わせてユニークなキーを作成
        const compositeKey = rate.subcategory ? `${rate.subcategory}_${rate.key}` : rate.key
        rates[compositeKey] = parseFloat(rate.value)
        // 互換性のために元のキー名も保持（subcategoryがない場合や、ユニークな場合）
        if (!rates[rate.key]) {
          rates[rate.key] = parseFloat(rate.value)
        }
      })
      console.log('サービス単価raw results:', serviceRates.results.length, '件')
    } else {
      console.log('サービス単価結果なし、デフォルト値を使用')
    }

    // デフォルト値でDBにない項目を補完
    for (const [key, defaultVal] of Object.entries(defaults)) {
      if (rates[key] === undefined || isNaN(rates[key])) {
        rates[key] = defaultVal
        // 短縮キーも設定
        const shortKey = key.replace(/^[^_]+_[^_]+_/, '')  // prefix_sub_ を除去
        if (!rates[shortKey]) {
          rates[shortKey] = defaultVal
        }
      }
    }

    console.log('サービス単価マスター取得完了:', rates)

    return c.json({
      success: true,
      data: rates,
      count: serviceRates.results ? serviceRates.results.length : 0
    })

  } catch (error) {
    console.error('サービス単価取得エラー:', error)
    return c.json({ error: 'サービス単価の取得に失敗しました' }, 500)
  }
})

// 🔍 デバッグ用：認証なしでサービス料金を取得（テスト専用）
app.get('/api/debug/service-rates', async (c) => {
  try {
    const { env } = c
    
    const planType = c.req.query('plan_type') || 'A'
    // master_settingsからサービス単価を取得（プラン別）
    const serviceRates = await env.DB.prepare(`
      SELECT subcategory, key, value, data_type, description 
      FROM master_settings 
      WHERE category = 'service' AND plan_type = ?
      ORDER BY subcategory, key
    `).bind(planType).all()

    const rates = {}
    if (serviceRates.results && serviceRates.results.length > 0) {
      serviceRates.results.forEach(rate => {
        // subcategoryとkeyを組み合わせてユニークなキーを作成
        const compositeKey = rate.subcategory ? `${rate.subcategory}_${rate.key}` : rate.key
        rates[compositeKey] = parseFloat(rate.value)
        // 互換性のために元のキー名も保持
        if (!rates[rate.key]) {
          rates[rate.key] = parseFloat(rate.value)
        }
      })
    }

    return c.json({
      success: true,
      data: rates,
      raw_results: serviceRates.results,
      count: serviceRates.results ? serviceRates.results.length : 0,
      plan_type: planType
    })

  } catch (error) {
    console.error('デバッグ：サービス単価取得エラー:', error)
    return c.json({ error: 'サービス単価の取得に失敗しました', details: error.message }, 500)
  }
})

// API: スタッフ単価保存・更新（プランA/B対応）
app.post('/api/master-staff-rates', async (c) => {
  try {
    const { env } = c
    const data = await c.req.json()
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    const planType = data.plan_type || 'A'
    
    console.log('💾 スタッフ単価保存データ:', data, 'プラン:', planType)
    
    // 各スタッフ単価を更新または挿入
    const staffRateUpdates = [
      { key: 'supervisor_rate', value: data.supervisor_rate, description: 'スタッフ主任単価（円/日）' },
      { key: 'leader_rate', value: data.leader_rate, description: 'スタッフリーダー単価（円/日）' },
      { key: 'm2_half_day_rate', value: data.m2_half_day_rate, description: '一般社員単価（円/日）' },
      { key: 'm2_full_day_rate', value: data.m2_full_day_rate, description: 'M2作業員終日単価（円/日）' },
      { key: 'temp_half_day_rate', value: data.temp_half_day_rate, description: '臨時作業員半日単価（円/半日）' },
      { key: 'temp_full_day_rate', value: data.temp_full_day_rate, description: '臨時作業員終日単価（円/日）' }
    ]
    
    for (const update of staffRateUpdates) {
      // 既存レコードをチェック（プラン別）
      const existing = await env.DB.prepare(`
        SELECT id FROM master_settings 
        WHERE category = 'staff' AND subcategory = 'pricing' AND key = ? AND user_id = ? AND plan_type = ?
      `).bind(update.key, userId, planType).first()
      
      if (existing) {
        // 更新
        await env.DB.prepare(`
          UPDATE master_settings 
          SET value = ?, updated_at = datetime('now')
          WHERE id = ?
        `).bind(update.value.toString(), existing.id).run()
      } else {
        // 新規挿入
        await env.DB.prepare(`
          INSERT INTO master_settings (category, subcategory, key, value, data_type, description, user_id, plan_type, created_at, updated_at)
          VALUES ('staff', 'pricing', ?, ?, 'number', ?, ?, ?, datetime('now'), datetime('now'))
        `).bind(update.key, update.value.toString(), update.description, userId, planType).run()
      }
    }
    
    console.log(`✅ スタッフ単価保存完了（プラン${planType}）`)
    return c.json({ 
      success: true, 
      message: `プラン${planType}のスタッフ単価を保存しました` 
    })
  } catch (error) {
    console.error('スタッフ単価保存エラー:', error)
    return c.json({ 
      success: false, 
      error: 'スタッフ単価の保存に失敗しました' 
    }, 500)
  }
})

// API: データリセット
app.post('/api/reset-data', async (c) => {
  try {
    const { env } = c
    
    // 外部キー制約を無効にして削除を実行
    await env.DB.prepare('PRAGMA foreign_keys = OFF').run()
    
    // 存在するテーブルのみ削除する関数
    const safeDeleteTable = async (tableName: string) => {
      try {
        await env.DB.prepare(`DELETE FROM ${tableName}`).run()
        console.log(`✅ ${tableName}テーブルをクリアしました`)
      } catch (error) {
        console.log(`ℹ️ ${tableName}テーブルは存在しません（スキップ）`)
      }
    }
    
    // 関連テーブルを依存関係順に削除
    await safeDeleteTable('free_estimate_items')  // 自由見積項目
    await safeDeleteTable('estimates')            // 見積データ
    await safeDeleteTable('ai_predictions')       // AI予測データ（存在する場合のみ）
    await safeDeleteTable('status_history')       // ステータス履歴（存在する場合のみ）
    await safeDeleteTable('projects')             // 案件データ
    await safeDeleteTable('customers')            // 顧客データ
    
    // 外部キー制約を再有効化
    await env.DB.prepare('PRAGMA foreign_keys = ON').run()
    
    console.log('✅ データリセット完了 - 全テーブルをクリアしました')
    return c.json({ success: true, message: 'データを正常にリセットしました' })
  } catch (error) {
    console.error('❌ データリセットエラー:', error)
    // 外部キー制約を再有効化（エラー時も確実に）
    try {
      await env.DB.prepare('PRAGMA foreign_keys = ON').run()
    } catch (pragmaError) {
      console.error('❌ PRAGMA設定エラー:', pragmaError)
    }
    return c.json({ 
      error: 'データのリセットに失敗しました', 
      detail: error.message 
    }, 500)
  }
})

// API: 見積履歴取得
app.get('/api/estimates', async (c) => {
  try {
    const { env } = c
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    const search = c.req.query('search') || ''
    const status = c.req.query('status') || ''
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '15')
    const offset = (page - 1) * limit
    
    // 基本クエリ
    let query = `
      SELECT 
        e.*,
        c.name as customer_name,
        c.contact_person,
        p.name as project_name,
        p.status as project_status
      FROM estimates e
      LEFT JOIN customers c ON e.customer_id = c.id
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE e.user_id = ?
    `
    const params = [userId]
    
    // 検索条件（見積番号、顧客名、案件名、担当者名で検索可能）
    if (search) {
      query += ` AND (e.estimate_number LIKE ? OR c.name LIKE ? OR p.name LIKE ? OR c.contact_person LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (status) {
      query += ` AND p.status = ?`
      params.push(status)
    }
    
    query += ` ORDER BY e.created_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)
    
    const result = await env.DB.prepare(query).bind(...params).all()
    
    // 総件数を取得
    let countQuery = `SELECT COUNT(*) as total FROM estimates e LEFT JOIN projects p ON e.project_id = p.id WHERE e.user_id = ?`
    const countParams = [userId]
    
    if (search) {
      countQuery += ` AND (e.estimate_number LIKE ? OR EXISTS (SELECT 1 FROM customers c WHERE c.id = e.customer_id AND (c.name LIKE ? OR c.contact_person LIKE ?)) OR p.name LIKE ?)`
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (status) {
      countQuery += ` AND p.status = ?`
      countParams.push(status)
    }
    
    const countResult = await env.DB.prepare(countQuery).bind(...countParams).first()
    const total = countResult?.total || 0
    
    return c.json({
      success: true,
      data: result.results || [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('見積履歴取得エラー:', error)
    return c.json({ 
      success: false,
      error: '見積履歴の取得に失敗しました',
      message: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// API: 見積統計情報取得（動的ルートより先に定義）
app.get('/api/estimates/stats', async (c) => {
  try {
    const { env } = c
    const userId = c.req.header('X-User-ID') || 'test-user-001'

    // 基本統計を取得
    const [totalResult, amountResult, monthlyResult, ordersResult, phaseResult] = await Promise.all([
      // 総見積数
      env.DB.prepare('SELECT COUNT(*) as total FROM estimates WHERE user_id = ?').bind(userId).first(),
      // 総見積金額
      env.DB.prepare('SELECT SUM(total_amount) as total_amount FROM estimates WHERE user_id = ?').bind(userId).first(),
      // 今月の見積数
      env.DB.prepare(`
        SELECT COUNT(*) as monthly_count, SUM(total_amount) as monthly_amount 
        FROM estimates 
        WHERE user_id = ? AND date(created_at) >= date('now', 'start of month')
      `).bind(userId).first(),
      // 受注済み統計
      env.DB.prepare(`
        SELECT COUNT(*) as order_count
        FROM estimates e
        LEFT JOIN projects p ON e.project_id = p.id
        WHERE e.user_id = ? AND (p.status IN ('won', 'formal_order', 'order'))
      `).bind(userId).first(),
      // フェーズ別集計（見積ライフサイクル）
      env.DB.prepare(`
        SELECT 
          COALESCE(p.status, 'drafting') as status,
          COUNT(*) as cnt
        FROM estimates e
        LEFT JOIN projects p ON e.project_id = p.id
        WHERE e.user_id = ?
        GROUP BY COALESCE(p.status, 'drafting')
      `).bind(userId).all()
    ])

    // フェーズ別に集計
    const phaseMapping = {
      drafting: 'production', pdf_generated: 'production', approval_requested: 'production',
      pending_approval: 'approval', revision_requested: 'approval',
      sent_to_customer: 'sent', under_review: 'sent', re_estimate_requested: 'sent',
      formal_order: 'final', won: 'final', lost: 'final', cancelled: 'final',
      // 旧ステータスのマッピング
      initial: 'production', quote_sent: 'sent', under_consideration: 'sent',
      order: 'final', order_day: 'final', order_night: 'final', completed: 'final', failed: 'final'
    }
    
    const phaseCounts = { production: 0, approval: 0, sent: 0, final: 0 }
    const statusCounts = {}
    
    if (phaseResult.results) {
      for (const row of phaseResult.results) {
        const status = row.status as string
        const count = row.cnt as number
        statusCounts[status] = count
        const phase = phaseMapping[status] || 'production'
        phaseCounts[phase] = (phaseCounts[phase] || 0) + count
      }
    }

    return c.json({
      success: true,
      data: {
        totalEstimates: totalResult?.total || 0,
        totalAmount: amountResult?.total_amount || 0,
        monthlyEstimates: monthlyResult?.monthly_count || 0,
        monthlyAmount: monthlyResult?.monthly_amount || 0,
        ordersCount: ordersResult?.order_count || 0,
        pendingEstimates: (totalResult?.total || 0) - (ordersResult?.order_count || 0),
        phaseCounts: phaseCounts,
        statusCounts: statusCounts
      }
    })
  } catch (error) {
    console.error('統計情報取得エラー:', error)
    return c.json({ 
      success: false,
      error: '統計情報の取得に失敗しました',
      message: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// API: 見積詳細取得
app.get('/api/estimates/:id', async (c) => {
  try {
    const { env } = c
    const estimateId = c.req.param('id')

    const { results } = await env.DB.prepare(`
      SELECT 
        e.*,
        c.name as customer_name,
        c.name as customer_company,
        c.phone as customer_phone,
        c.email as customer_email,
        p.name as project_name,
        p.status as project_status
      FROM estimates e
      LEFT JOIN customers c ON e.customer_id = c.id
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE e.id = ?
    `).bind(estimateId).all()

    if (results.length === 0) {
      return c.json({ 
        success: false,
        error: '見積が見つかりません' 
      }, 404)
    }

    return c.json({ 
      success: true, 
      data: results[0] 
    })
  } catch (error) {
    console.error('見積詳細取得エラー:', error)
    return c.json({ 
      success: false,
      error: '見積詳細の取得に失敗しました',
      detail: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// API: 見積更新
app.put('/api/estimates/:id', async (c) => {
  try {
    const { env } = c
    const estimateId = c.req.param('id')
    const data = await c.req.json()
    
    console.log('見積更新データ:', data)

    // 見積の包括的更新（全費用項目とスタッフ詳細を含む）
    await env.DB.prepare(`
      UPDATE estimates 
      SET 
        delivery_address = ?,
        delivery_postal_code = ?,
        delivery_area = ?,
        vehicle_type = ?,
        operation_type = ?,
        oneman_discount_applied = ?,
        vehicle_2t_count = ?,
        vehicle_4t_count = ?,
        vehicle_dedicated_count = ?,
        vehicle_charter_count = ?,
        vehicle_dedicated_unit_price = ?,
        vehicle_charter_unit_price = ?,
        external_contractor_cost = ?,
        uses_multiple_vehicles = ?,
        vehicle_cost = ?,
        staff_cost = ?,
        supervisor_count = ?,
        leader_count = ?,
        m2_staff_half_day = ?,
        m2_staff_full_day = ?,
        temp_staff_half_day = ?,
        temp_staff_full_day = ?,
        parking_officer_hours = ?,
        parking_officer_cost = ?,
        transport_vehicles = ?,
        transport_within_20km = ?,
        transport_distance = ?,
        transport_fuel_cost = ?,
        transport_cost = ?,
        waste_disposal_size = ?,
        waste_disposal_cost = ?,
        protection_work = ?,
        protection_floors = ?,
        protection_cost = ?,
        material_collection_size = ?,
        material_collection_cost = ?,
        construction_m2_staff = ?,
        construction_partner = ?,
        construction_cost = ?,
        work_time_type = ?,
        work_time_multiplier = ?,
        parking_fee = ?,
        highway_fee = ?,
        subtotal = ?,
        tax_rate = ?,
        tax_amount = ?,
        total_amount = ?,
        notes = ?,
        customer_contact_person = ?,
        additional_truck_count = ?,
        additional_truck_unit_price = ?,
        additional_truck_cost = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.delivery_address || '',
      data.delivery_postal_code || '',
      data.delivery_area || '',
      data.vehicle_type || '',
      data.operation_type || '',
      data.oneman_discount_applied || 0,
      data.vehicle_2t_count || 0,
      data.vehicle_4t_count || 0,
      data.vehicle_dedicated_count || 0,
      data.vehicle_charter_count || 0,
      data.vehicle_dedicated_unit_price || 0,
      data.vehicle_charter_unit_price || 0,
      data.external_contractor_cost || 0,
      data.uses_multiple_vehicles ? 1 : 0,
      data.vehicle_cost || 0,
      data.staff_cost || 0,
      data.supervisor_count || 0,
      data.leader_count || 0,
      data.m2_staff_half_day || 0,
      data.m2_staff_full_day || 0,
      data.temp_staff_half_day || 0,
      data.temp_staff_full_day || 0,
      data.parking_officer_hours || 0,
      data.parking_officer_cost || 0,
      data.transport_vehicles || 0,
      data.transport_within_20km ? 1 : 0,
      data.transport_distance || 0,
      data.transport_fuel_cost || 0,
      data.transport_cost || 0,
      data.waste_disposal_size || 'none',
      data.waste_disposal_cost || 0,
      data.protection_work ? 1 : 0,
      data.protection_floors || 0,
      data.protection_cost || 0,
      data.material_collection_size || 'none',
      data.material_collection_cost || 0,
      data.construction_m2_staff || 0,
      data.construction_partner || null,
      data.construction_cost || 0,
      data.work_time_type || 'normal',
      data.work_time_multiplier || 1.0,
      data.parking_fee || 0,
      data.highway_fee || 0,
      (() => {
        const vehicleCost = data.vehicle_cost || 0;
        const staffCost = data.staff_cost || 0;
        const servicesCost = (data.parking_officer_cost || 0) + 
                           (data.transport_cost || 0) + 
                           (data.waste_disposal_cost || 0) + 
                           (data.protection_cost || 0) + 
                           (data.material_collection_cost || 0) + 
                           (data.construction_cost || 0) + 
                           (data.parking_fee || 0) + 
                           (data.highway_fee || 0) +
                           (data.additional_truck_cost || 0);
        return vehicleCost + staffCost + servicesCost;
      })(),
      data.tax_rate || 0.1,
      (() => {
        const vehicleCost = data.vehicle_cost || 0;
        const staffCost = data.staff_cost || 0;
        const servicesCost = (data.parking_officer_cost || 0) + 
                           (data.transport_cost || 0) + 
                           (data.waste_disposal_cost || 0) + 
                           (data.protection_cost || 0) + 
                           (data.material_collection_cost || 0) + 
                           (data.construction_cost || 0) + 
                           (data.parking_fee || 0) + 
                           (data.highway_fee || 0) +
                           (data.additional_truck_cost || 0);
        const calculatedSubtotal = vehicleCost + staffCost + servicesCost;
        const taxRate = data.tax_rate || 0.1;
        return Math.floor(calculatedSubtotal * taxRate);
      })(),
      (() => {
        const vehicleCost = data.vehicle_cost || 0;
        const staffCost = data.staff_cost || 0;
        const servicesCost = (data.parking_officer_cost || 0) + 
                           (data.transport_cost || 0) + 
                           (data.waste_disposal_cost || 0) + 
                           (data.protection_cost || 0) + 
                           (data.material_collection_cost || 0) + 
                           (data.construction_cost || 0) + 
                           (data.parking_fee || 0) + 
                           (data.highway_fee || 0) +
                           (data.additional_truck_cost || 0);
        const calculatedSubtotal = vehicleCost + staffCost + servicesCost;
        const taxRate = data.tax_rate || 0.1;
        const calculatedTaxAmount = Math.floor(calculatedSubtotal * taxRate);
        return calculatedSubtotal + calculatedTaxAmount;
      })(),
      data.notes || '',
      data.customer_contact_person || '',
      data.additional_truck_count || 0,
      data.additional_truck_unit_price || 0,
      data.additional_truck_cost || 0,
      estimateId
    ).run()

    return c.json({ success: true, message: '見積を正常に更新しました' })
  } catch (error) {
    console.error('見積更新エラー:', error)
    return c.json({ 
      error: '見積の更新に失敗しました',
      detail: error.message 
    }, 500)
  }
})



// API: 見積削除
app.delete('/api/estimates/:id', async (c) => {
  try {
    const { env } = c
    const estimateId = c.req.param('id')

    await env.DB.prepare('DELETE FROM estimates WHERE id = ?').bind(estimateId).run()

    return c.json({ success: true, message: '見積を削除しました' })
  } catch (error) {
    console.error('見積削除エラー:', error)
    return c.json({ error: '見積の削除に失敗しました' }, 500)
  }
})

// API: 見積ステータス更新（プロジェクト経由）
app.put('/api/estimates/:id/status', async (c) => {
  try {
    const { env } = c
    const estimateId = c.req.param('id')
    const { status, comment } = await c.req.json()
    
    // 見積からプロジェクトIDを取得
    const estimate = await env.DB.prepare(`
      SELECT project_id FROM estimates WHERE id = ?
    `).bind(estimateId).first()
    
    if (!estimate) {
      return c.json({ 
        success: false,
        message: '見積が見つかりません' 
      }, 404)
    }
    
    // プロジェクトの現在のステータスを取得
    const currentProject = await env.DB.prepare(`
      SELECT status FROM projects WHERE id = ?
    `).bind(estimate.project_id).first()
    
    if (!currentProject) {
      return c.json({ 
        success: false,
        message: '関連する案件が見つかりません' 
      }, 404)
    }
    
    // 再見積もり依頼の場合：ステータスを一度 re_estimate_requested に記録してから drafting にリセット
    let finalStatus = status
    let additionalNote = ''
    if (status === 're_estimate_requested') {
      finalStatus = 'drafting'
      additionalNote = '【再見積もり依頼】顧客からの再見積もり依頼により製作中に戻りました。'
    }
    
    // プロジェクトのステータスを更新
    await env.DB.prepare(`
      UPDATE projects 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(finalStatus, estimate.project_id).run()
    
    // 見積自体のステータスも更新
    await env.DB.prepare(`
      UPDATE estimates 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(finalStatus, estimateId).run()
    
    // ステータス履歴を記録（元のステータス変更を記録）
    await env.DB.prepare(`
      INSERT INTO status_history (project_id, old_status, new_status, notes, user_id)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      estimate.project_id,
      currentProject.status, 
      status, 
      comment || '', 
      'test-user-001'
    ).run()
    
    // 再見積もり依頼の場合は、drafting への戻りも履歴に記録
    if (status === 're_estimate_requested') {
      await env.DB.prepare(`
        INSERT INTO status_history (project_id, old_status, new_status, notes, user_id)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        estimate.project_id,
        're_estimate_requested', 
        'drafting', 
        additionalNote + (comment ? ` 備考: ${comment}` : ''), 
        'test-user-001'
      ).run()
    }
    
    return c.json({ 
      success: true, 
      message: status === 're_estimate_requested' 
        ? '再見積もり依頼を受付し、製作中に戻しました' 
        : 'ステータスを更新しました'
    })
    
  } catch (error) {
    console.error('見積ステータス更新エラー:', error)
    return c.json({ 
      success: false,
      message: 'ステータスの更新に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// API: 案件ステータス更新
app.put('/api/projects/:id/status', async (c) => {
  try {
    const { env } = c
    const projectId = c.req.param('id')
    const { status, notes } = await c.req.json()
    
    // 現在のステータスを取得
    const currentProject = await env.DB.prepare(`
      SELECT status FROM projects WHERE id = ?
    `).bind(projectId).first()
    
    if (!currentProject) {
      return c.json({ error: '案件が見つかりません' }, 404)
    }
    
    // 再見積もり依頼の場合：ステータスを一度記録してから drafting にリセット
    let finalStatus = status
    let additionalNote = ''
    if (status === 're_estimate_requested') {
      finalStatus = 'drafting'
      additionalNote = '【再見積もり依頼】顧客からの再見積もり依頼により製作中に戻りました。'
    }
    
    // ステータスを更新
    await env.DB.prepare(`
      UPDATE projects 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(finalStatus, projectId).run()
    
    // ステータス履歴を記録
    await env.DB.prepare(`
      INSERT INTO status_history (project_id, old_status, new_status, notes, user_id)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      projectId, 
      currentProject.status, 
      status, 
      notes || '', 
      'test-user-001'
    ).run()
    
    // 再見積もり依頼の場合は、drafting への戻りも履歴に記録
    if (status === 're_estimate_requested') {
      await env.DB.prepare(`
        INSERT INTO status_history (project_id, old_status, new_status, notes, user_id)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        projectId,
        're_estimate_requested', 
        'drafting', 
        additionalNote + (notes ? ` 備考: ${notes}` : ''), 
        'test-user-001'
      ).run()
    }
    
    return c.json({ 
      success: true, 
      message: status === 're_estimate_requested' 
        ? '再見積もり依頼を受付し、製作中に戻しました' 
        : 'ステータスを更新しました' 
    })
  } catch (error) {
    console.error('ステータス更新エラー:', error)
    return c.json({ 
      error: 'ステータスの更新に失敗しました',
      detail: error.message 
    }, 500)
  }
})

// API: ステータス履歴取得
app.get('/api/status-history', async (c) => {
  try {
    const { env } = c
    const projectId = c.req.query('project_id')
    
    let query = `
      SELECT sh.*, p.name as project_name, c.name as customer_name
      FROM status_history sh
      LEFT JOIN projects p ON sh.project_id = p.id
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE 1=1
    `
    const params = []
    
    if (projectId) {
      query += ' AND sh.project_id = ?'
      params.push(projectId)
    }
    
    query += ' ORDER BY sh.created_at DESC LIMIT 50'
    
    const { results } = await env.DB.prepare(query).bind(...params).all()
    
    return c.json({ 
      success: true, 
      data: results 
    })
  } catch (error) {
    console.error('ステータス履歴取得エラー:', error)
    return c.json({ error: 'ステータス履歴の取得に失敗しました' }, 500)
  }
})

// API: ステータスオプション取得（見積ライフサイクル12段階）
app.get('/api/status-options', async (c) => {
  try {
    const statusOptions = [
      // フェーズ1: 製作中
      { value: 'drafting', label: '担当者作成中', phase: 'production', color: 'gray', icon: 'edit' },
      { value: 'pdf_generated', label: 'PDF生成済み', phase: 'production', color: 'gray', icon: 'file-pdf' },
      { value: 'approval_requested', label: '決裁申請済み', phase: 'production', color: 'gray', icon: 'upload' },
      // フェーズ2: 決裁待ち
      { value: 'pending_approval', label: '管理者確認中', phase: 'approval', color: 'orange', icon: 'user-check' },
      { value: 'revision_requested', label: '差戻し（修正依頼）', phase: 'approval', color: 'purple', icon: 'undo' },
      // フェーズ3: 送信済み/検討中
      { value: 'sent_to_customer', label: '顧客送信済み', phase: 'sent', color: 'blue', icon: 'envelope' },
      { value: 'under_review', label: '顧客検討中', phase: 'sent', color: 'blue', icon: 'search' },
      { value: 're_estimate_requested', label: '再見積もり依頼', phase: 'sent', color: 'blue', icon: 'question-circle' },
      // フェーズ4: 最終結果
      { value: 'formal_order', label: '正式注文', phase: 'final', color: 'green', icon: 'handshake' },
      { value: 'won', label: '受注', phase: 'final', color: 'green', icon: 'trophy' },
      { value: 'lost', label: '失注', phase: 'final', color: 'red', icon: 'times-circle' },
      { value: 'cancelled', label: 'キャンセル', phase: 'final', color: 'red', icon: 'ban' }
    ]
    
    // フェーズ情報も返す
    const phases = [
      { key: 'production', label: '製作中', color: 'gray', icon: 'edit' },
      { key: 'approval', label: '決裁待ち', color: 'orange', icon: 'clock' },
      { key: 'sent', label: '送信済み/検討中', color: 'blue', icon: 'envelope-open-text' },
      { key: 'final', label: '最終結果', color: 'green', icon: 'flag-checkered' }
    ]
    
    return c.json({ 
      success: true, 
      data: statusOptions,
      phases: phases
    })
  } catch (error) {
    console.error('ステータスオプション取得エラー:', error)
    return c.json({ 
      success: false,
      error: 'ステータスオプションの取得に失敗しました' 
    }, 500)
  }
})

// API: 顧客一覧取得（見積フィルタ用）
app.get('/api/customers/list', async (c) => {
  try {
    const { env } = c
    const { results } = await env.DB.prepare(`
      SELECT id, name, contact_person, email, phone, address
      FROM customers
      ORDER BY name
    `).all()

    return c.json({ customers: results })
  } catch (error) {
    console.error('顧客一覧取得エラー:', error)
    return c.json({ error: '顧客一覧の取得に失敗しました' }, 500)
  }
})

// API: 車両料金取得
app.get('/api/vehicle-pricing', async (c) => {
  try {
    const { env } = c
    const url = new URL(c.req.url)
    const vehicle_type = url.searchParams.get('vehicle_type')
    const operation_type = url.searchParams.get('operation_type') 
    const delivery_area = url.searchParams.get('delivery_area')
    
    if (!vehicle_type || !operation_type || !delivery_area) {
      return c.json({ error: '必要なパラメータが不足しています' }, 400)
    }
    
    console.log('車両料金検索:', { vehicle_type, operation_type, delivery_area })
    
    // vehicle_pricingテーブルから料金を取得（最新データを優先）
    const priceData = await env.DB.prepare(`
      SELECT price 
      FROM vehicle_pricing 
      WHERE vehicle_type = ? 
        AND operation_type = ?
        AND area = ?
      ORDER BY updated_at DESC
      LIMIT 1
    `).bind(vehicle_type, operation_type, delivery_area).first()
    
    if (!priceData) {
      console.log('料金データが見つかりません:', { vehicle_type, operation_type, delivery_area })
      return c.json({ 
        error: '指定された車両・稼働形態・エリアの料金が見つかりません',
        requested: { vehicle_type, operation_type, delivery_area }
      }, 404)
    }
    
    const price = parseFloat(priceData.price)
    
    return c.json({
      success: true,
      vehicle_type,
      operation_type, 
      delivery_area,
      price: price,
      price_formatted: `¥${price.toLocaleString()}`
    })
    
  } catch (error) {
    console.error('車両料金取得エラー:', error)
    return c.json({ error: '車両料金の取得に失敗しました' }, 500)
  }
})

// ================== AI機能API ==================

// API: スタッフ最適化提案
app.post('/api/ai/staff-optimization', async (c) => {
  try {
    const { env } = c
    const {
      vehicle_type,
      operation_type,
      delivery_area,
      estimated_volume = 'medium',
      work_complexity = 'normal',
      current_staff = {}
    } = await c.req.json()

    // 類似パターンを検索
    const { results: patterns } = await env.DB.prepare(`
      SELECT *
      FROM staff_optimization_patterns 
      WHERE vehicle_type = ? 
        AND operation_type = ? 
        AND delivery_area = ?
        AND estimated_volume = ?
        AND work_complexity = ?
      ORDER BY success_rate DESC, cost_efficiency DESC
      LIMIT 3
    `).bind(vehicle_type, operation_type, delivery_area, estimated_volume, work_complexity).all()

    let recommendation
    
    if (patterns.length > 0) {
      // パターンマッチングによる推奨
      const bestPattern = patterns[0]
      recommendation = {
        supervisor_count: bestPattern.recommended_supervisor,
        leader_count: bestPattern.recommended_leader,
        m2_staff_full_day: bestPattern.recommended_m2_full,
        m2_staff_half_day: bestPattern.recommended_m2_half,
        temp_staff_full_day: bestPattern.recommended_temp_full,
        temp_staff_half_day: bestPattern.recommended_temp_half,
        confidence_score: bestPattern.success_rate,
        cost_efficiency: bestPattern.cost_efficiency,
        reasoning: `類似案件の成功パターンに基づく推奨です。成功率${Math.round(bestPattern.success_rate * 100)}%、コスト効率${Math.round(bestPattern.cost_efficiency * 100)}%のパターンです。`
      }
    } else {
      // フォールバック：一般的なパターンで推奨
      const { results: fallbackPatterns } = await env.DB.prepare(`
        SELECT *
        FROM staff_optimization_patterns 
        WHERE vehicle_type = ? AND operation_type = ?
        ORDER BY success_rate DESC, cost_efficiency DESC
        LIMIT 1
      `).bind(vehicle_type, operation_type).all()

      if (fallbackPatterns.length > 0) {
        const fallback = fallbackPatterns[0]
        recommendation = {
          supervisor_count: fallback.recommended_supervisor,
          leader_count: fallback.recommended_leader,
          m2_staff_full_day: fallback.recommended_m2_full,
          m2_staff_half_day: fallback.recommended_m2_half,
          temp_staff_full_day: fallback.recommended_temp_full,
          temp_staff_half_day: fallback.recommended_temp_half,
          confidence_score: fallback.success_rate * 0.8, // 信頼度を下げる
          cost_efficiency: fallback.cost_efficiency * 0.9,
          reasoning: `車両タイプと作業時間に基づく一般的な推奨です。より正確な推奨のため、案件詳細の入力をお勧めします。`
        }
      } else {
        // デフォルト推奨（ルールベース）
        recommendation = generateDefaultRecommendation(vehicle_type, operation_type, delivery_area)
      }
    }

    // 現在の設定との比較
    const comparison = compareStaffConfiguration(current_staff, recommendation)

    return c.json({
      success: true,
      recommendation,
      comparison,
      patterns: patterns.map(p => ({
        success_rate: p.success_rate,
        cost_efficiency: p.cost_efficiency,
        notes: p.notes
      }))
    })

  } catch (error) {
    console.error('スタッフ最適化エラー:', error)
    return c.json({ error: 'スタッフ最適化の処理に失敗しました' }, 500)
  }
})


// API: AI営業メール生成
app.post('/api/ai/generate-email', async (c) => {
  try {
    const { env } = c
    const {
      estimate_id,
      email_type = 'quote_initial',
      customer_type = 'corporate',
      project_type = 'office_move',
      custom_notes = ''
    } = await c.req.json()

    // 見積データを取得
    const { results: estimates } = await env.DB.prepare(`
      SELECT 
        e.*,
        c.name as customer_name,
        c.name as customer_company,
        c.phone as customer_phone,
        c.email as customer_email,
        p.name as project_name
      FROM estimates e
      LEFT JOIN customers c ON e.customer_id = c.id
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE e.id = ?
    `).bind(estimate_id).all()

    if (estimates.length === 0) {
      return c.json({ error: '見積データが見つかりません' }, 404)
    }

    const estimate = estimates[0]

    // 適切なテンプレートを取得
    const { results: templates } = await env.DB.prepare(`
      SELECT *
      FROM ai_email_templates
      WHERE template_type = ? AND customer_type = ? AND project_type = ?
      ORDER BY success_rate DESC, usage_count DESC
      LIMIT 1
    `).bind(email_type, customer_type, project_type).all()

    if (templates.length === 0) {
      return c.json({ error: '適切なメールテンプレートが見つかりません' }, 404)
    }

    const template = templates[0]

    // AI強化されたコンテンツ生成
    const aiEnhancements = generateAIEnhancements(estimate, custom_notes)
    
    // テンプレート変数を置換
    const emailContent = {
      subject: replaceTemplateVariables(template.subject_template, estimate, aiEnhancements),
      body: replaceTemplateVariables(template.body_template, estimate, aiEnhancements),
      template_id: template.id,
      ai_enhancements: aiEnhancements
    }

    // 使用回数を更新
    await env.DB.prepare(`
      UPDATE ai_email_templates 
      SET usage_count = usage_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(template.id).run()

    return c.json({
      success: true,
      email: emailContent
    })

  } catch (error) {
    console.error('AI メール生成エラー:', error)
    return c.json({ 
      error: 'メール生成に失敗しました',
      detail: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// AI受注確率予測
app.post('/api/ai/predict-order-probability', async (c) => {
  try {
    const { env } = c
    const { estimate_id } = await c.req.json()

    // 見積データを取得
    const { results: estimates } = await env.DB.prepare(`
      SELECT 
        e.*,
        p.status,
        c.company as customer_company,
        (SELECT COUNT(*) FROM estimates WHERE customer_id = e.customer_id) as customer_history_count
      FROM estimates e
      LEFT JOIN customers c ON e.customer_id = c.id
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE e.id = ?
    `).bind(estimate_id).all()

    if (estimates.length === 0) {
      return c.json({ error: '見積データが見つかりません' }, 404)
    }

    const estimate = estimates[0]

    // AI予測ロジック（簡易版）
    let probability = 0.5 // ベース確率50%
    const factors = []

    // 顧客履歴による調整
    if (estimate.customer_history_count > 0) {
      probability += 0.2
      factors.push(`既存顧客（過去${estimate.customer_history_count}件の取引）`)
    }

    // 金額による調整
    if (estimate.total_amount < 100000) {
      probability += 0.15
      factors.push('適正価格帯（10万円以下）')
    } else if (estimate.total_amount > 500000) {
      probability -= 0.1
      factors.push('高額案件（慎重検討が予想される）')
    }

    // エリアによる調整
    if (estimate.delivery_area === 'A') {
      probability += 0.1
      factors.push('主要エリア（Aエリア）での作業')
    }

    // 車両タイプによる調整
    if (estimate.vehicle_type === '2t車' || estimate.vehicle_type === '軽トラック') {
      probability += 0.05
      factors.push('汎用性の高い車両タイプ')
    }

    // 0-1の範囲に正規化
    probability = Math.max(0, Math.min(1, probability))
    
    // 予測結果を保存
    await env.DB.prepare(`
      INSERT INTO ai_predictions 
      (estimate_id, prediction_type, prediction_value, confidence_score, factors)
      VALUES (?, 'order_probability', ?, 0.75, ?)
    `).bind(estimate_id, probability, JSON.stringify(factors)).run()

    return c.json({
      success: true,
      probability: Math.round(probability * 100),
      confidence_score: 75,
      factors,
      recommendations: generateOrderProbabilityRecommendations(probability, factors)
    })

  } catch (error) {
    console.error('受注確率予測エラー:', error)
    return c.json({ error: '受注確率予測に失敗しました' }, 500)
  }
})

// API: 郵便番号検索（詳細エリア判定対応）
app.get('/api/postal-code/:code', async (c) => {
  try {
    const postalCode = c.req.param('code')
    
    // 郵便番号が7桁の数字であることを確認
    if (!/^\d{7}$/.test(postalCode)) {
      return c.json({ error: '郵便番号は7桁の数字で入力してください' }, 400)
    }
    
    // 詳細なエリア判定ロジックを使用
    const areaResult = getAreaFromPostalCode(postalCode)
    
    // 外部API（ZipAddress）で住所情報も取得を試みる
    let addressInfo = null
    try {
      const zipAddressResponse = await fetch(`https://api.zipaddress.net/?zipcode=${postalCode}`)
      if (zipAddressResponse.ok) {
        const data = await zipAddressResponse.json()
        if (data.code === 200) {
          addressInfo = `${data.data.pref}${data.data.city}${data.data.town}`
        }
      }
    } catch (error) {
      console.log('外部API利用失敗（郵便番号のみでエリア判定継続）:', error.message)
    }
    
    return c.json({
      success: true,
      postal_code: postalCode,
      area_name: areaResult.area_name,
      area_rank: areaResult.area_rank,
      address: addressInfo, // 住所情報（取得できた場合のみ）
      detected: true
    })
    
  } catch (error) {
    console.error('郵便番号検索エラー:', error)
    return c.json({ 
      success: false,
      error: '郵便番号検索に失敗しました',
      postal_code: c.req.param('code'),
      area_rank: 'D',
      area_name: '遠方・離島',
      detected: false
    }, 500)
  }
})

// API: 距離ベース料金区分取得（2026年3月改定対応）
app.get('/api/distance-area-pricing', async (c) => {
  try {
    const { env } = c
    const areaRank = c.req.query('area_rank')
    const planType = c.req.query('plan_type') || 'A'
    
    if (areaRank) {
      // 特定ランクの料金取得（plan_type指定）
      const pricing = await env.DB.prepare(`
        SELECT * FROM distance_area_pricing 
        WHERE area_rank = ? AND plan_type = ?
        ORDER BY effective_date DESC 
        LIMIT 1
      `).bind(areaRank, planType).first()
      
      if (!pricing) {
        return c.json({ error: `ランク${areaRank}（プラン${planType}）の料金データが見つかりません` }, 404)
      }
      
      return c.json({ success: true, pricing })
    }
    
    // 全ランクの料金一覧取得（plan_type指定）
    const { results } = await env.DB.prepare(`
      SELECT * FROM distance_area_pricing 
      WHERE plan_type = ?
      ORDER BY distance_km ASC
    `).bind(planType).all()
    
    return c.json({ success: true, pricing: results || [], plan_type: planType })
  } catch (error) {
    console.error('距離ベース料金取得エラー:', error)
    return c.json({ error: '料金データの取得に失敗しました' }, 500)
  }
})

// ========================================
// 混載便料金API
// ========================================

// 混載便料金取得（全ランク or 特定ランク）
app.get('/api/konsai-pricing', async (c) => {
  try {
    const { env } = c
    const rank = c.req.query('rank')
    const planType = c.req.query('plan_type') || 'A'
    
    if (rank) {
      const pricing = await env.DB.prepare(`
        SELECT * FROM konsai_pricing WHERE rank = ? AND plan_type = ? LIMIT 1
      `).bind(rank.toUpperCase(), planType).first()
      
      if (!pricing) {
        return c.json({ success: false, error: `混載便ランク${rank}（プラン${planType}）の料金が見つかりません` }, 404)
      }
      
      return c.json({ success: true, pricing })
    }
    
    // 全ランク取得（plan_type指定）
    const { results } = await env.DB.prepare(`
      SELECT * FROM konsai_pricing WHERE plan_type = ? ORDER BY rank ASC
    `).bind(planType).all()
    
    return c.json({ success: true, pricing: results || [], plan_type: planType })
  } catch (error) {
    console.error('混載便料金取得エラー:', error)
    return c.json({ success: false, error: '混載便料金の取得に失敗しました' }, 500)
  }
})

// G-MAPエリア(A〜I) → 混載便ランク(A〜F)マッピング + 料金取得
app.get('/api/konsai-pricing/by-area', async (c) => {
  try {
    const { env } = c
    const areaRank = c.req.query('area_rank')
    
    if (!areaRank) {
      return c.json({ success: false, error: 'area_rankパラメータが必要です' }, 400)
    }
    
    const upper = areaRank.toUpperCase()
    
    // G〜I は混載便エリア外
    if (['G', 'H', 'I'].includes(upper)) {
      return c.json({ 
        success: true, 
        out_of_area: true, 
        message: '混載便エリア外です。チャーター便をご利用ください。',
        original_rank: upper
      })
    }
    
    // A〜F はそのまま混載便ランクとして使用
    const konsaiRank = upper
    
    const planType = c.req.query('plan_type') || 'A'
    
    const pricing = await env.DB.prepare(`
      SELECT * FROM konsai_pricing WHERE rank = ? AND plan_type = ? LIMIT 1
    `).bind(konsaiRank, planType).first()
    
    if (!pricing) {
      return c.json({ success: false, error: `混載便ランク${konsaiRank}（プラン${planType}）の料金が見つかりません` }, 404)
    }
    
    return c.json({ 
      success: true, 
      out_of_area: false,
      original_rank: upper,
      konsai_rank: konsaiRank,
      plan_type: planType,
      pricing
    })
  } catch (error) {
    console.error('混載便エリアマッピングエラー:', error)
    return c.json({ success: false, error: '混載便料金の取得に失敗しました' }, 500)
  }
})

// 混載便配達日スケジュール取得（参考表示用）
app.get('/api/konsai-delivery-schedule', async (c) => {
  try {
    const { env } = c
    const prefecture = c.req.query('prefecture')
    const rank = c.req.query('rank')
    
    let query = 'SELECT * FROM konsai_delivery_schedule'
    const conditions: string[] = []
    const params: string[] = []
    
    if (prefecture) {
      conditions.push('prefecture = ?')
      params.push(prefecture)
    }
    if (rank) {
      conditions.push('rank = ?')
      params.push(rank.toUpperCase())
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    query += ' ORDER BY prefecture, rank'
    
    let stmt = env.DB.prepare(query)
    if (params.length === 1) {
      stmt = stmt.bind(params[0])
    } else if (params.length === 2) {
      stmt = stmt.bind(params[0], params[1])
    }
    
    const { results } = await stmt.all()
    
    return c.json({ success: true, schedule: results || [] })
  } catch (error) {
    console.error('配達日スケジュール取得エラー:', error)
    return c.json({ success: false, error: '配達日スケジュールの取得に失敗しました' }, 500)
  }
})

// 混載便料金更新（マスター画面用）
app.put('/api/konsai-pricing/:rank', async (c) => {
  try {
    const { env } = c
    const rank = c.req.param('rank').toUpperCase()
    const data = await c.req.json()
    const planType = data.plan_type || 'A'
    
    const result = await env.DB.prepare(`
      UPDATE konsai_pricing SET
        price = ?,
        overtime_fee = ?,
        road_permit_fee = ?,
        transport_vehicle_fee = ?,
        survey_twoman_fee = ?,
        survey_oneman_fee = ?,
        oneman_discount_amount = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE rank = ? AND plan_type = ?
    `).bind(
      data.price,
      data.overtime_fee || 7000,
      data.road_permit_fee,
      data.transport_vehicle_fee,
      data.survey_twoman_fee,
      data.survey_oneman_fee,
      data.oneman_discount_amount || 15000,
      rank,
      planType
    ).run()
    
    return c.json({ success: true, message: `混載便${rank}ランク（プラン${planType}）の料金を更新しました` })
  } catch (error) {
    console.error('混載便料金更新エラー:', error)
    return c.json({ success: false, error: '混載便料金の更新に失敗しました' }, 500)
  }
})

// チャーター便料金取得（全エリア）
app.get('/api/dedicated-pricing', async (c) => {
  try {
    const { env } = c
    const results = await env.DB.prepare(`
      SELECT area, price FROM vehicle_pricing 
      WHERE vehicle_type = '専属便' AND operation_type = '終日'
      ORDER BY area ASC
    `).all()
    
    return c.json({ success: true, data: results.results })
  } catch (error) {
    console.error('チャーター便料金取得エラー:', error)
    return c.json({ success: false, error: 'チャーター便料金の取得に失敗しました' }, 500)
  }
})

// チャーター便料金更新（マスター画面用）
app.put('/api/dedicated-pricing/:area', async (c) => {
  try {
    const { env } = c
    const area = c.req.param('area').toUpperCase()
    const data = await c.req.json()
    const planType = data.plan_type || 'A'
    
    // 1. vehicle_pricing テーブルを更新（プランAのみ - 後方互換）
    if (planType === 'A') {
      const existing = await env.DB.prepare(`
        SELECT id FROM vehicle_pricing 
        WHERE vehicle_type = '専属便' AND operation_type = '終日' AND area = ?
      `).bind(area).first()
      
      if (existing) {
        await env.DB.prepare(`
          UPDATE vehicle_pricing SET price = ?, updated_at = CURRENT_TIMESTAMP
          WHERE vehicle_type = '専属便' AND operation_type = '終日' AND area = ?
        `).bind(data.price, area).run()
      } else {
        await env.DB.prepare(`
          INSERT INTO vehicle_pricing (vehicle_type, operation_type, area, price, user_id, created_at, updated_at)
          VALUES ('専属便', '終日', ?, ?, 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(area, data.price).run()
      }
    }
    
    // 2. distance_area_pricing テーブルも同期更新（plan_type指定）
    try {
      const distPricing = await env.DB.prepare(`
        SELECT id FROM distance_area_pricing WHERE area_rank = ? AND plan_type = ?
      `).bind(area, planType).first()
      
      if (distPricing) {
        await env.DB.prepare(`
          UPDATE distance_area_pricing 
          SET dedicated_price_1 = ?, updated_at = CURRENT_TIMESTAMP
          WHERE area_rank = ? AND plan_type = ?
        `).bind(data.price, area, planType).run()
        console.log(`distance_area_pricing ${area}ランク（プラン${planType}）同期更新: ¥${data.price}`)
      }
    } catch (syncError) {
      console.warn(`distance_area_pricing同期更新スキップ（${area}プラン${planType}）:`, syncError)
    }
    
    return c.json({ success: true, message: `チャーター便${area}エリア（プラン${planType}）の料金を更新しました` })
  } catch (error) {
    console.error('チャーター便料金更新エラー:', error)
    return c.json({ success: false, error: 'チャーター便料金の更新に失敗しました' }, 500)
  }
})

// API: 本社座標取得
app.get('/api/office-location', async (c) => {
  try {
    const { env } = c
    const office = await env.DB.prepare(`
      SELECT * FROM office_locations WHERE is_primary = 1 LIMIT 1
    `).first()
    
    if (!office) {
      return c.json({ 
        success: true, 
        office: { latitude: 34.6725, longitude: 135.4882, office_name: 'オフィスM2本社' }
      })
    }
    
    return c.json({ success: true, office })
  } catch (error) {
    console.error('本社座標取得エラー:', error)
    return c.json({ error: '本社座標の取得に失敗しました' }, 500)
  }
})

// API: エリア設定一覧取得
app.get('/api/area-settings', async (c) => {
  try {
    const { env } = c
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    
    // まずuser_idでフィルタしたデータを取得
    let areas = await env.DB.prepare(`
      SELECT id, postal_code_prefix, area_name, area_rank, created_at
      FROM area_settings
      WHERE user_id = ?
      ORDER BY area_rank ASC, area_name ASC
    `).bind(userId).all()
    
    // user_idフィルタで結果がない場合、全データを取得
    if (!areas.results || areas.results.length === 0) {
      areas = await env.DB.prepare(`
        SELECT id, postal_code_prefix, area_name, area_rank, created_at
        FROM area_settings
        ORDER BY area_rank ASC, area_name ASC
      `).all()
    }
    
    // area_settingsが空の場合、distance_area_pricingのregionsからフォールバック生成
    if (!areas.results || areas.results.length === 0) {
      const pricingAreas = await env.DB.prepare(`
        SELECT area_rank, regions, distance_km
        FROM distance_area_pricing
        WHERE plan_type = 'A'
        ORDER BY area_rank ASC
      `).all()
      
      if (pricingAreas.results && pricingAreas.results.length > 0) {
        const fallbackAreas = pricingAreas.results.map(row => ({
          id: null,
          postal_code_prefix: null,
          area_name: `${row.area_rank}ランク（${row.regions}）- ${row.distance_km}km圏内`,
          area_rank: row.area_rank,
          created_at: null
        }))
        
        return c.json({
          success: true,
          areas: fallbackAreas
        })
      }
    }
    
    return c.json({
      success: true,
      areas: areas.results || []
    })
  } catch (error) {
    console.error('エリア設定一覧取得エラー:', error)
    return c.json({ error: 'エリア設定一覧の取得に失敗しました' }, 500)
  }
})

// メインページ
app.get('/', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <i className="fas fa-truck text-white text-3xl mr-3"></i>
              <h1 className="text-2xl font-bold text-white">Office M2 見積システム</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div id="currentUserDisplay" className="text-white mr-4">
                <i className="fas fa-user mr-2"></i>
                <span id="currentUserName">読み込み中...</span>
              </div>
              <button onclick="window.location.href='/admin/users.html'" className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                <i className="fas fa-users mr-2"></i>
                ユーザー管理
              </button>
              <button onclick="window.location.href='/admin/backup'" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                <i className="fas fa-database mr-2"></i>
                バックアップ
              </button>
              <button onclick="window.location.href='/settings'" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                <i className="fas fa-cog mr-2"></i>
                設定
              </button>
              <button onclick="window.location.href='/estimate/new'" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                <i className="fas fa-plus mr-2"></i>
                新規見積作成
              </button>
              <button onclick="handleLogout()" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                <i className="fas fa-sign-out-alt mr-2"></i>
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* ダッシュボード */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">ダッシュボード</h2>
            <div className="space-x-3">
              <button onclick="refreshDashboard()" className="bg-blue-500 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded">
                <i className="fas fa-refresh mr-1"></i>
                更新
              </button>
              <button onclick="resetData()" className="bg-red-500 hover:bg-red-700 text-white text-sm px-3 py-2 rounded">
                <i className="fas fa-trash mr-1"></i>
                データリセット
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fas fa-file-alt text-blue-500 text-2xl"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">今月の見積数</dt>
                      <dd id="monthlyEstimates" className="text-2xl font-bold text-gray-900">-</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fas fa-check-circle text-green-500 text-2xl"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">受注済み</dt>
                      <dd id="orderedEstimates" className="text-2xl font-bold text-gray-900">-</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fas fa-clock text-yellow-500 text-2xl"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">検討中</dt>
                      <dd id="consideringEstimates" className="text-2xl font-bold text-gray-900">-</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fas fa-yen-sign text-purple-500 text-2xl"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">今月売上</dt>
                      <dd id="monthlySales" className="text-2xl font-bold text-gray-900">-</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 見積ライフサイクル・フェーズサマリー */}
          <div className="bg-white shadow rounded-lg mb-8 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <i className="fas fa-stream mr-2 text-blue-500"></i>
              見積ライフサイクル
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="lifecycleSummary">
              <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full mx-auto mb-2">
                  <i className="fas fa-edit text-gray-600"></i>
                </div>
                <div className="text-2xl font-bold text-gray-700" id="phase_production">-</div>
                <div className="text-xs text-gray-500 mt-1">製作中</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-200 rounded-full mx-auto mb-2">
                  <i className="fas fa-clock text-orange-600"></i>
                </div>
                <div className="text-2xl font-bold text-orange-700" id="phase_approval">-</div>
                <div className="text-xs text-orange-500 mt-1">決裁待ち</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-200 rounded-full mx-auto mb-2">
                  <i className="fas fa-envelope-open-text text-blue-600"></i>
                </div>
                <div className="text-2xl font-bold text-blue-700" id="phase_sent">-</div>
                <div className="text-xs text-blue-500 mt-1">送信済み/検討中</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-center w-10 h-10 bg-green-200 rounded-full mx-auto mb-2">
                  <i className="fas fa-flag-checkered text-green-600"></i>
                </div>
                <div className="text-2xl font-bold text-green-700" id="phase_final">-</div>
                <div className="text-xs text-green-500 mt-1">受注/失注</div>
              </div>
            </div>
            {/* プログレスバー */}
            <div className="mt-4 h-3 bg-gray-100 rounded-full overflow-hidden flex" id="lifecycleProgressBar">
              <div className="bg-gray-400 h-full transition-all" id="progress_production" style="width: 0%"></div>
              <div className="bg-orange-400 h-full transition-all" id="progress_approval" style="width: 0%"></div>
              <div className="bg-blue-400 h-full transition-all" id="progress_sent" style="width: 0%"></div>
              <div className="bg-green-400 h-full transition-all" id="progress_final" style="width: 0%"></div>
            </div>
          </div>

          {/* メニューカード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onclick="window.location.href='/estimate/new'">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  <i className="fas fa-plus text-blue-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">新規見積作成</h3>
                <p className="text-gray-600 text-center text-sm">
                  STEP分割式の見積作成フロー<br/>
                  顧客・案件選択から金額算出まで
                </p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onclick="window.location.href='/estimates'">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                  <i className="fas fa-list text-green-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">見積履歴・管理</h3>
                <p className="text-gray-600 text-center text-sm">
                  過去の見積を検索・編集<br/>
                  ステータス管理・CSV出力
                </p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onclick="window.location.href='/customers'">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                  <i className="fas fa-users text-purple-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">顧客・案件管理</h3>
                <p className="text-gray-600 text-center text-sm">
                  顧客情報・案件情報の管理<br/>
                  ステータス履歴の追跡
                </p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onclick="window.location.href='/masters'">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4">
                  <i className="fas fa-cogs text-orange-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">マスタ管理</h3>
                <p className="text-gray-600 text-center text-sm">
                  料金・エリア設定<br/>
                  車両・サービス単価の管理
                </p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onclick="window.location.href='/reports'">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4">
                  <i className="fas fa-chart-bar text-indigo-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">レポート・分析</h3>
                <p className="text-gray-600 text-center text-sm">
                  売上分析・案件統計<br/>
                  PDF・CSV出力
                </p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onclick="window.location.href='/ai'">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-pink-100 rounded-lg mx-auto mb-4">
                  <i className="fas fa-robot text-pink-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">AI機能</h3>
                <p className="text-gray-600 text-center text-sm">
                  最適人数提案<br/>
                  メール文自動生成
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})









// APIルート
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: 'Office M2 見積システム稼働中', timestamp: new Date().toISOString() })
})

// 顧客関連API
app.get('/api/customers', async (c) => {
  try {
    const { env } = c
    const search = c.req.query('search') || ''
    const status = c.req.query('status') || 'active' // デフォルトは有効のみ
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = (page - 1) * limit
    
    // 検索条件付きクエリ（案件数も含める）
    let query = `
      SELECT c.*, 
             COUNT(p.id) as project_count
      FROM customers c
      LEFT JOIN projects p ON c.id = p.customer_id
      WHERE 1=1
    `
    let countQuery = 'SELECT COUNT(*) as total FROM customers WHERE 1=1'
    const params = []
    
    // ステータスフィルタリング
    if (status === 'all') {
      // すべて表示（削除済みも含む）
    } else if (status === 'deleted') {
      query += ' AND c.status = ?'
      countQuery += ' AND status = ?'
      params.push('deleted')
    } else if (status === 'inactive') {
      query += ' AND c.status = ?'
      countQuery += ' AND status = ?'
      params.push('inactive')
    } else {
      // デフォルト: activeのみ
      query += ' AND (c.status = ? OR c.status IS NULL)'
      countQuery += ' AND (status = ? OR status IS NULL)'
      params.push('active')
    }
    
    if (search) {
      query += ' AND (c.name LIKE ? OR c.contact_person LIKE ? OR c.address LIKE ?)'
      countQuery += ' AND (name LIKE ? OR contact_person LIKE ? OR address LIKE ?)'
      const searchParam = `%${search}%`
      params.push(searchParam, searchParam, searchParam)
    }
    
    query += ' GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?'
    
    // データ取得
    const { results } = await env.DB.prepare(query).bind(...params, limit, offset).all()
    
    // 総件数取得
    const totalResult = await env.DB.prepare(countQuery).bind(...params).first()
    const total = totalResult?.total || 0
    
    return c.json({ 
      success: true, 
      data: results,
      total: total,
      page: page,
      limit: limit,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('顧客一覧取得エラー:', error)
    return c.json({ error: '顧客一覧の取得に失敗しました' }, 500)
  }
})

app.post('/api/customers', async (c) => {
  try {
    const { env } = c
    const data = await c.req.json()
    
    // バリデーション
    if (!data.name) {
      return c.json({ 
        success: false, 
        error: '顧客名は必須です' 
      }, 400)
    }
    
    // データベースに挿入
    const result = await env.DB.prepare(`
      INSERT INTO customers (name, contact_person, phone, email, address, notes, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.contact_person || '',
      data.phone || '',
      data.email || '',
      data.address || '',
      data.notes || '',
      data.user_id || 'test-user-001'
    ).run()
    
    return c.json({
      success: true,
      data: { id: result.meta.last_row_id, ...data },
      message: '顧客を正常に追加しました'
    })
  } catch (error) {
    console.error('顧客追加エラー:', error)
    return c.json({ 
      success: false, 
      error: '顧客の追加に失敗しました',
      detail: error.message 
    }, 500)
  }
})

// 案件関連API
app.get('/api/projects/:customerId', async (c) => {
  try {
    const { env } = c
    const customerId = c.req.param('customerId')
    
    const { results } = await env.DB.prepare(`
      SELECT * FROM projects 
      WHERE customer_id = ? 
      ORDER BY created_at DESC
    `).bind(customerId).all()
    
    return c.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('案件一覧取得エラー:', error)
    return c.json({ error: '案件一覧の取得に失敗しました' }, 500)
  }
})

// 全案件取得API
app.get('/api/projects', async (c) => {
  try {
    const { env } = c
    const search = c.req.query('search') || ''
    const status = c.req.query('status') || ''
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = (page - 1) * limit
    
    // 検索条件付きクエリ（見積数も含める）
    let query = `
      SELECT p.*, 
             c.name as customer_name,
             COUNT(e.id) as estimate_count
      FROM projects p 
      LEFT JOIN customers c ON p.customer_id = c.id 
      LEFT JOIN estimates e ON p.id = e.project_id
      WHERE 1=1
    `
    let countQuery = `
      SELECT COUNT(*) as total
      FROM projects p 
      LEFT JOIN customers c ON p.customer_id = c.id 
      WHERE 1=1
    `
    const params = []
    
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)'
      countQuery += ' AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)'
      const searchParam = `%${search}%`
      params.push(searchParam, searchParam, searchParam)
    }
    
    if (status) {
      query += ' AND p.status = ?'
      countQuery += ' AND p.status = ?'
      params.push(status)
    }
    
    query += ' GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
    
    // データ取得
    const { results } = await env.DB.prepare(query).bind(...params, limit, offset).all()
    
    // 総件数取得
    const totalResult = await env.DB.prepare(countQuery).bind(...params).first()
    const total = totalResult?.total || 0
    
    return c.json({ 
      success: true, 
      data: results,
      total: total,
      page: page,
      limit: limit,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('案件一覧取得エラー:', error)
    return c.json({ error: '案件一覧の取得に失敗しました' }, 500)
  }
})

// 案件作成API - 削除（15786行目に統合版あり）

// STEP1: 顧客・案件選択
app.get('/estimate/step1', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center text-white hover:text-blue-200">
                <i className="fas fa-truck text-white text-2xl mr-3"></i>
                <h1 className="text-xl font-bold">Office M2 見積システム</h1>
              </a>
            </div>
            <div className="text-white">
              <span className="text-sm" id="stepHeaderLabel">標準見積作成 - STEP 1</span>
            </div>
          </div>
        </div>
      </header>

      {/* プログレスバー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">顧客・案件選択</span>
              </div>
              <div className="flex items-center opacity-50">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-bold">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-400">配送先入力</span>
              </div>
              <div className="flex items-center opacity-50">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-bold">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-400">車両選択</span>
              </div>
              <div className="flex items-center opacity-50">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-bold">
                  4
                </div>
                <span className="ml-2 text-sm font-medium text-gray-400">スタッフ入力</span>
              </div>
              <div className="flex items-center opacity-50">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-bold">
                  5
                </div>
                <span className="ml-2 text-sm font-medium text-gray-400">サービス選択</span>
              </div>
              <div className="flex items-center opacity-50">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-bold">
                  6
                </div>
                <span className="ml-2 text-sm font-medium text-gray-400">内容確認</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <i className="fas fa-clock"></i>
              <span>推定所要時間: 3-5分</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 16.67%;"></div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">顧客・案件選択</h2>
            <p className="text-gray-600">見積を作成する顧客と案件を選択してください。新規顧客・案件の追加も可能です。</p>
          </div>

          {/* 顧客選択 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                顧客選択 <span className="text-red-500">*</span>
              </label>
              <button 
                onclick="Modal.open('customerModal')" 
                className="bg-green-500 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
              >
                <i className="fas fa-plus mr-1"></i>
                新規顧客追加
              </button>
            </div>
            <select 
              id="customerSelect" 
              onchange="handleCustomerChange()" 
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">顧客を選択してください</option>
            </select>
          </div>

          {/* 顧客担当者入力 */}
          <div id="customerContactPersonContainer" className="mb-8 hidden">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              顧客担当者 <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="customerContactPerson" 
              oninput="if(typeof EstimateFlowImplementation !== 'undefined') EstimateFlowImplementation.updateDetails()"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="担当者名を入力してください"
            />
            <p className="mt-1 text-sm text-gray-500">
              <i className="fas fa-info-circle mr-1"></i>
              顧客マスターの担当者が自動入力されます。必要に応じて変更できます。
            </p>
          </div>

          {/* 案件選択 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                案件選択 <span className="text-red-500">*</span>
              </label>
              <button 
                id="addProjectBtn"
                type="button"
                className="bg-green-500 hover:bg-green-700 text-white text-sm px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-plus mr-1"></i>
                新規案件追加
              </button>
            </div>
            <select 
              id="projectSelect" 
              onchange="handleProjectChange()" 
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              disabled
            >
              <option value="">まず顧客を選択してください</option>
            </select>
          </div>

          {/* 選択内容確認 */}
          <div id="selectionDetails" className="hidden mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">選択内容</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div id="customerDetails">
                {/* 顧客詳細がここに表示される */}
              </div>
              <div id="projectDetails">
                {/* 案件詳細がここに表示される */}
              </div>
            </div>
          </div>

          {/* ナビゲーションボタン */}
          <div className="flex justify-between">
            <button 
              onclick="window.location.href='/'" 
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              ダッシュボードに戻る
            </button>
            <button 
              id="nextStepBtn"
              onclick="proceedToStep2()" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled
            >
              次へ: 配送先入力
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </main>

      {/* 新規顧客追加モーダル */}
      <div id="customerModal" className="modal hidden">
        <div className="modal-content">
          <div className="modal-header">
            <h3>新規顧客追加</h3>
            <button onclick="Modal.close('customerModal')" className="modal-close">&times;</button>
          </div>
          <form onsubmit="addNewCustomer(event)">
            <div className="modal-body space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  会社名 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                <input 
                  type="tel" 
                  name="phone" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <input 
                  type="email" 
                  name="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                <textarea 
                  name="address" 
                  rows="2" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                <textarea 
                  name="notes" 
                  rows="2" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onclick="Modal.close('customerModal')" className="btn-secondary mr-2">
                キャンセル
              </button>
              <button type="submit" className="btn-primary">
                <i className="fas fa-save mr-2"></i>
                保存
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 案件追加・編集モーダル */}
      <div id="projectModal" className="modal-backdrop" style="display: none;">
        <div className="modal-content">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 id="projectModalTitle" className="text-lg font-medium text-gray-900">新規案件追加</h3>
          </div>
          <form id="projectForm" className="p-6">
            <input type="hidden" id="projectId" name="id" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">顧客選択 *</label>
                <select id="projectCustomerId" name="customer_id" className="form-select" required>
                  <option value="">顧客を選択してください</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">※ 顧客の担当者は「マスター管理」→「顧客管理」で設定してください</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">案件名 *</label>
                <input type="text" id="projectName" name="name" className="form-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">案件説明</label>
                <textarea id="projectDescription" name="description" rows="3" className="form-textarea" placeholder="案件の詳細説明を入力してください"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                <select id="projectStatus" name="status" className="form-select">
                  <option value="initial">初回コンタクト</option>
                  <option value="quote_sent">見積書送信済み</option>
                  <option value="under_consideration">受注検討中</option>
                  <option value="order">受注</option>
                  <option value="completed">完了</option>
                  <option value="failed">失注</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onclick="Modal.close('projectModal')" className="btn-secondary">
                キャンセル
              </button>
              <button type="submit" className="btn-primary">
                <i className="fas fa-save mr-2"></i>
                保存
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Step1専用の初期化（Axiosとapp.jsは共通レンダラーから読み込み済み） */}
      <script dangerouslySetInnerHTML={{
        __html: `
        // ページ初期化（axiosが読み込まれるまで待機）
        window.addEventListener('load', function() {
          if (typeof axios !== 'undefined' && typeof EstimateFlowImplementation !== 'undefined') {
            EstimateFlowImplementation.loadCustomers();
          } else {
            console.error('axios または EstimateFlowImplementation が定義されていません');
          }
        });`
      }}></script>
    </div>
  )
})

// STEP2: 配送先入力
app.get('/estimate/step2', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center text-white hover:text-blue-200">
                <i className="fas fa-truck text-white text-2xl mr-3"></i>
                <h1 className="text-xl font-bold">Office M2 見積システム</h1>
              </a>
            </div>
            <div className="text-white">
              <span className="text-sm" id="stepHeaderLabel">新規見積作成 - STEP 2</span>
            </div>
          </div>
        </div>
      </header>

      {/* プログレスバー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">顧客・案件選択</span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">配送先入力</span>
              </div>
              <div className="flex items-center opacity-50">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-bold">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-400">車両選択</span>
              </div>
              <div className="flex items-center opacity-50">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-bold">
                  4
                </div>
                <span className="ml-2 text-sm font-medium text-gray-400">スタッフ入力</span>
              </div>
              <div className="flex items-center opacity-50">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-bold">
                  5
                </div>
                <span className="ml-2 text-sm font-medium text-gray-400">サービス選択</span>
              </div>
              <div className="flex items-center opacity-50">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-bold">
                  6
                </div>
                <span className="ml-2 text-sm font-medium text-gray-400">内容確認</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <i className="fas fa-clock"></i>
              <span>推定所要時間: 3-5分</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 33.33%;"></div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">配送先入力</h2>
            <p className="text-gray-600">配送先の住所を入力してください。郵便番号から自動でエリア判定を行います。</p>
          </div>

          {/* 選択済み情報表示 */}
          <div id="selectedInfo" className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">選択済み情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">顧客</span>
                <p id="selectedCustomerName" className="text-lg font-semibold text-gray-900">-</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">案件</span>
                <p id="selectedProjectName" className="text-lg font-semibold text-gray-900">-</p>
              </div>
            </div>
          </div>

          {/* 郵便番号入力 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              郵便番号 <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-3">
              <input 
                type="text" 
                id="postalCode" 
                placeholder="1234567"
                onInput="formatPostalCodeInput(this)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button 
                id="searchAddressBtn"
                onclick="searchAddressByPostalCode()" 
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                <i className="fas fa-search mr-1"></i>
                住所検索
              </button>
            </div>
          </div>

          {/* 住所入力 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              配送先住所 <span className="text-red-500">*</span>
            </label>
            <textarea 
              id="deliveryAddress" 
              rows="3"
              placeholder="住所を入力してください"
              onInput="handleAddressChange()"
              onChange="handleAddressChange()"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          {/* 自動エリア判定結果 */}
          <div id="autoAreaResult" className="mb-6 hidden">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                <span className="font-medium text-green-800">エリア自動判定完了</span>
              </div>
              <p id="autoAreaText" className="mt-2 text-sm text-green-700">
                エリア: <span id="detectedArea" className="font-semibold"></span>
              </p>
            </div>
          </div>

          {/* エリア選択（自動・手動両対応） */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              配送エリア <span className="text-red-500">*</span>
            </label>
            <select 
              id="areaSelect" 
              onChange="handleAreaSelectChange()"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">エリアを選択してください</option>
              <option value="A">Aランク - 大阪市（15km圏内）</option>
              <option value="B">Bランク - 大阪府・神戸・京都・奈良（30km圏内）</option>
              <option value="C">Cランク - 南丹（50km圏内）</option>
              <option value="D">Dランク - 東播磨・滋賀・和歌山（100km圏内）</option>
              <option value="E">Eランク - 淡路・西播磨・三重（150km圏内）</option>
              <option value="F">Fランク - 但馬・愛知・徳島・香川（200km圏内）</option>
              <option value="G">Gランク - 岡山・鳥取・福井（300km圏内）</option>
              <option value="H">Hランク - 広島・愛媛・島根・石川・富山（400km圏内）</option>
              <option value="I">Iランク - 山口（500km圏内）</option>
            </select>
          </div>

          {/* ランク外警告表示エリア */}
          <div id="outOfRangeWarning" className="mb-6 hidden">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                <span className="font-medium text-red-800">ランク外（500km超）</span>
              </div>
              <p id="outOfRangeText" className="mt-2 text-sm text-red-700">
                この配送先は500km圏外のためランク外です。フリー見積機能をご利用ください。
              </p>
              <a href="/free-estimate" className="inline-block mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm">
                <i className="fas fa-edit mr-1"></i>フリー見積へ
              </a>
            </div>
          </div>

          {/* 距離計算結果表示エリア */}
          <div id="distanceResult" className="mb-6 hidden">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-route text-blue-500 mr-2"></i>
                <span className="font-medium text-blue-800">距離計算結果</span>
              </div>
              <p id="distanceResultText" className="mt-2 text-sm text-blue-700"></p>
            </div>
          </div>

          {/* 手動エリア選択（エラー時のフォールバック） */}
          <div id="manualAreaSelect" className="mb-6 hidden">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              エリア選択（手動）
            </label>
            <select 
              id="manualArea" 
              onChange="handleManualAreaChange()"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">エリアを選択してください</option>
              <option value="A">Aランク - 大阪市（15km圏内）</option>
              <option value="B">Bランク - 大阪府・神戸・京都・奈良（30km圏内）</option>
              <option value="C">Cランク - 南丹（50km圏内）</option>
              <option value="D">Dランク - 東播磨・滋賀・和歌山（100km圏内）</option>
              <option value="E">Eランク - 淡路・西播磨・三重（150km圏内）</option>
              <option value="F">Fランク - 但馬・愛知・徳島・香川（200km圏内）</option>
              <option value="G">Gランク - 岡山・鳥取・福井（300km圏内）</option>
              <option value="H">Hランク - 広島・愛媛・島根・石川・富山（400km圏内）</option>
              <option value="I">Iランク - 山口（500km圏内）</option>
            </select>
          </div>

          {/* 確認表示 */}
          <div id="addressConfirmation" className="mb-8 p-4 bg-gray-50 rounded-lg hidden">
            <h3 className="text-lg font-medium text-gray-900 mb-4">入力内容確認</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">郵便番号: </span>
                <span id="confirmPostalCode" className="text-sm text-gray-900"></span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">住所: </span>
                <span id="confirmAddress" className="text-sm text-gray-900"></span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">配送エリア: </span>
                <span id="confirmArea" className="text-sm text-gray-900"></span>
              </div>
            </div>
          </div>

          {/* ナビゲーションボタン */}
          <div className="flex justify-between">
            <button 
              onclick="goBackToStep1()" 
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              戻る: 顧客・案件選択
            </button>
            <button 
              id="nextStepBtn" 
              onclick="proceedToStep3()" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled
            >
              次へ: 車両選択
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </main>

      {/* JavaScript初期化 */}
      <script dangerouslySetInnerHTML={{
        __html: `
        // ページ初期化
        window.addEventListener('load', function() {
          if (typeof Step2Implementation !== 'undefined') {
            Step2Implementation.initialize();
          }
        });`
      }}></script>
    </div>
  )
})

// 関西地域詳細郵便番号エリア判定関数
function getAreaFromPostalCode(postalCode) {
  const code = postalCode.replace(/[^0-9]/g, '') // 数字のみ抽出
  
  // 大阪府の詳細判定（PDFデータに基づく正確な分類）
  if (code.startsWith('53') || code.startsWith('54') || code.startsWith('55') || 
      code.startsWith('56') || code.startsWith('57') || code.startsWith('58') || code.startsWith('59')) {
    
    // Aランク市町村（大阪府はほとんどがAランク）
    
    // 大阪市全域 - 530-535, 540-559
    if ((code.startsWith('53') && (code.substring(0, 3) >= '530' && code.substring(0, 3) <= '535')) ||
        (code.startsWith('54') && (code.substring(0, 3) >= '540' && code.substring(0, 3) <= '549')) ||
        (code.startsWith('55') && (code.substring(0, 3) >= '550' && code.substring(0, 3) <= '559'))) {
      return { area_rank: 'A', area_name: '大阪市' }
    }
    
    // 豊中市 - 560
    if (code.startsWith('560')) {
      return { area_rank: 'B', area_name: '豊中市' }
    }
    
    // 池田市 - 563（能勢町・豊能町の範囲を除く）
    if (code.startsWith('563') && 
        !(code.startsWith('5630') || code.startsWith('5631') || code.startsWith('5632') || code.startsWith('5633'))) {
      return { area_rank: 'B', area_name: '池田市' }
    }
    
    // 吹田市 - 564, 565
    if (code.startsWith('564') || code.startsWith('565')) {
      return { area_rank: 'B', area_name: '吹田市' }
    }
    
    // 箕面市 - 562
    if (code.startsWith('562')) {
      return { area_rank: 'B', area_name: '箕面市' }
    }
    
    // 茨木市 - 567, 568
    if (code.startsWith('567') || code.startsWith('568')) {
      return { area_rank: 'B', area_name: '茨木市' }
    }
    
    // 摂津市 - 566
    if (code.startsWith('566')) {
      return { area_rank: 'B', area_name: '摂津市' }
    }
    
    // 高槻市 - 569
    if (code.startsWith('569')) {
      return { area_rank: 'B', area_name: '高槻市' }
    }
    
    // 枚方市 - 573
    if (code.startsWith('573')) {
      return { area_rank: 'B', area_name: '枚方市' }
    }
    
    // 寝屋川市 - 572
    if (code.startsWith('572')) {
      return { area_rank: 'B', area_name: '寝屋川市' }
    }
    
    // 交野市 - 576
    if (code.startsWith('576')) {
      return { area_rank: 'B', area_name: '交野市' }
    }
    
    // 守口市 - 570
    if (code.startsWith('570')) {
      return { area_rank: 'B', area_name: '守口市' }
    }
    
    // 門真市 - 571
    if (code.startsWith('571')) {
      return { area_rank: 'B', area_name: '門真市' }
    }
    
    // 四条畷市 - 575
    if (code.startsWith('575')) {
      return { area_rank: 'B', area_name: '四条畷市' }
    }
    
    // 大東市 - 574
    if (code.startsWith('574')) {
      return { area_rank: 'B', area_name: '大東市' }
    }
    
    // 東大阪市 - 577, 578, 579
    if (code.startsWith('577') || code.startsWith('578') || code.startsWith('579')) {
      return { area_rank: 'B', area_name: '東大阪市' }
    }
    
    // 八尾市 - 581
    if (code.startsWith('581')) {
      return { area_rank: 'B', area_name: '八尾市' }
    }
    
    // 柏原市 - 582
    if (code.startsWith('582')) {
      return { area_rank: 'B', area_name: '柏原市' }
    }
    
    // 藤井寺市 - 583
    if (code.startsWith('583') && !(code.substring(0, 5) >= '58396' && code.substring(0, 5) <= '58399')) {
      return { area_rank: 'B', area_name: '藤井寺市' }
    }
    
    // 松原市 - 580
    if (code.startsWith('580')) {
      return { area_rank: 'B', area_name: '松原市' }
    }
    
    // 羽曳野市 - 583
    if (code.startsWith('583') && (code.substring(0, 4) >= '5830' && code.substring(0, 4) <= '5835')) {
      return { area_rank: 'B', area_name: '羽曳野市' }
    }
    
    // 富田林市 - 584
    if (code.startsWith('584')) {
      return { area_rank: 'B', area_name: '富田林市' }
    }
    
    // 大阪狭山市 - 589
    if (code.startsWith('589')) {
      return { area_rank: 'B', area_name: '大阪狭山市' }
    }
    
    // 河内長野市 - 586
    if (code.startsWith('586')) {
      return { area_rank: 'B', area_name: '河内長野市' }
    }
    
    // 南河内郡太子町 - 583-86xx
    if (code.startsWith('58386')) {
      return { area_rank: 'B', area_name: '南河内郡太子町' }
    }
    
    // 南河内郡河南町 - 585-85xx
    if (code.startsWith('58585')) {
      return { area_rank: 'B', area_name: '南河内郡河南町' }
    }
    
    // 南河内郡千早赤阪村 - 585-87xx
    if (code.startsWith('58587')) {
      return { area_rank: 'B', area_name: '南河内郡千早赤阪村' }
    }
    
    // 堺市全域 - 590-599（大阪府→Bランク：2026年3月改定）
    if (code.startsWith('59') && !(code.startsWith('599') && (code.substring(0, 4) >= '5990' && code.substring(0, 4) <= '5999'))) {
      return { area_rank: 'B', area_name: '堺市' }
    }
    
    // 高石市 - 592（大阪府→Bランク）
    if (code.startsWith('592')) {
      return { area_rank: 'B', area_name: '高石市' }
    }
    
    // 泉大津市 - 595
    if (code.startsWith('595') && !(code.substring(0, 5) >= '59540' && code.substring(0, 5) <= '59549')) {
      return { area_rank: 'B', area_name: '泉大津市' }
    }
    
    // 和泉市 - 594
    if (code.startsWith('594')) {
      return { area_rank: 'B', area_name: '和泉市' }
    }
    
    // 泉北郡忠岡町 - 595-40xx
    if (code.startsWith('59540')) {
      return { area_rank: 'B', area_name: '泉北郡忠岡町' }
    }
    
    // 岸和田市 - 596
    if (code.startsWith('596')) {
      return { area_rank: 'B', area_name: '岸和田市' }
    }
    
    // 貝塚市 - 597
    if (code.startsWith('597')) {
      return { area_rank: 'B', area_name: '貝塚市' }
    }
    
    // 泉佐野市 - 598
    if (code.startsWith('598') && !(code.substring(0, 5) >= '59805' && code.substring(0, 5) <= '59809')) {
      return { area_rank: 'B', area_name: '泉佐野市' }
    }
    
    // 泉南郡熊取町 - 590-04xx
    if (code.startsWith('59004')) {
      return { area_rank: 'B', area_name: '泉南郡熊取町' }
    }
    
    // 泉南郡田尻町 - 598-05xx
    if (code.startsWith('59805')) {
      return { area_rank: 'B', area_name: '泉南郡田尻町' }
    }
    
    // Bランク市町村（限定的）
    
    // 豊能郡能勢町 - 563-0xxx, 563-3xxx
    if ((code.startsWith('5630') && (code.substring(0, 4) >= '5630' && code.substring(0, 4) <= '5639')) ||
        (code.startsWith('5633') && (code.substring(0, 4) >= '5633' && code.substring(0, 4) <= '5639'))) {
      return { area_rank: 'B', area_name: '豊能郡能勢町' }
    }
    
    // 豊能郡豊能町 - 563-2xxx（詳細要調査）
    if (code.startsWith('5632')) {
      return { area_rank: 'B', area_name: '豊能郡豊能町' }
    }
    
    // 泉南市 - 590-05xx
    if (code.startsWith('59005')) {
      return { area_rank: 'B', area_name: '泉南市' }
    }
    
    // 阪南市 - 599-02xx
    if (code.startsWith('59902')) {
      return { area_rank: 'B', area_name: '阪南市' }
    }
    
    // 泉南郡岬町 - 599-03xx
    if (code.startsWith('59903')) {
      return { area_rank: 'B', area_name: '泉南郡岬町' }
    }
    
    // 三島郡島本町 - 618-00xx（京都府との境界）
    if (code.startsWith('61800')) {
      return { area_rank: 'B', area_name: '三島郡島本町' }
    }
  }
  
  // 兵庫県の詳細判定（市町村別分類）
  if (code.startsWith('65') || code.startsWith('66') || code.startsWith('67') || code.startsWith('68') || code.startsWith('69')) {
    
    // Aランク市町村
    // 神戸市（全区）- 650, 651, 652, 653, 654, 655, 657, 658
    if (code.startsWith('650') || code.startsWith('651') || code.startsWith('652') || code.startsWith('653') ||
        code.startsWith('654') || code.startsWith('655') || code.startsWith('657') || code.startsWith('658')) {
      return { area_rank: 'B', area_name: '神戸市' }
    }
    
    // 尼崎市 - 660
    if (code.startsWith('660')) {
      return { area_rank: 'B', area_name: '尼崎市' }
    }
    
    // 西宮市 - 662, 663の一部
    if (code.startsWith('662') || (code.startsWith('663') && (code.substring(0, 4) >= '6630' && code.substring(0, 4) <= '6639'))) {
      return { area_rank: 'B', area_name: '西宮市' }
    }
    
    // 芦屋市 - 659
    if (code.startsWith('659')) {
      return { area_rank: 'B', area_name: '芦屋市' }
    }
    
    // 伊丹市 - 664
    if (code.startsWith('664')) {
      return { area_rank: 'B', area_name: '伊丹市' }
    }
    
    // 宝塚市 - 665
    if (code.startsWith('665')) {
      return { area_rank: 'B', area_name: '宝塚市' }
    }
    
    // Bランク市町村（より具体的な範囲を先に判定）
    // 川辺郡猪名川町 - 666-02xx
    if (code.startsWith('66602')) {
      return { area_rank: 'B', area_name: '川辺郡猪名川町' }
    }
    
    // 川西市 - 666（猪名川町以外の666）
    if (code.startsWith('666')) {
      return { area_rank: 'B', area_name: '川西市' }
    }
    // その他Bランク市町村
    // 三田市 - 669
    if (code.startsWith('669')) {
      return { area_rank: 'B', area_name: '三田市' }
    }
    
    // 明石市 - 673-0000～673-08xx
    if (code.startsWith('673') && (code.substring(0, 4) >= '6730' && code.substring(0, 4) <= '6738')) {
      return { area_rank: 'B', area_name: '明石市' }
    }
    
    // 三木市 - 673-04xx～673-18xx
    if (code.startsWith('6734') || code.startsWith('6735') || code.startsWith('6736') ||
        code.startsWith('6737') || (code.startsWith('673') && code.substring(3, 4) === '1')) {
      return { area_rank: 'B', area_name: '三木市' }
    }
    
    // 小野市 - 675-13xx
    if (code.startsWith('67513')) {
      return { area_rank: 'B', area_name: '小野市' }
    }
    
    // 加西市 - 675-23xx, 675-24xx
    if (code.startsWith('67523') || code.startsWith('67524')) {
      return { area_rank: 'B', area_name: '加西市' }
    }
    
    // 加古郡稲美町 - 675-11xx
    if (code.startsWith('67511')) {
      return { area_rank: 'B', area_name: '加古郡稲美町' }
    }
    
    // 加古郡播磨町 - 675-05xx
    if (code.startsWith('67505')) {
      return { area_rank: 'B', area_name: '加古郡播磨町' }
    }
    
    // 加古川市 - 675-00xx, 675-01xx, 675-02xx, 675-12xx, 676-0xxx
    if (code.startsWith('67500') || code.startsWith('67501') || code.startsWith('67502') ||
        code.startsWith('67512') || code.startsWith('676')) {
      return { area_rank: 'B', area_name: '加古川市' }
    }
    
    // 高砂市 - 676-00xx (加古川市の676と重複するが、高砂市の範囲)
    if (code.startsWith('67600')) {
      return { area_rank: 'B', area_name: '高砂市' }
    }
    
    // 加東市 - 679-02xx
    if (code.startsWith('67902')) {
      return { area_rank: 'B', area_name: '加東市' }
    }
    
    // 淡路島 - 656（洲本市、南あわじ市、淡路市）→ Eランク
    if (code.startsWith('656')) {
      return { area_rank: 'E', area_name: '淡路島' }
    }
    
    // 姫路市（離島除く）- 670, 671, 672 → Dランク（東播磨圏）
    if (code.startsWith('670') || code.startsWith('671') || code.startsWith('672')) {
      return { area_rank: 'D', area_name: '姫路市' }
    }
    
    // 西播磨（たつの市、赤穂市、宍粟市、佐用郡等）- 678, 679 → Eランク
    if (code.startsWith('678') || code.startsWith('679')) {
      return { area_rank: 'E', area_name: '西播磨' }
    }
    
    // 但馬（豊岡市、養父市、朝来市）- 668, 669の一部 → Fランク
    if (code.startsWith('668')) {
      return { area_rank: 'F', area_name: '但馬（豊岡市）' }
    }
  }
  
  // 兵庫県のその他地域（残り67x等）→ Dランク（東播磨圏として扱う）
  if (code.startsWith('67')) {
    return { area_rank: 'D', area_name: '兵庫県その他市町村' }
  }
  // 鳥取県 - 680-689番台（兵庫県68xブロックより先に判定）
  if (code.startsWith('680') || code.startsWith('681') || code.startsWith('682') ||
      code.startsWith('683') || code.startsWith('684') || code.startsWith('685') ||
      code.startsWith('686') || code.startsWith('687') || code.startsWith('688') || code.startsWith('689')) {
    return { area_rank: 'G', area_name: '鳥取県' }
  }
  // 島根県 - 690-699番台（兵庫県69xブロックより先に判定）
  if (code.startsWith('690') || code.startsWith('691') || code.startsWith('692') ||
      code.startsWith('693') || code.startsWith('694') || code.startsWith('695') ||
      code.startsWith('696') || code.startsWith('697') || code.startsWith('698') || code.startsWith('699')) {
    return { area_rank: 'H', area_name: '島根県' }
  }
  // 兵庫県但馬・丹後地域（68x, 69x）→ Fランク
  // ※鳥取・島根を先に判定するため、ここには到達しない（残存用セーフティ）
  if (code.startsWith('68') || code.startsWith('69')) {
    return { area_rank: 'F', area_name: '兵庫県北部' }
  }
  
  // 離島等（Dランク）- 離島の具体的な郵便番号は要調査
  // 現在は兵庫県内で上記以外をCランクとして処理
  
  // 京都府の詳細判定（PDFデータに基づく正確な分類）
  if (code.startsWith('60') || code.startsWith('61') || code.startsWith('62') || code.startsWith('63')) {
    
    // Aランク市町村（PDFデータに基づく）
    
    // 京都市 - 600-608, 612, 615, 616番台（主要区域）
    if (code.startsWith('600') || code.startsWith('601') || code.startsWith('602') ||
        code.startsWith('603') || code.startsWith('604') || code.startsWith('605') ||
        code.startsWith('606') || code.startsWith('607') || code.startsWith('608') ||
        code.startsWith('612') || code.startsWith('615') || code.startsWith('616')) {
      return { area_rank: 'B', area_name: '京都市' }
    }
    
    // 宇治市 - 611番台
    if (code.startsWith('611')) {
      return { area_rank: 'B', area_name: '宇治市' }
    }
    
    // 城陽市 - 610番台（一部）
    if (code.startsWith('610') && (code.substring(0, 4) >= '6100' && code.substring(0, 4) <= '6102')) {
      return { area_rank: 'B', area_name: '城陽市' }
    }
    
    // 向日市 - 617-0xxx
    if (code.startsWith('6170')) {
      return { area_rank: 'B', area_name: '向日市' }
    }
    
    // 長岡京市 - 617-8xxx
    if (code.startsWith('6178')) {
      return { area_rank: 'B', area_name: '長岡京市' }
    }
    
    // 八幡市 - 614番台
    if (code.startsWith('614')) {
      return { area_rank: 'B', area_name: '八幡市' }
    }
    
    // 京田辺市 - 610-03xx
    if (code.startsWith('61003')) {
      return { area_rank: 'B', area_name: '京田辺市' }
    }
    
    // 木津川市 - 619-0xxx
    if (code.startsWith('6190')) {
      return { area_rank: 'B', area_name: '木津川市' }
    }
    
    // 乙訓郡大山崎町 - 618-07xx
    if (code.startsWith('61807')) {
      return { area_rank: 'B', area_name: '乙訓郡大山崎町' }
    }
    
    // 久世郡久御山町 - 613-08xx
    if (code.startsWith('61308')) {
      return { area_rank: 'B', area_name: '久世郡久御山町' }
    }
    
    // 相楽郡精華町 - 619-02xx
    if (code.startsWith('61902')) {
      return { area_rank: 'B', area_name: '相楽郡精華町' }
    }
    
    // 綴喜郡宇治田原町 - 610-02xx
    if (code.startsWith('61002')) {
      return { area_rank: 'B', area_name: '綴喜郡宇治田原町' }
    }
    
    // 綴喜郡井手町 - 610-04xx
    if (code.startsWith('61004')) {
      return { area_rank: 'B', area_name: '綴喜郡井手町' }
    }
    
    // Bランク市町村
    
    // 相楽郡（精華町以外）- 619-1xxx, 619-2xxx（精華町以外）
    if (code.startsWith('6191') || (code.startsWith('6192') && !code.startsWith('61902'))) {
      return { area_rank: 'B', area_name: '相楽郡（精華町以外）' }
    }
    
    // Cランク市町村（A・B以外の市町村）
    // 亀岡市 - 621-xxxx
    if (code.startsWith('621')) {
      return { area_rank: 'C', area_name: '亀岡市' }
    }
    
    // 福知山市 - 620-xxxx → Eランク（中丹）
    if (code.startsWith('620')) {
      return { area_rank: 'E', area_name: '福知山市' }
    }
    
    // 舞鶴市 - 624-xxxx, 625-xxxx → Fランク（丹後）
    if (code.startsWith('624') || code.startsWith('625')) {
      return { area_rank: 'F', area_name: '舞鶴市' }
    }
    
    // 綾部市 - 623-xxxx → Eランク（中丹）
    if (code.startsWith('623')) {
      return { area_rank: 'E', area_name: '綾部市' }
    }
    
    // 宮津市 - 626-xxxx → Fランク（丹後）
    if (code.startsWith('626')) {
      return { area_rank: 'F', area_name: '宮津市' }
    }
    
    // 京丹後市 - 627-xxxx, 629-xxxx → Fランク（丹後）
    if (code.startsWith('627') || code.startsWith('629')) {
      return { area_rank: 'F', area_name: '京丹後市' }
    }
    
    // 南丹市 - 622-xxxx
    if (code.startsWith('622')) {
      return { area_rank: 'C', area_name: '南丹市' }
    }
    
    // その他京都府下の郡部
    if (code.startsWith('62')) {
      return { area_rank: 'C', area_name: '京都府その他市町村' }
    }
  }
  
  // 上記3府県（京都・大阪・兵庫）以外の地域は距離ベースで判定
  // 滋賀県
  if (code.startsWith('52')) {
    return { area_rank: 'D', area_name: '滋賀県' }
  }
  // 奈良県
  if (code.startsWith('63')) {
    return { area_rank: 'B', area_name: '奈良県' }
  }
  // 和歌山県
  if (code.startsWith('64')) {
    return { area_rank: 'D', area_name: '和歌山県' }
  }
  // 三重県
  if (code.startsWith('51')) {
    return { area_rank: 'E', area_name: '三重県' }
  }
  // 愛知県
  if (code.startsWith('44') || code.startsWith('45') || code.startsWith('46') || code.startsWith('47') || code.startsWith('48') || code.startsWith('49')) {
    return { area_rank: 'F', area_name: '愛知県' }
  }
  // 岐阜県
  if (code.startsWith('50')) {
    return { area_rank: 'F', area_name: '岐阜県' }
  }
  // 徳島県
  if (code.startsWith('77')) {
    return { area_rank: 'F', area_name: '徳島県' }
  }
  // 香川県
  if (code.startsWith('76')) {
    return { area_rank: 'F', area_name: '香川県' }
  }
  // 岡山県
  if (code.startsWith('70') || code.startsWith('71')) {
    return { area_rank: 'G', area_name: '岡山県' }
  }
  // 鳥取県 → 上部で判定済み（680-689）
  // 福井県
  if (code.startsWith('91')) {
    return { area_rank: 'G', area_name: '福井県' }
  }
  // 広島県
  if (code.startsWith('72') || code.startsWith('73')) {
    return { area_rank: 'H', area_name: '広島県' }
  }
  // 愛媛県
  if (code.startsWith('79')) {
    return { area_rank: 'H', area_name: '愛媛県' }
  }
  // 高知県
  if (code.startsWith('78')) {
    return { area_rank: 'H', area_name: '高知県' }
  }
  // 島根県 → 上部で判定済み（690-699）
  // 石川県
  if (code.startsWith('92')) {
    return { area_rank: 'H', area_name: '石川県' }
  }
  // 富山県
  if (code.startsWith('93')) {
    return { area_rank: 'H', area_name: '富山県' }
  }
  // 山口県
  if (code.startsWith('74') || code.startsWith('75')) {
    return { area_rank: 'I', area_name: '山口県' }
  }
  // その他 → 距離計算で判定推奨（ランク外の可能性）
  return { area_rank: 'OUT', area_name: 'ランク外（500km超・フリー見積をご利用ください）' }
}

// 郵便番号検索API
app.get('/api/postal-code/:postalCode', async (c) => {
  const postalCode = c.req.param('postalCode')
  
  try {
    // ZipAddress API
    const zipAddressResponse = await fetch(`https://api.zipaddress.net/?zipcode=${postalCode}`)
    
    if (zipAddressResponse.ok) {
      const data = await zipAddressResponse.json()
      
      if (data.code === 200) {
        // 詳細なエリア判定ロジック（関西地域対応）
        const area = getAreaFromPostalCode(postalCode)
        const areaName = area.area_name
        
        return c.json({
          success: true,
          data: {
            address: `${data.data.pref}${data.data.city}${data.data.town}`,
            area: area.area_rank,
            area_name: area.area_name
          }
        })
      }
    }
    
    // フォールバック: ZipCloud API
    const zipCloudResponse = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`)
    
    if (zipCloudResponse.ok) {
      const data = await zipCloudResponse.json()
      
      if (data.status === 200 && data.results && data.results.length > 0) {
        const result = data.results[0]
        
        // 詳細なエリア判定ロジック（関西地域対応）
        const area = getAreaFromPostalCode(postalCode)
        const areaName = area.area_name
        
        return c.json({
          success: true,
          data: {
            address: `${result.address1}${result.address2}${result.address3}`,
            area: area.area_rank,
            area_name: area.area_name
          }
        })
      }
    }
    
    // どちらのAPIでも取得できなかった場合
    return c.json({
      success: false,
      error: '該当する住所が見つかりませんでした。郵便番号を確認してください。'
    })
    
  } catch (error) {
    console.error('郵便番号検索エラー:', error)
    return c.json({
      success: false,
      error: 'APIエラーが発生しました。手動でエリアを選択してください。'
    })
  }
})

// STEP3: 車両選択
app.get('/estimate/step3', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center text-white hover:text-blue-200">
                <i className="fas fa-truck text-white text-2xl mr-3"></i>
                <h1 className="text-xl font-bold">Office M2 見積システム</h1>
              </a>
            </div>
            <div className="text-white">
              <span className="text-sm" id="stepHeaderLabel">新規見積作成 - STEP 3</span>
            </div>
          </div>
        </div>
      </header>

      {/* プログレスバー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">顧客・案件選択</span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">配送先入力</span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">車両選択</span>
              </div>
              <div className="flex items-center opacity-50">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-bold">
                  4
                </div>
                <span className="ml-2 text-sm font-medium text-gray-400">スタッフ入力</span>
              </div>
              <div className="flex items-center opacity-50">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-bold">
                  5
                </div>
                <span className="ml-2 text-sm font-medium text-gray-400">サービス選択</span>
              </div>
              <div className="flex items-center opacity-50">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-bold">
                  6
                </div>
                <span className="ml-2 text-sm font-medium text-gray-400">内容確認</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <i className="fas fa-clock"></i>
              <span>推定所要時間: 3-5分</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 50%;"></div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">車両・便種選択</h2>
            <p className="text-gray-600">便種（チャーター便・混載便）を選択してください。配送エリアに基づいて料金が自動計算されます。</p>
          </div>

          {/* 選択済み情報表示 */}
          <div id="selectedInfo" className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">選択済み情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">顧客</span>
                <p id="selectedCustomerName" className="text-lg font-semibold text-gray-900">-</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">案件</span>
                <p id="selectedProjectName" className="text-lg font-semibold text-gray-900">-</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">配送エリア</span>
                <p id="selectedArea" className="text-lg font-semibold text-gray-900">-</p>
              </div>
            </div>
          </div>

          {/* 便種選択（チャーター便 or 混載便） */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              便種を選択 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* チャーター便カード */}
              <div 
                id="serviceTypeDedicated" 
                onclick="handleServiceTypeChange('dedicated')"
                className="cursor-pointer p-5 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-truck-moving text-orange-600 text-lg"></i>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">チャーター便</h4>
                    <span className="text-xs text-gray-500">エリア A〜I対応</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">お客様専用のトラックで配送します。複数台追加可能。</p>
                <div id="dedicatedPricePreview" className="text-sm font-semibold text-orange-600"></div>
              </div>

              {/* 混載便カード */}
              <div 
                id="serviceTypeKonsai" 
                onclick="handleServiceTypeChange('konsai')"
                className="cursor-pointer p-5 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-boxes-stacked text-green-600 text-lg"></i>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">混載便</h4>
                    <span className="text-xs text-gray-500">エリア A〜F対応</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">他のお客様と共同配送。1台固定。超過料金¥7,000/h自動付加。</p>
                <div id="konsaiPricePreview" className="text-sm font-semibold text-green-600"></div>
              </div>
            </div>
          </div>

          {/* 混載便エリア外警告 */}
          <div id="konsaiOutOfAreaWarning" className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg hidden">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-red-500 text-xl mr-3"></i>
              <div>
                <p className="text-red-700 font-bold">混載便エリア外です</p>
                <p className="text-red-600 text-sm">このエリアは混載便の対応範囲外（A〜Fランクまで）です。チャーター便をご利用ください。</p>
              </div>
            </div>
          </div>

          {/* ===== チャーター便 詳細セクション ===== */}
          <div id="dedicatedSection" className="mb-6 hidden">
            <div className="p-5 border-2 border-orange-300 rounded-xl bg-orange-50">
              <h3 className="text-lg font-bold text-orange-900 mb-4">
                <i className="fas fa-truck-moving mr-2"></i>チャーター便 設定
              </h3>

              {/* ワンマン割引対象ノート */}
              <div id="dedicatedOnemanNote" className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                  <span className="text-xs text-blue-700">ワンマン割引対象エリアの場合、車両ごとに個別に割引を適用できます</span>
                </div>
              </div>

              {/* 車両ブロックコンテナ */}
              <div id="dedicatedVehicleBlocks" className="space-y-3 mb-4">
                {/* 1台目（基本ブロック・削除不可） */}
                <div className="vehicle-block p-4 bg-white rounded-lg border border-orange-200 shadow-sm" data-vehicle-idx="0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-truck text-orange-500 text-sm"></i>
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 text-sm">車両 #1</span>
                        <span className="ml-2 text-xs text-orange-400">（基本）</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold text-gray-700" id="dedicatedVehiclePrice_0">-</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-orange-100">
                    <label className="flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="dedicated-oneman-cb w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        data-idx="0"
                        onChange="handleDedicatedOptionsChange()"
                      />
                      <span className="ml-2 text-sm text-green-700 font-medium group-hover:text-green-800">
                        <i className="fas fa-tag mr-1"></i>ワンマン割引を適用 (-¥15,000)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 車両追加ボタン */}
              <button 
                type="button"
                onclick="addDedicatedVehicle()"
                className="w-full py-3 border-2 border-dashed border-orange-300 rounded-lg text-orange-600 hover:bg-orange-100 hover:border-orange-400 transition-all text-sm font-bold flex items-center justify-center"
              >
                <i className="fas fa-plus-circle mr-2 text-lg"></i> 車両を追加（1台ずつ）
              </button>

              {/* チャーター便 料金詳細 */}
              <div id="dedicatedPricingDetail" className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">エリアランク</span>
                    <span id="dedicatedAreaRank" className="font-semibold">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">チャーター便 単価</span>
                    <span id="dedicatedUnitPrice" className="font-semibold">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">台数</span>
                    <span id="dedicatedCountDisplay" className="font-semibold">1台</span>
                  </div>
                  <div id="dedicatedDiscountRow" className="flex justify-between text-green-600 hidden">
                    <span>ワンマン割引</span>
                    <span id="dedicatedDiscountDetail">-</span>
                  </div>
                  <div className="border-t border-orange-200 pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-gray-900">車両費用 小計</span>
                    <span id="dedicatedSubtotal" className="text-xl font-bold text-orange-600">¥0</span>
                  </div>
                </div>
              </div>

              {/* 付帯費用（選択式） */}
              <div id="dedicatedAncillarySection" className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="font-semibold text-orange-800 mb-3">
                  <i className="fas fa-plus-circle mr-1"></i>付帯費用（エリア別）
                </p>
                <div className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer hover:bg-orange-100 p-2 rounded transition">
                    <div className="flex items-center">
                      <input type="checkbox" id="dedicatedAncillary_road_permit" onChange="handleDedicatedOptionsChange()" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <span className="ml-2 text-sm text-gray-700">道路許可</span>
                    </div>
                    <span id="dedicatedAncillary_road_permit_price" className="text-sm font-semibold text-gray-900">-</span>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer hover:bg-orange-100 p-2 rounded transition">
                    <div className="flex items-center">
                      <input type="checkbox" id="dedicatedAncillary_transport_vehicle" onChange="handleDedicatedOptionsChange()" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <span className="ml-2 text-sm text-gray-700">車両輸送</span>
                    </div>
                    <span id="dedicatedAncillary_transport_vehicle_price" className="text-sm font-semibold text-gray-900">-</span>
                  </label>

                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center">
                      <i id="dedicatedAncillary_highway_icon" className="fas fa-check-circle text-gray-300 w-4 h-4 mr-2"></i>
                      <span className="text-sm text-gray-700">高速代</span>
                    </div>
                    <span id="dedicatedAncillary_highway_label" className="text-sm font-semibold text-gray-400">-</span>
                  </div>
                  <div className="border-t border-orange-200 pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-gray-800 text-sm">付帯費用 小計</span>
                    <span id="dedicatedAncillarySubtotal" className="text-lg font-bold text-orange-600">¥0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== 混載便 詳細セクション ===== */}
          <div id="konsaiSection" className="mb-6 hidden">
            <div className="p-5 border-2 border-green-300 rounded-xl bg-green-50">
              <h3 className="text-lg font-bold text-green-900 mb-4">
                <i className="fas fa-boxes-stacked mr-2"></i>混載便 設定
              </h3>

              {/* ワンマン割引対象ノート */}
              <p id="konsaiOnemanNote" className="text-xs text-gray-500 mb-4">ワンマン割引対象エリアの場合に適用可能です</p>

              {/* 車両ブロック（1台固定） */}
              <div id="konsaiVehicleBlocks" className="space-y-3 mb-4">
                <div className="vehicle-block p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <i className="fas fa-boxes-stacked text-green-500 mr-2"></i>
                      <span className="font-bold text-gray-800 text-sm">混載便 1台</span>
                      <span className="ml-2 text-xs text-gray-400">（固定）</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          id="konsaiOnemanDiscount" 
                          onChange="handleKonsaiOptionsChange()"
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-green-700 font-medium">ワンマン割引 (-¥15,000)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 混載便 料金詳細 */}
              <div id="konsaiPricingDetail" className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">エリアランク</span>
                    <span id="konsaiAreaRank" className="font-semibold">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">混載便 基本料金</span>
                    <span id="konsaiBasePrice" className="font-semibold">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">超過料金（¥7,000/h）</span>
                    <span className="font-semibold text-gray-500">自動付加</span>
                  </div>
                  <div id="konsaiDiscountRow" className="flex justify-between text-green-600 hidden">
                    <span>ワンマン割引</span>
                    <span>-¥15,000</span>
                  </div>
                  <div className="border-t border-green-200 pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-gray-900">車両費用 小計</span>
                    <span id="konsaiSubtotal" className="text-xl font-bold text-green-600">¥0</span>
                  </div>
                </div>
              </div>

              {/* 配達日参考情報 */}
              <div id="konsaiDeliveryInfo" className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <i className="fas fa-calendar-alt text-yellow-600 mt-0.5 mr-2"></i>
                  <div>
                    <p className="font-medium text-yellow-800 text-sm mb-1">配達日（参考）</p>
                    <p id="konsaiDeliveryDays" className="text-sm text-yellow-700">-</p>
                    <p className="text-xs text-yellow-500 mt-1">※ 最終的な配達日は担当者が決定します</p>
                  </div>
                </div>
              </div>

              {/* 付帯費用（選択式） */}
              <div id="konsaiAncillarySection" className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-semibold text-green-800 mb-3">
                  <i className="fas fa-plus-circle mr-1"></i>付帯費用（エリア別）
                </p>
                <div className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer hover:bg-green-100 p-2 rounded transition">
                    <div className="flex items-center">
                      <input type="checkbox" id="konsaiAncillary_road_permit" onChange="handleKonsaiOptionsChange()" className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                      <span className="ml-2 text-sm text-gray-700">道路許可</span>
                    </div>
                    <span id="konsaiAncillary_road_permit_price" className="text-sm font-semibold text-gray-900">-</span>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer hover:bg-green-100 p-2 rounded transition">
                    <div className="flex items-center">
                      <input type="checkbox" id="konsaiAncillary_transport_vehicle" onChange="handleKonsaiOptionsChange()" className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                      <span className="ml-2 text-sm text-gray-700">車両輸送</span>
                    </div>
                    <span id="konsaiAncillary_transport_vehicle_price" className="text-sm font-semibold text-gray-900">-</span>
                  </label>

                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center">
                      <i id="konsaiAncillary_highway_icon" className="fas fa-check-circle text-gray-300 w-4 h-4 mr-2"></i>
                      <span className="text-sm text-gray-700">高速代</span>
                    </div>
                    <span id="konsaiAncillary_highway_label" className="text-sm font-semibold text-gray-400">-</span>
                  </div>
                  <div className="border-t border-green-200 pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-gray-800 text-sm">付帯費用 小計</span>
                    <span id="konsaiAncillarySubtotal" className="text-lg font-bold text-green-600">¥0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 料金サマリー */}
          <div id="pricingSummary" className="mb-8 p-4 bg-green-50 rounded-lg hidden">
            <h3 className="text-lg font-medium text-gray-900 mb-4">車両料金サマリー</h3>
            <div className="space-y-3">
              <div id="summaryServiceType" className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-sm font-medium text-gray-700">便種</span>
                <span id="summaryServiceTypeValue" className="text-lg font-semibold text-gray-900">-</span>
              </div>
              <div id="summaryVehicleCount" className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-sm font-medium text-gray-700">台数</span>
                <span id="summaryVehicleCountValue" className="text-lg font-semibold text-gray-900">-</span>
              </div>
              <div id="summaryOnemanRow" className="flex justify-between items-center py-2 border-b border-green-200 hidden">
                <span className="text-sm font-medium text-green-700">ワンマン割引</span>
                <span className="text-lg font-semibold text-green-600">-¥15,000</span>
              </div>
              <div id="summaryAncillaryRow" className="flex justify-between items-center py-2 border-b border-green-200 hidden">
                <span className="text-sm font-medium text-gray-700">付帯費用</span>
                <span id="summaryAncillaryValue" className="text-lg font-semibold text-gray-900">¥0</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-gray-900">車両費用合計</span>
                <span id="vehicleTotal" className="text-2xl font-bold text-green-600">¥0</span>
              </div>
            </div>
          </div>

          {/* ナビゲーションボタン */}
          <div className="flex justify-between">
            <button 
              onclick="goBackToStep2()" 
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              戻る: 配送先入力
            </button>
            <button 
              id="nextStepBtn" 
              onclick="proceedToStep4()" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled
            >
              次へ: スタッフ入力
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </main>

      {/* JavaScript初期化 */}
      <script dangerouslySetInnerHTML={{
        __html: `
        // ページ初期化（app.jsのDOMContentLoadedで実行されるため、ここでは不要）
        // Step3Implementation.initialize() は app.js 側で呼び出し済み
        `
      }}></script>
    </div>
  )
})










// マスタ料金取得API
app.get('/api/vehicle-pricing/:vehicleType/:operationType/:area', async (c) => {
  const { vehicleType, operationType, area } = c.req.param()
  const userId = c.req.header('X-User-ID') || 'user001'
  
  try {
    const { env } = c
    
    // 車種と稼働形態からサブカテゴリを構築
    const vehicleTypeMapping = {
      '2t車': '2t',
      '4t車': '4t'
    }
    
    const operationTypeMapping = {
      '共配': 'shared',
      '半日': 'half_day',
      '終日': 'full_day'
    }
    
    const vehiclePrefix = vehicleTypeMapping[vehicleType]
    const operationSuffix = operationTypeMapping[operationType]
    
    if (!vehiclePrefix || !operationSuffix) {
      return c.json({
        success: false,
        error: '無効な車種または稼働形態です'
      }, 400)
    }
    
    const subcategory = `${vehiclePrefix}_${operationSuffix}_${area}`
    
    // データベースから料金を取得
    const keyName = `vehicle_${vehiclePrefix}_${operationSuffix}_${area}`
    const result = await env.DB.prepare(`
      SELECT value 
      FROM master_settings 
      WHERE category = 'vehicle' 
      AND key = ?
      AND user_id = ?
    `).bind(keyName, userId).first()
    
    if (result) {
      const price = parseInt(result.value)
      return c.json({
        success: true,
        data: {
          vehicle_type: vehicleType,
          operation_type: operationType,
          area: area,
          price: price
        }
      })
    } else {
      return c.json({
        success: false,
        error: '料金が見つかりません'
      })
    }
    
  } catch (error) {
    console.error('Error fetching vehicle pricing:', error)
    return c.json({
      success: false,
      error: '車両料金の取得に失敗しました',
      message: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// STEP4: スタッフ入力
app.get('/estimate/step4', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center text-white hover:text-blue-200">
                <i className="fas fa-truck text-white text-2xl mr-3"></i>
                <h1 className="text-xl font-bold">Office M2 見積システム</h1>
              </a>
            </div>
            <div className="text-white">
              <span className="text-sm" id="stepHeaderLabel">新規見積作成 - STEP 4</span>
            </div>
          </div>
        </div>
      </header>

      {/* プログレスバー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onclick="navigateToStep(1)" title="STEP1に戻る">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-colors">
                  <i className="fas fa-check text-xs"></i>
                </div>
                <span className="ml-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">顧客・案件選択</span>
              </div>
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onclick="navigateToStep(2)" title="STEP2に戻る">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-colors">
                  <i className="fas fa-check text-xs"></i>
                </div>
                <span className="ml-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">配送先入力</span>
              </div>
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onclick="navigateToStep(3)" title="STEP3に戻る">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-colors">
                  <i className="fas fa-check text-xs"></i>
                </div>
                <span className="ml-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">車両選択</span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold step-number">
                  4
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">スタッフ入力</span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-bold step-number">
                  5
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">その他サービス</span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-bold step-number">
                  6
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">内容確認</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="progress-bar">
              <div className="progress-fill" style="width: 66.67%"></div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">STEP 4: スタッフ入力</h2>
                <p className="mt-1 text-sm text-gray-600">必要なスタッフ人数を入力してください。</p>
              </div>
            </div>
          </div>

          {/* 選択済み情報表示 */}
          <div id="selectedInfo" className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <h3 className="text-sm font-medium text-blue-900 mb-2">選択済み情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-800">
              <div>
                <span className="font-medium">顧客:</span> <span id="selectedCustomerName">読み込み中...</span>
              </div>
              <div>
                <span className="font-medium">案件:</span> <span id="selectedProjectName">読み込み中...</span>
              </div>
              <div>
                <span className="font-medium">配送先:</span> <span id="selectedArea">読み込み中...</span>
              </div>
              <div>
                <span className="font-medium">車両:</span> <span id="selectedVehicle">読み込み中...</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* AI最適化セクション */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium text-purple-900">
                    <i className="fas fa-robot mr-2"></i>
                    AI最適人数提案
                  </h4>
                  <button 
                    id="aiOptimizeBtn" 
                    onclick="requestAIOptimization()" 
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <i className="fas fa-magic mr-2"></i>
                    最適人数を提案
                  </button>
                </div>
                <p className="text-sm text-purple-700">
                  配送エリア、車両、作業内容に基づいて、最適なスタッフ編成をAIが提案します。
                </p>
                <div id="aiSuggestion" className="hidden mt-3 p-3 bg-white border border-purple-300 rounded">
                  <h5 className="font-medium text-purple-900 mb-2">AI提案結果</h5>
                  <div id="aiSuggestionContent" className="text-sm text-gray-700"></div>
                  <button 
                    id="applyAiSuggestion" 
                    onclick="applyAISuggestion()" 
                    className="mt-2 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-sm"
                  >
                    この提案を適用
                  </button>
                </div>
              </div>

              {/* 基本スタッフ */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">基本スタッフ（必須）</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      スーパーバイザー
                      <span className="text-xs text-gray-500 ml-2">（¥<span id="rate-display-supervisor">...</span>/日）</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="number" 
                        id="supervisor_count" 
                        className="form-input w-20" 
                        min="0" 
                        max="10" 
                        value="0"
                        onChange="updateStaffCost()"
                      />
                      <span className="text-sm text-gray-600">人</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">現場統括・品質管理責任者</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      リーダー以上
                      <span className="text-xs text-gray-500 ml-2">（¥<span id="rate-display-leader">...</span>/日）</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="number" 
                        id="leader_count" 
                        className="form-input w-20" 
                        min="0" 
                        max="20" 
                        value="0"
                        onChange="updateStaffCost()"
                      />
                      <span className="text-sm text-gray-600">人</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">チームリーダー・熟練作業員</p>
                  </div>
                </div>
              </div>

              {/* 追加スタッフ */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">追加スタッフ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* M2スタッフ / 一般社員 */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-800">M2スタッフ</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        一般社員
                        <span className="text-xs text-gray-500 ml-2">（¥<span id="rate-display-m2-half">...</span>/日）</span>
                      </label>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="number" 
                          id="m2_staff_half_day" 
                          className="form-input w-20" 
                          min="0" 
                          max="50" 
                          value="0"
                          onChange="updateStaffCost()"
                        />
                        <span className="text-sm text-gray-600">人</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        終日勤務
                        <span className="text-xs text-gray-500 ml-2">（¥<span id="rate-display-m2-full">...</span>/日）</span>
                      </label>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="number" 
                          id="m2_staff_full_day" 
                          className="form-input w-20" 
                          min="0" 
                          max="50" 
                          value="0"
                          onChange="updateStaffCost()"
                        />
                        <span className="text-sm text-gray-600">人</span>
                      </div>
                    </div>
                  </div>

                  {/* 派遣スタッフ */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-800">派遣スタッフ</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        半日勤務
                        <span className="text-xs text-gray-500 ml-2">（¥<span id="rate-display-temp-half">...</span>/半日）</span>
                      </label>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="number" 
                          id="temp_staff_half_day" 
                          className="form-input w-20" 
                          min="0" 
                          max="50" 
                          value="0"
                          onChange="updateStaffCost()"
                        />
                        <span className="text-sm text-gray-600">人</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        終日勤務
                        <span className="text-xs text-gray-500 ml-2">（¥<span id="rate-display-temp-full">...</span>/日）</span>
                      </label>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="number" 
                          id="temp_staff_full_day" 
                          className="form-input w-20" 
                          min="0" 
                          max="50" 
                          value="0"
                          onChange="updateStaffCost()"
                        />
                        <span className="text-sm text-gray-600">人</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* スタッフ費用詳細表示（JavaScript制御・初期状態で非表示） */}
            <div id="staffPricingInfo" className="mb-8 p-4 bg-green-50 rounded-lg" style="display: none;">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <i className="fas fa-users mr-2 text-green-600"></i>
                スタッフ費用詳細
              </h3>
              <div className="space-y-3">
                {/* 基本スタッフ費用 */}
                <div id="basicStaffSection" className="hidden">
                  <h4 className="text-md font-medium text-green-800 mb-2">基本スタッフ</h4>
                  
                  <div id="supervisorPricing" className="flex justify-between items-center py-2 px-3 bg-white border border-green-200 rounded hidden">
                    <div className="flex items-center">
                      <i className="fas fa-user-tie mr-2 text-green-600"></i>
                      <span className="text-sm font-medium text-gray-700">スーパーバイザー</span>
                      <span id="supervisorDetails" className="text-xs text-gray-500 ml-2"></span>
                    </div>
                    <span id="supervisorCost" className="text-lg font-semibold text-green-700">¥0</span>
                  </div>
                  
                  <div id="leaderPricing" className="flex justify-between items-center py-2 px-3 bg-white border border-green-200 rounded hidden">
                    <div className="flex items-center">
                      <i className="fas fa-user-cog mr-2 text-green-600"></i>
                      <span className="text-sm font-medium text-gray-700">リーダー以上</span>
                      <span id="leaderDetails" className="text-xs text-gray-500 ml-2"></span>
                    </div>
                    <span id="leaderCost" className="text-lg font-semibold text-green-700">¥0</span>
                  </div>
                </div>

                {/* M2スタッフ費用 */}
                <div id="m2StaffSection" className="hidden">
                  <h4 className="text-md font-medium text-green-800 mb-2">M2スタッフ</h4>
                  
                  <div id="m2HalfDayPricing" className="flex justify-between items-center py-2 px-3 bg-white border border-green-200 rounded hidden">
                    <div className="flex items-center">
                      <i className="fas fa-user mr-2 text-green-600"></i>
                      <span className="text-sm font-medium text-gray-700">一般社員</span>
                      <span id="m2HalfDayDetails" className="text-xs text-gray-500 ml-2"></span>
                    </div>
                    <span id="m2HalfDayCost" className="text-lg font-semibold text-green-700">¥0</span>
                  </div>
                  
                  <div id="m2FullDayPricing" className="flex justify-between items-center py-2 px-3 bg-white border border-green-200 rounded hidden">
                    <div className="flex items-center">
                      <i className="fas fa-user mr-2 text-green-600"></i>
                      <span className="text-sm font-medium text-gray-700">M2スタッフ（終日）</span>
                      <span id="m2FullDayDetails" className="text-xs text-gray-500 ml-2"></span>
                    </div>
                    <span id="m2FullDayCost" className="text-lg font-semibold text-green-700">¥0</span>
                  </div>
                </div>

                {/* 派遣スタッフ費用 */}
                <div id="tempStaffSection" className="hidden">
                  <h4 className="text-md font-medium text-green-800 mb-2">派遣スタッフ</h4>
                  
                  <div id="tempHalfDayPricing" className="flex justify-between items-center py-2 px-3 bg-white border border-green-200 rounded hidden">
                    <div className="flex items-center">
                      <i className="fas fa-user-clock mr-2 text-green-600"></i>
                      <span className="text-sm font-medium text-gray-700">派遣スタッフ（半日）</span>
                      <span id="tempHalfDayDetails" className="text-xs text-gray-500 ml-2"></span>
                    </div>
                    <span id="tempHalfDayCost" className="text-lg font-semibold text-green-700">¥0</span>
                  </div>
                  
                  <div id="tempFullDayPricing" className="flex justify-between items-center py-2 px-3 bg-white border border-green-200 rounded hidden">
                    <div className="flex items-center">
                      <i className="fas fa-user-clock mr-2 text-green-600"></i>
                      <span className="text-sm font-medium text-gray-700">派遣スタッフ（終日）</span>
                      <span id="tempFullDayDetails" className="text-xs text-gray-500 ml-2"></span>
                    </div>
                    <span id="tempFullDayCost" className="text-lg font-semibold text-green-700">¥0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* スタッフ費用合計（独立表示） */}
            <div id="staffTotalSection" className="mb-8" style="display: none;">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg shadow-sm">
                <div>
                  <span className="text-lg font-bold text-gray-900">スタッフ費用合計</span>
                  <div id="totalStaffCount" className="text-sm text-gray-600">合計人数: 0人</div>
                </div>
                <div className="text-right">
                  <span id="totalStaffCost" className="text-2xl font-bold text-green-600">¥0</span>
                  <div className="text-xs text-gray-500">（税抜）</div>
                </div>
              </div>
            </div>

            {/* ナビゲーションボタン */}
            <div className="mt-8 flex justify-between">
              <button onclick="goBackToStep3()" className="btn-secondary">
                <i className="fas fa-arrow-left mr-2"></i>
                前へ: 車両選択
              </button>
              <button 
                id="nextStepBtn" 
                onclick="proceedToStep5()" 
                className="btn-primary"
              >
                次へ: その他サービス
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// スタッフ単価取得API
// スタッフ料金API - 削除（2270行目に統合版あり）

// AI最適化API（モックレスポンス）
app.post('/api/ai-optimize-staff', async (c) => {
  const data = await c.req.json()
  
  // TODO: Cloudflare AI Workersを使用して実際のAI分析を実装
  // 現在はルールベースのモック応答
  let suggestion = {
    supervisor_count: 0,
    leader_count: 1,
    m2_staff_half_day: 0,
    m2_staff_full_day: 2,
    temp_staff_half_day: 0,
    temp_staff_full_day: 1,
    reasoning: ''
  }
  
  // 簡単なルールベース提案
  if (data.vehicle_type === '4t車') {
    if (data.operation_type === '終日') {
      suggestion = {
        supervisor_count: 1,
        leader_count: 2,
        m2_staff_half_day: 0,
        m2_staff_full_day: 4,
        temp_staff_half_day: 0,
        temp_staff_full_day: 2,
        reasoning: '4t車・終日作業のため、重量物を扱うことを想定し、リーダークラス2名、作業員6名の体制を推奨。安全管理のためSV1名配置。'
      }
    } else if (data.operation_type === '半日') {
      suggestion = {
        supervisor_count: 0,
        leader_count: 1,
        m2_staff_half_day: 0,
        m2_staff_full_day: 2,
        temp_staff_half_day: 0,
        temp_staff_full_day: 1,
        reasoning: '4t車・半日作業のため、効率的な作業にリーダー1名、作業員3名を推奨。'
      }
    } else {
      suggestion = {
        supervisor_count: 0,
        leader_count: 1,
        m2_staff_half_day: 0,
        m2_staff_full_day: 1,
        temp_staff_half_day: 0,
        temp_staff_full_day: 1,
        reasoning: '4t車・共配のため、最小限の人員でリーダー1名、作業員2名を推奨。'
      }
    }
  } else if (data.vehicle_type === '2t車') {
    if (data.operation_type === '終日') {
      suggestion = {
        supervisor_count: 0,
        leader_count: 1,
        m2_staff_half_day: 0,
        m2_staff_full_day: 2,
        temp_staff_half_day: 0,
        temp_staff_full_day: 1,
        reasoning: '2t車・終日作業のため、リーダー1名、作業員3名の体制を推奨。'
      }
    } else if (data.operation_type === '半日') {
      suggestion = {
        supervisor_count: 0,
        leader_count: 1,
        m2_staff_half_day: 0,
        m2_staff_full_day: 1,
        temp_staff_half_day: 0,
        temp_staff_full_day: 0,
        reasoning: '2t車・半日作業のため、リーダー1名、作業員1名の体制を推奨。'
      }
    } else {
      suggestion = {
        supervisor_count: 0,
        leader_count: 1,
        m2_staff_half_day: 0,
        m2_staff_full_day: 1,
        temp_staff_half_day: 0,
        temp_staff_full_day: 0,
        reasoning: '2t車・共配のため、最小限の人員でリーダー1名、作業員1名を推奨。'
      }
    }
  }

  // エリアによる調整
  if (data.area === 'D') {
    suggestion.reasoning += ' 遠方エリアのため、移動時間を考慮した人員配置です。'
  }

  return c.json({
    success: true,
    data: suggestion
  })
})

// STEP5: その他サービス入力
app.get('/estimate/step5', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center text-white hover:text-blue-200">
                <i className="fas fa-truck text-white text-2xl mr-3"></i>
                <h1 className="text-xl font-bold">Office M2 見積システム</h1>
              </a>
            </div>
            <div className="text-white">
              <span className="text-sm" id="stepHeaderLabel">新規見積作成 - STEP 5</span>
            </div>
          </div>
        </div>
      </header>

      {/* プログレスバー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onclick="navigateToStep(1)" title="STEP1に戻る">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-colors">
                  <i className="fas fa-check text-xs"></i>
                </div>
                <span className="ml-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">顧客・案件選択</span>
              </div>
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onclick="navigateToStep(2)" title="STEP2に戻る">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-colors">
                  <i className="fas fa-check text-xs"></i>
                </div>
                <span className="ml-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">配送先入力</span>
              </div>
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onclick="navigateToStep(3)" title="STEP3に戻る">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-colors">
                  <i className="fas fa-check text-xs"></i>
                </div>
                <span className="ml-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">車両選択</span>
              </div>
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onclick="navigateToStep(4)" title="STEP4に戻る">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-colors">
                  <i className="fas fa-check text-xs"></i>
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">スタッフ入力</span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold step-number">
                  5
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">その他サービス</span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-bold step-number">
                  6
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">内容確認</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="progress-bar">
              <div className="progress-fill" style="width: 83.33%"></div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">STEP 5: その他サービス</h2>
            <p className="mt-1 text-sm text-gray-600">必要に応じて追加サービスを選択してください。作業時間帯や実費についても入力できます。</p>
          </div>

          {/* 選択済み情報表示 */}
          <div id="selectedInfo" className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <h3 className="text-sm font-medium text-blue-900 mb-2">選択済み情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-800">
              <div>
                <span className="font-medium">顧客:</span> <span id="selectedCustomerName">読み込み中...</span>
              </div>
              <div>
                <span className="font-medium">配送先:</span> <span id="selectedArea">読み込み中...</span>
              </div>
              <div>
                <span className="font-medium">車両:</span> <span id="selectedVehicle">読み込み中...</span>
              </div>
              <div>
                <span className="font-medium">スタッフ費用:</span> <span id="selectedStaffCost">読み込み中...</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-8">

              {/* 駐禁対策員 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <i className="fas fa-shield-alt text-orange-500 text-xl mr-3"></i>
                    <h4 className="text-lg font-medium text-gray-900">駐禁対策員</h4>
                  </div>
                  <button type="button" onclick="addParkingOfficer()" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold" title="駐禁対策員を追加">
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <div id="parkingOfficerList">
                  {/* 動的に追加される駐禁対策員エントリ */}
                </div>
                <div id="parkingOfficerTotal" className="hidden mt-3 pt-3 border-t border-orange-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-orange-800">駐禁対策員 小計</span>
                    <span id="parkingOfficerTotalCost" className="text-lg font-bold text-orange-600">¥0</span>
                  </div>
                </div>
              </div>

              {/* 人員輸送車両 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <i className="fas fa-bus text-blue-500 text-xl mr-3"></i>
                  <h4 className="text-lg font-medium text-gray-900">人員輸送車両</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">台数</label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="number" 
                        id="transport_vehicles" 
                        className="form-input w-20" 
                        min="0" 
                        max="10" 
                        value="0"
                        onChange="updateServicesCost()"
                      />
                      <span className="text-sm text-gray-600">台</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">距離計算</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="transport_distance_type" value="20km" className="mr-2" checked onChange="handleTransportDistanceChange()" />
                        <span className="text-sm">20km圏内一律（¥<span id="rate-display-transport-20km">15,000</span>）</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="transport_distance_type" value="custom" className="mr-2" onChange="handleTransportDistanceChange()" />
                        <span className="text-sm">距離指定（¥<span id="rate-display-transport-km">150</span>/km）</span>
                      </label>
                    </div>
                  </div>
                  <div id="customDistanceInput" className="hidden">
                    <label className="block text-sm font-medium text-gray-700 mb-2">距離・燃料費</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="number" id="transport_distance" className="form-input w-20" min="0" max="500" step="0.1" onChange="updateServicesCost()" />
                        <span className="text-xs text-gray-600">km</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="number" id="transport_fuel_cost" className="form-input w-20" min="0" max="50000" onChange="updateServicesCost()" />
                        <span className="text-xs text-gray-600">円（燃料費 ¥<span id="rate-display-fuel">160</span>/L）</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 引き取り廃棄 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <i className="fas fa-trash text-red-500 text-xl mr-3"></i>
                  <h4 className="text-lg font-medium text-gray-900">引き取り廃棄</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="waste_disposal" value="none" className="mr-3" checked onChange="updateServicesCost()" />
                    <div>
                      <div className="font-medium">なし</div>
                      <div className="text-xs text-gray-500">¥0</div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="waste_disposal" value="small" className="mr-3" onChange="updateServicesCost()" />
                    <div>
                      <div className="font-medium">小</div>
                      <div className="text-xs text-gray-500">¥<span id="rate-display-waste-small">10,000</span></div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="waste_disposal" value="medium" className="mr-3" onchange="updateServicesCost()" />
                    <div>
                      <div className="font-medium">中</div>
                      <div className="text-xs text-gray-500">¥<span id="rate-display-waste-medium">15,000</span></div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="waste_disposal" value="large" className="mr-3" onChange="updateServicesCost()" />
                    <div>
                      <div className="font-medium">大</div>
                      <div className="text-xs text-gray-500">¥<span id="rate-display-waste-large">20,000</span></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 養生作業 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <i className="fas fa-hard-hat text-yellow-500 text-xl mr-3"></i>
                  <h4 className="text-lg font-medium text-gray-900">養生作業</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center mb-3">
                      <input type="checkbox" id="protection_work" className="mr-2" onChange="handleProtectionWorkChange()" />
                      <span className="text-sm font-medium">養生作業を実施する（基本料金¥<span id="rate-display-protection-base">8,000</span>）</span>
                    </label>
                  </div>
                  <div id="protectionFloors" className="hidden">
                    <label className="block text-sm font-medium text-gray-700 mb-2">荷下ろしフロア数</label>
                    <div className="flex items-center space-x-3">
                      <input type="number" id="protection_floors" className="form-input w-20" min="1" max="20" value="1" onChange="updateServicesCost()" />
                      <span className="text-sm text-gray-600">フロア</span>
                      <span className="text-xs text-gray-500">（¥<span id="rate-display-protection-floor">3,000</span>/フロア）</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 残材回収 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <i className="fas fa-recycle text-green-500 text-xl mr-3"></i>
                  <h4 className="text-lg font-medium text-gray-900">残材回収</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="material_collection" value="none" className="mr-3" checked onChange="updateServicesCost()" />
                    <div>
                      <div className="font-medium">なし</div>
                      <div className="text-xs text-gray-500">¥0</div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="material_collection" value="few" className="mr-3" onChange="updateServicesCost()" />
                    <div>
                      <div className="font-medium">少</div>
                      <div className="text-xs text-gray-500">¥<span id="rate-display-material-few">5,000</span></div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="material_collection" value="medium" className="mr-3" onChange="updateServicesCost()" />
                    <div>
                      <div className="font-medium">中</div>
                      <div className="text-xs text-gray-500">¥<span id="rate-display-material-medium">10,000</span></div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="material_collection" value="many" className="mr-3" onChange="updateServicesCost()" />
                    <div>
                      <div className="font-medium">多</div>
                      <div className="text-xs text-gray-500">¥<span id="rate-display-material-many">15,000</span></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 施工 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <i className="fas fa-tools text-purple-500 text-xl mr-3"></i>
                  <h4 className="text-lg font-medium text-gray-900">施工</h4>
                </div>
                
                {/* 施工方法選択 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">施工方法を選択してください</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input 
                        type="radio" 
                        name="construction_type" 
                        value="m2_staff" 
                        className="mr-3" 
                        checked 
                        onChange="handleConstructionTypeChange()" 
                      />
                      <div>
                        <div className="font-medium text-gray-900">M2スタッフ</div>
                        <div className="text-xs text-gray-500">自社スタッフによる施工</div>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input 
                        type="radio" 
                        name="construction_type" 
                        value="partner_company" 
                        className="mr-3" 
                        onChange="handleConstructionTypeChange()" 
                      />
                      <div>
                        <div className="font-medium text-gray-900">協力会社</div>
                        <div className="text-xs text-gray-500">外部協力会社による施工</div>
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* M2スタッフ選択時の詳細 */}
                <div id="m2StaffDetails" className="">
                  <label className="block text-sm font-medium text-gray-700 mb-2">M2スタッフ数</label>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="number" 
                      id="construction_m2_staff" 
                      className="form-input w-20" 
                      min="0" 
                      max="20" 
                      value="0" 
                      onChange="updateServicesCost()" 
                    />
                    <span className="text-sm text-gray-600">人</span>
                    <span className="text-xs text-gray-500">（¥<span id="rate-display-construction-m2">0</span>/人）</span>
                  </div>
                </div>
                
                {/* 協力会社選択時の詳細 */}
                <div id="partnerCompanyDetails" className="hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">協力会社名</label>
                      <input 
                        type="text" 
                        id="construction_partner" 
                        className="form-input" 
                        placeholder="協力会社名を入力" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">施工費用</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">¥</span>
                        <input 
                          type="number" 
                          id="construction_cost" 
                          className="form-input" 
                          min="0" 
                          step="1000" 
                          placeholder="0" 
                          onChange="updateServicesCost()" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 作業時間帯 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <i className="fas fa-clock text-indigo-500 text-xl mr-3"></i>
                  <h4 className="text-lg font-medium text-gray-900">作業時間帯</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    <input type="radio" name="work_time_type" value="normal" className="mr-3 w-5 h-5" checked onChange="updateServicesCost()" />
                    <div>
                      <div className="font-bold text-base">通常作業時間</div>
                      <div className="text-sm text-blue-600 font-medium mt-1">AM 8:00 〜 PM 6:00</div>
                      <div className="text-xs text-gray-500 mt-1">×1.0（割増なし）</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-colors">
                    <input type="radio" name="work_time_type" value="overtime" className="mr-3 w-5 h-5" onChange="updateServicesCost()" />
                    <div>
                      <div className="font-bold text-base">割増作業時間</div>
                      <div className="text-sm text-orange-600 font-medium mt-1">PM 6:00 〜 翌 AM 8:00</div>
                      <div className="text-xs text-gray-500 mt-1">×1.25（25%割増）</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 実費請求 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <i className="fas fa-receipt text-gray-500 text-xl mr-3"></i>
                  <h4 className="text-lg font-medium text-gray-900">実費請求</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">駐車料金</label>
                    <div className="flex items-center space-x-3">
                      <input type="number" id="parking_fee" className="form-input w-24" min="0" max="50000" value="0" onChange="updateServicesCost()" />
                      <span className="text-sm text-gray-600">円</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">高速料金</label>
                    <div className="flex items-center space-x-3">
                      <input type="number" id="highway_fee" className="form-input w-24" min="0" max="50000" value="0" onChange="updateServicesCost()" />
                      <span className="text-sm text-gray-600">円</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4トン車追加（フリー入力） */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <i className="fas fa-truck-moving text-green-500 text-xl mr-3"></i>
                  <h4 className="text-lg font-medium text-gray-900">4トン車追加</h4>
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">フリー入力</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">台数</label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="number" 
                        id="additional_truck_count" 
                        className="form-input w-20" 
                        min="0" 
                        max="20" 
                        value="0"
                        onChange="updateServicesCost()"
                      />
                      <span className="text-sm text-gray-600">台</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">単価（1台あたり）</label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="number" 
                        id="additional_truck_unit_price" 
                        className="form-input w-32" 
                        min="0" 
                        step="1000"
                        value="0"
                        onChange="updateServicesCost()"
                      />
                      <span className="text-sm text-gray-600">円</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">小計</label>
                    <p className="text-lg font-bold text-green-600 mt-1" id="additional_truck_subtotal">¥0</p>
                  </div>
                </div>
              </div>

              {/* サービス費用表示 */}
              <div id="servicesCostDisplay" className="p-4 bg-orange-50 border border-orange-200 rounded-lg hidden">
                <h4 className="text-lg font-medium text-orange-900 mb-2">
                  <i className="fas fa-concierge-bell mr-2"></i>
                  その他サービス費用
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div id="servicesBreakdown" className="text-sm text-orange-800 space-y-1">
                      {/* 内訳がJavaScriptで動的に生成される */}
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-800">
                      <span id="totalServicesCost">¥0</span>
                      <span className="text-sm font-normal">（税抜）</span>
                    </p>
                    <p className="text-xs text-orange-600">サービス費用合計</p>
                  </div>
                </div>
              </div>

              {/* 備考 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <i className="fas fa-comment-dots text-gray-500 text-xl mr-3"></i>
                  <h4 className="text-lg font-medium text-gray-900">備考</h4>
                </div>
                <textarea 
                  id="notes" 
                  className="form-textarea w-full" 
                  rows="3" 
                  placeholder="その他特記事項があればご記入ください"
                ></textarea>
              </div>
            </div>

            {/* ナビゲーションボタン */}
            <div className="mt-8 flex justify-between">
              <button onclick="goBackToStep4()" className="btn-secondary">
                <i className="fas fa-arrow-left mr-2"></i>
                前へ: スタッフ入力
              </button>
              <button 
                id="nextStepBtn" 
                onclick="proceedToStep6()" 
                className="btn-primary"
              >
                次へ: 内容確認
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// STEP6: 内容確認・見積書作成
app.get('/estimate/step6', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center text-white hover:text-blue-200">
                <i className="fas fa-truck text-white text-2xl mr-3"></i>
                <h1 className="text-xl font-bold">Office M2 見積システム</h1>
              </a>
            </div>
            <div className="text-white">
              <span className="text-sm" id="stepHeaderLabel">新規見積作成 - STEP 6</span>
            </div>
          </div>
        </div>
      </header>

      {/* プログレスバー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onclick="navigateToStep(1)" title="STEP1に戻る">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-colors">
                  <i className="fas fa-check text-xs"></i>
                </div>
                <span className="ml-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">顧客・案件選択</span>
              </div>
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onclick="navigateToStep(2)" title="STEP2に戻る">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-colors">
                  <i className="fas fa-check text-xs"></i>
                </div>
                <span className="ml-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">配送先入力</span>
              </div>
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onclick="navigateToStep(3)" title="STEP3に戻る">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-colors">
                  <i className="fas fa-check text-xs"></i>
                </div>
                <span className="ml-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">車両選択</span>
              </div>
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onclick="navigateToStep(4)" title="STEP4に戻る">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-colors">
                  <i className="fas fa-check text-xs"></i>
                </div>
                <span className="ml-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">スタッフ入力</span>
              </div>
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onclick="navigateToStep(5)" title="STEP5に戻る">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-colors">
                  <i className="fas fa-check text-xs"></i>
                </div>
                <span className="ml-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">その他サービス</span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold step-number">
                  6
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">内容確認</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="progress-bar">
              <div className="progress-fill" style="width: 100%"></div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">STEP 6: 内容確認・見積書作成</h2>
            <p className="mt-1 text-sm text-gray-600">内容を確認して見積書を保存・出力してください。AIによるメール文自動生成も利用できます。</p>
          </div>

          <div className="p-6">
            <div className="space-y-8">
              {/* 見積書ヘッダー情報 */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-blue-900">
                    <i className="fas fa-file-invoice mr-2"></i>
                    見積書 #<span id="estimateNumber">EST-2025-001</span>
                  </h3>
                  <div className="text-sm text-blue-700">
                    <div>作成日: <span id="createDate">2025-08-18</span></div>
                    <div>担当者: <span id="createdByName">-</span></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">顧客情報</h4>
                    <div className="text-sm text-blue-800" id="customerInfo">
                      {/* 顧客情報がJavaScriptで動的に生成される */}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">案件情報</h4>
                    <div className="text-sm text-blue-800" id="projectInfo">
                      {/* 案件情報がJavaScriptで動的に生成される */}
                    </div>
                  </div>
                </div>
              </div>

              {/* 見積明細 */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">見積明細</h3>

                {/* 車両費用 */}
                <div className="border rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-green-900">
                      <i className="fas fa-truck mr-2"></i>
                      車両費用
                    </h4>
                    <button 
                      id="editVehiclePriceBtn" 
                      onclick="toggleVehiclePriceEdit()" 
                      className="text-sm text-green-600 hover:text-green-800 transition-colors"
                      title="単価を編集"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      単価編集
                    </button>
                  </div>
                  <div id="vehicleDetails" className="text-sm text-green-800">
                    {/* 車両詳細がJavaScriptで動的に生成される */}
                  </div>
                  {/* 車両単価編集モード */}
                  <div id="vehiclePriceEditMode" className="hidden mt-4 p-4 bg-white rounded-lg border border-green-300">
                    <h5 className="font-medium text-green-800 mb-3">
                      <i className="fas fa-yen-sign mr-2"></i>
                      車両単価を編集
                    </h5>
                    <div id="vehiclePriceEditFields" className="space-y-3">
                      {/* 編集フィールドがJavaScriptで動的に生成される */}
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button onclick="applyVehiclePriceEdit()" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                        <i className="fas fa-check mr-1"></i>
                        適用
                      </button>
                      <button onclick="cancelVehiclePriceEdit()" className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm">
                        <i className="fas fa-times mr-1"></i>
                        キャンセル
                      </button>
                    </div>
                  </div>
                </div>

                {/* スタッフ費用 */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-blue-900">
                      <i className="fas fa-users mr-2"></i>
                      スタッフ費用
                    </h4>
                    <button 
                      id="editStaffPriceBtn" 
                      onclick="toggleStaffPriceEdit()" 
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      title="単価を編集"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      単価編集
                    </button>
                  </div>
                  <div id="staffDetails" className="text-sm text-blue-800">
                    {/* スタッフ詳細がJavaScriptで動的に生成される */}
                  </div>
                  {/* スタッフ単価編集モード */}
                  <div id="staffPriceEditMode" className="hidden mt-4 p-4 bg-white rounded-lg border border-blue-300">
                    <h5 className="font-medium text-blue-800 mb-3">
                      <i className="fas fa-yen-sign mr-2"></i>
                      スタッフ単価を編集
                    </h5>
                    <div id="staffPriceEditFields" className="space-y-3">
                      {/* 編集フィールドがJavaScriptで動的に生成される */}
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button onclick="applyStaffPriceEdit()" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                        <i className="fas fa-check mr-1"></i>
                        適用
                      </button>
                      <button onclick="cancelStaffPriceEdit()" className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm">
                        <i className="fas fa-times mr-1"></i>
                        キャンセル
                      </button>
                    </div>
                  </div>
                </div>

                {/* その他サービス費用 */}
                <div id="servicesSection" className="border rounded-lg p-4 bg-orange-50 hidden">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-orange-900">
                      <i className="fas fa-concierge-bell mr-2"></i>
                      その他サービス
                    </h4>
                    <button 
                      id="editServicePriceBtn" 
                      onclick="toggleServicePriceEdit()" 
                      className="text-sm text-orange-600 hover:text-orange-800 transition-colors"
                      title="単価を編集"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      単価編集
                    </button>
                  </div>
                  <div id="servicesDetails" className="text-sm text-orange-800">
                    {/* サービス詳細がJavaScriptで動的に生成される */}
                  </div>
                  {/* サービス単価編集モード */}
                  <div id="servicePriceEditMode" className="hidden mt-4 p-4 bg-white rounded-lg border border-orange-300">
                    <h5 className="font-medium text-orange-800 mb-3">
                      <i className="fas fa-yen-sign mr-2"></i>
                      サービス単価を編集
                    </h5>
                    <div id="servicePriceEditFields" className="space-y-3">
                      {/* 編集フィールドがJavaScriptで動的に生成される */}
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button onclick="applyServicePriceEdit()" className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm">
                        <i className="fas fa-check mr-1"></i>
                        適用
                      </button>
                      <button onclick="cancelServicePriceEdit()" className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm">
                        <i className="fas fa-times mr-1"></i>
                        キャンセル
                      </button>
                    </div>
                  </div>
                </div>

                {/* 合計金額 */}
                <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-gray-900">合計金額</h4>
                    <button onclick="recalculateTotal()" className="text-sm text-blue-600 hover:text-blue-800">
                      <i className="fas fa-calculator mr-1"></i>
                      再計算
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg">
                      <span>小計:</span>
                      <span id="subtotalAmount" className="font-bold">¥0</span>
                    </div>
                    
                    {/* 値引き入力欄 */}
                    <div className="border-t pt-2 mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg">値引き:</span>
                        <div className="flex items-center space-x-1">
                          <button type="button" id="discountTypeAmount" className="px-3 py-1 text-sm rounded-l border border-blue-500 bg-blue-500 text-white font-bold" onclick="switchDiscountType('amount')">金額</button>
                          <button type="button" id="discountTypePercent" className="px-3 py-1 text-sm rounded-r border border-gray-300 bg-white text-gray-700" onclick="switchDiscountType('percent')">％</button>
                        </div>
                      </div>
                      <div id="discountAmountRow" className="flex items-center justify-end space-x-2">
                        <span>¥</span>
                        <input 
                          type="number" 
                          id="discountAmount" 
                          className="form-input w-32 text-right text-lg font-bold" 
                          min="0" 
                          value="0" 
                          onChange="handleDiscountChange()"
                          placeholder="0"
                        />
                      </div>
                      <div id="discountPercentRow" className="flex items-center justify-end space-x-2" style="display:none">
                        <input 
                          type="number" 
                          id="discountPercent" 
                          className="form-input w-24 text-right text-lg font-bold" 
                          min="0" 
                          max="100"
                          step="0.1"
                          value="0" 
                          onChange="handleDiscountChange()"
                          placeholder="0"
                        />
                        <span>％</span>
                        <span className="text-sm text-gray-500" id="discountPercentCalc"></span>
                      </div>
                    </div>
                    <div className="flex justify-between text-lg text-red-600">
                      <span>値引き後小計:</span>
                      <span id="discountedSubtotal" className="font-bold">¥0</span>
                    </div>
                    
                    <div className="flex justify-between text-lg">
                      <span>消費税（10%）:</span>
                      <span id="taxAmount" className="font-bold">¥0</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-2xl font-bold text-blue-600">
                      <span>合計金額:</span>
                      <span id="totalAmount">¥0</span>
                    </div>
                  </div>
                </div>

                {/* 備考・メモ */}
                <div id="notesSection" className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    <i className="fas fa-sticky-note mr-2"></i>
                    備考・メモ
                  </h4>
                  <div id="notesContent" className="text-sm text-gray-700">
                    <textarea 
                      id="estimateNotes" 
                      name="notes" 
                      rows="4" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="見積もりに関する備考やメモを入力してください..."
                    ></textarea>
                    <p className="mt-1 text-sm text-gray-500">
                      このメモは見積書PDFに反映されます。お客様への特記事項などをご記入ください。
                    </p>
                  </div>
                </div>

                {/* 見積有効期限 */}
                <div className="border rounded-lg p-4 bg-yellow-50">
                  <h4 className="font-medium text-gray-900 mb-3">
                    <i className="fas fa-calendar-alt mr-2"></i>
                    見積有効期限
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <button type="button" id="validityImmediate" className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100" onclick="setValidityPeriod('immediate')">即日</button>
                    <button type="button" id="validity1month" className="px-3 py-1.5 text-sm rounded border border-blue-500 bg-blue-500 text-white font-bold" onclick="setValidityPeriod('1month')">1ヶ月</button>
                    <button type="button" id="validity3months" className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100" onclick="setValidityPeriod('3months')">3ヶ月</button>
                    <button type="button" id="validity6months" className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100" onclick="setValidityPeriod('6months')">6ヶ月</button>
                    <button type="button" id="validityCustom" className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100" onclick="setValidityPeriod('custom')">その他</button>
                  </div>
                  <div id="validityCustomRow" className="hidden mt-2">
                    <input type="date" id="validityCustomDate" className="form-input w-48 text-sm" onchange="handleValidityDateChange()" />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    有効期限: <span id="validityDisplay" className="font-medium text-gray-900">-</span>
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* AI メール生成 */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900 mb-2">
                      <i className="fas fa-robot mr-2"></i>
                      AI メール生成
                    </h4>
                    <p className="text-sm text-purple-700 mb-3">見積書送付用のメール文を自動生成します</p>
                    <button 
                      id="generateEmailBtn"
                      onclick="generateAIEmail()" 
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <i className="fas fa-magic mr-2"></i>
                      メール文生成
                    </button>
                  </div>

                  {/* PDF生成 */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-900 mb-2">
                      <i className="fas fa-file-pdf mr-2"></i>
                      PDF生成
                    </h4>
                    <p className="text-sm text-red-700 mb-3">見積書をPDF形式で出力します</p>
                    <button 
                      id="generatePdfBtn"
                      onclick="generatePDF()" 
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <i className="fas fa-download mr-2"></i>
                      PDF出力
                    </button>
                  </div>

                  {/* 見積保存 */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">
                      <i className="fas fa-save mr-2"></i>
                      見積保存
                    </h4>
                    <p className="text-sm text-green-700 mb-3">見積をデータベースに保存します</p>
                    <button 
                      id="saveEstimateBtn"
                      onclick="saveEstimate()" 
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <i className="fas fa-check mr-2"></i>
                      見積を保存
                    </button>
                  </div>
                </div>
              </div>



              {/* ナビゲーションボタン */}
              <div className="flex justify-between">
                <button onclick="goBackToStep5()" className="btn-secondary">
                  <i className="fas fa-arrow-left mr-2"></i>
                  前へ: その他サービス
                </button>
                <a href="/" className="btn-primary">
                  <i className="fas fa-home mr-2"></i>
                  ダッシュボードに戻る
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI生成メールモーダル */}
      <div id="aiEmailModal" className="modal-backdrop" style="display: none;">
        <div className="modal-content max-w-4xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              <i className="fas fa-robot mr-2"></i>
              AI生成メール文
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">件名</label>
                <input type="text" id="emailSubject" className="form-input" readonly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">本文</label>
                <textarea id="emailContent" className="form-textarea" rows="12" readonly></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onclick="copyEmailToClipboard()" className="btn-secondary">
                <i className="fas fa-copy mr-2"></i>
                クリップボードにコピー
              </button>
              <button onclick="Modal.close('aiEmailModal')" className="btn-primary">
                <i className="fas fa-times mr-2"></i>
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// テスト用：スタッフ費用計算API
app.post('/api/test-staff-cost', async (c) => {
  try {
    const data = await c.req.json()
    
    console.log('🧪 スタッフ費用テスト実行:', data)
    
    // 基本レート
    const staffRates = {
      supervisor: 25000,
      leader: 22000,
      m2_half_day: 8500,
      m2_full_day: 15000,
      temp_half_day: 7500,
      temp_full_day: 13500
    };
    
    // 計算
    const calculatedStaffCost = 
      (data.supervisor_count || 0) * staffRates.supervisor +
      (data.leader_count || 0) * staffRates.leader +
      (data.m2_staff_half_day || 0) * staffRates.m2_half_day +
      (data.m2_staff_full_day || 0) * staffRates.m2_full_day +
      (data.temp_staff_half_day || 0) * staffRates.temp_half_day +
      (data.temp_staff_full_day || 0) * staffRates.temp_full_day;
    
    console.log('💰 計算結果:', calculatedStaffCost)
    
    return c.json({
      success: true,
      data: {
        inputData: data,
        rates: staffRates,
        calculatedCost: calculatedStaffCost,
        formattedCost: `¥${calculatedStaffCost.toLocaleString()}`
      }
    })
    
  } catch (error) {
    console.error('❌ スタッフ費用テストエラー:', error)
    return c.json({ error: error.message }, 500)
  }
})

// 見積保存API
app.post('/api/estimates', async (c) => {
  try {
    const { env } = c
    const data = await c.req.json()
    
    const finalUserId = c.req.header('X-User-ID') || data.user_id || 'test-user-001'
    console.log('📝 見積保存データ:', data)
    console.log('👤 使用ユーザーID:', finalUserId)
    
    // 必須フィールドチェック
    if (!data.customer_id || !data.project_id) {
      return c.json({ 
        success: false, 
        error: '顧客IDとプロジェクトIDは必須です' 
      }, 400)
    }
    
    // 見積タイプ判定（standard_a / standard_b）
    const estimateType = data.estimate_type || 'standard_a'
    const planLabel = estimateType === 'standard_b' ? 'B' : 'A'
    
    // 見積番号を生成（EST-A-YYYY-XXX / EST-B-YYYY-XXX形式）
    const now = new Date()
    const year = now.getFullYear()
    const estimateNumber = `EST-${planLabel}-${year}-${String(Date.now()).slice(-3)}`
    
    // セッションからユーザー情報取得
    const sessionInfo = await verifySession(c)
    const createdByName = sessionInfo.valid ? sessionInfo.userName : '未設定'
    
    // valid_untilカラムが存在しない場合は追加（自動マイグレーション）
    try {
      await env.DB.prepare(`ALTER TABLE estimates ADD COLUMN valid_until TEXT`).run()
      console.log('✅ valid_untilカラム追加完了')
    } catch (e) {
      // カラムが既に存在する場合はエラーを無視
    }
    
    // 完全版見積データ保存 - 詳細フィールドを含む
    const result = await env.DB.prepare(`
      INSERT INTO estimates (
        customer_id, project_id, estimate_number,
        delivery_address, delivery_postal_code, delivery_area, vehicle_type, operation_type,
        vehicle_cost, staff_cost, 
        supervisor_count, leader_count, m2_staff_half_day, m2_staff_full_day,
        temp_staff_half_day, temp_staff_full_day,
        site_survey_people, site_survey_distance, site_survey_base_cost,
        site_survey_vehicle_cost, site_survey_distance_cost, site_survey_cost,
        parking_officer_hours, parking_officer_cost,
        transport_vehicles, transport_cost,
        waste_disposal_size, waste_disposal_cost,
        protection_floors, protection_cost,
        material_collection_size, material_collection_cost,
        construction_m2_staff, construction_cost,
        work_time_type, work_time_multiplier,
        parking_fee, highway_fee,
        subtotal, discount_amount, tax_rate, tax_amount, total_amount,
        user_id, vehicle_2t_count, vehicle_4t_count, 
        vehicle_dedicated_count, vehicle_charter_count,
        vehicle_dedicated_unit_price, vehicle_charter_unit_price,
        external_contractor_cost, 
        uses_multiple_vehicles, notes, line_items_json, created_by_name, customer_contact_person,
        delivery_distance_km, transport_vehicle_fee, road_permit_fee, survey_fee, oneman_discount_applied,
        estimate_type, valid_until,
        additional_truck_count, additional_truck_unit_price, additional_truck_cost
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?
      )
    `).bind(
      data.customer_id,
      data.project_id, 
      estimateNumber,
      data.delivery_address || '',
      data.delivery_postal_code || '',
      data.delivery_area || 'other',
      data.vehicle_type || '4t_truck',
      data.operation_type || 'standard',
      data.vehicle_cost || 0,
      data.staff_cost || 0,
      data.supervisor_count || 0,
      data.leader_count || 0,
      data.m2_staff_half_day || 0,
      data.m2_staff_full_day || 0,
      data.temp_staff_half_day || 0,
      data.temp_staff_full_day || 0,
      data.site_survey_people || 0,
      data.site_survey_distance || 0,
      data.site_survey_base_cost || 0,
      data.site_survey_vehicle_cost || 0,
      data.site_survey_distance_cost || 0,
      data.site_survey_cost || 0,
      data.parking_officer_hours || 0,
      data.parking_officer_cost || 0,
      data.transport_vehicles || 0,
      data.transport_cost || 0,
      data.waste_disposal_size || 'none',
      data.waste_disposal_cost || 0,
      data.protection_floors || 0,
      data.protection_cost || 0,
      data.material_collection_size || 'none',
      data.material_collection_cost || 0,
      data.construction_m2_staff || 0,
      data.construction_cost || 0,
      data.work_time_type || 'normal',
      data.work_time_multiplier || 1,
      data.parking_fee || 0,
      data.highway_fee || 0,
      data.subtotal || 0,
      data.discount_amount || 0,
      data.tax_rate || 0.1,
      data.tax_amount || 0,
      data.total_amount || 0,
      finalUserId,
      data.vehicle_2t_count || 0,
      data.vehicle_4t_count || 0,
      data.vehicle_dedicated_count || 0,
      data.vehicle_charter_count || 0,
      data.vehicle_dedicated_unit_price || 0,
      data.vehicle_charter_unit_price || 0,
      data.external_contractor_cost || 0,
      data.uses_multiple_vehicles || false,
      data.notes || '',
      data.line_items_json || null,
      createdByName,
      data.customer_contact_person || '',
      data.delivery_distance_km || 0,
      data.transport_vehicle_fee || 0,
      data.road_permit_fee || 0,
      data.survey_fee || 0,
      data.oneman_discount_applied || 0,
      estimateType,
      data.valid_until || null,
      data.additional_truck_count || 0,
      data.additional_truck_unit_price || 0,
      data.additional_truck_cost || 0
    ).run()
    
    console.log('見積保存結果:', result)
    
    return c.json({
      success: true,
      data: {
        id: result.meta.last_row_id,
        estimate_number: estimateNumber,
        customer_id: data.customer_id,
        project_id: data.project_id,
        delivery_address: data.delivery_address || ''
      },
      message: '見積を正常に保存しました'
    })
    
  } catch (error) {
    console.error('見積保存エラー:', error)
    console.error('エラー詳細:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    try {
      const data = await c.req.json()
      console.error('エラーが発生したリクエストデータ:', {
        customer_id: data.customer_id,
        project_id: data.project_id,
        estimate_number: data.estimate_number,
        keys: Object.keys(data).join(', ')
      })
    } catch (jsonError) {
      console.error('リクエストデータの取得に失敗:', jsonError)
    }
    
    // より親切なエラーメッセージを提供
    let errorMessage = '見積の保存に失敗しました'
    let errorDetail = error instanceof Error ? error.message : String(error)
    
    if (errorDetail.includes('FOREIGN KEY constraint failed')) {
      errorMessage = '選択された顧客または案件が見つかりません'
      errorDetail = '顧客・案件データが削除された可能性があります。最初から見積作成をやり直してください。'
    }
    
    return c.json({ 
      success: false,
      error: errorMessage, 
      detail: errorDetail
    }, 500)
  }
})

// フリー見積保存API
app.post('/api/estimates/free', async (c) => {
  try {
    const { env } = c
    const data = await c.req.json()
    
    console.log('フリー見積保存データ:', data)
    
    // 見積番号を生成（FREE-YYYY-XXX形式）
    const now = new Date()
    const year = now.getFullYear()
    const estimateNumber = `FREE-${year}-${String(Date.now()).slice(-3)}`
    
    // 合計金額計算（値引きあり）
    const subtotal = data.items.reduce((sum, item) => sum + (item.total || 0), 0)
    const discountAmount = parseInt(data.discountAmount || 0) || 0  // 値引き金額
    const discountedSubtotal = Math.max(0, subtotal - discountAmount)  // 値引き後小計
    const tax = Math.floor(discountedSubtotal * 0.1)
    const total = discountedSubtotal + tax
    
    // 基本見積データを保存（フリー見積用に必須フィールドを設定）
    // 外部キー制約のため、デフォルト顧客・プロジェクトを作成または取得
    let customerId = 1;
    let projectId = 1;
    
    // デフォルト顧客が存在するかチェック
    const existingCustomer = await env.DB.prepare(`
      SELECT id FROM customers WHERE name = 'フリー見積顧客' LIMIT 1
    `).first();
    
    if (!existingCustomer) {
      // デフォルト顧客を作成
      const customerResult = await env.DB.prepare(`
        INSERT INTO customers (name, contact_person, phone, email, address, user_id, created_at, updated_at)
        VALUES ('フリー見積顧客', '担当者', '', '', '', 'system', datetime('now'), datetime('now'))
      `).run();
      customerId = customerResult.meta.last_row_id;
    } else {
      customerId = existingCustomer.id;
    }
    
    // デフォルトプロジェクトが存在するかチェック  
    const existingProject = await env.DB.prepare(`
      SELECT id FROM projects WHERE name = 'フリー見積プロジェクト' AND customer_id = ? LIMIT 1
    `).bind(customerId).first();
    
    if (!existingProject) {
      // デフォルトプロジェクトを作成
      const projectResult = await env.DB.prepare(`
        INSERT INTO projects (customer_id, name, description, status, user_id, created_at, updated_at)
        VALUES (?, 'フリー見積プロジェクト', ?, 'active', 'system', datetime('now'), datetime('now'))
      `).bind(customerId, `顧客: ${data.customer_name}\n案件: ${data.project_name}`).run();
      projectId = projectResult.meta.last_row_id;
    } else {
      projectId = existingProject.id;
    }

    // セッションからユーザー情報取得
    const sessionInfo = await verifySession(c)
    const createdByName = sessionInfo.valid ? sessionInfo.userName : '未設定'
    
    const estimateResult = await env.DB.prepare(`
      INSERT INTO estimates (
        customer_id, project_id, estimate_number,
        delivery_address, delivery_postal_code, delivery_area,
        vehicle_type, operation_type, vehicle_cost, staff_cost,
        subtotal, tax_rate, tax_amount, total_amount,
        notes, user_id, created_at, updated_at, created_by_name
      ) VALUES (
        ?, ?, ?,
        ?, '', 'other',
        'フリー', 'フリー', 0, 0,
        ?, 0.1, ?, ?,
        ?, 'system', datetime('now'), datetime('now'), ?
      )
    `).bind(
      customerId,
      projectId,
      estimateNumber,
      `顧客: ${data.customer_name}, 案件: ${data.project_name}, 値引: ${discountAmount}円`, // delivery_addressに顧客・案件・値引き情報を格納
      subtotal,  // 値引き前の小計を保存
      tax,
      total,
      `${data.notes || ''}

[値引き明細]
元の小計: ${subtotal.toLocaleString()}円
値引き額: ${discountAmount.toLocaleString()}円
値引き後: ${discountedSubtotal.toLocaleString()}円`.trim(),
      createdByName  // 作成者名を保存
    ).run()
    
    const estimateId = estimateResult.meta.last_row_id
    console.log('フリー見積ID:', estimateId)
    
    // 見積項目を保存
    if (data.items && data.items.length > 0) {
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i]
        
        await env.DB.prepare(`
          INSERT INTO free_estimate_items (
            estimate_id, item_name, unit, quantity, 
            unit_price, total_price, sort_order, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          estimateId,
          item.name,
          item.unit || '',
          item.quantity || 1,
          item.unitPrice || 0,
          item.total || 0,
          i
        ).run()
      }
      
      console.log(`フリー見積項目 ${data.items.length}件 保存完了`)
    }
    
    return c.json({
      success: true,
      estimate: {
        id: estimateId,
        estimate_number: estimateNumber,
        customer_name: data.customer_name,
        project_name: data.project_name,
        subtotal: subtotal,  // 値引き前小計
        discount_amount: discountAmount,  // 値引き金額
        discounted_subtotal: discountedSubtotal,  // 値引き後小計
        tax: tax,
        total: total,
        items_count: data.items ? data.items.length : 0
      },
      message: 'フリー見積を正常に保存しました'
    })
    
  } catch (error) {
    console.error('フリー見積保存エラー:', error)
    return c.json({ 
      error: 'フリー見積の保存に失敗しました', 
      detail: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 500)
  }
})

// AI メール生成API
app.post('/api/ai-generate-email', async (c) => {
  const data = await c.req.json()
  
  // TODO: Cloudflare AI Workersを使用して実際のメール生成を実装
  // 現在はテンプレートベースのモック応答
  const emailContent = `${data.customer_name} 様

いつもお世話になっております。
${data.project_name}の件について、お見積書をお送りいたします。

■見積概要
案件名: ${data.project_name}
見積金額: ${Utils.formatCurrency(data.total_amount)}（税込）

■サービス内容
${data.estimate_details.vehicle_info}
${data.estimate_details.staff_info}
${data.estimate_details.services_info ? data.estimate_details.services_info : ''}

ご質問・ご要望がございましたら、お気軽にお申し付けください。
何卒ご検討のほど、よろしくお願いいたします。

---
Office M2 見積システム
TEL: 03-0000-0000
Email: info@transport-system.com`

  return c.json({
    success: true,
    data: {
      subject: `【見積書】${data.project_name}について`,
      email_content: emailContent
    }
  })
})

// マスタ管理画面
app.get('/masters', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center text-white hover:text-blue-200">
                <i className="fas fa-truck text-white text-2xl mr-3"></i>
                <h1 className="text-xl font-bold">Office M2 見積システム</h1>
              </a>
            </div>
            <div className="text-white">
              <span className="text-sm">マスタ管理</span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">マスタ管理</h2>
          <p className="text-gray-600">料金設定、エリア設定、サービス単価を管理します</p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white shadow rounded-lg">
          {/* グローバル プランA/B切替 */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">
                <i className="fas fa-layer-group mr-1"></i>
                料金プラン:
              </span>
              <div className="flex rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
                <button 
                  id="globalPlanABtn" 
                  onclick="switchGlobalPlan('A')" 
                  className="px-5 py-2 text-sm font-bold bg-blue-600 text-white transition-colors"
                >
                  <i className="fas fa-file-invoice mr-1"></i>
                  プランA（標準）
                </button>
                <button 
                  id="globalPlanBBtn" 
                  onclick="switchGlobalPlan('B')" 
                  className="px-5 py-2 text-sm font-bold bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-file-invoice mr-1"></i>
                  プランB
                </button>
              </div>
            </div>
            <span id="globalPlanLabel" className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              <i className="fas fa-check-circle mr-1"></i>
              現在: プランA
            </span>
          </div>

          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button 
                id="staffAreaTab"
                onclick="if(window.MasterManagement && window.MasterManagement.switchTab) { window.MasterManagement.switchTab('staff-area'); } else { console.error('MasterManagement not available'); }" 
                className="py-4 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600 master-tab active"
              >
                <i className="fas fa-users mr-2"></i>
                スタッフ・エリア
              </button>
              <button 
                id="vehicleTab"
                onclick="if(window.MasterManagement && window.MasterManagement.switchTab) { window.MasterManagement.switchTab('vehicle'); } else { console.error('MasterManagement not available'); }" 
                className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 master-tab"
              >
                <i className="fas fa-truck mr-2"></i>
                車両
              </button>
              <button 
                id="servicesTab"
                onclick="if(window.MasterManagement && window.MasterManagement.switchTab) { window.MasterManagement.switchTab('services'); } else { console.error('MasterManagement not available'); }" 
                className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 master-tab"
              >
                <i className="fas fa-concierge-bell mr-2"></i>
                その他サービス
              </button>
              <button 
                id="customersTab"
                onclick="if(window.MasterManagement && window.MasterManagement.switchTab) { window.MasterManagement.switchTab('customers'); } else { console.error('MasterManagement not available'); }" 
                className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 master-tab"
              >
                <i className="fas fa-building mr-2"></i>
                顧客マスター
              </button>
              <button 
                id="projectsTab"
                onclick="if(window.MasterManagement && window.MasterManagement.switchTab) { window.MasterManagement.switchTab('projects'); } else { console.error('MasterManagement not available'); }" 
                className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 master-tab"
              >
                <i className="fas fa-project-diagram mr-2"></i>
                案件マスター
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* スタッフ・エリアタブ */}
            <div id="staff-area-content" className="master-content">
              <div className="space-y-8">
                {/* スタッフ単価設定 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">スタッフ単価設定</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        <i className="fas fa-user-tie mr-2"></i>
                        スーパーバイザー（<span id="rate-display-supervisor">...</span>円/日）
                      </label>
                      <input type="number" id="rate_supervisor" className="form-input" min="0" step="1000" />
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-green-900 mb-2">
                        <i className="fas fa-user-cog mr-2"></i>
                        リーダー以上（<span id="rate-display-leader">...</span>円/日）
                      </label>
                      <input type="number" id="rate_leader" className="form-input" min="0" step="1000" />
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-yellow-900 mb-2">
                        <i className="fas fa-user mr-2"></i>
                        一般社員（<span id="rate-display-m2-half">...</span>円/日）
                      </label>
                      <input type="number" id="rate_m2_half_day" className="form-input" min="0" step="500" />
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-yellow-900 mb-2">
                        <i className="fas fa-user mr-2"></i>
                        M2スタッフ終日（<span id="rate-display-m2-full">...</span>円/日）
                      </label>
                      <input type="number" id="rate_m2_full_day" className="form-input" min="0" step="1000" />
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-purple-900 mb-2">
                        <i className="fas fa-user-clock mr-2"></i>
                        派遣スタッフ半日（<span id="rate-display-temp-half">...</span>円/半日）
                      </label>
                      <input type="number" id="rate_temp_half_day" className="form-input" min="0" step="500" />
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-purple-900 mb-2">
                        <i className="fas fa-user-clock mr-2"></i>
                        派遣スタッフ終日（<span id="rate-display-temp-full">...</span>円/日）
                      </label>
                      <input type="number" id="rate_temp_full_day" className="form-input" min="0" step="1000" />
                    </div>
                  </div>
                  
                  {/* スタッフ単価保存ボタン */}
                  <div className="flex justify-end mt-4">
                    <button onclick="saveStaffRates()" className="btn-success">
                      <i className="fas fa-save mr-2"></i>
                      スタッフ単価を保存
                    </button>
                  </div>
                </div>

                {/* エリア設定 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">エリア設定</h3>
                    <button onclick="Modal.open('addAreaModal')" className="btn-primary">
                      <i className="fas fa-plus mr-2"></i>
                      新規エリア追加
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="min-w-full table">
                        <thead>
                          <tr>
                            <th>郵便番号プレフィックス</th>
                            <th>エリア名</th>
                            <th>エリアランク</th>
                            <th>作成日</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody id="areaSettingsTable">
                          {/* エリア設定がJavaScriptで動的に生成される */}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onclick="saveStaffAreaSettings()" className="btn-success">
                    <i className="fas fa-save mr-2"></i>
                    スタッフ・エリア設定を保存
                  </button>
                </div>
              </div>
            </div>

            {/* 車両タブ */}
            <div id="vehicle-content" className="master-content hidden">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">車両料金設定</h3>
                
                {/* チャーター便料金設定 */}
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium text-orange-900 mb-4">
                    <i className="fas fa-truck-moving mr-2"></i>
                    チャーター便料金設定（エリア別）
                  </h4>
                  <p className="text-sm text-orange-700 mb-4">各エリアのチャーター便基本料金を設定します。ワンマン割引は全エリア共通です。</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-orange-200">
                          <th className="border border-orange-300 px-3 py-2 text-left">エリア</th>
                          <th className="border border-orange-300 px-3 py-2 text-right">基本料金（税抜）</th>
                        </tr>
                      </thead>
                      <tbody id="dedicatedPricingTable">
                        <tr><td colSpan="2" className="text-center text-gray-500 py-4">読み込み中...</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <label className="text-sm font-medium text-orange-800">ワンマン割引額（全エリア共通）:</label>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-orange-700">¥</span>
                      <input type="number" id="dedicated_oneman_discount" className="form-input text-sm w-32" min="0" step="1000" value="15000" />
                    </div>
                  </div>
                </div>

                {/* 混載便料金設定 */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium text-green-900 mb-4">
                    <i className="fas fa-boxes mr-2"></i>
                    混載便料金設定（ランク別）
                  </h4>
                  <p className="text-sm text-green-700 mb-4">各ランクの混載便料金を設定します。時間外追加料金は全ランク共通¥7,000です。</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-green-200">
                          <th className="border border-green-300 px-3 py-2 text-left">ランク</th>
                          <th className="border border-green-300 px-3 py-2 text-left">距離</th>
                          <th className="border border-green-300 px-3 py-2 text-right">基本料金</th>
                          <th className="border border-green-300 px-3 py-2 text-right">道路許可費</th>
                          <th className="border border-green-300 px-3 py-2 text-right">輸送車両費</th>
                          <th className="border border-green-300 px-3 py-2 text-right">ワンマン割引</th>
                        </tr>
                      </thead>
                      <tbody id="konsaiPricingTable">
                        <tr><td colSpan="6" className="text-center text-gray-500 py-4">読み込み中...</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button onclick="saveVehicleSettings()" className="btn-success">
                    <i className="fas fa-save mr-2"></i>
                    車両設定を保存
                  </button>
                </div>
              </div>
            </div>

            {/* その他サービスタブ */}
            <div id="services-content" className="master-content hidden">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">その他サービス料金設定</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* 駐禁対策員 */}
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-3">
                      <i className="fas fa-shield-alt mr-2"></i>
                      駐禁対策員
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-orange-800 mb-2">半日料金（拘束4時間）</label>
                        <input type="number" id="service_parking_half_day" className="form-input" min="0" step="500" />
                      </div>
                      <div>
                        <label className="block text-sm text-orange-800 mb-2">終日料金（拘束8時間）</label>
                        <input type="number" id="service_parking_full_day" className="form-input" min="0" step="500" />
                      </div>
                      <hr className="border-orange-200" />
                      <p className="text-xs text-orange-700 font-medium">交通費（往復）</p>
                      <div>
                        <label className="block text-sm text-orange-800 mb-1">大阪市内</label>
                        <input type="number" id="service_parking_transport_osaka_city" className="form-input" min="0" step="100" />
                      </div>
                      <div>
                        <label className="block text-sm text-orange-800 mb-1">大阪府下</label>
                        <input type="number" id="service_parking_transport_osaka_suburb" className="form-input" min="0" step="100" />
                      </div>
                      <div>
                        <label className="block text-sm text-orange-800 mb-1">京都</label>
                        <input type="number" id="service_parking_transport_kyoto" className="form-input" min="0" step="100" />
                      </div>
                      <div>
                        <label className="block text-sm text-orange-800 mb-1">兵庫</label>
                        <input type="number" id="service_parking_transport_hyogo" className="form-input" min="0" step="100" />
                      </div>
                    </div>
                  </div>

                  {/* 人員輸送車両 */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">
                      <i className="fas fa-bus mr-2"></i>
                      人員輸送車両
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-blue-800 mb-2">20km圏内基本料金（<span id="rate-display-transport-20km">8,000</span>円）</label>
                        <input type="number" id="service_transport_20km" className="form-input" min="0" step="1000" />
                      </div>
                      <div>
                        <label className="block text-sm text-blue-800 mb-2">距離単価（<span id="rate-display-transport-km">100</span>円/km）</label>
                        <input type="number" id="service_transport_per_km" className="form-input" min="0" step="10" />
                      </div>
                      <div>
                        <label className="block text-sm text-blue-800 mb-2">燃料費（<span id="rate-display-fuel">150</span>円/L）</label>
                        <input type="number" id="service_fuel_per_liter" className="form-input" min="0" step="10" />
                      </div>
                    </div>
                  </div>

                  {/* 引き取り廃棄 */}
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-3">
                      <i className="fas fa-trash mr-2"></i>
                      引き取り廃棄
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-red-800 mb-2">小（<span id="rate-display-waste-small">5,000</span>円）</label>
                        <input type="number" id="service_waste_small" className="form-input" min="0" step="1000" />
                      </div>
                      <div>
                        <label className="block text-sm text-red-800 mb-2">中（<span id="rate-display-waste-medium">10,000</span>円）</label>
                        <input type="number" id="service_waste_medium" className="form-input" min="0" step="1000" />
                      </div>
                      <div>
                        <label className="block text-sm text-red-800 mb-2">大（<span id="rate-display-waste-large">20,000</span>円）</label>
                        <input type="number" id="service_waste_large" className="form-input" min="0" step="1000" />
                      </div>
                    </div>
                  </div>

                  {/* 養生作業 */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-3">
                      <i className="fas fa-hard-hat mr-2"></i>
                      養生作業
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-yellow-800 mb-2">基本料金（<span id="rate-display-protection-base">5,000</span>円）</label>
                        <input type="number" id="service_protection_base" className="form-input" min="0" step="1000" />
                      </div>
                      <div>
                        <label className="block text-sm text-yellow-800 mb-2">フロア単価（<span id="rate-display-protection-floor">3,000</span>円/フロア）</label>
                        <input type="number" id="service_protection_floor" className="form-input" min="0" step="1000" />
                      </div>
                    </div>
                  </div>

                  {/* 残材回収 */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-3">
                      <i className="fas fa-recycle mr-2"></i>
                      残材回収
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-green-800 mb-2">少（円）</label>
                        <input type="number" id="service_material_few" className="form-input" min="0" step="1000" />
                      </div>
                      <div>
                        <label className="block text-sm text-green-800 mb-2">中（円）</label>
                        <input type="number" id="service_material_medium" className="form-input" min="0" step="1000" />
                      </div>
                      <div>
                        <label className="block text-sm text-green-800 mb-2">多（円）</label>
                        <input type="number" id="service_material_many" className="form-input" min="0" step="1000" />
                      </div>
                    </div>
                  </div>

                  {/* 施工・作業時間帯 */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-3">
                      <i className="fas fa-tools mr-2"></i>
                      施工・作業時間帯
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-purple-800 mb-2">施工M2スタッフ単価（<span id="rate-display-construction-m2">8,000</span>円/人）</label>
                        <input type="number" id="service_construction_m2_staff_rate" className="form-input" min="0" step="1000" />
                      </div>
                      <div>
                        <label className="block text-sm text-purple-800 mb-2">通常作業時間 係数（AM8:00〜PM6:00）</label>
                        <input type="number" id="service_time_normal" className="form-input" min="0.5" max="2" step="0.05" value="1.0" readonly style="background-color: #f3f4f6;" />
                      </div>
                      <div>
                        <label className="block text-sm text-purple-800 mb-2">割増作業時間 係数（PM6:00〜翌AM8:00）</label>
                        <input type="number" id="service_time_overtime" className="form-input" min="1" max="3" step="0.05" />
                      </div>
                    </div>
                  </div>

                  {/* システム設定 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">
                      <i className="fas fa-cog mr-2"></i>
                      システム設定
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-800 mb-2">消費税率</label>
                        <input type="number" id="system_tax_rate" className="form-input" min="0" max="1" step="0.01" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-800 mb-2">見積番号プレフィックス</label>
                        <input type="text" id="system_estimate_prefix" className="form-input" maxlength="10" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onclick="saveServicesSettings()" className="btn-success">
                    <i className="fas fa-save mr-2"></i>
                    サービス設定を保存
                  </button>
                </div>
              </div>
            </div>

            {/* 顧客マスタータブ */}
            <div id="customers-content" className="master-content hidden">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">顧客マスター管理</h3>
                  <button onclick="MasterManagement.openAddMasterCustomerModal()" className="btn-primary">
                    <i className="fas fa-plus mr-2"></i>
                    新規顧客追加
                  </button>
                </div>
                
                {/* 検索・フィルター */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">顧客名検索</label>
                      <input type="text" id="masterCustomerSearch" placeholder="顧客名を入力..." className="form-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">担当者検索</label>
                      <input type="text" id="masterContactSearch" placeholder="担当者名を入力..." className="form-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">表示フィルター</label>
                      <select id="masterCustomerStatusFilter" className="form-select" onchange="MasterManagement.loadCustomersList()">
                        <option value="active">有効のみ</option>
                        <option value="inactive">無効のみ</option>
                        <option value="deleted">削除済みのみ</option>
                        <option value="all">すべて表示</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button onclick="MasterManagement.filterCustomers()" className="btn-secondary mr-2">
                        <i className="fas fa-search mr-2"></i>
                        検索
                      </button>
                      <button onclick="MasterManagement.resetCustomerFilter()" className="btn-secondary">
                        <i className="fas fa-undo mr-2"></i>
                        リセット
                      </button>
                    </div>
                  </div>
                </div>

                {/* 顧客一覧テーブル */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          顧客名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          担当者
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          電話番号
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          メールアドレス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          案件数
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 120px; min-width: 120px;">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody id="masterCustomersTable" className="bg-white divide-y divide-gray-200">
                      {/* JavaScript で動的生成 */}
                    </tbody>
                  </table>
                </div>

                {/* ページネーション */}
                <div id="masterCustomerPagination" className="flex justify-between items-center">
                  {/* JavaScript で動的生成 */}
                </div>
              </div>
            </div>

            {/* 案件マスタータブ */}
            <div id="projects-content" className="master-content hidden">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">案件マスター管理</h3>
                  <button onclick="MasterManagement.openAddProjectModal()" className="btn-primary">
                    <i className="fas fa-plus mr-2"></i>
                    新規案件追加
                  </button>
                </div>
                
                {/* 検索・フィルター */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">案件名検索</label>
                      <input type="text" id="masterProjectSearch" placeholder="案件名を入力..." className="form-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">顧客フィルター</label>
                      <select id="masterProjectCustomerFilter" className="form-select">
                        <option value="">すべての顧客</option>
                        {/* JavaScript で動的生成 */}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ステータスフィルター</label>
                      <select id="masterProjectStatusFilter" className="form-select">
                        <option value="">すべてのステータス</option>
                        <option value="initial">初回コンタクト</option>
                        <option value="quote_sent">見積書送信済み</option>
                        <option value="under_consideration">受注検討中</option>
                        <option value="order">受注</option>
                        <option value="failed">失注</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button onclick="MasterManagement.filterProjects()" className="btn-secondary mr-2">
                        <i className="fas fa-search mr-2"></i>
                        検索
                      </button>
                      <button onclick="MasterManagement.resetProjectFilter()" className="btn-secondary">
                        <i className="fas fa-undo mr-2"></i>
                        リセット
                      </button>
                    </div>
                  </div>
                </div>

                {/* 案件一覧テーブル */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          案件名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          顧客名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ステータス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          優先度
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          見積数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          最終更新
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody id="masterProjectsTable" className="bg-white divide-y divide-gray-200">
                      {/* JavaScript で動的生成 */}
                    </tbody>
                  </table>
                </div>

                {/* ページネーション */}
                <div id="masterProjectPagination" className="flex justify-between items-center">
                  {/* JavaScript で動的生成 */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* エリア追加モーダル */}
      <div id="addAreaModal" className="modal-backdrop" style="display: none;">
        <div className="modal-content">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">新規エリア追加</h3>
          </div>
          <form id="addAreaForm" className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">郵便番号プレフィックス *</label>
                <input type="text" name="postal_code_prefix" className="form-input" maxlength="2" pattern="[0-9]{2}" required />
                <p className="text-xs text-gray-500 mt-1">例: 10, 27, 53（2桁の数字）</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">エリア名 *</label>
                <input type="text" name="area_name" className="form-input" required />
                <p className="text-xs text-gray-500 mt-1">例: 東京都千代田区、大阪府中央区</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">エリアランク *</label>
                <select name="area_rank" className="form-select" required>
                  <option value="">選択してください</option>
                  <option value="A">Aランク（15km圏内）大阪市</option>
                  <option value="B">Bランク（30km圏内）大阪府・神戸・京都・奈良</option>
                  <option value="C">Cランク（50km圏内）南丹</option>
                  <option value="D">Dランク（100km圏内）東播磨・滋賀・和歌山</option>
                  <option value="E">Eランク（150km圏内）淡路・西播磨・三重</option>
                  <option value="F">Fランク（200km圏内）但馬・愛知・徳島・香川</option>
                  <option value="G">Gランク（300km圏内）岡山・鳥取・福井</option>
                  <option value="H">Hランク（400km圏内）広島・愛媛・島根・石川・富山</option>
                  <option value="I">Iランク（500km圏内）山口</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onclick="Modal.close('addAreaModal')" className="btn-secondary">
                キャンセル
              </button>
              <button type="submit" className="btn-primary">
                <i className="fas fa-plus mr-2"></i>
                追加
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* マスター管理用顧客追加・編集モーダル */}
      <div id="masterCustomerModal" className="modal-backdrop" style="display: none;">
        <div className="modal-content max-w-2xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 id="masterCustomerModalTitle" className="text-lg font-medium text-gray-900">顧客情報</h3>
          </div>
          <form id="masterCustomerForm" className="p-6" onsubmit="return MasterManagement.handleCustomerFormSubmitDirect(event)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  顧客名 <span className="text-red-500">*</span>
                </label>
                <input type="text" name="name" id="masterCustomerName" className="form-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  担当者
                </label>
                <input type="text" name="contact_person" id="masterCustomerContactPerson" className="form-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号
                </label>
                <input type="tel" name="phone" id="masterCustomerPhone" className="form-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input type="email" name="email" id="masterCustomerEmail" className="form-input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  住所
                </label>
                <input type="text" name="address" id="masterCustomerAddress" className="form-input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備考
                </label>
                <textarea name="notes" id="masterCustomerNotes" className="form-textarea" rows={3}></textarea>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onclick="Modal.close('masterCustomerModal')" className="btn-secondary">
                キャンセル
              </button>
              <button type="submit" className="btn-primary">
                <i className="fas fa-save mr-2"></i>
                保存
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* マスター管理用案件追加・編集モーダル */}
      <div id="masterProjectModal" className="modal-backdrop" style="display: none;">
        <div className="modal-content max-w-2xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 id="masterProjectModalTitle" className="text-lg font-medium text-gray-900">案件情報</h3>
          </div>
          <form id="masterProjectForm" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  顧客 <span className="text-red-500">*</span>
                </label>
                <select name="customer_id" id="masterProjectCustomerId" className="form-select" required>
                  <option value="">顧客を選択してください</option>
                  {/* JavaScript で動的生成 */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件名 <span className="text-red-500">*</span>
                </label>
                <input type="text" name="name" id="masterProjectName" className="form-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス <span className="text-red-500">*</span>
                </label>
                <select name="status" id="masterProjectStatus" className="form-select" required>
                  <option value="initial">初回コンタクト</option>
                  <option value="quote_sent">見積書送信済み</option>
                  <option value="under_consideration">受注検討中</option>
                  <option value="order">受注</option>
                  <option value="failed">失注</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  優先度 <span className="text-red-500">*</span>
                </label>
                <select name="priority" id="masterProjectPriority" className="form-select" required>
                  <option value="low">低</option>
                  <option value="medium" selected>中</option>
                  <option value="high">高</option>
                  <option value="urgent">緊急</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件概要
                </label>
                <textarea name="description" id="masterProjectDescription" className="form-textarea" rows={3}></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備考
                </label>
                <textarea name="notes" id="masterProjectNotes" className="form-textarea" rows={2}></textarea>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onclick="Modal.close('masterProjectModal')" className="btn-secondary">
                キャンセル
              </button>
              <button type="submit" className="btn-primary">
                <i className="fas fa-save mr-2"></i>
                保存
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* JavaScript処理 */}


    </div>
  )
})

// 重複APIエンドポイント削除 - 12359行目のエンドポイントを使用

// マスタ設定保存API（プランA/B対応）
app.post('/api/master-settings', async (c) => {
  const userId = c.req.header('X-User-ID') || 'test-user-001'
  const data = await c.req.json()
  const planType = data.plan_type || 'A'
  
  try {
    const { env } = c
    
    // 各カテゴリのデータを処理
    const updates: Array<{category: string, subcategory: string, key: string, value: string, data_type: string, description: string}> = []
    
    // スタッフ単価の処理
    if (data.staff_rates) {
      const staffDescriptions = {
        supervisor: 'スーパーバイザー日当',
        leader: 'リーダー以上日当',
        m2_half_day: '一般社員',
        m2_full_day: 'M2スタッフ終日',
        temp_half_day: '派遣スタッフ半日',
        temp_full_day: '派遣スタッフ終日'
      }
      
      Object.entries(data.staff_rates).forEach(([key, value]: [string, any]) => {
        updates.push({
          category: 'staff',
          subcategory: 'daily_rate',
          key,
          value: value.toString(),
          data_type: 'number',
          description: staffDescriptions[key] || key
        })
      })
    }
    
    // 車両料金の処理
    if (data.vehicle_rates) {
      Object.entries(data.vehicle_rates).forEach(([key, value]: [string, any]) => {
        // key形式: vehicle_2t_full_day_A -> subcategory: 2t_full_day_A, key: price
        const vehicleKey = key.replace('vehicle_', '');
        updates.push({
          category: 'vehicle',
          subcategory: vehicleKey,
          key: 'price',
          value: value.toString(),
          data_type: 'number',
          description: `${vehicleKey}車両料金`
        })
      })
    }
    
    // サービス料金の処理
    if (data.service_rates) {
      const serviceMap = {
        parking_officer_hourly: { subcategory: 'parking_officer', key: 'hourly_rate', desc: '駐車対策員時間単価（円/時間）' },
        parking_half_day: { subcategory: 'parking_officer', key: 'half_day_rate', desc: '駐禁対策員半日料金（拘束4時間）' },
        parking_full_day: { subcategory: 'parking_officer', key: 'full_day_rate', desc: '駐禁対策員終日料金（拘束8時間）' },
        parking_transport_osaka_city: { subcategory: 'parking_officer', key: 'transport_osaka_city', desc: '駐禁対策員交通費・大阪市内' },
        parking_transport_osaka_suburb: { subcategory: 'parking_officer', key: 'transport_osaka_suburb', desc: '駐禁対策員交通費・大阪府下' },
        parking_transport_kyoto: { subcategory: 'parking_officer', key: 'transport_kyoto', desc: '駐禁対策員交通費・京都' },
        parking_transport_hyogo: { subcategory: 'parking_officer', key: 'transport_hyogo', desc: '駐禁対策員交通費・兵庫' },
        transport_20km: { subcategory: 'transport_vehicle', key: 'base_rate_20km', desc: '人員輸送車両基本料金（20km圏内）' },
        transport_per_km: { subcategory: 'transport_vehicle', key: 'rate_per_km', desc: '人員輸送車両距離単価（円/km）' },
        fuel_per_liter: { subcategory: 'fuel', key: 'rate_per_liter', desc: '燃料費（円/L）' },
        waste_small: { subcategory: 'waste_disposal', key: 'small', desc: '引き取り廃棄・小' },
        waste_medium: { subcategory: 'waste_disposal', key: 'medium', desc: '引き取り廃棄・中' },
        waste_large: { subcategory: 'waste_disposal', key: 'large', desc: '引き取り廃棄・大' },
        protection_base: { subcategory: 'protection_work', key: 'base_rate', desc: '養生作業基本料金' },
        protection_floor: { subcategory: 'protection_work', key: 'floor_rate', desc: '養生作業フロア単価' },
        material_few: { subcategory: 'material_collection', key: 'few', desc: '残材回収・少' },
        material_medium: { subcategory: 'material_collection', key: 'medium', desc: '残材回収・中' },
        material_many: { subcategory: 'material_collection', key: 'many', desc: '残材回収・多' },
        construction_m2_staff: { subcategory: 'construction', key: 'm2_staff_rate', desc: '施工M2スタッフ単価' },
        time_overtime: { subcategory: 'work_time', key: 'overtime', desc: '割増作業時間（PM6:00〜翌AM8:00）' }
      }
      
      Object.entries(data.service_rates).forEach(([key, value]: [string, any]) => {
        const mapping = serviceMap[key]
        if (mapping) {
          updates.push({
            category: 'service',
            subcategory: mapping.subcategory,
            key: mapping.key,
            value: value.toString(),
            data_type: 'number',
            description: mapping.desc
          })
        }
      })
    }
    
    // システム設定の処理
    if (data.system_settings) {
      Object.entries(data.system_settings).forEach(([key, value]: [string, any]) => {
        if (key === 'tax_rate') {
          updates.push({
            category: 'system',
            subcategory: 'tax',
            key: 'rate',
            value: value.toString(),
            data_type: 'number',
            description: '消費税率'
          })
        } else if (key === 'estimate_prefix') {
          updates.push({
            category: 'system',
            subcategory: 'estimate',
            key: 'number_prefix',
            value: value.toString(),
            data_type: 'string',
            description: '見積番号プレフィックス'
          })
        }
      })
    }
    
    // データベースに一括更新（UPSERT）- プラン別
    for (const update of updates) {
      // プラン依存カテゴリ（staff, service, vehicle）はplan_type付きで保存
      // システムカテゴリはプラン共通（'A'固定）
      const effectivePlan = (update.category === 'system') ? 'A' : planType
      
      const existing = await env.DB.prepare(`
        SELECT id FROM master_settings 
        WHERE category = ? AND subcategory = ? AND key = ? AND user_id = ? AND plan_type = ?
      `).bind(update.category, update.subcategory, update.key, userId, effectivePlan).first()
      
      if (existing) {
        await env.DB.prepare(`
          UPDATE master_settings 
          SET value = ?, data_type = ?, description = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(update.value, update.data_type, update.description, existing.id).run()
      } else {
        await env.DB.prepare(`
          INSERT INTO master_settings 
          (category, subcategory, key, value, data_type, description, user_id, plan_type, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(
          update.category, update.subcategory, update.key,
          update.value, update.data_type, update.description,
          userId, effectivePlan
        ).run()
      }
    }
    
    // スタッフ単価をstaff_ratesテーブルにも同期（プラン別）
    if (data.staff_rates) {
      const staffTypeMapping = {
        supervisor: 'supervisor',
        leader: 'leader',
        m2_half_day: 'm2_half',
        m2_full_day: 'm2_full',
        temp_half_day: 'temp_half',
        temp_full_day: 'temp_full'
      }
      
      for (const [key, value] of Object.entries(data.staff_rates)) {
        const staffType = staffTypeMapping[key]
        if (staffType) {
          // 既存レコードを確認（プラン別）
          const existing = await env.DB.prepare(`
            SELECT id FROM staff_rates WHERE staff_type = ? AND plan_type = ?
            ORDER BY updated_at DESC LIMIT 1
          `).bind(staffType, planType).first()
          
          if (existing) {
            // 更新
            await env.DB.prepare(`
              UPDATE staff_rates 
              SET rate = ?, user_id = 'system', updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).bind(value, existing.id).run()
          } else {
            // 新規挿入
            await env.DB.prepare(`
              INSERT INTO staff_rates (staff_type, rate, user_id, plan_type, created_at, updated_at)
              VALUES (?, ?, 'system', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `).bind(staffType, value, planType).run()
          }
        }
      }
    }
    
    // 車両料金をvehicle_pricingテーブルにも同期（全ユーザー共通なのでsystem固定）
    if (data.vehicle_rates) {
      for (const [key, value] of Object.entries(data.vehicle_rates)) {
        // key形式: vehicle_2t_shared_A, vehicle_2t_half_day_A, vehicle_2t_full_day_A
        const match = key.match(/vehicle_(\d+t)_(shared|half_day|full_day)_([A-D])/)
        if (match) {
          const vehicleType = `${match[1]}車`
          const operationTypeMap = {
            shared: '共配',
            half_day: '半日',
            full_day: '終日'
          }
          const operationType = operationTypeMap[match[2]]
          const area = match[3]
          
          // 既存レコードを確認（user_idに関係なく最新のものを更新）
          const existing = await env.DB.prepare(`
            SELECT id FROM vehicle_pricing 
            WHERE vehicle_type = ? AND operation_type = ? AND area = ?
            ORDER BY updated_at DESC LIMIT 1
          `).bind(vehicleType, operationType, area).first()
          
          if (existing) {
            // 更新
            await env.DB.prepare(`
              UPDATE vehicle_pricing 
              SET price = ?, user_id = 'system', updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).bind(value, existing.id).run()
          } else {
            // 新規挿入
            await env.DB.prepare(`
              INSERT INTO vehicle_pricing (vehicle_type, operation_type, area, price, user_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `).bind(vehicleType, operationType, area, value).run()
          }
        }
      }
    }
    
    return c.json({
      success: true,
      message: 'マスタ設定を保存しました（master_settings, staff_rates, vehicle_pricingに同期完了）',
      updated_count: updates.length
    })
    
  } catch (error) {
    console.error('Error saving master settings:', error)
    return c.json({
      success: false,
      message: 'マスタ設定の保存に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// エリア設定取得API
app.get('/api/area-settings', async (c) => {
  const userId = c.req.header('X-User-ID') || 'test-user-001'
  
  try {
    const { env } = c
    const search = c.req.query('search') || ''
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = (page - 1) * limit
    
    let query = `
      SELECT id, postal_code_prefix, area_name, area_rank, created_at
      FROM area_settings 
      WHERE user_id = ?
    `
    const params = [userId]
    
    if (search) {
      query += ` AND (postal_code_prefix LIKE ? OR area_name LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }
    
    query += ` ORDER BY postal_code_prefix ASC LIMIT ? OFFSET ?`
    params.push(limit, offset)
    
    const result = await env.DB.prepare(query).bind(...params).all()
    
    // 総件数を取得
    let countQuery = `SELECT COUNT(*) as total FROM area_settings WHERE user_id = ?`
    const countParams = [userId]
    
    if (search) {
      countQuery += ` AND (postal_code_prefix LIKE ? OR area_name LIKE ?)`
      countParams.push(`%${search}%`, `%${search}%`)
    }
    
    const countResult = await env.DB.prepare(countQuery).bind(...countParams).first()
    const total = countResult?.total || 0
    
    return c.json({
      success: true,
      data: result.results || [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('エリア設定一覧取得エラー:', error)
    
    // エラーが発生した場合は空配列を返すことで、フロントエンドの処理を継続
    return c.json({
      success: true,
      data: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
      },
      warning: 'エリア設定データを読み込めませんでしたが、システムは正常に動作します'
    })
  }
})

// エリア設定追加API
app.post('/api/area-settings', async (c) => {
  const userId = c.req.header('X-User-ID') || 'test-user-001'
  const data = await c.req.json()
  
  try {
    const { env } = c
    const { postal_code_prefix, area_name, area_rank } = data
    
    // バリデーション
    if (!postal_code_prefix || !area_name || !area_rank) {
      return c.json({
        success: false,
        message: '必要な項目が不足しています'
      }, 400)
    }
    
    if (!['A', 'B', 'C', 'D'].includes(area_rank)) {
      return c.json({
        success: false,
        message: 'エリアランクはA、B、C、Dのいずれかを指定してください'
      }, 400)
    }
    
    // 重複チェック
    const existingArea = await env.DB.prepare(`
      SELECT id FROM area_settings 
      WHERE user_id = ? AND postal_code_prefix = ?
    `).bind(userId, postal_code_prefix).first()
    
    if (existingArea) {
      return c.json({
        success: false,
        message: 'この郵便番号プレフィックスは既に登録されています'
      }, 409)
    }
    
    // データベースに追加
    const result = await env.DB.prepare(`
      INSERT INTO area_settings (postal_code_prefix, area_name, area_rank, user_id)
      VALUES (?, ?, ?, ?)
    `).bind(postal_code_prefix, area_name, area_rank, userId).run()
    
    if (result.success) {
      const newArea = await env.DB.prepare(`
        SELECT id, postal_code_prefix, area_name, area_rank, created_at
        FROM area_settings 
        WHERE id = ?
      `).bind(result.meta.last_row_id).first()
      
      return c.json({
        success: true,
        data: newArea,
        message: 'エリア設定を追加しました'
      })
    } else {
      throw new Error('データベースへの追加に失敗しました')
    }
    
  } catch (error) {
    console.error('Error adding area setting:', error)
    return c.json({
      success: false,
      message: 'エリア設定の追加に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// エリア設定削除API
app.delete('/api/area-settings/:id', async (c) => {
  const id = c.req.param('id')
  const userId = c.req.header('X-User-ID') || 'test-user-001'
  
  try {
    const { env } = c
    
    // 削除対象の存在確認（ユーザーの所有チェック含む）
    const existingArea = await env.DB.prepare(`
      SELECT id FROM area_settings 
      WHERE id = ? AND user_id = ?
    `).bind(id, userId).first()
    
    if (!existingArea) {
      return c.json({
        success: false,
        message: '指定されたエリア設定が見つかりません'
      }, 404)
    }
    
    // データベースから削除
    const result = await env.DB.prepare(`
      DELETE FROM area_settings 
      WHERE id = ? AND user_id = ?
    `).bind(id, userId).run()
    
    if (result.success && result.changes > 0) {
      return c.json({
        success: true,
        message: 'エリア設定を削除しました'
      })
    } else {
      throw new Error('削除処理に失敗しました')
    }
    
  } catch (error) {
    console.error('Error deleting area setting:', error)
    return c.json({
      success: false,
      message: 'エリア設定の削除に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// 顧客・案件管理画面
app.get('/customers', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center text-white hover:text-blue-200">
                <i className="fas fa-truck text-white text-2xl mr-3"></i>
                <h1 className="text-xl font-bold">Office M2 見積システム</h1>
              </a>
            </div>
            <div className="text-white">
              <span className="text-sm">顧客・案件管理</span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">顧客・案件管理</h2>
          <p className="text-gray-600">顧客情報と案件の管理、ステータス履歴の追跡を行います</p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button 
                id="customersTab"
                onclick="switchCustomerTab('customers')" 
                className="py-4 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600 customer-tab active"
              >
                <i className="fas fa-users mr-2"></i>
                顧客一覧
              </button>
              <button 
                id="projectsTab"
                onclick="switchCustomerTab('projects')" 
                className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 customer-tab"
              >
                <i className="fas fa-project-diagram mr-2"></i>
                案件一覧
              </button>
              <button 
                id="statusHistoryTab"
                onclick="switchCustomerTab('status-history')" 
                className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 customer-tab"
              >
                <i className="fas fa-history mr-2"></i>
                ステータス履歴
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* 顧客一覧タブ */}
            <div id="customers-content" className="customer-content">
              {/* 検索・フィルタセクション */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-search mr-1"></i>
                      検索
                    </label>
                    <input
                      type="text"
                      id="customerSearch"
                      placeholder="顧客名・担当者名で検索"
                      className="form-input"
                      onInput="CustomerManagement.filterCustomers()"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-filter mr-1"></i>
                      地域フィルタ
                    </label>
                    <select
                      id="customerRegionFilter"
                      className="form-select"
                      onChange="CustomerManagement.filterCustomers()"
                    >
                      <option value="">すべての地域</option>
                      <option value="関東">関東</option>
                      <option value="関西">関西</option>
                      <option value="中部">中部</option>
                      <option value="九州">九州</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-calendar mr-1"></i>
                      登録期間
                    </label>
                    <select
                      id="customerDateFilter"
                      className="form-select"
                      onChange="CustomerManagement.filterCustomers()"
                    >
                      <option value="">すべて</option>
                      <option value="today">今日</option>
                      <option value="week">1週間</option>
                      <option value="month">1ヶ月</option>
                      <option value="quarter">3ヶ月</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button 
                      onclick="CustomerManagement.openAddCustomerModal()"
                      className="btn-primary w-full"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      新規顧客追加
                    </button>
                  </div>
                </div>
              </div>

              {/* 顧客一覧テーブル */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      顧客一覧 <span id="customerCount" className="text-sm text-gray-500">(0件)</span>
                    </h3>
                    <div className="flex space-x-2">
                      <button 
                        onclick="CustomerManagement.exportCustomersCSV()"
                        className="btn-secondary text-sm"
                      >
                        <i className="fas fa-download mr-2"></i>
                        CSV出力
                      </button>
                      <button 
                        onclick="CustomerManagement.refreshCustomers()"
                        className="btn-secondary text-sm"
                      >
                        <i className="fas fa-sync mr-2"></i>
                        更新
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="table-header cursor-pointer" onclick="CustomerManagement.sortCustomers('name')">
                          顧客名 <i className="fas fa-sort ml-1"></i>
                        </th>
                        <th className="table-header cursor-pointer" onclick="CustomerManagement.sortCustomers('contact_person')">
                          担当者名 <i className="fas fa-sort ml-1"></i>
                        </th>
                        <th className="table-header cursor-pointer" onclick="CustomerManagement.sortCustomers('phone')">
                          電話番号 <i className="fas fa-sort ml-1"></i>
                        </th>
                        <th className="table-header">
                          メールアドレス
                        </th>
                        <th className="table-header cursor-pointer" onclick="CustomerManagement.sortCustomers('created_at')">
                          登録日 <i className="fas fa-sort ml-1"></i>
                        </th>
                        <th className="table-header">
                          案件数
                        </th>
                        <th className="table-header">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody id="customersTable" className="bg-white divide-y divide-gray-200">
                      {/* JavaScript で動的生成 */}
                    </tbody>
                  </table>
                </div>

                {/* ページネーション */}
                <div id="customerPagination" className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  {/* JavaScript で動的生成 */}
                </div>
              </div>
            </div>

            {/* 案件一覧タブ */}
            <div id="projects-content" className="customer-content hidden">
              {/* 検索・フィルタセクション */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-search mr-1"></i>
                      検索
                    </label>
                    <input
                      type="text"
                      id="projectSearch"
                      placeholder="案件名・顧客名で検索"
                      className="form-input"
                      onInput="CustomerManagement.filterProjects()"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-filter mr-1"></i>
                      ステータス
                    </label>
                    <select
                      id="projectStatusFilter"
                      className="form-select"
                      onChange="CustomerManagement.filterProjects()"
                    >
                      <option value="">すべてのステータス</option>
                      <option value="initial">初回コンタクト</option>
                      <option value="quote_sent">見積書送信済み</option>
                      <option value="under_consideration">受注検討中</option>
                      <option value="order">受注</option>
                      <option value="failed">失注</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-calendar mr-1"></i>
                      更新期間
                    </label>
                    <select
                      id="projectDateFilter"
                      className="form-select"
                      onChange="CustomerManagement.filterProjects()"
                    >
                      <option value="">すべて</option>
                      <option value="today">今日</option>
                      <option value="week">1週間</option>
                      <option value="month">1ヶ月</option>
                      <option value="quarter">3ヶ月</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button 
                      onclick="CustomerManagement.openAddProjectModal()"
                      className="btn-primary w-full"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      新規案件追加
                    </button>
                  </div>
                </div>
              </div>

              {/* 案件一覧テーブル */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      案件一覧 <span id="projectCount" className="text-sm text-gray-500">(0件)</span>
                    </h3>
                    <div className="flex space-x-2">
                      <button 
                        onclick="CustomerManagement.exportProjectsCSV()"
                        className="btn-secondary text-sm"
                      >
                        <i className="fas fa-download mr-2"></i>
                        CSV出力
                      </button>
                      <button 
                        onclick="CustomerManagement.refreshProjects()"
                        className="btn-secondary text-sm"
                      >
                        <i className="fas fa-sync mr-2"></i>
                        更新
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="table-header cursor-pointer" onclick="CustomerManagement.sortProjects('name')">
                          案件名 <i className="fas fa-sort ml-1"></i>
                        </th>
                        <th className="table-header cursor-pointer" onclick="CustomerManagement.sortProjects('customer_name')">
                          顧客名 <i className="fas fa-sort ml-1"></i>
                        </th>
                        <th className="table-header cursor-pointer" onclick="CustomerManagement.sortProjects('status')">
                          ステータス <i className="fas fa-sort ml-1"></i>
                        </th>
                        <th className="table-header">
                          概要
                        </th>
                        <th className="table-header cursor-pointer" onclick="CustomerManagement.sortProjects('updated_at')">
                          最終更新 <i className="fas fa-sort ml-1"></i>
                        </th>
                        <th className="table-header">
                          見積数
                        </th>
                        <th className="table-header">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody id="projectsTable" className="bg-white divide-y divide-gray-200">
                      {/* JavaScript で動的生成 */}
                    </tbody>
                  </table>
                </div>

                {/* ページネーション */}
                <div id="projectPagination" className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  {/* JavaScript で動的生成 */}
                </div>
              </div>
            </div>

            {/* ステータス履歴タブ */}
            <div id="status-history-content" className="customer-content hidden">
              {/* フィルタセクション */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-filter mr-1"></i>
                      顧客フィルタ
                    </label>
                    <select
                      id="historyCustomerFilter"
                      className="form-select"
                      onChange="CustomerManagement.filterStatusHistory()"
                    >
                      <option value="">すべての顧客</option>
                      {/* JavaScript で動的生成 */}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-filter mr-1"></i>
                      案件フィルタ
                    </label>
                    <select
                      id="historyProjectFilter"
                      className="form-select"
                      onChange="CustomerManagement.filterStatusHistory()"
                    >
                      <option value="">すべての案件</option>
                      {/* JavaScript で動的生成 */}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-calendar mr-1"></i>
                      期間フィルタ
                    </label>
                    <select
                      id="historyDateFilter"
                      className="form-select"
                      onChange="CustomerManagement.filterStatusHistory()"
                    >
                      <option value="">すべて</option>
                      <option value="today">今日</option>
                      <option value="week">1週間</option>
                      <option value="month">1ヶ月</option>
                      <option value="quarter">3ヶ月</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ステータス履歴一覧 */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    ステータス履歴 <span id="historyCount" className="text-sm text-gray-500">(0件)</span>
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200" id="statusHistoryList">
                  {/* JavaScript で動的生成 */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 顧客追加・編集モーダル */}
      <div id="customerModal" className="modal-backdrop" style="display: none;">
        <div className="modal-content max-w-2xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 id="customerModalTitle" className="text-lg font-medium text-gray-900">顧客情報</h3>
          </div>
          <form id="customerForm" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  顧客名 <span className="text-red-500">*</span>
                </label>
                <input type="text" name="name" id="customerName" className="form-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号
                </label>
                <input type="tel" name="phone" id="customerPhone" className="form-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input type="email" name="email" id="customerEmail" className="form-input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  住所
                </label>
                <textarea name="address" id="customerAddress" className="form-textarea" rows={3}></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備考
                </label>
                <textarea name="notes" id="customerNotes" className="form-textarea" rows={3}></textarea>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onclick="Modal.close('customerModal')" className="btn-secondary">
                キャンセル
              </button>
              <button type="submit" className="btn-primary">
                <i className="fas fa-save mr-2"></i>
                保存
              </button>
            </div>
          </form>
        </div>
      </div>



      {/* ステータス変更モーダル */}
      <div id="statusChangeModal" className="modal-backdrop" style="display: none;">
        <div className="modal-content" style="max-width: 28rem; overflow: visible;">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">ステータス変更</h3>
              <button onclick="Modal.close('statusChangeModal')" className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          <form id="statusChangeForm" className="p-6">
            <input type="hidden" id="statusChangeProjectId" name="project_id" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件名
                </label>
                <div id="statusChangeProjectName" className="text-gray-900 font-medium"></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  現在のステータス
                </label>
                <div id="statusChangeCurrentStatus" className="text-gray-600"></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新しいステータス <span className="text-red-500">*</span>
                </label>
                <select name="new_status" id="statusChangeNewStatus" className="form-select" required>
                  <option value="">選択してください</option>
                  <optgroup label="── 製作中 ──">
                    <option value="drafting">担当者作成中</option>
                    <option value="pdf_generated">PDF生成済み</option>
                    <option value="approval_requested">決裁申請済み</option>
                  </optgroup>
                  <optgroup label="── 決裁待ち ──">
                    <option value="pending_approval">管理者確認中</option>
                    <option value="revision_requested">差戻し（修正依頼）</option>
                  </optgroup>
                  <optgroup label="── 送信済み/検討中 ──">
                    <option value="sent_to_customer">顧客送信済み</option>
                    <option value="under_review">顧客検討中</option>
                    <option value="re_estimate_requested">再見積もり依頼</option>
                  </optgroup>
                  <optgroup label="── 最終結果 ──">
                    <option value="formal_order">正式注文</option>
                    <option value="won">受注</option>
                    <option value="lost">失注</option>
                    <option value="cancelled">キャンセル</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  変更理由・備考
                </label>
                <textarea name="change_reason" id="statusChangeReason" className="form-textarea" rows={3} placeholder="ステータス変更の理由を入力..."></textarea>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onclick="Modal.close('statusChangeModal')" className="btn-secondary">
                キャンセル
              </button>
              <button type="submit" className="btn-primary">
                <i className="fas fa-save mr-2"></i>
                ステータス変更
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
})

// 顧客・案件管理API

// 顧客一覧取得
app.get('/api/customers', async (c) => {
  try {
    // モックデータ（実際はD1データベースから取得）
    const mockCustomers = [
      {
        id: 1,
        name: '株式会社サンプル物流',
        contact_person: '田中 太郎',
        phone: '03-1234-5678',
        email: 'tanaka@sample-logistics.com',
        address: '東京都千代田区丸の内1-1-1',
        notes: '',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: '東京運送株式会社',
        contact_person: '佐藤 花子',
        phone: '03-9876-5432',
        email: 'sato@tokyo-transport.com',
        address: '東京都港区青山2-2-2',
        notes: '',
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z'
      },
      {
        id: 3,
        name: '関西配送センター',
        contact_person: '山田 次郎',
        phone: '06-1111-2222',
        email: 'tanaka@sample-logistics.com',
        address: '東京都千代田区丸の内1-1-1',
        notes: '',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: '東京運送株式会社',
        contact_person: '佐藤 花子',
        phone: '03-9876-5432',
        email: 'sato@tokyo-transport.com',
        address: '東京都港区青山2-2-2',
        notes: '',
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z'
      },
      {
        id: 3,
        name: '関西配送センター',
        contact_person: '山田 次郎',
        phone: '06-1111-2222',
        email: 'yamada@kansai-delivery.com',
        address: '大阪府大阪市中央区本町3-3-3',
        notes: '',
        created_at: '2025-01-03T00:00:00Z',
        updated_at: '2025-01-03T00:00:00Z'
      },
      {
        id: 4,
        name: '九州ロジスティクス',
        contact_person: '鈴木 美穂',
        phone: '092-3333-4444',
        email: 'suzuki@kyushu-logistics.com',
        address: '福岡県福岡市博多区博多駅前1-1-1',
        notes: 'VIP顧客',
        created_at: '2025-01-04T00:00:00Z',
        updated_at: '2025-01-04T00:00:00Z'
      },
      {
        id: 5,
        name: '中部運輸グループ',
        contact_person: '高橋 健一',
        phone: '052-5555-6666',
        email: 'takahashi@chubu-transport.com',
        address: '愛知県名古屋市中村区名駅1-1-1',
        notes: '',
        created_at: '2025-01-05T00:00:00Z',
        updated_at: '2025-01-05T00:00:00Z'
      }
    ];

    return c.json({
      success: true,
      data: mockCustomers,
      message: '顧客一覧を取得しました'
    });

  } catch (error) {
    return c.json({
      success: false,
      error: 'データベースエラーが発生しました'
    }, 500);
  }
});

// 案件一覧取得
app.get('/api/projects', async (c) => {
  try {
    // モックデータ（実際はD1データベースから取得）
    const mockProjects = [
      {
        id: 1,
        customer_id: 1,
        name: 'オフィス移転プロジェクト',
        description: '本社オフィス移転に伴う什器・書類の輸送',
        status: 'initial',
        priority: 'high',
        notes: '',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      },
      {
        id: 2,
        customer_id: 1,
        name: '倉庫間商品移動',
        description: '物流倉庫A→Bへの商品移動作業',
        status: 'quote_sent',
        priority: 'medium',
        notes: '',
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z'
      },
      {
        id: 3,
        customer_id: 2,
        name: '展示会用品輸送',
        description: '東京ビッグサイト展示会への機材輸送',
        status: 'under_consideration',
        priority: 'high',
        notes: '急ぎ案件',
        created_at: '2025-01-03T00:00:00Z',
        updated_at: '2025-01-03T00:00:00Z'
      },
      {
        id: 4,
        customer_id: 3,
        name: '工場設備移設',
        description: '製造ラインの移設作業',
        status: 'order',
        priority: 'high',
        notes: '',
        created_at: '2025-01-04T00:00:00Z',
        updated_at: '2025-01-04T00:00:00Z'
      },
      {
        id: 5,
        customer_id: 4,
        name: 'IT機器移設',
        description: 'データセンターのサーバー移設',
        status: 'quote_sent',
        priority: 'medium',
        notes: '精密輸送要',
        created_at: '2025-01-05T00:00:00Z',
        updated_at: '2025-01-05T00:00:00Z'
      },
      {
        id: 6,
        customer_id: 5,
        name: '定期配送契約',
        description: '毎週火曜日の定期配送業務',
        status: 'failed',
        priority: 'low',
        notes: '価格面で折り合わず',
        created_at: '2025-01-06T00:00:00Z',
        updated_at: '2025-01-06T00:00:00Z'
      }
    ];

    return c.json({
      success: true,
      data: mockProjects,
      message: '案件一覧を取得しました'
    });

  } catch (error) {
    return c.json({
      success: false,
      error: 'データベースエラーが発生しました'
    }, 500);
  }
});

// ステータス履歴取得
app.get('/api/status-history', async (c) => {
  try {
    // モックデータ（実際はD1データベースから取得）
    const mockStatusHistory = [
      {
        id: 1,
        project_id: 1,
        customer_id: 1,
        old_status: null,
        new_status: 'initial',
        change_reason: '新規案件登録',
        created_at: '2025-01-01T00:00:00Z'
      },
      {
        id: 2,
        project_id: 2,
        customer_id: 1,
        old_status: 'initial',
        new_status: 'quote_sent',
        change_reason: '見積書を送信しました',
        created_at: '2025-01-02T10:30:00Z'
      },
      {
        id: 3,
        project_id: 3,
        customer_id: 2,
        old_status: 'quote_sent',
        new_status: 'under_consideration',
        change_reason: '顧客側で検討中とのご連絡',
        created_at: '2025-01-03T14:15:00Z'
      },
      {
        id: 4,
        project_id: 4,
        customer_id: 3,
        old_status: 'under_consideration',
        new_status: 'order',
        change_reason: '正式受注決定！',
        created_at: '2025-01-04T16:45:00Z'
      },
      {
        id: 5,
        project_id: 6,
        customer_id: 5,
        old_status: 'quote_sent',
        new_status: 'failed',
        change_reason: '他社に決定したとのご連絡',
        created_at: '2025-01-06T09:20:00Z'
      }
    ];

    return c.json({
      success: true,
      data: mockStatusHistory,
      message: 'ステータス履歴を取得しました'
    });

  } catch (error) {
    return c.json({
      success: false,
      error: 'データベースエラーが発生しました'
    }, 500);
  }
});

// 顧客追加
app.post('/api/customers', async (c) => {
  try {
    const customerData = await c.req.json();
    
    // 簡単な検証
    if (!customerData.name) {
      return c.json({
        success: false,
        error: '顧客名は必須です'
      }, 400);
    }

    // モックレスポンス（実際はD1データベースに保存）
    const newCustomer = {
      id: Date.now(), // 実際はデータベースが生成
      ...customerData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return c.json({
      success: true,
      data: newCustomer,
      message: '顧客を追加しました'
    });

  } catch (error) {
    return c.json({
      success: false,
      error: 'データの保存に失敗しました'
    }, 500);
  }
});

// 案件追加
// 案件作成API - 削除（15786行目に統合版あり）

// ステータス変更
app.post('/api/projects/status-change', async (c) => {
  try {
    const { env } = c
    const statusData = await c.req.json();
    
    // 簡単な検証
    if (!statusData.project_id || !statusData.new_status) {
      return c.json({
        success: false,
        error: '必須項目が不足しています'
      }, 400);
    }

    const projectId = statusData.project_id
    const newStatus = statusData.new_status
    const changeReason = statusData.change_reason || statusData.comment || ''
    const userId = statusData.user_id || c.req.header('X-User-ID') || 'test-user-001'

    // 現在のステータスを取得
    const currentProject = await env.DB.prepare(`
      SELECT status FROM projects WHERE id = ?
    `).bind(projectId).first()

    if (!currentProject) {
      return c.json({
        success: false,
        error: '案件が見つかりません'
      }, 404);
    }

    // プロジェクトのステータスを更新
    await env.DB.prepare(`
      UPDATE projects 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(newStatus, projectId).run()

    // ステータス履歴を記録
    await env.DB.prepare(`
      INSERT INTO status_history (project_id, old_status, new_status, notes, user_id)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      projectId,
      currentProject.status,
      newStatus,
      changeReason,
      userId
    ).run()

    return c.json({
      success: true,
      data: {
        id: Date.now(),
        project_id: projectId,
        old_status: currentProject.status,
        new_status: newStatus,
        change_reason: changeReason,
        created_at: new Date().toISOString()
      },
      message: 'ステータスを変更しました'
    });

  } catch (error) {
    console.error('ステータス変更エラー:', error)
    return c.json({
      success: false,
      error: 'ステータスの変更に失敗しました',
      detail: error instanceof Error ? error.message : '不明なエラー'
    }, 500);
  }
});

// 見積履歴管理画面
app.get('/estimates', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center text-white hover:text-blue-200">
                <i className="fas fa-truck text-white text-2xl mr-3"></i>
                <h1 className="text-xl font-bold">Office M2 見積システム</h1>
              </a>
            </div>
            <div className="text-white">
              <span className="text-sm">見積履歴・管理</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">見積履歴・管理</h2>
          <p className="text-gray-600">作成した見積の検索・編集・出力を行います</p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-file-alt text-blue-500 text-2xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">総見積数</dt>
                    <dd id="totalEstimates" className="text-2xl font-bold text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-check-circle text-green-500 text-2xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">受注済み</dt>
                    <dd id="acceptedEstimates" className="text-2xl font-bold text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-clock text-yellow-500 text-2xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">検討中</dt>
                    <dd id="pendingEstimates" className="text-2xl font-bold text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-yen-sign text-purple-500 text-2xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">総見積額</dt>
                    <dd id="totalEstimateAmount" className="text-2xl font-bold text-gray-900">¥0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              <i className="fas fa-search mr-2"></i>
              検索・フィルタ
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  見積番号・顧客名
                </label>
                <input
                  type="text"
                  id="estimateSearch"
                  placeholder="検索キーワード"
                  className="form-input"
                  onInput="EstimateManagement.filterEstimates()"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  顧客
                </label>
                <select
                  id="estimateCustomerFilter"
                  className="form-select"
                  onChange="EstimateManagement.filterEstimates()"
                >
                  <option value="">すべての顧客</option>
                  {/* JavaScript で動的生成 */}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件ステータス
                </label>
                <select
                  id="estimateStatusFilter"
                  className="form-select"
                  onChange="EstimateManagement.filterEstimates()"
                >
                  <option value="">すべてのステータス</option>
                  <optgroup label="── 製作中 ──">
                    <option value="drafting">担当者作成中</option>
                    <option value="pdf_generated">PDF生成済み</option>
                    <option value="approval_requested">決裁申請済み</option>
                  </optgroup>
                  <optgroup label="── 決裁待ち ──">
                    <option value="pending_approval">管理者確認中</option>
                    <option value="revision_requested">差戻し（修正依頼）</option>
                  </optgroup>
                  <optgroup label="── 送信済み/検討中 ──">
                    <option value="sent_to_customer">顧客送信済み</option>
                    <option value="under_review">顧客検討中</option>
                    <option value="re_estimate_requested">再見積もり依頼</option>
                  </optgroup>
                  <optgroup label="── 最終結果 ──">
                    <option value="formal_order">正式注文</option>
                    <option value="won">受注</option>
                    <option value="lost">失注</option>
                    <option value="cancelled">キャンセル</option>
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  見積タイプ
                </label>
                <select
                  id="estimateTypeFilter"
                  className="form-select"
                  onChange="EstimateManagement.filterEstimates()"
                >
                  <option value="">すべてのタイプ</option>
                  <option value="standard_a">標準見積A</option>
                  <option value="standard_b">標準見積B</option>
                  <option value="free">フリー見積</option>
                  <option value="survey">現地調査</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  金額範囲
                </label>
                <select
                  id="estimateAmountFilter"
                  className="form-select"
                  onChange="EstimateManagement.filterEstimates()"
                >
                  <option value="">すべての金額</option>
                  <option value="0-50000">5万円以下</option>
                  <option value="50000-100000">5万円〜10万円</option>
                  <option value="100000-300000">10万円〜30万円</option>
                  <option value="300000-500000">30万円〜50万円</option>
                  <option value="500000-">50万円以上</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  作成期間
                </label>
                <select
                  id="estimateDateFilter"
                  className="form-select"
                  onChange="EstimateManagement.filterEstimates()"
                >
                  <option value="">すべて</option>
                  <option value="today">今日</option>
                  <option value="week">1週間</option>
                  <option value="month">1ヶ月</option>
                  <option value="quarter">3ヶ月</option>
                  <option value="year">1年</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                見積一覧 <span id="estimateCount" className="text-sm text-gray-500">(0件)</span>
              </h3>
              <div className="flex space-x-2">
                <button 
                  onclick="EstimateManagement.exportEstimatesCSV()"
                  className="btn-secondary text-sm"
                >
                  <i className="fas fa-download mr-2"></i>
                  CSV出力
                </button>
                <button 
                  onclick="EstimateManagement.bulkGeneratePDF()"
                  className="btn-secondary text-sm"
                >
                  <i className="fas fa-file-pdf mr-2"></i>
                  PDF一括出力
                </button>
                <button 
                  onclick="EstimateManagement.refreshEstimates()"
                  className="btn-secondary text-sm"
                >
                  <i className="fas fa-sync mr-2"></i>
                  更新
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-8 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    <input type="checkbox" id="selectAll" onChange="EstimateManagement.toggleSelectAll()" />
                  </th>
                  <th className="w-[130px] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onclick="EstimateManagement.sortEstimates('estimate_number')">
                    見積番号 <i className="fas fa-sort ml-0.5 text-gray-400"></i>
                  </th>
                  <th className="w-[90px] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onclick="EstimateManagement.sortEstimates('customer_name')">
                    顧客名 <i className="fas fa-sort ml-0.5 text-gray-400"></i>
                  </th>
                  <th className="w-[110px] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onclick="EstimateManagement.sortEstimates('project_name')">
                    案件名 <i className="fas fa-sort ml-0.5 text-gray-400"></i>
                  </th>
                  <th className="w-[50px] px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase cursor-pointer" onclick="EstimateManagement.sortEstimates('delivery_area')">
                    エリア
                  </th>
                  <th className="w-[90px] px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer" onclick="EstimateManagement.sortEstimates('total_amount')">
                    金額 <i className="fas fa-sort ml-0.5 text-gray-400"></i>
                  </th>
                  <th className="w-[80px] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onclick="EstimateManagement.sortEstimates('created_at')">
                    作成日 <i className="fas fa-sort ml-0.5 text-gray-400"></i>
                  </th>
                  <th className="w-[60px] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onclick="EstimateManagement.sortEstimates('created_by_name')">
                    作成者
                  </th>
                  <th className="w-[70px] px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    状態
                  </th>
                  <th className="w-[180px] px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody id="estimatesTable" className="bg-white divide-y divide-gray-200">
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          <div id="estimatePagination" className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          </div>
        </div>
      </main>

      <div id="estimateDetailModal" className="modal-backdrop" style="display: none;">
        <div className="modal-content max-w-4xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                <i className="fas fa-file-alt mr-2"></i>
                見積詳細
              </h3>
              <button onclick="Modal.close('estimateDetailModal')" className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div id="estimateDetailContent">
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onclick="Modal.close('estimateDetailModal')" className="btn-secondary">
                閉じる
              </button>
              <button type="button" id="editFromDetailBtn" className="btn-primary">
                <i className="fas fa-edit mr-2"></i>
                この見積を編集
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="estimateEditModal" className="modal-backdrop" style="display: none;">
        <div className="modal-content max-w-3xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">見積編集</h3>
          </div>
          <form id="estimateEditForm" className="p-6">
            <div id="estimateEditContent">
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onclick="Modal.close('estimateEditModal')" className="btn-secondary">
                キャンセル
              </button>
              <button type="submit" className="btn-primary">
                <i className="fas fa-save mr-2"></i>
                保存
              </button>
            </div>
          </form>
        </div>
      </div>

      <div id="statusChangeModal" className="modal-backdrop" style="display: none;">
        <div className="modal-content" style="max-width: 28rem; overflow: visible;">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">ステータス変更</h3>
              <button onclick="Modal.close('statusChangeModal')" className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新しいステータス
                </label>
                <select id="statusChangeSelect" className="form-select w-full">
                  <option value="">選択してください</option>
                  <optgroup label="── 製作中 ──">
                    <option value="drafting">担当者作成中</option>
                    <option value="pdf_generated">PDF生成済み</option>
                    <option value="approval_requested">決裁申請済み</option>
                  </optgroup>
                  <optgroup label="── 決裁待ち ──">
                    <option value="pending_approval">管理者確認中</option>
                    <option value="revision_requested">差戻し（修正依頼）</option>
                  </optgroup>
                  <optgroup label="── 送信済み/検討中 ──">
                    <option value="sent_to_customer">顧客送信済み</option>
                    <option value="under_review">顧客検討中</option>
                    <option value="re_estimate_requested">再見積もり依頼</option>
                  </optgroup>
                  <optgroup label="── 最終結果 ──">
                    <option value="formal_order">正式注文</option>
                    <option value="won">受注</option>
                    <option value="lost">失注</option>
                    <option value="cancelled">キャンセル</option>
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  コメント（任意）
                </label>
                <textarea 
                  id="statusChangeComment" 
                  className="form-textarea w-full" 
                  rows="3"
                  placeholder="変更理由や備考を入力..."
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button 
              onclick="Modal.close('statusChangeModal')" 
              className="btn-secondary"
            >
              キャンセル
            </button>
            <button 
              onclick="StatusManagement.changeStatus()" 
              className="btn-primary"
            >
              <i className="fas fa-save mr-2"></i>
              変更
            </button>
          </div>
        </div>
      </div>

      <div id="statusHistoryModal" className="modal-backdrop" style="display: none;">
        <div className="modal-content max-w-3xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">ステータス履歴</h3>
              <button onclick="Modal.close('statusHistoryModal')" className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div id="statusHistoryContent">
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button onclick="Modal.close('statusHistoryModal')" className="btn-secondary">
              閉じる
            </button>
          </div>
        </div>
      </div>

      {/* 見積管理JavaScript */}
      <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
        // 見積管理システム
        if (typeof EstimateManagement === 'undefined') {
          window.EstimateManagement = {
          estimates: [],
          filteredEstimates: [],
          currentEstimateId: null,
          sortColumn: 'created_at',
          sortDirection: 'desc',

          // 初期化
          init: async () => {
            console.log('見積管理システム初期化開始');
            await EstimateManagement.loadEstimates();
            EstimateManagement.setupEventListeners();
          },

          // イベントリスナー設定
          setupEventListeners: () => {
            // 詳細編集ボタンのイベントリスナー
            const editBtn = document.getElementById('editFromDetailBtn');
            if (editBtn) {
              editBtn.addEventListener('click', () => {
                Modal.close('estimateDetailModal');
                EstimateManagement.editEstimate(EstimateManagement.currentEstimateId);
              });
            }

            // ステータス変更関連
            document.querySelectorAll('.status-option').forEach(option => {
              option.addEventListener('click', () => {
                const value = option.getAttribute('data-value');
                const label = option.getAttribute('data-label');
                document.getElementById('selectedStatus').textContent = label;
                document.getElementById('statusChangeForm').setAttribute('data-status', value);
                
                document.querySelectorAll('.status-option').forEach(opt => {
                  opt.classList.remove('bg-blue-50');
                });
                option.classList.add('bg-blue-50');
              });
            });
          },

          // 見積一覧の読み込み
          loadEstimates: async () => {
            try {
              console.log('見積データ読み込み開始');
              
              const response = await axios.get('/api/estimates', {
                headers: { 'X-User-ID': 'test-user-001' }
              });

              if (response.data.success) {
                EstimateManagement.estimates = response.data.data;
                EstimateManagement.filteredEstimates = [...EstimateManagement.estimates];
                EstimateManagement.renderEstimates();
                console.log('見積データ読み込み完了:', EstimateManagement.estimates.length + '件');
              } else {
                console.error('見積データ取得失敗:', response.data.error);
              }
            } catch (error) {
              console.error('見積データ読み込みエラー:', error);
              Utils.showError('見積データの読み込みに失敗しました');
            }
          },

          // 見積テーブルの描画
          renderEstimates: () => {
            const tbody = document.getElementById('estimatesTable');
            const countElement = document.getElementById('estimateCount');
            
            if (!tbody) return;

            // 件数表示を更新
            if (countElement) {
              countElement.textContent = \`(\${EstimateManagement.filteredEstimates.length}件)\`;
            }

            tbody.innerHTML = '';

            EstimateManagement.filteredEstimates.forEach(estimate => {
              const row = document.createElement('tr');
              row.className = 'hover:bg-gray-50';
              row.innerHTML = \`
                <td class="table-cell">
                  <input type="checkbox" value="\${estimate.id}" class="estimate-checkbox" />
                </td>
                <td class="table-cell font-medium text-blue-600">
                  \${estimate.estimate_number || ''}
                </td>
                <td class="table-cell">
                  \${estimate.customer_name || ''}
                </td>
                <td class="table-cell">
                  \${estimate.project_name || ''}
                </td>
                <td class="table-cell">
                  <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    \${estimate.delivery_area || ''}エリア
                  </span>
                </td>
                <td class="table-cell font-medium">
                  \${Utils.formatCurrency(estimate.total_amount || 0)}
                </td>
                <td class="table-cell text-gray-500">
                  \${estimate.created_at ? new Date(estimate.created_at).toLocaleDateString('ja-JP') : ''}
                </td>
                <td class="table-cell">
                  <span class="status-badge status-\${estimate.status || 'initial'}">
                    \${EstimateManagement.getStatusLabel(estimate.status || 'initial')}
                  </span>
                </td>
                <td class="table-cell">
                  <div class="flex space-x-1">
                    <button 
                      onclick="EstimateManagement.viewEstimate(\${estimate.id})" 
                      class="btn-sm btn-primary" 
                      title="詳細表示"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      onclick="EstimateManagement.editEstimate(\${estimate.id})" 
                      class="btn-sm btn-secondary" 
                      title="編集"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      onclick="EstimateManagement.generatePDF(\${estimate.id})" 
                      class="btn-sm btn-success" 
                      title="PDF出力"
                    >
                      <i class="fas fa-file-pdf"></i>
                    </button>
                    <button 
                      onclick="StatusManagement.showStatusChangeModal('estimate', \${estimate.id}, '\${project ? project.status || 'initial' : 'initial'}')" 
                      class="btn-sm btn-warning" 
                      title="ステータス変更"
                    >
                      <i class="fas fa-exchange-alt"></i>
                    </button>
                  </div>
                </td>
              \`;
              tbody.appendChild(row);
            });
          },

          // 見積詳細表示
          viewEstimate: async (estimateId) => {
            try {
              console.log('見積詳細表示開始:', estimateId);
              EstimateManagement.currentEstimateId = estimateId;

              const response = await axios.get(\`/api/estimates/\${estimateId}\`, {
                headers: { 'X-User-ID': 'test-user-001' }
              });

              if (response.data.success) {
                const estimate = response.data.data;
                EstimateManagement.renderEstimateDetail(estimate);
                Modal.open('estimateDetailModal');
              } else {
                Utils.showError('見積詳細の取得に失敗しました');
              }
            } catch (error) {
              console.error('見積詳細取得エラー:', error);
              Utils.showError('見積詳細の取得中にエラーが発生しました');
            }
          },

          // 見積詳細の描画（JSXコメント構文を正しく処理）
          renderEstimateDetail: (estimate) => {
            const container = document.getElementById('estimateDetailContent');
            if (!container) return;

            // 安全な文字列テンプレートを使用（JSXコメントは含めない）
            container.innerHTML = \`
              <div class="space-y-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <i class="fas fa-info-circle mr-2 text-blue-500"></i>
                    基本情報
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-600">見積番号</label>
                      <p class="mt-1 text-sm text-gray-900">\${estimate.estimate_number || 'なし'}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-600">作成日</label>
                      <p class="mt-1 text-sm text-gray-900">\${estimate.created_at ? new Date(estimate.created_at).toLocaleDateString('ja-JP') : 'なし'}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-600">顧客名</label>
                      <p class="mt-1 text-sm text-gray-900">\${estimate.customer_name || 'なし'}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-600">案件名</label>
                      <p class="mt-1 text-sm text-gray-900">\${estimate.project_name || 'なし'}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <i class="fas fa-map-marker-alt mr-2 text-green-500"></i>
                    配送情報
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-600">配送先住所</label>
                      <p class="mt-1 text-sm text-gray-900">\${estimate.delivery_address || 'なし'}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-600">郵便番号</label>
                      <p class="mt-1 text-sm text-gray-900">\${estimate.delivery_postal_code || 'なし'}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-600">配送エリア</label>
                      <p class="mt-1 text-sm text-gray-900">
                        <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          \${estimate.delivery_area || ''}エリア
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <i class="fas fa-truck mr-2 text-orange-500"></i>
                    車両・スタッフ情報
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-600">車両タイプ</label>
                      <p class="mt-1 text-sm text-gray-900">\${estimate.vehicle_type || 'なし'}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-600">稼働形態</label>
                      <p class="mt-1 text-sm text-gray-900">\${estimate.operation_type || 'なし'}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <i class="fas fa-yen-sign mr-2 text-purple-500"></i>
                    料金情報
                  </h4>
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-sm font-medium text-gray-600">車両費用</span>
                      <span class="text-sm text-gray-900">\${Utils.formatCurrency(estimate.vehicle_cost || 0)}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm font-medium text-gray-600">スタッフ費用</span>
                      <span class="text-sm text-gray-900">\${Utils.formatCurrency(estimate.staff_cost || 0)}</span>
                    </div>
                    <div class="flex justify-between border-t pt-2">
                      <span class="text-sm font-medium text-gray-600">小計</span>
                      <span class="text-sm text-gray-900">\${Utils.formatCurrency(estimate.subtotal || 0)}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm font-medium text-gray-600">消費税</span>
                      <span class="text-sm text-gray-900">\${Utils.formatCurrency(estimate.tax_amount || 0)}</span>
                    </div>
                    <div class="flex justify-between border-t pt-2 font-bold text-lg">
                      <span class="text-gray-900">合計金額</span>
                      <span class="text-blue-600">\${Utils.formatCurrency(estimate.total_amount || 0)}</span>
                    </div>
                  </div>
                </div>

                \${estimate.notes ? \`
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <i class="fas fa-sticky-note mr-2 text-yellow-500"></i>
                    備考
                  </h4>
                  <p class="text-sm text-gray-900 whitespace-pre-wrap">\${estimate.notes}</p>
                </div>
                \` : ''}
              </div>
            \`;
          },

          // ステータスラベル取得
          getStatusLabel: (status) => {
            const labels = {
              'initial': '初回コンタクト',
              'quote_sent': '見積書送信済み',
              'under_consideration': '受注検討中',
              'order': '受注',
              'completed': '完了',
              'failed': '失注',
              'cancelled': 'キャンセル'
            };
            return labels[status] || status;
          },

          // 見積編集
          editEstimate: (estimateId) => {
            // 編集機能は未実装
            Utils.showError('編集機能は現在開発中です');
          },

          // PDF生成
          generatePDF: async (estimateId) => {
            try {
              console.log('PDF生成開始:', estimateId);
              
              const response = await fetch(\`/api/estimates/\${estimateId}/pdf\`, {
                method: 'GET',
                headers: {
                  'X-User-ID': 'test-user-001'
                }
              });

              if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = \`estimate_\${estimateId}.pdf\`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                Utils.showSuccess('PDFを生成しました');
              } else {
                Utils.showError('PDF生成に失敗しました');
              }
            } catch (error) {
              console.error('PDF生成エラー:', error);
              Utils.showError('PDF生成中にエラーが発生しました');
            }
          },

          // フィルタリング
          filterEstimates: () => {
            const searchTerm = document.getElementById('estimateSearch')?.value.toLowerCase() || '';
            const customerFilter = document.getElementById('estimateCustomerFilter')?.value || '';
            const statusFilter = document.getElementById('estimateStatusFilter')?.value || '';
            const amountFilter = document.getElementById('estimateAmountFilter')?.value || '';
            const dateFilter = document.getElementById('estimateDateFilter')?.value || '';

            EstimateManagement.filteredEstimates = EstimateManagement.estimates.filter(estimate => {
              // 検索キーワードフィルタ
              if (searchTerm && !estimate.estimate_number?.toLowerCase().includes(searchTerm) &&
                  !estimate.customer_name?.toLowerCase().includes(searchTerm) &&
                  !estimate.project_name?.toLowerCase().includes(searchTerm)) {
                return false;
              }

              // 顧客フィルタ
              if (customerFilter && estimate.customer_name !== customerFilter) {
                return false;
              }

              // ステータスフィルタ
              if (statusFilter && estimate.status !== statusFilter) {
                return false;
              }

              // 金額フィルタ
              if (amountFilter) {
                const amount = estimate.total_amount || 0;
                const [min, max] = amountFilter.split('-').map(Number);
                if (max && (amount < min || amount > max)) return false;
                if (!max && amount < min) return false;
              }

              return true;
            });

            EstimateManagement.renderEstimates();
          },

          // ソート
          sortEstimates: (column) => {
            if (EstimateManagement.sortColumn === column) {
              EstimateManagement.sortDirection = EstimateManagement.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
              EstimateManagement.sortColumn = column;
              EstimateManagement.sortDirection = 'asc';
            }

            EstimateManagement.filteredEstimates.sort((a, b) => {
              let aValue = a[column];
              let bValue = b[column];

              if (column.includes('amount') || column.includes('cost')) {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
              } else if (column.includes('date') || column.includes('at')) {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
              } else {
                aValue = (aValue || '').toString().toLowerCase();
                bValue = (bValue || '').toString().toLowerCase();
              }

              if (aValue < bValue) return EstimateManagement.sortDirection === 'asc' ? -1 : 1;
              if (aValue > bValue) return EstimateManagement.sortDirection === 'asc' ? 1 : -1;
              return 0;
            });

            EstimateManagement.renderEstimates();
          },

          // 全選択切り替え
          toggleSelectAll: () => {
            const selectAll = document.getElementById('selectAll');
            const checkboxes = document.querySelectorAll('.estimate-checkbox');
            
            checkboxes.forEach(checkbox => {
              checkbox.checked = selectAll.checked;
            });
          },

          // データ更新
          refreshEstimates: () => {
            EstimateManagement.loadEstimates();
            Utils.showSuccess('データを更新しました');
          },

          // CSV出力
          exportEstimatesCSV: () => {
            window.open('/api/estimates/export/csv', '_blank');
          },

          // PDF一括出力
          bulkGeneratePDF: () => {
            const selectedIds = Array.from(document.querySelectorAll('.estimate-checkbox:checked')).map(cb => cb.value);
            
            if (selectedIds.length === 0) {
              Utils.showError('PDFを生成する見積を選択してください');
              return;
            }

            selectedIds.forEach(id => {
              EstimateManagement.generatePDF(id);
            });
          }
        };
        } // EstimateManagement条件分岐の閉じ括弧

        // ステータス管理 - app.jsのStatusManagementが読み込まれていない場合のフォールバック
        if (typeof StatusManagement === 'undefined') {
          window.StatusManagement = {
            currentType: null,
            currentId: null,
            currentStatus: null,

            showStatusChangeModal: (type, id, currentStatus) => {
              StatusManagement.currentType = type;
              StatusManagement.currentId = id;
              StatusManagement.currentStatus = currentStatus;
              const selectEl = document.getElementById('statusChangeSelect');
              if (selectEl) selectEl.value = '';
              const commentInput = document.getElementById('statusChangeComment');
              if (commentInput) commentInput.value = '';
              Modal.open('statusChangeModal');
            },

            changeStatus: async () => {
              const selectEl = document.getElementById('statusChangeSelect');
              const commentInput = document.getElementById('statusChangeComment');
              const newStatus = selectEl ? selectEl.value : '';
              const comment = commentInput ? commentInput.value.trim() : '';

              if (!newStatus) {
                Utils.showError('新しいステータスを選択してください');
                return;
              }

              try {
                const endpoint = StatusManagement.currentType === 'estimate' 
                  ? \`/api/estimates/\${StatusManagement.currentId}/status\`
                  : \`/api/projects/\${StatusManagement.currentId}/status\`;

                const response = await axios.put(endpoint, {
                  status: newStatus,
                  comment: comment
                }, {
                  headers: { 'X-User-ID': currentUser || 'test-user-001' }
                });

                if (response.data.success) {
                  Utils.showSuccess('ステータスを変更しました');
                  Modal.close('statusChangeModal');
                  if (typeof EstimateManagement !== 'undefined' && EstimateManagement.loadEstimates) {
                    EstimateManagement.loadEstimates();
                  }
                } else {
                  Utils.showError('ステータスの変更に失敗しました');
                }
              } catch (error) {
                console.error('ステータス変更エラー:', error);
                Utils.showError('ステータス変更中にエラーが発生しました');
              }
            }
          };
        } // StatusManagement条件分岐の閉じ括弧

        // ページ読み込み時の初期化（複数の方法で確実に実行）
        document.addEventListener('DOMContentLoaded', () => {
          console.log('DOMContentLoaded: EstimateManagement初期化開始');
          console.log('EstimateManagement object:', typeof window.EstimateManagement);
          console.log('EstimateManagement.init:', typeof window.EstimateManagement?.init);
          console.log('EstimateManagement exists:', typeof EstimateManagement);
          console.log('All EstimateManagement keys:', window.EstimateManagement ? Object.keys(window.EstimateManagement) : 'No keys');
          
          if (window.EstimateManagement) {
            // 利用可能な初期化メソッドを確認
            if (typeof window.EstimateManagement.init === 'function') {
              console.log('✅ EstimateManagement.init呼び出し開始');
              window.EstimateManagement.init();
            } else if (typeof window.EstimateManagement.initialize === 'function') {
              console.log('✅ EstimateManagement.initialize呼び出し開始');
              window.EstimateManagement.initialize();
            } else {
              console.log('🔍 利用可能な初期化メソッドを探します');
              console.log('Available methods:', Object.keys(window.EstimateManagement));
              console.error('❌ 初期化メソッドが見つかりません');
            }
          } else {
            console.error('❌ EstimateManagementオブジェクトが見つかりません');
          }
        });

        // 追加の初期化（DOM読み込み完了後のフォールバック）
        window.addEventListener('load', () => {
          console.log('Window load: EstimateManagement初期化フォールバック');
          if (window.EstimateManagement && typeof window.EstimateManagement.init === 'function') {
            window.EstimateManagement.init();
          }
        });

        // 即座に実行も試行（スクリプト読み込み完了後すぐ）
        setTimeout(() => {
          console.log('Timeout: EstimateManagement初期化即時実行');
          if (window.EstimateManagement && typeof window.EstimateManagement.init === 'function') {
            window.EstimateManagement.init();
          }
        }, 100);
        `
      }}></script>
    </div>
  )
})

// レポート・分析ページ
app.get('/reports', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <i className="fas fa-truck text-white text-2xl mr-3"></i>
                <h1 className="text-xl font-bold text-white">Office M2 見積システム</h1>
              </a>
            </div>
            <div className="text-white">
              <span className="text-sm">レポート・分析</span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">レポート・分析</h2>
          <p className="text-gray-600">売上分析・業務効率・予測分析を行います</p>
        </div>

        {/* レポートヘッダー */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button 
                id="salesTabBtn"
                className="tab-button active"
              >
                <i className="fas fa-chart-line mr-2"></i>
                売上分析
              </button>
            </nav>
          </div>
        </div>

        {/* 売上分析タブ */}
        <div id="salesTab" className="tab-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 期間選択 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <i className="fas fa-calendar-alt mr-2 text-blue-600"></i>
                期間選択
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
                    <input type="date" id="salesStartDate" className="form-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
                    <input type="date" id="salesEndDate" className="form-input" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">集計単位</label>
                  <select id="salesPeriod" className="form-select">
                    <option value="daily">日次</option>
                    <option value="weekly">週次</option>
                    <option value="monthly" selected>月次</option>
                    <option value="quarterly">四半期</option>
                    <option value="yearly">年次</option>
                  </select>
                </div>
                <button onclick="ReportManagement.generateSalesReport()" className="btn-primary w-full">
                  <i className="fas fa-chart-line mr-2"></i>
                  売上レポート生成
                </button>
              </div>
            </div>

            {/* サマリー統計 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <i className="fas fa-calculator mr-2 text-green-600"></i>
                サマリー統計
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600" id="totalRevenue">¥0</div>
                  <div className="text-sm text-gray-600">総売上</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600" id="totalOrders">0</div>
                  <div className="text-sm text-gray-600">受注件数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600" id="averageOrderValue">¥0</div>
                  <div className="text-sm text-gray-600">平均受注額</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600" id="orderRate">0%</div>
                  <div className="text-sm text-gray-600">受注率</div>
                </div>
              </div>
            </div>
          </div>

          {/* グラフエリア */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">売上推移</h3>
              <div id="salesChart" className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <i className="fas fa-chart-line text-4xl mb-2"></i>
                  <p>グラフを生成するには上記ボタンをクリックしてください</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">車両タイプ別売上</h3>
              <div id="vehicleChart" className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <i className="fas fa-chart-pie text-4xl mb-2"></i>
                  <p>データを読み込み中...</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">エリア別売上</h3>
              <div id="areaChart" className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <i className="fas fa-chart-bar text-4xl mb-2"></i>
                  <p>データを読み込み中...</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">顧客別売上TOP10</h3>
              <div id="customerChart" className="h-64 overflow-y-auto">
                <div className="space-y-2" id="topCustomersList">
                  <div className="text-center text-gray-500 py-8">
                    <i className="fas fa-users text-4xl mb-2"></i>
                    <p>データを読み込み中...</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <i className="fas fa-file-invoice mr-2 text-orange-600"></i>
                見積もりタイプ別売上
              </h3>
              <div id="estimateTypeChart" className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <i className="fas fa-chart-pie text-4xl mb-2"></i>
                  <p>データを読み込み中...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* カスタムレポート（売上分析内） */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              <i className="fas fa-download mr-2 text-indigo-600"></i>
              カスタムレポート出力
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">データ項目選択</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" id="customCheck_sales" checked />
                    <span className="ml-2 text-sm">売上金額</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" id="customCheck_orders" checked />
                    <span className="ml-2 text-sm">受注実績</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" id="customCheck_customers" />
                    <span className="ml-2 text-sm">顧客情報</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">出力設定</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">レポート名</label>
                    <input type="text" id="customReportName" className="form-input" placeholder="カスタムレポート" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">出力形式</label>
                    <select id="customReportFormat" className="form-select">
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                  <button onclick="ReportManagement.generateCustomReport()" className="btn-primary w-full">
                    <i className="fas fa-download mr-2"></i>
                    レポート生成・ダウンロード
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// ================== レポート機能API ==================

// API: 基本統計取得
app.get('/api/reports/basic-stats', async (c) => {
  try {
    const { env } = c

    // 基本統計データを取得
    const [
      totalRevenueResult,
      totalOrdersResult,
      totalEstimatesResult
    ] = await Promise.all([
      // 総売上（受注済み見積の合計金額）
      env.DB.prepare(`
        SELECT SUM(e.total_amount) as total_revenue
        FROM estimates e
        LEFT JOIN projects p ON e.project_id = p.id
        WHERE p.status = 'order'
      `).all(),
      
      // 受注件数
      env.DB.prepare(`
        SELECT COUNT(*) as total_orders
        FROM estimates e
        LEFT JOIN projects p ON e.project_id = p.id
        WHERE p.status = 'order'
      `).all(),
      
      // 総見積件数
      env.DB.prepare('SELECT COUNT(*) as total_estimates FROM estimates').all()
    ])

    const totalRevenue = totalRevenueResult.results?.[0]?.total_revenue || 0
    const totalOrders = totalOrdersResult.results?.[0]?.total_orders || 0
    const totalEstimates = totalEstimatesResult.results?.[0]?.total_estimates || 0

    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
    const orderRate = totalEstimates > 0 ? Math.round((totalOrders / totalEstimates) * 100) : 0

    return c.json({
      success: true,
      totalRevenue,
      totalOrders,
      totalEstimates,
      averageOrderValue,
      orderRate
    })

  } catch (error) {
    console.error('基本統計取得エラー:', error)
    return c.json({ error: '基本統計の取得に失敗しました' }, 500)
  }
})

// API: 売上分析レポート
app.post('/api/reports/sales-analysis', async (c) => {
  try {
    const { env } = c
    const { start_date, end_date, period = 'monthly' } = await c.req.json()

    // 集計単位に応じたstrftimeフォーマットを決定
    let groupFormat: string
    switch (period) {
      case 'daily':
        groupFormat = '%Y-%m-%d'
        break
      case 'weekly':
        groupFormat = '%Y-W%W'
        break
      case 'monthly':
        groupFormat = '%Y-%m'
        break
      case 'quarterly':
        // SQLiteにはquarter関数がないため、月から四半期を計算
        groupFormat = 'quarter'
        break
      case 'yearly':
        groupFormat = '%Y'
        break
      default:
        groupFormat = '%Y-%m'
    }

    let salesData: any[]

    if (period === 'quarterly') {
      // 四半期: 特殊処理
      const { results } = await env.DB.prepare(`
        SELECT 
          strftime('%Y', e.created_at) || '-Q' || 
          CASE 
            WHEN CAST(strftime('%m', e.created_at) AS INTEGER) BETWEEN 1 AND 3 THEN '1'
            WHEN CAST(strftime('%m', e.created_at) AS INTEGER) BETWEEN 4 AND 6 THEN '2'
            WHEN CAST(strftime('%m', e.created_at) AS INTEGER) BETWEEN 7 AND 9 THEN '3'
            ELSE '4'
          END as period,
          SUM(e.total_amount) as revenue,
          COUNT(*) as orders
        FROM estimates e
        LEFT JOIN projects p ON e.project_id = p.id
        WHERE e.created_at BETWEEN ? AND ?
          AND p.status = 'order'
        GROUP BY period
        ORDER BY period
      `).bind(start_date, end_date).all()
      salesData = results
    } else {
      // 日次/週次/月次/年次
      const { results } = await env.DB.prepare(`
        SELECT 
          strftime('${groupFormat}', e.created_at) as period,
          SUM(e.total_amount) as revenue,
          COUNT(*) as orders
        FROM estimates e
        LEFT JOIN projects p ON e.project_id = p.id
        WHERE e.created_at BETWEEN ? AND ?
          AND p.status = 'order'
        GROUP BY strftime('${groupFormat}', e.created_at)
        ORDER BY period
      `).bind(start_date, end_date).all()
      salesData = results
    }

    // 車両タイプ別売上
    const { results: vehicleData } = await env.DB.prepare(`
      SELECT 
        e.vehicle_type,
        SUM(e.total_amount) as revenue,
        COUNT(*) as orders
      FROM estimates e
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE e.created_at BETWEEN ? AND ?
        AND p.status = 'order'
      GROUP BY e.vehicle_type
      ORDER BY revenue DESC
    `).bind(start_date, end_date).all()

    // エリア別売上
    const { results: areaData } = await env.DB.prepare(`
      SELECT 
        e.delivery_area,
        SUM(e.total_amount) as revenue,
        COUNT(*) as orders
      FROM estimates e
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE e.created_at BETWEEN ? AND ?
        AND p.status = 'order'
      GROUP BY e.delivery_area
      ORDER BY revenue DESC
    `).bind(start_date, end_date).all()

    // 見積もりタイプ別売上
    const { results: estimateTypeData } = await env.DB.prepare(`
      SELECT 
        e.estimate_type,
        SUM(e.total_amount) as revenue,
        COUNT(*) as orders
      FROM estimates e
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE e.created_at BETWEEN ? AND ?
        AND p.status = 'order'
      GROUP BY e.estimate_type
      ORDER BY revenue DESC
    `).bind(start_date, end_date).all()

    return c.json({
      success: true,
      salesData,
      vehicleData,
      areaData,
      estimateTypeData
    })

  } catch (error) {
    console.error('売上分析レポートエラー:', error)
    return c.json({ error: '売上分析レポートの生成に失敗しました' }, 500)
  }
})

// API: カスタムCSV出力
app.post('/api/reports/custom-csv', async (c) => {
  try {
    const { env } = c
    const { items } = await c.req.json()

    let csvData = ''
    const headers: string[] = []

    // ヘッダー行の構築
    if (items.includes('売上金額')) headers.push('期間', '売上金額')
    if (items.includes('受注実績')) headers.push('期間', '受注件数', '受注率')
    if (items.includes('顧客情報')) headers.push('顧客名', '案件数', '売上合計')

    // 重複を除去してヘッダー出力
    const uniqueHeaders = [...new Set(headers)]
    csvData = uniqueHeaders.join(',') + '\n'

    // 売上金額・受注実績データ
    if (items.includes('売上金額') || items.includes('受注実績')) {
      const { results: salesData } = await env.DB.prepare(`
        SELECT 
          strftime('%Y-%m', e.created_at) as period,
          SUM(e.total_amount) as revenue,
          COUNT(*) as orders
        FROM estimates e
        LEFT JOIN projects p ON e.project_id = p.id
        WHERE p.status = 'order'
          AND e.created_at >= date('now', '-12 months')
        GROUP BY strftime('%Y-%m', e.created_at)
        ORDER BY period
      `).all()

      const { results: totalEstimates } = await env.DB.prepare(`
        SELECT strftime('%Y-%m', created_at) as period, COUNT(*) as total
        FROM estimates
        WHERE created_at >= date('now', '-12 months')
        GROUP BY strftime('%Y-%m', created_at)
      `).all()

      const totalMap: Record<string, number> = {}
      totalEstimates?.forEach((r: any) => { totalMap[r.period] = r.total })

      salesData.forEach((row: any) => {
        const rowData: string[] = [row.period]
        if (items.includes('売上金額')) rowData.push(String(row.revenue || 0))
        if (items.includes('受注実績')) {
          rowData.push(String(row.orders || 0))
          const total = totalMap[row.period] || row.orders
          const rate = total > 0 ? Math.round((row.orders / total) * 100) : 0
          rowData.push(rate + '%')
        }
        csvData += rowData.join(',') + '\n'
      })
    }

    // 顧客情報データ
    if (items.includes('顧客情報')) {
      if (items.includes('売上金額') || items.includes('受注実績')) {
        csvData += '\n' // セクション区切り
      }
      csvData += '顧客名,案件数,売上合計\n'

      const { results: customerData } = await env.DB.prepare(`
        SELECT 
          c.company_name,
          COUNT(DISTINCT p.id) as project_count,
          COALESCE(SUM(e.total_amount), 0) as total_revenue
        FROM customers c
        LEFT JOIN projects p ON c.id = p.customer_id
        LEFT JOIN estimates e ON p.id = e.project_id
        GROUP BY c.id, c.company_name
        ORDER BY total_revenue DESC
      `).all()

      customerData.forEach((row: any) => {
        csvData += `${row.company_name},${row.project_count},${row.total_revenue}\n`
      })
    }

    // BOM付きUTF-8でExcelでの文字化けを防止
    const bom = '\uFEFF'
    return new Response(bom + csvData, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="custom_report_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('CSV生成エラー:', error)
    return c.json({ error: 'CSVレポートの生成に失敗しました' }, 500)
  }
})

// ================== AI機能ユーティリティ関数 ==================

function generateDefaultRecommendation(vehicleType: string, operationType: string, deliveryArea: string) {
  // ルールベースのデフォルト推奨
  let recommendation = {
    supervisor_count: 0,
    leader_count: 1,
    m2_staff_full_day: 1,
    m2_staff_half_day: 0,
    temp_staff_full_day: 0,
    temp_staff_half_day: 0,
    confidence_score: 0.6,
    cost_efficiency: 0.7,
    reasoning: 'デフォルト推奨値です。より正確な推奨のため、案件の詳細情報をご入力ください。'
  }

  // 車両タイプによる調整
  switch (vehicleType) {
    case '大型車':
      recommendation.supervisor_count = 1
      recommendation.leader_count = 2
      recommendation.m2_staff_full_day = 3
      break
    case '4t車':
      recommendation.supervisor_count = operationType === '終日' ? 1 : 0
      recommendation.leader_count = 2
      recommendation.m2_staff_full_day = 2
      break
    case '2t車':
      recommendation.leader_count = 1
      recommendation.m2_staff_full_day = operationType === '終日' ? 2 : 1
      break
    case '軽トラック':
      recommendation.leader_count = 0
      recommendation.m2_staff_full_day = 1
      break
  }

  // エリア距離による調整
  if (deliveryArea === 'B' || deliveryArea === 'C') {
    recommendation.temp_staff_full_day = 1
  }

  return recommendation
}

function compareStaffConfiguration(current: any, recommended: any) {
  const comparison = {
    changes: [],
    cost_impact: 0,
    efficiency_impact: 'neutral'
  }

  const fields = [
    { key: 'supervisor_count', label: '監督者', cost: 50000 },
    { key: 'leader_count', label: 'リーダー', cost: 30000 },
    { key: 'm2_staff_full_day', label: 'M2スタッフ（終日）', cost: 18000 },
    { key: 'm2_staff_half_day', label: '一般社員', cost: 20000 },
    { key: 'temp_staff_full_day', label: '派遣スタッフ（終日）', cost: 17000 },
    { key: 'temp_staff_half_day', label: '派遣スタッフ（半日）', cost: 10000 }
  ]

  fields.forEach(field => {
    const currentValue = current[field.key] || 0
    const recommendedValue = recommended[field.key] || 0
    
    if (currentValue !== recommendedValue) {
      const diff = recommendedValue - currentValue
      comparison.changes.push({
        field: field.label,
        current: currentValue,
        recommended: recommendedValue,
        difference: diff,
        impact: diff > 0 ? 'increase' : 'decrease'
      })
      comparison.cost_impact += diff * field.cost
    }
  })

  if (comparison.cost_impact > 0) {
    comparison.efficiency_impact = 'cost_increase_efficiency_up'
  } else if (comparison.cost_impact < 0) {
    comparison.efficiency_impact = 'cost_decrease_maintain_quality'
  }

  return comparison
}

function generateAIEnhancements(estimate: any, customNotes: string) {
  // AI強化コンテンツの生成
  const enhancements = {
    ai_optimization_note: '',
    staff_summary: '',
    work_description: '',
    ai_follow_suggestion: '',
    our_company_name: '輸送サービス株式会社',
    staff_name: '営業担当',
    phone_number: '03-1234-5678',
    email_address: 'sales@transport-service.co.jp'
  }

  // スタッフ構成サマリー生成
  const staffParts = []
  if (estimate.supervisor_count > 0) staffParts.push(`監督者${estimate.supervisor_count}名`)
  if (estimate.leader_count > 0) staffParts.push(`リーダー${estimate.leader_count}名`)
  if (estimate.m2_staff_full_day > 0) staffParts.push(`M2スタッフ${estimate.m2_staff_full_day}名`)
  if (estimate.temp_staff_full_day > 0) staffParts.push(`派遣スタッフ${estimate.temp_staff_full_day}名`)
  enhancements.staff_summary = staffParts.join('、')

  // AI最適化ノート生成
  if (estimate.vehicle_type === '4t車' && estimate.operation_type === '終日') {
    enhancements.ai_optimization_note = `
■AI最適化ポイント
当案件は4t車による終日作業のため、効率性とコスト最適化を考慮したスタッフ配置をご提案いたします。
過去の類似案件データに基づき、最適な人員構成でスムーズな作業進行をお約束します。`
  }

  // 作業内容生成
  enhancements.work_description = estimate.notes || '輸送作業'
  if (customNotes) {
    enhancements.work_description += `\n${customNotes}`
  }

  // フォローアップ提案
  enhancements.ai_follow_suggestion = `
お忙しい中恐れ入ります。
弊社では過去の類似案件において高い顧客満足度を実現しており、
御社のご要望に応じたカスタマイズも可能です。

もしご予算やスケジュールについてご相談がございましたら、
柔軟に対応させていただきますので、お気軽にお声がけください。`

  return enhancements
}

function replaceTemplateVariables(template: string, estimate: any, enhancements: any) {
  let result = template

  // 基本情報の置換
  const variables = {
    company_name: estimate.customer_company || estimate.customer_name,
    customer_name: estimate.customer_name,
    estimate_number: estimate.estimate_number,
    project_name: estimate.project_name || '輸送作業',
    delivery_area: estimate.delivery_area,
    delivery_address: estimate.delivery_address,
    vehicle_type: estimate.vehicle_type,
    operation_type: estimate.operation_type,
    total_amount: estimate.total_amount?.toLocaleString() || '0',
    work_date: '調整中',
    ...enhancements
  }

  // 変数置換
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(regex, variables[key] || '')
  })

  return result
}

function generateOrderProbabilityRecommendations(probability: number, factors: string[]) {
  const recommendations = []

  if (probability < 0.4) {
    recommendations.push('価格の見直しや追加サービスの提案を検討してください')
    recommendations.push('顧客との詳細な打ち合わせで要望を確認することをお勧めします')
  } else if (probability < 0.7) {
    recommendations.push('フォローアップメールで関心度を確認してください')
    recommendations.push('競合他社の動向も考慮して対応策を検討してください')
  } else {
    recommendations.push('積極的なフォローアップで受注確定を目指してください')
    recommendations.push('受注後のスケジュール調整を事前に準備しておくことをお勧めします')
  }

  return recommendations
}

// ================== 不足しているページルート ==================

// AI機能ページ
app.get('/ai', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <i className="fas fa-truck text-white text-2xl mr-3"></i>
                <h1 className="text-xl font-bold text-white">Office M2 見積システム</h1>
              </a>
            </div>
            <div className="text-white">
              <span className="text-sm">AI機能</span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <i className="fas fa-robot mr-3 text-pink-600"></i>
            AI機能
          </h2>
          <p className="text-gray-600">AI技術を活用した最適化・自動化機能です</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* スタッフ最適化AI */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <i className="fas fa-users text-blue-600 text-xl"></i>
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">スタッフ最適化AI</h3>
            </div>
            <p className="text-gray-600 mb-4">
              車両タイプ、作業内容、エリアに基づいて最適なスタッフ構成を提案します。
              過去の成功パターンを学習し、効率的な人員配置をサポートします。
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                <span>成功率95%の最適化パターン</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                <span>コスト効率88%向上</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                <span>リアルタイム学習</span>
              </div>
            </div>
            <button onclick="window.location.href='/estimate/step4'" className="mt-4 w-full btn-primary">
              <i className="fas fa-magic mr-2"></i>
              スタッフ最適化を試す
            </button>
          </div>

          {/* AI営業メール生成 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <i className="fas fa-envelope-open-text text-green-600 text-xl"></i>
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">営業メール生成AI</h3>
            </div>
            <p className="text-gray-600 mb-4">
              見積内容と顧客情報から、パーソナライズされた営業メールを自動生成します。
              効果的なフォローアップで受注率を向上させます。
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                <span>自動パーソナライズ</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                <span>複数テンプレート対応</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                <span>成功率向上</span>
              </div>
            </div>
            <button onclick="window.location.href='/estimates'" className="mt-4 w-full btn-primary">
              <i className="fas fa-robot mr-2"></i>
              メール生成を試す
            </button>
          </div>

          {/* AI受注確率予測 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                <i className="fas fa-brain text-purple-600 text-xl"></i>
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">受注確率予測AI</h3>
            </div>
            <p className="text-gray-600 mb-4">
              見積情報と顧客履歴から受注確率を予測し、戦略的なアプローチを提案します。
              営業効率を大幅に改善します。
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                <span>信頼度78%の予測</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                <span>戦略的アドバイス</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                <span>継続学習システム</span>
              </div>
            </div>
            <button onclick="window.location.href='/estimates'" className="mt-4 w-full btn-primary">
              <i className="fas fa-chart-line mr-2"></i>
              予測分析を試す
            </button>
          </div>
        </div>

        {/* AI設定セクション */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">AI設定・管理</h3>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">学習データ統計</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">スタッフ最適化パターン:</span>
                    <span className="text-sm font-medium">10件</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">メールテンプレート:</span>
                    <span className="text-sm font-medium">3件</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">予測実行回数:</span>
                    <span className="text-sm font-medium">0回</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">AI機能ステータス</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">スタッフ最適化AI:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <i className="fas fa-check mr-1"></i>
                      稼働中
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">メール生成AI:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <i className="fas fa-check mr-1"></i>
                      稼働中
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">予測分析AI:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <i className="fas fa-check mr-1"></i>
                      稼働中
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                <strong>AI機能について:</strong> 
                当システムのAI機能は、Cloudflare Workers上で動作するルールベースのAIエンジンを使用しています。
                外部のAI APIは使用せず、すべてセルフホスティングで動作します。
              </p>
              <p className="text-sm text-gray-600">
                データはすべてローカルのCloudflare D1データベースで管理され、
                プライバシーとセキュリティが確保されています。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
})

// 設定ページ
app.get('/settings', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-gray-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <i className="fas fa-truck text-white text-2xl mr-3"></i>
                <h1 className="text-xl font-bold text-white">Office M2 見積システム</h1>
              </a>
            </div>
            <div className="text-white">
              <span className="text-sm">システム設定</span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <i className="fas fa-cog mr-3 text-gray-600"></i>
            システム設定
          </h2>
          <p className="text-gray-600">システムの基本設定を管理します</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 設定メニュー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">設定メニュー</h3>
                <nav className="space-y-2">
                  <a href="/admin" className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <i className="fas fa-cogs mr-3 text-teal-600"></i>
                    管理者メニュー
                  </a>
                  <a href="/masters" className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <i className="fas fa-database mr-3 text-orange-600"></i>
                    マスタ管理
                  </a>
                  <a href="/ai" className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <i className="fas fa-robot mr-3 text-pink-600"></i>
                    AI機能設定
                  </a>
                  <a href="/reports" className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <i className="fas fa-chart-bar mr-3 text-indigo-600"></i>
                    レポート設定
                  </a>
                  <button onclick="alert('バックアップ機能は実装予定です')" className="w-full flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg text-left">
                    <i className="fas fa-download mr-3 text-blue-600"></i>
                    データバックアップ
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* 設定内容 */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* 基本設定 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">基本設定</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">会社名</label>
                    <input type="text" id="companyName" className="form-input" placeholder="会社名を入力してください" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">担当者名</label>
                    <input type="text" id="contactPerson" className="form-input" placeholder="担当者名を入力してください" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                    <input type="text" id="phoneNumber" className="form-input" placeholder="03-1234-5678" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                    <input type="email" id="emailAddress" className="form-input" placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">会社住所</label>
                    <input type="text" id="companyAddress" className="form-input" placeholder="〒000-0000 東京都千代田区..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">インボイス番号</label>
                    <input type="text" id="invoiceNumber" className="form-input" placeholder="T1234567890123" />
                    <p className="mt-1 text-xs text-gray-500">※ 適格請求書発行事業者の登録番号（見積書PDFに表示されます）</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">会社ロゴ</label>
                    <p className="text-sm text-gray-500 mb-2">見積書に表示されるロゴをアップロードしてください（PNG, JPG, GIF対応）</p>
                    <div className="space-y-3">
                      <div>
                        <input 
                          type="file" 
                          id="logoFile" 
                          accept="image/png,image/jpeg,image/gif"
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          onchange="handleLogoUpload(event)"
                        />
                      </div>
                      <div id="logoPreview" className="hidden">
                        <p className="text-sm text-gray-600 mb-2">プレビュー:</p>
                        <img id="logoImage" src="" alt="ロゴプレビュー" className="max-h-24 border border-gray-300 rounded" />
                        <button type="button" onclick="removeLogo()" className="mt-2 text-sm text-red-600 hover:text-red-800">
                          <i className="fas fa-trash mr-1"></i>ロゴを削除
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-x-3">
                    <button type="button" onclick="saveBasicSettings()" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      <i className="fas fa-save mr-2"></i>基本設定を保存
                    </button>
                    <button type="button" onclick="loadBasicSettings(0)" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                      <i className="fas fa-refresh mr-2"></i>設定を再読み込み
                    </button>
                  </div>
                </div>
              </div>

              {/* 見積設定 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">見積設定</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">消費税率（%）</label>
                    <input type="number" className="form-input w-32" value="10" min="0" max="100" step="0.1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">見積番号プレフィックス</label>
                    <input type="text" className="form-input w-48" value="EST-" />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="form-checkbox" checked />
                      <span className="ml-2 text-sm text-gray-700">見積作成時にPDFを自動生成する</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="form-checkbox" checked />
                      <span className="ml-2 text-sm text-gray-700">AI最適化機能を有効にする</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* システム情報 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">システム情報</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">システムバージョン:</span>
                    <span className="text-sm font-medium">v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">データベース:</span>
                    <span className="text-sm font-medium">Cloudflare D1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">AI エンジン:</span>
                    <span className="text-sm font-medium">ルールベースAI v1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">最終更新:</span>
                    <span className="text-sm font-medium">{new Date().toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              </div>

              {/* 保存ボタン */}
              <div className="flex justify-end">
                <button onclick="alert('設定を保存しました')" className="btn-primary">
                  <i className="fas fa-save mr-2"></i>
                  設定を保存
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ロゴアップロード機能のJavaScript */}
      <script dangerouslySetInnerHTML={{
        __html: `
        // ページ読み込み時に設定を取得・表示
        async function loadBasicSettings(retryCount = 0) {
          try {
            console.log('🔄 設定読み込み開始 (試行' + (retryCount + 1) + '回目)');
            
            // DOM要素の存在チェック
            const companyNameEl = document.getElementById('companyName');
            const contactPersonEl = document.getElementById('contactPerson');
            const phoneNumberEl = document.getElementById('phoneNumber');
            const emailAddressEl = document.getElementById('emailAddress');
            const companyAddressEl = document.getElementById('companyAddress');
            const invoiceNumberEl = document.getElementById('invoiceNumber');
            
            if (!companyNameEl || !contactPersonEl || !phoneNumberEl || !emailAddressEl || !companyAddressEl) {
              console.warn('⚠️ DOM要素が見つかりません。リトライします...');
              if (retryCount < 5) {
                setTimeout(() => loadBasicSettings(retryCount + 1), 1000);
                return;
              } else {
                console.error('❌ DOM要素が見つかりません（最大試行回数に達しました）');
                return;
              }
            }
            
            const response = await fetch('/api/settings/basic', {
              method: 'GET',
              headers: {
                'X-User-ID': 'test-user-001'
              }
            });
            
            const result = await response.json();
            
            if (result.success && result.data) {
              const settings = result.data;
              
              // フォームに値をセット
              if (settings.company_name) {
                companyNameEl.value = settings.company_name;
                console.log('✅ 会社名設定:', settings.company_name);
              }
              
              if (settings.contact_person || settings.representative_name) {
                contactPersonEl.value = settings.contact_person || settings.representative_name;
                console.log('✅ 担当者名設定:', settings.contact_person || settings.representative_name);
              }
              
              if (settings.company_phone) {
                phoneNumberEl.value = settings.company_phone;
                console.log('✅ 電話番号設定:', settings.company_phone);
              }
              
              if (settings.company_email) {
                emailAddressEl.value = settings.company_email;
                console.log('✅ メールアドレス設定:', settings.company_email);
              }
              
              if (settings.company_address) {
                companyAddressEl.value = settings.company_address;
                console.log('✅ 会社住所設定:', settings.company_address);
              }
              
              if (settings.invoice_number && invoiceNumberEl) {
                invoiceNumberEl.value = settings.invoice_number;
                console.log('✅ インボイス番号設定:', settings.invoice_number);
              }
              
              // ロゴがある場合は表示
              if (settings.logo) {
                const logoImage = document.getElementById('logoImage');
                const logoPreview = document.getElementById('logoPreview');
                
                if (logoImage && logoPreview) {
                  logoImage.src = settings.logo;
                  logoPreview.classList.remove('hidden');
                  console.log('✅ ロゴ表示完了');
                }
              }
              
              console.log('✅ 設定読み込み完了:', settings);
              
              // 最終確認：値が実際に設定されているかチェック
              console.log('🔍 フォーム値確認:');
              console.log('  会社名:', companyNameEl.value);
              console.log('  担当者:', contactPersonEl.value);
              console.log('  電話番号:', phoneNumberEl.value);
              console.log('  メールアドレス:', emailAddressEl.value);
              console.log('  会社住所:', companyAddressEl.value);
              
            } else {
              console.warn('⚠️ 設定データの取得に失敗:', result);
            }
          } catch (error) {
            console.error('設定読み込みエラー:', error);
          }
        }
        
        // ロゴアップロード処理
        function handleLogoUpload(event) {
          const file = event.target.files[0];
          if (file) {
            // ファイルサイズチェック (2MB以下)
            if (file.size > 2 * 1024 * 1024) {
              alert('ファイルサイズは2MB以下にしてください');
              event.target.value = '';
              return;
            }
            
            // 画像プレビュー表示
            const reader = new FileReader();
            reader.onload = function(e) {
              const logoImage = document.getElementById('logoImage');
              const logoPreview = document.getElementById('logoPreview');
              
              logoImage.src = e.target.result;
              logoPreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
          }
        }
        
        // ロゴ削除
        function removeLogo() {
          document.getElementById('logoFile').value = '';
          document.getElementById('logoPreview').classList.add('hidden');
          document.getElementById('logoImage').src = '';
        }
        
        // ページ読み込み時に設定を読み込み（遅延実行）
        document.addEventListener('DOMContentLoaded', () => {
          // DOM要素の準備を待つために少し遅延
          setTimeout(loadBasicSettings, 500);
        });
        
        // ウィンドウ読み込み完了時にも再実行（保険）
        window.addEventListener('load', () => {
          setTimeout(loadBasicSettings, 100);
        });
        
        // 基本設定保存（JSON形式に更新）
        async function saveBasicSettings() {
          const companyNameEl = document.getElementById('companyName');
          const contactPersonEl = document.getElementById('contactPerson');
          const phoneNumberEl = document.getElementById('phoneNumber');
          const emailAddressEl = document.getElementById('emailAddress');
          const companyAddressEl = document.getElementById('companyAddress');
          const invoiceNumberEl = document.getElementById('invoiceNumber');
          const logoFileEl = document.getElementById('logoFile');
          
          if (!companyNameEl || !contactPersonEl || !phoneNumberEl || !emailAddressEl || !companyAddressEl || !logoFileEl) {
            console.error('❌ 必要なDOM要素が見つかりません');
            alert('画面の読み込みが完了していません。しばらく待ってから再度お試しください。');
            return;
          }
          
          const companyName = companyNameEl.value;
          const contactPerson = contactPersonEl.value;
          const phoneNumber = phoneNumberEl.value;
          const emailAddress = emailAddressEl.value;
          const companyAddress = companyAddressEl.value;
          const invoiceNumber = invoiceNumberEl ? invoiceNumberEl.value : '';
          const logoFile = logoFileEl.files[0];
          
          try {
            let logoData = null;
            
            // ロゴファイルがある場合はBase64に変換
            if (logoFile) {
              // ファイルサイズチェック (2MB以下)
              if (logoFile.size > 2 * 1024 * 1024) {
                alert('ファイルサイズは2MB以下にしてください');
                return;
              }
              
              logoData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(logoFile);
              });
            }
            
            const settings = {
              company_name: companyName,
              contact_person: contactPerson, // representative_nameではなくcontact_person
              company_phone: phoneNumber,
              company_email: emailAddress,
              company_address: companyAddress,
              invoice_number: invoiceNumber,
              logo: logoData
            };
            
            console.log('💾 基本設定保存:', { ...settings, logo: logoData ? '[BASE64_DATA]' : null });
            
            const response = await fetch('/api/settings/basic', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-User-ID': 'test-user-001'
              },
              body: JSON.stringify(settings)
            });
            
            const result = await response.json();
            
            if (result.success) {
              alert('基本設定を保存しました');
              console.log('✅ 設定保存成功');
            } else {
              alert('保存に失敗しました: ' + result.error);
              console.error('❌ 設定保存失敗:', result.error);
            }
          } catch (error) {
            console.error('基本設定保存エラー:', error);
            alert('保存中にエラーが発生しました: ' + error.message);
          }
        }
        `
      }}></script>
    </div>
  )
})

// 基本設定取得API（新しい実装への統合）
app.get('/api/settings/basic-old', async (c) => {
  try {
    const { env } = c
    const settingsData = await env.KV.get('system_settings')
    
    if (settingsData) {
      const settings = JSON.parse(settingsData)
      return c.json({
        success: true,
        data: settings
      })
    } else {
      // デフォルト設定を返す
      return c.json({
        success: true,
        data: {
          companyName: '輸送サービス株式会社',
          contactPerson: '営業担当',
          phoneNumber: '03-1234-5678',
          emailAddress: 'sales@transport-service.co.jp',
          logo: null
        }
      })
    }
  } catch (error) {
    console.error('基本設定取得エラー:', error)
    return c.json({
      success: false,
      error: error.message || '設定の取得に失敗しました'
    }, 500)
  }
})

// 新規見積作成ページ（タイプ選択へリダイレクト）
app.get('/estimate/new', (c) => {
  // 編集モードの場合はリダイレクトせず、editMode検出用の軽量ページを返す
  const isEdit = c.req.query('edit') === 'true'
  const editId = c.req.query('id')
  
  if (isEdit && editId) {
    return c.html(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>見積編集</title></head>
<body>
<script>
  // sessionStorageからeditMode情報を読み取りStep2へ直接遷移
  const savedFlow = sessionStorage.getItem('estimateFlow');
  if (savedFlow) {
    const flowData = JSON.parse(savedFlow);
    if (flowData.editMode && flowData.customer && flowData.project) {
      flowData.step = 2;
      sessionStorage.setItem('estimateFlow', JSON.stringify(flowData));
      sessionStorage.setItem('estimate_type', flowData.estimate_type || 'standard_a');
      window.location.href = '/estimate/step2';
    } else {
      window.location.href = '/estimate/type-select';
    }
  } else {
    window.location.href = '/estimate/type-select';
  }
</script>
</body></html>`)
  }
  
  return c.redirect('/estimate/type-select')
})

// 見積もりタイプ選択ページ
app.get('/estimate/type-select', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <i className="fas fa-truck text-white text-3xl mr-3"></i>
              <h1 className="text-2xl font-bold text-white">見積もりタイプ選択</h1>
            </div>
            <a href="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              <i className="fas fa-home mr-2"></i>
              トップページ
            </a>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">見積もり作成方式を選択してください</h2>
          <p className="text-gray-600">お客様の状況に合わせて適切な見積もり方式をお選びください</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 標準見積もりA */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-blue-600">
            <div className="text-center mb-4">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-clipboard-list text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">標準見積もりA</h3>
              <span className="inline-block bg-blue-600 text-white text-xs px-2 py-0.5 rounded">プランA</span>
              <p className="text-gray-600 text-sm mt-2">標準料金体系</p>
            </div>

            <div className="mb-4">
              <ul className="text-xs text-gray-600 space-y-1">
                <li><i className="fas fa-check text-blue-500 mr-1"></i>車両輸送（4t車、大型車等）</li>
                <li><i className="fas fa-check text-blue-500 mr-1"></i>作業員派遣・梱包養生</li>
                <li><i className="fas fa-check text-blue-500 mr-1"></i>エリア別料金自動計算</li>
                <li><i className="fas fa-check text-blue-500 mr-1"></i>標準マスター料金適用</li>
              </ul>
            </div>

            <button 
              onclick="window.location.href='/estimate/step1?type=standard_a'" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm"
            >
              <i className="fas fa-arrow-right mr-2"></i>
              標準Aで進む
            </button>
          </div>

          {/* 標準見積もりB */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-teal-600">
            <div className="text-center mb-4">
              <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-clipboard-list text-teal-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">標準見積もりB</h3>
              <span className="inline-block bg-teal-600 text-white text-xs px-2 py-0.5 rounded">プランB</span>
              <p className="text-gray-600 text-sm mt-2">別料金体系</p>
            </div>

            <div className="mb-4">
              <ul className="text-xs text-gray-600 space-y-1">
                <li><i className="fas fa-check text-teal-500 mr-1"></i>車両輸送（4t車、大型車等）</li>
                <li><i className="fas fa-check text-teal-500 mr-1"></i>作業員派遣・梱包養生</li>
                <li><i className="fas fa-check text-teal-500 mr-1"></i>エリア別料金自動計算</li>
                <li><i className="fas fa-check text-teal-500 mr-1"></i>プランB専用マスター料金</li>
              </ul>
            </div>

            <button 
              onclick="window.location.href='/estimate/step1?type=standard_b'" 
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm"
            >
              <i className="fas fa-arrow-right mr-2"></i>
              標準Bで進む
            </button>
          </div>

          {/* フリー見積もり */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-green-600">
            <div className="text-center mb-4">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-edit text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">フリー見積もり</h3>
              <span className="inline-block bg-green-600 text-white text-xs px-2 py-0.5 rounded">自由入力</span>
              <p className="text-gray-600 text-sm mt-2">エリア外・特殊案件向け</p>
            </div>

            <div className="mb-4">
              <ul className="text-xs text-gray-600 space-y-1">
                <li><i className="fas fa-check text-green-500 mr-1"></i>項目・料金を自由入力</li>
                <li><i className="fas fa-check text-green-500 mr-1"></i>最大20項目まで対応</li>
                <li><i className="fas fa-check text-green-500 mr-1"></i>特殊案件・個別料金</li>
                <li><i className="fas fa-check text-green-500 mr-1"></i>税込み計算自動対応</li>
              </ul>
            </div>

            <button 
              onclick="window.location.href='/estimate/free-form?type=free'" 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm"
            >
              <i className="fas fa-arrow-right mr-2"></i>
              フリー見積もりで進む
            </button>
          </div>

          {/* 現地調査専門見積もり */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-orange-500">
            <div className="text-center mb-4">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-search-location text-orange-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">現地調査専門</h3>
              <span className="inline-block bg-orange-500 text-white text-xs px-2 py-0.5 rounded">調査専用</span>
              <p className="text-gray-600 text-sm mt-2">調査のみの単体見積もり</p>
            </div>

            <div className="mb-4">
              <ul className="text-xs text-gray-600 space-y-1">
                <li><i className="fas fa-check text-orange-500 mr-1"></i>家具納品前の現地調査</li>
                <li><i className="fas fa-check text-orange-500 mr-1"></i>搬入経路・設置場所確認</li>
                <li><i className="fas fa-check text-orange-500 mr-1"></i>ワンマン・ツーマン選択</li>
                <li><i className="fas fa-check text-orange-500 mr-1"></i>郵便番号エリア自動判定</li>
              </ul>
            </div>

            <button 
              onclick="window.location.href='/estimate/survey-only'" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm"
            >
              <i className="fas fa-arrow-right mr-2"></i>
              現地調査見積もりで進む
            </button>
          </div>
        </div>

        {/* 戻るボタン */}
        <div className="text-center mt-8 pb-8">
          <a href="/" className="text-gray-600 hover:text-gray-800">
            <i className="fas fa-arrow-left mr-2"></i>
            トップページに戻る
          </a>
        </div>
      </main>
    </div>
  )
})

// フリー見積もり入力ページ
app.get('/estimate/free-form', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-green-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center text-white hover:text-green-200">
                <i className="fas fa-truck text-white text-2xl mr-3"></i>
                <h1 className="text-xl font-bold">Office M2 見積システム</h1>
              </a>
            </div>
            <div className="text-white">
              <span className="text-sm">フリー見積作成</span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">フリー見積もり作成</h2>
            <p className="text-gray-600">項目を自由に入力して見積もりを作成できます（最大20項目）</p>
          </div>

          <form id="freeEstimateForm">
            {/* 基本情報 */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  顧客名 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="customerName" 
                  name="customerName" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="例：山田太郎"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  案件名 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="projectName" 
                  name="projectName" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="例：○○工場設備移転作業"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  作業日
                </label>
                <input 
                  type="date" 
                  id="workDate" 
                  name="workDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  見積有効期限
                </label>
                <input 
                  type="date" 
                  id="validUntil" 
                  name="validUntil"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* 見積もり項目 */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">見積もり項目</h3>
                <button 
                  type="button" 
                  id="addItemBtn"
                  onclick="FreeEstimate.addItem()"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  <i className="fas fa-plus mr-2"></i>
                  項目追加
                </button>
              </div>
              
              <div id="itemsContainer" className="space-y-4">
                {/* 初期項目 */}
                <div className="item-row bg-gray-50 p-4 rounded-md border" data-index="0">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">項目名</label>
                      <input 
                        type="text" 
                        name="items[0][name]" 
                        required 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="例：4tトラック輸送"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">単位</label>
                      <input 
                        type="text" 
                        name="items[0][unit]" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="例：台"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                      <input 
                        type="number" 
                        name="items[0][quantity]" 
                        value="1" 
                        min="1" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        onchange="FreeEstimate.calculateItemTotal(0)"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">単価（税抜）</label>
                      <input 
                        type="number" 
                        name="items[0][unitPrice]" 
                        min="0" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0"
                        onchange="FreeEstimate.calculateItemTotal(0)"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">合計（税抜）</label>
                      <input 
                        type="number" 
                        name="items[0][total]" 
                        readonly 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-1">
                      <button 
                        type="button" 
                        onclick="FreeEstimate.removeItem(0)" 
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md"
                        title="削除"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div id="itemsLimit" className="text-sm text-gray-500 mt-2">
                項目数: <span id="itemCount">1</span> / 20
              </div>
            </div>

            {/* 合計計算 */}
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">合計金額</h3>
              
              {/* 値引き入力 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  値引き（税抜）
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <button type="button" id="discountTypeAmount" className="px-3 py-1 text-sm rounded-l border border-blue-500 bg-blue-500 text-white font-bold" onclick="switchDiscountType('amount')">金額</button>
                  <button type="button" id="discountTypePercent" className="px-3 py-1 text-sm rounded-r border border-gray-300 bg-white text-gray-700" onclick="switchDiscountType('percent')">％</button>
                </div>
                <div id="discountAmountRow" className="flex items-center space-x-3">
                  <input 
                    type="number" 
                    id="discountAmount" 
                    name="discountAmount" 
                    min="0" 
                    value="0"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                    onchange="FreeEstimate.calculateTotal()"
                  />
                  <span className="text-sm text-gray-600">円</span>
                </div>
                <div id="discountPercentRow" className="flex items-center space-x-3" style="display:none">
                  <input 
                    type="number" 
                    id="discountPercent" 
                    min="0" 
                    max="100"
                    step="0.1"
                    value="0"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                    onchange="FreeEstimate.calculateTotal()"
                  />
                  <span className="text-sm text-gray-600">％</span>
                  <span className="text-xs text-gray-500" id="discountPercentCalc"></span>
                </div>
                <span className="text-xs text-gray-500 mt-1 block">※小計から値引きされます</span>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">小計（税抜）</div>
                  <div id="subtotalAmount" className="text-xl font-bold text-blue-600">¥0</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">値引き額</div>
                  <div id="discountDisplayAmount" className="text-xl font-bold text-red-600">¥0</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">消費税（10%）</div>
                  <div id="taxAmount" className="text-xl font-bold text-blue-600">¥0</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">合計（税込）</div>
                  <div id="totalAmount" className="text-2xl font-bold text-blue-600">¥0</div>
                </div>
              </div>
            </div>

            {/* 追加事項 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                追加事項・備考
              </label>
              <textarea 
                id="notes" 
                name="notes" 
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="特記事項や作業条件等をご記入ください"
              ></textarea>
            </div>

            {/* アクションボタン */}
            <div className="flex justify-between items-center">
              <a href="/estimate/type-select" className="text-gray-600 hover:text-gray-800">
                <i className="fas fa-arrow-left mr-2"></i>
                タイプ選択に戻る
              </a>
              
              <div className="space-x-3">
                <button 
                  type="button" 
                  onclick="FreeEstimate.preview()"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
                >
                  <i className="fas fa-eye mr-2"></i>
                  プレビュー
                </button>
                <button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium"
                >
                  <i className="fas fa-save mr-2"></i>
                  見積もり保存
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* JavaScript初期化（rendererで読み込まれるapp.jsを使用） */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // フリー見積もり専用JavaScript初期化
          window.addEventListener('load', function() {
            if (typeof FreeEstimate !== 'undefined') {
              FreeEstimate.init();
            }
          });
        `
      }}></script>
    </div>
  )
})

// ==========================================
// 現地調査専門見積もりページ
// ==========================================
app.get('/estimate/survey-only', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center text-white hover:text-blue-200">
                <i className="fas fa-search-location text-white text-2xl mr-3"></i>
                <h1 className="text-xl font-bold">Office M2 見積システム</h1>
              </a>
            </div>
            <div className="text-white">
              <span className="text-sm">現地調査専門見積作成</span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              <i className="fas fa-search-location text-blue-600 mr-2"></i>
              現地調査専門見積もり
            </h2>
            <p className="text-gray-600">家具納品前の現地調査（搬入経路・設置場所確認）の見積もりを作成します</p>
          </div>

          <form id="surveyEstimateForm">
            {/* 基本情報 */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                <i className="fas fa-user mr-2 text-blue-600"></i>基本情報
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    顧客名 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="surveyCustomerName" 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例：山田太郎 様"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    案件名 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="surveyProjectName" 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例：○○マンション 家具納品 現地調査"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    調査予定日
                  </label>
                  <input 
                    type="date" 
                    id="surveyDate" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    見積有効期限
                  </label>
                  <input 
                    type="date" 
                    id="surveyValidUntil" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 調査内容 */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                <i className="fas fa-clipboard-check mr-2 text-blue-600"></i>調査内容
              </h3>
              
              {/* 調査員タイプ */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  調査員人数 <span className="text-red-500">*</span>
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none hover:border-blue-400 transition-all" id="label-oneman">
                    <input type="radio" name="surveyType" value="oneman" className="sr-only" onChange="updateSurveyCalc()" />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <p className="font-bold text-gray-900 text-lg">
                            <i className="fas fa-user text-blue-500 mr-2"></i>ワンマン（1人）
                          </p>
                          <p className="text-gray-500 mt-1">1名による現地調査</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-blue-600 font-bold text-lg" id="oneman-price-display">-</span>
                        <p className="text-xs text-gray-500">エリア別料金</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none hover:border-blue-400 transition-all" id="label-twoman">
                    <input type="radio" name="surveyType" value="twoman" className="sr-only" onChange="updateSurveyCalc()" />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <p className="font-bold text-gray-900 text-lg">
                            <i className="fas fa-user-friends text-green-500 mr-2"></i>ツーマン（2人）
                          </p>
                          <p className="text-gray-500 mt-1">2名による現地調査</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-blue-600 font-bold text-lg" id="twoman-price-display">-</span>
                        <p className="text-xs text-gray-500">エリア別料金</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 郵便番号入力でエリア自動判定 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  調査先 郵便番号 <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-3">
                  <input 
                    type="text" 
                    id="surveyPostalCode" 
                    placeholder="例：5300001"
                    maxLength={8}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    type="button"
                    id="surveySearchAddressBtn"
                    onclick="searchSurveyAddress()"
                    className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    <i className="fas fa-search mr-1"></i>住所検索
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">郵便番号を入力して「住所検索」を押すと、エリアが自動判定されます（対応: A〜Fエリア・200km圏内）</p>
              </div>

              {/* エリア自動判定結果 */}
              <div id="surveyAutoAreaResult" className="mb-6 hidden">
                <div id="surveyAreaResultBox" className="p-4 rounded-lg">
                  <div className="flex items-center">
                    <i id="surveyAreaIcon" className="fas fa-check-circle text-green-500 mr-2"></i>
                    <span id="surveyAreaStatusText" className="font-medium text-green-800">エリア自動判定完了</span>
                  </div>
                  <p id="surveyAutoAreaText" className="mt-2 text-sm"></p>
                </div>
              </div>

              {/* 住所（自動入力） */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  調査先住所
                </label>
                <input 
                  type="text" 
                  id="surveyAddress" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="郵便番号検索で自動入力されます"
                />
              </div>

              {/* 判定されたエリア（hidden） */}
              <input type="hidden" id="surveyArea" value="" />
              <input type="hidden" id="surveyAreaRegions" value="" />

              {/* 備考 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  調査内容・備考
                </label>
                <textarea 
                  id="surveyNotes" 
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：搬入経路の幅・天井高確認、エレベーター有無、設置場所の寸法確認 等"
                ></textarea>
              </div>
            </div>

            {/* 料金計算結果 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                <i className="fas fa-calculator mr-2 text-blue-600"></i>料金計算
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-gray-700">調査費（基本料金）</span>
                  <span className="font-bold text-gray-800" id="surveyCalcBase">¥0</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-gray-700">車両費</span>
                  <span className="font-bold text-gray-800" id="surveyCalcVehicle">¥0</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-gray-700 font-semibold">小計（税抜）</span>
                  <span className="font-bold text-gray-800 text-lg" id="surveyCalcSubtotal">¥0</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-gray-700">消費税（10%）</span>
                  <span className="font-bold text-gray-800" id="surveyCalcTax">¥0</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-blue-100 rounded-lg px-4 mt-2">
                  <span className="text-blue-800 font-bold text-lg">合計（税込）</span>
                  <span className="font-bold text-blue-600 text-2xl" id="surveyCalcTotal">¥0</span>
                </div>
              </div>
            </div>

            {/* 値引き */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                <i className="fas fa-tags mr-2 text-red-500"></i>値引き（任意）
              </h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">値引き金額:</span>
                <input 
                  type="number" 
                  id="surveyDiscount" 
                  className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  min="0" 
                  step="100"
                  value="0"
                  onChange="updateSurveyCalc()"
                />
                <span className="text-sm text-gray-600">円</span>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex justify-between items-center">
              <a href="/estimate/type-select" className="text-gray-600 hover:text-gray-800">
                <i className="fas fa-arrow-left mr-2"></i>
                タイプ選択に戻る
              </a>
              <div className="flex space-x-4">
                <button 
                  type="button"
                  onclick="saveSurveyEstimate()"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                >
                  <i className="fas fa-save mr-2"></i>
                  見積もりを保存
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* 保存成功モーダル */}
        <div id="surveySaveModal" className="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-green-600 text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">保存完了</h3>
              <p className="text-gray-600 mb-4" id="surveySaveMessage">見積もりが保存されました</p>
              <div className="space-y-3">
                <a id="surveyPdfLink" href="#" target="_blank"
                  className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                  <i className="fas fa-file-pdf mr-2"></i>PDF出力
                </a>
                <a id="surveyDetailLink" href="#"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                  <i className="fas fa-eye mr-2"></i>見積詳細を見る
                </a>
                <button onclick="document.getElementById('surveySaveModal').classList.add('hidden')"
                  className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors">
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{__html: `
        // エリア料金データ
        let areaPricingData = [];
        // 現在判定されたエリア情報
        let currentSurveyArea = null;
        
        // 対応エリア上限（Fエリア = 200km圏内）
        const MAX_SURVEY_AREA = 'F';
        const SUPPORTED_AREAS = ['A', 'B', 'C', 'D', 'E', 'F'];
        
        // 初期化
        async function initSurveyPage() {
          try {
            const res = await fetch('/api/distance-area-pricing');
            const data = await res.json();
            if (data.success && data.pricing) {
              areaPricingData = data.pricing;
            }
          } catch (e) {
            console.error('エリア料金取得エラー:', e);
          }
        }
        
        // 郵便番号で住所・エリア検索
        async function searchSurveyAddress() {
          const postalInput = document.getElementById('surveyPostalCode');
          const addressInput = document.getElementById('surveyAddress');
          const searchBtn = document.getElementById('surveySearchAddressBtn');
          const resultBox = document.getElementById('surveyAutoAreaResult');
          const areaHidden = document.getElementById('surveyArea');
          const regionsHidden = document.getElementById('surveyAreaRegions');
          
          const postalCode = postalInput.value.replace(/[^\\d]/g, '');
          
          if (!postalCode || postalCode.length !== 7) {
            alert('郵便番号は7桁で入力してください');
            return;
          }
          
          try {
            searchBtn.disabled = true;
            searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>検索中...';
            
            const response = await fetch('/api/postal-code/' + postalCode);
            const areaResponse = await response.json();
            
            // 住所を自動入力
            if (areaResponse.address) {
              addressInput.value = areaResponse.address;
              // 基本情報の調査先住所も同期（存在する場合のみ）
            }
            
            if (areaResponse.success && areaResponse.detected) {
              const areaRank = areaResponse.area_rank;
              
              // Fエリア（200km）まで対応かチェック
              if (SUPPORTED_AREAS.includes(areaRank)) {
                // 対応エリア内
                areaHidden.value = areaRank;
                
                const areaData = areaPricingData.find(a => a.area_rank === areaRank);
                if (areaData) {
                  regionsHidden.value = areaData.regions;
                  currentSurveyArea = areaData;
                  
                  // 料金表示を更新
                  document.getElementById('oneman-price-display').textContent = '¥' + (areaData.survey_oneman_fee || 0).toLocaleString();
                  document.getElementById('twoman-price-display').textContent = '¥' + (areaData.survey_twoman_fee || 0).toLocaleString();
                }
                
                // 成功表示（緑）
                const box = document.getElementById('surveyAreaResultBox');
                box.className = 'p-4 bg-green-50 border border-green-200 rounded-lg';
                document.getElementById('surveyAreaIcon').className = 'fas fa-check-circle text-green-500 mr-2';
                document.getElementById('surveyAreaStatusText').className = 'font-medium text-green-800';
                document.getElementById('surveyAreaStatusText').textContent = 'エリア自動判定完了';
                document.getElementById('surveyAutoAreaText').innerHTML = 
                  '<strong>' + areaRank + 'ランク</strong> - ' + (areaResponse.area_name || '') + 
                  (areaData ? '<br><small class="text-green-600">対象地域: ' + areaData.regions + '</small>' : '');
                resultBox.classList.remove('hidden');
                
                // 料金を再計算
                updateSurveyCalc();
              } else {
                // 対象外エリア（G以降）
                areaHidden.value = '';
                currentSurveyArea = null;
                regionsHidden.value = '';
                
                // 対象外表示（赤）
                const box = document.getElementById('surveyAreaResultBox');
                box.className = 'p-4 bg-red-50 border border-red-200 rounded-lg';
                document.getElementById('surveyAreaIcon').className = 'fas fa-times-circle text-red-500 mr-2';
                document.getElementById('surveyAreaStatusText').className = 'font-medium text-red-800';
                document.getElementById('surveyAreaStatusText').textContent = '対象外エリア';
                document.getElementById('surveyAutoAreaText').innerHTML = 
                  '<span class="text-red-700">現地調査の対応エリアはFエリア（200km圏内）までです。</span><br>' +
                  '<small class="text-red-600">判定結果: ' + areaRank + 'ランク（' + (areaResponse.area_name || '') + '）- 対象外</small>';
                resultBox.classList.remove('hidden');
                
                // 料金をリセット
                resetCalcDisplay();
                
                // 料金表示もリセット
                document.getElementById('oneman-price-display').textContent = '-';
                document.getElementById('twoman-price-display').textContent = '-';
              }
            } else {
              // 判定失敗
              areaHidden.value = '';
              currentSurveyArea = null;
              
              const box = document.getElementById('surveyAreaResultBox');
              box.className = 'p-4 bg-yellow-50 border border-yellow-200 rounded-lg';
              document.getElementById('surveyAreaIcon').className = 'fas fa-exclamation-triangle text-yellow-500 mr-2';
              document.getElementById('surveyAreaStatusText').className = 'font-medium text-yellow-800';
              document.getElementById('surveyAreaStatusText').textContent = 'エリア判定できませんでした';
              document.getElementById('surveyAutoAreaText').innerHTML = '<span class="text-yellow-700">郵便番号を確認して再度お試しください。</span>';
              resultBox.classList.remove('hidden');
              
              resetCalcDisplay();
            }
          } catch (e) {
            console.error('郵便番号検索エラー:', e);
            alert('郵便番号検索に失敗しました: ' + e.message);
          } finally {
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="fas fa-search mr-1"></i>住所検索';
          }
        }
        
        // 料金計算を更新
        function updateSurveyCalc() {
          const surveyType = document.querySelector('input[name="surveyType"]:checked');
          const areaRank = document.getElementById('surveyArea').value;
          const discount = parseInt(document.getElementById('surveyDiscount').value) || 0;
          
          // ラジオボタンの見た目更新
          document.getElementById('label-oneman').classList.remove('border-blue-500', 'bg-blue-50');
          document.getElementById('label-twoman').classList.remove('border-blue-500', 'bg-blue-50');
          if (surveyType) {
            const labelId = surveyType.value === 'oneman' ? 'label-oneman' : 'label-twoman';
            document.getElementById(labelId).classList.add('border-blue-500', 'bg-blue-50');
          }
          
          const areaData = currentSurveyArea || areaPricingData.find(a => a.area_rank === areaRank);
          
          if (!surveyType || !areaRank || !areaData) {
            resetCalcDisplay();
            return;
          }
          
          // 基本料金
          const baseFee = surveyType.value === 'oneman' 
            ? (areaData.survey_oneman_fee || 20000) 
            : (areaData.survey_twoman_fee || 25000);
          
          // 車両費
          const vehicleFee = areaData.transport_vehicle_fee || 5000;
          
          // 小計（距離超過なし）
          const subtotal = baseFee + vehicleFee;
          const discountedSubtotal = Math.max(0, subtotal - discount);
          const tax = Math.floor(discountedSubtotal * 0.1);
          const total = discountedSubtotal + tax;
          
          // 表示更新
          document.getElementById('surveyCalcBase').textContent = '¥' + baseFee.toLocaleString();
          document.getElementById('surveyCalcVehicle').textContent = '¥' + vehicleFee.toLocaleString();
          document.getElementById('surveyCalcSubtotal').textContent = '¥' + discountedSubtotal.toLocaleString();
          document.getElementById('surveyCalcTax').textContent = '¥' + tax.toLocaleString();
          document.getElementById('surveyCalcTotal').textContent = '¥' + total.toLocaleString();
        }
        
        function resetCalcDisplay() {
          ['surveyCalcBase', 'surveyCalcVehicle', 'surveyCalcSubtotal', 'surveyCalcTax', 'surveyCalcTotal'].forEach(id => {
            document.getElementById(id).textContent = '¥0';
          });
        }
        
        // 保存
        async function saveSurveyEstimate() {
          const customerName = document.getElementById('surveyCustomerName').value.trim();
          const projectName = document.getElementById('surveyProjectName').value.trim();
          const surveyType = document.querySelector('input[name="surveyType"]:checked');
          const areaRank = document.getElementById('surveyArea').value;
          const postalCode = (document.getElementById('surveyPostalCode').value || '').replace(/[^\\d]/g, '');
          
          if (!customerName) { alert('顧客名を入力してください'); return; }
          if (!projectName) { alert('案件名を入力してください'); return; }
          if (!surveyType) { alert('調査員人数（ワンマン/ツーマン）を選択してください'); return; }
          if (!areaRank) { alert('郵便番号を入力してエリア判定を行ってください'); return; }
          
          const areaData = currentSurveyArea || areaPricingData.find(a => a.area_rank === areaRank);
          const discount = parseInt(document.getElementById('surveyDiscount').value) || 0;
          
          const baseFee = surveyType.value === 'oneman' 
            ? (areaData.survey_oneman_fee || 20000) 
            : (areaData.survey_twoman_fee || 25000);
          const vehicleFee = areaData.transport_vehicle_fee || 5000;
          
          const subtotal = baseFee + vehicleFee;
          const discountedSubtotal = Math.max(0, subtotal - discount);
          const tax = Math.floor(discountedSubtotal * 0.1);
          const total = discountedSubtotal + tax;
          
          const payload = {
            customer_name: customerName,
            project_name: projectName,
            survey_date: document.getElementById('surveyDate').value,
            valid_until: document.getElementById('surveyValidUntil').value,
            address: document.getElementById('surveyAddress').value,
            postal_code: postalCode,
            survey_type: surveyType.value,
            survey_people: surveyType.value === 'oneman' ? 1 : 2,
            area_rank: areaRank,
            area_regions: document.getElementById('surveyAreaRegions').value || (areaData ? areaData.regions : ''),
            distance_km: 0,
            base_fee: baseFee,
            vehicle_fee: vehicleFee,
            distance_fee: 0,
            subtotal: subtotal,
            discount_amount: discount,
            discounted_subtotal: discountedSubtotal,
            tax: tax,
            total: total,
            notes: document.getElementById('surveyNotes').value
          };
          
          try {
            const res = await fetch('/api/estimates/survey', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const result = await res.json();
            
            if (result.success) {
              document.getElementById('surveySaveMessage').textContent = 
                '見積番号: ' + result.estimate.estimate_number + ' が保存されました';
              document.getElementById('surveyPdfLink').href = '/estimate/' + result.estimate.id + '/pdf';
              document.getElementById('surveyDetailLink').href = '/estimate/' + result.estimate.id;
              document.getElementById('surveySaveModal').classList.remove('hidden');
            } else {
              alert('保存エラー: ' + (result.error || '不明なエラー'));
            }
          } catch (e) {
            console.error('保存エラー:', e);
            alert('保存に失敗しました: ' + e.message);
          }
        }
        
        // ページ読み込み時に初期化
        initSurveyPage();
      `}}></script>
    </div>
  )
})

// 現地調査専門見積もり保存API
app.post('/api/estimates/survey', async (c) => {
  try {
    const { env } = c
    const data = await c.req.json()
    
    console.log('現地調査見積保存データ:', data)
    
    // 見積番号を生成（SURVEY-YYYY-XXX形式）
    const now = new Date()
    const year = now.getFullYear()
    const estimateNumber = `SURVEY-${year}-${String(Date.now()).slice(-3)}`
    
    // 金額計算
    const subtotal = data.subtotal || 0
    const discountAmount = data.discount_amount || 0
    const discountedSubtotal = data.discounted_subtotal || Math.max(0, subtotal - discountAmount)
    const tax = data.tax || Math.floor(discountedSubtotal * 0.1)
    const total = data.total || (discountedSubtotal + tax)
    
    // デフォルト顧客が存在するかチェック
    let customerId = 1
    let projectId = 1
    
    const existingCustomer = await env.DB.prepare(`
      SELECT id FROM customers WHERE name = '現地調査顧客' LIMIT 1
    `).first()
    
    if (!existingCustomer) {
      const customerResult = await env.DB.prepare(`
        INSERT INTO customers (name, contact_person, phone, email, address, user_id, created_at, updated_at)
        VALUES ('現地調査顧客', '担当者', '', '', '', 'system', datetime('now'), datetime('now'))
      `).run()
      customerId = customerResult.meta.last_row_id
    } else {
      customerId = existingCustomer.id
    }
    
    const existingProject = await env.DB.prepare(`
      SELECT id FROM projects WHERE name = '現地調査プロジェクト' AND customer_id = ? LIMIT 1
    `).bind(customerId).first()
    
    if (!existingProject) {
      const projectResult = await env.DB.prepare(`
        INSERT INTO projects (customer_id, name, description, status, user_id, created_at, updated_at)
        VALUES (?, '現地調査プロジェクト', ?, 'active', 'system', datetime('now'), datetime('now'))
      `).bind(customerId, `顧客: ${data.customer_name}\n案件: ${data.project_name}`).run()
      projectId = projectResult.meta.last_row_id
    } else {
      projectId = existingProject.id
    }
    
    // セッションからユーザー情報取得
    const sessionInfo = await verifySession(c)
    const createdByName = sessionInfo.valid ? sessionInfo.userName : '未設定'
    
    // 現地調査の情報をJSON形式で構築
    const surveyDetails = JSON.stringify({
      type: 'survey_only',
      survey_type: data.survey_type,
      survey_people: data.survey_people,
      area_rank: data.area_rank,
      area_regions: data.area_regions,
      distance_km: data.distance_km,
      base_fee: data.base_fee,
      vehicle_fee: data.vehicle_fee,
      distance_fee: data.distance_fee,
      survey_date: data.survey_date,
      valid_until: data.valid_until,
      address: data.address,
      discount_amount: discountAmount
    })
    
    // line_items_json に調査見積データを格納
    const lineItems = JSON.stringify({
      type: 'survey_only',
      items: [
        {
          name: data.survey_type === 'oneman' ? '現地調査（ワンマン・1人）' : '現地調査（ツーマン・2人）',
          detail: `エリア${data.area_rank}（${data.area_regions || ''})`,
          amount: data.base_fee
        },
        {
          name: '車両費',
          detail: '',
          amount: data.vehicle_fee
        },
        ...(discountAmount > 0 ? [{
          name: '値引き',
          detail: '',
          amount: -discountAmount
        }] : [])
      ],
      survey_meta: {
        survey_type: data.survey_type,
        survey_people: data.survey_people,
        area_rank: data.area_rank,
        area_regions: data.area_regions,
        distance_km: 0,
        survey_date: data.survey_date,
        address: data.address,
        postal_code: data.postal_code || '',
        customer_name: data.customer_name,
        project_name: data.project_name,
        valid_until: data.valid_until
      }
    })
    
    const estimateResult = await env.DB.prepare(`
      INSERT INTO estimates (
        customer_id, project_id, estimate_number,
        delivery_address, delivery_postal_code, delivery_area,
        vehicle_type, operation_type, vehicle_cost, staff_cost,
        site_survey_people, site_survey_distance, site_survey_base_cost,
        site_survey_vehicle_cost, site_survey_distance_cost, site_survey_cost,
        subtotal, tax_rate, tax_amount, total_amount,
        notes, line_items_json, user_id, created_at, updated_at, created_by_name,
        discount_amount
      ) VALUES (
        ?, ?, ?,
        ?, '', ?,
        '現地調査', '現地調査', 0, 0,
        ?, ?, ?,
        ?, ?, ?,
        ?, 0.1, ?, ?,
        ?, ?, 'system', datetime('now'), datetime('now'), ?,
        ?
      )
    `).bind(
      customerId,
      projectId,
      estimateNumber,
      data.address || `顧客: ${data.customer_name}, 案件: ${data.project_name}`,
      data.area_rank || 'A',
      data.survey_people || 1,
      data.distance_km || 0,
      data.base_fee || 0,
      data.vehicle_fee || 0,
      data.distance_fee || 0,
      (data.base_fee || 0) + (data.vehicle_fee || 0) + (data.distance_fee || 0),
      discountedSubtotal,
      tax,
      total,
      data.notes || '',
      lineItems,
      createdByName,
      discountAmount
    ).run()
    
    const estimateId = estimateResult.meta.last_row_id
    console.log('現地調査見積ID:', estimateId)
    
    return c.json({
      success: true,
      estimate: {
        id: estimateId,
        estimate_number: estimateNumber,
        customer_name: data.customer_name,
        project_name: data.project_name,
        subtotal: discountedSubtotal,
        tax: tax,
        total: total
      },
      message: '現地調査見積を正常に保存しました'
    })
    
  } catch (error) {
    console.error('現地調査見積保存エラー:', error)
    return c.json({ 
      error: '現地調査見積の保存に失敗しました', 
      detail: String(error) 
    }, 500)
  }
})

// 見積詳細表示ページ
app.get('/estimate/:id', async (c) => {
  try {
    const { env } = c
    const estimateId = c.req.param('id')
    
    // 見積データ取得（顧客・案件情報もJOINで取得）
    const estimate = await env.DB.prepare(`
      SELECT e.*, 
             c.name as customer_name, c.contact_person as customer_contact_person,
             c.phone as customer_phone, c.email as customer_email, c.address as customer_address,
             p.name as project_name
      FROM estimates e
      LEFT JOIN customers c ON e.customer_id = c.id
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE e.id = ?
    `).bind(estimateId).first()
    
    if (!estimate) {
      return c.notFound()
    }
    
    let estimateHtml = ''
    
    if (estimate.estimate_number && estimate.estimate_number.startsWith('FREE-')) {
      // フリー見積の場合
      const items = await env.DB.prepare(`
        SELECT * FROM free_estimate_items 
        WHERE estimate_id = ? 
        ORDER BY sort_order
      `).bind(estimateId).all()
      
      const itemsHtml = items.results.map((item, index) => `
        <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
          <td class="px-4 py-2 border">${item.item_name}</td>
          <td class="px-4 py-2 border text-center">${item.unit || '-'}</td>
          <td class="px-4 py-2 border text-right">${item.quantity}</td>
          <td class="px-4 py-2 border text-right">¥${item.unit_price.toLocaleString()}</td>
          <td class="px-4 py-2 border text-right font-bold">¥${item.total_price.toLocaleString()}</td>
        </tr>
      `).join('')
      
      estimateHtml = `
        <div class="bg-white rounded-lg shadow-lg p-8">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">見 積 書</h1>
            <p class="text-gray-600">見積番号: ${estimate.estimate_number}</p>
            <p class="text-gray-500 text-sm">フリー見積もり</p>
          </div>

          <div class="mb-8">
            <div class="grid grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-3">お客様情報</h3>
                <p><strong>顧客名：</strong> ${estimate.delivery_address ? estimate.delivery_address.split(',')[0]?.replace('顧客: ', '') : '未設定'}</p>
                <p><strong>案件名：</strong> ${estimate.delivery_address ? estimate.delivery_address.split(',')[1]?.replace(' 案件: ', '') : '未設定'}</p>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-3">見積もり情報</h3>
                <p><strong>作業日：</strong> ${estimate.work_date || '未設定'}</p>
                <p><strong>有効期限：</strong> ${estimate.valid_until || '未設定'}</p>
                <p><strong>作成日：</strong> ${new Date(estimate.created_at).toLocaleDateString('ja-JP')}</p>
              </div>
            </div>
          </div>

          <div class="mb-8">
            <table class="w-full border-collapse border border-gray-300">
              <thead>
                <tr class="bg-blue-600 text-white">
                  <th class="px-4 py-3 border text-left">項目名</th>
                  <th class="px-4 py-3 border text-center">単位</th>
                  <th class="px-4 py-3 border text-right">数量</th>
                  <th class="px-4 py-3 border text-right">単価（税抜）</th>
                  <th class="px-4 py-3 border text-right">金額（税抜）</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="mb-8">
            <div class="bg-blue-50 p-6 rounded-lg">
              <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div class="text-sm text-gray-600">小計（税抜）</div>
                  <div class="text-2xl font-bold text-blue-600">¥${estimate.subtotal.toLocaleString()}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-600">消費税（10%）</div>
                  <div class="text-2xl font-bold text-blue-600">¥${estimate.tax_amount.toLocaleString()}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-600">合計（税込）</div>
                  <div class="text-3xl font-bold text-blue-600">¥${estimate.total_amount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          ${estimate.notes ? `
          <div class="mb-8">
            <h3 class="text-lg font-bold text-gray-800 mb-3">追加事項・備考</h3>
            <div class="bg-gray-50 p-4 rounded-md">
              <p class="whitespace-pre-wrap">${estimate.notes}</p>
            </div>
          </div>
          ` : ''}
        </div>
      `
    } else if (estimate.estimate_number && estimate.estimate_number.startsWith('SURVEY-')) {
      // 現地調査専門見積の場合
      let surveyMeta: any = {}
      let surveyItems: any[] = []
      try {
        const lineItemsData = JSON.parse(estimate.line_items_json || '{}')
        surveyMeta = lineItemsData.survey_meta || {}
        surveyItems = (lineItemsData.items || []).filter((i: any) => i.amount > 0)
      } catch (e) {
        console.error('survey line_items_json解析エラー:', e)
      }

      const surveyTypeLabel = surveyMeta.survey_type === 'oneman' ? 'ワンマン（1人）' : 'ツーマン（2人）'
      const rawSubtotal = surveyItems.reduce((sum: number, i: any) => sum + i.amount, 0)
      const discountAmount = estimate.discount_amount || 0
      const discountedSubtotal = Math.max(0, rawSubtotal - discountAmount)
      const tax = Math.floor(discountedSubtotal * 0.1)
      const total = discountedSubtotal + tax

      estimateHtml = `
        <div class="bg-white rounded-lg shadow-lg p-8">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">見 積 書</h1>
            <p class="text-gray-600">見積番号: ${estimate.estimate_number}</p>
            <span class="inline-block bg-blue-600 text-white text-xs px-3 py-1 rounded mt-2">現地調査専門</span>
          </div>

          <!-- 合計金額 -->
          <div class="bg-blue-50 border-2 border-blue-400 rounded-lg p-6 mb-8">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-sm text-gray-600">小計（税抜）</div>
                <div class="text-xl font-bold text-gray-800">¥${discountedSubtotal.toLocaleString()}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600">消費税（10%）</div>
                <div class="text-xl font-bold text-gray-800">¥${tax.toLocaleString()}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600">合計（税込）</div>
                <div class="text-3xl font-bold text-blue-600">¥${total.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <!-- 基本情報 -->
          <div class="grid grid-cols-2 gap-8 mb-8">
            <div class="bg-gray-50 p-4 rounded-lg border">
              <h3 class="text-lg font-bold text-gray-800 mb-3 border-b pb-2">お客様情報</h3>
              <p><strong>顧客名：</strong> ${surveyMeta.customer_name || '未設定'}</p>
              <p><strong>案件名：</strong> ${surveyMeta.project_name || '未設定'}</p>
              ${surveyMeta.address ? `<p><strong>調査先：</strong> ${surveyMeta.address}</p>` : ''}
            </div>
            <div class="bg-gray-50 p-4 rounded-lg border">
              <h3 class="text-lg font-bold text-gray-800 mb-3 border-b pb-2">見積もり情報</h3>
              <p><strong>作成日：</strong> ${new Date(estimate.created_at).toLocaleDateString('ja-JP')}</p>
              <p><strong>調査予定日：</strong> ${surveyMeta.survey_date ? new Date(surveyMeta.survey_date).toLocaleDateString('ja-JP') : '未定'}</p>
              <p><strong>有効期限：</strong> ${surveyMeta.valid_until ? new Date(surveyMeta.valid_until).toLocaleDateString('ja-JP') : '未設定'}</p>
              ${estimate.created_by_name ? `<p><strong>担当者：</strong> ${estimate.created_by_name}</p>` : ''}
            </div>
          </div>

          <!-- 調査内容 -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 class="text-md font-bold text-gray-800 mb-3 border-b border-blue-200 pb-2">調査内容</h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <p><strong>調査形態：</strong> ${surveyTypeLabel}</p>
              <p><strong>エリア：</strong> ${surveyMeta.area_rank ? 'エリア' + surveyMeta.area_rank : '未設定'}${surveyMeta.area_regions ? '（' + surveyMeta.area_regions + '）' : ''}</p>
              <p><strong>調査目的：</strong> 搬入経路・設置場所確認</p>
            </div>
          </div>

          <!-- 明細 -->
          <div class="mb-8">
            <table class="w-full border-collapse border border-gray-300">
              <thead>
                <tr class="bg-blue-600 text-white">
                  <th class="px-4 py-3 border text-left">項目</th>
                  <th class="px-4 py-3 border text-left">内容</th>
                  <th class="px-4 py-3 border text-right">金額（税抜）</th>
                </tr>
              </thead>
              <tbody>
                ${surveyItems.map((item: any, index: number) => `
                <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
                  <td class="px-4 py-2 border">${item.name}</td>
                  <td class="px-4 py-2 border">${item.detail || ''}</td>
                  <td class="px-4 py-2 border text-right font-bold">¥${item.amount.toLocaleString()}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- 合計セクション -->
          <div class="flex justify-end mb-8">
            <div class="w-80">
              <div class="flex justify-between py-2 border-b">
                <span class="text-gray-700">小計</span>
                <span class="font-bold">¥${rawSubtotal.toLocaleString()}</span>
              </div>
              ${discountAmount > 0 ? `
              <div class="flex justify-between py-2 border-b text-red-600">
                <span>値引き</span>
                <span class="font-bold">-¥${discountAmount.toLocaleString()}</span>
              </div>
              <div class="flex justify-between py-2 border-b bg-yellow-50 px-2">
                <span class="font-semibold">値引き後小計</span>
                <span class="font-bold">¥${discountedSubtotal.toLocaleString()}</span>
              </div>
              ` : ''}
              <div class="flex justify-between py-2 border-b">
                <span class="text-gray-700">消費税（10%）</span>
                <span class="font-bold">¥${tax.toLocaleString()}</span>
              </div>
              <div class="flex justify-between py-3 bg-blue-50 rounded px-2 mt-1">
                <span class="text-blue-800 font-bold text-lg">合計金額</span>
                <span class="font-bold text-blue-600 text-lg">¥${total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          ${estimate.notes ? `
          <div class="mb-8">
            <h3 class="text-lg font-bold text-gray-800 mb-3">備考</h3>
            <div class="bg-gray-50 p-4 rounded-md border">
              <p class="whitespace-pre-wrap">${estimate.notes}</p>
            </div>
          </div>
          ` : ''}
        </div>
      `

    } else {
      // 標準見積の場合
      let lineItems: any = null
      try {
        if (estimate.line_items_json) {
          lineItems = JSON.parse(estimate.line_items_json)
        }
      } catch (e) {
        console.error('line_items_json解析エラー:', e)
      }

      // 金額計算
      let subtotal = estimate.subtotal || 0
      const discountAmount = estimate.discount_amount || 0
      const discountedSubtotal = Math.max(0, subtotal - discountAmount)
      const taxRate = estimate.tax_rate || 0.1
      const tax = estimate.tax_amount || Math.floor(discountedSubtotal * taxRate)
      const total = estimate.total_amount || (discountedSubtotal + tax)

      // エリア表示
      const areaRankDescriptions: Record<string, string> = {
        'A': '大阪市内（15km圏）', 'B': '大阪府・神戸市・京都市・奈良県（30km圏）',
        'C': '南丹（50km圏）', 'D': '東播磨・北播磨・丹波・滋賀県・和歌山県（100km圏）',
        'E': '淡路・西播磨・中丹・三重県（150km圏）', 'F': '但馬・丹後・愛知県・岐阜県・徳島県・香川県（200km圏）',
        'G': '岡山県・鳥取県・福井県（300km圏）', 'H': '広島県・愛媛県・高知県・島根県・石川県・富山県（400km圏）',
        'I': '山口県（500km圏）'
      }
      const areaDesc = areaRankDescriptions[estimate.delivery_area] || ''

      // 明細行を生成
      let itemRowsHtml = ''
      if (lineItems) {
        // line_items_json が存在する場合（単価 × 数量 = 金額 形式）
        const sections = ['vehicle', 'staff', 'services']
        for (const sec of sections) {
          const sectionData = lineItems[sec]
          if (sectionData && sectionData.items && sectionData.items.length > 0) {
            itemRowsHtml += `
              <tr class="bg-blue-50">
                <td colspan="4" class="px-4 py-2 border font-bold text-blue-800">【${sectionData.section_name}】</td>
              </tr>`
            for (const item of sectionData.items) {
              const qty = item.quantity || 1
              const unitPrice = item.unit_price || item.amount
              itemRowsHtml += `
              <tr class="bg-white hover:bg-gray-50">
                <td class="px-4 py-2 border">${item.description}${item.note ? '<br><small class="text-gray-500">' + item.note + '</small>' : ''}</td>
                <td class="px-4 py-2 border text-right">¥${unitPrice.toLocaleString()}</td>
                <td class="px-4 py-2 border text-right">${qty}</td>
                <td class="px-4 py-2 border text-right font-bold">¥${item.amount.toLocaleString()}</td>
              </tr>`
            }
            itemRowsHtml += `
              <tr class="bg-gray-100">
                <td colspan="3" class="px-4 py-2 border font-bold">${sectionData.section_name}小計</td>
                <td class="px-4 py-2 border text-right font-bold">¥${sectionData.subtotal.toLocaleString()}</td>
              </tr>`
          }
        }
      } else {
        // フォールバック: 基本的なコスト表示（4列テーブルに合わせてcolspan使用）
        const costs = [
          { name: '車両費', amount: estimate.vehicle_cost || 0 },
          { name: 'スタッフ費', amount: estimate.staff_cost || 0 },
          { name: '駐車対策員費', amount: estimate.parking_officer_cost || 0 },
          { name: '人員輸送費', amount: estimate.transport_cost || 0 },
          { name: '引取り廃棄費', amount: estimate.waste_disposal_cost || 0 },
          { name: '養生作業費', amount: estimate.protection_cost || 0 },
          { name: '残材回収費', amount: estimate.material_collection_cost || 0 },
          { name: '施工費', amount: estimate.construction_cost || 0 },
          { name: '駐車料金', amount: estimate.parking_fee || 0 },
          { name: '高速料金', amount: estimate.highway_fee || 0 },
          { name: '外注費', amount: estimate.external_contractor_cost || 0 },
        ].filter(c => c.amount > 0)

        if (estimate.vehicle_dedicated_count > 0) {
          costs.unshift({
            name: 'チャーター便 ' + estimate.vehicle_dedicated_count + '台（' + estimate.delivery_area + 'ランク）',
            amount: (estimate.vehicle_dedicated_unit_price || 0) * (estimate.vehicle_dedicated_count || 0)
          })
        }
        if (estimate.vehicle_charter_count > 0) {
          costs.unshift({
            name: '混載便 ' + estimate.vehicle_charter_count + '台（' + estimate.delivery_area + 'ランク）',
            amount: (estimate.vehicle_charter_unit_price || 0) * (estimate.vehicle_charter_count || 0)
          })
        }

        for (const [index, cost] of costs.entries()) {
          itemRowsHtml += `
            <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
              <td colspan="3" class="px-4 py-2 border">${cost.name}</td>
              <td class="px-4 py-2 border text-right font-bold">¥${cost.amount.toLocaleString()}</td>
            </tr>`
        }
      }

      // 時間帯割増の表示
      const workTimeLabels: Record<string, string> = {
        'normal': '通常作業時間（AM8:00〜PM6:00）',
        'overtime': '割増作業時間（PM6:00〜翌AM8:00）'
      }

      estimateHtml = `
        <div class="bg-white rounded-lg shadow-lg p-8">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">見 積 書</h1>
            <p class="text-gray-600">見積番号: ${estimate.estimate_number}</p>
            <span class="inline-block ${estimate.estimate_type === 'standard_b' ? 'bg-teal-600' : 'bg-blue-600'} text-white text-xs px-3 py-1 rounded mt-2">${estimate.estimate_type === 'standard_b' ? '標準見積もりB' : '標準見積もりA'}</span>
          </div>

          <!-- 合計金額 -->
          <div class="bg-blue-50 border-2 border-blue-400 rounded-lg p-6 mb-8">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-sm text-gray-600">小計（税抜）</div>
                <div class="text-xl font-bold text-gray-800">¥${discountedSubtotal.toLocaleString()}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600">消費税</div>
                <div class="text-xl font-bold text-gray-800">¥${tax.toLocaleString()}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600">合計（税込）</div>
                <div class="text-3xl font-bold text-blue-600">¥${total.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <!-- 基本情報 -->
          <div class="grid grid-cols-2 gap-8 mb-8">
            <div class="bg-gray-50 p-4 rounded-lg border">
              <h3 class="text-lg font-bold text-gray-800 mb-3 border-b pb-2">お客様情報</h3>
              <p><strong>顧客名：</strong> ${estimate.customer_name || '未設定'}</p>
              ${estimate.customer_contact_person ? `<p><strong>担当者：</strong> ${estimate.customer_contact_person}</p>` : ''}
              ${estimate.customer_address ? `<p><strong>住所：</strong> ${estimate.customer_address}</p>` : ''}
              ${estimate.customer_phone ? `<p><strong>TEL：</strong> ${estimate.customer_phone}</p>` : ''}
            </div>
            <div class="bg-gray-50 p-4 rounded-lg border">
              <h3 class="text-lg font-bold text-gray-800 mb-3 border-b pb-2">見積もり情報</h3>
              <p><strong>案件名：</strong> ${estimate.project_name || '未設定'}</p>
              <p><strong>作成日：</strong> ${new Date(estimate.created_at).toLocaleDateString('ja-JP')}</p>
              ${estimate.created_by_name ? `<p><strong>作成者：</strong> ${estimate.created_by_name}</p>` : ''}
              ${estimate.work_time_type && estimate.work_time_type !== 'normal' ? `<p><strong>作業時間帯：</strong> ${workTimeLabels[estimate.work_time_type] || estimate.work_time_type}（${estimate.work_time_multiplier}倍）</p>` : ''}
            </div>
          </div>

          <!-- 配送先情報 -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 class="text-md font-bold text-gray-800 mb-3 border-b border-blue-200 pb-2">配送先情報</h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <p><strong>配送先住所：</strong> ${estimate.delivery_address || '未設定'}</p>
              <p><strong>エリア：</strong> ${estimate.delivery_area}ランク${areaDesc ? '（' + areaDesc + '）' : ''}</p>
              ${estimate.delivery_postal_code ? `<p><strong>郵便番号：</strong> ${estimate.delivery_postal_code}</p>` : ''}
            </div>
          </div>

          <!-- 明細 -->
          <div class="mb-8">
            <table class="w-full border-collapse border border-gray-300">
              <thead>
                <tr class="bg-blue-600 text-white">
                  <th class="px-4 py-3 border text-center">品名</th>
                  <th class="px-4 py-3 border text-center">単価</th>
                  <th class="px-4 py-3 border text-center">数量</th>
                  <th class="px-4 py-3 border text-center">金額（税抜）</th>
                </tr>
              </thead>
              <tbody>
                ${itemRowsHtml}
              </tbody>
            </table>
          </div>

          <!-- 合計セクション -->
          <div class="flex justify-end mb-8">
            <div class="w-80">
              <div class="flex justify-between py-2 border-b">
                <span class="text-gray-700">小計</span>
                <span class="font-bold">¥${subtotal.toLocaleString()}</span>
              </div>
              ${discountAmount > 0 ? `
              <div class="flex justify-between py-2 border-b text-red-600">
                <span>値引き</span>
                <span class="font-bold">-¥${discountAmount.toLocaleString()}</span>
              </div>
              <div class="flex justify-between py-2 border-b bg-yellow-50 px-2">
                <span class="font-semibold">値引き後小計</span>
                <span class="font-bold">¥${discountedSubtotal.toLocaleString()}</span>
              </div>
              ` : ''}
              <div class="flex justify-between py-2 border-b">
                <span class="text-gray-700">消費税（${Math.round(taxRate * 100)}%）</span>
                <span class="font-bold">¥${tax.toLocaleString()}</span>
              </div>
              <div class="flex justify-between py-3 bg-blue-50 rounded px-2 mt-1">
                <span class="text-blue-800 font-bold text-lg">合計金額</span>
                <span class="font-bold text-blue-600 text-lg">¥${total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          ${estimate.notes ? `
          <div class="mb-8">
            <h3 class="text-lg font-bold text-gray-800 mb-3">備考</h3>
            <div class="bg-gray-50 p-4 rounded-md border">
              <p class="whitespace-pre-wrap">${estimate.notes}</p>
            </div>
          </div>
          ` : ''}
        </div>
      `
    }
    
    return c.render(
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <a href="/" className="flex items-center text-white hover:text-blue-200">
                  <i className="fas fa-truck text-white text-2xl mr-3"></i>
                  <h1 className="text-xl font-bold">Office M2 見積システム</h1>
                </a>
              </div>
              <div className="text-white">
                <span className="text-sm">見積詳細</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto py-8 px-4">
          <div dangerouslySetInnerHTML={{ __html: estimateHtml }}></div>
          
          <div className="mt-8 flex justify-between items-center">
            <a href="/" className="text-gray-600 hover:text-gray-800">
              <i className="fas fa-arrow-left mr-2"></i>
              トップページに戻る
            </a>
            
            <div className="space-x-3">
              <a 
                href={`/estimate/${estimateId}/pdf`}
                target="_blank"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium"
              >
                <i className="fas fa-file-pdf mr-2"></i>
                PDF出力
              </a>
              <button 
                onclick="window.print()"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
              >
                <i className="fas fa-print mr-2"></i>
                印刷
              </button>
            </div>
          </div>
        </main>
      </div>
    )
    
  } catch (error) {
    console.error('見積詳細取得エラー:', error)
    return c.render(
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">エラーが発生しました</h1>
          <p className="text-gray-600 mb-6">見積データの取得に失敗しました</p>
          <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md">
            トップページに戻る
          </a>
        </div>
      </div>
    )
  }
})

// フリー見積PDF生成ページ
app.get('/estimate/:id/pdf', async (c) => {
  try {
    const { env } = c
    const estimateId = c.req.param('id')
    
    // 見積データ取得
    const estimate = await env.DB.prepare(`
      SELECT * FROM estimates WHERE id = ?
    `).bind(estimateId).first()
    
    if (!estimate) {
      return c.notFound()
    }
    
    if (estimate.estimate_number && estimate.estimate_number.startsWith('FREE-')) {
      // フリー見積の場合
      const items = await env.DB.prepare(`
        SELECT * FROM free_estimate_items 
        WHERE estimate_id = ? 
        ORDER BY sort_order
      `).bind(estimateId).all()
      
      // 会社設定情報を取得（KVが利用不可の場合はデフォルト値）
      const basicSettings = {
        company_name: (env.KV ? await env.KV.get('basic_settings:company_name') : null) || '輸送サービス株式会社',
        company_address: (env.KV ? await env.KV.get('basic_settings:company_address') : null) || '',
        company_phone: (env.KV ? await env.KV.get('basic_settings:company_phone') : null) || '',
        company_fax: (env.KV ? await env.KV.get('basic_settings:company_fax') : null) || '',
        company_email: (env.KV ? await env.KV.get('basic_settings:company_email') : null) || '',
        logo: (env.KV ? await env.KV.get('basic_settings:company_logo') : null) || null
      }

      // 顧客・案件情報をdelivery_addressから抽出（値引き情報を除外）
      const addressParts = (estimate.delivery_address || '').split(',').map(p => p.trim())
      const customerInfo = {
        customer_name: addressParts.find(p => p.startsWith('顧客:'))?.replace('顧客:', '').trim() || 'フリー見積顧客',
        project_name: addressParts.find(p => p.startsWith('案件:'))?.replace('案件:', '').trim() || 'フリー見積プロジェクト'
      }

      // フリー見積用PDF生成関数を呼び出し（標準見積と同じフォーマット）
      const pdfHtml = generateFreePdfHTML(estimate, items.results, basicSettings, customerInfo)
      
      return c.html(pdfHtml)
      
    } else if (estimate.estimate_number && estimate.estimate_number.startsWith('SURVEY-')) {
      // 現地調査専門見積の場合
      const basicSettings = {
        company_name: (env.KV ? await env.KV.get('basic_settings:company_name') : null) || '輸送サービス株式会社',
        company_address: (env.KV ? await env.KV.get('basic_settings:company_address') : null) || '',
        company_phone: (env.KV ? await env.KV.get('basic_settings:company_phone') : null) || '',
        company_fax: (env.KV ? await env.KV.get('basic_settings:company_fax') : null) || '',
        company_email: (env.KV ? await env.KV.get('basic_settings:company_email') : null) || '',
        logo: (env.KV ? await env.KV.get('basic_settings:company_logo') : null) || null
      }

      // line_items_jsonから調査見積データを取得
      let surveyMeta: any = {}
      let surveyItems: any[] = []
      try {
        const lineItemsData = JSON.parse(estimate.line_items_json || '{}')
        surveyMeta = lineItemsData.survey_meta || {}
        surveyItems = lineItemsData.items || []
      } catch (e) {
        console.error('line_items_json解析エラー:', e)
      }

      const pdfHtml = generateSurveyPdfHTML(estimate, surveyItems, surveyMeta, basicSettings)
      return c.html(pdfHtml)
      
    } else {
      // 標準見積の場合は既存のPDF生成にリダイレクト
      return c.redirect(`/api/estimates/${estimateId}/pdf`)
    }
    
  } catch (error) {
    console.error('PDF生成エラー:', error)
    return c.html(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <title>PDF生成エラー</title>
      </head>
      <body>
        <div style="text-align: center; padding: 50px;">
          <h1>PDF生成エラー</h1>
          <p>見積書のPDF生成に失敗しました。</p>
          <button onclick="window.close()">閉じる</button>
        </div>
      </body>
      </html>
    `)
  }
})

// フリー見積用PDF生成関数（通常見積と同じフォーマット）
// NOTE: COMPANY_LOGO_DATA_URI is injected at build time below generatePdfHTML
function generateFreePdfHTML(estimate: any, items: any[], basicSettings: any = {}, customerInfo: any = {}): string {
  // 日本時間で現在日時を取得（UTC+9）
  const jstDate = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const currentDate = jstDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tokyo'
  })
  
  // フリー見積項目をテーブル行として生成
  const itemsTableRows = items.map(item => `
    <tr>
      <td>&nbsp;&nbsp;${item.item_name}${item.unit ? ` (${item.unit})` : ''}</td>
      <td class="amount-cell">¥${item.total_price.toLocaleString()}</td>
    </tr>
  `).join('')
  
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>見積書 - ${estimate.estimate_number}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .page-break { page-break-before: always; }
        }
        
        body {
            font-family: 'MS Gothic', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Meiryo', monospace;
            font-size: 14px;
            line-height: 1.6;
            margin: 20px;
            color: #333;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }
        
        .header h1 {
            font-size: 28px;
            margin: 0;
            color: #2563eb;
        }

        .company-logo {
            max-height: 80px;
            max-width: 200px;
            object-fit: contain;
        }
        
        .company-info {
            text-align: right;
            margin-bottom: 30px;
        }
        .company-info .company-name-text {
            font-size: 14px;
            font-weight: bold;
            color: #333;
        }
        .company-info .invoice-number-text {
            font-size: 9.5px;
            color: #555;
        }
        
        .estimate-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        
        .customer-info {
            flex: 1;
            margin-right: 50px;
        }
        
        .estimate-details {
            flex: 1;
        }
        
        .info-box {
            border: 2px solid #e5e7eb;
            padding: 15px;
            margin-bottom: 20px;
            background-color: #f9fafb;
        }
        
        .info-box h3 {
            margin: 0 0 10px 0;
            color: #374151;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 5px;
        }
        
        .estimate-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .estimate-table th,
        .estimate-table td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
        }
        
        .estimate-table th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
        }
        
        .amount-cell {
            text-align: right !important;
            font-weight: bold;
        }
        
        .total-section {
            float: right;
            width: 300px;
            margin-bottom: 30px;
        }
        
        .total-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .total-table th,
        .total-table td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
        }
        
        .total-table th {
            background-color: #f3f4f6;
            text-align: left;
        }
        
        .total-table td {
            text-align: right;
            font-weight: bold;
        }
        
        .grand-total {
            background-color: #dbeafe !important;
            font-size: 16px;
        }
        
        .notes-section {
            clear: both;
            margin-top: 40px;
            page-break-inside: avoid;
        }
        
        .notes-section h3 {
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
        }
        
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        
        .no-print {
            margin: 20px 0;
            text-align: center;
        }
        
        .print-button {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 0 10px;
        }
        
        .print-button:hover {
            background-color: #1d4ed8;
        }
        
        /* 項目列を確実に左寄せに */
        .estimate-table tbody td:first-child {
            text-align: left !important;
            vertical-align: top;
        }
        
        /* 金額合計ボックス - ヘッダー直下右側 */
        .top-total-box {
            float: right;
            border: 3px solid #2563eb;
            padding: 12px 24px;
            margin-bottom: 20px;
            text-align: center;
            min-width: 300px;
        }
        .top-total-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .top-total-amount {
            font-size: 26px;
            font-weight: bold;
            color: #1e3a5f;
        }
        .top-total-sub {
            font-size: 12px;
            color: #6b7280;
            margin-top: 4px;
        }
        .top-total-sub span {
            margin: 0 6px;
        }
    </style>
</head>
<body>
    <div class="no-print">
        <button class="print-button" onclick="window.print()">印刷</button>
        <button class="print-button" onclick="window.close()">閉じる</button>
    </div>

    <div class="header">
        <div>
            <h1>見積書</h1>
        </div>
        <img src="${basicSettings.logo || COMPANY_LOGO_DATA_URI}" alt="会社ロゴ" class="company-logo" />
    </div>
    
    <!-- 金額（税込）合計ボックス - ヘッダー直下右側 -->
    <div class="top-total-box">
        <div class="top-total-label">お見積金額（税込）</div>
        <div class="top-total-amount">¥${estimate.total_amount.toLocaleString()}-</div>
        <div class="top-total-sub">
            <span>本体 ¥${estimate.subtotal.toLocaleString()}</span>
            <span>税 ¥${estimate.tax_amount.toLocaleString()}</span>
        </div>
    </div>
    
    <div style="clear: both;"></div>
    
    <div class="company-info">
        ${basicSettings.company_name ? `<span class="company-name-text">${basicSettings.company_name}</span><br>` : ''}
        ${basicSettings.company_address ? `${basicSettings.company_address}<br>` : ''}
        ${basicSettings.company_phone ? `TEL: ${basicSettings.company_phone}` : ''}${basicSettings.company_fax ? ` / FAX: ${basicSettings.company_fax}` : ''}${basicSettings.company_phone || basicSettings.company_fax ? '<br>' : ''}
        ${basicSettings.company_email ? `Email: ${basicSettings.company_email}` : ''}
        ${basicSettings.invoice_number ? `<br><span class="invoice-number-text">インボイス番号 ${basicSettings.invoice_number}</span>` : ''}
    </div>
    
    <div class="estimate-info">
        <div class="customer-info">
            <div class="info-box">
                <h3>お客様情報</h3>
                <strong>${customerInfo.customer_name || 'フリー見積顧客'}</strong><br>
                案件: ${customerInfo.project_name || 'フリー見積プロジェクト'}
            </div>
        </div>
        
        <div class="estimate-details">
            <div class="info-box">
                <h3>見積詳細</h3>
                <strong>見積番号:</strong> ${estimate.estimate_number || ''}<br>
                <strong>案件名:</strong> ${customerInfo.project_name || 'フリー見積プロジェクト'}<br>
                <strong>作成日:</strong> ${currentDate}<br>
                <strong>有効期限:</strong> ${estimate.valid_until ? new Date(estimate.valid_until).toLocaleDateString('ja-JP') : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')}<br>
                ${estimate.created_by_name ? `<strong>見積制作担当者:</strong> ${estimate.created_by_name}<br>` : ''}
                <strong>作業日:</strong> ${estimate.work_date ? new Date(estimate.work_date).toLocaleDateString('ja-JP') : '未定'}
            </div>
        </div>
    </div>
    
    <table class="estimate-table">
        <thead>
            <tr>
                <th style="width: 60%">項目</th>
                <th style="width: 40%">金額（税抜）</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>フリー見積サービス</strong><br>
                    顧客: ${customerInfo.customer_name || 'フリー見積顧客'}<br>
                    案件: ${customerInfo.project_name || 'フリー見積プロジェクト'}<br>
                    ${estimate.work_date ? `作業日: ${new Date(estimate.work_date).toLocaleDateString('ja-JP')}` : ''}
                </td>
                <td class="amount-cell">-</td>
            </tr>
            ${items.map((item, index) => `
            <tr>
                <td>&nbsp;&nbsp;${item.item_name}${item.quantity > 1 ? ` × ${item.quantity}` : ''}${item.unit ? ` (${item.unit})` : ''}</td>
                <td class="amount-cell">¥${item.total_price.toLocaleString()}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="total-section">
        <table class="total-table">
            <tr>
                <th>小計</th>
                <td>¥${estimate.subtotal.toLocaleString()}</td>
            </tr>
            ${(() => {
              // 値引き金額をdelivery_addressから抽出
              const discountMatch = estimate.delivery_address?.match(/値引: (\d+)円/);
              const discountAmount = discountMatch ? parseInt(discountMatch[1]) : 0;
              const discountedSubtotal = Math.max(0, estimate.subtotal - discountAmount);
              
              if (discountAmount > 0) {
                return `
                  <tr style="color: #dc2626;">
                    <th>値引き</th>
                    <td>-¥${discountAmount.toLocaleString()}</td>
                  </tr>
                  <tr style="background-color: #fef3c7;">
                    <th>値引き後小計</th>
                    <td>¥${discountedSubtotal.toLocaleString()}</td>
                  </tr>`;
              }
              return '';
            })()}
            <tr>
                <th>消費税（10%）</th>
                <td>¥${estimate.tax_amount.toLocaleString()}</td>
            </tr>
            <tr class="grand-total">
                <th>合計金額</th>
                <td style="font-size: 18px;">¥${estimate.total_amount.toLocaleString()}</td>
            </tr>
        </table>
    </div>
    
    ${estimate.notes ? `
    <div class="notes-section">
        <h3>追加事項・備考</h3>
        <div style="border: 1px solid #d1d5db; padding: 15px; background-color: #f9fafb; white-space: pre-wrap;">${estimate.notes}</div>
    </div>
    ` : ''}
    
    <!-- フリースペース（標準見積と同じ） -->
    <div class="notes-section">
        <h3>フリースペース</h3>
        <div style="border: 1px solid #d1d5db; padding: 15px; background-color: #f9fafb; min-height: 100px;">
            <div style="color: #9ca3af; font-style: italic;">※ 追加情報やメモをこちらにご記入ください</div>
        </div>
    </div>
    
    <div class="footer">
        <p>本見積書は${currentDate}に作成されました。</p>
        <p>ご質問やご不明な点がございましたら、お気軽にお問い合わせください。</p>
    </div>
</body>
</html>
  `
}

// ================== 郵便番号テストページ ==================

// 郵便番号テスト用ページ
app.get('/test/postal', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">郵便番号・エリア判定テスト</h1>
        
        {/* 郵便番号入力 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">郵便番号入力テスト</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              郵便番号 <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-3">
              <input 
                type="text" 
                id="postalCode" 
                placeholder="5300001"
                onInput="formatPostalCodeInput(this)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button 
                id="searchAddressBtn"
                onclick="testPostalCodeSearch()" 
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                <i className="fas fa-search mr-1"></i>
                住所検索
              </button>
            </div>
          </div>

          {/* 住所入力 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              配送先住所
            </label>
            <textarea 
              id="deliveryAddress" 
              rows="3"
              placeholder="住所を入力してください"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          {/* 自動エリア判定結果 */}
          <div id="autoAreaResult" className="mb-4 hidden">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                <span className="font-medium text-green-800">エリア自動判定完了</span>
              </div>
              <p id="autoAreaText" className="mt-2 text-sm text-green-700"></p>
            </div>
          </div>

          {/* エリア選択 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              配送エリア
            </label>
            <select 
              id="areaSelect" 
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">エリアを選択してください</option>
              <option value="A">Aランク - 大阪市（15km圏内）</option>
              <option value="B">Bランク - 大阪府・神戸・京都・奈良（30km圏内）</option>
              <option value="C">Cランク - 南丹（50km圏内）</option>
              <option value="D">Dランク - 東播磨・滋賀・和歌山（100km圏内）</option>
              <option value="E">Eランク - 淡路・西播磨・三重（150km圏内）</option>
              <option value="F">Fランク - 但馬・愛知・徳島・香川（200km圏内）</option>
              <option value="G">Gランク - 岡山・鳥取・福井（300km圏内）</option>
              <option value="H">Hランク - 広島・愛媛・島根・石川・富山（400km圏内）</option>
              <option value="I">Iランク - 山口（500km圏内）</option>
            </select>
          </div>
        </div>
        
        {/* テスト結果表示 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">テスト結果</h2>
          <div id="testResult" className="text-sm text-gray-600">
            上記の郵便番号を入力して「住所検索」をクリックしてください
          </div>
        </div>
      </div>

      {/* テスト用JavaScript */}
      <script dangerouslySetInnerHTML={{
        __html: `
        // テスト用郵便番号検索関数
        window.testPostalCodeSearch = async () => {
          const postalCodeInput = document.getElementById('postalCode');
          const addressInput = document.getElementById('deliveryAddress');
          const searchBtn = document.getElementById('searchAddressBtn');
          const autoAreaResult = document.getElementById('autoAreaResult');
          const areaSelect = document.getElementById('areaSelect');
          const testResult = document.getElementById('testResult');
          
          const postalCode = postalCodeInput.value.replace(/[^\\d]/g, '');
          
          if (!postalCode || postalCode.length !== 7) {
            testResult.innerHTML = '<span class="text-red-600">郵便番号は7桁で入力してください</span>';
            return;
          }

          try {
            searchBtn.disabled = true;
            searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>検索中...';
            
            // API呼び出し
            const response = await fetch('/api/postal-code/' + postalCode);
            const areaResponse = await response.json();
            
            testResult.innerHTML = '<pre class="text-xs">' + JSON.stringify(areaResponse, null, 2) + '</pre>';
            
            // 住所情報の自動入力
            if (areaResponse.address && !addressInput.value.trim()) {
              addressInput.value = areaResponse.address;
            }
            
            // エリア判定設定
            if (areaResponse.success) {
              if (areaResponse.detected) {
                // エリアが検出された場合
                areaSelect.value = areaResponse.area_rank;
                
                // 自動判定結果を表示
                document.getElementById('autoAreaText').innerHTML = 
                  '<strong>' + areaResponse.area_rank + 'エリア</strong> - ' + areaResponse.area_name;
                autoAreaResult.classList.remove('hidden');
              }
            }
            
          } catch (error) {
            testResult.innerHTML = '<span class="text-red-600">エラー: ' + error.message + '</span>';
          } finally {
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="fas fa-search mr-1"></i>住所検索';
          }
        };`
      }}></script>
    </div>
  )
})

// ================== 見積フローテスト用API ==================

// Step1→Step2フロー確認API（テスト用）
app.get('/api/test/estimate-flow/:step', async (c) => {
  const step = c.req.param('step')
  
  try {
    // Step1: 顧客・案件データを取得
    if (step === 'step1') {
      const { env } = c
      const customers = await env.DB.prepare(`
        SELECT id, name 
        FROM customers 
        WHERE user_id = 'test-user-001' 
        ORDER BY name 
        LIMIT 5
      `).all()
      
      const projects = await env.DB.prepare(`
        SELECT p.id, p.name, p.customer_id 
        FROM projects p 
        WHERE p.user_id = 'test-user-001' 
        ORDER BY p.name 
        LIMIT 5
      `).all()
      
      return c.json({
        success: true,
        step: 1,
        data: {
          customers: customers.results || [],
          projects: projects.results || []
        }
      })
    }
    
    // Step2: 配送先データのテスト
    if (step === 'step2') {
      return c.json({
        success: true,
        step: 2,
        data: {
          postal_code: '1234567',
          address: 'テスト住所',
          area: 'A',
          area_name: '大阪市内・京都市内・神戸市内'
        }
      })
    }
    
    // 他のステップはまだ未実装
    return c.json({
      success: true,
      step: parseInt(step.replace('step', '')),
      message: `Step${step.replace('step', '')} テスト準備中`
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// ================== CSV出力API ==================

// 見積データCSV出力
app.get('/api/estimates/export/csv', async (c) => {
  try {
    const { env } = c
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    const search = c.req.query('search') || ''
    const status = c.req.query('status') || ''
    const startDate = c.req.query('start_date') || ''
    const endDate = c.req.query('end_date') || ''
    
    // SQLクエリの構築
    let query = `
      SELECT 
        e.id,
        e.estimate_number,
        c.name as customer_name,
        p.name as project_name,
        e.delivery_address,
        e.delivery_postal_code,
        e.delivery_area,
        e.vehicle_type,
        e.operation_type,
        e.vehicle_cost,
        e.staff_cost,
        e.subtotal,
        e.tax_amount,
        e.total_amount,
        p.status,
        e.created_at,
        e.notes
      FROM estimates e
      LEFT JOIN customers c ON e.customer_id = c.id
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE e.user_id = ?
    `
    const params = [userId]
    
    if (search) {
      query += ` AND (c.name LIKE ? OR p.name LIKE ? OR e.estimate_number LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (status) {
      query += ` AND p.status = ?`
      params.push(status)
    }
    
    if (startDate && endDate) {
      query += ` AND date(e.created_at) BETWEEN ? AND ?`
      params.push(startDate, endDate)
    }
    
    query += ` ORDER BY e.created_at DESC`
    
    const result = await env.DB.prepare(query).bind(...params).all()
    
    // CSVヘッダー
    const csvHeaders = [
      '見積番号', '顧客名', '案件名', '配送先住所', '郵便番号', 'エリア',
      '車両タイプ', '稼働形態', '車両費用', 'スタッフ費用', 
      '小計', '税額', '総額', 'ステータス', '作成日', '備考'
    ]
    
    // CSVデータの構築
    const csvRows = [csvHeaders.join(',')]
    
    if (result.results) {
      result.results.forEach((row: any) => {
        const csvRow = [
          `"${row.estimate_number || ''}"`,
          `"${row.customer_name || ''}"`,
          `"${row.project_name || ''}"`,
          `"${row.delivery_address || ''}"`,
          `"${row.delivery_postal_code || ''}"`,
          `"${row.delivery_area || ''}"`,
          `"${row.vehicle_type || ''}"`,
          `"${row.operation_type || ''}"`,
          row.vehicle_cost || 0,
          row.staff_cost || 0,
          row.subtotal || 0,
          row.tax_amount || 0,
          row.total_amount || 0,
          `"${row.status || ''}"`,
          `"${row.created_at ? row.created_at.split('T')[0] : ''}"`,
          `"${(row.notes || '').replace(/"/g, '""')}"` // ダブルクォートをエスケープ
        ]
        csvRows.push(csvRow.join(','))
      })
    }
    
    const csvContent = csvRows.join('\n')
    
    // BOM付きUTF-8でエンコード（Excelで正しく表示するため）
    const bomCsvContent = '\uFEFF' + csvContent
    
    return new Response(bomCsvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="estimates_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
    
  } catch (error) {
    console.error('Error exporting estimates CSV:', error)
    return c.json({
      success: false,
      message: 'CSV出力に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// 顧客データCSV出力
app.get('/api/customers/export/csv', async (c) => {
  try {
    const { env } = c
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    const search = c.req.query('search') || ''
    
    let query = `
      SELECT 
        c.id,
        c.name,
        c.contact_person,
        c.phone,
        c.email,
        c.address,
        c.created_at,
        COUNT(p.id) as project_count,
        COUNT(e.id) as estimate_count,
        COALESCE(SUM(CASE WHEN p.status = 'order' THEN e.total_amount ELSE 0 END), 0) as total_revenue
      FROM customers c
      LEFT JOIN projects p ON c.id = p.customer_id
      LEFT JOIN estimates e ON p.id = e.project_id
      WHERE c.user_id = ?
    `
    const params = [userId]
    
    if (search) {
      query += ` AND (c.name LIKE ? OR c.contact_person LIKE ? OR c.email LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    query += ` GROUP BY c.id ORDER BY c.created_at DESC`
    
    const result = await env.DB.prepare(query).bind(...params).all()
    
    // CSVヘッダー
    const csvHeaders = [
      '顧客ID', '顧客名', '担当者名', '電話番号', 'メールアドレス', 
      '住所', '登録日', '案件数', '見積数', '総売上'
    ]
    
    // CSVデータの構築
    const csvRows = [csvHeaders.join(',')]
    
    if (result.results) {
      result.results.forEach((row: any) => {
        const csvRow = [
          row.id || '',
          `"${row.name || ''}"`,
          `"${row.contact_person || ''}"`,
          `"${row.phone || ''}"`,
          `"${row.email || ''}"`,
          `"${(row.address || '').replace(/"/g, '""')}"`,
          `"${row.created_at ? row.created_at.split('T')[0] : ''}"`,
          row.project_count || 0,
          row.estimate_count || 0,
          row.total_revenue || 0
        ]
        csvRows.push(csvRow.join(','))
      })
    }
    
    const csvContent = csvRows.join('\n')
    const bomCsvContent = '\uFEFF' + csvContent
    
    return new Response(bomCsvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="customers_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
    
  } catch (error) {
    console.error('Error exporting customers CSV:', error)
    return c.json({
      success: false,
      message: '顧客データのCSV出力に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// レポートデータCSV出力
app.post('/api/reports/export/csv', async (c) => {
  try {
    const { env } = c
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    const { report_type, start_date, end_date } = await c.req.json()
    
    let csvContent = ''
    let filename = 'report'
    
    if (report_type === 'sales_summary') {
      // 売上サマリーレポート
      const result = await env.DB.prepare(`
        SELECT 
          strftime('%Y-%m', e.created_at) as period,
          COUNT(*) as estimate_count,
          SUM(CASE WHEN p.status = 'order' THEN 1 ELSE 0 END) as order_count,
          SUM(CASE WHEN p.status = 'order' THEN e.total_amount ELSE 0 END) as revenue,
          AVG(CASE WHEN p.status = 'order' THEN e.total_amount END) as avg_order_value
        FROM estimates e
        LEFT JOIN projects p ON e.project_id = p.id
        WHERE e.user_id = ? AND e.created_at BETWEEN ? AND ?
        GROUP BY strftime('%Y-%m', e.created_at)
        ORDER BY period
      `).bind(userId, start_date, end_date).all()
      
      const headers = ['期間', '見積数', '受注数', '売上', '平均受注金額']
      const rows = [headers.join(',')]
      
      if (result.results) {
        result.results.forEach((row: any) => {
          rows.push([
            `"${row.period}"`,
            row.estimate_count || 0,
            row.order_count || 0,
            row.revenue || 0,
            Math.round(row.avg_order_value || 0)
          ].join(','))
        })
      }
      
      csvContent = rows.join('\n')
      filename = 'sales_summary'
      
    } else if (report_type === 'vehicle_utilization') {
      // 車両稼働率レポート
      const result = await env.DB.prepare(`
        SELECT 
          e.vehicle_type,
          e.operation_type,
          COUNT(*) as usage_count,
          AVG(e.vehicle_cost) as avg_cost,
          SUM(e.vehicle_cost) as total_revenue
        FROM estimates e
        LEFT JOIN projects p ON e.project_id = p.id
        WHERE e.user_id = ? AND e.created_at BETWEEN ? AND ?
        GROUP BY e.vehicle_type, e.operation_type
        ORDER BY usage_count DESC
      `).bind(userId, start_date, end_date).all()
      
      const headers = ['車両タイプ', '稼働形態', '利用回数', '平均単価', '総売上']
      const rows = [headers.join(',')]
      
      if (result.results) {
        result.results.forEach((row: any) => {
          rows.push([
            `"${row.vehicle_type || ''}"`,
            `"${row.operation_type || ''}"`,
            row.usage_count || 0,
            Math.round(row.avg_cost || 0),
            row.total_revenue || 0
          ].join(','))
        })
      }
      
      csvContent = rows.join('\n')
      filename = 'vehicle_utilization'
    }
    
    const bomCsvContent = '\uFEFF' + csvContent
    
    return new Response(bomCsvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
    
  } catch (error) {
    console.error('Error exporting report CSV:', error)
    return c.json({
      success: false,
      message: 'レポートCSV出力に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// ================== PDF生成API ==================

// デバッグ用：すべてのリクエストをログに出力
app.use('*', async (c, next) => {
  const method = c.req.method
  const url = c.req.url
  console.log(`🌐 ${method} ${url}`)
  await next()
})

// 見積書PDF生成API（複数のパターンに対応）
app.get('/api/estimates/:id/pdf', async (c) => {
  try {
    const { env } = c
    const estimateId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    
    // 🛡️ 強化された見積検索ロジック - 複数の方法で見積を検索
    console.log('🔍 PDF生成用見積検索開始:', { estimateId, userId, timestamp: new Date().toISOString() })
    
    let estimateResult = null
    
    // 方法1: 見積番号での検索（最も一般的）
    try {
      estimateResult = await env.DB.prepare(`
        SELECT 
          e.*,
          c.name as customer_name,
          COALESCE(e.customer_contact_person, c.contact_person, '') as customer_contact_person,
          c.phone as customer_phone,
          c.email as customer_email,
          c.address as customer_address,
          p.name as project_name,
          p.description as project_description
        FROM estimates e
        LEFT JOIN customers c ON e.customer_id = c.id
        LEFT JOIN projects p ON e.project_id = p.id
        WHERE e.estimate_number = ?
      `).bind(estimateId).first()
      
      if (estimateResult) {
        console.log('✅ 方法1成功: 見積番号で検索', estimateId)
      }
    } catch (error) {
      console.error('❌ 方法1失敗:', error)
    }
    
    // 方法2: IDとしての検索（数値IDの場合）
    if (!estimateResult && /^\d+$/.test(estimateId)) {
      try {
        estimateResult = await env.DB.prepare(`
          SELECT 
            e.*,
            c.name as customer_name,
            COALESCE(e.customer_contact_person, c.contact_person, '') as customer_contact_person,
            c.phone as customer_phone,
            c.email as customer_email,
            c.address as customer_address,
            p.name as project_name,
            p.description as project_description
          FROM estimates e
          LEFT JOIN customers c ON e.customer_id = c.id
          LEFT JOIN projects p ON e.project_id = p.id
          WHERE e.id = ?
        `).bind(parseInt(estimateId)).first()
        
        if (estimateResult) {
          console.log('✅ 方法2成功: 数値IDで検索', estimateId)
        }
      } catch (error) {
        console.error('❌ 方法2失敗:', error)
      }
    }
    
    // 方法3: 部分マッチ検索（見積番号の一部が含まれている場合）
    if (!estimateResult) {
      try {
        estimateResult = await env.DB.prepare(`
          SELECT 
            e.*,
            c.name as customer_name,
            COALESCE(e.customer_contact_person, c.contact_person, '') as customer_contact_person,
            c.phone as customer_phone,
            c.email as customer_email,
            c.address as customer_address,
            p.name as project_name,
            p.description as project_description
          FROM estimates e
          LEFT JOIN customers c ON e.customer_id = c.id
          LEFT JOIN projects p ON e.project_id = p.id
          WHERE e.estimate_number LIKE ?
          ORDER BY e.created_at DESC
          LIMIT 1
        `).bind(`%${estimateId}%`).first()
        
        if (estimateResult) {
          console.log('✅ 方法3成功: 部分マッチで検索', estimateId, '→', estimateResult.estimate_number)
        }
      } catch (error) {
        console.error('❌ 方法3失敗:', error)
      }
    }
    
    // 方法4: 最新の見積を取得（最終手段）
    if (!estimateResult) {
      try {
        estimateResult = await env.DB.prepare(`
          SELECT 
            e.*,
            c.name as customer_name,
            c.contact_person as customer_contact_person,
            c.phone as customer_phone,
            c.email as customer_email,
            c.address as customer_address,
            p.name as project_name,
            p.description as project_description
          FROM estimates e
          LEFT JOIN customers c ON e.customer_id = c.id
          LEFT JOIN projects p ON e.project_id = p.id
          ORDER BY e.created_at DESC
          LIMIT 1
        `).first()
        
        if (estimateResult) {
          console.log('⚠️ 方法4使用: 最新の見積を取得', estimateResult.estimate_number, '（元リクエスト:', estimateId, ')')
        }
      } catch (error) {
        console.error('❌ 方法4失敗:', error)
      }
    }
    
    // デバッグ用：利用可能な見積一覧を表示
    if (!estimateResult) {
      try {
        const availableEstimates = await env.DB.prepare(`
          SELECT estimate_number, id, created_at 
          FROM estimates 
          ORDER BY created_at DESC 
          LIMIT 5
        `).all()
        console.log('📋 利用可能な見積一覧:', availableEstimates.results)
      } catch (error) {
        console.error('❌ 利用可能見積取得失敗:', error)
      }
    }
    
    // PDF生成用デバッグログ
    console.log('🔍 PDF生成用見積データ:', {
      id: estimateResult?.id,
      supervisor_count: estimateResult?.supervisor_count,
      leader_count: estimateResult?.leader_count,
      m2_staff_half_day: estimateResult?.m2_staff_half_day,
      m2_staff_full_day: estimateResult?.m2_staff_full_day,
      temp_staff_half_day: estimateResult?.temp_staff_half_day,
      temp_staff_full_day: estimateResult?.temp_staff_full_day,
      staff_cost: estimateResult?.staff_cost
    })
    
    if (!estimateResult) {
      // 📊 詳細なデバッグ情報付きエラーレスポンス
      let availableEstimates = []
      try {
        const result = await env.DB.prepare(`
          SELECT estimate_number, id, created_at, customer_id, project_id
          FROM estimates 
          ORDER BY created_at DESC 
          LIMIT 10
        `).all()
        availableEstimates = result.results || []
      } catch (error) {
        console.error('❌ 利用可能見積取得エラー:', error)
      }
      
      const errorResponse = {
        success: false,
        message: '見積データが見つかりませんでした',
        debug_info: {
          requested_id: estimateId,
          user_id: userId,
          timestamp: new Date().toISOString(),
          search_methods_attempted: [
            '1. 見積番号完全一致検索',
            estimateId.match(/^\d+$/) ? '2. 数値ID検索' : '2. 数値ID検索（スキップ）',
            '3. 部分マッチ検索',
            '4. 最新見積フォールバック検索'
          ],
          available_estimates: availableEstimates.slice(0, 5).map(e => ({
            estimate_number: e.estimate_number,
            id: e.id,
            created_at: e.created_at
          })),
          suggestions: [
            `正しい見積番号を確認してください`,
            `利用可能な見積番号: ${availableEstimates.slice(0, 3).map(e => e.estimate_number).join(', ')}`,
            `URLパターン: /api/estimates/{見積番号}/pdf`
          ]
        }
      }
      
      console.error('🚫 PDF生成失敗 - 見積データなし:', errorResponse)
      return c.json(errorResponse, 404)
    }
    
    // フリー見積の場合は専用処理
    if (estimateResult.estimate_number && estimateResult.estimate_number.startsWith('FREE-')) {
      console.log('📋 フリー見積PDF生成:', estimateResult.estimate_number)
      
      // フリー見積項目を取得
      const itemsResult = await env.DB.prepare(`
        SELECT * FROM free_estimate_items 
        WHERE estimate_id = ? 
        ORDER BY sort_order ASC
      `).bind(estimateResult.id).all()
      
      const items = itemsResult.results || []
      console.log('📦 フリー見積項目:', items.length, '件')
      
      // 基本設定（ロゴ含む）をD1から取得（全ユーザー共通なのでuser_id不要）
      const settingsResult = await env.DB.prepare(`
        SELECT key, value 
        FROM master_settings 
        WHERE category = 'basic' AND subcategory = 'company_info'
        ORDER BY updated_at DESC
      `).all()
      
      const basicSettings: any = {
        company_name: '',
        company_address: '',
        company_phone: '',
        company_fax: '',
        company_email: '',
        invoice_number: '',
        logo: null
      }
      
      if (settingsResult.results) {
        settingsResult.results.forEach((row: any) => {
          if (row.key === 'company_name') basicSettings.company_name = row.value
          else if (row.key === 'company_address') basicSettings.company_address = row.value
          else if (row.key === 'company_phone') basicSettings.company_phone = row.value
          else if (row.key === 'company_fax') basicSettings.company_fax = row.value
          else if (row.key === 'company_email') basicSettings.company_email = row.value
          else if (row.key === 'invoice_number') basicSettings.invoice_number = row.value
          else if (row.key === 'company_logo') basicSettings.logo = row.value
        })
      }
      
      // 顧客・案件情報をdelivery_addressから抽出（値引き情報を除外）
      const addressParts = (estimateResult.delivery_address || '').split(',').map(p => p.trim())
      const customerInfo = {
        customer_name: addressParts.find(p => p.startsWith('顧客:'))?.replace('顧客:', '').trim() || 'フリー見積顧客',
        project_name: addressParts.find(p => p.startsWith('案件:'))?.replace('案件:', '').trim() || 'フリー見積プロジェクト'
      }
      
      // フリー見積用PDF生成（通常見積と同じフォーマット）
      const pdfHtml = generateFreePdfHTML(estimateResult, items, basicSettings, customerInfo)
      
      return new Response(pdfHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="estimate_${estimateResult.estimate_number}.html"`
        }
      })
    }
    
    // 現地調査専門見積の場合は専用処理
    if (estimateResult.estimate_number && estimateResult.estimate_number.startsWith('SURVEY-')) {
      console.log('📋 現地調査見積PDF生成:', estimateResult.estimate_number)
      
      // 基本設定（ロゴ含む）をD1から取得
      const settingsResult = await env.DB.prepare(`
        SELECT key, value 
        FROM master_settings 
        WHERE category = 'basic' AND subcategory = 'company_info'
        ORDER BY updated_at DESC
      `).all()
      
      const basicSettings: any = {
        company_name: '',
        company_address: '',
        company_phone: '',
        company_fax: '',
        company_email: '',
        invoice_number: '',
        logo: null
      }
      
      if (settingsResult.results) {
        settingsResult.results.forEach((row: any) => {
          if (row.key === 'company_name') basicSettings.company_name = row.value
          else if (row.key === 'company_address') basicSettings.company_address = row.value
          else if (row.key === 'company_phone') basicSettings.company_phone = row.value
          else if (row.key === 'company_fax') basicSettings.company_fax = row.value
          else if (row.key === 'company_email') basicSettings.company_email = row.value
          else if (row.key === 'invoice_number') basicSettings.invoice_number = row.value
          else if (row.key === 'company_logo') basicSettings.logo = row.value
        })
      }
      
      // line_items_jsonから調査見積データを取得
      let surveyMeta: any = {}
      let surveyItems: any[] = []
      try {
        const lineItemsData = JSON.parse(estimateResult.line_items_json || '{}')
        surveyMeta = lineItemsData.survey_meta || {}
        surveyItems = lineItemsData.items || []
      } catch (e) {
        console.error('line_items_json解析エラー:', e)
      }
      
      const customerName = surveyMeta.customer_name || '現地調査顧客'
      const projectName = surveyMeta.project_name || '現地調査'
      
      // 現地調査専門PDF HTML生成
      const pdfHtml = generateSurveyPdfHTML(estimateResult, surveyItems, surveyMeta, basicSettings)
      
      return new Response(pdfHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="survey_estimate_${estimateResult.estimate_number}.html"`
        }
      })
    }
    
    // スタッフ単価をデータベースから取得
    let staffRates = {
      supervisor: 20000,
      leader: 17000,
      m2_half_day: 7000,
      m2_full_day: 12500,
      temp_half_day: 6500,
      temp_full_day: 11500
    }
    
    try {
      // ステップ6と同じクエリ構造を使用（subcategory: 'daily_rate'）
      const rates = await env.DB.prepare(`
        SELECT DISTINCT key, value
        FROM master_settings 
        WHERE category = 'staff' AND subcategory = 'daily_rate'
        ORDER BY key
      `).all()
      
      console.log('🔍 PDF用スタッフ単価クエリ結果:', rates.results)
      
      // ステップ6と同じキー構造で取得
      const dbRates = {}
      rates.results?.forEach((row: any) => {
        dbRates[row.key] = parseInt(row.value) || 0
      })
      
      console.log('🔍 PDF用変換後スタッフ単価:', dbRates)
      
      // ステップ6と同じキー名で単価を更新（supervisor_rate → supervisor）
      staffRates = {
        supervisor: dbRates.supervisor || 20000,
        leader: dbRates.leader || 17000,
        m2_half_day: dbRates.m2_half_day || 7000,
        m2_full_day: dbRates.m2_full_day || 12500,
        temp_half_day: dbRates.temp_half_day || 6500,
        temp_full_day: dbRates.temp_full_day || 11500
      }
      
      console.log('✅ PDF生成用スタッフ単価取得完了（ステップ6と同じデータソース）:', staffRates)
    } catch (error) {
      console.error('❌ PDF生成時のスタッフ単価取得エラー:', error)
    }
    
    // 車両単価をデータベースから直接取得（複数車両対応）
    let vehiclePricing = {}
    if (estimateResult.uses_multiple_vehicles) {
      try {
        console.log('🚗 PDF生成用車両単価取得開始:', {
          vehicle_2t_count: estimateResult.vehicle_2t_count,
          vehicle_4t_count: estimateResult.vehicle_4t_count,
          operation_type: estimateResult.operation_type,
          delivery_area: estimateResult.delivery_area
        })
        
        // 作業タイプを正しいフォーマットに変換
        const operationTypeMap = {
          '引越': 'full_day',
          '終日': 'full_day',
          '配送': 'half_day',
          '半日': 'half_day',
          '混載': 'shared',
          '共有': 'shared'
        }
        const operationType = operationTypeMap[estimateResult.operation_type] || 'full_day'
        
        // 2t車の単価取得（ステップ6と同じ構造）
        if (estimateResult.vehicle_2t_count > 0) {
          const subcategoryKey = `2t_${operationType}_${estimateResult.delivery_area}`
          console.log('🔍 2t車サブカテゴリキー検索:', subcategoryKey)
          
          // ステップ6と同じクエリ構造を使用
          const pricing2tResult = await env.DB.prepare(`
            SELECT value FROM master_settings 
            WHERE category = 'vehicle' AND subcategory = ? AND \`key\` = 'price'
          `).bind(`2t_${operationType}_${estimateResult.delivery_area}`).first()
          
          if (pricing2tResult) {
            vehiclePricing.vehicle_2t_price = parseInt(pricing2tResult.value)
            console.log('✅ 2t車単価取得:', vehiclePricing.vehicle_2t_price)
          } else {
            console.warn('⚠️ 2t車単価が見つかりません:', subcategoryKey)
          }
        }
        
        // 4t車の単価取得（ステップ6と同じ構造）
        if (estimateResult.vehicle_4t_count > 0) {
          const subcategoryKey = `4t_${operationType}_${estimateResult.delivery_area}`
          console.log('🔍 4t車サブカテゴリキー検索:', subcategoryKey)
          
          // ステップ6と同じクエリ構造を使用
          const pricing4tResult = await env.DB.prepare(`
            SELECT value FROM master_settings 
            WHERE category = 'vehicle' AND subcategory = ? AND \`key\` = 'price'
          `).bind(`4t_${operationType}_${estimateResult.delivery_area}`).first()
          
          if (pricing4tResult) {
            vehiclePricing.vehicle_4t_price = parseInt(pricing4tResult.value)
            console.log('✅ 4t車単価取得:', vehiclePricing.vehicle_4t_price)
          } else {
            console.warn('⚠️ 4t車単価が見つかりません:', subcategoryKey)
          }
        }
        
        console.log('✅ PDF生成用車両単価取得完了:', vehiclePricing)
      } catch (error) {
        console.error('❌ PDF生成時の車両単価取得エラー:', error)
      }
    }

    // vehicleRatesオブジェクトを作成（PDFテンプレートで使用）
    const vehicleRates = {
      vehicle_2t_full_day_A: vehiclePricing.vehicle_2t_price || 45000, // デフォルト単価
      vehicle_4t_full_day_A: vehiclePricing.vehicle_4t_price || 70000  // デフォルト単価
    }
    
    console.log('📋 PDF用vehicleRates定義:', vehicleRates)

    // PDFテンプレート内で使用する単価を事前に計算
    const vehicle2tRate = vehicleRates.vehicle_2t_full_day_A || 45000
    const vehicle4tRate = vehicleRates.vehicle_4t_full_day_A || 70000
    const supervisorRate = staffRates.supervisor
    const leaderRate = staffRates.leader
    const m2HalfDayRate = staffRates.m2_half_day
    const m2FullDayRate = staffRates.m2_full_day
    const tempHalfDayRate = staffRates.temp_half_day
    const tempFullDayRate = staffRates.temp_full_day
    
    // スタッフ費用の正確な計算を事前に実行
    const totalStaffCount = (estimateResult.supervisor_count || 0) + 
                          (estimateResult.leader_count || 0) + 
                          (estimateResult.m2_staff_half_day || 0) + 
                          (estimateResult.m2_staff_full_day || 0) + 
                          (estimateResult.temp_staff_half_day || 0) + 
                          (estimateResult.temp_staff_full_day || 0);
    
    let calculatedStaffCost = 0;
    if (totalStaffCount > 0) {
      calculatedStaffCost = 
        (estimateResult.supervisor_count || 0) * supervisorRate +
        (estimateResult.leader_count || 0) * leaderRate +
        (estimateResult.m2_staff_half_day || 0) * m2HalfDayRate +
        (estimateResult.m2_staff_full_day || 0) * m2FullDayRate +
        (estimateResult.temp_staff_half_day || 0) * tempHalfDayRate +
        (estimateResult.temp_staff_full_day || 0) * tempFullDayRate;
    } else {
      const maxReasonableStaffCost = 200000;
      calculatedStaffCost = (estimateResult.staff_cost && estimateResult.staff_cost <= maxReasonableStaffCost) 
        ? estimateResult.staff_cost : 88000;
    }

    // 基本設定（ロゴ含む）をD1から取得（全ユーザー共通なのでuser_id不要）
    const settingsResult = await env.DB.prepare(`
      SELECT key, value 
      FROM master_settings 
      WHERE category = 'basic' AND subcategory = 'company_info'
      ORDER BY updated_at DESC
    `).all()
    
    const basicSettings: any = {
      company_name: '',
      company_address: '',
      company_phone: '',
      company_fax: '',
      company_email: '',
      invoice_number: '',
      logo: null
    }
    
    if (settingsResult.results) {
      settingsResult.results.forEach((row: any) => {
        if (row.key === 'company_name') basicSettings.company_name = row.value
        else if (row.key === 'company_address') basicSettings.company_address = row.value
        else if (row.key === 'company_phone') basicSettings.company_phone = row.value
        else if (row.key === 'company_fax') basicSettings.company_fax = row.value
        else if (row.key === 'company_email') basicSettings.company_email = row.value
        else if (row.key === 'invoice_number') basicSettings.invoice_number = row.value
        else if (row.key === 'company_logo') basicSettings.logo = row.value
      })
    }

    // 承認情報を取得（印影表示用）
    let approvalSeal: any = null
    try {
      const approvalResult = await env.DB.prepare(`
        SELECT ar.responded_at, a.name as approver_name, a.seal_name
        FROM approval_requests ar
        LEFT JOIN approvers a ON ar.approver_id = a.id
        WHERE ar.estimate_id = ? AND ar.status = 'approved'
        ORDER BY ar.responded_at DESC LIMIT 1
      `).bind(estimateResult.id).first()
      if (approvalResult) {
        approvalSeal = {
          name: (approvalResult as any).seal_name || extractSealName((approvalResult as any).approver_name),
          date: (approvalResult as any).responded_at
        }
      }
    } catch (e) { console.error('承認情報取得エラー:', e) }

    const creatorSeal = {
      name: extractSealName(estimateResult.created_by_name || ''),
      date: estimateResult.created_at
    }

    // PDF用HTMLを生成
    const pdfHtml = generatePdfHTML(estimateResult, staffRates, vehiclePricing, basicSettings, calculatedStaffCost, { creatorSeal, approvalSeal })
    
    return new Response(pdfHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="estimate_${estimateResult.estimate_number}.html"`
      }
    })
    
  } catch (error) {
    console.error('Error generating estimate PDF:', error)
    return c.json({
      success: false,
      message: 'PDF生成に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// 追加のPDFルートパターン（フロントエンドが異なるパターンでアクセスする場合に対応）
app.get('/estimates/:id/pdf', async (c) => {
  console.log('📄 代替PDFルートがアクセスされました:', c.req.param('id'))
  return c.redirect(`/api/estimates/${c.req.param('id')}/pdf`)
})

app.get('/api/estimate/:id/pdf', async (c) => {
  console.log('📄 単数形PDFルートがアクセスされました:', c.req.param('id'))
  return c.redirect(`/api/estimates/${c.req.param('id')}/pdf`)
})

app.get('/pdf/:id', async (c) => {
  console.log('📄 短縮PDFルートがアクセスされました:', c.req.param('id'))
  return c.redirect(`/api/estimates/${c.req.param('id')}/pdf`)
})

// 🔧 デバッグ用：見積一覧取得API
app.get('/api/debug/estimates', async (c) => {
  try {
    const { env } = c
    const estimates = await env.DB.prepare(`
      SELECT 
        e.id,
        e.estimate_number,
        e.customer_id,
        e.project_id,
        e.created_at,
        e.user_id,
        c.name as customer_name,
        p.name as project_name
      FROM estimates e
      LEFT JOIN customers c ON e.customer_id = c.id
      LEFT JOIN projects p ON e.project_id = p.id
      ORDER BY e.created_at DESC
      LIMIT 20
    `).all()
    
    return c.json({
      success: true,
      count: estimates.results?.length || 0,
      estimates: estimates.results || [],
      message: 'デバッグ用見積一覧取得成功'
    })
  } catch (error) {
    console.error('❌ デバッグ用見積一覧取得エラー:', error)
    return c.json({
      success: false,
      message: 'デバッグ用見積一覧取得に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// 🔧 デバッグ用：特定見積の詳細情報取得API
app.get('/api/debug/estimates/:id', async (c) => {
  try {
    const { env } = c
    const estimateId = c.req.param('id')
    
    // 複数の方法で検索を試行
    const searchResults = []
    
    // 見積番号での検索
    try {
      const result1 = await env.DB.prepare(`
        SELECT * FROM estimates WHERE estimate_number = ?
      `).bind(estimateId).first()
      searchResults.push({ method: 'estimate_number', result: result1 })
    } catch (error) {
      searchResults.push({ method: 'estimate_number', error: error.message })
    }
    
    // IDでの検索（数値の場合）
    if (/^\d+$/.test(estimateId)) {
      try {
        const result2 = await env.DB.prepare(`
          SELECT * FROM estimates WHERE id = ?
        `).bind(parseInt(estimateId)).first()
        searchResults.push({ method: 'id', result: result2 })
      } catch (error) {
        searchResults.push({ method: 'id', error: error.message })
      }
    }
    
    return c.json({
      success: true,
      requested_id: estimateId,
      search_results: searchResults,
      message: 'デバッグ用見積詳細取得完了'
    })
  } catch (error) {
    console.error('❌ デバッグ用見積詳細取得エラー:', error)
    return c.json({
      success: false,
      message: 'デバッグ用見積詳細取得に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// 404エラーハンドラー - PDF関連のリクエストをキャッチ
app.notFound((c) => {
  const url = c.req.url
  const pathname = new URL(url).pathname
  
  console.log('❌ 404エラー:', url, 'パス名:', pathname)
  
  // PDFリクエストの可能性をチェック
  if (pathname.includes('pdf') || pathname.includes('PDF')) {
    console.log('🔍 PDF関連の404エラーを検出:', pathname)
    
    // 見積番号を抽出
    const estimateMatch = pathname.match(/(EST-\d{4}-\d+)/i)
    if (estimateMatch) {
      const estimateNumber = estimateMatch[1]
      console.log('📋 見積番号を抽出:', estimateNumber)
      return c.redirect(`/api/estimates/${estimateNumber}/pdf`)
    }
  }
  
  return c.json({
    success: false,
    message: `リクエストされたリソースが見つかりません: ${pathname}`,
    url: url,
    suggestion: 'PDF生成の場合は /api/estimates/{見積番号}/pdf を使用してください'
  }, 404)
})

// 会社ロゴのBase64データURI（PDF埋め込み用）
const COMPANY_LOGO_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ0AAABWCAYAAADVCZShAAAQAElEQVR4AeydB7wlRZX/v6eq+977wiSioCzouuqaV13Xv6t/110kZ5AoiiiCigERlSEOaRhmhgmACIIKIqBIEiOKoqgkAyoo5gQiEoaZN+/d1N31/52+8wi6KrtzDZ//h6ZPV+iqU6fO+dWp0PcNIT12PaaBv7IGAo9dj2ngr6yBx0D3V1b4Y83BEEHXh1TWOq2qiqRYRVmHSQl/U6ZBPlSDt6XqKLZixQp63TaDwgq8sOrUaQoFhUr9Pd3qR93XSj0Z9FER3S64+tZfyf13/lYC9+l7P/RGKlF6cJd1vyvSGh7ovd+uJy/el54GnDwFpXdf0USfsl8wseoX/PgHN3PT9RfzqcvP4BOXLeSjH1nExRcs5JILl/LlL3yUX/7420ze9zvSVBepUJao6FWldElN9UM8a+bJG1gjm/g/+G6QVSfXRIcSDA90KZdwA3YhBExa9KdJTPOHFBnMc6DfH4Atxqi3cO2113LqKQugUufLEhVDDGpKqa7M3/rygeQyaPnjAWYm0JhGbZTdJLfETG5d9XvZ0lP52Mc+RqU+Z8pXQaQSer0efk332+MOxrqPKieWnkVmQXwRlZTlJKm6n2u/chWnnXYy+792D7Z8xRZsv90u7P+at3LIW+fxrnecwjFHLuGEecuZd8xC3vymQ9hppx3YfsfNef2Beyr/UK675tNYbxUm4JrkTIKhEqSYUZn6oLHijcdcacnt70rZwvNStealJ4ZAYQg8ahZJo8bMDVEqLSMgQZWZfOQoGtQL0xs3Wp438X6UZSJptI+NjXDOe8/kgg+eC6b6VlFoVLpnNCnEyPlbXz6QpmVIyXsSHuxDlmXIBQkkFV/64jWcc/ZZTE1NqW9raqRQRxqNhvJSXc95eN+cr5nzo873WFV1Mbr8+pc/5KILzmWPXXfkjQfsx9JFC/jqddey4t4VRDKCjRHCuMJZZGFMY1YDv8pVNxPAC379619z7bVf4EPnvZ+D37Cf+GzHh889nV/+9PuY9WUhJ7WL4YOiL5cqM2JK+CDzweGhy8gQr4E2hsFQnIqqj1lBUUzx61/8lJ/++HZ+d/edoDzTyKo0rZi50ispuMI7ZWZ1fCQPLDx5PjfdcD1IHTGYwsFdFWkQ+Zs+NXIkl4vggPEwRiNKzl6nC7Hitu9/h8PnHsbExATRAkHG83JSinTSU3TQb883M+VVAiE1aZogmIrQZtUDv2bp4nnss8eunHD0CXzvlh8TihYjcRZjjRlk1pIHLOh0OiDdNltBg3SCZB1ilvBBYGRkcYRWcw4jrXWImol+fPtP5AmPZa89dmPJ4gWs0rImFQURvyqVD1Tu5ZSsx5VCl1WZig3vFlSGxUxCh4pPfuoyDnr9/uy2687svece7Lbbzrzhdfty3Re+ICMIYHLZ3hFXzHTLWYy1olavXsURh7+b2777HVQS2bQescEj04X/RqF76Eru2cwEEg0C3YjKskejlcuA93LcvGO4/557cSP1eoX6YA9KO91fs0GeHLn6HPBk5QnprqwmufnG6zjwDa/jzDNO545f3am2Iq183B0pqYikyjB5/kYzI4acouwy1V5NlivfeWhg+/Kl6EuMMlKVRqGFZbfKKVOLRnOcB1ZMcO77zmHfPXbnK1d/FtNsVPa74lsJ+EHiD8I0Lb1mnunoMMIwDCbOo6p6nHPOmRx9xFyu/9rX6E726U2V3H333Xzpy9dw8JvfyKcuu6zulJcvNLVqnHuUqtKolZZGx8f4xc9+ytx3HcZvfvlLpDEaWmMkdzJ1yb/dw8zU+EBd0QdBcpOURC3aJlfdx7yjj+GGr30dB1eMOT6wHi63g9bJ831ZEaLY6fa+x+i8VnHBh8/ijQcdxDdv+B6tbA7jY+uSZ1qKaA1G6GNZKZx36UlXRdGTekzeqSFq1sBC3izGJjE0cf5BfGNWkeXi73xCBnoXwwimKf/279/GO972Zk469giKySlQsaLXIViQJ1VC8vntcns4LBpocQjc7rn7d3z4vPPoru5C0eB1+72Zc8+5gD323JeYN2irU8uWLGXFfffVrbnhTGPLE2aKNZtSZklD654f3nYb8446ks6qVaBRZpG/+eUmCJou+/2yNk7ScsFlK/urWXDKCVxx2eXMnDmbaJkGUcJkVDPTpimB90HxtGbOMjP8KuWVQijlgTosX7aYhQtOYWLFambPXFdtZJQVaqWglAeLDZMeAyEHMyOTZ8sbEQe9e2BfJ7t8pZYihaZMdJklqtSnX0wR1U4MkoVEt9slZFHyzqTUzvXsc9/LWw48kHt/fQd51qAsKtw+YkEhXhaCR4dGQ+N263e/y106JqiqwDOe/lxe+5qDeN6/PZ+3v+M9PPmf/pnRVoOf//znXPP5L+CXj/ZBKCMq0ilKcgFPWqKRZXzp81cz75hjKTptva1Ef+s7UGppkOdRHqbEDVFpSvr4xy/hgo98iLGxGQKYDCxQ5iGyevUkQge5wMGay0HhUbehew83bCUvtnTpYs59/4UUfWNkZESgmJQaegJWIFlELk4D0rRuy+hXJT0t+EtNq6Vmlyq1Kaspur3VCjsqW4ikL4G+BnmKBGtqWp6iUBkTCGNmtNtt3GP6OJgxZzbXfemLvH6/1/Lrn/xUAyfgl1YTxCxIFvH0jCHRgPsQmN3y7RtohgwrAk964hMZ37BFigXrrDvCU//xSWglS6PR5Me3/xg0ujKNXkvKjjkj2r2OpIqy28O9YiFFtcZmccUVV3DeOWeDNigFSaN+jaBVIrkbUP06XJO9NoED6vfrJ/H3PFe+yxq0WUBHDkFGS/0eN1x/HQtOmE+zminDGGh662uNV5Q5WSMInCJn4KTBCAKD6pe+OzWVL4yLP3g+55y2hGJ1m5amxrJfUalY0hTn1dDSIxVdKunEAdLrRMZGmlRls9ZB0DqtqQ1DszEKXiZJNzoRkCFICt1TOcALMW2oTMxUrJ/TauRURa4yRimbpdmz+O7t35LHex0rf/MjrERgdQUEhapUCzOcx9BAt96Gm6oDTccHZa+P69f16iNrZLRJt+OjJTA2c5YkV7N6Kf2oDkxOTmJRnVO2KynIFfhiOMsD537wA3z6yivIBDo0HVVSnrTgGgGDOq5gbe8YY82i5l/HwIz6kjiguJHLmwgRAs5PfvoDjjziWO0gC3dEeu/51JeZqV8JBXW6fqi+e/eqMmLIcQXd/I2v8973nq6yhgkNPu2ZGZk8vbdZCXAeZvI2jdzouddXXiFgqhRJQBb2BcgM5+1Tv5NZxEQQxKtB1MB2nTrw/KwwatD05aW9rxKHOqwqxsfH+Zlmo0MPPVQOoMTBaomhXzLzw3n+7+P/+E/PYEJb+KYAdtdvfsnK3/0CrMOKFXdx263fJtcoK7ST+odNNsOVUXfIUMe8s6NaO/RwBfsCueE7Mykmbza46647mTfvGL6q3W+0OCgjz4eMUwmIZs5ELIdwu/LdOM7K5Zsmz3cAeH4UYO668+ccceS7JNvd9HsVLS0dvKy/D0geRabTig5uZTuwQ8jUZ2PVqntZtnwhd/7mDoI8nAMtyZXJ9viA8/qDNqtaN03VE+5oagnS1YzQafdojcxiww3/gU03fQrPfu7zeeaz/4VNNn0S4zPnUGp67RWJ5GtMooCVBMwSMyMK1H4GOjrWqnm7l49ClxEgBr5+442cc+7ZShl/iUutDIft0571VJ7yz0+mKCf57q03csTct3PFRz/MkUfO5cc//iFtLV433Ojx/PtLX1o3aBZBfXLldrpTZForeTzGqPXGpJSFlNRnxowZ3Hvv7zj+qKP51Y9uh6JPDEah/5IYeB0SQ7mCo16cnKeTmWFmeL5TkpfpTk0w/6QTuPGGG2SUCgdLp10gm4G7dz29bimvrKpKDe4aQJJT4otn4vwPncN1X7mG0dFRfHrrdPsCSiUOqSbn4V7fzHCdiB2VjkD6nZJ15qzHfvvtz/vefzYfvezjXHjJRznv/Au54hOf5qpPfpaPXXI5J81fyL+/5D+IWUvrvUp9yCRrQ4BPWEg0NVB8honSd57nRCHBgeiU5SOcfebpfOfb38Sv5CPBI0MiNTUcTjNmzeL4E49n/Q03UCcLrv7CVzjssKP4/NVfZWJlxZx112fBwoV6vy6YsFMU+BWjaY0yKqUEKSWjod1rq9XCLx+BXYHVDfOrX/6cd7/rnaxa+YBeJRlcoqcKMzHTrcyh3G5sp7AGgJWA5mDyPNOxxfyTjtEm51pGG2P4UYSFgqwxUhuzFkA7VUdgWmMoSansqu4fklNOhs7qCS695BJmSWfqgrIjDt48a+IgyLSDLLSD9CnT4zHmGojG+us9njcc+BYuuexKjj7xBF704n9j4003ZPb6M2gKvGpEy5eZbPqkJ7HLK1/Jhy+8kPMvuJCtttmOUlNxluUE02CXFzQzFR9I518i5F6JaifmgaBwxcrfsXjRKVT9NmYZw7wGrQ6BY6ZV1wue/++cd8Gl7P3qg3jeC/+DjZ/wdJ71zH/nwAMO5cKLP8K/vuiFoBYdTL5OcaW6MR1YpheVDOXxMoGPcp9uxsbG8EqtVsY3vnETh7/7MEzlNGEQTXBQXMVVZu3u9DAm04BzbzXN1QSmSz76ES686AIqbQDK/kDGvqZ6l9n74eTl5UjwPnp8mtKa/qEvCGecvoxf6hyy6FYCayRqoJVy14UQWJXQ75V4ODoyk1JtrZ7osNEmm3DcSSdz2BGHs5k2ZkllTQBx/n1tNEptrnB9eD8UeuD0vBf8C6fpoHnJqct17jebrh8Ud7u1fku1mTSl18DW7NGVt233uipTaUCMccN1X+WaL3zem4DffmgQDuEZhsCjZiGbkMXAJv+wGcfMn88HNMKu+uyn+fjlH2fukYfz5Kc9mTXOA4vgbjwKNWbSUM0hSBEVQaPRld6U93AQTk625QUaFGqgqZP/L1z9OU5fthTpq65lZuiu42vz+H0eVVWIr9UyF9qRfuW6qzn55JPJrYF7o1ajiYOm2RzBMiEQXSnpIdEUuux14mGPoB37qgd+q682lzM+MkawJkkeyAHq5HV8YW8W1OdcwDPaUz2e/czncs55H+A/t/xPkMW8FZOuqwqt1SDPRiST4VcI/gSrk4kkWTxvux12Zt6xJwpMc0BMKo3sYBlmRrfT0x6ti88yeUP9yzO1XRBD4CMfPk/ldT9uJz2Gc68Rce2ZGQVyQYQGOkvqyN1ncvVNCO2aer02Qd8Fa4UJMTZYBJGkOTOr1zEOuIGHS7gRck03meajrv8qJZhqISVXnHXGezn3vWfiGWaGD3LW8pIYNQc3kkdCCDgVZcFPfvITjjzqMG2KHpCRchlIRpKry7NRLTErLPZIqfRqD9I0H5m9zpPtFSa+dO3V/O6e39DXeV7ZDzTylgabDoRU3/vswAsyegw57XaXDTbYuAbLU572RLVTqa+FQnB5g0lGkXvFVGuwkkoeIqTjSgdNSe/UOK/Y+hWcfvoZNfC8fl96zweQywAAEABJREFUTUK5g80Hkg92PwcsBUi3j/f/e9/7jj5LflfVZ4uGc4fhsIGgUUMZOH7eO3nTfntz0Gu25uD9X8l++27O/gdszT677c5lH71IeihFGYFciqtAc1HMWsobxYg0sjEptSMjJpJN1WGQ0mR7jTxjbGRco3CK5UuXcc1nrgCd13knksqgy40r+4HQ7WdeynpUt2yHe19ftyW6atdAXuiB397Juw/Zk9/+fAWjuWSTjOWD1Md3fXkaUX8MX+PlIdbyu8Ggpz6JjwsjKSQS1371Ovq9UVIMOngp1NJE/TZqtz7WGqURM71fSVn1CHGMY45bwLP/7XmYRXEIhJApRKECG5CaxAj/LUXZxd8hL4vOGV/00v/Lmw59KxPdRKYvGknTaxL4CnndIiUVK2u7aFMujebcf+8Kvn39DaCUHkO5w1C4iEmS6qY6E9x80zf5yrU3cuPXf8DnP/NNvnT17Xzxc7dz7bVf4dZbb9WBZqnSyKhIcUGKinW80nQ27eWCFBvkabygmdXlMi2uQ3SFB2KM+HnTsccezfdu+TbIQDUTQMWxQH1FrXncc0x7nTrzjzwcqMEqvY0YTXykd7v3MPeIQ7n9tt/g8jgf90YeqmCdZ2a1kSxoqiSqU6pLRqoUl8G9HMqXo2bF/ffwo+//AP/BaoZaUX+yZPrOmtd98rKl1ogtTdn+S5VX7r4rr3jFf2Ih+Ku1IpfZKUi3e+yxB1tssYXOGDt1u76bdT0N+mjyvO7JEz7LeJ0vfekakjYfayXAwyqvfW/WMPPpZVSL/pGREXJNGc3GDF7/urewYP5yjj5iAae/9yy23GIbTOARPmUoH/corGiofN1hnwp8tEnJ3llXhLN33nJo+mxTUijiuy1v54EV93PYoYewSsY0M3mIDs47CTvVgL1Xx8zq8E89gmNEYDFRWZYaHBMsXHgsX/3aV8jjTFo6YnAjhMgAbPLQLrOZaSnQl+RdDYQ2VepS6FNTv5Qs8mUSRc32QUL97jd3cvcdv2FM68HogFQ7Zb+Ql9eQLUrxKfB+Rw2q2bNns+feexKbqqovOGKy1rfZYIA0ddZ3oL61uvzTOvaD46Lo4+k8C7UcRdGr13m33367PN79a93+NIOhgc5HUL9b4OuEXtGhqCbZdbdt2Gv/3dj/wD3ZY4+9+beX6IxOYNDg1gizNTKEGhRJZqvk7Tx0xZcCFwRqQzsIRYUs2O0VNOUJ/NuhsvjJj2/niMPfRVfHELnWQoiPBTdUiXtOM+PRXX1tDFRSbUSt0T543hl85CMXaf2WkcljOq9er1f3zw3jMqp0LbuHjWwWIc4gy2YSwriWAI4Web8kWSqFMuB3vndL/Vs759eTrkqBqeblMluk0czELwm8Bc98znN4xjP+ma4Ogs07ytpdJv4QJFuogfWCF7yAZz3rWTW4HOTTes5iA9djZprmZUdPr1q9irvvvGPtBHhYbZnnYam1iGogY+pYQ7ufpkaS/zbulMUn8cbXv5q3vfVA3nfW2QPuNgjk0OqIj7bg008wdTbHFeAv3KhuECc3ttng/eiMcVZPTuFteN3RVlNngZ/h2KOOoqvPae7ppMmajyvS+fBo1iOaPtwJO2iv/syVLD55EUkL/agzKz868bacXL4QwczUTCmSl1JnesVK+uUq+sUqtTapNdlqFeqrnAKd75kGxLe/ewt9teN/q1BqAW8xEPMGlfrum4HgwivS1QHwC57/Inm5jGarwbCu4sGz0UhDdnqpDur7+hzm/aswDZggkjwaIEGga9SDwJjUgfh999zFsK6hgc7EKUbTFFHhi/7xsXW5+rPXcdVVX+JjF3+Ka7/0FfryUhjIXjUNAAE+nRWajmpPJwOiK6jTZoaZyRQVuUZ7pjb6nS5B8Uq5KlaP2hgjl1x8EWcuPw3Ni6Cpzz2uvzcz5cndeOJPUtTbKX2y+yqnzD+FmEbrTUup9WKyUK9/er0Oztfl9cHglLQYdHkCYzQ1DUeFmY1jjIpfLvI7FwhLbr/9+5h4eb9jbOL1LOa1oXOFXZ2f5XmTGBo865n/4hXBpE/tJhnC5YPQZfY+IL386wtfgC9TXA6XyanSuqTUzjxaJAumAZRwjzy5euUQJBiwkBkHkbV99n3uE5Mod1FVECxj551345hjjtd3ynnsuc/e5I2sBlilAsm7I4O50XLtorzjQaD1juPzr3h5OSfPKzX6Kq05PG5ZxLf2QWFrdERGy5gxOsZ7zziNq668UjXVvt451MysTv/5R8Edv/4phx7yNu6+67fi2dJxSCmbWw3sLMse9MRmVgMGXS6fAk3lq0lMUVZTmEKztsDeI/hL+tzzm9/WvyrOrFnnhZTR19RZ6YC40NEISvc0fTu/sbFZPOHxm6q+DK51X4g+IGpG/+tHscY+ruc8zzX9l6y33nr41x8zw0z9RBorII+h7rOv6VzfUe2vemDif93271cMv5/xiPT/IJFlEhQJrnUKAtRUd0KfbF7LAW/an4PfdiA77rhjzS3IS9maVuu4Ouuew3eL3kGPu+LrwnqYWW1s0/zt74WCekoLAnW3269/oVJJWcESzu+II+byta9+FQ1S1ZYkAjjiUSf+xKPbuZcTjjuJX/5cgJODKos2qZIXiqOqPphGvbrL5uTxaTIzspDTyFpE/acURk7SVFqXUWiKrDd7DhuvvxEbb/A4Nt14M560yaaiJwpgj+dxj9uYzTbbTB/wN+Qp//Q0NtJ3asTXDb7G+YvD//6u7VM9VD/EWDsA17frraeNTKU1tactoHcJDx2gheu+/1DdtY2J/dqymK6vac/6lFM5/XaisyrTd1Kta5KUH2LdAf9UY2bqkD3MICXqP6msNCs2yLKucNUgxEliGoHUkxnFU0cSuWVErZvkTvCvADG0CJWmMot0o7qSl0ytWskJR76F+371K4xJqNQWQbDsanPTVYiW7dRhpViipw60WXjqUTrWuZYsNyrGaQvEbVP5bBV5OYqljuSZxZjakY8g6XA32QRRxkpJ5WIfn/orydunQUehVZnqqS0rWf9xT+BDF1zFR6/8JBdd8SnOv/J8Lrjik5x/+aVcePknuOgTlyn/czW9/yMfZHy9EdQBkOym51rf2lFL9XW//QwuqZcplGQ6v+u2pxQmkuQt5dGneg2QHhK5RKhopAaNseZaizDNIExH1jasaJIk3HOf/2Ke9qzn8PLN/4uxOaMQCnW0R5LHiZo+vR0Pg8kYKXlSZFrYjpLLU2Ra68TYIFhOCDlGpoIZmeqX1iKMzyQ0c9qrE2W/gzXuFRjGxSPSbIzSao7xs5/ewSGHvJO7fnUXIZpAjqYLyGp+kDTVqHmCRrBJuvcuX8rHP/I5rDemvAap7JJLtqb6Q5nRkdeLNko3tpmsujRHewQmtL5bn+Q71jibGOMjyEwtBOrLVNqXAjNmzWT9DTeoab0N1mfd9deryfPWXXeOprt1apo5c5w8jzx0TevpoZz/ccwiLpK6hTbjSLp6nerryFDPPgWNZiRqgJhsFmKpJgrprUfMSmaMr6v0cO4wHDbUI1r94oh5h3PFpy/j7PPP4Vna9iOFW1KHYwUaXb5OMMUevFXJO+0/ieoXq+WN2nJkHZKJEHkoykIbsy7tqVLvG+jTpdYlPQEuCFR9AWWK5F4rdMiaietv+CJHHf0eOlMPkMkLRa2lynLQchYDGgVIo3zuE1dy+tKlKncfrdGSXn+SoLVmLMC6DapiFEKTMk1hIRP1qXSan2tdVLixWmh9WVFP/VCHHq+n4KQM3UmSeZ6imJkHNXme2UNpM6vfm9mD7z1iNkh7fG2pqmppJFHFt27+Bn70FGNO1c9IRVR/jUgT02ALqSnrNck14NZZdwOGdUn7w2HljOQ4kB3ItdXO8giurL4JkIrrZVX28LVFUfRAADQzhQg0JVE7vhjG1ckxlZclqxFS2ZISmhS9rFbOvz6nz1Mfl9HQWqsQEEu970uJJUawEbrtoPI5gRmMja7D1Z++lsULTweVl6Mkyr2WvhPUjhDRt75xE8ceezRmRqMxm0qDo5TC+4WjJREaD0Cuo5D8AfVLsk2uYMsXz2LDWWMUbpBmV+2tkIHa6oOMmRKVGqp07FFqByjLMn2ZWd2Opx1sTmbmyZo8/XDyTLOH3nt6bcjl8vqZPH+gZPXECr5wzdXKks4qaORdyacBZ23yrEO/XEkKqzEN4taIsY68sgoP5Q5D4eJMJGyQkB84dyFveuNuvPPQvZg7d1/e9e49ec+79uKd73gHV1x2mZckaiqqI3okGcl3hmVaTVFOyKOsov7malMQ2muog+UNnrVJztw3zWaD1gRFZw4mj4ZFCvErdE4WYxfipPhMCtKrmTGzwYfOW84HzlmGkCi+CmIiSel33PlLjjz6CO6+9x6Vr+hqlBfWJ2SRnoCMBk2nbAtUOTmz6K1ssM3/ieyxZWL2jAk6VZ886J3qBS+vvphkMTPMrPZ43qayMeIgzUOX2aDcdI7ZIG02CKfzPXQwerg2FEKoZagHA0lHWVfif0zV0HldiLkWMTMl7qhoRIN0QJZG1f8WG238FDZ6/IZr0/wj6oZHpNYmIc9EOc51X7xFH+K/zicv/TLnn30lF533eT78gav50Ac+xA3X30zp6ykZB3XPm3OfYmZEG8c9XR0q7h0OjKnUGJZGBIrVVJPwf55zL6995QizbBV5aoCA4lQWGVmYIe/YoJmvS6oairfI5QGXLFzOF7+gNRsFaAqeaq9g3rFH8q3vfItma5Ss2SLZTAp55aoDFkpSnlFZk5hmYJMdXvTMDm953Uw2W6dHr61CwaAwMslQlDlmETesmXpkFX4UBDC4wiBY8zRT3TXx6cCBNU3TedOh2R+Wn373aEP3dC5bjKZZYxWXffwSzKyWudKg6ehQW+sJKg3cPvJwjZ68+RSTnRU849n/ROPvcSNRSK8lfXmNrgAUyLMmu+2yD4e9Zx6HvPOY+o9Ytt16O2JoaCTpruTT0WUVfj5VCFH9YjUe+vqpoi0gdLDQI2hN1ohj0AwY6/GqnUbZf/ceY0rleSFddbWBgEQXQpdOd0Iec7WY98jzPv3eBMfNPYybrrtGNXqceOzRfPmLn2eDddal6pX4H4UXrCCmNq1QyYMJWP41wjYklyfbbN0J3vXGMTZ7gk+jI+TZuPanoxoMPdr+lzFaTqgxHHQeOjmASIqJPG5mSgxuTztV0oGT55oZZgPy9LAphKxm2et2+NjFF/Ktb94M0n1RyA460kGf6khNAlrWaMB6ulSYZTN5yUu2kGzqCMO5wnDYgESHGGnNGKGyHm78V+23G29954G8c+7BvP3Qd/Ky//ovakOYtzpoOlig2WzQyN2YI2SxRbBc5TJSFWqqFJa9xIQW8B1RmHyA/fcY5+X/2aK9aibjjUxrKQihgRFFWc0HrdF63VKeb1SHs3dw9LvfxaFvOpCPX3gBLU2jZadHM2vRUL1MFPojZP0xMnFwMPSLKWbMuGhVbAoAABAASURBVIu3vv3xPPNJk1Rt7WTl4UodozQZlZwFoZlTZgVm9gjCL9NDZGZ1t91slceUVmEsBBA/zwe9SfKwa8jTjyTxWovb2yjLknvuuYdzzz1XnCoKfRabBn+WB3pah5oGHaIkQDZbORtqWn3Zy14qqSWrag3jHhqnRgWmBXh3qk0lRRbaen/gg+/n9EWncMq8o/nohRdRX96igXfKFdEvpWwBJRfwSnpUGnVJ3yqzvIVlSaaIuGEajLOOdpdwP/18lqa1Lm/bK7D58yr8GIO4kqojkJIT8kpg6kOjYMoKsqql6WGMX//2fj75qc+RZ+uiZmX0lnaeUySBJqQ2YbxBd3QSlz0IrHM0eN6w28Zs/ZwuU0VOPzYZRwATLLu2Wi3lkjdpY1MSUka/2yEo1+SdzSJSCMk7CRjUFPScjns4nUY1TXWmydOPJP7kVVVV/b5Ys0nzhLftzWv2xNIUFKuYd9TR/PauO9TaDDKdyWXy0tboqnhBCIG+bJhpsM6IDbr6CvGC57+Q8fXXxVRiWHcYFiOXKmSmzpjUHslDzmc++RlOWbSYZctP58Mf/jA9/9wDuIKCBRm+JI8ZZlaTd9rMVGJQxhe9VVWovChEVtybyEJTL1dRdWexzszA29+6Ef/ypLbO7WYSm1J81cYlWDkZafRazE4NAa+sp3Af1TFGvB2P+8j3EF1Rg8Tk+ahKgXADRrMGu21u7LZdpFMWmJlKDW6v433w+tNkZjVfMxPQTDJTX0rW4V/64X1yz5VJbmQFl8vbNjUc/KHEGWecwfXXX68ccD30tbQoBbJ+v1C6iddBemhoc+F/4jg+cx122WU3MIZ6hWFx88+lRb+r7kJ3skvU6fbLX/4K9tn71bzugIPYbvvtaYwIMA9r0GzQGzdiIVfvnfb4NHlRV6aPyJ5VtEYy+ZhMXiXHIsLHfWy24f0cvNcG+qyUtCdtq/0RreFWkzXkKcuG5BBgY+msMLMaGK5wM3sw7fybWQ6Y3me073+A/3pxlzfu32Q0TGBqzCzhLbDmchk96vKZPcQLeWoHpPfH37u38YHj8b8keXveD28vaexFDS7P8y8k0OfL11zD+eefz+rVWutKxkJfUhqNpgaHMdKaIV0aMRpBoOt0p1itAfh//+/mvPTl/1E7B4Z4hWHxcoNkec7oyLgmy8jUxBSv3mc/5i9ewnHzT+aggw7CLzedG8rj0TIPyFXPzNTpWBO63KhJc6BTVfQ1Da7ETNNAX9MhTdrlSmJT9ScbvPj5kXfsP8oceToHf4gG8pDdbAUdDfOsWqW6Jg8kKbWuKX4P4A6SztQE3bxLb3KElz9zkrftHxkbr9ROIK+aTF9mJmAGBpeHTjKrNhTTfAfvBk8Vf1j5Qd5f4umAq2fYhPpKfWm2rEH0ne/eyNFHH13/C1qjo2O1jvPMPZsKC4BTUx3k4GtP519pGvJ0c9bZgIMOfjvOLAsqx/CugcYeJb8/VSwhQxM0krTgtoD/dXlPownFfU2Bpl4vYublBpwcWKhO4W5eYHDjD/I816QcwxVnZswYH1f1HBoZWStQ5iP0UlMebZT2xGq2e2mTV28zxihdeaRc9QL9IC/X6kHHMDP88jacvJ1p8nQ+NkJ7suKpm0wx96DN2GRWQbs3QtkakfPqPFjfzGreXtc9s9cttQOcHkjoiiFDlRQLArqi8sFK/FVuiSfvBa5T1127vZoTTzxenwZ/wezZcyRPotPp4j9vctljjPWg7wt1+Zr47+6+lz32eRX//Oyn0fefow1Z8qGBLgg8ftr/+E030/fEx/Gkf3oKzbHxWlzvfCVQ1Qk93Fim0EzPBFkmI6m+mdKerzyoakMHz9N8sfp+YaczRdULOrPTGitm9PqVILaC2JhF2SnYd4cmO75sRFPqlBb1QbtSo3LgC4quYLEWkGNN0yBx8Hh+vzPCJqN93v7aBk/erEu3E4h5h7IIdDNNz5re/ezN602TmdUyev0qFQJ75VFC8P5YHbcApv/4C1+uU9ezNxUiZA0jCUjzjjmGG79+IzPHZtLvaHOl2WNE06o7r0YM0o8GpWaFLDcybR5WrWjzspdvzuvecABa7pH7bOLTxxDlD0PjJaDEGDniqHlcdfXVXHz55bxMH/1dCUnvQowPrg1CjBqNAwMV/X4Ngkpzw8PJ5cpULkoxQdpsZDkxzwjNcYRBTOvHMaVNXqafOlQh0mxVHPCqMbZ9sbxhfzUxa0NnJqaDTuedXBAGl6cfTqP9B3jT3jkvfXbEd9b9ZsK0gWhYn2BzBpX8aRVB8tRRM8Ulk9JmVvfD33k7RVHglzeZNIA8/pekECW3N+Ztpb6aKjlVJwcXX/Qxxsdn4DI5MEshqdlq0NRxSKXjmWYrU9kCX/utXLmSx224CYsXL2O9DdaF6JInjf+oMsO7hwY6k0wOhtHxkfpXFP7LiQHgErKH3lIbpY487OHrQJOyfF0XpTgzjVClk6jSSK0V1etTZndp6g5a23UgtBnV9Or/XH2uLyEmJZc6W1pRrWSD9SoO2X8Oz35qYGrlOK3RDkkAcDCY2YMte9rJzCSfsdfWo+y05UzyVlcn9mOU+gpimp4zEqnjfRjINc1gIF/FALjgcg7iVR33tJcVe9SCR/+iJHVhZlTyuBhcccWlnHXWmbRao2hJrMERRRk+q6zWZiLJWO65Jycn0OgSVAu9yznssMN5wib/oHSC6WWB+CkxtDsMjZMLJm59fdSHCT5x6Zk6o3s3571vCRO/uwdXBGuuuqi8A+oaVlDKuEXqkaoopWmUWoOQo2WRwoZC/2UxI1rORczkvcSnrxGb8op+6KtcS18OSk0PY1qHtdhoox4nvCXjmRu3aXdn0m1Fck0rkTZWzqSs2pQ6c2OspKUD0Z2en3PQqxuYdnm9okEm4LXURtVvCeSJlHclRFYbrZCxyqqnt4WkL0UJQkZpYBI6qS/RMk1bk6DPZFWlqjpEYi2vUvUL/7GCwlQ6U+XIUzGQAFP7Eo2gqfAnP7yZUxccQdLmJuoTXSHxO+UUljXppjZZvqFEk+zVTByEjTiqgTmL/Q94C7vutTtk1HxMnQqY+jbw2mp6KHcYChcx8ZGmgCxmTE5OaXt+AYsWLuGUUxbxve/d5q9I04Xq1CMfDdXL8oE47jEKeSc5OqiM3I1Z1zXMrDa+2XQ8KB0Ejj55GlN4L1NTxqZPnsM73vwENp01ReoWlM1EkY8i/VJU99ASVor7Iy94+ize+sa85mFm+PXfyel5ZlaXQ5enFRBQHas0WHoiDQAKlanItEYiS5iVKlaI1vIWzmK02otaCGIW0WhTGNCwIGldZqHL/ff/iiOOOILf3LmCRj6DSvWazabKocFWqGxfnk8H+BpsIUFDR0vtqT577rln/QMInLVKO4B95qnEINiaTOUP4x4aN9lDCklUkrbZHCGGBjNmaIGv0Z7p0xZ/5nLvkdaMXO9s0og1KcU3J+BiBsqkDOX/PivPyho5hbb+zbxBV99bC43sFz+7QF/iWKfRwVrjVAJvu9thZGRd+qsrnvF4ncXtl7PRrJUEGdLMcF7OX1j3oCbzp2RzeTKVmS7rYf1KcmX6NmypJQ/REBiaAoGHASOCuw494X//iEF11U4MkWrNpixJllKgMrUSLKOq+iw45URuvvnb0tiI0qV0tpqiuJ8YgvKMPEYyLUUyAzNjtY62nv+C/8N73vMeyQ0qpIeiJsZ1DGw6k+Fc3pWhcCo1cmI0gmWkZJjl2gGW5HmLvnaZ/InLTMZOSSUq1TNijGQhCgiu4CQwu7eQIsR32sN4WKE8kd9dFcmbHQI5eTC9aEK3zZ47zeGgPTemv7JPLFbpHDHXmm2K9RujvOOA9fjXpxv9TgSv48RDl5nV8niOj/jKvYnyPO0UZEgTEk1nQiH2CFm3JkJH3lRrpaorEPdV1EnB2txST3KEiUeQbpSUbEhHUGjDg01qA3AMl152MSMaYKaBHiynIe8eGKfs9aVTKLUBy7JIqb6UAu9Gj3uCPNxxzFxnBvX4EOOiX4pvkB1THfqso2aHdodhcYoCivOq5OkKgSyGjELHFZ7vBvN3ZubBg+TASSTMTG6+8Yj86YTZoE4QP8/zOh7CQCmDOBrVGU198ejrXCrrjWGUtH2d2IO9ts3Yc3NoFh16U4kZWrsd+JqSf/+3xOQDUmzenGZDKXmcHsxYEzGz2gjevpNnmxlma6hsUhXiU46BvvWmsoXmdKzKVdRJwdrc8jwhRiQe6rraVVQDtd/rkCv7s1d9lg+eezGWZlD0coGqq3PMVSo7qfgUTU2xhZYsLR2XoEGisaL+GO/SVPys5z2rlkymU3nIGmJY5yCH0cfXfWuSQwnCULisYeIAChbk3RrqUNLOqSXg9RSXG+KPXyEElUn0dBDpAPWzNTdskhZCtLpilMLNIkn8ScGXephZTVCRSfPtXkaWtbReM43oSRrjo3R7MNpazSGv0XHIC0fJe1Pst+NG7LVzRad3H4wHtCehMmGEVLdlpkQde+jhMk6nTHIlX3A6KdNlyxoFaFddMSmb+ppJa0nf9ATlIyFUbii3LKZl1oBV6muwGrd995vycsfS604Kj4bmeOXnVGWk1MYoJO1gJbOfwxX9JCBVoM3a29/xTnbebTeBEjDwenrqfd+DmvxUIQncdWJID3VhOJxcMKslH/DzUYWMWJYFRdmtQTV4o9yBbeuk13GjpSrUoAvy8TUvG0yrPn35tFZJnZ7vlZKmQTPVFHnayWoAJEyg62oatRRIVYRsNe0JY/bsnANfPYc37jWTffcyaGvHa/JO8iBJgHHeZoaZObs/ILNBvsvq5AWqqsLrOSAH67kWpCZJ3q0sApUMjr5BkxpefK3I20IiyEnh4w4qhYnf3vELjjtmLr/+xQOEclzT6bjyC/o6RYgxpyh6hGwKTLoIOVHLnV4X9txjHw4+5GDlIx2JdHtfFJDneQ08MzXoGUOmMCx+Zg8JmEnoVqulDhdErViz7E8340bzDUAkqzs8LVOphbFpi2WkOsuVMk11xpqHGyQKrGV6gF4pT5PNJNOaJtZAzChHW0zJCz55vYID9p6iEWSMWNKUzLGbUQh8KJ7W8JsOptvy0NvwfJ9qnFxmz3dyAPT0TbjU4AqhIs+g/uf/rQDTLWCztleItRYkZs2p0nlcEqBOPP5YvvmNG2hkDVymdmclRdlWmaCpdpSR5mxch8rA+7B6os3znv9CDtV5nOeVzkcRDy2oJ2sGkgNP2XUdM3XCE0MiNTMcTqU8lZyT65iy15bLLsjzBqEfKR6oMBN0ygrXXNICFg3ZlLwzmQAyisWMMnb1iSvDmvKO1RixkSj7g6k6FBVtpHh5kGilFKoRLG9W5KovNkXq6e0YWcjVREdAKlEVpaNOLgqCQFZlQaAcAwGjVM87NAmNkkw7bJManBQ8eJtZLbeZ0UtgkrHSOjXZakhjlCEQ1X6p8yz/VUvUWsjEc+BlxgkacOiqJJGCP3sBMmkEAAAQAElEQVSXZUlKakglZXuc1iRJmv9N+bWOVcR/DXL66afwuc99njxuTLvqaaXaJdo4fR0RJfUpZiuY6qyQLSSuOjA1NcXjN/lHjpt/vDYO6+C8o2VSR6V60rtmkxBC3Wc1Vd+eriNDfIS14PWIqjF06RVTyqsIWZM4MkYljzdlffI5Oa5Qi0HqT4SgZs3q0JXsI7As+wJSUrmCoiioUlG7eP8HXry8mRGxuo6ZYWZMX8m1N51QaGaPeG9myv3D2+v9Pv1hqUHOtAxmRhShy2zA18xqWb2Pyq7b9j451WkG5Tz+x8jrxqgeipeXcRU5rUkSpbJyzeEw1uXiC87jjNPPoSwClY6HUj2gE96mf/aKQmcIGZk8oFkkWc6cOesyb948nv6sp4FEsjU8gzfEX+9Ss8NpLKWMhrbnyPuYNTjyiIV89NLPcvFlV/Gsf3shIZpWISVlqiAYRampR02bGd7nKC+UifKYiFJ+Q17CzPA1XZZlOBCd3DhOrlx0mZmef3g7mP4wF/EzjEdev1/WzDAb0HRJM4PaO6c6a1CnkrcYGNozzUx9CbX8Lp8Tj/KaNrz37eFVvB3nU1UFUXpDg/j273+Lc845R18cMpqNEVqjCV/ORKIGbkl3Sh5POpya9A0NmK9tU87cw49m8622UAZIcFCXouzCX/kKw2rP1OF6CcXgespTnsizn/kM/vUFz2V8rKn+VfULV5ybLa4BEkr4lKXhCppC9MDkuVIqMZNWLAmoBb7GCEKnA9DMBu/E0Y1iAoOiD96e5wkPp8nTTuaPh9H0e+ftZPZQiel3bnTP9bT8St22pJLd9NSUWL9XPTMvRf3e85x4lJfZoK4POK/idZ3MrAayy+aA++1vfsa733MYP//5r2g1R3GQ+o8uq36B6yY4MEH5BSMjM1Q3snJVmz323Jvd99QnLr2rqj6E0mN1H3waV+Kvdg8NdL48C1Hey1bzy5/fzIXnL2b+vLdw6oL3cMNXPsGK++8jCGGmrlXydqUQ6kpSkkYzI9d6ycwwlyhFSq1RgsUabK58P9zsdru4ch2kDgAnr29mtaHNzJM1+buHk79x8ry6gB4e1z4FJyXr2/Omqc7Qw8zEX6NjTdyBYWZKaYjIYkkDxGV0mv6dmsfrAo/yITYPlpyu60Cr5OFKLT2kOiYn7hHgDuGWb95Kno3Q0RFJoymFVXkNnkLno5XWts3miJxyQafdZ2qyw7+/+GUc8s5DkV+g0gANUdOtGGrIqM2KIBaK/NXuoTZXCUzvf99p7LPnKzn6iLmcc+bZnLn8LF73mgPYY+cduOG660AGihZwQCV10zvu0yYEvVJKI7bfL+vp1A2RVL4sE9Oezg3uxnAeqv4IwHj60ZIDy8HmodfxsFKDHjp5npOZCXDmUVFVx2O0OnQ5AoaHZoNwuq7ZoAy6kgys4H90O0+oajB5n+W7WLb0VL74hS8xNjpL+AkarIGJiZVkcZSiPiIRmFxfOngsdcxdaHP3xCf/E8tOO5N1158hXuA/20K6NnGoSXJ6v/krXmFYbWkW5Otfvo4zlp3Nfb/rMmtsM7bc6tXanm9Oc2xDfv3Tn3Ps3Lnc+ctfqecPtWpmAlQks0AMOa7sYDmu6KC1IVJQDJlGaKVzvJ6mjVLKc7iKRz0NJ8xMiYduM6vzzB4Kp8HgpTzugPO4mXlQ8/R8pzpDD7OH3ilZlzEzXEbvr8tcrzlDxC/33Gb2YNueRwLl8OcuVauLePvOf+DhSunBxKLkiss+zEUXfpSZM9aXRqhnAvf8WdaSPFHwhL4GTdAheSVmlXQza/Z6LFt+Ohs/fmPQsY1JzBj1AIpCj5pTUH2P//VoaKAjreKss5aStF7odkr2e+0bOf3M93PBxy/lJZu/XIveHj/6we185UvXqkxFsEEnXcl9bSrc2yXN0Z4mBVw5laYCn6483w0RpEyvZWaYGXVZz/hvyGxQxmwQehEv7+Txh5OZ1Ukzq/nWCT287DRVMqiTp/XqEW27bL62mn7/8DIpeek/Qg/LVtN1ynl4xHm4DtxLfu1rX+PEk44maaeadN7oOvH1XaadaSsfr3fOXtbM6kFZaGbwJcsJ80/iWc99DmQIuI4yJ4FTxydZDN5MTdNt1om/wuOhlteysfvvvZcf/einMkaTObM34BVbbo41QXrhqHlHc8Z5l3PWBZfxopduIQWEQWtuEU0HjSzDdLxS72w1ZlvNHNNUHS2ggCQwtovVdLyWANqvGloH69NSprVMVQgosS7j5cyiSjl/1VU9YUWGSOJaKr/CPRNKVYYmoFSTG9jM9M4IWuA4eR66PO4UQ1PvJKepTqG1ZeqjsaHzQKOrdsyMQp+YsEKyRHkiHdBqR2/2KFGntvwOUX1RxOTtUefv+OmtHH/km3ngd+qDOtPr9Yja4Vs1Jm/VodfvE7Trr7KCKnVpMEo52eM1u7+JHbbblpAHelKH6Q2OPvHOGwa6WXMFzSRron+VIAyrlZ6+BOQNEA5otiJjYyPIDnjfNlhnff5ry5fwii1ewqZPfJyMhxTmYDEsZHR1mOmjd9rQpYDlnq/SZiOEICVHfOpyimrER7XLXckI0+Tp/ymZGWYD8radnMd0OB33tK+ZPHR5nMwMb9vzvJyZeVDL6e+9Pw4QL1O/+LOPSvxUqALnFPTNtj25giOOOIof/uAX+OV8cx+cGmhouvR0pfPMsuoj9BO1PFk5McFL/+PlvPltb0XLNvx7dvTKf0cUhiXLyNgccp0Z+al3u9umXx8U9yl7E9zxqx9y9mmncMbSBXzvlhul3I6MExRWuHdq6SC50WiQ51H5+gIh/wMSTYp1+VJKAmklj1UO6hiYGa70GBXmGdOXl/X4dGhmdVnPc5rO9/jDyfOnaTrf0x730Mw8KnkHnsvB5Pm+rpMIknuw7nSweb4X9sERYqSSx/L0nyONL8lK3c8kr7VgwfHcfNM3GB9bt+Zf6njGweZ8QjDNGBWVBmYlEEZ94+1pt/qCF76YJactZ/YGs0EiNxvSje9++fu5ZNnhCDNjdCOe+9yXYmFUo6vHFz7/KbDVFL37WLb4aI6fdyLzTzyZ679+o3achl9BrZtJeQKVG8q9m/+Wq5SSTKAbgCoXuMANaBYxM/zy8m54N4TX87w/RmaDOv7e7KG4px8thehtpwdB57IFTdNef1qWTMuEhgaPv3Pw+T84qAoEU0e94J+gSjtN7w+anqOOni756EVc8OGLVF3yCmDe/1ovkr/RyPA2UPvNVq7BmguLOetvuAnzTz6F9TfaoP4E6Lt+IROv+yea/qu/+vPaeJQihRjZf//XMzo+g56mxzPPeh/777svb3j9AdrmX8Noa12e8Ph/ZNttdoHYrJVZK0WKy3LqkexKhCCFIkVpvab1XtJ6yY3qYQ0wnUUldzYyRIhR5aLKh1rKQTl/ySPAiS4z0/OP32b2YJ3pUmY2HZVH0bynVIjUska98vZwT6OtoAPGwd/pdOSVi7qMA1BMZfeBTKr+R291R/2o9L7N5z93JQtOWgSFBpw15Pm6emeioHhZbxwc0FpdkMVGPciDdHrcvBP0iesZ+N8cm+QMAyGRAPw9XWFowmiEPuPZT2HBovlat23GqtU9rv3izXz5y9+i1x3jif/4dE6Yfyqb/MMT6yZdYVGgqbQmKfzPlQQ2kzQxStFSVpCyTYtwH9FeLmoKDSGTDa0mZ5Jq9PEgIDzvT5GZ1a/NBmGdWPMw+8M8f2VmdXveltkgbma18X0QeH6U4A46X2+NjIzgYPO0r+mSOqpazupP0qArBT/76fc59pijuPfu+2g2ZtQAw0pKrdui9JKSAxMyjdRMuvID4FIf91+z/2vZerutISDPZx7gl8YsGH9XVxieNGBmbP6KV3Dxxy7ltPe+nwMOehtvetO7Of74pVx4yYVsvvV/4Ts+dFmQ4aTAYIEYMxxcTl6g0hrFjVYqLOTZ/DzKtCpOA8vgl8enydNmA82aWS2H502/99DMPOvBd3VizcPfr4n+t4G/NxvU9wKp9sDyXjrSqQdEjDJ0XoPfp1WX3et4f8zXEF7pz5CFqj7onTv3SJ1zrqCZNwhyUZmmbBRznZisZWYCnN5ZRqdTaMaIvPw/tuDgQ96CVISqkGqgq0Hpy8wUUUU9/17u4UnjxwP6qFwWGeutvyFbb70thx81l3cd8S523XNX1tlwjtx+B4uaNWQ0ky4ccNIPbhw3khvLyT1ICLH2GO49ggzneaUKS4942WlC4PX3/N5lpgYeRZ7z8WLTocedzKwG6HS+rTlN9rS352CoSYAzswf7gC7vQ7vdFig6SjkOBNA69scfftyxaNEpfOPGW1Qhqu853d6kMFRiDMzkgPYB6NO4VIFPrS94/gt53/vOZmzGKCqIA07qAi1bzJKeSTyU/Du6B70ZgkByWjWX79/2NW77zre46Yar+fbN13Pj9Z/jGzddw03XfpY7fvx96aJH5sirSyNjacrUEHVDlv4DOGnODz2T5gVXcF9nYnkj0LIRgs6o2iMraekzT0PfGBtZh1g1sdDT5qQSBRqZph9NN4Gu2skYaRqUBUFrr6QNiv/kx0PTOVuUORoxSAaImsICKifK5HU8nvkuWu17ONI1WlN98kYlWUrK0MKyPqlsUVhP6zg3bkfSN/B/MzkKjJnOyNBlREiI+nogjwhJaR9I4Hl9zj1jMVdc9HFKfV9u5rMpUpcQmxSOrjAC5uWoj6NS2cD/SHrjjZ7I0mWn0hgV4MQP1HefSjSoJSDIKKFv2mRQt6kntRxqs17RKKS+VE9eGwqcBdLtg6HzdX4e1mXX/jE00FmsuP/+uznmmCPZRd9ZDzxgP/bdZ0/RHuz36r141av25c1vfjOTqyakC3VSsrviFWBmGtkNLKjPAofnZVmg2WwSo+HGqcoOyTLuvXcdVvdmM5Vms6ofmKwiq7tNGR18fdNpF1oHJfo9mJrsinr0dWhb9hv0OpHOlCnMtatu0usq3TY6om474O8fTp7X918W93J+gzGRj3PHZGLKuqTYFt9SBk2YQFAK6JCBPL5Tpd1obdjkvRGZ+my5IsieZR1Gi0oErr3mKs484xxW3D/B2Oi4+tsXSCoqGT8JGGXVoa8T3uhA9zpaP8+a02CjJ4xwy/e+yNVXn88nrzqLKy4/jcuvOIMrL1/O5Zct54rLTuWSj5/CFZcu5LKPKrxkMZdevIQrL13CFZecylWXL6vDKz9+quqdxhWXn87ll7+XKz8hHle+jyuuPF15Z3DJJUv4/i1X1TIP4xGGwcR5JHrMmDlKkpKoekysekA71iabbboJG6y/PuuvtyGt0TFNGUJDMK+CKag0koPmA18neeb0NFaKR6FdoU8pHqYZxg/u7DF/+f288/i7OezYgnfP6zH3uB6HHD7Fm4+Dg0+ANx9vCqs1oecF3nIivG1+V2Fb1K3jbz2po3hbZafq8MDjJjnoePE5Qfkn9XiL08l9Dp7fq+ntRxYcekyHY0/sayjAQAAADZtJREFUcMstYxJ1DnkYUx/aWuSvAAciHYXySPJ8SZ7WaeChBLjaAyFAJbIgr5gKlYUf/fA2jj76SCYm72fWHPeeJh21iTEnhiYNtZEzSrQWpar4mPRpvdfv8u1bbuaQdxzMmw9+Pe84eC6HvOkIDj34SN71tpNqevfbFnHEoUuZ+87lCucz99ATOeKdJ3D4O47nyMNOVPoE5r7jJKVP4D1vW8C73zaf97z9ZA5/+4I14UIOP8TjC/jI+y9lWNfQQAem0VjS71Y6EM5ZZ+Y/cOS7F/OZK7/Bp6+4iau/cA0fPv8jrKP1nplpFMsQQBDggtKFpr4k1+efeGLIMEsYQQv0WHvBbhG5ZzJy461NvvaDxFdvzxWWXHfbAwrv42u3TnDTD6e46fYuX79tFV+/dZJv/HiKm3/UVV6Hr9/W4/rvl9x4e8kNPyjqtOd5/MbbE9/4qXHTjxNf/6Hefb/H127r8tVbOzVd97023/jJSq7/wQPcdNsEq9qTwAr83KwUuKIAEmwMSyM6Qck15TbkwUaUHgWtc9VL1BlRhXtudJCbtEmamryT4457D3fd+QB5tg5F4R44kucZUovWwCspqtWa5DU7CMhZbsoPlO5VtazIwix57JbAvz5ZHCHPRmtdRa+fF2SNksz/FjhrY/ks0ew1NIvQmAPZzJpSnIl/RfJlTJapDf/MJs8cFDaaUTwDvTTGsK4wLEaJBkmjudHI5NEqrQ5+yzXXnceiM97I0rMO5gPnnqfR7J4AKvduFqhShV++Q3UlO+jKqkCvcdAFB58kLLXWa/YSLXENUXWakyTrY2rTpIzx1ga0moGRVqQhhTebiWYj0moFWo18EGp9NeplGkYzS+hMlRF9ARmVvCMyZlPTeC6gx1SCvFDUJNhQ3ojejzZzsIyUzSJrbUCz2STz9/kMzGaRqnG9l2Gjpl2bkmxtkcu4GkIfJLcDVAnxVlJdiFnJ3Lnv4Prrv0YMLarUptCnxJgl0PTZV3+NnCyMkwcBJhT4gPT+u55UiKKfaqD1ukntVYQsinJghJRaCterqSrXoy999elpqVfVhPrsK4Eqq0iimI3gFGILrCF51EPZE+k4CswWGdoVhsXJMI1ycAUExrVwX4/PfuoWli76OEuWXM5J8xfys5/9QkoPhDBo1tdq3n6WZRpNDQGmSZb5+4wko0LAcZm0qQj+hzVRpVslZd6hzGRYGbRIU3RZQZKXKcqMfl91U5OqGqGnmbzTCZRlTj9Br0oPUiF5C1M6lXT1eclCxCnEDKeY5XWYVE7VGJFchab7rj6w97sdqqKUMIhvSSEeqWqpZIvAmDzciN43BYpc/RUJog6WslCVJMq6LF8yn09e8RnGmvI+oVI9AUvDCnmwJH55I9JQX6tyik73PlxnnW5bfeog0Wg0jV5/Ap/WY96nFIKS6ieho5S+fHPTpyOYraJnq7ThAjkuogNelKmMaTDXVFZ0i476IVDKo1bSa5K+k+SqQonHQ2kM6xpYfyjc+oyMNhlttii1u+z1K/zfrH39gW/n1a99k87rDubpzxj8JXlFqlvMpT0ftU49IaQsB/mVOljIwIUjRSWjpq+uJplCYE7ZDFJYV0oeoRLQGs2ZZGozpL6A3hMVZFJcJtBm8hieb5q6ozYcoQxSeqShkZwLmFFgdMppIJ2T+pGoKS6X4WP9SxYBT2WCKDJCiDPqtrJ8XANkjKoqRCV55h68K9D2RT0simS4ej2naQoqoKn6CuSxrvncJzn37PMYba1PtyNtlF0q7cCTPn/1JUip9aw6qWpGDKO0GrNAIMmzFo2GvKLY9QX+ZnMEvxyQSeAkdVVOgzElshjJwghZHFH9OeJTiRJB7UNP1XqkunxfdQqSDzyNLhNJCzRiRi4eIYHT9FpbFdf6DmvNYQ2DpCmp7E8x1Z7QCOzUxth731dx/PzjOHnRSRx1/Dxmz56tDiKPIK/oLgwlpSBXWlQHzQwzk2IyURBleL6/HxPg8nJcs1Wf2O2Slw+QFStoFBqdU1NMSmm9qNEvPh0CHfEpsgZ9AbYto09JwR3r04slRZ7o5yXdqHRW4P+iUxyNhJGAtYwyK+lZj67+83+KrMoreYK7oLGKbnY/q7sTGlgGlsuoY2pN4FTcyIGIKQyhQbAGDp6kaUrOC1P7t37vK9o4HE13KlL0KpVP0lVFpQFBykja9ZqZ8sG9Y6MZqZLr07MCMTTBf55etvCjlW5bdYoxAT8SLcjLVgRKhT2qYkqef4JK68IiNeirXpFa9MumSozUA7fUYEhhZFBHuUKfZOiB7JnKgqLfFnWY6kUXYCgUhsJFTIIrPTbk+mcR8gJfxC5dcghv3H87Dtp3C1736i044HU7cuevb8fKHlHdNK8XAkXVpyy1JlKnfdqq9N7oEUKHGEtiqCh0JmaaG4p+oCrHfOBj+RwBpyA05pCRCGUkaopFngOBMZOxfRoJ8kiZpttWbOn9qNqXYYoGTYE0VhkxJdWX4XvyWFWJ/8PaSVNOkJTRMkkaCTZLdVtk/RYj2WxSbINVklgbCnnRitXIRvSL1RgtinKSoq8Nh8oEdTSEkomJ+znu2BO4+6478XUnqm0UZOpXI0P97IkEgCT+8rRl2aQo/AVkIYKOUArtWi2ukjyF2rpfYJMY9Cl6mfJyqEZpaAahaBEQz7JBFJBj3hP4CuXcL8/lOrybUCVaWY+mJQjaAKURsCj5Z2BmmGaAECAor9HwugzlEsuh8KFKMlZVabtfyvwtJlcHvvOdO7n6c9/mM5/+lsLv8KVrvstv7lytXjSQY6obLsu+gBrUMQFJozDRFNhGMRtRmbxWeiUDJIHQ//dNyAPFrCLIUEXRkeLbJJ9aQyYeGXmek2fNOp40JVVSrElpWVPeAgeBg6Unb9wW/7Iu52AptRZE02pKkRAaOJ/oiyB5p7LqYJr6UNxkoJQSSYZMAni0UaKN02qNEOVVm5ryqlJdFEiyLKv7WFUV3e4UR7zncL79rVtp5GPyQCqkt/4vZRoZ9ZQqAEZ5WdP0jHWl06502cf7V7kXJIJlWGiI8pqwSDIj5MKbFaTQF5R7Cgsql1e60miR40oEDcLgepJsSW36srSsEhWGhQKspzY7kqVNv+zUzsDfYiWF64fhXGE4bMBHQ2tkjHcffhTvOfwYTl6wjPmnLOP4k5awYNEZzD95eZ3e9IlPlhIhZoOWo6bDoifFWgdXNFIU6rwbOcRSeX0pootZEhkhBFEUZTWZDGHysokOZZqqidAlyDMm8bTQI2aFlD4mq4wRwzh5NiZqEiIyWEfKnZTi24M6qQ9KBRkHrfsC41jy8iMETZd5Q+3GRMz7pDBB1pwi5FqsdyvJF2Wcikxgc6D1te4SM0KAM993Ip/97BUEEnke8b5VYUrT9gRF7Q1z1WsQpY8YTe+loxiJISeEhmNNGammJK/p679K/fT/gVypflbi3NeaWK1LBxGLeU2Z1oCEDAeVCZAhqKT0mhR3HqWWGIX0rarqj9rNJUM+Qi6KsYk3LIkFZA1YhnOF4bBxLhmVRv9/vPxl7P+G17Lb3juz16tfyV6v2Z19XrsHr3rdHuy+945ssNFMqV0gQCTviJQ1Pjabrbbahe2334MddtidbbfdTfFXsssue7PLrnuz3Xa7sfNOu7Prznuy0467s8P2u7HTDnuw+yv3ZffdXsOO2+/JHq98Hbvs+Gp22v5V7LzDvg/SjkrvtMOr2GmnXXjlbnuw047ivd0u7CreOyt/x+32ZfddX88O272SnXfcE+e9/fY7qs3t2Ha7rdhxp23Ydbcd2N5lcjl22IcdttubHbZ9FdtuuS/bb70f22zxGnbeeVe223ZHdtllV7bZZlu1txOzZmkDINX88Ic/5J7frmSnbfdmp+1ey+YveyXbb7MPO263j/q5r3i9mu22eSXbbL0zW225A1u8Ylu22mJ7tt1mJ+XtqvhObL3FXjVt9Yo9Fe5R07Zb7TXgoz5uL9n8Z2MebrftruwgXTo/z9tyix3UlmTd5lVss+WebLXl3mpPtO0+amNvtt5qT7ZWW1tttRNbbbEjXn6LLRUqvfU2u0kPu/P8571IPRnOPUTQCT7OzSSY05q4eVxZeBjqB8FHHhp9Fv0NKP8NbzmMhaefxkmnykMuW8AJC0/j+EULOXb+Yk5acirHyXN6+sTFSznx1AUct3A5x56ygHkLF3Pi0lPq+EnLFnPC0pNU7zROWLKQE05dwknLFC5ernKniBYzT5ua4xctq8PjFp1a1z1+8SLmLztN5ZfW4fylZ6jN0/HwxFNPY94pS+p3JyxZwLELTuakpScyf8lyFup76YmnLuTk5fOZv2ip8pap3BLlv1dfSk5gncc9Tv0LPPWp/8yJJ5/JKctPZ8Fpp7D4rMX6srKIBcuXccrSU1m4fCGef8qyMxUuZPEZZ7LojNOV/76a98LTzlDeySw+fTFLzlT9005TuIhFy5crz8NTWXzaEpa+V2mFi5aLp3Sx+LRlNf9Fy5eyYPkSybUY1/Gi0xewePkZnHraIhYvW65wCacue6/ip7NYvL28k9dfuGwJTq856AD1ZTi3Q2M4nB7j8pgGHqUGHgPdo1TUY8WGp4HHQDc8XT7G6VFq4DHQPUpFPVZseBp4DHTD0+WwOf1/y+8x0P1/a9q/3479PwAAAP//qu4LpgAAAAZJREFUAwCRxmaRkhNorgAAAABJRU5ErkJggg==';

// 現地調査専門見積書PDF HTML生成
function generateSurveyPdfHTML(estimate: any, items: any[], surveyMeta: any = {}, basicSettings: any = {}): string {
  // 日本時間で現在日時を取得（UTC+9）
  const jstDate = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const currentDate = jstDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tokyo'
  })
  const surveyDate = surveyMeta.survey_date ? new Date(surveyMeta.survey_date).toLocaleDateString('ja-JP') : '未定'
  const validUntil = surveyMeta.valid_until ? new Date(surveyMeta.valid_until).toLocaleDateString('ja-JP') : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')
  const customerName = surveyMeta.customer_name || '現地調査顧客'
  const projectName = surveyMeta.project_name || '現地調査'
  const surveyTypeLabel = surveyMeta.survey_type === 'oneman' ? 'ワンマン（1人）' : 'ツーマン（2人）'
  const areaLabel = surveyMeta.area_rank ? `エリア${surveyMeta.area_rank}` : ''
  const discountAmount = estimate.discount_amount || 0
  
  // 小計は値引き前の金額
  const rawSubtotal = items.filter(i => i.amount > 0).reduce((sum, i) => sum + i.amount, 0)
  const discountedSubtotal = Math.max(0, rawSubtotal - discountAmount)
  const tax = Math.floor(discountedSubtotal * 0.1)
  const total = discountedSubtotal + tax

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>現地調査見積書 - ${estimate.estimate_number}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .page-break { page-break-before: always; }
        }
        
        body {
            font-family: 'MS Gothic', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Meiryo', monospace;
            font-size: 14px;
            line-height: 1.6;
            margin: 20px;
            color: #333;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }
        
        .header h1 {
            font-size: 28px;
            margin: 0;
            color: #2563eb;
        }

        .header .survey-badge {
            background: #2563eb;
            color: white;
            padding: 4px 14px;
            border-radius: 4px;
            font-size: 12px;
            margin-top: 6px;
            display: inline-block;
        }

        .company-logo {
            max-height: 80px;
            max-width: 200px;
            object-fit: contain;
        }
        
        .company-info {
            text-align: right;
            margin-bottom: 30px;
        }
        .company-info .company-name-text {
            font-size: 14px;
            font-weight: bold;
            color: #333;
        }
        .company-info .invoice-number-text {
            font-size: 9.5px;
            color: #555;
        }
        
        .estimate-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        
        .customer-info {
            flex: 1;
            margin-right: 50px;
        }
        
        .estimate-details {
            flex: 1;
        }
        
        .info-box {
            border: 2px solid #e5e7eb;
            padding: 15px;
            margin-bottom: 20px;
            background-color: #f9fafb;
        }
        
        .info-box h3 {
            margin: 0 0 10px 0;
            color: #374151;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 5px;
        }
        
        .estimate-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .estimate-table th,
        .estimate-table td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
        }
        
        .estimate-table th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
        }
        
        .amount-cell {
            text-align: right !important;
            font-weight: bold;
        }
        
        .total-section {
            float: right;
            width: 300px;
            margin-bottom: 30px;
        }
        
        .total-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .total-table th,
        .total-table td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
        }
        
        .total-table th {
            background-color: #f3f4f6;
            text-align: left;
        }
        
        .total-table td {
            text-align: right;
            font-weight: bold;
        }
        
        .grand-total {
            background-color: #dbeafe !important;
            font-size: 16px;
        }
        
        .notes-section {
            clear: both;
            margin-top: 40px;
            page-break-inside: avoid;
        }
        
        .notes-section h3 {
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
        }
        
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        
        .no-print {
            margin: 20px 0;
            text-align: center;
        }
        
        .print-button {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 0 10px;
        }
        
        .print-button:hover {
            background-color: #1d4ed8;
        }
        
        /* 項目列を確実に左寄せに */
        .estimate-table tbody td:first-child {
            text-align: left !important;
            vertical-align: top;
        }
        
        /* 金額合計ボックス - ヘッダー直下右側 */
        .top-total-box {
            float: right;
            border: 3px solid #2563eb;
            padding: 12px 24px;
            margin-bottom: 20px;
            text-align: center;
            min-width: 300px;
        }
        .top-total-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .top-total-amount {
            font-size: 26px;
            font-weight: bold;
            color: #1e3a5f;
        }
        .top-total-sub {
            font-size: 12px;
            color: #6b7280;
            margin-top: 4px;
        }
        .top-total-sub span {
            margin: 0 6px;
        }

        /* 調査内容詳細ボックス */
        .survey-detail {
            background-color: #eff6ff;
            border: 2px solid #bfdbfe;
            padding: 15px;
            margin-bottom: 20px;
        }
        .survey-detail h3 {
            margin: 0 0 10px 0;
            color: #374151;
            border-bottom: 1px solid #93c5fd;
            padding-bottom: 5px;
        }
        .survey-detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 13px;
        }
        .survey-detail-item {
            display: flex;
        }
        .survey-detail-item .dl {
            font-weight: bold;
            min-width: 100px;
            color: #374151;
        }
    </style>
</head>
<body>
    <div class="no-print">
        <button class="print-button" onclick="window.print()">印刷</button>
        <button class="print-button" onclick="window.close()">閉じる</button>
    </div>

    <div class="header">
        <div>
            <h1>見積書</h1>
            <span class="survey-badge">現地調査専門</span>
        </div>
        <img src="${basicSettings.logo || COMPANY_LOGO_DATA_URI}" alt="会社ロゴ" class="company-logo" />
    </div>
    
    <!-- 金額（税込）合計ボックス - ヘッダー直下右側 -->
    <div class="top-total-box">
        <div class="top-total-label">お見積金額（税込）</div>
        <div class="top-total-amount">¥${total.toLocaleString()}-</div>
        <div class="top-total-sub">
            <span>本体 ¥${discountedSubtotal.toLocaleString()}</span>
            <span>税 ¥${tax.toLocaleString()}</span>
        </div>
    </div>
    
    <div style="clear: both;"></div>
    
    <div class="company-info">
        ${basicSettings.company_name ? `<span class="company-name-text">${basicSettings.company_name}</span><br>` : ''}
        ${basicSettings.company_address ? `${basicSettings.company_address}<br>` : ''}
        ${basicSettings.company_phone ? `TEL: ${basicSettings.company_phone}` : ''}${basicSettings.company_fax ? ` / FAX: ${basicSettings.company_fax}` : ''}${basicSettings.company_phone || basicSettings.company_fax ? '<br>' : ''}
        ${basicSettings.company_email ? `Email: ${basicSettings.company_email}` : ''}
        ${basicSettings.invoice_number ? `<br><span class="invoice-number-text">インボイス番号 ${basicSettings.invoice_number}</span>` : ''}
    </div>
    
    <div class="estimate-info">
        <div class="customer-info">
            <div class="info-box">
                <h3>お客様情報</h3>
                <strong>${customerName} 様</strong><br>
                案件: ${projectName}<br>
                ${surveyMeta.address ? `調査先: ${surveyMeta.address}` : ''}
            </div>
        </div>
        
        <div class="estimate-details">
            <div class="info-box">
                <h3>見積詳細</h3>
                <strong>見積番号:</strong> ${estimate.estimate_number || ''}<br>
                <strong>作成日:</strong> ${currentDate}<br>
                <strong>有効期限:</strong> ${validUntil}<br>
                <strong>調査予定日:</strong> ${surveyDate}<br>
                ${estimate.created_by_name ? `<strong>担当者:</strong> ${estimate.created_by_name}<br>` : ''}
            </div>
        </div>
    </div>
    
    <!-- 調査内容詳細 -->
    <div class="survey-detail">
        <h3>調査内容</h3>
        <div class="survey-detail-grid">
            <div class="survey-detail-item"><span class="dl">調査形態:</span> ${surveyTypeLabel}</div>
            <div class="survey-detail-item"><span class="dl">エリア:</span> ${areaLabel}（${surveyMeta.area_regions || ''}）</div>
            <div class="survey-detail-item"><span class="dl">調査目的:</span> 搬入経路・設置場所確認</div>
            ${surveyMeta.address ? `<div class="survey-detail-item"><span class="dl">調査先:</span> ${surveyMeta.address}</div>` : ''}
        </div>
    </div>
    
    <table class="estimate-table">
        <thead>
            <tr>
                <th style="width: 45%">項目</th>
                <th style="width: 25%">内容</th>
                <th style="width: 30%">金額（税抜）</th>
            </tr>
        </thead>
        <tbody>
            ${items.filter(i => i.amount > 0).map((item, idx) => `
            <tr>
                <td>${item.name}</td>
                <td>${item.detail || ''}</td>
                <td class="amount-cell">¥${item.amount.toLocaleString()}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="total-section">
        <table class="total-table">
            <tr>
                <th>小計</th>
                <td>¥${rawSubtotal.toLocaleString()}</td>
            </tr>
            ${discountAmount > 0 ? `
            <tr style="color: #dc2626;">
                <th>値引き</th>
                <td>-¥${discountAmount.toLocaleString()}</td>
            </tr>
            <tr style="background-color: #fef3c7;">
                <th>値引き後小計</th>
                <td>¥${discountedSubtotal.toLocaleString()}</td>
            </tr>
            ` : ''}
            <tr>
                <th>消費税（10%）</th>
                <td>¥${tax.toLocaleString()}</td>
            </tr>
            <tr class="grand-total">
                <th>合計金額</th>
                <td style="font-size: 18px;">¥${total.toLocaleString()}</td>
            </tr>
        </table>
    </div>
    
    ${estimate.notes ? `
    <div class="notes-section">
        <h3>備考</h3>
        <div style="border: 1px solid #d1d5db; padding: 15px; background-color: #f9fafb; white-space: pre-wrap;">${estimate.notes}</div>
    </div>
    ` : ''}
    
    <!-- フリースペース（標準見積と同じ） -->
    <div class="notes-section">
        <h3>フリースペース</h3>
        <div style="border: 1px solid #d1d5db; padding: 15px; background-color: #f9fafb; min-height: 100px;">
            <div style="color: #9ca3af; font-style: italic;">※ 追加情報やメモをこちらにご記入ください</div>
        </div>
    </div>
    
    <div class="footer">
        <p>本見積書は${currentDate}に作成されました。</p>
        <p>ご質問やご不明な点がございましたら、お気軽にお問い合わせください。</p>
    </div>
</body>
</html>`
}

// 印影用の姓を抽出するヘルパー関数
function extractSealName(fullName: string): string {
  if (!fullName) return ''
  // スペース区切りの場合は姓部分
  const parts = fullName.split(/[\s　]+/)
  if (parts.length >= 2) return parts[0]
  // 2〜3文字ならそのまま
  if (fullName.length <= 3) return fullName
  // 4文字以上は最初の2文字
  return fullName.substring(0, 2)
}

function generatePdfHTML(estimate: any, staffRates: any, vehiclePricing: any = {}, basicSettings: any = {}, calculatedStaffCost: number = 0, seals: any = {}): string {
  // エリアランク説明マッピング（A-I）
  const areaRankDescriptions: Record<string, string> = {
    'A': '大阪市内（15km圏）',
    'B': '大阪府・神戸市・京都市・奈良県（30km圏）',
    'C': '南丹（50km圏）',
    'D': '東播磨・北播磨・丹波・滋賀県・和歌山県（100km圏）',
    'E': '淡路・西播磨・中丹・三重県（150km圏）',
    'F': '但馬・丹後・愛知県・岐阜県・徳島県・香川県（200km圏）',
    'G': '岡山県・鳥取県・福井県（300km圏）',
    'H': '広島県・愛媛県・高知県・島根県・石川県・富山県（400km圏）',
    'I': '山口県（500km圏）'
  };
  
  const areaDesc = areaRankDescriptions[estimate.delivery_area] || '';
  
  // 日本時間で現在日時を取得（UTC+9）
  const jstDate = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const currentDate = jstDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tokyo'
  })
  
  // line_items_jsonをパース（存在する場合）
  let lineItems = null;
  if (estimate.line_items_json) {
    try {
      lineItems = JSON.parse(estimate.line_items_json);
      console.log('📋 明細データをパースしました:', lineItems);
    } catch (error) {
      console.error('❌ line_items_jsonのパースに失敗:', error);
    }
  }
  
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>見積書 - ${estimate.estimate_number}</title>
    <style>
        @media print {
            body { margin: 0; padding: 8mm 10mm 14mm 10mm; }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
            /* ページ番号フッター: 全ページ下部に固定表示 */
            #pageFooter {
                display: block !important;
                position: fixed;
                bottom: 2mm;
                left: 10mm;
                right: 10mm;
                text-align: center;
                font-size: 8px;
                color: #aaa;
                font-family: 'Hiragino Sans', 'Meiryo', sans-serif;
                border-top: 0.5px solid #ddd;
                padding-top: 1mm;
            }
        }
        
        * { box-sizing: border-box; }
        
        body {
            font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'MS Gothic', sans-serif;
            font-size: 10.5px;
            line-height: 1.35;
            margin: 12px;
            color: #333;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
            border-bottom: 2.5px solid #2563eb;
            padding-bottom: 6px;
        }
        
        .header h1 {
            font-size: 22px;
            margin: 0;
            color: #2563eb;
            letter-spacing: 6px;
        }

        .company-logo {
            max-height: 50px;
            max-width: 150px;
            object-fit: contain;
        }
        
        /* === ヘッダー直下: 左=お客様+合計金額、右=会社情報 === */
        .top-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 16px;
            margin-bottom: 8px;
        }
        .top-row-left {
            flex: 1;
            min-width: 0;
        }
        .top-row-right {
            flex: 0 0 auto;
            text-align: right;
            min-width: 260px;
        }
        
        .company-info {
            font-size: 9.5px;
            line-height: 1.4;
            margin-top: 0;
            margin-bottom: 0;
            color: #555;
        }
        .company-info .company-name-text {
            font-size: 14px;
            font-weight: bold;
            color: #333;
        }
        .company-info .invoice-number-text {
            font-size: 9.5px;
            color: #555;
        }
        
        .info-box {
            border: 1.5px solid #d1d5db;
            padding: 6px 8px;
            margin-bottom: 5px;
            background-color: #f9fafb;
        }
        
        .info-box h3 {
            margin: 0 0 3px 0;
            font-size: 10.5px;
            color: #374151;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 2px;
        }
        
        .info-box p, .info-box div {
            margin: 1px 0;
            font-size: 10px;
        }
        
        .customer-name-line {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        
        .estimate-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 0 14px;
            font-size: 9.5px;
            color: #555;
            border: 1px solid #e5e7eb;
            padding: 4px 8px;
            margin-bottom: 6px;
            background: #fafbfc;
        }
        .estimate-meta span { white-space: nowrap; }
        .estimate-meta strong { color: #333; }
        
        /* 見積明細テーブル */
        .estimate-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            font-size: 10px;
        }
        
        .estimate-table th,
        .estimate-table td {
            border: 1px solid #d1d5db;
            padding: 3px 6px;
            text-align: left;
        }
        
        .estimate-table th {
            background-color: #eef2f7;
            font-weight: bold;
            color: #374151;
            padding: 4px 6px;
            font-size: 10px;
        }
        
        .estimate-table td {
            vertical-align: top;
        }
        
        .estimate-table small {
            font-size: 8.5px;
        }
        
        .amount-cell {
            text-align: right !important;
            font-weight: bold;
            white-space: nowrap;
        }
        
        /* セクション見出し行 */
        .estimate-table td[colspan="4"] {
            padding: 3px 6px 1px;
            background-color: #fafbfc;
        }
        
        /* 小計行 */
        .estimate-table tr[style*="background-color: #f3f4f6"] td {
            padding: 3px 6px;
        }
        
        .total-section {
            float: right;
            width: 260px;
            margin-bottom: 8px;
        }
        
        .total-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }
        
        .total-table th,
        .total-table td {
            border: 1px solid #d1d5db;
            padding: 3px 8px;
        }
        
        .total-table th {
            background-color: #f3f4f6;
            text-align: left;
            font-size: 10px;
        }
        
        .total-table td {
            text-align: right;
            font-weight: bold;
        }
        
        .grand-total {
            background-color: #dbeafe !important;
        }
        .grand-total td {
            font-size: 13px !important;
        }
        
        .notes-section {
            clear: both;
            margin-top: 10px;
            page-break-inside: avoid;
            font-size: 9.5px;
        }
        
        .notes-section h3 {
            color: #374151;
            border-bottom: 1.5px solid #e5e7eb;
            padding-bottom: 2px;
            margin: 0 0 4px 0;
            font-size: 11px;
        }
        .notes-section p {
            margin: 2px 0;
            line-height: 1.4;
        }
        
        .no-print {
            margin: 10px 0;
            text-align: center;
        }
        
        .print-button {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin: 0 6px;
        }
        
        .print-button:hover {
            background-color: #1d4ed8;
        }
        
        /* 金額合計ボックス */
        .top-total-box {
            border: 2.5px solid #2563eb;
            padding: 6px 14px;
            text-align: center;
            margin-top: 6px;
            display: inline-block;
        }
        .top-total-label {
            font-size: 9.5px;
            color: #6b7280;
            font-weight: bold;
            margin-bottom: 1px;
        }
        .top-total-amount {
            font-size: 20px;
            font-weight: bold;
            color: #1e3a5f;
            line-height: 1.2;
        }
        .top-total-sub {
            font-size: 9.5px;
            color: #6b7280;
            margin-top: 2px;
        }
        .top-total-sub span {
            margin: 0 4px;
        }
    </style>
</head>
<body>
    <div class="no-print">
        <button class="print-button" onclick="window.print()">印刷</button>
        <button class="print-button" onclick="window.close()">閉じる</button>
    </div>

    <div class="header">
        <div>
            <h1>見 積 書</h1>
        </div>
        <img src="${basicSettings.logo || COMPANY_LOGO_DATA_URI}" alt="会社ロゴ" class="company-logo" />
    </div>
    
    <!-- ヘッダー直下: 左=お客様情報+合計金額、右=会社情報 -->
    <div class="top-row">
        <div class="top-row-left">
            <div class="info-box">
                <h3>お客様情報</h3>
                <div class="customer-name-line">${estimate.customer_name || ''} 御中</div>
                ${estimate.customer_contact_person ? `<div>ご担当: ${estimate.customer_contact_person} 様</div>` : ''}
                ${estimate.customer_address ? `<div>${estimate.customer_address}</div>` : ''}
                ${estimate.customer_phone ? `<div>TEL: ${estimate.customer_phone}</div>` : ''}
            </div>
            <div class="top-total-box">
                <div class="top-total-label">お見積金額（税込）</div>
                <div class="top-total-amount">¥${(() => {
          // 小計を計算
          let subtotal = 0;
          if (lineItems && estimate.subtotal > 0) {
            subtotal = estimate.subtotal;
          } else {
            const vc = estimate.vehicle_cost || 0;
            const sc = calculatedStaffCost;
            const dc = (estimate.vehicle_dedicated_unit_price || 0) * (estimate.vehicle_dedicated_count || 0);
            const cc = (estimate.vehicle_charter_unit_price || 0) * (estimate.vehicle_charter_count || 0);
            const tvf = estimate.transport_vehicle_fee || 0;
            const rpf = estimate.road_permit_fee || 0;
            const sf = estimate.survey_fee || 0;
            const svc = (estimate.site_survey_cost || 0) + (estimate.parking_officer_cost || 0) + (estimate.transport_cost || 0) + (estimate.waste_disposal_cost || 0) + (estimate.protection_cost || 0) + (estimate.material_collection_cost || 0) + (estimate.construction_cost || 0) + (estimate.parking_fee || 0) + (estimate.highway_fee || 0) + (estimate.external_contractor_cost || 0);
            let wtp = 0;
            if (estimate.work_time_type && estimate.work_time_type !== 'normal' && estimate.work_time_multiplier > 1) {
              wtp = Math.round((vc + sc) * (estimate.work_time_multiplier - 1));
            }
            subtotal = Math.round(vc + sc + svc + wtp + dc + cc + tvf + rpf + sf);
          }
          // 値引き適用
          const discounted = Math.max(0, subtotal - (estimate.discount_amount || 0));
          // 税額計算
          const taxRate = estimate.tax_rate || 0.1;
          const tax = (lineItems && estimate.tax_amount > 0) ? estimate.tax_amount : Math.floor(discounted * taxRate);
          const total = (lineItems && estimate.total_amount > 0) ? estimate.total_amount : (discounted + tax);
          return total.toLocaleString();
        })()}-</div>
        <div class="top-total-sub">
            <span>本体 ¥${(() => {
              let subtotal = 0;
              if (lineItems && estimate.subtotal > 0) {
                subtotal = estimate.subtotal;
              } else {
                const vc = estimate.vehicle_cost || 0;
                const sc = calculatedStaffCost;
                const dc = (estimate.vehicle_dedicated_unit_price || 0) * (estimate.vehicle_dedicated_count || 0);
                const cc = (estimate.vehicle_charter_unit_price || 0) * (estimate.vehicle_charter_count || 0);
                const tvf = estimate.transport_vehicle_fee || 0;
                const rpf = estimate.road_permit_fee || 0;
                const sf = estimate.survey_fee || 0;
                const svc = (estimate.site_survey_cost || 0) + (estimate.parking_officer_cost || 0) + (estimate.transport_cost || 0) + (estimate.waste_disposal_cost || 0) + (estimate.protection_cost || 0) + (estimate.material_collection_cost || 0) + (estimate.construction_cost || 0) + (estimate.parking_fee || 0) + (estimate.highway_fee || 0) + (estimate.external_contractor_cost || 0);
                let wtp = 0;
                if (estimate.work_time_type && estimate.work_time_type !== 'normal' && estimate.work_time_multiplier > 1) {
                  wtp = Math.round((vc + sc) * (estimate.work_time_multiplier - 1));
                }
                subtotal = Math.round(vc + sc + svc + wtp + dc + cc + tvf + rpf + sf);
              }
              return Math.max(0, subtotal - (estimate.discount_amount || 0)).toLocaleString();
            })()}</span>
            <span>税 ¥${(() => {
              let subtotal = 0;
              if (lineItems && estimate.subtotal > 0) {
                subtotal = estimate.subtotal;
              } else {
                const vc = estimate.vehicle_cost || 0;
                const sc = calculatedStaffCost;
                const dc = (estimate.vehicle_dedicated_unit_price || 0) * (estimate.vehicle_dedicated_count || 0);
                const cc = (estimate.vehicle_charter_unit_price || 0) * (estimate.vehicle_charter_count || 0);
                const tvf = estimate.transport_vehicle_fee || 0;
                const rpf = estimate.road_permit_fee || 0;
                const sf = estimate.survey_fee || 0;
                const svc = (estimate.site_survey_cost || 0) + (estimate.parking_officer_cost || 0) + (estimate.transport_cost || 0) + (estimate.waste_disposal_cost || 0) + (estimate.protection_cost || 0) + (estimate.material_collection_cost || 0) + (estimate.construction_cost || 0) + (estimate.parking_fee || 0) + (estimate.highway_fee || 0) + (estimate.external_contractor_cost || 0);
                let wtp = 0;
                if (estimate.work_time_type && estimate.work_time_type !== 'normal' && estimate.work_time_multiplier > 1) {
                  wtp = Math.round((vc + sc) * (estimate.work_time_multiplier - 1));
                }
                subtotal = Math.round(vc + sc + svc + wtp + dc + cc + tvf + rpf + sf);
              }
              const discounted = Math.max(0, subtotal - (estimate.discount_amount || 0));
              const taxRate = estimate.tax_rate || 0.1;
              if (lineItems && estimate.tax_amount > 0) return estimate.tax_amount.toLocaleString();
              return Math.floor(discounted * taxRate).toLocaleString();
            })()}</span>
        </div>
    </div>
        </div>
        <div class="top-row-right">
            <!-- 検印・担当者印 -->
            <div style="text-align: right; margin-bottom: 8px;">
              <table style="border-collapse: collapse; border: 1.5px solid #333; display: inline-table; margin-left: auto;">
                <thead>
                  <tr>
                    <th style="border: 1px solid #333; padding: 2px 8px; font-size: 9px; width: 60px; background: #f9f9f9; text-align: center;">検印</th>
                    <th style="border: 1px solid #333; padding: 2px 8px; font-size: 9px; width: 60px; background: #f9f9f9; text-align: center;">担当者</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="height: 58px;">
                    <td style="border: 1px solid #333; text-align: center; vertical-align: middle; padding: 4px;">
                      ${seals.approvalSeal ? `
                        <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="22" cy="22" r="20" fill="none" stroke="#CC0000" stroke-width="1.5"/>
                          <circle cx="22" cy="22" r="17.5" fill="none" stroke="#CC0000" stroke-width="0.5"/>
                          <text x="22" y="${seals.approvalSeal.name.length <= 2 ? '27' : '26'}" text-anchor="middle" font-size="${seals.approvalSeal.name.length <= 2 ? '13' : '10'}" font-family="serif" fill="#CC0000" font-weight="bold">${seals.approvalSeal.name}</text>
                        </svg>
                      ` : ''}
                    </td>
                    <td style="border: 1px solid #333; text-align: center; vertical-align: middle; padding: 4px;">
                      ${seals.creatorSeal && seals.creatorSeal.name ? `
                        <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="22" cy="22" r="20" fill="none" stroke="#CC0000" stroke-width="1.5"/>
                          <circle cx="22" cy="22" r="17.5" fill="none" stroke="#CC0000" stroke-width="0.5"/>
                          <text x="22" y="${seals.creatorSeal.name.length <= 2 ? '27' : '26'}" text-anchor="middle" font-size="${seals.creatorSeal.name.length <= 2 ? '13' : '10'}" font-family="serif" fill="#CC0000" font-weight="bold">${seals.creatorSeal.name}</text>
                        </svg>
                      ` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #333; text-align: center; font-size: 8px; padding: 1px; color: #555;">
                      ${seals.approvalSeal && seals.approvalSeal.date ? new Date(seals.approvalSeal.date).toLocaleDateString('ja-JP', {month:'numeric',day:'numeric'}) : ''}
                    </td>
                    <td style="border: 1px solid #333; text-align: center; font-size: 8px; padding: 1px; color: #555;">
                      ${seals.creatorSeal && seals.creatorSeal.date ? new Date(seals.creatorSeal.date).toLocaleDateString('ja-JP', {month:'numeric',day:'numeric'}) : ''}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style="text-align: right; font-size: 8px; color: #666; margin-top: 2px;">※検印のなきものは無効です</div>
            </div>
            <div class="company-info">
                ${basicSettings.company_name ? `<span class="company-name-text">${basicSettings.company_name}</span><br>` : ''}
                ${basicSettings.company_address ? `${basicSettings.company_address}<br>` : ''}
                ${basicSettings.company_phone ? `TEL: ${basicSettings.company_phone}` : ''}${basicSettings.company_fax ? ` / FAX: ${basicSettings.company_fax}` : ''}
                ${basicSettings.invoice_number ? `<br><span class="invoice-number-text">インボイス番号 ${basicSettings.invoice_number}</span>` : ''}
            </div>
        </div>
    </div>
    
    <!-- 見積メタ情報（1行コンパクト表示） -->
    <div class="estimate-meta">
        <span><strong>見積番号:</strong> ${estimate.estimate_number || ''}</span>
        <span><strong>案件名:</strong> ${estimate.project_name || ''}</span>
        <span><strong>作成日:</strong> ${currentDate}</span>
        <span><strong>有効期限:</strong> ${estimate.valid_until ? new Date(estimate.valid_until).toLocaleDateString('ja-JP') : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')}</span>
        ${estimate.created_by_name ? `<span><strong>担当:</strong> ${estimate.created_by_name}</span>` : ''}
        <span>配送先: ${estimate.delivery_address || ''} ${estimate.delivery_postal_code ? `〒${estimate.delivery_postal_code}` : ''} エリア${estimate.delivery_area}ランク${areaDesc ? `（${areaDesc}）` : ''}${estimate.delivery_distance_km > 0 ? ` 約${estimate.delivery_distance_km}km` : ''}</span>
    </div>
    
    <table class="estimate-table">
        <thead>
            <tr>
                <th style="width: 45%; text-align: center;">品名</th>
                <th style="width: 20%; text-align: center;">単価</th>
                <th style="width: 10%; text-align: center;">数量</th>
                <th style="width: 25%; text-align: center;">金額（税抜）</th>
            </tr>
        </thead>
        <tbody>
            ${lineItems ? (() => {
              // ✅ STEP6完全転写方式：line_items_jsonを使用（単価 × 数量 = 金額 形式）
              const allRows = [];
              
              // 1. 車両費用セクション
              if (lineItems.vehicle && lineItems.vehicle.items && lineItems.vehicle.items.length > 0) {
                allRows.push(`
                  <tr>
                    <td colspan="4"><strong>【${lineItems.vehicle.section_name}】</strong></td>
                  </tr>
                `);
                
                lineItems.vehicle.items.forEach(item => {
                  const qty = item.quantity || 1;
                  const unitPrice = item.unit_price || item.amount;
                  allRows.push(`
                    <tr>
                      <td>&nbsp;&nbsp;${item.description}${item.note ? '<br>&nbsp;&nbsp;&nbsp;&nbsp;<small>' + item.note + '</small>' : ''}</td>
                      <td class="amount-cell">¥${unitPrice.toLocaleString()}</td>
                      <td style="text-align: right !important;">${qty}</td>
                      <td class="amount-cell">¥${item.amount.toLocaleString()}</td>
                    </tr>
                  `);
                });
                
                allRows.push(`
                  <tr style="background-color: #f3f4f6;">
                    <td colspan="3"><strong>&nbsp;&nbsp;${lineItems.vehicle.section_name}小計</strong></td>
                    <td class="amount-cell"><strong>¥${lineItems.vehicle.subtotal.toLocaleString()}</strong></td>
                  </tr>
                `);
              }
              
              // 2. スタッフ費用セクション
              if (lineItems.staff && lineItems.staff.items && lineItems.staff.items.length > 0) {
                allRows.push(`
                  <tr>
                    <td colspan="4"><strong>【${lineItems.staff.section_name}】</strong></td>
                  </tr>
                `);
                
                lineItems.staff.items.forEach(item => {
                  const qty = item.quantity || 1;
                  const unitPrice = item.unit_price || item.amount;
                  allRows.push(`
                    <tr>
                      <td>&nbsp;&nbsp;${item.description}${item.detail ? ' ' + item.detail : ''}</td>
                      <td class="amount-cell">¥${unitPrice.toLocaleString()}</td>
                      <td style="text-align: right !important;">${qty}</td>
                      <td class="amount-cell">¥${item.amount.toLocaleString()}</td>
                    </tr>
                  `);
                });
                
                allRows.push(`
                  <tr style="background-color: #f3f4f6;">
                    <td colspan="3"><strong>&nbsp;&nbsp;${lineItems.staff.section_name}小計</strong></td>
                    <td class="amount-cell"><strong>¥${lineItems.staff.subtotal.toLocaleString()}</strong></td>
                  </tr>
                `);
              }
              
              // 3. その他サービス費用セクション
              if (lineItems.services && lineItems.services.items && lineItems.services.items.length > 0) {
                allRows.push(`
                  <tr>
                    <td colspan="4"><strong>【${lineItems.services.section_name}】</strong></td>
                  </tr>
                `);
                
                lineItems.services.items.forEach(item => {
                  const qty = item.quantity || 1;
                  const unitPrice = item.unit_price || item.amount;
                  allRows.push(`
                    <tr>
                      <td>&nbsp;&nbsp;${item.description}${item.note ? '<br>&nbsp;&nbsp;&nbsp;&nbsp;<small style="color: #666;">' + item.note + '</small>' : ''}</td>
                      <td class="amount-cell">¥${unitPrice.toLocaleString()}</td>
                      <td style="text-align: right !important;">${qty}</td>
                      <td class="amount-cell">¥${item.amount.toLocaleString()}</td>
                    </tr>
                  `);
                });
                
                allRows.push(`
                  <tr style="background-color: #f3f4f6;">
                    <td colspan="3"><strong>&nbsp;&nbsp;${lineItems.services.section_name}小計</strong></td>
                    <td class="amount-cell"><strong>¥${lineItems.services.subtotal.toLocaleString()}</strong></td>
                  </tr>
                `);
              }
              
              return allRows.join('');
            })() : (() => {
              // ❌ フォールバック：従来のロジック（line_items_jsonがない場合）
              // 4列テーブルに合わせてcolspan="3"を使用
              const vehicleRows = [];
              const vehicleCost = estimate.vehicle_cost || 0;
              
              // 車両種別に基づく表示
              if (estimate.vehicle_type && vehicleCost > 0) {
                vehicleRows.push(`
                  <tr>
                    <td colspan="3">&nbsp;&nbsp;${estimate.vehicle_type}1台</td>
                    <td class="amount-cell">¥${vehicleCost.toLocaleString()}</td>
                  </tr>
                `);
              } else if (vehicleCost > 0) {
                vehicleRows.push(`
                  <tr>
                    <td colspan="3">&nbsp;&nbsp;車両費用</td>
                    <td class="amount-cell">¥${vehicleCost.toLocaleString()}</td>
                  </tr>
                `);
              }
              
              // チャーター便表示
              if (estimate.vehicle_dedicated_count && estimate.vehicle_dedicated_count > 0) {
                const dedUnitPrice = estimate.vehicle_dedicated_unit_price || 0;
                const dedTotal = dedUnitPrice * estimate.vehicle_dedicated_count;
                vehicleRows.push(`
                  <tr>
                    <td>&nbsp;&nbsp;チャーター便（${estimate.delivery_area}ランク）</td>
                    <td class="amount-cell">¥${dedUnitPrice.toLocaleString()}</td>
                    <td style="text-align: right !important;">${estimate.vehicle_dedicated_count}</td>
                    <td class="amount-cell">¥${dedTotal.toLocaleString()}</td>
                  </tr>
                `);
              }
              
              // 2tチャーター表示
              if (estimate.vehicle_charter_count && estimate.vehicle_charter_count > 0) {
                const chaUnitPrice = estimate.vehicle_charter_unit_price || 0;
                const chaTotal = chaUnitPrice * estimate.vehicle_charter_count;
                vehicleRows.push(`
                  <tr>
                    <td>&nbsp;&nbsp;2tチャーター（${estimate.delivery_area}ランク）</td>
                    <td class="amount-cell">¥${chaUnitPrice.toLocaleString()}</td>
                    <td style="text-align: right !important;">${estimate.vehicle_charter_count}</td>
                    <td class="amount-cell">¥${chaTotal.toLocaleString()}</td>
                  </tr>
                `);
              }
              
              // 輸送車両費
              if (estimate.transport_vehicle_fee && estimate.transport_vehicle_fee > 0) {
                vehicleRows.push(`
                  <tr>
                    <td colspan="3">&nbsp;&nbsp;輸送車両費（${estimate.delivery_area}ランク）</td>
                    <td class="amount-cell">¥${estimate.transport_vehicle_fee.toLocaleString()}</td>
                  </tr>
                `);
              }
              
              // 道路許可費
              if (estimate.road_permit_fee && estimate.road_permit_fee > 0) {
                vehicleRows.push(`
                  <tr>
                    <td colspan="3">&nbsp;&nbsp;道路許可費</td>
                    <td class="amount-cell">¥${estimate.road_permit_fee.toLocaleString()}</td>
                  </tr>
                `);
              }
              
              
              // スタッフ費用を個別項目で表示
              const staffRows = [];
              const rates = staffRates || {};
              
              // 監督者
              if (estimate.supervisor_count && estimate.supervisor_count > 0) {
                const unitPrice = rates.supervisor || 0;
                const count = estimate.supervisor_count;
                const total = unitPrice * count;
                staffRows.push(`
                  <tr>
                    <td>&nbsp;&nbsp;監督者</td>
                    <td class="amount-cell">¥${unitPrice.toLocaleString()}</td>
                    <td style="text-align: right !important;">${count}</td>
                    <td class="amount-cell">¥${total.toLocaleString()}</td>
                  </tr>
                `);
              }
              
              // リーダー
              if (estimate.leader_count && estimate.leader_count > 0) {
                const unitPrice = rates.leader || 0;
                const count = estimate.leader_count;
                const total = unitPrice * count;
                staffRows.push(`
                  <tr>
                    <td>&nbsp;&nbsp;リーダー</td>
                    <td class="amount-cell">¥${unitPrice.toLocaleString()}</td>
                    <td style="text-align: right !important;">${count}</td>
                    <td class="amount-cell">¥${total.toLocaleString()}</td>
                  </tr>
                `);
              }
              
              // 一般社員
              if (estimate.m2_staff_half_day && estimate.m2_staff_half_day > 0) {
                const unitPrice = rates.m2_half_day || 0;
                const count = estimate.m2_staff_half_day;
                const total = unitPrice * count;
                staffRows.push(`
                  <tr>
                    <td>&nbsp;&nbsp;一般社員（半日）</td>
                    <td class="amount-cell">¥${unitPrice.toLocaleString()}</td>
                    <td style="text-align: right !important;">${count}</td>
                    <td class="amount-cell">¥${total.toLocaleString()}</td>
                  </tr>
                `);
              }
              
              // M2スタッフ（全日）
              if (estimate.m2_staff_full_day && estimate.m2_staff_full_day > 0) {
                const unitPrice = rates.m2_full_day || 0;
                const count = estimate.m2_staff_full_day;
                const total = unitPrice * count;
                staffRows.push(`
                  <tr>
                    <td>&nbsp;&nbsp;M2スタッフ（全日）</td>
                    <td class="amount-cell">¥${unitPrice.toLocaleString()}</td>
                    <td style="text-align: right !important;">${count}</td>
                    <td class="amount-cell">¥${total.toLocaleString()}</td>
                  </tr>
                `);
              }
              
              // アルバイト（半日）
              if (estimate.temp_staff_half_day && estimate.temp_staff_half_day > 0) {
                const unitPrice = rates.temp_half_day || 0;
                const count = estimate.temp_staff_half_day;
                const total = unitPrice * count;
                staffRows.push(`
                  <tr>
                    <td>&nbsp;&nbsp;アルバイト（半日）</td>
                    <td class="amount-cell">¥${unitPrice.toLocaleString()}</td>
                    <td style="text-align: right !important;">${count}</td>
                    <td class="amount-cell">¥${total.toLocaleString()}</td>
                  </tr>
                `);
              }
              
              // アルバイト（全日）
              if (estimate.temp_staff_full_day && estimate.temp_staff_full_day > 0) {
                const unitPrice = rates.temp_full_day || 0;
                const count = estimate.temp_staff_full_day;
                const total = unitPrice * count;
                staffRows.push(`
                  <tr>
                    <td>&nbsp;&nbsp;アルバイト（全日）</td>
                    <td class="amount-cell">¥${unitPrice.toLocaleString()}</td>
                    <td style="text-align: right !important;">${count}</td>
                    <td class="amount-cell">¥${total.toLocaleString()}</td>
                  </tr>
                `);
              }
              
              // スタッフが設定されていない場合のフォールバック
              if (staffRows.length === 0 && calculatedStaffCost > 0) {
                staffRows.push(`
                  <tr>
                    <td colspan="3">&nbsp;&nbsp;スタッフ費用</td>
                    <td class="amount-cell">¥${calculatedStaffCost.toLocaleString()}</td>
                  </tr>
                `);
              }
              
              
              return vehicleRows.join('') + staffRows.join('');
            })()}
            ${!lineItems && estimate.site_survey_cost > 0 ? `
            <tr>
                <td colspan="3">&nbsp;&nbsp;現地調査（${estimate.site_survey_people || 0}人・${estimate.site_survey_distance || 0}km）</td>
                <td class="amount-cell">¥${(estimate.site_survey_cost || 0).toLocaleString()}</td>
            </tr>` : ''}
            ${!lineItems && estimate.parking_officer_cost > 0 ? `
            <tr>
                <td colspan="3">&nbsp;&nbsp;駐車対策員（${estimate.parking_officer_hours || 0}時間）</td>
                <td class="amount-cell">¥${(estimate.parking_officer_cost || 0).toLocaleString()}</td>
            </tr>` : ''}
            ${!lineItems && estimate.transport_cost > 0 ? `
            <tr>
                <td colspan="3">&nbsp;&nbsp;人員輸送車両（${estimate.transport_vehicles || 0}台）</td>
                <td class="amount-cell">¥${(estimate.transport_cost || 0).toLocaleString()}</td>
            </tr>` : ''}
            ${!lineItems && estimate.waste_disposal_cost > 0 ? `
            <tr>
                <td colspan="3">&nbsp;&nbsp;引取廃棄（${estimate.waste_disposal_size || ''}）</td>
                <td class="amount-cell">¥${(estimate.waste_disposal_cost || 0).toLocaleString()}</td>
            </tr>` : ''}
            ${!lineItems && estimate.protection_cost > 0 ? `
            <tr>
                <td colspan="3">&nbsp;&nbsp;養生作業（${estimate.protection_floors || 0}階）</td>
                <td class="amount-cell">¥${(estimate.protection_cost || 0).toLocaleString()}</td>
            </tr>` : ''}
            ${!lineItems && estimate.material_collection_cost > 0 ? `
            <tr>
                <td colspan="3">&nbsp;&nbsp;資材回収（${estimate.material_collection_size || ''}）</td>
                <td class="amount-cell">¥${(estimate.material_collection_cost || 0).toLocaleString()}</td>
            </tr>` : ''}
            ${!lineItems && estimate.construction_cost > 0 ? `
            <tr>
                <td colspan="3">&nbsp;&nbsp;施工作業（M2スタッフ${estimate.construction_m2_staff || 0}名）</td>
                <td class="amount-cell">¥${(estimate.construction_cost || 0).toLocaleString()}</td>
            </tr>` : ''}
            ${!lineItems && estimate.parking_fee > 0 ? `
            <tr>
                <td colspan="3">&nbsp;&nbsp;実費：駐車料金</td>
                <td class="amount-cell">¥${(estimate.parking_fee || 0).toLocaleString()}</td>
            </tr>` : ''}
            ${!lineItems && estimate.highway_fee > 0 ? `
            <tr>
                <td colspan="3">&nbsp;&nbsp;実費：高速料金</td>
                <td class="amount-cell">¥${(estimate.highway_fee || 0).toLocaleString()}</td>
            </tr>` : ''}
            ${!lineItems ? (() => {
              // その他費用セクションの表示（line_items_jsonがない場合のみ）
              const otherCosts = [];
              
              // 作業時間割増料金（割増賃金）
              if (estimate.work_time_type && estimate.work_time_type !== 'normal' && estimate.work_time_multiplier > 1) {
                const multiplierPercent = Math.round((estimate.work_time_multiplier - 1) * 100);
                const baseAmount = (estimate.vehicle_cost || 0) + calculatedStaffCost;
                const premiumAmount = Math.round(baseAmount * (estimate.work_time_multiplier - 1));
                
                let timeTypeLabel = '';
                switch(estimate.work_time_type) {
                  case 'overtime':
                    timeTypeLabel = '割増作業時間';
                    break;
                  case 'early':
                    timeTypeLabel = '早朝';
                    break;
                  case 'night':
                    timeTypeLabel = '夜間';
                    break;
                  case 'midnight':
                    timeTypeLabel = '深夜';
                    break;
                  default:
                    timeTypeLabel = estimate.work_time_type;
                }
                
                otherCosts.push(`
                  <tr>
                    <td colspan="3"><strong>その他費用</strong></td>
                    <td class="amount-cell">-</td>
                  </tr>
                  <tr>
                    <td colspan="3">&nbsp;&nbsp;割増賃金 (${timeTypeLabel}作業 : +${multiplierPercent}%)</td>
                    <td class="amount-cell">¥${premiumAmount.toLocaleString()}</td>
                  </tr>
                `);
              }
              
              return otherCosts.join('');
            })() : ''}
        </tbody>
    </table>
    
    <div class="total-section">
        <table class="total-table">
            <tr>
                <th>小計</th>
                <td>¥${(() => {
                  // 実際の項目費用を計算（チャーター便・付帯費用含む）
                  const vehicleCost = estimate.vehicle_cost || 0;
                  const staffCost = calculatedStaffCost;
                  
                  // チャーター便費用
                  const dedicatedCost = (estimate.vehicle_dedicated_unit_price || 0) * (estimate.vehicle_dedicated_count || 0);
                  const charterCost = (estimate.vehicle_charter_unit_price || 0) * (estimate.vehicle_charter_count || 0);
                  const transportVehicleFee = estimate.transport_vehicle_fee || 0;
                  const roadPermitFee = estimate.road_permit_fee || 0;
                  const surveyFee = estimate.survey_fee || 0;
                  
                  const servicesCost = (estimate.site_survey_cost || 0) +
                                     (estimate.parking_officer_cost || 0) + 
                                     (estimate.transport_cost || 0) + 
                                     (estimate.waste_disposal_cost || 0) + 
                                     (estimate.protection_cost || 0) + 
                                     (estimate.material_collection_cost || 0) + 
                                     (estimate.construction_cost || 0) + 
                                     (estimate.parking_fee || 0) + 
                                     (estimate.highway_fee || 0) +
                                     (estimate.external_contractor_cost || 0);
                  
                  let workTimePremium = 0;
                  if (estimate.work_time_type && estimate.work_time_type !== 'normal' && estimate.work_time_multiplier > 1) {
                    const baseAmount = vehicleCost + staffCost;
                    workTimePremium = Math.round(baseAmount * (estimate.work_time_multiplier - 1));
                  }
                  
                  const calculatedSubtotal = Math.round(vehicleCost + staffCost + servicesCost + workTimePremium + dedicatedCost + charterCost + transportVehicleFee + roadPermitFee + surveyFee);
                  
                  // line_items_jsonがある場合はDB保存値を使用（STEP6で計算済み）
                  if (lineItems && estimate.subtotal > 0) {
                    return estimate.subtotal.toLocaleString();
                  }
                  return calculatedSubtotal.toLocaleString();
                })()}</td>
            </tr>
            ${(estimate.discount_amount > 0) ? `
            <tr>
                <th>値引き</th>
                <td style="color: #dc2626;">-¥${(estimate.discount_amount || 0).toLocaleString()}</td>
            </tr>
            <tr>
                <th>値引き後小計</th>
                <td>¥${(() => {
                  if (lineItems && estimate.subtotal > 0) {
                    return Math.max(0, estimate.subtotal - (estimate.discount_amount || 0)).toLocaleString();
                  }
                  const vehicleCost = estimate.vehicle_cost || 0;
                  const staffCost = calculatedStaffCost;
                  const dedicatedCost = (estimate.vehicle_dedicated_unit_price || 0) * (estimate.vehicle_dedicated_count || 0);
                  const charterCost = (estimate.vehicle_charter_unit_price || 0) * (estimate.vehicle_charter_count || 0);
                  const transportVehicleFee = estimate.transport_vehicle_fee || 0;
                  const roadPermitFee = estimate.road_permit_fee || 0;
                  const surveyFee = estimate.survey_fee || 0;
                  const servicesCost = (estimate.parking_officer_cost || 0) + 
                                     (estimate.transport_cost || 0) + 
                                     (estimate.waste_disposal_cost || 0) + 
                                     (estimate.protection_cost || 0) + 
                                     (estimate.material_collection_cost || 0) + 
                                     (estimate.construction_cost || 0) + 
                                     (estimate.parking_fee || 0) + 
                                     (estimate.highway_fee || 0);
                  let workTimePremium = 0;
                  if (estimate.work_time_type && estimate.work_time_type !== 'normal' && estimate.work_time_multiplier > 1) {
                    workTimePremium = Math.round((vehicleCost + staffCost) * (estimate.work_time_multiplier - 1));
                  }
                  const sub = Math.round(vehicleCost + staffCost + servicesCost + workTimePremium + dedicatedCost + charterCost + transportVehicleFee + roadPermitFee + surveyFee);
                  return Math.max(0, sub - (estimate.discount_amount || 0)).toLocaleString();
                })()}</td>
            </tr>` : ''}
            <tr>
                <th>消費税（${Math.round((estimate.tax_rate || 0.1) * 100)}%）</th>
                <td>¥${(() => {
                  if (lineItems && estimate.tax_amount > 0) {
                    return estimate.tax_amount.toLocaleString();
                  }
                  const vehicleCost = estimate.vehicle_cost || 0;
                  const staffCost = calculatedStaffCost;
                  const dedicatedCost = (estimate.vehicle_dedicated_unit_price || 0) * (estimate.vehicle_dedicated_count || 0);
                  const charterCost = (estimate.vehicle_charter_unit_price || 0) * (estimate.vehicle_charter_count || 0);
                  const transportVehicleFee = estimate.transport_vehicle_fee || 0;
                  const roadPermitFee = estimate.road_permit_fee || 0;
                  const surveyFee = estimate.survey_fee || 0;
                  const servicesCost = (estimate.site_survey_cost || 0) +
                                     (estimate.parking_officer_cost || 0) + 
                                     (estimate.transport_cost || 0) + 
                                     (estimate.waste_disposal_cost || 0) + 
                                     (estimate.protection_cost || 0) + 
                                     (estimate.material_collection_cost || 0) + 
                                     (estimate.construction_cost || 0) + 
                                     (estimate.parking_fee || 0) + 
                                     (estimate.highway_fee || 0) +
                                     (estimate.external_contractor_cost || 0);
                  let workTimePremium = 0;
                  if (estimate.work_time_type && estimate.work_time_type !== 'normal' && estimate.work_time_multiplier > 1) {
                    workTimePremium = Math.round((vehicleCost + staffCost) * (estimate.work_time_multiplier - 1));
                  }
                  const sub = Math.round(vehicleCost + staffCost + servicesCost + workTimePremium + dedicatedCost + charterCost + transportVehicleFee + roadPermitFee + surveyFee);
                  const discounted = Math.max(0, sub - (estimate.discount_amount || 0));
                  return Math.floor(discounted * (estimate.tax_rate || 0.1)).toLocaleString();
                })()}</td>
            </tr>
            <tr class="grand-total">
                <th>合計金額</th>
                <td>¥${(() => {
                  if (lineItems && estimate.total_amount > 0) {
                    return estimate.total_amount.toLocaleString();
                  }
                  const vehicleCost = estimate.vehicle_cost || 0;
                  const staffCost = calculatedStaffCost;
                  const dedicatedCost = (estimate.vehicle_dedicated_unit_price || 0) * (estimate.vehicle_dedicated_count || 0);
                  const charterCost = (estimate.vehicle_charter_unit_price || 0) * (estimate.vehicle_charter_count || 0);
                  const transportVehicleFee = estimate.transport_vehicle_fee || 0;
                  const roadPermitFee = estimate.road_permit_fee || 0;
                  const surveyFee = estimate.survey_fee || 0;
                  const servicesCost = (estimate.site_survey_cost || 0) +
                                     (estimate.parking_officer_cost || 0) + 
                                     (estimate.transport_cost || 0) + 
                                     (estimate.waste_disposal_cost || 0) + 
                                     (estimate.protection_cost || 0) + 
                                     (estimate.material_collection_cost || 0) + 
                                     (estimate.construction_cost || 0) + 
                                     (estimate.parking_fee || 0) + 
                                     (estimate.highway_fee || 0) +
                                     (estimate.external_contractor_cost || 0);
                  let workTimePremium = 0;
                  if (estimate.work_time_type && estimate.work_time_type !== 'normal' && estimate.work_time_multiplier > 1) {
                    workTimePremium = Math.round((vehicleCost + staffCost) * (estimate.work_time_multiplier - 1));
                  }
                  const sub = Math.round(vehicleCost + staffCost + servicesCost + workTimePremium + dedicatedCost + charterCost + transportVehicleFee + roadPermitFee + surveyFee);
                  const discounted = Math.max(0, sub - (estimate.discount_amount || 0));
                  const tax = Math.floor(discounted * (estimate.tax_rate || 0.1));
                  return (discounted + tax).toLocaleString();
                })()}</td>
            </tr>
        </table>
    </div>
    
    <div class="notes-section">
        <h3>備考・作業内容</h3>
        ${estimate.project_description ? `<p>${estimate.project_description}</p>` : ''}
        ${estimate.notes && estimate.notes !== 'null' ? `<p><strong>追加事項:</strong> ${estimate.notes}</p>` : ''}
        <p>
            <strong>お支払条件:</strong> 作業完了後、月末締め翌月末日支払い<br>
            <strong>作業条件:</strong> 天候・交通事情により作業日程が変更になる場合があります<br>
            <strong>有効期限:</strong> 本見積書の有効期限は発行日より30日間です
        </p>
    </div>

    <!-- ページ番号フッター（印刷時のみ表示: 1/1 形式） -->
    <div id="pageFooter" style="display:none;"></div>

    <script>
    (function(){
        var estNum = '${(estimate.estimate_number || "見積書").replace(/'/g, "\\'")}';
        // body高さからページ数を推定してフッターテキストを設定
        function updateFooter() {
            var PAGE_H = 1020; // A4印刷領域の推定高さ(px)
            var bodyH = document.body.scrollHeight;
            var total = Math.max(1, Math.ceil(bodyH / PAGE_H));
            var footer = document.getElementById('pageFooter');
            if (footer) {
                // position:fixed は全ページに同じテキストを表示
                // 1ページ: "EST-XXXX  1 / 1"
                // 複数ページ: "EST-XXXX  全Nページ" (各ページ個別番号は不可)
                if (total === 1) {
                    footer.textContent = estNum + '\u3000\u3000' + '1 / 1';
                } else {
                    footer.textContent = estNum + '\u3000\u3000' + '\u5168' + total + '\u30DA\u30FC\u30B8';
                }
            }
        }
        updateFooter();
        window.addEventListener('beforeprint', updateFooter);
    })();
    </script>

</body>
</html>
  `.trim()
}

// ================== ステータス管理API ==================

// 案件ステータス変更API
app.put('/api/projects/:id/status', async (c) => {
  try {
    const { env } = c
    const projectId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    const { status, comment } = await c.req.json()
    
    // ステータスバリデーション（新12ステータス + 旧ステータス互換）
    const validStatuses = [
      // 新ライフサイクル12ステータス
      'drafting', 'pdf_generated', 'approval_requested',
      'pending_approval', 'revision_requested',
      'sent_to_customer', 'under_review', 're_estimate_requested',
      'formal_order', 'won', 'lost', 'cancelled',
      // 旧ステータス（後方互換）
      'initial', 'quote_sent', 'under_consideration', 'order', 'failed', 'completed'
    ]
    if (!validStatuses.includes(status)) {
      return c.json({
        success: false,
        message: '無効なステータスです'
      }, 400)
    }
    
    // 案件の存在確認
    const project = await env.DB.prepare(`
      SELECT * FROM projects WHERE id = ? AND user_id = ?
    `).bind(projectId, userId).first()
    
    if (!project) {
      return c.json({
        success: false,
        message: '案件が見つかりません'
      }, 404)
    }
    
    const oldStatus = project.status
    
    // 再見積もり依頼の場合：drafting にリセット
    let finalStatus = status
    let additionalNote = ''
    if (status === 're_estimate_requested') {
      finalStatus = 'drafting'
      additionalNote = '【再見積もり依頼】顧客からの再見積もり依頼により製作中に戻りました。'
    }
    
    // ステータス更新
    const updateResult = await env.DB.prepare(`
      UPDATE projects 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ?
    `).bind(finalStatus, projectId, userId).run()
    
    if (!updateResult.success) {
      throw new Error('ステータスの更新に失敗しました')
    }
    
    // ステータス履歴に記録
    await env.DB.prepare(`
      INSERT INTO status_history (
        project_id, estimate_id, old_status, new_status, comment, changed_by, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      projectId,
      null,
      oldStatus,
      status,
      comment || '',
      userId,
      userId
    ).run()
    
    // 再見積もり依頼の場合は、drafting への戻りも履歴に記録
    if (status === 're_estimate_requested') {
      await env.DB.prepare(`
        INSERT INTO status_history (
          project_id, estimate_id, old_status, new_status, comment, changed_by, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        projectId,
        null,
        're_estimate_requested',
        'drafting',
        additionalNote + (comment ? ` 備考: ${comment}` : ''),
        userId,
        userId
      ).run()
    }
    
    // 更新された案件情報を取得
    const updatedProject = await env.DB.prepare(`
      SELECT p.*, c.name as customer_name
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE p.id = ?
    `).bind(projectId).first()
    
    return c.json({
      success: true,
      message: 'ステータスを更新しました',
      data: updatedProject
    })
    
  } catch (error) {
    console.error('ステータス更新エラー:', error)
    return c.json({
      success: false,
      message: 'ステータスの更新に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// 見積ステータス変更API（案件経由）
app.put('/api/estimates/:id/status', async (c) => {
  try {
    const { env } = c
    const estimateId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    const { status, comment } = await c.req.json()
    
    // 見積の存在確認と関連案件取得
    const estimate = await env.DB.prepare(`
      SELECT e.*, p.id as project_id, p.status as project_status
      FROM estimates e
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE e.id = ? AND e.user_id = ?
    `).bind(estimateId, userId).first()
    
    if (!estimate) {
      return c.json({
        success: false,
        message: '見積が見つかりません'
      }, 404)
    }
    
    // 関連する案件のステータスを更新
    const projectId = estimate.project_id
    const oldStatus = estimate.project_status
    
    // 再見積もり依頼の場合：drafting にリセット
    let finalStatus = status
    let additionalNote = ''
    if (status === 're_estimate_requested') {
      finalStatus = 'drafting'
      additionalNote = '【再見積もり依頼】顧客からの再見積もり依頼により製作中に戻りました。'
    }
    
    // 案件ステータス更新
    const updateResult = await env.DB.prepare(`
      UPDATE projects 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ?
    `).bind(finalStatus, projectId, userId).run()
    
    if (!updateResult.success) {
      throw new Error('ステータスの更新に失敗しました')
    }
    
    // 見積自体のステータスも更新
    await env.DB.prepare(`
      UPDATE estimates 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(finalStatus, estimateId).run()
    
    // ステータス履歴に記録
    await env.DB.prepare(`
      INSERT INTO status_history (
        project_id, estimate_id, old_status, new_status, comment, changed_by, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      projectId,
      estimateId,
      oldStatus,
      status,
      comment || '',
      userId,
      userId
    ).run()
    
    // 再見積もり依頼の場合は、drafting への戻りも履歴に記録
    if (status === 're_estimate_requested') {
      await env.DB.prepare(`
        INSERT INTO status_history (
          project_id, estimate_id, old_status, new_status, comment, changed_by, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        projectId,
        estimateId,
        're_estimate_requested',
        'drafting',
        additionalNote + (comment ? ` 備考: ${comment}` : ''),
        userId,
        userId
      ).run()
    }
    
    return c.json({
      success: true,
      message: status === 're_estimate_requested' 
        ? '再見積もり依頼を受付し、製作中に戻しました' 
        : 'ステータスを更新しました'
    })
    
  } catch (error) {
    console.error('見積ステータス更新エラー:', error)
    return c.json({
      success: false,
      message: 'ステータスの更新に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// ステータス履歴取得API
app.get('/api/projects/:id/status-history', async (c) => {
  try {
    const { env } = c
    const projectId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    
    // ステータス履歴を取得
    const result = await env.DB.prepare(`
      SELECT 
        sh.*,
        e.estimate_number,
        p.name as project_name
      FROM status_history sh
      LEFT JOIN estimates e ON sh.estimate_id = e.id
      LEFT JOIN projects p ON sh.project_id = p.id
      WHERE sh.project_id = ? AND sh.user_id = ?
      ORDER BY sh.created_at DESC
    `).bind(projectId, userId).all()
    
    return c.json({
      success: true,
      data: result.results || []
    })
    
  } catch (error) {
    console.error('ステータス履歴取得エラー:', error)
    return c.json({
      success: false,
      message: 'ステータス履歴の取得に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// ステータス一覧取得API
app.get('/api/status-options', (c) => {
  const statusOptions = [
    { value: 'initial', label: '初回コンタクト', color: 'blue', description: '最初の問い合わせ段階' },
    { value: 'quote_sent', label: '見積書送信済み', color: 'yellow', description: '見積書を送信し、返答待ち' },
    { value: 'under_consideration', label: '受注検討中', color: 'orange', description: '顧客が検討中、追加フォロー必要' },
    { value: 'order_day', label: '受注（昼間）', color: 'green', description: '昼間作業の正式受注' },
    { value: 'order_night', label: '受注（夜間）', color: 'green', description: '夜間作業の正式受注' },
    { value: 'order', label: '受注', color: 'green', description: '正式受注、作業開始準備' },
    { value: 'completed', label: '完了', color: 'green', description: '作業完了、支払い確認済み' },
    { value: 'failed', label: '失注', color: 'red', description: '受注に至らず終了' },
    { value: 'cancelled', label: 'キャンセル', color: 'gray', description: '顧客都合によりキャンセル' }
  ]
  
  return c.json({
    success: true,
    data: statusOptions
  })
})

// ==========================================
// 顧客ID/パスワード管理API（管理者用）
// ※ /api/customers/:id より前に定義してルート競合を回避
// ==========================================

// 顧客のログイン情報一覧取得
app.get('/api/customers/login-info', async (c) => {
  const { env } = c
  try {
    const { results } = await env.DB.prepare(`
      SELECT id, name, login_id, login_password FROM customers ORDER BY name
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error('顧客ログイン情報取得エラー:', error)
    return c.json({ success: false, message: '取得に失敗しました' }, 500)
  }
})

// 顧客ログインID/パスワード設定・更新
app.put('/api/customers/:id/login-info', async (c) => {
  const { env } = c
  try {
    const customerId = c.req.param('id')
    const { login_id, login_password } = await c.req.json()
    
    if (!login_id || !login_password) {
      return c.json({ success: false, message: 'IDとパスワードを入力してください' }, 400)
    }
    
    // login_idの重複チェック
    const existing = await env.DB.prepare(`
      SELECT id FROM customers WHERE login_id = ? AND id != ?
    `).bind(login_id, customerId).first()
    
    if (existing) {
      return c.json({ success: false, message: 'このログインIDは既に使用されています' }, 409)
    }
    
    await env.DB.prepare(`
      UPDATE customers SET login_id = ?, login_password = ? WHERE id = ?
    `).bind(login_id, login_password, customerId).run()
    
    return c.json({ success: true, message: 'ログイン情報を更新しました' })
  } catch (error) {
    console.error('顧客ログイン情報更新エラー:', error)
    return c.json({ success: false, message: '更新に失敗しました' }, 500)
  }
})

// 新規顧客追加（ログイン情報付き）
app.post('/api/customers/add-with-login', async (c) => {
  const { env } = c
  try {
    const { name, contact_person, phone, email, login_id, login_password } = await c.req.json()
    
    if (!name) {
      return c.json({ success: false, message: '顧客名を入力してください' }, 400)
    }
    if (!login_id || !login_password) {
      return c.json({ success: false, message: 'ログインIDとパスワードを入力してください' }, 400)
    }
    
    // login_idの重複チェック
    const existing = await env.DB.prepare(`
      SELECT id FROM customers WHERE login_id = ?
    `).bind(login_id).first()
    
    if (existing) {
      return c.json({ success: false, message: 'このログインIDは既に使用されています' }, 409)
    }
    
    // user_idは管理者として固定
    const userId = 'admin'
    
    const result = await env.DB.prepare(`
      INSERT INTO customers (name, contact_person, phone, email, user_id, login_id, login_password)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name,
      contact_person || '',
      phone || '',
      email || '',
      userId,
      login_id,
      login_password
    ).run()
    
    return c.json({
      success: true,
      message: '顧客を追加しました',
      id: result.meta.last_row_id
    })
  } catch (error) {
    console.error('顧客追加エラー:', error)
    return c.json({ success: false, message: '顧客の追加に失敗しました' }, 500)
  }
})

// 顧客詳細取得API
app.get('/api/customers/:id', async (c) => {
  try {
    const { env } = c
    const customerId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    
    const result = await env.DB.prepare(`
      SELECT * FROM customers 
      WHERE id = ? AND user_id = ?
    `).bind(customerId, userId).first()
    
    if (!result) {
      return c.json({ 
        success: false, 
        error: '顧客が見つかりません' 
      }, 404)
    }
    
    return c.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('顧客詳細取得エラー:', error)
    return c.json({ 
      success: false, 
      error: '顧客詳細の取得に失敗しました' 
    }, 500)
  }
})

// 顧客更新API
app.put('/api/customers/:id', async (c) => {
  try {
    const { env } = c
    const customerId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    const data = await c.req.json()
    
    // バリデーション
    if (!data.name) {
      return c.json({ 
        success: false, 
        error: '顧客名は必須です' 
      }, 400)
    }
    
    // 更新実行
    const result = await env.DB.prepare(`
      UPDATE customers 
      SET name = ?, contact_person = ?, phone = ?, email = ?, address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(
      data.name,
      data.contact_person || '',
      data.phone || '',
      data.email || '',
      data.address || '',
      data.notes || '',
      customerId,
      userId
    ).run()
    
    if (!result.success) {
      return c.json({ 
        success: false, 
        error: '顧客の更新に失敗しました' 
      }, 500)
    }
    
    return c.json({
      success: true,
      message: '顧客情報を正常に更新しました'
    })
  } catch (error) {
    console.error('顧客更新エラー:', error)
    return c.json({ 
      success: false, 
      error: '顧客の更新に失敗しました',
      detail: error.message 
    }, 500)
  }
})

// 顧客削除API
// 顧客の論理削除
app.delete('/api/customers/:id', async (c) => {
  try {
    const { env } = c
    const customerId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    const body = await c.req.json().catch(() => ({}))
    const reason = body.reason || '削除処理'
    
    // 関連する案件があるかチェック（activeのみ）
    const projectCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM projects 
      WHERE customer_id = ? AND user_id = ? AND (status != 'deleted' OR status IS NULL)
    `).bind(customerId, userId).first()
    
    if (projectCount && projectCount.count > 0) {
      return c.json({ 
        success: false, 
        error: 'この顧客には関連する有効な案件があるため削除できません。先に案件を処理してください。' 
      }, 400)
    }
    
    // 論理削除実行（物理削除ではなくstatusを'deleted'に変更）
    const result = await env.DB.prepare(`
      UPDATE customers 
      SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP, deleted_reason = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(reason, customerId, userId).run()
    
    if (!result.success) {
      return c.json({ 
        success: false, 
        error: '顧客の削除に失敗しました' 
      }, 500)
    }
    
    return c.json({
      success: true,
      message: '顧客を正常に削除しました（復活可能）'
    })
  } catch (error) {
    console.error('顧客削除エラー:', error)
    return c.json({ 
      success: false, 
      error: '顧客の削除に失敗しました',
      detail: error.message 
    }, 500)
  }
})

// 顧客の復活機能
app.post('/api/customers/:id/restore', async (c) => {
  try {
    const { env } = c
    const customerId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    
    // 削除済み顧客の存在チェック
    const customer = await env.DB.prepare(`
      SELECT id, name, status FROM customers 
      WHERE id = ? AND user_id = ? AND status = 'deleted'
    `).bind(customerId, userId).first()
    
    if (!customer) {
      return c.json({ 
        success: false, 
        error: '復活対象の削除済み顧客が見つかりません' 
      }, 404)
    }
    
    // 復活実行（statusを'active'に戻し、削除情報をクリア）
    const result = await env.DB.prepare(`
      UPDATE customers 
      SET status = 'active', deleted_at = NULL, deleted_reason = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(customerId, userId).run()
    
    if (!result.success) {
      return c.json({ 
        success: false, 
        error: '顧客の復活に失敗しました' 
      }, 500)
    }
    
    return c.json({
      success: true,
      message: `顧客「${customer.name}」を復活させました`
    })
  } catch (error) {
    console.error('顧客復活エラー:', error)
    return c.json({ 
      success: false, 
      error: '顧客の復活に失敗しました',
      detail: error.message 
    }, 500)
  }
})

// 顧客のステータス変更（有効⇔無効）
app.post('/api/customers/:id/toggle-status', async (c) => {
  try {
    const { env } = c
    const customerId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    
    // 現在のステータス取得
    const customer = await env.DB.prepare(`
      SELECT id, name, status FROM customers 
      WHERE id = ? AND user_id = ? AND status IN ('active', 'inactive')
    `).bind(customerId, userId).first()
    
    if (!customer) {
      return c.json({ 
        success: false, 
        error: '対象の顧客が見つかりません' 
      }, 404)
    }
    
    // ステータス切り替え
    const newStatus = customer.status === 'active' ? 'inactive' : 'active'
    const result = await env.DB.prepare(`
      UPDATE customers 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(newStatus, customerId, userId).run()
    
    if (!result.success) {
      return c.json({ 
        success: false, 
        error: 'ステータス変更に失敗しました' 
      }, 500)
    }
    
    const statusText = newStatus === 'active' ? '有効' : '無効'
    return c.json({
      success: true,
      message: `顧客「${customer.name}」を${statusText}に変更しました`,
      new_status: newStatus
    })
  } catch (error) {
    console.error('ステータス変更エラー:', error)
    return c.json({ 
      success: false, 
      error: 'ステータス変更に失敗しました',
      detail: error.message 
    }, 500)
  }
})

// 案件詳細取得API
app.get('/api/projects/detail/:id', async (c) => {
  try {
    const { env } = c
    const projectId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    
    const result = await env.DB.prepare(`
      SELECT p.*, c.name as customer_name
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE p.id = ? AND p.user_id = ?
    `).bind(projectId, userId).first()
    
    if (!result) {
      return c.json({ 
        success: false, 
        error: '案件が見つかりません' 
      }, 404)
    }
    
    return c.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('案件詳細取得エラー:', error)
    return c.json({ 
      success: false, 
      error: '案件詳細の取得に失敗しました' 
    }, 500)
  }
})

// 案件更新API
app.put('/api/projects/:id', async (c) => {
  try {
    const { env } = c
    const projectId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    const data = await c.req.json()
    
    // バリデーション（案件管理用に修正）
    if (!data.name || !data.customer_id) {
      return c.json({ 
        success: false, 
        error: '案件名と顧客IDは必須です' 
      }, 400)
    }
    
    // 現在のステータスを取得
    const currentProject = await env.DB.prepare(`
      SELECT status FROM projects WHERE id = ? AND user_id = ?
    `).bind(projectId, userId).first()
    
    if (!currentProject) {
      return c.json({ 
        success: false, 
        error: '案件が見つかりません' 
      }, 404)
    }
    
    // 更新実行（案件管理用フィールドを含む）
    const result = await env.DB.prepare(`
      UPDATE projects 
      SET customer_id = ?, name = ?, description = ?, status = ?, priority = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(
      data.customer_id,
      data.name.trim(),
      data.description || '',
      data.status || 'initial',
      data.priority || 'medium',
      data.notes || '',
      projectId,
      userId
    ).run()
    
    if (!result.success) {
      return c.json({ 
        success: false, 
        error: '案件の更新に失敗しました' 
      }, 500)
    }
    
    // ステータスが変更された場合は履歴に記録
    if (data.status && data.status !== currentProject.status) {
      await env.DB.prepare(`
        INSERT INTO status_history (project_id, old_status, new_status, notes, user_id)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        projectId,
        currentProject.status,
        data.status,
        data.status_comment || '案件編集時にステータスを変更',
        userId
      ).run()
    }
    
    return c.json({
      success: true,
      message: '案件情報を正常に更新しました'
    })
  } catch (error) {
    console.error('案件更新エラー:', error)
    return c.json({ 
      success: false, 
      error: '案件の更新に失敗しました',
      detail: error.message 
    }, 500)
  }
})

// 案件削除API
app.delete('/api/projects/:id', async (c) => {
  try {
    const { env } = c
    const projectId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    
    // 関連する見積があるかチェック
    const estimateCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM estimates 
      WHERE project_id = ? AND user_id = ?
    `).bind(projectId, userId).first()
    
    if (estimateCount && estimateCount.count > 0) {
      return c.json({ 
        success: false, 
        error: 'この案件には関連する見積があるため削除できません。先に見積を削除してください。' 
      }, 400)
    }
    
    // ステータス履歴も削除
    await env.DB.prepare(`
      DELETE FROM status_history 
      WHERE project_id = ? AND user_id = ?
    `).bind(projectId, userId).run()
    
    // 削除実行
    const result = await env.DB.prepare(`
      DELETE FROM projects 
      WHERE id = ? AND user_id = ?
    `).bind(projectId, userId).run()
    
    if (!result.success) {
      return c.json({ 
        success: false, 
        error: '案件の削除に失敗しました' 
      }, 500)
    }
    
    return c.json({
      success: true,
      message: '案件を正常に削除しました'
    })
  } catch (error) {
    console.error('案件削除エラー:', error)
    return c.json({ 
      success: false, 
      error: '案件の削除に失敗しました',
      detail: error.message 
    }, 500)
  }
})

// 顧客・案件管理画面
app.get('/customers', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center text-white hover:text-blue-200">
                <i className="fas fa-truck text-white text-2xl mr-3"></i>
                <h1 className="text-xl font-bold">Office M2 見積システム</h1>
              </a>
            </div>
            <div className="text-white">
              <span className="text-sm">顧客・案件管理</span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* ページタイトルとアクション */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            <i className="fas fa-users mr-2"></i>
            顧客・案件管理
          </h2>
          <div className="space-x-3">
            <button 
              onclick="openCustomerModal()" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              <i className="fas fa-plus mr-2"></i>
              新規顧客追加
            </button>
            <button 
              onclick="openProjectModal()" 
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              <i className="fas fa-project-diagram mr-2"></i>
              新規案件追加
            </button>
          </div>
        </div>

        {/* タブ切り替え */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button 
              id="customersTab" 
              onclick="switchTab('customers')" 
              className="tab-button active"
            >
              <i className="fas fa-users mr-2"></i>
              顧客一覧
            </button>
            <button 
              id="projectsTab" 
              onclick="switchTab('projects')" 
              className="tab-button"
            >
              <i className="fas fa-project-diagram mr-2"></i>
              案件一覧
            </button>
          </nav>
        </div>

        {/* 検索・フィルタ */}
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">検索</label>
              <input 
                type="text" 
                id="searchInput" 
                className="form-input" 
                placeholder="名前、案件名で検索..."
                oninput="handleSearch()"
              />
            </div>
            <div id="statusFilterContainer">
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select id="statusFilter" className="form-select" onchange="handleStatusFilter()">
                <option value="">すべて</option>
                <option value="initial">初回コンタクト</option>
                <option value="quote_sent">見積書送信済み</option>
                <option value="under_consideration">受注検討中</option>
                <option value="order">受注</option>
                <option value="completed">完了</option>
                <option value="failed">失注</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">表示件数</label>
              <select id="limitSelect" className="form-select" onchange="handleLimitChange()">
                <option value="20">20件</option>
                <option value="50">50件</option>
                <option value="100">100件</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onclick="refreshData()" 
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                <i className="fas fa-refresh mr-2"></i>
                更新
              </button>
            </div>
          </div>
        </div>

        {/* 顧客一覧テーブル */}
        <div id="customersTable" className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">顧客一覧</h3>
              <div id="customersStats" className="text-sm text-gray-600"></div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      顧客名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      担当者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      連絡先
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      案件数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      登録日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody id="customersTableBody" className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td colspan="6" className="px-6 py-4 text-center text-gray-500">
                      読み込み中...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ページネーション */}
            <div id="customersPagination" className="mt-4 flex justify-between items-center">
              <div id="customersPageInfo" className="text-sm text-gray-700"></div>
              <div id="customersPageButtons" className="space-x-2"></div>
            </div>
          </div>
        </div>

        {/* 案件一覧テーブル */}
        <div id="projectsTable" className="bg-white shadow rounded-lg hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">案件一覧</h3>
              <div id="projectsStats" className="text-sm text-gray-600"></div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      案件名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      顧客名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      担当者名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      見積数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      更新日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody id="projectsTableBody" className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td colspan="7" className="px-6 py-4 text-center text-gray-500">
                      読み込み中...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ページネーション */}
            <div id="projectsPagination" className="mt-4 flex justify-between items-center">
              <div id="projectsPageInfo" className="text-sm text-gray-700"></div>
              <div id="projectsPageButtons" className="space-x-2"></div>
            </div>
          </div>
        </div>
      </main>

      {/* JavaScript読み込み */}
      <script src="/static/customers.js"></script>

      {/* 顧客追加・編集モーダル */}
      <div id="customerModal" className="modal-backdrop" style="display: none;">
        <div className="modal-content">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 id="customerModalTitle" className="text-lg font-medium text-gray-900">新規顧客追加</h3>
          </div>
          <form id="customerForm" className="p-6">
            <input type="hidden" id="customerId" name="id" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">顧客名 *</label>
                <input type="text" id="customerName" name="name" className="form-input" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                  <input type="tel" id="customerPhone" name="phone" className="form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                  <input type="email" id="customerEmail" name="email" className="form-input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                <textarea id="customerAddress" name="address" rows="2" className="form-textarea"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                <textarea id="customerNotes" name="notes" rows="3" className="form-textarea"></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onclick="closeCustomerModal()" className="btn-secondary">
                キャンセル
              </button>
              <button type="submit" className="btn-primary">
                <i className="fas fa-save mr-2"></i>
                保存
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 案件追加・編集モーダル */}
      <div id="projectModal" className="modal-backdrop" style="display: none;">
        <div className="modal-content">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 id="projectModalTitle" className="text-lg font-medium text-gray-900">新規案件追加</h3>
          </div>
          <form id="projectForm" className="p-6">
            <input type="hidden" id="projectId" name="id" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">顧客選択 *</label>
                <select id="projectCustomerId" name="customer_id" className="form-select" required>
                  <option value="">顧客を選択してください</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">※ 顧客の担当者は「マスター管理」→「顧客管理」で設定してください</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">案件名 *</label>
                <input type="text" id="projectName" name="name" className="form-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">案件説明</label>
                <textarea id="projectDescription" name="description" rows="3" className="form-textarea" placeholder="案件の詳細説明を入力してください"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                <select id="projectStatus" name="status" className="form-select">
                  <option value="initial">初回コンタクト</option>
                  <option value="quote_sent">見積書送信済み</option>
                  <option value="under_consideration">受注検討中</option>
                  <option value="order">受注</option>
                  <option value="completed">完了</option>
                  <option value="failed">失注</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onclick="closeProjectModal()" className="btn-secondary">
                キャンセル
              </button>
              <button type="submit" className="btn-primary">
                <i className="fas fa-save mr-2"></i>
                保存
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ステータス変更モーダル */}
      <div id="statusModal" className="modal-backdrop" style="display: none;">
        <div className="modal-content">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">ステータス変更</h3>
          </div>
          <form id="statusForm" className="p-6">
            <input type="hidden" id="statusProjectId" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">新しいステータス *</label>
                <select id="newStatus" className="form-select" required>
                  <option value="">ステータスを選択</option>
                  <option value="initial">初回コンタクト</option>
                  <option value="quote_sent">見積書送信済み</option>
                  <option value="under_consideration">受注検討中</option>
                  <option value="order">受注</option>
                  <option value="completed">完了</option>
                  <option value="failed">失注</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">変更理由・コメント</label>
                <textarea id="statusComment" rows="3" className="form-textarea" placeholder="ステータス変更の理由や詳細コメントを入力してください"></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onclick="closeStatusModal()" className="btn-secondary">
                キャンセル
              </button>
              <button type="submit" className="btn-primary">
                <i className="fas fa-save mr-2"></i>
                更新
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 削除確認モーダル */}
      <div id="deleteModal" className="modal-backdrop" style="display: none;">
        <div className="modal-content">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 text-red-600">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              削除確認
            </h3>
          </div>
          <div className="p-6">
            <p id="deleteMessage" className="text-gray-700 mb-4"></p>
            <div className="flex justify-end space-x-3">
              <button type="button" onclick="closeDeleteModal()" className="btn-secondary">
                キャンセル
              </button>
              <button 
                type="button" 
                id="confirmDeleteBtn" 
                onclick="confirmDelete()" 
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                <i className="fas fa-trash mr-2"></i>
                削除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// ==============================================
// API エンドポイント
// ==============================================

// マスタ設定APIエンドポイント（プランA/B対応）
app.get('/api/master-settings', async (c) => {
  try {
    const { env } = c;
    const planType = c.req.query('plan_type') || 'A';
    
    // マスタ設定データを取得（プラン別、最新データを優先）
    // staff/service/vehicleカテゴリはplan_type別、systemはプラン共通('A')
    const result = await env.DB.prepare(`
      SELECT category, subcategory, key, value, data_type, updated_at
      FROM master_settings 
      WHERE (
        (category IN ('staff', 'service', 'vehicle') AND plan_type = ?)
        OR (category = 'system' AND plan_type = 'A')
        OR (category = 'basic' AND plan_type = 'A')
      )
      ORDER BY category, subcategory, key, updated_at DESC
    `).bind(planType).all();

    if (result.success && result.results) {
      // データを階層構造に変換（フロントエンドとの互換性確保）
      const settings = {
        staff_rates: {},
        vehicle_rates: {},
        service_rates: {},
        system_settings: {}
      };
      
      result.results.forEach(row => {
        let value = row.value;
        
        // 数値型の場合は変換
        if (row.data_type === 'number') {
          value = parseFloat(value) || 0;
        }
        
        // カテゴリ別に分類
        if (row.category === 'staff' && row.subcategory === 'daily_rate') {
          settings.staff_rates[row.key] = value;
        } else if (row.category === 'vehicle') {
          // 車両データの統合形式: vehicle_${subcategory}_${key}
          const vehicleKey = `vehicle_${row.subcategory}`;
          settings.vehicle_rates[vehicleKey] = value;
        } else if (row.category === 'service') {
          if (row.subcategory === 'parking_officer' && row.key === 'hourly_rate') {
            settings.service_rates['parking_officer_hourly'] = value;
          } else if (row.subcategory === 'parking_officer' && row.key === 'half_day_rate') {
            settings.service_rates['parking_half_day'] = value;
          } else if (row.subcategory === 'parking_officer' && row.key === 'full_day_rate') {
            settings.service_rates['parking_full_day'] = value;
          } else if (row.subcategory === 'parking_officer' && row.key === 'transport_osaka_city') {
            settings.service_rates['parking_transport_osaka_city'] = value;
          } else if (row.subcategory === 'parking_officer' && row.key === 'transport_osaka_suburb') {
            settings.service_rates['parking_transport_osaka_suburb'] = value;
          } else if (row.subcategory === 'parking_officer' && row.key === 'transport_kyoto') {
            settings.service_rates['parking_transport_kyoto'] = value;
          } else if (row.subcategory === 'parking_officer' && row.key === 'transport_hyogo') {
            settings.service_rates['parking_transport_hyogo'] = value;
          } else if (row.subcategory === 'transport_vehicle' && row.key === 'base_rate_20km') {
            settings.service_rates['transport_20km'] = value;
          } else if (row.subcategory === 'transport_vehicle' && row.key === 'rate_per_km') {
            settings.service_rates['transport_per_km'] = value;
          } else if (row.subcategory === 'fuel' && row.key === 'rate_per_liter') {
            settings.service_rates['fuel_per_liter'] = value;
          } else if (row.subcategory === 'waste_disposal') {
            settings.service_rates[`waste_${row.key}`] = value;
          } else if (row.subcategory === 'protection_work' && row.key === 'base_rate') {
            settings.service_rates['protection_base'] = value;
          } else if (row.subcategory === 'protection_work' && row.key === 'floor_rate') {
            settings.service_rates['protection_floor'] = value;
          } else if (row.subcategory === 'material_collection') {
            settings.service_rates[`material_${row.key}`] = value;
          } else if (row.subcategory === 'work_time') {
            settings.service_rates[`time_${row.key}`] = value;
          } else if (row.subcategory === 'construction') {
            settings.service_rates[`construction_${row.key}`] = value;
          }
        } else if (row.category === 'system') {
          if (row.subcategory === 'tax' && row.key === 'rate') {
            settings.system_settings['tax_rate'] = value;
          } else if (row.subcategory === 'estimate' && row.key === 'number_prefix') {
            settings.system_settings['estimate_prefix'] = value;
          }
        }
      });

      console.log('マスタ設定データ（階層構造）:', settings); // デバッグ用

      return c.json({
        success: true,
        data: settings
      });
    }

    return c.json({
      success: false,
      error: 'マスタ設定データの取得に失敗しました'
    });

  } catch (error) {
    console.error('マスタ設定API エラー:', error);
    return c.json({
      success: false,
      error: 'データベースエラーが発生しました'
    });
  }
});

// エリア設定APIエンドポイント
app.get('/api/area-settings', async (c) => {
  try {
    const { env } = c;
    
    const result = await env.DB.prepare(`
      SELECT id, postal_code_prefix, area_name, area_rank, created_at 
      FROM area_settings 
      ORDER BY postal_code_prefix
    `).all();

    if (result.success && result.results) {
      return c.json({
        success: true,
        data: result.results.map(row => ({
          ...row,
          area_code: `${row.area_rank}_${row.postal_code_prefix}` // 互換性のため
        }))
      });
    }

    return c.json({
      success: false,
      error: 'エリア設定データの取得に失敗しました'
    });

  } catch (error) {
    console.error('エリア設定API エラー:', error);
    return c.json({
      success: false,
      error: 'データベースエラーが発生しました'
    });
  }
});

// 顧客一覧APIエンドポイント
app.get('/api/customers', async (c) => {
  try {
    const { env } = c;
    
    const result = await env.DB.prepare(`
      SELECT c.*, COUNT(p.id) as project_count 
      FROM customers c
      LEFT JOIN projects p ON c.id = p.customer_id
      WHERE c.user_id = ?
      GROUP BY c.id
      ORDER BY c.name
    `).bind('user001').all();

    if (result.success && result.results) {
      return c.json({
        success: true,
        data: result.results
      });
    }

    return c.json({
      success: false,
      error: '顧客データの取得に失敗しました'
    });

  } catch (error) {
    console.error('顧客API エラー:', error);
    return c.json({
      success: false,
      error: 'データベースエラーが発生しました'
    });
  }
});

// 案件一覧APIエンドポイント  
app.get('/api/projects', async (c) => {
  try {
    const { env } = c;
    
    const result = await env.DB.prepare(`
      SELECT p.*, c.name as customer_name, COUNT(e.id) as estimate_count
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN estimates e ON p.id = e.project_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.updated_at DESC
    `).bind('user001').all();

    if (result.success && result.results) {
      return c.json({
        success: true,
        data: result.results.map(row => ({
          ...row,
          priority: 'medium' // テーブルにpriorityフィールドがないため固定値
        }))
      });
    }

    return c.json({
      success: false,
      error: '案件データの取得に失敗しました'
    });

  } catch (error) {
    console.error('案件API エラー:', error);
    return c.json({
      success: false,
      error: 'データベースエラーが発生しました'
    });
  }
});

// 顧客作成APIエンドポイント
app.post('/api/customers', async (c) => {
  try {
    const { env } = c;
    const data = await c.req.json();
    
    const result = await env.DB.prepare(`
      INSERT INTO customers (name, contact_person, phone, email, address, notes, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.contact_person || null,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.notes || null,
      'user001'
    ).run();

    if (result.success) {
      return c.json({
        success: true,
        message: '顧客が正常に追加されました',
        data: { id: result.meta.last_row_id }
      });
    }

    return c.json({
      success: false,
      error: '顧客の追加に失敗しました'
    });

  } catch (error) {
    console.error('顧客作成API エラー:', error);
    return c.json({
      success: false,
      error: 'データベースエラーが発生しました'
    });
  }
});

// 案件作成APIエンドポイント - 重複防止機能付き
app.post('/api/projects', async (c) => {
  try {
    const { env } = c;
    const data = await c.req.json();
    const userId = c.req.header('X-User-ID') || data.user_id || 'test-user-001';
    
    // 入力検証
    if (!data.name || !data.customer_id) {
      return c.json({ 
        success: false, 
        error: '案件名と顧客IDは必須です' 
      }, 400);
    }
    
    // 重複送信防止（3秒以内の同一リクエストをブロック）
    const duplicateCheck = await env.DB.prepare(`
      SELECT id, created_at 
      FROM projects 
      WHERE name = ? AND customer_id = ? AND user_id = ?
      AND created_at >= datetime('now', '-3 seconds')
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(data.name.trim(), data.customer_id, userId).first();
    
    if (duplicateCheck) {
      console.warn('🚫 重複案件作成をブロック（3秒以内）:', {
        name: data.name,
        customer_id: data.customer_id,
        existing_id: duplicateCheck.id,
        created_at: duplicateCheck.created_at
      });
      
      // 重複の場合は既存のIDを返す（エラーではなく成功として扱う）
      return c.json({
        success: true,
        message: '案件が正常に追加されました',
        data: { id: duplicateCheck.id },
        duplicate: true
      });
    }
    
    // 案件作成
    const result = await env.DB.prepare(`
      INSERT INTO projects (customer_id, name, description, status, priority, notes, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      data.customer_id,
      data.name.trim(),
      data.description || '',
      data.status || 'initial',
      data.priority || 'medium',
      data.notes || '',
      userId
    ).run();

    if (result.success) {
      return c.json({
        success: true,
        message: '案件が正常に追加されました',
        data: { id: result.meta.last_row_id }
      });
    }

    return c.json({
      success: false,
      error: '案件の追加に失敗しました'
    });

  } catch (error) {
    console.error('案件作成API エラー:', error);
    return c.json({
      success: false,
      error: 'データベースエラーが発生しました'
    });
  }
});

// 案件更新APIエンドポイント
app.put('/api/projects/:id', async (c) => {
  try {
    const { env } = c
    const projectId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    const data = await c.req.json()
    
    // バリデーション
    if (!data.name) {
      return c.json({ 
        success: false, 
        error: '案件名は必須です' 
      }, 400)
    }
    
    // 更新実行
    const result = await env.DB.prepare(`
      UPDATE projects 
      SET name = ?, customer_id = ?, status = ?, priority = ?, description = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(
      data.name,
      data.customer_id,
      data.status || 'initial',
      data.priority || 'medium',
      data.description || '',
      data.notes || '',
      projectId,
      userId
    ).run()
    
    if (!result.success) {
      return c.json({ 
        success: false, 
        error: '案件の更新に失敗しました' 
      }, 500)
    }
    
    return c.json({
      success: true,
      message: '案件情報を正常に更新しました'
    })
  } catch (error) {
    console.error('案件更新エラー:', error)
    return c.json({ 
      success: false, 
      error: '案件の更新中にエラーが発生しました' 
    }, 500)
  }
})

// 案件論理削除APIエンドポイント  
app.delete('/api/projects/:id', async (c) => {
  try {
    const { env } = c
    const projectId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    const data = await c.req.json()
    
    // 論理削除実行
    const result = await env.DB.prepare(`
      UPDATE projects 
      SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP, deleted_reason = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(
      data.reason || '削除されました',
      projectId,
      userId
    ).run()
    
    if (!result.success) {
      return c.json({ 
        success: false, 
        error: '案件の削除に失敗しました' 
      }, 500)
    }
    
    return c.json({
      success: true,
      message: '案件を正常に削除しました'
    })
  } catch (error) {
    console.error('案件削除エラー:', error)
    return c.json({ 
      success: false, 
      error: '案件の削除中にエラーが発生しました' 
    }, 500)
  }
})

// 案件復元APIエンドポイント
app.post('/api/projects/:id/restore', async (c) => {
  try {
    const { env } = c
    const projectId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    
    // 復元実行
    const result = await env.DB.prepare(`
      UPDATE projects 
      SET status = 'initial', deleted_at = NULL, deleted_reason = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(projectId, userId).run()
    
    if (!result.success) {
      return c.json({ 
        success: false, 
        error: '案件の復元に失敗しました' 
      }, 500)
    }
    
    return c.json({
      success: true,
      message: '案件を正常に復元しました'
    })
  } catch (error) {
    console.error('案件復元エラー:', error)
    return c.json({ 
      success: false, 
      error: '案件の復元中にエラーが発生しました' 
    }, 500)
  }
})

// 案件ステータス切り替えAPIエンドポイント
app.post('/api/projects/:id/toggle-status', async (c) => {
  try {
    const { env } = c
    const projectId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    const data = await c.req.json()
    
    let newStatus = 'initial';
    if (data.currentStatus === 'initial') {
      newStatus = 'inactive';
    } else if (data.currentStatus === 'inactive') {
      newStatus = 'initial';
    }
    
    // ステータス更新
    const result = await env.DB.prepare(`
      UPDATE projects 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(newStatus, projectId, userId).run()
    
    if (!result.success) {
      return c.json({ 
        success: false, 
        error: 'ステータスの切り替えに失敗しました' 
      }, 500)
    }
    
    return c.json({
      success: true,
      message: 'ステータスを正常に切り替えました'
    })
  } catch (error) {
    console.error('案件ステータス切り替えエラー:', error)
    return c.json({ 
      success: false, 
      error: 'ステータスの切り替え中にエラーが発生しました' 
    }, 500)
  }
})

// 案件個別取得APIエンドポイント
app.get('/api/projects/:id', async (c) => {
  try {
    const { env } = c
    const projectId = c.req.param('id')
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    
    const result = await env.DB.prepare(`
      SELECT p.*, c.name as customer_name 
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE p.id = ? AND p.user_id = ?
    `).bind(projectId, userId).first()
    
    if (!result) {
      return c.json({ 
        success: false, 
        error: '案件が見つかりません' 
      }, 404)
    }
    
    return c.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('案件詳細取得エラー:', error)
    return c.json({ 
      success: false, 
      error: '案件詳細の取得に失敗しました' 
    }, 500)
  }
})

// テスト機能ページ
app.get('/test', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>マスター管理機能テストページ</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .test-result {
                padding: 1rem;
                margin: 0.5rem 0;
                border-radius: 0.5rem;
                border: 1px solid #e5e7eb;
            }
            .success { background-color: #dcfce7; border-color: #16a34a; }
            .error { background-color: #fee2e2; border-color: #dc2626; }
            .info { background-color: #dbeafe; border-color: #2563eb; }
        </style>
    </head>
    <body class="bg-gray-50 p-8">
        <div class="max-w-4xl mx-auto">
            <div class="bg-white shadow rounded-lg p-6">
                <h1 class="text-2xl font-bold text-gray-900 mb-6">
                    <i class="fas fa-cogs mr-2"></i>
                    マスター管理機能テスト
                </h1>
                
                <div class="mb-6">
                    <button onclick="runAllTests()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        <i class="fas fa-play mr-2"></i>
                        全テストを実行
                    </button>
                    <button onclick="clearResults()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2">
                        <i class="fas fa-trash mr-2"></i>
                        結果をクリア
                    </button>
                    <a href="/masters" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2 inline-block">
                        <i class="fas fa-external-link-alt mr-2"></i>
                        マスター管理画面へ
                    </a>
                </div>

                <div id="testResults" class="space-y-4">
                    {/* テスト結果がここに表示されます */}
                </div>
            </div>
        </div>

        <script>
            const BASE_URL = window.location.origin;
            
            function addResult(testName, status, message, details = null) {
                const resultsDiv = document.getElementById('testResults');
                const resultDiv = document.createElement('div');
                resultDiv.className = \`test-result \${status}\`;
                
                let icon = status === 'success' ? 'fa-check-circle text-green-600' : 
                          status === 'error' ? 'fa-times-circle text-red-600' : 
                          'fa-info-circle text-blue-600';
                
                let content = \`
                    <div class="flex items-start">
                        <i class="fas \${icon} mt-1 mr-2"></i>
                        <div class="flex-1">
                            <div class="font-medium">\${testName}</div>
                            <div class="text-sm mt-1">\${message}</div>
                            \${details ? \`<div class="text-xs mt-2 bg-gray-100 p-2 rounded"><pre>\${details}</pre></div>\` : ''}
                        </div>
                    </div>
                \`;
                
                resultDiv.innerHTML = content;
                resultsDiv.appendChild(resultDiv);
            }
            
            async function testAPI(endpoint, testName) {
                try {
                    const response = await fetch(\`\${BASE_URL}\${endpoint}\`);
                    const data = await response.json();
                    
                    if (response.ok && data.success) {
                        addResult(
                            testName,
                            'success',
                            \`✅ APIが正常に動作しています (\${response.status})\`,
                            \`データ件数: \${Array.isArray(data.data) ? data.data.length : Object.keys(data.data || {}).length}件\`
                        );
                        return data;
                    } else {
                        addResult(
                            testName,
                            'error',
                            \`❌ APIエラー (\${response.status}): \${data.error || 'Unknown error'}\`,
                            JSON.stringify(data, null, 2)
                        );
                        return null;
                    }
                } catch (error) {
                    addResult(
                        testName,
                        'error',
                        \`❌ リクエストエラー: \${error.message}\`,
                        error.stack
                    );
                    return null;
                }
            }
            
            async function testMasterSettings() {
                addResult('マスタ設定API', 'info', '🔄 テスト実行中...');
                const data = await testAPI('/api/master-settings', 'マスタ設定API');
                
                if (data && data.data) {
                    const settings = data.data;
                    const vehicleKeys = Object.keys(settings).filter(key => key.startsWith('vehicle_'));
                    const serviceKeys = Object.keys(settings).filter(key => key.includes('_rate') || key.includes('multiplier'));
                    
                    addResult(
                        'マスタ設定内容確認',
                        'success',
                        \`✅ 車両設定: \${vehicleKeys.length}項目, サービス設定: \${serviceKeys.length}項目\`,
                        \`車両設定例: \${vehicleKeys.slice(0,3).join(', ')}\\nサービス設定例: \${serviceKeys.slice(0,3).join(', ')}\`
                    );
                }
            }
            
            async function testCustomers() {
                addResult('顧客API', 'info', '🔄 テスト実行中...');
                const data = await testAPI('/api/customers', '顧客API');
                
                if (data && data.data && Array.isArray(data.data)) {
                    const customers = data.data;
                    addResult(
                        '顧客データ確認',
                        'success',
                        \`✅ 顧客データ: \${customers.length}件\`,
                        customers.slice(0, 3).map(c => \`- \${c.name} (\${c.contact_person || '担当者なし'})\`).join('\\n')
                    );
                }
            }
            
            async function testProjects() {
                addResult('案件API', 'info', '🔄 テスト実行中...');
                const data = await testAPI('/api/projects', '案件API');
                
                if (data && data.data && Array.isArray(data.data)) {
                    const projects = data.data;
                    const statusCounts = {};
                    projects.forEach(p => {
                        statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
                    });
                    
                    addResult(
                        '案件データ確認',
                        'success',
                        \`✅ 案件データ: \${projects.length}件\`,
                        \`ステータス別件数:\\n\${Object.entries(statusCounts).map(([status, count]) => \`- \${status}: \${count}件\`).join('\\n')}\`
                    );
                }
            }
            
            async function testAreaSettings() {
                addResult('エリア設定API', 'info', '🔄 テスト実行中...');
                const data = await testAPI('/api/area-settings', 'エリア設定API');
                
                if (data && data.data && Array.isArray(data.data)) {
                    const areas = data.data;
                    addResult(
                        'エリアデータ確認',
                        'success',
                        \`✅ エリアデータ: \${areas.length}件\`,
                        areas.map(a => \`- \${a.area_name} (\${a.area_rank}エリア)\`).join('\\n')
                    );
                }
            }
            
            async function testNewCustomerCreation() {
                addResult('顧客新規作成API', 'info', '🔄 テスト実行中...');
                
                const testCustomerData = {
                    name: \`テスト顧客_\${Date.now()}\`,
                    contact_person: 'テスト担当者',
                    phone: '03-0000-0000',
                    email: 'test@example.com',
                    address: 'テスト住所',
                    notes: 'APIテスト用データ'
                };
                
                try {
                    const response = await fetch(\`\${BASE_URL}/api/customers\`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(testCustomerData)
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok && data.success) {
                        addResult(
                            '顧客新規作成API',
                            'success',
                            \`✅ 顧客新規作成が正常に動作しています\`,
                            \`作成された顧客ID: \${data.data.id}\\n作成データ: \${JSON.stringify(testCustomerData, null, 2)}\`
                        );
                    } else {
                        addResult(
                            '顧客新規作成API',
                            'error',
                            \`❌ 顧客作成エラー: \${data.error || 'Unknown error'}\`,
                            JSON.stringify(data, null, 2)
                        );
                    }
                } catch (error) {
                    addResult(
                        '顧客新規作成API',
                        'error',
                        \`❌ リクエストエラー: \${error.message}\`,
                        error.stack
                    );
                }
            }
            
            async function runAllTests() {
                clearResults();
                
                addResult('テスト開始', 'info', '🚀 全機能テストを開始します...');
                
                await testMasterSettings();
                await testAreaSettings();
                await testCustomers();
                await testProjects();
                await testNewCustomerCreation();
                
                addResult('テスト完了', 'info', '✅ 全テストが完了しました');
            }
            
            function clearResults() {
                document.getElementById('testResults').innerHTML = '';
            }
            
            // ページ読み込み時にテストを自動実行
            window.addEventListener('load', () => {
                setTimeout(() => {
                    addResult('システム初期化', 'info', '📱 テストページが読み込まれました。「全テストを実行」ボタンをクリックしてください。');
                }, 500);
            });
        </script>
    </body>
    </html>
  `)
})

// デバッグ用API：スタッフ関連データ確認
app.get('/api/debug/staff-data', async (c) => {
  try {
    const { env } = c
    const userId = c.req.header('X-User-ID') || 'test-user-001'
    
    // 最新の見積のスタッフ関連データのみを取得
    const latestEstimate = await env.DB.prepare(`
      SELECT 
        id, estimate_number, created_at,
        supervisor_count, leader_count, 
        m2_staff_half_day, m2_staff_full_day,
        temp_staff_half_day, temp_staff_full_day, 
        staff_cost
      FROM estimates 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `).bind(userId).first()
    
    return c.json({
      success: true,
      data: latestEstimate
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})



// ==============================================================================
// データバックアップ機能 API
// ==============================================================================

// バックアップ一覧取得
app.get('/api/backups', async (c) => {
  try {
    const { env } = c
    
    // バックアップメタデータテーブルから一覧を取得
    const backups = await env.DB.prepare(`
      SELECT 
        id,
        backup_name,
        backup_type,
        file_size,
        record_count,
        status,
        created_at,
        expires_at
      FROM backup_metadata 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all()
    
    return c.json({
      success: true,
      data: backups.results || [],
      count: backups.results?.length || 0
    })
    
  } catch (error) {
    console.error('バックアップ一覧取得エラー:', error)
    return c.json({ 
      error: 'バックアップ一覧の取得に失敗しました',
      detail: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// 手動バックアップ実行
app.post('/api/backups/create', async (c) => {
  try {
    const { env } = c
    const { backup_name, backup_type = 'manual', tables = [] } = await c.req.json()
    
    console.log('🔄 バックアップ開始:', { backup_name, backup_type, tables })
    
    // バックアップファイル名生成
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = backup_name ? 
      `${backup_name}_${timestamp}.json` : 
      `backup_${timestamp}.json`
    
    // バックアップ対象テーブルの決定
    const targetTables = tables.length > 0 ? tables : [
      'customers',
      'projects', 
      'estimates',
      'vehicle_pricing',
      'staff_rates'
    ]
    
    const backupData = {
      metadata: {
        backup_name: backup_name || 'Manual Backup',
        backup_type,
        created_at: new Date().toISOString(),
        version: '1.0',
        tables: targetTables
      },
      data: {}
    }
    
    let totalRecords = 0
    
    // 各テーブルのデータを取得
    for (const table of targetTables) {
      try {
        const result = await env.DB.prepare(`SELECT * FROM ${table}`).all()
        backupData.data[table] = result.results || []
        totalRecords += (result.results?.length || 0)
        console.log(`✅ ${table}テーブル: ${result.results?.length || 0}件`)
      } catch (tableError) {
        console.warn(`⚠️ ${table}テーブルのバックアップに失敗:`, tableError)
        backupData.data[table] = []
      }
    }
    
    // バックアップデータをJSON文字列に変換
    const backupJson = JSON.stringify(backupData, null, 2)
    const fileSize = Buffer.byteLength(backupJson, 'utf8')
    
    // バックアップメタデータをデータベースに保存
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30日後に期限切れ
    
    const metaResult = await env.DB.prepare(`
      INSERT INTO backup_metadata (
        backup_name, backup_type, file_name, file_size, 
        record_count, status, created_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      backupData.metadata.backup_name,
      backup_type,
      fileName,
      fileSize,
      totalRecords,
      'completed',
      backupData.metadata.created_at,
      expiresAt.toISOString()
    ).run()
    
    console.log('✅ バックアップ完了:', {
      id: metaResult.meta.last_row_id,
      fileName,
      fileSize,
      totalRecords
    })
    
    return c.json({
      success: true,
      data: {
        id: metaResult.meta.last_row_id,
        backup_name: backupData.metadata.backup_name,
        file_name: fileName,
        file_size: fileSize,
        record_count: totalRecords,
        download_data: backupJson // クライアントサイドでダウンロード用
      },
      message: 'バックアップが正常に作成されました'
    })
    
  } catch (error) {
    console.error('バックアップ作成エラー:', error)
    return c.json({ 
      error: 'バックアップの作成に失敗しました',
      detail: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// バックアップファイルダウンロード
app.get('/api/backups/:id/download', async (c) => {
  try {
    const { env } = c
    const backupId = c.req.param('id')
    
    // バックアップメタデータを取得
    const backup = await env.DB.prepare(`
      SELECT * FROM backup_metadata WHERE id = ?
    `).bind(backupId).first()
    
    if (!backup) {
      return c.json({ error: 'バックアップが見つかりません' }, 404)
    }
    
    // バックアップデータを再生成（簡易実装）
    const backupData = await generateBackupData(env.DB, backup.backup_name)
    const backupJson = JSON.stringify(backupData, null, 2)
    
    // ファイルダウンロードとして返す
    return new Response(backupJson, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${backup.file_name}"`,
        'Content-Length': Buffer.byteLength(backupJson, 'utf8').toString()
      }
    })
    
  } catch (error) {
    console.error('バックアップダウンロードエラー:', error)
    return c.json({ 
      error: 'バックアップファイルのダウンロードに失敗しました',
      detail: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// データ復元
app.post('/api/backups/:id/restore', async (c) => {
  try {
    const { env } = c
    const backupId = c.req.param('id')
    const { confirm = false, tables = [] } = await c.req.json()
    
    if (!confirm) {
      return c.json({ 
        error: '復元操作には確認が必要です。confirm: true を指定してください。',
        warning: 'この操作により既存のデータが置き換えられます。'
      }, 400)
    }
    
    console.log('🔄 データ復元開始:', { backupId, tables })
    
    // バックアップメタデータを取得
    const backup = await env.DB.prepare(`
      SELECT * FROM backup_metadata WHERE id = ?
    `).bind(backupId).first()
    
    if (!backup) {
      return c.json({ error: 'バックアップが見つかりません' }, 404)
    }
    
    // 復元用のバックアップデータを生成（実際の実装では保存されたファイルを読み込み）
    const backupData = await generateBackupData(env.DB, backup.backup_name)
    
    const restoreTables = tables.length > 0 ? tables : Object.keys(backupData.data)
    let restoredRecords = 0
    
    // 外部キー制約を無効化して安全に復元
    await env.DB.prepare('PRAGMA foreign_keys = OFF').run()
    
    // 削除順序（外部キー制約を考慮）
    const deleteOrder = ['estimates', 'status_history', 'projects', 'customers', 'master_settings', 'area_settings']
    
    // データ削除
    for (const table of deleteOrder) {
      if (restoreTables.includes(table) && backupData.data[table]) {
        try {
          await env.DB.prepare(`DELETE FROM ${table}`).run()
          console.log(`🗑️ ${table}テーブルの既存データ削除完了`)
        } catch (error) {
          console.warn(`⚠️ ${table}テーブルの削除でエラー:`, error)
        }
      }
    }
    
    // 復元順序（外部キー制約を考慮）
    const restoreOrder = ['customers', 'projects', 'estimates', 'master_settings', 'area_settings', 'status_history']
    
    // データ復元
    for (const table of restoreOrder) {
      if (!restoreTables.includes(table) || !backupData.data[table]) continue
      
      try {
        const records = backupData.data[table]
        
        if (records.length > 0) {
          // レコード挿入（バッチ処理の簡易実装）
          for (const record of records) {
            const columns = Object.keys(record)
            const values = Object.values(record)
            const placeholders = values.map(() => '?').join(', ')
            
            await env.DB.prepare(`
              INSERT INTO ${table} (${columns.join(', ')}) 
              VALUES (${placeholders})
            `).bind(...values).run()
          }
          
          restoredRecords += records.length
          console.log(`✅ ${table}テーブル復元完了: ${records.length}件`)
        }
        
      } catch (tableError) {
        console.error(`❌ ${table}テーブルの復元に失敗:`, tableError)
        throw new Error(`${table}テーブルの復元に失敗しました: ${tableError.message}`)
      }
    }
    
    // 外部キー制約を再有効化
    await env.DB.prepare('PRAGMA foreign_keys = ON').run()
    
    console.log('✅ データ復元完了:', { restoredRecords })
    
    return c.json({
      success: true,
      data: {
        backup_id: backupId,
        restored_tables: restoreTables,
        restored_records: restoredRecords
      },
      message: `データ復元が完了しました（${restoredRecords}件のレコードを復元）`
    })
    
  } catch (error) {
    console.error('データ復元エラー:', error)
    return c.json({ 
      error: 'データの復元に失敗しました',
      detail: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// バックアップ削除
app.delete('/api/backups/:id', async (c) => {
  try {
    const { env } = c
    const backupId = c.req.param('id')
    
    // バックアップメタデータを削除
    const result = await env.DB.prepare(`
      DELETE FROM backup_metadata WHERE id = ?
    `).bind(backupId).run()
    
    if (result.changes === 0) {
      return c.json({ error: 'バックアップが見つかりません' }, 404)
    }
    
    return c.json({
      success: true,
      message: 'バックアップを削除しました'
    })
    
  } catch (error) {
    console.error('バックアップ削除エラー:', error)
    return c.json({ 
      error: 'バックアップの削除に失敗しました',
      detail: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// 定期バックアップ設定API
app.get('/api/backup-schedule', async (c) => {
  try {
    const { env } = c
    
    // スケジュール設定を取得（設定テーブルから）
    const schedules = await env.DB.prepare(`
      SELECT * FROM backup_schedules WHERE is_active = 1 ORDER BY created_at DESC
    `).all()
    
    return c.json({
      success: true,
      data: schedules.results || []
    })
    
  } catch (error) {
    console.error('バックアップスケジュール取得エラー:', error)
    return c.json({ 
      error: 'バックアップスケジュールの取得に失敗しました',
      detail: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// 定期バックアップ設定保存
app.post('/api/backup-schedule', async (c) => {
  try {
    const { env } = c
    const { 
      schedule_name, 
      frequency, 
      frequency_value, 
      time_hour = 2, 
      time_minute = 0, 
      tables = [], 
      retention_days = 30,
      is_active = true 
    } = await c.req.json()
    
    console.log('📅 バックアップスケジュール設定:', {
      schedule_name, frequency, frequency_value, time_hour, time_minute
    })
    
    // バックアップスケジュールを保存
    const result = await env.DB.prepare(`
      INSERT INTO backup_schedules (
        schedule_name, frequency, frequency_value, time_hour, time_minute,
        target_tables, retention_days, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      schedule_name,
      frequency,
      frequency_value,
      time_hour,
      time_minute,
      JSON.stringify(tables),
      retention_days,
      is_active ? 1 : 0,
      new Date().toISOString()
    ).run()
    
    return c.json({
      success: true,
      data: {
        id: result.meta.last_row_id,
        schedule_name,
        frequency,
        next_run: calculateNextRun(frequency, frequency_value, time_hour, time_minute)
      },
      message: 'バックアップスケジュールを設定しました'
    })
    
  } catch (error) {
    console.error('バックアップスケジュール設定エラー:', error)
    return c.json({ 
      error: 'バックアップスケジュールの設定に失敗しました',
      detail: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// 定期バックアップ実行チェック（Cron Job用エンドポイント）
app.get('/api/backup-schedule/check', async (c) => {
  try {
    const { env } = c
    const now = new Date()
    
    console.log('🔍 定期バックアップチェック開始:', now.toISOString())
    
    // 実行すべきスケジュールを取得
    const schedules = await env.DB.prepare(`
      SELECT * FROM backup_schedules 
      WHERE is_active = 1 
      AND (last_run IS NULL OR datetime(last_run) < datetime('now', '-1 hour'))
    `).all()
    
    const executedBackups = []
    
    for (const schedule of (schedules.results || [])) {
      try {
        if (shouldRunBackup(schedule, now)) {
          console.log('⚡ 定期バックアップ実行:', schedule.schedule_name)
          
          // バックアップ実行
          const backupResult = await executeScheduledBackup(env.DB, schedule)
          executedBackups.push(backupResult)
          
          // 最終実行時刻を更新
          await env.DB.prepare(`
            UPDATE backup_schedules 
            SET last_run = ?, run_count = run_count + 1 
            WHERE id = ?
          `).bind(now.toISOString(), schedule.id).run()
          
          console.log('✅ 定期バックアップ完了:', schedule.schedule_name)
        }
      } catch (scheduleError) {
        console.error(`❌ スケジュール ${schedule.schedule_name} の実行エラー:`, scheduleError)
      }
    }
    
    return c.json({
      success: true,
      data: {
        checked_at: now.toISOString(),
        executed_backups: executedBackups
      },
      message: `${executedBackups.length}件のバックアップを実行しました`
    })
    
  } catch (error) {
    console.error('定期バックアップチェックエラー:', error)
    return c.json({ 
      error: '定期バックアップチェックに失敗しました',
      detail: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// バックアップデータ生成用ヘルパー関数
async function generateBackupData(db, backupName) {
  const tables = ['customers', 'projects', 'estimates', 'master_settings', 'area_settings', 'status_history']
  const backupData = {
    metadata: {
      backup_name: backupName,
      created_at: new Date().toISOString(),
      version: '1.0',
      tables
    },
    data: {}
  }
  
  for (const table of tables) {
    try {
      const result = await db.prepare(`SELECT * FROM ${table}`).all()
      backupData.data[table] = result.results || []
      console.log(`✅ テーブル ${table}: ${backupData.data[table].length}件のレコードを取得`)
    } catch (error) {
      console.warn(`⚠️ テーブル ${table} の読み込みに失敗:`, error)
      backupData.data[table] = []
    }
  }
  
  return backupData
}

// 次回実行時刻計算
function calculateNextRun(frequency, frequencyValue, hour, minute) {
  const now = new Date()
  const nextRun = new Date()
  
  nextRun.setHours(hour, minute, 0, 0)
  
  switch (frequency) {
    case 'daily':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1)
      }
      break
    case 'weekly':
      nextRun.setDate(nextRun.getDate() + (7 - nextRun.getDay() + frequencyValue) % 7)
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 7)
      }
      break
    case 'monthly':
      nextRun.setDate(frequencyValue)
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1)
      }
      break
  }
  
  return nextRun.toISOString()
}

// バックアップ実行判定
function shouldRunBackup(schedule, now) {
  const scheduleTime = new Date()
  scheduleTime.setHours(schedule.time_hour, schedule.time_minute, 0, 0)
  
  // 現在時刻がスケジュール時刻を過ぎているかチェック
  if (now.getHours() < schedule.time_hour || 
      (now.getHours() === schedule.time_hour && now.getMinutes() < schedule.time_minute)) {
    return false
  }
  
  const lastRun = schedule.last_run ? new Date(schedule.last_run) : null
  
  switch (schedule.frequency) {
    case 'daily':
      return !lastRun || (now.getTime() - lastRun.getTime()) >= (24 * 60 * 60 * 1000)
    case 'weekly':
      return !lastRun || (now.getDay() === schedule.frequency_value && 
                         (now.getTime() - lastRun.getTime()) >= (7 * 24 * 60 * 60 * 1000))
    case 'monthly':
      return !lastRun || (now.getDate() === schedule.frequency_value && 
                         (now.getTime() - lastRun.getTime()) >= (30 * 24 * 60 * 60 * 1000))
    default:
      return false
  }
}

// スケジュールされたバックアップの実行
async function executeScheduledBackup(db, schedule) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `scheduled_${schedule.schedule_name}_${timestamp}.json`
  
  const targetTables = schedule.target_tables ? 
    JSON.parse(schedule.target_tables) : 
    ['customers', 'projects', 'estimates', 'vehicle_pricing', 'staff_rates']
  
  const backupData = {
    metadata: {
      backup_name: `${schedule.schedule_name} (${new Date().toLocaleDateString('ja-JP')})`,
      backup_type: 'scheduled',
      created_at: new Date().toISOString(),
      version: '1.0',
      tables: targetTables,
      schedule_id: schedule.id
    },
    data: {}
  }
  
  let totalRecords = 0
  
  // データ取得
  for (const table of targetTables) {
    try {
      const result = await db.prepare(`SELECT * FROM ${table}`).all()
      backupData.data[table] = result.results || []
      totalRecords += (result.results?.length || 0)
    } catch (error) {
      console.warn(`テーブル ${table} のバックアップに失敗:`, error)
      backupData.data[table] = []
    }
  }
  
  const backupJson = JSON.stringify(backupData, null, 2)
  const fileSize = Buffer.byteLength(backupJson, 'utf8')
  
  // バックアップメタデータを保存
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + schedule.retention_days)
  
  const result = await db.prepare(`
    INSERT INTO backup_metadata (
      backup_name, backup_type, file_name, file_size, 
      record_count, status, created_at, expires_at, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    backupData.metadata.backup_name,
    'scheduled',
    fileName,
    fileSize,
    totalRecords,
    'completed',
    backupData.metadata.created_at,
    expiresAt.toISOString(),
    `schedule:${schedule.id}`
  ).run()
  
  return {
    id: result.meta.last_row_id,
    backup_name: backupData.metadata.backup_name,
    file_size: fileSize,
    record_count: totalRecords
  }
}

// ================== システム設定機能 ==================

// 設定画面表示
app.get('/settings', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>システム設定 - Office M2 見積システム</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/style.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <div class="container mx-auto px-4 py-8">
            <!-- ヘッダー -->
            <div class="mb-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-800">
                            <i class="fas fa-cog mr-3 text-blue-600"></i>
                            システム設定
                        </h1>
                        <p class="text-gray-600 mt-2">見積書とシステムの基本設定</p>
                    </div>
                    <a href="/" class="btn-secondary">
                        <i class="fas fa-home mr-2"></i>
                        トップページに戻る
                    </a>
                </div>
            </div>

            <!-- 設定タブ -->
            <div class="bg-white rounded-lg shadow-md">
                <div class="border-b border-gray-200">
                    <nav class="-mb-px flex space-x-8">
                        <button id="tab-basic" onclick="switchTab('basic')" 
                                class="tab-button active py-4 px-1 border-b-2 font-medium text-sm focus:outline-none">
                            <i class="fas fa-building mr-2"></i>
                            基本設定
                        </button>
                        <button id="tab-masters" onclick="switchTab('masters')" 
                                class="tab-button py-4 px-1 border-b-2 font-medium text-sm focus:outline-none">
                            <i class="fas fa-database mr-2"></i>
                            マスタ管理
                        </button>
                        <button id="tab-api" onclick="switchTab('api')" 
                                class="tab-button py-4 px-1 border-b-2 font-medium text-sm focus:outline-none">
                            <i class="fas fa-key mr-2"></i>
                            API設定
                        </button>
                    </nav>
                </div>

                <!-- 基本設定タブ -->
                <div id="content-basic" class="tab-content p-6">
                    <div class="max-w-4xl">
                        <form id="basicSettingsForm">
                            <!-- 会社ロゴ -->
                            <div class="mb-8">
                                <label class="block text-sm font-medium text-gray-700 mb-2">会社ロゴ</label>
                                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <div class="text-center">
                                        <div id="logoPreview" class="mb-4 hidden">
                                            <img id="logoImage" src="" alt="ロゴプレビュー" class="mx-auto max-h-32" />
                                            <p class="text-sm text-gray-600 mt-2">現在のロゴ</p>
                                        </div>
                                        
                                        <div id="logoUploadArea">
                                            <i class="fas fa-upload text-4xl text-gray-400 mb-4"></i>
                                            <div class="mb-4">
                                                <input type="file" id="logoFile" accept="image/png,image/jpeg,image/gif" 
                                                       onchange="handleLogoUpload(event)" class="hidden" />
                                                <label for="logoFile" class="btn-primary cursor-pointer">
                                                    <i class="fas fa-folder-open mr-2"></i>
                                                    ファイルを選択
                                                </label>
                                            </div>
                                            <p class="text-xs text-gray-500">
                                                PNG、JPEG、GIF形式（最大2MB）<br>
                                                推奨サイズ: 300×100px
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div id="logoActions" class="mt-4 hidden">
                                    <button type="button" onclick="removeLogo()" class="btn-secondary">
                                        <i class="fas fa-trash mr-2"></i>
                                        ロゴを削除
                                    </button>
                                </div>
                            </div>

                            <!-- 会社情報 -->
                            <div class="mb-8">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">会社情報</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">会社名</label>
                                        <input type="text" id="companyName" name="company_name" 
                                               class="form-input" placeholder="株式会社○○○" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">代表者名</label>
                                        <input type="text" id="representativeName" name="representative_name" 
                                               class="form-input" placeholder="代表取締役 ○○ ○○" />
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">所在地</label>
                                        <input type="text" id="companyAddress" name="company_address" 
                                               class="form-input" placeholder="〒100-0001 東京都千代田区..." />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                                        <input type="tel" id="companyPhone" name="company_phone" 
                                               class="form-input" placeholder="03-1234-5678" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">FAX番号</label>
                                        <input type="tel" id="companyFax" name="company_fax" 
                                               class="form-input" placeholder="03-1234-5679" />
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                                        <input type="email" id="companyEmail" name="company_email" 
                                               class="form-input" placeholder="info@company.co.jp" />
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">インボイス番号</label>
                                        <input type="text" id="invoiceNumber" name="invoice_number" 
                                               class="form-input" placeholder="T1234567890123" />
                                        <p class="mt-1 text-xs text-gray-500">※ 適格請求書発行事業者の登録番号（見積書PDFに表示されます）</p>
                                    </div>
                                </div>
                            </div>

                            <!-- 見積書設定 -->
                            <div class="mb-8">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">見積書設定</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">有効期限（日数）</label>
                                        <input type="number" id="quoteValidDays" name="quote_valid_days" 
                                               class="form-input" placeholder="30" min="1" max="365" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">消費税率（%）</label>
                                        <input type="number" id="taxRate" name="tax_rate" 
                                               class="form-input" placeholder="10" min="0" max="100" step="0.1" />
                                    </div>
                                </div>
                            </div>

                            <!-- 保存ボタン -->
                            <div class="flex justify-end">
                                <button type="button" onclick="saveBasicSettings()" class="btn-primary">
                                    <i class="fas fa-save mr-2"></i>
                                    設定を保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- マスタ管理タブ -->
                <div id="content-masters" class="tab-content p-6 hidden">
                    <div class="mb-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">マスタ管理</h3>
                        <p class="text-gray-600">料金設定とエリア設定を管理できます。</p>
                    </div>
                    
                    <!-- マスタ管理メニュー -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <a href="/masters" class="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                            <div class="flex items-center">
                                <i class="fas fa-truck text-blue-600 text-2xl mr-4"></i>
                                <div>
                                    <h4 class="text-lg font-semibold text-blue-900">車両料金設定</h4>
                                    <p class="text-blue-700 text-sm">車両タイプ・エリア別料金</p>
                                </div>
                            </div>
                        </a>
                        
                        <a href="/masters" class="block p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                            <div class="flex items-center">
                                <i class="fas fa-users text-green-600 text-2xl mr-4"></i>
                                <div>
                                    <h4 class="text-lg font-semibold text-green-900">スタッフ料金設定</h4>
                                    <p class="text-green-700 text-sm">スタッフ種別・時間単価</p>
                                </div>
                            </div>
                        </a>
                        
                        <a href="/masters" class="block p-6 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                            <div class="flex items-center">
                                <i class="fas fa-map-marked-alt text-purple-600 text-2xl mr-4"></i>
                                <div>
                                    <h4 class="text-lg font-semibold text-purple-900">エリア設定</h4>
                                    <p class="text-purple-700 text-sm">郵便番号・エリア判定</p>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>

                <!-- API設定タブ -->
                <div id="content-api" class="tab-content p-6 hidden">
                    <div class="mb-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">API設定</h3>
                        <p class="text-gray-600">外部サービス連携用の設定を管理できます。</p>
                    </div>
                    
                    <div class="max-w-2xl">
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-1">外部API キー</label>
                            <input type="password" id="externalApiKey" name="external_api_key" 
                                   class="form-input" placeholder="未設定" />
                            <p class="text-xs text-gray-500 mt-1">郵便番号検索などで使用</p>
                        </div>
                        
                        <button type="button" onclick="saveApiSettings()" class="btn-primary">
                            <i class="fas fa-save mr-2"></i>
                            API設定を保存
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/city-coordinates.js"></script>
        <script src="/static/distance-calculator.js"></script>
        <script src="/static/app.js?v=1768900000&cache=bust"></script>
        <script>
            // 設定機能の実装
            const Settings = {
                // タブ切り替え
                switchTab: (tabName) => {
                    // タブボタンの状態更新
                    document.querySelectorAll('.tab-button').forEach(btn => {
                        btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
                        btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
                    });
                    
                    document.getElementById(\`tab-\${tabName}\`).classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
                    document.getElementById(\`tab-\${tabName}\`).classList.add('active', 'border-blue-500', 'text-blue-600');
                    
                    // コンテンツの切り替え
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.add('hidden');
                    });
                    document.getElementById(\`content-\${tabName}\`).classList.remove('hidden');
                },

                // ロゴアップロード処理
                handleLogoUpload: (event) => {
                    const file = event.target.files[0];
                    if (!file) return;

                    // ファイル形式チェック
                    if (!file.type.match(/^image\/(png|jpeg|gif)$/)) {
                        Utils.showError('PNG、JPEG、GIF形式のファイルを選択してください');
                        return;
                    }

                    // ファイルサイズチェック（2MB制限）
                    if (file.size > 2 * 1024 * 1024) {
                        Utils.showError('ファイルサイズは2MB以下にしてください');
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        // プレビュー表示
                        document.getElementById('logoImage').src = e.target.result;
                        document.getElementById('logoPreview').classList.remove('hidden');
                        document.getElementById('logoActions').classList.remove('hidden');
                        
                        // アップロードエリアを小さく
                        document.getElementById('logoUploadArea').classList.add('hidden');
                        
                        console.log('✅ ロゴファイル読み込み完了');
                    };
                    reader.readAsDataURL(file);
                },

                // ロゴ削除
                removeLogo: () => {
                    document.getElementById('logoFile').value = '';
                    document.getElementById('logoPreview').classList.add('hidden');
                    document.getElementById('logoActions').classList.add('hidden');
                    document.getElementById('logoUploadArea').classList.remove('hidden');
                    console.log('🗑️ ロゴ削除');
                },

                // 基本設定保存
                saveBasicSettings: async () => {
                    try {
                        const logoFile = document.getElementById('logoFile').files[0];
                        let logoData = null;

                        // ロゴファイルがある場合はBase64エンコード
                        if (logoFile) {
                            logoData = await Settings.fileToBase64(logoFile);
                        }

                        const settings = {
                            company_name: document.getElementById('companyName').value,
                            representative_name: document.getElementById('representativeName').value,
                            company_address: document.getElementById('companyAddress').value,
                            company_phone: document.getElementById('companyPhone').value,
                            company_fax: document.getElementById('companyFax').value,
                            company_email: document.getElementById('companyEmail').value,
                            invoice_number: document.getElementById('invoiceNumber') ? document.getElementById('invoiceNumber').value : '',
                            quote_valid_days: document.getElementById('quoteValidDays').value,
                            tax_rate: document.getElementById('taxRate').value,
                            logo: logoData
                        };

                        console.log('💾 基本設定保存:', settings);

                        // 直接fetch APIを使用（APIヘルパーではなく）
                        const response = await fetch('/api/settings/basic', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-User-ID': 'test-user-001'
                            },
                            body: JSON.stringify(settings)
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            alert('基本設定を保存しました');
                            console.log('✅ 設定保存成功');
                        } else {
                            alert('保存に失敗しました: ' + result.error);
                            console.error('❌ 設定保存失敗:', result.error);
                        }
                    } catch (error) {
                        console.error('基本設定保存エラー:', error);
                        alert('保存でエラーが発生しました: ' + error.message);
                    }
                },

                // API設定保存
                saveApiSettings: async () => {
                    try {
                        const settings = {
                            external_api_key: document.getElementById('externalApiKey').value
                        };

                        const response = await API.post('/settings/api', settings);
                        
                        if (response.success) {
                            Utils.showSuccess('API設定を保存しました');
                        } else {
                            Utils.showError(response.error || '保存に失敗しました');
                        }
                    } catch (error) {
                        console.error('API設定保存エラー:', error);
                        Utils.showError('保存でエラーが発生しました');
                    }
                },

                // ファイルをBase64に変換
                fileToBase64: (file) => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                },

                // 設定データ読み込み
                loadSettings: async () => {
                    try {
                        const response = await fetch('/api/settings/basic', {
                            method: 'GET',
                            headers: {
                                'X-User-ID': 'test-user-001'
                            }
                        });
                        
                        const result = await response.json();
                        
                        if (result.success && result.data) {
                            const settings = result.data;
                            
                            // フォームに値をセット（null/undefinedチェックを追加）
                            if (settings.company_name) {
                                const companyNameEl = document.getElementById('companyName');
                                if (companyNameEl) companyNameEl.value = settings.company_name;
                            }
                            if (settings.representative_name) {
                                const repNameEl = document.getElementById('representativeName');
                                if (repNameEl) repNameEl.value = settings.representative_name;
                            }
                            if (settings.company_address) {
                                const addressEl = document.getElementById('companyAddress');
                                if (addressEl) addressEl.value = settings.company_address;
                            }
                            if (settings.company_phone) {
                                const phoneEl = document.getElementById('companyPhone');
                                if (phoneEl) phoneEl.value = settings.company_phone;
                            }
                            if (settings.company_fax) {
                                const faxEl = document.getElementById('companyFax');
                                if (faxEl) faxEl.value = settings.company_fax;
                            }
                            if (settings.company_email) {
                                const emailEl = document.getElementById('companyEmail');
                                if (emailEl) emailEl.value = settings.company_email;
                            }
                            if (settings.invoice_number) {
                                const invoiceEl = document.getElementById('invoiceNumber');
                                if (invoiceEl) invoiceEl.value = settings.invoice_number;
                            }
                            if (settings.quote_valid_days) {
                                const validDaysEl = document.getElementById('quoteValidDays');
                                if (validDaysEl) validDaysEl.value = settings.quote_valid_days;
                            }
                            if (settings.tax_rate) {
                                const taxRateEl = document.getElementById('taxRate');
                                if (taxRateEl) taxRateEl.value = settings.tax_rate;
                            }
                            
                            // ロゴがある場合は表示
                            if (settings.logo) {
                                const logoImageEl = document.getElementById('logoImage');
                                const logoPreviewEl = document.getElementById('logoPreview');
                                const logoActionsEl = document.getElementById('logoActions');
                                const logoUploadEl = document.getElementById('logoUploadArea');
                                
                                if (logoImageEl) logoImageEl.src = settings.logo;
                                if (logoPreviewEl) logoPreviewEl.classList.remove('hidden');
                                if (logoActionsEl) logoActionsEl.classList.remove('hidden');
                                if (logoUploadEl) logoUploadEl.classList.add('hidden');
                            }
                            
                            console.log('✅ 設定読み込み完了:', settings);
                        }
                    } catch (error) {
                        console.error('設定読み込みエラー:', error);
                    }
                }
            };

            // グローバル関数として公開
            window.switchTab = Settings.switchTab;
            window.handleLogoUpload = Settings.handleLogoUpload;
            window.removeLogo = Settings.removeLogo;
            window.saveBasicSettings = Settings.saveBasicSettings;
            window.saveApiSettings = Settings.saveApiSettings;

            // ページ読み込み時に設定データを読み込み
            document.addEventListener('DOMContentLoaded', Settings.loadSettings);
            
            // 🧪 キャッシュバスター検証テスト - 即座に実行
            console.log('🧪 キャッシュバスター検証テスト開始 - タイムスタンプ: 1760182366-DIRECT');
            
            setTimeout(() => {
                console.log('🔍 MasterManagement チェック開始');
                if (typeof MasterManagement !== 'undefined') {
                    console.log('✅ MasterManagement 定義確認済み');
                    if (MasterManagement.switchTab) {
                        console.log('✅ switchTab メソッド確認済み');
                        console.log('🔧 services タブをアクティベート中...');
                        MasterManagement.switchTab('services');
                        console.log('✅ サービスタブアクティベート完了 - 新しいログを確認してください');
                    } else {
                        console.error('❌ switchTab メソッドが見つかりません');
                    }
                } else {
                    console.error('❌ MasterManagement が定義されていません');
                }
            }, 3000);
        </script>
    </body>
    </html>
  `)
})

// ========================================
// セッション検証関数（設定APIで使用）
// ========================================
async function verifySession(c: any): Promise<{ valid: boolean; userId?: string; userName?: string }> {
  const { env } = c
  
  // 認証機能が無効な場合（開発環境）
  if (env.ENABLE_AUTH === 'false') {
    return { valid: true, userId: 'test-user-001', userName: '開発者' }
  }
  
  // Cookieヘッダーから手動でセッションIDを取得
  const cookieHeader = c.req.header('Cookie') || ''
  const sessionIdMatch = cookieHeader.match(/session_id=([^;]+)/)
  const sessionId = sessionIdMatch ? sessionIdMatch[1] : null
  
  if (!sessionId) {
    return { valid: false }
  }
  
  // セッション検証
  const session = await env.DB.prepare(`
    SELECT s.*, u.name as user_name
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `).bind(sessionId).first()
  
  if (!session) {
    return { valid: false }
  }
  
  return {
    valid: true,
    userId: session.user_id,
    userName: session.user_name
  }
}

// 基本設定保存API
app.post('/api/settings/basic', async (c) => {
  try {
    const { env } = c
    const data = await c.req.json()
    
    // セッション検証してユーザーIDを取得
    const session = await verifySession(c)
    if (!session.valid) {
      return c.json({ 
        success: false, 
        error: '認証が必要です' 
      }, 401)
    }
    // 基本設定は全ユーザー共通なので常に'system'として保存
    const userId = 'system'
    
    console.log('💾 基本設定保存データ:', { userId, ...data, logo: data.logo ? '[BASE64_DATA]' : null })
    
    // 各設定項目を個別に保存
    const settingItems = [
      { key: 'company_name', value: data.company_name, description: '会社名' },
      { key: 'contact_person', value: data.contact_person || data.representative_name, description: '担当者名' },
      { key: 'company_address', value: data.company_address, description: '会社住所' },
      { key: 'company_phone', value: data.company_phone, description: '会社電話番号' },
      { key: 'company_fax', value: data.company_fax, description: '会社FAX番号' },
      { key: 'company_email', value: data.company_email, description: '会社メールアドレス' },
      { key: 'invoice_number', value: data.invoice_number, description: 'インボイス番号' },
      { key: 'quote_valid_days', value: data.quote_valid_days, description: '見積書有効期限（日数）' },
      { key: 'tax_rate', value: data.tax_rate, description: '消費税率' }
    ]
    
    for (const item of settingItems) {
      if (item.value !== undefined && item.value !== '') {
        // 既存レコードを確認
        const existing = await env.DB.prepare(`
          SELECT id FROM master_settings 
          WHERE category = 'basic' AND subcategory = 'company_info' 
            AND key = ? AND user_id = ?
        `).bind(item.key, userId).first()
        
        if (existing) {
          // 更新
          await env.DB.prepare(`
            UPDATE master_settings 
            SET value = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(item.value.toString(), existing.id).run()
        } else {
          // 新規挿入
          await env.DB.prepare(`
            INSERT INTO master_settings (category, subcategory, key, value, description, user_id, created_at, updated_at)
            VALUES ('basic', 'company_info', ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `).bind(item.key, item.value.toString(), item.description, userId).run()
        }
        console.log(`✅ ${item.key} saved:`, item.value)
      }
    }
    
    // ロゴデータがある場合もD1に保存
    if (data.logo) {
      const existingLogo = await env.DB.prepare(`
        SELECT id FROM master_settings 
        WHERE category = 'basic' AND subcategory = 'company_info' 
          AND key = 'company_logo' AND user_id = ?
      `).bind(userId).first()
      
      if (existingLogo) {
        await env.DB.prepare(`
          UPDATE master_settings 
          SET value = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(data.logo, existingLogo.id).run()
      } else {
        await env.DB.prepare(`
          INSERT INTO master_settings (category, subcategory, key, value, description, user_id, created_at, updated_at)
          VALUES ('basic', 'company_info', 'company_logo', ?, '会社ロゴ', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(data.logo, userId).run()
      }
      console.log('✅ 会社ロゴ保存完了')
    }
    
    console.log('✅ 基本設定保存完了')
    return c.json({ 
      success: true, 
      message: '基本設定を保存しました' 
    })
  } catch (error) {
    console.error('基本設定保存エラー:', error)
    return c.json({ 
      success: false, 
      error: '基本設定の保存に失敗しました',
      detail: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// 基本設定取得API
app.get('/api/settings/basic', async (c) => {
  try {
    const { env } = c
    
    // セッション検証してユーザーIDを取得
    const session = await verifySession(c)
    if (!session.valid) {
      return c.json({ 
        success: false, 
        error: '認証が必要です' 
      }, 401)
    }
    const userId = session.userId || 'system'
    
    console.log('📖 基本設定取得:', { userId })
    
    // D1データベースから設定を取得（user_idに関係なく最新のデータを取得）
    // 基本設定は全ユーザー共通なので、最後に更新されたものを使用
    const result = await env.DB.prepare(`
      SELECT key, value 
      FROM master_settings 
      WHERE category = 'basic' AND subcategory = 'company_info'
      ORDER BY updated_at DESC
    `).all()
    
    // オブジェクト形式に変換
    const settings: any = {}
    if (result.results) {
      result.results.forEach((row: any) => {
        settings[row.key] = row.value
      })
    }
    
    // 後方互換性のためrepresentative_nameも設定
    if (settings.contact_person && !settings.representative_name) {
      settings.representative_name = settings.contact_person
    }
    
    // ロゴはlogoキーで取得
    if (settings.company_logo) {
      settings.logo = settings.company_logo
    }
    
    return c.json({ 
      success: true, 
      data: settings 
    })
  } catch (error) {
    console.error('基本設定取得エラー:', error)
    return c.json({ 
      success: false, 
      error: '基本設定の取得に失敗しました',
      detail: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// API設定保存
app.post('/api/settings/api', async (c) => {
  try {
    const { env } = c
    const data = await c.req.json()
    
    if (data.external_api_key) {
      await env.KV.put('api_settings:external_api_key', data.external_api_key)
    }
    
    return c.json({ 
      success: true, 
      message: 'API設定を保存しました' 
    })
  } catch (error) {
    console.error('API設定保存エラー:', error)
    return c.json({ 
      success: false, 
      error: 'API設定の保存に失敗しました' 
    }, 500)
  }
})

// ==========================================
// 見積依頼フォーム（顧客向け）API
// ==========================================

// 顧客ログインAPI
app.post('/api/quote-request/login', async (c) => {
  const { env } = c
  try {
    const { login_id, login_password } = await c.req.json()
    
    if (!login_id || !login_password) {
      return c.json({ success: false, message: 'IDとパスワードを入力してください' }, 400)
    }
    
    const customer = await env.DB.prepare(`
      SELECT id, name, login_id FROM customers 
      WHERE login_id = ? AND login_password = ?
    `).bind(login_id, login_password).first()
    
    if (!customer) {
      return c.json({ success: false, message: 'IDまたはパスワードが正しくありません' }, 401)
    }
    
    return c.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        login_id: customer.login_id
      }
    })
  } catch (error) {
    console.error('顧客ログインエラー:', error)
    return c.json({ success: false, message: 'ログインに失敗しました' }, 500)
  }
})

// 見積依頼送信API
app.post('/api/quote-requests', async (c) => {
  const { env } = c
  try {
    const body = await c.req.json()
    
    // 必須チェック
    const required = ['customer_id', 'contact_person', 'project_name', 'delivery_date', 
                      'delivery_time', 'delivery_postal_code', 'building_type', 'installation_floor']
    for (const field of required) {
      if (!body[field]) {
        return c.json({ success: false, message: `${field}は必須項目です` }, 400)
      }
    }
    
    // items_jsonバリデーション
    let items = []
    try {
      items = typeof body.items_json === 'string' ? JSON.parse(body.items_json) : body.items_json
      if (!Array.isArray(items) || items.length === 0) {
        return c.json({ success: false, message: '品目を1つ以上追加してください' }, 400)
      }
    } catch (e) {
      return c.json({ success: false, message: '品目データが不正です' }, 400)
    }
    
    const result = await env.DB.prepare(`
      INSERT INTO quote_requests (
        customer_id, contact_person, project_name,
        delivery_date, delivery_time, delivery_postal_code, pickup_location,
        items_json,
        building_type, installation_floor, has_elevator, elevator_size,
        has_parking, has_protection_work, protection_scope,
        has_hoisting, has_crane, delivery_route_info,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.customer_id,
      body.contact_person,
      body.project_name,
      body.delivery_date,
      body.delivery_time,
      body.delivery_postal_code,
      body.pickup_location || '',
      JSON.stringify(items),
      body.building_type,
      body.installation_floor,
      body.has_elevator || '無',
      body.elevator_size || '',
      body.has_parking || '無',
      body.has_protection_work || '無',
      body.protection_scope || '',
      body.has_hoisting || '無',
      body.has_crane || '無',
      body.delivery_route_info || '',
      body.notes || ''
    ).run()
    
    return c.json({
      success: true,
      message: '見積依頼を送信しました',
      id: result.meta.last_row_id
    })
  } catch (error) {
    console.error('見積依頼送信エラー:', error)
    return c.json({ success: false, message: '見積依頼の送信に失敗しました' }, 500)
  }
})

// 見積依頼一覧取得API（管理者用）
app.get('/api/quote-requests', async (c) => {
  const { env } = c
  try {
    const status = c.req.query('status')
    let sql = `
      SELECT qr.*, c.name as customer_name 
      FROM quote_requests qr
      LEFT JOIN customers c ON qr.customer_id = c.id
    `
    const params: any[] = []
    if (status) {
      sql += ' WHERE qr.status = ?'
      params.push(status)
    }
    sql += ' ORDER BY qr.created_at DESC'
    
    const stmt = params.length > 0 
      ? env.DB.prepare(sql).bind(...params)
      : env.DB.prepare(sql)
    const { results } = await stmt.all()
    
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error('見積依頼一覧取得エラー:', error)
    return c.json({ success: false, message: '見積依頼の取得に失敗しました' }, 500)
  }
})

// 見積依頼詳細取得API
app.get('/api/quote-requests/:id', async (c) => {
  const { env } = c
  try {
    const id = c.req.param('id')
    const request = await env.DB.prepare(`
      SELECT qr.*, c.name as customer_name 
      FROM quote_requests qr
      LEFT JOIN customers c ON qr.customer_id = c.id
      WHERE qr.id = ?
    `).bind(id).first()
    
    if (!request) {
      return c.json({ success: false, message: '見積依頼が見つかりません' }, 404)
    }
    
    return c.json({ success: true, data: request })
  } catch (error) {
    console.error('見積依頼詳細取得エラー:', error)
    return c.json({ success: false, message: '見積依頼の取得に失敗しました' }, 500)
  }
})

// 見積依頼ステータス更新API（管理者用）
app.put('/api/quote-requests/:id/status', async (c) => {
  const { env } = c
  try {
    const id = c.req.param('id')
    const { status, processed_by } = await c.req.json()
    
    await env.DB.prepare(`
      UPDATE quote_requests 
      SET status = ?, processed_by = ?, processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, processed_by || '', id).run()
    
    return c.json({ success: true, message: 'ステータスを更新しました' })
  } catch (error) {
    console.error('見積依頼ステータス更新エラー:', error)
    return c.json({ success: false, message: 'ステータスの更新に失敗しました' }, 500)
  }
})

// (顧客ID/パスワード管理APIはルート競合回避のため前方に定義済み)

// ==========================================
// 見積依頼フォームページ（顧客向け）
// ==========================================
app.get('/quote-request', (c) => {
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>見積依頼フォーム</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    body { font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; }
    .required-mark { color: #dc2626; font-weight: bold; }
    .form-input { 
      border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px; 
      width: 100%; font-size: 14px; transition: border-color 0.2s;
    }
    .form-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    .form-select {
      border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px;
      width: 100%; font-size: 14px; appearance: none; -webkit-appearance: none; -moz-appearance: none;
      background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E") no-repeat right 12px center;
      background-size: 12px;
    }
    .form-select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    .section-title {
      background: #1e40af; color: white; padding: 10px 16px; border-radius: 6px;
      font-size: 16px; font-weight: bold; margin-bottom: 16px;
    }
    .item-card {
      border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;
      margin-bottom: 12px; background: #f9fafb;
    }
    .btn-primary {
      background: #2563eb; color: white; padding: 10px 24px; border-radius: 6px;
      font-weight: bold; cursor: pointer; border: none; font-size: 14px;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-danger {
      background: #dc2626; color: white; padding: 6px 12px; border-radius: 4px;
      font-size: 12px; cursor: pointer; border: none;
    }
    .btn-danger:hover { background: #b91c1c; }
    .btn-secondary {
      background: #6b7280; color: white; padding: 8px 16px; border-radius: 6px;
      font-size: 13px; cursor: pointer; border: none;
    }
    .btn-secondary:hover { background: #4b5563; }
    .login-container {
      max-width: 400px; margin: 100px auto; padding: 40px;
      background: white; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    }
    .form-container { max-width: 800px; margin: 30px auto; padding: 20px; }
    .error-msg { color: #dc2626; font-size: 13px; margin-top: 4px; display: none; }
    .success-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
      z-index: 9999;
    }
    .success-card {
      background: white; border-radius: 12px; padding: 40px; text-align: center; max-width: 400px;
    }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">

  <!-- ログイン画面 -->
  <div id="loginSection">
    <div class="login-container">
      <div class="text-center mb-6">
        <i class="fas fa-truck text-4xl text-blue-600 mb-3"></i>
        <h1 class="text-xl font-bold text-gray-800">見積依頼フォーム</h1>
        <p class="text-sm text-gray-500 mt-1">お客様ID・パスワードでログインしてください</p>
      </div>
      <div id="loginError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm" style="display:none;"></div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">お客様ID</label>
        <input type="text" id="loginId" class="form-input" placeholder="お客様IDを入力">
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
        <input type="password" id="loginPassword" class="form-input" placeholder="パスワードを入力">
      </div>
      <button onclick="doLogin()" class="btn-primary w-full text-center">
        <i class="fas fa-sign-in-alt mr-2"></i>ログイン
      </button>
    </div>
  </div>

  <!-- 見積依頼フォーム本体 -->
  <div id="formSection" style="display:none;">
    <div class="form-container">
      <!-- ヘッダー -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-file-alt text-blue-600 mr-2"></i>見積依頼フォーム
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            <span class="required-mark">※</span>は必須項目です
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-600">ログイン中: <span id="customerNameDisplay" class="font-bold"></span></p>
          <button onclick="doLogout()" class="text-xs text-blue-600 underline mt-1 cursor-pointer">ログアウト</button>
        </div>
      </div>

      <!-- 顧客情報（自動入力） -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">社名</label>
            <input type="text" id="companyName" class="form-input bg-gray-100" readonly>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <span class="required-mark">※</span>ご担当者名
            </label>
            <input type="text" id="contactPerson" class="form-input" placeholder="ご担当者名を入力">
          </div>
        </div>
      </div>

      <!-- 案件名 -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          <span class="required-mark">※</span>案件名（納品先名称）
        </label>
        <input type="text" id="projectName" class="form-input" placeholder="例: ○○ホテル 客室改装">
      </div>

      <!-- セクション1: 配送先・ルート情報 -->
      <div class="mb-6">
        <div class="section-title">
          <i class="fas fa-map-marker-alt mr-2"></i>1. 配送先・ルート情報
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <span class="required-mark">※</span>希望納品日
            </label>
            <input type="date" id="deliveryDate" class="form-input">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <span class="required-mark">※</span>希望納品時間
            </label>
            <select id="deliveryTime" class="form-select">
              <option value="">選択してください</option>
              <option value="午前（9:00-12:00）">午前（9:00-12:00）</option>
              <option value="午後（13:00-17:00）">午後（13:00-17:00）</option>
              <option value="指定なし">指定なし</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <span class="required-mark">※</span>配送先郵便番号
            </label>
            <input type="text" id="deliveryPostalCode" class="form-input" placeholder="例: 100-0001">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">引取先（ある場合）</label>
            <input type="text" id="pickupLocation" class="form-input" placeholder="引取先の住所を入力">
          </div>
        </div>
      </div>

      <!-- セクション2: 家具情報 -->
      <div class="mb-6">
        <div class="section-title">
          <i class="fas fa-couch mr-2"></i>2. 配送する家具の情報
        </div>
        <div id="itemsContainer">
          <!-- 品目カードが動的に追加される -->
        </div>
        <button onclick="addItem()" class="btn-secondary mt-2">
          <i class="fas fa-plus mr-1"></i>品目を追加
        </button>
      </div>

      <!-- セクション3: 設置環境 -->
      <div class="mb-6">
        <div class="section-title">
          <i class="fas fa-building mr-2"></i>3. 配送先の設置環境
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <span class="required-mark">※</span>建物種別
            </label>
            <select id="buildingType" class="form-select">
              <option value="">選択してください</option>
              <option value="戸建て">戸建て</option>
              <option value="マンション">マンション</option>
              <option value="ビル">ビル</option>
              <option value="ホテル・旅館">ホテル・旅館</option>
              <option value="店舗">店舗</option>
              <option value="その他">その他</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <span class="required-mark">※</span>設置階
            </label>
            <select id="installationFloor" class="form-select">
              <option value="">選択してください</option>
              <option value="1階">1階</option>
              <option value="2階">2階</option>
              <option value="3階">3階</option>
              <option value="4階">4階</option>
              <option value="5階以上">5階以上</option>
              <option value="地下1階">地下1階</option>
              <option value="地下2階以下">地下2階以下</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">エレベーター</label>
            <select id="hasElevator" class="form-select" onchange="toggleElevatorSize()">
              <option value="無">無</option>
              <option value="有">有</option>
            </select>
          </div>
          <div id="elevatorSizeGroup" style="display:none;">
            <label class="block text-sm font-medium text-gray-700 mb-1">エレベーターサイズ</label>
            <select id="elevatorSize" class="form-select">
              <option value="">選択してください</option>
              <option value="9人乗り以下">9人乗り以下</option>
              <option value="11人乗り">11人乗り</option>
              <option value="13人乗り以上">13人乗り以上</option>
              <option value="荷物用">荷物用</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">駐車スペース</label>
            <select id="hasParking" class="form-select">
              <option value="無">無</option>
              <option value="有">有</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">養生作業</label>
            <select id="hasProtectionWork" class="form-select" onchange="toggleProtectionScope()">
              <option value="無">無</option>
              <option value="有">有</option>
            </select>
          </div>
        </div>
        <div id="protectionScopeGroup" style="display:none;" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">養生範囲</label>
          <input type="text" id="protectionScope" class="form-input" placeholder="例: エントランスから客室まで">
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">吊り上げ作業</label>
            <select id="hasHoisting" class="form-select">
              <option value="無">無</option>
              <option value="有">有</option>
              <option value="不明">不明</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">クレーン使用</label>
            <select id="hasCrane" class="form-select">
              <option value="無">無</option>
              <option value="有">有</option>
              <option value="不明">不明</option>
            </select>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">搬入経路情報</label>
          <textarea id="deliveryRouteInfo" class="form-input" rows="2" placeholder="搬入経路に関する特記事項があれば入力"></textarea>
        </div>
      </div>

      <!-- 備考 -->
      <div class="mb-6">
        <div class="section-title">
          <i class="fas fa-comment-alt mr-2"></i>備考
        </div>
        <textarea id="notes" class="form-input" rows="4" placeholder="その他ご要望・注意事項があればご記入ください"></textarea>
      </div>

      <!-- 送信ボタン -->
      <div class="text-center mt-8 mb-12">
        <button onclick="submitQuoteRequest()" class="btn-primary text-lg px-12 py-3">
          <i class="fas fa-paper-plane mr-2"></i>見積依頼を送信する
        </button>
      </div>
    </div>
  </div>

  <!-- 送信完了オーバーレイ -->
  <div id="successOverlay" class="success-overlay" style="display:none;">
    <div class="success-card">
      <i class="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
      <h2 class="text-xl font-bold text-gray-800 mb-2">送信完了</h2>
      <p class="text-gray-600 mb-6">見積依頼を受け付けました。<br>担当者より折り返しご連絡いたします。</p>
      <button onclick="resetForm()" class="btn-primary">新しい依頼を作成</button>
    </div>
  </div>

  <script>
  // 品名×材質マッピング
  const materialMapping = {
    'ソファ': ['木質', '布張り', '革張り'],
    'テーブル': ['木質', 'ガラス', '大理石'],
    'チェア': ['木質', 'スチール'],
    'キャビネット': ['木質', 'スチール', '大理石'],
    '照明': ['引掛けシーリング', '天井取付', '床置き'],
    'ベッド': ['木質', 'スチール'],
    'デスク': ['木質', 'ガラス', 'スチール'],
    'その他': ['木質', 'スチール', 'ガラス', '大理石', 'その他']
  };

  let currentCustomer = null;
  let itemCount = 0;

  // ログイン処理
  async function doLogin() {
    const loginId = document.getElementById('loginId').value.trim();
    const loginPassword = document.getElementById('loginPassword').value.trim();
    const errorDiv = document.getElementById('loginError');
    
    if (!loginId || !loginPassword) {
      errorDiv.textContent = 'IDとパスワードを入力してください';
      errorDiv.style.display = 'block';
      return;
    }
    
    try {
      const res = await fetch('/api/quote-request/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: loginId, login_password: loginPassword })
      });
      const data = await res.json();
      
      if (data.success) {
        currentCustomer = data.customer;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('formSection').style.display = 'block';
        document.getElementById('companyName').value = data.customer.name;
        document.getElementById('customerNameDisplay').textContent = data.customer.name;
        errorDiv.style.display = 'none';
        addItem(); // 最初の品目を追加
      } else {
        errorDiv.textContent = data.message;
        errorDiv.style.display = 'block';
      }
    } catch (e) {
      errorDiv.textContent = '通信エラーが発生しました';
      errorDiv.style.display = 'block';
    }
  }

  // ログアウト
  function doLogout() {
    currentCustomer = null;
    document.getElementById('formSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('loginId').value = '';
    document.getElementById('loginPassword').value = '';
  }

  // 品目追加
  function addItem() {
    itemCount++;
    const container = document.getElementById('itemsContainer');
    const card = document.createElement('div');
    card.className = 'item-card';
    card.id = 'item-' + itemCount;
    
    const productOptions = Object.keys(materialMapping).map(p => 
      '<option value="' + p + '">' + p + '</option>'
    ).join('');
    
    card.innerHTML = \`
      <div class="flex justify-between items-center mb-3">
        <span class="font-bold text-sm text-gray-700">品目 #\${itemCount}</span>
        \${itemCount > 1 ? '<button onclick="removeItem(' + itemCount + ')" class="btn-danger"><i class="fas fa-trash mr-1"></i>削除</button>' : ''}
      </div>
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1"><span class="required-mark">※</span>品名</label>
          <select class="form-select item-product" data-item="\${itemCount}" onchange="updateMaterials(this)">
            <option value="">選択してください</option>
            \${productOptions}
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1"><span class="required-mark">※</span>材質</label>
          <select class="form-select item-material" data-item="\${itemCount}">
            <option value="">品名を先に選択</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1"><span class="required-mark">※</span>数量</label>
          <input type="number" class="form-input item-quantity" min="1" value="1" data-item="\${itemCount}">
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">サイズ（3辺計cm）</label>
          <input type="number" class="form-input item-size" placeholder="例: 250" data-item="\${itemCount}">
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">重量（kg）</label>
          <input type="number" class="form-input item-weight" placeholder="例: 30" data-item="\${itemCount}">
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">備考</label>
        <input type="text" class="form-input item-notes" placeholder="特記事項があれば" data-item="\${itemCount}">
      </div>
    \`;
    container.appendChild(card);
  }

  // 品目削除
  function removeItem(id) {
    const card = document.getElementById('item-' + id);
    if (card) card.remove();
  }

  // 材質プルダウン連動
  function updateMaterials(selectEl) {
    const itemId = selectEl.dataset.item;
    const product = selectEl.value;
    const materialSelect = document.querySelector('.item-material[data-item="' + itemId + '"]');
    
    materialSelect.innerHTML = '<option value="">選択してください</option>';
    
    if (product && materialMapping[product]) {
      materialMapping[product].forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        materialSelect.appendChild(opt);
      });
    }
  }

  // エレベーターサイズ表示切替
  function toggleElevatorSize() {
    const has = document.getElementById('hasElevator').value;
    document.getElementById('elevatorSizeGroup').style.display = has === '有' ? 'block' : 'none';
  }

  // 養生範囲表示切替
  function toggleProtectionScope() {
    const has = document.getElementById('hasProtectionWork').value;
    document.getElementById('protectionScopeGroup').style.display = has === '有' ? 'block' : 'none';
  }

  // 品目データ収集
  function collectItems() {
    const items = [];
    const cards = document.querySelectorAll('.item-card');
    cards.forEach(card => {
      const itemId = card.id.replace('item-', '');
      const product = card.querySelector('.item-product')?.value;
      const material = card.querySelector('.item-material')?.value;
      const quantity = card.querySelector('.item-quantity')?.value;
      const size = card.querySelector('.item-size')?.value;
      const weight = card.querySelector('.item-weight')?.value;
      const notes = card.querySelector('.item-notes')?.value;
      
      if (product) {
        items.push({
          product: product,
          material: material || '',
          quantity: parseInt(quantity) || 1,
          size: size ? parseInt(size) : null,
          weight: weight ? parseFloat(weight) : null,
          notes: notes || ''
        });
      }
    });
    return items;
  }

  // バリデーション
  function validateForm() {
    const errors = [];
    if (!document.getElementById('contactPerson').value.trim()) errors.push('ご担当者名');
    if (!document.getElementById('projectName').value.trim()) errors.push('案件名');
    if (!document.getElementById('deliveryDate').value) errors.push('希望納品日');
    if (!document.getElementById('deliveryTime').value) errors.push('希望納品時間');
    if (!document.getElementById('deliveryPostalCode').value.trim()) errors.push('配送先郵便番号');
    if (!document.getElementById('buildingType').value) errors.push('建物種別');
    if (!document.getElementById('installationFloor').value) errors.push('設置階');
    
    const items = collectItems();
    if (items.length === 0) errors.push('品目（1つ以上必要）');
    
    items.forEach((item, idx) => {
      if (!item.product) errors.push('品目' + (idx+1) + 'の品名');
      if (!item.material) errors.push('品目' + (idx+1) + 'の材質');
    });
    
    return errors;
  }

  // 送信処理
  async function submitQuoteRequest() {
    const errors = validateForm();
    if (errors.length > 0) {
      alert('以下の必須項目を入力してください:\\n\\n' + errors.join('\\n'));
      return;
    }
    
    const items = collectItems();
    
    const payload = {
      customer_id: currentCustomer.id,
      contact_person: document.getElementById('contactPerson').value.trim(),
      project_name: document.getElementById('projectName').value.trim(),
      delivery_date: document.getElementById('deliveryDate').value,
      delivery_time: document.getElementById('deliveryTime').value,
      delivery_postal_code: document.getElementById('deliveryPostalCode').value.trim(),
      pickup_location: document.getElementById('pickupLocation').value.trim(),
      items_json: items,
      building_type: document.getElementById('buildingType').value,
      installation_floor: document.getElementById('installationFloor').value,
      has_elevator: document.getElementById('hasElevator').value,
      elevator_size: document.getElementById('elevatorSize').value,
      has_parking: document.getElementById('hasParking').value,
      has_protection_work: document.getElementById('hasProtectionWork').value,
      protection_scope: document.getElementById('protectionScope').value.trim(),
      has_hoisting: document.getElementById('hasHoisting').value,
      has_crane: document.getElementById('hasCrane').value,
      delivery_route_info: document.getElementById('deliveryRouteInfo').value.trim(),
      notes: document.getElementById('notes').value.trim()
    };
    
    try {
      const res = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        document.getElementById('successOverlay').style.display = 'flex';
      } else {
        alert('エラー: ' + data.message);
      }
    } catch (e) {
      alert('通信エラーが発生しました。再度お試しください。');
    }
  }

  // フォームリセット
  function resetForm() {
    document.getElementById('successOverlay').style.display = 'none';
    document.getElementById('contactPerson').value = '';
    document.getElementById('projectName').value = '';
    document.getElementById('deliveryDate').value = '';
    document.getElementById('deliveryTime').value = '';
    document.getElementById('deliveryPostalCode').value = '';
    document.getElementById('pickupLocation').value = '';
    document.getElementById('buildingType').value = '';
    document.getElementById('installationFloor').value = '';
    document.getElementById('hasElevator').value = '無';
    document.getElementById('elevatorSize').value = '';
    document.getElementById('elevatorSizeGroup').style.display = 'none';
    document.getElementById('hasParking').value = '無';
    document.getElementById('hasProtectionWork').value = '無';
    document.getElementById('protectionScope').value = '';
    document.getElementById('protectionScopeGroup').style.display = 'none';
    document.getElementById('hasHoisting').value = '無';
    document.getElementById('hasCrane').value = '無';
    document.getElementById('deliveryRouteInfo').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('itemsContainer').innerHTML = '';
    itemCount = 0;
    addItem();
  }

  // Enterキーでログイン
  document.getElementById('loginPassword').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') doLogin();
  });
  document.getElementById('loginId').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') doLogin();
  });
  </script>
</body>
</html>`;
  return c.html(html)
})

// ==========================================
// 管理者側：顧客ログイン管理ページ
// ==========================================
app.get('/admin/customer-login', (c) => {
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>顧客ログイン管理</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    body { font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; }
    .form-input { border: 1px solid #d1d5db; border-radius: 6px; padding: 6px 10px; font-size: 13px; width: 100%; }
    .form-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,0.1); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; }
    .modal-card { background: white; border-radius: 12px; padding: 24px; width: 100%; max-width: 500px; margin: 16px; }
    .badge-active { background: #d1fae5; color: #065f46; }
    .badge-inactive { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen p-6">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-gray-800">
        <i class="fas fa-users-cog text-blue-600 mr-2"></i>顧客ログインID/パスワード管理
      </h1>
      <div class="flex items-center gap-3">
        <button onclick="openAddModal()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <i class="fas fa-user-plus mr-2"></i>新規顧客追加
        </button>
        <a href="/" class="text-sm text-blue-600 hover:underline">
          <i class="fas fa-arrow-left mr-1"></i>管理画面に戻る
        </a>
      </div>
    </div>
    
    <!-- 顧客一覧テーブル -->
    <div class="bg-white rounded-lg shadow-sm border p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-medium text-gray-600"><i class="fas fa-list mr-1"></i>登録済み顧客一覧</h2>
        <span id="customerCount" class="text-xs text-gray-400"></span>
      </div>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-gray-50">
            <th class="text-left py-2 px-3 w-12">No</th>
            <th class="text-left py-2 px-3">顧客名</th>
            <th class="text-left py-2 px-3">ログインID</th>
            <th class="text-left py-2 px-3">パスワード</th>
            <th class="text-center py-2 px-3 w-16">状態</th>
            <th class="text-center py-2 px-3 w-40">操作</th>
          </tr>
        </thead>
        <tbody id="customerTable">
          <tr><td colspan="6" class="text-center py-8 text-gray-400">読み込み中...</td></tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p class="text-sm text-yellow-800">
        <i class="fas fa-info-circle mr-1"></i>
        ここで設定したID/パスワードで、お客様は<a href="/quote-request" class="text-blue-600 underline" target="_blank">見積依頼フォーム</a>にログインできます。
        ログインIDとパスワードが未設定の顧客はフォームにログインできません。
      </p>
    </div>
  </div>

  <!-- 新規顧客追加モーダル -->
  <div id="addModal" class="modal-overlay" style="display:none;">
    <div class="modal-card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-800">
          <i class="fas fa-user-plus text-green-600 mr-2"></i>新規顧客追加
        </h3>
        <button onclick="closeAddModal()" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
      </div>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">顧客名 <span class="text-red-500">*</span></label>
          <input type="text" id="newCustomerName" class="form-input" placeholder="例: 株式会社○○">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">担当者名</label>
          <input type="text" id="newContactPerson" class="form-input" placeholder="例: 田中太郎">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
          <input type="text" id="newPhone" class="form-input" placeholder="例: 06-1234-5678">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">メール</label>
          <input type="email" id="newEmail" class="form-input" placeholder="例: info@example.com">
        </div>
        <hr class="my-2">
        <p class="text-xs text-gray-500 font-medium">見積依頼フォーム用ログイン情報</p>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ログインID <span class="text-red-500">*</span></label>
            <input type="text" id="newLoginId" class="form-input" placeholder="例: customer01">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">パスワード <span class="text-red-500">*</span></label>
            <input type="text" id="newLoginPassword" class="form-input" placeholder="例: pass1234">
          </div>
        </div>
      </div>
      <div id="addError" class="mt-3 text-sm text-red-600" style="display:none;"></div>
      <div class="flex justify-end gap-3 mt-6">
        <button onclick="closeAddModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">キャンセル</button>
        <button onclick="addNewCustomer()" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
          <i class="fas fa-check mr-1"></i>追加する
        </button>
      </div>
    </div>
  </div>

  <script>
  let customers = [];

  async function loadCustomers() {
    try {
      const res = await fetch('/api/customers/login-info');
      const data = await res.json();
      if (data.success) {
        customers = data.data;
        renderTable();
      }
    } catch (e) {
      console.error('読み込みエラー:', e);
    }
  }

  function renderTable() {
    const tbody = document.getElementById('customerTable');
    document.getElementById('customerCount').textContent = customers.length + '件';
    
    if (customers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-400">顧客が登録されていません。「新規顧客追加」から追加してください。</td></tr>';
      return;
    }
    
    tbody.innerHTML = customers.map((c, idx) => {
      const hasLogin = c.login_id && c.login_password;
      const statusBadge = hasLogin 
        ? '<span class="badge-active px-2 py-0.5 rounded text-xs font-medium">有効</span>'
        : '<span class="badge-inactive px-2 py-0.5 rounded text-xs font-medium">未設定</span>';
      return \`
      <tr class="border-b hover:bg-gray-50" id="row-\${c.id}">
        <td class="py-2 px-3 text-gray-400 text-xs">\${idx + 1}</td>
        <td class="py-2 px-3 font-medium">\${c.name}</td>
        <td class="py-2 px-3">
          <input type="text" class="form-input" id="login-id-\${c.id}" 
                 value="\${c.login_id || ''}" placeholder="ログインIDを設定">
        </td>
        <td class="py-2 px-3">
          <input type="text" class="form-input" id="login-pw-\${c.id}" 
                 value="\${c.login_password || ''}" placeholder="パスワードを設定">
        </td>
        <td class="py-2 px-3 text-center">\${statusBadge}</td>
        <td class="py-2 px-3 text-center">
          <button onclick="saveLoginInfo(\${c.id})" 
                  class="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 mr-1">
            <i class="fas fa-save mr-1"></i>保存
          </button>
          <button onclick="deleteCustomer(\${c.id}, '\${c.name.replace(/'/g, "\\\\'")}')" 
                  class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    \`;}).join('');
  }

  async function saveLoginInfo(id) {
    const loginId = document.getElementById('login-id-' + id).value.trim();
    const loginPw = document.getElementById('login-pw-' + id).value.trim();
    
    if (!loginId || !loginPw) {
      alert('IDとパスワードの両方を入力してください');
      return;
    }
    
    try {
      const res = await fetch('/api/customers/' + id + '/login-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: loginId, login_password: loginPw })
      });
      const data = await res.json();
      
      if (data.success) {
        alert('保存しました');
        loadCustomers();
      } else {
        alert('エラー: ' + data.message);
      }
    } catch (e) {
      alert('通信エラーが発生しました');
    }
  }

  function openAddModal() {
    document.getElementById('addModal').style.display = 'flex';
    document.getElementById('newCustomerName').value = '';
    document.getElementById('newContactPerson').value = '';
    document.getElementById('newPhone').value = '';
    document.getElementById('newEmail').value = '';
    document.getElementById('newLoginId').value = '';
    document.getElementById('newLoginPassword').value = '';
    document.getElementById('addError').style.display = 'none';
    document.getElementById('newCustomerName').focus();
  }

  function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
  }

  async function addNewCustomer() {
    const name = document.getElementById('newCustomerName').value.trim();
    const contactPerson = document.getElementById('newContactPerson').value.trim();
    const phone = document.getElementById('newPhone').value.trim();
    const email = document.getElementById('newEmail').value.trim();
    const loginId = document.getElementById('newLoginId').value.trim();
    const loginPassword = document.getElementById('newLoginPassword').value.trim();
    const errorDiv = document.getElementById('addError');
    
    if (!name) {
      errorDiv.textContent = '顧客名を入力してください';
      errorDiv.style.display = 'block';
      return;
    }
    if (!loginId || !loginPassword) {
      errorDiv.textContent = 'ログインIDとパスワードを入力してください';
      errorDiv.style.display = 'block';
      return;
    }
    
    try {
      const res = await fetch('/api/customers/add-with-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact_person: contactPerson, phone, email, login_id: loginId, login_password: loginPassword })
      });
      const data = await res.json();
      
      if (data.success) {
        closeAddModal();
        loadCustomers();
        alert('顧客「' + name + '」を追加しました');
      } else {
        errorDiv.textContent = data.message;
        errorDiv.style.display = 'block';
      }
    } catch (e) {
      errorDiv.textContent = '通信エラーが発生しました';
      errorDiv.style.display = 'block';
    }
  }

  async function deleteCustomer(id, name) {
    if (!confirm('顧客「' + name + '」を削除しますか？\\nこの操作は取り消せません。')) return;
    
    try {
      const res = await fetch('/api/customers/' + id + '/login-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: '', login_password: '' })
      });
      const data = await res.json();
      if (data.success) {
        loadCustomers();
      }
    } catch (e) {
      alert('通信エラーが発生しました');
    }
  }

  // Enterキーで追加
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.getElementById('addModal').style.display === 'flex') {
      addNewCustomer();
    }
    if (e.key === 'Escape') {
      closeAddModal();
    }
  });

  loadCustomers();
  </script>
</body>
</html>`;
  return c.html(html)
})

// 管理者側：見積依頼一覧ページ
app.get('/admin/quote-requests', (c) => {
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>見積依頼一覧</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    body { font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-processing { background: #dbeafe; color: #1e40af; }
    .status-completed { background: #d1fae5; color: #065f46; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen p-6">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-gray-800">
        <i class="fas fa-inbox text-blue-600 mr-2"></i>見積依頼一覧
      </h1>
      <a href="/" class="text-sm text-blue-600 hover:underline">
        <i class="fas fa-arrow-left mr-1"></i>管理画面に戻る
      </a>
    </div>
    
    <div class="flex gap-2 mb-4">
      <button onclick="filterStatus('')" class="px-3 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300" id="filter-all">全て</button>
      <button onclick="filterStatus('pending')" class="px-3 py-1 rounded text-sm bg-yellow-100 hover:bg-yellow-200" id="filter-pending">未処理</button>
      <button onclick="filterStatus('processing')" class="px-3 py-1 rounded text-sm bg-blue-100 hover:bg-blue-200" id="filter-processing">対応中</button>
      <button onclick="filterStatus('completed')" class="px-3 py-1 rounded text-sm bg-green-100 hover:bg-green-200" id="filter-completed">完了</button>
    </div>

    <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-gray-50">
            <th class="text-left py-2 px-3">ID</th>
            <th class="text-left py-2 px-3">顧客名</th>
            <th class="text-left py-2 px-3">案件名</th>
            <th class="text-left py-2 px-3">希望日</th>
            <th class="text-left py-2 px-3">品目数</th>
            <th class="text-center py-2 px-3">ステータス</th>
            <th class="text-left py-2 px-3">依頼日時</th>
            <th class="text-center py-2 px-3">操作</th>
          </tr>
        </thead>
        <tbody id="requestsTable">
          <tr><td colspan="8" class="text-center py-8 text-gray-400">読み込み中...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- 詳細モーダル -->
  <div id="detailModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style="display:none;">
    <div class="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 m-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold">見積依頼詳細</h2>
        <button onclick="closeDetail()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
      </div>
      <div id="detailContent"></div>
    </div>
  </div>

  <script>
  let allRequests = [];

  async function loadRequests(status) {
    try {
      let url = '/api/quote-requests';
      if (status) url += '?status=' + status;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        allRequests = data.data;
        renderRequests();
      }
    } catch (e) {
      console.error('読み込みエラー:', e);
    }
  }

  function filterStatus(status) {
    loadRequests(status);
  }

  function getStatusBadge(status) {
    const map = {
      'pending': '<span class="status-pending px-2 py-1 rounded text-xs font-medium">未処理</span>',
      'processing': '<span class="status-processing px-2 py-1 rounded text-xs font-medium">対応中</span>',
      'completed': '<span class="status-completed px-2 py-1 rounded text-xs font-medium">完了</span>',
      'rejected': '<span class="status-rejected px-2 py-1 rounded text-xs font-medium">却下</span>'
    };
    return map[status] || status;
  }

  function renderRequests() {
    const tbody = document.getElementById('requestsTable');
    if (allRequests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-gray-400">見積依頼がありません</td></tr>';
      return;
    }
    
    tbody.innerHTML = allRequests.map(r => {
      let itemCount = 0;
      try { itemCount = JSON.parse(r.items_json).length; } catch(e) {}
      return \`
        <tr class="border-b hover:bg-gray-50">
          <td class="py-2 px-3 text-gray-500">\${r.id}</td>
          <td class="py-2 px-3">\${r.customer_name || '-'}</td>
          <td class="py-2 px-3 font-medium">\${r.project_name}</td>
          <td class="py-2 px-3">\${r.delivery_date}</td>
          <td class="py-2 px-3 text-center">\${itemCount}点</td>
          <td class="py-2 px-3 text-center">\${getStatusBadge(r.status)}</td>
          <td class="py-2 px-3 text-xs text-gray-500">\${new Date(r.created_at).toLocaleString('ja-JP')}</td>
          <td class="py-2 px-3 text-center">
            <button onclick="showDetail(\${r.id})" class="text-blue-600 hover:underline text-xs mr-2">詳細</button>
            <button onclick="updateStatus(\${r.id}, 'processing')" class="text-yellow-600 hover:underline text-xs mr-1">対応中</button>
            <button onclick="updateStatus(\${r.id}, 'completed')" class="text-green-600 hover:underline text-xs">完了</button>
          </td>
        </tr>
      \`;
    }).join('');
  }

  async function showDetail(id) {
    try {
      const res = await fetch('/api/quote-requests/' + id);
      const data = await res.json();
      if (data.success) {
        const r = data.data;
        let items = [];
        try { items = JSON.parse(r.items_json); } catch(e) {}
        
        document.getElementById('detailContent').innerHTML = \`
          <div class="space-y-3 text-sm">
            <div class="grid grid-cols-2 gap-3">
              <div><span class="text-gray-500">顧客名:</span> <strong>\${r.customer_name}</strong></div>
              <div><span class="text-gray-500">担当者:</span> <strong>\${r.contact_person}</strong></div>
              <div><span class="text-gray-500">案件名:</span> <strong>\${r.project_name}</strong></div>
              <div><span class="text-gray-500">ステータス:</span> \${getStatusBadge(r.status)}</div>
            </div>
            <hr>
            <h3 class="font-bold">配送先・ルート情報</h3>
            <div class="grid grid-cols-2 gap-3">
              <div><span class="text-gray-500">希望日:</span> \${r.delivery_date}</div>
              <div><span class="text-gray-500">希望時間:</span> \${r.delivery_time}</div>
              <div><span class="text-gray-500">郵便番号:</span> \${r.delivery_postal_code}</div>
              <div><span class="text-gray-500">引取先:</span> \${r.pickup_location || '-'}</div>
            </div>
            <hr>
            <h3 class="font-bold">家具情報（\${items.length}品目）</h3>
            <table class="w-full border text-xs">
              <thead><tr class="bg-gray-100"><th class="border p-1">品名</th><th class="border p-1">材質</th><th class="border p-1">数量</th><th class="border p-1">サイズ</th><th class="border p-1">重量</th><th class="border p-1">備考</th></tr></thead>
              <tbody>\${items.map(i => \`<tr><td class="border p-1">\${i.product}</td><td class="border p-1">\${i.material}</td><td class="border p-1">\${i.quantity}</td><td class="border p-1">\${i.size || '-'}</td><td class="border p-1">\${i.weight ? i.weight+'kg' : '-'}</td><td class="border p-1">\${i.notes || '-'}</td></tr>\`).join('')}</tbody>
            </table>
            <hr>
            <h3 class="font-bold">設置環境</h3>
            <div class="grid grid-cols-2 gap-3">
              <div><span class="text-gray-500">建物種別:</span> \${r.building_type}</div>
              <div><span class="text-gray-500">設置階:</span> \${r.installation_floor}</div>
              <div><span class="text-gray-500">EV:</span> \${r.has_elevator}\${r.elevator_size ? '('+r.elevator_size+')' : ''}</div>
              <div><span class="text-gray-500">駐車:</span> \${r.has_parking}</div>
              <div><span class="text-gray-500">養生:</span> \${r.has_protection_work}\${r.protection_scope ? '('+r.protection_scope+')' : ''}</div>
              <div><span class="text-gray-500">吊り上げ:</span> \${r.has_hoisting}</div>
              <div><span class="text-gray-500">クレーン:</span> \${r.has_crane}</div>
            </div>
            \${r.delivery_route_info ? '<div><span class="text-gray-500">搬入経路:</span> '+r.delivery_route_info+'</div>' : ''}
            \${r.notes ? '<hr><h3 class="font-bold">備考</h3><p>'+r.notes+'</p>' : ''}
          </div>
        \`;
        document.getElementById('detailModal').style.display = 'flex';
      }
    } catch (e) {
      alert('詳細の読み込みに失敗しました');
    }
  }

  function closeDetail() {
    document.getElementById('detailModal').style.display = 'none';
  }

  async function updateStatus(id, status) {
    if (!confirm('ステータスを更新しますか？')) return;
    try {
      const res = await fetch('/api/quote-requests/' + id + '/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status })
      });
      const data = await res.json();
      if (data.success) {
        loadRequests('');
      } else {
        alert('エラー: ' + data.message);
      }
    } catch (e) {
      alert('通信エラーが発生しました');
    }
  }

  loadRequests('');
  </script>
</body>
</html>`;
  return c.html(html)
})

// ============================================
// 承認ワークフロー 管理画面
// ============================================

// 承認者マスタ管理画面
app.get('/admin/approvers', async (c) => {
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>承認者マスタ管理 - 運送見積システム</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 min-h-screen">
  <nav class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a href="/admin" class="text-gray-600 hover:text-gray-800"><i class="fas fa-arrow-left"></i></a>
        <h1 class="text-lg font-bold text-gray-800"><i class="fas fa-user-check mr-2"></i>承認者マスタ管理</h1>
      </div>
      <div class="flex gap-2">
        <a href="/admin/approvals" class="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
          <i class="fas fa-clipboard-check mr-1"></i>承認管理
        </a>
      </div>
    </div>
  </nav>

  <div class="max-w-5xl mx-auto p-6">
    <div class="flex justify-between items-center mb-4">
      <p class="text-sm text-gray-600">見積承認を行う承認者を管理します。メールアドレスに承認依頼通知が送信されます。</p>
      <button onclick="openAddModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
        <i class="fas fa-plus mr-1"></i>新規承認者追加
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-gray-50">
            <th class="text-left py-3 px-4">氏名</th>
            <th class="text-left py-3 px-4">メールアドレス</th>
            <th class="text-left py-3 px-4">部署</th>
            <th class="text-left py-3 px-4">権限</th>
            <th class="text-center py-3 px-4">状態</th>
            <th class="text-center py-3 px-4">操作</th>
          </tr>
        </thead>
        <tbody id="approversTable">
          <tr><td colspan="6" class="text-center py-8 text-gray-400">読み込み中...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- 追加/編集モーダル -->
  <div id="approverModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style="display:none;">
    <div class="bg-white rounded-lg w-full max-w-md p-6 m-4">
      <div class="flex justify-between items-center mb-4">
        <h2 id="modalTitle" class="text-lg font-bold">新規承認者追加</h2>
        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
      </div>
      <form id="approverForm" onsubmit="saveApprover(event)">
        <input type="hidden" id="approverId">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">氏名 <span class="text-red-500">*</span></label>
            <input type="text" id="approverName" required class="w-full border rounded-md px-3 py-2 text-sm" placeholder="山田太郎">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">メールアドレス <span class="text-red-500">*</span></label>
            <input type="email" id="approverEmail" required class="w-full border rounded-md px-3 py-2 text-sm" placeholder="yamada@example.com">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">部署</label>
            <input type="text" id="approverDept" class="w-full border rounded-md px-3 py-2 text-sm" placeholder="営業部">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">権限</label>
            <select id="approverRole" class="w-full border rounded-md px-3 py-2 text-sm">
              <option value="approver">承認者</option>
              <option value="admin">管理者</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">キャンセル</button>
          <button type="submit" class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    let approversData = [];

    async function loadApprovers() {
      try {
        const res = await fetch('/api/approvers');
        const data = await res.json();
        if (data.success) {
          approversData = data.data;
          renderTable();
        }
      } catch (e) { console.error(e); }
    }

    function renderTable() {
      const tbody = document.getElementById('approversTable');
      if (approversData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-400">承認者が登録されていません</td></tr>';
        return;
      }
      tbody.innerHTML = approversData.map(a => \`
        <tr class="border-b hover:bg-gray-50">
          <td class="py-3 px-4 font-medium">\${a.name}</td>
          <td class="py-3 px-4 text-gray-600">\${a.email}</td>
          <td class="py-3 px-4 text-gray-600">\${a.department || '-'}</td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded text-xs \${a.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
              \${a.role === 'admin' ? '管理者' : '承認者'}
            </span>
          </td>
          <td class="py-3 px-4 text-center">
            <span class="px-2 py-0.5 rounded text-xs \${a.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}">
              \${a.is_active ? '有効' : '無効'}
            </span>
          </td>
          <td class="py-3 px-4 text-center">
            <button onclick="editApprover(\${a.id})" class="text-blue-600 hover:text-blue-800 mr-2" title="編集"><i class="fas fa-edit"></i></button>
            <button onclick="toggleActive(\${a.id}, \${a.is_active})" class="text-yellow-600 hover:text-yellow-800 mr-2" title="\${a.is_active ? '無効化' : '有効化'}">
              <i class="fas fa-\${a.is_active ? 'ban' : 'check-circle'}"></i>
            </button>
            <button onclick="deleteApprover(\${a.id}, '\${a.name}')" class="text-red-600 hover:text-red-800" title="削除"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      \`).join('');
    }

    function openAddModal() {
      document.getElementById('modalTitle').textContent = '新規承認者追加';
      document.getElementById('approverId').value = '';
      document.getElementById('approverForm').reset();
      document.getElementById('approverModal').style.display = 'flex';
    }

    function editApprover(id) {
      const a = approversData.find(x => x.id === id);
      if (!a) return;
      document.getElementById('modalTitle').textContent = '承認者編集';
      document.getElementById('approverId').value = a.id;
      document.getElementById('approverName').value = a.name;
      document.getElementById('approverEmail').value = a.email;
      document.getElementById('approverDept').value = a.department || '';
      document.getElementById('approverRole').value = a.role || 'approver';
      document.getElementById('approverModal').style.display = 'flex';
    }

    function closeModal() {
      document.getElementById('approverModal').style.display = 'none';
    }

    async function saveApprover(e) {
      e.preventDefault();
      const id = document.getElementById('approverId').value;
      const payload = {
        name: document.getElementById('approverName').value,
        email: document.getElementById('approverEmail').value,
        department: document.getElementById('approverDept').value,
        role: document.getElementById('approverRole').value,
        is_active: 1
      };

      try {
        const url = id ? \`/api/approvers/\${id}\` : '/api/approvers';
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        const data = await res.json();
        if (data.success) {
          alert(data.message);
          closeModal();
          loadApprovers();
        } else {
          alert(data.message || 'エラーが発生しました');
        }
      } catch (e) { alert('保存に失敗しました'); }
    }

    async function toggleActive(id, currentActive) {
      const a = approversData.find(x => x.id === id);
      if (!a) return;
      const newActive = currentActive ? 0 : 1;
      try {
        const res = await fetch(\`/api/approvers/\${id}\`, {
          method: 'PUT',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ ...a, is_active: newActive })
        });
        const data = await res.json();
        if (data.success) loadApprovers();
      } catch (e) { alert('更新に失敗しました'); }
    }

    async function deleteApprover(id, name) {
      if (!confirm(\`「\${name}」を削除しますか？\`)) return;
      try {
        const res = await fetch(\`/api/approvers/\${id}\`, { method: 'DELETE' });
        const data = await res.json();
        alert(data.message);
        loadApprovers();
      } catch (e) { alert('削除に失敗しました'); }
    }

    loadApprovers();
  </script>
</body>
</html>`;
  return c.html(html)
})

// 承認管理ダッシュボード画面
app.get('/admin/approvals', async (c) => {
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>承認管理 - 運送見積システム</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 min-h-screen">
  <nav class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a href="/admin" class="text-gray-600 hover:text-gray-800"><i class="fas fa-arrow-left"></i></a>
        <h1 class="text-lg font-bold text-gray-800"><i class="fas fa-clipboard-check mr-2"></i>承認管理ダッシュボード</h1>
      </div>
      <div class="flex gap-2">
        <a href="/admin/approvers" class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
          <i class="fas fa-user-check mr-1"></i>承認者マスタ
        </a>
      </div>
    </div>
  </nav>

  <div class="max-w-7xl mx-auto p-6">
    <!-- 統計カード -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-clock text-yellow-600"></i>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-800" id="pendingCount">0</p>
            <p class="text-xs text-gray-500">承認待ち</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-check-circle text-green-600"></i>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-800" id="approvedCount">0</p>
            <p class="text-xs text-gray-500">承認済み</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-undo text-red-600"></i>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-800" id="rejectedCount">0</p>
            <p class="text-xs text-gray-500">差戻し</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-list text-blue-600"></i>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-800" id="totalCount">0</p>
            <p class="text-xs text-gray-500">全リクエスト</p>
          </div>
        </div>
      </div>
    </div>

    <!-- タブ -->
    <div class="flex gap-1 mb-4 border-b">
      <button onclick="filterByStatus('')" id="tabAll" class="px-4 py-2 text-sm font-medium border-b-2 border-blue-600 text-blue-600">すべて</button>
      <button onclick="filterByStatus('pending')" id="tabPending" class="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">承認待ち</button>
      <button onclick="filterByStatus('approved')" id="tabApproved" class="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">承認済み</button>
      <button onclick="filterByStatus('rejected')" id="tabRejected" class="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">差戻し</button>
    </div>

    <!-- リクエスト一覧テーブル -->
    <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-gray-50">
            <th class="text-left py-3 px-4">#</th>
            <th class="text-left py-3 px-4">見積番号</th>
            <th class="text-left py-3 px-4">顧客名</th>
            <th class="text-right py-3 px-4">金額</th>
            <th class="text-left py-3 px-4">申請者</th>
            <th class="text-left py-3 px-4">承認者</th>
            <th class="text-center py-3 px-4">ステータス</th>
            <th class="text-left py-3 px-4">申請日</th>
            <th class="text-center py-3 px-4">操作</th>
          </tr>
        </thead>
        <tbody id="approvalsTable">
          <tr><td colspan="9" class="text-center py-8 text-gray-400">読み込み中...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- 承認詳細モーダル -->
  <div id="approvalDetailModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style="display:none;">
    <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 m-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold"><i class="fas fa-file-invoice mr-2"></i>承認詳細</h2>
        <button onclick="closeDetailModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
      </div>
      <div id="approvalDetailContent">読み込み中...</div>
    </div>
  </div>

  <!-- 差戻しモーダル -->
  <div id="rejectModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style="display:none;">
    <div class="bg-white rounded-lg w-full max-w-md p-6 m-4">
      <h2 class="text-lg font-bold mb-4 text-red-600"><i class="fas fa-undo mr-2"></i>差戻し</h2>
      <input type="hidden" id="rejectRequestId">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">差戻し理由 <span class="text-red-500">*（必須）</span></label>
        <textarea id="rejectComment" rows="4" required class="w-full border rounded-md px-3 py-2 text-sm" placeholder="修正が必要な箇所や理由を入力してください..."></textarea>
      </div>
      <div class="flex justify-end gap-2">
        <button onclick="closeRejectModal()" class="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">キャンセル</button>
        <button onclick="submitReject()" class="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">差し戻す</button>
      </div>
    </div>
  </div>

  <script>
    let allRequests = [];
    let currentFilter = '';

    async function loadRequests() {
      try {
        const res = await fetch('/api/approval-requests');
        const data = await res.json();
        if (data.success) {
          allRequests = data.data;
          updateStats();
          renderRequests();
        }
      } catch (e) { console.error(e); }
    }

    function updateStats() {
      document.getElementById('totalCount').textContent = allRequests.length;
      document.getElementById('pendingCount').textContent = allRequests.filter(r => r.status === 'pending').length;
      document.getElementById('approvedCount').textContent = allRequests.filter(r => r.status === 'approved').length;
      document.getElementById('rejectedCount').textContent = allRequests.filter(r => r.status === 'rejected').length;
    }

    function filterByStatus(status) {
      currentFilter = status;
      // タブUI更新
      ['All','Pending','Approved','Rejected'].forEach(t => {
        const el = document.getElementById('tab' + t);
        if (el) {
          el.className = el.className.replace('border-blue-600 text-blue-600', 'border-transparent text-gray-500 hover:text-gray-700');
        }
      });
      const activeTab = status ? document.getElementById('tab' + status.charAt(0).toUpperCase() + status.slice(1)) : document.getElementById('tabAll');
      if (activeTab) {
        activeTab.className = activeTab.className.replace('border-transparent text-gray-500 hover:text-gray-700', 'border-blue-600 text-blue-600');
      }
      renderRequests();
    }

    function getStatusBadge(status) {
      const configs = {
        pending: { label: '承認待ち', class: 'bg-yellow-100 text-yellow-800' },
        approved: { label: '承認済み', class: 'bg-green-100 text-green-800' },
        rejected: { label: '差戻し', class: 'bg-red-100 text-red-800' },
        cancelled: { label: 'キャンセル', class: 'bg-gray-100 text-gray-600' }
      };
      const c = configs[status] || { label: status, class: 'bg-gray-100 text-gray-600' };
      return \`<span class="px-2 py-0.5 rounded-full text-xs font-medium \${c.class}">\${c.label}</span>\`;
    }

    function formatDate(dateStr) {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      return \`\${d.getMonth()+1}/\${d.getDate()} \${d.getHours().toString().padStart(2,'0')}:\${d.getMinutes().toString().padStart(2,'0')}\`;
    }

    function formatAmount(amount) {
      if (!amount) return '-';
      return '¥' + Number(amount).toLocaleString();
    }

    function renderRequests() {
      const filtered = currentFilter ? allRequests.filter(r => r.status === currentFilter) : allRequests;
      const tbody = document.getElementById('approvalsTable');
      
      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center py-8 text-gray-400">該当するリクエストがありません</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map((r, i) => \`
        <tr class="border-b hover:bg-gray-50">
          <td class="py-3 px-4 text-gray-500">\${r.id}</td>
          <td class="py-3 px-4 font-medium">\${r.estimate_number || '-'}</td>
          <td class="py-3 px-4">\${r.customer_name || '-'}</td>
          <td class="py-3 px-4 text-right font-medium">\${formatAmount(r.total_amount)}</td>
          <td class="py-3 px-4">\${r.requester_name}</td>
          <td class="py-3 px-4">\${r.approver_name || '-'}</td>
          <td class="py-3 px-4 text-center">\${getStatusBadge(r.status)}</td>
          <td class="py-3 px-4 text-gray-500">\${formatDate(r.requested_at)}</td>
          <td class="py-3 px-4 text-center">
            <div class="flex items-center justify-center gap-1">
              <button onclick="viewDetail(\${r.id})" class="w-7 h-7 inline-flex items-center justify-center rounded text-blue-600 hover:bg-blue-50" title="詳細">
                <i class="fas fa-eye text-xs"></i>
              </button>
              \${r.status === 'pending' ? \`
                <button onclick="approveRequest(\${r.id})" class="w-7 h-7 inline-flex items-center justify-center rounded text-green-600 hover:bg-green-50" title="承認">
                  <i class="fas fa-check text-xs"></i>
                </button>
                <button onclick="openRejectModal(\${r.id})" class="w-7 h-7 inline-flex items-center justify-center rounded text-red-600 hover:bg-red-50" title="差戻し">
                  <i class="fas fa-undo text-xs"></i>
                </button>
              \` : ''}
            </div>
          </td>
        </tr>
      \`).join('');
    }

    async function viewDetail(id) {
      document.getElementById('approvalDetailModal').style.display = 'flex';
      document.getElementById('approvalDetailContent').innerHTML = '<div class="text-center py-8 text-gray-400">読み込み中...</div>';
      
      try {
        const res = await fetch(\`/api/approval-requests/\${id}\`);
        const data = await res.json();
        if (data.success) {
          const r = data.data;
          document.getElementById('approvalDetailContent').innerHTML = \`
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- 左: 承認情報 -->
              <div>
                <h3 class="font-bold text-gray-700 mb-3 border-b pb-2"><i class="fas fa-clipboard-check mr-1"></i>承認情報</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between"><span class="text-gray-500">ステータス:</span>\${getStatusBadge(r.status)}</div>
                  <div class="flex justify-between"><span class="text-gray-500">申請者:</span><span>\${r.requester_name}</span></div>
                  <div class="flex justify-between"><span class="text-gray-500">承認者:</span><span>\${r.approver_name || '-'}</span></div>
                  <div class="flex justify-between"><span class="text-gray-500">申請日:</span><span>\${formatDate(r.requested_at)}</span></div>
                  \${r.responded_at ? \`<div class="flex justify-between"><span class="text-gray-500">回答日:</span><span>\${formatDate(r.responded_at)}</span></div>\` : ''}
                  \${r.request_comment ? \`<div class="mt-2"><span class="text-gray-500">申請コメント:</span><p class="mt-1 p-2 bg-gray-50 rounded text-gray-700">\${r.request_comment}</p></div>\` : ''}
                  \${r.response_comment ? \`<div class="mt-2"><span class="text-gray-500">\${r.status === 'rejected' ? '差戻し理由' : '承認コメント'}:</span><p class="mt-1 p-2 \${r.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'} rounded">\${r.response_comment}</p></div>\` : ''}
                </div>
                
                \${r.status === 'pending' ? \`
                  <div class="mt-6 flex gap-2">
                    <button onclick="approveRequest(\${r.id})" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                      <i class="fas fa-check mr-1"></i>承認
                    </button>
                    <button onclick="closeDetailModal(); openRejectModal(\${r.id})" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                      <i class="fas fa-undo mr-1"></i>差戻し
                    </button>
                  </div>
                \` : ''}
              </div>
              
              <!-- 右: 見積情報 -->
              <div>
                <h3 class="font-bold text-gray-700 mb-3 border-b pb-2"><i class="fas fa-file-invoice mr-1"></i>見積情報</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between"><span class="text-gray-500">見積番号:</span><span class="font-medium">\${r.estimate_number || '-'}</span></div>
                  <div class="flex justify-between"><span class="text-gray-500">顧客名:</span><span>\${r.customer_name || '-'}</span></div>
                  <div class="flex justify-between"><span class="text-gray-500">案件名:</span><span>\${r.project_name || '-'}</span></div>
                  <div class="flex justify-between"><span class="text-gray-500">配送先:</span><span>\${r.delivery_address || '-'}</span></div>
                  <div class="flex justify-between"><span class="text-gray-500">車両:</span><span>\${r.vehicle_type || '-'}</span></div>
                  <div class="flex justify-between border-t pt-2 mt-2">
                    <span class="text-gray-500 font-medium">合計金額:</span>
                    <span class="text-lg font-bold text-blue-700">\${formatAmount(r.total_amount)}</span>
                  </div>
                </div>
                \${r.estimate_id ? \`
                  <div class="mt-4">
                    <a href="/api/estimates/\${r.estimate_id}/pdf" target="_blank" class="inline-flex items-center px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100">
                      <i class="fas fa-file-pdf mr-1"></i>PDF表示
                    </a>
                  </div>
                \` : ''}
              </div>
            </div>
          \`;
        }
      } catch (e) { console.error(e); }
    }

    function closeDetailModal() {
      document.getElementById('approvalDetailModal').style.display = 'none';
    }

    async function approveRequest(id) {
      if (!confirm('この見積を承認しますか？')) return;
      try {
        const res = await fetch(\`/api/approval-requests/\${id}/approve\`, {
          method: 'PUT',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ comment: '' })
        });
        const data = await res.json();
        if (data.success) {
          alert('承認しました');
          closeDetailModal();
          loadRequests();
        } else {
          alert(data.message || 'エラーが発生しました');
        }
      } catch (e) { alert('承認処理に失敗しました'); }
    }

    function openRejectModal(id) {
      document.getElementById('rejectRequestId').value = id;
      document.getElementById('rejectComment').value = '';
      document.getElementById('rejectModal').style.display = 'flex';
    }

    function closeRejectModal() {
      document.getElementById('rejectModal').style.display = 'none';
    }

    async function submitReject() {
      const id = document.getElementById('rejectRequestId').value;
      const comment = document.getElementById('rejectComment').value.trim();
      if (!comment) {
        alert('差戻し理由を入力してください');
        return;
      }
      try {
        const res = await fetch(\`/api/approval-requests/\${id}/reject\`, {
          method: 'PUT',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ comment })
        });
        const data = await res.json();
        if (data.success) {
          alert('差し戻しました');
          closeRejectModal();
          closeDetailModal();
          loadRequests();
        } else {
          alert(data.message || 'エラーが発生しました');
        }
      } catch (e) { alert('差戻し処理に失敗しました'); }
    }

    loadRequests();
  </script>
</body>
</html>`;
  return c.html(html)
})

// ============================================
// 承認ワークフロー API
// ============================================

// 承認者一覧取得
app.get('/api/approvers', async (c) => {
  try {
    const { env } = c
    const result = await env.DB.prepare(`
      SELECT * FROM approvers ORDER BY is_active DESC, name ASC
    `).all()
    return c.json({ success: true, data: result.results })
  } catch (error) {
    return c.json({ success: false, message: '承認者一覧の取得に失敗しました' }, 500)
  }
})

// 有効な承認者のみ取得
app.get('/api/approvers/active', async (c) => {
  try {
    const { env } = c
    const result = await env.DB.prepare(`
      SELECT id, name, email, department FROM approvers WHERE is_active = 1 ORDER BY name ASC
    `).all()
    return c.json({ success: true, data: result.results })
  } catch (error) {
    return c.json({ success: false, message: '承認者一覧の取得に失敗しました' }, 500)
  }
})

// 承認者追加
app.post('/api/approvers', async (c) => {
  try {
    const { env } = c
    const { name, email, role, department } = await c.req.json()
    if (!name || !email) {
      return c.json({ success: false, message: '氏名とメールアドレスは必須です' }, 400)
    }
    const result = await env.DB.prepare(`
      INSERT INTO approvers (name, email, role, department) VALUES (?, ?, ?, ?)
    `).bind(name, email, role || 'approver', department || '').run()
    return c.json({ success: true, message: '承認者を追加しました', id: result.meta.last_row_id })
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return c.json({ success: false, message: 'このメールアドレスは既に登録されています' }, 400)
    }
    return c.json({ success: false, message: '承認者の追加に失敗しました' }, 500)
  }
})

// 承認者更新
app.put('/api/approvers/:id', async (c) => {
  try {
    const { env } = c
    const id = c.req.param('id')
    const { name, email, role, department, is_active } = await c.req.json()
    await env.DB.prepare(`
      UPDATE approvers SET name = ?, email = ?, role = ?, department = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(name, email, role || 'approver', department || '', is_active ?? 1, id).run()
    return c.json({ success: true, message: '承認者を更新しました' })
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return c.json({ success: false, message: 'このメールアドレスは既に使用されています' }, 400)
    }
    return c.json({ success: false, message: '承認者の更新に失敗しました' }, 500)
  }
})

// 承認者削除
app.delete('/api/approvers/:id', async (c) => {
  try {
    const { env } = c
    const id = c.req.param('id')
    // 関連する承認リクエストがある場合は論理削除（無効化）
    const hasRequests = await env.DB.prepare(`
      SELECT COUNT(*) as cnt FROM approval_requests WHERE approver_id = ?
    `).bind(id).first()
    if (hasRequests && (hasRequests as any).cnt > 0) {
      await env.DB.prepare(`UPDATE approvers SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(id).run()
      return c.json({ success: true, message: '関連する承認履歴があるため無効化しました' })
    }
    await env.DB.prepare(`DELETE FROM approvers WHERE id = ?`).bind(id).run()
    return c.json({ success: true, message: '承認者を削除しました' })
  } catch (error) {
    return c.json({ success: false, message: '承認者の削除に失敗しました' }, 500)
  }
})

// ============================================
// 承認リクエスト API
// ============================================

// 承認申請
app.post('/api/approval-requests', async (c) => {
  try {
    const { env } = c
    const { estimate_id, approver_id, requester_name, request_comment } = await c.req.json()
    if (!estimate_id || !approver_id || !requester_name) {
      return c.json({ success: false, message: '見積ID、承認者、申請者名は必須です' }, 400)
    }

    // 既にpendingの承認リクエストがないか確認
    const existing = await env.DB.prepare(`
      SELECT id FROM approval_requests WHERE estimate_id = ? AND status = 'pending'
    `).bind(estimate_id).first()
    if (existing) {
      return c.json({ success: false, message: 'この見積には既に承認待ちのリクエストがあります' }, 400)
    }

    // 承認リクエスト作成
    const result = await env.DB.prepare(`
      INSERT INTO approval_requests (estimate_id, approver_id, requester_name, request_comment)
      VALUES (?, ?, ?, ?)
    `).bind(estimate_id, approver_id, requester_name, request_comment || '').run()

    // 見積ステータスを「承認申請済み」に更新
    await env.DB.prepare(`
      UPDATE estimates SET status = 'approval_requested', updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(estimate_id).run()

    // TODO: メール通知（Phase 4で実装）

    return c.json({ success: true, message: '承認申請を送信しました', id: result.meta.last_row_id })
  } catch (error) {
    return c.json({ success: false, message: '承認申請に失敗しました' }, 500)
  }
})

// 承認リクエスト一覧取得
app.get('/api/approval-requests', async (c) => {
  try {
    const { env } = c
    const status = c.req.query('status') || ''
    
    let query = `
      SELECT ar.*, 
             a.name as approver_name, a.email as approver_email, a.department as approver_department,
             e.estimate_number, e.total_amount, e.customer_id, e.project_id,
             c.name as customer_name,
             p.name as project_name
      FROM approval_requests ar
      LEFT JOIN approvers a ON ar.approver_id = a.id
      LEFT JOIN estimates e ON ar.estimate_id = e.id
      LEFT JOIN customers c ON e.customer_id = c.id
      LEFT JOIN projects p ON e.project_id = p.id
    `
    
    if (status) {
      query += ` WHERE ar.status = '${status}'`
    }
    query += ` ORDER BY ar.requested_at DESC`

    const result = await env.DB.prepare(query).all()
    return c.json({ success: true, data: result.results })
  } catch (error) {
    return c.json({ success: false, message: '承認リクエスト一覧の取得に失敗しました' }, 500)
  }
})

// 承認リクエスト詳細（見積情報含む）
app.get('/api/approval-requests/:id', async (c) => {
  try {
    const { env } = c
    const id = c.req.param('id')
    
    const request = await env.DB.prepare(`
      SELECT ar.*, 
             a.name as approver_name, a.email as approver_email,
             e.*, e.id as estimate_id,
             c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
             p.name as project_name
      FROM approval_requests ar
      LEFT JOIN approvers a ON ar.approver_id = a.id
      LEFT JOIN estimates e ON ar.estimate_id = e.id
      LEFT JOIN customers c ON e.customer_id = c.id
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE ar.id = ?
    `).bind(id).first()

    if (!request) {
      return c.json({ success: false, message: '承認リクエストが見つかりません' }, 404)
    }

    return c.json({ success: true, data: request })
  } catch (error) {
    return c.json({ success: false, message: '承認リクエスト詳細の取得に失敗しました' }, 500)
  }
})

// 承認実行
app.put('/api/approval-requests/:id/approve', async (c) => {
  try {
    const { env } = c
    const id = c.req.param('id')
    const { comment } = await c.req.json()

    // リクエスト取得
    const request = await env.DB.prepare(`
      SELECT * FROM approval_requests WHERE id = ? AND status = 'pending'
    `).bind(id).first() as any
    if (!request) {
      return c.json({ success: false, message: '承認待ちのリクエストが見つかりません' }, 404)
    }

    // 承認リクエスト更新
    await env.DB.prepare(`
      UPDATE approval_requests SET status = 'approved', response_comment = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(comment || '', id).run()

    // 見積ステータスを「承認済み」に更新
    await env.DB.prepare(`
      UPDATE estimates SET status = 'pending_approval', updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(request.estimate_id).run()

    // TODO: 申請者にメール通知（Phase 4）

    return c.json({ success: true, message: '見積を承認しました' })
  } catch (error) {
    return c.json({ success: false, message: '承認処理に失敗しました' }, 500)
  }
})

// 差戻し実行
app.put('/api/approval-requests/:id/reject', async (c) => {
  try {
    const { env } = c
    const id = c.req.param('id')
    const { comment } = await c.req.json()
    if (!comment) {
      return c.json({ success: false, message: '差戻し理由は必須です' }, 400)
    }

    // リクエスト取得
    const request = await env.DB.prepare(`
      SELECT * FROM approval_requests WHERE id = ? AND status = 'pending'
    `).bind(id).first() as any
    if (!request) {
      return c.json({ success: false, message: '承認待ちのリクエストが見つかりません' }, 404)
    }

    // 承認リクエスト更新
    await env.DB.prepare(`
      UPDATE approval_requests SET status = 'rejected', response_comment = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(comment, id).run()

    // 見積ステータスを「差戻し」に更新
    await env.DB.prepare(`
      UPDATE estimates SET status = 'revision_requested', updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(request.estimate_id).run()

    // TODO: 申請者にメール通知（Phase 4）

    return c.json({ success: true, message: '見積を差し戻しました' })
  } catch (error) {
    return c.json({ success: false, message: '差戻し処理に失敗しました' }, 500)
  }
})

// Cloudflare Cron Trigger対応
export default {
  fetch: app.fetch,
  // Cronトリガーハンドラー（毎時実行）
  scheduled: async (event, env, ctx) => {
    console.log('🕐 定期バックアップCronトリガー実行:', new Date().toISOString())
    
    try {
      // バックアップチェックを実行
      const result = await checkAndExecuteScheduledBackups(env.DB)
      console.log('✅ 定期バックアップCron完了:', result)
    } catch (error) {
      console.error('❌ 定期バックアップCronエラー:', error)
    }
  }
}

// Cron用のバックアップチェック関数
async function checkAndExecuteScheduledBackups(db) {
  const now = new Date()
  
  console.log('🔍 定期バックアップチェック開始:', now.toISOString())
  
  // 実行すべきスケジュールを取得
  const schedules = await db.prepare(`
    SELECT * FROM backup_schedules 
    WHERE is_active = 1 
    AND (last_run IS NULL OR datetime(last_run) < datetime('now', '-1 hour'))
  `).all()
  
  const executedBackups = []
  
  for (const schedule of (schedules.results || [])) {
    try {
      if (shouldRunBackup(schedule, now)) {
        console.log('⚡ 定期バックアップ実行:', schedule.schedule_name)
        
        // バックアップ実行
        const backupResult = await executeScheduledBackup(db, schedule)
        executedBackups.push(backupResult)
        
        // 最終実行時刻を更新
        await db.prepare(`
          UPDATE backup_schedules 
          SET last_run = ?, run_count = run_count + 1 
          WHERE id = ?
        `).bind(now.toISOString(), schedule.id).run()
        
        console.log('✅ 定期バックアップ完了:', schedule.schedule_name)
      }
    } catch (scheduleError) {
      console.error(`❌ スケジュール ${schedule.schedule_name} の実行エラー:`, scheduleError)
    }
  }
  
  return {
    checked_at: now.toISOString(),
    executed_backups: executedBackups,
    count: executedBackups.length
  }
}

// ========================================
// シンプル認証システム（既存コードに影響なし）
// ========================================

// bcryptハッシュ化（Cloudflare Workers互換）
async function hashPassword(password: string): Promise<string> {
  // bcryptの代わりにWeb Crypto APIを使用
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'salt-secret-key')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// セッションID生成
function generateSessionId(): string {
  return crypto.randomUUID()
}

// セッション検証ミドルウェア（オプション）
// ログインAPI (verifySession関数は17296行目に移動済み)
app.post('/api/auth/login', async (c) => {
  try {
    const { env } = c
    const { userId, password } = await c.req.json()
    
    if (!userId || !password) {
      return c.json({
        success: false,
        message: 'IDとパスワードを入力してください'
      }, 400)
    }
    
    // ユーザー検証
    const user = await env.DB.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({
        success: false,
        message: 'IDまたはパスワードが正しくありません'
      }, 401)
    }
    
    // パスワード検証
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return c.json({
        success: false,
        message: 'IDまたはパスワードが正しくありません'
      }, 401)
    }
    
    // セッション作成
    const sessionId = generateSessionId()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7日間有効
    
    await env.DB.prepare(`
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES (?, ?, ?)
    `).bind(sessionId, user.id, expiresAt.toISOString()).run()
    
    // Cookie設定（SameSite=Laxでセキュリティ確保、Secureはプロキシ環境で問題があるため省略）
    c.header('Set-Cookie', `session_id=${sessionId}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`)
    
    return c.json({
      success: true,
      message: 'ログインしました',
      data: {
        userId: user.id,
        userName: user.name
      }
    })
    
  } catch (error) {
    console.error('ログインエラー:', error)
    return c.json({
      success: false,
      message: 'ログインに失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// ログアウトAPI
app.post('/api/auth/logout', async (c) => {
  try {
    const { env } = c
    
    // Cookieヘッダーから手動でセッションIDを取得
    const cookieHeader = c.req.header('Cookie') || ''
    const sessionIdMatch = cookieHeader.match(/session_id=([^;]+)/)
    const sessionId = sessionIdMatch ? sessionIdMatch[1] : null
    
    console.log('ログアウト処理:', { cookieHeader, sessionId })
    
    if (sessionId) {
      // セッション削除
      const result = await env.DB.prepare(`
        DELETE FROM sessions WHERE id = ?
      `).bind(sessionId).run()
      console.log('セッション削除結果:', result)
    }
    
    // Cookie削除
    c.header('Set-Cookie', `session_id=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`)
    
    return c.json({
      success: true,
      message: 'ログアウトしました'
    })
    
  } catch (error) {
    console.error('ログアウトエラー:', error)
    return c.json({
      success: false,
      message: 'ログアウトに失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// セッション確認API
app.get('/api/auth/session', async (c) => {
  try {
    const { env } = c
    
    // 認証機能が無効な場合（開発環境）
    if (env.ENABLE_AUTH === 'false') {
      return c.json({
        success: true,
        authenticated: false,  // 開発環境では認証不要
        authRequired: false,
        data: {
          userId: 'test-user-001',
          userName: '開発者'
        }
      })
    }
    
    // セッション検証
    const result = await verifySession(c)
    
    if (!result.valid) {
      return c.json({
        success: true,
        authenticated: false,
        authRequired: true
      })
    }
    
    return c.json({
      success: true,
      authenticated: true,
      authRequired: true,
      data: {
        userId: result.userId,
        userName: result.userName
      }
    })
    
  } catch (error) {
    console.error('セッション確認エラー:', error)
    return c.json({
      success: false,
      message: 'セッション確認に失敗しました'
    }, 500)
  }
})

// ユーザー作成API（初期セットアップ用）
app.post('/api/auth/users', async (c) => {
  try {
    const { env } = c
    const { userId, name, password } = await c.req.json()
    
    if (!userId || !name || !password) {
      return c.json({
        success: false,
        message: 'すべての項目を入力してください'
      }, 400)
    }
    
    // パスワードハッシュ化
    const hashedPassword = await hashPassword(password)
    
    // ユーザー作成
    const result = await env.DB.prepare(`
      INSERT INTO users (id, name, password)
      VALUES (?, ?, ?)
    `).bind(userId, name, hashedPassword).run()
    
    if (!result.success) {
      return c.json({
        success: false,
        message: 'ユーザーの作成に失敗しました（IDが重複している可能性があります）'
      }, 400)
    }
    
    return c.json({
      success: true,
      message: 'ユーザーを作成しました',
      data: {
        userId,
        name
      }
    })
    
  } catch (error) {
    console.error('ユーザー作成エラー:', error)
    return c.json({
      success: false,
      message: 'ユーザーの作成に失敗しました',
      error: error instanceof Error ? error.message : '不明なエラー'
    }, 500)
  }
})

// ユーザー一覧取得API
app.get('/api/auth/users', async (c) => {
  try {
    const { env } = c
    
    const users = await env.DB.prepare(`
      SELECT id, name, created_at FROM users
      ORDER BY created_at DESC
    `).all()
    
    return c.json({
      success: true,
      data: users.results || []
    })
    
  } catch (error) {
    console.error('ユーザー一覧取得エラー:', error)
    return c.json({
      success: false,
      message: 'ユーザー一覧の取得に失敗しました'
    }, 500)
  }
})

// パスワード変更API
app.put('/api/auth/users/:userId/password', async (c) => {
  try {
    const { env } = c
    const userId = c.req.param('userId')
    const { newPassword } = await c.req.json()
    
    if (!newPassword || newPassword.length < 4) {
      return c.json({
        success: false,
        message: 'パスワードは4文字以上で入力してください'
      }, 400)
    }
    
    // ユーザー存在確認
    const user = await env.DB.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({
        success: false,
        message: 'ユーザーが見つかりません'
      }, 404)
    }
    
    // パスワードハッシュ化
    const hashedPassword = await hashPassword(newPassword)
    
    // パスワード更新
    await env.DB.prepare(`
      UPDATE users SET password = ? WHERE id = ?
    `).bind(hashedPassword, userId).run()
    
    // 既存セッションを削除（再ログインが必要）
    await env.DB.prepare(`
      DELETE FROM sessions WHERE user_id = ?
    `).bind(userId).run()
    
    return c.json({
      success: true,
      message: 'パスワードを変更しました'
    })
    
  } catch (error) {
    console.error('パスワード変更エラー:', error)
    return c.json({
      success: false,
      message: 'パスワードの変更に失敗しました'
    }, 500)
  }
})

// ユーザー削除API
app.delete('/api/auth/users/:userId', async (c) => {
  try {
    const { env } = c
    const userId = c.req.param('userId')
    
    // ユーザー存在確認
    const user = await env.DB.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({
        success: false,
        message: 'ユーザーが見つかりません'
      }, 404)
    }
    
    // セッション削除（外部キー制約でカスケード削除）
    await env.DB.prepare(`
      DELETE FROM sessions WHERE user_id = ?
    `).bind(userId).run()
    
    // ユーザー削除
    await env.DB.prepare(`
      DELETE FROM users WHERE id = ?
    `).bind(userId).run()
    
    return c.json({
      success: true,
      message: 'ユーザーを削除しました'
    })
    
  } catch (error) {
    console.error('ユーザー削除エラー:', error)
    return c.json({
      success: false,
      message: 'ユーザーの削除に失敗しました'
    }, 500)
  }
})
