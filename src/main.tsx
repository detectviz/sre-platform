// 檔案: src/main.tsx
// 描述: 應用程式的主進入點檔案。

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App.tsx';
import './index.css';

/**
 * 啟用 API Mocking 的非同步函式。
 * 這只會在開發環境中執行。
 */
async function enableMocking() {
  // 在 Vite 專案中，應使用 `import.meta.env.DEV` 來判斷是否為開發模式
  if (!import.meta.env.DEV) {
    return;
  }

  // 動態載入 MSW 的瀏覽器 worker
  const { worker } = await import('./mocks/browser');

  // 啟動 worker。這會回傳一個 Promise，
  // 當 Service Worker 成功啟動並準備好攔截請求時，Promise 會被解析。
  // 我們使用 quiet: true 來避免在開發者控制台中印出 MSW 的啟動訊息。
  return worker.start({
    onUnhandledRequest: 'bypass', // 對於未處理的請求，直接放行，不顯示警告
    quiet: true,
  });
}

// 執行 enableMocking，並在它完成後才渲染 React 應用程式。
// 這確保了在應用程式發出任何 API 請求之前，Mock Service Worker 就已經準備就緒。
enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
  );
});
