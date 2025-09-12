// API客户端服务
import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type { ApiConfig, ChatCompletionRequest, ChatCompletionResponse, ModelName } from '../types/prompt-optimizer'
import { MODEL_CONFIGS } from '../types/prompt-optimizer'

// HTTP客户端类
export class ApiClient {
  private client: AxiosInstance

  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      }
    })
  }

  // 发送聊天完成请求
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const response: AxiosResponse<ChatCompletionResponse> = await this.client.post('', request)
      return response.data
    } catch (error) {
      throw new Error(`API调用失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 测试API连接
  async testConnection(): Promise<boolean> {
    try {
      const testRequest: ChatCompletionRequest = {
        model: 'test',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      }
      await this.client.post('', testRequest)
      return true
    } catch {
      return false
    }
  }
}

// GLM4.5-air API客户端
export class GLMApiClient extends ApiClient {
  constructor(apiKey: string) {
    super({
      modelName: 'glm-4-air',
      apiKey,
      enabled: true,
      baseUrl: MODEL_CONFIGS['glm-4-air'].baseUrl,
      timeout: 30000,
      temperature: MODEL_CONFIGS['glm-4-air'].defaultTemperature
    })
  }

  async optimizePrompt(prompt: string, temperature = 0.7): Promise<string> {
    const request: ChatCompletionRequest = {
      model: 'glm-4-air',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的提示词优化专家，请优化用户的提示词，使其更加清晰、具体和有效。'
        },
        { role: 'user', content: prompt }
      ],
      temperature
    }
    const response = await this.chatCompletion(request)
    return response.choices[0]?.message?.content || ''
  }
}

// KimiK2 API客户端
export class KimiApiClient extends ApiClient {
  constructor(apiKey: string) {
    super({
      modelName: 'moonshot-v1-8k',
      apiKey,
      enabled: true,
      baseUrl: MODEL_CONFIGS['moonshot-v1-8k'].baseUrl,
      timeout: 30000,
      temperature: MODEL_CONFIGS['moonshot-v1-8k'].defaultTemperature
    })
  }

  async optimizePrompt(prompt: string, temperature = 0.3): Promise<string> {
    const request: ChatCompletionRequest = {
      model: 'moonshot-v1-8k',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的提示词优化专家，请优化用户的提示词，使其更加清晰、具体和有效。'
        },
        { role: 'user', content: prompt }
      ],
      temperature
    }
    const response = await this.chatCompletion(request)
    return response.choices[0]?.message?.content || ''
  }
}

// DeepSeek V3.1 API客户端
export class DeepSeekApiClient extends ApiClient {
  constructor(apiKey: string) {
    super({
      modelName: 'deepseek-chat',
      apiKey,
      enabled: true,
      baseUrl: MODEL_CONFIGS['deepseek-chat'].baseUrl,
      timeout: 30000,
      temperature: MODEL_CONFIGS['deepseek-chat'].defaultTemperature
    })
  }

  async optimizePrompt(prompt: string, temperature = 0.5): Promise<string> {
    const request: ChatCompletionRequest = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的提示词优化专家，请优化用户的提示词，使其更加清晰、具体和有效。'
        },
        { role: 'user', content: prompt }
      ],
      temperature
    }
    const response = await this.chatCompletion(request)
    return response.choices[0]?.message?.content || ''
  }
}

// API客户端工厂
export class ApiClientFactory {
  static createClient(modelName: ModelName, apiKey: string): ApiClient {
    switch (modelName) {
      case 'glm-4-air':
        return new GLMApiClient(apiKey)
      case 'moonshot-v1-8k':
        return new KimiApiClient(apiKey)
      case 'deepseek-chat':
        return new DeepSeekApiClient(apiKey)
      default:
        throw new Error(`不支持的模型: ${modelName}`)
    }
  }

  // 验证API密钥
  static async validateApiKey(config: ApiConfig): Promise<boolean> {
    try {
      const client = this.createClient(config.modelName, config.apiKey)
      return await client.testConnection()
    } catch {
      return false
    }
  }
}