// 并发提示词优化服务
import type { ApiConfig, OptimizationResult, ConcurrentOptimizer as IConcurrentOptimizer, ModelName } from '../types/prompt-optimizer'
import { MODEL_CONFIGS } from '../types/prompt-optimizer'
import { ApiClientFactory, GLMApiClient, KimiApiClient, DeepSeekApiClient } from './api-client'

// 并发优化器实现类
export class ConcurrentOptimizer implements IConcurrentOptimizer {
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // 并发优化提示词
  async optimize(prompt: string, configs: ApiConfig[]): Promise<OptimizationResult[]> {
    const enabledConfigs = configs.filter(config => config.enabled && config.apiKey)
    
    if (enabledConfigs.length === 0) {
      throw new Error('没有可用的API配置')
    }

    // 创建并发任务
    const optimizationTasks = enabledConfigs.map(config => 
      this.optimizeSingle(prompt, config)
    )

    // 等待所有任务完成
    const results = await Promise.allSettled(optimizationTasks)
    
    return results.map((result, index) => {
      const config = enabledConfigs[index]
      const baseResult = {
        id: this.generateId(),
        modelName: MODEL_CONFIGS[config.modelName].displayName,
        responseTime: 0
      }

      if (result.status === 'fulfilled') {
        return {
          ...baseResult,
          ...result.value,
          status: 'success' as const,
          optimizedPrompt: result.value.optimizedPrompt || ''
        }
      } else {
        return {
          ...baseResult,
          optimizedPrompt: '',
          status: 'error' as const,
          errorMessage: result.reason?.message || '优化失败'
        }
      }
    })
  }

  // 单个模型优化
  private async optimizeSingle(prompt: string, config: ApiConfig): Promise<Partial<OptimizationResult>> {
    const startTime = Date.now()
    
    try {
      let optimizedPrompt: string
      
      switch (config.modelName) {
        case 'glm-4-air': {
          const client = new GLMApiClient(config.apiKey)
          optimizedPrompt = await client.optimizePrompt(prompt, config.temperature)
          break
        }
        case 'moonshot-v1-8k': {
          const client = new KimiApiClient(config.apiKey)
          optimizedPrompt = await client.optimizePrompt(prompt, config.temperature)
          break
        }
        case 'deepseek-chat': {
          const client = new DeepSeekApiClient(config.apiKey)
          optimizedPrompt = await client.optimizePrompt(prompt, config.temperature)
          break
        }
        default:
          throw new Error(`不支持的模型: ${config.modelName}`)
      }

      const responseTime = Date.now() - startTime
      
      return {
        optimizedPrompt,
        responseTime
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      throw {
        responseTime,
        message: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  // 验证API密钥
  async validateApiKey(config: ApiConfig): Promise<boolean> {
    try {
      return await ApiClientFactory.validateApiKey(config)
    } catch {
      return false
    }
  }

  // 获取模型状态
  async getModelStatus(modelName: string): Promise<'online' | 'offline' | 'error'> {
    try {
      // 创建测试配置
      const testConfig: ApiConfig = {
        modelName: modelName as ModelName,
        apiKey: 'test-key',
        enabled: true,
        baseUrl: MODEL_CONFIGS[modelName as ModelName]?.baseUrl || '',
        timeout: 5000,
        temperature: 0.5
      }

      const client = ApiClientFactory.createClient(testConfig.modelName, testConfig.apiKey)
      const isOnline = await client.testConnection()
      return isOnline ? 'online' : 'offline'
    } catch {
      return 'error'
    }
  }

  // 批量验证API配置
  async validateConfigs(configs: ApiConfig[]): Promise<Record<string, boolean>> {
    const validationTasks = configs.map(async config => ({
      modelName: config.modelName,
      isValid: await this.validateApiKey(config)
    }))

    const results = await Promise.allSettled(validationTasks)
    const validationResults: Record<string, boolean> = {}

    results.forEach((result, index) => {
      const modelName = configs[index].modelName
      validationResults[modelName] = result.status === 'fulfilled' ? result.value.isValid : false
    })

    return validationResults
  }

  // 获取推荐配置
  getRecommendedConfigs(): ApiConfig[] {
    return Object.entries(MODEL_CONFIGS).map(([modelName, config]) => ({
      modelName: modelName as ModelName,
      apiKey: '',
      enabled: false,
      baseUrl: config.baseUrl,
      timeout: 30000,
      temperature: config.defaultTemperature,
      maxTokens: 2000
    }))
  }
}

// 导出单例实例
export const concurrentOptimizer = new ConcurrentOptimizer()