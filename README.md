# <img src="public/favicon.svg" width="32" height="32" align="center" /> 词环.背单词

一款轻量、离线可用的英语单词循环记忆工具

词环是一个纯前端单词学习应用，无需注册、无需联网（首次加载后），数据保存在浏览器本地。

它通过多种学习模式帮助你高效记忆英语词汇。

## 功能特性

- **多种学习模式**：卡片、列表、蚕食、测验、统计
- **学习进度追踪**：自动记录已学单词和熟练度
- **扩展词库支持**：可自定义添加词库
- **语音朗读**：支持单词发音
- **数据持久化**：学习进度本地保存

![20260601155903](https://cdn.jsdelivr.net/gh/yezihack/assets/b/20260601155903.png)

1. 其中蚕食参考: <https://github.com/KyleBing/vocabulary>
2. 词库来源：<https://github.com/KyleBing/english-vocabulary>


## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 如何新增扩展词库

扩展词库存放在 `extra/` 目录下，通过 `extra/index.json` 配置文件管理。

### 步骤 1：创建词库 JSON 文件

在 `extra/` 目录下创建新的 JSON 文件，例如 `my_words.json`：

```json
[
  {
    "id": 200000,
    "w": "hello",
    "uk": "həˈləʊ",
    "us": "həˈloʊ",
    "m": "interj. 你好；喂",
    "f": 0
  },
  {
    "id": 200001,
    "w": "world",
    "uk": "wɜːld",
    "us": "wɜːrld",
    "m": "n. 世界；地球",
    "f": 0
  }
]
```

**字段说明：**

- `id`：单词唯一标识（建议使用不重复的数字）
- `w`：单词拼写
- `uk`：英式音标（可选）
- `us`：美式音标（可选）
- `m`：中文释义
- `f`：熟练度标记（初始为 0）

### 步骤 2：注册词库到索引文件

编辑 `extra/index.json`，添加新词库配置：

```json
[
  {
    "bookid": 7,
    "bookname": "基础英语 850 词（带音标）",
    "file": "u850_phonetics.json",
    "priority": 100
  },
  {
    "bookid": 8,
    "bookname": "我的自定义词库",
    "file": "my_words.json",
    "priority": 90
  }
]
```

**字段说明：**

- `bookid`：词库唯一 ID（不要与现有 ID 重复）
- `bookname`：词库显示名称
- `file`：词库文件名（相对于 `extra/` 目录）
- `priority`：优先级（数字越大越靠前）

### 步骤 3：重启应用

保存文件后刷新页面，新词库将出现在书架中。

## 项目结构

```
.
├── extra/                  # 扩展词库目录
│   ├── index.json         # 词库索引配置
│   └── *.json             # 词库数据文件
├── public/
│   └── data/              # 内置词库（书籍 1-7）
├── src/
│   ├── components/        # Vue 组件
│   ├── store.js          # 状态管理
│   └── main.js           # 应用入口
└── scripts/
    └── build-data.mjs    # 数据构建脚本
```

## 技术栈

- Vue 3
- Pinia（状态管理）
- Vite（构建工具）
- ECharts（数据可视化）

## 许可证

见 LICENSE 文件