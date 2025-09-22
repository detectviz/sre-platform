import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, theme } from 'antd'
import App from './App'

// Create a client
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
        components: {
          Layout: {
            colorBgHeader: '#141519',
            colorBgBody: '#0A0B0E',
            colorBgTrigger: 'transparent',
          },
          Menu: {
            colorItemBg: 'transparent',
            colorSubItemBg: 'transparent',
            colorItemText: 'rgba(255, 255, 255, 0.85)',
            colorItemTextSelected: '#1890ff',
            colorItemBgSelected: 'rgba(24, 144, 255, 0.15)',
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>,
)