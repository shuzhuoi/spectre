# 🚀 Dify 快速开始指南

5 分钟内完成 Dify Workflow 接入！

## ✅ 前置条件

- ✅ 已有 Dify 服务器和 Workflow
- ✅ 已获取 Dify API Key
- ✅ 已知 Workflow 的输入变量名

## 📝 步骤 1：修改配置文件

打开 `src/api/config.local.ts`，修改以下内容：

```typescript
export const AI_CONFIG: AIConfig = {
  // 1️⃣ 改为 'dify'
  provider: 'dify',

  // 2️⃣ 配置 Dify 信息
  dify: {
    // 你的 Dify 服务器地址
    baseURL: 'http://192.168.210.85/v1',
    
    // 你的 API Key（从 Dify 应用的 API 访问页面获取）
    apiKey: 'app-gtrCLjE2A32SNXFoR05xVYfq',
    
    // 你的 Workflow 输入变量名
    inputVariable: 'inputText',
    
    // 使用流式模式（推荐）
    responseMode: 'streaming',
    
    // 输入文本最大长度（Dify 限制为 256 字符）
    // -1: 不限制长度
    // >0: 限制为指定字符数
    maxInputLength: 256,
    
    // 无结果标识符（当 Dify 返回此值时不显示补全）
    noResultIdentifier: '[NONE]'
  },

  // 其他配置保持不变
  openai: { /* ... */ },
  minTriggerLength: 5,
  debounceDelay: 500
}
```

### 🔍 如何获取这些信息？

#### baseURL
- 格式：`http://你的服务器地址/v1`
- 示例：`http://192.168.210.85/v1`
- ⚠️ 注意：不要包含 `/workflows/run`

#### apiKey
1. 登录 Dify
2. 打开你的应用
3. 点击「API 访问」
4. 复制 API Key（格式：`app-xxxxxxxxxx`）

#### inputVariable
1. 打开你的 Workflow
2. 查看「开始」节点
3. 找到输入变量的名称
4. 例如：`inputText`、`text`、`prompt` 等

## 🧪 步骤 2：测试连接（可选）

在浏览器中打开 `test-dify.html` 文件，测试 API 连接是否正常。

## 🚀 步骤 3：启动项目

```bash
pnpm dev
```

## 🎉 步骤 4：开始使用

1. 打开浏览器访问 `http://localhost:3000`
2. 在编辑器中输入文字
3. 等待 AI 自动补全（灰色幽灵文字）
4. 按 `Tab` 接受补全

## 🔍 验证是否成功

### 方法 1：查看页面标题栏

页面顶部应该显示：
```
✨ AI 文本补全
[已配置] 模型: Dify Workflow
```

### 方法 2：查看浏览器控制台

按 `F12` 打开开发者工具，应该看到：
```
[Dify] Workflow 开始执行
[Dify] 节点开始执行: xxx
[Dify] 节点执行完成: xxx
[Dify] Workflow 执行完成: succeeded
```

### 方法 3：查看网络请求

在 Network 标签页中，应该看到：
- URL: `http://192.168.210.85/v1/workflows/run`
- Method: `POST`
- Status: `200`
- Type: `text/event-stream`

## ❌ 常见问题

### 问题 1：补全不生效

**可能原因**：
- ❌ `baseURL` 配置错误
- ❌ `apiKey` 无效
- ❌ `inputVariable` 与 Workflow 不匹配

**解决方法**：
1. 检查配置文件是否正确
2. 使用 `test-dify.html` 测试 API
3. 查看浏览器控制台错误信息

### 问题 2：CORS 错误

**错误信息**：
```
Access to fetch at 'http://...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**解决方法**：
1. 在 Dify 服务器配置 CORS
2. 或使用后端代理转发请求

### 问题 3：收不到文本内容

**可能原因**：
- ❌ Workflow 没有输出 `text_chunk` 事件
- ❌ 输出字段名不是 `text` 或 `result`

**解决方法**：
1. 检查 Workflow 配置
2. 查看浏览器控制台的事件日志
3. 如果输出字段名不同，需要修改 `src/api/dify.ts`

### 问题 4：输入文本被截断

**现象**：
- 输入较长文本时，只有最后 256 个字符被发送

**原因**：
- ✅ 这是正常行为！Dify Workflow 输入变量最多只能接收 256 个字符

**解决方法**：
1. 如果需要更长的上下文，使用 OpenAI 模式
2. 或者调整 `maxInputLength` 参数（不建议超过 256）
3. 在 Dify Workflow 中优化提示词，使其能在短文本下工作

### 问题 5：网络连接失败

**错误信息**：
```
Failed to fetch
```

**解决方法**：
1. 确认 Dify 服务器地址正确
2. 确认浏览器能访问该地址
3. 检查防火墙设置

## 🔄 切换回 OpenAI

如果需要切换回 OpenAI，只需修改一行：

```typescript
export const AI_CONFIG: AIConfig = {
  provider: 'openai',  // 改回 'openai'
  // ...
}
```

## 📚 更多文档

- [详细接入指南](./DIFY_INTEGRATION.md) - 完整的配置说明和技术细节
- [更新日志](./CHANGELOG_DIFY.md) - 了解新增功能和变更
- [项目文档](./README.md) - 项目主文档

## 💡 提示

1. **测试建议**：先使用 `test-dify.html` 测试 API，确认连接正常后再启动项目
2. **调试技巧**：打开浏览器控制台（F12），查看详细的日志信息
3. **性能优化**：如果补全速度慢，可以调整 `debounceDelay` 参数
4. **安全提醒**：不要将 `config.local.ts` 提交到 Git

## 🎯 下一步

- 尝试调整 `minTriggerLength` 和 `debounceDelay` 参数
- 在 Dify 中优化 Workflow 的提示词
- 探索更多编辑器功能（主题切换、语言切换等）

---

**需要帮助？** 查看 [DIFY_INTEGRATION.md](./DIFY_INTEGRATION.md) 获取更多信息。
