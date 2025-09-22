import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * 格式化日期時間為可讀格式
 * @param value 日期時間字符串
 * @returns 格式化後的日期時間，如 "2024-03-15 14:30"
 */
export const formatDateTime = (value?: string | null): string => {
  if (!value) return '—';
  return dayjs(value).format('YYYY-MM-DD HH:mm');
};

/**
 * 格式化為相對時間
 * @param value 日期時間字符串
 * @returns 相對時間，如 "2 小時前"
 */
export const formatRelative = (value?: string | null): string => {
  if (!value) return '—';
  return dayjs(value).fromNow();
};

/**
 * 格式化相對時間（別名函數，用於向後兼容）
 * @param value 日期時間字符串
 * @returns 相對時間，如 "2 小時前"
 */
export const formatRelativeTime = formatRelative;

/**
 * 格式化持續時間
 * @param startTime 開始時間
 * @param endTime 結束時間
 * @returns 持續時間，如 "2h 30m"
 */
export const formatDuration = (startTime?: string | null, endTime?: string | null): string => {
  if (!startTime) return '—';

  const start = dayjs(startTime);
  const end = endTime ? dayjs(endTime) : dayjs();

  const duration = end.diff(start);
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return minutes > 0 ? `${minutes}m` : '<1m';
};

/**
 * 格式化數字為人類可讀格式
 * @param value 數值
 * @returns 格式化後的數字，如 "1.2K", "3.4M"
 */
export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

/**
 * 格式化百分比
 * @param value 數值 (0-100)
 * @param decimals 小數點位數，默認為1
 * @returns 格式化後的百分比，如 "85.5%"
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * 格式化檔案大小
 * @param bytes 位元組數
 * @returns 格式化後的檔案大小，如 "1.2 GB"
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(1)} ${sizes[i]}`;
};

/**
 * 格式化毫秒持續時間為可讀格式
 * @param value 毫秒數
 * @returns 格式化後的持續時間，如 "2h 30m", "1.2s", "500ms"
 */
export const formatDurationMs = (value?: number): string => {
  if (!value || Number.isNaN(value)) {
    return '—';
  }

  if (value < 1000) {
    return `${value} ms`;
  }

  const totalSeconds = value / 1000;
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)} s`;
  }

  const totalMinutes = totalSeconds / 60;
  if (totalMinutes < 60) {
    return `${totalMinutes.toFixed(1)} m`;
  }

  const totalHours = totalMinutes / 60;
  return `${totalHours.toFixed(1)} h`;
};