console.log('🧪 PDF出力スタッフ費用修正テスト');
console.log('============================================');

// 提供されたPDFの実際のスタッフデータ
const actualStaffData = {
  leader_count: 1,
  m2_staff_full_day: 2,
  temp_staff_full_day: 1,
  supervisor_count: 0,
  m2_staff_half_day: 0,
  temp_staff_half_day: 0
};

// 実際のAPI単価
const staffRates = {
  supervisor: 25000,
  leader: 22000,
  m2_half_day: 8500,
  m2_full_day: 15000,
  temp_half_day: 7500,
  temp_full_day: 13500
};

console.log('👥 実際のスタッフ構成（PDFより）:', actualStaffData);
console.log('💰 使用される単価:', staffRates);

// 修正後の動的計算をシミュレーション
const calculatedStaffCost = 
  (actualStaffData.supervisor_count || 0) * staffRates.supervisor +
  (actualStaffData.leader_count || 0) * staffRates.leader +
  (actualStaffData.m2_staff_half_day || 0) * staffRates.m2_half_day +
  (actualStaffData.m2_staff_full_day || 0) * staffRates.m2_full_day +
  (actualStaffData.temp_staff_half_day || 0) * staffRates.temp_half_day +
  (actualStaffData.temp_staff_full_day || 0) * staffRates.temp_full_day;

console.log('\n🔢 個別計算:');
console.log(`  リーダー: ${actualStaffData.leader_count}名 × ¥${staffRates.leader.toLocaleString()} = ¥${(actualStaffData.leader_count * staffRates.leader).toLocaleString()}`);
console.log(`  M2終日: ${actualStaffData.m2_staff_full_day}名 × ¥${staffRates.m2_full_day.toLocaleString()} = ¥${(actualStaffData.m2_staff_full_day * staffRates.m2_full_day).toLocaleString()}`);
console.log(`  派遣終日: ${actualStaffData.temp_staff_full_day}名 × ¥${staffRates.temp_full_day.toLocaleString()} = ¥${(actualStaffData.temp_staff_full_day * staffRates.temp_full_day).toLocaleString()}`);

console.log(` \n✅ 修正後の期待スタッフ費用: ¥${calculatedStaffCost.toLocaleString()}`);

// 修正前後の比較
console.log('\n📊 修正前後の比較:');
console.log('  修正前: ¥0 (データベースのstaff_costがnull)');
console.log(`  修正後: ¥${calculatedStaffCost.toLocaleString()} (動的再計算)`);

// PDFの他の費用も確認
const otherCosts = {
  vehicle_cost: 50000,
  parking_officer_cost: 8750,
  transport_cost: 15000,
  waste_disposal_cost: 5000,
  protection_cost: 8000,
  construction_cost: 10000,
  parking_fee: 1000,
  highway_fee: 2000
};

const totalServicesCost = Object.values(otherCosts).reduce((sum, cost) => sum + cost, 0) - otherCosts.vehicle_cost;
const newSubtotal = otherCosts.vehicle_cost + calculatedStaffCost + totalServicesCost;
const newTax = Math.floor(newSubtotal * 0.1);
const newTotal = newSubtotal + newTax;

console.log('\n📋 修正後の見積合計:');
console.log(`  車両費用: ¥${otherCosts.vehicle_cost.toLocaleString()}`);
console.log(`  スタッフ費用: ¥${calculatedStaffCost.toLocaleString()}`);
console.log(`  サービス費用: ¥${totalServicesCost.toLocaleString()}`);
console.log(`  小計: ¥${newSubtotal.toLocaleString()}`);
console.log(`  消費税: ¥${newTax.toLocaleString()}`);
console.log(`  合計: ¥${newTotal.toLocaleString()}`);

console.log('\n============================================');
console.log('🧪 テスト完了');
console.log('次回PDF生成時に上記の金額が正しく表示されることを確認してください');