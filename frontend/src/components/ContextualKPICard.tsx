import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Card, Skeleton, Space, Statistic, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Text } = Typography;

export type KPIStatus = 'success' | 'warning' | 'danger' | 'info';

export type ContextualKPICardProps = {
  /** KPI 標題 */
  title: string;
  /** KPI 數值 */
  value: number | string;
  /** 數值單位 */
  unit?: string;
  /** 比較趨勢，正值代表上升 */
  trendValue?: number;
  /** 趨勢描述文字 */
  trendLabel?: string;
  /** 數值狀態，決定用色 */
  status?: KPIStatus;
  /** 額外補充說明 */
  description?: ReactNode;
  /** 顯示在數值右側的圖示 */
  icon?: ReactNode;
  /** 卡片點擊事件 */
  onClick?: () => void;
  /** 是否載入中 */
  loading?: boolean;
  /** 是否套用玻璃效果外框 */
  glass?: boolean;
};

const statusColorMap: Record<KPIStatus, string> = {
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  info: '#1890ff',
};

export const ContextualKPICard = ({
  title,
  value,
  unit,
  trendValue,
  trendLabel,
  status = 'info',
  description,
  icon,
  onClick,
  loading,
  glass = true,
}: ContextualKPICardProps) => {
  const trendPositive = typeof trendValue === 'number' && trendValue >= 0;
  const trendNegative = typeof trendValue === 'number' && trendValue < 0;
  const color = statusColorMap[status];

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={glass ? 'glass-surface' : ''}
      styles={{
        body: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'stretch',
          minHeight: 120,
        },
      }}
    >
      <Space direction="vertical" size={8} style={{ flex: 1 }}>
        <Text type="secondary" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Text>
        {loading ? (
          <Skeleton active paragraph={false} title={{ width: '60%' }} />
        ) : (
          <Statistic
            value={value}
            suffix={unit}
            valueStyle={{ color }}
          />
        )}
        {description && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {description}
          </Text>
        )}
      </Space>

      <Space direction="vertical" align="end" size={8} style={{ minWidth: 80 }}>
        {icon}
        {typeof trendValue === 'number' && (
          <Space size={4} style={{ color: trendPositive ? '#52c41a' : '#ff4d4f', fontWeight: 500 }}>
            {trendPositive && <ArrowUpOutlined />}
            {trendNegative && <ArrowDownOutlined />}
            <span>
              {Math.abs(trendValue)}%
            </span>
          </Space>
        )}
        {trendLabel && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {trendLabel}
          </Text>
        )}
      </Space>
    </Card>
  );
};

export default ContextualKPICard;
