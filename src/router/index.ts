import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 路由配置
 * 统一管理所有页面路由
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'AI 文本补全'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由前置守卫 - 设置页面标题
router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || 'AI 文本补全'
  next()
})

export default router

