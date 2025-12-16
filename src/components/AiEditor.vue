<script setup lang="ts">
/**
 * AI 编辑器组件
 * 基于 Monaco Editor 实现 AI 内联补全功能
 * 用户输入文字后，AI 会自动预测并显示补全建议
 * 按 Tab 键接受补全
 */

import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'
import { useDebounceFn } from '@vueuse/core'
import { getStreamCompletion, isConfigValid } from '@/api/openai'
import { OPENAI_CONFIG } from '@/api/config'

// 定义组件属性
interface Props {
  /** 编辑器初始内容 */
  modelValue?: string
  /** 编辑器语言 */
  language?: string
  /** 编辑器主题 */
  theme?: 'vs-dark' | 'vs' | 'hc-black'
  /** 是否只读 */
  readonly?: boolean
  /** 编辑器高度 */
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  language: 'plaintext',
  theme: 'vs-dark',
  readonly: false,
  height: '100%'
})

// 定义事件
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'completion-start'): void
  (e: 'completion-end', completion: string): void
  (e: 'completion-error', error: string): void
}>()

// 编辑器容器引用
const editorContainer = ref<HTMLDivElement>()

// 编辑器实例
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// 内联补全提供者
let inlineCompletionProvider: monaco.IDisposable | null = null

// 当前请求的 AbortController
let currentAbortController: AbortController | null = null

// 当前补全建议
const currentSuggestion = ref('')

// 是否正在加载补全
const isLoading = ref(false)

/**
 * 取消当前请求
 */
function cancelCurrentRequest() {
  if (currentAbortController) {
    currentAbortController.abort()
    currentAbortController = null
  }
}

/**
 * 获取 AI 补全建议
 * @param text 当前文本
 * @returns 补全建议
 */
async function getAiCompletion(text: string): Promise<string> {
  // 检查配置
  if (!isConfigValid()) {
    emit('completion-error', '请先配置有效的 API Key')
    return ''
  }

  // 文本太短不触发
  if (text.trim().length < OPENAI_CONFIG.minTriggerLength) {
    return ''
  }

  // 取消上一次请求
  cancelCurrentRequest()
  currentAbortController = new AbortController()

  try {
    isLoading.value = true
    emit('completion-start')
    currentSuggestion.value = ''

    // 流式获取补全
    const completion = await getStreamCompletion(
      text,
      (chunk, done) => {
        if (!done) {
          currentSuggestion.value += chunk
        }
      },
      currentAbortController.signal
    )

    emit('completion-end', completion)
    return completion
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return ''
    }
    const errorMsg = err instanceof Error ? err.message : '补全请求失败'
    emit('completion-error', errorMsg)
    return ''
  } finally {
    isLoading.value = false
    currentAbortController = null
  }
}

/**
 * 防抖版本的补全请求
 */
const debouncedGetCompletion = useDebounceFn(
  getAiCompletion,
  OPENAI_CONFIG.debounceDelay
)

/**
 * 注册内联补全提供者
 */
function registerInlineCompletionProvider() {
  // 先注销已有的提供者
  if (inlineCompletionProvider) {
    inlineCompletionProvider.dispose()
  }

  inlineCompletionProvider = monaco.languages.registerInlineCompletionsProvider(
    props.language,
    {
      provideInlineCompletions: async (model, position, _context, token) => {
        // 如果请求已取消，返回空
        if (token.isCancellationRequested) {
          return { items: [] }
        }

        // 获取光标前的所有文本
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        })

        // 获取 AI 补全
        const completion = await debouncedGetCompletion(textUntilPosition)

        // 如果没有补全内容或请求已取消
        if (!completion || token.isCancellationRequested) {
          return { items: [] }
        }

        return {
          items: [
            {
              insertText: completion,
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
              )
            }
          ]
        }
      },
      freeInlineCompletions: () => {
        // 清理资源
      }
    }
  )
}

/**
 * 初始化编辑器
 */
function initEditor() {
  if (!editorContainer.value) return

  // 创建编辑器实例
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: props.language,
    theme: props.theme,
    readOnly: props.readonly,
    fontSize: 14,
    fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
    lineNumbers: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on',
    tabSize: 2,
    insertSpaces: true,
    renderWhitespace: 'selection',
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    smoothScrolling: true,
    // 启用内联补全
    inlineSuggest: {
      enabled: true,
      showToolbar: 'onHover',
      mode: 'subword'
    },
    // 快速建议
    quickSuggestions: false,
    // 参数提示
    parameterHints: { enabled: false },
    // 代码建议
    suggest: { enabled: false }
  })

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() || ''
    emit('update:modelValue', value)
  })

  // 注册内联补全提供者
  registerInlineCompletionProvider()

  // 添加快捷键：Escape 取消补全
  editor.addAction({
    id: 'cancel-completion',
    label: '取消补全',
    keybindings: [monaco.KeyCode.Escape],
    run: () => {
      cancelCurrentRequest()
      currentSuggestion.value = ''
    }
  })
}

/**
 * 销毁编辑器
 */
function destroyEditor() {
  cancelCurrentRequest()
  
  if (inlineCompletionProvider) {
    inlineCompletionProvider.dispose()
    inlineCompletionProvider = null
  }
  
  if (editor) {
    editor.dispose()
    editor = null
  }
}

/**
 * 获取编辑器内容
 */
function getValue(): string {
  return editor?.getValue() || ''
}

/**
 * 设置编辑器内容
 */
function setValue(value: string) {
  editor?.setValue(value)
}

/**
 * 聚焦编辑器
 */
function focus() {
  editor?.focus()
}

// 监听外部 modelValue 变化
watch(
  () => props.modelValue,
  newValue => {
    if (editor && editor.getValue() !== newValue) {
      editor.setValue(newValue)
    }
  }
)

// 监听主题变化
watch(
  () => props.theme,
  newTheme => {
    monaco.editor.setTheme(newTheme)
  }
)

// 监听语言变化
watch(
  () => props.language,
  newLanguage => {
    if (editor) {
      const model = editor.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, newLanguage)
      }
      // 重新注册补全提供者
      registerInlineCompletionProvider()
    }
  }
)

// 组件挂载时初始化编辑器
onMounted(() => {
  initEditor()
})

// 组件卸载前销毁编辑器
onBeforeUnmount(() => {
  destroyEditor()
})

// 暴露方法给父组件
defineExpose({
  getValue,
  setValue,
  focus,
  getEditor: () => editor
})
</script>

<template>
  <div class="ai-editor-wrapper">
    <!-- 编辑器容器 -->
    <div ref="editorContainer" class="ai-editor-container" :style="{ height }"></div>
    
    <!-- 加载指示器 -->
    <div v-if="isLoading" class="ai-loading-indicator">
      <span class="loading-dot"></span>
      <span class="loading-text">AI 正在思考...</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-editor-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--editor-bg, #1e1e1e);
  border-radius: 8px;
  overflow: hidden;
}

.ai-editor-container {
  width: 100%;
  height: 100%;
}

.ai-loading-indicator {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(64, 158, 255, 0.15);
  border: 1px solid rgba(64, 158, 255, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(8px);
  z-index: 10;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background-color: #409eff;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-text {
  font-size: 12px;
  color: #409eff;
  font-weight: 500;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

// Monaco Editor 内联补全样式覆盖
:deep(.monaco-editor) {
  .ghost-text-decoration {
    opacity: 0.5;
    color: #808080 !important;
  }
  
  .suggest-widget {
    border-radius: 8px;
    overflow: hidden;
  }
}
</style>

