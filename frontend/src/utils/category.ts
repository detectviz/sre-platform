import { THEME_COLORS } from '../constants/theme'

// 分類配置類型
export interface CategoryConfig {
  key: string
  label: string
  count: number
  color: string
}

// 獲取分類顏色的工具函數
export const getCategoryColor = (categoryKey: string): string => {
  return THEME_COLORS.categories[categoryKey as keyof typeof THEME_COLORS.categories] || THEME_COLORS.primary
}

// 生成分類配置
export const generateCategories = (data: any[], categoryField: string = 'category'): CategoryConfig[] => {
  const categoryMap = new Map<string, number>()

  // 統計每個分類的數量
  data.forEach(item => {
    const category = item[categoryField]
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
  })

  // 生成分類配置，包含 "全部" 選項
  const categories: CategoryConfig[] = [
    {
      key: '全部',
      label: '全部',
      count: data.length,
      color: getCategoryColor('全部')
    }
  ]

  // 添加其他分類
  categoryMap.forEach((count, category) => {
    categories.push({
      key: category,
      label: category,
      count,
      color: getCategoryColor(category)
    })
  })

  return categories
}

// 過濾數據的工具函數
export const filterDataByCategory = <T extends Record<string, any>>(
  data: T[],
  selectedCategory: string,
  searchText: string = '',
  categoryField: string = 'category',
  searchFields: string[] = ['name']
): T[] => {
  return data.filter(item => {
    // 分類篩選
    const matchesCategory = selectedCategory === '全部' || item[categoryField] === selectedCategory

    // 搜尋篩選
    const matchesSearch = searchText === '' || searchFields.some(field =>
      item[field]?.toLowerCase().includes(searchText.toLowerCase())
    )

    return matchesCategory && matchesSearch
  })
}

// 分類按鈕樣式生成器
export const getCategoryButtonStyle = (
  categoryKey: string,
  isSelected: boolean,
  index: number,
  totalCount: number
) => {
  const color = getCategoryColor(categoryKey)

  return {
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0 14px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '0',
    background: isSelected ? 'var(--brand-primary)' : 'rgba(255, 255, 255, 0.05)',
    color: isSelected ? 'white' : 'rgba(255, 255, 255, 0.85)',
    borderRight: index < totalCount - 1 ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
    position: 'relative' as const,
  }
}

// 分類指示器樣式
export const getCategoryIndicatorStyle = (categoryKey: string) => {
  if (categoryKey === '全部') return null

  const color = getCategoryColor(categoryKey)
  return {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: color,
    opacity: 0.8
  }
}

// 分類計數器樣式
export const getCategoryCountStyle = (categoryKey: string) => {
  const color = getCategoryColor(categoryKey)
  return {
    background: `${color}20`,
    color: color,
    padding: '2px 6px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 600,
    minWidth: '18px',
    textAlign: 'center' as const,
    lineHeight: '14px'
  }
}