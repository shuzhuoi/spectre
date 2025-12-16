/**
 * 本地 API 配置样例文件
 * 
 * 使用方法：
 * 1. 复制此文件并重命名为 config.local.ts
 * 2. 修改下方配置为你的实际值
 * 3. config.local.ts 不会被提交到 Git
 */

import type { OpenAIConfig } from './config'

export const OPENAI_CONFIG: OpenAIConfig = {
  // API 基础地址 - 修改为你的 API 服务地址
  // OpenAI: https://api.openai.com/v1
  // Azure OpenAI: https://your-resource.openai.azure.com/openai/deployments/your-deployment
  // 通义千问: https://dashscope.aliyuncs.com/compatible-mode/v1
  // 本地 Ollama: http://localhost:11434/v1
  baseURL: 'https://api.openai.com/v1',

  // API 密钥 - 修改为你的 API Key
  // ⚠️ 注意：生产环境请通过后端代理，不要直接暴露 API Key
  apiKey: 'sk-your-api-key-here',

  // 模型名称 - 根据你使用的服务选择
  // OpenAI: gpt-3.5-turbo, gpt-4, gpt-4-turbo
  // 通义千问: qwen-turbo, qwen-plus
  // 本地 Ollama: llama2, codellama, mistral
  model: 'gpt-3.5-turbo',

  // 补全时的最大 token 数
  maxTokens: 100,

  // 温度参数 (0-2)，值越低生成越确定，值越高生成越随机
  temperature: 0.3,

  // 触发补全的最小字符数
  minTriggerLength: 5,

  // 防抖延迟时间 (毫秒)
  debounceDelay: 500
}

