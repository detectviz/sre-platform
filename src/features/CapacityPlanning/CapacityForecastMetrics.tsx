// 檔案: src/features/CapacityPlanning/CapacityForecastMetrics.tsx
// 描述: 用於顯示容量預測的關鍵指標與建議的元件。

import React from 'react';
import { Card, List, Typography } from 'antd';
import { BulbOutlined } from '@ant-design/icons';

const { Text } = Typography;

// 定義元件的 props 型別
interface CapacityForecastMetricsProps {
  // 從 API 回應中得到的建議列表
  recommendations: string[];
}

/**
 * 容量預測指標與建議元件
 * @param recommendations - 建議列表
 */
const CapacityForecastMetrics: React.FC<CapacityForecastMetricsProps> = ({ recommendations }) => {
  // 如果沒有建議，則不渲染任何內容
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <Card
      title="分析與建議"
      bordered={false}
      style={{ marginTop: 24 }}
    >
      <List
        // 資料來源為傳入的 recommendations 陣列
        dataSource={recommendations}
        // 定義如何渲染列表中的每一個項目
        renderItem={item => (
          <List.Item>
            <Text>
              {/* 使用燈泡圖示增加視覺提示 */}
              <BulbOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              {item}
            </Text>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default CapacityForecastMetrics;
