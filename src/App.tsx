import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store/store';
import type { RootState } from './store/store';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ResourcesPage from './pages/ResourcesPage';
import IncidentsPage from './pages/IncidentsPage';
import PersonnelPage from './pages/Organization/PersonnelPage';
import TeamsPage from './pages/Organization/TeamsPage';

/**
 * 受保護的路由元件
 * 檢查使用者是否已經過認證，如果未認證，則導向到登入頁面。
 */
const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // 如果已認證，則渲染 MainLayout (其內部會再透過 <Outlet> 渲染子路由)
  // 否則，導向到 /login
  return isAuthenticated ? <MainLayout /> : <Navigate to="/login" />;
};

/**
 * 應用程式的主路由設定
 */
const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 登入頁面路由 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 受保護的路由群組 */}
        <Route path="/" element={<ProtectedRoute />}>
          {/* 儀表板路由，作為預設的子路由 */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="organization/personnel" element={<PersonnelPage />} />
          <Route path="organization/teams" element={<TeamsPage />} />
          {/* 未來可以在此處加入更多受保護的路由 */}
        </Route>

        {/* 根路徑重新導向 */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

/**
 * 應用程式的根元件
 * 使用 Provider 將 Redux store 提供給整個應用程式。
 */
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
};

export default App;
