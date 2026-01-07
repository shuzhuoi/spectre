import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Monaco Editor 插件配置
    (monacoEditorPlugin as unknown as { default: typeof monacoEditorPlugin }).default({
      languageWorkers: ['editorWorkerService', 'typescript', 'json', 'html', 'css'],
      customWorkers: []
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  // Sass 配置 - 使用现代 API
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler' // 使用现代编译器 API
      }
    }
  },
  // Monaco Editor 需要的配置
  optimizeDeps: {
    include: ['monaco-editor']
  },
  build: {
    // 调整 chunk 大小警告限制
    chunkSizeWarningLimit: 4000, // 提高到 4000 kB (Monaco Editor 约 3.2 MB)
    rollupOptions: {
      output: {
        // 分离 Monaco Editor 相关代码
        manualChunks: {
          'monaco-editor': ['monaco-editor']
        }
      }
    }
  }
})
