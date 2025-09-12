// 多模型API并发提示词优化服务类型定义

// 支持的AI模型类型
export type ModelName = 'glm-4-air' | 'moonshot-v1-8k' | 'deepseek-chat'

// API配置接口
export interface ApiConfig {
  modelName: ModelName
  apiKey: string
  enabled: boolean
  baseUrl: string
  timeout: number // 毫秒
  temperature: number
  maxTokens?: number
}

// 提示词历史记录接口
export interface PromptHistory {
  id: string
  originalPrompt: string
  createdAt: Date
  favorite: boolean
  results: OptimizationResult[]
}

// 优化结果接口
export interface OptimizationResult {
  id: string
  modelName: string
  optimizedPrompt: string
  responseTime: number
  status: 'success' | 'error' | 'timeout'
  errorMessage?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// 并发优化器接口
export interface ConcurrentOptimizer {
  optimize(prompt: string, configs: ApiConfig[]): Promise<OptimizationResult[]>
  validateApiKey(config: ApiConfig): Promise<boolean>
  getModelStatus(modelName: string): Promise<'online' | 'offline' | 'error'>
}

// 提示词模板接口
export interface PromptTemplate {
  id: string
  name: string
  content: string
  category: string
  description: string
}

// 用户偏好设置接口
export interface UserPreferences {
  defaultTemperature: number
  maxConcurrentRequests: number
  autoSaveHistory: boolean
  showTokenUsage: boolean
  preferredModels: string[]
}

// 系统设置接口
export interface SystemSettings {
  autoStart: boolean
  alwaysOnTop: boolean
  minimizeToTray: boolean
  monitoringInterval: number
  theme: 'light' | 'dark' | 'auto'
}

// LocalStorage键名常量
export const STORAGE_KEYS = {
  API_CONFIGS: 'codingpal_api_configs',
  PROMPT_HISTORY: 'codingpal_prompt_history',
  USER_PREFERENCES: 'codingpal_user_preferences'
} as const

// API请求消息接口
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// API请求接口
export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
}

// API响应接口
export interface ChatCompletionResponse {
  choices: {
    message: {
      content: string
    }
  }[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: string
}

// 模型配置映射
export const MODEL_CONFIGS = {
  'glm-4-air': {
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    defaultTemperature: 0.7,
    displayName: 'GLM4.5-air'
  },
  'moonshot-v1-8k': {
    baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
    defaultTemperature: 0.3,
    displayName: 'KimiK2'
  },
  'deepseek-chat': {
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    defaultTemperature: 0.5,
    displayName: 'DeepSeek V3.1'
  }
} as const

// 优化状态枚举
export enum OptimizationStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

// 页面状态接口
export interface OptimizerPageState {
  inputPrompt: string
  isOptimizing: boolean
  results: OptimizationResult[]
  selectedResult?: OptimizationResult
  error?: string
}

// 设置页面状态接口
export interface SettingsPageState {
  configs: ApiConfig[]
  testingModel?: string
  testResults: Record<string, boolean>
}