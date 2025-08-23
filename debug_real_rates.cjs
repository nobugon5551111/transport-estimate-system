console.log('🐛 実際のスタッフ単価を使った計算テスト');
console.log('============================================');

// APIから取得した実際の単価
const realRates = {
  supervisor: 25000,
  leader: 22000,
  m2_half_day: 8500,
  m2_full_day: 15000,
  temp_half_day: 7500,
  temp_full_day: 13500
};

// フォールバック単価
const fallbackRates = {
  supervisor: 15000,
  leader: 12000,
  m2_half_day: 6000,
  m2_full_day: 10000,
  temp_half_day: 5500,
  temp_full_day: 9500
};

const staffData = {
  supervisor_count: 1,
  leader_count: 1,
  m2_staff_half_day: 0,
  m2_staff_full_day: 2,
  temp_staff_half_day: 0,
  temp_staff_full_day: 1
};

console.log('入力スタッフデータ:', staffData);
console.log('\n実際のAPI単価:', realRates);
console.log('フォールバック単価:', fallbackRates);

// 実際の単価で計算
const realCosts = {
  supervisor: staffData.supervisor_count * realRates.supervisor,
  leader: staffData.leader_count * realRates.leader,
  m2_half_day: staffData.m2_staff_half_day * realRates.m2_half_day,
  m2_full_day: staffData.m2_staff_full_day * realRates.m2_full_day,
  temp_half_day: staffData.temp_staff_half_day * realRates.temp_half_day,
  temp_full_day: staffData.temp_staff_full_day * realRates.temp_full_day
};

const realTotalCost = Object.values(realCosts).reduce((sum, cost) => sum + cost, 0);

// フォールバック単価で計算
const fallbackCosts = {
  supervisor: staffData.supervisor_count * fallbackRates.supervisor,
  leader: staffData.leader_count * fallbackRates.leader,
  m2_half_day: staffData.m2_staff_half_day * fallbackRates.m2_half_day,
  m2_full_day: staffData.m2_staff_full_day * fallbackRates.m2_full_day,
  temp_half_day: staffData.temp_staff_half_day * fallbackRates.temp_half_day,
  temp_full_day: staffData.temp_staff_full_day * fallbackRates.temp_full_day
};

const fallbackTotalCost = Object.values(fallbackCosts).reduce((sum, cost) => sum + cost, 0);

console.log('\n💰 実際の単価での計算結果:');
console.log('  個別費用:', realCosts);
console.log('  合計費用:', realTotalCost);

console.log('\n💰 フォールバック単価での計算結果:');
console.log('  個別費用:', fallbackCosts);
console.log('  合計費用:', fallbackTotalCost);

console.log('\n📊 差異分析:');
console.log('  実際の合計 - フォールバック合計 =', realTotalCost - fallbackTotalCost);

console.log('\n============================================');
console.log('🐛 デバッグテスト完了');