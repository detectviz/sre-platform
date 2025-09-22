import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import App from './App';
import 'antd/dist/reset.css';
import './styles/design-system.css';

// 應用程式的主要進入點，負責掛載 React 元件樹並配置全域主題
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: antdTheme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          colorInfo: '#1890ff',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          colorBgBase: '#0a0b0e',
          colorTextBase: 'rgba(255, 255, 255, 0.85)',
          colorBorder: 'rgba(255, 255, 255, 0.12)',
          borderRadiusLG: 16,
          fontFamily: 'Inter, Noto Sans TC, PingFang TC, sans-serif'
        },
        components: {
          Layout: {
            headerBg: 'rgba(10, 11, 14, 0.65)',
            bodyBg: '#0a0b0e',
            siderBg: 'rgba(10, 11, 14, 0.95)'
          },
          Menu: {
            itemSelectedColor: 'rgba(255, 255, 255, 0.95)',
            itemHoverColor: 'rgba(255, 255, 255, 0.95)',
            itemHoverBg: 'rgba(255, 255, 255, 0.08)',
            itemActiveBg: 'rgba(24, 144, 255, 0.15)',
            colorItemText: 'rgba(255, 255, 255, 0.75)'
          },
          Card: {
            colorBgContainer: 'rgba(26, 29, 35, 0.92)',
            borderRadiusLG: 16
          },
          Table: {
            colorBgContainer: 'transparent',
            headerBg: 'rgba(255, 255, 255, 0.04)',
            colorText: 'rgba(255, 255, 255, 0.85)'
          },
          Tabs: {
            itemColor: 'rgba(255, 255, 255, 0.65)',
            itemSelectedColor: 'rgba(255, 255, 255, 0.95)',
            inkBarColor: '#1890ff'
          },
          Segmented: {
            itemSelectedColor: 'rgba(255, 255, 255, 0.95)',
            itemSelectedBg: 'rgba(24, 144, 255, 0.2)'
          }
        }
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);
