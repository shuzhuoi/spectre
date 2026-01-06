# Spectre 项目技术分析文档

## 📋 项目概述

**项目名称**: Spectre - AI 文本补全编辑器  
**项目描述**: 基于 Vue 3 + Monaco Editor 实现的 AI 文本补全功能，类似于 Cursor/Copilot 的代码补全体验  
**核心特性**: 输入文字后，AI 自动预测并以灰色"幽灵文字"显示补全建议，按 Tab 接受补全

---

## 🛠️ 技术栈分析

### 前端框架与构建工具
- **Vue 3.4.21** - 采用 Composition API + TypeScript 开发
- **Vite 5.2.0** - 现代化构建工具，提供快速的开发体验
- **TypeScript 5.4.0** - 类型安全的开发体验
- **Node.js >= 20.16.0** - 运行环境要求
- **pnpm >= 9.6.0** - 包管理器

### UI 组件库
- **Element Plus 2.6.3** - Vue 3 UI 组件库
  - 用于工具栏按钮、下拉选择、消息提示等
  - 提供主题切换、语言选择等交互组件

### 核心编辑器
- **Monaco Editor 0.47.0** - VS Code 同款编辑器
  - 提供代码高亮、语法检查
  - 支持多语言（JavaScript、TypeScript、Python、Java、Go、Rust 等）
  - 内置内联补全（Inline Completion）机制
- **vite-plugin-monaco-editor 1.1.0** - Monaco Editor 的 Vite 插件

### AI 集成
- **OpenAI Node.js SDK 4.29.0** - 官方 SDK
  - 支持流式输出（Stream）
  - 兼容 OpenAI、Azure OpenAI、通义千问、Ollama 等服务
  - 可配置 baseURL 和 apiKey

### 状态管理与工具库
- **Pinia 2.1.7** - Vue 3 官方推荐的状态管理库
- **Vue Router 4.3.0** - 路由管理
- **VueUse 10.9.0** - Vue Composition API 工具集
  - 使用 `useDebounceFn` 实现防抖
- **Axios 1.6.8** - HTTP 客户端（预留）
- **Lodash-es 4.17.21** - 工具函数库
- **Day.js 1.11.10** - 日期处理库
- **Mitt 3.0.1** - 事件总线

### 样式与 UI 增强
- **Sass 1.72.0** - CSS 预处理器
- **NProgress 0.2.0** - 页面加载进度条

### 部署方案
- **Docker + Nginx** - 容器化部署
  - 多阶段构建优化镜像大小
  - Nginx 作为静态资源服务器
  - 支持 Docker Compose 一键部署

---

## 📁 项目目录结构详解

```
spectre/
├── .cursor/                    # Cursor 编辑器配置
│   └── rules/                  # 编辑器规则
├── .git/                       # Git 版本控制
├── .history/                   # 文件历史记录（本地）
├── node_modules/               # 依赖包
├── public/                     # 静态资源
│   └── vite.svg               # Vite 图标
├── src/                        # 源代码目录 ⭐
│   ├── api/                    # API 接口层
│   │   ├── config.ts          # API 配置类型定义和提示词
│   │   ├── config.local.ts    # 本地 API 配置（不提交 Git）
│   │   ├── config.local.example.ts  # 配置样例文件
│   │   ├── openai.ts          # OpenAI 客户端封装
│   │   └── index.ts           # 模块导出
│   ├── components/             # 可复用组件
│   │   └── AiEditor.vue       # AI 编辑器核心组件
│   ├── composables/            # 组合式函数（Hooks）
│   │   └── useAiCompletion.ts # AI 补全逻辑封装
│   ├── constants/              # 常量定义
│   │   ├── index.ts           # 通用常量
│   │   └── storage.ts         # 存储键枚举
│   ├── router/                 # 路由配置
│   │   └── index.ts           # 路由定义
│   ├── store/                  # 状态管理
│   │   └── index.ts           # Pinia Store
│   ├── styles/                 # 全局样式
│   │   └── main.scss          # 主样式文件
│   ├── views/                  # 页面视图
│   │   └── HomeView.vue       # 首页视图
│   ├── App.vue                 # 根组件
│   ├── main.ts                 # 应用入口
│   └── vite-env.d.ts          # Vite 类型声明
├── .dockerignore               # Docker 忽略文件
├── .gitignore                  # Git 忽略文件
├── .prettierrc                 # Prettier 代码格式化配置
├── docker-compose.yml          # Docker Compose 配置
├── Dockerfile                  # Docker 镜像构建文件
├── index.html                  # HTML 入口文件
├── nginx.conf                  # Nginx 配置文件
├── package.json                # 项目依赖配置
├── pnpm-lock.yaml              # pnpm 锁文件
├── README.md                   # 项目说明文档
├── tsconfig.json               # TypeScript 配置
├── tsconfig.node.json          # Node.js TypeScript 配置
└── vite.config.ts              # Vite 构建配置

```

---

## 🏗️ 核心架构设计

### 1. 分层架构

```
┌─────────────────────────────────────┐
│         视图层 (Views)              │
│    HomeView.vue - 首页视图          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       组件层 (Components)           │
│    AiEditor.vue - AI 编辑器组件     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    组合式函数层 (Composables)       │
│  useAiCompletion.ts - AI 补全逻辑   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         API 层 (API)                │
│  openai.ts - OpenAI 客户端封装      │
│  config.ts - 配置管理               │
└─────────────────────────────────────┘
```

### 2. 数据流向

```
用户输入
  ↓
Monaco Editor 监听内容变化
  ↓
触发内联补全提供者 (InlineCompletionProvider)
  ↓
防抖处理 (500ms)
  ↓
调用 useAiCompletion Hook
  ↓
发起 OpenAI API 流式请求
  ↓
实时接收补全内容
  ↓
Monaco Editor 显示灰色幽灵文字
  ↓
用户按 Tab 接受 / Esc 取消
```

### 3. 状态管理

使用 **Pinia** 管理全局状态：
- `isCompletionLoading` - 补全加载状态
- `currentModel` - 当前使用的 AI 模型
- `completionHistory` - 补全历史记录

---
