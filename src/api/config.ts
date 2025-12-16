/**
 * OpenAI API 配置文件
 * 独立存放 baseURL 和 apiKey，方便切换不同的 LLM 服务
 *
 * 支持的 API 服务:
 * - OpenAI: https://api.openai.com/v1
 * - Azure OpenAI: https://your-resource.openai.azure.com/openai/deployments/your-deployment
 * - 通义千问: https://dashscope.aliyuncs.com/compatible-mode/v1
 * - 本地 Ollama: http://localhost:11434/v1
 * - 其他兼容 OpenAI 格式的服务
 */

export interface OpenAIConfig {
  /** API 基础地址 */
  baseURL: string
  /** API 密钥 */
  apiKey: string
  /** 使用的模型名称 */
  model: string
  /** 补全时的最大 token 数 */
  maxTokens: number
  /** 温度参数，控制生成的随机性 (0-2) */
  temperature: number
  /** 触发补全的最小字符数 */
  minTriggerLength: number
  /** 防抖延迟时间 (毫秒) */
  debounceDelay: number
}

/**
 * 从本地配置文件导入配置
 * 请复制 config.local.example.ts 为 config.local.ts 并填入你的配置
 */
export { OPENAI_CONFIG } from './config.local'

/**
 * 补全提示词模板
 * 用于指导 AI 生成合适的补全内容
 */
export const COMPLETION_SYSTEM_PROMPT = `你是一个智能文本补全助手。根据用户输入的内容，预测并补全接下来最可能的文字。

规则：
1. 只返回补全的内容，不要重复用户已输入的文字
2. 补全内容应该自然、流畅，符合上下文语境
3. 保持简洁，通常返回一个句子或短语即可
4. 如果是代码，遵循正确的语法和编码规范
5. 不要添加任何解释或额外的文字`
