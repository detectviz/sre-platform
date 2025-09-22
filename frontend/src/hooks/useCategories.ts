import { useState, useMemo } from 'react'
import { generateCategories, filterDataByCategory, type CategoryConfig } from '../utils/category'

// 分類管理 Hook
export const useCategories = <T extends Record<string, any>>(
  data: T[],
  categoryField: string = 'category',
  searchFields: string[] = ['name']
) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部')
  const [searchText, setSearchText] = useState<string>('')

  // 生成分類配置
  const categories = useMemo(() => {
    return generateCategories(data, categoryField)
  }, [data, categoryField])

  // 過濾後的資料
  const filteredData = useMemo(() => {
    return filterDataByCategory(data, selectedCategory, searchText, categoryField, searchFields)
  }, [data, selectedCategory, searchText, categoryField, searchFields])

  // 重置篩選
  const resetFilters = () => {
    setSelectedCategory('全部')
    setSearchText('')
  }

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
    searchText,
    setSearchText,
    filteredData,
    resetFilters,
  }
}