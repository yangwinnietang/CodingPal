import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '@/pages/MainPage.vue'
import PromptOptimizer from '@/pages/PromptOptimizer.vue'
import ControlPanel from '@/pages/ControlPanel.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import PromptHistory from '@/pages/PromptHistory.vue'
import HelpPage from '@/pages/HelpPage.vue'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: MainPage,
  },
  {
    path: '/prompt-optimizer',
    name: 'prompt-optimizer',
    component: PromptOptimizer,
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
    path: '/prompt-history',
    name: 'prompt-history',
    component: PromptHistory,
  },
  {
    path: '/help',
    name: 'help',
    component: HelpPage,
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
