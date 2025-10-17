const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Console log capture
  page.on('console', msg => {
    console.log(`🌐 [${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  try {
    console.log('🔄 Navigating to masters page...');
    await page.goto('https://3000-ip60pndnnf5e5cmovjufh-6532622b.e2b.dev/masters');
    
    console.log('🔄 Waiting for page load...');
    await page.waitForSelector('#projectsTab', { timeout: 10000 });
    
    console.log('🔄 Clicking projects tab...');
    await page.click('#projectsTab');
    
    console.log('🔄 Waiting for content load...');
    await page.waitForTimeout(3000);
    
    console.log('🔍 Checking for project elements...');
    const addProjectBtn = await page.$('#addProjectBtn');
    const projectForm = await page.$('#masterProjectForm');
    const projectModal = await page.$('#projectModal');
    
    console.log(`✅ addProjectBtn exists: ${!!addProjectBtn}`);
    console.log(`✅ projectForm exists: ${!!projectForm}`);
    console.log(`✅ projectModal exists: ${!!projectModal}`);
    
    if (addProjectBtn) {
      console.log('🔄 Clicking add project button...');
      await page.click('#addProjectBtn');
      
      console.log('🔄 Waiting for modal...');
      await page.waitForTimeout(2000);
      
      console.log('🔍 Checking customer dropdown...');
      const customerSelect = await page.$('#masterProjectCustomerId');
      if (customerSelect) {
        const options = await page.evaluate(() => {
          const select = document.getElementById('masterProjectCustomerId');
          return Array.from(select.options).map(opt => ({ value: opt.value, text: opt.textContent }));
        });
        console.log(`✅ Customer options loaded: ${options.length} options`);
        options.forEach(opt => console.log(`   - ${opt.value}: ${opt.text}`));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
