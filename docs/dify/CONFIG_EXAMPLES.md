# 配置示例说明

本文档提供各种场景下的配置示例。

## 📋 配置参数说明

### maxInputLength 参数

| 值 | 行为 | 适用场景 |
|---|------|---------|
| `-1` | 不限制长度 | 自定义 Dify 实例，支持更长输入 |
| `256` | 限制 256 字符 | Dify 官方限制（推荐） |
| `128` | 限制 128 字符 | 短文本场景，提高速度 |
| `512` | 限制 512 字符 | 谨慎使用，可能被官方 Dify 拒绝 |

## 🎯 场景 1：使用 Dify 官方服务（推荐）

```typescript
export const AI_CONFIG: AIConfig = {
  provider: 'dify',
  
  openai: {
    baseURL: 'https://api.openai.com/v1',
    apiKey: 'sk-xxx',
    model: 'gpt-3.5-turbo',
    maxTokens: 100,
    temperature: 0.3
  },
  
  dify: {
    baseURL: 'http://192.168.210.85/v1',
    apiKey: 'app-gtrCLjE2A32SNXFoR05xVYfq',
    inputVariable: 'inputText',
    responseMode: 'streaming',
    maxInputLength: 256  // ✅ 使用官方限制
  },
  
  minTriggerLength: 5,
  debounceDelay: 500
}
```

**特点**：
- ✅ 符合 Dify 官方限制
- ✅ 稳定可靠
- ✅ 适合大多数场景

**日志输出**：
```
[Dify] 输入文本过长 (500 字符)，已截断为最后 256 字符
```

---

## 🚀 场景 2：使用自定义 Dify 实例（不限制）

如果你部署了自己的 Dify 实例，并且修改了输入长度限制：

```typescript
export const AI_CONFIG: AIConfig = {
  provider: 'dify',
  
  dify: {
    baseURL: 'http://your-custom-dify.com/v1',
    apiKey: 'app-xxx',
    inputVariable: 'inputText',
    responseMode: 'streaming',
    maxInputLength: -1  // ✅ 不限制长度
  },
  
  minTriggerLength: 5,
  debounceDelay: 500
}
```

**特点**：
- ✅ 支持任意长度输入
- ✅ 适合需要长上下文的场景
- ⚠️ 需要自定义 Dify 实例支持

**日志输出**：
```
[Dify] 输入文本长度: 1000 字符（不限制）
```

---

## ⚡ 场景 3：短文本快速补全

如果你的应用主要处理短文本，可以设置更小的限制以提高速度：

```typescript
export const AI_CONFIG: AIConfig = {
  provider: 'dify',
  
  dify: {
    baseURL: 'http://192.168.210.85/v1',
    apiKey: 'app-gtrCLjE2A32SNXFoR05xVYfq',
    inputVariable: 'inputText',
    responseMode: 'streaming',
    maxInputLength: 128  // ✅ 限制 128 字符
  },
  
  minTriggerLength: 3,  // 更早触发
  debounceDelay: 300    // 更快响应
}
```

**特点**：
- ✅ 响应更快
- ✅ 适合短文本场景
- ✅ 减少不必要的上下文

**适用场景**：
- 聊天消息补全
- 搜索建议
- 标签输入

---

## 🔄 场景 4：OpenAI 模式（无限制）

使用 OpenAI 时，不受输入长度限制：

```typescript
export const AI_CONFIG: AIConfig = {
  provider: 'openai',  // ✅ 使用 OpenAI
  
  openai: {
    baseURL: 'https://api.openai.com/v1',
    apiKey: 'sk-xxx',
    model: 'gpt-3.5-turbo',
    maxTokens: 100,
    temperature: 0.3
  },
  
  dify: {
    // Dify 配置保留，随时可以切换
    baseURL: 'http://192.168.210.85/v1',
    apiKey: 'app-xxx',
    inputVariable: 'inputText',
    responseMode: 'streaming',
    maxInputLength: 256
  },
  
  minTriggerLength: 5,
  debounceDelay: 500
}
```

**特点**：
- ✅ 无输入长度限制
- ✅ 支持长上下文
- ✅ 适合代码补全、长文章写作

---

## 🎨 场景 5：混合使用（根据需求切换）

保留两种配置，根据需求手动切换：

```typescript
export const AI_CONFIG: AIConfig = {
  // 🔄 修改这里切换提供商
  provider: 'dify',  // 或 'openai'
  
  // OpenAI 配置（长文本场景）
  openai: {
    baseURL: 'https://api.openai.com/v1',
    apiKey: 'sk-xxx',
    model: 'gpt-3.5-turbo',
    maxTokens: 100,
    temperature: 0.3
  },
  
  // Dify 配置（短文本场景）
  dify: {
    baseURL: 'http://192.168.210.85/v1',
    apiKey: 'app-gtrCLjE2A32SNXFoR05xVYfq',
    inputVariable: 'inputText',
    responseMode: 'streaming',
    maxInputLength: 256
  },
  
  minTriggerLength: 5,
  debounceDelay: 500
}
```

**使用方法**：
1. 短文本场景：设置 `provider: 'dify'`
2. 长文本场景：设置 `provider: 'openai'`
3. 重启开发服务器

---

## 🧪 场景 6：测试和调试

在测试时，可以使用更宽松的配置：

```typescript
export const AI_CONFIG: AIConfig = {
  provider: 'dify',
  
  dify: {
    baseURL: 'http://192.168.210.85/v1',
    apiKey: 'app-gtrCLjE2A32SNXFoR05xVYfq',
    inputVariable: 'inputText',
    responseMode: 'streaming',
    maxInputLength: -1  // ✅ 测试时不限制
  },
  
  minTriggerLength: 1,   // 最小触发长度
  debounceDelay: 100     // 快速响应
}
```

**特点**：
- ✅ 快速测试
- ✅ 查看完整日志
- ⚠️ 仅用于开发环境

---

## 📊 配置对比

| 场景 | provider | maxInputLength | minTriggerLength | debounceDelay |
|------|----------|----------------|------------------|---------------|
| 官方 Dify | `dify` | `256` | `5` | `500` |
| 自定义 Dify | `dify` | `-1` | `5` | `500` |
| 短文本 | `dify` | `128` | `3` | `300` |
| OpenAI | `openai` | N/A | `5` | `500` |
| 测试 | `dify` | `-1` | `1` | `100` |

---

## 🔍 如何选择配置？

### 问题 1：我应该使用 Dify 还是 OpenAI？

| 场景 | 推荐 | 原因 |
|------|------|------|
| 短文本补全（<256 字符） | Dify | 快速、成本低 |
| 代码补全 | OpenAI | 需要更多上下文 |
| 长文章写作 | OpenAI | 需要理解全文 |
| 聊天消息 | Dify | 响应快 |

### 问题 2：maxInputLength 应该设置多少？

```
使用 Dify 官方服务？
├─ 是 → maxInputLength: 256
└─ 否（自定义实例）
   ├─ 支持更长输入？
   │  └─ 是 → maxInputLength: -1
   └─ 只需要短文本？
      └─ 是 → maxInputLength: 128
```

### 问题 3：如何验证配置是否正确？

1. **启动项目**：`pnpm dev`
2. **打开控制台**：按 F12
3. **输入文本**：在编辑器中输入
4. **查看日志**：
   ```
   ✅ 正常：[Dify] 输入文本长度: 100 字符（不限制）
   ✅ 正常：[Dify] 输入文本过长 (300 字符)，已截断为最后 256 字符
   ❌ 错误：Failed to fetch
   ```

---

## 💡 最佳实践

### 1. 生产环境配置

```typescript
export const AI_CONFIG: AIConfig = {
  provider: 'dify',
  
  dify: {
    baseURL: process.env.VITE_DIFY_BASE_URL || 'http://192.168.210.85/v1',
    apiKey: process.env.VITE_DIFY_API_KEY || 'app-xxx',
    inputVariable: 'inputText',
    responseMode: 'streaming',
    maxInputLength: 256  // 使用官方限制
  },
  
  minTriggerLength: 5,
  debounceDelay: 500
}
```

### 2. 开发环境配置

```typescript
export const AI_CONFIG: AIConfig = {
  provider: 'dify',
  
  dify: {
    baseURL: 'http://localhost:8080/v1',  // 本地 Dify
    apiKey: 'app-dev-xxx',
    inputVariable: 'inputText',
    responseMode: 'streaming',
    maxInputLength: -1  // 开发时不限制
  },
  
  minTriggerLength: 1,   // 快速触发
  debounceDelay: 100     // 快速响应
}
```

### 3. 使用环境变量

创建 `.env.local` 文件：

```bash
VITE_AI_PROVIDER=dify
VITE_DIFY_BASE_URL=http://192.168.210.85/v1
VITE_DIFY_API_KEY=app-gtrCLjE2A32SNXFoR05xVYfq
VITE_DIFY_INPUT_VARIABLE=inputText
VITE_DIFY_MAX_INPUT_LENGTH=256
```

在配置文件中使用：

```typescript
export const AI_CONFIG: AIConfig = {
  provider: (import.meta.env.VITE_AI_PROVIDER || 'dify') as AIProvider,
  
  dify: {
    baseURL: import.meta.env.VITE_DIFY_BASE_URL,
    apiKey: import.meta.env.VITE_DIFY_API_KEY,
    inputVariable: import.meta.env.VITE_DIFY_INPUT_VARIABLE,
    responseMode: 'streaming',
    maxInputLength: Number(import.meta.env.VITE_DIFY_MAX_INPUT_LENGTH)
  },
  
  // ...
}
```

---

## 📚 相关文档

- [快速开始](./QUICK_START_DIFY.md)
- [详细接入指南](./DIFY_INTEGRATION.md)
- [限制说明](./DIFY_LIMITATIONS.md)

---

**最后更新**：2026-01-06
