/**
 * Dify Workflow API 客户端封装
 * 实现 Dify Workflow 的流式和阻塞式补全功能
 */

import { AI_CONFIG } from './config'
import type { DifyConfig } from './config'

/**
 * 补全结果回调函数类型
 */
export type CompletionCallback = (chunk: string, done: boolean) => void

/**
 * Dify Workflow 执行请求参数
 */
interface DifyWorkflowRequest {
  inputs: Record<string, any>
  response_mode: 'streaming' | 'blocking'
  user: string
  files?: Array<{
    type: string
    transfer_method: string
    url?: string
    upload_file_id?: string
  }>
}

/**
 * Dify 流式响应事件类型
 */
interface DifyStreamEvent {
  event: string
  task_id?: string
  workflow_run_id?: string
  data?: any
}

/**
 * 获取 Dify 配置
 */
function getDifyConfig(): DifyConfig {
  return AI_CONFIG.dify
}

/**
 * 解析 SSE 数据
 */
function parseSSEData(line: string): DifyStreamEvent | null {
  if (!line.startsWith('data: ')) {
    return null
  }
  
  try {
    const jsonStr = line.substring(6).trim()
    if (!jsonStr) return null
    return JSON.parse(jsonStr)
  } catch (error) {
    console.error('[Dify] 解析 SSE 数据失败:', error)
    return null
  }
}

/**
 * 获取流式文本补全（Dify Workflow）
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
  const config = getDifyConfig()
  
  try {
    // 处理输入文本长度限制
    let truncatedPrompt = prompt
    if (config.maxInputLength > 0 && prompt.length > config.maxInputLength) {
      // 从末尾截取，保留最近的内容
      truncatedPrompt = prompt.slice(-config.maxInputLength)
      console.log(`[Dify] 输入文本过长 (${prompt.length} 字符)，已截断为最后 ${config.maxInputLength} 字符`)
    } else if (config.maxInputLength === -1) {
      // -1 表示不限制
      console.log(`[Dify] 输入文本长度: ${prompt.length} 字符（不限制）`)
    }
    
    // 构建请求体
    const requestBody: DifyWorkflowRequest = {
      inputs: {
        [config.inputVariable]: truncatedPrompt
      },
      response_mode: 'streaming',
      user: 'spectre-user-' + Date.now()
    }

    // 发起请求
    const response = await fetch(`${config.baseURL}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal
    })

    if (!response.ok) {
      throw new Error(`Dify API 请求失败: ${response.status} ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error('响应体为空')
    }

    // 处理流式响应
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullCompletion = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break
      if (signal?.aborted) break

      // 解码数据块
      buffer += decoder.decode(value, { stream: true })
      
      // 按行分割
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留最后一个不完整的行

      // 处理每一行
      for (const line of lines) {
        if (!line.trim()) continue

        const event = parseSSEData(line)
        if (!event) continue

        // 处理不同类型的事件
        switch (event.event) {
          case 'text_chunk':
            // 文本片段事件
            if (event.data?.text) {
              const text = event.data.text
              fullCompletion += text
              onChunk?.(text, false)
            }
            break

          case 'workflow_finished':
            // workflow 执行完成
            console.log('[Dify] Workflow 执行完成:', event.data?.status)
            break

          case 'node_finished':
            // 节点执行完成
            console.log('[Dify] 节点执行完成:', event.data?.node_id)
            break

          case 'workflow_started':
            // workflow 开始执行
            console.log('[Dify] Workflow 开始执行')
            break

          case 'node_started':
            // 节点开始执行
            console.log('[Dify] 节点开始执行:', event.data?.node_id)
            break

          case 'ping':
            // 心跳事件
            break

          default:
            console.log('[Dify] 未处理的事件类型:', event.event)
        }
      }
    }

    // 检查是否为无结果标识符
    if (fullCompletion.trim() === config.noResultIdentifier) {
      console.log(`[Dify] 收到无结果标识符 "${config.noResultIdentifier}"，不显示补全`)
      return ''
    }

    // 通知补全完成
    onChunk?.('', true)

    return fullCompletion
  } catch (error: unknown) {
    // 如果是取消请求，不抛出错误
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('[Dify 补全] 请求已取消')
      return ''
    }

    console.error('[Dify 补全] 请求失败:', error)
    throw error
  }
}

/**
 * 获取非流式文本补全（阻塞模式）
 * @param prompt 用户输入的文本
 * @param signal AbortSignal 用于取消请求
 * @returns 返回补全文本
 */
export async function getCompletion(
  prompt: string,
  signal?: AbortSignal
): Promise<string> {
  const config = getDifyConfig()
  
  try {
    // 处理输入文本长度限制
    let truncatedPrompt = prompt
    if (config.maxInputLength > 0 && prompt.length > config.maxInputLength) {
      // 从末尾截取，保留最近的内容
      truncatedPrompt = prompt.slice(-config.maxInputLength)
      console.log(`[Dify] 输入文本过长 (${prompt.length} 字符)，已截断为最后 ${config.maxInputLength} 字符`)
    } else if (config.maxInputLength === -1) {
      // -1 表示不限制
      console.log(`[Dify] 输入文本长度: ${prompt.length} 字符（不限制）`)
    }
    
    // 构建请求体
    const requestBody: DifyWorkflowRequest = {
      inputs: {
        [config.inputVariable]: truncatedPrompt
      },
      response_mode: 'blocking',
      user: 'spectre-user-' + Date.now()
    }

    // 发起请求
    const response = await fetch(`${config.baseURL}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal
    })

    if (!response.ok) {
      throw new Error(`Dify API 请求失败: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    // 从 outputs 中提取文本结果
    // 注意：这里需要根据你的 Dify workflow 输出结构调整
    const outputText = result.data?.outputs?.text || result.data?.outputs?.result || ''
    
    // 检查是否为无结果标识符
    if (outputText.trim() === config.noResultIdentifier) {
      console.log(`[Dify] 收到无结果标识符 "${config.noResultIdentifier}"，不显示补全`)
      return ''
    }
    
    return outputText
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('[Dify 补全] 请求已取消')
      return ''
    }

    console.error('[Dify 补全] 请求失败:', error)
    throw error
  }
}

/**
 * 停止 Workflow 执行
 * @param taskId 任务 ID
 * @returns 是否成功停止
 */
export async function stopWorkflow(taskId: string): Promise<boolean> {
  const config = getDifyConfig()
  
  try {
    const response = await fetch(`${config.baseURL}/workflows/tasks/${taskId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: 'spectre-user-' + Date.now()
      })
    })

    if (!response.ok) {
      throw new Error(`停止 Workflow 失败: ${response.status}`)
    }

    const result = await response.json()
    return result.result === 'success'
  } catch (error) {
    console.error('[Dify] 停止 Workflow 失败:', error)
    return false
  }
}

/**
 * 检查 Dify API 配置是否有效
 * @returns 配置是否有效
 */
export function isConfigValid(): boolean {
  const config = getDifyConfig()
  return (
    config.baseURL.length > 0 &&
    config.apiKey.length > 0 &&
    config.apiKey !== 'your-dify-api-key-here' &&
    config.inputVariable.length > 0
  )
}
