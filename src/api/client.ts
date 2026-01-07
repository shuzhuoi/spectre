/**
 * 统一 AI 客户端接口
 * 根据配置自动选择 OpenAI 或 Dify
 */

import { AI_CONFIG } from './config'
import type { CompletionCallback } from './openai'
import * as OpenAIClient from './openai'
import * as DifyClient from './dify'

/**
 * 获取流式文本补全（自动选择提供商）
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
  const provider = AI_CONFIG.provider

  switch (provider) {
    case 'openai':
      return OpenAIClient.getStreamCompletion(prompt, onChunk, signal)
    
    case 'dify':
      return DifyClient.getStreamCompletion(prompt, onChunk, signal)
    
    default:
      throw new Error(`不支持的 AI 提供商: ${provider}`)
  }
}

/**
 * 获取非流式文本补全（自动选择提供商）
 * @param prompt 用户输入的文本
 * @param signal AbortSignal 用于取消请求
 * @returns 返回补全文本
 */
export async function getCompletion(
  prompt: string,
  signal?: AbortSignal
): Promise<string> {
  const provider = AI_CONFIG.provider

  switch (provider) {
    case 'openai':
      return OpenAIClient.getCompletion(prompt, signal)
    
    case 'dify':
      return DifyClient.getCompletion(prompt, signal)
    
    default:
      throw new Error(`不支持的 AI 提供商: ${provider}`)
  }
}

/**
 * 检查 API 配置是否有效
 * @returns 配置是否有效
 */
export function isConfigValid(): boolean {
  const provider = AI_CONFIG.provider

  switch (provider) {
    case 'openai':
      return OpenAIClient.isConfigValid()
    
    case 'dify':
      return DifyClient.isConfigValid()
    
    default:
      return false
  }
}

/**
 * 获取当前使用的 AI 提供商名称
 * @returns 提供商名称
 */
export function getProviderName(): string {
  const provider = AI_CONFIG.provider
  
  switch (provider) {
    case 'openai':
      return 'OpenAI'
    case 'dify':
      return 'Dify Workflow'
    default:
      return 'Unknown'
  }
}

/**
 * 获取当前模型信息
 * @returns 模型信息字符串
 */
export function getModelInfo(): string {
  const provider = AI_CONFIG.provider
  
  switch (provider) {
    case 'openai':
      return `${getProviderName()} - ${AI_CONFIG.openai.model}`
    case 'dify':
      return `${getProviderName()}`
    default:
      return 'Unknown'
  }
}
