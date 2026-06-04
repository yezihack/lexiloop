#!/usr/bin/env node

/**
 * 为本地构建生成 README 说明文件
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const distLocalDir = resolve(projectRoot, 'dist-local');
const readmePath = resolve(distLocalDir, 'README.md');

const readmeContent = `# 词环 LexiLoop - 本地预览版

本目录是 \`npm run build:local\` 生成的本地预览版本。

## 🎯 与 dist 的区别

- **dist/** - 用于 GitHub Pages 部署（路径包含 \`/lexiloop/\` 前缀）
- **dist-local/** - 本地预览专用（根路径 \`/\`，无前缀）

## 🚀 本地预览方法

### 方法 1：使用 npm 命令（推荐）

\`\`\`bash
# 构建本地版本
npm run build:local

# 启动本地服务器
npm run preview:local

# 浏览器访问
http://localhost:3000
\`\`\`

### 方法 2：使用 serve

\`\`\`bash
# 全局安装 serve（只需一次）
npm install -g serve

# 启动服务器
serve dist-local

# 浏览器访问
http://localhost:3000
\`\`\`

### 方法 3：使用 Python

\`\`\`bash
cd dist-local
python -m http.server 8000

# 浏览器访问
http://localhost:8000
\`\`\`

### 方法 4：使用 VS Code Live Server

1. 安装 VS Code 扩展：Live Server
2. 右键 \`index.html\`
3. 选择 "Open with Live Server"

## 📁 文件说明

- \`index.html\` - 入口文件（根路径，无前缀）
- \`assets/\` - JavaScript 和 CSS 资源
- \`data/\` - 词库数据文件
- \`favicon.svg\` - 网站图标
- \`help.html\` - 帮助页面

## ⚠️ 注意事项

1. **必须使用本地服务器**：直接双击 index.html 会因为 CORS 限制无法加载数据文件
2. **仅供本地预览**：不要将此版本部署到生产环境
3. **生产部署请使用**：\`npm run build\` 生成的 \`dist/\` 目录

## 🌐 在线版本

正式在线版本：https://yezihack.github.io/lexiloop/

## 📦 重新构建

\`\`\`bash
npm run build:local
\`\`\`

---

**词环 LexiLoop** - 轻量、离线、开源的英语单词学习工具

- GitHub: https://github.com/yezihack/lexiloop
- 在线版: https://yezihack.github.io/lexiloop/
`;

try {
  writeFileSync(readmePath, readmeContent, 'utf-8');
  console.log('✅ 本地预览说明已生成: dist-local/README.md');
  console.log('');
  console.log('💡 快速启动:');
  console.log('   npm run preview:local');
  console.log('   然后访问: http://localhost:3000');
} catch (error) {
  console.error('❌ 生成 README 失败:', error.message);
  process.exit(1);
}
