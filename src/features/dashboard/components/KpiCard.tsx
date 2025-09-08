import React from 'react';
import { Card, Space, Statistic, Typography } from 'antd';

const { Text } = Typography;

interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  unit?: string;
  loading?: boolean;
}

/**
 * 儀表板上的關鍵績效指標 (KPI) 卡片。
 * 用於顯示一個帶有圖示的單一指標。
 */
const KpiCard: React.FC<KpiCardProps> = ({ icon, title, value, unit, loading }) => {
  return (
    <Card loading={loading}>
      <Space direction="horizontal" size="large">
        <div style={{ fontSize: '32px', color: '#1890ff' }}>
          {icon}
        </div>
        <div>
          <Text type="secondary">{title}</Text>
          <Statistic value={value} suffix={unit ? ` ${unit}` : ''} valueStyle={{ fontSize: '24px' }} />
        </div>
      </Space>
    </Card>
  );
};

export default KpiCard;
