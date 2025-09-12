import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '@/pages/MainPage.vue'
import ControlPanel from '@/pages/ControlPanel.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import HistoryPage from '@/pages/HistoryPage.vue'
import PromptOptimizer from '@/pages/PromptOptimizer.vue'
import PromptHistory from '@/pages/PromptHistory.vue'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'main',
    component: MainPage,
  },
  {
    path: '/control-panel',
    name: 'control-panel',
    component: ControlPanel,
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsPage,
  },
  {
    path: '/history',
    name: 'history',
    component: HistoryPage,
  },
  {
    path: '/prompt-optimizer',
    name: 'prompt-optimizer',
    component: PromptOptimizer,
  },
  {
    path: '/prompt-history',
    name: 'prompt-history',
    component: PromptHistory,
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
