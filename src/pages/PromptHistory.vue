<template>
  <div class="prompt-history w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- 顶部导航 -->
    <div class="header bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <i class="i-lucide-history w-5 h-5"></i>
        </div>
        <h1 class="text-lg font-semibold">优化历史</h1>
      </div>
      <button @click="goBack" class="flex items-center space-x-2 px-3 py-2 text-white bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200">
        <i class="i-lucide-arrow-left w-5 h-5"></i>
        <span class="text-sm font-medium">返回</span>
      </button>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar p-4 border-b bg-gray-50">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <!-- 搜索框 -->
          <div class="relative">
            <i class="i-lucide-search w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索历史记录..."
              class="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
          
          <!-- 筛选标签 -->
          <div class="flex items-center space-x-2">
            <button
              @click="showFavorites = !showFavorites"
              :class="showFavorites ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'"
              class="px-3 py-1 rounded-full text-sm transition-colors"
            >
              <i class="i-lucide-star w-3 h-3 mr-1"></i>
              收藏
            </button>
            <select v-model="sortBy" class="text-sm border rounded px-2 py-1">
              <option value="date">按时间排序</option>
              <option value="prompt">按提示词排序</option>
              <option value="results">按结果数排序</option>
            </select>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">{{ filteredHistory.length }} 条记录</span>
          <button @click="clearAllHistory" class="btn-secondary text-sm">
            <i class="i-lucide-trash-2 w-4 h-4 mr-1"></i>
            清空历史
          </button>
        </div>
      </div>
    </div>

    <!-- 历史记录列表 -->
    <div class="flex-1 overflow-hidden">
      <div v-if="filteredHistory.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500">
        <i class="i-lucide-clock w-12 h-12 mb-4 text-gray-300"></i>
        <p class="text-lg font-medium mb-2">暂无历史记录</p>
        <p class="text-sm text-center">使用提示词优化器后，历史记录将显示在这里</p>
      </div>
      
      <div v-else class="h-full overflow-y-auto">
        <div class="space-y-4 p-4">
          <div
            v-for="history in paginatedHistory"
            :key="history.id"
            class="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            @click="selectHistory(history)"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="text-sm text-gray-500">{{ formatDate(history.createdAt) }}</span>
                  <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {{ history.results.length }} 个结果
                  </span>
                  <span v-if="history.favorite" class="text-yellow-500">
                    <i class="i-lucide-star w-4 h-4 fill-current"></i>
                  </span>
                </div>
                <p class="text-gray-800 font-medium mb-2 line-clamp-2">{{ history.originalPrompt }}</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="result in history.results.slice(0, 3)"
                    :key="result.id"
                    :class="getResultStatusClass(result.status)"
                    class="text-xs px-2 py-1 rounded-full"
                  >
                    {{ result.modelName }}
                  </span>
                  <span v-if="history.results.length > 3" class="text-xs text-gray-500">
                    +{{ history.results.length - 3 }} 更多
                  </span>
                </div>
              </div>
              
              <div class="flex items-center space-x-2 ml-4">
                <button
                  @click.stop="toggleFavorite(history.id)"
                  class="p-1 hover:bg-gray-100 rounded"
                  :title="history.favorite ? '取消收藏' : '添加收藏'"
                >
                  <i :class="history.favorite ? 'i-lucide-star text-yellow-500 fill-current' : 'i-lucide-star text-gray-400'" class="w-4 h-4"></i>
                </button>
                <button
                  @click.stop="deleteHistory(history.id)"
                  class="p-1 hover:bg-gray-100 rounded text-red-500"
                  title="删除记录"
                >
                  <i class="i-lucide-trash-2 w-4 h-4"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div v-if="totalPages > 1" class="p-4 border-t bg-gray-50">
          <div class="flex items-center justify-center space-x-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 border rounded disabled:opacity-50"
            >
              上一页
            </button>
            <span class="text-sm text-gray-600">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border rounded disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="selectedHistory" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeDetail">
      <div class="bg-white rounded-lg max-w-4xl max-h-[80vh] w-full mx-4 overflow-hidden" @click.stop>
        <!-- 弹窗头部 -->
        <div class="p-4 border-b bg-gray-50">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium">优化详情</h3>
              <p class="text-sm text-gray-600">{{ formatDate(selectedHistory.createdAt) }}</p>
            </div>
            <button @click="closeDetail" class="p-2 hover:bg-gray-200 rounded">
              <i class="i-lucide-x w-5 h-5"></i>
            </button>
          </div>
        </div>
        
        <!-- 弹窗内容 -->
        <div class="p-4 overflow-y-auto max-h-[60vh]">
          <!-- 原始提示词 -->
          <div class="mb-6">
            <h4 class="font-medium mb-2 flex items-center">
              <i class="i-lucide-edit w-4 h-4 mr-2 text-blue-600"></i>
              原始提示词
            </h4>
            <div class="bg-blue-50 rounded-lg p-3">
              <p class="text-gray-800">{{ selectedHistory.originalPrompt }}</p>
            </div>
          </div>
          
          <!-- 优化结果对比 -->
          <div>
            <h4 class="font-medium mb-4 flex items-center">
              <i class="i-lucide-sparkles w-4 h-4 mr-2 text-green-600"></i>
              优化结果对比
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="result in selectedHistory.results"
                :key="result.id"
                class="border rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-2">
                    <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <i class="i-lucide-brain w-3 h-3 text-blue-600"></i>
                    </div>
                    <span class="font-medium">{{ result.modelName }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span :class="getResultStatusClass(result.status)" class="text-xs px-2 py-1 rounded-full">
                      {{ result.status === 'success' ? `${result.responseTime}ms` : '失败' }}
                    </span>
                    <button
                      v-if="result.status === 'success'"
                      @click="copyResult(result.optimizedPrompt)"
                      class="p-1 hover:bg-gray-100 rounded"
                      title="复制结果"
                    >
                      <i class="i-lucide-copy w-4 h-4 text-gray-600"></i>
                    </button>
                  </div>
                </div>
                
                <div v-if="result.status === 'success'" class="bg-gray-50 rounded p-3">
                  <p class="text-sm text-gray-800 leading-relaxed">{{ result.optimizedPrompt }}</p>
                </div>
                
                <div v-else class="bg-red-50 rounded p-3">
                  <p class="text-sm text-red-600">{{ result.errorMessage || '优化失败' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 弹窗底部 -->
        <div class="p-4 border-t bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <button
                @click="toggleFavorite(selectedHistory.id)"
                :class="selectedHistory.favorite ? 'text-yellow-500' : 'text-gray-400'"
                class="flex items-center space-x-1 px-3 py-1 hover:bg-gray-200 rounded"
              >
                <i :class="selectedHistory.favorite ? 'i-lucide-star fill-current' : 'i-lucide-star'" class="w-4 h-4"></i>
                <span class="text-sm">{{ selectedHistory.favorite ? '已收藏' : '收藏' }}</span>
              </button>
            </div>
            <button @click="closeDetail" class="btn-primary">
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adjustWindowSize, WINDOW_PRESETS } from '../utils/windowManager'
import { storageService } from '../services/storage'
import { toast } from '../services/toast'
import type { PromptHistory, OptimizationResult } from '../types/prompt-optimizer'

const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const showFavorites = ref(false)
const sortBy = ref('date')
const currentPage = ref(1)
const pageSize = 10
const selectedHistory = ref<PromptHistory | null>(null)
const historyList = ref<PromptHistory[]>([])

// 计算属性
const filteredHistory = computed(() => {
  let filtered = historyList.value
  
  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(h => 
      h.originalPrompt.toLowerCase().includes(query) ||
      h.results.some(r => r.optimizedPrompt.toLowerCase().includes(query))
    )
  }
  
  // 收藏过滤
  if (showFavorites.value) {
    filtered = filtered.filter(h => h.favorite)
  }
  
  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'prompt':
        return a.originalPrompt.localeCompare(b.originalPrompt)
      case 'results':
        return b.results.length - a.results.length
      default:
        return 0
    }
  })
  
  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredHistory.value.length / pageSize)
})

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredHistory.value.slice(start, end)
})

// 方法
const goBack = async () => {
  try {
    await adjustWindowSize(WINDOW_PRESETS.MAIN.width, WINDOW_PRESETS.MAIN.height)
  } catch (error) {
    console.error('恢复窗口大小失败:', error)
  }
  router.push('/')
}

const loadHistory = () => {
  historyList.value = storageService.getPromptHistory()
}

const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getResultStatusClass = (status: string): string => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800'
    case 'error':
      return 'bg-red-100 text-red-800'
    case 'timeout':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const selectHistory = (history: PromptHistory) => {
  selectedHistory.value = history
}

const closeDetail = () => {
  selectedHistory.value = null
}

const toggleFavorite = (id: string) => {
  try {
    const history = historyList.value.find(h => h.id === id)
    if (history) {
      history.favorite = !history.favorite
      storageService.updatePromptHistory(id, { favorite: history.favorite })
      
      // 更新选中的历史记录
      if (selectedHistory.value && selectedHistory.value.id === id) {
        selectedHistory.value.favorite = history.favorite
      }
      
      toast.success('收藏状态已更新')
    }
  } catch (error) {
    console.error('更新收藏状态失败:', error)
    toast.error('操作失败，请稍后重试')
  }
}

const deleteHistory = (id: string) => {
  toast.deleteConfirm('此条历史记录', () => {
    storageService.deletePromptHistory(id)
    historyList.value = historyList.value.filter(h => h.id !== id)
    
    // 如果删除的是当前选中的记录，关闭详情弹窗
    if (selectedHistory.value && selectedHistory.value.id === id) {
      selectedHistory.value = null
    }
  })
}

const clearAllHistory = () => {
  if (historyList.value.length === 0) {
    toast.info('暂无历史记录')
    return
  }
  
  toast.deleteConfirm('所有历史记录', () => {
    storageService.savePromptHistory([])
    historyList.value = []
    selectedHistory.value = null
  })
}

const copyResult = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.copySuccess('优化结果')
  } catch (error) {
    console.error('复制失败:', error)
    toast.error('复制失败，请手动选择文本复制')
  }
}

// 生命周期
onMounted(async () => {
  try {
    await adjustWindowSize(950, 700) // 调整为历史页面尺寸
  } catch (error) {
    console.error('调整窗口大小失败:', error)
  }
  loadHistory()
})
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
         transition-colors flex items-center justify-center disabled:opacity-50;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 
         transition-colors flex items-center justify-center disabled:opacity-50;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>