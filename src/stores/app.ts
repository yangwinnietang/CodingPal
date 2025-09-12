import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ModelName, OptimizationRecord, ApiConfig } from '@/types/prompt-optimizer'
import { apiKeyService } from '@/services/api-key-service'
import { historyService } from '@/services/history-service'
import { multiModelService } from '@/services/multi-model-service'

export const useAppStore = defineStore('app', () => {
  // 状态
  const currentPrompt = ref('')
  const selectedModels = ref<ModelName[]>(['GLM4.5-Air'])
  const isOptimizing = ref(false)
  const optimizationResults = ref<OptimizationRecord | null>(null)
  const apiConfigs = ref<Record<ModelName, ApiConfig>>({
      'GLM4.5-Air': { apiKey: '', baseUrl: '', timeout: 30000, temperature: 0.7, modelName: 'GLM4.5-Air', enabled: false },
      'KimiK2': { apiKey: '', baseUrl: '', timeout: 30000, temperature: 0.7, modelName: 'KimiK2', enabled: false },
      'DeepSeek V3.1': { apiKey: '', baseUrl: '', timeout: 30000, temperature: 0.7, modelName: 'DeepSeek V3.1', enabled: false },
      'glm-4-air': { apiKey: '', baseUrl: 'https://open.bigmodel.cn/api/paas/v4/', timeout: 30000, temperature: 0.7, modelName: 'glm-4-air', enabled: false },
      'moonshot-v1-8k': { apiKey: '', baseUrl: 'https://api.moonshot.cn/v1/', timeout: 30000, temperature: 0.7, modelName: 'moonshot-v1-8k', enabled: false },
      'deepseek-chat': { apiKey: '', baseUrl: 'https://api.deepseek.com/v1/', timeout: 30000, temperature: 0.7, modelName: 'deepseek-chat', enabled: false },
      'glm-4.5-air': { apiKey: '', baseUrl: 'https://open.bigmodel.cn/api/paas/v4/', timeout: 30000, temperature: 0.7, modelName: 'glm-4.5-air', enabled: false },
      'kimi-k2': { apiKey: '', baseUrl: 'https://api.moonshot.cn/v1/', timeout: 30000, temperature: 0.7, modelName: 'kimi-k2', enabled: false }
    })
  const recentHistory = ref<OptimizationRecord[]>([])
  const settings = ref({
    autoSave: true,
    maxHistoryCount: 100,
    defaultTimeout: 30000,
    theme: 'light' as 'light' | 'dark'
  })

  // 计算属性
  const hasValidApiKeys = computed(() => {
    return selectedModels.value.some(model => 
      apiConfigs.value[model]?.apiKey?.trim()
    )
  })

  const canOptimize = computed(() => {
    return currentPrompt.value.trim() && 
           selectedModels.value.length > 0 && 
           hasValidApiKeys.value && 
           !isOptimizing.value
  })

  const optimizationProgress = computed(() => {
    if (!optimizationResults.value) return 0
    const total = optimizationResults.value.results.length
    const completed = optimizationResults.value.results.filter(
      r => r.status === 'success' || r.status === 'error'
    ).length
    return total > 0 ? (completed / total) * 100 : 0
  })

  // 方法
  const loadApiConfigs = async () => {
    try {
      for (const model of Object.keys(apiConfigs.value) as ModelName[]) {
        const config = await apiKeyService.getApiConfig(model)
        if (config) {
          apiConfigs.value[model] = config
        }
      }
    } catch (error) {
      console.error('加载API配置失败:', error)
    }
  }

  const saveApiConfig = async (model: ModelName, config: ApiConfig) => {
    try {
      await apiKeyService.saveApiConfig(model, config)
      apiConfigs.value[model] = config
    } catch (error) {
      console.error('保存API配置失败:', error)
      throw error
    }
  }

  const testApiConnection = async (model: ModelName) => {
    try {
      const config = apiConfigs.value[model]
      if (!config?.apiKey) {
        throw new Error('API密钥未配置')
      }
      return await apiKeyService.testApiKey(model, config.apiKey)
    } catch (error) {
      console.error(`测试${model}连接失败:`, error)
      return false
    }
  }

  const optimizePrompt = async () => {
    if (!canOptimize.value) return

    isOptimizing.value = true
    try {
      const results = await multiModelService.optimizePrompt(
        currentPrompt.value,
        selectedModels.value
      )
      
      // 创建优化记录
      const record: OptimizationRecord = {
        id: crypto.randomUUID(),
        originalPrompt: currentPrompt.value,
        createdAt: new Date(),
        userLanguage: 'zh-CN',
        selectedModels: selectedModels.value,
        results: results
      }
      
      optimizationResults.value = record
      
      // 自动保存到历史记录
      if (settings.value.autoSave) {
        await historyService.saveRecord(record)
        await loadRecentHistory()
      }
      
      return record
    } catch (error) {
      console.error('优化失败:', error)
      throw error
    } finally {
      isOptimizing.value = false
    }
  }

  const loadRecentHistory = async () => {
    try {
      const history = await historyService.getRecentRecords(10)
      recentHistory.value = history
    } catch (error) {
      console.error('加载历史记录失败:', error)
    }
  }

  const clearResults = () => {
    optimizationResults.value = null
  }

  const setCurrentPrompt = (prompt: string) => {
    currentPrompt.value = prompt
  }

  const setSelectedModels = (models: ModelName[]) => {
    selectedModels.value = models
  }

  const updateSettings = (newSettings: Partial<typeof settings.value>) => {
    settings.value = { ...settings.value, ...newSettings }
    // 可以添加持久化存储逻辑
    localStorage.setItem('app-settings', JSON.stringify(settings.value))
  }

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('app-settings')
      if (saved) {
        settings.value = { ...settings.value, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }

  // 初始化
  const initialize = async () => {
    loadSettings()
    await loadApiConfigs()
    await loadRecentHistory()
  }

  return {
    // 状态
    currentPrompt,
    selectedModels,
    isOptimizing,
    optimizationResults,
    apiConfigs,
    recentHistory,
    settings,

    // 计算属性
    hasValidApiKeys,
    canOptimize,
    optimizationProgress,

    // 方法
    loadApiConfigs,
    saveApiConfig,
    testApiConnection,
    optimizePrompt,
    loadRecentHistory,
    clearResults,
    setCurrentPrompt,
    setSelectedModels,
    updateSettings,
    loadSettings,
    initialize
  }
})

// 导出类型
export type AppStore = ReturnType<typeof useAppStore>