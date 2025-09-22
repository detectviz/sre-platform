export type ChartTheme = {
  background: string;
  axisLine: string;
  gridLine: string;
  tooltipBackground: string;
  textPrimary: string;
  textSecondary: string;
  palette: {
    primary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    neutral: string;
  };
};

const FALLBACK_THEME: ChartTheme = {
  background: '#0A0B0E',
  axisLine: 'rgba(255, 255, 255, 0.25)',
  gridLine: 'rgba(255, 255, 255, 0.12)',
  tooltipBackground: 'rgba(13, 16, 23, 0.95)',
  textPrimary: 'rgba(255, 255, 255, 0.95)',
  textSecondary: 'rgba(255, 255, 255, 0.65)',
  palette: {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    danger: '#ff4d4f',
    info: '#9254de',
    neutral: '#8c8c8c',
  },
};

const readCssVariable = (variable: string, fallback: string) => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable);
  return value ? value.trim() || fallback : fallback;
};

export const getChartTheme = (): ChartTheme => ({
  background: readCssVariable('--bg-elevated', FALLBACK_THEME.background),
  axisLine: readCssVariable('--border-light', FALLBACK_THEME.axisLine),
  gridLine: readCssVariable('--border-base', FALLBACK_THEME.gridLine),
  tooltipBackground: readCssVariable('--bg-overlay', FALLBACK_THEME.tooltipBackground),
  textPrimary: readCssVariable('--text-primary', FALLBACK_THEME.textPrimary),
  textSecondary: readCssVariable('--text-tertiary', FALLBACK_THEME.textSecondary),
  palette: {
    primary: readCssVariable('--brand-primary', FALLBACK_THEME.palette.primary),
    success: readCssVariable('--brand-success', FALLBACK_THEME.palette.success),
    warning: readCssVariable('--brand-warning', FALLBACK_THEME.palette.warning),
    danger: readCssVariable('--brand-danger', FALLBACK_THEME.palette.danger),
    info: readCssVariable('--brand-info', FALLBACK_THEME.palette.info),
    neutral: readCssVariable('--text-disabled', FALLBACK_THEME.palette.neutral),
  },
});

export const getStatusColor = (
  status: 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'neutral',
  theme = getChartTheme(),
) => {
  switch (status) {
    case 'success':
      return theme.palette.success;
    case 'warning':
      return theme.palette.warning;
    case 'danger':
      return theme.palette.danger;
    case 'info':
      return theme.palette.info;
    case 'neutral':
      return theme.palette.neutral;
    default:
      return theme.palette.primary;
  }
};

export const getHeatmapColor = (score: number, theme = getChartTheme()) => {
  const clamped = Math.max(0, Math.min(100, score));
  if (clamped >= 90) {
    return theme.palette.success;
  }
  if (clamped >= 75) {
    return theme.palette.warning;
  }
  if (clamped >= 60) {
    return theme.palette.primary;
  }
  return theme.palette.danger;
};

export const buildStackedSegments = (values: Array<{ key: string; value: number }>) => {
  const total = values.reduce((acc, item) => acc + item.value, 0);
  if (total === 0) {
    return values.map((item) => ({ ...item, percent: 0 }));
  }
  return values.map((item) => ({ ...item, percent: (item.value / total) * 100 }));
};
