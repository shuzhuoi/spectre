/**
 * 存储键枚举
 * 统一管理 localStorage/sessionStorage 的缓存 key
 */

export enum StorageKeys {
  // 编辑器相关
  EDITOR_CONTENT = 'ai_completion_editor_content',
  EDITOR_LANGUAGE = 'ai_completion_editor_language',
  EDITOR_THEME = 'ai_completion_editor_theme',
  
  // 用户偏好设置
  USER_PREFERENCES = 'ai_completion_user_preferences',
  
  // API 配置（注意：不要在这里存储 API Key）
  API_BASE_URL = 'ai_completion_api_base_url',
  API_MODEL = 'ai_completion_api_model',
  
  // 补全历史
  COMPLETION_HISTORY = 'ai_completion_history'
}

/**
 * 获取存储值
 * @param key 存储键
 * @param defaultValue 默认值
 * @returns 存储的值或默认值
 */
export function getStorageItem<T>(key: StorageKeys, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * 设置存储值
 * @param key 存储键
 * @param value 要存储的值
 */
export function setStorageItem<T>(key: StorageKeys, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('[Storage] 存储失败:', error)
  }
}

/**
 * 移除存储值
 * @param key 存储键
 */
export function removeStorageItem(key: StorageKeys): void {
  localStorage.removeItem(key)
}

/**
 * 清除所有应用相关的存储
 */
export function clearAllStorage(): void {
  Object.values(StorageKeys).forEach(key => {
    localStorage.removeItem(key)
  })
}

