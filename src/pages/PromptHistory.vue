<template>
  <div class="prompt-history w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- 顶部导航 -->
    <div class="header bg-white border-b border-gray-200 text-gray-800 p-6 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <i class="i-lucide-history w-6 h-6 text-gray-600"></i>
        </div>
        <h1 class="text-lg font-bold text-gray-900">优化历史</h1>
      </div>
      <button @click="goBack" class="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200">
        <i class="i-lucide-arrow-left w-5 h-5"></i>
        <span class="text-sm font-medium">返回</span>
      </button>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar p-6 border-b bg-white">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-6">
          <!-- 搜索框 -->
          <div class="relative">
            <i class="i-lucide-search w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索历史记录..."
              class="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80 bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
          
          <!-- 筛选标签 -->
          <div class="flex items-center space-x-3">
            <button
              @click="showFavorites = !showFavorites"
              :class="showFavorites ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-gray-100 text-gray-600 border-gray-200'"
              class="px-4 py-2 rounded-xl text-sm transition-colors border font-medium"
            >
              <i class="i-lucide-star w-4 h-4 mr-2"></i>
              收藏
            </button>
            <select v-model="sortBy" class="text-sm border border-gray-200 rounded-xl px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="date">按时间排序</option>
              <option value="prompt">按提示词排序</option>
              <option value="results">按结果数排序</option>
            </select>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600 font-medium">{{ filteredHistory.length }} 条记录</span>
          <button @click="clearAllHistory" class="btn-secondary text-sm px-4 py-2 rounded-xl">
            <i class="i-lucide-trash-2 w-4 h-4 mr-2"></i>
            清空历史
          </button>
        </div>
      </div>
    </div>

    <!-- 历史记录列表 -->
    <div class="flex-1 overflow-hidden">
      <div v-if="filteredHistory.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500">
        <i class="i-lucide-clock w-16 h-16 mb-6 text-gray-300"></i>
        <p class="text-xl font-semibold mb-3 text-gray-700">暂无历史记录</p>
        <p class="text-sm text-center text-gray-500 leading-relaxed">使用提示词优化器后，历史记录将显示在这里</p>
      </div>
      
      <div v-else class="h-full overflow-y-auto">
        <div class="space-y-4 p-6">
          <div
            v-for="history in paginatedHistory"
            :key="history.id"
            class="border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer bg-white"
            @click="selectHistory(history)"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-3">
                  <span class="text-sm text-gray-500 font-medium">{{ formatDate(history.createdAt.getTime()) }}</span>
                  <span class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {{ history.results.length }} 个结果
                  </span>

                </div>
                <p class="text-gray-800 font-semibold mb-3 line-clamp-2 text-base">{{ history.originalPrompt }}</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="result in history.results.slice(0, 3)"
                    :key="result.modelName"
                    :class="getResultStatusClass(result.status)"
                    class="text-xs px-3 py-1 rounded-full font-medium"
                  >
                    {{ result.modelName }}
                  </span>
                  <span v-if="history.results.length > 3" class="text-xs text-gray-500 font-medium">
                    +{{ history.results.length - 3 }} 更多
                  </span>
                </div>
              </div>
              
              <div class="flex items-center space-x-2 ml-6">
                <button
                  @click.stop=""
                  class="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  title="收藏"
                >
                  <i class="i-lucide-star text-gray-400 w-5 h-5"></i>
                </button>
                <button
                  @click.stop="deleteHistory(history.id)"
                  class="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors"
                  title="删除记录"
                >
                  <i class="i-lucide-trash-2 w-5 h-5"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div v-if="totalPages > 1" class="p-6 border-t bg-white">
          <div class="flex items-center justify-center space-x-4">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
            >
              上一页
            </button>
            <span class="text-sm text-gray-600 font-medium px-4">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
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
        <div class="p-6 border-b bg-white">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-gray-900">优化详情</h3>
              <p class="text-sm text-gray-500 font-medium mt-1">{{ formatDate(selectedHistory.createdAt.getTime()) }}</p>
            </div>
            <button @click="closeDetail" class="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <i class="i-lucide-x w-6 h-6 text-gray-600"></i>
            </button>
          </div>
        </div>
        
        <!-- 弹窗内容 -->
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <!-- 原始提示词 -->
          <div class="mb-8">
            <h4 class="font-semibold mb-3 flex items-center text-base">
              <i class="i-lucide-edit w-5 h-5 mr-3 text-blue-600"></i>
              原始提示词
            </h4>
            <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p class="text-gray-800 leading-relaxed">{{ selectedHistory.originalPrompt }}</p>
            </div>
          </div>
          
          <!-- 优化结果对比 -->
          <div>
            <h4 class="font-semibold mb-4 flex items-center text-base">
              <i class="i-lucide-sparkles w-5 h-5 mr-3 text-green-600"></i>
              优化结果对比
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="result in selectedHistory.results"
                :key="result.modelName"
                class="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md transition-shadow"
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                      <i class="i-lucide-brain w-4 h-4 text-blue-600"></i>
                    </div>
                    <span class="font-semibold text-gray-900">{{ result.modelName }}</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span :class="getResultStatusClass(result.status)" class="text-xs px-3 py-1 rounded-full font-medium">
                      {{ result.status === 'success' ? `${result.responseTime}ms` : '失败' }}
                    </span>
                    <button
                      @click="copyResult(result.optimizedPrompt)"
                      class="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      title="复制结果"
                    >
                      <i class="i-lucide-copy w-4 h-4 text-gray-600"></i>
                    </button>
                  </div>
                </div>
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p class="text-sm text-gray-700 leading-relaxed">{{ result.optimizedPrompt }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 弹窗底部 -->
        <div class="p-6 border-t bg-white flex justify-end space-x-4">
          <button
            @click="closeDetail"
            class="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
          >
            关闭
          </button>
          <button
            @click="copyAllResults"
            class="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-colors"
          >
            复制所有结果
          </button>
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

const copyAllResults = async () => {
  if (!selectedHistory.value) return
  
  try {
    const allResults = selectedHistory.value.results
      .map(result => result.optimizedPrompt)
      .join('\n\n---\n\n')
    
    await navigator.clipboard.writeText(allResults)
    toast.success('所有结果已复制到剪贴板')
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