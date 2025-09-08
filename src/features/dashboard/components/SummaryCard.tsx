import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface SummaryCardProps {
  title: string;
  value: number;
  // 趨勢百分比，例如 11.2
  trend: number;
  loading?: boolean;
}

/**
 * 儀表板上的摘要資訊卡片，用於顯示關鍵指標及其趨勢。
 */
const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, trend, loading }) => {
  const isPositive = trend >= 0;

  return (
    <Card loading={loading}>
      <Statistic
        title={title}
        value={value}
        precision={0} // 整數
        valueStyle={{ color: isPositive ? '#3f8600' : '#cf1322' }}
        prefix={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        suffix={`%${Math.abs(trend)}`}
      />
    </Card>
  );
};

export default SummaryCard;
