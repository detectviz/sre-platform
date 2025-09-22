import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 針對 SRE 平台前端應用的 Vite 設定檔案
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  }
});
