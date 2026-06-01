# 🚀 快速开始

## 📥 安装依赖

```bash
npm install
```

## 💻 开发模式

### Web 版开发
```bash
npm run dev
# 访问 http://localhost:5173
```

### 桌面版开发
```bash
npm run tauri:dev
# 会自动打开桌面应用窗口
```

## 🏗️ 构建

### Web 版构建
```bash
npm run build
# 产物在 dist/ 目录
```

### 桌面版构建
```bash
npm run tauri:build
# 产物在 src-tauri/target/release/bundle/
```

## 📦 发布新版本

### 自动发布（推荐）

**Windows:**
```powershell
.\scripts\release.ps1 -Version "1.0.0"
```

**macOS/Linux:**
```bash
./scripts/release.sh 1.0.0
```

### 手动发布

```bash
# 1. 更新版本号
#    - package.json
#    - src-tauri/tauri.conf.json

# 2. 提交并打 tag
git add .
git commit -m "chore: bump version to 1.0.0"
git tag -a v1.0.0 -m "Release v1.0.0"

# 3. 推送
git push origin main
git push origin v1.0.0
```

## 🔗 重要链接

- **在线版**: <https://yezihack.github.io/lexiloop/>
- **GitHub**: <https://github.com/yezihack/lexiloop>
- **Releases**: <https://github.com/yezihack/lexiloop/releases>
- **Actions**: <https://github.com/yezihack/lexiloop/actions>

## 📚 详细文档

- [Tauri 使用指南](./TAURI_GUIDE.md)
- [发布指南](./RELEASE.md)
- [配置总结](./TAURI_SETUP_SUMMARY.md)
- [更新日志](./CHANGELOG.md)

## ⚡ 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Web 开发服务器 |
| `npm run build` | 构建 Web 版本 |
| `npm run tauri:dev` | 启动桌面版开发 |
| `npm run tauri:build` | 构建桌面版 |
| `npm run build:data` | 构建词库数据 |

## 🎯 发布检查清单

- [ ] 更新版本号（package.json + tauri.conf.json）
- [ ] 更新 CHANGELOG.md
- [ ] 本地测试构建成功
- [ ] 提交所有更改
- [ ] 创建并推送 tag
- [ ] 等待 GitHub Actions 完成
- [ ] 测试下载的安装包

## 💡 提示

- 推送 tag 后会自动构建 Windows、macOS、Linux 版本
- 构建时间约 15-30 分钟
- 构建完成后会自动创建 GitHub Release
