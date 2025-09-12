// LocalStorage数据持久化服务
import type { ApiConfig, PromptHistory, UserPreferences, SystemSettings, STORAGE_KEYS } from '../types/prompt-optimizer'
import { concurrentOptimizer } from './concurrent-optimizer'

// 存储服务类
export class StorageService {
  private readonly keys = {
    API_CONFIGS: 'codingpal_api_configs',
    PROMPT_HISTORY: 'codingpal_prompt_history',
    USER_PREFERENCES: 'codingpal_user_preferences',
    SYSTEM_SETTINGS: 'codingpal_system_settings'
  } as const

  // 通用存储方法
  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`存储数据失败 [${key}]:`, error)
    }
  }

  // 通用读取方法
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`读取数据失败 [${key}]:`, error)
      return defaultValue
    }
  }

  // API配置管理
  saveApiConfigs(configs: ApiConfig[]): void {
    this.setItem(this.keys.API_CONFIGS, configs)
  }

  getApiConfigs(): ApiConfig[] {
    const configs = this.getItem<ApiConfig[]>(this.keys.API_CONFIGS, [])
    // 如果没有配置，返回推荐配置
    return configs.length > 0 ? configs : concurrentOptimizer.getRecommendedConfigs()
  }

  updateApiConfig(modelName: string, updates: Partial<ApiConfig>): void {
    const configs = this.getApiConfigs()
    const index = configs.findIndex(c => c.modelName === modelName)
    
    if (index >= 0) {
      configs[index] = { ...configs[index], ...updates }
    } else {
      configs.push({ ...concurrentOptimizer.getRecommendedConfigs().find(c => c.modelName === modelName)!, ...updates })
    }
    
    this.saveApiConfigs(configs)
  }

  // 提示词历史管理
  savePromptHistory(history: PromptHistory[]): void {
    this.setItem(this.keys.PROMPT_HISTORY, history)
  }

  getPromptHistory(): PromptHistory[] {
    return this.getItem<PromptHistory[]>(this.keys.PROMPT_HISTORY, [])
  }

  addPromptHistory(history: PromptHistory): void {
    const histories = this.getPromptHistory()
    histories.unshift(history) // 最新的在前面
    
    // 限制历史记录数量
    if (histories.length > 100) {
      histories.splice(100)
    }
    
    this.savePromptHistory(histories)
  }

  updatePromptHistory(id: string, updates: Partial<PromptHistory>): void {
    const histories = this.getPromptHistory()
    const index = histories.findIndex(h => h.id === id)
    
    if (index >= 0) {
      histories[index] = { ...histories[index], ...updates }
      this.savePromptHistory(histories)
    }
  }

  deletePromptHistory(id: string): void {
    const histories = this.getPromptHistory().filter(h => h.id !== id)
    this.savePromptHistory(histories)
  }

  searchPromptHistory(query: string): PromptHistory[] {
    const histories = this.getPromptHistory()
    const lowerQuery = query.toLowerCase()
    
    return histories.filter(h => 
      h.originalPrompt.toLowerCase().includes(lowerQuery) ||
      h.results.some(r => r.optimizedPrompt.toLowerCase().includes(lowerQuery))
    )
  }

  getFavoriteHistory(): PromptHistory[] {
    return this.getPromptHistory().filter(h => h.favorite)
  }

  // 用户偏好设置管理
  saveUserPreferences(preferences: UserPreferences): void {
    this.setItem(this.keys.USER_PREFERENCES, preferences)
  }

  getUserPreferences(): UserPreferences {
    return this.getItem<UserPreferences>(this.keys.USER_PREFERENCES, {
      theme: 'light',
      language: 'zh',
      autoSave: true,
      maxHistoryCount: 100,
      defaultTemperature: 0.7,
      maxConcurrentRequests: 3,
      autoSaveHistory: true,
      showTokenUsage: true,
      preferredModels: ['glm-4-air', 'moonshot-v1-8k', 'deepseek-chat']
    })
  }

  updateUserPreferences(updates: Partial<UserPreferences>): void {
    const preferences = this.getUserPreferences()
    this.saveUserPreferences({ ...preferences, ...updates })
  }

  // 系统设置管理
  saveSystemSettings(settings: SystemSettings): void {
    this.setItem(this.keys.SYSTEM_SETTINGS, settings)
  }

  getSystemSettings(): SystemSettings {
    return this.getItem<SystemSettings>(this.keys.SYSTEM_SETTINGS, {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      features: ['optimization', 'history', 'settings'],
      autoStart: false,
      alwaysOnTop: false,
      minimizeToTray: true,
      monitoringInterval: 5000,
      theme: 'auto'
    })
  }

  updateSystemSettings(updates: Partial<SystemSettings>): void {
    const settings = this.getSystemSettings()
    this.saveSystemSettings({ ...settings, ...updates })
  }

  // 数据导出
  exportData(): { configs: ApiConfig[], history: PromptHistory[], preferences: UserPreferences } {
    return {
      configs: this.getApiConfigs(),
      history: this.getPromptHistory(),
      preferences: this.getUserPreferences()
    }
  }

  // 数据导入
  importData(data: { configs?: ApiConfig[], history?: PromptHistory[], preferences?: UserPreferences }): void {
    if (data.configs) this.saveApiConfigs(data.configs)
    if (data.history) this.savePromptHistory(data.history)
    if (data.preferences) this.saveUserPreferences(data.preferences)
  }

  // 清除所有数据
  clearAllData(): void {
    Object.values(this.keys).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  // 获取存储使用情况
  getStorageInfo(): { used: number, total: number, percentage: number } {
    let used = 0
    Object.values(this.keys).forEach(key => {
      const item = localStorage.getItem(key)
      if (item) used += item.length
    })
    
    const total = 5 * 1024 * 1024 // 5MB 估算
    return {
      used,
      total,
      percentage: Math.round((used / total) * 100)
    }
  }
}

// 导出单例实例
export const storageService = new StorageService()