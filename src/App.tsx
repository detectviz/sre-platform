// 檔案: src/App.tsx
// 描述: 應用程式的根元件，負責設定前端路由。
// 在現代的 React/JSX 轉換中，不再需要在每個檔案中都 'import React'。

// 引入 React Router 的核心元件
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
// 引入我們建立的容量預測頁面
import CapacityForecastPage from './pages/CapacityForecastPage';

/**
 * 設定應用的路由表。
 */
const router = createBrowserRouter([
  {
    // 當使用者訪問根路徑 ("/") 時，將他們重導向到 "/capacity-forecast"
    path: "/",
    element: <Navigate to="/capacity-forecast" replace />,
  },
  {
    // 定義 "/capacity-forecast" 路徑，並渲染對應的頁面元件
    path: "/capacity-forecast",
    element: <CapacityForecastPage />,
  },
]);

/**
 * 應用程式的主 App 元件。
 * 它的職責是提供由 createBrowserRouter 建立的路由功能。
 */
function App() {
  return <RouterProvider router={router} />;
}

export default App;
