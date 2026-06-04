import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  // Tauri 桌面版使用相对路径
  // Preview 本地预览版使用根路径
  // Web 版（GitHub Pages）使用 /lexiloop/
  let base = '/';
  
  if (mode === 'tauri') {
    base = './';
  } else if (mode === 'preview') {
    base = '/';
  } else if (process.env.NODE_ENV === 'production') {
    base = '/lexiloop/';
  }
  
  return {
    plugins: [vue()],
    server: { port: 7003 },
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
