// 引入 RTK Query 的核心功能
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * 這是我們整個應用程式的基礎 API Slice。
 * 所有其他的 API Slice 都會將它們的 endpoints '注入' 到這裡。
 * 這讓我們可以將 API 定義分散到各個功能模組中，同時又能集中管理。
 */
export const api = createApi({
  // Reducer 在 store 中的路徑
  reducerPath: 'api',
  // 設定基礎查詢功能，這裡使用 fetch，並指定後端 API 的基礎 URL
  // 這個 URL 來自 openapi.yaml 中定義的伺服器位址
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8081/api/v1/' }),
  // 定義 'Tags' 用於快取管理。
  // 當一個 mutation 宣告它 'invalidates' 一個 tag，
  // 所有提供該 tag 的 query 都會自動重新抓取資料。
  tagTypes: ['Capacity', 'Resource', 'Incident', 'User'],
  // Endpoints 先留空，將由各個功能的 API slice 透過 injectEndpoints 來填充
  endpoints: () => ({}),
});
