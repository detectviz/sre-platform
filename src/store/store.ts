import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { dashboardApiSlice } from '../services/dashboardApi';

// 設定 Redux store
export const store = configureStore({
  reducer: {
    // 將 auth slice 的 reducer 加入 store
    auth: authReducer,
    // 加入 RTK Query API slice 的 reducer
    [dashboardApiSlice.reducerPath]: dashboardApiSlice.reducer,
  },
  // 加入 API middleware，這對於快取、失效、輪詢等功能是必需的
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dashboardApiSlice.middleware),
});

// 從 store 本身推斷出 `RootState` 和 `AppDispatch` 類型
// `RootState` 用於 useSelector hook
export type RootState = ReturnType<typeof store.getState>;
// `AppDispatch` 用於 useDispatch hook
export type AppDispatch = typeof store.dispatch;
