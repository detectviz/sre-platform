import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  ResourcesApi,
} from './api-client/api';
import type {
  ResourceList,
  BatchResourceOperation,
  BatchOperationResult,
} from './api-client/api';

// 定義 listResources 的請求參數類型
export interface ListResourcesRequest {
  page?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  groupId?: string;
  search?: string;
}
import { Configuration } from './api-client/configuration';

// 建立一個 ResourcesApi 的實例
const apiConfig = new Configuration({ basePath: 'http://localhost:8081' });
const resourcesApiClient = new ResourcesApi(apiConfig);

/**
 * 資源管理相關的 API Slice
 */
export const resourcesApiSlice = createApi({
  reducerPath: 'resourcesApi',
  // 提供一個假的 baseQuery，因為我們將在每個 endpoint 中使用 queryFn
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  // 定義標籤類型，用於快取失效和自動重新獲取
  tagTypes: ['Resource'],
  endpoints: (builder) => ({
    /**
     * 獲取資源列表 (支援篩選和分頁)
     */
    listResources: builder.query<ResourceList, ListResourcesRequest>({
      async queryFn(arg, _queryApi, _extraOptions, _baseQuery) {
        try {
          // 呼叫生成的方法，傳入展開的參數
          const resourceList = await resourcesApiClient.listResources(
            arg.page,
            arg.pageSize,
            arg.status,
            arg.type,
            arg.groupId,
            arg.search
          );
          return { data: resourceList };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      // 提供 'Resource' 標籤的列表，用於後續的快取失效
      providesTags: (result) =>
        result && result.items
          ? [
            ...result.items.map(({ id }) => ({ type: 'Resource' as const, id })),
            { type: 'Resource', id: 'LIST' },
          ]
          : [{ type: 'Resource', id: 'LIST' }],
    }),

    /**
     * 刪除單一資源
     */
    deleteResource: builder.mutation<void, { resourceId: string }>({
      async queryFn(arg, _queryApi, _extraOptions, _baseQuery) {
        try {
          await resourcesApiClient.deleteResource(arg.resourceId);
          return { data: undefined };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      // 刪除成功後，使 'Resource' 列表標籤失效，觸發重新獲取
      invalidatesTags: [{ type: 'Resource', id: 'LIST' }],
    }),

    /**
     * 批次操作資源
     */
    batchOperateResources: builder.mutation<BatchOperationResult, BatchResourceOperation>({
      async queryFn(arg, _queryApi, _extraOptions, _baseQuery) {
        try {
          const result = await resourcesApiClient.batchOperateResources(arg);
          return { data: result };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      // 操作成功後，同樣使列表標籤失效
      invalidatesTags: [{ type: 'Resource', id: 'LIST' }],
    }),
  }),
});

// 導出 RTK Query 自動生成的 hooks
export const {
  useListResourcesQuery,
  useDeleteResourceMutation,
  useBatchOperateResourcesMutation,
} = resourcesApiSlice;
