import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// 通用頁面tab管理 Hook
export const useTabs = (defaultTab: string, routeMapping: Record<string, string>, tabRoutes: Record<string, string[]> = {}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(defaultTab)

  // 根據當前路由設置activeTab
  useEffect(() => {
    const path = location.pathname

    // 首先檢查 routeMapping
    const tabKey = Object.keys(routeMapping).find(key => {
      const route = routeMapping[key]
      return path === route || path.startsWith(route + '/')
    })

    if (tabKey) {
      setActiveTab(tabKey)
    } else {
      // 檢查是否匹配任何子路由（使用最佳匹配算法）
      let bestMatch: { tabKey: string; matchLength: number } | null = null

      for (const [tabKey, routes] of Object.entries(tabRoutes)) {
        const routeList = routes || []

        for (const route of routeList) {
          let routeMatches = false
          let matchLength = 0

          if (path === route) {
            routeMatches = true
            matchLength = route.length
          } else if (path.startsWith(route + '/')) {
            routeMatches = true
            matchLength = route.length
          }

          if (routeMatches) {
            // 如果找到更好的匹配（更長的匹配），更新最佳匹配
            if (bestMatch === null || matchLength > bestMatch.matchLength) {
              bestMatch = { tabKey, matchLength }
            }
          }
        }
      }

      if (bestMatch) {
        setActiveTab(bestMatch.tabKey)
      } else {
        setActiveTab(defaultTab)
      }
    }
  }, [location.pathname, routeMapping, tabRoutes, defaultTab])

  // 處理tab切換並更新路由
  const handleTabChange = (key: string) => {
    // 防止重複點擊
    if (activeTab === key) {
      return
    }

    setActiveTab(key)

    // 優先使用 routeMapping
    if (routeMapping[key]) {
      navigate(routeMapping[key])
    } else if (tabRoutes[key] && tabRoutes[key].length > 0) {
      // 其次使用 tabRoutes 的第一個路由
      const targetRoute = tabRoutes[key][0]
      navigate(targetRoute)
    }
  }

  return {
    activeTab,
    handleTabChange,
  }
}
