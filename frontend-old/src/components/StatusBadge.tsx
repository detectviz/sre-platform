import type { ReactNode } from 'react';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export type StatusBadgeProps = {
  /** 顯示文字 */
  label: ReactNode;
  /** 狀態配色 */
  tone?: StatusTone;
};

const toneToStatusMap: Record<StatusTone, string> = {
  success: 'healthy',
  warning: 'warning',
  danger: 'critical',
  info: 'info',
  neutral: 'unknown',
};

/**
 * A badge for displaying status, styled according to the new design system.
 * It uses CSS classes for styling, including the pulsing dot animation.
 */
export const StatusBadge = ({ label, tone = 'neutral' }: StatusBadgeProps) => {
  const status = toneToStatusMap[tone] || 'unknown';
  const className = `status-badge status-badge-${status}`;

  return (
    <span className={className}>
      {label}
    </span>
  );
};

export default StatusBadge;
