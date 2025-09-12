<template>
  <div class="prompt-optimizer w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- 顶部导航 -->
    <div class="header bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <i class="i-lucide-sparkles w-5 h-5"></i>
        </div>
        <h1 class="text-lg font-semibold">AI提示词优化器</h1>
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
              v-model="inputPrompt"
              placeholder="请输入您的提示词...\n\n例如：我想将UI页面设计的更美观，仿照其他文件夹"
              class="w-full h-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :disabled="isOptimizing"
            ></textarea>
          </div>
          
          <!-- 字符统计和模板选择 -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-gray-500">{{ inputPrompt.length }} 字符</span>
            <select v-model="selectedTemplate" @change="applyTemplate" class="text-sm border rounded px-2 py-1">
              <option value="">选择模板</option>
              <option v-for="template in promptTemplates" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </select>
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex space-x-2">
            <button 
              @click="optimizePrompt" 
              :disabled="!canOptimize" 
              class="flex-1 btn-primary"
            >
              <i v-if="isOptimizing" class="i-lucide-loader-2 w-4 h-4 mr-2 animate-spin"></i>
              <i v-else class="i-lucide-sparkles w-4 h-4 mr-2"></i>
              {{ isOptimizing ? '优化中...' : '开始优化' }}
            </button>
            <button @click="clearInput" :disabled="isOptimizing" class="btn-secondary">
              <i class="i-lucide-trash-2 w-4 h-4"></i>
            </button>
          </div>
          
          <!-- 启用的模型显示 -->
          <div v-if="enabledModels.length > 0" class="mt-4 p-3 bg-blue-50 rounded-lg">
            <div class="flex items-center mb-2">
              <i class="i-lucide-info w-4 h-4 text-blue-600 mr-2"></i>
              <span class="text-sm font-medium text-blue-800">将使用以下模型进行优化：</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="model in enabledModels" :key="model" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {{ getModelDisplayName(model) }}
              </span>
            </div>
          </div>
          
          <!-- 无可用模型提示 -->
          <div v-else class="mt-4 p-3 bg-yellow-50 rounded-lg">
            <div class="flex items-center">
              <i class="i-lucide-alert-triangle w-4 h-4 text-yellow-600 mr-2"></i>
              <span class="text-sm text-yellow-800">请先在设置页面配置API密钥</span>
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
          <div v-if="isOptimizing" class="space-y-4">
            <div v-for="model in enabledModels" :key="model" class="border rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <i class="i-lucide-brain w-3 h-3 text-blue-600"></i>
                  </div>
                  <span class="font-medium">{{ getModelDisplayName(model) }}</span>
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
          <div v-else-if="results.length > 0" class="space-y-4">
            <div v-for="result in results" :key="result.id" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <i class="i-lucide-brain w-3 h-3 text-blue-600"></i>
                  </div>
                  <span class="font-medium">{{ result.modelName }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span v-if="result.status === 'success'" class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {{ result.responseTime }}ms
                  </span>
                  <span v-else class="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                    失败
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
          
          <!-- 空状态 -->
          <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
            <i class="i-lucide-sparkles w-12 h-12 mb-4 text-gray-300"></i>
            <p class="text-lg font-medium mb-2">等待优化</p>
            <p class="text-sm text-center">在左侧输入提示词，点击"开始优化"<br>AI将为您生成多个优化版本</p>
          </div>
        </div>
        
        <!-- 底部操作栏 -->
        <div v-if="results.length > 0" class="p-4 border-t bg-gray-50">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">{{ successCount }}/{{ results.length }} 个模型成功</span>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adjustWindowSize, WINDOW_PRESETS } from '../utils/windowManager'
import { storageService } from '../services/storage'
import { concurrentOptimizer } from '../services/concurrent-optimizer'
import { toast } from '../services/toast'
import type { ApiConfig, OptimizationResult, PromptHistory, PromptTemplate } from '../types/prompt-optimizer'
import { MODEL_CONFIGS } from '../types/prompt-optimizer'

const router = useRouter()

// 响应式数据
const inputPrompt = ref('')
const selectedTemplate = ref('')
const isOptimizing = ref(false)
const results = ref<OptimizationResult[]>([])
const apiConfigs = ref<ApiConfig[]>([])

// 提示词模板
const promptTemplates = ref<PromptTemplate[]>([
  {
    id: 'ui-design',
    name: 'UI设计优化',
    content: '我想将UI页面设计的更美观，仿照其他文件夹的设计风格',
    category: 'design',
    description: 'UI界面设计优化模板'
  },
  {
    id: 'code-review',
    name: '代码审查',
    content: '请帮我审查这段代码，指出潜在问题并提供改进建议',
    category: 'development',
    description: '代码审查模板'
  },
  {
    id: 'feature-request',
    name: '功能需求',
    content: '我需要实现一个新功能，请帮我分析需求并提供实现方案',
    category: 'planning',
    description: '功能需求分析模板'
  }
])

// 计算属性
const enabledModels = computed(() => {
  return apiConfigs.value
    .filter(config => config.enabled && config.apiKey.trim())
    .map(config => config.modelName)
})

const canOptimize = computed(() => {
  return inputPrompt.value.trim().length > 0 && enabledModels.value.length > 0 && !isOptimizing.value
})

const successCount = computed(() => {
  return results.value.filter(r => r.status === 'success').length
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

const getModelDisplayName = (modelName: string): string => {
  return MODEL_CONFIGS[modelName as keyof typeof MODEL_CONFIGS]?.displayName || modelName
}

const loadApiConfigs = () => {
  apiConfigs.value = storageService.getApiConfigs()
}

const applyTemplate = () => {
  if (selectedTemplate.value) {
    const template = promptTemplates.value.find(t => t.id === selectedTemplate.value)
    if (template) {
      inputPrompt.value = template.content
    }
  }
}

const clearInput = () => {
  inputPrompt.value = ''
  selectedTemplate.value = ''
  results.value = []
}

const optimizePrompt = async () => {
  if (!canOptimize.value) return
  
  isOptimizing.value = true
  results.value = []
  
  try {
    const enabledConfigs = apiConfigs.value.filter(config => config.enabled && config.apiKey.trim())
    const optimizationResults = await concurrentOptimizer.optimize(inputPrompt.value, enabledConfigs)
    results.value = optimizationResults
    
    const successCount = optimizationResults.filter(r => r.status === 'success').length
    toast.batchOperation(successCount, optimizationResults.length, '提示词优化')
  } catch (error) {
    console.error('优化失败:', error)
    toast.handleApiError(error, '提示词优化')
  } finally {
    isOptimizing.value = false
  }
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

const saveToHistory = () => {
  if (results.value.length === 0) {
    toast.warning('没有可保存的优化结果')
    return
  }
  
  try {
    const history: PromptHistory = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      originalPrompt: inputPrompt.value,
      createdAt: new Date(),
      favorite: false,
      results: results.value
    }
    
    storageService.addPromptHistory(history)
    toast.saveSuccess('优化历史')
  } catch (error) {
    console.error('保存失败:', error)
    toast.error('保存失败，请稍后重试')
  }
}

const retryOptimization = () => {
  optimizePrompt()
}

// 生命周期
onMounted(async () => {
  try {
    await adjustWindowSize(950, 700) // 调整为优化器页面尺寸
  } catch (error) {
    console.error('调整窗口大小失败:', error)
  }
  loadApiConfigs()
})
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
         transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 
         transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>