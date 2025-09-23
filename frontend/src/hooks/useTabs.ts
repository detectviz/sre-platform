import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// 通用頁面tab管理 Hook
export const useTabs = (defaultTab: string, routeMapping: Record<string, string>) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(defaultTab)

  // 根據當前路由設置activeTab
  useEffect(() => {
    const path = location.pathname
    const tabKey = Object.keys(routeMapping).find(key => {
      const route = routeMapping[key]
      return path === route || path.startsWith(route + '/')
    })
    if (tabKey) {
      setActiveTab(tabKey)
    } else {
      setActiveTab(defaultTab)
    }
  }, [location.pathname, routeMapping, defaultTab])

  // 處理tab切換並更新路由
  const handleTabChange = (key: string) => {
    setActiveTab(key)
    if (routeMapping[key]) {
      navigate(routeMapping[key])
    }
  }

  return {
    activeTab,
    handleTabChange,
  }
}
