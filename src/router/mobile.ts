import type { RouteRecordRaw } from 'vue-router'

// 移动端页面组件
const MobileLayout = () => import('../pages/mobile/MobileLayout.vue')
const MobileHome = () => import('../pages/mobile/MobileHome.vue')
const MobileGesture = () => import('../pages/mobile/MobileGesture.vue')
const MobileSettings = () => import('../pages/mobile/MobileSettings.vue')
const MobileHistory = () => import('../pages/mobile/MobileHistory.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/mobile/home'
  },
  {
    path: '/mobile',
    component: MobileLayout,
    children: [
      {
        path: '',
        redirect: '/mobile/home'
      },
      {
        path: 'home',
        name: 'MobileHome',
        component: MobileHome,
        meta: {
          title: 'AI优化',
          icon: 'home',
          showInTabs: true
        }
      },
      {
        path: 'gesture',
        name: 'MobileGesture',
        component: MobileGesture,
        meta: {
          title: '手势识别',
          icon: 'hand',
          showInTabs: true
        }
      },
      {
        path: 'history',
        name: 'MobileHistory',
        component: MobileHistory,
        meta: {
          title: '历史记录',
          icon: 'history',
          showInTabs: true
        }
      },
      {
        path: 'settings',
        name: 'MobileSettings',
        component: MobileSettings,
        meta: {
          title: '设置',
          icon: 'settings',
          showInTabs: true
        }
      }
    ]
  }
]

export default routes