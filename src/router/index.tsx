import React, { ReactNode } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import ResourcesPage from '../pages/ResourcesPage';
import IncidentsPage from '../pages/IncidentsPage';
import AutomationCenterPage from '../pages/AutomationCenterPage';

// A wrapper for protected routes
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

const AppRouter = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <MainLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <HomePage /> },
            { path: 'home', element: <HomePage /> },
            { path: 'resources', element: <ResourcesPage /> },
            { path: 'resource-list', element: <ResourcesPage /> },
            { path: 'resource-groups', element: <ResourcesPage /> },
            { path: 'incidents', element: <IncidentsPage /> },
            { path: 'incident-list', element: <IncidentsPage /> },
            { path: 'alerting-rules', element: <IncidentsPage /> },
            { path: 'silences', element: <IncidentsPage /> },
            { path: 'automation', element: <AutomationCenterPage /> },
            { path: 'scripts', element: <AutomationCenterPage /> },
            { path: 'schedules', element: <AutomationCenterPage /> },
            { path: 'executions', element: <AutomationCenterPage /> },
            // Add other routes here as they are created
        ],
    },
]);

export default AppRouter;
