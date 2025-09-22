import type { StatusBadgeProps } from '../components/StatusBadge';

/**
 * 事件嚴重性顏色映射表
 * 定義事件嚴重性（critical, high, medium, low）對應的狀態徽章色調
 */
export const severityToneMap: Record<string, StatusBadgeProps['tone']> = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'success',
  // 支援中文標籤
  嚴重: 'danger',
  高: 'warning',
  中: 'info',
  低: 'success',
  // 支援英文變體
  urgent: 'danger',
  major: 'warning',
  minor: 'info',
  trivial: 'success',
};

/**
 * 事件狀態顏色映射表
 * 定義事件狀態（new, acknowledged, in_progress, resolved, closed）對應的狀態徽章色調
 */
export const incidentStatusToneMap: Record<string, StatusBadgeProps['tone']> = {
  new: 'danger',
  open: 'danger',
  acknowledged: 'warning',
  in_progress: 'info',
  resolved: 'success',
  closed: 'neutral',
  // 支援中文標籤
  新事件: 'danger',
  已確認: 'warning',
  處理中: 'info',
  已解決: 'success',
  已關閉: 'neutral',
  // 支援英文變體
  active: 'danger',
  assigned: 'warning',
  investigating: 'info',
  monitoring: 'info',
  completed: 'success',
};

/**
 * 通用狀態顏色映射表
 * 適用於各種狀態類型（active, inactive, pending, success, failed等）
 */
export const generalStatusToneMap: Record<string, StatusBadgeProps['tone']> = {
  // 啟用/停用狀態
  active: 'success',
  inactive: 'neutral',
  enabled: 'success',
  disabled: 'neutral',

  // 執行狀態
  pending: 'warning',
  running: 'info',
  success: 'success',
  failed: 'danger',
  cancelled: 'neutral',

  // 資源狀態
  healthy: 'success',
  warning: 'warning',
  critical: 'danger',
  unknown: 'neutral',

  // 任務狀態
  queued: 'info',
  processing: 'info',
  completed: 'success',
  error: 'danger',

  // 通知狀態
  sent: 'success',
  delivered: 'success',
  bounced: 'danger',
  deferred: 'warning',

  // 中文狀態
  執行中: 'info',
  成功: 'success',
  失敗: 'danger',
  已暫停: 'neutral',
  等待中: 'warning',
  健康: 'success',
  警告: 'warning',
  異常: 'danger',
  未知: 'neutral',
};

/**
 * 自動化腳本狀態映射表
 */
export const automationStatusToneMap: Record<string, StatusBadgeProps['tone']> = {
  ...generalStatusToneMap,
  draft: 'neutral',
  scheduled: 'info',
  executing: 'info',
  草稿: 'neutral',
  已排程: 'info',
};

/**
 * 資源狀態映射表
 */
export const resourceStatusToneMap: Record<string, StatusBadgeProps['tone']> = {
  ...generalStatusToneMap,
  online: 'success',
  offline: 'danger',
  maintenance: 'warning',
  degraded: 'warning',
  在線: 'success',
  離線: 'danger',
  維護中: 'warning',
  降級: 'warning',
};

/**
 * 事件規則狀態映射表
 */
export const eventRuleStatusToneMap: Record<string, StatusBadgeProps['tone']> = {
  active: 'success',
  paused: 'neutral',
  draft: 'warning',
  啟用: 'success',
  暫停: 'neutral',
  草稿: 'warning',
};

/**
 * 通知管道狀態映射表
 */
export const notificationChannelStatusToneMap: Record<string, StatusBadgeProps['tone']> = {
  connected: 'success',
  disconnected: 'danger',
  testing: 'info',
  已連接: 'success',
  已斷開: 'danger',
  測試中: 'info',
};

/**
 * 獲取狀態色調的統一函數
 * @param status 狀態值
 * @param type 狀態類型，用於選擇合適的映射表
 * @returns 對應的色調
 */
export const getStatusTone = (
  status: string | undefined | null,
  type: 'severity' | 'incident' | 'general' | 'automation' | 'resource' | 'rule' | 'notification' = 'general'
): StatusBadgeProps['tone'] => {
  if (!status) return 'neutral';

  const normalizedStatus = status.toLowerCase();

  switch (type) {
    case 'severity':
      return severityToneMap[normalizedStatus] ?? 'neutral';
    case 'incident':
      return incidentStatusToneMap[normalizedStatus] ?? 'neutral';
    case 'automation':
      return automationStatusToneMap[normalizedStatus] ?? 'neutral';
    case 'resource':
      return resourceStatusToneMap[normalizedStatus] ?? 'neutral';
    case 'rule':
      return eventRuleStatusToneMap[normalizedStatus] ?? 'neutral';
    case 'notification':
      return notificationChannelStatusToneMap[normalizedStatus] ?? 'neutral';
    case 'general':
    default:
      return generalStatusToneMap[normalizedStatus] ?? 'neutral';
  }
};