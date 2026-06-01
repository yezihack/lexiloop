# Tauri 桌面版打包指南

## 📦 项目已配置 Tauri

词环 LexiLoop 现已支持打包为桌面应用程序，支持 Windows、macOS 和 Linux 系统。

## 🚀 本地开发

### 前置要求

1. **Node.js** (v18+)
2. **Rust** (最新稳定版)
   - Windows: 下载 [rustup-init.exe](https://rustup.rs/)
   - macOS/Linux: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

3. **系统依赖**
   - **Windows**: 需要安装 [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - **macOS**: 需要安装 Xcode Command Line Tools: `xcode-select --install`
   - **Linux (Ubuntu/Debian)**:
     ```bash
     sudo apt update
     sudo apt install libwebkit2gtk-4.1-dev \
       build-essential \
       curl \
       wget \
       file \
       libxdo-dev \
       libssl-dev \
       libayatana-appindicator3-dev \
       librsvg2-dev
     ```

### 开发命令

```bash
# 安装依赖
npm install

# 启动 Tauri 开发模式（会同时启动 Vite 和 Tauri）
npm run tauri:dev

# 仅启动 Web 开发模式
npm run dev
```

### 构建桌面应用

```bash
# 构建当前平台的桌面应用
npm run tauri:build
```

构建产物位置：
- Windows: `src-tauri/target/release/bundle/msi/` 和 `src-tauri/target/release/bundle/nsis/`
- macOS: `src-tauri/target/release/bundle/dmg/` 和 `src-tauri/target/release/bundle/macos/`
- Linux: `src-tauri/target/release/bundle/deb/` 和 `src-tauri/target/release/bundle/appimage/`

## 🏷️ 自动发布流程

### 创建 Release

项目已配置 GitHub Actions，当推送 tag 时会自动构建所有平台的安装包。

```bash
# 1. 更新版本号（在 package.json 和 src-tauri/tauri.conf.json 中）
# 2. 提交更改
git add .
git commit -m "chore: bump version to 1.0.0"

# 3. 创建并推送 tag
git tag v1.0.0
git push origin v1.0.0
```

### 自动构建的平台

- ✅ Windows (x64) - `.msi` 和 `.exe` 安装包
- ✅ macOS (Apple Silicon) - `.dmg` 安装包
- ✅ macOS (Intel) - `.dmg` 安装包
- ✅ Linux (x64) - `.AppImage` 和 `.deb` 安装包

### 发布产物

构建完成后，会自动创建 GitHub Release，包含：
- 所有平台的安装包
- 自动生成的 Release Notes
- 下载说明

## 📝 配置文件说明

### `src-tauri/tauri.conf.json`

主要配置项：
- `productName`: 应用名称（使用纯英文 "LexiLoop" 以避免 WiX 工具的编码问题）
- `version`: 应用版本（需与 package.json 保持一致）
- `identifier`: 应用唯一标识符（macOS Bundle ID / Windows App ID）
- `build.frontendDist`: 前端构建产物目录
- `app.windows.title`: 窗口标题（可以使用中文，如 "词环 LexiLoop"）

### `vite.config.js`

已配置自动检测 Tauri 环境：
- Tauri 桌面版使用相对路径 `./`
- GitHub Pages 使用 `/lexiloop/`
- 本地开发使用 `/`

## 🔧 自定义图标

如需更换应用图标：

1. 准备一个 1024x1024 的 PNG 图标文件
2. 使用 Tauri 图标生成工具：
   ```bash
   npm install -g @tauri-apps/cli
   tauri icon path/to/your/icon.png
   ```
3. 图标会自动生成到 `src-tauri/icons/` 目录

## 🐛 常见问题

### Windows 构建失败

确保已安装 Visual Studio C++ Build Tools，并重启终端。

### macOS 签名问题

如需发布到 App Store 或进行代码签名，需要配置：
- Apple Developer 账号
- 在 GitHub Secrets 中添加 `APPLE_CERTIFICATE` 和 `APPLE_CERTIFICATE_PASSWORD`

### Linux 依赖问题

确保安装了所有必需的系统库，特别是 `libwebkit2gtk-4.1-dev`。

## 📚 更多资源

- [Tauri 官方文档](https://tauri.app/)
- [Tauri GitHub Actions](https://github.com/tauri-apps/tauri-action)
- [词环 LexiLoop 项目](https://github.com/yezihack/lexiloop)

## 🎯 版本发布检查清单

- [ ] 更新 `package.json` 中的版本号
- [ ] 更新 `src-tauri/tauri.conf.json` 中的版本号
- [ ] 更新 `CHANGELOG.md`（如有）
- [ ] 测试本地构建是否成功
- [ ] 提交所有更改
- [ ] 创建并推送 tag
- [ ] 等待 GitHub Actions 完成构建
- [ ] 检查 Release 页面的安装包
- [ ] 在各平台测试安装包
