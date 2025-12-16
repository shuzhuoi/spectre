<script setup lang="ts">
/**
 * 首页视图
 * AI 文本补全演示页面
 */

import { ref, computed } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import AiEditor from '@/components/AiEditor.vue'
import { isConfigValid } from '@/api/openai'
import { OPENAI_CONFIG } from '@/api/config'

// 编辑器引用
const editorRef = ref<InstanceType<typeof AiEditor>>()

// 编辑器内容
const editorContent = ref(`// 欢迎使用 AI 文本补全编辑器！
// 
// 使用方法：
// 1. 在下方编辑区输入文字
// 2. 稍等片刻，AI 会自动预测并显示灰色的补全建议
// 3. 按 Tab 键接受补全，按 Esc 键取消
//
// 提示：请先在 src/api/config.ts 中配置你的 API Key
//
// 开始输入你的内容吧...

`)

// 当前语言
const currentLanguage = ref('plaintext')

// 支持的语言列表
const languageOptions = [
  { value: 'plaintext', label: '纯文本' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'json', label: 'JSON' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' }
]

// 当前主题
const currentTheme = ref<'vs-dark' | 'vs' | 'hc-black'>('vs-dark')

// 主题选项
const themeOptions = [
  { value: 'vs-dark', label: '深色主题' },
  { value: 'vs', label: '浅色主题' },
  { value: 'hc-black', label: '高对比度' }
]

// API 配置状态
const apiConfigured = computed(() => isConfigValid())

// 显示的模型信息
const modelInfo = computed(() => `模型: ${OPENAI_CONFIG.model}`)

/**
 * 补全开始事件处理
 */
function onCompletionStart() {
  console.log('[HomeView] AI 补全开始')
}

/**
 * 补全结束事件处理
 */
function onCompletionEnd(completion: string) {
  console.log('[HomeView] AI 补全结束:', completion)
}

/**
 * 补全错误事件处理
 */
function onCompletionError(error: string) {
  console.error('[HomeView] AI 补全错误:', error)
  ElMessage.error({
    message: error,
    duration: 3000
  })
}

/**
 * 清空编辑器内容
 */
function clearContent() {
  editorContent.value = ''
  editorRef.value?.focus()
}

/**
 * 复制编辑器内容
 */
async function copyContent() {
  const content = editorRef.value?.getValue() || ''
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('内容已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  ElNotification({
    title: 'AI 文本补全使用说明',
    message: `
      <div style="line-height: 1.8;">
        <p><strong>快捷键：</strong></p>
        <ul style="padding-left: 20px; margin: 8px 0;">
          <li><kbd>Tab</kbd> - 接受 AI 补全建议</li>
          <li><kbd>Esc</kbd> - 取消当前补全</li>
          <li><kbd>Ctrl+→</kbd> - 部分接受补全</li>
        </ul>
        <p style="margin-top: 12px;"><strong>配置说明：</strong></p>
        <p style="color: #909399; font-size: 12px;">
          请在 src/api/config.ts 中配置你的 API 地址和密钥
        </p>
      </div>
    `,
    dangerouslyUseHTMLString: true,
    duration: 0,
    position: 'top-right'
  })
}
</script>

<template>
  <div class="home-view">
    <!-- 顶部标题栏 -->
    <header class="header">
      <div class="header-left">
        <h1 class="title">
          <span class="title-icon">✨</span>
          AI 文本补全
        </h1>
        <el-tag v-if="apiConfigured" type="success" size="small" effect="dark">
          已配置
        </el-tag>
        <el-tag v-else type="danger" size="small" effect="dark">
          未配置 API Key
        </el-tag>
      </div>
      
      <div class="header-right">
        <span class="model-info">{{ modelInfo }}</span>
      </div>
    </header>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-select
          v-model="currentLanguage"
          placeholder="选择语言"
          size="small"
          style="width: 140px"
        >
          <el-option
            v-for="option in languageOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <el-select
          v-model="currentTheme"
          placeholder="选择主题"
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="option in themeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>

      <div class="toolbar-right">
        <el-button size="small" @click="clearContent">
          <el-icon><i class="el-icon-delete" /></el-icon>
          清空
        </el-button>
        <el-button size="small" @click="copyContent">
          <el-icon><i class="el-icon-document-copy" /></el-icon>
          复制
        </el-button>
        <el-button size="small" type="primary" @click="showHelp">
          <el-icon><i class="el-icon-question" /></el-icon>
          帮助
        </el-button>
      </div>
    </div>

    <!-- 编辑器区域 -->
    <main class="editor-area">
      <AiEditor
        ref="editorRef"
        v-model="editorContent"
        :language="currentLanguage"
        :theme="currentTheme"
        height="100%"
        @completion-start="onCompletionStart"
        @completion-end="onCompletionEnd"
        @completion-error="onCompletionError"
      />
    </main>

    <!-- 底部状态栏 -->
    <footer class="status-bar">
      <div class="status-left">
        <span class="status-item">
          输入文字后稍等，AI 将自动补全 • 按 <kbd>Tab</kbd> 接受
        </span>
      </div>
      <div class="status-right">
        <span class="status-item">{{ currentLanguage }}</span>
        <span class="status-item">UTF-8</span>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.home-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: var(--bg-color);
  overflow: hidden;
}

// 顶部标题栏
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
}

.title-icon {
  font-size: 24px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.model-info {
  font-size: 12px;
  color: var(--text-color-secondary);
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

// 工具栏
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background-color: var(--bg-color-light);
  border-bottom: 1px solid var(--border-color);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

// 编辑器区域
.editor-area {
  flex: 1;
  padding: 16px 24px;
  overflow: hidden;
}

// 底部状态栏
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
  background-color: #007acc;
  font-size: 12px;
  color: #fff;
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  
  kbd {
    display: inline-block;
    padding: 2px 6px;
    font-size: 11px;
    font-family: inherit;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
}

// Element Plus 组件样式调整
:deep(.el-select) {
  .el-input__wrapper {
    background-color: var(--bg-color);
    border-color: var(--border-color);
  }
}

:deep(.el-button) {
  &.el-button--default {
    background-color: var(--bg-color);
    border-color: var(--border-color);
    color: var(--text-color);
    
    &:hover {
      background-color: var(--bg-color-light);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
  }
}

:deep(.el-tag) {
  border: none;
}
</style>

