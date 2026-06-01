import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: { port: 5173 },
  // GitHub Pages 部署时需要设置正确的 base 路径
  // 格式：/<仓库名>/
  // 如果是用户/组织主页（username.github.io），则设置为 '/'
  base: process.env.NODE_ENV === 'production' ? '/lexiloop/' : '/'
});
