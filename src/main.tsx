import React from 'react'
import ReactDOM from 'react-dom/client'
import AppWrapper from './App.tsx'
import './styles/design-system.css'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
)
