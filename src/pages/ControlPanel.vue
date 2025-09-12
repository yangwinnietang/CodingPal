<template>
  <div class="control-panel w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- 顶部导航 -->
    <div class="header bg-blue-600 text-white p-4 flex items-center justify-between">
      <h1 class="text-lg font-semibold">CodingPal 控制面板</h1>
      <button @click="goBack" class="text-white hover:text-gray-200">
        <i class="i-lucide-x w-5 h-5"></i>
      </button>
    </div>
    
    <!-- 标签页导航 -->
    <div class="tabs flex border-b">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors',
          activeTab === tab.key 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-600 hover:text-gray-900'
        ]"
      >
        <i :class="tab.icon" class="w-4 h-4 mr-2"></i>
        {{ tab.label }}
      </button>
    </div>
    
    <!-- 内容区域 -->
    <div class="content flex-1 p-4 overflow-y-auto">
      <!-- 进程监控面板 -->
      <div v-if="activeTab === 'processes'" class="processes-panel">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">IDE 进程监控</h2>
          <button @click="refreshProcesses" class="btn-secondary">
            <i class="i-lucide-refresh-cw w-4 h-4 mr-2"></i>
            刷新
          </button>
        </div>
        
        <div v-if="processes.length === 0" class="text-center py-8 text-gray-500">
          <i class="i-lucide-monitor w-12 h-12 mx-auto mb-2 opacity-50"></i>
          <p>未检测到AI编程IDE进程</p>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="process in processes" 
            :key="process.pid"
            class="process-card bg-gray-50 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span class="font-medium">{{ process.name }}</span>
                <span class="text-sm text-gray-500">PID: {{ process.pid }}</span>
              </div>
              <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {{ process.status }}
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">CPU使用率:</span>
                <span class="ml-2 font-mono">{{ process.cpu_usage.toFixed(1) }}%</span>
              </div>
              <div>
                <span class="text-gray-600">内存使用:</span>
                <span class="ml-2 font-mono">{{ formatMemory(process.memory_usage) }}</span>
              </div>
            </div>
            
            <div class="mt-2 text-xs text-gray-500 truncate">
              路径: {{ process.path }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- API服务管理 -->
      <div v-if="activeTab === 'api'" class="api-panel">
        <div class="mb-4">
          <h2 class="text-lg font-semibold mb-2">GLM4.5 API 状态</h2>
          <div class="flex items-center space-x-3">
            <div :class="apiStatusClass" class="w-3 h-3 rounded-full"></div>
            <span>{{ apiStatusText }}</span>
            <button @click="testApiConnection" class="btn-secondary ml-auto">
              <i class="i-lucide-zap w-4 h-4 mr-2"></i>
              测试连接
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="stat-card">
            <h3 class="text-sm font-medium text-gray-600 mb-1">今日请求数</h3>
            <p class="text-2xl font-bold text-blue-600">{{ apiStats.todayRequests }}</p>
          </div>
          <div class="stat-card">
            <h3 class="text-sm font-medium text-gray-600 mb-1">成功率</h3>
            <p class="text-2xl font-bold text-green-600">{{ apiStats.successRate }}%</p>
          </div>
        </div>
      </div>
      
      <!-- 多任务管理器 -->
      <div v-if="activeTab === 'tasks'" class="tasks-panel">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">任务管理</h2>
          <button @click="showCreateTaskDialog = true" class="btn-primary">
            <i class="i-lucide-plus w-4 h-4 mr-2"></i>
            新建任务
          </button>
        </div>
        
        <div v-if="tasks.length === 0" class="text-center py-8 text-gray-500">
          <i class="i-lucide-folder w-12 h-12 mx-auto mb-2 opacity-50"></i>
          <p>暂无任务</p>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="task in tasks" 
            :key="task.id"
            class="task-card bg-gray-50 rounded-lg p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">{{ task.name }}</h3>
                <p class="text-sm text-gray-600">{{ task.path }}</p>
              </div>
              <span :class="getTaskStatusClass(task.status)" class="px-2 py-1 rounded text-xs">
                {{ task.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 创建任务对话框 -->
    <div v-if="showCreateTaskDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-semibold mb-4">创建新任务</h3>
        <input 
          v-model="newTaskName" 
          type="text" 
          placeholder="任务名称"
          class="w-full p-2 border rounded mb-4"
        />
        <div class="flex space-x-2">
          <button @click="createTask" class="btn-primary flex-1">创建</button>
          <button @click="showCreateTaskDialog = false" class="btn-secondary flex-1">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { invoke } from '@tauri-apps/api/core'

const router = useRouter()

// 响应式数据
const activeTab = ref('processes')
const processes = ref<any[]>([])
const apiConnected = ref(false)
const tasks = ref<any[]>([])
const showCreateTaskDialog = ref(false)
const newTaskName = ref('')
const refreshInterval = ref<number | null>(null)

// 标签页配置
const tabs = [
  { key: 'processes', label: '进程监控', icon: 'i-lucide-monitor' },
  { key: 'api', label: 'API服务', icon: 'i-lucide-cloud' },
  { key: 'tasks', label: '任务管理', icon: 'i-lucide-folder' }
]

// API统计数据
const apiStats = ref({
  todayRequests: 0,
  successRate: 0
})

// 计算属性
const apiStatusClass = computed(() => 
  apiConnected.value ? 'bg-green-400' : 'bg-red-400'
)

const apiStatusText = computed(() => 
  apiConnected.value ? '已连接' : '未连接'
)

// 方法
const goBack = () => {
  router.push('/')
}

const refreshProcesses = async () => {
  try {
    const result = await invoke('get_ide_processes')
    processes.value = result as any[]
  } catch (error) {
    console.error('获取进程列表失败:', error)
  }
}

const testApiConnection = async () => {
  try {
    const result = await invoke('initialize_glm_client', { apiKey: 'test-key' })
    apiConnected.value = result as boolean
  } catch (error) {
    console.error('API连接测试失败:', error)
    apiConnected.value = false
  }
}

const createTask = async () => {
  if (!newTaskName.value.trim()) return
  
  try {
    const folderPath = await invoke('create_task_folder', { 
      folderName: newTaskName.value 
    })
    
    tasks.value.push({
      id: Date.now(),
      name: newTaskName.value,
      path: folderPath,
      status: 'active'
    })
    
    newTaskName.value = ''
    showCreateTaskDialog.value = false
  } catch (error) {
    console.error('创建任务失败:', error)
  }
}

const formatMemory = (bytes: number): string => {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

const getTaskStatusClass = (status: string): string => {
  const classMap: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800'
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
}

// 生命周期
onMounted(() => {
  refreshProcesses()
  refreshInterval.value = window.setInterval(refreshProcesses, 5000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 
         transition-colors flex items-center justify-center;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 
         transition-colors flex items-center justify-center;
}

.stat-card {
  @apply bg-white p-4 rounded-lg border;
}

.process-card, .task-card {
  @apply transition-all duration-200 hover:shadow-md;
}
</style>