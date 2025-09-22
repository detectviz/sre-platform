import { ArrowDownOutlined, ArrowUpOutlined, MinusOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { memo } from 'react';

export type KpiStatus = 'normal' | 'success' | 'warning' | 'critical';
export type TrendDirection = 'up' | 'down' | 'stable';

interface KpiCardProps {
  /** KPI 顯示標題 */
  title: string;
  /** 數值本體，支援字串或數字 */
  value: string | number;
  /** 數值單位，例如「件」或「%」 */
  unit?: string;
  /** 走勢描述，例如 +12% */
  trend?: string;
  /** 走勢方向，用於顯示箭頭顏色 */
  trendDirection?: TrendDirection;
  /** 狀態色彩，用來凸顯關鍵指標 */
  status?: KpiStatus;
  /** 卡片左上方的圖示 */
  icon?: ReactNode;
  /** 補充說明文字 */
  description?: ReactNode;
  /** 點擊事件，可用於切換篩選或導頁 */
  onClick?: () => void;
  /** 額外的樣式類別 */
  className?: string;
}

/**
 * 情境化 KPI 卡片，搭配設計系統的玻璃擬態樣式呈現指標資訊。
 */
const KpiCard = memo(
  ({
    title,
    value,
    unit,
    trend,
    trendDirection = 'up',
    status = 'normal',
    icon,
    description,
    onClick,
    className = ''
  }: KpiCardProps) => {
    const trendIconMap = {
      up: <ArrowUpOutlined />, // 上升趨勢
      down: <ArrowDownOutlined />, // 下降趨勢
      stable: <MinusOutlined /> // 無明顯變化
    } as const;

    const handleClick = () => {
      if (onClick) {
        onClick();
      }
    };

    return (
      <div
        className={`kpi-card ${status} ${onClick ? 'clickable' : ''} ${className}`.trim()}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (onClick && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            onClick();
          }
        }}
      >
        <div className="kpi-title">
          {icon ? <span className="kpi-icon">{icon}</span> : null}
          <span>{title}</span>
        </div>
        <div className="kpi-value">
          <span>{value}</span>
          {unit ? <span className="kpi-unit">{unit}</span> : null}
        </div>
        {trend ? (
          <div className={`kpi-trend ${trendDirection}`}>
            <span className="kpi-trend-icon">{trendIconMap[trendDirection]}</span>
            <span>{trend}</span>
          </div>
        ) : null}
        {description ? <div className="kpi-description">{description}</div> : null}
      </div>
    );
  }
);

KpiCard.displayName = 'KpiCard';

export default KpiCard;
