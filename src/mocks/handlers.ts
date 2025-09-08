// 檔案: src/mocks/handlers.ts
// 描述: 定義 MSW 的請求處理程序 (request handlers)。

import { http, HttpResponse, delay } from 'msw';
import { CapacityForecastResponse } from '../features/CapacityPlanning/types';

// 這是我們所有 API mock 處理程序的陣列
export const handlers = [
  // 攔截對 '/api/v1/capacity/forecast' 的 POST 請求
  http.post('http://localhost:8081/api/v1/capacity/forecast', async () => {
    // 模擬的成功回應資料
    const mockSuccessResponse: CapacityForecastResponse = {
      forecast_data: [
        { timestamp: '2025-09-09T00:00:00Z', predicted_value: 65, confidence_interval: { lower: 62, upper: 68 } },
        { timestamp: '2025-09-10T00:00:00Z', predicted_value: 66, confidence_interval: { lower: 63, upper: 69 } },
        { timestamp: '2025-09-11T00:00:00Z', predicted_value: 68, confidence_interval: { lower: 65, upper: 71 } },
        { timestamp: '2025-09-12T00:00:00Z', predicted_value: 70, confidence_interval: { lower: 67, upper: 73 } },
        { timestamp: '2025-09-13T00:00:00Z', predicted_value: 72, confidence_interval: { lower: 68, upper: 76 } },
        { timestamp: '2025-09-14T00:00:00Z', predicted_value: 75, confidence_interval: { lower: 70, upper: 80 } },
        { timestamp: '2025-09-15T00:00:00Z', predicted_value: 78, confidence_interval: { lower: 72, upper: 84 } },
      ],
      recommendations: [
        '預計在未來 7 天內，資源使用率將穩定增長。',
        '當前容量充足，但建議在達到 80% 警戒線前進行審查。',
      ],
      alert_threshold: 80.0,
    };

    // 模擬網路延遲
    await delay(1500);

    // 回傳一個包含 JSON 資料的成功回應
    return HttpResponse.json(mockSuccessResponse);

    /*
    // --- 用於測試錯誤狀態的範例 ---
    // 如果需要測試錯誤情況，可以取消註解下面的程式碼

    await delay(1500);
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
    */
  }),
];
