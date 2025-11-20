import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'antd-vendor': ['antd'],
          'utils': ['axios', 'zustand']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        // 调整为你本地后端端口（你报错中后端在 8888）
        target: 'http://localhost:8888',
        changeOrigin: true,
        // 转发到后端时去掉 /api 前缀（后端路由通常不包含 /api）
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
