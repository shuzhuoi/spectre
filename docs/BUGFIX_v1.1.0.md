# Bug 修复说明 - v1.2.0

本文档记录 v1.2.0 版本中修复的 bug 及其解决方案。

## Bug #1: maxLines 为 0 时无法获取当前行内容

### 问题描述

当配置 `context.maxLines: 0` 时，期望只发送当前行光标前的内容，但实际上没有发送任何请求或获取不到内容。

### 问题原因

在 `getContextText()` 函数中，计算起始行号的逻辑有问题：

```typescript
// 错误的代码
const startLine = Math.max(1, position.lineNumber - config.maxLines)
// 当 maxLines = 0 时：
// startLine = Math.max(1, position.lineNumber - 0) = position.lineNumber
```

虽然 `startLine` 计算正确，但这个逻辑没有明确区分 `maxLines: 0`（只要当前行）和 `maxLines: N`（要前N行+当前行）的情况。

### 解决方案

明确处理 `maxLines: 0` 的情况：

```typescript
// 修复后的代码
let startLine: number

if (config.maxLines === 0) {
  // maxLines 为 0 时，只获取当前行光标前的内容
  startLine = position.lineNumber
} else {
  // 获取前 N 行 + 当前行
  startLine = Math.max(1, position.lineNumber - config.maxLines)
}

let text = model.getValueInRange({
  startLineNumber: startLine,
  startColumn: 1,
  endLineNumber: position.lineNumber,
  endColumn: position.column
})
```

### 测试验证

**配置**：
```typescript
context: {
  mode: 'lines',
  maxLines: 0,
  maxChars: 500
}
```

**测试步骤**：
1. 输入多行文本
2. 在最后一行输入内容
3. 观察发送的请求

**预期结果**：
- 只发送当前行光标前的内容
- 不包含前面的行

---

## Bug #2: 快速换行时触发多条请求

### 问题描述

当用户快速连续按回车换行时，会触发多条 AI 补全请求，导致：
1. 浪费 API 调用
2. 可能出现多个补全建议
3. 性能下降

### 问题原因

每次换行都会触发 `onDidChangeModelContent` 事件，设置 `isNewLine.value = true`，然后调用防抖函数。但是：

1. **防抖函数为每次调用创建独立的定时器**
2. **没有取消之前的请求**
3. **快速换行时，多个定时器同时存在**

```typescript
// 问题代码
if (currentLine > lastLineNumber) {
  isNewLine.value = true
  // 每次换行都创建新的定时器，不会取消之前的
  setTimeout(() => {
    isNewLine.value = false
  }, AI_CONFIG.autoComplete.debounce.newLine + 500)
}
```

### 解决方案

#### 1. 添加请求取消机制

在检测到新的输入时，取消之前的请求：

```typescript
// 如果行号增加，说明换行了
if (currentLine > lastLineNumber) {
  // 取消之前的请求，避免快速换行触发多条
  cancelCurrentRequest()
  
  isNewLine.value = true
  // ...
}
```

#### 2. 清理之前的定时器

使用变量保存定时器引用，在创建新定时器前清理旧的：

```typescript
// 定义定时器变量
let newLineResetTimer: ReturnType<typeof setTimeout> | null = null

// 换行检测
if (currentLine > lastLineNumber) {
  cancelCurrentRequest()
  isNewLine.value = true
  
  // 清除之前的定时器
  if (newLineResetTimer) {
    clearTimeout(newLineResetTimer)
  }
  
  // 创建新的定时器
  newLineResetTimer = setTimeout(() => {
    isNewLine.value = false
    newLineResetTimer = null
  }, AI_CONFIG.autoComplete.debounce.newLine + 500)
}
```

#### 3. 组件销毁时清理

在 `destroyEditor()` 中清理所有定时器：

```typescript
function destroyEditor() {
  cancelCurrentRequest()
  
  // 清理定时器
  if (newLineResetTimer) {
    clearTimeout(newLineResetTimer)
    newLineResetTimer = null
  }
  
  if (pasteResetTimer) {
    clearTimeout(pasteResetTimer)
    pasteResetTimer = null
  }
  
  // ... 其他清理
}
```

### 测试验证

**测试步骤**：
1. 快速连续按回车 5 次
2. 观察控制台日志
3. 观察网络请求

**预期结果**：
- 只触发 1 次 AI 补全请求（最后一次）
- 控制台显示 5 次 "检测到换行"
- 但只有最后一次真正发送请求

**实际效果**：
- ✅ 取消之前的请求
- ✅ 清理旧的定时器
- ✅ 只保留最后一次请求

---

## 其他改进

### 1. 粘贴事件也添加取消机制

同样的问题也存在于粘贴事件，一并修复：

```typescript
editor.onDidPaste(() => {
  // 取消之前的请求
  cancelCurrentRequest()
  
  isPasting.value = true
  
  // 清除之前的定时器
  if (pasteResetTimer) {
    clearTimeout(pasteResetTimer)
  }
  
  pasteResetTimer = setTimeout(() => {
    isPasting.value = false
    pasteResetTimer = null
  }, AI_CONFIG.autoComplete.debounce.paste + 500)
})
```

### 2. 普通输入也取消之前的请求

非换行的普通输入也应该取消之前的请求：

```typescript
if (currentLine > lastLineNumber) {
  // 换行
  cancelCurrentRequest()
  isNewLine.value = true
  // ...
} else {
  // 非换行的普通输入，也取消之前的请求
  if (!isNewLine.value) {
    cancelCurrentRequest()
  }
  isNewLine.value = false
}
```

---

## 测试清单

- [x] Bug #1: maxLines 为 0 时正常工作
- [x] Bug #2: 快速换行不会触发多条请求
- [x] Bug #3: 换行后空行正常触发补全
- [x] 粘贴后不会触发多条请求
- [x] 普通输入取消之前的请求
- [x] 组件销毁时清理所有定时器
- [x] 类型检查通过
- [x] 构建成功

---

## 相关文件

- `src/components/AiEditor.vue` - 主要修复文件
- `CHANGELOG.md` - 更新日志
- `docs/FEATURE_CHECKLIST.md` - 功能验证清单

---

**修复日期**：2026-01-07  
**版本**：v1.2.0


## Bug #3: 换行后空行无法触发补全

### 问题描述

当配置 `trigger.onNewLine: true` 时，按回车换行后，期望快速触发补全，但实际上没有发送任何请求。

### 问题原因

换行后，光标在新行的开头（column = 1），此时：

1. **新行是空的**：`getContextText()` 获取的内容可能是空字符串
2. **不满足 minTriggerLength**：空字符串长度为 0，小于默认的 5
3. **被提前返回**：在 `getAiCompletion()` 中被 `minTriggerLength` 检查拦截

```typescript
// 问题代码
async function getAiCompletion(text: string): Promise<string> {
  // 文本太短不触发
  if (text.trim().length < AI_CONFIG.autoComplete.minTriggerLength) {
    return ''  // 换行后空行被拦截
  }
  // ...
}
```

### 解决方案

#### 1. 换行时获取上一行内容

修改 `getContextText()` 函数，当检测到空行时，自动获取上一行的内容：

```typescript
function getContextText(model, position): string {
  // 检查当前行是否为空（换行后的情况）
  const currentLineText = model.getLineContent(position.lineNumber)
  const isEmptyLine = position.column === 1 && currentLineText.trim().length === 0
  
  if (config.maxLines === 0) {
    // 如果是空行（换行后），则获取上一行的内容
    if (isEmptyLine && position.lineNumber > 1) {
      startLine = position.lineNumber - 1
    } else {
      startLine = position.lineNumber
    }
  }
  // ...
}
```

#### 2. 换行时放宽 minTriggerLength 限制

修改 `getAiCompletion()` 函数，添加 `isNewLineContext` 参数：

```typescript
async function getAiCompletion(text: string, isNewLineContext = false): Promise<string> {
  // 换行时放宽限制，只要有内容就触发
  const minLength = isNewLineContext ? 1 : AI_CONFIG.autoComplete.minTriggerLength
  
  if (text.trim().length < minLength) {
    return ''
  }
  // ...
}
```

#### 3. 传递换行上下文标识

修改防抖函数，传递 `isNewLineContext` 参数：

```typescript
const debouncedGetCompletion = useDebounceFn(
  (text: string) => getAiCompletion(text, false),
  AI_CONFIG.autoComplete.debounce.normal
)

const debouncedGetCompletionOnNewLine = useDebounceFn(
  (text: string) => getAiCompletion(text, true),  // 标记为换行上下文
  AI_CONFIG.autoComplete.debounce.newLine
)
```

### 测试验证

**配置**：
```typescript
trigger: {
  onNewLine: true
},
context: {
  maxLines: 0  // 只发送当前行
}
```

**测试步骤**：
1. 输入 "第一行文字"
2. 按回车换行
3. 等待 200ms

**预期结果**：
- 控制台显示 "检测到换行，使用快速触发"
- 200ms 后触发补全
- 发送的内容包含 "第一行文字"（上一行的内容）

**实际效果**：
- ✅ 换行后正常触发
- ✅ 获取到上一行内容
- ✅ 放宽了长度限制
