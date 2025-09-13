import { createApp } from 'vue' // Vue3应用创建
import { IonicVue } from '@ionic/vue' // Ionic Vue集成
import { createRouter, createWebHistory } from 'vue-router' // 路由管理
import { Capacitor } from '@capacitor/core' // Capacitor核心
import { StatusBar, Style } from '@capacitor/status-bar' // 状态栏控制
import { Keyboard } from '@capacitor/keyboard' // 键盘控制
import App from './App-mobile.vue'
import routes from './router/mobile'
import './style.css'

// Ionic CSS
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/ionic.bundle.css'

const app = createApp(App) // 创建Vue应用
const router = createRouter({ // 创建路由
  history: createWebHistory(),
  routes
})

app.use(IonicVue) // 使用Ionic
app.use(router) // 使用路由

// 移动端初始化
if (Capacitor.isNativePlatform()) {
  // 配置状态栏
  StatusBar.setStyle({ style: Style.Dark })
  StatusBar.setBackgroundColor({ color: '#1e40af' })
  
  // 配置键盘
  Keyboard.setAccessoryBarVisible({ isVisible: true })
}

router.isReady().then(() => {
  app.mount('#app') // 挂载应用
})