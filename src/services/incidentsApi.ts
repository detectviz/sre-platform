import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  IncidentsApi,
  Configuration,
  IncidentList,
  ListIncidentsRequest,
  BatchIncidentOperation,
  BatchOperationResult,
} from './api-client';

// 建立一個 IncidentsApi 的實例
const apiConfig = new Configuration({ basePath: 'http://localhost:8081' });
const incidentsApiClient = new IncidentsApi(apiConfig);

/**
 * 告警紀錄相關的 API Slice
 */
export const incidentsApiSlice = createApi({
  reducerPath: 'incidentsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }), // 假的 baseQuery
  tagTypes: ['Incident'], // 定義標籤類型
  endpoints: (builder) => ({
    /**
     * 獲取告警紀錄列表 (支援篩選和分頁)
     */
    listIncidents: builder.query<IncidentList, ListIncidentsRequest>({
      async queryFn(arg, _queryApi, _extraOptions, _baseQuery) {
        try {
          const incidentList = await incidentsApiClient.listIncidents(arg);
          return { data: incidentList };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      // 提供 'Incident' 標籤列表
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Incident' as const, id })),
              { type: 'Incident', id: 'LIST' },
            ]
          : [{ type: 'Incident', id: 'LIST' }],
    }),

    /**
     * 批次更新告警 (例如：確認、解決)
     */
    batchUpdateIncidents: builder.mutation<BatchOperationResult, BatchIncidentOperation>({
      async queryFn(arg, _queryApi, _extraOptions, _baseQuery) {
        try {
          const result = await incidentsApiClient.batchUpdateIncidents({
            batchIncidentOperation: arg,
          });
          return { data: result };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      // 操作成功後，使列表標籤失效，觸發自動重新獲取
      invalidatesTags: [{ type: 'Incident', id: 'LIST' }],
    }),
  }),
});

// 導出 RTK Query 自動生成的 hooks
export const {
  useListIncidentsQuery,
  useBatchUpdateIncidentsMutation,
} = incidentsApiSlice;
