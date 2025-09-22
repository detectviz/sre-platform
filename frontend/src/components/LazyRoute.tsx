import React, { Suspense, ComponentType, lazy } from 'react'
import { Spin } from 'antd'

// 懶加載組件包裝器
interface LazyRouteProps {
  component: Promise<{ default: ComponentType<any> }>
}

export const LazyRoute: React.FC<LazyRouteProps> = ({ component }) => {
  // 創建懶加載組件
  const LazyComponent = lazy(() => component)

  return (
    <Suspense
      fallback={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px'
        }}>
          <Spin size="large" />
        </div>
      }
    >
      <LazyComponent />
    </Suspense>
  )
}