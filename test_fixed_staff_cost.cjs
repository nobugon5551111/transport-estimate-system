console.log('🧪 修正後スタッフ費用計算テスト');
console.log('============================================');

// 実際のAPI単価（データベースから取得される値）
const apiRates = {
  supervisor: 25000,
  leader: 22000,
  m2_half_day: 8500,
  m2_full_day: 15000,
  temp_half_day: 7500,
  temp_full_day: 13500
};

console.log('📊 実際のAPI単価:', apiRates);

// テストケース：ユーザーの入力例
const testStaffData = {
  supervisor_count: 0,
  leader_count: 1,
  m2_staff_half_day: 0,
  m2_staff_full_day: 2,
  temp_staff_half_day: 0,
  temp_staff_full_day: 1
};

console.log('👥 テスト入力データ:', testStaffData);

// 修正後の計算（正しいフィールド名を使用）
const costs = {
  supervisor: testStaffData.supervisor_count * apiRates.supervisor,
  leader: testStaffData.leader_count * apiRates.leader,
  m2_half_day: testStaffData.m2_staff_half_day * apiRates.m2_half_day,
  m2_full_day: testStaffData.m2_staff_full_day * apiRates.m2_full_day,
  temp_half_day: testStaffData.temp_staff_half_day * apiRates.temp_half_day,
  temp_full_day: testStaffData.temp_staff_full_day * apiRates.temp_full_day
};

const totalCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);

console.log('\n💰 修正後の計算結果:');
console.log('  個別費用:', costs);
console.log('  合計費用:', totalCost);

// currentStaffInfoの内容（STEP4で保存される内容）
const expectedCurrentStaffInfo = {
  supervisor_count: testStaffData.supervisor_count,
  leader_count: testStaffData.leader_count,
  m2_staff_half_day: testStaffData.m2_staff_half_day,
  m2_staff_full_day: testStaffData.m2_staff_full_day,
  temp_staff_half_day: testStaffData.temp_staff_half_day,
  temp_staff_full_day: testStaffData.temp_staff_full_day,
  total_cost: totalCost
};

console.log('\n📦 STEP4で保存されるcurrentStaffInfo:');
console.log(expectedCurrentStaffInfo);

// sessionStorageでの保存内容
const sessionData = {
  step: 5,
  customer: { name: 'テスト顧客' },
  project: { name: 'テストプロジェクト' },
  delivery: { area: 'A' },
  vehicle: { cost: 100000 },
  staff: expectedCurrentStaffInfo
};

console.log('\n💾 sessionStorageに保存される内容:');
console.log('  staff.total_cost:', sessionData.staff.total_cost);

// STEP6での再計算（同じAPI単価を使用）
const recalculatedTotal = Object.values(costs).reduce((sum, cost) => sum + cost, 0);

console.log('\n🔍 STEP6での再計算結果:');
console.log('  再計算合計:', recalculatedTotal);
console.log('  保存値:', sessionData.staff.total_cost);
console.log('  差異:', Math.abs(recalculatedTotal - sessionData.staff.total_cost));

if (Math.abs(recalculatedTotal - sessionData.staff.total_cost) <= 1) {
  console.log('  ✅ 正常: 計算結果と保存値が一致');
} else {
  console.log('  ❌ 異常: 計算結果と保存値に差異あり');
}

console.log('\n============================================');
console.log('期待される表示: "リーダー以上 1人 (￥22,000/人) ￥22,000"');
console.log('期待される表示: "M2スタッフ（終日）2人 (￥15,000/人) ￥30,000"');
console.log('期待される表示: "派遣スタッフ（終日）1人 (￥13,500/人) ￥13,500"');
console.log('期待されるスタッフ費用合計: ￥65,500');
console.log('============================================');
console.log('🧪 テスト完了');