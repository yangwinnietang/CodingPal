<template>
  <div class="prompt-optimizer w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- 顶部导航 -->
    <div class="header bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <i class="i-lucide-sparkles w-5 h-5"></i>
        </div>
        <h1 class="text-lg font-semibold">多模型提示词优化智能体</h1>
      </div>
      <button @click="goBack" class="flex items-center space-x-2 px-3 py-2 text-white bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200">
        <i class="i-lucide-arrow-left w-5 h-5"></i>
        <span class="text-sm font-medium">返回</span>
      </button>
    </div>

    <div class="flex h-full">
      <!-- 左侧输入区域 -->
      <div class="w-1/2 border-r flex flex-col">
        <div class="p-4 border-b bg-gray-50">
          <h2 class="text-lg font-medium mb-2">原始提示词</h2>
          <p class="text-sm text-gray-600">输入您想要优化的提示词，AI将为您提供多个优化版本</p>
        </div>
        
        <div class="flex-1 p-4 flex flex-col">
          <!-- 输入框 -->
          <div class="flex-1 mb-4">
            <textarea
              v-model="pageState.inputPrompt"
              placeholder="请输入您的提示词...\n\n例如：我想创建一个用户友好的登录界面，包含用户名、密码输入框和记住我选项"
              class="w-full h-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :disabled="pageState.isOptimizing"
            ></textarea>
          </div>
          
          <!-- 字符统计和模型选择 -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-gray-500">{{ pageState.inputPrompt.length }} 字符</span>
              <button @click="clearInput" :disabled="pageState.isOptimizing" class="text-sm text-gray-500 hover:text-gray-700">
                <i class="i-lucide-trash-2 w-4 h-4"></i>
              </button>
            </div>
            
            <!-- 模型选择面板 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">选择模型：</label>
              <div class="grid grid-cols-1 gap-2">
                <label v-for="modelName in availableModels" :key="modelName" class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    :value="modelName" 
                    v-model="pageState.selectedModels"
                    class="mr-3 text-blue-600 focus:ring-blue-500"
                    :disabled="pageState.isOptimizing"
                  >
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-medium">{{ MODEL_CONFIGS[modelName].displayName }}</span>
                      <span class="text-xs text-gray-500">{{ MODEL_CONFIGS[modelName].rateLimit }} RPM</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      温度: {{ MODEL_CONFIGS[modelName].defaultTemperature }}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="space-y-3">
            <button 
              @click="optimizePrompt" 
              :disabled="!canOptimize" 
              class="w-full btn-primary"
            >
              <i v-if="pageState.isOptimizing" class="i-lucide-loader-2 w-4 h-4 mr-2 animate-spin"></i>
              <i v-else class="i-lucide-sparkles w-4 h-4 mr-2"></i>
              {{ pageState.isOptimizing ? '优化中...' : '开始优化' }}
            </button>
            
            <!-- 模型状态提示 -->
            <div v-if="pageState.selectedModels.length > 0" class="p-3 bg-blue-50 rounded-lg">
              <div class="flex items-center mb-2">
                <i class="i-lucide-info w-4 h-4 text-blue-600 mr-2"></i>
                <span class="text-sm font-medium text-blue-800">将使用 {{ pageState.selectedModels.length }} 个模型进行优化</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="model in pageState.selectedModels" :key="model" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {{ MODEL_CONFIGS[model].displayName }}
                </span>
              </div>
            </div>
            
            <!-- 无可用模型提示 -->
            <div v-else-if="availableModels.length === 0" class="p-3 bg-yellow-50 rounded-lg">
              <div class="flex items-center">
                <i class="i-lucide-alert-triangle w-4 h-4 text-yellow-600 mr-2"></i>
                <span class="text-sm text-yellow-800">请先在设置页面配置API密钥</span>
              </div>
            </div>
            
            <!-- 未选择模型提示 -->
            <div v-else class="p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <i class="i-lucide-info w-4 h-4 text-gray-600 mr-2"></i>
                <span class="text-sm text-gray-600">请选择至少一个模型进行优化</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧结果区域 -->
      <div class="w-1/2 flex flex-col">
        <div class="p-4 border-b bg-gray-50">
          <h2 class="text-lg font-medium mb-2">优化结果</h2>
          <p class="text-sm text-gray-600">AI为您生成的优化版本，点击可复制使用</p>
        </div>
        
        <div class="flex-1 p-4 overflow-y-auto">
          <!-- 加载状态 -->
          <div v-if="pageState.isOptimizing" class="space-y-4">
            <div v-for="model in pageState.selectedModels" :key="model" class="border rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <i class="i-lucide-brain w-3 h-3 text-blue-600"></i>
                  </div>
                  <span class="font-medium">{{ MODEL_CONFIGS[model].displayName }}</span>
                </div>
                <div class="flex items-center space-x-2 text-blue-600">
                  <i class="i-lucide-loader-2 w-4 h-4 animate-spin"></i>
                  <span class="text-sm">优化中...</span>
                </div>
              </div>
              <div class="bg-gray-100 rounded p-3 animate-pulse">
                <div class="h-4 bg-gray-200 rounded mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
          
          <!-- 优化结果 -->
          <div v-else-if="pageState.results.length > 0" class="space-y-4">
            <div v-for="result in pageState.results" :key="result.id" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <i class="i-lucide-brain w-3 h-3 text-blue-600"></i>
                  </div>
                  <span class="font-medium">{{ MODEL_CONFIGS[result.modelName].displayName }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span v-if="!result.error" class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {{ result.responseTime }}ms
                  </span>
                  <span v-if="result.tokensUsed > 0" class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {{ result.tokensUsed }} tokens
                  </span>
                  <span v-if="result.error" class="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                    失败
                  </span>
                  <button 
                    v-if="!result.error && result.optimizedPrompt"
                    @click="copyResult(result.optimizedPrompt)"
                    class="p-1 hover:bg-gray-100 rounded"
                    title="复制结果"
                  >
                    <i class="i-lucide-copy w-4 h-4 text-gray-600"></i>
                  </button>
                  <!-- 评分按钮 -->
                  <div v-if="!result.error" class="flex items-center space-x-1">
                    <button 
                      v-for="star in 5" 
                      :key="star"
                      @click="rateResult(result.id, star)"
                      class="p-1 hover:bg-gray-100 rounded"
                    >
                      <i :class="star <= (result.userRating || 0) ? 'i-lucide-star text-yellow-500' : 'i-lucide-star text-gray-300'" class="w-3 h-3"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div v-if="!result.error" class="bg-gray-50 rounded p-3">
                <p class="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{{ result.optimizedPrompt }}</p>
              </div>
              
              <div v-else class="bg-red-50 rounded p-3">
                <p class="text-sm text-red-600">{{ result.error }}</p>
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
            <i class="i-lucide-sparkles w-12 h-12 mb-4 text-gray-300"></i>
            <p class="text-lg font-medium mb-2">等待优化</p>
            <p class="text-sm text-center">在左侧输入提示词，选择模型，点击"开始优化"<br>AI将为您生成多个优化版本</p>
          </div>
        </div>
        
        <!-- 底部操作栏 -->
        <div v-if="pageState.results.length > 0" class="p-4 border-t bg-gray-50">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">{{ successCount }}/{{ pageState.results.length }} 个模型成功</span>
            <div class="flex space-x-2">
              <button @click="saveToHistory" class="btn-secondary text-sm">
                <i class="i-lucide-bookmark w-4 h-4 mr-1"></i>
                保存到历史
              </button>
              <button @click="retryOptimization" class="btn-primary text-sm">
                <i class="i-lucide-refresh-cw w-4 h-4 mr-1"></i>
                重新优化
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { adjustWindowSize, WINDOW_PRESETS } from '../utils/windowManager'
import { multiModelService } from '../services/multi-model-service'
import { apiKeyService } from '../services/api-key-service'
import { historyService } from '../services/history-service'
import { toast } from '../services/toast'
import type { ModelName, HomePageState, OptimizationRecord, ModelResult } from '../types/prompt-optimizer'
import { MODEL_CONFIGS, OptimizationStatus } from '../types/prompt-optimizer'

const router = useRouter()

// 页面状态
const pageState = reactive<HomePageState>({
  inputPrompt: '',
  selectedModels: [],
  isOptimizing: false,
  results: [],
  status: OptimizationStatus.IDLE,
  error: undefined
})

// 计算属性
const availableModels = computed(() => {
  return apiKeyService.getConfiguredModels()
})

const canOptimize = computed(() => {
  return !pageState.isOptimizing && 
         pageState.inputPrompt.trim().length > 0 && 
         pageState.selectedModels.length > 0
})

const successCount = computed(() => {
  return pageState.results.filter(result => !result.error).length
})

// 方法
const goBack = async () => {
  try {
    console.log('开始返回主页面')
    await router.push('/')
    console.log('路由跳转成功')
  } catch (error) {
    console.error('路由跳转失败:', error)
    toast.error('返回失败，请重试')
    try {
      await router.replace('/')
    } catch (replaceError) {
      console.error('替代跳转也失败:', replaceError)
    }
  }
}

const clearInput = () => {
  pageState.inputPrompt = ''
  pageState.results = []
  pageState.status = OptimizationStatus.IDLE
  pageState.error = undefined
}

const optimizePrompt = async () => {
  if (!canOptimize.value) return
  
  pageState.isOptimizing = true
  pageState.status = OptimizationStatus.LOADING
  pageState.results = []
  pageState.error = undefined
  
  try {
    const results = await multiModelService.optimizePrompt(
      pageState.inputPrompt, 
      pageState.selectedModels
    )
    
    pageState.results = results
    pageState.status = OptimizationStatus.SUCCESS
    
    // 显示成功提示
    const successCount = results.filter(r => !r.error).length
    toast.success(`优化完成！${successCount}/${results.length} 个模型成功`)
    
  } catch (error) {
    pageState.error = error instanceof Error ? error.message : '优化失败'
    pageState.status = OptimizationStatus.ERROR
    toast.error(pageState.error)
  } finally {
    pageState.isOptimizing = false
  }
}

const retryOptimization = () => {
  optimizePrompt()
}

const copyResult = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  } catch {
    toast.error('复制失败')
  }
}

const rateResult = (resultId: string, rating: number) => {
  const result = pageState.results.find(r => r.id === resultId)
  if (result) {
    result.userRating = rating
    toast.success(`已评分 ${rating} 星`)
  }
}

const saveToHistory = async () => {
  try {
    const record: OptimizationRecord = {
      id: `record_${Date.now()}`,
      originalPrompt: pageState.inputPrompt,
      createdAt: new Date(),
      userLanguage: 'zh-CN',
      selectedModels: pageState.selectedModels,
      results: pageState.results
    }
    
    await historyService.saveRecord(record)
    toast.success('已保存到历史记录')
  } catch (error) {
    toast.error('保存失败')
  }
}

// 生命周期
onMounted(() => {
  // 调整窗口大小
  adjustWindowSize(WINDOW_PRESETS.PROMPT_OPTIMIZER.width, WINDOW_PRESETS.PROMPT_OPTIMIZER.height)
  
  // 初始化API密钥服务
  apiKeyService.initialize()
  
  // 默认选择所有可用模型
  pageState.selectedModels = availableModels.value
})
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center;
}

.prompt-optimizer {
  height: calc(100vh - 2rem);
}
</style>