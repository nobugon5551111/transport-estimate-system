// 案件管理テスト用JavaScriptコマンド
console.log('=== 案件管理機能テスト開始 ===');

// 案件タブをクリック
if (window.MasterManagement && window.MasterManagement.switchTab) {
  console.log('✅ 案件タブをクリック');
  window.MasterManagement.switchTab('projects');
} else {
  console.log('❌ MasterManagement が見つかりません');
}

// 新規案件追加ボタンをクリック
setTimeout(() => {
  if (window.MasterManagement && window.MasterManagement.openAddProjectModal) {
    console.log('✅ 新規案件追加ボタンをクリック');
    window.MasterManagement.openAddProjectModal();
    
    // 顧客プルダウンをチェック
    setTimeout(() => {
      const customerSelect = document.getElementById('masterProjectCustomerId');
      if (customerSelect) {
        console.log('✅ 顧客プルダウン要素が見つかりました');
        console.log('顧客オプション数:', customerSelect.options.length);
        for (let i = 0; i < customerSelect.options.length; i++) {
          console.log(`- オプション ${i}: ${customerSelect.options[i].text} (${customerSelect.options[i].value})`);
        }
      } else {
        console.log('❌ 顧客プルダウン要素が見つかりません');
      }
    }, 2000);
  } else {
    console.log('❌ openAddProjectModal が見つかりません');
  }
}, 1000);

console.log('=== テストスクリプト完了 ===');
