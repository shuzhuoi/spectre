import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 应用全局状态管理
 * 管理编辑器和 AI 补全相关的全局状态
 */
export const useAppStore = defineStore('app', () => {
  // 是否正在加载 AI 补全
  const isCompletionLoading = ref(false)
  
  // 当前使用的模型
  const currentModel = ref('gpt-3.5-turbo')
  
  // 补全历史记录
  const completionHistory = ref<string[]>([])

  /**
   * 设置加载状态
   */
  function setCompletionLoading(loading: boolean) {
    isCompletionLoading.value = loading
  }

  /**
   * 设置当前模型
   */
  function setCurrentModel(model: string) {
    currentModel.value = model
  }

  /**
   * 添加补全历史
   */
  function addCompletionHistory(completion: string) {
    completionHistory.value.push(completion)
    // 只保留最近 100 条记录
    if (completionHistory.value.length > 100) {
      completionHistory.value.shift()
    }
  }

  return {
    isCompletionLoading,
    currentModel,
    completionHistory,
    setCompletionLoading,
    setCurrentModel,
    addCompletionHistory
  }
})

