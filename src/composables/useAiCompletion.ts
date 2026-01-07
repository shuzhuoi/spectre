/**
 * AI 补全逻辑 Hook
 * 封装 AI 文本补全的核心逻辑，包括防抖、取消请求等
 */

import { ref, onUnmounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { getStreamCompletion, isConfigValid } from '@/api/client'
import { AI_CONFIG } from '@/api/config'

/**
 * AI 补全 Hook
 * @returns AI 补全相关的状态和方法
 */
export function useAiCompletion() {
  // 当前补全建议
  const suggestion = ref('')
  
  // 是否正在加载
  const isLoading = ref(false)
  
  // 错误信息
  const error = ref<string | null>(null)
  
  // 当前请求的 AbortController
  let currentController: AbortController | null = null

  /**
   * 取消当前正在进行的请求
   */
  function cancelCurrentRequest() {
    if (currentController) {
      currentController.abort()
      currentController = null
    }
  }

  /**
   * 请求 AI 补全
   * @param text 当前输入的文本
   */
  async function requestCompletion(text: string): Promise<string> {
    // 检查配置是否有效
    if (!isConfigValid()) {
      error.value = '请先配置有效的 API Key'
      return ''
    }

    // 文本太短时不触发
    if (text.trim().length < AI_CONFIG.minTriggerLength) {
      suggestion.value = ''
      return ''
    }

    // 取消上一次请求
    cancelCurrentRequest()

    // 创建新的 AbortController
    currentController = new AbortController()

    try {
      isLoading.value = true
      error.value = null
      suggestion.value = ''

      // 流式获取补全内容
      const completion = await getStreamCompletion(
        text,
        (chunk, done) => {
          if (!done) {
            // 累积补全内容
            suggestion.value += chunk
          }
        },
        currentController.signal
      )

      return completion
    } catch (err: unknown) {
      // 忽略取消请求的错误
      if (err instanceof Error && err.name === 'AbortError') {
        return ''
      }

      error.value = err instanceof Error ? err.message : '补全请求失败'
      console.error('[useAiCompletion] 补全失败:', err)
      return ''
    } finally {
      isLoading.value = false
      currentController = null
    }
  }

  /**
   * 防抖版本的请求补全方法
   */
  const debouncedRequestCompletion = useDebounceFn(
    requestCompletion,
    AI_CONFIG.debounceDelay
  )

  /**
   * 清除当前建议
   */
  function clearSuggestion() {
    suggestion.value = ''
    cancelCurrentRequest()
  }

  /**
   * 接受当前建议
   * @returns 返回当前建议内容
   */
  function acceptSuggestion(): string {
    const accepted = suggestion.value
    suggestion.value = ''
    return accepted
  }

  // 组件卸载时取消请求
  onUnmounted(() => {
    cancelCurrentRequest()
  })

  return {
    /** 当前补全建议 */
    suggestion,
    /** 是否正在加载 */
    isLoading,
    /** 错误信息 */
    error,
    /** 请求补全（立即执行） */
    requestCompletion,
    /** 请求补全（防抖） */
    debouncedRequestCompletion,
    /** 清除建议 */
    clearSuggestion,
    /** 接受建议 */
    acceptSuggestion,
    /** 取消当前请求 */
    cancelCurrentRequest
  }
}

