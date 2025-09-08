// 檔案: src/features/CapacityPlanning/types.ts
// 描述: 這個檔案定義了容量規劃功能相關的 TypeScript 型別。
// 這些型別嚴格對應 openapi.yaml 中定義的 API 資料結構，以確保前後端資料契約的一致性。

/**
 * 容量預測請求的資料結構
 * 對應 openapi.yaml 中的 #/components/schemas/CapacityForecastRequest
 */
export interface CapacityForecastRequest {
  resource_ids: string[]; // 要預測的資源 ID 列表
  metric_name: string; // 要預測的指標名稱，例如 'cpu_usage'
  forecast_period: '7d' | '30d' | '90d'; // 預測的時間範圍
  start_time?: string; // 預測開始時間（可選），ISO 8601 格式
}

/**
 * 容量預測回應中的單一資料點結構
 */
interface ForecastDataPoint {
  timestamp: string; // 時間戳，ISO 8601 格式
  predicted_value: number; // 預測值
  confidence_interval: {
    lower: number; // 信賴區間下界
    upper: number; // 信賴區間上界
  };
}

/**
 * 容量預測回應的完整資料結構
 * 對應 openapi.yaml 中的 #/components/schemas/CapacityForecastResponse
 */
export interface CapacityForecastResponse {
  forecast_data: ForecastDataPoint[]; // 預測資料點的陣列
  recommendations: string[]; // 系統提供的容量規劃建議
  alert_threshold: number; // 警戒線閾值
}
