<template>
  <div class="history-page w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- 顶部导航 -->
    <div class="header bg-blue-600 text-white p-4 flex items-center justify-between">
      <h1 class="text-lg font-semibold">历史记录</h1>
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
      <!-- 优化历史 -->
      <div v-if="activeTab === 'optimization'" class="optimization-history">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">提示词优化历史</h2>
          <div class="flex space-x-2">
            <select v-model="optimizationLimit" @change="loadOptimizationHistory" class="px-3 py-1 border rounded text-sm">
              <option value="10">最近10条</option>
              <option value="50">最近50条</option>
              <option value="100">最近100条</option>
            </select>
            <button @click="loadOptimizationHistory" class="btn-secondary text-sm">
              <i class="i-lucide-refresh-cw w-4 h-4 mr-1"></i>
              刷新
            </button>
          </div>
        </div>
        
        <div v-if="loading" class="text-center py-8">
          <i class="i-lucide-loader-2 w-8 h-8 animate-spin mx-auto mb-2 text-blue-600"></i>
          <p class="text-gray-600">加载中...</p>
        </div>
        
        <div v-else-if="optimizationHistory.length === 0" class="text-center py-8 text-gray-500">
          <i class="i-lucide-history w-12 h-12 mx-auto mb-2 opacity-50"></i>
          <p>暂无优化历史记录</p>
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="item in optimizationHistory" 
            :key="item.id"
            class="optimization-card bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                <span class="text-sm text-gray-600">{{ formatDate(item.created_at) }}</span>
              </div>
              <div class="flex items-center space-x-4 text-xs text-gray-500">
                <span>置信度: {{ (item.confidence * 100).toFixed(0) }}%</span>
                <span>Token: {{ item.tokens_used }}</span>
                <span>耗时: {{ item.processing_time_ms }}ms</span>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-2">原始提示词</h4>
                <div class="bg-white p-3 rounded border text-sm">
                  {{ item.original_prompt }}
                </div>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-2">优化后提示词</h4>
                <div class="bg-white p-3 rounded border text-sm">
                  {{ item.optimized_prompt }}
                </div>
              </div>
            </div>
            
            <div class="mt-3 flex justify-end space-x-2">
              <button @click="copyToClipboard(item.optimized_prompt)" class="text-xs text-blue-600 hover:text-blue-800">
                <i class="i-lucide-copy w-3 h-3 mr-1"></i>
                复制优化后
              </button>
              <button @click="showComparison(item)" class="text-xs text-green-600 hover:text-green-800">
                <i class="i-lucide-eye w-3 h-3 mr-1"></i>
                详细对比
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作日志 -->
      <div v-if="activeTab === 'logs'" class="operation-logs">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">操作日志</h2>
          <div class="flex space-x-2">
            <select v-model="logFilter" class="px-3 py-1 border rounded text-sm">
              <option value="all">全部日志</option>
              <option value="api">API调用</option>
              <option value="process">进程监控</option>
              <option value="system">系统事件</option>
            </select>
            <button @click="clearLogs" class="btn-secondary text-sm">
              <i class="i-lucide-trash-2 w-4 h-4 mr-1"></i>
              清空日志
            </button>
          </div>
        </div>
        
        <div class="log-container bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
          <div v-for="(log, index) in filteredLogs" :key="index" class="log-entry mb-1">
            <span class="text-gray-500">[{{ formatTime(log.timestamp) }}]</span>
            <span :class="getLogLevelClass(log.level)" class="ml-2">[{{ log.level }}]</span>
            <span class="ml-2">{{ log.message }}</span>
          </div>
          <div v-if="filteredLogs.length === 0" class="text-center text-gray-500 py-8">
            暂无日志记录
          </div>
        </div>
      </div>
      
      <!-- 统计数据 -->
      <div v-if="activeTab === 'stats'" class="statistics">
        <div class="mb-4">
          <h2 class="text-lg font-semibold">使用统计</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">总优化次数</p>
                <p class="text-2xl font-bold text-blue-600">{{ stats.totalOptimizations }}</p>
              </div>
              <i class="i-lucide-zap w-8 h-8 text-blue-600"></i>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">总Token使用</p>
                <p class="text-2xl font-bold text-green-600">{{ stats.totalTokens }}</p>
              </div>
              <i class="i-lucide-cpu w-8 h-8 text-green-600"></i>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">平均置信度</p>
                <p class="text-2xl font-bold text-purple-600">{{ (stats.avgConfidence * 100).toFixed(0) }}%</p>
              </div>
              <i class="i-lucide-target w-8 h-8 text-purple-600"></i>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">监控进程数</p>
                <p class="text-2xl font-bold text-orange-600">{{ stats.monitoredProcesses }}</p>
              </div>
              <i class="i-lucide-monitor w-8 h-8 text-orange-600"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-medium mb-3">最近7天使用趋势</h3>
          <div class="h-32 flex items-end justify-between space-x-2">
            <div v-for="(day, index) in weeklyStats" :key="index" class="flex-1 bg-blue-200 rounded-t" :style="{ height: `${(day.count / Math.max(...weeklyStats.map(d => d.count))) * 100}%` }">
              <div class="text-xs text-center mt-1">{{ day.day }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 对比弹窗 -->
    <div v-if="showComparisonModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-4/5 overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">提示词对比</h3>
          <button @click="showComparisonModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="i-lucide-x w-5 h-5"></i>
          </button>
        </div>
        
        <div v-if="selectedItem" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium mb-2 text-red-600">原始提示词</h4>
            <div class="bg-red-50 p-4 rounded border h-64 overflow-y-auto">
              {{ selectedItem.original_prompt }}
            </div>
          </div>
          <div>
            <h4 class="font-medium mb-2 text-green-600">优化后提示词</h4>
            <div class="bg-green-50 p-4 rounded border h-64 overflow-y-auto">
              {{ selectedItem.optimized_prompt }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { invoke } from '@tauri-apps/api/core'

const router = useRouter()

// 响应式数据
const activeTab = ref('optimization')
const loading = ref(false)
const optimizationHistory = ref<any[]>([])
const optimizationLimit = ref(10)
const logFilter = ref('all')
const showComparisonModal = ref(false)
const selectedItem = ref<any>(null)

// 标签页配置
const tabs = [
  { key: 'optimization', label: '优化历史', icon: 'i-lucide-zap' },
  { key: 'logs', label: '操作日志', icon: 'i-lucide-file-text' },
  { key: 'stats', label: '统计数据', icon: 'i-lucide-bar-chart' }
]

// 模拟日志数据
const logs = ref([
  { timestamp: new Date(), level: 'INFO', message: 'CodingPal 应用启动' },
  { timestamp: new Date(Date.now() - 60000), level: 'INFO', message: '开始监控IDE进程' },
  { timestamp: new Date(Date.now() - 120000), level: 'SUCCESS', message: 'GLM API连接成功' },
  { timestamp: new Date(Date.now() - 180000), level: 'INFO', message: '检测到Cursor进程启动' },
  { timestamp: new Date(Date.now() - 240000), level: 'WARNING', message: 'API请求频率较高，请注意使用限制' },
])

// 统计数据
const stats = ref({
  totalOptimizations: 0,
  totalTokens: 0,
  avgConfidence: 0,
  monitoredProcesses: 0
})

// 周统计数据
const weeklyStats = ref([
  { day: '周一', count: 5 },
  { day: '周二', count: 8 },
  { day: '周三', count: 12 },
  { day: '周四', count: 6 },
  { day: '周五', count: 15 },
  { day: '周六', count: 3 },
  { day: '周日', count: 7 }
])

// 计算属性
const filteredLogs = computed(() => {
  if (logFilter.value === 'all') return logs.value
  return logs.value.filter(log => log.message.toLowerCase().includes(logFilter.value))
})

// 方法
const goBack = () => {
  router.push('/')
}

const loadOptimizationHistory = async () => {
  loading.value = true
  try {
    const result = await invoke('get_optimization_history', { 
      limit: parseInt(optimizationLimit.value.toString()) 
    })
    optimizationHistory.value = result as any[]
    
    // 更新统计数据
    if (optimizationHistory.value.length > 0) {
      stats.value.totalOptimizations = optimizationHistory.value.length
      stats.value.totalTokens = optimizationHistory.value.reduce((sum, item) => sum + item.tokens_used, 0)
      stats.value.avgConfidence = optimizationHistory.value.reduce((sum, item) => sum + item.confidence, 0) / optimizationHistory.value.length
    }
  } catch (error) {
    console.error('加载优化历史失败:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN')
}

const getLogLevelClass = (level: string) => {
  const classes = {
    INFO: 'text-blue-400',
    SUCCESS: 'text-green-400',
    WARNING: 'text-yellow-400',
    ERROR: 'text-red-400'
  }
  return classes[level as keyof typeof classes] || 'text-gray-400'
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // 可以添加提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const showComparison = (item: any) => {
  selectedItem.value = item
  showComparisonModal.value = true
}

const clearLogs = () => {
  logs.value = []
}

// 生命周期
onMounted(() => {
  loadOptimizationHistory()
})
</script>

<style scoped>
.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 
         transition-colors flex items-center justify-center;
}

.stat-card {
  @apply bg-white p-4 rounded-lg border shadow-sm;
}

.optimization-card:hover {
  transform: translateY(-1px);
}

.log-container {
  font-family: 'Courier New', monospace;
}

.log-entry {
  word-wrap: break-word;
}
</style>