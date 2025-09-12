<template>
  <div class="control-panel w-full h-full bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-2xl overflow-hidden">
    <!-- 顶部导航 - 卡通可爱风格 -->
    <div class="header bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 text-white p-6 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <i class="i-lucide-heart w-5 h-5"></i>
        </div>
        <h1 class="text-xl font-bold">🎨 CodingPal 控制面板</h1>
      </div>
      <button @click="goBack" class="cute-close-btn">
        <i class="i-lucide-x w-5 h-5"></i>
      </button>
    </div>
    
    <!-- 标签页导航 - 卡通可爱风格 -->
    <div class="tabs flex p-4 space-x-2">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'cute-tab px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center space-x-2',
          activeTab === tab.key 
            ? 'cute-tab-active' 
            : 'cute-tab-inactive'
        ]"
      >
        <i :class="tab.icon" class="w-5 h-5"></i>
        <span>{{ tab.label }}</span>
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
        
        <div v-if="processes.length === 0" class="text-center py-12 text-gray-400">
          <div class="cute-empty-state">
            <i class="i-lucide-monitor w-16 h-16 mx-auto mb-4 opacity-60"></i>
            <p class="text-lg font-medium">🔍 未检测到AI编程IDE进程</p>
            <p class="text-sm mt-2">启动您的IDE后将自动显示在这里</p>
          </div>
        </div>
        
        <div v-else class="grid gap-4">
          <div 
            v-for="process in processes" 
            :key="process.pid"
            class="cute-process-card"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div class="cute-status-dot"></div>
                <div>
                  <span class="font-bold text-gray-800">{{ process.name }}</span>
                  <div class="text-xs text-gray-500 mt-1">🆔 PID: {{ process.pid }}</div>
                </div>
              </div>
              <span class="cute-status-badge">
                ✨ {{ process.status }}
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-3">
              <div class="cute-metric-card">
                <div class="flex items-center space-x-2">
                  <span class="text-2xl">🔥</span>
                  <div>
                    <div class="text-xs text-gray-500">CPU使用率</div>
                    <div class="font-bold text-orange-600">{{ process.cpu_usage.toFixed(1) }}%</div>
                  </div>
                </div>
              </div>
              <div class="cute-metric-card">
                <div class="flex items-center space-x-2">
                  <span class="text-2xl">💾</span>
                  <div>
                    <div class="text-xs text-gray-500">内存使用</div>
                    <div class="font-bold text-blue-600">{{ formatMemory(process.memory_usage) }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="cute-path-info">
              📁 {{ process.path }}
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
/* 卡通可爱风格样式 */
.cute-close-btn {
  @apply w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30
         flex items-center justify-center transition-all duration-300
         hover:scale-110 hover:rotate-90;
}

.cute-tab {
  position: relative;
  overflow: hidden;
}

.cute-tab-active {
  @apply bg-gradient-to-r from-yellow-300 to-orange-300 text-white shadow-lg;
  transform: scale(1.05);
}

.cute-tab-inactive {
  @apply bg-white bg-opacity-60 text-gray-600 hover:bg-opacity-80 hover:text-gray-800;
}

.cute-tab:hover {
  transform: translateY(-2px);
}

.cute-empty-state {
  @apply bg-white bg-opacity-50 rounded-2xl p-8 border-2 border-dashed border-gray-300;
}

.cute-process-card {
  @apply bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg
         border-2 border-blue-100 transition-all duration-300
         hover:shadow-xl hover:scale-105 hover:border-blue-200;
}

.cute-status-dot {
  @apply w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full
         shadow-lg animate-pulse;
}

.cute-status-badge {
  @apply bg-gradient-to-r from-green-100 to-emerald-100 text-green-700
         px-3 py-1 rounded-full text-xs font-bold shadow-sm;
}

.cute-metric-card {
  @apply bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3
         border border-purple-100 shadow-sm;
}

.cute-path-info {
  @apply bg-gray-50 rounded-lg p-2 text-xs text-gray-600 truncate
         border border-gray-200;
}

.btn-primary {
  @apply bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3
         rounded-full hover:from-purple-600 hover:to-pink-600
         transition-all duration-300 flex items-center justify-center
         shadow-lg hover:shadow-xl hover:scale-105 font-bold;
}

.btn-secondary {
  @apply bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-6 py-3
         rounded-full hover:from-gray-200 hover:to-gray-300
         transition-all duration-300 flex items-center justify-center
         shadow-md hover:shadow-lg hover:scale-105 font-medium;
}

.stat-card {
  @apply bg-gradient-to-br from-white to-indigo-50 p-6 rounded-2xl
         border-2 border-indigo-100 shadow-lg hover:shadow-xl
         transition-all duration-300 hover:scale-105;
}

.process-card, .task-card {
  @apply transition-all duration-300 hover:shadow-xl hover:scale-105;
}

/* 添加一些可爱的动画效果 */
@keyframes bounce-in {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

.cute-process-card {
  animation: bounce-in 0.6s ease-out;
}

.cute-tab-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}
</style>