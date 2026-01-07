# 无结果标识符说明

## 📋 功能说明

当 Dify Workflow 判断不需要提供补全时，可以返回一个特殊的标识符，系统会识别这个标识符并不在页面上显示任何内容。

## 🎯 使用场景

### 场景 1：输入不完整

```
用户输入：机房
AI 判断：输入太短，无法准确补全
返回：[NONE]
结果：不显示任何补全
```

### 场景 2：已经完整

```
用户输入：机房出入口区域有门禁系统、监控摄像头和访客登记台。
AI 判断：句子已经完整，不需要补全
返回：[NONE]
结果：不显示任何补全
```

### 场景 3：无法理解上下文

```
用户输入：asdfghjkl
AI 判断：无法理解输入内容
返回：[NONE]
结果：不显示任何补全
```

### 场景 4：敏感内容过滤

```
用户输入：如何制作...（敏感内容）
AI 判断：内容不适合补全
返回：[NONE]
结果：不显示任何补全
```

## ⚙️ 配置方法

### 1. 在配置文件中设置

```typescript
// src/api/config.local.ts
export const AI_CONFIG: AIConfig = {
  provider: 'dify',
  
  dify: {
    baseURL: 'http://192.168.210.85/v1',
    apiKey: 'app-xxx',
    inputVariable: 'inputText',
    responseMode: 'streaming',
    maxInputLength: 256,
    
    // 设置无结果标识符
    noResultIdentifier: '[NONE]'  // 可以自定义
  }
}
```

### 2. 自定义标识符

你可以使用任何字符串作为标识符：

```typescript
// 示例 1：使用 [NONE]
noResultIdentifier: '[NONE]'

// 示例 2：使用 [NO_RESULT]
noResultIdentifier: '[NO_RESULT]'

// 示例 3：使用 [EMPTY]
noResultIdentifier: '[EMPTY]'

// 示例 4：使用 <empty>
noResultIdentifier: '<empty>'

// 示例 5：使用中文
noResultIdentifier: '无结果'

// 示例 6：使用特殊字符
noResultIdentifier: '###NONE###'
```

## 🔧 在 Dify Workflow 中配置

### 方法 1：使用条件节点

```
开始
  ↓
判断输入长度
  ↓
├─ 长度 < 5 → 返回 "[NONE]"
└─ 长度 >= 5 → 调用 LLM 补全
```

### 方法 2：在 LLM 提示词中配置

```
系统提示词：
你是一个智能补全助手。根据用户输入预测接下来的内容。

规则：
1. 如果输入太短（少于5个字符），返回 [NONE]
2. 如果句子已经完整，返回 [NONE]
3. 如果无法理解上下文，返回 [NONE]
4. 否则，返回合适的补全内容

用户输入：{{inputText}}
```

### 方法 3：使用代码节点

```python
def check_input(input_text):
    # 检查输入长度
    if len(input_text) < 5:
        return "[NONE]"
    
    # 检查是否已完整（以句号结尾）
    if input_text.strip().endswith(('。', '.', '！', '!', '？', '?')):
        return "[NONE]"
    
    # 检查是否包含敏感词
    sensitive_words = ['敏感词1', '敏感词2']
    if any(word in input_text for word in sensitive_words):
        return "[NONE]"
    
    # 继续处理
    return None  # 继续到下一个节点
```

## 📊 工作流程

### 流式模式（streaming）

```
1. 用户输入文本
   ↓
2. 发送到 Dify Workflow
   ↓
3. Dify 判断是否需要补全
   ↓
4. 返回结果
   ├─ 正常补全：显示补全内容
   └─ 返回 [NONE]：不显示任何内容
```

### 系统处理逻辑

```typescript
// 流式模式
if (fullCompletion.trim() === config.noResultIdentifier) {
  console.log(`[Dify] 收到无结果标识符 "${config.noResultIdentifier}"，不显示补全`)
  return ''  // 返回空字符串，不显示补全
}

// 阻塞模式
if (outputText.trim() === config.noResultIdentifier) {
  console.log(`[Dify] 收到无结果标识符 "${config.noResultIdentifier}"，不显示补全`)
  return ''  // 返回空字符串，不显示补全
}
```

## 🔍 调试技巧

### 1. 查看控制台日志

当 Dify 返回无结果标识符时，会在控制台输出：

```
[Dify] 收到无结果标识符 "[NONE]"，不显示补全
```

### 2. 测试不同场景

```typescript
// 测试 1：短输入
输入：机
预期：返回 [NONE]，不显示补全

// 测试 2：完整句子
输入：机房出入口区域有门禁系统。
预期：返回 [NONE]，不显示补全

// 测试 3：正常输入
输入：机房出入口区域有
预期：返回补全内容，显示补全
```

### 3. 使用测试工具

打开 `test-dify.html`，手动测试不同输入：

```html
输入框：机房出入口区域有
点击"测试流式模式"
查看日志：
  - 如果返回 [NONE]：日志显示"收到无结果标识符"
  - 如果返回补全：日志显示补全内容
```

## 💡 最佳实践

### 1. 选择合适的标识符

```typescript
// ✅ 推荐：使用明确的标识符
noResultIdentifier: '[NONE]'
noResultIdentifier: '[NO_RESULT]'

// ⚠️ 不推荐：使用常见词汇（可能与正常补全冲突）
noResultIdentifier: 'none'
noResultIdentifier: '无'
```

### 2. 在 Dify 中统一使用

确保 Dify Workflow 中所有返回无结果的地方都使用相同的标识符：

```
条件节点 1 → 返回 "[NONE]"
条件节点 2 → 返回 "[NONE]"
LLM 节点 → 提示词中使用 "[NONE]"
```

### 3. 记录日志

在 Dify Workflow 中添加日志节点，记录何时返回无结果：

```
判断节点
  ↓
├─ 需要补全 → 调用 LLM
└─ 不需要补全 → 记录日志 + 返回 "[NONE]"
```

## 🎨 示例：完整的 Dify Workflow

```yaml
工作流名称: 智能文本补全

节点 1: 开始
  - 输入变量: inputText

节点 2: 代码节点 - 预处理
  - 检查输入长度
  - 检查是否完整
  - 检查敏感词
  - 输出: shouldComplete (true/false)

节点 3: 条件节点
  - 如果 shouldComplete == false
    → 返回 "[NONE]"
  - 如果 shouldComplete == true
    → 继续到节点 4

节点 4: LLM 节点
  - 模型: gpt-3.5-turbo
  - 提示词: "补全以下文本：{{inputText}}"
  - 输出: completion

节点 5: 代码节点 - 后处理
  - 清理补全内容
  - 检查质量
  - 如果质量不好，返回 "[NONE]"
  - 否则返回 completion

节点 6: 结束
  - 输出: text
```

## ❓ 常见问题

### Q1：为什么我的补全总是不显示？

A：检查以下几点：
1. Dify 是否总是返回 `[NONE]`？
2. `noResultIdentifier` 配置是否正确？
3. 查看浏览器控制台日志

### Q2：可以使用空字符串作为标识符吗？

A：不建议。空字符串可能与真正的"无内容"混淆。建议使用明确的标识符如 `[NONE]`。

### Q3：标识符区分大小写吗？

A：是的。`[NONE]` 和 `[none]` 是不同的标识符。

### Q4：可以使用多个标识符吗？

A：目前只支持一个标识符。如果需要多个，可以在 Dify Workflow 中统一转换为配置的标识符。

### Q5：标识符会被显示在页面上吗？

A：不会。系统会识别并过滤掉标识符，不会显示在页面上。

## 📚 相关文档

- [Dify 接入指南](./DIFY_INTEGRATION.md)
- [快速开始](./QUICK_START_DIFY.md)
- [配置示例](./CONFIG_EXAMPLES.md)

---

**最后更新**：2026-01-06
