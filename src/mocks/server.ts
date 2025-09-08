// 檔案: src/mocks/server.ts
// 描述: 設定並匯出用於 Node.js 環境 (如測試) 的 MSW server。

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// 使用我們定義的 handlers 陣列來設定伺服器。
// 這個伺服器可以在 Node.js 環境中攔截網路請求，主要用於自動化測試。
export const server = setupServer(...handlers);
