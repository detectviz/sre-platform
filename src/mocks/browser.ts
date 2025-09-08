// 檔案: src/mocks/browser.ts
// 描述: 設定並匯出用於瀏覽器環境的 MSW worker。

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 使用我們定義的 handlers 陣列來設定 worker。
// 這個 worker 會在瀏覽器中攔截網路請求。
export const worker = setupWorker(...handlers);
