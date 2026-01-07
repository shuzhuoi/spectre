/**
 * 本地 API 配置样例文件
 * 
 * 使用方法：
 * 1. 复制此文件并重命名为 config.local.ts
 * 2. 修改下方配置为你的实际值
 * 3. config.local.ts 不会被提交到 Git
 */

import type { AIConfig } from './config'

export const AI_CONFIG: AIConfig = {
  // ========== AI 服务提供商选择 ==========
  // 可选值: 'openai' | 'dify'
  provider: 'openai',

  // ========== OpenAI 配置 ==========
  openai: {
    // API 基础地址
    // OpenAI: https://api.openai.com/v1
    // Azure OpenAI: https://your-resource.openai.azure.com/openai/deployments/your-deployment
    // 通义千问: https://dashscope.aliyuncs.com/compatible-mode/v1
    // 本地 Ollama: http://localhost:11434/v1
    baseURL: 'https://api.openai.com/v1',

    // API 密钥
    // ⚠️ 注意：生产环境请通过后端代理，不要直接暴露 API Key
    apiKey: 'sk-your-api-key-here',

    // 模型名称
    // OpenAI: gpt-3.5-turbo, gpt-4, gpt-4-turbo
    // 通义千问: qwen-turbo, qwen-plus
    // 本地 Ollama: llama2, codellama, mistral
    model: 'gpt-3.5-turbo',

    // 补全时的最大 token 数
    maxTokens: 100,

    // 温度参数 (0-2)，值越低生成越确定，值越高生成越随机
    temperature: 0.3
  },

  // ========== Dify Workflow 配置 ==========
  dify: {
    // Dify API 基础地址（不包含 /workflows/run）
    // 例如: http://192.168.210.85/v1
    baseURL: 'http://your-dify-server/v1',

    // Dify API 密钥 (Bearer Token)
    // 在 Dify 应用的 API 访问页面获取
    apiKey: 'your-dify-api-key-here',

    // 输入变量名称
    // 这是你在 Dify workflow 中定义的输入变量名
    // 例如: 'text', 'prompt', 'input' 等
    inputVariable: 'text',

    // 响应模式
    // streaming: 流式返回（推荐）
    // blocking: 阻塞模式，等待完成后返回
    responseMode: 'streaming',

    // 输入文本最大长度
    // -1: 不限制长度（如果你的 Dify 实例支持更长输入）
    // >0: 限制为指定字符数（Dify 官方限制为 256）
    // 超过此长度会自动截断，保留最后的字符
    // 建议设置为 256 或更小
    maxInputLength: 256,

    // 无结果标识符
    // 当 Dify 返回此标识符时，表示没有补全结果，不会显示在页面上
    // 可以自定义为任何字符串，例如：'[NONE]', '[NO_RESULT]', '[EMPTY]' 等
    noResultIdentifier: '[NONE]'
  },

  // ========== 自动补全配置 ==========
  autoComplete: {
    // 触发补全的最小字符数
    minTriggerLength: 5,

    // 防抖延迟配置
    debounce: {
      // 正常编写延迟 (毫秒)
      // 建议: 300-800ms，太短会频繁请求，太长响应慢
      normal: 500,
      
      // 换行时延迟 (毫秒)
      // 建议: 100-300ms，换行时快速响应
      newLine: 200,
      
      // 粘贴后延迟 (毫秒)
      // 建议: 1000-2000ms，给用户时间调整粘贴的内容
      paste: 1000
    },

    // 上下文配置
    context: {
      // 上下文模式
      // 'lines': 按行数获取上下文（推荐）
      // 'chars': 按字符数获取上下文
      mode: 'lines',
      
      // 最多发送前N行
      // 0: 只发送当前行（不包含前面的行）
      // 3-5: 发送前3-5行 + 当前行（推荐）
      // 建议: 3-5行，既保留上下文又不会太长
      maxLines: 3,
      
      // 最多发送N个字符
      // 超过此长度会自动截断（保留最后的字符）
      // 建议: 500-1000字符
      maxChars: 500
    },

    // 触发条件配置
    trigger: {
      // 换行时是否触发
      // true: 换行时会使用更短的延迟快速触发
      // false: 换行时不特殊处理
      onNewLine: true,
      
      // 不触发的标点符号
      // 当光标前的字符是这些标点时，不会触发补全
      // 例如：句号、问号、感叹号等表示句子结束的符号
      // 建议: ['。', '.', '!', '?', '！', '？', '；', ';']
      skipAfterPunctuation: ['。', '.', '!', '?', '！', '？', '；', ';']
    }
  }
}

