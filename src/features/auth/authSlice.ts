import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../store/store';

// 定義使用者的基本資訊結構
interface User {
  name: string;
}

// 定義認證狀態的結構
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// 初始狀態
const initialState: AuthState = {
  isAuthenticated: false, // 預設為未認證
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 登入 action
    login: (state, action: { payload: User }) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    // 登出 action
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

// 導出 actions
export const { login, logout } = authSlice.actions;

// 導出一個 selector，方便其他元件讀取認證狀態
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

// 導出 reducer
export default authSlice.reducer;
