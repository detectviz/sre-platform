import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { DashboardApi, DashboardSummary, ResourceDistribution } from './api-client';
import { Configuration } from './api-client/configuration';

// 建立一個 DashboardApi 的實例。
// 在實際應用中，Configuration 可能會根據環境動態設定，
// 例如從 Redux state 讀取認證 token。
const apiConfig = new Configuration({ basePath: 'http://localhost:8081' });
const dashboardApiClient = new DashboardApi(apiConfig);

/**
 * 儀表板相關的 API Slice
 * 我們使用 queryFn 來整合自動生成的 typescript-fetch 客戶端，
 * 這是 RTK Query 推薦的與外部數據獲取邏輯整合的模式。
 */
export const dashboardApiSlice = createApi({
  reducerPath: 'dashboardApi',
  // 提供一個假的 baseQuery，因為我們將在每個 endpoint 中使用 queryFn。
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    /**
     * 獲取儀表板摘要數據
     */
    getDashboardSummary: builder.query<DashboardSummary, void>({
      async queryFn(_arg, _queryApi, _extraOptions, _baseQuery) {
        try {
          const summary = await dashboardApiClient.getDashboardSummary();
          return { data: summary };
        } catch (error) {
          // 為了讓錯誤處理更一致，我們可以將其格式化為 FetchBaseQueryError
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
    }),
    /**
     * 獲取資源分佈數據
     */
    getResourceDistribution: builder.query<ResourceDistribution, void>({
      async queryFn(_arg, _queryApi, _extraOptions, _baseQuery) {
        try {
          const distribution = await dashboardApiClient.getResourceDistribution();
          return { data: distribution };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
    }),
  }),
});

// 導出 RTK Query 自動生成的 hooks，供元件使用
export const {
  useGetDashboardSummaryQuery,
  useGetResourceDistributionQuery,
} = dashboardApiSlice;
