# Spectre - AI 文本补全编辑器

> 🌫️ 像幽灵一样悄然出现的智能补全

基于 Vue 3 + Monaco Editor 实现的 AI 文本补全功能，类似于 Cursor/Copilot 的代码补全体验。输入文字后，AI 会自动预测并以灰色"幽灵文字"显示补全建议，按 Tab 即可接受。

![Spectre 项目预览](./1.png)

## ✨ 功能特性

- 🌫️ **智能补全** - 输入文字后自动触发 AI 补全，灰色幽灵文字提示
- 🚀 **流式输出** - 实时显示 AI 生成内容，无需等待
- ⌨️ **快捷键支持** - Tab 接受补全，Esc 取消
- 🎨 **多主题切换** - 支持深色/浅色/高对比度主题
- 📝 **多语言支持** - 支持多种编程语言语法高亮
- 🔌 **兼容 OpenAI API** - 可对接任何兼容 OpenAI 格式的 API

## 🛠️ 技术栈

- Vue 3 + TypeScript + Vite
- Monaco Editor (VS Code 同款编辑器)
- Element Plus UI 组件库
- OpenAI Node.js SDK
- Pinia 状态管理
- VueUse 工具库

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置 API

复制样例配置文件并填入你的 API 信息：

```bash
cp src/api/config.local.example.ts src/api/config.local.ts
```

然后编辑 `src/api/config.local.ts`：

```typescript
export const OPENAI_CONFIG: OpenAIConfig = {
  // API 基础地址
  baseURL: 'https://api.openai.com/v1',
  
  // API 密钥
  apiKey: 'sk-your-api-key-here',
  
  // 模型名称
  model: 'gpt-3.5-turbo',
  
  // 其他参数...
}
```

> 💡 `config.local.ts` 已被 `.gitignore` 忽略，不会提交到 Git，你的 API Key 是安全的。

**支持的 API 服务：**

| 服务 | baseURL |
|------|---------|
| OpenAI | `https://api.openai.com/v1` |
| Azure OpenAI | `https://your-resource.openai.azure.com/openai/deployments/your-deployment` |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| 本地 Ollama | `http://localhost:11434/v1` |
| 其他兼容服务 | 自定义地址 |

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 📖 使用方法

1. 在编辑器中输入文字
2. 稍等片刻（默认 500ms 防抖），AI 会自动生成补全建议
3. 补全建议以灰色"幽灵文字"显示在光标后
4. 按 **Tab** 键接受补全
5. 按 **Esc** 键取消补全

## 📁 项目结构

```
src/
├── api/
│   ├── config.ts               # 类型定义和提示词
│   ├── config.local.ts         # 本地 API 配置（不提交 Git）
│   ├── config.local.example.ts # 配置样例文件
│   ├── openai.ts               # OpenAI 客户端封装
│   └── index.ts                # 模块导出
├── components/
│   └── AiEditor.vue            # AI 编辑器组件
├── composables/
│   └── useAiCompletion.ts      # AI 补全逻辑 Hook
├── constants/
│   └── storage.ts              # 存储键枚举
├── views/
│   └── HomeView.vue            # 首页视图
├── router/
│   └── index.ts                # 路由配置
├── store/
│   └── index.ts                # Pinia 状态管理
├── styles/
│   └── main.scss               # 全局样式
├── App.vue
└── main.ts
```

## ⚙️ 配置选项

在 `src/api/config.local.ts` 中可配置以下选项：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| baseURL | string | `https://api.openai.com/v1` | API 基础地址 |
| apiKey | string | - | API 密钥 |
| model | string | `gpt-3.5-turbo` | 使用的模型 |
| maxTokens | number | 100 | 补全最大 token 数 |
| temperature | number | 0.3 | 生成随机性 (0-2) |
| minTriggerLength | number | 5 | 触发补全的最小字符数 |
| debounceDelay | number | 500 | 防抖延迟 (ms) |

## ⚠️ 安全提醒

在浏览器中直接使用 API Key 会暴露密钥。生产环境建议：

1. 通过后端代理转发 API 请求
2. 或仅在内部工具/开发环境中使用

## 📦 构建部署

### 本地构建

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### Docker 部署

直接运行以下命令，如果镜像不存在会自动构建：

```bash
# 启动服务（自动构建镜像）
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

访问 http://localhost:3000

**其他 Docker 命令：**

```bash
# 强制重新构建镜像
docker-compose up -d --build

# 仅构建镜像不运行
docker-compose build
```

> 💡 Docker 构建前请确保已配置 `src/api/config.local.ts` 文件。

## 📄 License

MIT
