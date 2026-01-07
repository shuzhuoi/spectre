# Dify Workflow 接入指南

本文档说明如何将 Spectre 项目接入 Dify Workflow API。

## 📋 功能特性

- ✅ 支持 OpenAI 和 Dify 两种 AI 服务提供商
- ✅ 可配置的 baseURL 和 API Key
- ✅ 支持流式（streaming）和阻塞（blocking）两种响应模式
- ✅ 自动处理 Dify SSE 事件流
- ✅ 可配置的输入变量名称
- ✅ 一键切换 AI 服务提供商

## 🔧 配置步骤

### 1. 编辑配置文件

打开 `src/api/config.local.ts`，修改以下配置：

```typescript
export const AI_CONFIG: AIConfig = {
  // ========== 选择 Dify 作为提供商 ==========
  provider: 'dify',  // 改为 'dify'

  // ========== Dify Workflow 配置 ==========
  dify: {
    // Dify API 基础地址（不包含 /workflows/run）
    baseURL: 'http://192.168.210.85/v1',

    // Dify API 密钥（从 Dify 应用的 API 访问页面获取）
    apiKey: 'app-gtrCLjE2A32SNXFoR05xVYfq',

    // 输入变量名称（你在 Dify workflow 中定义的输入变量名）
    inputVariable: 'inputText',  // 你的工作流使用 'inputText'

    // 响应模式：streaming（推荐）或 blocking
    responseMode: 'streaming',

    // 输入文本最大长度（Dify 限制为 256 字符）
    // -1: 不限制长度
    // >0: 限制为指定字符数
    maxInputLength: 256,

    // 无结果标识符
    noResultIdentifier: '[NONE]'
  },

  // ... 其他配置
}
```

### 2. 配置说明

#### baseURL
- 格式：`http://your-dify-server/v1`
- 不要包含 `/workflows/run` 路径
- 示例：`http://192.168.210.85/v1`

#### apiKey
- 在 Dify 应用的「API 访问」页面获取
- 格式：`app-xxxxxxxxxx`
- 使用 Bearer Token 认证

#### inputVariable
- 这是你在 Dify workflow 中定义的输入变量名
- 必须与 workflow 中的变量名完全一致
- 你的工作流使用：`inputText`

#### responseMode
- `streaming`：流式返回（推荐），实时显示补全内容
- `blocking`：阻塞模式，等待完成后一次性返回

#### noResultIdentifier
- 无结果标识符，用于标识 Dify 没有补全结果
- 当 Dify 返回此标识符时，不会在页面上显示任何内容
- 可以自定义为任何字符串
- 常用值：
  - `[NONE]` - 默认值
  - `[NO_RESULT]` - 无结果
  - `[EMPTY]` - 空结果
  - `<empty>` - 自定义标识
- 使用场景：当 AI 判断不需要补全时，返回此标识符
- Dify Workflow 的输入变量最多只能接收 **256 个字符**（官方限制）
- 配置说明：
  - `-1`：不限制长度（如果你的 Dify 实例支持更长输入）
  - `>0`：限制为指定字符数，超过会自动截断
- 超过此长度的文本会自动截断，保留最后的字符
- 建议设置为 `256` 或更小
- OpenAI 模式不受此限制

## 🔄 切换 AI 服务提供商

只需修改 `provider` 字段即可：

```typescript
// 使用 Dify
provider: 'dify'

// 使用 OpenAI
provider: 'openai'
```

## 📡 API 请求示例

当你配置为 Dify 后，系统会自动发送如下请求：

```bash
curl --location 'http://192.168.210.85/v1/workflows/run' \
--header 'Authorization: Bearer app-gtrCLjE2A32SNXFoR05xVYfq' \
--header 'Content-Type: application/json' \
--data '{
  "inputs": {
    "inputText": "用户输入的文本内容"
  },
  "response_mode": "streaming",
  "user": "spectre-user-1704528000000"
}'
```

## 🎯 Dify Workflow 输出要求

### 流式模式（streaming）

你的 Dify workflow 需要输出 `text_chunk` 事件，系统会自动提取其中的文本内容：

```json
{
  "event": "text_chunk",
  "data": {
    "text": "补全的文本内容",
    "from_variable_selector": ["node_id", "output_field"]
  }
}
```

### 阻塞模式（blocking）

系统会从响应的 `data.outputs` 中提取文本：

```json
{
  "data": {
    "outputs": {
      "text": "补全的文本内容",
      // 或
      "result": "补全的文本内容"
    }
  }
}
```

如果你的输出字段名不是 `text` 或 `result`，可能需要修改 `src/api/dify.ts` 中的提取逻辑。

## 🔍 事件处理

Dify 客户端会自动处理以下 SSE 事件：

| 事件类型 | 说明 | 处理方式 |
|---------|------|---------|
| `workflow_started` | Workflow 开始执行 | 记录日志 |
| `node_started` | 节点开始执行 | 记录日志 |
| `text_chunk` | 文本片段 | **提取并显示** |
| `node_finished` | 节点执行完成 | 记录日志 |
| `workflow_finished` | Workflow 执行完成 | 记录日志 |
| `ping` | 心跳事件 | 保持连接 |

## 🐛 调试技巧

### 1. 查看控制台日志

打开浏览器开发者工具（F12），查看 Console 标签页：

```
[Dify] Workflow 开始执行
[Dify] 节点开始执行: node_id_xxx
[Dify] 节点执行完成: node_id_xxx
[Dify] Workflow 执行完成: succeeded
```

### 2. 检查网络请求

在 Network 标签页中查看：
- 请求 URL：`http://192.168.210.85/v1/workflows/run`
- 请求方法：`POST`
- 请求头：包含 `Authorization: Bearer app-xxx`
- 响应类型：`text/event-stream`

### 3. 常见问题

#### 问题：补全不生效
- 检查 `baseURL` 是否正确（不要包含 `/workflows/run`）
- 检查 `apiKey` 是否有效
- 检查 `inputVariable` 是否与 workflow 中的变量名一致
- 查看浏览器控制台是否有错误信息

#### 问题：收不到文本内容
- 确认 workflow 输出了 `text_chunk` 事件
- 检查 `text_chunk` 事件的 `data.text` 字段是否有内容
- 如果使用阻塞模式，检查 `data.outputs.text` 或 `data.outputs.result`

#### 问题：CORS 错误
- Dify 服务需要配置 CORS 允许浏览器访问
- 或者通过后端代理转发请求

## 📝 代码结构

```
src/api/
├── config.ts              # 配置类型定义
├── config.local.ts        # 本地配置（你的配置）
├── config.local.example.ts # 配置样例
├── client.ts              # 统一客户端接口（自动选择提供商）
├── openai.ts              # OpenAI 客户端实现
├── dify.ts                # Dify 客户端实现 ⭐
└── index.ts               # 模块导出
```

## 🎨 自定义输出字段

如果你的 Dify workflow 输出字段不是 `text` 或 `result`，需要修改 `src/api/dify.ts`：

### 流式模式

找到 `text_chunk` 事件处理部分：

```typescript
case 'text_chunk':
  if (event.data?.text) {  // 修改这里的字段名
    const text = event.data.text
    fullCompletion += text
    onChunk?.(text, false)
  }
  break
```

### 阻塞模式

找到 `getCompletion` 函数：

```typescript
// 从 outputs 中提取文本结果
const outputText = result.data?.outputs?.text || 
                   result.data?.outputs?.result || 
                   result.data?.outputs?.your_field_name || ''  // 添加你的字段名
```

## 🚀 测试

1. 启动开发服务器：
```bash
pnpm dev
```

2. 打开浏览器访问 `http://localhost:3000`

3. 在编辑器中输入文本，等待 AI 补全

4. 查看控制台日志确认 Dify API 调用成功

## 📚 相关文档

- [Dify Workflow API 文档](https://docs.dify.ai/v/zh-hans/guides/workflow)
- [Spectre 项目文档](./README.md)
- [项目架构分析](../../AGENT.md)

## ⚠️ 注意事项

1. **API Key 安全**：不要将 `config.local.ts` 提交到 Git
2. **网络访问**：确保浏览器能访问 Dify 服务器地址
3. **CORS 配置**：生产环境建议通过后端代理
4. **变量名匹配**：`inputVariable` 必须与 workflow 中的变量名完全一致
5. **输出格式**：确保 workflow 输出符合预期格式
6. **⚠️ 字符长度限制**：Dify Workflow 输入变量最多只能接收 **256 个字符**
   - 系统会自动截断超长文本，保留最后 256 个字符
   - 如果需要更长的上下文，建议使用 OpenAI 模式
   - 可以通过 `maxInputLength` 参数调整截断长度

## 🎉 完成

配置完成后，你就可以使用 Dify Workflow 进行 AI 文本补全了！系统会自动处理流式响应，实时显示补全内容。

如有问题，请查看浏览器控制台日志或检查网络请求详情。
