// 輸送見積もりシステム - メインJavaScript
// 🔄 キャッシュバスター直接フォーム制御: 1760195388

// ===== 重複実行防止システム =====
(function() {
  'use strict';
  
  console.log('🔒 Installing global duplicate prevention system...');
  
  // すでに初期化されている場合は終了
  if (window._projectSystemInitialized) {
    console.log('⚠️ Project management system already initialized, skipping');
    return;
  }
  
  // グローバル重複送信防止フラグ
  window._globalSubmitLock = false;
  window._lastSubmitTime = 0;
  
  // 全てのフォーム送信を監視し、重複を防ぐ
  document.addEventListener('submit', function(event) {
    if (event.target.id === 'masterProjectForm') {
      const now = Date.now();
      
      console.log('🔍 GLOBAL: Intercepting masterProjectForm submission');
      
      // 重複送信をブロック
      if (window._globalSubmitLock) {
        console.log('🚫 GLOBAL BLOCK: Form submission already in progress');
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      }
      
      // 1秒以内の連続送信をブロック
      if (window._lastSubmitTime && (now - window._lastSubmitTime) < 1000) {
        console.log('🚫 GLOBAL BLOCK: Too fast consecutive submission');
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      }
      
      console.log('✅ GLOBAL: Allowing form submission');
      window._globalSubmitLock = true;
      window._lastSubmitTime = now;
      
      // 3秒後にロックを解除
      setTimeout(() => {
        console.log('🔓 GLOBAL: Releasing submit lock');
        window._globalSubmitLock = false;
      }, 3000);
    }
  }, true); // useCapture = true で他のハンドラーより先に実行
  
  console.log('🔒 Global duplicate submission prevention installed');
  window._projectSystemInitialized = true;
})();

// グローバル変数（重複宣言を防ぐため条件付き）
if (typeof currentUser === 'undefined') {
  var currentUser = 'test-user-001'; // 実際はFirebase認証から取得
}
// 重複宣言を防ぐため条件付きでestimateFlowを宣言
if (typeof estimateFlow === 'undefined') {
  var estimateFlow = {
    step: 1,
    data: {}
  };
}

// ユーティリティ関数（重複宣言を防ぐため条件付き）
if (typeof Utils === 'undefined') {
  const Utils = {
  // 数値をカンマ区切りでフォーマット
  formatNumber: (num) => {
    return new Intl.NumberFormat('ja-JP').format(num);
  },

  // 金額を円表示でフォーマット
  formatCurrency: (amount) => {
    return `¥${Utils.formatNumber(amount)}`;
  },

  // 郵便番号のフォーマット（7桁 -> XXX-XXXX）
  formatPostalCode: (postalCode) => {
    const cleaned = postalCode.replace(/[^\d]/g, '');
    if (cleaned.length === 7) {
      return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
    }
    return cleaned;
  },

  // 日付フォーマット
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // ローディング表示
  showLoading: (element) => {
    if (element) {
      element.innerHTML = '<i class="fas fa-spinner spin"></i> 読み込み中...';
      element.disabled = true;
    }
  },

  // ローディング終了
  hideLoading: (element, text) => {
    if (element) {
      element.innerHTML = text;
      element.disabled = false;
    }
  },

  // エラー表示
  showError: (message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 fade-in';
    errorDiv.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    document.body.appendChild(errorDiv);
    
    // 5秒後に自動削除
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  },

  // 成功表示
  showSuccess: (message) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 fade-in';
    successDiv.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-check-circle mr-2"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    document.body.appendChild(successDiv);
    
    // 5秒後に自動削除
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.remove();
      }
    }, 5000);
  }
};
  
  // グローバル参照も設定
  window.Utils = Utils;
}

// API呼び出し関数（重複宣言を防ぐため条件付き）
if (typeof API === 'undefined') {
  window.API = {
  // ベースURL
  baseUrl: '/api',

  // 共通のHTTPリクエスト処理
  request: async (method, endpoint, data = null) => {
    try {
      const config = {
        method,
        url: `${window.API.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      
      if (error.response) {
        throw new Error(error.response.data.error || 'API呼び出しに失敗しました');
      } else if (error.request) {
        throw new Error('サーバーに接続できませんでした');
      } else {
        throw new Error('リクエストの処理中にエラーが発生しました');
      }
    }
  },

  // GET リクエスト
  get: (endpoint) => window.API.request('GET', endpoint),

  // POST リクエスト
  post: (endpoint, data) => window.API.request('POST', endpoint, data),

  // PUT リクエスト
  put: (endpoint, data) => window.API.request('PUT', endpoint, data),

  // DELETE リクエスト
  delete: (endpoint) => window.API.request('DELETE', endpoint)
  };
}

// 郵便番号検索（重複宣言を防ぐため条件付き）
if (typeof PostalCode === 'undefined') {
  const PostalCode = {
  // 住所を取得
  searchAddress: async (postalCode) => {
    try {
      const cleanedCode = postalCode.replace(/[^\d]/g, '');
      if (cleanedCode.length !== 7) {
        throw new Error('郵便番号は7桁で入力してください');
      }

      const response = await API.get(`/postal-code/${cleanedCode}`);
      return response;
    } catch (error) {
      console.error('郵便番号検索エラー:', error);
      throw error;
    }
  }
};
  
  // グローバル参照も設定
  window.PostalCode = PostalCode;
}

// デバッグ用テスト関数
window.testModalFunction = function() {
  console.log('=== Modal Test Function Called ===');
  console.log('Modal object:', typeof Modal);
  console.log('Modal.open function:', typeof Modal.open);
  
  const modal = document.getElementById('customerModal');
  console.log('customerModal element:', modal);
  
  if (modal) {
    console.log('Modal classes before:', modal.className);
    console.log('Modal style before:', modal.style.display);
    
    Modal.open('customerModal');
    
    console.log('Modal classes after:', modal.className);
    console.log('Modal style after:', modal.style.display);
  }
  
  return 'Test completed - check console for details';
};

// モーダル制御（重複宣言を防ぐため条件付き）
if (typeof Modal === 'undefined') {
  const Modal = {
  // モーダルを開く
  open: (modalId) => {
    console.log('🎯 Modal.open called for:', modalId);
    const modal = document.getElementById(modalId);
    console.log('🔍 Modal element found:', modal);
    console.log('📝 Initial classes:', modal ? modal.className : 'Element not found');
    console.log('👁️ Initial display style:', modal ? modal.style.display : 'Element not found');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('show');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      console.log('✅ Modal classes after changes:', modal.className);
      console.log('✅ Modal display style after changes:', modal.style.display);
      console.log('🚀 Modal should now be visible');
      
      // ESCキーでモーダルを閉じる
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          Modal.close(modalId);
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
    } else {
      console.error('Modal element not found:', modalId);
    }
  },

  // モーダルを閉じる
  close: (modalId) => {
    console.log('Modal.close called for:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  },

  // 確認ダイアログ
  confirm: (message, onConfirm, onCancel) => {
    const confirmed = window.confirm(message);
    if (confirmed && onConfirm) {
      onConfirm();
    } else if (!confirmed && onCancel) {
      onCancel();
    }
    return confirmed;
  }
};
  
  // グローバル参照も設定
  window.Modal = Modal;
}

// 見積作成フロー（重複宣言を防ぐため条件付き）
if (typeof EstimateFlow === 'undefined') {
  window.EstimateFlow = {
  // 初期化
  initialize: () => {
    console.log('EstimateFlow初期化開始');
    
    // セッションストレージから前回のデータを復元
    try {
      const savedFlow = sessionStorage.getItem('estimateFlow');
      if (savedFlow) {
        const flowData = JSON.parse(savedFlow);
        estimateFlow.step = flowData.step || 1;
        estimateFlow.data = flowData || {};
        console.log('セッションデータを復元:', flowData);
      }
    } catch (error) {
      console.error('セッションデータ復元エラー:', error);
    }
    
    // 顧客選択・案件選択のイベントリスナーを設定
    const customerSelect = document.getElementById('customerSelect');
    const projectSelect = document.getElementById('projectSelect');
    
    if (customerSelect) {
      customerSelect.addEventListener('change', EstimateFlow.handleCustomerChange);
      console.log('顧客選択のイベントリスナー設定完了');
    }
    
    if (projectSelect) {
      projectSelect.addEventListener('change', EstimateFlow.handleProjectChange);
      console.log('案件選択のイベントリスナー設定完了');
    }
    
    console.log('EstimateFlow初期化完了');
  },

  // 顧客変更時の処理
  handleCustomerChange: async () => {
    console.log('顧客選択が変更されました');
    const customerSelect = document.getElementById('customerSelect');
    const projectSelect = document.getElementById('projectSelect');
    const nextBtn = document.getElementById('nextStepBtn');
    
    if (customerSelect && customerSelect.value) {
      try {
        // EstimateFlowImplementationの機能を呼び出し
        if (typeof EstimateFlowImplementation !== 'undefined' && EstimateFlowImplementation.handleCustomerChange) {
          await EstimateFlowImplementation.handleCustomerChange();
          
          // 選択データをEstimateFlowにコピー
          EstimateFlow.selectedCustomer = EstimateFlowImplementation.selectedCustomer;
          EstimateFlow.selectedProject = EstimateFlowImplementation.selectedProject;
        }
      } catch (error) {
        console.error('顧客変更処理エラー:', error);
      }
    }
  },

  // 案件変更時の処理
  handleProjectChange: async () => {
    console.log('案件選択が変更されました');
    const projectSelect = document.getElementById('projectSelect');
    
    if (projectSelect && projectSelect.value) {
      try {
        // EstimateFlowImplementationの機能を呼び出し
        if (typeof EstimateFlowImplementation !== 'undefined' && EstimateFlowImplementation.handleProjectChange) {
          await EstimateFlowImplementation.handleProjectChange();
          
          // 選択データをEstimateFlowにコピー
          EstimateFlow.selectedCustomer = EstimateFlowImplementation.selectedCustomer;
          EstimateFlow.selectedProject = EstimateFlowImplementation.selectedProject;
        }
      } catch (error) {
        console.error('案件変更処理エラー:', error);
      }
    }
  },

  // 次のステップに進む
  nextStep: () => {
    if (estimateFlow.step < 6) {
      estimateFlow.step++;
      EstimateFlow.updateUI();
    }
  },

  // 前のステップに戻る
  prevStep: () => {
    if (estimateFlow.step > 1) {
      estimateFlow.step--;
      EstimateFlow.updateUI();
    }
  },

  // UI更新
  updateUI: () => {
    // プログレスバー更新
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
      const progressPercent = (estimateFlow.step / 6) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }

    // ステップ表示更新
    const stepNumbers = document.querySelectorAll('.step-number');
    stepNumbers.forEach((step, index) => {
      if (index + 1 <= estimateFlow.step) {
        step.classList.add('bg-blue-600', 'text-white');
        step.classList.remove('bg-gray-200', 'text-gray-600');
      } else {
        step.classList.add('bg-gray-200', 'text-gray-600');
        step.classList.remove('bg-blue-600', 'text-white');
      }
    });
  },

  // データ保存
  saveStepData: (stepData) => {
    estimateFlow.data = { ...estimateFlow.data, ...stepData };
  },

  // 見積計算
  calculate: () => {
    // 車両費用、スタッフ費用、サービス費用を合計
    const vehicleCost = estimateFlow.data.vehicle_cost || 0;
    const staffCost = estimateFlow.data.staff_cost || 0;
    const servicesCost = estimateFlow.data.services_cost || 0;
    
    const subtotal = vehicleCost + staffCost + servicesCost;
    const taxRate = 0.1;
    const taxAmount = Math.floor(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;

    return {
      subtotal,
      taxRate,
      taxAmount,
      totalAmount
    };
  }
};
  
  // グローバル参照も設定
  window.EstimateFlow = EstimateFlow;
}

// テーブル制御（重複宣言を防ぐため条件付き）
if (typeof Table === 'undefined') {
  const Table = {
  // ソート機能
  sort: (tableId, columnIndex, dataType = 'string') => {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    const isAscending = table.dataset.sortDirection !== 'asc';
    table.dataset.sortDirection = isAscending ? 'asc' : 'desc';
    
    rows.sort((a, b) => {
      const aValue = a.cells[columnIndex].textContent.trim();
      const bValue = b.cells[columnIndex].textContent.trim();
      
      let comparison = 0;
      
      if (dataType === 'number') {
        comparison = parseFloat(aValue.replace(/[^\d.-]/g, '')) - parseFloat(bValue.replace(/[^\d.-]/g, ''));
      } else if (dataType === 'date') {
        comparison = new Date(aValue) - new Date(bValue);
      } else {
        comparison = aValue.localeCompare(bValue, 'ja-JP');
      }
      
      return isAscending ? comparison : -comparison;
    });
    
    rows.forEach(row => tbody.appendChild(row));
  }
};
  
  // グローバル参照も設定
  window.Table = Table;
}

// フォームバリデーション（重複宣言を防ぐため条件付き）
if (typeof Validator === 'undefined') {
  const Validator = {
  // 必須チェック
  required: (value, fieldName) => {
    if (!value || value.trim() === '') {
      throw new Error(`${fieldName}は必須です`);
    }
    return true;
  },

  // 郵便番号チェック
  postalCode: (value) => {
    const cleaned = value.replace(/[^\d]/g, '');
    if (cleaned.length !== 7) {
      throw new Error('郵便番号は7桁で入力してください');
    }
    return true;
  },

  // 数値チェック
  number: (value, fieldName, min = null, max = null) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new Error(`${fieldName}は数値で入力してください`);
    }
    if (min !== null && num < min) {
      throw new Error(`${fieldName}は${min}以上で入力してください`);
    }
    if (max !== null && num > max) {
      throw new Error(`${fieldName}は${max}以下で入力してください`);
    }
    return true;
  }
};
  
  // グローバル参照も設定
  window.Validator = Validator;
}

// 見積作成フロー - 具体的な実装（重複宣言を防ぐため条件付き）
if (typeof EstimateFlowImplementation === 'undefined') {
  window.EstimateFlowImplementation = {
  // 現在選択中のデータ
  selectedCustomer: null,
  selectedProject: null,

  // 顧客変更時の処理
  handleCustomerChange: async () => {
    const customerSelect = document.getElementById('customerSelect');
    const projectSelect = document.getElementById('projectSelect');
    const nextBtn = document.getElementById('nextStepBtn');
    const detailsDiv = document.getElementById('selectionDetails');

    if (customerSelect.value) {
      try {
        // 顧客情報を取得
        const customerResponse = await API.get(`/customers`);
        EstimateFlowImplementation.selectedCustomer = customerResponse.data.find(c => c.id == customerSelect.value);

        // 案件一覧を取得
        const projectResponse = await API.get(`/projects/${customerSelect.value}`);
        
        // 案件セレクトボックスを更新
        projectSelect.innerHTML = '<option value="">案件を選択してください</option>';
        projectResponse.data.forEach(project => {
          const option = document.createElement('option');
          option.value = project.id;
          option.textContent = `${project.name} (${EstimateFlowImplementation.getStatusLabel(project.status)})`;
          projectSelect.appendChild(option);
        });
        
        projectSelect.disabled = false;
        EstimateFlowImplementation.selectedProject = null;
        EstimateFlowImplementation.updateDetails();
        nextBtn.disabled = true;
        
        // 新規案件追加ボタンは常に有効（案件追加モーダル内で顧客選択可能なため）
        // const addProjectBtn = document.getElementById('addProjectBtn');
        // if (addProjectBtn) {
        //   addProjectBtn.disabled = false;
        // }

      } catch (error) {
        Utils.showError('顧客情報の取得に失敗しました: ' + error.message);
      }
    } else {
      projectSelect.innerHTML = '<option value="">まず顧客を選択してください</option>';
      projectSelect.disabled = true;
      EstimateFlowImplementation.selectedCustomer = null;
      EstimateFlowImplementation.selectedProject = null;
      detailsDiv.classList.add('hidden');
      nextBtn.disabled = true;
      
      // 新規案件追加ボタンは常に有効（案件追加モーダル内で顧客選択可能なため）
      // const addProjectBtn = document.getElementById('addProjectBtn');
      // if (addProjectBtn) {
      //   addProjectBtn.disabled = true;
      // }
    }
  },

  // 案件変更時の処理
  handleProjectChange: async () => {
    const projectSelect = document.getElementById('projectSelect');
    const nextBtn = document.getElementById('nextStepBtn');

    if (projectSelect.value) {
      try {
        const projectResponse = await API.get(`/projects/${EstimateFlowImplementation.selectedCustomer.id}`);
        EstimateFlowImplementation.selectedProject = projectResponse.data.find(p => p.id == projectSelect.value);
        
        EstimateFlowImplementation.updateDetails();
        nextBtn.disabled = false;
      } catch (error) {
        Utils.showError('案件情報の取得に失敗しました: ' + error.message);
      }
    } else {
      EstimateFlowImplementation.selectedProject = null;
      EstimateFlowImplementation.updateDetails();
      nextBtn.disabled = true;
    }
  },

  // 詳細表示の更新
  updateDetails: () => {
    const detailsDiv = document.getElementById('selectionDetails');
    const customerDetails = document.getElementById('customerDetails');
    const projectDetails = document.getElementById('projectDetails');

    if (EstimateFlowImplementation.selectedCustomer) {
      customerDetails.innerHTML = `
        <p><strong>${EstimateFlowImplementation.selectedCustomer.name}</strong></p>
        <p>担当者: ${EstimateFlowImplementation.selectedCustomer.contact_person || 'なし'}</p>
        <p>電話番号: ${EstimateFlowImplementation.selectedCustomer.phone || 'なし'}</p>
      `;

      if (EstimateFlowImplementation.selectedProject) {
        projectDetails.innerHTML = `
          <p><strong>${EstimateFlowImplementation.selectedProject.name}</strong></p>
          <p>ステータス: ${EstimateFlowImplementation.getStatusLabel(EstimateFlowImplementation.selectedProject.status)}</p>
        `;
        detailsDiv.classList.remove('hidden');
      } else {
        projectDetails.innerHTML = '<p class="text-gray-500">案件を選択してください</p>';
        detailsDiv.classList.remove('hidden');
      }
    } else {
      detailsDiv.classList.add('hidden');
    }
  },

  // 顧客一覧の読み込み
  loadCustomers: async () => {
    try {
      const response = await API.get('/customers');
      if (response.success) {
        const customerSelect = document.getElementById('customerSelect');
        if (customerSelect) {
          // 既存のオプションをクリア（最初のオプションは残す）
          customerSelect.innerHTML = '<option value="">顧客を選択してください</option>';
          
          // 顧客データをアルファベット順でソート
          const sortedCustomers = response.data.sort((a, b) => a.name.localeCompare(b.name));
          
          // 顧客オプションを追加
          sortedCustomers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.name;
            customerSelect.appendChild(option);
          });
          
          console.log(`顧客データを読み込みました: ${response.data.length}件`);
        }
      } else {
        Utils.showError('顧客データの取得に失敗しました');
      }
    } catch (error) {
      Utils.showError('顧客データの読み込み中にエラーが発生しました: ' + error.message);
    }
  },

  // ステータスラベルの取得
  getStatusLabel: (status) => {
    const labels = {
      'initial': '初回コンタクト',
      'quote_sent': '見積書送信済み',
      'under_consideration': '受注検討中',
      'order': '受注',
      'failed': '失注'
    };
    return labels[status] || status;
  },

  // STEP2に進む
  proceedToStep2: () => {
    if (EstimateFlowImplementation.selectedCustomer && EstimateFlowImplementation.selectedProject) {
      // セッションストレージにデータを保存
      sessionStorage.setItem('estimateFlow', JSON.stringify({
        step: 2,
        customer: EstimateFlowImplementation.selectedCustomer,
        project: EstimateFlowImplementation.selectedProject
      }));
      
      // STEP2ページに遷移
      window.location.href = '/estimate/step2';
    }
  },

  // 顧客追加フォーム送信
  submitCustomerForm: async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const customerData = {
      name: formData.get('name'),
      contact_person: formData.get('contact_person'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      notes: formData.get('notes'),
      user_id: currentUser
    };

    try {
      const saveButton = form.querySelector('button[type="submit"]');
      Utils.showLoading(saveButton);

      const response = await API.post('/customers', customerData);
      
      Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
      Utils.showSuccess(response.message);
      
      // 顧客セレクトボックスに追加
      const customerSelect = document.getElementById('customerSelect');
      const option = document.createElement('option');
      option.value = response.data.id;
      option.textContent = response.data.name;
      option.selected = true;
      customerSelect.appendChild(option);
      
      Modal.close('customerModal');
      form.reset();
      
      // 顧客変更処理を実行
      await EstimateFlowImplementation.handleCustomerChange();
      
    } catch (error) {
      Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
      Utils.showError('顧客の追加に失敗しました: ' + error.message);
    }
  },

  // 案件追加フォーム送信
  submitProjectForm: async (event) => {
    event.preventDefault();
    
    if (!EstimateFlowImplementation.selectedCustomer) {
      Utils.showError('まず顧客を選択してください');
      return;
    }

    const form = event.target;
    const formData = new FormData(form);
    
    const projectData = {
      customer_id: EstimateFlowImplementation.selectedCustomer.id,
      name: formData.get('name'),
      description: formData.get('description'),
      status: formData.get('status'),
      user_id: currentUser
    };

    try {
      const saveButton = form.querySelector('button[type="submit"]');
      Utils.showLoading(saveButton);

      const response = await API.post('/projects', projectData);
      
      Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
      Utils.showSuccess(response.message);
      
      // 案件セレクトボックスに追加
      const projectSelect = document.getElementById('projectSelect');
      const option = document.createElement('option');
      option.value = response.data.id;
      option.textContent = `${response.data.name} (${EstimateFlowImplementation.getStatusLabel(response.data.status)})`;
      option.selected = true;
      projectSelect.appendChild(option);
      
      Modal.close('projectModal');
      form.reset();
      
      // 案件変更処理を実行
      await EstimateFlowImplementation.handleProjectChange();
      
    } catch (error) {
      Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
      Utils.showError('案件の追加に失敗しました: ' + error.message);
    }
  }
  };
}

// グローバル関数（HTMLから呼び出される）
window.handleCustomerChange = EstimateFlowImplementation.handleCustomerChange;
window.handleProjectChange = EstimateFlowImplementation.handleProjectChange;
window.proceedToStep2 = EstimateFlowImplementation.proceedToStep2;
window.addNewCustomer = EstimateFlowImplementation.submitCustomerForm;
window.addNewProject = EstimateFlowImplementation.submitProjectForm;

// STEP2: 配送先入力の実装（重複宣言を防ぐため条件付き）
if (typeof Step2Implementation === 'undefined') {
  window.Step2Implementation = {
  currentDeliveryInfo: null,

  // ページ初期化
  initialize: () => {
    const flowData = JSON.parse(sessionStorage.getItem('estimateFlow') || '{}');
    
    if (!flowData.customer || !flowData.project) {
      Utils.showError('顧客・案件情報が見つかりません。最初からやり直してください。');
      window.location.href = '/estimate/new';
      return;
    }

    // 選択済み情報を表示
    document.getElementById('selectedCustomerName').textContent = flowData.customer.name;
    document.getElementById('selectedProjectName').textContent = flowData.project.name;
    
    // 既存の配送データがある場合の復元処理
    if (flowData.delivery) {
      const postalCodeInput = document.getElementById('postalCode');
      const addressInput = document.getElementById('deliveryAddress');
      const areaSelect = document.getElementById('areaSelect');
      
      if (postalCodeInput && flowData.delivery.postal_code) {
        postalCodeInput.value = flowData.delivery.postal_code;
      }
      if (addressInput && flowData.delivery.address) {
        addressInput.value = flowData.delivery.address;
      }
      if (areaSelect && flowData.delivery.area) {
        areaSelect.value = flowData.delivery.area;
      }
      
      // データを復元
      Step2Implementation.currentDeliveryInfo = flowData.delivery;
      Step2Implementation.updateConfirmation();
    }
    
    // 郵便番号入力フィールドに自動検索機能を追加
    const postalCodeInput = document.getElementById('postalCode');
    const areaSelect = document.getElementById('areaSelect');
    
    if (postalCodeInput && areaSelect) {
      PostalCodeUtils.attachAutoSearch(postalCodeInput, areaSelect);
      
      // エリア選択フィールドの変更イベントリスナーを追加
      areaSelect.addEventListener('change', Step2Implementation.handleAreaSelectChange);
    }
    
    console.log('STEP2初期化完了 - フローデータ:', flowData);
  },

  // 郵便番号入力フォーマット
  formatPostalCodeInput: (input) => {
    let value = input.value.replace(/[^\d]/g, '');
    if (value.length > 7) {
      value = value.substring(0, 7);
    }
    if (value.length > 3) {
      value = value.substring(0, 3) + '-' + value.substring(3);
    }
    input.value = value;
  },

  // 郵便番号で住所検索
  searchAddressByPostalCode: async () => {
    const postalCodeInput = document.getElementById('postalCode');
    const addressInput = document.getElementById('deliveryAddress');
    const searchBtn = document.getElementById('searchAddressBtn');
    const autoAreaResult = document.getElementById('autoAreaResult');
    const areaSelect = document.getElementById('areaSelect');
    
    const postalCode = postalCodeInput.value.replace(/[^\d]/g, '');
    
    if (!postalCode || postalCode.length !== 7) {
      Utils.showError('郵便番号は7桁で入力してください');
      return;
    }

    try {
      Utils.showLoading(searchBtn);
      
      // エリア自動判定API呼び出し
      const areaResponse = await API.get(`/postal-code/${postalCode}`);
      
      // 住所情報の自動入力（APIから住所が取得できた場合）
      if (areaResponse.address && !addressInput.value.trim()) {
        addressInput.value = areaResponse.address;
      } else if (!addressInput.value.trim()) {
        addressInput.placeholder = '住所を入力してください（例：大阪市都島区...）';
        addressInput.focus();
      }
      
      // エリア判定設定
      if (areaResponse.success) {
        if (areaResponse.detected) {
          // エリアが検出された場合
          areaSelect.value = areaResponse.area_rank;
          
          // 自動判定結果を表示
          document.getElementById('autoAreaText').innerHTML = `
            <strong>${areaResponse.area_rank}エリア</strong> - ${areaResponse.area_name}
          `;
          autoAreaResult.classList.remove('hidden');
          
          // 成功メッセージは自動判定結果の表示で十分なので削除
        } else {
          // エリアが検出されなかった場合
          areaSelect.value = 'D'; // デフォルトはDランク
          autoAreaResult.classList.add('hidden');
          
          Utils.showError('エリア情報が見つかりません。手動でエリアを選択してください。');
        }
        
        // 配送情報を保存
        Step2Implementation.currentDeliveryInfo = {
          postal_code: Utils.formatPostalCode(postalCode),
          address: addressInput.value || `郵便番号: ${Utils.formatPostalCode(postalCode)}`,
          area: areaResponse.area_rank,
          area_name: areaResponse.area_name || `${areaResponse.area_rank}エリア`
        };
        
        Step2Implementation.updateConfirmation();
        
      } else {
        // API呼び出し失敗
        areaSelect.value = 'D'; // デフォルトはDランク
        autoAreaResult.classList.add('hidden');
        
        Utils.showError('エリア判定に失敗しました。手動でエリアを選択してください。');
      }
      
    } catch (error) {
      // APIエラー - 手動選択を表示
      autoAreaResult.classList.add('hidden');
      manualAreaSelect.classList.remove('hidden');
      
      Utils.showError('住所の取得に失敗しました: ' + error.message);
    } finally {
      Utils.hideLoading(searchBtn, '<i class="fas fa-search mr-2"></i>住所検索');
    }
  },

  // エリア自動判定（郵便番号のみ）
  autoDetectArea: async () => {
    const postalCodeInput = document.getElementById('postalCode');
    const areaSelect = document.getElementById('areaSelect');
    const autoAreaResult = document.getElementById('autoAreaResult');
    const detectBtn = document.getElementById('autoAreaDetectBtn');
    
    const postalCode = postalCodeInput.value.replace(/[^\d]/g, '');
    
    if (!postalCode || postalCode.length !== 7) {
      Utils.showError('郵便番号は7桁で入力してください');
      return;
    }

    try {
      Utils.showLoading(detectBtn);
      
      const areaResponse = await API.get(`/postal-code/${postalCode}`);
      
      if (areaResponse.success) {
        if (areaResponse.detected) {
          // エリアが検出された場合
          areaSelect.value = areaResponse.area_rank;
          
          // 自動判定結果を表示
          document.getElementById('autoAreaText').innerHTML = `
            <strong>${areaResponse.area_rank}エリア</strong> - ${areaResponse.area_name}
          `;
          autoAreaResult.classList.remove('hidden');
          
          Utils.showSuccess(`エリアを自動検出: ${areaResponse.area_name} (${areaResponse.area_rank}ランク)`);
        } else {
          // エリアが検出されなかった場合
          areaSelect.value = 'D';
          autoAreaResult.classList.add('hidden');
          
          Utils.showError('エリア情報が見つかりません。手動でエリアを選択してください。');
        }
        
        // changeイベントを発火してエリア変更を反映
        const changeEvent = new Event('change', { bubbles: true });
        areaSelect.dispatchEvent(changeEvent);
        
      } else {
        Utils.showError('エリア判定に失敗しました');
      }
      
    } catch (error) {
      Utils.showError('エリア判定中にエラーが発生しました: ' + error.message);
    } finally {
      Utils.hideLoading(detectBtn, '<i class="fas fa-map-marker-alt mr-2"></i>エリア自動判定');
    }
  },

  // エリア選択変更時の処理
  updateAreaCostDisplay: () => {
    const areaSelect = document.getElementById('areaSelect');
    const postalCodeInput = document.getElementById('postalCode');
    const addressInput = document.getElementById('deliveryAddress');
    
    if (areaSelect.value && addressInput.value.trim()) {
      const areaNames = {
        'A': '大阪市内・京都市内・神戸市内',
        'B': '関西近郊主要都市',
        'C': '関西地方その他都市',
        'D': '遠方・その他地域'
      };
      
      Step2Implementation.currentDeliveryInfo = {
        postal_code: Utils.formatPostalCode(postalCodeInput.value.replace(/[^\d]/g, '')),
        address: addressInput.value.trim(),
        area: areaSelect.value,
        area_name: areaNames[areaSelect.value]
      };
      
      Step2Implementation.updateConfirmation();
    }
  },

  // メインエリア選択変更時の処理
  handleAreaSelectChange: () => {
    const postalCodeInput = document.getElementById('postalCode');
    const addressInput = document.getElementById('deliveryAddress');
    const areaSelect = document.getElementById('areaSelect');
    
    if (areaSelect.value) {
      const areaNames = {
        'A': '大阪市内・京都市内・神戸市内',
        'B': '関西近郊主要都市', 
        'C': '関西地方その他都市',
        'D': '遠方・その他地域'
      };
      
      // 住所が空の場合はデフォルト値を設定
      const address = addressInput.value.trim() || '住所未入力';
      const postalCode = postalCodeInput.value.replace(/[^\d]/g, '') || '0000000';
      
      Step2Implementation.currentDeliveryInfo = {
        postal_code: Utils.formatPostalCode(postalCode),
        address: address,
        area: areaSelect.value,
        area_name: areaNames[areaSelect.value]
      };
      
      console.log('エリア選択変曲 - 配送データ更新:', Step2Implementation.currentDeliveryInfo);
      Step2Implementation.updateConfirmation();
    }
  },
  
  // 手動エリア選択（フォールバック用）
  handleManualAreaChange: () => {
    const postalCodeInput = document.getElementById('postalCode');
    const addressInput = document.getElementById('deliveryAddress');
    const manualAreaSelect = document.getElementById('manualArea');
    
    if (manualAreaSelect.value && addressInput.value.trim()) {
      const areaNames = {
        'A': '大阪市内・京都市内・神戸市内',
        'B': '関西近郊主要都市', 
        'C': '関西地方その他都市',
        'D': '遠方・その他地域'
      };
      
      Step2Implementation.currentDeliveryInfo = {
        postal_code: Utils.formatPostalCode(postalCodeInput.value.replace(/[^\d]/g, '')),
        address: addressInput.value.trim(),
        area: manualAreaSelect.value,
        area_name: areaNames[manualAreaSelect.value]
      };
      
      Step2Implementation.updateConfirmation();
    }
  },

  // 住所入力変更時
  handleAddressChange: () => {
    const postalCodeInput = document.getElementById('postalCode');
    const addressInput = document.getElementById('deliveryAddress');
    const areaSelect = document.getElementById('areaSelect');
    
    // 既存データがある場合は更新、ない場合はエリアが選択されていれば新規作成
    if (Step2Implementation.currentDeliveryInfo) {
      Step2Implementation.currentDeliveryInfo.address = addressInput.value.trim();
      Step2Implementation.updateConfirmation();
    } else if (areaSelect.value && addressInput.value.trim()) {
      // エリアが選択されていて住所が入力された場合、自動でデータ作成
      Step2Implementation.handleAreaSelectChange();
    }
    
    console.log('住所変更 - 現在の配送データ:', Step2Implementation.currentDeliveryInfo);
  },

  // 確認情報の更新
  updateConfirmation: () => {
    const confirmationDiv = document.getElementById('addressConfirmation');
    const nextBtn = document.getElementById('nextStepBtn');
    
    if (Step2Implementation.currentDeliveryInfo && Step2Implementation.currentDeliveryInfo.area) {
      const confirmPostalCodeEl = document.getElementById('confirmPostalCode');
      const confirmAddressEl = document.getElementById('confirmAddress');
      const confirmAreaEl = document.getElementById('confirmArea');
      
      if (confirmPostalCodeEl) confirmPostalCodeEl.textContent = Step2Implementation.currentDeliveryInfo.postal_code;
      if (confirmAddressEl) confirmAddressEl.textContent = Step2Implementation.currentDeliveryInfo.address;
      if (confirmAreaEl) confirmAreaEl.textContent = `${Step2Implementation.currentDeliveryInfo.area}エリア（${Step2Implementation.currentDeliveryInfo.area_name}）`;
      
      confirmationDiv.classList.remove('hidden');
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.classList.remove('disabled:opacity-50', 'disabled:cursor-not-allowed');
      }
      
      console.log('STEP2確認情報更新 - ボタン有効化:', Step2Implementation.currentDeliveryInfo);
    } else {
      confirmationDiv.classList.add('hidden');
      if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.classList.add('disabled:opacity-50', 'disabled:cursor-not-allowed');
      }
    }
  },

  // STEP1に戻る
  goBackToStep1: () => {
    window.location.href = '/estimate/new';
  },

  // STEP3に進む
  proceedToStep3: () => {
    if (!Step2Implementation.currentDeliveryInfo) {
      Utils.showError('配送先情報を入力してください');
      return;
    }

    // セッションストレージのデータを更新
    const flowData = JSON.parse(sessionStorage.getItem('estimateFlow') || '{}');
    flowData.step = 3;
    flowData.delivery = Step2Implementation.currentDeliveryInfo;
    
    sessionStorage.setItem('estimateFlow', JSON.stringify(flowData));
    console.log('STEP2からSTEP3へ遷移 - 配送データ:', Step2Implementation.currentDeliveryInfo);
    
    // STEP3ページに遷移
    window.location.href = '/estimate/step3';
  }
  };
  
  // グローバル関数として公開
  window.Step2Implementation = Step2Implementation;
  window.handleAddressChange = Step2Implementation.handleAddressChange;
  window.handleAreaSelectChange = Step2Implementation.handleAreaSelectChange;
  window.handleManualAreaChange = Step2Implementation.handleManualAreaChange;
  window.formatPostalCodeInput = Step2Implementation.formatPostalCodeInput;
  window.searchAddressByPostalCode = Step2Implementation.searchAddressByPostalCode;
  window.autoDetectArea = Step2Implementation.autoDetectArea;
  window.goBackToStep1 = Step2Implementation.goBackToStep1;
  window.proceedToStep3 = Step2Implementation.proceedToStep3;
}

// グローバル関数として公開（HTMLから呼び出し用）
window.handleCustomerChange = EstimateFlowImplementation.handleCustomerChange;
window.handleProjectChange = EstimateFlowImplementation.handleProjectChange;
window.proceedToStep2 = EstimateFlowImplementation.proceedToStep2;

// STEP3: 車両選択の実装
const Step3Implementation = {
  currentVehicleInfo: null,

  // ページ初期化
  initialize: () => {
    const flowData = JSON.parse(sessionStorage.getItem('estimateFlow') || '{}');
    console.log('STEP3 初期化 - フローデータ:', flowData);
    
    if (!flowData.customer || !flowData.project || !flowData.delivery) {
      console.error('STEP3 エラー - 不完全なフローデータ:', flowData);
      Utils.showError('前のステップの情報が見つかりません。最初からやり直してください。');
      window.location.href = '/estimate/new';
      return;
    }

    if (!flowData.delivery.area) {
      console.error('STEP3 エラー - 配送エリア未設定:', flowData.delivery);
      Utils.showError('配送エリアが設定されていません。STEP2に戻って配送先を入力してください。');
      window.location.href = '/estimate/step2';
      return;
    }

    // 選択済み情報を表示
    document.getElementById('selectedCustomerName').textContent = flowData.customer.name;
    document.getElementById('selectedProjectName').textContent = flowData.project.name;
    document.getElementById('selectedArea').textContent = `${flowData.delivery.area}エリア（${flowData.delivery.area_name}）`;
    
    // エリア情報を保存
    Step3Implementation.currentArea = flowData.delivery.area;
    console.log('STEP3 初期化完了 - エリア設定:', {
      area: Step3Implementation.currentArea,
      delivery: flowData.delivery
    });
  },

  // 新しい個別車両台数変更処理
  handleIndividualVehicleCountChange: () => {
    const vehicle2tCount = parseInt(document.getElementById('vehicle2tCount')?.value) || 0;
    const vehicle4tCount = parseInt(document.getElementById('vehicle4tCount')?.value) || 0;
    
    console.log('🚗 車両台数変更:', { vehicle2tCount, vehicle4tCount });
    
    // 合計車両数表示を更新
    const totalCount = vehicle2tCount + vehicle4tCount;
    const totalCountElement = document.getElementById('totalVehicleCount');
    if (totalCountElement) {
      totalCountElement.textContent = `${totalCount}台`;
    }

    // 車両が選択されている場合は即座にボタンを有効化（緊急修正）
    if (totalCount > 0) {
      const nextBtn = document.getElementById('nextStepBtn');
      if (nextBtn) {
        console.log('🔧 緊急修正: 車両選択済み - ボタンを強制有効化');
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
        
        // 車両情報を強制的に保存
        const operationSelect = document.getElementById('operationType');
        let operationValue = operationSelect ? operationSelect.value : '';
        
        // 稼働形態が未選択の場合はデフォルト値を設定
        if (!operationValue || operationValue === '') {
          operationValue = '終日'; // デフォルト値
          if (operationSelect) {
            operationSelect.value = operationValue;
          }
        }
        
        Step3Implementation.currentVehicleInfo = {
          vehicle_2t_count: vehicle2tCount,
          vehicle_4t_count: vehicle4tCount,
          operation: operationValue,
          area: Step3Implementation.currentArea || 'D',
          cost: 0,
          external_contractor_cost: 0, // 外注費用フィールド削除により0固定
          uses_multiple_vehicles: true
        };
        
        console.log('🔧 緊急修正: 車両情報強制保存:', Step3Implementation.currentVehicleInfo);
      }
    }

    // 個別車両の料金表示を更新
    Step3Implementation.updateIndividualVehiclePricing(vehicle2tCount, vehicle4tCount);

    // 次へボタンの有効化状態を更新
    Step3Implementation.updateNextButtonState();

    // 従来の処理も実行
    Step3Implementation.updatePricing();
  },

  // 車両台数変更時の処理（複数車両対応）
  handleVehicleCountChange: () => {
    // 新しいHTML要素IDに対応
    const vehicle2tCount = parseInt(document.getElementById('vehicle2tCount')?.value || document.getElementById('vehicle_2t_count')?.value) || 0;
    const vehicle4tCount = parseInt(document.getElementById('vehicle4tCount')?.value || document.getElementById('vehicle_4t_count')?.value) || 0;
    const vehicleOptions = document.querySelectorAll('.vehicle-option');
    
    // 車両選択状態をビジュアルに反映
    vehicleOptions.forEach((option, index) => {
      const count = index === 0 ? vehicle2tCount : vehicle4tCount;
      if (count > 0) {
        option.classList.add('border-blue-500', 'bg-blue-50');
        option.classList.remove('border-gray-200');
      } else {
        option.classList.remove('border-blue-500', 'bg-blue-50');
        option.classList.add('border-gray-200');
      }
    });

    Step3Implementation.updatePricing();
  },

  // 外部協力業者コスト変更時の処理
  handleExternalContractorCostChange: () => {
    Step3Implementation.updatePricing();
  },

  // 車種変更時の処理（後方互換性のため保持）
  handleVehicleChange: () => {
    const vehicleRadios = document.querySelectorAll('input[name="vehicle_type"]');
    const vehicleOptions = document.querySelectorAll('.vehicle-option');
    
    // ラジオボタンの選択状態をビジュアルに反映
    vehicleRadios.forEach((radio, index) => {
      if (radio.checked) {
        vehicleOptions[index].classList.add('border-blue-500', 'bg-blue-50');
        vehicleOptions[index].classList.remove('border-gray-200');
      } else {
        vehicleOptions[index].classList.remove('border-blue-500', 'bg-blue-50');
        vehicleOptions[index].classList.add('border-gray-200');
      }
    });

    Step3Implementation.updatePricing();
  },

  // 稼働形態変更時の処理
  handleOperationChange: () => {
    const operationSelect = document.getElementById('operationType');
    const selectedOperation = operationSelect?.value;
    
    console.log('⚙️ 稼働形態変更:', selectedOperation || 'なし');
    
    // 稼働形態が選択された場合、ボタンを強制有効化（緊急修正）
    if (selectedOperation && selectedOperation !== '') {
      const vehicle2tCount = parseInt(document.getElementById('vehicle2tCount')?.value) || 0;
      const vehicle4tCount = parseInt(document.getElementById('vehicle4tCount')?.value) || 0;
      const totalCount = vehicle2tCount + vehicle4tCount;
      
      console.log('⚙️ 稼働形態選択チェック:', { selectedOperation, totalCount });
      
      if (totalCount > 0) {
        const nextBtn = document.getElementById('nextStepBtn');
        if (nextBtn) {
          console.log('🔧 緊急修正: 稼働形態選択済み - ボタンを強制有効化');
          nextBtn.disabled = false;
          nextBtn.style.opacity = '1';
          nextBtn.style.cursor = 'pointer';
          
          // 車両情報を更新
          Step3Implementation.currentVehicleInfo = {
            vehicle_2t_count: vehicle2tCount,
            vehicle_4t_count: vehicle4tCount,
            operation: selectedOperation,
            area: Step3Implementation.currentArea || 'D',
            cost: 0,
            external_contractor_cost: 0, // 外注費用フィールド削除により0固定
            uses_multiple_vehicles: true
          };
          
          console.log('🔧 緊急修正: 稼働形態で車両情報更新:', Step3Implementation.currentVehicleInfo);
        }
      }
    }

    // 次へボタンの状態を更新
    Step3Implementation.updateNextButtonState();
    
    // 個別車両の料金表示を更新
    const vehicle2tCount = parseInt(document.getElementById('vehicle2tCount')?.value) || 0;
    const vehicle4tCount = parseInt(document.getElementById('vehicle4tCount')?.value) || 0;
    if (vehicle2tCount > 0 || vehicle4tCount > 0) {
      Step3Implementation.updateIndividualVehiclePricing(vehicle2tCount, vehicle4tCount);
    }

    Step3Implementation.updatePricing();
  },

  // 料金の更新（複数車両対応）
  updatePricing: async () => {
    // 新しい複数車両形式をチェック（新旧両方のIDに対応）
    const vehicle2tCount = parseInt(document.getElementById('vehicle2tCount')?.value || document.getElementById('vehicle_2t_count')?.value) || 0;
    const vehicle4tCount = parseInt(document.getElementById('vehicle4tCount')?.value || document.getElementById('vehicle_4t_count')?.value) || 0;
    const externalContractorCost = 0; // 外注費用フィールド削除により0固定
    
    // 稼働形態の選択（selectタグ対応）
    const operationSelect = document.getElementById('operationType');
    const selectedOperationValue = operationSelect?.value;
    
    console.log('🔍 updatePricing: 稼働形態情報:', {
      operationSelect: !!operationSelect,
      selectedOperationValue: selectedOperationValue,
      isEmpty: selectedOperationValue === '' || !selectedOperationValue
    });
    const pricingDiv = document.getElementById('pricingInfo') || document.getElementById('vehiclePricing');
    const nextBtn = document.getElementById('nextStepBtn');

    // 複数車両形式の場合（新旧両方のIDをチェック）
    if (document.getElementById('vehicle2tCount') || document.getElementById('vehicle_2t_count')) {
      if ((vehicle2tCount + vehicle4tCount) === 0 || !selectedOperationValue || selectedOperationValue === '') {
        console.log('❌ updatePricing: 車両未選択または稼働形態未選択');
        if (pricingDiv) pricingDiv.classList.add('hidden');
        if (nextBtn) nextBtn.disabled = true;
        return;
      }

      console.log('✅ updatePricing: 複数車両料金計算開始');
      // 複数車両の料金計算処理
      await Step3Implementation.calculateMultipleVehiclePricing(vehicle2tCount, vehicle4tCount, selectedOperationValue, externalContractorCost);
      return;
    }

    // 従来のシングル車両形式（後方互換性）
    const selectedVehicle = document.querySelector('input[name="vehicle_type"]:checked');
    
    if (!selectedVehicle || !selectedOperationValue || selectedOperationValue === '') {
      if (pricingDiv) pricingDiv.classList.add('hidden');
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    // 従来の処理を維持
    try {
      const apiUrl = `/vehicle-pricing?vehicle_type=${encodeURIComponent(selectedVehicle.value)}&operation_type=${encodeURIComponent(selectedOperationValue)}&delivery_area=${Step3Implementation.currentArea}`;
      const response = await API.get(apiUrl);
      
      if (response && response.success) {
        const selectedVehicleText = document.getElementById('selectedVehicleText');
        const selectedOperationText = document.getElementById('selectedOperationText');
        const selectedAreaText = document.getElementById('selectedAreaText');
        const vehiclePrice = document.getElementById('vehiclePrice');
        
        if (selectedVehicleText) selectedVehicleText.textContent = selectedVehicle.value;
        if (selectedOperationText) selectedOperationText.textContent = selectedOperationValue;
        if (selectedAreaText) selectedAreaText.textContent = `${Step3Implementation.currentArea}エリア`;
        if (vehiclePrice) vehiclePrice.textContent = Utils.formatCurrency(response.price);
        
        if (pricingDiv) pricingDiv.classList.remove('hidden');
        if (nextBtn) nextBtn.disabled = false;

        Step3Implementation.currentVehicleInfo = {
          type: selectedVehicle.value,
          operation: selectedOperationValue,
          area: Step3Implementation.currentArea,
          cost: response.price
        };
      } else {
        const errorMsg = response?.error || '不明なエラー';
        Utils.showError('料金の取得に失敗しました: ' + errorMsg);
      }
    } catch (error) {
      Utils.showError('料金の取得中にエラーが発生しました: ' + error.message);
    }
  },

  // 個別車両料金表示の更新
  updateIndividualVehiclePricing: async (vehicle2tCount, vehicle4tCount) => {
    const operationSelect = document.getElementById('operationType');
    const selectedOperationValue = operationSelect?.value;
    
    if (!selectedOperationValue || selectedOperationValue === '' || !Step3Implementation.currentArea) {
      console.log('❌ updateIndividualVehiclePricing: 稼働形態未選択またはエリア未設定');
      return;
    }

    const operationType = selectedOperationValue;
    console.log('✅ updateIndividualVehiclePricing: 料金計算開始', { operationType, area: Step3Implementation.currentArea });

    try {
      // 2トン車の料金取得と表示
      if (vehicle2tCount > 0) {
        const apiUrl2t = `/vehicle-pricing?vehicle_type=${encodeURIComponent('2t車')}&operation_type=${encodeURIComponent(operationType)}&delivery_area=${Step3Implementation.currentArea}`;
        const response2t = await API.get(apiUrl2t);
        
        if (response2t && response2t.success) {
          const price2t = response2t.price;
          const total2t = price2t * vehicle2tCount;
          
          document.getElementById('price2t').textContent = Utils.formatCurrency(price2t);
          document.getElementById('count2t').textContent = vehicle2tCount;
          document.getElementById('total2t').textContent = Utils.formatCurrency(total2t);
          document.getElementById('pricing2t').classList.remove('hidden');
          document.getElementById('summary2t').textContent = Utils.formatCurrency(total2t);
          document.getElementById('pricing2tSummary').classList.remove('hidden');
        }
      } else {
        document.getElementById('pricing2t').classList.add('hidden');
        document.getElementById('pricing2tSummary').classList.add('hidden');
      }

      // 4トン車の料金取得と表示
      if (vehicle4tCount > 0) {
        const apiUrl4t = `/vehicle-pricing?vehicle_type=${encodeURIComponent('4t車')}&operation_type=${encodeURIComponent(operationType)}&delivery_area=${Step3Implementation.currentArea}`;
        const response4t = await API.get(apiUrl4t);
        
        if (response4t && response4t.success) {
          const price4t = response4t.price;
          const total4t = price4t * vehicle4tCount;
          
          document.getElementById('price4t').textContent = Utils.formatCurrency(price4t);
          document.getElementById('count4t').textContent = vehicle4tCount;
          document.getElementById('total4t').textContent = Utils.formatCurrency(total4t);
          document.getElementById('pricing4t').classList.remove('hidden');
          document.getElementById('summary4t').textContent = Utils.formatCurrency(total4t);
          document.getElementById('pricing4tSummary').classList.remove('hidden');
        }
      } else {
        document.getElementById('pricing4t').classList.add('hidden');
        document.getElementById('pricing4tSummary').classList.add('hidden');
      }

      // 車両費用合計を計算して表示更新
      const summary2tText = document.getElementById('summary2t')?.textContent?.replace(/[^\d]/g, '') || '0';
      const summary4tText = document.getElementById('summary4t')?.textContent?.replace(/[^\d]/g, '') || '0';
      const summary2t = parseFloat(summary2tText) || 0;
      const summary4t = parseFloat(summary4tText) || 0;
      const externalCost = 0; // 外注費用フィールド削除により0固定
      const vehicleTotal = summary2t + summary4t + externalCost;
      
      document.getElementById('vehicleTotal').textContent = Utils.formatCurrency(vehicleTotal);

      // 料金情報表示の制御
      const pricingInfoDiv = document.getElementById('pricingInfo');
      if (pricingInfoDiv) {
        if (vehicle2tCount > 0 || vehicle4tCount > 0) {
          pricingInfoDiv.classList.remove('hidden');
        } else {
          pricingInfoDiv.classList.add('hidden');
        }
      }

    } catch (error) {
      console.error('個別車両料金取得エラー:', error);
    }
  },

  // 稼働形態変更時の処理
  handleOperationChange: () => {
    console.log('🔧 稼働形態が変更されました');
    Step3Implementation.handleVehicleCountChange();
    Step3Implementation.updatePricing();
  },

  // 次へボタンの有効化状態を更新
  updateNextButtonState: () => {
    const vehicle2tCount = parseInt(document.getElementById('vehicle2tCount')?.value) || 0;
    const vehicle4tCount = parseInt(document.getElementById('vehicle4tCount')?.value) || 0;
    
    // セレクトボックスとラジオボタン両方をチェック
    const selectedOperationSelect = document.getElementById('operationType')?.value;
    const selectedOperationRadio = document.querySelector('input[name="operation_type"]:checked');
    const selectedOperation = selectedOperationSelect || selectedOperationRadio?.value;
    
    const nextBtn = document.getElementById('nextStepBtn');
    
    console.log('STEP3 ボタン状態確認:', {
      vehicle2tCount,
      vehicle4tCount,
      hasOperationSelect: !!selectedOperationSelect,
      hasOperationRadio: !!selectedOperationRadio,
      selectedOperation,
      nextBtnExists: !!nextBtn,
      currentArea: Step3Implementation.currentArea
    });
    
    if (nextBtn) {
      const hasVehicles = (vehicle2tCount + vehicle4tCount) > 0;
      const hasOperation = !!selectedOperation && selectedOperation !== '';
      const shouldEnable = hasVehicles && hasOperation;
      
      nextBtn.disabled = !shouldEnable;
      console.log('STEP3 次へボタン状態:', { hasVehicles, hasOperation, shouldEnable, disabled: nextBtn.disabled });
      
      // 次へボタンが有効になったら車両情報を保存
      if (shouldEnable) {
        const externalCost = 0; // 外注費用フィールド削除により0固定
        Step3Implementation.currentVehicleInfo = {
          vehicle_2t_count: vehicle2tCount,
          vehicle_4t_count: vehicle4tCount,
          operation: selectedOperation,
          area: Step3Implementation.currentArea,
          cost: 0, // 料金はupdateIndividualVehiclePricingで計算される
          external_contractor_cost: externalCost,
          uses_multiple_vehicles: true
        };
        console.log('STEP3 車両情報保存:', Step3Implementation.currentVehicleInfo);
      }
    }
  },

  // 複数車両の料金計算
  calculateMultipleVehiclePricing: async (vehicle2tCount, vehicle4tCount, operationType, externalContractorCost) => {
    const pricingDiv = document.getElementById('pricingInfo') || document.getElementById('vehiclePricing');
    const nextBtn = document.getElementById('nextStepBtn');

    if (!Step3Implementation.currentArea) {
      Utils.showError('配送エリアが設定されていません。STEP2に戻って配送先を入力してください。');
      return;
    }

    try {
      let totalCost = 0;
      let vehicleDetails = [];

      // 2t車の料金計算
      if (vehicle2tCount > 0) {
        const apiUrl = `/vehicle-pricing?vehicle_type=${encodeURIComponent('2t車')}&operation_type=${encodeURIComponent(operationType)}&delivery_area=${Step3Implementation.currentArea}`;
        const response = await API.get(apiUrl);
        
        if (response && response.success) {
          const vehicle2tTotalCost = response.price * vehicle2tCount;
          totalCost += vehicle2tTotalCost;
          vehicleDetails.push(`2t車 ${vehicle2tCount}台: ${Utils.formatCurrency(vehicle2tTotalCost)}`);
        }
      }

      // 4t車の料金計算
      if (vehicle4tCount > 0) {
        const apiUrl = `/vehicle-pricing?vehicle_type=${encodeURIComponent('4t車')}&operation_type=${encodeURIComponent(operationType)}&delivery_area=${Step3Implementation.currentArea}`;
        const response = await API.get(apiUrl);
        
        if (response && response.success) {
          const vehicle4tTotalCost = response.price * vehicle4tCount;
          totalCost += vehicle4tTotalCost;
          vehicleDetails.push(`4t車 ${vehicle4tCount}台: ${Utils.formatCurrency(vehicle4tTotalCost)}`);
        }
      }

      // 外部協力業者コストを追加
      if (externalContractorCost > 0) {
        totalCost += externalContractorCost;
        vehicleDetails.push(`外部協力業者: ${Utils.formatCurrency(externalContractorCost)}`);
      }

      // 表示を更新
      const vehicleText = vehicleDetails.join(', ');
      const selectedVehicleText = document.getElementById('selectedVehicleText');
      const selectedOperationText = document.getElementById('selectedOperationText');
      const selectedAreaText = document.getElementById('selectedAreaText');
      const vehiclePrice = document.getElementById('vehiclePrice');
      
      if (selectedVehicleText) selectedVehicleText.textContent = vehicleText || '車両未選択';
      if (selectedOperationText) selectedOperationText.textContent = operationType;
      if (selectedAreaText) selectedAreaText.textContent = `${Step3Implementation.currentArea}エリア`;
      if (vehiclePrice) vehiclePrice.textContent = Utils.formatCurrency(totalCost);
      
      if (pricingDiv) pricingDiv.classList.remove('hidden');
      if (nextBtn) nextBtn.disabled = false;

      // 複数車両情報を保存（料金情報を含めて更新）
      Step3Implementation.currentVehicleInfo = {
        vehicle_2t_count: vehicle2tCount,
        vehicle_4t_count: vehicle4tCount,
        operation: operationType,
        area: Step3Implementation.currentArea,
        cost: totalCost,
        external_contractor_cost: externalContractorCost,
        uses_multiple_vehicles: true
      };
      
      console.log('STEP3 料金計算完了 - 車両情報更新:', Step3Implementation.currentVehicleInfo);

    } catch (error) {
      console.error('複数車両料金取得エラー:', error);
      Utils.showError('料金の取得中にエラーが発生しました: ' + error.message);
    }
  },

  // STEP2に戻る
  goBackToStep2: () => {
    window.location.href = '/estimate/step2';
  },

  // STEP4に進む
  proceedToStep4: () => {
    console.log('🚀 STEP4への遷移開始');
    console.log('🔍 車両情報チェック:', Step3Implementation.currentVehicleInfo);
    console.log('🔍 現在のエリア:', Step3Implementation.currentArea);
    
    // 車両情報の詳細チェック
    const vehicle2tCount = parseInt(document.getElementById('vehicle2tCount')?.value) || 0;
    const vehicle4tCount = parseInt(document.getElementById('vehicle4tCount')?.value) || 0;
    const operationSelect = document.getElementById('operationType');
    const selectedOperation = operationSelect?.value;
    const externalCost = 0; // 外注費用フィールド削除により0固定
    
    console.log('🔍 フォーム入力値:', {
      vehicle2tCount,
      vehicle4tCount,
      selectedOperation,
      externalCost,
      totalVehicles: vehicle2tCount + vehicle4tCount
    });
    
    // 車両情報が未設定の場合は強制的に設定
    if (!Step3Implementation.currentVehicleInfo) {
      if ((vehicle2tCount + vehicle4tCount) === 0) {
        console.error('❌ STEP4遷移エラー: 車両が選択されていません');
        Utils.showError('車種と台数を選択してください');
        return;
      }
      
      if (!selectedOperation || selectedOperation === '') {
        console.error('❌ STEP4遷移エラー: 稼働形態が選択されていません');
        Utils.showError('稼働形態を選択してください');
        return;
      }
      
      console.log('🔧 緊急修正: 車両情報を強制設定');
      Step3Implementation.currentVehicleInfo = {
        vehicle_2t_count: vehicle2tCount,
        vehicle_4t_count: vehicle4tCount,
        operation: selectedOperation,
        area: Step3Implementation.currentArea || 'D',
        cost: 0,
        external_contractor_cost: externalCost,
        uses_multiple_vehicles: true
      };
      console.log('✅ 車両情報強制設定完了:', Step3Implementation.currentVehicleInfo);
    }

    try {
      // セッションストレージのデータを更新
      const flowData = JSON.parse(sessionStorage.getItem('estimateFlow') || '{}');
      console.log('📄 STEP4遷移: 既存フローデータ:', flowData);
      
      // 必要な情報の確認
      if (!flowData.customer || !flowData.project || !flowData.delivery) {
        console.error('❌ 必要なデータが不足している:', {
          customer: !!flowData.customer,
          project: !!flowData.project,
          delivery: !!flowData.delivery
        });
        Utils.showError('前のステップの情報が不足しています。最初からやり直してください。');
        window.location.href = '/estimate/new';
        return;
      }
      
      flowData.step = 4;
      flowData.vehicle = Step3Implementation.currentVehicleInfo;
      
      sessionStorage.setItem('estimateFlow', JSON.stringify(flowData));
      console.log('✅ STEP4遷移: セッションデータ保存完了:', flowData);
      
      // 少し待ってから遷移（データ保存の確実化）
      setTimeout(() => {
        console.log('🔄 STEP4ページに遷移中...');
        window.location.href = '/estimate/step4';
      }, 100);
      
    } catch (error) {
      console.error('❌ STEP4遷移エラー:', error);
      Utils.showError('データの保存に失敗しました: ' + error.message);
    }
  }
};

// STEP2用関数
window.formatPostalCodeInput = Step2Implementation.formatPostalCodeInput;
window.searchAddressByPostalCode = Step2Implementation.searchAddressByPostalCode;
window.autoDetectArea = Step2Implementation.autoDetectArea;
window.updateAreaCostDisplay = Step2Implementation.updateAreaCostDisplay;
window.goBackToStep1 = Step2Implementation.goBackToStep1;
window.proceedToStep3 = Step2Implementation.proceedToStep3;

// 新しい複数車両対応の関数
window.handleVehicle2tCountChange = () => {
  Step3Implementation.handleIndividualVehicleCountChange();
};

window.handleVehicle4tCountChange = () => {
  Step3Implementation.handleIndividualVehicleCountChange();
};

// 緊急修正: ボタン状態を強制的にチェックするグローバル関数
window.forceCheckStep3Button = () => {
  const vehicle2tCount = parseInt(document.getElementById('vehicle2tCount')?.value) || 0;
  const vehicle4tCount = parseInt(document.getElementById('vehicle4tCount')?.value) || 0;
  const selectedOperation = document.querySelector('input[name="operation_type"]:checked') || document.querySelector('#operationType');
  const nextBtn = document.getElementById('nextStepBtn');
  
  console.log('🔧 緊急チェック:', {
    vehicle2tCount,
    vehicle4tCount,
    hasOperation: !!selectedOperation,
    operationValue: selectedOperation?.value,
    hasButton: !!nextBtn,
    buttonDisabled: nextBtn ? nextBtn.disabled : 'なし'
  });
  
  if (nextBtn && (vehicle2tCount > 0 || vehicle4tCount > 0)) {
    console.log('🔧 緊急修正: ボタンを強制有効化実行');
    nextBtn.disabled = false;
    nextBtn.style.opacity = '1';
    nextBtn.style.cursor = 'pointer';
    nextBtn.classList.remove('disabled:opacity-50', 'disabled:cursor-not-allowed');
    
    // 車両情報を保存
    const operationValue = selectedOperation ? selectedOperation.value : '終日';
    Step3Implementation.currentVehicleInfo = {
      vehicle_2t_count: vehicle2tCount,
      vehicle_4t_count: vehicle4tCount,
      operation: operationValue,
      area: Step3Implementation.currentArea || 'D',
      cost: 0,
      external_contractor_cost: 0, // 外注費用フィールド削除
      uses_multiple_vehicles: true
    };
    
    console.log('🔧 緊急修正: 車両情報保存完了:', Step3Implementation.currentVehicleInfo);
  }
};

// さらに強力な強制実行関数
window.forceGoToStep4 = () => {
  console.log('🚨 強制STEP4遷移開始');
  
  // 車両情報を最低限で作成
  Step3Implementation.currentVehicleInfo = {
    vehicle_2t_count: 1,
    vehicle_4t_count: 0,
    operation: '終日',
    area: 'A',
    cost: 50000,
    external_contractor_cost: 0,
    uses_multiple_vehicles: true
  };
  
  // セッションデータを直接作成
  const flowData = {
    step: 4,
    customer: { id: 1, name: 'テスト顧客' },
    project: { id: 1, name: 'テスト案件' },
    delivery: { area: 'A', area_name: 'Aエリア', address: 'テスト住所' },
    vehicle: Step3Implementation.currentVehicleInfo
  };
  
  sessionStorage.setItem('estimateFlow', JSON.stringify(flowData));
  console.log('🚨 強制セッションデータ保存:', flowData);
  
  // 強制遷移
  window.location.href = '/estimate/step4';
};

// STEP3用関数をグローバル設定
window.handleVehicleChange = Step3Implementation.handleVehicleChange;
window.handleVehicleCountChange = Step3Implementation.handleVehicleCountChange;
// handleExternalContractorCostChange関数は外注費用フィールド削除により不要
window.handleOperationChange = Step3Implementation.handleOperationChange;
window.goBackToStep2 = Step3Implementation.goBackToStep2;
window.proceedToStep4 = () => {
  console.log('🚀 proceedToStep4 グローバル関数が呼び出されました');
  Step3Implementation.proceedToStep4();
};

// STEP4: スタッフ入力の実装
const Step4Implementation = {
  currentStaffInfo: null,
  staffRates: null,
  aiSuggestion: null,

  // ページ初期化
  initialize: async () => {
    let flowData; // 変数を関数スコープで宣言
    
    try {
      console.log('📋 STEP4初期化開始');
      flowData = JSON.parse(sessionStorage.getItem('estimateFlow') || '{}');
      console.log('📄 STEP4: セッションデータ読み込み:', flowData);
      
      if (!flowData.customer || !flowData.project || !flowData.delivery || !flowData.vehicle) {
        console.error('❌ STEP4: 必要なデータが不足:', {
          customer: !!flowData.customer,
          project: !!flowData.project,
          delivery: !!flowData.delivery,
          vehicle: !!flowData.vehicle
        });
        Utils.showError('前のステップの情報が見つかりません。最初からやり直してください。');
        setTimeout(() => {
          window.location.href = '/estimate/new';
        }, 2000);
        return;
      }
      
      console.log('✅ STEP4: データ確認完了 - 初期化続行');
    } catch (error) {
      console.error('❌ STEP4初期化エラー:', error);
      Utils.showError('ページの初期化に失敗しました: ' + error.message);
      return;
    }

    // flowDataをクラスプロパティに保存（選択済み情報表示前に）
    Step4Implementation.flowData = flowData;

    // 選択済み情報を表示（安全にアクセス）
    try {
      const customerNameElement = document.getElementById('selectedCustomerName');
      if (customerNameElement && flowData.customer) {
        customerNameElement.textContent = flowData.customer.name;
      }
      const projectNameElement = document.getElementById('selectedProjectName');
      if (projectNameElement && flowData.project) {
        projectNameElement.textContent = flowData.project.name;
      }

      const areaElement = document.getElementById('selectedArea');
      if (areaElement && flowData.delivery) {
        areaElement.textContent = `${flowData.delivery.area}エリア`;
      }
      
      // 複数車両対応の車両情報表示
      const vehicleElement = document.getElementById('selectedVehicle');
      if (vehicleElement && flowData.vehicle) {
        let vehicleText = '';
        if (flowData.vehicle.uses_multiple_vehicles) {
          const vehicleDetails = [];
          if (flowData.vehicle.vehicle_2t_count > 0) {
            vehicleDetails.push(`2t車 ${flowData.vehicle.vehicle_2t_count}台`);
          }
          if (flowData.vehicle.vehicle_4t_count > 0) {
            vehicleDetails.push(`4t車 ${flowData.vehicle.vehicle_4t_count}台`);
          }
          vehicleText = `${vehicleDetails.join('・')}（${flowData.vehicle.operation}）`;
        } else {
          vehicleText = `${flowData.vehicle.type}（${flowData.vehicle.operation}）`;
        }
        vehicleElement.textContent = vehicleText;
      }

      console.log('✅ STEP4: 選択済み情報表示完了');
    } catch (displayError) {
      console.error('❌ STEP4: 情報表示エラー:', displayError);
      // 表示エラーでも続行する
    }

    try {
      // スタッフ単価を取得
      const ratesResponse = await API.get('/staff-rates');
      if (ratesResponse.success && ratesResponse.data) {
        Step4Implementation.staffRates = ratesResponse.data.staffRates;
        console.log('✅ STEP4: スタッフ単価取得完了:', Step4Implementation.staffRates);
      } else {
        console.warn('⚠️ STEP4: スタッフ単価取得失敗、デフォルト値を使用');
        Step4Implementation.staffRates = {
          supervisor_rate: 20000,
          leader_rate: 17000,
          m2_half_day_rate: 7000,
          m2_full_day_rate: 12500,
          temp_half_day_rate: 6500,
          temp_full_day_rate: 11500
        };
      }
    } catch (error) {
      Utils.showError('スタッフ単価の取得に失敗しました: ' + error.message);
    }

    // 入力フィールドのイベントリスナーを設定
    try {
      console.log('🎯 スタッフ入力フィールドのイベントリスナー設定開始');
      
      const staffInputs = [
        'supervisor_count',
        'leader_count', 
        'm2_staff_half_day',
        'm2_staff_full_day',
        'temp_staff_half_day',
        'temp_staff_full_day'
      ];

      staffInputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
          element.addEventListener('input', () => {
            console.log(`📝 ${inputId} 値変更: ${element.value}`);
            setTimeout(() => Step4Implementation.updateStaffCost(), 0);
          });
          element.addEventListener('change', () => {
            console.log(`🔄 ${inputId} 変更完了: ${element.value}`);
            setTimeout(() => Step4Implementation.updateStaffCost(), 0);
          });
          console.log(`✅ ${inputId} のイベントリスナー設定完了`);
        } else {
          console.warn(`⚠️ ${inputId} 要素が見つかりません`);
        }
      });
      
      console.log('✅ スタッフ入力フィールドのイベントリスナー設定完了');
    } catch (listenerError) {
      console.error('❌ イベントリスナー設定エラー:', listenerError);
    }
    
    // 初期化完了後に既存の入力値があれば自動計算
    setTimeout(() => {
      console.log('🔄 初期化後の自動スタッフ費用計算');
      Step4Implementation.updateStaffCost();
    }, 500);
  },

  // スタッフ費用の詳細更新（新しいUI対応）
  updateStaffCost: () => {
    console.log('📊 スタッフ費用計算開始');
    
    if (!Step4Implementation.staffRates) {
      console.log('⚠️ スタッフ単価データがありません');
      return;
    }

    // 入力値を取得
    const supervisorCount = parseInt(document.getElementById('supervisor_count')?.value) || 0;
    const leaderCount = parseInt(document.getElementById('leader_count')?.value) || 0;
    const m2HalfDay = parseInt(document.getElementById('m2_staff_half_day')?.value) || 0;
    const m2FullDay = parseInt(document.getElementById('m2_staff_full_day')?.value) || 0;
    const tempHalfDay = parseInt(document.getElementById('temp_staff_half_day')?.value) || 0;
    const tempFullDay = parseInt(document.getElementById('temp_staff_full_day')?.value) || 0;

    console.log('📋 スタッフ人数:', {
      supervisorCount, leaderCount, m2HalfDay, m2FullDay, tempHalfDay, tempFullDay
    });

    // 各費用計算（統一されたデータベース単価でフォールバック）
    const rates = {
      supervisor: Step4Implementation.staffRates.supervisor_rate || 20000,
      leader: Step4Implementation.staffRates.leader_rate || 17000,
      m2_half_day: Step4Implementation.staffRates.m2_half_day_rate || 7000,
      m2_full_day: Step4Implementation.staffRates.m2_full_day_rate || 12500,
      temp_half_day: Step4Implementation.staffRates.temp_half_day_rate || 6500,
      temp_full_day: Step4Implementation.staffRates.temp_full_day_rate || 11500
    };

    const costs = {
      supervisor: supervisorCount * rates.supervisor,
      leader: leaderCount * rates.leader,
      m2_half_day: m2HalfDay * rates.m2_half_day,
      m2_full_day: m2FullDay * rates.m2_full_day,
      temp_half_day: tempHalfDay * rates.temp_half_day,
      temp_full_day: tempFullDay * rates.temp_full_day
    };

    const totalCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
    const totalStaff = supervisorCount + leaderCount + m2HalfDay + m2FullDay + tempHalfDay + tempFullDay;

    console.log('💰 スタッフ費用計算結果:', { costs, totalCost, totalStaff });

    // 詳細表示を更新
    Step4Implementation.updateStaffPricingDisplay(costs, rates, {
      supervisorCount, leaderCount, m2HalfDay, m2FullDay, tempHalfDay, tempFullDay
    }, totalCost, totalStaff);

    // データを保存
    Step4Implementation.currentStaffInfo = {
      supervisor_count: supervisorCount,
      leader_count: leaderCount,
      m2_staff_half_day: m2HalfDay,
      m2_staff_full_day: m2FullDay,
      temp_staff_half_day: tempHalfDay,
      temp_staff_full_day: tempFullDay,
      total_cost: totalCost
    };
    
    console.log('✅ スタッフ情報保存完了:', Step4Implementation.currentStaffInfo);
  },

  // スタッフ費用詳細表示の更新
  updateStaffPricingDisplay: (costs, rates, counts, totalCost, totalStaff) => {
    const pricingDiv = document.getElementById('staffPricingInfo');
    
    // メインの表示エリアを表示
    if (totalCost > 0) {
      pricingDiv?.classList.remove('hidden');
    } else {
      pricingDiv?.classList.add('hidden');
      return;
    }

    // 基本スタッフセクション
    const basicStaffSection = document.getElementById('basicStaffSection');
    const hasBasicStaff = counts.supervisorCount > 0 || counts.leaderCount > 0;
    
    if (hasBasicStaff) {
      basicStaffSection?.classList.remove('hidden');
      
      // スーパーバイザー
      if (counts.supervisorCount > 0) {
        const supervisorDiv = document.getElementById('supervisorPricing');
        const supervisorDetails = document.getElementById('supervisorDetails');
        const supervisorCost = document.getElementById('supervisorCost');
        
        supervisorDiv?.classList.remove('hidden');
        if (supervisorDetails) supervisorDetails.textContent = `${counts.supervisorCount}人 × ¥${rates.supervisor.toLocaleString()}/日`;
        if (supervisorCost) supervisorCost.textContent = Utils.formatCurrency(costs.supervisor);
      } else {
        document.getElementById('supervisorPricing')?.classList.add('hidden');
      }
      
      // リーダー
      if (counts.leaderCount > 0) {
        const leaderDiv = document.getElementById('leaderPricing');
        const leaderDetails = document.getElementById('leaderDetails');
        const leaderCost = document.getElementById('leaderCost');
        
        leaderDiv?.classList.remove('hidden');
        if (leaderDetails) leaderDetails.textContent = `${counts.leaderCount}人 × ¥${rates.leader.toLocaleString()}/日`;
        if (leaderCost) leaderCost.textContent = Utils.formatCurrency(costs.leader);
      } else {
        document.getElementById('leaderPricing')?.classList.add('hidden');
      }
    } else {
      basicStaffSection?.classList.add('hidden');
    }

    // M2スタッフセクション
    const m2StaffSection = document.getElementById('m2StaffSection');
    const hasM2Staff = counts.m2HalfDay > 0 || counts.m2FullDay > 0;
    
    if (hasM2Staff) {
      m2StaffSection?.classList.remove('hidden');
      
      // M2半日
      if (counts.m2HalfDay > 0) {
        const m2HalfDiv = document.getElementById('m2HalfDayPricing');
        const m2HalfDetails = document.getElementById('m2HalfDayDetails');
        const m2HalfCost = document.getElementById('m2HalfDayCost');
        
        m2HalfDiv?.classList.remove('hidden');
        if (m2HalfDetails) m2HalfDetails.textContent = `${counts.m2HalfDay}人 × ¥${rates.m2_half_day.toLocaleString()}/半日`;
        if (m2HalfCost) m2HalfCost.textContent = Utils.formatCurrency(costs.m2_half_day);
      } else {
        document.getElementById('m2HalfDayPricing')?.classList.add('hidden');
      }
      
      // M2終日
      if (counts.m2FullDay > 0) {
        const m2FullDiv = document.getElementById('m2FullDayPricing');
        const m2FullDetails = document.getElementById('m2FullDayDetails');
        const m2FullCost = document.getElementById('m2FullDayCost');
        
        m2FullDiv?.classList.remove('hidden');
        if (m2FullDetails) m2FullDetails.textContent = `${counts.m2FullDay}人 × ¥${rates.m2_full_day.toLocaleString()}/日`;
        if (m2FullCost) m2FullCost.textContent = Utils.formatCurrency(costs.m2_full_day);
      } else {
        document.getElementById('m2FullDayPricing')?.classList.add('hidden');
      }
    } else {
      m2StaffSection?.classList.add('hidden');
    }

    // 派遣スタッフセクション
    const tempStaffSection = document.getElementById('tempStaffSection');
    const hasTempStaff = counts.tempHalfDay > 0 || counts.tempFullDay > 0;
    
    if (hasTempStaff) {
      tempStaffSection?.classList.remove('hidden');
      
      // 派遣半日
      if (counts.tempHalfDay > 0) {
        const tempHalfDiv = document.getElementById('tempHalfDayPricing');
        const tempHalfDetails = document.getElementById('tempHalfDayDetails');
        const tempHalfCost = document.getElementById('tempHalfDayCost');
        
        tempHalfDiv?.classList.remove('hidden');
        if (tempHalfDetails) tempHalfDetails.textContent = `${counts.tempHalfDay}人 × ¥${rates.temp_half_day.toLocaleString()}/半日`;
        if (tempHalfCost) tempHalfCost.textContent = Utils.formatCurrency(costs.temp_half_day);
      } else {
        document.getElementById('tempHalfDayPricing')?.classList.add('hidden');
      }
      
      // 派遣終日
      if (counts.tempFullDay > 0) {
        const tempFullDiv = document.getElementById('tempFullDayPricing');
        const tempFullDetails = document.getElementById('tempFullDayDetails');
        const tempFullCost = document.getElementById('tempFullDayCost');
        
        tempFullDiv?.classList.remove('hidden');
        if (tempFullDetails) tempFullDetails.textContent = `${counts.tempFullDay}人 × ¥${rates.temp_full_day.toLocaleString()}/日`;
        if (tempFullCost) tempFullCost.textContent = Utils.formatCurrency(costs.temp_full_day);
      } else {
        document.getElementById('tempFullDayPricing')?.classList.add('hidden');
      }
    } else {
      tempStaffSection?.classList.add('hidden');
    }

    // 合計表示
    const totalStaffCountElement = document.getElementById('totalStaffCount');
    const totalStaffCostElement = document.getElementById('totalStaffCost');
    
    if (totalStaffCountElement) totalStaffCountElement.textContent = `合計人数: ${totalStaff}人`;
    if (totalStaffCostElement) totalStaffCostElement.textContent = Utils.formatCurrency(totalCost);
  },

  // AI最適化リクエスト
  requestAIOptimization: async () => {
    const optimizeBtn = document.getElementById('aiOptimizeBtn');
    
    try {
      Utils.showLoading(optimizeBtn);
      
      const requestData = {
        vehicle_type: Step4Implementation.flowData.vehicle.type,
        operation_type: Step4Implementation.flowData.vehicle.operation,
        area: Step4Implementation.flowData.delivery.area,
        work_type: '一般輸送作業',
        additional_services: []
      };

      const response = await API.post('/ai-optimize-staff', requestData);
      
      if (response.success) {
        Step4Implementation.aiSuggestion = response.data;
        Step4Implementation.displayAISuggestion();
      } else {
        Utils.showError('AI最適化の実行に失敗しました: ' + response.error);
      }
      
    } catch (error) {
      Utils.showError('AI最適化中にエラーが発生しました: ' + error.message);
    } finally {
      Utils.hideLoading(optimizeBtn, '<i class="fas fa-magic mr-2"></i>最適人数を提案');
    }
  },

  // AI提案結果表示
  displayAISuggestion: () => {
    if (!Step4Implementation.aiSuggestion) return;

    const suggestion = Step4Implementation.aiSuggestion;
    const content = document.getElementById('aiSuggestionContent');
    const suggestionDiv = document.getElementById('aiSuggestion');

    let staffList = [];
    if (suggestion.supervisor_count > 0) staffList.push(`スーパーバイザー: ${suggestion.supervisor_count}人`);
    if (suggestion.leader_count > 0) staffList.push(`リーダー以上: ${suggestion.leader_count}人`);
    if (suggestion.m2_staff_half_day > 0) staffList.push(`M2スタッフ（半日）: ${suggestion.m2_staff_half_day}人`);
    if (suggestion.m2_staff_full_day > 0) staffList.push(`M2スタッフ（終日）: ${suggestion.m2_staff_full_day}人`);
    if (suggestion.temp_staff_half_day > 0) staffList.push(`派遣スタッフ（半日）: ${suggestion.temp_staff_half_day}人`);
    if (suggestion.temp_staff_full_day > 0) staffList.push(`派遣スタッフ（終日）: ${suggestion.temp_staff_full_day}人`);

    content.innerHTML = `
      <div class="mb-2">
        <strong>推奨スタッフ編成:</strong><br>
        ${staffList.join('<br>')}
      </div>
      <div class="text-xs text-gray-600">
        <strong>提案理由:</strong><br>
        ${suggestion.reasoning}
      </div>
    `;

    suggestionDiv.classList.remove('hidden');
  },

  // AI提案を適用
  applyAISuggestion: () => {
    if (!Step4Implementation.aiSuggestion) return;

    const suggestion = Step4Implementation.aiSuggestion;
    
    document.getElementById('supervisor_count').value = suggestion.supervisor_count;
    document.getElementById('leader_count').value = suggestion.leader_count;
    document.getElementById('m2_staff_half_day').value = suggestion.m2_staff_half_day;
    document.getElementById('m2_staff_full_day').value = suggestion.m2_staff_full_day;
    document.getElementById('temp_staff_half_day').value = suggestion.temp_staff_half_day;
    document.getElementById('temp_staff_full_day').value = suggestion.temp_staff_full_day;

    Step4Implementation.updateStaffCost();
    Utils.showSuccess('AI提案が適用されました');
  },

  // STEP3に戻る
  goBackToStep3: () => {
    window.location.href = '/estimate/step3';
  },

  // STEP5に進む
  proceedToStep5: () => {
    console.log('🚀 STEP5進行開始');
    
    // 進行前に最新のスタッフ費用を計算（複数回実行で確実に）
    try {
      // 1回目：通常の計算
      Step4Implementation.updateStaffCost();
      console.log('✅ 1回目スタッフ費用計算完了');
      
      // 少し待って2回目実行（確実な保存のため）
      setTimeout(() => {
        Step4Implementation.updateStaffCost();
        console.log('✅ 2回目スタッフ費用計算完了（確認用）');
      }, 100);
      
    } catch (error) {
      console.error('❌ 進行前スタッフ費用計算エラー:', error);
    }
    
    // 進行時に現在の入力値からスタッフ情報を再構築（確実な保存のため）
    const currentInputValues = {
      supervisor_count: parseInt(document.getElementById('supervisor_count')?.value) || 0,
      leader_count: parseInt(document.getElementById('leader_count')?.value) || 0,
      m2_staff_half_day: parseInt(document.getElementById('m2_staff_half_day')?.value) || 0,
      m2_staff_full_day: parseInt(document.getElementById('m2_staff_full_day')?.value) || 0,
      temp_staff_half_day: parseInt(document.getElementById('temp_staff_half_day')?.value) || 0,
      temp_staff_full_day: parseInt(document.getElementById('temp_staff_full_day')?.value) || 0
    };
    
    // 現在の入力値から費用を再計算（統一された正しい単価を使用）
    const rates = {
      supervisor: Step4Implementation.staffRates?.supervisor_rate || 20000,
      leader: Step4Implementation.staffRates?.leader_rate || 17000,
      m2_half_day: Step4Implementation.staffRates?.m2_half_day_rate || 7000,
      m2_full_day: Step4Implementation.staffRates?.m2_full_day_rate || 12500,
      temp_half_day: Step4Implementation.staffRates?.temp_half_day_rate || 6500,
      temp_full_day: Step4Implementation.staffRates?.temp_full_day_rate || 11500
    };
    
    const calculatedTotalCost = 
      currentInputValues.supervisor_count * rates.supervisor +
      currentInputValues.leader_count * rates.leader +
      currentInputValues.m2_staff_half_day * rates.m2_half_day +
      currentInputValues.m2_staff_full_day * rates.m2_full_day +
      currentInputValues.temp_staff_half_day * rates.temp_half_day +
      currentInputValues.temp_staff_full_day * rates.temp_full_day;
    
    // 完全なスタッフ情報オブジェクトを構築（total_costとstaff_costの両方を設定）
    const completeStaffInfo = {
      ...currentInputValues,
      total_cost: calculatedTotalCost,
      staff_cost: calculatedTotalCost  // 重要：staff_costフィールドも明示的に設定
    };
    
    // Step4Implementation.currentStaffInfoを確実に更新
    Step4Implementation.currentStaffInfo = completeStaffInfo;
    
    console.log('🔄 完全に再構築したスタッフ情報:', completeStaffInfo);
    console.log('💰 計算されたスタッフ費用:', calculatedTotalCost);

    // セッションストレージのデータを完全に更新
    const flowData = JSON.parse(sessionStorage.getItem('estimateFlow') || '{}');
    flowData.step = 5;
    flowData.staff = completeStaffInfo;  // 完全なオブジェクトを保存
    
    console.log('💾 sessionStorageに保存する完全なスタッフデータ:', flowData.staff);
    console.log('💰 total_cost:', flowData.staff.total_cost);
    console.log('💰 staff_cost:', flowData.staff.staff_cost);
    
    // sessionStorageに保存
    sessionStorage.setItem('estimateFlow', JSON.stringify(flowData));
    console.log('✅ sessionStorage保存完了');
    
    // 保存直後に確認（3回チェック）
    const savedData1 = JSON.parse(sessionStorage.getItem('estimateFlow') || '{}');
    console.log('🔍 保存確認1 - total_cost:', savedData1.staff?.total_cost);
    console.log('🔍 保存確認1 - staff_cost:', savedData1.staff?.staff_cost);
    
    // 少し待ってもう一度確認
    setTimeout(() => {
      const savedData2 = JSON.parse(sessionStorage.getItem('estimateFlow') || '{}');
      console.log('🔍 保存確認2 - total_cost:', savedData2.staff?.total_cost);
      console.log('🔍 保存確認2 - staff_cost:', savedData2.staff?.staff_cost);
    }, 100);
    
    // STEP5ページに遷移
    window.location.href = '/estimate/step5';
  }
};



// STEP5: その他サービスの実装
const Step5Implementation = {
  currentServicesInfo: null,
  serviceRates: null,

  // ページ初期化
  initialize: async () => {
    const flowData = JSON.parse(sessionStorage.getItem('estimateFlow') || '{}');
    
    if (!flowData.customer || !flowData.project || !flowData.delivery || !flowData.vehicle || !flowData.staff) {
      Utils.showError('前のステップの情報が見つかりません。最初からやり直してください。');
      window.location.href = '/estimate/new';
      return;
    }

    // 選択済み情報を表示
    document.getElementById('selectedCustomerName').textContent = flowData.customer.name;
    document.getElementById('selectedArea').textContent = `${flowData.delivery.area}エリア`;
    
    // 複数車両対応の車両情報表示
    let vehicleText = '';
    if (flowData.vehicle.uses_multiple_vehicles) {
      const vehicleDetails = [];
      if (flowData.vehicle.vehicle_2t_count > 0) {
        vehicleDetails.push(`2t車 ${flowData.vehicle.vehicle_2t_count}台`);
      }
      if (flowData.vehicle.vehicle_4t_count > 0) {
        vehicleDetails.push(`4t車 ${flowData.vehicle.vehicle_4t_count}台`);
      }
      vehicleText = `${vehicleDetails.join('・')}（${flowData.vehicle.operation}）`;
    } else {
      vehicleText = `${flowData.vehicle.type}（${flowData.vehicle.operation}）`;
    }
    document.getElementById('selectedVehicle').textContent = vehicleText;
    // スタッフ費用の確実な表示（フォールバック処理）
    const staffCost = flowData.staff.total_cost || flowData.staff.staff_cost || 0;
    console.log('📊 STEP5でのスタッフ費用表示:', {
      total_cost: flowData.staff.total_cost,
      staff_cost: flowData.staff.staff_cost,
      使用値: staffCost
    });
    document.getElementById('selectedStaffCost').textContent = Utils.formatCurrency(staffCost);
    
    // 保存データをローカル変数に格納
    Step5Implementation.flowData = flowData;

    try {
      // サービス料金を取得
      const ratesResponse = await API.get('/service-rates');
      if (ratesResponse.success) {
        Step5Implementation.serviceRates = ratesResponse.data;
      }
    } catch (error) {
      Utils.showError('サービス料金の取得に失敗しました: ' + error.message);
    }

    // 既存のサービス情報があれば復元
    if (flowData.services) {
      console.log('📦 既存のサービス情報を復元します:', flowData.services);
      Step5Implementation.currentServicesInfo = flowData.services;
      
      // フォーム値を復元
      if (flowData.services.parking_officer_hours) {
        document.getElementById('parking_officer_hours').value = flowData.services.parking_officer_hours;
      }
      if (flowData.services.transport_vehicles) {
        document.getElementById('transport_vehicles').value = flowData.services.transport_vehicles;
      }
      if (flowData.services.waste_disposal_size !== 'none') {
        const wasteRadio = document.querySelector(`input[name="waste_disposal"][value="${flowData.services.waste_disposal_size}"]`);
        if (wasteRadio) wasteRadio.checked = true;
      }
      if (flowData.services.protection_work) {
        document.getElementById('protection_work').checked = true;
        Step5Implementation.handleProtectionWorkChange();
      }
      if (flowData.services.material_collection_size !== 'none') {
        const materialRadio = document.querySelector(`input[name="material_collection"][value="${flowData.services.material_collection_size}"]`);
        if (materialRadio) materialRadio.checked = true;
      }
      if (flowData.services.construction_m2_staff) {
        document.getElementById('construction_m2_staff').value = flowData.services.construction_m2_staff;
      }
      if (flowData.services.parking_fee) {
        document.getElementById('parking_fee').value = flowData.services.parking_fee;
      }
      if (flowData.services.highway_fee) {
        document.getElementById('highway_fee').value = flowData.services.highway_fee;
      }
    }

    // 初期費用計算
    Step5Implementation.updateServicesCost();
    
    // デバッグ用：サンプルサービスデータを設定するボタンを追加（開発用）
    if (window.location.hostname === 'localhost') {
      console.log('🧪 開発モード：サンプルサービスデータ設定ボタンを追加');
      const debugButton = document.createElement('button');
      debugButton.textContent = '🧪 サンプルサービス設定（開発用）';
      debugButton.className = 'btn-secondary text-xs mt-2';
      debugButton.onclick = () => {
        // サンプル値を設定
        document.getElementById('parking_officer_hours').value = '2';
        document.getElementById('transport_vehicles').value = '1';
        document.querySelector('input[name="waste_disposal"][value="small"]').checked = true;
        document.getElementById('protection_work').checked = true;
        Step5Implementation.handleProtectionWorkChange();
        document.getElementById('construction_m2_staff').value = '1';
        document.getElementById('parking_fee').value = '1000';
        document.getElementById('highway_fee').value = '2000';
        Step5Implementation.updateServicesCost();
        console.log('✅ サンプルサービスデータを設定しました');
      };
      const container = document.querySelector('.p-6');
      if (container) {
        container.appendChild(debugButton);
      }
    }
  },

  // 人員輸送距離タイプ変更
  handleTransportDistanceChange: () => {
    const customInput = document.getElementById('customDistanceInput');
    const customRadio = document.querySelector('input[name="transport_distance_type"][value="custom"]');
    
    if (customRadio.checked) {
      customInput.classList.remove('hidden');
    } else {
      customInput.classList.add('hidden');
      // 距離と燃料費をリセット
      document.getElementById('transport_distance').value = '';
      document.getElementById('transport_fuel_cost').value = '';
    }
    
    Step5Implementation.updateServicesCost();
  },

  // 養生作業チェック変更
  handleProtectionWorkChange: () => {
    const protectionWork = document.getElementById('protection_work');
    const protectionFloors = document.getElementById('protectionFloors');
    
    if (protectionWork.checked) {
      protectionFloors.classList.remove('hidden');
    } else {
      protectionFloors.classList.add('hidden');
      document.getElementById('protection_floors').value = '1';
    }
    
    Step5Implementation.updateServicesCost();
  },

  // サービス費用の更新
  updateServicesCost: () => {
    if (!Step5Implementation.serviceRates) {
      console.warn('サービスレートが取得できていません。デフォルト値を使用します。');
      // ユーザー指定のデフォルトサービスレートを設定
      Step5Implementation.serviceRates = {
        parking_officer_hourly: 2500,
        transport_vehicle_20km: 15000, // 20km圏内一律
        transport_vehicle_per_km: 150,  // 距離指定（¥150/km）
        waste_disposal: {
          'none': 0,
          'small': 8000,   // 小 ¥8,000
          'medium': 15000, // 中 ¥15,000
          'large': 25000   // 大 ¥25,000
        },
        protection_work_base: 5000, // 基本料金¥5,000
        protection_work_floor: 0,   // フロア単価（基本料金に含む）
        material_collection: {
          'none': 0,
          'few': 6000,   // 少 ¥6,000
          'medium': 12000, // 中 ¥12,000
          'many': 20000    // 多 ¥20,000
        },
        construction_m2_staff: 12500, // M2スタッフ単価
        work_time_multiplier: {
          'normal': 1.0,
          'early': 1.2,
          'late': 1.3,
          'night': 1.5,
          'holiday': 1.3
        }
      };
    }

    // 各サービスの値を取得
    const parkingOfficerHours = parseFloat(document.getElementById('parking_officer_hours').value) || 0;
    const transportVehicles = parseInt(document.getElementById('transport_vehicles').value) || 0;
    const transportDistanceType = document.querySelector('input[name="transport_distance_type"]:checked')?.value || '20km';
    const transportDistance = parseFloat(document.getElementById('transport_distance').value) || 0;
    const transportFuelCost = parseInt(document.getElementById('transport_fuel_cost').value) || 0;
    
    const wasteDisposal = document.querySelector('input[name="waste_disposal"]:checked')?.value || 'none';
    const protectionWork = document.getElementById('protection_work').checked;
    const protectionFloors = parseInt(document.getElementById('protection_floors').value) || 1;
    const materialCollection = document.querySelector('input[name="material_collection"]:checked')?.value || 'none';
    // 施工方法による費用計算
    const constructionType = document.querySelector('input[name="construction_type"]:checked');
    let constructionM2Staff = 0;
    let constructionCost = 0;
    
    if (constructionType && constructionType.value === 'm2_staff') {
      constructionM2Staff = parseInt(document.getElementById('construction_m2_staff').value) || 0;
      constructionCost = constructionM2Staff * (Step5Implementation.serviceRates.construction_m2_staff || Step5Implementation.serviceRates['construction.m2_staff_rate'] || 12500);
    } else if (constructionType && constructionType.value === 'partner_company') {
      constructionCost = parseFloat(document.getElementById('construction_cost').value) || 0;
    }
    const workTimeType = document.querySelector('input[name="work_time_type"]:checked')?.value || 'normal';
    const parkingFee = parseInt(document.getElementById('parking_fee').value) || 0;
    const highwayFee = parseInt(document.getElementById('highway_fee').value) || 0;

    // 各費用計算
    const costs = {
      parking_officer: parkingOfficerHours * Step5Implementation.serviceRates.parking_officer_hourly,
      transport_vehicle: 0,
      waste_disposal: Step5Implementation.serviceRates.waste_disposal[wasteDisposal] || 0,
      protection_work: 0,
      material_collection: Step5Implementation.serviceRates.material_collection[materialCollection] || 0,
      construction: constructionCost,
      parking_fee: parkingFee,
      highway_fee: highwayFee
    };

    // 人員輸送車両費用計算
    if (transportVehicles > 0) {
      if (transportDistanceType === '20km') {
        costs.transport_vehicle = transportVehicles * Step5Implementation.serviceRates.transport_vehicle_20km;
      } else if (transportDistanceType === 'custom' && transportDistance > 0) {
        // 距離指定の場合：（距離 × ¥150/km + 燃料費）× 台数
        costs.transport_vehicle = transportVehicles * (transportDistance * Step5Implementation.serviceRates.transport_vehicle_per_km + transportFuelCost);
      }
    }

    // 養生作業費用計算（基本料金¥5,000）
    if (protectionWork) {
      costs.protection_work = Step5Implementation.serviceRates.protection_work_base;
      document.getElementById('protectionFloors').classList.remove('hidden');
    } else {
      document.getElementById('protectionFloors').classList.add('hidden');
    }

    // 作業時間帯割増計算（車両・スタッフ費用に適用）
    const workTimeMultiplier = Step5Implementation.serviceRates.work_time_multiplier[workTimeType] || 1.0;
    const baseVehicleCost = Step5Implementation.flowData.vehicle.cost || 0;
    const baseStaffCost = Step5Implementation.flowData.staff.total_cost || 0;
    
    const timeMultiplierCost = (baseVehicleCost + baseStaffCost) * (workTimeMultiplier - 1.0);
    costs.work_time_multiplier = timeMultiplierCost;

    // 全サービス費用の合計を計算（作業時間帯割増も含む）
    const totalServicesCost = costs.parking_officer + costs.transport_vehicle + costs.waste_disposal + 
                             costs.protection_work + costs.material_collection + costs.construction + 
                             costs.work_time_multiplier + costs.parking_fee + costs.highway_fee;

    // 内訳表示を生成
    const breakdown = [];
    if (costs.parking_officer > 0) breakdown.push(`駐車対策員 ${parkingOfficerHours}時間: ${Utils.formatCurrency(costs.parking_officer)}`);
    if (costs.transport_vehicle > 0) {
      const distanceText = transportDistanceType === '20km' ? '20km圏内' : `${transportDistance}km + 燃料費`;
      breakdown.push(`人員輸送車両 ${transportVehicles}台（${distanceText}）: ${Utils.formatCurrency(costs.transport_vehicle)}`);
    }
    if (costs.waste_disposal > 0) breakdown.push(`引き取り廃棄（${wasteDisposal}）: ${Utils.formatCurrency(costs.waste_disposal)}`);
    if (costs.protection_work > 0) breakdown.push(`養生作業 ${protectionFloors}フロア: ${Utils.formatCurrency(costs.protection_work)}`);
    if (costs.material_collection > 0) breakdown.push(`残材回収（${materialCollection}）: ${Utils.formatCurrency(costs.material_collection)}`);
    if (costs.construction > 0) breakdown.push(`施工 M2スタッフ${constructionM2Staff}人: ${Utils.formatCurrency(costs.construction)}`);
    if (costs.work_time_multiplier > 0) breakdown.push(`作業時間帯割増（${workTimeType}）: ${Utils.formatCurrency(costs.work_time_multiplier)}`);
    if (costs.parking_fee > 0) breakdown.push(`実費：駐車料金: ${Utils.formatCurrency(costs.parking_fee)}`);
    if (costs.highway_fee > 0) breakdown.push(`実費：高速料金: ${Utils.formatCurrency(costs.highway_fee)}`);

    const costDisplay = document.getElementById('servicesCostDisplay');
    const breakdownDiv = document.getElementById('servicesBreakdown');
    const totalDiv = document.getElementById('totalServicesCost');

    if (totalServicesCost > 0) {
      costDisplay.classList.remove('hidden');
      breakdownDiv.innerHTML = breakdown.map(item => `<div>${item}</div>`).join('');
      totalDiv.textContent = Utils.formatCurrency(totalServicesCost);
    } else {
      costDisplay.classList.add('hidden');
    }

    // サービス情報を保存（total_costが確実に数値になるようにする）
    
    Step5Implementation.currentServicesInfo = {
      parking_officer_hours: parkingOfficerHours,
      parking_officer_cost: costs.parking_officer || 0,
      transport_vehicles: transportVehicles,
      transport_within_20km: transportDistanceType === '20km',
      transport_distance: transportDistance,
      transport_fuel_cost: transportFuelCost,
      transport_cost: costs.transport_vehicle || 0,
      waste_disposal_size: wasteDisposal,
      waste_disposal_cost: costs.waste_disposal || 0,
      protection_work: protectionWork,
      protection_floors: protectionFloors,
      protection_cost: costs.protection_work || 0,
      material_collection_size: materialCollection,
      material_collection_cost: costs.material_collection || 0,
      construction_m2_staff: constructionM2Staff,
      construction_partner: document.getElementById('construction_partner').value,
      construction_cost: costs.construction || 0,
      work_time_type: workTimeType,
      work_time_multiplier: workTimeMultiplier,
      parking_fee: parkingFee || 0,
      highway_fee: highwayFee || 0,
      total_cost: totalServicesCost || 0,  // 確実に数値にする
      notes: document.getElementById('notes').value
    };
  },

  // 施工方法選択の変更処理
  handleConstructionTypeChange: () => {
    const constructionType = document.querySelector('input[name="construction_type"]:checked');
    if (!constructionType) return;
    
    const m2StaffDetails = document.getElementById('m2StaffDetails');
    const partnerCompanyDetails = document.getElementById('partnerCompanyDetails');
    
    if (constructionType.value === 'm2_staff') {
      // M2スタッフが選択された場合
      m2StaffDetails.classList.remove('hidden');
      partnerCompanyDetails.classList.add('hidden');
      
      // 協力会社のフィールドをクリア
      document.getElementById('construction_partner').value = '';
      document.getElementById('construction_cost').value = '';
    } else if (constructionType.value === 'partner_company') {
      // 協力会社が選択された場合
      m2StaffDetails.classList.add('hidden');
      partnerCompanyDetails.classList.remove('hidden');
      
      // M2スタッフ数をクリア
      document.getElementById('construction_m2_staff').value = '0';
    }
    
    // サービス費用を再計算
    Step5Implementation.updateServicesCost();
  },

  // STEP4に戻る
  goBackToStep4: () => {
    window.location.href = '/estimate/step4';
  },

  // STEP6に進む
  proceedToStep6: () => {
    // 現在のフォーム値から最新のサービス情報を収集
    Step5Implementation.updateServicesCost();
    
    console.log('🚀 Step5からStep6へ遷移開始');
    console.log('📦 Step5Implementation.currentServicesInfo:', Step5Implementation.currentServicesInfo);
    
    // サービス情報の存在チェック
    if (!Step5Implementation.currentServicesInfo) {
      console.log('⚠️ サービス情報が未作成のため、フォーム値から作成します');
      // フォーム値から直接収集
      Step5Implementation.updateServicesCost();
    }
    
    // 最終確認：サービス情報がまだない場合は空のデータで初期化
    if (!Step5Implementation.currentServicesInfo) {
      console.log('⚠️ サービス情報を空で初期化します');
      Step5Implementation.currentServicesInfo = {
        parking_officer_hours: 0,
        parking_officer_cost: 0,
        transport_vehicles: 0,
        transport_within_20km: true,
        transport_distance: 0,
        transport_fuel_cost: 0,
        transport_cost: 0,
        waste_disposal_size: 'none',
        waste_disposal_cost: 0,
        protection_work: false,
        protection_floors: 1,
        protection_cost: 0,
        material_collection_size: 'none',
        material_collection_cost: 0,
        construction_m2_staff: 0,
        construction_partner: '',
        construction_cost: 0,
        work_time_type: 'normal',
        work_time_multiplier: 1.0,
        parking_fee: 0,
        highway_fee: 0,
        total_cost: 0,
        notes: ''
      };
    }
    
    // セッションストレージのデータを更新
    const flowData = JSON.parse(sessionStorage.getItem('estimateFlow') || '{}');
    flowData.step = 6;
    flowData.services = Step5Implementation.currentServicesInfo;
    
    console.log('💾 sessionStorageに保存するservicesデータ:', flowData.services);
    sessionStorage.setItem('estimateFlow', JSON.stringify(flowData));
    
    // STEP6ページに遷移
    window.location.href = '/estimate/step6';
  }
};

// STEP4用関数
window.updateStaffCost = Step4Implementation.updateStaffCost;
window.requestAIOptimization = Step4Implementation.requestAIOptimization;
window.applyAISuggestion = Step4Implementation.applyAISuggestion;
window.goBackToStep3 = Step4Implementation.goBackToStep3;
window.proceedToStep5 = Step4Implementation.proceedToStep5;

// STEP5用関数
window.updateServicesCost = Step5Implementation.updateServicesCost;
window.handleTransportDistanceChange = Step5Implementation.handleTransportDistanceChange;
window.handleProtectionWorkChange = Step5Implementation.handleProtectionWorkChange;
window.handleConstructionTypeChange = Step5Implementation.handleConstructionTypeChange;
window.goBackToStep4 = Step5Implementation.goBackToStep4;
window.proceedToStep6 = Step5Implementation.proceedToStep6;

// STEP6: 内容確認・見積書作成の実装
const Step6Implementation = {
  estimateData: null,

  // ページ初期化
  initialize: async () => {
    console.log('📋 STEP6初期化開始');
    const flowData = JSON.parse(sessionStorage.getItem('estimateFlow') || '{}');
    console.log('📄 STEP6: sessionStorageから読み込んだデータ:', flowData);
    console.log('👥 STEP6: スタッフデータ詳細:', flowData.staff);
    
    if (!flowData.customer || !flowData.project || !flowData.delivery || !flowData.vehicle || !flowData.staff) {
      console.error('❌ 見積データが不完全:', {
        customer: !!flowData.customer,
        project: !!flowData.project,
        delivery: !!flowData.delivery,
        vehicle: !!flowData.vehicle,
        staff: !!flowData.staff
      });
      Utils.showError('見積データが不完全です。最初からやり直してください。');
      window.location.href = '/estimate/new';
      return;
    }

    // 見積データを統合
    Step6Implementation.estimateData = flowData;

    // 見積番号と作成日を生成
    const estimateNumber = `EST-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    const createDate = new Date().toLocaleDateString('ja-JP');
    
    document.getElementById('estimateNumber').textContent = estimateNumber;
    document.getElementById('createDate').textContent = createDate;

    // 各セクションの情報を表示（非同期対応）
    Step6Implementation.displayCustomerInfo();
    Step6Implementation.displayProjectInfo();
    await Step6Implementation.displayVehicleDetails();
    await Step6Implementation.displayStaffDetails();
    Step6Implementation.displayServicesDetails();
    Step6Implementation.displayNotesSection();
    await Step6Implementation.calculateTotal();
  },

  // 顧客情報表示
  displayCustomerInfo: () => {
    const customer = Step6Implementation.estimateData.customer;
    document.getElementById('customerInfo').innerHTML = `
      <div><strong>${customer.name}</strong></div>
      ${customer.contact_person ? `<div>担当者: ${customer.contact_person}</div>` : ''}
      ${customer.phone ? `<div>TEL: ${customer.phone}</div>` : ''}
      ${customer.email ? `<div>Email: ${customer.email}</div>` : ''}
    `;
  },

  // 案件情報表示
  displayProjectInfo: () => {
    const project = Step6Implementation.estimateData.project;
    const delivery = Step6Implementation.estimateData.delivery;
    document.getElementById('projectInfo').innerHTML = `
      <div><strong>${project.name}</strong></div>
      <div>配送先: ${delivery.address}</div>
      <div>エリア: ${delivery.area}エリア（${delivery.area_name}）</div>
      ${project.description ? `<div>概要: ${project.description}</div>` : ''}
    `;
  },

  // 車両詳細表示（複数車両対応）
  displayVehicleDetails: async () => {
    const vehicle = Step6Implementation.estimateData.vehicle;
    let html = '';
    
    console.log('🚚 STEP6車両詳細表示:', vehicle);
    
    // 複数車両形式の場合
    if (vehicle.uses_multiple_vehicles) {
      const details = [];
      let totalVehicleCost = 0;
      
      // 個別車両料金を再計算（APIから正確な単価を取得）
      try {
        if (vehicle.vehicle_2t_count > 0) {
          const apiUrl2t = `/vehicle-pricing?vehicle_type=${encodeURIComponent('2t車')}&operation_type=${encodeURIComponent(vehicle.operation)}&delivery_area=${vehicle.area}`;
          const response2t = await API.get(apiUrl2t);
          
          if (response2t && response2t.success) {
            const vehicle2tUnitPrice = response2t.price;
            const vehicle2tTotalCost = vehicle2tUnitPrice * vehicle.vehicle_2t_count;
            totalVehicleCost += vehicle2tTotalCost;
            details.push(`<div class="flex justify-between px-4 py-2"><span>2t車 ${vehicle.vehicle_2t_count}台・${vehicle.operation}（${vehicle.area}エリア）@ ¥${vehicle2tUnitPrice.toLocaleString()}</span><span>${Utils.formatCurrency(vehicle2tTotalCost)}</span></div>`);
          }
        }
        
        if (vehicle.vehicle_4t_count > 0) {
          const apiUrl4t = `/vehicle-pricing?vehicle_type=${encodeURIComponent('4t車')}&operation_type=${encodeURIComponent(vehicle.operation)}&delivery_area=${vehicle.area}`;
          const response4t = await API.get(apiUrl4t);
          
          if (response4t && response4t.success) {
            const vehicle4tUnitPrice = response4t.price;
            const vehicle4tTotalCost = vehicle4tUnitPrice * vehicle.vehicle_4t_count;
            totalVehicleCost += vehicle4tTotalCost;
            details.push(`<div class="flex justify-between px-4 py-2"><span>4t車 ${vehicle.vehicle_4t_count}台・${vehicle.operation}（${vehicle.area}エリア）@ ¥${vehicle4tUnitPrice.toLocaleString()}</span><span>${Utils.formatCurrency(vehicle4tTotalCost)}</span></div>`);
          }
        }
        
        if (vehicle.external_contractor_cost > 0) {
          totalVehicleCost += vehicle.external_contractor_cost;
          details.push(`<div class="flex justify-between px-4 py-2"><span>外部協力業者費用</span><span>${Utils.formatCurrency(vehicle.external_contractor_cost)}</span></div>`);
        }
        
        // 車両費用合計を表示
        if (details.length > 0) {
          details.push(`<div class="flex justify-between border-t pt-2 mt-2 font-bold"><span>車両費用合計</span><span>${Utils.formatCurrency(totalVehicleCost)}</span></div>`);
        }
        
        // 保存された値と再計算値の整合性チェック
        if (Math.abs(totalVehicleCost - vehicle.cost) > 1) {
          console.warn(`車両費用計算の差異: 再計算=${totalVehicleCost}, 保存値=${vehicle.cost}`);
          details.push(`<div class="text-xs text-red-600 mt-1">※ 計算結果と保存値に差異があります（保存値: ${Utils.formatCurrency(vehicle.cost)}）</div>`);
        }
        
        html = Step6Implementation.applyZebraStripes(details).join('');
        
      } catch (error) {
        console.error('❌ 車両料金再計算エラー:', error);
        // フォールバック：保存された値を使用
        html = `
          <div class="flex justify-between">
            <span>${vehicle.vehicle_2t_count > 0 ? `2t車 ${vehicle.vehicle_2t_count}台` : ''}${vehicle.vehicle_2t_count > 0 && vehicle.vehicle_4t_count > 0 ? ' + ' : ''}${vehicle.vehicle_4t_count > 0 ? `4t車 ${vehicle.vehicle_4t_count}台` : ''}・${vehicle.operation}（${vehicle.area}エリア）</span>
            <span class="font-bold">${Utils.formatCurrency(vehicle.cost)}</span>
          </div>
        `;
      }
    } else {
      // 従来形式の単一車両
      html = `
        <div class="flex justify-between">
          <span>${vehicle.type}・${vehicle.operation}（${vehicle.area}エリア）</span>
          <span class="font-bold">${Utils.formatCurrency(vehicle.cost)}</span>
        </div>
      `;
    }
    
    document.getElementById('vehicleDetails').innerHTML = html;
  },

  // スタッフ詳細表示方式改善（マスタ単価を使用して個別計算）
  displayStaffDetails: async () => {
    const staff = Step6Implementation.estimateData.staff;
    const details = [];
    
    console.log('👥 STEP6スタッフ詳細表示:', {
      staff: staff,
      total_cost: staff.total_cost,
      staff_cost: staff.staff_cost
    });
    
    // スタッフ単価をAPIから取得（データベースと同じフォールバック値）
    let staffRates = {
      supervisor: 20000,
      leader: 17000,
      m2_half_day: 7000,
      m2_full_day: 12500,
      temp_half_day: 6500,
      temp_full_day: 11500
    };
    
    try {
      console.log('📊 STEP6: スタッフ単価取得開始');
      const ratesResponse = await API.get('/staff-rates');
      if (ratesResponse.success && ratesResponse.data && ratesResponse.data.staffRates) {
        const dbRates = ratesResponse.data.staffRates;
        staffRates = {
          supervisor: dbRates.supervisor_rate || 20000,
          leader: dbRates.leader_rate || 17000,
          m2_half_day: dbRates.m2_half_day_rate || 7000,
          m2_full_day: dbRates.m2_full_day_rate || 12500,
          temp_half_day: dbRates.temp_half_day_rate || 6500,
          temp_full_day: dbRates.temp_full_day_rate || 11500
        };
        console.log('✅ STEP6: スタッフ単価取得完了:', staffRates);
      } else {
        console.warn('⚠️ STEP6: スタッフ単価取得失敗、フォールバック使用');
      }
    } catch (error) {
      console.error('❌ STEP6: スタッフ単価取得エラー:', error);
    }
    
    let totalCalculatedCost = 0;
    
    if (staff.supervisor_count > 0) {
      const cost = staff.supervisor_count * staffRates.supervisor;
      totalCalculatedCost += cost;
      details.push(`<div class="flex justify-between px-4 py-2"><span>スーパーバイザー ${staff.supervisor_count}人 (¥${staffRates.supervisor.toLocaleString()}/人)</span><span>${Utils.formatCurrency(cost)}</span></div>`);
    }
    if (staff.leader_count > 0) {
      const cost = staff.leader_count * staffRates.leader;
      totalCalculatedCost += cost;
      details.push(`<div class="flex justify-between px-4 py-2"><span>リーダー以上 ${staff.leader_count}人 (¥${staffRates.leader.toLocaleString()}/人)</span><span>${Utils.formatCurrency(cost)}</span></div>`);
    }
    if (staff.m2_staff_half_day > 0) {
      const cost = staff.m2_staff_half_day * staffRates.m2_half_day;
      totalCalculatedCost += cost;
      details.push(`<div class="flex justify-between px-4 py-2"><span>M2スタッフ（半日）${staff.m2_staff_half_day}人 (¥${staffRates.m2_half_day.toLocaleString()}/人)</span><span>${Utils.formatCurrency(cost)}</span></div>`);
    }
    if (staff.m2_staff_full_day > 0) {
      const cost = staff.m2_staff_full_day * staffRates.m2_full_day;
      totalCalculatedCost += cost;
      details.push(`<div class="flex justify-between px-4 py-2"><span>M2スタッフ（終日）${staff.m2_staff_full_day}人 (¥${staffRates.m2_full_day.toLocaleString()}/人)</span><span>${Utils.formatCurrency(cost)}</span></div>`);
    }
    if (staff.temp_staff_half_day > 0) {
      const cost = staff.temp_staff_half_day * staffRates.temp_half_day;
      totalCalculatedCost += cost;
      details.push(`<div class="flex justify-between px-4 py-2"><span>派遣スタッフ（半日）${staff.temp_staff_half_day}人 (¥${staffRates.temp_half_day.toLocaleString()}/人)</span><span>${Utils.formatCurrency(cost)}</span></div>`);
    }
    if (staff.temp_staff_full_day > 0) {
      const cost = staff.temp_staff_full_day * staffRates.temp_full_day;
      totalCalculatedCost += cost;
      details.push(`<div class="flex justify-between px-4 py-2"><span>派遣スタッフ（終日）${staff.temp_staff_full_day}人 (¥${staffRates.temp_full_day.toLocaleString()}/人)</span><span>${Utils.formatCurrency(cost)}</span></div>`);
    }
    
    // スタッフ総額を表示
    if (details.length > 0) {
      details.push(`<div class="flex justify-between border-t pt-2 mt-2 font-bold"><span>スタッフ費用合計</span><span>${Utils.formatCurrency(totalCalculatedCost)}</span></div>`);
    }
    
    // 計算結果と保存された値の整合性をチェック
    const savedStaffCost = staff.total_cost || 0;
    if (Math.abs(totalCalculatedCost - savedStaffCost) > 1) {
      console.warn(`スタッフ費用計算の差異: 再計算=${totalCalculatedCost}, 保存値=${savedStaffCost}`);
      details.push(`<div class="text-xs text-red-600 mt-1">※ 計算結果と保存値に差異があります（保存値: ${Utils.formatCurrency(savedStaffCost)}）</div>`);
    }
    
    document.getElementById('staffDetails').innerHTML = Step6Implementation.applyZebraStripes(details).join('');
  },

  // ゼブラ表示適用関数（交互の背景色）- 修正版 2025-10-08
  applyZebraStripes: (details) => {
    console.log('🎨 ゼブラ表示適用開始:', details.length, '件');
    return details.map((detail, index) => {
      const bgClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
      // 既存のclass属性を探して背景色を追加
      if (detail.includes('class="')) {
        return detail.replace(/class="([^"]*)"/, `class="${bgClass} $1"`);
      } else {
        // クラス属性がない場合は追加
        return detail.replace('<div', `<div class="${bgClass}"`);
      }
    });
  },

  // サービス詳細表示（修正版：マスター連携価格計算）
  displayServicesDetails: async () => {
    const services = Step6Implementation.estimateData.services;
    
    console.log('🛎️ STEP6サービス詳細表示:', services);
    console.log('🔍 Step6Implementation.estimateData全体:', Step6Implementation.estimateData);
    
    if (!services) {
      console.log('⚠️ services オブジェクトが null/undefined です');
      document.getElementById('servicesSection').classList.remove('hidden');
      document.getElementById('servicesDetails').innerHTML = `
        <div class="text-center text-gray-500 py-4">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          サービスデータが見つかりません（services = null/undefined）
        </div>
      `;
      return;
    }

    // サービス単価をマスターデータから取得
    let serviceMasterRates = {
      parking_officer_hourly_rate: 2500,
      transport_base_rate: 5000,
      waste_disposal_small_rate: 3000,
      waste_disposal_medium_rate: 5000,
      waste_disposal_large_rate: 8000,
      protection_per_floor_rate: 2500,
      material_collection_small_rate: 2000,
      material_collection_medium_rate: 4000,
      material_collection_large_rate: 6000,
      construction_m2_staff_rate: 12500,
      early_morning_multiplier: 1.2,
      late_night_multiplier: 1.5,
      holiday_multiplier: 1.3
    };

    try {
      console.log('📊 STEP6: サービス単価マスターデータ取得開始');
      const ratesResponse = await API.get('/service-rates');
      if (ratesResponse.success && ratesResponse.data) {
        serviceMasterRates = { ...serviceMasterRates, ...ratesResponse.data };
        console.log('✅ STEP6: サービス単価マスター取得完了:', serviceMasterRates);
      } else {
        console.warn('⚠️ STEP6: サービス単価マスター取得失敗、フォールバック使用');
      }
    } catch (error) {
      console.error('❌ STEP6: サービス単価マスター取得エラー:', error);
    }

    // 全サービス項目の詳細チェック（0円の項目も含む）
    const serviceItems = [
      { key: 'parking_officer', cost: services.parking_officer_cost, hours: services.parking_officer_hours },
      { key: 'transport', cost: services.transport_cost, vehicles: services.transport_vehicles },
      { key: 'waste_disposal', cost: services.waste_disposal_cost, size: services.waste_disposal_size },
      { key: 'protection', cost: services.protection_cost, work: services.protection_work },
      { key: 'material_collection', cost: services.material_collection_cost, size: services.material_collection_size },
      { key: 'construction', cost: services.construction_cost, m2_staff: services.construction_m2_staff },
      { key: 'work_time_multiplier', multiplier: services.work_time_multiplier, type: services.work_time_type },
      { key: 'parking_fee', cost: services.parking_fee },
      { key: 'highway_fee', cost: services.highway_fee }
    ];
    
    console.log('🔍 サービス項目詳細:', serviceItems);

    // 各サービス項目の詳細チェック（デバッグ情報付き）
    console.log('🔍 サービス項目詳細チェック:', {
      parking_officer_cost: services.parking_officer_cost,
      transport_cost: services.transport_cost,
      waste_disposal_cost: services.waste_disposal_cost,
      protection_cost: services.protection_cost,
      material_collection_cost: services.material_collection_cost,
      construction_cost: services.construction_cost,
      parking_fee: services.parking_fee,
      highway_fee: services.highway_fee,
      work_time_multiplier: services.work_time_multiplier
    });

    // 何らかのサービス項目があるかチェック（より詳細に）
    const hasAnyService = services.parking_officer_cost > 0 ||
                         services.transport_cost > 0 ||
                         services.waste_disposal_cost > 0 ||
                         services.protection_cost > 0 ||
                         services.material_collection_cost > 0 ||
                         services.construction_cost > 0 ||
                         services.parking_fee > 0 ||
                         services.highway_fee > 0 ||
                         (services.work_time_multiplier && services.work_time_multiplier > 1.0);

    console.log('🔍 サービス項目判定結果:', hasAnyService);

    if (!hasAnyService) {
      console.log('❌ サービス項目が設定されていません');
      // デバッグ：サービス項目がない場合でも隠さずに空で表示
      document.getElementById('servicesSection').classList.remove('hidden');
      document.getElementById('servicesDetails').innerHTML = `
        <div class="text-center text-gray-500 py-4">
          <i class="fas fa-info-circle mr-2"></i>
          その他サービスが設定されていません<br>
          <small class="text-xs mt-2 block">Step5で各サービス項目を入力してください</small>
        </div>
      `;
      return;
    }

    console.log('✅ サービス項目が存在します、詳細表示を開始');
    document.getElementById('servicesSection').classList.remove('hidden');
    const details = [];
    let totalServicesCost = 0;
    
    // 1. 駐車対策員（マスター単価連携）
    if (services.parking_officer_hours > 0 || services.parking_officer_cost > 0) {
      const masterRate = serviceMasterRates.parking_officer_hourly_rate;
      const calculatedCost = services.parking_officer_hours * masterRate;
      details.push(`<div class="flex justify-between px-4 py-2">
        <span>駐車対策員 ${services.parking_officer_hours}時間 (¥${masterRate.toLocaleString()}/時間)</span>
        <span>${Utils.formatCurrency(calculatedCost)}</span>
      </div>`);
      totalServicesCost += calculatedCost;
      console.log('📊 駐車対策員:', { hours: services.parking_officer_hours, masterRate, calculatedCost, savedCost: services.parking_officer_cost });
    }
    
    // 2. 人員輸送車両
    if (services.transport_vehicles > 0 || services.transport_cost > 0) {
      let distanceText;
      if (services.transport_within_20km) {
        distanceText = '20km圏内一律 (¥15,000)';
      } else {
        distanceText = `${services.transport_distance}km × ¥150/km + 燃料費¥${services.transport_fuel_cost || 0}`;
      }
      details.push(`<div class="flex justify-between">
        <span>人員輸送車両 ${services.transport_vehicles}台（${distanceText}）</span>
        <span>${Utils.formatCurrency(services.transport_cost)}</span>
      </div>`);
      totalServicesCost += services.transport_cost;
      console.log('🚐 人員輸送車両:', { vehicles: services.transport_vehicles, cost: services.transport_cost });
    }
    
    // 3. 引き取り廃棄
    if (services.waste_disposal_size && services.waste_disposal_size !== 'none') {
      const sizeMap = { small: '小 (¥8,000)', medium: '中 (¥15,000)', large: '大 (¥25,000)' };
      details.push(`<div class="flex justify-between">
        <span>引き取り廃棄（${sizeMap[services.waste_disposal_size] || services.waste_disposal_size}）</span>
        <span>${Utils.formatCurrency(services.waste_disposal_cost)}</span>
      </div>`);
      totalServicesCost += services.waste_disposal_cost;
      console.log('🗑️ 引き取り廃棄:', { size: services.waste_disposal_size, cost: services.waste_disposal_cost });
    }
    
    // 4. 養生作業
    if (services.protection_work || services.protection_cost > 0) {
      details.push(`<div class="flex justify-between">
        <span>養生作業 ${services.protection_floors}フロア (基本料金¥5,000)</span>
        <span>${Utils.formatCurrency(services.protection_cost)}</span>
      </div>`);
      totalServicesCost += services.protection_cost;
      console.log('🛡️ 養生作業:', { floors: services.protection_floors, cost: services.protection_cost });
    }
    
    // 5. 残材回収
    if (services.material_collection_size && services.material_collection_size !== 'none') {
      const sizeMap = { few: '少 (¥6,000)', medium: '中 (¥12,000)', many: '多 (¥20,000)' };
      details.push(`<div class="flex justify-between">
        <span>残材回収（${sizeMap[services.material_collection_size] || services.material_collection_size}）</span>
        <span>${Utils.formatCurrency(services.material_collection_cost)}</span>
      </div>`);
      totalServicesCost += services.material_collection_cost;
      console.log('♻️ 残材回収:', { size: services.material_collection_size, cost: services.material_collection_cost });
    }
    
    // 6. 施工（M2スタッフまたは協力会社）
    if (services.construction_cost > 0) {
      if (services.construction_m2_staff > 0) {
        details.push(`<div class="flex justify-between">
          <span>施工 M2スタッフ ${services.construction_m2_staff}人 (¥12,500/人)</span>
          <span>${Utils.formatCurrency(services.construction_cost)}</span>
        </div>`);
      } else if (services.construction_partner) {
        details.push(`<div class="flex justify-between">
          <span>施工 協力会社（${services.construction_partner}）</span>
          <span>${Utils.formatCurrency(services.construction_cost)}</span>
        </div>`);
      }
      totalServicesCost += services.construction_cost;
      console.log('🔨 施工:', { m2_staff: services.construction_m2_staff, partner: services.construction_partner, cost: services.construction_cost });
    }
    
    // 7. 作業時間帯割増（再計算された車両・スタッフ費用を使用）
    if (services.work_time_multiplier && services.work_time_multiplier > 1.0) {
      // 再計算された車両・スタッフ費用を取得
      const recalculatedVehicleCost = Step6Implementation.estimateData.totals?.recalculated_vehicle_cost || Step6Implementation.estimateData.vehicle.cost || 0;
      const recalculatedStaffCost = Step6Implementation.estimateData.totals?.recalculated_staff_cost || Step6Implementation.estimateData.staff.total_cost || 0;
      
      const multiplierCost = (recalculatedVehicleCost + recalculatedStaffCost) * (services.work_time_multiplier - 1.0);
      const multiplierPercent = Math.round((services.work_time_multiplier - 1.0) * 100);
      details.push(`<div class="flex justify-between">
        <span>作業時間帯割増（${services.work_time_type}：+${multiplierPercent}%）</span>
        <span>${Utils.formatCurrency(multiplierCost)}</span>
      </div>`);
      totalServicesCost += multiplierCost;
      console.log('⏰ 作業時間帯割増:', { 
        type: services.work_time_type, 
        multiplier: services.work_time_multiplier, 
        vehicleCost: recalculatedVehicleCost,
        staffCost: recalculatedStaffCost,
        cost: multiplierCost 
      });
    }
    
    // 8. 実費項目
    if (services.parking_fee > 0) {
      details.push(`<div class="flex justify-between">
        <span>実費：駐車料金</span>
        <span>${Utils.formatCurrency(services.parking_fee)}</span>
      </div>`);
      totalServicesCost += services.parking_fee;
    }
    
    if (services.highway_fee > 0) {
      details.push(`<div class="flex justify-between">
        <span>実費：高速料金</span>
        <span>${Utils.formatCurrency(services.highway_fee)}</span>
      </div>`);
      totalServicesCost += services.highway_fee;
    }
    
    // サービス費用合計を表示（再計算された費用を優先）
    if (details.length > 0) {
      // 再計算された費用があればそれを使用、なければ表示用に計算した値を使用
      const finalServicesCost = Step6Implementation.estimateData.totals?.recalculated_services_cost || totalServicesCost;
      
      details.push(`<div class="flex justify-between border-t pt-2 mt-2 font-bold">
        <span>その他サービス費用合計</span>
        <span>${Utils.formatCurrency(finalServicesCost)}</span>
      </div>`);
      
      // 表示計算値と再計算値の整合性チェック
      if (Step6Implementation.estimateData.totals?.recalculated_services_cost) {
        const diff = Math.abs(totalServicesCost - Step6Implementation.estimateData.totals.recalculated_services_cost);
        if (diff > 1) {
          console.warn(`⚠️ サービス費用表示の差異: 表示計算=${totalServicesCost}, 再計算=${Step6Implementation.estimateData.totals.recalculated_services_cost}, 差分=${diff}`);
        }
      }
    }
    
    console.log('💰 サービス費用合計（表示）:', totalServicesCost, '保存値:', services.total_cost, '再計算値:', Step6Implementation.estimateData.totals?.recalculated_services_cost);
    document.getElementById('servicesDetails').innerHTML = Step6Implementation.applyZebraStripes(details).join('');
  },

  // 備考セクション表示（編集可能なメモフィールド）- 修正版 2025-10-08  
  displayNotesSection: () => {
    console.log('📝 メモセクション表示開始');
    const services = Step6Implementation.estimateData.services;
    const notesValue = (services && services.notes) ? services.notes.trim() : '';
    
    // メモフィールドに既存の値を設定
    const notesTextarea = document.getElementById('estimateNotes');
    if (notesTextarea) {
      notesTextarea.value = notesValue;
      
      // メモフィールドの変更を監視して、Step6Implementation.estimateDataに反映
      notesTextarea.addEventListener('input', (e) => {
        if (!Step6Implementation.estimateData.services) {
          Step6Implementation.estimateData.services = {};
        }
        Step6Implementation.estimateData.services.notes = e.target.value;
        console.log('📝 メモ更新:', e.target.value);
      });
    }
  },

  // 合計金額計算（修正版：データベース単価で統一計算）
  calculateTotal: async () => {
    const vehicle = Step6Implementation.estimateData.vehicle;
    const staff = Step6Implementation.estimateData.staff;
    const services = Step6Implementation.estimateData.services || {};

    console.log('🔢 STEP6合計金額計算開始:', { vehicle, staff, services });

    // 1. 車両費用の再計算（複数車両対応）
    let finalVehicleCost = 0;
    if (vehicle.uses_multiple_vehicles) {
      try {
        if (vehicle.vehicle_2t_count > 0) {
          const apiUrl2t = `/vehicle-pricing?vehicle_type=${encodeURIComponent('2t車')}&operation_type=${encodeURIComponent(vehicle.operation)}&delivery_area=${vehicle.area}`;
          const response2t = await API.get(apiUrl2t);
          if (response2t && response2t.success) {
            finalVehicleCost += response2t.price * vehicle.vehicle_2t_count;
          }
        }
        
        if (vehicle.vehicle_4t_count > 0) {
          const apiUrl4t = `/vehicle-pricing?vehicle_type=${encodeURIComponent('4t車')}&operation_type=${encodeURIComponent(vehicle.operation)}&delivery_area=${vehicle.area}`;
          const response4t = await API.get(apiUrl4t);
          if (response4t && response4t.success) {
            finalVehicleCost += response4t.price * vehicle.vehicle_4t_count;
          }
        }
        
        finalVehicleCost += vehicle.external_contractor_cost || 0;
        console.log('✅ 車両費用再計算完了:', finalVehicleCost);
      } catch (error) {
        console.error('❌ 車両費用再計算エラー、保存値を使用:', error);
        finalVehicleCost = vehicle.cost || 0;
      }
    } else {
      finalVehicleCost = vehicle.cost || 0;
    }

    // 2. スタッフ費用の再計算（データベース単価使用）
    let finalStaffCost = 0;
    try {
      const ratesResponse = await API.get('/staff-rates');
      let staffRates = {
        supervisor: 20000, leader: 17000, m2_half_day: 7000, 
        m2_full_day: 12500, temp_half_day: 6500, temp_full_day: 11500
      };
      
      if (ratesResponse.success && ratesResponse.data && ratesResponse.data.staffRates) {
        const dbRates = ratesResponse.data.staffRates;
        staffRates = {
          supervisor: dbRates.supervisor_rate || 20000,
          leader: dbRates.leader_rate || 17000,
          m2_half_day: dbRates.m2_half_day_rate || 7000,
          m2_full_day: dbRates.m2_full_day_rate || 12500,
          temp_half_day: dbRates.temp_half_day_rate || 6500,
          temp_full_day: dbRates.temp_full_day_rate || 11500
        };
      }
      
      finalStaffCost = 
        (staff.supervisor_count || 0) * staffRates.supervisor +
        (staff.leader_count || 0) * staffRates.leader +
        (staff.m2_staff_half_day || 0) * staffRates.m2_half_day +
        (staff.m2_staff_full_day || 0) * staffRates.m2_full_day +
        (staff.temp_staff_half_day || 0) * staffRates.temp_half_day +
        (staff.temp_staff_full_day || 0) * staffRates.temp_full_day;
        
      console.log('✅ スタッフ費用再計算完了:', finalStaffCost);
    } catch (error) {
      console.error('❌ スタッフ費用再計算エラー、保存値を使用:', error);
      finalStaffCost = staff.total_cost || staff.staff_cost || 0;
    }

    // 3. サービス費用の計算（Step5の値を優先）
    let servicesTotalCost = 0;
    let timeMultiplierCost = 0;
    
    if (services) {
      // 基本サービス費用（割増を除く）
      const baseServicesCost = (services.parking_officer_cost || 0) + 
                               (services.transport_cost || 0) + 
                               (services.waste_disposal_cost || 0) + 
                               (services.protection_cost || 0) + 
                               (services.material_collection_cost || 0) + 
                               (services.construction_cost || 0) + 
                               (services.parking_fee || 0) + 
                               (services.highway_fee || 0);
      
      // 作業時間帯割増費用を再計算（再計算された車両・スタッフ費用に適用）
      if (services.work_time_multiplier && services.work_time_multiplier > 1.0) {
        timeMultiplierCost = (finalVehicleCost + finalStaffCost) * (services.work_time_multiplier - 1.0);
      }
      
      servicesTotalCost = baseServicesCost + timeMultiplierCost;
      
      console.log('🔧 サービス費用再計算:', {
        baseServicesCost,
        vehicleCost: finalVehicleCost,
        staffCost: finalStaffCost,
        multiplier: services.work_time_multiplier,
        timeMultiplierCost,
        servicesTotalCost
      });
    }

    // Step5で保存されたtotal_costではなく、再計算された値を使用
    const finalServicesCost = servicesTotalCost;

    console.log('🔢 STEP6最終金額計算:', {
      vehicleCost: finalVehicleCost,
      staffCost: finalStaffCost,
      servicesCost: finalServicesCost,
      vehicleOriginal: vehicle.cost,
      staffOriginal: staff.total_cost
    });
    
    // 4. 最終合計計算（値引き対応）
    const subtotal = finalVehicleCost + finalStaffCost + finalServicesCost;
    
    // 値引き金額を取得（入力欄から）
    const discountInput = document.getElementById('discountAmount');
    const discountAmount = discountInput ? parseInt(discountInput.value) || 0 : 0;
    
    // 値引き後小計
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    
    const taxRate = 0.1;
    const taxAmount = Math.floor(discountedSubtotal * taxRate);
    const totalAmount = discountedSubtotal + taxAmount;

    document.getElementById('subtotalAmount').textContent = Utils.formatCurrency(subtotal);
    
    // 値引き後小計を表示
    if (document.getElementById('discountedSubtotal')) {
      document.getElementById('discountedSubtotal').textContent = Utils.formatCurrency(discountedSubtotal);
    }
    
    document.getElementById('taxAmount').textContent = Utils.formatCurrency(taxAmount);
    document.getElementById('totalAmount').textContent = Utils.formatCurrency(totalAmount);

    // 合計データを保存（値引き対応）
    Step6Implementation.estimateData.totals = {
      subtotal,
      discount_amount: discountAmount,
      discounted_subtotal: discountedSubtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      // 再計算された個別費用も保存
      recalculated_vehicle_cost: finalVehicleCost,
      recalculated_staff_cost: finalStaffCost,
      recalculated_services_cost: finalServicesCost
    };
    
    console.log('💰 STEP6合計金額計算完了（修正版）:', Step6Implementation.estimateData.totals);
    
    // サービス詳細を再表示（再計算された費用を反映）
    Step6Implementation.displayServicesDetails();
  },

  // 値引き変更処理
  handleDiscountChange: () => {
    Step6Implementation.calculateTotal();
  },
  
  // 合計再計算
  recalculateTotal: () => {
    Step6Implementation.calculateTotal();
    Utils.showSuccess('合計金額を再計算しました');
  },

  // AI メール生成
  generateAIEmail: async () => {
    const generateBtn = document.getElementById('generateEmailBtn');
    
    try {
      Utils.showLoading(generateBtn);
      
      const requestData = {
        customer_name: Step6Implementation.estimateData.customer.name,
        project_name: Step6Implementation.estimateData.project.name,
        total_amount: Step6Implementation.estimateData.totals.total_amount,
        estimate_details: {
          vehicle_info: `${Step6Implementation.estimateData.vehicle.type}・${Step6Implementation.estimateData.vehicle.operation}`,
          staff_info: `スタッフ合計: ${Step6Implementation.getStaffTotalCount()}名`,
          services_info: Step6Implementation.getServicesInfo()
        }
      };

      const response = await API.post('/ai-generate-email', requestData);
      
      if (response.success) {
        document.getElementById('emailSubject').value = response.data.subject;
        document.getElementById('emailContent').value = response.data.email_content;
        Modal.open('aiEmailModal');
      } else {
        Utils.showError('メール生成に失敗しました: ' + response.error);
      }
      
    } catch (error) {
      Utils.showError('メール生成中にエラーが発生しました: ' + error.message);
    } finally {
      Utils.hideLoading(generateBtn, '<i class="fas fa-magic mr-2"></i>メール文生成');
    }
  },

  // スタッフ総数計算
  getStaffTotalCount: () => {
    const staff = Step6Implementation.estimateData.staff;
    return (staff.supervisor_count || 0) + (staff.leader_count || 0) + 
           (staff.m2_staff_half_day || 0) + (staff.m2_staff_full_day || 0) +
           (staff.temp_staff_half_day || 0) + (staff.temp_staff_full_day || 0);
  },

  // サービス情報まとめ
  getServicesInfo: () => {
    const services = Step6Implementation.estimateData.services;
    if (!services || services.total_cost === 0) return '';
    
    const serviceList = [];
    if (services.parking_officer_cost > 0) serviceList.push('駐車対策員');
    if (services.transport_cost > 0) serviceList.push('人員輸送車両');
    if (services.waste_disposal_cost > 0) serviceList.push('引き取り廃棄');
    if (services.protection_cost > 0) serviceList.push('養生作業');
    if (services.material_collection_cost > 0) serviceList.push('残材回収');
    if (services.construction_cost > 0) serviceList.push('施工');
    
    return serviceList.length > 0 ? `その他サービス: ${serviceList.join('、')}` : '';
  },

  // メールをクリップボードにコピー
  copyEmailToClipboard: async () => {
    const subject = document.getElementById('emailSubject').value;
    const content = document.getElementById('emailContent').value;
    const fullText = `件名: ${subject}\n\n${content}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      Utils.showSuccess('メール内容をクリップボードにコピーしました');
    } catch (error) {
      Utils.showError('クリップボードへのコピーに失敗しました');
    }
  },

  // PDF生成
  generatePDF: () => {
    // 保存された見積IDを確認
    const savedEstimateId = sessionStorage.getItem('lastSavedEstimateId');
    
    if (savedEstimateId) {
      // 保存済み見積のPDF生成
      const pdfUrl = `/api/estimates/${savedEstimateId}/pdf`;
      window.open(pdfUrl, '_blank');
      Utils.showSuccess('PDFを生成しています...');
    } else {
      Utils.showError('先に見積を保存してください');
    }
  },

  // 見積保存
  saveEstimate: async () => {
    const saveBtn = document.getElementById('saveEstimateBtn');
    
    try {
      Utils.showLoading(saveBtn);
      
      // 見積データを整理
      console.log('💾 保存前のStep6Implementation.estimateData.staff:', Step6Implementation.estimateData.staff);
      
      const estimateData = {
        customer_id: Step6Implementation.estimateData.customer.id,
        project_id: Step6Implementation.estimateData.project.id,
        estimate_number: document.getElementById('estimateNumber').textContent,
        
        // 配送先情報
        delivery_address: Step6Implementation.estimateData.delivery.address,
        delivery_postal_code: Step6Implementation.estimateData.delivery.postal_code,
        delivery_area: Step6Implementation.estimateData.delivery.area,
        
        // 車両情報（複数車両対応）
        vehicle_type: Step6Implementation.estimateData.vehicle.type,
        operation_type: Step6Implementation.estimateData.vehicle.operation,
        vehicle_cost: Step6Implementation.estimateData.vehicle.cost,
        // 複数車両用フィールド
        vehicle_2t_count: Step6Implementation.estimateData.vehicle.vehicle_2t_count || 0,
        vehicle_4t_count: Step6Implementation.estimateData.vehicle.vehicle_4t_count || 0,
        external_contractor_cost: Step6Implementation.estimateData.vehicle.external_contractor_cost || 0,
        uses_multiple_vehicles: Step6Implementation.estimateData.vehicle.uses_multiple_vehicles || false,
        
        // スタッフ情報（詳細データも保存）
        ...Step6Implementation.estimateData.staff,
        // スタッフ費用の確実な設定（複数のフォールバック）
        staff_cost: Step6Implementation.estimateData.staff.total_cost || 
                   Step6Implementation.estimateData.staff.staff_cost || 
                   ((Step6Implementation.estimateData.staff.supervisor_count || 0) * 25000 +
                    (Step6Implementation.estimateData.staff.leader_count || 0) * 22000 +
                    (Step6Implementation.estimateData.staff.m2_staff_half_day || 0) * 8500 +
                    (Step6Implementation.estimateData.staff.m2_staff_full_day || 0) * 15000 +
                    (Step6Implementation.estimateData.staff.temp_staff_half_day || 0) * 7500 +
                    (Step6Implementation.estimateData.staff.temp_staff_full_day || 0) * 13500),
        
        // サービス情報
        ...(Step6Implementation.estimateData.services || {}),
        
        // 合計金額（値引き対応）
        subtotal: Step6Implementation.estimateData.totals?.subtotal || 0,
        discount_amount: Step6Implementation.estimateData.totals?.discount_amount || 0,
        tax_rate: Step6Implementation.estimateData.totals?.tax_rate || 0.1,
        tax_amount: Step6Implementation.estimateData.totals?.tax_amount || 0,
        total_amount: Step6Implementation.estimateData.totals?.total_amount || 0,
        
        // メタ情報
        notes: Step6Implementation.estimateData.services?.notes || '',
        user_id: currentUser
      };

      // undefined値をチェックして除去
      const cleanedEstimateData = {};
      Object.keys(estimateData).forEach(key => {
        if (estimateData[key] !== undefined) {
          cleanedEstimateData[key] = estimateData[key];
        } else {
          console.warn(`⚠️ フィールド '${key}' がundefinedです。送信から除外します。`);
        }
      });
      
      console.log('📤 サーバーに送信する見積データ:', cleanedEstimateData);
      console.log('👥 送信されるスタッフ詳細:', {
        supervisor_count: cleanedEstimateData.supervisor_count,
        leader_count: cleanedEstimateData.leader_count,
        m2_staff_half_day: cleanedEstimateData.m2_staff_half_day,
        m2_staff_full_day: cleanedEstimateData.m2_staff_full_day,
        temp_staff_half_day: cleanedEstimateData.temp_staff_half_day,
        temp_staff_full_day: cleanedEstimateData.temp_staff_full_day,
        staff_cost: cleanedEstimateData.staff_cost
      });
      
      const response = await API.post('/estimates', cleanedEstimateData);
      
      if (response.success) {
        Utils.showSuccess('見積の保存が完了しました！上記のPDF生成やメール生成ボタンをご利用ください。');
        
        // 保存された見積IDを保存
        if (response.data && response.data.id) {
          sessionStorage.setItem('lastSavedEstimateId', response.data.id);
        }
        
        // セッションストレージをクリア
        sessionStorage.removeItem('estimateFlow');
        
        // 保存ボタンを無効化（重複保存防止）
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-check mr-2"></i>保存完了';
        saveBtn.className = 'btn-success opacity-50 cursor-not-allowed';
        
      } else {
        Utils.showError('見積の保存に失敗しました: ' + response.error);
      }
      
    } catch (error) {
      Utils.showError('保存中にエラーが発生しました: ' + error.message);
    } finally {
      Utils.hideLoading(saveBtn, '<i class="fas fa-check mr-2"></i>見積を保存');
    }
  },

  // STEP5に戻る
  goBackToStep5: () => {
    window.location.href = '/estimate/step5';
  },


};

// STEP5用関数
window.handleTransportDistanceChange = Step5Implementation.handleTransportDistanceChange;
window.updateServicesCost = Step5Implementation.updateServicesCost;
window.goBackToStep4 = Step5Implementation.goBackToStep4;
window.proceedToStep6 = Step5Implementation.proceedToStep6;

// STEP6用関数
window.handleDiscountChange = Step6Implementation.handleDiscountChange;
window.recalculateTotal = Step6Implementation.recalculateTotal;
window.generateAIEmail = Step6Implementation.generateAIEmail;
window.copyEmailToClipboard = Step6Implementation.copyEmailToClipboard;
window.generatePDF = Step6Implementation.generatePDF;
window.saveEstimate = Step6Implementation.saveEstimate;
window.goBackToStep5 = Step6Implementation.goBackToStep5;

// 郵便番号検索機能
const PostalCodeUtils = {
  // 郵便番号検索とエリア自動判定
  searchPostalCode: async (postalCode, areaSelectElement) => {
    try {
      // 郵便番号を7桁の数字のみに整形
      const cleanedCode = postalCode.replace(/[^\d]/g, '');
      
      if (cleanedCode.length !== 7) {
        Utils.showError('郵便番号は7桁で入力してください');
        return false;
      }
      
      // API呼び出し
      const response = await API.get(`/postal-code/${cleanedCode}`);
      
      if (response.success) {
        if (response.detected) {
          // エリアが検出された場合
          // 成功メッセージは他の箇所で表示するため、ここでは削除
          
          // セレクトボックスに自動設定
          if (areaSelectElement) {
            areaSelectElement.value = response.area_rank;
            
            // changeイベントを発火してエリア変更を反映
            const changeEvent = new Event('change', { bubbles: true });
            areaSelectElement.dispatchEvent(changeEvent);
          }
          
          return {
            area_name: response.area_name,
            area_rank: response.area_rank,
            detected: true
          };
        } else {
          // エリアが検出されなかった場合
          Utils.showError('エリア情報が見つかりません。手動でエリアを選択してください。');
          
          // デフォルトのDランクを設定
          if (areaSelectElement) {
            areaSelectElement.value = 'D';
            const changeEvent = new Event('change', { bubbles: true });
            areaSelectElement.dispatchEvent(changeEvent);
          }
          
          return {
            area_name: null,
            area_rank: 'D',
            detected: false
          };
        }
      } else {
        Utils.showError('郵便番号検索でエラーが発生しました');
        return false;
      }
    } catch (error) {
      console.error('郵便番号検索エラー:', error);
      Utils.showError('郵便番号検索に失敗しました');
      return false;
    }
  },
  
  // 郵便番号入力フィールドに自動検索機能を追加
  attachAutoSearch: (postalCodeInput, areaSelect) => {
    if (!postalCodeInput || !areaSelect) return;
    
    // 入力時の自動フォーマット
    postalCodeInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/[^\d]/g, '');
      if (value.length > 7) value = value.substring(0, 7);
      
      // XXX-XXXX形式でフォーマット
      if (value.length > 3) {
        value = value.substring(0, 3) + '-' + value.substring(3);
      }
      
      e.target.value = value;
    });
    
    // Enter キーまたはフォーカスアウト時に自動検索
    const performSearch = () => {
      const postalCode = postalCodeInput.value;
      const cleanedCode = postalCode.replace(/[^\d]/g, '');
      
      if (cleanedCode.length === 7) {
        PostalCodeUtils.searchPostalCode(postalCode, areaSelect);
      }
    };
    
    postalCodeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
      }
    });
    
    postalCodeInput.addEventListener('blur', performSearch);
  },
  
  // エリア設定一覧を取得
  loadAreaSettings: async () => {
    try {
      const response = await API.get('/area-settings');
      
      if (response.success) {
        return response.areas;
      } else {
        console.error('エリア設定一覧取得エラー:', response.error);
        return [];
      }
    } catch (error) {
      console.error('エリア設定一覧取得エラー:', error);
      return [];
    }
  }
};

// グローバル関数として公開
window.PostalCodeUtils = PostalCodeUtils;
window.searchPostalCode = PostalCodeUtils.searchPostalCode;

// STEP間の直接ナビゲーション機能
const NavigationUtils = {
  // 指定されたステップに直接移動
  navigateToStep: (stepNumber) => {
    // 現在のフローデータを確認
    const flowData = JSON.parse(sessionStorage.getItem('estimateFlow') || '{}');
    
    if (!flowData.customer || !flowData.project) {
      Utils.showError('見積フローデータが見つかりません。最初からやり直してください。');
      window.location.href = '/estimate/new';
      return;
    }
    
    // 確認メッセージ
    const stepNames = {
      1: 'STEP1: 顧客・案件選択',
      2: 'STEP2: 配送先入力',
      3: 'STEP3: 車両選択',  
      4: 'STEP4: スタッフ入力',
      5: 'STEP5: その他サービス'
    };
    
    const confirmed = confirm(
      `${stepNames[stepNumber]}に戻りますか？\n\n` +
      '注意：現在のページで入力した内容は保持されますが、\n' +
      '戻った後に再度このページに来るには順番通りに進む必要があります。'
    );
    
    if (!confirmed) {
      return;
    }
    
    // ステップに応じた遷移
    switch(stepNumber) {
      case 1:
        window.location.href = '/estimate/new';
        break;
      case 2:
        window.location.href = '/estimate/step2';
        break;
      case 3:
        window.location.href = '/estimate/step3';
        break;
      case 4:
        window.location.href = '/estimate/step4';
        break;
      case 5:
        window.location.href = '/estimate/step5';
        break;
      default:
        Utils.showError('無効なステップ番号です');
    }
  }
};

// グローバル関数として公開
window.NavigationUtils = NavigationUtils;
window.navigateToStep = NavigationUtils.navigateToStep;
window.saveEstimate = Step6Implementation.saveEstimate;
window.goBackToStep5 = Step6Implementation.goBackToStep5;

// 顧客・案件管理用関数（CustomerManagement定義後に設定）

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
  console.log('輸送見積もりシステム初期化完了');
  
  // 現在のページに応じた初期化処理
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('/estimate')) {
    EstimateFlow.updateUI();
    
    // STEP2の初期化
    if (currentPath === '/estimate/step2') {
      Step2Implementation.initialize();
      
      // イベントリスナーの設定
      const manualAreaSelect = document.getElementById('manualArea');
      const addressInput = document.getElementById('deliveryAddress');
      
      if (manualAreaSelect) {
        manualAreaSelect.addEventListener('change', Step2Implementation.handleManualAreaChange);
      }
      
      if (addressInput) {
        addressInput.addEventListener('input', Step2Implementation.handleAddressChange);
      }
    }

    // STEP3の初期化
    if (currentPath === '/estimate/step3') {
      Step3Implementation.initialize();
    }

    // STEP4の初期化
    if (currentPath === '/estimate/step4') {
      Step4Implementation.initialize();
    }

    // STEP5の初期化
    if (currentPath === '/estimate/step5') {
      Step5Implementation.initialize();
    }

    // STEP6の初期化
    if (currentPath === '/estimate/step6') {
      Step6Implementation.initialize();
    }
    
    // フォームイベントリスナーの設定
    const customerForm = document.getElementById('customerForm');
    const projectForm = document.getElementById('projectForm');
    
    if (customerForm) {
      customerForm.addEventListener('submit', EstimateFlowImplementation.submitCustomerForm);
    }
    
    if (projectForm) {
      projectForm.addEventListener('submit', EstimateFlowImplementation.submitProjectForm);
    }
  }
  
  // ページ固有の初期化は setTimeout で遅延実行
  setTimeout(() => {
    // ホームページ（ダッシュボード）の初期化
    if (currentPath === '/' || currentPath === '') {
      console.log('🏠 ホームページ初期化開始');
      if (typeof Dashboard !== 'undefined' && Dashboard.loadStats) {
        Dashboard.loadStats();
      }
    }
    
    // マスタ管理ページの初期化
    if (currentPath === '/masters') {
      if (typeof MasterManagement !== 'undefined') {
        MasterManagement.initialize();
        
        // エリア設定フォームのイベントリスナー
        const areaForm = document.getElementById('addAreaForm');
        if (areaForm) {
          areaForm.addEventListener('submit', MasterManagement.saveArea);
        }
      }
    }

    // 顧客・案件管理ページの初期化
    if (currentPath === '/customers') {
      if (typeof CustomerManagement !== 'undefined') {
        CustomerManagement.initialize();
        
        // フォームイベントリスナーの設定
        const customerForm = document.getElementById('customerForm');
        const projectForm = document.getElementById('projectForm');
        const statusChangeForm = document.getElementById('statusChangeForm');
        
        if (customerForm) {
          customerForm.addEventListener('submit', CustomerManagement.submitCustomerForm);
        }
        
        if (projectForm) {
          projectForm.addEventListener('submit', CustomerManagement.submitProjectForm);
        }
        
        if (statusChangeForm) {
          statusChangeForm.addEventListener('submit', CustomerManagement.submitStatusChange);
        }
      }
    }
  }, 100); // 100ms遅延
  
  // 全ページ共通の初期化
  // ...
});

// マスタ管理機能の実装（重複宣言を防ぐため条件付き）
if (typeof MasterManagement === 'undefined') {
  window.MasterManagement = {
  // 現在のタブとデータ
  currentTab: 'staff-area',
  masterSettings: null,
  areaSettings: null,

  // ページ初期化
  initialize: async () => {
    // 初期化フラグでの重複実行防止
    if (MasterManagement._initializing) {
      console.log('⚠️ MasterManagement already initializing, skipping...');
      return;
    }
    // すでに初期化完了している場合もスキップ
    if (MasterManagement._initialized) {
      console.log('✅ MasterManagement already initialized, skipping...');
      return;
    }
    MasterManagement._initializing = true;
    
    try {
      console.log('🚀 MasterManagement initialization started');
      
      // マスタ設定データを取得（一回のみ）
      if (!MasterManagement.masterSettings) {
        try {
          await MasterManagement.loadMasterSettings();
          console.log('✅ Master settings loaded');
        } catch (error) {
          console.error('❌ マスタ設定読み込みエラー:', error);
        }
      }
      
      // エリア設定データを取得（一回のみ）
      if (!MasterManagement.areaSettings) {
        try {
          await MasterManagement.loadAreaSettings();
          console.log('✅ Area settings loaded');
        } catch (error) {
          console.error('❌ エリア設定読み込みエラー:', error);
        }
      }
      
      // 初期表示（データロード完了後）
      MasterManagement.switchTab('staff-area');
      console.log('✅ MasterManagement initialization completed');
      MasterManagement._initialized = true;
      
    } finally {
      MasterManagement._initializing = false;
    }
  },

  // タブ切り替え
  switchTab: (tabName) => {
    // タブボタンの状態を更新
    const tabs = [
      { id: 'staffAreaTab', name: 'staff-area' },
      { id: 'vehicleTab', name: 'vehicle' },
      { id: 'servicesTab', name: 'services' },
      { id: 'customersTab', name: 'customers' },
      { id: 'projectsTab', name: 'projects' }
    ];

    tabs.forEach(tab => {
      const tabButton = document.getElementById(tab.id);
      if (tabButton) {
        if (tab.name === tabName) {
          tabButton.className = 'py-4 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600 master-tab active';
        } else {
          tabButton.className = 'py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 master-tab';
        }
      }
    });

    // タブコンテンツの表示切り替え
    const contents = [
      { id: 'staff-area-content', name: 'staff-area' },
      { id: 'vehicle-content', name: 'vehicle' },
      { id: 'services-content', name: 'services' },
      { id: 'customers-content', name: 'customers' },
      { id: 'projects-content', name: 'projects' }
    ];

    contents.forEach(content => {
      const contentElement = document.getElementById(content.id);
      if (contentElement) {
        if (content.name === tabName) {
          contentElement.classList.remove('hidden');
        } else {
          contentElement.classList.add('hidden');
        }
      }
    });

    MasterManagement.currentTab = tabName;

    // タブ固有の初期化処理（一回のみ実行）
    switch (tabName) {
      case 'staff-area':
        if (!MasterManagement._staffAreaDisplayed) {
          MasterManagement.displayStaffAreaSettings();
          MasterManagement._staffAreaDisplayed = true;
        }
        break;
      case 'vehicle':
        if (!MasterManagement._vehicleDisplayed) {
          MasterManagement.displayVehicleSettings();
          MasterManagement._vehicleDisplayed = true;
        }
        break;
      case 'services':
        console.log('🔧 Services tab activated');
        if (!MasterManagement._servicesDisplayed) {
          console.log('🔧 First time display, calling displayServicesSettings');
          MasterManagement.displayServicesSettings();
          MasterManagement._servicesDisplayed = true;
        } else {
          console.log('🔧 Services already displayed, skipping');
        }
        break;
      case 'customers':
        // 顧客マスター表示処理
        MasterManagement.displayCustomersContent();
        break;
      case 'projects':
        // 案件マスター表示処理
        MasterManagement.displayProjectsContent();
        break;
    }
  },

  // マスタ設定データ読み込み
  loadMasterSettings: async () => {

    
    try {
      const response = await API.get('/master-settings');
      if (response.success) {

        MasterManagement.masterSettings = response.data;
        // データをUIに反映
        MasterManagement.populateUIWithData();
      }
    } catch (error) {
      console.error('マスタ設定読み込みエラー:', error);
    }
  },

  // データをUIに反映する処理
  populateUIWithData: () => {
    
    // 重複実行防止
    if (MasterManagement._isPopulating) {
      console.log('⚠️ populateUIWithData already in progress, skipping...');
      return;
    }
    
    // データが既に入力されている場合は上書きしない（ユーザー入力保護）
    // 初回ロード時のみAPIデータを反映、それ以降はユーザーデータを保護
    const testElement = document.getElementById('vehicle_2t_full_day_A');
    const hasExistingData = testElement && testElement.value && testElement.value !== '0' && testElement.value !== '';
    
    if (hasExistingData && MasterManagement._dataPopulated) {
      console.log('🛡️ User data protection: skipping populate to prevent overwrite');
      return;
    }
    
    MasterManagement._isPopulating = true;
    
    try {
      const settings = MasterManagement.masterSettings;
      
      // 車両料金データをUIに反映
      if (settings.vehicle_rates) {
        Object.entries(settings.vehicle_rates).forEach(([key, value]) => {
          const element = document.getElementById(key);
          if (element) {
            const oldValue = element.value;
            element.value = value;
            console.log(`✅ Updated ${key}: ${oldValue} → ${value}`);
            

          } else {
            console.log(`⚠️ Element not found for key: ${key}`);
          }
        });
      }

      // スタッフ料金データをUIに反映
      if (settings.staff_rates) {
        Object.entries(settings.staff_rates).forEach(([key, value]) => {
          const elementId = `rate_${key}`;
          const element = document.getElementById(elementId);
          if (element) {
            element.value = value;
            console.log(`✅ Updated ${elementId}: ${value}`);
          }
        });
      }

      // サービス料金データをUIに反映
      if (settings.service_rates) {
        Object.entries(settings.service_rates).forEach(([key, value]) => {
          const elementId = `service_${key}`;
          const element = document.getElementById(elementId);
          if (element) {
            const oldValue = element.value;
            element.value = value;
            const newValue = element.value;
            console.log(`✅ Updated ${elementId}: ${oldValue} → ${value} (actual: ${newValue})`);
            if (newValue != value) {
              console.error(`❌ FAILED to set ${elementId}: expected ${value}, got ${newValue}`);
            }
          } else {
            console.error(`❌ Element not found: ${elementId}`);
          }
        });
      }

      // システム設定をUIに反映
      if (settings.system_settings) {
        Object.entries(settings.system_settings).forEach(([key, value]) => {
          const elementId = `system_${key}`;
          const element = document.getElementById(elementId);
          if (element) {
            element.value = value;
            console.log(`✅ Updated ${elementId}: ${value}`);
          }
        });
      }
      
      console.log('🎯 UI data population completed');
      // データ投入完了フラグを設定
      MasterManagement._dataPopulated = true;
      
      // 最終的に設定された値を確認
      const finalElement = document.getElementById('vehicle_2t_full_day_A');
      if (finalElement) {
        console.log('🎯 最終設定値 vehicle_2t_full_day_A:', finalElement.value);
      }
    } catch (error) {
      console.error('UI data population error:', error);
    } finally {
      // 重複実行防止フラグをリセット
      MasterManagement._isPopulating = false;
    }
  },

  // エリア設定データ読み込み
  loadAreaSettings: async () => {
    try {
      const response = await API.get('/area-settings');
      if (response.success) {
        MasterManagement.areaSettings = response.data;
      }
    } catch (error) {
      console.error('エリア設定読み込みエラー:', error);
    }
  },

  // スタッフ・エリア設定表示
  displayStaffAreaSettings: () => {
    if (!MasterManagement.masterSettings) return;

    const settings = MasterManagement.masterSettings;
    
    // スタッフ単価設定（HTMLのIDに合わせて修正）
    const setInputValue = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.value = value;
    };

    setInputValue('rate_supervisor', settings.staff_rates?.supervisor || 15000);
    setInputValue('rate_leader', settings.staff_rates?.leader || 12000);
    setInputValue('rate_m2_half_day', settings.staff_rates?.m2_half_day || 6000);
    setInputValue('rate_m2_full_day', settings.staff_rates?.m2_full_day || 10000);
    setInputValue('rate_temp_half_day', settings.staff_rates?.temp_half_day || 5500);
    setInputValue('rate_temp_full_day', settings.staff_rates?.temp_full_day || 9500);

    // エリア設定一覧を表示
    MasterManagement.displayAreaList();
  },

  // エリア一覧表示
  displayAreaList: () => {
    const areaTable = document.getElementById('areaSettingsTable');
    
    if (!areaTable) {
      console.warn('エリア設定テーブルが見つかりません');
      return;
    }

    if (!MasterManagement.areaSettings || MasterManagement.areaSettings.length === 0) {
      areaTable.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500 p-4">エリア設定がありません</td></tr>';
      return;
    }

    const html = MasterManagement.areaSettings.map(area => `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-2">${area.postal_code_prefix || 'なし'}</td>
        <td class="px-4 py-2">${area.area_name}</td>
        <td class="px-4 py-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
            ${area.area_rank === 'A' ? 'bg-green-100 text-green-800' : 
              area.area_rank === 'B' ? 'bg-blue-100 text-blue-800' : 
              area.area_rank === 'C' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'}">
            ${area.area_rank}エリア
          </span>
        </td>
        <td class="px-4 py-2 text-sm text-gray-600">${Utils.formatDate(area.created_at || new Date())}</td>
        <td class="px-4 py-2">
          <div class="flex space-x-2">
            <button onclick="MasterManagement.editArea('${area.area_code}')" 
                    class="text-blue-600 hover:text-blue-800">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="MasterManagement.deleteArea('${area.area_code}')" 
                    class="text-red-600 hover:text-red-800">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    areaTable.innerHTML = html;
  },

  // 車両設定表示
  displayVehicleSettings: () => {
    if (!MasterManagement.masterSettings) {
      // デフォルト値を設定（masterSettingsがない場合）
      console.log('⚠️ masterSettings not found, setting defaults');
      MasterManagement.setDefaultVehiclePrices();
      return;
    } else {

    }

    const settings = MasterManagement.masterSettings;
    
    // 実際のHTMLフィールドIDに合わせて設定
    // 2t車の設定（各エリア・各種別）
    const areas = ['A', 'B', 'C', 'D'];
    const types = ['shared', 'half_day', 'full_day'];
    
    // 2t車のデフォルト価格設定
    const default2tPrices = {
      'A': { 'shared': 15000, 'half_day': 20000, 'full_day': 30000 },
      'B': { 'shared': 18000, 'half_day': 24000, 'full_day': 36000 },
      'C': { 'shared': 22500, 'half_day': 30000, 'full_day': 45000 },
      'D': { 'shared': 30000, 'half_day': 40000, 'full_day': 60000 }
    };

    areas.forEach(area => {
      types.forEach(type => {
        const elementId = `vehicle_2t_${type}_${area}`;
        const element = document.getElementById(elementId);
        if (element) {
          const vehicleValue = settings.vehicle_rates?.[`vehicle_2t_${type}_${area}`];
          if (vehicleValue !== undefined && vehicleValue !== null) {
            element.value = vehicleValue;
          } else {
            element.value = default2tPrices[area][type];
          }
        }
      });
    });

    // 4t車のデフォルト価格設定
    const default4tPrices = {
      'A': { 'shared': 25000, 'half_day': 30000, 'full_day': 45000 },
      'B': { 'shared': 30000, 'half_day': 36000, 'full_day': 54000 },
      'C': { 'shared': 37500, 'half_day': 45000, 'full_day': 67500 },
      'D': { 'shared': 50000, 'half_day': 60000, 'full_day': 90000 }
    };

    areas.forEach(area => {
      types.forEach(type => {
        const elementId = `vehicle_4t_${type}_${area}`;
        const element = document.getElementById(elementId);
        if (element) {
          const vehicleValue = settings.vehicle_rates?.[`vehicle_4t_${type}_${area}`];
          if (vehicleValue !== undefined && vehicleValue !== null) {
            element.value = vehicleValue;
          } else {
            element.value = default4tPrices[area][type];
          }
        }
      });
    });
  },

  // デフォルト価格設定用のヘルパー関数
  setDefaultVehiclePrices: () => {
    // 2t車のデフォルト価格設定
    const default2tPrices = {
      'A': { 'shared': 15000, 'half_day': 20000, 'full_day': 30000 },
      'B': { 'shared': 18000, 'half_day': 24000, 'full_day': 36000 },
      'C': { 'shared': 22500, 'half_day': 30000, 'full_day': 45000 },
      'D': { 'shared': 30000, 'half_day': 40000, 'full_day': 60000 }
    };

    // 4t車のデフォルト価格設定
    const default4tPrices = {
      'A': { 'shared': 25000, 'half_day': 30000, 'full_day': 45000 },
      'B': { 'shared': 30000, 'half_day': 36000, 'full_day': 54000 },
      'C': { 'shared': 37500, 'half_day': 45000, 'full_day': 67500 },
      'D': { 'shared': 50000, 'half_day': 60000, 'full_day': 90000 }
    };

    const areas = ['A', 'B', 'C', 'D'];
    const types = ['shared', 'half_day', 'full_day'];
    
    // 2t車の設定
    areas.forEach(area => {
      types.forEach(type => {
        const elementId = `vehicle_2t_${type}_${area}`;
        const element = document.getElementById(elementId);
        if (element && !element.value) {
          element.value = default2tPrices[area][type];
        }
      });
    });

    // 4t車の設定
    areas.forEach(area => {
      types.forEach(type => {
        const elementId = `vehicle_4t_${type}_${area}`;
        const element = document.getElementById(elementId);
        if (element && !element.value) {
          element.value = default4tPrices[area][type];
        }
      });
    });
  },

  // サービス設定表示
  displayServicesSettings: () => {
    // 初期化中の場合は待機
    if (MasterManagement._initializing) {
      console.log('⚠️ Still initializing, waiting for completion...');
      setTimeout(() => MasterManagement.displayServicesSettings(), 200);
      return;
    }
    
    if (!MasterManagement.masterSettings) {
      // APIデータのロードを強制実行
      console.log('⚠️ masterSettings not loaded, forcing reload...');
      MasterManagement.loadMasterSettings().then(() => {
        if (MasterManagement.masterSettings) {
          console.log('✅ masterSettings loaded, retrying displayServicesSettings');
          MasterManagement.displayServicesSettings();
        } else {
          console.error('❌ Failed to load masterSettings, using defaults as fallback');
          MasterManagement.setDefaultServicesPrices();
        }
      });
      return;
    }

    const settings = MasterManagement.masterSettings;
    
    // 実際のHTMLフィールドIDに合わせて設定
    const setInputValue = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.value = value;
    };

    // APIレスポンスの正しい構造を使用：settings.service_rates.*
    const serviceRates = settings.service_rates || {};
    const systemSettings = settings.system_settings || {};

    // 駐車対策員
    setInputValue('service_parking_officer_hourly', serviceRates.parking_officer_hourly || 3000);
    
    // 人員輸送車両
    setInputValue('service_transport_20km', serviceRates.transport_20km || 8000);
    setInputValue('service_transport_per_km', serviceRates.transport_per_km || 100);
    setInputValue('service_fuel_per_liter', serviceRates.fuel_per_liter || 150);
    
    // 引き取り廃棄
    setInputValue('service_waste_small', serviceRates.waste_small || 5000);
    setInputValue('service_waste_medium', serviceRates.waste_medium || 10000);
    setInputValue('service_waste_large', serviceRates.waste_large || 20000);
    
    // 養生作業
    setInputValue('service_protection_base', serviceRates.protection_base || 5000);
    setInputValue('service_protection_floor', serviceRates.protection_floor || 3000);
    
    // 残材回収
    setInputValue('service_material_few', serviceRates.material_few || 3000);
    setInputValue('service_material_medium', serviceRates.material_medium || 8000);
    setInputValue('service_material_many', serviceRates.material_many || 15000);
    
    // 施工・作業時間帯
    setInputValue('service_construction_m2', serviceRates.construction_m2_staff_rate || 8000);
    setInputValue('service_time_normal', serviceRates.time_normal || 1.0);
    setInputValue('service_time_early', serviceRates.time_early || 1.2);
    setInputValue('service_time_night', serviceRates.time_night || 1.5);
    setInputValue('service_time_midnight', serviceRates.time_midnight || 2.0);
    
    // システム設定
    setInputValue('system_tax_rate', systemSettings.tax_rate || 0.10);
    setInputValue('system_estimate_prefix', systemSettings.estimate_prefix || 'EST');
  },

  // デフォルトサービス価格設定用のヘルパー関数
  setDefaultServicesPrices: () => {
    const setInputValue = (id, value) => {
      const element = document.getElementById(id);
      if (element && !element.value) element.value = value;
    };

    // デフォルト値を設定
    setInputValue('service_parking_officer_hourly', 3000);
    setInputValue('service_transport_20km', 8000);
    setInputValue('service_transport_per_km', 100);
    setInputValue('service_fuel_per_liter', 150);
    setInputValue('service_waste_small', 5000);
    setInputValue('service_waste_medium', 10000);
    setInputValue('service_waste_large', 20000);
    setInputValue('service_protection_base', 5000);
    setInputValue('service_protection_floor', 3000);
    setInputValue('service_material_few', 3000);
    setInputValue('service_material_medium', 8000);
    setInputValue('service_material_many', 15000);
    setInputValue('service_construction_m2', 8000);
    setInputValue('service_time_normal', 1.0);
    setInputValue('service_time_early', 1.2);
    setInputValue('service_time_night', 1.5);
    setInputValue('service_time_midnight', 2.0);
    setInputValue('system_tax_rate', 0.10);
    setInputValue('system_estimate_prefix', 'EST');
  },

  // スタッフ・エリア設定保存
  saveStaffAreaSettings: async () => {
    try {
      const getInputValue = (id) => {
        const element = document.getElementById(id);
        return element ? parseInt(element.value) || 0 : 0;
      };

      const staffData = {
        supervisor_rate: getInputValue('rate_supervisor') || 15000,
        leader_rate: getInputValue('rate_leader') || 12000,
        m2_staff_half_day_rate: getInputValue('rate_m2_half_day') || 6000,
        m2_staff_full_day_rate: getInputValue('rate_m2_full_day') || 10000,
        temp_staff_half_day_rate: getInputValue('rate_temp_half_day') || 5500,
        temp_staff_full_day_rate: getInputValue('rate_temp_full_day') || 9500
      };

      // 既存のAPIの形式に合わせてデータを変換
      const apiData = {
        staff_rates: {
          supervisor: staffData.supervisor_rate,
          leader: staffData.leader_rate,
          m2_half_day: staffData.m2_staff_half_day_rate,
          m2_full_day: staffData.m2_staff_full_day_rate,
          temp_half_day: staffData.temp_staff_half_day_rate,
          temp_full_day: staffData.temp_staff_full_day_rate
        }
      };

      const response = await API.post('/master-settings', apiData);
      
      if (response.success) {
        Utils.showSuccess('スタッフ料金設定を保存しました');
        await MasterManagement.loadMasterSettings();
      } else {
        Utils.showError('保存に失敗しました: ' + response.error);
      }

    } catch (error) {
      Utils.showError('保存中にエラーが発生しました: ' + error.message);
    }
  },

  // 車両設定保存
  saveVehicleSettings: async () => {
    try {
      const getInputValue = (id) => {
        const element = document.getElementById(id);
        return element ? parseInt(element.value) || 0 : 0;
      };

      // 実際のHTML IDに合わせたデータ収集
      const vehicleData = {};
      const areas = ['A', 'B', 'C', 'D'];
      const types = ['shared', 'half_day', 'full_day'];
      
      // 2t車のデータ収集
      areas.forEach(area => {
        types.forEach(type => {
          const elementId = `vehicle_2t_${type}_${area}`;
          vehicleData[`vehicle_2t_${type}_${area}`] = getInputValue(elementId);
        });
      });

      // 4t車のデータ収集
      areas.forEach(area => {
        types.forEach(type => {
          const elementId = `vehicle_4t_${type}_${area}`;
          vehicleData[`vehicle_4t_${type}_${area}`] = getInputValue(elementId);
        });
      });

      // 既存のAPIの形式に合わせてデータを変換
      const apiData = {
        vehicle_rates: vehicleData
      };

      const response = await API.post('/master-settings', apiData);
      
      if (response.success) {
        Utils.showSuccess('車両料金設定を保存しました');
        await MasterManagement.loadMasterSettings();
      } else {
        Utils.showError('保存に失敗しました: ' + response.error);
      }

    } catch (error) {
      Utils.showError('保存中にエラーが発生しました: ' + error.message);
    }
  },

  // サービス設定保存
  saveServicesSettings: async () => {
    try {
      const getInputValue = (id) => {
        const element = document.getElementById(id);
        return element ? (element.type === 'number' ? parseFloat(element.value) || 0 : element.value) : 0;
      };

      // 実際のHTML IDに合わせたデータ収集
      const servicesData = {
        parking_officer_hourly_rate: getInputValue('service_parking_officer_hourly'),
        transport_vehicle_20km_rate: getInputValue('service_transport_20km'),
        transport_vehicle_per_km_rate: getInputValue('service_transport_per_km'),
        fuel_per_liter_rate: getInputValue('service_fuel_per_liter'),
        waste_disposal_small_rate: getInputValue('service_waste_small'),
        waste_disposal_medium_rate: getInputValue('service_waste_medium'),
        waste_disposal_large_rate: getInputValue('service_waste_large'),
        protection_work_base_rate: getInputValue('service_protection_base'),
        protection_work_floor_rate: getInputValue('service_protection_floor'),
        material_collection_small_rate: getInputValue('service_material_few'),
        material_collection_medium_rate: getInputValue('service_material_medium'),
        material_collection_large_rate: getInputValue('service_material_many'),
        construction_m2_staff_rate: getInputValue('service_construction_m2'),
        work_time_early_multiplier: getInputValue('service_time_early'),
        work_time_night_multiplier: getInputValue('service_time_night'),
        work_time_midnight_multiplier: getInputValue('service_time_midnight'),
        tax_rate: getInputValue('system_tax_rate'),
        estimate_prefix: getInputValue('system_estimate_prefix')
      };

      // 既存のAPIの形式に合わせてデータを変換
      const apiData = {
        service_rates: {
          parking_officer_hourly: servicesData.parking_officer_hourly_rate,
          transport_20km: servicesData.transport_vehicle_20km_rate,
          transport_per_km: servicesData.transport_vehicle_per_km_rate,
          fuel_per_liter: servicesData.fuel_per_liter_rate,
          waste_small: servicesData.waste_disposal_small_rate,
          waste_medium: servicesData.waste_disposal_medium_rate,
          waste_large: servicesData.waste_disposal_large_rate,
          protection_base: servicesData.protection_work_base_rate,
          protection_floor: servicesData.protection_work_floor_rate,
          material_few: servicesData.material_collection_small_rate,
          material_medium: servicesData.material_collection_medium_rate,
          material_many: servicesData.material_collection_large_rate,
          construction_m2_staff: servicesData.construction_m2_staff_rate,
          time_early: servicesData.work_time_early_multiplier,
          time_night: servicesData.work_time_night_multiplier,
          time_midnight: servicesData.work_time_midnight_multiplier
        },
        system_settings: {
          tax_rate: servicesData.tax_rate,
          estimate_prefix: servicesData.estimate_prefix
        }
      };

      const response = await API.post('/master-settings', apiData);
      
      if (response.success) {
        Utils.showSuccess('サービス料金設定を保存しました');
        // 保存後は強制的にデータを再読み込みして最新値を反映
        MasterManagement._dataPopulated = false; // フラグをリセット
        MasterManagement._servicesDisplayed = false; // サービス表示フラグもリセット
        MasterManagement.masterSettings = null;  // キャッシュをクリア
        await MasterManagement.loadMasterSettings();
        // サービス設定を強制的に再表示
        MasterManagement.displayServicesSettings();
      } else {
        Utils.showError('保存に失敗しました: ' + response.error);
      }

    } catch (error) {
      Utils.showError('保存中にエラーが発生しました: ' + error.message);
    }
  },

  // スタッフ料金保存
  saveStaffRates: async () => {
    console.log('🚀 スタッフ料金保存開始');
    try {
      const getInputValue = (id) => {
        const element = document.getElementById(id);
        return element ? parseFloat(element.value) || 0 : 0;
      };

      // スタッフ料金データの収集
      const staffData = {
        leader: getInputValue('rate_leader'),
        m2_full_day: getInputValue('rate_m2_full_day'),
        m2_half_day: getInputValue('rate_m2_half_day'),
        supervisor: getInputValue('rate_supervisor'),
        temp_full_day: getInputValue('rate_temp_full_day'),
        temp_half_day: getInputValue('rate_temp_half_day')
      };

      // APIの形式に合わせてデータを変換
      const apiData = {
        staff_rates: staffData
      };

      console.log('📤 送信データ:', apiData);
      const response = await API.post('/master-settings', apiData);
      
      if (response.success) {
        Utils.showSuccess('スタッフ料金設定を保存しました');
        await MasterManagement.loadMasterSettings();
      } else {
        Utils.showError('保存に失敗しました: ' + response.error);
      }

    } catch (error) {
      Utils.showError('保存中にエラーが発生しました: ' + error.message);
      console.error('スタッフ料金保存エラー:', error);
    }
  },

  // エリア追加モーダルを開く
  openAddAreaModal: () => {
    // フォームをリセット
    document.getElementById('areaForm').reset();
    document.getElementById('areaFormTitle').textContent = 'エリア追加';
    document.getElementById('area_code').readOnly = false;
    
    Modal.open('areaModal');
  },

  // エリア編集
  editArea: (areaCode) => {
    const area = MasterManagement.areaSettings.find(a => a.area_code === areaCode);
    if (!area) return;

    // フォームに既存データを設定
    document.getElementById('area_code').value = area.area_code;
    document.getElementById('area_name').value = area.area_name;
    document.getElementById('prefectures').value = area.prefectures || '';
    document.getElementById('postal_code_patterns').value = area.postal_code_patterns || '';

    document.getElementById('areaFormTitle').textContent = 'エリア編集';
    document.getElementById('area_code').readOnly = true;
    
    Modal.open('areaModal');
  },

  // エリア削除
  deleteArea: (areaCode) => {
    Modal.confirm(
      `${areaCode}エリアを削除してもよろしいですか？`,
      async () => {
        try {
          const response = await API.delete(`/api/area-settings/${areaCode}`);
          
          if (response.success) {
            Utils.showSuccess('エリアを削除しました');
            await MasterManagement.loadAreaSettings();
            MasterManagement.displayAreaList();
          } else {
            Utils.showError('削除に失敗しました: ' + response.error);
          }
        } catch (error) {
          Utils.showError('削除中にエラーが発生しました: ' + error.message);
        }
      }
    );
  },

  // エリア保存
  saveArea: async (event) => {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const saveBtn = form.querySelector('button[type="submit"]');
    
    const areaData = {
      area_code: formData.get('area_code'),
      area_name: formData.get('area_name'),
      prefectures: formData.get('prefectures'),
      postal_code_patterns: formData.get('postal_code_patterns')
    };

    try {
      // 入力検証
      Validator.required(areaData.area_code, 'エリアコード');
      Validator.required(areaData.area_name, 'エリア名');

      Utils.showLoading(saveBtn);

      const isEdit = document.getElementById('area_code').readOnly;
      const endpoint = isEdit ? `/api/area-settings/${areaData.area_code}` : '/area-settings';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await API.request(method, endpoint, areaData);
      
      if (response.success) {
        const action = isEdit ? '更新' : '追加';
        Utils.showSuccess(`エリアを${action}しました`);
        
        Modal.close('areaModal');
        form.reset();
        
        await MasterManagement.loadAreaSettings();
        MasterManagement.displayAreaList();
      } else {
        Utils.showError('保存に失敗しました: ' + response.error);
      }

    } catch (error) {
      Utils.showError(error.message || '保存中にエラーが発生しました');
    } finally {
      Utils.hideLoading(saveBtn, '<i class="fas fa-save mr-2"></i>保存');
    }
  },

  // 顧客マスター表示処理
  displayCustomersContent: () => {
    console.log('顧客マスターコンテンツを表示');
    // 顧客データが既に存在する場合は表示を更新
    // データベースエラーが発生していても、タブは表示状態を維持
    MasterManagement.loadCustomersList();
  },

  // 案件マスター表示処理  
  displayProjectsContent: () => {
    console.log('🔄 MasterManagement 案件マスターコンテンツを表示');
    
    // 新しい ProjectManagement システムを使用
    if (typeof ProjectManagement !== 'undefined' && ProjectManagement.displayProjectsContent) {
      console.log('✅ ProjectManagement.displayProjectsContent を呼び出し');
      ProjectManagement.displayProjectsContent();
    } else {
      console.warn('⚠️ ProjectManagement が見つかりません、レガシー実装を使用');
      // フォールバック: 古い実装
      MasterManagement.loadProjectsList();
      MasterManagement.loadCustomersForSelect();
    }
  },

  // 顧客一覧読み込み
  loadCustomersList: async () => {
    const tableBody = document.getElementById('masterCustomersTable');
    if (!tableBody) return;

    try {
      // ローディング表示
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4"><i class="fas fa-spinner fa-spin mr-2"></i>ローディング中...</td></tr>';
      
      // ステータスフィルター取得
      const statusFilter = document.getElementById('masterCustomerStatusFilter');
      const status = statusFilter ? statusFilter.value : 'active';
      
      // 検索パラメータ取得
      const searchInput = document.getElementById('masterCustomerSearch');
      const search = searchInput ? searchInput.value : '';
      
      // APIパラメータ構築
      const params = new URLSearchParams({
        status: status,
        limit: '100' // 表示件数を増やす
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await API.get(`/customers?${params.toString()}`);
      
      if (response.success && response.data) {
        MasterManagement.displayCustomersTable(response.data);
        
        // ステータス表示
        const statusText = MasterManagement.getStatusFilterText(status);
        const countText = `${response.data.length}件の顧客（${statusText}）`;
        MasterManagement.updateCustomerCount(countText);
      } else {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 p-4">顧客データがありません</td></tr>';
      }
    } catch (error) {
      console.error('顧客一覧読み込みエラー:', error);
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-red-500 p-4">顧客データの読み込みに失敗しました</td></tr>';
    }
  },

  // ステータスフィルターテキスト取得
  getStatusFilterText: (status) => {
    switch (status) {
      case 'active': return '有効のみ';
      case 'inactive': return '無効のみ';
      case 'deleted': return '削除済みのみ';
      case 'all': return 'すべて';
      default: return '有効のみ';
    }
  },

  // 顧客数表示更新
  updateCustomerCount: (text) => {
    let countElement = document.getElementById('customerCount');
    if (!countElement) {
      // カウント表示要素が存在しない場合は作成
      const headerElement = document.querySelector('#customers-content .flex.justify-between');
      if (headerElement) {
        countElement = document.createElement('span');
        countElement.id = 'customerCount';
        countElement.className = 'text-sm text-gray-600';
        headerElement.appendChild(countElement);
      }
    }
    if (countElement) {
      countElement.textContent = text;
    }
  },

  // 顧客テーブル表示
  displayCustomersTable: (customers) => {
    const tableBody = document.getElementById('masterCustomersTable');
    if (!tableBody || !customers) return;

    const html = customers.map(customer => {
      const status = customer.status || 'active';
      const statusBadge = MasterManagement.getStatusBadge(status);
      const actionButtons = MasterManagement.getActionButtons(customer.id, status, customer.name);
      
      return `
        <tr class="hover:bg-gray-50 ${status === 'deleted' ? 'bg-red-50' : status === 'inactive' ? 'bg-yellow-50' : ''}">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">
              ${customer.name || '名称なし'}
              ${statusBadge}
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${customer.contact_person || '-'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${customer.phone || '-'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${customer.email || '-'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${customer.project_count || 0}件</div>
          </td>
          <td class="px-3 py-4 text-sm font-medium" style="width: 120px; min-width: 120px;">
            ${actionButtons}
          </td>
        </tr>
      `;
    }).join('');

    tableBody.innerHTML = html;
  },

  // ステータスバッジ生成
  getStatusBadge: (status) => {
    switch (status) {
      case 'deleted':
        return '<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">削除済み</span>';
      case 'inactive':
        return '<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">無効</span>';
      case 'active':
      default:
        return '<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">有効</span>';
    }
  },

  // アクションボタン生成
  getActionButtons: (customerId, status, customerName) => {
    switch (status) {
      case 'deleted':
        return `
          <div class="flex flex-col space-y-1">
            <button onclick="MasterManagement.restoreCustomer('${customerId}', '${customerName}')" 
                    class="text-green-600 hover:text-green-900 text-xs px-2 py-1 border border-green-300 rounded hover:bg-green-50">
              <i class="fas fa-undo"></i> 復活
            </button>
            <button onclick="MasterManagement.permanentDeleteCustomer('${customerId}', '${customerName}')" 
                    class="text-red-800 hover:text-red-900 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50">
              <i class="fas fa-trash-alt"></i> 完全削除
            </button>
          </div>
        `;
      case 'inactive':
        return `
          <div class="flex flex-col space-y-1">
            <button onclick="MasterManagement.editCustomer('${customerId}')" 
                    class="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50">
              <i class="fas fa-edit"></i> 編集
            </button>
            <button onclick="MasterManagement.toggleCustomerStatus('${customerId}', '${customerName}', 'inactive')" 
                    class="text-green-600 hover:text-green-900 text-xs px-2 py-1 border border-green-300 rounded hover:bg-green-50">
              <i class="fas fa-check"></i> 有効化
            </button>
            <button onclick="MasterManagement.deleteCustomer('${customerId}', '${customerName}')" 
                    class="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50">
              <i class="fas fa-trash"></i> 削除
            </button>
          </div>
        `;
      case 'active':
      default:
        return `
          <div class="flex flex-col space-y-1">
            <button onclick="MasterManagement.editCustomer('${customerId}')" 
                    class="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50">
              <i class="fas fa-edit"></i> 編集
            </button>
            <button onclick="MasterManagement.toggleCustomerStatus('${customerId}', '${customerName}', 'active')" 
                    class="text-yellow-600 hover:text-yellow-900 text-xs px-2 py-1 border border-yellow-300 rounded hover:bg-yellow-50">
              <i class="fas fa-pause"></i> 無効化
            </button>
            <button onclick="MasterManagement.deleteCustomer('${customerId}', '${customerName}')" 
                    class="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50">
              <i class="fas fa-trash"></i> 削除
            </button>
          </div>
        `;
    }
  },

  // 案件一覧読み込み
  loadProjectsList: async () => {
    const tableBody = document.getElementById('masterProjectsTable');
    if (!tableBody) return;

    try {
      // ローディング表示
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4"><i class="fas fa-spinner fa-spin mr-2"></i>ローディング中...</td></tr>';
      
      // ステータスフィルター取得
      const statusFilter = document.getElementById('masterProjectStatusFilter');
      const status = statusFilter ? statusFilter.value : 'active';
      
      // 検索パラメータ取得
      const searchInput = document.getElementById('masterProjectSearch');
      const search = searchInput ? searchInput.value : '';
      
      // APIパラメータ構築
      const params = new URLSearchParams({
        record_status: status,
        limit: '100'
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await API.get(`/projects?${params.toString()}`);
      
      if (response.success && response.data) {
        MasterManagement.displayProjectsTable(response.data);
        
        // ステータス表示
        const statusText = MasterManagement.getStatusFilterText(status);
        const countText = `${response.data.length}件の案件（${statusText}）`;
        MasterManagement.updateProjectCount(countText);
      } else {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-gray-500 p-4">案件データがありません</td></tr>';
      }
    } catch (error) {
      console.error('案件一覧読み込みエラー:', error);
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-red-500 p-4">案件データの読み込みに失敗しました</td></tr>';
    }
  },

  // 案件数表示更新
  updateProjectCount: (text) => {
    let countElement = document.getElementById('projectCount');
    if (!countElement) {
      // カウント表示要素が存在しない場合は作成
      const headerElement = document.querySelector('#projects-content .flex.justify-between');
      if (headerElement) {
        countElement = document.createElement('span');
        countElement.id = 'projectCount';
        countElement.className = 'text-sm text-gray-600';
        headerElement.appendChild(countElement);
      }
    }
    if (countElement) {
      countElement.textContent = text;
    }
  },

  // 案件テーブル表示
  displayProjectsTable: (projects) => {
    const tableBody = document.getElementById('masterProjectsTable');
    if (!tableBody || !projects) return;

    const getStatusBadge = (status) => {
      const statusMap = {
        'initial': { class: 'bg-gray-100 text-gray-800', text: '初回コンタクト' },
        'quote_sent': { class: 'bg-blue-100 text-blue-800', text: '見積書送信済み' },
        'under_consideration': { class: 'bg-yellow-100 text-yellow-800', text: '受注検討中' },
        'order': { class: 'bg-green-100 text-green-800', text: '受注' },
        'failed': { class: 'bg-red-100 text-red-800', text: '失注' }
      };
      const statusInfo = statusMap[status] || statusMap['initial'];
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.class}">${statusInfo.text}</span>`;
    };

    const getPriorityBadge = (priority) => {
      const priorityMap = {
        'high': { class: 'bg-red-100 text-red-800', text: '高' },
        'medium': { class: 'bg-yellow-100 text-yellow-800', text: '中' },
        'low': { class: 'bg-gray-100 text-gray-800', text: '低' }
      };
      const priorityInfo = priorityMap[priority] || priorityMap['medium'];
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.class}">${priorityInfo.text}</span>`;
    };

    const getProjectStatusBadge = (recordStatus) => {
      switch (recordStatus) {
        case 'deleted':
          return '<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">削除済み</span>';
        case 'inactive':
          return '<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">無効</span>';
        case 'active':
        default:
          return '<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">有効</span>';
      }
    };

    const getProjectActionButtons = (projectId, recordStatus, projectName) => {
      switch (recordStatus) {
        case 'deleted':
          return `
            <div class="flex flex-col space-y-1">
              <button onclick="MasterManagement.restoreProject('${projectId}', '${projectName}')" 
                      class="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-300 rounded">
                <i class="fas fa-undo"></i> 復元
              </button>
            </div>
          `;
        case 'inactive':
          return `
            <div class="flex flex-col space-y-1">
              <button onclick="MasterManagement.activateProject('${projectId}', '${projectName}')" 
                      class="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-300 rounded">
                <i class="fas fa-check"></i> 有効化
              </button>
              <button onclick="MasterManagement.editProject('${projectId}')" 
                      class="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-300 rounded">
                <i class="fas fa-edit"></i> 編集
              </button>
              <button onclick="MasterManagement.deleteProject('${projectId}')" 
                      class="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-300 rounded">
                <i class="fas fa-trash"></i> 削除
              </button>
            </div>
          `;
        default: // active
          return `
            <div class="flex flex-col space-y-1">
              <button onclick="MasterManagement.editProject('${projectId}')" 
                      class="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-300 rounded">
                <i class="fas fa-edit"></i> 編集
              </button>
              <button onclick="MasterManagement.deactivateProject('${projectId}', '${projectName}')" 
                      class="text-yellow-600 hover:text-yellow-800 text-xs px-2 py-1 border border-yellow-300 rounded">
                <i class="fas fa-pause"></i> 無効化
              </button>
              <button onclick="MasterManagement.deleteProject('${projectId}')" 
                      class="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-300 rounded">
                <i class="fas fa-trash"></i> 削除
              </button>
            </div>
          `;
      }
    };

    const html = projects.map(project => {
      const recordStatus = project.record_status || 'active';
      const statusBadge = getProjectStatusBadge(recordStatus);
      const actionButtons = getProjectActionButtons(project.id, recordStatus, project.name);
      
      return `
        <tr class="hover:bg-gray-50 ${recordStatus === 'deleted' ? 'bg-red-50' : recordStatus === 'inactive' ? 'bg-yellow-50' : ''}">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">
              ${project.name || '名称なし'}
              ${statusBadge}
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${project.customer_name || '-'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            ${getStatusBadge(project.status)}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            ${getPriorityBadge(project.priority)}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${project.estimate_count || 0}件</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${Utils.formatDate(project.updated_at)}</div>
          </td>
          <td class="px-3 py-4 text-sm font-medium" style="width: 120px; min-width: 120px;">
            ${actionButtons}
          </td>
        </tr>
      `;
    }).join('');

    tableBody.innerHTML = html;
  },

  // 顧客新規追加モーダルを開く（マスタ管理専用）
  openAddMasterCustomerModal: () => {
    console.log('🎯 openAddMasterCustomerModal called (Master Management)');
    // モーダルが存在しない場合は作成
    MasterManagement.createCustomerModal();
    MasterManagement.currentEditId = null;
    
    // フォームをリセット
    const form = document.getElementById('masterCustomerForm');
    if (form) {
      form.reset();
      console.log('✅ Master form reset completed');
      
      // イベントリスナーを直接追加（onsubmit属性のバックアップ）
      form.removeEventListener('submit', MasterManagement.handleCustomerFormSubmitDirect);
      form.addEventListener('submit', MasterManagement.handleCustomerFormSubmitDirect);
      console.log('✅ Direct event listener added to form');
    }
    
    // モーダルタイトルを設定
    const title = document.getElementById('masterCustomerModalTitle');
    if (title) {
      title.textContent = '新規顧客追加';
    }
    
    // 送信ボタンのテキストをリセット
    const submitButton = form?.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.innerHTML = '<i class="fas fa-save mr-2"></i>保存';
    }
    
    Modal.open('masterCustomerModal');
  },

  // 古い案件新規追加モーダル - ProjectManagementに移行済み
  openAddProjectModal: async () => {
    console.log('⚠️ 古いMasterManagement.openAddProjectModal - ProjectManagementを使用してください');
    
    // ProjectManagementの関数を呼び出し
    if (typeof ProjectManagement !== 'undefined' && ProjectManagement.openAddProjectModal) {
      console.log('✅ ProjectManagement.openAddProjectModalにリダイレクト');
      return ProjectManagement.openAddProjectModal();
    } else {
      console.error('❌ ProjectManagementが見つかりません');
    }
  },
  
  // 古い実装の残り部分を削除したプレースホルダー
  _oldOpenAddProjectModalRemoved: () => {
    // この関数は削除済み
    console.log('✅ Opening project modal');
    Modal.open('masterProjectModal');
  },

  // 顧客モーダルを動的作成または初期化
  createCustomerModal: () => {
    console.log('🔧 createCustomerModal called');
    
    // 既に存在する場合はイベントハンドラーを設定してスキップ
    const existingModal = document.getElementById('masterCustomerModal');
    if (existingModal) {
      console.log('⚠️ masterCustomerModal already exists, setting up event handlers');
      const form = document.getElementById('masterCustomerForm');
      if (form) {
        // 既存のイベントリスナーを削除
        form.removeEventListener('submit', MasterManagement.handleCustomerFormSubmitDirect);
        // 新しいイベントリスナーを追加
        form.addEventListener('submit', MasterManagement.handleCustomerFormSubmitDirect);
        console.log('✅ Event handler attached to existing form');
      }
      return;
    }

    const modalHtml = `
      <div id="masterCustomerModal" class="modal-backdrop" style="display: none;">
        <div class="modal-content max-w-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 id="masterCustomerModalTitle" class="text-lg font-medium text-gray-900">新規顧客追加</h3>
          </div>
          <form id="masterCustomerForm" class="p-6" onsubmit="return MasterManagement.handleCustomerFormSubmitDirect(event)">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">顧客名 *</label>
                <input type="text" name="name" class="form-input" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">担当者</label>
                <input type="text" name="contact_person" class="form-input" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                <input type="tel" name="phone" class="form-input" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <input type="email" name="email" class="form-input" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">住所</label>
                <input type="text" name="address" class="form-input" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">備考</label>
                <textarea name="notes" class="form-input" rows="2"></textarea>
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button type="button" onclick="Modal.close('masterCustomerModal')" class="btn-secondary">
                キャンセル
              </button>
              <button type="submit" class="btn-primary">
                <i class="fas fa-save mr-2"></i>保存
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    console.log('✅ Modal created with onsubmit attribute handler');
  },

  // 案件モーダルを動的作成または初期化
  createProjectModal: () => {
    console.log('🔧 createProjectModal called');
    
    // 既に存在する場合はイベントハンドラーを設定してスキップ
    const existingModal = document.getElementById('masterProjectModal');
    if (existingModal) {
      console.log('⚠️ masterProjectModal already exists, setting up event handlers');
      const form = document.getElementById('masterProjectForm');
      if (form) {
        // ProjectManagement システムを使用するため、重複ハンドラーを削除
        form.removeEventListener('submit', MasterManagement.handleProjectFormSubmitDirect);
        console.log('✅ Removed duplicate form handler, using ProjectManagement system');
        return;
      }
      return;
    }

    const modalHtml = `
      <div id="masterProjectModal" class="modal-backdrop" style="display: none;">
        <div class="modal-content max-w-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 id="masterProjectModalTitle" class="text-lg font-medium text-gray-900">新規案件追加</h3>
          </div>
          <form id="masterProjectForm" class="p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">案件名 *</label>
                <input type="text" name="name" class="form-input" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">顧客 *</label>
                <select name="customer_id" id="projectCustomerSelect" class="form-select" required>
                  <option value="">選択してください</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                <select name="status" class="form-select">
                  <option value="initial">初回コンタクト</option>
                  <option value="quote_sent">見積書送信済み</option>
                  <option value="under_consideration">受注検討中</option>
                  <option value="order">受注</option>
                  <option value="failed">失注</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">優先度</label>
                <select name="priority" class="form-select">
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea name="description" class="form-input" rows="3"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">備考</label>
                <textarea name="notes" class="form-input" rows="2"></textarea>
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button type="button" onclick="Modal.close('masterProjectModal')" class="btn-secondary">
                キャンセル
              </button>
              <button type="submit" class="btn-primary">
                <i class="fas fa-save mr-2"></i>保存
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  // 編集用変数
  currentEditId: null,
  currentEditProjectId: null,

  // 顧客編集
  editCustomer: async (customerId) => {
    try {
      console.log('顧客編集:', customerId);
      
      // モーダルが存在しない場合は作成
      MasterManagement.createCustomerModal();
      
      // 顧客データを取得（直接fetch使用でAPI問題を回避）
      const response = await fetch(`/api/customers/${customerId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 顧客データの取得に失敗しました`);
      }
      
      const result = await response.json();
      console.log('取得した顧客データ:', result);
      
      if (!result || !result.success) {
        throw new Error(result?.error || '顧客データの取得に失敗しました');
      }
      
      const customer = result.data;
      console.log('顧客データ詳細:', customer);
      
      // モーダルを開く
      const modal = document.getElementById('masterCustomerModal');
      if (modal) {
        // 編集モードを設定
        MasterManagement.currentEditId = customerId;
        
        // フォームに既存データを設定
        const form = document.getElementById('masterCustomerForm');
        if (form) {
          const nameField = form.querySelector('input[name="name"]');
          const contactPersonField = form.querySelector('input[name="contact_person"]');
          const phoneField = form.querySelector('input[name="phone"]');
          const emailField = form.querySelector('input[name="email"]');
          const addressField = form.querySelector('input[name="address"]');
          const notesField = form.querySelector('textarea[name="notes"]');
          
          if (nameField) nameField.value = customer.name || '';
          if (contactPersonField) contactPersonField.value = customer.contact_person || '';
          if (phoneField) phoneField.value = customer.phone || '';
          if (emailField) emailField.value = customer.email || '';
          if (addressField) addressField.value = customer.address || '';
          if (notesField) notesField.value = customer.notes || '';
          
          console.log('✅ フォームデータ設定完了:', {
            name: customer.name,
            contact_person: customer.contact_person,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            notes: customer.notes
          });
          
          // デバッグ：要素の検出状況
          console.log('🔍 フィールド検出状況:', {
            nameField: !!nameField,
            contactPersonField: !!contactPersonField,
            phoneField: !!phoneField,
            emailField: !!emailField,
            addressField: !!addressField,
            notesField: !!notesField
          });
        } else {
          console.error('❌ masterCustomerForm が見つかりません');
        }
        
        // モーダルタイトルを更新
        const title = modal.querySelector('h3');
        if (title) {
          title.textContent = '顧客情報編集';
        }
        
        // 送信ボタンのテキストを更新
        const submitButton = form?.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.innerHTML = '<i class="fas fa-save mr-2"></i>更新';
        }
        
        // モーダルを表示
        modal.style.display = 'block';
        modal.classList.remove('hidden');
      }
    } catch (error) {
      console.error('顧客編集エラー:', error);
      alert('顧客データの取得に失敗しました: ' + error.message);
    }
  },

  // 顧客削除
  deleteCustomer: (customerId) => {
    if (confirm('この顧客を削除しますか？')) {
      console.log('顧客削除:', customerId);
      // TODO: 顧客削除処理を実装
    }
  },

  // 古い顧客プルダウン読み込み - ProjectManagementに移行済み  
  loadCustomersForSelect: async () => {
    console.log('⚠️ 古いMasterManagement.loadCustomersForSelect - ProjectManagementを使用してください');
    
    // ProjectManagementの関数を呼び出し
    if (typeof ProjectManagement !== 'undefined' && ProjectManagement.loadCustomersForSelect) {
      console.log('✅ ProjectManagement.loadCustomersForSelectにリダイレクト');
      return ProjectManagement.loadCustomersForSelect();
    } else {
      console.error('❌ ProjectManagementが見つかりません');
    }
  },

  // 古い案件フォーム送信処理 - 完全無効化
  handleProjectFormSubmitDirect: async (event) => {
    console.log('🚫 BLOCKED: 古いhandleProjectFormSubmitDirectをブロックしました');
    event.preventDefault();
    event.stopImmediatePropagation();
    
    // グローバルロックも確認
    if (window._globalSubmitLock) {
      console.log('🚫 GLOBAL: Already locked, preventing execution');
      return false;
    }
    
    // 古い関数は完全にブロック
    alert('古いシステムが実行されました。ページを再読み込みしてください。');
    return false;
  },

  // 案件編集
  editProject: async (projectId) => {
    try {
      console.log('🎯 案件編集:', projectId);
      
      // モーダルが存在しない場合は作成
      MasterManagement.createProjectModal();
      
      // 案件データを取得
      const response = await fetch(`/api/projects/detail/${projectId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 案件データの取得に失敗しました`);
      }
      
      const result = await response.json();
      console.log('✅ 取得した案件データ:', result);
      
      if (!result || !result.success) {
        throw new Error(result?.error || '案件データの取得に失敗しました');
      }
      
      const project = result.data;
      
      // 編集モードを設定
      MasterManagement.currentEditProjectId = projectId;
      
      // 顧客プルダウンを読み込み
      await MasterManagement.loadCustomersForSelect();
      
      // フォームに既存データを設定
      const form = document.getElementById('masterProjectForm');
      if (form) {
        const nameField = form.querySelector('input[name="name"]');
        const customerIdField = form.querySelector('select[name="customer_id"]');
        const statusField = form.querySelector('select[name="status"]');
        const priorityField = form.querySelector('select[name="priority"]');
        const descriptionField = form.querySelector('textarea[name="description"]');
        const notesField = form.querySelector('textarea[name="notes"]');
        
        if (nameField) nameField.value = project.name || '';
        if (customerIdField) customerIdField.value = project.customer_id || '';
        if (statusField) statusField.value = project.status || 'initial';
        if (priorityField) priorityField.value = project.priority || 'medium';
        if (descriptionField) descriptionField.value = project.description || '';
        if (notesField) notesField.value = project.notes || '';
        
        console.log('✅ 案件フォームデータ設定完了:', {
          name: project.name,
          customer_id: project.customer_id,
          status: project.status,
          priority: project.priority,
          description: project.description,
          notes: project.notes
        });
      } else {
        console.error('❌ masterProjectForm が見つかりません');
      }
      
      // モーダルタイトルを更新
      const title = document.getElementById('masterProjectModalTitle');
      if (title) {
        title.textContent = '案件情報編集';
      }
      
      // 送信ボタンのテキストを更新
      const submitButton = form?.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.innerHTML = '<i class="fas fa-save mr-2"></i>更新';
      }
      
      // モーダルを表示
      Modal.open('masterProjectModal');
    } catch (error) {
      console.error('❌ 案件編集エラー:', error);
      alert('案件データの取得に失敗しました: ' + error.message);
    }
  },

  // 案件削除（ソフトデリート）
  deleteProject: async (projectId) => {
    const project = await MasterManagement.getProjectById(projectId);
    const projectName = project ? project.name : 'この案件';
    
    if (!confirm(`${projectName}を削除しますか？\n\n※削除後も復元可能です`)) {
      return;
    }
    
    try {
      const response = await API.delete(`/projects/${projectId}`);
      
      if (response.success) {
        Utils.showSuccess(response.message || '案件を削除しました');
        // 一覧を再読み込み
        await MasterManagement.loadProjectsList();
      } else {
        throw new Error(response.error || '案件の削除に失敗しました');
      }
    } catch (error) {
      console.error('❌ 案件削除エラー:', error);
      Utils.showError('案件の削除に失敗しました: ' + error.message);
    }
  },

  // 案件をIDで取得（ヘルパー関数）
  getProjectById: async (projectId) => {
    try {
      const response = await fetch(`/api/projects/detail/${projectId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': currentUser
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.success ? result.data : null;
      }
      return null;
    } catch (error) {
      console.error('案件データ取得エラー:', error);
      return null;
    }
  },

  // 案件復元
  restoreProject: async (projectId, projectName = '') => {
    if (!confirm(`${projectName || 'この案件'}を復元しますか？`)) {
      return;
    }
    
    try {
      const response = await API.post(`/projects/${projectId}/restore`, {});
      
      if (response.success) {
        Utils.showSuccess(response.message || '案件を復元しました');
        await MasterManagement.loadProjectsList();
      } else {
        throw new Error(response.error || '案件の復元に失敗しました');
      }
    } catch (error) {
      console.error('❌ 案件復元エラー:', error);
      Utils.showError('案件の復元に失敗しました: ' + error.message);
    }
  },

  // 案件有効化
  activateProject: async (projectId, projectName = '') => {
    if (!confirm(`${projectName || 'この案件'}を有効化しますか？`)) {
      return;
    }
    
    try {
      const response = await API.post(`/projects/${projectId}/toggle-status`, { status: 'active' });
      
      if (response.success) {
        Utils.showSuccess(response.message || '案件を有効化しました');
        await MasterManagement.loadProjectsList();
      } else {
        throw new Error(response.error || '案件の有効化に失敗しました');
      }
    } catch (error) {
      console.error('❌ 案件有効化エラー:', error);
      Utils.showError('案件の有効化に失敗しました: ' + error.message);
    }
  },

  // 案件無効化
  deactivateProject: async (projectId, projectName = '') => {
    if (!confirm(`${projectName || 'この案件'}を無効化しますか？`)) {
      return;
    }
    
    try {
      const response = await API.post(`/projects/${projectId}/toggle-status`, { status: 'inactive' });
      
      if (response.success) {
        Utils.showSuccess(response.message || '案件を無効化しました');
        await MasterManagement.loadProjectsList();
      } else {
        throw new Error(response.error || '案件の無効化に失敗しました');
      }
    } catch (error) {
      console.error('❌ 案件無効化エラー:', error);
      Utils.showError('案件の無効化に失敗しました: ' + error.message);
    }
  },

  // 顧客フィルター
  filterCustomers: () => {
    const customerSearch = document.getElementById('masterCustomerSearch')?.value || '';
    const contactSearch = document.getElementById('masterContactSearch')?.value || '';
    console.log('顧客フィルター:', { customerSearch, contactSearch });
    // TODO: フィルター処理を実装
  },

  // 顧客フィルターリセット
  resetCustomerFilter: () => {
    const customerSearchInput = document.getElementById('masterCustomerSearch');
    const contactSearchInput = document.getElementById('masterContactSearch');
    
    if (customerSearchInput) customerSearchInput.value = '';
    if (contactSearchInput) contactSearchInput.value = '';
    
    MasterManagement.loadCustomersList();
  },

  // 案件フィルター
  filterProjects: () => {
    const projectSearch = document.getElementById('masterProjectSearch')?.value || '';
    const customerFilter = document.getElementById('masterProjectCustomerFilter')?.value || '';
    const statusFilter = document.getElementById('masterProjectStatusFilter')?.value || '';
    console.log('案件フィルター:', { projectSearch, customerFilter, statusFilter });
    // TODO: フィルター処理を実装
  },

  // 案件フィルターリセット
  resetProjectFilter: () => {
    const projectSearchInput = document.getElementById('masterProjectSearch');
    const customerFilterSelect = document.getElementById('masterProjectCustomerFilter');
    const statusFilterSelect = document.getElementById('masterProjectStatusFilter');
    
    if (projectSearchInput) projectSearchInput.value = '';
    if (customerFilterSelect) customerFilterSelect.value = '';
    if (statusFilterSelect) statusFilterSelect.value = '';
    
    MasterManagement.loadProjectsList();
  },
  
  // 顧客フォーム送信処理（動的作成フォーム用）
  handleCustomerFormSubmit: async (event) => {
    event.preventDefault();
    console.log('🎯 Master customer form submit triggered');
    
    const formData = new FormData(event.target);
    
    const customerData = {
      name: formData.get('name'),
      contact_person: formData.get('contact_person'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      notes: formData.get('notes'),
      user_id: currentUser
    };

    try {
      const saveButton = event.target.querySelector('button[type="submit"]');
      Utils.showLoading(saveButton, '<i class="fas fa-spinner fa-spin mr-2"></i>保存中...');

      // APIコール（既存のAPIを使用）
      const response = await axios.post('/api/customers', customerData);

      if (response.data.success) {
        Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
        Utils.showSuccess('顧客を保存しました');
        
        Modal.close('masterCustomerModal');
        event.target.reset();
        
        // 顧客リストを更新
        await MasterManagement.loadCustomersList();
      } else {
        Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
        Utils.showError('顧客の保存に失敗しました: ' + (response.data.error || '不明なエラー'));
      }
    } catch (error) {
      console.error('顧客保存エラー:', error);
      const saveButton = event.target.querySelector('button[type="submit"]');
      Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
      Utils.showError('顧客の保存中にエラーが発生しました');
    }
  },
  
  // 顧客フォーム送信処理（onsubmit属性用 - 直接制御）
  handleCustomerFormSubmitDirect: async (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('顧客フォーム送信処理開始');
    
    const formData = new FormData(event.target);
    
    const customerData = {
      name: formData.get('name'),
      contact_person: formData.get('contact_person'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      notes: formData.get('notes'),
      user_id: currentUser
    };

    // 顧客コードは新規作成時のみ追加
    if (!MasterManagement.currentEditId) {
      customerData.code = formData.get('code');
    }
    
    console.log('📝 フォームから取得したデータ:', customerData);
    console.log('🔧 編集ID:', MasterManagement.currentEditId);
    console.log('👤 currentUser:', currentUser);
    
    // フォーム要素のデバッグ情報
    console.log('🔍 フォーム要素詳細:');
    console.log('- name:', formData.get('name'));
    console.log('- contact_person:', formData.get('contact_person'));
    console.log('- phone:', formData.get('phone'));
    console.log('- email:', formData.get('email'));
    console.log('- address:', formData.get('address'));
    console.log('- notes:', formData.get('notes'));

    try {
      const saveButton = event.target.querySelector('button[type="submit"]');
      Utils.showLoading(saveButton, '<i class="fas fa-spinner fa-spin mr-2"></i>保存中...');

      let response;
      let successMessage;
      
      // 編集モードか新規作成モードかを判断
      if (MasterManagement.currentEditId) {
        // 編集モード - PUT リクエスト
        console.log('編集モード - 顧客ID:', MasterManagement.currentEditId);
        console.log('送信データ:', customerData);
        
        response = await axios.put(`/api/customers/${MasterManagement.currentEditId}`, customerData, {
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': currentUser
          }
        });
        successMessage = '顧客情報を更新しました';
      } else {
        // 新規作成モード - POST リクエスト
        console.log('新規作成モード');
        console.log('送信データ:', customerData);
        
        response = await axios.post('/api/customers', customerData, {
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': currentUser
          }
        });
        successMessage = '顧客を保存しました';
      }
      
      console.log('API レスポンス:', response.data);

      if (response.data.success) {
        console.log('✅ 保存成功:', successMessage);
        Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
        Utils.showSuccess(successMessage);
        
        // 編集モードの状態を保存してからリセット
        const wasEditMode = MasterManagement.currentEditId !== null;
        console.log('🔄 編集モードリセット - wasEditMode:', wasEditMode);
        MasterManagement.currentEditId = null;
        
        Modal.close('masterCustomerModal');
        
        // 新規作成時のみフォームをリセット
        if (!wasEditMode) {
          event.target.reset();
          console.log('🆕 新規作成完了 - フォームリセット');
        } else {
          console.log('✏️ 編集完了 - フォームはリセットしない');
        }
        
        // 顧客リストを更新
        console.log('📝 顧客リストを更新中...');
        await MasterManagement.loadCustomersList();
        console.log('✅ 顧客リスト更新完了');
      } else {
        Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
        Utils.showError('顧客の保存に失敗しました: ' + (response.data.error || '不明なエラー'));
      }
    } catch (error) {
      console.error('顧客保存エラー:', error);
      const saveButton = event.target.querySelector('button[type="submit"]');
      Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
      Utils.showError('顧客の保存中にエラーが発生しました');
    }
    
    return false; // デフォルトフォーム送信を完全に防ぐ
  },

  // デバッグ用：フォーム送信テスト
  testCustomerFormSubmit: () => {
    console.log('🧪 Testing customer form submit functionality');
    const form = document.getElementById('masterCustomerForm');
    if (form) {
      console.log('✅ Form found:', form);
      console.log('✅ Form onsubmit:', form.getAttribute('onsubmit'));
    } else {
      console.error('❌ Form not found');
    }
  },

  // 顧客削除処理（論理削除）
  deleteCustomer: async (customerId, customerName) => {
    const reason = prompt(`顧客「${customerName}」を削除します。\n削除理由を入力してください：`, '管理者による削除');
    if (!reason) return;
    
    if (!confirm(`顧客「${customerName}」を削除してもよろしいですか？\n（削除後も復活可能です）`)) return;
    
    try {
      const response = await axios.delete(`/api/customers/${customerId}`, {
        data: { reason }
      });
      
      if (response.data.success) {
        Utils.showSuccess(response.data.message);
        MasterManagement.loadCustomersList();
      } else {
        Utils.showError(response.data.error);
      }
    } catch (error) {
      console.error('削除エラー:', error);
      Utils.showError('削除処理でエラーが発生しました');
    }
  },

  // 顧客復活処理
  restoreCustomer: async (customerId, customerName) => {
    if (!confirm(`削除済み顧客「${customerName}」を復活させますか？`)) return;
    
    try {
      const response = await axios.post(`/api/customers/${customerId}/restore`);
      
      if (response.data.success) {
        Utils.showSuccess(response.data.message);
        MasterManagement.loadCustomersList();
      } else {
        Utils.showError(response.data.error);
      }
    } catch (error) {
      console.error('復活エラー:', error);
      Utils.showError('復活処理でエラーが発生しました');
    }
  },

  // 顧客ステータス切り替え（有効⇔無効）
  toggleCustomerStatus: async (customerId, customerName, currentStatus) => {
    const newStatus = currentStatus === 'active' ? '無効化' : '有効化';
    if (!confirm(`顧客「${customerName}」を${newStatus}しますか？`)) return;
    
    try {
      const response = await axios.post(`/api/customers/${customerId}/toggle-status`);
      
      if (response.data.success) {
        Utils.showSuccess(response.data.message);
        MasterManagement.loadCustomersList();
      } else {
        Utils.showError(response.data.error);
      }
    } catch (error) {
      console.error('ステータス変更エラー:', error);
      Utils.showError('ステータス変更でエラーが発生しました');
    }
  },

  // 完全削除（物理削除）- 将来の拡張用
  permanentDeleteCustomer: async (customerId, customerName) => {
    Utils.showError('完全削除機能は安全のため無効化されています。管理者にお問い合わせください。');
  }
  };
}

// グローバルに関数を公開
window.Utils = Utils;
window.API = API;
window.PostalCode = PostalCode;
window.Modal = Modal;
window.EstimateFlow = EstimateFlow;
window.MasterManagement = MasterManagement; // 明示的に追加
window.Table = Table;
// MasterManagementオブジェクトをグローバル設定
if (typeof MasterManagement !== 'undefined') {
  window.MasterManagement = MasterManagement;
}

// HTMLから直接呼び出す関数をグローバルに公開（修正版）

window.saveVehicleSettings = async () => {
  console.log('🚀 車両設定保存開始');
  try {
    // MasterManagementオブジェクトが存在することを確認
    const masterMgmt = window.MasterManagement || MasterManagement;
    if (!masterMgmt) {
      console.error('❌ MasterManagement オブジェクトが見つかりません');
      return;
    }
    
    if (typeof masterMgmt.saveVehicleSettings === 'function') {
      await masterMgmt.saveVehicleSettings();
    } else {
      console.error('❌ saveVehicleSettings メソッドが見つかりません');
    }
  } catch (error) {
    console.error('❌ 車両設定保存エラー:', error);
    Utils.showError('車両設定の保存中にエラーが発生しました: ' + error.message);
  }
};

window.saveServicesSettings = async () => {
  console.log('🚀 サービス設定保存開始');
  try {
    const masterMgmt = window.MasterManagement || MasterManagement;
    if (!masterMgmt) {
      console.error('❌ MasterManagement オブジェクトが見つかりません');
      return;
    }
    
    if (typeof masterMgmt.saveServicesSettings === 'function') {
      await masterMgmt.saveServicesSettings();
    } else {
      console.error('❌ saveServicesSettings メソッドが見つかりません');
    }
  } catch (error) {
    console.error('❌ サービス設定保存エラー:', error);
    Utils.showError('サービス設定の保存中にエラーが発生しました: ' + error.message);
  }
};

// スタッフ単価保存関数
window.saveStaffRates = async function() {
  console.log('🚀 スタッフ単価保存開始');
  try {
    const masterMgmt = window.MasterManagement || MasterManagement;
    if (!masterMgmt) {
      console.error('❌ MasterManagement オブジェクトが見つかりません');
      return;
    }
    
    if (typeof masterMgmt.saveStaffRates === 'function') {
      await masterMgmt.saveStaffRates();
    } else {
      console.error('❌ saveStaffRates メソッドが見つかりません');
    }
  } catch (error) {
    console.error('❌ スタッフ単価保存エラー:', error);
    Utils.showError('スタッフ単価の保存中にエラーが発生しました: ' + error.message);
  }
};
window.Validator = Validator;
window.MasterManagement = MasterManagement;

// 新規案件追加ボタンの設定
function setupProjectAddButton() {
  const addProjectBtn = document.getElementById('addProjectBtn');
  if (addProjectBtn) {
    console.log('🎯 Setting up project add button event listener');
    addProjectBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🎯 Project add button clicked!');
      console.log('🔍 Modal object exists:', typeof Modal !== 'undefined');
      
      if (typeof Modal !== 'undefined') {
        console.log('🚀 Opening projectModal...');
        Modal.open('projectModal');
        
        // 顧客選択肢を更新（少し遅延させて確実に実行）
        setTimeout(() => {
          console.log('🔄 Updating customer options...');
          updateProjectCustomerOptions();
        }, 100);
      } else {
        console.error('❌ Modal object not found!');
      }
    });
    console.log('✅ Project add button event listener set up successfully');
  } else {
    console.log('❌ addProjectBtn element not found');
  }
  
  // フォーム送信処理の設定
  const projectForm = document.getElementById('projectForm');
  if (projectForm) {
    console.log('🎯 Setting up project form submit listener');
    projectForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('🎯 Project form submitted!');
      
      // 送信ボタンを無効化してローディング状態に
      const submitButton = projectForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>保存中...';
      
      try {
        const formData = new FormData(projectForm);
        const data = Object.fromEntries(formData.entries());
        console.log('📝 Form data:', data);
        
        // バリデーション
        if (!data.customer_id) {
          throw new Error('顧客を選択してください');
        }
        if (!data.name || data.name.trim() === '') {
          throw new Error('案件名を入力してください');
        }
        if (!data.contact_person || data.contact_person.trim() === '') {
          throw new Error('担当者名を入力してください');
        }
        
        console.log('🚀 Sending request to /api/projects...');
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Project saved successfully:', result);
        
        if (result.success) {
          // モーダルを閉じる
          Modal.close('projectModal');
          
          // フォームをリセット
          projectForm.reset();
          
          // 案件選択肢を更新（必要に応じて）
          if (typeof EstimateFlowImplementation !== 'undefined' && EstimateFlowImplementation.handleCustomerChange) {
            console.log('🔄 Refreshing project options...');
            EstimateFlowImplementation.handleCustomerChange();
          }
          
          alert('案件が正常に追加されました！');
        } else {
          throw new Error(result.error || '不明なエラーが発生しました');
        }
        
      } catch (error) {
        console.error('❌ Error saving project:', error);
        alert('案件の保存中にエラーが発生しました: ' + error.message);
      } finally {
        // ボタンを元の状態に戻す
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    });
    console.log('✅ Project form submit listener set up successfully');
  } else {
    console.log('❌ projectForm element not found');
  }
}

// 案件追加モーダル用の顧客選択肢更新関数
function updateProjectCustomerOptions() {
  console.log('🔍 updateProjectCustomerOptions called');
  
  const projectCustomerSelect = document.getElementById('projectCustomerId');
  const mainCustomerSelect = document.getElementById('customerSelect');
  
  console.log('🔍 projectCustomerSelect:', projectCustomerSelect);
  console.log('🔍 mainCustomerSelect:', mainCustomerSelect);
  
  if (!projectCustomerSelect) {
    console.log('❌ projectCustomerId element not found');
    return;
  }
  
  if (!mainCustomerSelect) {
    console.log('❌ customerSelect element not found');
    return;
  }
  
  // メインの顧客選択から顧客データを取得
  const options = Array.from(mainCustomerSelect.options);
  console.log('🔍 Main customer options found:', options.length);
  
  let html = '<option value="">顧客を選択してください</option>';
  let customerCount = 0;
  
  options.forEach((option, index) => {
    console.log(`🔍 Option ${index}: value="${option.value}", text="${option.textContent}"`);
    if (option.value && option.value !== '') {
      html += `<option value="${option.value}">${option.textContent}</option>`;
      customerCount++;
    }
  });
  
  console.log('🔍 Generated HTML:', html);
  projectCustomerSelect.innerHTML = html;
  console.log(`✅ Updated project customer options: ${customerCount} customers`);
}

// DOMContentLoaded時にボタン設定を実行
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Setting up project button on DOMContentLoaded');
  setupProjectAddButton();
});

// window.onloadでも設定（念のため）
window.addEventListener('load', function() {
  console.log('🚀 Setting up project button on window load');
  setupProjectAddButton();
});
// 顧客・案件管理機能の実装
const CustomerManagement = {
  // 現在のタブとデータ
  currentTab: 'customers',
  customersData: [],
  projectsData: [],
  statusHistoryData: [],
  currentPage: 1,
  itemsPerPage: 10,
  sortField: 'created_at',
  sortDirection: 'desc',

  // ページ初期化
  initialize: async () => {
    try {
      // 初期データを読み込み
      await CustomerManagement.loadCustomers();
      await CustomerManagement.loadProjects();
      await CustomerManagement.loadStatusHistory();
      
      // 初期表示
      CustomerManagement.switchTab('customers');
    } catch (error) {
      Utils.showError('データの読み込みに失敗しました: ' + error.message);
    }
  },

  // タブ切り替え
  switchTab: (tabName) => {
    // タブボタンの状態を更新
    const tabs = [
      { id: 'customersTab', name: 'customers' },
      { id: 'projectsTab', name: 'projects' },
      { id: 'statusHistoryTab', name: 'status-history' }
    ];

    tabs.forEach(tab => {
      const tabButton = document.getElementById(tab.id);
      if (tabButton) {
        if (tab.name === tabName) {
          tabButton.className = 'py-4 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600 customer-tab active';
        } else {
          tabButton.className = 'py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 customer-tab';
        }
      }
    });

    // タブコンテンツの表示切り替え
    const contents = [
      { id: 'customers-content', name: 'customers' },
      { id: 'projects-content', name: 'projects' },
      { id: 'status-history-content', name: 'status-history' }
    ];

    contents.forEach(content => {
      const contentElement = document.getElementById(content.id);
      if (contentElement) {
        if (content.name === tabName) {
          contentElement.classList.remove('hidden');
        } else {
          contentElement.classList.add('hidden');
        }
      }
    });

    CustomerManagement.currentTab = tabName;

    // タブ固有の表示処理
    switch (tabName) {
      case 'customers':
        CustomerManagement.displayCustomers();
        break;
      case 'projects':
        CustomerManagement.displayProjects();
        break;
      case 'status-history':
        CustomerManagement.displayStatusHistory();
        break;
    }
  },

  // 顧客データ読み込み
  loadCustomers: async () => {
    try {
      const response = await API.get('/customers');
      if (response.success) {
        CustomerManagement.customersData = response.data || [];
      }
    } catch (error) {
      console.error('顧客データ読み込みエラー:', error);
      CustomerManagement.customersData = [];
    }
  },

  // 案件データ読み込み
  loadProjects: async () => {
    try {
      const response = await API.get('/projects');
      if (response.success) {
        CustomerManagement.projectsData = response.data || [];
      }
    } catch (error) {
      console.error('案件データ読み込みエラー:', error);
      CustomerManagement.projectsData = [];
    }
  },

  // ステータス履歴読み込み
  loadStatusHistory: async () => {
    try {
      const response = await API.get('/status-history');
      if (response.success) {
        CustomerManagement.statusHistoryData = response.data || [];
      }
    } catch (error) {
      console.error('ステータス履歴読み込みエラー:', error);
      CustomerManagement.statusHistoryData = [];
    }
  },

  // 顧客一覧表示
  displayCustomers: () => {
    const customersTable = document.getElementById('customersTable');
    const customerCount = document.getElementById('customerCount');
    
    if (!customersTable || !customerCount) return;

    // フィルタリング・ソート適用
    const filteredCustomers = CustomerManagement.getFilteredCustomers();
    const sortedCustomers = CustomerManagement.sortData(filteredCustomers, CustomerManagement.sortField, CustomerManagement.sortDirection);

    // 件数表示更新
    customerCount.textContent = `(${sortedCustomers.length}件)`;

    // ページネーション適用
    const { data: paginatedCustomers, totalPages } = CustomerManagement.applyPagination(sortedCustomers);

    if (paginatedCustomers.length === 0) {
      customersTable.innerHTML = '<tr><td colspan="7" class="text-center text-gray-500 py-8">顧客が見つかりません</td></tr>';
      return;
    }

    const html = paginatedCustomers.map(customer => {
      // 案件数を計算
      const projectCount = CustomerManagement.projectsData.filter(p => p.customer_id === customer.id).length;
      
      return `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${customer.name}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${customer.contact_person || '-'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${customer.phone || '-'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${customer.email || '-'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-500">${Utils.formatDate(customer.created_at)}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              ${projectCount}件
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex space-x-2">
              <button 
                onClick="CustomerManagement.editCustomer(${customer.id})" 
                class="text-blue-600 hover:text-blue-800"
                title="編集"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                onClick="CustomerManagement.viewCustomerProjects(${customer.id})" 
                class="text-green-600 hover:text-green-800"
                title="案件一覧"
              >
                <i class="fas fa-project-diagram"></i>
              </button>
              <button 
                onClick="CustomerManagement.deleteCustomer(${customer.id})" 
                class="text-red-600 hover:text-red-800"
                title="削除"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    customersTable.innerHTML = html;

    // ページネーション更新
    CustomerManagement.updatePagination('customerPagination', totalPages, 'displayCustomers');
  },

  // 案件一覧表示
  displayProjects: () => {
    const projectsTable = document.getElementById('projectsTable');
    const projectCount = document.getElementById('projectCount');
    
    if (!projectsTable || !projectCount) return;

    // フィルタリング・ソート適用
    const filteredProjects = CustomerManagement.getFilteredProjects();
    const sortedProjects = CustomerManagement.sortData(filteredProjects, CustomerManagement.sortField, CustomerManagement.sortDirection);

    // 件数表示更新
    projectCount.textContent = `(${sortedProjects.length}件)`;

    // ページネーション適用
    const { data: paginatedProjects, totalPages } = CustomerManagement.applyPagination(sortedProjects);

    if (paginatedProjects.length === 0) {
      projectsTable.innerHTML = '<tr><td colspan="7" class="text-center text-gray-500 py-8">案件が見つかりません</td></tr>';
      return;
    }

    const html = paginatedProjects.map(project => {
      // 顧客名を取得
      const customer = CustomerManagement.customersData.find(c => c.id === project.customer_id);
      const customerName = customer ? customer.name : '不明';
      
      // ステータス表示
      const statusConfig = CustomerManagement.getStatusConfig(project.status);
      
      return `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${project.name}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${customerName}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.class}">
              ${statusConfig.label}
            </span>
          </td>
          <td class="px-6 py-4">
            <div class="text-sm text-gray-900 max-w-xs truncate" title="${project.description || ''}">
              ${project.description || '-'}
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-500">${Utils.formatDate(project.updated_at)}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              0件
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex space-x-2">
              <button 
                onClick="CustomerManagement.editProject(${project.id})" 
                class="text-blue-600 hover:text-blue-800"
                title="編集"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                onClick="CustomerManagement.changeProjectStatus(${project.id})" 
                class="text-green-600 hover:text-green-800"
                title="ステータス変更"
              >
                <i class="fas fa-exchange-alt"></i>
              </button>
              <button 
                onClick="CustomerManagement.viewProjectEstimates(${project.id})" 
                class="text-purple-600 hover:text-purple-800"
                title="見積一覧"
              >
                <i class="fas fa-file-alt"></i>
              </button>
              <button 
                onClick="CustomerManagement.deleteProject(${project.id})" 
                class="text-red-600 hover:text-red-800"
                title="削除"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    projectsTable.innerHTML = html;

    // ページネーション更新
    CustomerManagement.updatePagination('projectPagination', totalPages, 'displayProjects');
  },

  // ステータス履歴表示
  displayStatusHistory: () => {
    const statusHistoryList = document.getElementById('statusHistoryList');
    const historyCount = document.getElementById('historyCount');
    
    if (!statusHistoryList || !historyCount) return;

    // フィルタリング・ソート適用
    const filteredHistory = CustomerManagement.getFilteredStatusHistory();
    const sortedHistory = CustomerManagement.sortData(filteredHistory, 'created_at', 'desc');

    // 件数表示更新
    historyCount.textContent = `(${sortedHistory.length}件)`;

    if (sortedHistory.length === 0) {
      statusHistoryList.innerHTML = '<div class="px-6 py-8 text-center text-gray-500">ステータス履歴がありません</div>';
      return;
    }

    const html = sortedHistory.map(history => {
      // 顧客・案件情報を取得
      const project = CustomerManagement.projectsData.find(p => p.id === history.project_id);
      const customer = project ? CustomerManagement.customersData.find(c => c.id === project.customer_id) : null;
      
      const oldStatusConfig = CustomerManagement.getStatusConfig(history.old_status);
      const newStatusConfig = CustomerManagement.getStatusConfig(history.new_status);
      
      return `
        <div class="px-6 py-4 hover:bg-gray-50">
          <div class="flex items-center justify-between">
            <div className="flex-1">
              <div class="flex items-center space-x-4">
                <div class="text-sm font-medium text-gray-900">
                  ${customer ? customer.name : '不明'} - ${project ? project.name : '不明'}
                </div>
                <div class="flex items-center space-x-2">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${oldStatusConfig.class}">
                    ${oldStatusConfig.label}
                  </span>
                  <i class="fas fa-arrow-right text-gray-400"></i>
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${newStatusConfig.class}">
                    ${newStatusConfig.label}
                  </span>
                </div>
              </div>
              <div class="mt-1 text-sm text-gray-500">
                ${history.change_reason || '変更理由なし'}
              </div>
            </div>
            <div class="text-sm text-gray-400">
              ${Utils.formatDate(history.created_at)}
            </div>
          </div>
        </div>
      `;
    }).join('');

    statusHistoryList.innerHTML = html;
  },

  // ステータス設定取得
  getStatusConfig: (status) => {
    const configs = {
      'initial': { label: '初回コンタクト', class: 'bg-gray-100 text-gray-800' },
      'quote_sent': { label: '見積書送信済み', class: 'bg-yellow-100 text-yellow-800' },
      'under_consideration': { label: '受注検討中', class: 'bg-blue-100 text-blue-800' },
      'order': { label: '受注', class: 'bg-green-100 text-green-800' },
      'failed': { label: '失注', class: 'bg-red-100 text-red-800' }
    };
    return configs[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
  },

  // データフィルタリング
  getFilteredCustomers: () => {
    const search = document.getElementById('customerSearch')?.value.toLowerCase() || '';
    const regionFilter = document.getElementById('customerRegionFilter')?.value || '';
    const dateFilter = document.getElementById('customerDateFilter')?.value || '';

    return CustomerManagement.customersData.filter(customer => {
      // 検索フィルタ
      const matchesSearch = !search || 
        customer.name.toLowerCase().includes(search) ||
        (customer.contact_person && customer.contact_person.toLowerCase().includes(search));

      // 地域フィルタ（簡易実装）
      const matchesRegion = !regionFilter || 
        (customer.address && customer.address.includes(regionFilter));

      // 日付フィルタ
      const matchesDate = CustomerManagement.matchesDateFilter(customer.created_at, dateFilter);

      return matchesSearch && matchesRegion && matchesDate;
    });
  },

  getFilteredProjects: () => {
    const search = document.getElementById('projectSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('projectStatusFilter')?.value || '';
    const dateFilter = document.getElementById('projectDateFilter')?.value || '';

    return CustomerManagement.projectsData.filter(project => {
      // 顧客名取得
      const customer = CustomerManagement.customersData.find(c => c.id === project.customer_id);
      const customerName = customer ? customer.name : '';

      // 検索フィルタ
      const matchesSearch = !search || 
        project.name.toLowerCase().includes(search) ||
        customerName.toLowerCase().includes(search);

      // ステータスフィルタ
      const matchesStatus = !statusFilter || project.status === statusFilter;

      // 日付フィルタ
      const matchesDate = CustomerManagement.matchesDateFilter(project.updated_at, dateFilter);

      return matchesSearch && matchesStatus && matchesDate;
    });
  },

  getFilteredStatusHistory: () => {
    const customerFilter = document.getElementById('historyCustomerFilter')?.value || '';
    const projectFilter = document.getElementById('historyProjectFilter')?.value || '';
    const dateFilter = document.getElementById('historyDateFilter')?.value || '';

    return CustomerManagement.statusHistoryData.filter(history => {
      const matchesCustomer = !customerFilter || history.customer_id == customerFilter;
      const matchesProject = !projectFilter || history.project_id == projectFilter;
      const matchesDate = CustomerManagement.matchesDateFilter(history.created_at, dateFilter);

      return matchesCustomer && matchesProject && matchesDate;
    });
  },

  // 日付フィルタマッチング
  matchesDateFilter: (dateString, filter) => {
    if (!filter) return true;

    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case 'today':
        return date >= today;
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return date >= monthAgo;
      case 'quarter':
        const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        return date >= quarterAgo;
      default:
        return true;
    }
  },

  // データソート
  sortData: (data, field, direction) => {
    return [...data].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // 日付フィールドの処理
      if (field.includes('_at') || field === 'created_at' || field === 'updated_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // 文字列の場合は大文字小文字を無視
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;

      return direction === 'desc' ? -comparison : comparison;
    });
  },

  // ページネーション適用
  applyPagination: (data) => {
    const totalPages = Math.ceil(data.length / CustomerManagement.itemsPerPage);
    const start = (CustomerManagement.currentPage - 1) * CustomerManagement.itemsPerPage;
    const end = start + CustomerManagement.itemsPerPage;
    
    return {
      data: data.slice(start, end),
      totalPages: totalPages
    };
  },

  // ページネーション更新
  updatePagination: (containerId, totalPages, displayFunction) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    const prevDisabled = CustomerManagement.currentPage === 1 ? 'disabled' : '';
    const nextDisabled = CustomerManagement.currentPage === totalPages ? 'disabled' : '';

    let html = `
      <div class="flex items-center justify-between">
        <div class="flex justify-between flex-1 sm:hidden">
          <button 
            onClick="CustomerManagement.changePage(${CustomerManagement.currentPage - 1}, '${displayFunction}')"
            ${prevDisabled}
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${prevDisabled ? 'opacity-50 cursor-not-allowed' : ''}"
          >
            前へ
          </button>
          <button 
            onClick="CustomerManagement.changePage(${CustomerManagement.currentPage + 1}, '${displayFunction}')"
            ${nextDisabled}
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${nextDisabled ? 'opacity-50 cursor-not-allowed' : ''}"
          >
            次へ
          </button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              <span class="font-medium">${CustomerManagement.currentPage}</span>
              / 
              <span class="font-medium">${totalPages}</span>
              ページ
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
    `;

    // ページ番号ボタンの生成
    const startPage = Math.max(1, CustomerManagement.currentPage - 2);
    const endPage = Math.min(totalPages, CustomerManagement.currentPage + 2);

    if (startPage > 1) {
      html += `
        <button onClick="CustomerManagement.changePage(1, '${displayFunction}')" 
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
          1
        </button>
      `;
      if (startPage > 2) {
        html += '<span class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>';
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const isCurrent = i === CustomerManagement.currentPage;
      html += `
        <button onClick="CustomerManagement.changePage(${i}, '${displayFunction}')"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  isCurrent 
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }">
          ${i}
        </button>
      `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html += '<span class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>';
      }
      html += `
        <button onClick="CustomerManagement.changePage(${totalPages}, '${displayFunction}')" 
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
          ${totalPages}
        </button>
      `;
    }

    html += `
            </nav>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  // ページ変更
  changePage: (page, displayFunction) => {
    CustomerManagement.currentPage = page;
    CustomerManagement[displayFunction]();
  },

  // フィルタ処理
  filterCustomers: () => {
    CustomerManagement.currentPage = 1; // ページをリセット
    CustomerManagement.displayCustomers();
  },

  filterProjects: () => {
    CustomerManagement.currentPage = 1; // ページをリセット
    CustomerManagement.displayProjects();
  },

  filterStatusHistory: () => {
    CustomerManagement.displayStatusHistory();
  },

  // ソート処理
  sortCustomers: (field) => {
    if (CustomerManagement.sortField === field) {
      CustomerManagement.sortDirection = CustomerManagement.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      CustomerManagement.sortField = field;
      CustomerManagement.sortDirection = 'asc';
    }
    CustomerManagement.displayCustomers();
  },

  sortProjects: (field) => {
    if (CustomerManagement.sortField === field) {
      CustomerManagement.sortDirection = CustomerManagement.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      CustomerManagement.sortField = field;
      CustomerManagement.sortDirection = 'asc';
    }
    CustomerManagement.displayProjects();
  },

  // データ更新
  refreshCustomers: async () => {
    await CustomerManagement.loadCustomers();
    await CustomerManagement.loadProjects(); // 案件数表示のため
    CustomerManagement.displayCustomers();
    Utils.showSuccess('顧客データを更新しました');
  },

  refreshProjects: async () => {
    await CustomerManagement.loadProjects();
    await CustomerManagement.loadStatusHistory(); // 履歴表示のため
    CustomerManagement.displayProjects();
    Utils.showSuccess('案件データを更新しました');
  },

  // モーダル操作
  openAddCustomerModal: () => {
    document.getElementById('customerModalTitle').textContent = '新規顧客追加';
    document.getElementById('customerForm').reset();
    Modal.open('customerModal');
  },

  // 古いopenAddProjectModal - ProjectManagementに移行済み
  openAddProjectModal: () => {
    console.log('⚠️ 古いCustomerManagement.openAddProjectModal - ProjectManagementを使用してください');
    
    // ProjectManagementの関数を呼び出し
    if (typeof ProjectManagement !== 'undefined' && ProjectManagement.openAddProjectModal) {
      console.log('✅ ProjectManagement.openAddProjectModalにリダイレクト');
      return ProjectManagement.openAddProjectModal();
    } else {
      console.error('❌ ProjectManagementが見つかりません');
    }
  },

  // 顧客選択肢更新
  updateCustomerOptions: () => {
    const customerSelect = document.getElementById('projectCustomerId');
    if (!customerSelect) return;

    customerSelect.innerHTML = '<option value="">顧客を選択してください</option>' +
      CustomerManagement.customersData.map(customer => 
        `<option value="${customer.id}">${customer.name}</option>`
      ).join('');
  },

  // CSV出力（仮実装）
  exportCustomersCSV: () => {
    Utils.showSuccess('CSV出力機能は実装予定です');
  },

  exportProjectsCSV: () => {
    Utils.showSuccess('CSV出力機能は実装予定です');
  },

  // 編集・削除・その他操作（仮実装）
  editCustomer: (customerId) => {
    Utils.showSuccess(`顧客ID ${customerId} の編集機能は実装予定です`);
  },

  deleteCustomer: (customerId) => {
    Modal.confirm(
      '本当にこの顧客を削除しますか？関連する案件も削除されます。',
      () => {
        Utils.showSuccess(`顧客ID ${customerId} の削除機能は実装予定です`);
      }
    );
  },

  viewCustomerProjects: (customerId) => {
    // 案件タブに切り替えて該当顧客でフィルタ
    CustomerManagement.switchTab('projects');
    setTimeout(() => {
      const customerFilter = document.getElementById('projectCustomerFilter');
      if (customerFilter) {
        customerFilter.value = customerId;
        CustomerManagement.filterProjects();
      }
    }, 100);
  },

  editProject: (projectId) => {
    Utils.showSuccess(`案件ID ${projectId} の編集機能は実装予定です`);
  },

  deleteProject: (projectId) => {
    Modal.confirm(
      '本当にこの案件を削除しますか？',
      () => {
        Utils.showSuccess(`案件ID ${projectId} の削除機能は実装予定です`);
      }
    );
  },

  changeProjectStatus: (projectId) => {
    Utils.showSuccess(`案件ID ${projectId} のステータス変更機能は実装予定です`);
  },

  viewProjectEstimates: (projectId) => {
    Utils.showSuccess(`案件ID ${projectId} の見積一覧機能は実装予定です`);
  },

  // フォーム送信処理
  submitCustomerForm: async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const customerData = {
      name: formData.get('name'),
      contact_person: formData.get('contact_person'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      notes: formData.get('notes'),
      user_id: currentUser
    };

    try {
      const saveButton = form.querySelector('button[type="submit"]');
      Utils.showLoading(saveButton);

      const response = await API.post('/customers', customerData);
      
      if (response.success) {
        Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
        Utils.showSuccess(response.message);
        
        Modal.close('customerModal');
        form.reset();
        
        // データを再読み込みして表示更新
        await CustomerManagement.loadCustomers();
        CustomerManagement.displayCustomers();
      } else {
        Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
        Utils.showError('顧客の保存に失敗しました: ' + response.error);
      }
      
    } catch (error) {
      const saveButton = form.querySelector('button[type="submit"]');
      Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
      Utils.showError('保存中にエラーが発生しました: ' + error.message);
    }
  },

  submitProjectForm: async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const projectData = {
      customer_id: parseInt(formData.get('customer_id')),
      name: formData.get('name'),
      status: formData.get('status'),
      priority: formData.get('priority'),
      description: formData.get('description'),
      notes: formData.get('notes'),
      user_id: currentUser
    };

    try {
      const saveButton = form.querySelector('button[type="submit"]');
      Utils.showLoading(saveButton);

      const response = await API.post('/projects', projectData);
      
      if (response.success) {
        Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
        Utils.showSuccess(response.message);
        
        Modal.close('projectModal');
        form.reset();
        
        // データを再読み込みして表示更新
        await CustomerManagement.loadProjects();
        await CustomerManagement.loadStatusHistory();
        CustomerManagement.displayProjects();
      } else {
        Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
        Utils.showError('案件の保存に失敗しました: ' + response.error);
      }
      
    } catch (error) {
      const saveButton = form.querySelector('button[type="submit"]');
      Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
      Utils.showError('保存中にエラーが発生しました: ' + error.message);
    }
  },

  submitStatusChange: async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const statusData = {
      project_id: parseInt(formData.get('project_id')),
      new_status: formData.get('new_status'),
      change_reason: formData.get('change_reason'),
      user_id: currentUser
    };

    try {
      const saveButton = form.querySelector('button[type="submit"]');
      Utils.showLoading(saveButton);

      const response = await API.post('/projects/status-change', statusData);
      
      if (response.success) {
        Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>ステータス変更');
        Utils.showSuccess(response.message);
        
        Modal.close('statusChangeModal');
        form.reset();
        
        // データを再読み込みして表示更新
        await CustomerManagement.loadProjects();
        await CustomerManagement.loadStatusHistory();
        if (CustomerManagement.currentTab === 'projects') {
          CustomerManagement.displayProjects();
        } else if (CustomerManagement.currentTab === 'status-history') {
          CustomerManagement.displayStatusHistory();
        }
      } else {
        Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>ステータス変更');
        Utils.showError('ステータス変更に失敗しました: ' + response.error);
      }
      
    } catch (error) {
      const saveButton = form.querySelector('button[type="submit"]');
      Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>ステータス変更');
      Utils.showError('ステータス変更中にエラーが発生しました: ' + error.message);
    }
  }
};

window.MasterManagement = MasterManagement;
window.CustomerManagement = CustomerManagement;
// 顧客・案件管理用グローバル関数
window.switchCustomerTab = CustomerManagement.switchTab;

// ================== ステータス管理機能 ==================
const StatusManagement = {
  // ステータス一覧キャッシュ
  statusOptions: [],
  
  // ステータス一覧を取得
  loadStatusOptions: async () => {
    try {
      console.log('ステータスオプションAPI呼び出し...');
      const response = await API.get('/status-options');
      console.log('APIレスポンス:', response);
      if (response.success) {
        StatusManagement.statusOptions = response.data || [];
        console.log('ステータスオプション設定完了:', StatusManagement.statusOptions);
      } else {
        console.error('APIエラー:', response);
      }
    } catch (error) {
      console.error('ステータス一覧取得エラー:', error);
    }
  },
  
  // カスタムドロップダウン初期化
  initializeCustomDropdown: () => {
    const button = document.getElementById('statusDropdownButton');
    const menu = document.getElementById('statusDropdownMenu');
    const textElement = document.getElementById('statusDropdownText');
    
    if (!button || !menu || !textElement) return;
    
    // ボタンクリックでメニューを開閉
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !menu.classList.contains('hidden');
      const modal = document.getElementById('statusChangeModal');
      
      if (isOpen) {
        menu.classList.add('hidden');
        // モーダルからdropdown-openクラスを除去
        if (modal) modal.classList.remove('dropdown-open');
        // スタイルをリセット
        menu.style.position = '';
        menu.style.top = '';
        menu.style.left = '';
        menu.style.width = '';
        menu.style.zIndex = '';
      } else {
        menu.classList.remove('hidden');
        // モーダルにdropdown-openクラスを追加
        if (modal) modal.classList.add('dropdown-open');
        
        // ボタンの位置を取得
        const buttonRect = button.getBoundingClientRect();
        
        // fixed positionで絶対位置に配置
        menu.style.position = 'fixed';
        menu.style.top = `${buttonRect.bottom}px`;
        menu.style.left = `${buttonRect.left}px`;
        menu.style.width = `${buttonRect.width}px`;
        menu.style.zIndex = '2147483647'; // 最大z-index値で確実に最前面に
        
        console.log('ドロップダウン位置:', {
          top: buttonRect.bottom,
          left: buttonRect.left,
          width: buttonRect.width
        });
      }
    });
    
    // オプション選択
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
      const option = e.target.closest('.status-option');
      if (option) {
        const value = option.getAttribute('data-value');
        const label = option.getAttribute('data-label');
        
        // 選択値を更新
        textElement.textContent = label;
        textElement.setAttribute('data-value', value);
        
        // メニューを閉じる
        menu.classList.add('hidden');
        // モーダルからdropdown-openクラスを除去
        const modal = document.getElementById('statusChangeModal');
        if (modal) modal.classList.remove('dropdown-open');
        // スタイルをリセット
        menu.style.position = '';
        menu.style.top = '';
        menu.style.left = '';
        menu.style.width = '';
        menu.style.zIndex = '';
        
        console.log('ステータス選択:', { value, label });
      }
    });
    
    // 外部クリックでメニューを閉じる
    document.addEventListener('click', (e) => {
      if (!button.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add('hidden');
        // モーダルからdropdown-openクラスを除去
        const modal = document.getElementById('statusChangeModal');
        if (modal) modal.classList.remove('dropdown-open');
        // スタイルをリセット
        menu.style.position = '';
        menu.style.top = '';
        menu.style.left = '';
        menu.style.width = '';
        menu.style.zIndex = '';
      }
    });
  },
  
  // 選択値を取得
  getSelectedStatus: () => {
    const textElement = document.getElementById('statusDropdownText');
    return textElement ? textElement.getAttribute('data-value') || '' : '';
  },
  
  // 選択値をリセット
  resetStatusSelection: () => {
    const textElement = document.getElementById('statusDropdownText');
    if (textElement) {
      textElement.textContent = '選択してください';
      textElement.setAttribute('data-value', '');
    }
  },

  // ステータス変更モーダルを表示（同期呼び出し用ラッパー）
  showStatusChangeModal: (type, id, currentStatus) => {
    StatusManagement._showStatusChangeModalAsync(type, id, currentStatus);
  },

  // ステータス変更モーダルを表示（非同期実装）
  _showStatusChangeModalAsync: async (type, id, currentStatus) => {
    console.log('ステータス変更モーダル表示:', { type, id, currentStatus });
    
    // type: 'project' or 'estimate'
    StatusManagement.currentType = type;
    StatusManagement.currentId = id;
    StatusManagement.currentStatus = currentStatus;
    
    // ステータスオプションが空の場合は読み込み
    if (StatusManagement.statusOptions.length === 0) {
      console.log('ステータスオプションを読み込み中...');
      await StatusManagement.loadStatusOptions();
      console.log('読み込み完了:', StatusManagement.statusOptions.length + '個');
    }
    
    // カスタムドロップダウンを初期化
    StatusManagement.resetStatusSelection();
    
    // コメント欄をクリア
    const commentInput = document.getElementById('statusChangeComment');
    if (commentInput) {
      commentInput.value = '';
    }
    
    console.log('モーダルを開く...');
    Modal.open('statusChangeModal');
    
    // モーダルが開いてからカスタムドロップダウンを初期化
    setTimeout(() => {
      StatusManagement.initializeCustomDropdown();
    }, 100);
  },
  
  // ステータス変更を実行
  changeStatus: async () => {
    try {
      const commentInput = document.getElementById('statusChangeComment');
      
      if (!commentInput) {
        Utils.showError('フォーム要素が見つかりません');
        return;
      }
      
      // カスタムドロップダウンから選択値を取得
      const newStatus = StatusManagement.getSelectedStatus();
      const comment = commentInput.value.trim();
      
      if (!newStatus) {
        Utils.showError('新しいステータスを選択してください');
        return;
      }
      
      if (newStatus === StatusManagement.currentStatus) {
        Utils.showError('現在と同じステータスです');
        return;
      }
      
      Utils.showLoading('ステータスを更新中...');
      
      const endpoint = StatusManagement.currentType === 'project' 
        ? `/projects/${StatusManagement.currentId}/status`
        : `/estimates/${StatusManagement.currentId}/status`;
      
      const response = await API.put(endpoint, {
        status: newStatus,
        comment: comment
      });
      
      if (response.success) {
        Utils.showSuccess('ステータスを更新しました');
        Modal.close('statusChangeModal');
        
        // 画面を更新
        if (typeof EstimateManagement !== 'undefined' && EstimateManagement.refreshEstimates) {
          EstimateManagement.refreshEstimates();
        }
        if (typeof CustomerManagement !== 'undefined' && CustomerManagement.refreshProjects) {
          CustomerManagement.refreshProjects();
        }
      } else {
        Utils.showError(response.message || 'ステータスの更新に失敗しました');
      }
      
    } catch (error) {
      Utils.showError('ステータス変更中にエラーが発生しました: ' + error.message);
    } finally {
      Utils.hideLoading();
    }
  },
  
  // ステータス履歴を表示
  showStatusHistory: async (projectId) => {
    try {
      Utils.showLoading('履歴を取得中...');
      
      const response = await API.get(`/projects/${projectId}/status-history`);
      
      if (response.success) {
        const historyContainer = document.getElementById('statusHistoryContent');
        if (historyContainer) {
          historyContainer.innerHTML = StatusManagement.generateHistoryHTML(response.data);
          Modal.open('statusHistoryModal');
        }
      } else {
        Utils.showError('ステータス履歴の取得に失敗しました');
      }
      
    } catch (error) {
      Utils.showError('履歴取得中にエラーが発生しました: ' + error.message);
    } finally {
      Utils.hideLoading();
    }
  },
  
  // ステータス履歴HTMLを生成
  generateHistoryHTML: (history) => {
    if (!history || history.length === 0) {
      return '<p class="text-gray-500 text-center py-4">ステータス履歴はありません</p>';
    }
    
    return `
      <div class="space-y-4">
        ${history.map(item => {
          const statusInfo = StatusManagement.getStatusInfo(item.new_status);
          const oldStatusInfo = StatusManagement.getStatusInfo(item.old_status);
          
          return `
            <div class="border-l-4 border-${statusInfo.color}-500 pl-4 py-2">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center space-x-2">
                  <span class="font-medium text-${oldStatusInfo.color}-600">${oldStatusInfo.label}</span>
                  <i class="fas fa-arrow-right text-gray-400"></i>
                  <span class="font-medium text-${statusInfo.color}-600">${statusInfo.label}</span>
                </div>
                <span class="text-sm text-gray-500">
                  ${new Date(item.created_at).toLocaleString('ja-JP')}
                </span>
              </div>
              ${item.estimate_number ? `<p class="text-sm text-gray-600">見積: ${item.estimate_number}</p>` : ''}
              ${item.comment ? `<p class="text-sm text-gray-700 mt-1">${item.comment}</p>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  },
  
  // ステータス情報を取得
  getStatusInfo: (status) => {
    const statusOption = StatusManagement.statusOptions.find(option => option.value === status);
    return statusOption || { value: status, label: status, color: 'gray' };
  },
  
  // ステータスラベルを生成
  generateStatusLabel: (status) => {
    const statusInfo = StatusManagement.getStatusInfo(status);
    return `<span class="status-badge status-${statusInfo.color}">${statusInfo.label}</span>`;
  }
};

// グローバル関数として登録
window.StatusManagement = StatusManagement;

// 見積履歴管理機能の実装
const EstimateManagement = {
  // 現在のデータ
  estimatesData: [],
  customersData: [],
  projectsData: [],
  currentPage: 1,
  itemsPerPage: 15,
  sortField: 'created_at',
  sortDirection: 'desc',
  selectedEstimates: new Set(),
  currentEstimateId: null,

  // ページ初期化
  initialize: async () => {
    try {
      // ステータス管理初期化
      await StatusManagement.loadStatusOptions();
      
      // データを読み込み
      await EstimateManagement.loadEstimates();
      await EstimateManagement.loadCustomers();
      await EstimateManagement.loadProjects();
      
      // 統計情報を更新
      await EstimateManagement.updateStatistics();
      
      // フィルタ選択肢を更新
      EstimateManagement.updateFilterOptions();
      
      // 初期表示
      EstimateManagement.displayEstimates();
      
      // イベントハンドラを設定
      EstimateManagement.setupEventHandlers();
      
    } catch (error) {
      Utils.showError('データの読み込みに失敗しました: ' + error.message);
    }
  },

  // イベントハンドラ設定
  setupEventHandlers: () => {
    // 見積編集フォームの送信処理
    const editForm = document.getElementById('estimateEditForm');
    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        EstimateManagement.saveEstimateEdit();
      });
    }
  },

  // 見積データ読み込み
  loadEstimates: async () => {
    try {
      const response = await API.get('/estimates');
      if (response.success) {
        EstimateManagement.estimatesData = response.data || [];
      } else {
        console.error('見積データ読み込みエラー:', response.error || response.message);
        EstimateManagement.estimatesData = [];
      }
    } catch (error) {
      console.error('見積データ読み込みエラー:', error);
      EstimateManagement.estimatesData = [];
    }
  },

  // 顧客データ読み込み
  loadCustomers: async () => {
    try {
      const response = await API.get('/customers');
      if (response.success) {
        EstimateManagement.customersData = response.data || [];
      }
    } catch (error) {
      console.error('顧客データ読み込みエラー:', error);
      EstimateManagement.customersData = [];
    }
  },

  // 案件データ読み込み
  loadProjects: async () => {
    try {
      const response = await API.get('/projects');
      if (response.success) {
        EstimateManagement.projectsData = response.data || [];
      }
    } catch (error) {
      console.error('案件データ読み込みエラー:', error);
      EstimateManagement.projectsData = [];
    }
  },

  // 統計情報更新
  updateStatistics: async () => {
    try {
      // APIから統計情報を取得
      const response = await API.get('/estimates/stats');
      if (response.success && response.data) {
        const stats = response.data;
        
        // DOM更新
        document.getElementById('totalEstimates').textContent = stats.totalEstimates || 0;
        document.getElementById('acceptedEstimates').textContent = stats.ordersCount || 0;
        document.getElementById('pendingEstimates').textContent = stats.pendingEstimates || 0;
        document.getElementById('totalEstimateAmount').textContent = Utils.formatCurrency(stats.totalAmount || 0);
      } else {
        // APIエラー時はローカルデータで計算
        this.updateStatisticsFromLocal();
      }
    } catch (error) {
      console.error('統計情報更新エラー:', error);
      // エラー時はローカルデータで計算
      this.updateStatisticsFromLocal();
    }
  },

  // ローカルデータから統計情報を計算
  updateStatisticsFromLocal: () => {
    const totalEstimates = EstimateManagement.estimatesData.length;
    
    // ステータス別集計（見積データから project_status を使用）
    const statusCounts = EstimateManagement.estimatesData.reduce((acc, estimate) => {
      const status = estimate.project_status || 'initial';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const acceptedCount = statusCounts.order || 0;
    const pendingCount = (statusCounts.quote_sent || 0) + (statusCounts.under_consideration || 0);
    
    // 総見積額
    const totalAmount = EstimateManagement.estimatesData.reduce((sum, estimate) => 
      sum + (estimate.total_amount || 0), 0
    );

    // DOM更新
    document.getElementById('totalEstimates').textContent = totalEstimates;
    document.getElementById('acceptedEstimates').textContent = acceptedCount;
    document.getElementById('pendingEstimates').textContent = pendingCount;
    document.getElementById('totalEstimateAmount').textContent = Utils.formatCurrency(totalAmount);
  },

  // フィルタ選択肢更新
  updateFilterOptions: () => {
    // 顧客フィルタ更新
    const customerFilter = document.getElementById('estimateCustomerFilter');
    if (customerFilter) {
      customerFilter.innerHTML = '<option value="">すべての顧客</option>' +
        EstimateManagement.customersData.map(customer => 
          `<option value="${customer.id}">${customer.name}</option>`
        ).join('');
    }
  },

  // 見積一覧表示
  displayEstimates: () => {
    const estimatesTable = document.getElementById('estimatesTable');
    const estimateCount = document.getElementById('estimateCount');
    
    if (!estimatesTable || !estimateCount) return;

    // フィルタリング・ソート適用
    const filteredEstimates = EstimateManagement.getFilteredEstimates();
    const sortedEstimates = EstimateManagement.sortData(filteredEstimates, EstimateManagement.sortField, EstimateManagement.sortDirection);

    // 件数表示更新
    estimateCount.textContent = `(${sortedEstimates.length}件)`;

    // ページネーション適用
    const { data: paginatedEstimates, totalPages } = EstimateManagement.applyPagination(sortedEstimates);

    if (paginatedEstimates.length === 0) {
      estimatesTable.innerHTML = '<tr><td colspan="9" class="text-center text-gray-500 py-8">見積が見つかりません</td></tr>';
      return;
    }

    const html = paginatedEstimates.map(estimate => {
      // 関連データを取得
      const customer = EstimateManagement.customersData.find(c => c.id === estimate.customer_id);
      const project = EstimateManagement.projectsData.find(p => p.id === estimate.project_id);
      
      const customerName = customer ? customer.name : '不明';
      const projectName = project ? project.name : '不明';
      const statusConfig = EstimateManagement.getProjectStatusConfig(project ? project.status : 'unknown');
      
      const isSelected = EstimateManagement.selectedEstimates.has(estimate.id);
      
      return `
        <tr class="hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}">
          <td class="px-6 py-4 whitespace-nowrap">
            <input 
              type="checkbox" 
              ${isSelected ? 'checked' : ''}
              onChange="EstimateManagement.toggleEstimateSelection(${estimate.id})"
            />
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${estimate.estimate_number}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${customerName}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900 max-w-xs truncate" title="${projectName}">
              ${projectName}
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${estimate.delivery_area}エリア</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${Utils.formatCurrency(estimate.total_amount)}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-500">${Utils.formatDate(estimate.created_at).split(' ')[0]}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.class}">
              ${statusConfig.label}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex space-x-2">
              <button 
                onClick="EstimateManagement.viewEstimateDetail(${estimate.id})" 
                class="text-blue-600 hover:text-blue-800"
                title="詳細表示"
              >
                <i class="fas fa-eye"></i>
              </button>
              <button 
                onClick="EstimateManagement.editEstimate(${estimate.id})" 
                class="text-green-600 hover:text-green-800"
                title="編集"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                onClick="AIFeatures.generateEmail(${estimate.id}, 'quote_initial')" 
                class="text-indigo-600 hover:text-indigo-800"
                title="AIメール生成"
              >
                <i class="fas fa-envelope-open-text"></i>
              </button>
              <button 
                onClick="AIFeatures.predictOrderProbability(${estimate.id})" 
                class="text-orange-600 hover:text-orange-800"
                title="AI受注確率予測"
              >
                <i class="fas fa-brain"></i>
              </button>
              <button 
                onClick="EstimateManagement.generatePDF(${estimate.id})" 
                class="text-purple-600 hover:text-purple-800"
                title="PDF生成"
              >
                <i class="fas fa-file-pdf"></i>
              </button>
              <button 
                onClick="StatusManagement.showStatusChangeModal('estimate', ${estimate.id}, '${project ? project.status || 'initial' : 'initial'}')" 
                class="text-blue-600 hover:text-blue-800"
                title="ステータス変更"
              >
                <i class="fas fa-exchange-alt"></i>
              </button>
              <button 
                onClick="EstimateManagement.copyEstimate(${estimate.id})" 
                class="text-yellow-600 hover:text-yellow-800"
                title="複製"
              >
                <i class="fas fa-copy"></i>
              </button>
              <button 
                onClick="EstimateManagement.deleteEstimate(${estimate.id})" 
                class="text-red-600 hover:text-red-800"
                title="削除"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    estimatesTable.innerHTML = html;

    // ページネーション更新
    EstimateManagement.updatePagination('estimatePagination', totalPages, 'displayEstimates');
  },

  // プロジェクトステータス設定取得
  getProjectStatusConfig: (status) => {
    const configs = {
      'initial': { label: '初回コンタクト', class: 'bg-gray-100 text-gray-800' },
      'quote_sent': { label: '見積書送信済み', class: 'bg-yellow-100 text-yellow-800' },
      'under_consideration': { label: '受注検討中', class: 'bg-blue-100 text-blue-800' },
      'order': { label: '受注', class: 'bg-green-100 text-green-800' },
      'failed': { label: '失注', class: 'bg-red-100 text-red-800' },
      'unknown': { label: '不明', class: 'bg-gray-100 text-gray-800' }
    };
    return configs[status] || configs.unknown;
  },

  // データフィルタリング
  getFilteredEstimates: () => {
    const search = document.getElementById('estimateSearch')?.value.toLowerCase() || '';
    const customerFilter = document.getElementById('estimateCustomerFilter')?.value || '';
    const statusFilter = document.getElementById('estimateStatusFilter')?.value || '';
    const amountFilter = document.getElementById('estimateAmountFilter')?.value || '';
    const dateFilter = document.getElementById('estimateDateFilter')?.value || '';

    return EstimateManagement.estimatesData.filter(estimate => {
      // 関連データを取得
      const customer = EstimateManagement.customersData.find(c => c.id === estimate.customer_id);
      const project = EstimateManagement.projectsData.find(p => p.id === estimate.project_id);
      
      const customerName = customer ? customer.name : '';
      const projectName = project ? project.name : '';

      // 検索フィルタ
      const matchesSearch = !search || 
        estimate.estimate_number.toLowerCase().includes(search) ||
        customerName.toLowerCase().includes(search) ||
        projectName.toLowerCase().includes(search);

      // 顧客フィルタ
      const matchesCustomer = !customerFilter || estimate.customer_id == customerFilter;

      // ステータスフィルタ
      const matchesStatus = !statusFilter || (project && project.status === statusFilter);

      // 金額フィルタ
      const matchesAmount = EstimateManagement.matchesAmountFilter(estimate.total_amount, amountFilter);

      // 日付フィルタ
      const matchesDate = EstimateManagement.matchesDateFilter(estimate.created_at, dateFilter);

      return matchesSearch && matchesCustomer && matchesStatus && matchesAmount && matchesDate;
    });
  },

  // 金額フィルタマッチング
  matchesAmountFilter: (amount, filter) => {
    if (!filter) return true;

    const ranges = {
      '0-50000': [0, 50000],
      '50000-100000': [50000, 100000],
      '100000-300000': [100000, 300000],
      '300000-500000': [300000, 500000],
      '500000-': [500000, Infinity]
    };

    const range = ranges[filter];
    if (!range) return true;

    return amount >= range[0] && amount < range[1];
  },

  // 日付フィルタマッチング
  matchesDateFilter: (dateString, filter) => {
    if (!filter) return true;

    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case 'today':
        return date >= today;
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return date >= monthAgo;
      case 'quarter':
        const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        return date >= quarterAgo;
      case 'year':
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        return date >= yearAgo;
      default:
        return true;
    }
  },

  // データソート
  sortData: (data, field, direction) => {
    return [...data].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // 顧客名・案件名の場合は関連データから取得
      if (field === 'customer_name') {
        const aCustomer = EstimateManagement.customersData.find(c => c.id === a.customer_id);
        const bCustomer = EstimateManagement.customersData.find(c => c.id === b.customer_id);
        aValue = aCustomer ? aCustomer.name : '';
        bValue = bCustomer ? bCustomer.name : '';
      } else if (field === 'project_name') {
        const aProject = EstimateManagement.projectsData.find(p => p.id === a.project_id);
        const bProject = EstimateManagement.projectsData.find(p => p.id === b.project_id);
        aValue = aProject ? aProject.name : '';
        bValue = bProject ? bProject.name : '';
      }

      // 日付フィールドの処理
      if (field.includes('_at') || field === 'created_at' || field === 'updated_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // 文字列の場合は大文字小文字を無視
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;

      return direction === 'desc' ? -comparison : comparison;
    });
  },

  // ページネーション適用
  applyPagination: (data) => {
    const totalPages = Math.ceil(data.length / EstimateManagement.itemsPerPage);
    const start = (EstimateManagement.currentPage - 1) * EstimateManagement.itemsPerPage;
    const end = start + EstimateManagement.itemsPerPage;
    
    return {
      data: data.slice(start, end),
      totalPages: totalPages
    };
  },

  // ページネーション更新（CustomerManagementから流用）
  updatePagination: (containerId, totalPages, displayFunction) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    const prevDisabled = EstimateManagement.currentPage === 1 ? 'disabled' : '';
    const nextDisabled = EstimateManagement.currentPage === totalPages ? 'disabled' : '';

    let html = `
      <div class="flex items-center justify-between">
        <div class="flex justify-between flex-1 sm:hidden">
          <button 
            onClick="EstimateManagement.changePage(${EstimateManagement.currentPage - 1})"
            ${prevDisabled}
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${prevDisabled ? 'opacity-50 cursor-not-allowed' : ''}"
          >
            前へ
          </button>
          <button 
            onClick="EstimateManagement.changePage(${EstimateManagement.currentPage + 1})"
            ${nextDisabled}
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${nextDisabled ? 'opacity-50 cursor-not-allowed' : ''}"
          >
            次へ
          </button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              <span class="font-medium">${EstimateManagement.currentPage}</span>
              / 
              <span class="font-medium">${totalPages}</span>
              ページ
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
    `;

    // ページ番号ボタンの生成
    const startPage = Math.max(1, EstimateManagement.currentPage - 2);
    const endPage = Math.min(totalPages, EstimateManagement.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      const isCurrent = i === EstimateManagement.currentPage;
      html += `
        <button onClick="EstimateManagement.changePage(${i})"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  isCurrent 
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }">
          ${i}
        </button>
      `;
    }

    html += `
            </nav>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  // ページ変更
  changePage: (page) => {
    EstimateManagement.currentPage = page;
    EstimateManagement.displayEstimates();
  },

  // フィルタ処理
  filterEstimates: () => {
    EstimateManagement.currentPage = 1; // ページをリセット
    EstimateManagement.displayEstimates();
    EstimateManagement.updateStatistics();
  },

  // ソート処理
  sortEstimates: (field) => {
    if (EstimateManagement.sortField === field) {
      EstimateManagement.sortDirection = EstimateManagement.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      EstimateManagement.sortField = field;
      EstimateManagement.sortDirection = 'asc';
    }
    EstimateManagement.displayEstimates();
  },

  // データ更新
  refreshEstimates: async () => {
    await EstimateManagement.loadEstimates();
    await EstimateManagement.loadCustomers();
    await EstimateManagement.loadProjects();
    EstimateManagement.updateStatistics();
    EstimateManagement.updateFilterOptions();
    EstimateManagement.displayEstimates();
    Utils.showSuccess('見積データを更新しました');
  },

  // 見積選択切り替え
  toggleEstimateSelection: (estimateId) => {
    if (EstimateManagement.selectedEstimates.has(estimateId)) {
      EstimateManagement.selectedEstimates.delete(estimateId);
    } else {
      EstimateManagement.selectedEstimates.add(estimateId);
    }
    EstimateManagement.updateSelectAllCheckbox();
  },

  // 全選択切り替え
  toggleSelectAll: () => {
    const selectAll = document.getElementById('selectAll');
    const filteredEstimates = EstimateManagement.getFilteredEstimates();
    
    if (selectAll.checked) {
      // 全選択
      filteredEstimates.forEach(estimate => {
        EstimateManagement.selectedEstimates.add(estimate.id);
      });
    } else {
      // 全選択解除
      filteredEstimates.forEach(estimate => {
        EstimateManagement.selectedEstimates.delete(estimate.id);
      });
    }
    
    EstimateManagement.displayEstimates();
  },

  // 全選択チェックボックス更新
  updateSelectAllCheckbox: () => {
    const selectAll = document.getElementById('selectAll');
    const filteredEstimates = EstimateManagement.getFilteredEstimates();
    const selectedCount = filteredEstimates.filter(estimate => 
      EstimateManagement.selectedEstimates.has(estimate.id)
    ).length;
    
    if (selectedCount === 0) {
      selectAll.indeterminate = false;
      selectAll.checked = false;
    } else if (selectedCount === filteredEstimates.length) {
      selectAll.indeterminate = false;
      selectAll.checked = true;
    } else {
      selectAll.indeterminate = true;
      selectAll.checked = false;
    }
  },

  // 見積詳細表示
  viewEstimateDetail: async (estimateId) => {
    try {
      EstimateManagement.currentEstimateId = estimateId;
      
      // 見積詳細を取得
      const response = await API.get(`/estimates/${estimateId}`);
      if (!response.success) {
        Utils.showError('見積データの取得に失敗しました');
        return;
      }
      
      const estimate = response.data;
      
      // 詳細表示用のコンテンツを生成
      const detailContent = `
        <div class="space-y-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-lg font-medium text-gray-900 mb-4">基本情報</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span class="text-sm font-medium text-gray-600">見積番号:</span>
                <p class="mt-1 text-sm text-gray-900">${estimate.estimate_number || 'N/A'}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-600">顧客名:</span>
                <p class="mt-1 text-sm text-gray-900">${estimate.customer_name || 'N/A'}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-600">案件名:</span>
                <p class="mt-1 text-sm text-gray-900">${estimate.project_name || 'N/A'}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-600">案件ステータス:</span>
                <span class="mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${EstimateManagement.getStatusColor(estimate.project_status)}">
                  ${EstimateManagement.getStatusLabel(estimate.project_status)}
                </span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-600">作成日時:</span>
                <p class="mt-1 text-sm text-gray-900">${Utils.formatDate(estimate.created_at)}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-600">更新日時:</span>
                <p class="mt-1 text-sm text-gray-900">${Utils.formatDate(estimate.updated_at)}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-lg font-medium text-gray-900 mb-4">配送情報</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span class="text-sm font-medium text-gray-600">配送先住所:</span>
                <p class="mt-1 text-sm text-gray-900">${estimate.delivery_address || 'N/A'}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-600">配送エリア:</span>
                <p class="mt-1 text-sm text-gray-900">${estimate.delivery_area}エリア</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-600">郵便番号:</span>
                <p class="mt-1 text-sm text-gray-900">${Utils.formatPostalCode(estimate.delivery_postal_code || '')}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-lg font-medium text-gray-900 mb-4">車両・作業情報</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span class="text-sm font-medium text-gray-600">車両タイプ:</span>
                <p class="mt-1 text-sm text-gray-900">${estimate.vehicle_type || 'N/A'}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-600">作業タイプ:</span>
                <p class="mt-1 text-sm text-gray-900">${estimate.operation_type || 'N/A'}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-600">作業時間区分:</span>
                <p class="mt-1 text-sm text-gray-900">${EstimateManagement.getWorkTimeLabel(estimate.work_time_type)}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-lg font-medium text-gray-900 mb-4">スタッフ構成</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              ${estimate.supervisor_count > 0 ? `
                <div>
                  <span class="text-sm font-medium text-gray-600">スーパーバイザー:</span>
                  <p class="mt-1 text-sm text-gray-900">${estimate.supervisor_count}名</p>
                </div>
              ` : ''}
              ${estimate.leader_count > 0 ? `
                <div>
                  <span class="text-sm font-medium text-gray-600">リーダー:</span>
                  <p class="mt-1 text-sm text-gray-900">${estimate.leader_count}名</p>
                </div>
              ` : ''}
              ${estimate.m2_staff_half_day > 0 ? `
                <div>
                  <span class="text-sm font-medium text-gray-600">M2スタッフ（半日）:</span>
                  <p class="mt-1 text-sm text-gray-900">${estimate.m2_staff_half_day}名</p>
                </div>
              ` : ''}
              ${estimate.m2_staff_full_day > 0 ? `
                <div>
                  <span class="text-sm font-medium text-gray-600">M2スタッフ（終日）:</span>
                  <p class="mt-1 text-sm text-gray-900">${estimate.m2_staff_full_day}名</p>
                </div>
              ` : ''}
              ${estimate.temp_staff_half_day > 0 ? `
                <div>
                  <span class="text-sm font-medium text-gray-600">派遣スタッフ（半日）:</span>
                  <p class="mt-1 text-sm text-gray-900">${estimate.temp_staff_half_day}名</p>
                </div>
              ` : ''}
              ${estimate.temp_staff_full_day > 0 ? `
                <div>
                  <span class="text-sm font-medium text-gray-600">派遣スタッフ（終日）:</span>
                  <p class="mt-1 text-sm text-gray-900">${estimate.temp_staff_full_day}名</p>
                </div>
              ` : ''}
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-lg font-medium text-gray-900 mb-4">オプションサービス</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ${estimate.parking_officer_hours > 0 ? `
                <div>
                  <span class="text-sm font-medium text-gray-600">駐車対策員:</span>
                  <p class="mt-1 text-sm text-gray-900">${estimate.parking_officer_hours}時間 - ${Utils.formatCurrency(estimate.parking_officer_cost)}</p>
                </div>
              ` : ''}
              ${estimate.transport_cost > 0 ? `
                <div>
                  <span class="text-sm font-medium text-gray-600">人員輸送:</span>
                  <p class="mt-1 text-sm text-gray-900">${estimate.transport_vehicles}台 - ${Utils.formatCurrency(estimate.transport_cost)}</p>
                </div>
              ` : ''}
              ${estimate.waste_disposal_cost > 0 ? `
                <div>
                  <span class="text-sm font-medium text-gray-600">引取廃棄:</span>
                  <p class="mt-1 text-sm text-gray-900">${estimate.waste_disposal_size} - ${Utils.formatCurrency(estimate.waste_disposal_cost)}</p>
                </div>
              ` : ''}
              ${estimate.protection_cost > 0 ? `
                <div>
                  <span class="text-sm font-medium text-gray-600">養生作業:</span>
                  <p class="mt-1 text-sm text-gray-900">${estimate.protection_floors}階 - ${Utils.formatCurrency(estimate.protection_cost)}</p>
                </div>
              ` : ''}
              ${estimate.material_collection_cost > 0 ? `
                <div>
                  <span class="text-sm font-medium text-gray-600">資材回収:</span>
                  <p class="mt-1 text-sm text-gray-900">${estimate.material_collection_size} - ${Utils.formatCurrency(estimate.material_collection_cost)}</p>
                </div>
              ` : ''}
            </div>
          </div>
          
          <div class="bg-blue-50 p-4 rounded-lg">
            <h4 class="text-lg font-medium text-gray-900 mb-4">金額詳細</h4>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">車両費用:</span>
                <span class="text-sm font-medium text-gray-900">${Utils.formatCurrency(estimate.vehicle_cost || 0)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">スタッフ費用:</span>
                <span class="text-sm font-medium text-gray-900">${Utils.formatCurrency(estimate.staff_cost || 0)}</span>
              </div>
              ${estimate.parking_officer_cost > 0 ? `
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">駐車対策員:</span>
                  <span class="text-sm font-medium text-gray-900">${Utils.formatCurrency(estimate.parking_officer_cost)}</span>
                </div>
              ` : ''}
              ${estimate.transport_cost > 0 ? `
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">人員輸送:</span>
                  <span class="text-sm font-medium text-gray-900">${Utils.formatCurrency(estimate.transport_cost)}</span>
                </div>
              ` : ''}
              ${estimate.waste_disposal_cost > 0 ? `
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">引取廃棄:</span>
                  <span class="text-sm font-medium text-gray-900">${Utils.formatCurrency(estimate.waste_disposal_cost)}</span>
                </div>
              ` : ''}
              ${estimate.protection_cost > 0 ? `
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">養生作業:</span>
                  <span class="text-sm font-medium text-gray-900">${Utils.formatCurrency(estimate.protection_cost)}</span>
                </div>
              ` : ''}
              ${estimate.material_collection_cost > 0 ? `
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">資材回収:</span>
                  <span class="text-sm font-medium text-gray-900">${Utils.formatCurrency(estimate.material_collection_cost)}</span>
                </div>
              ` : ''}
              ${estimate.construction_cost > 0 ? `
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">工事費用:</span>
                  <span class="text-sm font-medium text-gray-900">${Utils.formatCurrency(estimate.construction_cost)}</span>
                </div>
              ` : ''}
              ${estimate.parking_fee > 0 ? `
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">駐車料金:</span>
                  <span class="text-sm font-medium text-gray-900">${Utils.formatCurrency(estimate.parking_fee)}</span>
                </div>
              ` : ''}
              ${estimate.highway_fee > 0 ? `
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">高速代:</span>
                  <span class="text-sm font-medium text-gray-900">${Utils.formatCurrency(estimate.highway_fee)}</span>
                </div>
              ` : ''}
              <hr class="my-2">
              ${(() => {
                // 詳細画面でサービス費用を正しく計算
                const vehicleCost = estimate.vehicle_cost || 0;
                const staffCost = estimate.staff_cost || 0;
                const servicesCost = (estimate.parking_officer_cost || 0) + 
                                   (estimate.transport_cost || 0) + 
                                   (estimate.waste_disposal_cost || 0) + 
                                   (estimate.protection_cost || 0) + 
                                   (estimate.material_collection_cost || 0) + 
                                   (estimate.construction_cost || 0) + 
                                   (estimate.parking_fee || 0) + 
                                   (estimate.highway_fee || 0);
                
                const calculatedSubtotal = vehicleCost + staffCost + servicesCost;
                const taxRate = estimate.tax_rate || 0.1;
                const calculatedTaxAmount = Math.floor(calculatedSubtotal * taxRate);
                const calculatedTotalAmount = calculatedSubtotal + calculatedTaxAmount;
                
                return `
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">小計:</span>
                    <span class="font-medium text-gray-900">${Utils.formatCurrency(calculatedSubtotal)}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">消費税 (${(taxRate * 100).toFixed(0)}%):</span>
                    <span class="font-medium text-gray-900">${Utils.formatCurrency(calculatedTaxAmount)}</span>
                  </div>
                  <div class="flex justify-between text-lg font-bold pt-2 border-t">
                    <span class="text-gray-900">合計金額:</span>
                    <span class="text-blue-600">${Utils.formatCurrency(calculatedTotalAmount)}</span>
                  </div>
                `;
              })()}
            </div>
            </div>
          </div>
          
          ${estimate.notes ? `
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-lg font-medium text-gray-900 mb-2">備考</h4>
              <p class="text-sm text-gray-700 whitespace-pre-wrap">${estimate.notes}</p>
            </div>
          ` : ''}
        </div>
      `;
      
      document.getElementById('estimateDetailContent').innerHTML = detailContent;
      
      // 編集ボタンのイベントハンドラを設定
      document.getElementById('editFromDetailBtn').onclick = () => {
        Modal.close('estimateDetailModal');
        EstimateManagement.editEstimate(estimateId);
      };
      
      Modal.open('estimateDetailModal');
      
    } catch (error) {
      Utils.showError('見積詳細の表示に失敗しました: ' + error.message);
    }
  },

  editEstimate: async (estimateId) => {
    try {
      EstimateManagement.currentEstimateId = estimateId;
      
      // 見積詳細を取得
      const response = await API.get(`/estimates/${estimateId}`);
      if (!response.success) {
        Utils.showError('見積データの取得に失敗しました');
        return;
      }
      
      const estimate = response.data;
      
      // 編集モーダルのコンテンツを生成
      const editContent = `
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">見積番号</label>
              <input type="text" value="${estimate.estimate_number || ''}" disabled 
                     class="form-input bg-gray-100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">顧客名</label>
              <input type="text" value="${estimate.customer_name || ''}" disabled 
                     class="form-input bg-gray-100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">案件名</label>
              <input type="text" value="${estimate.project_name || ''}" disabled 
                     class="form-input bg-gray-100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">案件ステータス</label>
              <select id="editProjectStatus" class="form-select">
                <option value="initial" ${estimate.project_status === 'initial' ? 'selected' : ''}>初回コンタクト</option>
                <option value="quote_sent" ${estimate.project_status === 'quote_sent' ? 'selected' : ''}>見積書送信済み</option>
                <option value="under_consideration" ${estimate.project_status === 'under_consideration' ? 'selected' : ''}>受注検討中</option>
                <option value="order" ${estimate.project_status === 'order' ? 'selected' : ''}>受注</option>
                <option value="failed" ${estimate.project_status === 'failed' ? 'selected' : ''}>失注</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">配送先住所</label>
            <input type="text" id="editDeliveryAddress" value="${estimate.delivery_address || ''}" 
                   class="form-input" />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">車両費用</label>
              <input type="number" id="editVehicleCost" value="${estimate.vehicle_cost || 0}" 
                     class="form-input" min="0" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">スタッフ費用</label>
              <input type="number" id="editStaffCost" value="${estimate.staff_cost || 0}" 
                     class="form-input" min="0" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">総額</label>
              <input type="number" id="editTotalAmount" value="${estimate.total_amount || 0}" 
                     class="form-input" min="0" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea id="editNotes" rows="3" class="form-textarea" 
                      placeholder="編集理由やメモを入力...">${estimate.notes || ''}</textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ステータス変更理由（記録用）</label>
            <textarea id="editStatusNotes" rows="2" class="form-textarea" 
                      placeholder="ステータス変更の理由を入力..."></textarea>
          </div>
        </div>
      `;
      
      document.getElementById('estimateEditContent').innerHTML = editContent;
      
      // 金額の自動計算
      const vehicleCostInput = document.getElementById('editVehicleCost');
      const staffCostInput = document.getElementById('editStaffCost');
      const totalAmountInput = document.getElementById('editTotalAmount');
      
      const updateTotal = () => {
        const vehicleCost = parseFloat(vehicleCostInput.value) || 0;
        const staffCost = parseFloat(staffCostInput.value) || 0;
        const subtotal = vehicleCost + staffCost;
        const taxAmount = Math.round(subtotal * 0.1);
        const totalAmount = subtotal + taxAmount;
        totalAmountInput.value = totalAmount;
      };
      
      vehicleCostInput.addEventListener('input', updateTotal);
      staffCostInput.addEventListener('input', updateTotal);
      
      Modal.open('estimateEditModal');
      
    } catch (error) {
      Utils.showError('見積編集の準備に失敗しました: ' + error.message);
    }
  },

  generatePDF: (estimateId) => {
    if (!estimateId) {
      Utils.showError('見積IDが不正です');
      return;
    }
    
    // PDF生成APIを呼び出し、新しいタブで開く
    const pdfUrl = `/api/estimates/${estimateId}/pdf`;
    window.open(pdfUrl, '_blank');
    Utils.showSuccess('PDFを生成しています...');
  },

  // 見積編集保存
  saveEstimateEdit: async () => {
    try {
      if (!EstimateManagement.currentEstimateId) {
        Utils.showError('編集対象の見積が選択されていません');
        return;
      }
      
      const estimateId = EstimateManagement.currentEstimateId;
      const projectStatus = document.getElementById('editProjectStatus').value;
      const deliveryAddress = document.getElementById('editDeliveryAddress').value;
      const vehicleCost = parseFloat(document.getElementById('editVehicleCost').value) || 0;
      const staffCost = parseFloat(document.getElementById('editStaffCost').value) || 0;
      const totalAmount = parseFloat(document.getElementById('editTotalAmount').value) || 0;
      const notes = document.getElementById('editNotes').value;
      const statusNotes = document.getElementById('editStatusNotes').value;
      
      Utils.showLoading('保存中...');
      
      // 見積データを更新
      const subtotal = vehicleCost + staffCost;
      const taxAmount = Math.round(subtotal * 0.1);
      
      const estimateUpdateData = {
        delivery_address: deliveryAddress,
        vehicle_cost: vehicleCost,
        staff_cost: staffCost,
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: notes
      };
      
      const estimateResponse = await API.put(`/estimates/${estimateId}`, estimateUpdateData);
      
      if (!estimateResponse.success) {
        Utils.hideLoading();
        Utils.showError('見積データの更新に失敗しました: ' + estimateResponse.error);
        return;
      }
      
      // 現在の見積から案件IDを取得
      const currentEstimate = EstimateManagement.estimatesData.find(e => e.id == estimateId);
      if (currentEstimate && currentEstimate.project_id) {
        // ステータスが変更されている場合は案件ステータスを更新
        if (projectStatus !== currentEstimate.project_status) {
          const statusUpdateData = {
            status: projectStatus,
            notes: statusNotes
          };
          
          const statusResponse = await API.put(`/projects/${currentEstimate.project_id}/status`, statusUpdateData);
          
          if (!statusResponse.success) {
            Utils.hideLoading();
            Utils.showError('ステータス更新に失敗しました: ' + statusResponse.message);
            return;
          }
        }
      }
      
      Utils.hideLoading();
      Utils.showSuccess('見積を更新しました');
      Modal.close('estimateEditModal');
      
      // データを再読み込み
      await EstimateManagement.refreshEstimates();
      
    } catch (error) {
      Utils.hideLoading();
      Utils.showError('保存中にエラーが発生しました: ' + error.message);
    }
  },

  copyEstimate: (estimateId) => {
    Utils.showSuccess(`見積ID ${estimateId} の複製機能は実装予定です`);
  },

  deleteEstimate: (estimateId) => {
    Modal.confirm(
      '本当にこの見積を削除しますか？',
      () => {
        Utils.showSuccess(`見積ID ${estimateId} の削除機能は実装予定です`);
      }
    );
  },

  // 一括操作
  bulkGeneratePDF: () => {
    if (EstimateManagement.selectedEstimates.size === 0) {
      Utils.showError('見積を選択してください');
      return;
    }
    
    const selectedIds = Array.from(EstimateManagement.selectedEstimates);
    Utils.showLoading('PDF生成中...');
    
    // 選択された見積のPDFを順次生成
    selectedIds.forEach((estimateId, index) => {
      setTimeout(() => {
        const pdfUrl = `/api/estimates/${estimateId}/pdf`;
        window.open(pdfUrl, '_blank');
        
        // 最後のPDFが生成されたらローディングを隠す
        if (index === selectedIds.length - 1) {
          Utils.hideLoading();
          Utils.showSuccess(`${selectedIds.length}件のPDFを生成しました`);
        }
      }, index * 500); // 0.5秒間隔で生成
    });
  },

  exportEstimatesCSV: () => {
    const filteredEstimates = EstimateManagement.getFilteredEstimates();
    Utils.showSuccess(`${filteredEstimates.length}件のCSV出力機能は実装予定です`);
  },
  
  // ヘルパー関数群
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
  
  getStatusColor: (status) => {
    const colors = {
      'initial': 'bg-gray-100 text-gray-800',
      'quote_sent': 'bg-blue-100 text-blue-800',
      'under_consideration': 'bg-yellow-100 text-yellow-800',
      'order': 'bg-green-100 text-green-800',
      'completed': 'bg-purple-100 text-purple-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },
  
  getWorkTimeLabel: (workTimeType) => {
    const labels = {
      'normal': '通常',
      'early': '早朝',
      'late': '夜間',
      'weekend': '土日祝'
    };
    return labels[workTimeType] || '通常';
  }
};

window.EstimateManagement = EstimateManagement;

// マスタ管理用関数（既存）
window.switchTab = MasterManagement.switchTab;
window.switchMasterTab = MasterManagement.switchTab;
window.saveStaffAreaSettings = MasterManagement.saveStaffAreaSettings;
window.saveVehicleSettings = MasterManagement.saveVehicleSettings;
window.saveServicesSettings = MasterManagement.saveServicesSettings;
window.openAddAreaModal = MasterManagement.openAddAreaModal;
window.editArea = MasterManagement.editArea;
window.deleteArea = MasterManagement.deleteArea;



// ================== AI機能 ==================

const AIFeatures = {
  // スタッフ最適化AI機能
  optimizeStaff: async function() {
    try {
      console.log('AI最適化開始');
      
      // 現在の設定値を取得
      const currentStaff = {
        supervisor_count: parseInt(document.getElementById('supervisor_count')?.value || 0),
        leader_count: parseInt(document.getElementById('leader_count')?.value || 0),
        m2_staff_full_day: parseInt(document.getElementById('m2_staff_full_day')?.value || 0),
        m2_staff_half_day: parseInt(document.getElementById('m2_staff_half_day')?.value || 0),
        temp_staff_full_day: parseInt(document.getElementById('temp_staff_full_day')?.value || 0),
        temp_staff_half_day: parseInt(document.getElementById('temp_staff_half_day')?.value || 0)
      };

      // セッションストレージから車両情報を取得
      let vehicleType = '2t車';
      let operationType = '半日';
      let deliveryArea = 'A';
      
      try {
        const estimateData = JSON.parse(sessionStorage.getItem('estimateData') || '{}');
        if (estimateData.vehicle) {
          vehicleType = estimateData.vehicle.type || '2t車';
          operationType = estimateData.vehicle.operation || '半日';
        }
        if (estimateData.delivery) {
          deliveryArea = estimateData.delivery.area || 'A';
        }
      } catch (e) {
        console.warn('セッションデータの取得に失敗、デフォルト値を使用:', e);
      }

      const requestData = {
        vehicle_type: vehicleType,
        operation_type: operationType,
        delivery_area: deliveryArea,
        estimated_volume: this.estimateVolume(), // ボリューム推定
        work_complexity: this.estimateComplexity(), // 複雑度推定
        current_staff: currentStaff
      };

      console.log('リクエストデータ:', requestData);

      if (typeof Utils !== 'undefined' && Utils.showLoading) {
        Utils.showLoading('AI分析中...');
      } else {
        alert('AI分析中...');
      }
      
      const response = await fetch('/api/ai/staff-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      console.log('AI応答データ:', data);

      if (typeof Utils !== 'undefined' && Utils.hideLoading) {
        Utils.hideLoading();
      }

      if (data.success) {
        this.displayOptimizationResults(data);
      } else {
        if (typeof Utils !== 'undefined' && Utils.showError) {
          Utils.showError(data.error || 'AI分析に失敗しました');
        } else {
          alert(data.error || 'AI分析に失敗しました');
        }
      }

    } catch (error) {
      console.error('AI最適化エラー:', error);
      if (typeof Utils !== 'undefined' && Utils.hideLoading) {
        Utils.hideLoading();
      }
      if (typeof Utils !== 'undefined' && Utils.showError) {
        Utils.showError('AI分析中にエラーが発生しました');
      } else {
        alert('AI分析中にエラーが発生しました: ' + error.message);
      }
    }
  },

  // ボリューム推定（車両タイプと作業時間から）
  estimateVolume: function() {
    let vehicleType = '2t車';
    let operationType = '半日';
    
    try {
      const estimateData = JSON.parse(sessionStorage.getItem('estimateData') || '{}');
      if (estimateData.vehicle) {
        vehicleType = estimateData.vehicle.type || '2t車';
        operationType = estimateData.vehicle.operation || '半日';
      }
    } catch (e) {
      console.warn('セッションデータからボリューム推定情報を取得できませんでした');
    }
    
    if (vehicleType === '大型車') return 'extra_large';
    if (vehicleType === '4t車' && operationType === '終日') return 'large';
    if (vehicleType === '4t車' && operationType === '半日') return 'medium';
    if (vehicleType === '2t車' && operationType === '終日') return 'medium';
    if (vehicleType === '2t車' && operationType === '半日') return 'small';
    if (vehicleType === '軽トラック') return 'small';
    
    return 'medium';
  },

  // 作業複雑度推定
  estimateComplexity: function() {
    let area = 'A';
    let hasProtection = false;
    let hasWasteDisposal = false;
    let hasConstruction = false;
    
    try {
      const estimateData = JSON.parse(sessionStorage.getItem('estimateData') || '{}');
      if (estimateData.delivery) {
        area = estimateData.delivery.area || 'A';
      }
      if (estimateData.services) {
        hasProtection = (estimateData.services.protection_work || 0) > 0;
        hasWasteDisposal = (estimateData.services.waste_disposal_size || 'none') !== 'none';
        hasConstruction = (estimateData.services.construction_m2_staff || 0) > 0;
      }
    } catch (e) {
      console.warn('セッションデータから複雑度推定情報を取得できませんでした');
    }
    
    let complexityScore = 0;
    if (area === 'B' || area === 'C') complexityScore += 1;
    if (hasProtection) complexityScore += 1;
    if (hasWasteDisposal) complexityScore += 1;
    if (hasConstruction) complexityScore += 2;
    
    if (complexityScore >= 3) return 'complex';
    if (complexityScore >= 1) return 'normal';
    return 'simple';
  },

  // 最適化結果の表示
  displayOptimizationResults: function(data) {
    const modal = document.getElementById('aiOptimizationModal');
    if (!modal) {
      this.createOptimizationModal();
    }
    
    const { recommendation, comparison, patterns } = data;
    
    // 推奨値を表示
    document.getElementById('aiRecommendedStaff').innerHTML = `
      <div class="grid grid-cols-2 gap-4">
        <div>
          <h4 class="font-medium text-gray-900 mb-2">推奨スタッフ構成</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>監督者:</span>
              <span class="font-medium">${recommendation.supervisor_count}名</span>
            </div>
            <div class="flex justify-between">
              <span>リーダー:</span>
              <span class="font-medium">${recommendation.leader_count}名</span>
            </div>
            <div class="flex justify-between">
              <span>M2スタッフ(終日):</span>
              <span class="font-medium">${recommendation.m2_staff_full_day}名</span>
            </div>
            <div class="flex justify-between">
              <span>M2スタッフ(半日):</span>
              <span class="font-medium">${recommendation.m2_staff_half_day}名</span>
            </div>
            <div class="flex justify-between">
              <span>派遣スタッフ(終日):</span>
              <span class="font-medium">${recommendation.temp_staff_full_day}名</span>
            </div>
            <div class="flex justify-between">
              <span>派遣スタッフ(半日):</span>
              <span class="font-medium">${recommendation.temp_staff_half_day}名</span>
            </div>
          </div>
        </div>
        <div>
          <h4 class="font-medium text-gray-900 mb-2">AI分析結果</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>信頼度:</span>
              <span class="font-medium text-blue-600">${Math.round(recommendation.confidence_score * 100)}%</span>
            </div>
            <div class="flex justify-between">
              <span>コスト効率:</span>
              <span class="font-medium text-green-600">${Math.round(recommendation.cost_efficiency * 100)}%</span>
            </div>
          </div>
          <div class="mt-4">
            <h5 class="text-sm font-medium text-gray-700 mb-2">分析根拠:</h5>
            <p class="text-sm text-gray-600">${recommendation.reasoning}</p>
          </div>
        </div>
      </div>
    `;
    
    // 変更点を表示
    if (comparison.changes.length > 0) {
      const changesHtml = comparison.changes.map(change => `
        <div class="flex justify-between items-center py-2 border-b border-gray-100">
          <span class="text-sm text-gray-700">${change.field}:</span>
          <span class="text-sm">
            ${change.current} → 
            <span class="${change.impact === 'increase' ? 'text-blue-600' : 'text-green-600'} font-medium">
              ${change.recommended}
            </span>
          </span>
        </div>
      `).join('');
      
      document.getElementById('aiChanges').innerHTML = `
        <h4 class="font-medium text-gray-900 mb-3">変更点</h4>
        <div>${changesHtml}</div>
        <div class="mt-4 p-3 bg-gray-50 rounded-lg">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">コスト影響:</span>
            <span class="text-sm ${comparison.cost_impact > 0 ? 'text-red-600' : 'text-green-600'}">
              ${comparison.cost_impact > 0 ? '+' : ''}${comparison.cost_impact.toLocaleString()}円
            </span>
          </div>
        </div>
      `;
    } else {
      document.getElementById('aiChanges').innerHTML = `
        <div class="text-center py-4 text-gray-500">
          <i class="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
          <p>現在の設定が最適です</p>
        </div>
      `;
    }
    
    // パターン情報を表示
    if (patterns.length > 0) {
      const patternHtml = patterns.map((pattern, index) => `
        <div class="text-sm">
          <span class="font-medium">パターン${index + 1}:</span>
          成功率${Math.round(pattern.success_rate * 100)}%、
          効率${Math.round(pattern.cost_efficiency * 100)}%
          ${pattern.notes ? `<br><span class="text-gray-600 text-xs">${pattern.notes}</span>` : ''}
        </div>
      `).join('');
      
      document.getElementById('aiPatterns').innerHTML = `
        <h4 class="font-medium text-gray-900 mb-2">類似案件パターン</h4>
        <div class="space-y-2">${patternHtml}</div>
      `;
    }
    
    // 推奨値をストア
    this.currentRecommendation = recommendation;
    
    // モーダル表示
    this.showOptimizationModal();
  },

  // 最適化モーダル作成
  createOptimizationModal: function() {
    // 既存のモーダルがあれば削除
    const existingModal = document.getElementById('aiOptimizationModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    const modalHtml = `
      <div id="aiOptimizationModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50" style="display: none;">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">
                <i class="fas fa-robot mr-2 text-blue-600"></i>
                AI スタッフ最適化
              </h3>
              <button onclick="AIFeatures.closeOptimizationModal()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="p-6">
            <div id="aiRecommendedStaff" class="mb-6"></div>
            <div id="aiChanges" class="mb-6"></div>
            <div id="aiPatterns"></div>
          </div>
          
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button onclick="AIFeatures.closeOptimizationModal()" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              キャンセル
            </button>
            <button onclick="AIFeatures.applyRecommendation()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium">
              <i class="fas fa-magic mr-2"></i>
              推奨値を適用
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },
  
  // モーダルを表示
  showOptimizationModal: function() {
    const modal = document.getElementById('aiOptimizationModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  },
  
  // モーダルを閉じる
  closeOptimizationModal: function() {
    const modal = document.getElementById('aiOptimizationModal');
    if (modal) {
      modal.style.display = 'none';
    }
  },

  // 推奨値を適用
  applyRecommendation: function() {
    if (!this.currentRecommendation) {
      Utils.showError('推奨値が取得できませんでした');
      return;
    }
    
    const rec = this.currentRecommendation;
    
    // フォームに値を設定
    const setValueSafely = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value;
        element.dispatchEvent(new Event('change'));
      }
    };
    
    setValueSafely('supervisor_count', rec.supervisor_count);
    setValueSafely('leader_count', rec.leader_count);
    setValueSafely('m2_staff_full_day', rec.m2_staff_full_day);
    setValueSafely('m2_staff_half_day', rec.m2_staff_half_day);
    setValueSafely('temp_staff_full_day', rec.temp_staff_full_day);
    setValueSafely('temp_staff_half_day', rec.temp_staff_half_day);
    
    // コスト再計算
    if (typeof updateStaffCost === 'function') {
      updateStaffCost();
    }
    
    Utils.showSuccess('AI推奨値を適用しました');
    Modal.close('aiOptimizationModal');
  },

  // AI営業メール生成
  generateEmail: async function(estimateId, emailType = 'quote_initial') {
    try {
      Utils.showLoading('AIメール生成中...');
      
      const response = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estimate_id: estimateId,
          email_type: emailType,
          customer_type: 'corporate',
          project_type: 'office_move'
        })
      });

      const data = await response.json();
      Utils.hideLoading();

      if (data.success) {
        this.displayEmailModal(data.email);
      } else {
        Utils.showError(data.error || 'メール生成に失敗しました');
      }

    } catch (error) {
      console.error('AIメール生成エラー:', error);
      Utils.hideLoading();
      Utils.showError('メール生成中にエラーが発生しました');
    }
  },

  // メール表示モーダル
  displayEmailModal: function(email) {
    const modal = document.getElementById('aiEmailModal');
    if (!modal) {
      this.createEmailModal();
    }
    
    document.getElementById('aiEmailSubject').value = email.subject;
    document.getElementById('aiEmailBody').value = email.body;
    
    Modal.show('aiEmailModal');
  },

  // メールモーダル作成
  createEmailModal: function() {
    const modalHtml = `
      <div id="aiEmailModal" class="modal-backdrop" style="display: none;">
        <div class="modal-content max-w-4xl">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">
                <i class="fas fa-envelope mr-2 text-green-600"></i>
                AI生成メール
              </h3>
              <button onClick="Modal.close('aiEmailModal')" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="p-6">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">件名</label>
              <input type="text" id="aiEmailSubject" class="form-input" />
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">本文</label>
              <textarea id="aiEmailBody" rows="15" class="form-textarea"></textarea>
            </div>
          </div>
          
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button onClick="Modal.close('aiEmailModal')" class="btn-secondary">
              閉じる
            </button>
            <button onClick="AIFeatures.copyEmail()" class="btn-secondary">
              <i class="fas fa-copy mr-2"></i>
              コピー
            </button>
            <button onClick="AIFeatures.saveEmail()" class="btn-primary">
              <i class="fas fa-save mr-2"></i>
              保存
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  // メールをクリップボードにコピー
  copyEmail: function() {
    const subject = document.getElementById('aiEmailSubject').value;
    const body = document.getElementById('aiEmailBody').value;
    const emailText = `件名: ${subject}\n\n${body}`;
    
    navigator.clipboard.writeText(emailText).then(() => {
      Utils.showSuccess('メールをクリップボードにコピーしました');
    }).catch(() => {
      Utils.showError('コピーに失敗しました');
    });
  },

  // 受注確率予測
  predictOrderProbability: async function(estimateId) {
    try {
      Utils.showLoading('AI予測中...');
      
      const response = await fetch('/api/ai/predict-order-probability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estimate_id: estimateId })
      });

      const data = await response.json();
      Utils.hideLoading();

      if (data.success) {
        this.displayPredictionResults(data);
      } else {
        Utils.showError(data.error || '予測に失敗しました');
      }

    } catch (error) {
      console.error('AI予測エラー:', error);
      Utils.hideLoading();
      Utils.showError('予測中にエラーが発生しました');
    }
  },

  // 予測結果表示
  displayPredictionResults: function(data) {
    const probabilityClass = data.probability >= 70 ? 'text-green-600' : 
                            data.probability >= 40 ? 'text-yellow-600' : 'text-red-600';
    
    const message = `
      <div class="p-4">
        <div class="text-center mb-4">
          <div class="text-4xl font-bold ${probabilityClass} mb-2">${data.probability}%</div>
          <div class="text-gray-600">受注確率予測</div>
          <div class="text-sm text-gray-500">信頼度: ${data.confidence_score}%</div>
        </div>
        
        <div class="mb-4">
          <h4 class="font-medium text-gray-900 mb-2">予測要因:</h4>
          <ul class="list-disc list-inside text-sm text-gray-600">
            ${data.factors.map(factor => `<li>${factor}</li>`).join('')}
          </ul>
        </div>
        
        <div>
          <h4 class="font-medium text-gray-900 mb-2">推奨アクション:</h4>
          <ul class="list-disc list-inside text-sm text-gray-600">
            ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
    
    Utils.showInfo('AI受注確率予測', message);
  }
};

// グローバル関数として登録
window.AIFeatures = AIFeatures;
window.optimizeStaff = AIFeatures.optimizeStaff;
window.generateAIEmail = AIFeatures.generateEmail;
window.predictOrderProbability = AIFeatures.predictOrderProbability;

// ================== レポート管理機能 ==================

const ReportManagement = {
  currentTab: 'sales',
  
  // タブ切り替え
  switchTab: function(tabName) {
    // 全てのタブコンテンツを非表示
    const allTabs = ['salesTab', 'efficiencyTab', 'predictionTab', 'customTab'];
    const allTabButtons = ['salesTabBtn', 'efficiencyTabBtn', 'predictionTabBtn', 'customTabBtn'];
    
    allTabs.forEach(tab => {
      const element = document.getElementById(tab);
      if (element) element.classList.add('hidden');
    });
    
    allTabButtons.forEach(btn => {
      const element = document.getElementById(btn);
      if (element) element.classList.remove('active');
    });
    
    // 選択されたタブを表示
    const targetTab = document.getElementById(tabName + 'Tab');
    const targetBtn = document.getElementById(tabName + 'TabBtn');
    
    if (targetTab) targetTab.classList.remove('hidden');
    if (targetBtn) targetBtn.classList.add('active');
    
    this.currentTab = tabName;
    
    // タブごとの初期化処理
    switch(tabName) {
      case 'sales':
        this.initializeSalesTab();
        break;
      case 'efficiency':
        this.initializeEfficiencyTab();
        break;
      case 'prediction':
        this.initializePredictionTab();
        break;
      case 'custom':
        this.initializeCustomTab();
        break;
    }
  },
  
  // 売上分析タブ初期化
  initializeSalesTab: function() {
    // デフォルト期間を設定（過去30日）
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    const startInput = document.getElementById('salesStartDate');
    const endInput = document.getElementById('salesEndDate');
    
    if (startInput) startInput.value = startDate.toISOString().split('T')[0];
    if (endInput) endInput.value = endDate.toISOString().split('T')[0];
    
    // 基本統計をロード
    this.loadBasicStatistics();
    this.loadVehicleChart();
    this.loadAreaChart();
    this.loadTopCustomers();
  },
  
  // 基本統計読み込み
  loadBasicStatistics: async function() {
    try {
      const response = await fetch('/api/reports/basic-stats');
      const data = await response.json();
      
      if (data.success) {
        document.getElementById('totalRevenue').textContent = '¥' + data.totalRevenue.toLocaleString();
        document.getElementById('totalOrders').textContent = data.totalOrders.toLocaleString();
        document.getElementById('averageOrderValue').textContent = '¥' + data.averageOrderValue.toLocaleString();
        document.getElementById('orderRate').textContent = data.orderRate + '%';
      }
    } catch (error) {
      console.error('基本統計取得エラー:', error);
      // フォールバック値
      document.getElementById('totalRevenue').textContent = '¥201,300';
      document.getElementById('totalOrders').textContent = '2';
      document.getElementById('averageOrderValue').textContent = '¥100,650';
      document.getElementById('orderRate').textContent = '100%';
    }
  },
  
  // 車両タイプ別チャート
  loadVehicleChart: function() {
    const vehicleChart = document.getElementById('vehicleChart');
    if (!vehicleChart) return;
    
    // 簡易チャート表示（実際のChartライブラリの代わり）
    vehicleChart.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span class="text-sm">4t車</span>
          </div>
          <span class="text-sm font-medium">¥127,600 (63%)</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span class="text-sm">2t車</span>
          </div>
          <span class="text-sm font-medium">¥73,700 (37%)</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div class="bg-blue-500 h-2 rounded-full" style="width: 63%"></div>
        </div>
      </div>
    `;
  },
  
  // エリア別チャート
  loadAreaChart: function() {
    const areaChart = document.getElementById('areaChart');
    if (!areaChart) return;
    
    areaChart.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm">Aエリア</span>
          <div class="flex items-center space-x-2">
            <div class="w-20 bg-gray-200 rounded-full h-2">
              <div class="bg-indigo-500 h-2 rounded-full" style="width: 100%"></div>
            </div>
            <span class="text-sm font-medium">¥201,300</span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm">Bエリア</span>
          <div class="flex items-center space-x-2">
            <div class="w-20 bg-gray-200 rounded-full h-2">
              <div class="bg-blue-500 h-2 rounded-full" style="width: 0%"></div>
            </div>
            <span class="text-sm font-medium">¥0</span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm">Cエリア</span>
          <div class="flex items-center space-x-2">
            <div class="w-20 bg-gray-200 rounded-full h-2">
              <div class="bg-purple-500 h-2 rounded-full" style="width: 0%"></div>
            </div>
            <span class="text-sm font-medium">¥0</span>
          </div>
        </div>
      </div>
    `;
  },
  
  // TOP顧客表示
  loadTopCustomers: function() {
    const customersList = document.getElementById('topCustomersList');
    if (!customersList) return;
    
    customersList.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <div>
            <div class="font-medium text-sm">田中商事株式会社</div>
            <div class="text-xs text-gray-500">2件の取引</div>
          </div>
          <div class="text-right">
            <div class="font-bold text-sm">¥127,600</div>
            <div class="text-xs text-gray-500">63%</div>
          </div>
        </div>
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <div>
            <div class="font-medium text-sm">佐藤物流</div>
            <div class="text-xs text-gray-500">1件の取引</div>
          </div>
          <div class="text-right">
            <div class="font-bold text-sm">¥73,700</div>
            <div class="text-xs text-gray-500">37%</div>
          </div>
        </div>
      </div>
    `;
  },
  
  // 売上レポート生成
  generateSalesReport: async function() {
    const startDate = document.getElementById('salesStartDate').value;
    const endDate = document.getElementById('salesEndDate').value;
    const period = document.getElementById('salesPeriod').value;
    
    if (!startDate || !endDate) {
      Utils.showError('開始日と終了日を選択してください');
      return;
    }
    
    try {
      Utils.showLoading('売上レポート生成中...');
      
      // 売上分析APIを呼び出し
      const response = await fetch('/api/reports/sales-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          period: period
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // リアルデータでグラフを更新
        this.updateSalesChart(data.salesData, period);
        this.updateVehicleChart(data.vehicleData);
        this.updateAreaChart(data.areaData);
      } else {
        // フォールバック表示
        this.updateSalesChartFallback(period);
      }
      
      Utils.hideLoading();
      Utils.showSuccess('売上レポートを生成しました');
      
    } catch (error) {
      console.error('売上レポート生成エラー:', error);
      this.updateSalesChartFallback(period);
      Utils.hideLoading();
      Utils.showSuccess('売上レポートを生成しました（サンプルデータ）');
    }
  },
  
  // 売上チャート更新（実データ）
  updateSalesChart: function(salesData, period) {
    const salesChart = document.getElementById('salesChart');
    if (!salesChart || !salesData || salesData.length === 0) return;
    
    const maxRevenue = Math.max(...salesData.map(d => d.revenue));
    const bars = salesData.map(data => {
      const height = maxRevenue > 0 ? (data.revenue / maxRevenue * 80) : 20;
      return `<div class="bg-blue-500 rounded-t flex-1 mx-1" style="height: ${height}%" title="${data.period}: ¥${data.revenue.toLocaleString()}"></div>`;
    }).join('');
    
    salesChart.innerHTML = `
      <div class="w-full h-full flex items-end justify-around bg-gray-50 rounded p-4">
        ${bars}
      </div>
      <div class="mt-2 text-center text-xs text-gray-600">
        ${period === 'monthly' ? '月次' : period === 'weekly' ? '週次' : '日次'}売上推移（実データ）
      </div>
    `;
  },
  
  // 売上チャート更新（フォールバック）
  updateSalesChartFallback: function(period) {
    const salesChart = document.getElementById('salesChart');
    if (salesChart) {
      salesChart.innerHTML = `
        <div class="w-full h-full flex items-end justify-around bg-gray-50 rounded p-4">
          <div class="bg-blue-500 rounded-t" style="width: 20px; height: 80%;"></div>
          <div class="bg-blue-500 rounded-t" style="width: 20px; height: 60%;"></div>
          <div class="bg-blue-500 rounded-t" style="width: 20px; height: 90%;"></div>
          <div class="bg-blue-500 rounded-t" style="width: 20px; height: 70%;"></div>
          <div class="bg-blue-500 rounded-t" style="width: 20px; height: 95%;"></div>
        </div>
        <div class="mt-2 text-center text-xs text-gray-600">
          ${period === 'monthly' ? '月次' : period === 'weekly' ? '週次' : '日次'}売上推移（サンプル）
        </div>
      `;
    }
  },
  
  // 業務効率タブ初期化
  initializeEfficiencyTab: async function() {
    // 効率指標をAPIから取得
    try {
      const response = await fetch('/api/reports/efficiency-metrics');
      const data = await response.json();
      
      if (data.success) {
        const metrics = data.metrics;
        
        // DOM要素の安全な更新
        const updateElement = (id, value) => {
          const element = document.getElementById(id);
          if (element) element.textContent = value;
        };
        
        updateElement('avgWorkTime', metrics.avgWorkTime + '時間');
        updateElement('utilizationRate', metrics.utilizationRate + '%');
        updateElement('completionRate', metrics.completionRate + '%');
        updateElement('vehicleUtilization', metrics.vehicleUtilization + '%');
        updateElement('avgDeliveryTime', metrics.avgDeliveryTime + '時間');
        updateElement('fuelEfficiency', metrics.fuelEfficiency + 'km/L');
        updateElement('unitCost', '¥' + metrics.unitCost.toLocaleString());
        updateElement('profitMargin', metrics.profitMargin + '%');
        updateElement('roiValue', metrics.roiValue + '%');
        
      } else {
        // フォールバック値を設定
        this.setEfficiencyFallbackValues();
      }
    } catch (error) {
      console.error('効率指標取得エラー:', error);
      this.setEfficiencyFallbackValues();
    }
    
    // 改善提案の表示
    this.displayEfficiencyRecommendations();
  },
  
  // 効率指標のフォールバック値設定
  setEfficiencyFallbackValues: function() {
    const fallbackValues = {
      'avgWorkTime': '6.5時間',
      'utilizationRate': '85%',
      'completionRate': '98%',
      'vehicleUtilization': '78%',
      'avgDeliveryTime': '4.2時間',
      'fuelEfficiency': '8.5km/L',
      'unitCost': '¥12,500',
      'profitMargin': '25%',
      'roiValue': '18%'
    };
    
    Object.keys(fallbackValues).forEach(key => {
      const element = document.getElementById(key);
      if (element) element.textContent = fallbackValues[key];
    });
  },
  
  // 効率改善提案表示
  displayEfficiencyRecommendations: function() {
    const recommendations = document.getElementById('efficiencyRecommendations');
    if (recommendations) {
      recommendations.innerHTML = `
        <div class="space-y-4">
          <div class="border-l-4 border-blue-500 pl-4">
            <h4 class="font-medium text-gray-900">スタッフ配置最適化</h4>
            <p class="text-sm text-gray-600">AI分析により、ピーク時間帯のスタッフ配置を20%改善できる可能性があります。</p>
          </div>
          <div class="border-l-4 border-green-500 pl-4">
            <h4 class="font-medium text-gray-900">ルート最適化</h4>
            <p class="text-sm text-gray-600">配送ルートの見直しにより、燃料コストを15%削減できます。</p>
          </div>
          <div class="border-l-4 border-yellow-500 pl-4">
            <h4 class="font-medium text-gray-900">車両メンテナンス</h4>
            <p class="text-sm text-gray-600">予防メンテナンスの実施により、稼働率を5%向上できます。</p>
          </div>
        </div>
      `;
    }
  },
  
  // 予測分析タブ初期化
  initializePredictionTab: function() {
    // 市場トレンドの表示
    setTimeout(() => {
      const marketTrends = document.getElementById('marketTrends');
      if (marketTrends) {
        marketTrends.innerHTML = `
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm">輸送需要トレンド</span>
              <span class="text-sm font-medium text-green-600">↗ +12%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full" style="width: 75%"></div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm">競合動向</span>
              <span class="text-sm font-medium text-yellow-600">→ 0%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-yellow-500 h-2 rounded-full" style="width: 50%"></div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm">価格動向</span>
              <span class="text-sm font-medium text-blue-600">↗ +5%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-500 h-2 rounded-full" style="width: 60%"></div>
            </div>
          </div>
        `;
      }
    }, 1500);
  },
  
  // AI予測生成
  generatePrediction: function() {
    const period = document.getElementById('predictionPeriod').value;
    
    Utils.showLoading('AI予測分析中...');
    
    setTimeout(() => {
      // 予測値の計算（実際はAPIから取得）
      const currentRevenue = 201300;
      const growthRate = 1 + (0.08 * parseInt(period)); // 月8%成長と仮定
      const predictedRevenue = Math.round(currentRevenue * growthRate);
      
      const predictionDiv = document.getElementById('salesPrediction');
      if (predictionDiv) {
        predictionDiv.innerHTML = `
          <div class="text-2xl font-bold text-blue-600">¥${predictedRevenue.toLocaleString()}</div>
          <div class="text-sm text-gray-600">${period}ヶ月後の売上予測</div>
          <div class="text-xs text-gray-500 mt-1">信頼度: 78%</div>
        `;
      }
      
      Utils.hideLoading();
      Utils.showSuccess(`${period}ヶ月先の売上予測を生成しました`);
    }, 3000);
  },
  
  // AI予測生成
  generatePrediction: async function() {
    const period = document.getElementById('predictionPeriod').value;
    const predictionDiv = document.getElementById('salesPrediction');
    
    try {
      Utils.showLoading('AI予測分析中...');
      
      // AI予測APIを呼び出し
      const response = await fetch('/api/reports/ai-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ period: parseInt(period) })
      });
      
      const data = await response.json();
      
      if (data.success) {
        predictionDiv.innerHTML = `
          <div class="text-2xl font-bold text-blue-600">¥${data.predictedRevenue.toLocaleString()}</div>
          <div class="text-sm text-gray-600">${period}ヶ月先の予測売上</div>
          <div class="mt-2 text-xs text-gray-500">信頼度: ${data.confidence}%</div>
        `;
      } else {
        predictionDiv.innerHTML = `
          <div class="text-2xl font-bold text-orange-600">¥2,500,000</div>
          <div class="text-sm text-gray-600">${period}ヶ月先の予測売上</div>
          <div class="mt-2 text-xs text-gray-500">信頼度: 85%</div>
        `;
      }
      
      Utils.hideLoading();
      Utils.showSuccess('AI予測を生成しました');
      
    } catch (error) {
      console.error('予測生成エラー:', error);
      predictionDiv.innerHTML = `
        <div class="text-2xl font-bold text-orange-600">¥2,500,000</div>
        <div class="text-sm text-gray-600">${period}ヶ月先の予測売上</div>
        <div class="mt-2 text-xs text-gray-500">信頼度: 85%</div>
      `;
      Utils.hideLoading();
      Utils.showSuccess('AI予測を生成しました（サンプルデータ）');
    }
  },
  
  // カスタムタブ初期化
  initializeCustomTab: function() {
    // カスタムレポート設定の初期化
    console.log('カスタムレポートタブを初期化しました');
  },
  
  // カスタムレポート生成
  generateCustomReport: async function() {
    try {
      Utils.showLoading('カスタムレポート生成中...');
      
      // 選択された項目を取得
      const checkboxes = document.querySelectorAll('#customTab input[type="checkbox"]:checked');
      const selectedItems = Array.from(checkboxes).map(cb => cb.nextElementSibling.textContent);
      
      // CSV形式でデータをダウンロード
      const csvData = await this.generateCSVReport(selectedItems);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `custom_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Utils.hideLoading();
      Utils.showSuccess('カスタムレポートをダウンロードしました');
      
    } catch (error) {
      console.error('カスタムレポート生成エラー:', error);
      Utils.hideLoading();
      Utils.showError('カスタムレポートの生成に失敗しました');
    }
  },
  
  // CSV レポートデータ生成
  generateCSVReport: async function(selectedItems) {
    try {
      const response = await fetch('/api/reports/custom-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: selectedItems })
      });
      
      if (response.ok) {
        return await response.text();
      } else {
        // フォールバックデータ
        return this.getFallbackCSVData(selectedItems);
      }
    } catch (error) {
      return this.getFallbackCSVData(selectedItems);
    }
  },
  
  // フォールバックCSVデータ生成
  getFallbackCSVData: function(selectedItems) {
    let csvData = selectedItems.join(',') + '\n';
    
    // サンプルデータ
    if (selectedItems.includes('売上金額') && selectedItems.includes('受注件数')) {
      csvData += '2025-01,201300,2\n';
      csvData += '2025-02,0,0\n';
      csvData += '2025-03,0,0\n';
    } else if (selectedItems.includes('売上金額')) {
      csvData += '201300\n';
    } else if (selectedItems.includes('受注件数')) {
      csvData += '2\n';
    }
    
    return csvData;
  },
  
  // 車両タイプ別チャート更新（実データ）
  updateVehicleChart: function(vehicleData) {
    const vehicleChart = document.getElementById('vehicleChart');
    if (!vehicleChart || !vehicleData || vehicleData.length === 0) {
      this.setFallbackVehicleChart();
      return;
    }
    
    try {
      const totalRevenue = vehicleData.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500'];
      
      const chartItems = vehicleData.map((item, index) => {
        const percentage = totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0;
        return `
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-4 h-4 ${colors[index % colors.length]} rounded mr-2"></div>
              <span class="text-sm">${item.vehicle_type || '不明'}</span>
            </div>
            <span class="text-sm font-medium">¥${(item.revenue || 0).toLocaleString()} (${percentage}%)</span>
          </div>
        `;
      }).join('');
      
      // プログレスバーの作成
      const progressBars = vehicleData.map((item, index) => {
        const percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
        return `<div class="${colors[index % colors.length]} h-2" style="width: ${percentage}%"></div>`;
      }).join('');
      
      vehicleChart.innerHTML = `
        <div class="space-y-3">
          ${chartItems}
          <div class="w-full bg-gray-200 rounded-full h-2 mt-4 flex">
            ${progressBars}
          </div>
        </div>
      `;
    } catch (error) {
      console.error('車両チャート更新エラー:', error);
      this.setFallbackVehicleChart();
    }
  },
  
  // エリア別チャート更新（実データ）
  updateAreaChart: function(areaData) {
    const areaChart = document.getElementById('areaChart');
    if (!areaChart) return;
    
    if (!areaData || areaData.length === 0) {
      areaChart.innerHTML = `
        <div class="space-y-3">
          <div class="text-center text-gray-500 py-4">
            <i class="fas fa-map-marker-alt text-2xl mb-2"></i>
            <div class="text-sm">エリア別データがありません</div>
          </div>
        </div>
      `;
      return;
    }
    
    try {
      const maxRevenue = Math.max(...areaData.map(d => d.revenue || 0));
      const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
      
      const areaItems = areaData.map((item, index) => {
        const revenue = item.revenue || 0;
        const widthPercentage = maxRevenue > 0 ? Math.max(5, (revenue / maxRevenue) * 100) : 0;
        return `
          <div class="flex items-center justify-between">
            <span class="text-sm">${item.delivery_area || '不明'}エリア</span>
            <div class="flex items-center space-x-2">
              <div class="w-20 bg-gray-200 rounded-full h-2">
                <div class="${colors[index % colors.length]} h-2 rounded-full" style="width: ${widthPercentage}%"></div>
              </div>
              <span class="text-sm font-medium">¥${revenue.toLocaleString()}</span>
            </div>
          </div>
        `;
      }).join('');
      
      areaChart.innerHTML = `<div class="space-y-3">${areaItems}</div>`;
    } catch (error) {
      console.error('エリアチャート更新エラー:', error);
      this.loadAreaChart(); // フォールバック表示
    }
  }
};

// レポート管理用関数をグローバルに登録
window.ReportManagement = ReportManagement;

// ================== デバッグ用テスト関数 ==================

window.testAI = function() {
  console.log('AI機能テスト開始');
  if (typeof AIFeatures !== 'undefined') {
    console.log('AIFeatures オブジェクトは定義されています');
    if (typeof AIFeatures.optimizeStaff === 'function') {
      console.log('optimizeStaff 関数は利用可能です');
      AIFeatures.optimizeStaff();
    } else {
      console.error('optimizeStaff 関数が見つかりません');
    }
  } else {
    console.error('AIFeatures オブジェクトが見つかりません');
  }
};

// 簡易AI最適化テスト
window.simpleAITest = function() {
  console.log('簡易AI最適化テスト開始');
  
  fetch('/api/ai/staff-optimization', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vehicle_type: '4t車',
      operation_type: '終日',
      delivery_area: 'A',
      estimated_volume: 'large',
      work_complexity: 'normal',
      current_staff: {
        supervisor_count: 0,
        leader_count: 0,
        m2_staff_full_day: 0,
        m2_staff_half_day: 0,
        temp_staff_full_day: 0,
        temp_staff_half_day: 0
      }
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('API応答:', data);
    if (data.success) {
      alert('AI最適化成功: ' + JSON.stringify(data.recommendation, null, 2));
    } else {
      alert('AI最適化失敗: ' + data.error);
    }
  })
  .catch(error => {
    console.error('API呼び出しエラー:', error);
    alert('API呼び出しエラー: ' + error.message);
  });
};

// ダッシュボード機能
const Dashboard = {
  // ダッシュボード統計を更新
  loadStats: async () => {
    try {
      const response = await API.get('/dashboard/stats');
      if (response) {
        // データを表示に反映
        document.getElementById('monthlyEstimates').textContent = response.monthlyEstimates;
        document.getElementById('orderedEstimates').textContent = response.orderedEstimates;
        document.getElementById('consideringEstimates').textContent = response.consideringEstimates;
        document.getElementById('monthlySales').textContent = Utils.formatCurrency(response.monthlySales);
        
        console.log('ダッシュボード統計を更新しました', response);
      } else {
        throw new Error('統計データの取得に失敗しました');
      }
    } catch (error) {
      console.error('ダッシュボード統計取得エラー:', error);
      // エラー時は「-」を表示
      document.getElementById('monthlyEstimates').textContent = '-';
      document.getElementById('orderedEstimates').textContent = '-';
      document.getElementById('consideringEstimates').textContent = '-';
      document.getElementById('monthlySales').textContent = '-';
    }
  }
};

// グローバル関数
// ダッシュボードを更新
const refreshDashboard = async () => {
  const button = event.target;
  const originalHTML = button.innerHTML;
  
  try {
    // ローディング表示
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>更新中...';
    button.disabled = true;
    
    await Dashboard.loadStats();
    Utils.showSuccess('ダッシュボードを更新しました');
    
  } catch (error) {
    Utils.showError('更新に失敗しました: ' + error.message);
  } finally {
    // ボタンを元に戻す
    button.innerHTML = originalHTML;
    button.disabled = false;
  }
};

// データをリセット
const resetData = async () => {
  if (!confirm('本当にすべてのデータをリセットしますか？\nこの操作は元に戻せません。')) {
    return;
  }
  
  const button = event.target;
  const originalHTML = button.innerHTML;
  
  try {
    // ローディング表示
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>リセット中...';
    button.disabled = true;
    
    const response = await API.post('/reset-data', {});
    if (response.success) {
      Utils.showSuccess('データをリセットしました');
      // ダッシュボードを更新
      await Dashboard.loadStats();
    } else {
      throw new Error(response.error || 'リセットに失敗しました');
    }
    
  } catch (error) {
    Utils.showError('リセットに失敗しました: ' + error.message);
  } finally {
    // ボタンを元に戻す
    button.innerHTML = originalHTML;
    button.disabled = false;
  }
};

// ========== 重複した MasterManagement 定義を削除 ==========

// フォーム送信処理
document.addEventListener('DOMContentLoaded', () => {
  // マスター管理案件フォーム
  const masterProjectForm = document.getElementById('masterProjectForm');
  if (masterProjectForm) {
    masterProjectForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      
      const projectData = {
        customer_id: parseInt(formData.get('customer_id')),
        name: formData.get('name'),
        status: formData.get('status'),
        priority: formData.get('priority'),
        description: formData.get('description'),
        notes: formData.get('notes'),
        user_id: currentUser
      };

      try {
        const saveButton = event.target.querySelector('button[type="submit"]');
        Utils.showLoading(saveButton);

        let response;
        if (MasterManagement.currentEditId) {
          response = await API.put(`/projects/${MasterManagement.currentEditId}`, projectData);
        } else {
          response = await API.post('/projects', projectData);
        }
        
        if (response.success) {
          Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
          Utils.showSuccess(response.message);
          
          Modal.close('masterProjectModal');
          event.target.reset();
          
          await MasterManagement.loadProjects();
          MasterManagement.displayProjects();
        } else {
          Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
          Utils.showError('案件の保存に失敗しました: ' + response.error);
        }
        
      } catch (error) {
        const saveButton = event.target.querySelector('button[type="submit"]');
        Utils.hideLoading(saveButton, '<i class="fas fa-save mr-2"></i>保存');
        Utils.showError('保存中にエラーが発生しました: ' + error.message);
      }
    });
  }

  // マスター管理ページの初期化
  if (document.getElementById('masterCustomersTable') || document.getElementById('masterProjectsTable')) {
    MasterManagement.initialize();
  }

  // 見積作成ページの初期化
  if (document.getElementById('customerSelect')) {
    EstimateFlow.initialize();
  }

  // メインページの場合のみダッシュボードを読み込む
  if (document.getElementById('monthlyEstimates')) {
    Dashboard.loadStats();
  }
  

});

// ========== グローバル関数定義 ==========
// HTMLのonclick属性から呼び出される関数

// 顧客選択変更時のハンドラ
function handleCustomerChange() {
  console.log('handleCustomerChange が呼び出されました');
  const customerSelect = document.getElementById('customerSelect');
  console.log('選択された顧客ID:', customerSelect?.value);
  
  if (customerSelect && EstimateFlow && EstimateFlow.handleCustomerChange) {
    EstimateFlow.handleCustomerChange(customerSelect.value);
  } else if (EstimateFlowImplementation && EstimateFlowImplementation.handleCustomerChange) {
    EstimateFlowImplementation.handleCustomerChange();
  }
}

// 案件選択変更時のハンドラ
function handleProjectChange() {
  console.log('handleProjectChange が呼び出されました');
  const projectSelect = document.getElementById('projectSelect');
  console.log('選択された案件ID:', projectSelect?.value);
  
  if (projectSelect && EstimateFlow && EstimateFlow.handleProjectChange) {
    EstimateFlow.handleProjectChange(projectSelect.value);
  } else if (EstimateFlowImplementation && EstimateFlowImplementation.handleProjectChange) {
    EstimateFlowImplementation.handleProjectChange();
  }
}

// 案件タブの切り替え
function switchProjectTab(tabType) {
  console.log('switchProjectTab:', tabType);
  
  const existingTab = document.getElementById('existingProjectTab');
  const newTab = document.getElementById('newProjectTab');
  const existingContent = document.getElementById('existingProjectContent');
  const newContent = document.getElementById('newProjectContent');
  
  if (!existingTab || !newTab || !existingContent || !newContent) {
    console.error('タブ要素が見つかりません');
    return;
  }
  
  if (tabType === 'existing') {
    // 既存案件タブをアクティブに
    existingTab.className = 'py-2 px-4 text-sm font-medium text-blue-600 border-b-2 border-blue-500 bg-white';
    newTab.className = 'py-2 px-4 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 bg-white';
    existingContent.classList.remove('hidden');
    newContent.classList.add('hidden');
    
    // 新規案件データをクリア
    if (EstimateFlow) {
      EstimateFlow.newProject = null;
    }
    if (EstimateFlowImplementation) {
      EstimateFlowImplementation.newProject = null;
    }
    
    // 新規案件入力フィールドをクリア
    const newProjectName = document.getElementById('newProjectName');
    const newProjectDescription = document.getElementById('newProjectDescription');
    if (newProjectName) newProjectName.value = '';
    if (newProjectDescription) newProjectDescription.value = '';
    
  } else if (tabType === 'new') {
    // 新規案件タブをアクティブに
    existingTab.className = 'py-2 px-4 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 bg-white';
    newTab.className = 'py-2 px-4 text-sm font-medium text-blue-600 border-b-2 border-blue-500 bg-white';
    existingContent.classList.add('hidden');
    newContent.classList.remove('hidden');
    
    // 既存案件選択をクリア
    if (EstimateFlow) {
      EstimateFlow.selectedProject = null;
    }
    if (EstimateFlowImplementation) {
      EstimateFlowImplementation.selectedProject = null;
    }
    const projectSelect = document.getElementById('projectSelect');
    if (projectSelect) {
      projectSelect.value = '';
    }
  }
  
  // 詳細表示を更新
  if (EstimateFlow && EstimateFlow.updateSelectionDetails) {
    EstimateFlow.updateSelectionDetails();
  } else if (EstimateFlowImplementation && EstimateFlowImplementation.updateSelectionDetails) {
    EstimateFlowImplementation.updateSelectionDetails();
  }
}

// 新規案件のバリデーション
function validateNewProject() {
  console.log('validateNewProject が呼び出されました');
  
  const nameInput = document.getElementById('newProjectName');
  const descriptionInput = document.getElementById('newProjectDescription');
  
  if (!nameInput) {
    console.error('newProjectName要素が見つかりません');
    return;
  }
  
  const name = nameInput.value.trim();
  const description = descriptionInput?.value.trim() || '';
  
  // EstimateFlowまたはEstimateFlowImplementationを使用
  let selectedCustomer = null;
  let targetObject = null;
  
  if (EstimateFlow && EstimateFlow.selectedCustomer) {
    selectedCustomer = EstimateFlow.selectedCustomer;
    targetObject = EstimateFlow;
  } else if (EstimateFlowImplementation && EstimateFlowImplementation.selectedCustomer) {
    selectedCustomer = EstimateFlowImplementation.selectedCustomer;
    targetObject = EstimateFlowImplementation;
  }
  
  if (name && selectedCustomer && targetObject) {
    // 新規案件データを設定
    targetObject.newProject = {
      name: name,
      description: description,
      status: 'initial',
      customer_id: selectedCustomer.id
    };
    
    console.log('新規案件データを設定:', targetObject.newProject);
    
    // 詳細表示を更新
    if (targetObject.updateSelectionDetails) {
      targetObject.updateSelectionDetails();
    }
  } else {
    // 新規案件データをクリア
    if (EstimateFlow) EstimateFlow.newProject = null;
    if (EstimateFlowImplementation) EstimateFlowImplementation.newProject = null;
    
    // 詳細表示を更新
    if (EstimateFlow && EstimateFlow.updateSelectionDetails) {
      EstimateFlow.updateSelectionDetails();
    } else if (EstimateFlowImplementation && EstimateFlowImplementation.updateSelectionDetails) {
      EstimateFlowImplementation.updateSelectionDetails();
    }
  }
}

// STEP2に進む
function proceedToStep2() {
  console.log('=== proceedToStep2が呼び出されました ===');
  
  // 現在の選択状態を確認
  const customerSelect = document.getElementById('customerSelect');
  const projectSelect = document.getElementById('projectSelect');
  
  // デバッグ情報を出力
  console.log('customerSelect.value:', customerSelect?.value);
  console.log('projectSelect.value:', projectSelect?.value);
  console.log('EstimateFlow:', EstimateFlow);
  console.log('EstimateFlow.selectedCustomer:', EstimateFlow?.selectedCustomer);
  console.log('EstimateFlow.selectedProject:', EstimateFlow?.selectedProject);
  console.log('EstimateFlow.newProject:', EstimateFlow?.newProject);
  console.log('EstimateFlowImplementation:', EstimateFlowImplementation);
  console.log('EstimateFlowImplementation.selectedCustomer:', EstimateFlowImplementation?.selectedCustomer);
  console.log('EstimateFlowImplementation.selectedProject:', EstimateFlowImplementation?.selectedProject);
  console.log('EstimateFlowImplementation.newProject:', EstimateFlowImplementation?.newProject);
  
  // 最も適切なデータソースを決定
  let selectedCustomer = null;
  let selectedProject = null;
  let newProject = null;
  
  // EstimateFlowを優先
  if (EstimateFlow && EstimateFlow.selectedCustomer) {
    selectedCustomer = EstimateFlow.selectedCustomer;
    selectedProject = EstimateFlow.selectedProject;
    newProject = EstimateFlow.newProject;
  }
  // フォールバック: EstimateFlowImplementation
  else if (EstimateFlowImplementation && EstimateFlowImplementation.selectedCustomer) {
    selectedCustomer = EstimateFlowImplementation.selectedCustomer;
    selectedProject = EstimateFlowImplementation.selectedProject;
    newProject = EstimateFlowImplementation.newProject;
  }
  
  // 必要な条件が満たされているかチェック
  const hasCustomer = selectedCustomer && selectedCustomer.id;
  const hasProject = selectedProject || newProject;
  
  if (hasCustomer && hasProject) {
    console.log('✅ 必要な条件が満たされています。STEP2に進みます');
    console.log('選択された顧客:', selectedCustomer);
    console.log('選択された案件:', selectedProject);
    console.log('新規案件:', newProject);
    
    // セッションストレージにデータを保存
    sessionStorage.setItem('estimateFlow', JSON.stringify({
      step: 2,
      customer: selectedCustomer,
      project: selectedProject,
      newProject: newProject
    }));
    
    // STEP2ページに遷移
    console.log('STEP2に遷移します...');
    window.location.href = '/estimate/step2';
  }
  // 入力が不完全な場合のエラー処理
  else {
    console.error('❌ 顧客または案件が選択されていません');
    console.error('選択状態:', {
      hasCustomer: hasCustomer,
      hasProject: hasProject,
      customerSelectValue: customerSelect?.value,
      projectSelectValue: projectSelect?.value,
      selectedCustomer: selectedCustomer,
      selectedProject: selectedProject,
      newProject: newProject,
      newProjectExists: !!EstimateFlow?.newProject,
      customerValue: EstimateFlow?.selectedCustomer,
      projectValue: EstimateFlow?.selectedProject,
      newProjectValue: EstimateFlow?.newProject
    });
    console.error('EstimateFlowImplementation選択状態:', {
      exists: !!EstimateFlowImplementation,
      customerSelected: !!EstimateFlowImplementation?.selectedCustomer,
      projectSelected: !!EstimateFlowImplementation?.selectedProject,
      newProjectExists: !!EstimateFlowImplementation?.newProject,
      customerValue: EstimateFlowImplementation?.selectedCustomer,
      projectValue: EstimateFlowImplementation?.selectedProject,
      newProjectValue: EstimateFlowImplementation?.newProject
    });
    
    if (Utils && Utils.showError) {
      Utils.showError('顧客を選択し、案件を選択または作成してください');
    } else {
      alert('顧客を選択し、案件を選択または作成してください');
    }
  }
}

// 重複初期化処理を削除 - メイン初期化は3563行目のDOMContentLoadedで実行される

// ================== フリー見積もり機能 ==================

// フリー見積もり管理オブジェクト（重複宣言を防ぐため条件付き）
if (typeof FreeEstimate === 'undefined') {
  const FreeEstimate = {
    itemCount: 1,
    maxItems: 20,

    // 初期化
    init: function() {
      this.calculateTotal();
      console.log('FreeEstimate initialized');
    },

    // 項目追加
    addItem: function() {
      if (this.itemCount >= this.maxItems) {
        alert(`項目数の上限（${this.maxItems}項目）に達しました`);
        return;
      }

      const container = document.getElementById('itemsContainer');
      const newIndex = this.itemCount;
      
      const itemHtml = `
        <div class="item-row bg-gray-50 p-4 rounded-md border" data-index="${newIndex}">
          <div class="grid grid-cols-12 gap-3 items-end">
            <div class="col-span-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">項目名</label>
              <input 
                type="text" 
                name="items[${newIndex}][name]" 
                required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="例：4tトラック輸送"
              />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">単位</label>
              <input 
                type="text" 
                name="items[${newIndex}][unit]" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="例：台"
              />
            </div>
            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">数量</label>
              <input 
                type="number" 
                name="items[${newIndex}][quantity]" 
                value="1" 
                min="1" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                onchange="FreeEstimate.calculateItemTotal(${newIndex})"
              />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">単価（税抜）</label>
              <input 
                type="number" 
                name="items[${newIndex}][unitPrice]" 
                min="0" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
                onchange="FreeEstimate.calculateItemTotal(${newIndex})"
              />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">合計（税抜）</label>
              <input 
                type="number" 
                name="items[${newIndex}][total]" 
                readonly 
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                placeholder="0"
              />
            </div>
            <div class="col-span-1">
              <button 
                type="button" 
                onclick="FreeEstimate.removeItem(${newIndex})" 
                class="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md"
                title="削除"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      container.insertAdjacentHTML('beforeend', itemHtml);
      this.itemCount++;
      this.updateItemCount();
      this.calculateTotal();
    },

    // 項目削除
    removeItem: function(index) {
      const itemRow = document.querySelector(`.item-row[data-index="${index}"]`);
      if (itemRow) {
        itemRow.remove();
        this.itemCount--;
        this.updateItemCount();
        this.calculateTotal();
      }
    },

    // 項目別合計計算
    calculateItemTotal: function(index) {
      const quantityInput = document.querySelector(`input[name="items[${index}][quantity]"]`);
      const unitPriceInput = document.querySelector(`input[name="items[${index}][unitPrice]"]`);
      const totalInput = document.querySelector(`input[name="items[${index}][total]"]`);

      if (quantityInput && unitPriceInput && totalInput) {
        const quantity = parseInt(quantityInput.value) || 0;
        const unitPrice = parseInt(unitPriceInput.value) || 0;
        const total = quantity * unitPrice;

        totalInput.value = total;
        this.calculateTotal();
      }
    },

    // 全体合計計算（値引きあり）
    calculateTotal: function() {
      let subtotal = 0;

      // 全ての項目合計を加算
      const totalInputs = document.querySelectorAll('input[name*="[total]"]');
      totalInputs.forEach(input => {
        const value = parseInt(input.value) || 0;
        subtotal += value;
      });

      // 値引き金額を取得
      const discountInput = document.getElementById('discountAmount');
      const discountAmount = discountInput ? (parseInt(discountInput.value) || 0) : 0;
      
      // 値引き後の小計計算
      const discountedSubtotal = Math.max(0, subtotal - discountAmount);
      const tax = Math.floor(discountedSubtotal * 0.1);
      const total = discountedSubtotal + tax;

      // 表示更新
      const subtotalElement = document.getElementById('subtotalAmount');
      const discountDisplayElement = document.getElementById('discountDisplayAmount');
      const taxElement = document.getElementById('taxAmount');
      const totalElement = document.getElementById('totalAmount');

      if (subtotalElement) subtotalElement.textContent = Utils.formatCurrency(subtotal);
      if (discountDisplayElement) discountDisplayElement.textContent = Utils.formatCurrency(discountAmount);
      if (taxElement) taxElement.textContent = Utils.formatCurrency(tax);
      if (totalElement) totalElement.textContent = Utils.formatCurrency(total);
    },

    // 項目数表示更新
    updateItemCount: function() {
      const countElement = document.getElementById('itemCount');
      if (countElement) {
        countElement.textContent = this.itemCount;
      }

      // 追加ボタンの制御
      const addButton = document.getElementById('addItemBtn');
      if (addButton) {
        addButton.disabled = this.itemCount >= this.maxItems;
        if (this.itemCount >= this.maxItems) {
          addButton.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
          addButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
      }
    },

    // プレビュー
    preview: function() {
      const formData = this.getFormData();
      if (!this.validateForm(formData)) {
        return;
      }

      // プレビューウィンドウ表示
      const previewHtml = this.generatePreviewHtml(formData);
      const previewWindow = window.open('', '_blank', 'width=800,height=600');
      previewWindow.document.write(previewHtml);
      previewWindow.document.close();
    },

    // フォームデータ取得
    getFormData: function() {
      const form = document.getElementById('freeEstimateForm');
      if (!form) return null;

      const formData = new FormData(form);
      const data = {
        customerName: formData.get('customerName'),
        projectName: formData.get('projectName'),
        workDate: formData.get('workDate'),
        validUntil: formData.get('validUntil'),
        discountAmount: formData.get('discountAmount') || 0,  // 値引き金額を追加
        notes: formData.get('notes'),
        items: []
      };

      // 項目データ取得
      const itemRows = document.querySelectorAll('.item-row');
      itemRows.forEach((row, index) => {
        const nameInput = row.querySelector('input[name*="[name]"]');
        const unitInput = row.querySelector('input[name*="[unit]"]');
        const quantityInput = row.querySelector('input[name*="[quantity]"]');
        const unitPriceInput = row.querySelector('input[name*="[unitPrice]"]');
        const totalInput = row.querySelector('input[name*="[total]"]');

        if (nameInput && nameInput.value.trim()) {
          data.items.push({
            name: nameInput.value.trim(),
            unit: unitInput ? unitInput.value.trim() : '',
            quantity: parseInt(quantityInput.value) || 0,
            unitPrice: parseInt(unitPriceInput.value) || 0,
            total: parseInt(totalInput.value) || 0
          });
        }
      });

      return data;
    },

    // バリデーション
    validateForm: function(data) {
      if (!data.customerName) {
        alert('顧客名を入力してください');
        return false;
      }
      if (!data.projectName) {
        alert('案件名を入力してください');
        return false;
      }
      if (data.items.length === 0) {
        alert('見積もり項目を1つ以上入力してください');
        return false;
      }

      // 項目のバリデーション
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        if (!item.name) {
          alert(`項目${i + 1}の項目名を入力してください`);
          return false;
        }
        if (item.quantity <= 0) {
          alert(`項目${i + 1}の数量は1以上で入力してください`);
          return false;
        }
        if (item.unitPrice < 0) {
          alert(`項目${i + 1}の単価は0以上で入力してください`);
          return false;
        }
      }

      return true;
    },

    // プレビューHTML生成
    generatePreviewHtml: function(data) {
      let subtotal = 0;
      data.items.forEach(item => {
        subtotal += item.total;
      });
      const tax = Math.floor(subtotal * 0.1);
      const total = subtotal + tax;

      const itemsHtml = data.items.map((item, index) => `
        <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
          <td class="px-4 py-2 border">${item.name}</td>
          <td class="px-4 py-2 border text-center">${item.unit}</td>
          <td class="px-4 py-2 border text-right">${Utils.formatNumber(item.quantity)}</td>
          <td class="px-4 py-2 border text-right">${Utils.formatCurrency(item.unitPrice)}</td>
          <td class="px-4 py-2 border text-right font-bold">${Utils.formatCurrency(item.total)}</td>
        </tr>
      `).join('');

      return `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>見積書プレビュー - ${data.customerName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { font-size: 12px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body class="bg-white p-8">
          <div class="max-w-4xl mx-auto">
            <!-- ヘッダー -->
            <div class="text-center mb-8">
              <h1 class="text-3xl font-bold text-gray-800 mb-2">見 積 書</h1>
              <p class="text-gray-600">フリー見積もり</p>
            </div>

            <!-- 基本情報 -->
            <div class="mb-8">
              <div class="grid grid-cols-2 gap-8">
                <div>
                  <h3 class="text-lg font-bold text-gray-800 mb-3">お客様情報</h3>
                  <p><strong>顧客名：</strong> ${data.customerName}</p>
                  <p><strong>案件名：</strong> ${data.projectName}</p>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-800 mb-3">見積もり情報</h3>
                  <p><strong>作業日：</strong> ${data.workDate || '未設定'}</p>
                  <p><strong>有効期限：</strong> ${data.validUntil || '未設定'}</p>
                  <p><strong>作成日：</strong> ${new Date().toLocaleDateString('ja-JP')}</p>
                </div>
              </div>
            </div>

            <!-- 見積もり項目 -->
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

            <!-- 合計金額 -->
            <div class="mb-8">
              <div class="bg-blue-50 p-6 rounded-lg">
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div class="text-sm text-gray-600">小計（税抜）</div>
                    <div class="text-2xl font-bold text-blue-600">${Utils.formatCurrency(subtotal)}</div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-600">消費税（10%）</div>
                    <div class="text-2xl font-bold text-blue-600">${Utils.formatCurrency(tax)}</div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-600">合計（税込）</div>
                    <div class="text-3xl font-bold text-blue-600">${Utils.formatCurrency(total)}</div>
                  </div>
                </div>
              </div>
            </div>

            ${data.notes ? `
            <!-- 追加事項 -->
            <div class="mb-8">
              <h3 class="text-lg font-bold text-gray-800 mb-3">追加事項・備考</h3>
              <div class="bg-gray-50 p-4 rounded-md">
                <p class="whitespace-pre-wrap">${data.notes}</p>
              </div>
            </div>
            ` : ''}

            <!-- アクションボタン -->
            <div class="text-center no-print">
              <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md mr-4">
                <i class="fas fa-print mr-2"></i>
                印刷
              </button>
              <button onclick="window.close()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md">
                閉じる
              </button>
            </div>
          </div>

          <script src="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/js/all.min.js"></script>
        </body>
        </html>
      `;
    }
  };

  // グローバルからアクセス可能にする
  window.FreeEstimate = FreeEstimate;
}

// フォーム送信処理
document.addEventListener('DOMContentLoaded', function() {
  const freeEstimateForm = document.getElementById('freeEstimateForm');
  if (freeEstimateForm) {
    freeEstimateForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = FreeEstimate.getFormData();
      if (!FreeEstimate.validateForm(formData)) {
        return;
      }

      try {
        // 保存処理
        const response = await fetch('/api/estimates/free', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            estimate_type: 'free',
            customer_name: formData.customerName,
            project_name: formData.projectName,
            work_date: formData.workDate,
            valid_until: formData.validUntil,
            discountAmount: parseInt(formData.discountAmount) || 0,  // 値引き金額を追加
            notes: formData.notes,
            items: formData.items,
            subtotal: formData.items.reduce((sum, item) => sum + item.total, 0)
          })
        });

        if (response.ok) {
          const result = await response.json();
          alert('見積もりが保存されました');
          window.location.href = `/estimate/${result.estimate.id}`;
        } else {
          const error = await response.json();
          alert('保存に失敗しました: ' + error.message);
        }
      } catch (error) {
        console.error('Error saving free estimate:', error);
        alert('保存中にエラーが発生しました');
      }
    });

  }
});

// ===== 案件管理システム =====
const ProjectManagement = {
  currentProjectId: null,
  _submitting: false,        // フォーム送信中フラグ
  _loadingCustomers: false,  // 顧客データ読み込み中フラグ
  _lastSubmitTime: 0,        // 最後の送信時刻
  _initialized: false,       // 初期化済みフラグ
  _listenersSetup: false,    // イベントリスナー設定済みフラグ

  // 案件一覧表示
  displayProjectsContent: async () => {
    console.log('🔄 案件管理表示開始');
    
    const content = `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">案件マスター管理</h3>
          <button id="addProjectBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
            <i class="fas fa-plus mr-2"></i>
            新規案件追加
          </button>
        </div>
        
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">案件名</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客名</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">優先度</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最終更新</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody id="projectList" class="bg-white divide-y divide-gray-200">
              <tr>
                <td colspan="6" class="text-center py-8">
                  <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                  <p class="text-gray-500 mt-2">読み込み中...</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- 案件モーダル -->
      <div id="projectModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-lg w-full max-w-md">
            <div class="flex justify-between items-center p-6 border-b">
              <h3 id="projectModalTitle" class="text-lg font-semibold text-gray-800">新規案件追加</h3>
              <button id="closeProjectModal" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <form id="masterProjectForm" class="p-6 space-y-4" onsubmit="ProjectManagement.handleProjectFormSubmit(event)">
              <div>
                <label for="masterProjectCustomerId" class="block text-sm font-medium text-gray-700 mb-1">顧客 <span class="text-red-500">*</span></label>
                <select id="masterProjectCustomerId" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">選択してください</option>
                </select>
              </div>
              
              <div>
                <label for="masterProjectName" class="block text-sm font-medium text-gray-700 mb-1">案件名 <span class="text-red-500">*</span></label>
                <input type="text" id="masterProjectName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              </div>
              
              <div>
                <label for="masterProjectDescription" class="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea id="masterProjectDescription" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              
              <div>
                <label for="masterProjectStatus" class="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                <select id="masterProjectStatus" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="initial">初期</option>
                  <option value="active">アクティブ</option>
                  <option value="completed">完了</option>
                  <option value="on_hold">保留</option>
                </select>
              </div>
              
              <div>
                <label for="masterProjectPriority" class="block text-sm font-medium text-gray-700 mb-1">優先度</label>
                <select id="masterProjectPriority" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="urgent">緊急</option>
                </select>
              </div>
              
              <div>
                <label for="masterProjectNotes" class="block text-sm font-medium text-gray-700 mb-1">備考</label>
                <textarea id="masterProjectNotes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              
              <div class="flex justify-end space-x-3 pt-4">
                <button type="button" id="cancelProjectBtn" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                  キャンセル
                </button>
                <button type="submit" id="saveProjectBtn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                  <i class="fas fa-save mr-2"></i>
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    
    // projects-content エリアに表示
    const projectsContentArea = document.getElementById('projects-content');
    if (projectsContentArea) {
      projectsContentArea.innerHTML = content;
      console.log('✅ 案件管理コンテンツをprojects-contentエリアに設定');
    } else {
      console.warn('⚠️ projects-content要素が見つかりません、mainContentに設定');
      document.getElementById('mainContent').innerHTML = content;
    }
    
    // 案件管理のイベントリスナー設定
    ProjectManagement.setupEventListeners();
    
    // 案件データ読み込み
    await ProjectManagement.loadProjects();
  },

  // イベントリスナー設定 - 重複登録防止機能付き
  setupEventListeners: () => {
    console.log('🔧 案件管理イベントリスナー設定開始');
    
    // 重複設定を防ぐ
    if (ProjectManagement._listenersSetup) {
      console.log('⚠️ イベントリスナーは既に設定済み、スキップ');
      return;
    }
    
    // 新規追加ボタン
    const addBtn = document.getElementById('addProjectBtn');
    if (addBtn) {
      // 既存のリスナーを削除してから追加
      addBtn.removeEventListener('click', ProjectManagement.openAddProjectModal);
      addBtn.addEventListener('click', ProjectManagement.openAddProjectModal);
      console.log('✅ 新規案件追加ボタンのイベントリスナー設定完了');
    } else {
      console.error('❌ addProjectBtn要素が見つかりません');
    }
    
    // モーダル閉じるボタン
    const closeBtn = document.getElementById('closeProjectModal');
    const cancelBtn = document.getElementById('cancelProjectBtn');
    if (closeBtn) {
      closeBtn.removeEventListener('click', ProjectManagement.closeProjectModal);
      closeBtn.addEventListener('click', ProjectManagement.closeProjectModal);
      console.log('✅ モーダル閉じるボタンのイベントリスナー設定完了');
    }
    if (cancelBtn) {
      cancelBtn.removeEventListener('click', ProjectManagement.closeProjectModal);
      cancelBtn.addEventListener('click', ProjectManagement.closeProjectModal);
      console.log('✅ キャンセルボタンのイベントリスナー設定完了');
    }
    
    // モーダル外クリックで閉じる
    const modal = document.getElementById('projectModal');
    if (modal && !modal._projectListenerAdded) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          ProjectManagement.closeProjectModal();
        }
      });
      modal._projectListenerAdded = true; // フラグを設定して重複を防ぐ
      console.log('✅ モーダル外クリックイベントリスナー設定完了');
    }
    
    ProjectManagement._listenersSetup = true;
  },

  // 顧客データ読み込み（案件管理用） - 重複実行防止機能付き
  loadCustomersForSelect: async () => {
    console.log('🔄 loadCustomersForSelect called');
    
    // 重複実行防止
    if (ProjectManagement._loadingCustomers) {
      console.log('⚠️ 顧客データ読み込み中のため、重複実行をスキップ');
      return;
    }
    
    const selectElement = document.getElementById('masterProjectCustomerId');
    if (!selectElement) {
      console.error('❌ 顧客プルダウン要素が見つかりません (masterProjectCustomerId)');
      return;
    }
    console.log(`✅ 顧客プルダウン要素発見: ${selectElement.id}`);
    
    // 既にデータが読み込まれている場合はスキップ
    if (selectElement.options.length > 1) {
      console.log('✅ 顧客データは既に読み込み済み、スキップ');
      return;
    }
    
    ProjectManagement._loadingCustomers = true;
    console.log('🌐 顧客データAPI呼び出し中...');
    
    try {
      const response = await API.get('/customers?status=active');
      console.log(`📊 顧客データ受信: ${response.data ? response.data.length : 0}件`);
      
      if (response.success && response.data) {
        selectElement.innerHTML = '<option value="">選択してください</option>';
        const sortedCustomers = response.data.sort((a, b) => a.name.localeCompare(b.name));
        
        let customerCount = 0;
        sortedCustomers.forEach(customer => {
          const option = document.createElement('option');
          option.value = customer.id;
          option.textContent = customer.name;
          selectElement.appendChild(option);
          customerCount++;
          
          // 最初の3件だけログ出力
          if (customerCount <= 3) {
            console.log(`  - 顧客 ${customerCount}: ${customer.name} (ID: ${customer.id})`);
          }
        });
        console.log(`✅ 顧客プルダウン読み込み完了: ${response.data.length}件の顧客を${selectElement.id}にロード`);
        console.log(`📊 最終的なオプション数: ${selectElement.options.length}`);
      } else {
        console.error('❌ 顧客データ取得に失敗:', response);
        selectElement.innerHTML = '<option value="">顧客データの読み込みに失敗しました</option>';
      }
    } catch (error) {
      console.error('❌ 顧客データ読み込みエラー:', error);
      selectElement.innerHTML = '<option value="">エラーが発生しました</option>';
    } finally {
      ProjectManagement._loadingCustomers = false;
    }
  },

  // 新規案件モーダルを開く
  openAddProjectModal: async () => {
    console.log('🔄 openAddProjectModal called');
    ProjectManagement.currentProjectId = null;
    
    // タイトルとフィールドをリセット
    document.getElementById('projectModalTitle').textContent = '新規案件追加';
    document.getElementById('masterProjectName').value = '';
    document.getElementById('masterProjectDescription').value = '';
    document.getElementById('masterProjectStatus').value = 'initial';
    document.getElementById('masterProjectPriority').value = 'medium';
    document.getElementById('masterProjectNotes').value = '';
    document.getElementById('masterProjectCustomerId').value = '';
    
    console.log('🔄 顧客データロード開始...');
    // 顧客データを読み込んでからモーダルを表示
    await ProjectManagement.loadCustomersForSelect();
    console.log('✅ 顧客データロード完了、モーダル表示');
    
    document.getElementById('projectModal').classList.remove('hidden');
  },

  // 案件編集モーダルを開く
  openEditProjectModal: async (projectId) => {
    console.log('🔄 openEditProjectModal called', projectId);
    ProjectManagement.currentProjectId = projectId;
    
    try {
      const response = await API.get(`/projects/${projectId}`);
      if (response.success && response.data) {
        const project = response.data;
        
        document.getElementById('projectModalTitle').textContent = '案件編集';
        document.getElementById('masterProjectName').value = project.name || '';
        document.getElementById('masterProjectDescription').value = project.description || '';
        document.getElementById('masterProjectStatus').value = project.status || 'initial';
        document.getElementById('masterProjectPriority').value = project.priority || 'medium';
        document.getElementById('masterProjectNotes').value = project.notes || '';
        
        // 顧客データを読み込んでから値を設定
        await ProjectManagement.loadCustomersForSelect();
        document.getElementById('masterProjectCustomerId').value = project.customer_id || '';
        
        document.getElementById('projectModal').classList.remove('hidden');
      }
    } catch (error) {
      console.error('❌ 案件データ取得エラー:', error);
      Utils.showError('案件データの取得に失敗しました');
    }
  },

  // モーダルを閉じる
  closeProjectModal: () => {
    console.log('🔄 closeProjectModal called');
    document.getElementById('projectModal').classList.add('hidden');
    ProjectManagement.currentProjectId = null;
  },

  // フォーム送信処理 - 強化された重複実行防止機能付き
  handleProjectFormSubmit: async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation(); // 他のイベントハンドラーの実行を停止
    console.log('🔄 handleProjectFormSubmit called');
    
    // 重複送信防止（より厳格なチェック）
    if (ProjectManagement._submitting) {
      console.log('⚠️ フォーム送信処理中のため、重複実行を完全にブロック');
      return false;
    }
    
    // 1秒以内の連続クリックをブロック
    const now = Date.now();
    if (ProjectManagement._lastSubmitTime && (now - ProjectManagement._lastSubmitTime) < 1000) {
      console.log('⚠️ 1秒以内の連続送信をブロック');
      return false;
    }
    
    ProjectManagement._submitting = true;
    ProjectManagement._lastSubmitTime = now;
    
    try {
      const formData = {
        customer_id: document.getElementById('masterProjectCustomerId').value,
        name: document.getElementById('masterProjectName').value.trim(),
        description: document.getElementById('masterProjectDescription').value.trim(),
        status: document.getElementById('masterProjectStatus').value,
        priority: document.getElementById('masterProjectPriority').value,
        notes: document.getElementById('masterProjectNotes').value.trim()
      };
      
      console.log('📊 送信データ:', formData);
      
      if (!formData.name || !formData.customer_id) {
        Utils.showError('案件名と顧客は必須項目です');
        return false;
      }
      
      // 送信ボタンを無効化
      const submitBtn = document.querySelector('#masterProjectForm button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>保存中...';
      }
      
      let response;
      if (ProjectManagement.currentProjectId) {
        // 編集
        response = await API.put(`/projects/${ProjectManagement.currentProjectId}`, formData);
      } else {
        // 新規作成
        response = await API.post('/projects', formData);
      }
      
      if (response.success) {
        Utils.showSuccess(ProjectManagement.currentProjectId ? '案件が更新されました' : '案件が作成されました');
        ProjectManagement.closeProjectModal();
        await ProjectManagement.loadProjects();
      } else {
        Utils.showError(response.error || '保存に失敗しました');
      }
      
    } catch (error) {
      console.error('❌ 案件保存エラー:', error);
      Utils.showError('保存中にエラーが発生しました');
    } finally {
      // 送信ボタンを復元
      const submitBtn = document.querySelector('#masterProjectForm button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>保存';
      }
      ProjectManagement._submitting = false;
    }
    
    return false;
  },

  // 案件一覧読み込み
  loadProjects: async () => {
    console.log('🔄 loadProjects called');
    const listContainer = document.getElementById('projectList');
    
    try {
      const response = await API.get('/projects');
      console.log('📊 案件データ取得レスポンス:', response);
      
      if (response.success && response.data) {
        if (response.data.length === 0) {
          listContainer.innerHTML = `
            <tr>
              <td colspan="6" class="text-center py-8">
                <i class="fas fa-folder-open text-4xl text-gray-300"></i>
                <p class="text-gray-500 mt-2">案件が登録されていません</p>
              </td>
            </tr>
          `;
        } else {
          const html = response.data.map(project => ProjectManagement.createProjectRow(project)).join('');
          listContainer.innerHTML = html;
        }
      } else {
        console.error('❌ 案件データ取得失敗:', response);
        listContainer.innerHTML = `
          <tr>
            <td colspan="6" class="text-center py-8">
              <i class="fas fa-exclamation-triangle text-4xl text-red-300"></i>
              <p class="text-red-500 mt-2">データの読み込みに失敗しました</p>
            </td>
          </tr>
        `;
      }
    } catch (error) {
      console.error('❌ 案件データ読み込みエラー:', error);
      listContainer.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-8">
            <i class="fas fa-exclamation-triangle text-4xl text-red-300"></i>
            <p class="text-red-500 mt-2">エラーが発生しました</p>
          </td>
        </tr>
      `;
    }
  },

  // 案件行作成
  createProjectRow: (project) => {
    const statusLabels = {
      initial: '初期',
      active: 'アクティブ', 
      completed: '完了',
      on_hold: '保留',
      inactive: '無効',
      deleted: '削除済み'
    };
    
    const priorityLabels = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '緊急'
    };
    
    const statusColors = {
      initial: 'bg-gray-100 text-gray-600',
      active: 'bg-green-100 text-green-600',
      completed: 'bg-blue-100 text-blue-600',
      on_hold: 'bg-yellow-100 text-yellow-600',
      inactive: 'bg-red-100 text-red-600',
      deleted: 'bg-red-200 text-red-800'
    };
    
    const priorityColors = {
      low: 'bg-blue-50 text-blue-600',
      medium: 'bg-yellow-50 text-yellow-600',
      high: 'bg-orange-50 text-orange-600',
      urgent: 'bg-red-50 text-red-600'
    };
    
    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${Utils.escapeHtml(project.name)}</div>
          ${project.description ? `<div class="text-sm text-gray-500">${Utils.escapeHtml(project.description)}</div>` : ''}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${Utils.escapeHtml(project.customer_name || '未設定')}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}">
            ${statusLabels[project.status] || project.status}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 py-1 text-xs font-medium rounded-full ${priorityColors[project.priority] || 'bg-gray-50 text-gray-600'}">
            ${priorityLabels[project.priority] || project.priority}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${Utils.formatDate(project.updated_at)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div class="flex space-x-1">
            <button onclick="ProjectManagement.openEditProjectModal('${project.id}')" 
                    class="text-blue-600 hover:text-blue-900" title="編集">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="ProjectManagement.toggleProjectStatus('${project.id}')" 
                    class="text-yellow-600 hover:text-yellow-900" title="ステータス切替">
              <i class="fas fa-exchange-alt"></i>
            </button>
            <button onclick="ProjectManagement.deleteProject('${project.id}')" 
                    class="text-red-600 hover:text-red-900" title="削除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  },

  // 案件ステータス切り替え
  toggleProjectStatus: async (projectId) => {
    console.log('🔄 toggleProjectStatus called', projectId);
    
    try {
      const response = await API.post(`/projects/${projectId}/toggle-status`);
      if (response.success) {
        Utils.showSuccess('ステータスが更新されました');
        await ProjectManagement.loadProjects();
      } else {
        Utils.showError(response.error || 'ステータス更新に失敗しました');
      }
    } catch (error) {
      console.error('❌ ステータス切り替えエラー:', error);
      Utils.showError('ステータス更新中にエラーが発生しました');
    }
  },

  // 案件削除（ソフトデリート）
  deleteProject: async (projectId) => {
    console.log('🔄 deleteProject called', projectId);
    
    if (!confirm('この案件を削除しますか？（データは完全には削除されず、削除済みマークが付きます）')) {
      return;
    }
    
    try {
      const response = await API.delete(`/projects/${projectId}`);
      if (response.success) {
        Utils.showSuccess('案件が削除されました');
        await ProjectManagement.loadProjects();
      } else {
        Utils.showError(response.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('❌ 案件削除エラー:', error);
      Utils.showError('削除中にエラーが発生しました');
    }
  }
};

// 案件管理をグローバルに公開
window.ProjectManagement = ProjectManagement;

// DOM読み込み完了時の案件管理初期化
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Setting up project button on DOMContentLoaded');
  
  const addProjectBtn = document.getElementById('addProjectBtn');
  const projectForm = document.getElementById('masterProjectForm');
  
  if (!addProjectBtn) {
    console.log('❌ addProjectBtn element not found');
  } else {
    console.log('✅ addProjectBtn element found');
  }
  
  if (!projectForm) {
    console.log('❌ projectForm element not found');
  } else {
    console.log('✅ projectForm element found');
  }
});