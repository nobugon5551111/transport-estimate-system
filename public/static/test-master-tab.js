// マスタ管理タブを自動クリックするテスト
(function() {
    console.log('🧪 マスタ管理タブ自動クリックテスト開始');
    
    function clickMasterTab() {
        console.log('🔍 マスタ管理タブを検索中...');
        
        const masterTab = document.getElementById('tab-masters');
        if (masterTab) {
            console.log('✅ マスタ管理タブが見つかりました');
            masterTab.click();
            console.log('🖱️ マスタ管理タブをクリックしました');
            
            setTimeout(() => {
                console.log('🔍 サービスタブを検索中...');
                
                const servicesSubTab = document.querySelector('[onclick="MasterManagement.switchTab(\'services\')"]');
                if (servicesSubTab) {
                    console.log('✅ サービスサブタブが見つかりました');
                    servicesSubTab.click();
                    console.log('🖱️ サービスサブタブをクリックしました');
                } else {
                    console.log('❌ サービスサブタブが見つかりませんでした');
                    // 直接 MasterManagement.switchTab を呼び出し
                    if (typeof MasterManagement !== 'undefined' && MasterManagement.switchTab) {
                        console.log('🔧 直接 switchTab("services") を実行');
                        MasterManagement.switchTab('services');
                    }
                }
            }, 1000);
        } else {
            console.log('❌ マスタ管理タブが見つかりませんでした');
        }
    }
    
    // ページ読み込み完了後に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', clickMasterTab);
    } else {
        clickMasterTab();
    }
})();
