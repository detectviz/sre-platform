import { Tag } from 'antd';
import type { ReactNode } from 'react';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export type StatusBadgeProps = {
  /** 顯示文字 */
  label: ReactNode;
  /** 狀態配色 */
  tone?: StatusTone;
  /** 額外小圖示 */
  icon?: ReactNode;
  /** 顯示為實心或邊框樣式 */
  bordered?: boolean;
};

const toneColorMap: Record<StatusTone, string> = {
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  info: '#1890ff',
  neutral: '#8c8c8c',
};

export const StatusBadge = ({ label, tone = 'neutral', icon, bordered }: StatusBadgeProps) => (
  <Tag
    icon={icon}
    style={{
      borderRadius: 12,
      border: bordered ? `1px solid ${toneColorMap[tone]}40` : 'none',
      background: bordered ? 'transparent' : `${toneColorMap[tone]}1A`,
      color: toneColorMap[tone],
      padding: '2px 10px',
      fontWeight: 500,
      fontSize: 12,
    }}
  >
    {label}
  </Tag>
);

export default StatusBadge;
