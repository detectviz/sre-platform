// 引入 Redux Toolkit 的核心功能
import { configureStore } from '@reduxjs/toolkit';
// 引入 RTK Query 的監聽器設定工具
import { setupListeners } from '@reduxjs/toolkit/query';
// 引入我們剛剛建立的基礎 API slice
import { api } from '../services/api';

/**
 * 設定 Redux store。
 * store 是我們應用程式狀態的單一事實來源 (Single Source of Truth)。
 */
export const store = configureStore({
  reducer: {
    // 將 API slice 的 reducer 加入到我們的 store 中。
    // Reducer 的名稱 [api.reducerPath] 會是 'api'，這是我們在 createApi 中定義的。
    [api.reducerPath]: api.reducer,
  },
  // middleware 是 Redux 中處理非同步操作和副作用的地方。
  // 我們將 API slice 提供的 middleware 加入到預設的 middleware 鏈中。
  // 這個 middleware 負責處理 API 請求的生命週期，包括快取、輪詢等功能。
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// 這是可選的，但對於實現 refetchOnFocus 和 refetchOnReconnect 等行為是必要的。
// 它會設定監聽器來自動重新抓取資料。
setupListeners(store.dispatch);

// 從 store 本身推斷出 `RootState` 和 `AppDispatch` 的類型。
// 這對於在整個應用程式中使用 TypeScript 非常有用。
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
