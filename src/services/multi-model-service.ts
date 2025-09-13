// 多模型API服务层
import axios, { type AxiosInstance } from 'axios'
import type {
  ModelName, ModelResult, GLMRequest, GLMResponse,
  KimiRequest, KimiResponse, DeepSeekRequest, DeepSeekResponse,
  MultiModelService as IMultiModelService, ApiError, OptimizationRecord
} from '../types/prompt-optimizer'
import { MODEL_CONFIGS, SYSTEM_PROMPT } from '../types/prompt-optimizer'

// 基础API客户端类
class BaseApiClient {
  protected client: AxiosInstance
  protected modelName: ModelName

  constructor(modelName: ModelName, apiKey: string) {
    this.modelName = modelName
    const config = MODEL_CONFIGS[modelName]
    
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    })
  }

  protected generateId(): string {
    return `${this.modelName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  protected handleError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        code: error.code || 'NETWORK_ERROR',
        message: error.response?.data?.message || error.message || '网络请求失败',
        details: error.response?.data
      }
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || '未知错误',
      details: error
    }
  }
}

// GLM4.5-Air API客户端
class GLMApiClient extends BaseApiClient {
  async optimizePrompt(originalPrompt: string, temperature = 0.7): Promise<ModelResult> {
    const startTime = Date.now()
    
    try {
      const request: GLMRequest = {
        model: 'glm-4.5-air',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `请优化以下提示词：\n\n${originalPrompt}` }
        ],
        temperature,
        max_tokens: 2000
      }

      const response = await this.client.post<GLMResponse>('', request)
      const responseTime = Date.now() - startTime
      const optimizedPrompt = response.data.choices[0]?.message?.content || ''
      const tokensUsed = response.data.usage?.total_tokens || 0

      return {
        id: this.generateId(),
        recordId: '',
        modelName: this.modelName,
        optimizedPrompt,
        tokensUsed,
        responseTime,
        status: 'success'
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      const apiError = this.handleError(error)
      
      return {
        id: this.generateId(),
        recordId: '',
        modelName: this.modelName,
        optimizedPrompt: '',
        tokensUsed: 0,
        responseTime,
        error: `${apiError.code}: ${apiError.message}`,
        status: 'error'
      }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const request: GLMRequest = {
        model: 'glm-4.5-air',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      }
      await this.client.post('', request)
      return true
    } catch {
      return false
    }
  }
}

// KimiK2 API客户端
class KimiApiClient extends BaseApiClient {
  async optimizePrompt(originalPrompt: string, temperature = 0.3): Promise<ModelResult> {
    const startTime = Date.now()
    
    try {
      const request: KimiRequest = {
        model: 'moonshot-v1-8k',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `请优化以下提示词：\n\n${originalPrompt}` }
        ],
        temperature,
        max_tokens: 2000
      }

      const response = await this.client.post<KimiResponse>('', request)
      const responseTime = Date.now() - startTime
      const optimizedPrompt = response.data.choices[0]?.message?.content || ''
      const tokensUsed = response.data.usage?.total_tokens || 0

      return {
        id: this.generateId(),
        recordId: '',
        modelName: this.modelName,
        optimizedPrompt,
        tokensUsed,
        responseTime,
        status: 'success'
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      const apiError = this.handleError(error)
      
      return {
        id: this.generateId(),
        recordId: '',
        modelName: this.modelName,
        optimizedPrompt: '',
        tokensUsed: 0,
        responseTime,
        error: `${apiError.code}: ${apiError.message}`,
        status: 'error'
      }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const request: KimiRequest = {
        model: 'moonshot-v1-8k',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      }
      await this.client.post('', request)
      return true
    } catch {
      return false
    }
  }
}

// DeepSeek V3.1 API客户端
class DeepSeekApiClient extends BaseApiClient {
  async optimizePrompt(originalPrompt: string, temperature = 0.5): Promise<ModelResult> {
    const startTime = Date.now()
    
    try {
      const request: DeepSeekRequest = {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `请优化以下提示词：\n\n${originalPrompt}` }
        ],
        temperature,
        max_tokens: 2000,
        stream: false
      }

      const response = await this.client.post<DeepSeekResponse>('', request)
      const responseTime = Date.now() - startTime
      const optimizedPrompt = response.data.choices[0]?.message?.content || ''
      const tokensUsed = response.data.usage?.total_tokens || 0

      return {
        id: this.generateId(),
        recordId: '',
        modelName: this.modelName,
        optimizedPrompt,
        tokensUsed,
        responseTime,
        status: 'success'
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      const apiError = this.handleError(error)
      
      return {
        id: this.generateId(),
        recordId: '',
        modelName: this.modelName,
        optimizedPrompt: '',
        tokensUsed: 0,
        responseTime,
        error: `${apiError.code}: ${apiError.message}`,
        status: 'error'
      }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const request: DeepSeekRequest = {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      }
      await this.client.post('', request)
      return true
    } catch {
      return false
    }
  }
}

// 多模型服务实现类
export class MultiModelService implements IMultiModelService {
  private clients: Map<ModelName, BaseApiClient> = new Map()

  // 设置API密钥并初始化客户端
  setApiKeys(apiKeys: Record<ModelName, string>): void {
    Object.entries(apiKeys).forEach(([modelName, apiKey]) => {
      if (apiKey) {
        this.initializeClient(modelName as ModelName, apiKey)
      }
    })
  }

  private initializeClient(modelName: ModelName, apiKey: string): void {
    switch (modelName) {
      case 'GLM4.5-Air':
      case 'glm-4.5-air':
        this.clients.set(modelName, new GLMApiClient(modelName, apiKey))
        break
      case 'KimiK2':
      case 'kimi-k2':
        this.clients.set(modelName, new KimiApiClient(modelName, apiKey))
        break
      case 'DeepSeek V3.1':
      case 'deepseek-chat':
        this.clients.set(modelName, new DeepSeekApiClient(modelName, apiKey))
        break
    }
  }

  // 并发优化提示词
  async optimizePrompt(originalPrompt: string, selectedModels: ModelName[]): Promise<ModelResult[]> {
    if (!originalPrompt.trim()) {
      throw new Error('提示词不能为空')
    }

    if (selectedModels.length === 0) {
      throw new Error('请至少选择一个模型')
    }

    const promises = selectedModels.map(async (model) => {
      const startTime = Date.now()
      try {
        const client = this.clients.get(model)
        if (!client) {
          throw new Error(`模型 ${model} 未配置或不可用`)
        }

        const result = await (client as any).optimizePrompt(originalPrompt)
        const responseTime = Date.now() - startTime

        return {
           id: result.id || `${model}_${Date.now()}`,
           recordId: result.recordId || '',
           modelName: model,
           optimizedPrompt: result.optimizedPrompt,
           tokensUsed: result.tokensUsed,
           responseTime,
           status: 'success' as const
         }
      } catch (error) {
        const responseTime = Date.now() - startTime
        return {
           id: `${model}_${Date.now()}_error`,
           recordId: '',
           modelName: model,
           optimizedPrompt: '',
           tokensUsed: 0,
           responseTime,
           status: 'error' as const,
           error: error instanceof Error ? error.message : '未知错误'
         }
      }
    })

    const results = await Promise.allSettled(promises)
    const modelResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
           id: `${selectedModels[index]}_${Date.now()}_error`,
           recordId: '',
           modelName: selectedModels[index],
           optimizedPrompt: '',
           tokensUsed: 0,
           responseTime: 0,
           status: 'error' as const,
           error: result.reason?.message || '优化失败'
         }
      }
    })
    
    return modelResults
  }

  // 测试连接
  async testConnection(modelName: ModelName, apiKey: string): Promise<boolean> {
    try {
      this.initializeClient(modelName, apiKey)
      const client = this.clients.get(modelName)
      return client ? await (client as any).testConnection() : false
    } catch {
      return false
    }
  }

  // 批量测试连接
  async testAllConnections(apiKeys: Record<ModelName, string>): Promise<Record<ModelName, boolean>> {
    const results: Record<ModelName, boolean> = {} as any
    
    const promises = Object.entries(apiKeys).map(async ([modelName, apiKey]) => {
      if (apiKey) {
        results[modelName as ModelName] = await this.testConnection(modelName as ModelName, apiKey)
      } else {
        results[modelName as ModelName] = false
      }
    })

    await Promise.allSettled(promises)
    return results
  }
}

// 导出单例实例
export const multiModelService = new MultiModelService()