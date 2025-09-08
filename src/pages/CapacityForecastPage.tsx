// 檔案: src/pages/CapacityForecastPage.tsx
// 描述: 容量預測功能的主頁面，負責組合元件與處理業務邏輯。

import React, { useState } from 'react';
import { Layout, Typography, Spin, Alert, Divider, Empty } from 'antd';
import CapacityForecastForm from '../features/CapacityPlanning/CapacityForecastForm';
import CapacityForecastChart from '../features/CapacityPlanning/CapacityForecastChart';
import CapacityForecastMetrics from '../features/CapacityPlanning/CapacityForecastMetrics';
import { useForecastCapacityMutation } from '../features/CapacityPlanning/capacityApi';
import { CapacityForecastRequest } from '../features/CapacityPlanning/types';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

/**
 * 容量預測頁面元件
 */
const CapacityForecastPage: React.FC = () => {
  // 從 RTK Query 取得 mutation hook。
  // - forecastCapacity: 觸發 API 請求的函式。
  // - { data, isLoading, error, isUninitialized }: API 請求的狀態和結果。
  const [forecastCapacity, { data, isLoading, error, isUninitialized }] = useForecastCapacityMutation();

  // 使用本地 state 來儲存當前查詢的指標名稱，以便傳遞給圖表元件作為標題。
  const [currentMetric, setCurrentMetric] = useState<string>('');

  /**
   * 表單提交處理函式
   * @param values - 從表單收到的值
   */
  const handleFormSubmit = async (values: CapacityForecastRequest) => {
    // 儲存指標名稱
    setCurrentMetric(values.metric_name);
    try {
      // 呼叫 mutation 函式，並使用 .unwrap() 來處理 promise
      // 如果 API 呼叫失敗，.unwrap() 會拋出錯誤，可以被 catch 區塊捕捉
      await forecastCapacity(values).unwrap();
    } catch (err) {
      // 錯誤已由 hook 的 `error` 物件處理，這裡僅在控制台印出日誌
      console.error('Failed to forecast capacity:', err);
    }
  };

  // 渲染結果內容的輔助函式
  const renderResultContent = () => {
    if (isLoading) {
      // 正在載入時，顯示 Spin 元件
      return (
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Spin size="large" tip="正在分析與預測中，請稍候..." />
        </div>
      );
    }

    if (error) {
      // 發生錯誤時，顯示 Alert 元件
      return (
        <Alert
          message="分析失敗"
          description="無法獲取容量預測數據，請檢查您輸入的參數或稍後再試。"
          type="error"
          showIcon
          style={{ marginTop: 24 }}
        />
      );
    }

    if (data) {
      // 成功獲取資料時，顯示圖表和指標
      return (
        <div style={{ marginTop: 24 }}>
          <CapacityForecastChart data={data} metricName={currentMetric} />
          <CapacityForecastMetrics recommendations={data.recommendations} />
        </div>
      );
    }

    if (isUninitialized) {
      // 初始狀態時，顯示提示使用者操作的 Empty 元件
      return (
        <Empty
          style={{ marginTop: 48 }}
          description={<span>請輸入資源 ID 並點擊「開始分析」以查看預測結果。</span>}
        />
      );
    }

    return null;
  };

  return (
    <Content style={{ padding: '24px' }}>
      <Title level={2}>容量預測功能</Title>
      <Paragraph>
        此功能根據所選資源的歷史數據，預測未來一段時間內關鍵指標（如 CPU 使用率）的消耗趨勢，幫助您提前進行容量規劃。
      </Paragraph>

      {/* 渲染表單元件 */}
      <CapacityForecastForm onSubmit={handleFormSubmit} isLoading={isLoading} />

      <Divider />

      {/* 渲染結果區域 */}
      {renderResultContent()}
    </Content>
  );
};

export default CapacityForecastPage;
