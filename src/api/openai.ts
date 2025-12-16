/**
 * OpenAI 客户端封装
 * 使用官方 OpenAI Node.js SDK 实现流式补全功能
 */

import OpenAI from 'openai'
import { OPENAI_CONFIG, COMPLETION_SYSTEM_PROMPT } from './config'

/**
 * 创建 OpenAI 客户端实例
 * dangerouslyAllowBrowser: true 允许在浏览器环境中使用
 * ⚠️ 生产环境建议通过后端代理转发请求
 */
const client = new OpenAI({
  baseURL: OPENAI_CONFIG.baseURL,
  apiKey: OPENAI_CONFIG.apiKey,
  dangerouslyAllowBrowser: true // 允许在浏览器中使用
})

/**
 * 补全结果回调函数类型
 */
export type CompletionCallback = (chunk: string, done: boolean) => void

/**
 * 获取流式文本补全
 * @param prompt 用户输入的文本（光标前的内容）
 * @param onChunk 每次接收到新内容时的回调函数
 * @param signal AbortSignal 用于取消请求
 * @returns 返回完整的补全文本
 */
export async function getStreamCompletion(
  prompt: string,
  onChunk?: CompletionCallback,
  signal?: AbortSignal
): Promise<string> {
  try {
    // 创建流式聊天补全请求
    const stream = await client.chat.completions.create(
      {
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: COMPLETION_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `请补全以下文本的后续内容：\n\n${prompt}`
          }
        ],
        max_tokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature,
        stream: true, // 启用流式输出
        stop: ['\n\n', '。\n', '.\n'] // 遇到这些字符停止生成
      },
      {
        signal // 传递 AbortSignal 用于取消请求
      }
    )

    let fullCompletion = ''

    // 处理流式响应
    for await (const chunk of stream) {
      // 检查是否被取消
      if (signal?.aborted) {
        break
      }

      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        fullCompletion += content
        // 调用回调函数，传递当前内容块和完成状态
        onChunk?.(content, false)
      }
    }

    // 通知补全完成
    onChunk?.('', true)

    return fullCompletion
  } catch (error: unknown) {
    // 如果是取消请求，不抛出错误
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('[AI 补全] 请求已取消')
      return ''
    }

    console.error('[AI 补全] 请求失败:', error)
    throw error
  }
}

/**
 * 获取非流式文本补全（一次性返回）
 * @param prompt 用户输入的文本
 * @param signal AbortSignal 用于取消请求
 * @returns 返回补全文本
 */
export async function getCompletion(
  prompt: string,
  signal?: AbortSignal
): Promise<string> {
  try {
    const response = await client.chat.completions.create(
      {
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: COMPLETION_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `请补全以下文本的后续内容：\n\n${prompt}`
          }
        ],
        max_tokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature,
        stream: false
      },
      {
        signal
      }
    )

    return response.choices[0]?.message?.content || ''
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('[AI 补全] 请求已取消')
      return ''
    }

    console.error('[AI 补全] 请求失败:', error)
    throw error
  }
}

/**
 * 检查 API 配置是否有效
 * @returns 配置是否有效
 */
export function isConfigValid(): boolean {
  return (
    OPENAI_CONFIG.baseURL.length > 0 &&
    OPENAI_CONFIG.apiKey.length > 0 &&
    OPENAI_CONFIG.apiKey !== 'sk-your-api-key-here'
  )
}

/**
 * 导出客户端实例（用于高级用法）
 */
export { client }

