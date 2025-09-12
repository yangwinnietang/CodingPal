// API密钥管理服务
import type { ApiSettings, ModelName, ApiKeyService as IApiKeyService, ApiConfig } from '../types/prompt-optimizer'
import { STORAGE_KEYS } from '../types/prompt-optimizer'
import { multiModelService } from './multi-model-service'

// 简单的加密/解密工具类
class CryptoUtil {
  private static readonly SECRET_KEY = 'codingpal_secret_2024' // 实际项目中应使用环境变量

  // 简单的XOR加密
  static encrypt(text: string): string {
    if (!text) return ''
    
    let result = ''
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ this.SECRET_KEY.charCodeAt(i % this.SECRET_KEY.length)
      result += String.fromCharCode(charCode)
    }
    return btoa(result) // Base64编码
  }

  // 简单的XOR解密
  static decrypt(encryptedText: string): string {
    if (!encryptedText) return ''
    
    try {
      const decoded = atob(encryptedText) // Base64解码
      let result = ''
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ this.SECRET_KEY.charCodeAt(i % this.SECRET_KEY.length)
        result += String.fromCharCode(charCode)
      }
      return result
    } catch {
      return ''
    }
  }
}

// API密钥管理服务实现类
export class ApiKeyService implements IApiKeyService {
  // 保存API密钥
  saveApiKeys(settings: ApiSettings): void {
    try {
      const encryptedSettings = {
        glmApiKey: CryptoUtil.encrypt(settings.glmApiKey),
        kimiApiKey: CryptoUtil.encrypt(settings.kimiApiKey),
        deepseekApiKey: CryptoUtil.encrypt(settings.deepseekApiKey),
        modelParameters: settings.modelParameters
      }
      
      localStorage.setItem(STORAGE_KEYS.API_SETTINGS, JSON.stringify(encryptedSettings))
      
      // 更新多模型服务的API密钥
      multiModelService.setApiKeys({
        'GLM4.5-Air': settings.glmApiKey,
        'KimiK2': settings.kimiApiKey,
        'DeepSeek V3.1': settings.deepseekApiKey,
        'glm-4-air': settings.glmApiKey,
        'moonshot-v1-8k': settings.kimiApiKey,
        'deepseek-chat': settings.deepseekApiKey,
        'glm-4.5-air': settings.glmApiKey,
        'kimi-k2': settings.kimiApiKey
      })
    } catch (error) {
      console.error('保存API密钥失败:', error)
      throw new Error('保存API密钥失败')
    }
  }

  // 获取API密钥
  getApiKeys(): ApiSettings | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.API_SETTINGS)
      if (!stored) return null

      const encryptedSettings = JSON.parse(stored)
      return {
        glmApiKey: CryptoUtil.decrypt(encryptedSettings.glmApiKey || ''),
        kimiApiKey: CryptoUtil.decrypt(encryptedSettings.kimiApiKey || ''),
        deepseekApiKey: CryptoUtil.decrypt(encryptedSettings.deepseekApiKey || ''),
        modelParameters: encryptedSettings.modelParameters || {
          temperature: 0.7,
          maxTokens: 2000,
          systemPrompt: ''
        }
      }
    } catch (error) {
      console.error('获取API密钥失败:', error)
      return null
    }
  }

  // 验证API密钥格式
  validateApiKey(modelName: ModelName, apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') return false
    
    // 基本格式验证
    switch (modelName) {
      case 'GLM4.5-Air':
        return apiKey.length > 10 && /^[a-zA-Z0-9._-]+$/.test(apiKey)
      case 'KimiK2':
        return apiKey.startsWith('sk-') && apiKey.length > 20
      case 'DeepSeek V3.1':
        return apiKey.startsWith('sk-') && apiKey.length > 20
      default:
        return false
    }
  }

  // 测试API密钥连接
  async testApiKey(modelName: ModelName, apiKey: string): Promise<boolean> {
    if (!this.validateApiKey(modelName, apiKey)) {
      return false
    }

    try {
      return await multiModelService.testConnection(modelName, apiKey)
    } catch {
      return false
    }
  }

  // 批量测试所有API密钥
  async testAllApiKeys(settings: ApiSettings): Promise<Record<ModelName, boolean>> {
    const results: Record<ModelName, boolean> = {
      'GLM4.5-Air': false,
      'KimiK2': false,
      'DeepSeek V3.1': false,
      'glm-4-air': false,
      'moonshot-v1-8k': false,
      'deepseek-chat': false,
      'glm-4.5-air': false,
      'kimi-k2': false
    }

    const testPromises = [
      this.testApiKey('GLM4.5-Air', settings.glmApiKey),
      this.testApiKey('KimiK2', settings.kimiApiKey),
      this.testApiKey('DeepSeek V3.1', settings.deepseekApiKey)
    ]

    try {
      const testResults = await Promise.allSettled(testPromises)
      results['GLM4.5-Air'] = testResults[0].status === 'fulfilled' ? testResults[0].value : false
      results['KimiK2'] = testResults[1].status === 'fulfilled' ? testResults[1].value : false
      results['DeepSeek V3.1'] = testResults[2].status === 'fulfilled' ? testResults[2].value : false
    } catch (error) {
      console.error('批量测试API密钥失败:', error)
    }

    return results
  }

  // 清除所有API密钥
  clearApiKeys(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.API_SETTINGS)
    } catch (error) {
      console.error('清除API密钥失败:', error)
    }
  }

  // 检查是否已配置API密钥
  hasApiKeys(): boolean {
    const settings = this.getApiKeys()
    return !!(settings && (settings.glmApiKey || settings.kimiApiKey || settings.deepseekApiKey))
  }

  // 获取已配置的模型列表
  getConfiguredModels(): ModelName[] {
    const settings = this.getApiKeys()
    if (!settings) return []

    const configuredModels: ModelName[] = []
    if (settings.glmApiKey) configuredModels.push('GLM4.5-Air')
    if (settings.kimiApiKey) configuredModels.push('KimiK2')
    if (settings.deepseekApiKey) configuredModels.push('DeepSeek V3.1')
    
    return configuredModels
  }

  // 初始化服务（在应用启动时调用）
  initialize(): void {
    const settings = this.getApiKeys()
    if (settings) {
      // 初始化多模型服务
      multiModelService.setApiKeys({
        'GLM4.5-Air': settings.glmApiKey,
        'KimiK2': settings.kimiApiKey,
        'DeepSeek V3.1': settings.deepseekApiKey,
        'glm-4-air': settings.glmApiKey,
        'moonshot-v1-8k': settings.kimiApiKey,
        'deepseek-chat': settings.deepseekApiKey,
        'glm-4.5-air': settings.glmApiKey,
        'kimi-k2': settings.kimiApiKey
      })
    }
  }

  // 更新单个模型的API密钥
  updateModelApiKey(modelName: ModelName, apiKey: string): void {
    const currentSettings = this.getApiKeys() || {
      glmApiKey: '',
      kimiApiKey: '',
      deepseekApiKey: '',
      modelParameters: {
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: ''
      }
    }

    switch (modelName) {
      case 'GLM4.5-Air':
        currentSettings.glmApiKey = apiKey
        break
      case 'KimiK2':
        currentSettings.kimiApiKey = apiKey
        break
      case 'DeepSeek V3.1':
        currentSettings.deepseekApiKey = apiKey
        break
    }

    this.saveApiKeys(currentSettings)
  }

  // 获取模型参数
  getModelParameters() {
    const settings = this.getApiKeys()
    return settings?.modelParameters || {
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: ''
    }
  }

  // 更新模型参数
  updateModelParameters(parameters: ApiSettings['modelParameters']): void {
    const currentSettings = this.getApiKeys() || {
      glmApiKey: '',
      kimiApiKey: '',
      deepseekApiKey: '',
      modelParameters: parameters
    }

    currentSettings.modelParameters = parameters
    this.saveApiKeys(currentSettings)
  }

  // 获取API配置
  async getApiConfig(model: ModelName): Promise<ApiConfig | null> {
    // 从存储中获取配置
    const settings = this.getApiKeys()
    if (!settings) return null
    
    // 根据模型名称返回对应配置
    switch (model) {
      case 'GLM4.5-Air':
      case 'glm-4-air':
      case 'glm-4.5-air':
        return {
          apiKey: settings.glmApiKey,
          baseUrl: 'https://open.bigmodel.cn/api/paas/v4/',
          timeout: 30000,
          temperature: settings.modelParameters.temperature,
          modelName: model,
          enabled: !!settings.glmApiKey
        }
      case 'KimiK2':
      case 'moonshot-v1-8k':
      case 'kimi-k2':
        return {
          apiKey: settings.kimiApiKey,
          baseUrl: 'https://api.moonshot.cn/v1/',
          timeout: 30000,
          temperature: settings.modelParameters.temperature,
          modelName: model,
          enabled: !!settings.kimiApiKey
        }
      case 'DeepSeek V3.1':
      case 'deepseek-chat':
        return {
          apiKey: settings.deepseekApiKey,
          baseUrl: 'https://api.deepseek.com/v1/',
          timeout: 30000,
          temperature: settings.modelParameters.temperature,
          modelName: model,
          enabled: !!settings.deepseekApiKey
        }
      default:
        return null
    }
  }

  // 保存API配置
  async saveApiConfig(model: ModelName, config: ApiConfig): Promise<void> {
    const currentSettings = this.getApiKeys() || {
      glmApiKey: '',
      kimiApiKey: '',
      deepseekApiKey: '',
      modelParameters: {
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: ''
      }
    }
    
    // 根据模型名称更新对应的API密钥
    switch (model) {
      case 'GLM4.5-Air':
      case 'glm-4-air':
      case 'glm-4.5-air':
        currentSettings.glmApiKey = config.apiKey
        break
      case 'KimiK2':
      case 'moonshot-v1-8k':
      case 'kimi-k2':
        currentSettings.kimiApiKey = config.apiKey
        break
      case 'DeepSeek V3.1':
      case 'deepseek-chat':
        currentSettings.deepseekApiKey = config.apiKey
        break
    }
    
    // 更新温度参数
    currentSettings.modelParameters.temperature = config.temperature
    
    // 保存设置
    this.saveApiKeys(currentSettings)
  }

  // 获取所有API配置
  async getAllConfigs(): Promise<Record<ModelName, ApiConfig>> {
    const configs: Record<ModelName, ApiConfig> = {} as any
    const modelNames: ModelName[] = ['GLM4.5-Air', 'KimiK2', 'DeepSeek V3.1']
    for (const model of modelNames) {
      const config = await this.getApiConfig(model)
      if (config) {
        configs[model] = config
      }
    }
    return configs
  }
}

// 导出单例实例
export const apiKeyService = new ApiKeyService()