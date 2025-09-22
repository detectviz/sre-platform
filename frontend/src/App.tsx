import { useMemo, Suspense } from 'react'
import { App as AntdApp, Spin } from 'antd'
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom'

import { AppLayout } from './layouts/AppLayout'
import { menuItems, flatRoutes } from './config/routes'
import { generateBreadcrumb } from './utils/breadcrumb'
import { LazyRoute } from './components/LazyRoute'
// import { useLocalStorage } from './hooks/useLocalStorage'

const AppShell = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // const [themeMode] = useLocalStorage<'dark' | 'light'>('sre-theme-mode', 'dark')

  const breadcrumbItems = useMemo(() => {
    return generateBreadcrumb(location.pathname, menuItems)
  }, [location.pathname])

  const handleMenuSelect = (key: string) => {
    navigate(key)
  }

  return (
    <AppLayout
      menuItems={menuItems}
      breadcrumbItems={breadcrumbItems}
      onMenuSelect={handleMenuSelect}
    >
      <Routes>
        {flatRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<LazyRoute component={route.component} />}
          />
        ))}
      </Routes>
    </AppLayout>
  )
}

function App() {
  return (
    <AntdApp>
      <AppShell />
    </AntdApp>
  )
}

export default App
