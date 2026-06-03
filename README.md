# <img src="public/favicon.svg" width="32" height="32" align="center" /> 词环 LexiLoop

一款轻量、离线可用的英语单词循环记忆工具（联网则仿真人语音）。纯前端应用，无需注册、无需联网（首次加载后），数据保存在浏览器本地。

![20260601155903](https://cdn.jsdelivr.net/gh/yezihack/assets/b/20260601155903.png)

## 📥 使用

**在线版**：<https://yezihack.github.io/lexiloop/>

**桌面版**：前往 [Releases](https://github.com/yezihack/lexiloop/releases) 下载
- Windows: `.msi` 或 `.exe`
- macOS: `.dmg` (Apple Silicon 选 aarch64，Intel 选 x86_64)
- Linux: `.AppImage` 或 `.deb`

## ✨ 功能特性

- **5 种学习模式**：卡片翻转、列表浏览、蚕食（消消乐）、测验考试、统计分析
- **进度追踪**：自动记录已学单词和熟练度，错题本自动收集
- **扩展词库**：支持自定义词库，可按需添加
- **语音朗读**：英音/美音切换，在线支持真人语音。
- **主题切换**：浅色/深色模式
- **离线可用**：数据本地存储，无需联网

> 蚕食模式参考：<https://github.com/KyleBing/vocabulary>  
> 词库来源：<https://github.com/KyleBing/english-vocabulary>

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### Web 版开发
```bash
npm run dev          # 开发模式（http://localhost:5173）
npm run build        # 构建生产版本
npm run preview      # 预览构建结果
```

### 桌面版开发
```bash
npm run tauri:dev    # 启动桌面版开发
npm run tauri:build  # 构建桌面应用（产物在 src-tauri/target/release/bundle/）
```

## 📚 自定义词库

### 1. 创建词库文件

在 `extra/` 目录创建 JSON 文件，如 `my_words.json`：

```json
[
  {
    "id": 200000,
    "w": "hello",
    "uk": "həˈləʊ",
    "us": "həˈloʊ",
    "m": "interj. 你好；喂",
    "f": 0
  }
]
```

**字段说明**：`id` 唯一标识 | `w` 单词 | `uk/us` 音标 | `m` 释义 | `f` 熟练度

### 2. 注册词库

编辑 `extra/index.json`：

```json
[
  {
    "bookid": 8,
    "bookname": "我的自定义词库",
    "file": "my_words.json",
    "priority": 90
  }
]
```

### 3. 刷新应用

重启应用，新词库出现在书架中。

## 📦 发布新版本

### 自动发布（推荐）

```powershell
# Windows
.\scripts\release.ps1 -Version "1.0.0"
```

```bash
# macOS/Linux
./scripts/release.sh 1.0.0
```

脚本会自动：更新版本号 → 提交更改 → 创建 tag → 推送并触发 GitHub Actions

### 手动发布

```bash
# 1. 更新版本号：package.json 和 src-tauri/tauri.conf.json
# 2. 更新 CHANGELOG.md

# 3. 提交并打 tag
git add .
git commit -m "chore: bump version to 1.0.0"
git tag -a v1.0.0 -m "Release v1.0.0"

# 4. 推送
git push origin main
git push origin v1.0.0
```

推送 tag 后，GitHub Actions 会自动构建所有平台（约 15-30 分钟）并创建 Release。

## 📂 项目结构

```
├── extra/                  # 扩展词库
│   ├── index.json         # 词库索引
│   └── *.json             # 词库数据
├── public/data/           # 内置词库（书籍 1-7）
├── src/
│   ├── components/        # Vue 组件
│   ├── store.js          # Pinia 状态管理
│   └── main.js           # 应用入口
├── src-tauri/             # Tauri 桌面版配置
└── scripts/
    ├── build-data.mjs    # 数据构建脚本
    ├── release.ps1       # Windows 发布脚本
    └── release.sh        # macOS/Linux 发布脚本
```

## 🛠️ 技术栈

Vue 3 · Pinia · Vite · Tauri · ECharts

## 📋 更新日志

### [1.0.0] - 2026-06-01

**新增**
- 桌面版支持（Windows、macOS、Linux）
- 5 种学习模式（卡片、列表、蚕食、测验、统计）
- 语音朗读（英音/美音）
- 多词库支持和自定义词库
- 主题切换和学习进度可视化

**技术说明**
- 桌面版使用 `LexiLoop` 作为产品名（避免 WiX 中文编码问题）
- 窗口标题显示 `词环 LexiLoop`（保留中文）

## 📄 许可证

见 [LICENSE](./LICENSE) 文件