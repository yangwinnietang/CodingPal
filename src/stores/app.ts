import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'

// 数据类型定义
interface IDEProcess {
  pid: number
  name: string
  path: string
  status: string
  cpu_usage: number
  memory_usage: number
  start_time: number
}

interface AppSettings {
  glm_api_key: string
  auto_start: boolean
  window_always_on_top: boolean
  monitoring_interval: number
}

export const useAppStore = defineStore('app', () => {
  // 状态
  const processes = ref<IDEProcess[]>([])
  const settings = ref<AppSettings>({
    glm_api_key: '',
    auto_start: false,
    window_always_on_top: true,
    monitoring_interval: 5000
  })
  const apiConnected = ref(false)
  const currentStatus = ref<'rest' | 'thinking' | 'welcome' | 'working'>('welcome')
  const tasks = ref<any[]>([])
  
  // 计算属性
  const activeProcessCount = computed(() => processes.value.length)
  const totalCpuUsage = computed(() => {
    if (processes.value.length === 0) return 0
    return processes.value.reduce((sum, p) => sum + p.cpu_usage, 0) / processes.value.length
  })
  const totalMemoryUsage = computed(() => {
    return processes.value.reduce((sum, p) => sum + p.memory_usage, 0)
  })
  
  // 方法
  const fetchProcesses = async () => {
    try {
      const result = await invoke('get_ide_processes')
      processes.value = result as IDEProcess[]
      
      // 根据进程状态更新AI状态
      if (processes.value.length > 0) {
        const hasHighCpuUsage = processes.value.some(p => p.cpu_usage > 50)
        currentStatus.value = hasHighCpuUsage ? 'working' : 'thinking'
      } else {
        currentStatus.value = 'rest'
      }
    } catch (error) {
      console.error('获取进程列表失败:', error)
      processes.value = []
      currentStatus.value = 'rest'
    }
  }
  
  const testApiConnection = async (apiKey?: string) => {
    try {
      const key = apiKey || settings.value.glm_api_key
      const result = await invoke('initialize_glm_client', { apiKey: key })
      apiConnected.value = result as boolean
      return apiConnected.value
    } catch (error) {
      console.error('API连接测试失败:', error)
      apiConnected.value = false
      return false
    }
  }
  
  const createTask = async (taskName: string) => {
    try {
      const folderPath = await invoke('create_task_folder', { 
        folderName: taskName 
      })
      
      const newTask = {
        id: Date.now(),
        name: taskName,
        path: folderPath as string,
        status: 'active',
        created_at: new Date().toISOString()
      }
      
      tasks.value.push(newTask)
      return newTask
    } catch (error) {
      console.error('创建任务失败:', error)
      throw error
    }
  }
  
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    // 这里可以添加保存到数据库的逻辑
  }
  
  const setStatus = (status: typeof currentStatus.value) => {
    currentStatus.value = status
  }
  
  return {
    // 状态
    processes,
    settings,
    apiConnected,
    currentStatus,
    tasks,
    
    // 计算属性
    activeProcessCount,
    totalCpuUsage,
    totalMemoryUsage,
    
    // 方法
    fetchProcesses,
    testApiConnection,
    createTask,
    updateSettings,
    setStatus
  }
})