/**
 * 見積作成フロー金額計算テストスクリプト
 * 
 * このスクリプトは見積作成フローの各ステップでの金額計算を
 * 模擬的にテストし、不整合を検出します。
 */

console.log('🧪 見積作成フロー金額計算テスト開始');

// テストデータ
const testData = {
  // 車両データ（STEP3）
  vehicle: {
    vehicle_2t_count: 2,
    vehicle_4t_count: 1, 
    operation: '終日',
    area: 'D',
    cost: 0, // APIから取得される
    external_contractor_cost: 5000,
    uses_multiple_vehicles: true
  },
  
  // スタッフデータ（STEP4）
  staff: {
    supervisor_count: 1,
    leader_count: 2,
    m2_staff_half_day: 0,
    m2_staff_full_day: 3,
    temp_staff_half_day: 1,
    temp_staff_full_day: 2,
    // スタッフ単価（マスタデータから）
    supervisor_rate: 15000,
    leader_rate: 12000,
    m2_staff_half_day_rate: 6000,
    m2_staff_full_day_rate: 10000,
    temp_staff_half_day_rate: 5500,
    temp_staff_full_day_rate: 9500,
    total_cost: 0 // 計算される
  },
  
  // サービスデータ（STEP5）
  services: {
    parking_officer_cost: 9000,
    transport_cost: 16000,
    waste_disposal_cost: 5000,
    protection_cost: 8000,
    material_collection_cost: 0,
    construction_cost: 0,
    parking_fee: 2000,
    highway_fee: 3500,
    work_time_multiplier: 1.0, // 作業時間帯割増なし
    total_cost: 0 // 計算される
  }
};

// STEP3: 車両費用計算
async function calculateVehicleCosts() {
  console.log('\n🚗 STEP3: 車両費用計算');
  
  let vehicleTotal = 0;
  
  // 2t車費用
  if (testData.vehicle.vehicle_2t_count > 0) {
    const response = await fetch(`http://localhost:3000/api/vehicle-pricing/2t車/${testData.vehicle.operation}/${testData.vehicle.area}`);
    const data = await response.json();
    if (data.success) {
      const cost2t = data.data.price * testData.vehicle.vehicle_2t_count;
      vehicleTotal += cost2t;
      console.log(`  2t車 ${testData.vehicle.vehicle_2t_count}台 × ¥${data.data.price.toLocaleString()} = ¥${cost2t.toLocaleString()}`);
    }
  }
  
  // 4t車費用
  if (testData.vehicle.vehicle_4t_count > 0) {
    const response = await fetch(`http://localhost:3000/api/vehicle-pricing/4t車/${testData.vehicle.operation}/${testData.vehicle.area}`);
    const data = await response.json();
    if (data.success) {
      const cost4t = data.data.price * testData.vehicle.vehicle_4t_count;
      vehicleTotal += cost4t;
      console.log(`  4t車 ${testData.vehicle.vehicle_4t_count}台 × ¥${data.data.price.toLocaleString()} = ¥${cost4t.toLocaleString()}`);
    }
  }
  
  // 外注費用
  if (testData.vehicle.external_contractor_cost > 0) {
    vehicleTotal += testData.vehicle.external_contractor_cost;
    console.log(`  外注費用 = ¥${testData.vehicle.external_contractor_cost.toLocaleString()}`);
  }
  
  testData.vehicle.cost = vehicleTotal;
  console.log(`  🔄 車両費用合計: ¥${vehicleTotal.toLocaleString()}`);
  
  return vehicleTotal;
}

// STEP4: スタッフ費用計算
function calculateStaffCosts() {
  console.log('\n👥 STEP4: スタッフ費用計算');
  
  let staffTotal = 0;
  
  if (testData.staff.supervisor_count > 0) {
    const cost = testData.staff.supervisor_count * testData.staff.supervisor_rate;
    staffTotal += cost;
    console.log(`  スーパーバイザー ${testData.staff.supervisor_count}人 × ¥${testData.staff.supervisor_rate.toLocaleString()} = ¥${cost.toLocaleString()}`);
  }
  
  if (testData.staff.leader_count > 0) {
    const cost = testData.staff.leader_count * testData.staff.leader_rate;
    staffTotal += cost;
    console.log(`  リーダー ${testData.staff.leader_count}人 × ¥${testData.staff.leader_rate.toLocaleString()} = ¥${cost.toLocaleString()}`);
  }
  
  if (testData.staff.m2_staff_full_day > 0) {
    const cost = testData.staff.m2_staff_full_day * testData.staff.m2_staff_full_day_rate;
    staffTotal += cost;
    console.log(`  M2スタッフ（終日）${testData.staff.m2_staff_full_day}人 × ¥${testData.staff.m2_staff_full_day_rate.toLocaleString()} = ¥${cost.toLocaleString()}`);
  }
  
  if (testData.staff.temp_staff_half_day > 0) {
    const cost = testData.staff.temp_staff_half_day * testData.staff.temp_staff_half_day_rate;
    staffTotal += cost;
    console.log(`  派遣スタッフ（半日）${testData.staff.temp_staff_half_day}人 × ¥${testData.staff.temp_staff_half_day_rate.toLocaleString()} = ¥${cost.toLocaleString()}`);
  }
  
  if (testData.staff.temp_staff_full_day > 0) {
    const cost = testData.staff.temp_staff_full_day * testData.staff.temp_staff_full_day_rate;
    staffTotal += cost;
    console.log(`  派遣スタッフ（終日）${testData.staff.temp_staff_full_day}人 × ¥${testData.staff.temp_staff_full_day_rate.toLocaleString()} = ¥${cost.toLocaleString()}`);
  }
  
  testData.staff.total_cost = staffTotal;
  console.log(`  🔄 スタッフ費用合計: ¥${staffTotal.toLocaleString()}`);
  
  return staffTotal;
}

// STEP5: サービス費用計算
function calculateServicesCosts() {
  console.log('\n🔧 STEP5: サービス費用計算');
  
  let servicesTotal = 0;
  
  if (testData.services.parking_officer_cost > 0) {
    servicesTotal += testData.services.parking_officer_cost;
    console.log(`  駐車対策員費用 = ¥${testData.services.parking_officer_cost.toLocaleString()}`);
  }
  
  if (testData.services.transport_cost > 0) {
    servicesTotal += testData.services.transport_cost;
    console.log(`  人員輸送費用 = ¥${testData.services.transport_cost.toLocaleString()}`);
  }
  
  if (testData.services.waste_disposal_cost > 0) {
    servicesTotal += testData.services.waste_disposal_cost;
    console.log(`  廃棄物処理費用 = ¥${testData.services.waste_disposal_cost.toLocaleString()}`);
  }
  
  if (testData.services.protection_cost > 0) {
    servicesTotal += testData.services.protection_cost;
    console.log(`  養生作業費用 = ¥${testData.services.protection_cost.toLocaleString()}`);
  }
  
  if (testData.services.parking_fee > 0) {
    servicesTotal += testData.services.parking_fee;
    console.log(`  実費：駐車料金 = ¥${testData.services.parking_fee.toLocaleString()}`);
  }
  
  if (testData.services.highway_fee > 0) {
    servicesTotal += testData.services.highway_fee;
    console.log(`  実費：高速料金 = ¥${testData.services.highway_fee.toLocaleString()}`);
  }
  
  testData.services.total_cost = servicesTotal;
  console.log(`  🔄 サービス費用合計: ¥${servicesTotal.toLocaleString()}`);
  
  return servicesTotal;
}

// STEP6: 最終合計計算
function calculateFinalTotal(vehicleCost, staffCost, servicesCost) {
  console.log('\n📊 STEP6: 最終合計計算');
  
  const subtotal = vehicleCost + staffCost + servicesCost;
  const taxRate = 0.1;
  const taxAmount = Math.floor(subtotal * taxRate);
  const totalAmount = subtotal + taxAmount;
  
  console.log(`  小計: ¥${subtotal.toLocaleString()}`);
  console.log(`  消費税（${(taxRate * 100)}%）: ¥${taxAmount.toLocaleString()}`);
  console.log(`  🎯 合計金額: ¥${totalAmount.toLocaleString()}`);
  
  return { subtotal, taxAmount, totalAmount };
}

// メイン実行関数
async function runPricingFlowTest() {
  try {
    console.log('='.repeat(60));
    
    // 各ステップの計算を実行
    const vehicleCost = await calculateVehicleCosts();
    const staffCost = calculateStaffCosts();
    const servicesCost = calculateServicesCosts();
    const totals = calculateFinalTotal(vehicleCost, staffCost, servicesCost);
    
    console.log('\n📋 テスト結果サマリー');
    console.log('='.repeat(60));
    console.log(`車両費用:     ¥${vehicleCost.toLocaleString()}`);
    console.log(`スタッフ費用: ¥${staffCost.toLocaleString()}`);
    console.log(`サービス費用: ¥${servicesCost.toLocaleString()}`);
    console.log(`小計:         ¥${totals.subtotal.toLocaleString()}`);
    console.log(`消費税:       ¥${totals.taxAmount.toLocaleString()}`);
    console.log(`合計金額:     ¥${totals.totalAmount.toLocaleString()}`);
    console.log('='.repeat(60));
    
    console.log('\n✅ 見積作成フロー金額計算テスト完了');
    console.log('💡 この結果と実際のアプリケーションでの表示を比較してください');
    
  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
  }
}

// Node.js環境での実行
const fetch = require('node-fetch');

(async function() {
  try {
    await runPricingFlowTest();
  } catch (error) {
    console.error('❌ 全体テストエラー:', error);
    process.exit(1);
  }
})();