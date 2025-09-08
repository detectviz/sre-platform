import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { dashboardApiSlice } from '../services/dashboardApi';
import { resourcesApiSlice } from '../services/resourcesApi';
import { incidentsApiSlice } from '../services/incidentsApi';

// 設定 Redux store
export const store = configureStore({
  reducer: {
    // 將 auth slice 的 reducer 加入 store
    auth: authReducer,
    // 加入 RTK Query API slices 的 reducers
    [dashboardApiSlice.reducerPath]: dashboardApiSlice.reducer,
    [resourcesApiSlice.reducerPath]: resourcesApiSlice.reducer,
    [incidentsApiSlice.reducerPath]: incidentsApiSlice.reducer,
  },
  // 加入所有 API middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(dashboardApiSlice.middleware)
      .concat(resourcesApiSlice.middleware)
      .concat(incidentsApiSlice.middleware),
});

// 從 store 本身推斷出 `RootState` 和 `AppDispatch` 類型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
