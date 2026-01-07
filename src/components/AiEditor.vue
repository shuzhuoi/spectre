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
import { getStreamCompletion, isConfigValid } from '@/api/client'
import { AI_CONFIG } from '@/api/config'

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

// 是否刚刚粘贴
const isPasting = ref(false)

// 是否刚刚换行
const isNewLine = ref(false)

// 上一次的行号
let lastLineNumber = 1

// 换行状态重置定时器
let newLineResetTimer: ReturnType<typeof setTimeout> | null = null

// 粘贴状态重置定时器
let pasteResetTimer: ReturnType<typeof setTimeout> | null = null

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
 * 检查是否应该跳过触发补全
 * @param text 当前文本
 * @returns 是否应该跳过
 */
function shouldSkipTrigger(text: string): boolean {
  if (!text || text.length === 0) {
    return true
  }

  // 获取最后一个字符
  const lastChar = text.charAt(text.length - 1)

  // 检查是否是不触发的标点符号
  const skipPunctuation = AI_CONFIG.autoComplete.trigger.skipAfterPunctuation
  if (skipPunctuation.includes(lastChar)) {
    console.log('[AiEditor] 跳过触发：光标前是标点符号', lastChar)
    return true
  }

  return false
}

/**
 * 获取上下文文本
 * 根据配置获取光标前的上下文内容
 * @param model 编辑器模型
 * @param position 光标位置
 * @returns 上下文文本
 */
function getContextText(
  model: monaco.editor.ITextModel,
  position: monaco.Position
): string {
  const config = AI_CONFIG.autoComplete.context

  if (config.mode === 'lines') {
    // 按行数获取上下文
    let startLine: number
    
    // 检查当前行是否为空（换行后的情况）
    const currentLineText = model.getLineContent(position.lineNumber)
    const isEmptyLine = position.column === 1 && currentLineText.trim().length === 0
    
    if (config.maxLines === 0) {
      // maxLines 为 0 时，只获取当前行光标前的内容
      // 但如果是空行（换行后），则获取上一行的内容
      if (isEmptyLine && position.lineNumber > 1) {
        startLine = position.lineNumber - 1
      } else {
        startLine = position.lineNumber
      }
    } else {
      // 获取前 N 行 + 当前行
      startLine = Math.max(1, position.lineNumber - config.maxLines)
    }
    
    let text = model.getValueInRange({
      startLineNumber: startLine,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    })

    // 如果超过字符限制，截断
    if (text.length > config.maxChars) {
      text = text.slice(-config.maxChars)
    }

    return text
  } else {
    // 按字符数获取上下文
    const fullText = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    })

    // 保留最后 N 个字符
    return fullText.slice(-config.maxChars)
  }
}

/**
 * 获取 AI 补全建议
 * @param text 当前文本
 * @param isNewLineContext 是否是换行触发的上下文
 * @returns 补全建议
 */
async function getAiCompletion(text: string, isNewLineContext = false): Promise<string> {
  // 检查配置
  if (!isConfigValid()) {
    emit('completion-error', '请先配置有效的 API Key')
    return ''
  }

  // 文本太短不触发
  // 换行时放宽限制，只要有内容就触发
  const minLength = isNewLineContext ? 1 : AI_CONFIG.autoComplete.minTriggerLength
  if (text.trim().length < minLength) {
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
 * 防抖版本的补全请求（正常编写）
 */
const debouncedGetCompletion = useDebounceFn(
  (text: string) => getAiCompletion(text, false),
  AI_CONFIG.autoComplete.debounce.normal
)

/**
 * 防抖版本的补全请求（换行时）
 */
const debouncedGetCompletionOnNewLine = useDebounceFn(
  (text: string) => getAiCompletion(text, true),
  AI_CONFIG.autoComplete.debounce.newLine
)

/**
 * 防抖版本的补全请求（粘贴后）
 */
const debouncedGetCompletionAfterPaste = useDebounceFn(
  (text: string) => getAiCompletion(text, false),
  AI_CONFIG.autoComplete.debounce.paste
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

        // 获取上下文文本（根据配置）
        const contextText = getContextText(model, position)

        // 检查是否应该跳过触发
        if (shouldSkipTrigger(contextText)) {
          return { items: [] }
        }

        // 根据状态选择不同的防抖延迟
        let completion: string
        if (isPasting.value) {
          // 粘贴后使用更长的延迟
          completion = await debouncedGetCompletionAfterPaste(contextText)
        } else if (isNewLine.value && AI_CONFIG.autoComplete.trigger.onNewLine) {
          // 换行时使用更短的延迟
          completion = await debouncedGetCompletionOnNewLine(contextText)
        } else {
          // 正常编写使用默认延迟
          completion = await debouncedGetCompletion(contextText)
        }

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
    // 快速建议（禁用以避免与 AI 补全冲突）
    quickSuggestions: false,
    // 参数提示
    parameterHints: { enabled: false },
    // 代码建议（禁用自动完成）
    suggestOnTriggerCharacters: false,
    wordBasedSuggestions: 'off'
  })

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() || ''
    emit('update:modelValue', value)

    // 检测是否换行
    if (editor) {
      const position = editor.getPosition()
      if (position) {
        const currentLine = position.lineNumber
        
        // 如果行号增加，说明换行了
        if (currentLine > lastLineNumber) {
          // 取消之前的请求，避免快速换行触发多条
          cancelCurrentRequest()
          
          isNewLine.value = true
          console.log('[AiEditor] 检测到换行，使用快速触发')
          
          // 清除之前的定时器
          if (newLineResetTimer) {
            clearTimeout(newLineResetTimer)
          }
          
          // 短时间后重置换行状态
          newLineResetTimer = setTimeout(() => {
            isNewLine.value = false
            newLineResetTimer = null
          }, AI_CONFIG.autoComplete.debounce.newLine + 500)
        } else {
          // 非换行的普通输入，也取消之前的请求
          if (!isNewLine.value) {
            cancelCurrentRequest()
          }
          isNewLine.value = false
        }
        
        lastLineNumber = currentLine
      }
    }
  })

  // 监听粘贴事件
  editor.onDidPaste(() => {
    // 取消之前的请求
    cancelCurrentRequest()
    
    isPasting.value = true
    console.log('[AiEditor] 检测到粘贴，使用延迟触发')
    
    // 清除之前的定时器
    if (pasteResetTimer) {
      clearTimeout(pasteResetTimer)
    }
    
    // 粘贴后一段时间内标记为粘贴状态
    pasteResetTimer = setTimeout(() => {
      isPasting.value = false
      pasteResetTimer = null
    }, AI_CONFIG.autoComplete.debounce.paste + 500)
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
  
  // 清理定时器
  if (newLineResetTimer) {
    clearTimeout(newLineResetTimer)
    newLineResetTimer = null
  }
  
  if (pasteResetTimer) {
    clearTimeout(pasteResetTimer)
    pasteResetTimer = null
  }
  
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

