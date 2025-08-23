console.log('🐛 スタッフ費用デバッグテスト開始');
console.log('============================================');

// スタッフ費用計算のシミュレーション
console.log('\n💰 スタッフ費用計算シミュレーション');

const staffData = {
  supervisor_count: 1,
  leader_count: 1,
  m2_staff_half_day: 0,
  m2_staff_full_day: 2,
  temp_staff_half_day: 0,
  temp_staff_full_day: 1
};

console.log('入力スタッフデータ:', staffData);

// フォールバック単価を使用
const rates = {
  supervisor_rate: 15000,
  leader_rate: 12000,
  m2_staff_half_day_rate: 6000,
  m2_staff_full_day_rate: 10000,
  temp_staff_half_day_rate: 5500,
  temp_staff_full_day_rate: 9500
};

console.log('使用する単価:', rates);

const costs = {
  supervisor: staffData.supervisor_count * rates.supervisor_rate,
  leader: staffData.leader_count * rates.leader_rate,
  m2_half_day: staffData.m2_staff_half_day * rates.m2_staff_half_day_rate,
  m2_full_day: staffData.m2_staff_full_day * rates.m2_staff_full_day_rate,
  temp_half_day: staffData.temp_staff_half_day * rates.temp_staff_half_day_rate,
  temp_full_day: staffData.temp_staff_full_day * rates.temp_staff_full_day_rate
};

const totalCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);

console.log('計算結果:');
console.log('  個別費用:', costs);
console.log('  合計費用:', totalCost);

const expectedStaffInfo = {
  ...staffData,
  total_cost: totalCost,
  supervisor_rate: rates.supervisor_rate,
  leader_rate: rates.leader_rate,
  m2_staff_half_day_rate: rates.m2_staff_half_day_rate,
  m2_staff_full_day_rate: rates.m2_staff_full_day_rate,
  temp_staff_half_day_rate: rates.temp_staff_half_day_rate,
  temp_staff_full_day_rate: rates.temp_staff_full_day_rate
};

console.log('期待されるcurrentStaffInfo:', expectedStaffInfo);

// sessionStorageシミュレーション
console.log('\n💾 sessionStorageシミュレーション');
const mockFlowData = {
  step: 5,
  customer: { name: 'テスト顧客' },
  project: { name: 'テストプロジェクト' },
  delivery: { area: 'A' },
  vehicle: { cost: 100000 },
  staff: expectedStaffInfo
};

console.log('sessionStorageに保存されるべきデータ:');
console.log(JSON.stringify(mockFlowData, null, 2));

console.log('\nSTEP6で読み込まれるstaff.total_cost:', mockFlowData.staff.total_cost);

console.log('\n============================================');
console.log('🐛 デバッグテスト完了');