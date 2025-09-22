import type { MenuProps } from 'antd'
import { routePathMapping } from '../config/routes'

// 麵包屑項目接口
export interface BreadcrumbItem {
  title: string
  href?: string
}

// 查找路由軌跡的工具函數
export const findRouteTrail = (
  path: string,
  items: MenuProps['items']
): BreadcrumbItem[] => {
  if (!items) return []

  for (const item of items) {
    if (typeof item === 'object' && item && 'key' in item && 'label' in item) {
      if (item.key === path) {
        return [{ title: item.label as string }]
      }

      if ('children' in item && item.children) {
        const childTrail = findRouteTrail(path, item.children)
        if (childTrail.length > 0) {
          return [{ title: item.label as string }, ...childTrail]
        }
      }
    }
  }
  return []
}

// 生成麵包屑的主函數
export const generateBreadcrumb = (
  currentPath: string,
  menuItems: MenuProps['items']
): BreadcrumbItem[] => {
  // 處理路由映射
  let processedPath = currentPath

  // 處理自動化路由
  if (currentPath.startsWith('/automation') && currentPath !== '/automation/capacity-planning') {
    processedPath = '/automation/scripts'
  }

  // 處理設定頁面路由
  if (currentPath.startsWith('/settings/')) {
    if (currentPath === '/settings/profile') {
      processedPath = '/profile/personal'
    } else {
      processedPath = '/settings'
    }
  }

  // 檢查路由映射
  if (routePathMapping[currentPath]) {
    processedPath = routePathMapping[currentPath]
  }

  const trail = findRouteTrail(processedPath, menuItems)

  // 如果沒有找到軌跡且不是首頁，添加首頁鏈接
  if (trail.length === 0 && currentPath !== '/') {
    trail.push({ title: '首頁', href: '/' })
  }

  return trail
}