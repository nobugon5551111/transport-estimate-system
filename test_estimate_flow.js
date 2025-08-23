// 見積作成フロー自動テスト
// Chrome DevToolsのコンソールで実行します

console.log('🧪 自動テスト開始：スタッフ費用保存問題の調査');

// テスト用のフロー自動実行関数
async function runEstimateFlowTest() {
  try {
    // STEP1: 顧客・案件選択
    console.log('🎯 STEP1: 顧客・案件選択');
    
    // 最初の顧客を選択
    const customerSelect = document.getElementById('customer_id');
    if (customerSelect && customerSelect.options.length > 1) {
      customerSelect.selectedIndex = 1; // 最初の実際の顧客を選択
      await customerSelect.dispatchEvent(new Event('change'));
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
    }
    
    // 最初の案件を選択
    const projectSelect = document.getElementById('project_id');
    if (projectSelect && projectSelect.options.length > 1) {
      projectSelect.selectedIndex = 1; // 最初の実際の案件を選択
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('✅ STEP1完了 - STEP2に進行');
    if (typeof proceedToStep2 === 'function') {
      proceedToStep2();
      await new Promise(resolve => setTimeout(resolve, 2000)); // ページ遷移待機
    }
    
  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
  }
}

// 現在のページに応じてテストを実行
if (window.location.pathname === '/estimate/step1') {
  console.log('📍 STEP1でテスト開始');
  runEstimateFlowTest();
} else {
  console.log('🔍 現在のページ:', window.location.pathname);
  console.log('STEP1から開始してください');
}