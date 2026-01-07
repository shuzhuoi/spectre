# Dify Workflow 集成更新日志

## 🎉 新增功能

### 1. 多 AI 服务提供商支持

项目现在支持两种 AI 服务接入方式，可通过配置文件轻松切换：

- ✅ **OpenAI**（及兼容服务）
- ✅ **Dify Workflow**

### 2. 统一的客户端接口

新增 `src/api/client.ts` 作为统一入口，自动根据配置选择对应的 AI 服务：

```typescript
import { getStreamCompletion, isConfigValid } from '@/api/client'

// 自动使用配置的提供商（OpenAI 或 Dify）
const completion = await getStreamCompletion(prompt, onChunk, signal)
```

### 3. Dify Workflow 完整支持

新增 `src/api/dify.ts`，实现了 Dify Workflow API 的完整功能：

- ✅ 流式响应（streaming）
- ✅ 阻塞响应（blocking）
- ✅ SSE 事件解析
- ✅ 可配置的输入变量名
- ✅ 自动处理多种事件类型

支持的 Dify 事件：
- `workflow_started` - Workflow 开始执行
- `node_started` - 节点开始执行
- `text_chunk` - 文本片段（核心）
- `node_finished` - 节点执行完成
- `workflow_finished` - Workflow 执行完成
- `ping` - 心跳事件

## 📝 文件变更

### 新增文件

```
src/api/
├── client.ts              # 统一客户端接口 ⭐ NEW
├── dify.ts                # Dify Workflow 客户端 ⭐ NEW

docs/
├── DIFY_INTEGRATION.md    # Dify 接入指南 ⭐ NEW
├── CHANGELOG_DIFY.md      # 更新日志 ⭐ NEW
└── test-dify.html         # Dify API 测试工具 ⭐ NEW
```

### 修改文件

```
src/api/
├── config.ts              # 扩展配置类型，支持多提供商
├── config.local.ts        # 更新配置结构
├── config.local.example.ts # 更新配置样例
├── openai.ts              # 适配新配置结构
└── index.ts               # 导出新模块

src/composables/
└── useAiCompletion.ts     # 使用统一客户端接口

src/components/
└── AiEditor.vue           # 使用统一客户端接口

src/views/
└── HomeView.vue           # 显示当前提供商信息

README.md                  # 更新文档，添加 Dify 说明
```

## 🔧 配置变更

### 旧配置格式（仅支持 OpenAI）

```typescript
export const OPENAI_CONFIG: OpenAIConfig = {
  baseURL: 'https://api.openai.com/v1',
  apiKey: 'sk-xxx',
  model: 'gpt-3.5-turbo',
  maxTokens: 100,
  temperature: 0.3,
  minTriggerLength: 5,
  debounceDelay: 500
}
```

### 新配置格式（支持多提供商）

```typescript
export const AI_CONFIG: AIConfig = {
  // 选择提供商
  provider: 'openai' | 'dify',
  
  // OpenAI 配置
  openai: {
    baseURL: 'https://api.openai.com/v1',
    apiKey: 'sk-xxx',
    model: 'gpt-3.5-turbo',
    maxTokens: 100,
    temperature: 0.3
  },
  
  // Dify 配置
  dify: {
    baseURL: 'http://your-dify-server/v1',
    apiKey: 'app-xxx',
    inputVariable: 'inputText',
    responseMode: 'streaming'
  },
  
  // 通用配置
  minTriggerLength: 5,
  debounceDelay: 500
}
```

## 🚀 使用方法

### 1. 配置 Dify

编辑 `src/api/config.local.ts`：

```typescript
export const AI_CONFIG: AIConfig = {
  provider: 'dify',  // 切换到 Dify
  
  dify: {
    baseURL: 'http://192.168.210.85/v1',
    apiKey: 'app-gtrCLjE2A32SNXFoR05xVYfq',
    inputVariable: 'inputText',  // 你的 workflow 输入变量名
    responseMode: 'streaming'
  },
  
  // ...
}
```

### 2. 启动项目

```bash
pnpm dev
```

### 3. 测试 Dify API

打开 `test-dify.html` 文件，可以直接在浏览器中测试 Dify API 连接。

## 📊 API 对比

| 特性 | OpenAI | Dify Workflow |
|------|--------|---------------|
| 流式输出 | ✅ | ✅ |
| 阻塞模式 | ✅ | ✅ |
| 自定义提示词 | ✅ | ⚠️ 在 Workflow 中配置 |
| 模型选择 | ✅ | ⚠️ 在 Workflow 中配置 |
| 温度参数 | ✅ | ⚠️ 在 Workflow 中配置 |
| 输入变量 | 固定 | ✅ 可配置 |
| 事件追踪 | ❌ | ✅ |
| 节点信息 | ❌ | ✅ |

## 🔍 技术细节

### Dify SSE 事件流处理

```typescript
// 1. 发起请求
const response = await fetch(`${baseURL}/workflows/run`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: { [inputVariable]: prompt },
    response_mode: 'streaming',
    user: 'spectre-user-' + Date.now()
  })
})

// 2. 读取流式响应
const reader = response.body.getReader()
const decoder = new TextDecoder()

// 3. 解析 SSE 事件
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  
  const lines = decoder.decode(value).split('\n')
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const event = JSON.parse(line.substring(6))
      
      // 4. 处理 text_chunk 事件
      if (event.event === 'text_chunk') {
        const text = event.data?.text
        onChunk?.(text, false)
      }
    }
  }
}
```

### 统一客户端接口

```typescript
// client.ts 根据配置自动选择
export async function getStreamCompletion(prompt, onChunk, signal) {
  const provider = AI_CONFIG.provider
  
  switch (provider) {
    case 'openai':
      return OpenAIClient.getStreamCompletion(prompt, onChunk, signal)
    case 'dify':
      return DifyClient.getStreamCompletion(prompt, onChunk, signal)
  }
}
```

## ⚠️ 注意事项

1. **配置迁移**：如果你之前使用的是旧版配置，需要手动迁移到新格式
2. **变量名匹配**：Dify 的 `inputVariable` 必须与 workflow 中的变量名完全一致
3. **输出格式**：确保 Dify workflow 输出 `text_chunk` 事件或在 `outputs` 中包含 `text`/`result` 字段
4. **CORS 配置**：如果遇到跨域问题，需要在 Dify 服务端配置 CORS
5. **网络访问**：确保浏览器能访问 Dify 服务器地址

## 🐛 已知问题

暂无

## 📚 相关文档

- [Dify 接入指南](./DIFY_INTEGRATION.md) - 详细的配置和使用说明
- [项目架构分析](./agents.md) - 项目技术栈和目录结构
- [README](./README.md) - 项目主文档

## 🎯 后续计划

- [ ] 支持更多 AI 服务提供商（Claude、Gemini 等）
- [ ] 添加提供商切换 UI
- [ ] 支持多个 Dify workflow 配置
- [ ] 添加请求重试机制
- [ ] 优化错误处理和提示

## 👥 贡献者

- 初始实现：2026-01-06

---

**版本**: 1.0.0  
**更新日期**: 2026-01-06
