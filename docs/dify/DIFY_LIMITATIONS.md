# Dify Workflow 限制说明

## 📏 输入长度限制

### 限制详情

Dify Workflow 的输入变量有以下限制：

- **最大长度**：256 个字符
- **限制类型**：硬性限制，无法突破
- **影响范围**：所有输入变量

### 为什么有这个限制？

这是 Dify 平台的设计限制，主要考虑：

1. **性能优化**：限制输入长度可以提高 workflow 执行效率
2. **资源管理**：避免过长的输入占用过多资源
3. **使用场景**：Dify Workflow 更适合短文本处理场景

## 🔧 Spectre 的处理方案

### 自动截断机制

当输入文本超过 `maxInputLength` 时，系统会：

1. **自动截断**：保留文本的最后 N 个字符
2. **记录日志**：在控制台输出截断信息
3. **继续执行**：使用截断后的文本请求 AI 补全

### 为什么保留最后的字符？

```
原始文本：
"这是一段很长的文本，包含了很多上下文信息。我们需要根据这些信息来进行补全。最近我在写一篇关于..."

截断后（保留最后 256 字符）：
"...包含了很多上下文信息。我们需要根据这些信息来进行补全。最近我在写一篇关于..."
```

保留最后的字符是因为：
- ✅ 光标位置在文本末尾
- ✅ 最近的上下文最相关
- ✅ 补全需要紧邻的内容

### 配置示例

```typescript
export const AI_CONFIG: AIConfig = {
  provider: 'dify',
  
  dify: {
    baseURL: 'http://192.168.210.85/v1',
    apiKey: 'app-xxx',
    inputVariable: 'inputText',
    responseMode: 'streaming',
    
    // 设置最大输入长度
    maxInputLength: 256   // 建议值：256（Dify 官方限制）
    // maxInputLength: -1 // 不限制（如果你的 Dify 实例支持）
  }
}
```

### 调整建议

| 场景 | 建议值 | 说明 |
|------|--------|------|
| 默认使用 | 256 | Dify 官方限制 |
| 短文本补全 | 128-200 | 提高响应速度 |
| 需要更多上下文 | 256 | 最大可用值（官方） |
| 不限制 | -1 | 如果你的 Dify 实例支持更长输入 |
| 超过 256 | ⚠️ 谨慎 | 可能被 Dify 拒绝（除非自定义实例） |

## 📊 对比：OpenAI vs Dify

| 特性 | OpenAI | Dify Workflow |
|------|--------|---------------|
| 输入长度限制 | ✅ 无限制（受 token 限制） | ❌ 256 字符 |
| 上下文长度 | ✅ 4K-128K tokens | ❌ 256 字符 |
| 适用场景 | 长文本、代码补全 | 短文本、快速补全 |
| 响应速度 | 中等 | 快速 |
| 成本 | 按 token 计费 | 按调用计费 |

## 💡 使用建议

### 场景 1：短文本补全（推荐使用 Dify）

```
输入：机房出入口区域有
补全：门禁系统、监控摄像头和访客登记台
```

✅ 适合 Dify：输入短，补全快

### 场景 2：代码补全（推荐使用 OpenAI）

```typescript
// 输入：一个完整的函数定义 + 上下文（可能超过 256 字符）
function calculateTotal(items: Item[]) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  // 需要补全：return 语句
```

❌ 不适合 Dify：输入可能被截断，丢失重要上下文

### 场景 3：长文章写作（推荐使用 OpenAI）

```
输入：已写的 1000+ 字文章内容
补全：下一段内容
```

❌ 不适合 Dify：只能看到最后 256 字符，无法理解全文

## 🔄 如何切换到 OpenAI？

如果 Dify 的限制无法满足需求，可以轻松切换到 OpenAI：

```typescript
export const AI_CONFIG: AIConfig = {
  // 只需修改这一行
  provider: 'openai',  // 从 'dify' 改为 'openai'
  
  openai: {
    baseURL: 'https://api.openai.com/v1',
    apiKey: 'sk-xxx',
    model: 'gpt-3.5-turbo',
    maxTokens: 100,
    temperature: 0.3
  },
  
  // Dify 配置保留，随时可以切换回来
  dify: { /* ... */ }
}
```

## 🎯 最佳实践

### 1. 根据场景选择提供商

```typescript
// 短文本场景：使用 Dify
provider: 'dify'

// 长文本场景：使用 OpenAI
provider: 'openai'
```

### 2. 监控截断情况

打开浏览器控制台（F12），查看是否有截断日志：

```
[Dify] 输入文本过长 (512 字符)，已截断为最后 256 字符
```

如果频繁出现截断，考虑切换到 OpenAI。

### 3. 优化 Dify Workflow

在 Dify 中优化提示词，使其能在短上下文下工作：

```
系统提示词：
你是一个智能补全助手。用户会给你一段文本的结尾部分，
请根据这个结尾预测接下来最可能的内容。
注意：你只能看到最后 256 个字符，请充分利用这些信息。
```

### 4. 调整触发长度

如果使用 Dify，可以增加 `minTriggerLength`，避免过早触发：

```typescript
export const AI_CONFIG: AIConfig = {
  provider: 'dify',
  
  // 增加触发长度，确保有足够的上下文
  minTriggerLength: 20,  // 从 5 增加到 20
  
  dify: {
    maxInputLength: 256
  }
}
```

## 📈 性能对比

### 测试场景：补全 "机房出入口区域有"

| 提供商 | 输入长度 | 响应时间 | 补全质量 |
|--------|---------|---------|---------|
| Dify | 10 字符 | ~500ms | ⭐⭐⭐⭐⭐ |
| OpenAI | 10 字符 | ~800ms | ⭐⭐⭐⭐⭐ |
| Dify | 300 字符（截断） | ~500ms | ⭐⭐⭐ |
| OpenAI | 300 字符 | ~1000ms | ⭐⭐⭐⭐⭐ |

**结论**：
- 短文本：Dify 更快，质量相当
- 长文本：OpenAI 质量更好，但稍慢

## 🔧 高级配置

### 动态调整截断长度

根据你的需求调整：

```typescript
dify: {
  // 场景 1：使用官方限制（推荐）
  maxInputLength: 256
  
  // 场景 2：不限制长度（如果你的 Dify 实例支持）
  maxInputLength: -1
  
  // 场景 3：自定义长度
  maxInputLength: 512  // 谨慎调整，可能导致 API 错误
}
```

### 配置说明

| 配置值 | 行为 | 适用场景 |
|--------|------|---------|
| `-1` | 不限制长度 | 自定义 Dify 实例，支持更长输入 |
| `256` | 限制 256 字符 | Dify 官方限制（推荐） |
| `128` | 限制 128 字符 | 短文本场景，提高速度 |
| `512` | 限制 512 字符 | 谨慎使用，可能被拒绝 |

### 自定义截断策略

如果需要自定义截断逻辑，可以修改 `src/api/dify.ts`：

```typescript
// 当前策略：保留最后 N 字符
truncatedPrompt = prompt.slice(-config.maxInputLength)

// 自定义策略：保留开头 + 结尾
const headLength = 100
const tailLength = config.maxInputLength - headLength
truncatedPrompt = prompt.slice(0, headLength) + 
                  '...' + 
                  prompt.slice(-tailLength)
```

## ❓ 常见问题

### Q1：为什么不能增加 Dify 的输入限制？

A：Dify 官方平台的硬性限制是 256 字符。但你可以：
- 设置 `maxInputLength: -1` 不限制（如果使用自定义 Dify 实例）
- 设置 `maxInputLength: 256` 使用官方限制（推荐）
- 如果需要更长的输入，建议使用 OpenAI 模式

### Q2：截断会影响补全质量吗？

A：会有一定影响，特别是当上下文很重要时。建议：
- 短文本场景：影响很小
- 长文本场景：建议使用 OpenAI

### Q3：可以同时使用两种模式吗？

A：目前不支持自动切换，但你可以手动修改配置文件切换。未来可能会添加智能切换功能。

### Q4：如何知道我的输入是否被截断？

A：打开浏览器控制台（F12），如果看到以下日志说明被截断了：
```
[Dify] 输入文本过长 (xxx 字符)，已截断为最后 256 字符
```

## 📚 相关文档

- [Dify 接入指南](./DIFY_INTEGRATION.md)
- [快速开始](./QUICK_START_DIFY.md)
- [更新日志](./CHANGELOG_DIFY.md)

---

**最后更新**：2026-01-06
