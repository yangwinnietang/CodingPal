import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import 'uno.css'
import App from './App.vue'
import router from './router'
import { setupGlobalErrorHandler } from './services/toast'

// 设置全局错误处理
setupGlobalErrorHandler()

// 创建Vue应用实例
const app = createApp(App)
const pinia = createPinia()

// 使用插件
app.use(pinia)
app.use(router)

// 挂载应用
app.mount('#app')
