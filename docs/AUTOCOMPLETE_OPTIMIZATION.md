# 自动补全优化说明

本文档说明 v1.2.0 版本中对自动补全功能的优化改进。

## 优化内容

### 1. 智能上下文管理

**问题**：之前每次请求都发送从第一行到光标位置的所有文本，浪费带宽和 token。

**解决方案**：
- 支持按行数获取上下文（推荐）
- 支持按字符数获取上下文
- 可配置发送前 N 行（0-5 行）
- 自动截断超长文本

**配置示例**：
```typescript
autoComplete: {
  context: {
    mode: 'lines',      // 按行数模式
    maxLines: 3,        // 发送前 3 行 + 当前行
    maxChars: 500       // 最多 500 字符
  }
}
```

**特殊用法**：
- `maxLines: 0` - 只发送当前行，不包含前面的行（最节省 token）
- `maxLines: 3-5` - 发送前 3-5 行，提供足够上下文

### 2. 差异化防抖延迟

**问题**：粘贴大段文本后立即触发补全，用户没时间调整。

**解决方案**：
- 正常编写：500ms 延迟（默认）
- 换行时：200ms 延迟（默认）- 快速响应
- 粘贴后：1000ms 延迟（默认）
- 自动检测换行和粘贴事件

**配置示例**：
```typescript
autoComplete: {
  debounce: {
    normal: 500,   // 正常编写延迟
    newLine: 200,  // 换行时延迟 - 快速触发
    paste: 1000    // 粘贴后延迟
  }
}
```

### 3. 智能触发条件

**问题**：句号等标点后不应该触发补全，浪费请求。

**解决方案**：
- 换行时快速触发（可配置）
- 标点符号后不触发（句号、问号、感叹号等）
- 可自定义跳过的标点符号列表

**配置示例**：
```typescript
autoComplete: {
  trigger: {
    onNewLine: true,  // 换行时快速触发
    skipAfterPunctuation: ['。', '.', '!', '?', '！', '？', '；', ';']
  }
}
```

**工作原理**：
- 检查光标前的最后一个字符
- 如果是配置的标点符号，跳过触发
- 换行时使用更短的延迟（200ms vs 500ms）

### 4. 统一配置结构

**变更**：将分散的配置项统一到 `autoComplete` 节点下。

**迁移指南**：

**旧配置**：
```typescript
export const AI_CONFIG: AIConfig = {
  provider: 'openai',
  minTriggerLength: 5,
  debounceDelay: 500,
  // ...
}
```

**新配置**：
```typescript
export const AI_CONFIG: AIConfig = {
  provider: 'openai',
  autoComplete: {
    minTriggerLength: 5,
    debounce: {
      normal: 500,
      newLine: 200,
      paste: 1000
    },
    context: {
      mode: 'lines',
      maxLines: 3,
      maxChars: 500
    },
    trigger: {
      onNewLine: true,
      skipAfterPunctuation: ['。', '.', '!', '?', '！', '？', '；', ';']
    }
  },
  // ...
}
```

## 性能提升

### Token 使用优化

**场景 1：只发送当前行**
```typescript
context: { mode: 'lines', maxLines: 0, maxChars: 500 }
```
- 适用于：简单文本补全
- Token 节省：90%+
- 上下文质量：低

**场景 2：发送前 3 行**
```typescript
context: { mode: 'lines', maxLines: 3, maxChars: 500 }
```
- 适用于：代码补全、文章写作
- Token 节省：50-70%
- 上下文质量：中等

**场景 3：发送前 5 行**
```typescript
context: { mode: 'lines', maxLines: 5, maxChars: 500 }
```
- 适用于：复杂代码、需要更多上下文
- Token 节省：30-50%
- 上下文质量：高

### 响应速度优化

- 正常编写：500ms 防抖，快速响应
- 换行时：200ms 防抖，更快响应
- 粘贴后：1000ms 防抖，避免误触发
- 标点符号后：不触发，减少不必要的 API 调用

## 使用建议

### 推荐配置

**代码编辑器**：
```typescript
autoComplete: {
  minTriggerLength: 3,
  debounce: { normal: 300, newLine: 150, paste: 1500 },
  context: { mode: 'lines', maxLines: 5, maxChars: 800 },
  trigger: { 
    onNewLine: true, 
    skipAfterPunctuation: ['.', ';', '}', ')'] 
  }
}
```

**文本编辑器**：
```typescript
autoComplete: {
  minTriggerLength: 5,
  debounce: { normal: 500, newLine: 200, paste: 1000 },
  context: { mode: 'lines', maxLines: 3, maxChars: 500 },
  trigger: { 
    onNewLine: true, 
    skipAfterPunctuation: ['。', '.', '!', '?', '！', '？', '；', ';'] 
  }
}
```

**简单补全**：
```typescript
autoComplete: {
  minTriggerLength: 5,
  debounce: { normal: 500, newLine: 300, paste: 1000 },
  context: { mode: 'lines', maxLines: 0, maxChars: 200 },
  trigger: { 
    onNewLine: false, 
    skipAfterPunctuation: ['。', '.'] 
  }
}
```

## 技术实现

### 上下文获取逻辑

```typescript
function getContextText(model, position): string {
  const config = AI_CONFIG.autoComplete.context

  if (config.mode === 'lines') {
    // 按行数获取
    const startLine = Math.max(1, position.lineNumber - config.maxLines)
    let text = model.getValueInRange({
      startLineNumber: startLine,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    })

    // 超过字符限制则截断
    if (text.length > config.maxChars) {
      text = text.slice(-config.maxChars)
    }

    return text
  } else {
    // 按字符数获取
    const fullText = model.getValueInRange({...})
    return fullText.slice(-config.maxChars)
  }
}
```

### 粘贴检测

```typescript
editor.onDidPaste(() => {
  isPasting.value = true
  setTimeout(() => {
    isPasting.value = false
  }, AI_CONFIG.autoComplete.debounce.paste + 500)
})
```

### 换行检测

```typescript
editor.onDidChangeModelContent(() => {
  const position = editor.getPosition()
  if (position) {
    const currentLine = position.lineNumber
    
    // 如果行号增加，说明换行了
    if (currentLine > lastLineNumber) {
      isNewLine.value = true
      // 使用更短的延迟
    }
    
    lastLineNumber = currentLine
  }
})
```

### 标点符号过滤

```typescript
function shouldSkipTrigger(text: string): boolean {
  const lastChar = text.charAt(text.length - 1)
  const skipPunctuation = AI_CONFIG.autoComplete.trigger.skipAfterPunctuation
  
  if (skipPunctuation.includes(lastChar)) {
    return true  // 跳过触发
  }
  
  return false
}
```

### 差异化防抖

```typescript
const debouncedGetCompletion = useDebounceFn(
  getAiCompletion,
  AI_CONFIG.autoComplete.debounce.normal
)

const debouncedGetCompletionOnNewLine = useDebounceFn(
  getAiCompletion,
  AI_CONFIG.autoComplete.debounce.newLine
)

const debouncedGetCompletionAfterPaste = useDebounceFn(
  getAiCompletion,
  AI_CONFIG.autoComplete.debounce.paste
)

// 根据状态选择不同的防抖函数
if (isPasting.value) {
  completion = await debouncedGetCompletionAfterPaste(contextText)
} else if (isNewLine.value && AI_CONFIG.autoComplete.trigger.onNewLine) {
  completion = await debouncedGetCompletionOnNewLine(contextText)
} else {
  completion = await debouncedGetCompletion(contextText)
}
```

## 常见问题

### Q: 为什么换行后补全更快？

A: 换行通常表示用户完成了一行内容，期待快速的补全建议。使用更短的延迟（200ms vs 500ms）可以提供更好的体验。

### Q: 为什么句号后不触发补全？

A: 句号、问号等标点通常表示句子结束，此时触发补全意义不大。跳过这些情况可以减少不必要的 API 调用，节省成本。

### Q: 可以自定义不触发的标点吗？

A: 可以。在配置中修改 `trigger.skipAfterPunctuation` 数组，添加或删除标点符号。

### Q: 为什么粘贴后补全延迟更长？

A: 给用户时间调整粘贴的内容，避免立即触发不必要的补全。

### Q: maxLines 设置为 0 会影响补全质量吗？

A: 会的。只发送当前行会失去上下文信息，补全质量会下降。建议设置为 3-5。

### Q: 如何平衡 token 使用和补全质量？

A: 
- 简单场景：maxLines: 0-1
- 一般场景：maxLines: 3
- 复杂场景：maxLines: 5
- 同时设置 maxChars 限制最大长度

### Q: 可以动态调整配置吗？

A: 目前配置是静态的，需要修改 `config.local.ts` 并重启应用。未来版本会支持运行时配置。

## 相关文档

- [配置说明](../README.md#配置选项)
- [更新日志](../CHANGELOG.md)
- [Dify 集成指南](./dify/DIFY_INTEGRATION.md)
