// スタッフ費用保存問題のデバッグスクリプト
// ブラウザのコンソールで実行します

console.log('🔍 スタッフ費用データ保存問題の調査開始');

// sessionStorageの内容を確認
function checkSessionStorage() {
  const flowData = JSON.parse(sessionStorage.getItem('estimateFlow') || '{}');
  console.log('📦 現在のsessionStorage:', flowData);
  
  if (flowData.staff) {
    console.log('👥 スタッフ情報詳細:', {
      supervisor_count: flowData.staff.supervisor_count,
      leader_count: flowData.staff.leader_count,
      m2_staff_half_day: flowData.staff.m2_staff_half_day,
      m2_staff_full_day: flowData.staff.m2_staff_full_day,
      temp_staff_half_day: flowData.staff.temp_staff_half_day,
      temp_staff_full_day: flowData.staff.temp_staff_full_day,
      total_cost: flowData.staff.total_cost,
      staff_cost: flowData.staff.staff_cost
    });
  } else {
    console.log('❌ スタッフ情報が見つかりません');
  }
  
  return flowData;
}

// STEP4での入力値を手動でチェック
function checkStep4Inputs() {
  console.log('🔍 STEP4入力フィールドの確認:');
  
  const inputs = [
    'supervisor_count',
    'leader_count', 
    'm2_staff_half_day',
    'm2_staff_full_day',
    'temp_staff_half_day',
    'temp_staff_full_day'
  ];
  
  inputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      console.log(`  ${id}: ${element.value}`);
    } else {
      console.log(`  ${id}: 要素が見つかりません`);
    }
  });
}

// STEP4のレートをチェック
function checkStep4Rates() {
  if (typeof Step4Implementation !== 'undefined' && Step4Implementation.staffRates) {
    console.log('💰 STEP4レート:', Step4Implementation.staffRates);
  } else {
    console.log('❌ Step4Implementation.staffRatesが見つかりません');
  }
}

// 手動でスタッフ費用を計算
function calculateStaffCostManually() {
  const rates = {
    supervisor: 25000,
    leader: 22000,
    m2_half_day: 8500,
    m2_full_day: 15000,
    temp_half_day: 7500,
    temp_full_day: 13500
  };
  
  const inputs = {
    supervisor_count: parseInt(document.getElementById('supervisor_count')?.value) || 0,
    leader_count: parseInt(document.getElementById('leader_count')?.value) || 0,
    m2_staff_half_day: parseInt(document.getElementById('m2_staff_half_day')?.value) || 0,
    m2_staff_full_day: parseInt(document.getElementById('m2_staff_full_day')?.value) || 0,
    temp_staff_half_day: parseInt(document.getElementById('temp_staff_half_day')?.value) || 0,
    temp_staff_full_day: parseInt(document.getElementById('temp_staff_full_day')?.value) || 0
  };
  
  const totalCost = 
    inputs.supervisor_count * rates.supervisor +
    inputs.leader_count * rates.leader +
    inputs.m2_staff_half_day * rates.m2_half_day +
    inputs.m2_staff_full_day * rates.m2_full_day +
    inputs.temp_staff_half_day * rates.temp_half_day +
    inputs.temp_staff_full_day * rates.temp_full_day;
  
  console.log('🧮 手動計算結果:', {
    inputs: inputs,
    rates: rates,
    totalCost: totalCost
  });
  
  return totalCost;
}

// sessionStorageを手動で更新するテスト
function fixSessionStorageManually() {
  const flowData = JSON.parse(sessionStorage.getItem('estimateFlow') || '{}');
  const manualCost = calculateStaffCostManually();
  
  if (!flowData.staff) {
    flowData.staff = {};
  }
  
  // 現在の入力値で更新
  flowData.staff = {
    supervisor_count: parseInt(document.getElementById('supervisor_count')?.value) || 0,
    leader_count: parseInt(document.getElementById('leader_count')?.value) || 0,
    m2_staff_half_day: parseInt(document.getElementById('m2_staff_half_day')?.value) || 0,
    m2_staff_full_day: parseInt(document.getElementById('m2_staff_full_day')?.value) || 0,
    temp_staff_half_day: parseInt(document.getElementById('temp_staff_half_day')?.value) || 0,
    temp_staff_full_day: parseInt(document.getElementById('temp_staff_full_day')?.value) || 0,
    total_cost: manualCost,
    staff_cost: manualCost
  };
  
  sessionStorage.setItem('estimateFlow', JSON.stringify(flowData));
  console.log('✅ sessionStorageを手動で修正しました:', flowData.staff);
  
  return flowData;
}

// 現在のページに応じてテストを実行
if (window.location.pathname === '/estimate/step4') {
  console.log('📍 STEP4ページでデバッグ実行');
  checkStep4Inputs();
  checkStep4Rates();
  calculateStaffCostManually();
  checkSessionStorage();
} else if (window.location.pathname === '/estimate/step5') {
  console.log('📍 STEP5ページでデバッグ実行');
  checkSessionStorage();
} else if (window.location.pathname === '/estimate/step6') {
  console.log('📍 STEP6ページでデバッグ実行');
  checkSessionStorage();
} else {
  console.log('📍 現在のページ:', window.location.pathname);
  checkSessionStorage();
}

// 使用可能な関数をグローバルに公開
window.debugStaffCost = {
  checkSessionStorage,
  checkStep4Inputs, 
  checkStep4Rates,
  calculateStaffCostManually,
  fixSessionStorageManually
};

console.log('🔧 デバッグ関数が利用可能です: window.debugStaffCost');