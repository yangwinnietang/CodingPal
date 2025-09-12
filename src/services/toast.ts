// Toast通知服务
import { createApp } from 'vue'
import type { App } from 'vue'
import Toast from '../components/Toast.vue'

interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  persistent?: boolean
}

class ToastService {
  private toasts: App[] = []

  private createToast(options: ToastOptions): void {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const app = createApp(Toast, {
      ...options,
      onClose: () => {
        app.unmount()
        document.body.removeChild(container)
        this.toasts = this.toasts.filter(t => t !== app)
      }
    })

    app.mount(container)
    this.toasts.push(app)
  }

  // 成功提示
  success(message: string, title?: string, duration = 3000): void {
    this.createToast({
      type: 'success',
      title,
      message,
      duration
    })
  }

  // 错误提示
  error(message: string, title?: string, persistent = false): void {
    this.createToast({
      type: 'error',
      title: title || '错误',
      message,
      duration: persistent ? 0 : 5000,
      persistent
    })
  }

  // 警告提示
  warning(message: string, title?: string, duration = 4000): void {
    this.createToast({
      type: 'warning',
      title: title || '警告',
      message,
      duration
    })
  }

  // 信息提示
  info(message: string, title?: string, duration = 3000): void {
    this.createToast({
      type: 'info',
      title,
      message,
      duration
    })
  }

  // 清除所有Toast
  clear(): void {
    this.toasts.forEach(app => {
      app.unmount()
    })
    this.toasts = []
    
    // 清理DOM
    const containers = document.querySelectorAll('body > div')
    containers.forEach(container => {
      if (container.querySelector('.fixed.top-4.right-4')) {
        document.body.removeChild(container)
      }
    })
  }

  // API错误处理
  handleApiError(error: any, context = '操作'): void {
    let message = '未知错误'
    
    if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.message) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }
    
    this.error(`${context}失败: ${message}`)
  }

  // 网络错误处理
  handleNetworkError(error: any): void {
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
      this.error('网络连接失败，请检查网络设置')
    } else if (error?.code === 'TIMEOUT') {
      this.error('请求超时，请稍后重试')
    } else {
      this.handleApiError(error, '网络请求')
    }
  }

  // 复制成功提示
  copySuccess(content = '内容'): void {
    this.success(`${content}已复制到剪贴板`)
  }

  // 保存成功提示
  saveSuccess(content = '数据'): void {
    this.success(`${content}保存成功`)
  }

  // 删除确认
  deleteConfirm(content = '此项', callback: () => void): void {
    if (confirm(`确定要删除${content}吗？此操作不可恢复。`)) {
      callback()
      this.success('删除成功')
    }
  }

  // 批量操作提示
  batchOperation(successCount: number, totalCount: number, operation = '操作'): void {
    if (successCount === totalCount) {
      this.success(`${operation}完成，共处理 ${totalCount} 项`)
    } else if (successCount > 0) {
      this.warning(`${operation}部分完成，成功 ${successCount}/${totalCount} 项`)
    } else {
      this.error(`${operation}失败，请检查后重试`)
    }
  }

  // 加载状态提示
  loading(message = '处理中...'): { close: () => void } {
    this.info(message, undefined, 0)
    
    return {
      close: () => this.clear()
    }
  }
}

// 导出单例实例
export const toast = new ToastService()

// 全局错误处理器
export const setupGlobalErrorHandler = () => {
  // 捕获未处理的Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise错误:', event.reason)
    toast.handleApiError(event.reason, 'Promise')
    event.preventDefault()
  })

  // 捕获全局JavaScript错误
  window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error)
    toast.error('应用程序发生错误，请刷新页面重试')
  })
}

// 导出类型
export type { ToastOptions }