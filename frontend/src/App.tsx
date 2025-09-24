import React, { useMemo, useCallback } from 'react'
import { App as AntdApp } from 'antd'
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

// 錯誤邊界組件
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application Error:', error, errorInfo)
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h1>發生錯誤</h1>
          <p>很抱歉，應用程式遇到了一個錯誤。</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              marginTop: '20px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            重新載入頁面
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

const AppShell = React.memo(() => {
  const navigate = useNavigate()
  const location = useLocation()

  const breadcrumbItems = useMemo(() => {
    return generateBreadcrumb(location.pathname, menuItems)
  }, [location.pathname])

  const handleMenuSelect = useCallback((key: string) => {
    navigate(key)
  }, [navigate])

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
})

function App() {
  return (
    <ErrorBoundary>
      <AntdApp>
        <AppShell />
      </AntdApp>
    </ErrorBoundary>
  )
}

export default App
