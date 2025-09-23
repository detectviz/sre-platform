// 主題配置常量
export const THEME_COLORS = {
  // 主色調
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  info: '#13c2c2',

  // 分類顏色
  categories: {
    '全部': '#1890ff',
    '基礎設施洞察': '#1890ff',
    '業務與 SLA 指標': '#52c41a',
    '營運與容量': '#fa8c16',
    '自動化與效率': '#9254de',
    '團隊自訂': '#13c2c2',
  },

  // 狀態顏色
  status: {
    success: 'var(--brand-success)',
    warning: 'var(--brand-warning)',
    danger: 'var(--brand-danger)',
    info: 'var(--brand-info)',
  },

  // 背景和邊框
  background: {
    elevated: 'var(--bg-elevated)',
    container: 'var(--bg-container)',
    overlay: 'rgba(255, 255, 255, 0.05)',
  },

  border: {
    light: 'var(--border-light)',
    color: 'var(--border-color)',
    divider: 'rgba(255, 255, 255, 0.2)',
  },

  // 文字顏色
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    white: 'white',
    contrast: 'rgba(255, 255, 255, 0.85)',
  },
} as const

// 通用樣式配置
export const COMMON_STYLES = {
  // 間距
  spacing: {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)',
    '2xl': 'var(--spacing-2xl)',
  },

  // 圓角
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
  },

  // 陰影
  shadow: {
    button: '0 2px 8px rgba(0, 0, 0, 0.1)',
    card: '0 4px 12px rgba(0, 0, 0, 0.15)',
    modal: '0 8px 32px rgba(0, 0, 0, 0.25)',
  },

  // 表格樣式
  table: {
    container: {
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-lg)',
    },
    pagination: {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
    }
  },

  // 按鈕樣式
  button: {
    height: {
      small: '32px',
      medium: '36px',
      large: '40px',
    },
    padding: {
      small: '0 12px',
      medium: '0 14px',
      large: '0 16px',
    },
  },

  // 字體大小
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '13px',
    md: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '24px',
  },
} as const

// 分類按鈕樣式配置
export const getCategoryButtonStyle = (isSelected: boolean = false) => {
  return {
    height: COMMON_STYLES.button.height.medium,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: COMMON_STYLES.button.padding.medium,
    fontWeight: 500,
    border: 'none',
    borderRadius: '0',
    background: isSelected ? 'var(--brand-primary)' : THEME_COLORS.background.overlay,
    color: isSelected ? THEME_COLORS.text.white : THEME_COLORS.text.contrast,
    position: 'relative' as const,
  }
}

// KPI 卡片樣式
export const KPI_CARD_STYLES = {
  container: {
    background: THEME_COLORS.background.elevated,
    border: `1px solid ${THEME_COLORS.border.light}`,
    borderRadius: COMMON_STYLES.radius.lg,
  },

  header: {
    fontSize: COMMON_STYLES.fontSize.md,
    color: THEME_COLORS.text.secondary,
    marginBottom: COMMON_STYLES.spacing.xs,
  },

  value: {
    fontSize: COMMON_STYLES.fontSize['2xl'],
    fontWeight: 600,
    color: THEME_COLORS.text.primary,
    marginBottom: COMMON_STYLES.spacing.xs,
  },

  description: {
    fontSize: COMMON_STYLES.fontSize.sm,
    color: THEME_COLORS.text.secondary,
  },
} as const

// 工具欄樣式
export const TOOLBAR_STYLES = {
  container: {
    width: '100%',
    marginBottom: COMMON_STYLES.spacing.xl,
  },

  buttonGroup: {
    borderRadius: COMMON_STYLES.radius.lg,
    overflow: 'hidden',
    boxShadow: COMMON_STYLES.shadow.button,
    border: `1px solid ${THEME_COLORS.border.divider}`,
  },

  leftSection: {
    display: 'flex',
    alignItems: 'center',
  },

  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: COMMON_STYLES.spacing.md,
  },
} as const