import { ArrowDownOutlined, ArrowUpOutlined, MinusOutlined } from '@ant-design/icons';
import { Card, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Text } = Typography;

export type KPIStatus = 'success' | 'warning' | 'danger' | 'info' | 'normal';

// Keeping old props for compatibility but mapping them to the new design
export type ContextualKPICardProps = {
  /** KPI 標題 */
  title: string;
  /** KPI 數值 */
  value: number | string;
  /** 數值單位 */
  unit?: string;
  /** (舊) 比較趨勢數值 */
  trendValue?: number;
  /** (舊) 趨勢描述文字 */
  trendLabel?: string;
  /** (新) 趨勢文字 */
  trend?: string;
  /** (新) 趨勢方向 */
  trendDirection?: 'up' | 'down' | 'stable';
  /** 數值狀態，決定用色 */
  status?: KPIStatus;
  /** 額外補充說明 */
  description?: ReactNode;
  /** 顯示在標題旁的圖示 */
  icon?: ReactNode;
  /** 卡片點擊事件 */
  onClick?: () => void;
  /** 是否載入中 */
  loading?: boolean;
  /** 附加的 class */
  className?: string;
};

const statusColors: Record<KPIStatus, string> = {
  normal: 'var(--text-primary)',
  success: 'var(--brand-success)',
  warning: 'var(--brand-warning)',
  danger: 'var(--brand-danger)',
  info: 'var(--brand-info)',
};

const trendIcons = {
  up: <ArrowUpOutlined />,
  down: <ArrowDownOutlined />,
  stable: <MinusOutlined />,
};

const trendColors = {
  up: 'var(--brand-success)',
  down: 'var(--brand-danger)',
  stable: 'var(--text-tertiary)',
};

export const ContextualKPICard = ({
  title,
  value,
  unit = '',
  trendValue,
  trendLabel,
  trend: newTrend,
  trendDirection: newTrendDirection,
  status = 'normal',
  icon,
  onClick,
  className = '',
  description,
  loading = false,
}: ContextualKPICardProps) => {
  // --- Prop compatibility mapping ---
  const finalTrend = newTrend ?? (trendValue !== undefined ? `${Math.abs(trendValue)}%` : undefined);

  let finalTrendDirection: 'up' | 'down' | 'stable' = 'stable';
  if (newTrendDirection) {
    finalTrendDirection = newTrendDirection;
  } else if (trendValue !== undefined) {
    if (trendValue > 0) finalTrendDirection = 'up';
    else if (trendValue < 0) finalTrendDirection = 'down';
  }
  // --- End mapping ---

  const cardClassName = [
    'contextual-kpi-card',
    onClick ? 'clickable' : '',
    className,
  ].filter(Boolean).join(' ');

  const finalDescription = description || trendLabel;

  if (loading) {
    return (
      <Card
        hoverable={!!onClick}
        className={cardClassName}
        loading={loading}
        bordered={false}
      >
        {/* The loading skeleton is automatically handled by AntD Card */}
      </Card>
    );
  }

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={cardClassName}
      loading={loading}
      bordered={false}
    >
      <div className="kpi-header">
        <div className="kpi-title-section">
          {icon && <div className="kpi-icon">{icon}</div>}
          <div className="kpi-title">{title}</div>
        </div>
        {finalTrend && (
          <div className="kpi-trend" style={{ color: trendColors[finalTrendDirection] }}>
            {trendIcons[finalTrendDirection]}
            <span className="trend-value">{finalTrend}</span>
          </div>
        )}
      </div>
      <div className="kpi-content">
        <div className="kpi-value" style={{ color: statusColors[status] }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
          {unit && <span className="kpi-unit">{unit}</span>}
        </div>
        {finalDescription && (
          <div className="kpi-description">
            <Text type="secondary">{finalDescription}</Text>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContextualKPICard;
