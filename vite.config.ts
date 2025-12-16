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
  // Monaco Editor 需要的配置
  optimizeDeps: {
    include: ['monaco-editor']
  },
  build: {
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
