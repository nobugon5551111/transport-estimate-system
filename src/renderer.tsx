import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>輸送見積もりシステム</title>
        
        {/* TailwindCSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* FontAwesome */}
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        
        {/* カスタムCSS */}
        <link href="/static/style.css" rel="stylesheet" />
        
        {/* TailwindCSS設定（本番環境警告を無効化） */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // 本番環境警告を完全に無効化
            (function() {
              const originalWarn = console.warn;
              const originalError = console.error;
              const originalLog = console.log;
              
              console.warn = function(...args) {
                if (args[0] && typeof args[0] === 'string' && (
                  args[0].includes('cdn.tailwindcss.com should not be used in production') ||
                  args[0].includes('tailwindcss')
                )) {
                  return; // TailwindCSS関連警告を無視
                }
                originalWarn.apply(console, args);
              };
              
              console.error = function(...args) {
                if (args[0] && typeof args[0] === 'string' && args[0].includes('tailwindcss')) {
                  return; // TailwindCSS関連エラーを無視
                }
                originalError.apply(console, args);  
              };
            })();
            
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'sans-serif']
                  }
                }
              }
            }
          `
        }} />
      </head>
      <body className="bg-gray-50 font-sans">
        {children}
        
        {/* Axios for API calls */}
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        
        {/* 共通JavaScript */}
        <script src="/static/app.js?v=1760943874&cache=bust"></script>
      </body>
    </html>
  )
})
