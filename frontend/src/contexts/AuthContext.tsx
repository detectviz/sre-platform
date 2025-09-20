import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// 定義使用者的類型
interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

// 定義 AuthContext 的類型
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// 建立 AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 建立 AuthProvider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模擬檢查 local storage 或 session storage 中是否有 token
    const token = sessionStorage.getItem('authToken');
    if (token) {
      // 在實際應用中，你會在這裡驗證 token 並獲取使用者資訊
      const mockUser: User = {
        id: 'user-001',
        name: '管理員',
        email: 'admin@example.com',
        roles: ['super_admin'],
      };
      setUser(mockUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    console.log(`正在嘗試登入，使用者: ${email}`);
    // 模擬 API 呼叫
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@example.com' && pass === 'password') {
          const mockUser: User = {
            id: 'user-001',
            name: '管理員',
            email: 'admin@example.com',
            roles: ['super_admin'],
          };
          setUser(mockUser);
          sessionStorage.setItem('authToken', 'mock-jwt-token'); // 儲存模擬 token
          console.log('登入成功');
          resolve();
        } else {
          console.log('登入失敗: 帳號或密碼錯誤');
          reject(new Error('帳號或密碼錯誤'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('authToken'); // 移除模擬 token
    console.log('已登出');
  };

  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 建立一個自定義 hook，方便在其他元件中使用 AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必須在 AuthProvider 內部使用');
  }
  return context;
};
