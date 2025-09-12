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
                  <span class="text-sm text-gray-500">{{ formatDate(history.createdAt.getTime()) }}</span>
                  <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {{ history.results.length }} 个结果
                  </span>

                </div>
                <p class="text-gray-800 font-medium mb-2 line-clamp-2">{{ history.originalPrompt }}</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="result in history.results.slice(0, 3)"
                    :key="result.modelName"
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
                  @click.stop=""
                  class="p-1 hover:bg-gray-100 rounded"
                  title="收藏"
                >
                  <i class="i-lucide-star text-gray-400 w-4 h-4"></i>
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
              <p class="text-sm text-gray-600">{{ formatDate(selectedHistory.createdAt.getTime()) }}</p>
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
                :key="result.modelName"
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
                      @click="copyResult(result.optimizedPrompt)"
                      class="p-1 hover:bg-gray-100 rounded"
                      title="复制结果"
                    >
                      <i class="i-lucide-copy w-3 h-3"></i>
                    </button>
                  </div>
                </div>
                <div class="bg-gray-50 rounded p-3">
                  <p class="text-sm text-gray-800">{{ result.optimizedPrompt || '优化失败' }}</p>
                </div>
              </div>
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
import { historyService } from '@/services/history-service'
import { toast } from 'sonner'
import type { OptimizationRecord } from '@/types/prompt-optimizer'

const router = useRouter()

// 响应式数据
const historyList = ref<OptimizationRecord[]>([])
const searchQuery = ref('')
const showFavorites = ref(false)
const sortBy = ref('date')
const currentPage = ref(1)
const pageSize = 10
const selectedHistory = ref<OptimizationRecord | null>(null)

// 计算属性
const filteredHistory = computed(() => {
  let filtered = historyList.value
  
  // 搜索过滤
  if (searchQuery.value) {
    filtered = filtered.filter(h => 
      h.originalPrompt.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 收藏过滤
  if (showFavorites.value) {
    // 收藏功能暂未实现，显示所有记录
    // filtered = filtered.filter(h => h.favorite)
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

const totalPages = computed(() => Math.ceil(filteredHistory.value.length / pageSize))

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredHistory.value.slice(start, start + pageSize)
})

// 方法
const loadHistory = async () => {
  try {
    historyList.value = historyService.getHistory()
  } catch (error) {
    console.error('加载历史记录失败:', error)
    toast.error('加载历史记录失败')
  }
}

const goBack = () => {
  router.push('/')
}

const selectHistory = (history: OptimizationRecord) => {
  selectedHistory.value = history
}

const closeDetail = () => {
  selectedHistory.value = null
}

const toggleFavorite = async (id: string) => {
  try {
    const record = historyList.value.find(h => h.id === id)
    if (record) {
      // 收藏功能暂未实现
      toast.info('收藏功能暂未实现')
    }
  } catch (error) {
    console.error('更新收藏状态失败:', error)
    toast.error('操作失败')
  }
}

const deleteHistory = async (id: string) => {
  if (!confirm('确定要删除这条记录吗？')) return
  
  try {
    await historyService.deleteRecord(id)
    historyList.value = historyList.value.filter(h => h.id !== id)
    toast.success('删除成功')
  } catch (error) {
    console.error('删除记录失败:', error)
    toast.error('删除失败')
  }
}

const clearAllHistory = async () => {
  if (!confirm('确定要清空所有历史记录吗？此操作不可恢复。')) return
  
  try {
    await historyService.clearHistory()
    historyList.value = []
    toast.success('历史记录已清空')
  } catch (error) {
    console.error('清空历史记录失败:', error)
    toast.error('清空失败')
  }
}

const copyResult = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    toast.error('复制失败')
  }
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const getResultStatusClass = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800'
    case 'error':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// 生命周期
onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-secondary {
  @apply px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors;
}
</style>