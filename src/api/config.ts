/**
 * AI API 配置文件
 * 支持多种 AI 服务接入方式
 *
 * 支持的 API 服务:
 * - OpenAI: https://api.openai.com/v1
 * - Azure OpenAI: https://your-resource.openai.azure.com/openai/deployments/your-deployment
 * - 通义千问: https://dashscope.aliyuncs.com/compatible-mode/v1
 * - 本地 Ollama: http://localhost:11434/v1
 * - Dify Workflow: http://your-dify-server/v1
 * - 其他兼容 OpenAI 格式的服务
 */

/**
 * AI 服务提供商类型
 */
export type AIProvider = 'openai' | 'dify'

/**
 * OpenAI 配置接口
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
}

/**
 * Dify Workflow 配置接口
 */
export interface DifyConfig {
  /** API 基础地址 */
  baseURL: string
  /** API 密钥 (Bearer Token) */
  apiKey: string
  /** 输入变量名称（Dify workflow 中定义的输入变量） */
  inputVariable: string
  /** 响应模式：streaming 流式 / blocking 阻塞 */
  responseMode: 'streaming' | 'blocking'
  /** 
   * 输入文本最大长度
   * - -1: 不限制长度
   * - >0: 限制为指定字符数（Dify 官方限制为 256）
   */
  maxInputLength: number
  /**
   * 无结果标识符
   * 当 Dify 返回此标识符时，表示没有补全结果，不会显示在页面上
   * 例如：'[NONE]', '[NO_RESULT]', '[EMPTY]' 等
   */
  noResultIdentifier: string
}

/**
 * 上下文模式
 * - lines: 按行数获取上下文
 * - chars: 按字符数获取上下文
 */
export type ContextMode = 'lines' | 'chars'

/**
 * 自动补全配置接口
 */
export interface AutoCompleteConfig {
  /** 触发补全的最小字符数 */
  minTriggerLength: number
  
  /** 防抖延迟配置 */
  debounce: {
    /** 正常编写延迟 (毫秒) */
    normal: number
    /** 换行时延迟 (毫秒) */
    newLine: number
    /** 粘贴后延迟 (毫秒) */
    paste: number
  }
  
  /** 上下文配置 */
  context: {
    /** 上下文模式 */
    mode: ContextMode
    /** 最多发送前N行（0表示只发送当前行） */
    maxLines: number
    /** 最多发送N个字符 */
    maxChars: number
  }
  
  /** 触发条件配置 */
  trigger: {
    /** 换行时是否触发 */
    onNewLine: boolean
    /** 不触发的标点符号（如句号、问号等） */
    skipAfterPunctuation: string[]
  }
}

/**
 * 统一 AI 配置接口
 */
export interface AIConfig {
  /** AI 服务提供商 */
  provider: AIProvider
  /** OpenAI 配置 */
  openai: OpenAIConfig
  /** Dify 配置 */
  dify: DifyConfig
  /** 自动补全配置 */
  autoComplete: AutoCompleteConfig
}

/**
 * 从本地配置文件导入配置
 * 请复制 config.local.example.ts 为 config.local.ts 并填入你的配置
 */
export { AI_CONFIG } from './config.local'


/**
 * 补全提示词模板（用于 OpenAI）
 * 用于指导 AI 生成合适的补全内容
 */
export const COMPLETION_SYSTEM_PROMPT = `你是一个智能文本补全助手。根据用户输入的内容，预测并补全接下来最可能的文字。

规则：
1. 只返回补全的内容，不要重复用户已输入的文字
2. 补全内容应该自然、流畅，符合上下文语境
3. 保持简洁，通常返回一个句子或短语即可
4. 如果是代码，遵循正确的语法和编码规范
5. 不要添加任何解释或额外的文字`
