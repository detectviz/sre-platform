// 檔案: src/features/CapacityPlanning/capacityApi.ts
// 描述: 這是專為「容量規劃」功能設計的 API slice。

// 引入我們在 services 中建立的基礎 api 物件
import { api } from '../../services/api';
// 引入剛剛定義的請求與回應型別
import { CapacityForecastRequest, CapacityForecastResponse } from './types';

/**
 * 使用 injectEndpoints 方法來擴展基礎 api。
 * 這允許我們將功能的 API 定義與基礎設定分離，保持程式碼的模組化。
 */
export const capacityApi = api.injectEndpoints({
  // endpoints 是一個 builder callback，我們在這裡定義這個 slice 的端點
  endpoints: (builder) => ({
    /**
     * 定義 'forecastCapacity' mutation。
     * Mutation 用於會改變伺服器狀態的操作（例如 POST, PUT, DELETE）。
     * - 第一個泛型參數是回應的型別 (CapacityForecastResponse)。
     * - 第二個泛型參數是請求的型別 (CapacityForecastRequest)。
     */
    forecastCapacity: builder.mutation<CapacityForecastResponse, CapacityForecastRequest>({
      // query callback 定義了如何發起請求
      query: (body) => ({
        // url 是相對於 baseQuery 中 baseUrl 的路徑
        url: 'capacity/forecast',
        // HTTP 方法
        method: 'POST',
        // 請求主體
        body,
      }),
      // invalidatesTags 用於快取失效。
      // 當這個 mutation 成功執行後，它會使 'Capacity' tag 失效，
      // 任何提供 'Capacity' tag 的 query 都會被自動重新抓取，以確保資料的即時性。
      invalidatesTags: ['Capacity'],
    }),
  }),
});

// RTK Query 會自動為我們定義的每個 endpoint 產生對應的 React Hook。
// 我們將這個自動產生的 mutation hook 匯出，以便在 UI 元件中使用。
// Hook 的命名規則是 `use` + `Endpoint名稱` (首字大寫) + `Mutation/Query`。
export const { useForecastCapacityMutation } = capacityApi;
