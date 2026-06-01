import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  // Tauri 桌面版使用相对路径
  // Web 版（GitHub Pages）使用 /lexiloop/
  const base = mode === 'tauri' ? './' : (process.env.NODE_ENV === 'production' ? '/lexiloop/' : '/');
  
  return {
    plugins: [vue()],
    server: { port: 5173 },
    base,
    // 确保资源使用相对路径
    build: {
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  };
});
