import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// 渲染應用程式的根元件
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
