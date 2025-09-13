// 多模型提示词优化智能体类型定义

// 模型名称类型
export type ModelName = 'GLM4.5-Air' | 'KimiK2' | 'DeepSeek V3.1' | 'glm-4-air' | 'moonshot-v1-8k' | 'deepseek-chat' | 'glm-4.5-air' | 'kimi-k2'

// 模型配置接口
export interface ModelConfig {
  name: string
  provider: string
  maxTokens: number
  supportedLanguages: string[]
  pricing: { input: number; output: number }
  baseUrl?: string
  defaultTemperature?: number
  displayName?: string
  rateLimit?: number
}

// GLM4.5-Air API接口
export interface GLMRequest {
  model: 'glm-4.5-air'
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  max_tokens?: number
}

export interface GLMResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// KimiK2 API接口
export interface KimiRequest {
  model: 'moonshot-v1-8k'
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  max_tokens?: number
}

export interface KimiResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// DeepSeek V3.1 API接口
export interface DeepSeekRequest {
  model: 'deepseek-chat'
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 优化记录数据模型
export interface OptimizationRecord {
  id: string
  originalPrompt: string
  createdAt: Date
  userLanguage: string
  selectedModels: string[]
  results: ModelResult[]
}

// 优化结果接口
export interface OptimizationResult {
  id: string
  modelName: string
  optimizedPrompt: string
  status: 'success' | 'error' | 'pending'
  responseTime: number
  errorMessage?: string
}

// 聊天完成请求接口
export interface ChatCompletionRequest {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  max_tokens?: number
}

// 聊天完成响应接口
export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 并发优化器接口
export interface ConcurrentOptimizer {
  optimize(prompt: string, configs: ApiConfig[]): Promise<OptimizationResult[]>
  validateApiKey(config: ApiConfig): Promise<boolean>
  getModelStatus(modelName: string): Promise<'online' | 'offline' | 'error'>
  validateConfigs(configs: ApiConfig[]): Promise<Record<string, boolean>>
  getRecommendedConfigs(): ApiConfig[]
}

// 模型结果数据模型
export interface ModelResult {
  id: string
  recordId: string
  modelName: ModelName
  optimizedPrompt: string
  tokensUsed: number
  responseTime: number
  status: 'success' | 'error' | 'pending'
  userRating?: number
  error?: string
}

// API设置数据模型
export interface ApiSettings {
  glmApiKey: string
  kimiApiKey: string
  deepseekApiKey: string
  modelParameters: {
    temperature: number
    maxTokens: number
    systemPrompt: string
  }
}

// 用户配置数据模型
export interface UserConfig {
  id: string
  uiPreferences: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    autoSave: boolean
  }
  updatedAt: Date
}

// 存储键名常量
export const STORAGE_KEYS = {
  OPTIMIZATION_HISTORY: 'prompt_optimization_history',
  API_CONFIGS: 'api_configurations',
  API_SETTINGS: 'api_settings',
  USER_PREFERENCES: 'user_preferences'
} as const

// API配置接口
export interface ApiConfig {
  apiKey: string
  baseUrl: string
  timeout: number
  temperature: number
  modelName: ModelName // 模型名称
  enabled: boolean // 是否启用
  maxTokens?: number // 最大令牌数
}

// 用户偏好设置
export interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
  autoSave: boolean
  maxHistoryCount: number
  defaultTemperature: number // 默认温度参数
  maxConcurrentRequests: number // 最大并发请求数
  autoSaveHistory: boolean // 自动保存历史
  showTokenUsage: boolean // 显示token使用量
  preferredModels: string[] // 首选模型列表
}

// 系统设置
export interface SystemSettings {
  version: string
  lastUpdated: string
  features: string[]
  autoStart: boolean // 自动启动设置
  alwaysOnTop: boolean // 窗口置顶
  minimizeToTray: boolean // 最小化到托盘
  monitoringInterval: number // 监控间隔
  theme: string // 主题设置
}

// 提示词历史（兼容旧版本）
export interface PromptHistory extends OptimizationRecord {
  favorite?: boolean // 收藏标记
}

// 模型配置映射
export const MODEL_CONFIGS: Record<ModelName, ModelConfig> = {
  'GLM4.5-Air': {
    name: 'GLM4.5-Air',
    provider: '智谱AI',
    maxTokens: 8192,
    supportedLanguages: ['zh', 'en'],
    pricing: { input: 0.001, output: 0.002 },
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    defaultTemperature: 0.7,
    displayName: 'GLM4.5-Air',
    rateLimit: 60
  },
  'KimiK2': {
    name: 'KimiK2',
    provider: '月之暗面',
    maxTokens: 128000,
    supportedLanguages: ['zh', 'en'],
    pricing: { input: 0.0015, output: 0.003 },
    baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
    defaultTemperature: 0.7,
    displayName: 'KimiK2',
    rateLimit: 60
  },
  'DeepSeek V3.1': {
    name: 'DeepSeek V3.1',
    provider: '深度求索',
    maxTokens: 4096,
    supportedLanguages: ['zh', 'en'],
    pricing: { input: 0.0008, output: 0.0016 },
    baseUrl: 'https://api.deepseek.com/chat/completions',
    defaultTemperature: 0.7,
    displayName: 'DeepSeek V3.1',
    rateLimit: 60
  },
  'glm-4-air': {
    name: 'GLM-4-Air',
    provider: '智谱AI',
    maxTokens: 8192,
    supportedLanguages: ['zh', 'en'],
    pricing: { input: 0.001, output: 0.002 },
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    defaultTemperature: 0.7,
    displayName: 'GLM-4-Air',
    rateLimit: 60
  },
  'moonshot-v1-8k': {
    name: 'Moonshot V1 8K',
    provider: '月之暗面',
    maxTokens: 8192,
    supportedLanguages: ['zh', 'en'],
    pricing: { input: 0.0012, output: 0.0024 },
    baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
    defaultTemperature: 0.7,
    displayName: 'Moonshot V1 8K',
    rateLimit: 60
  },
  'deepseek-chat': {
    name: 'DeepSeek Chat',
    provider: '深度求索',
    maxTokens: 4096,
    supportedLanguages: ['zh', 'en'],
    pricing: { input: 0.0008, output: 0.0016 },
    baseUrl: 'https://api.deepseek.com/chat/completions',
    defaultTemperature: 0.7,
    displayName: 'DeepSeek Chat',
    rateLimit: 60
  },
  'glm-4.5-air': {
    name: 'GLM-4.5-Air',
    provider: '智谱AI',
    maxTokens: 8192,
    supportedLanguages: ['zh', 'en'],
    pricing: { input: 0.001, output: 0.002 },
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    defaultTemperature: 0.7,
    displayName: 'GLM-4.5-Air',
    rateLimit: 60
  },
  'kimi-k2': {
    name: 'Kimi K2',
    provider: '月之暗面',
    maxTokens: 128000,
    supportedLanguages: ['zh', 'en'],
    pricing: { input: 0.0015, output: 0.003 },
    baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
    defaultTemperature: 0.7,
    displayName: 'Kimi K2',
    rateLimit: 60
  }
}

// 优化状态枚举
export enum OptimizationStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

// 页面状态接口
export interface HomePageState {
  inputPrompt: string
  selectedModels: ModelName[]
  isOptimizing: boolean
  results: ModelResult[]
  status: OptimizationStatus
  error?: string
}

export interface SettingsPageState {
  apiSettings: ApiSettings
  testingConnections: Record<ModelName, boolean>
  connectionStatus: Record<ModelName, 'connected' | 'disconnected' | 'testing'>
}

export interface HistoryPageState {
  records: OptimizationRecord[]
  searchQuery: string
  selectedRecord?: OptimizationRecord
  currentPage: number
  totalPages: number
}

// 系统提示词模板
export const SYSTEM_PROMPT = `你是一名专业的提示词优化智能体，专注于提升提示词的质量与精确性。

## 核心能力
1. 意图识别 - 准确理解用户原始提示词的核心诉求
2. 提示词优化 - 根据用户需求对提示词进行专业优化
3. 结果交付 - 严格按照指定格式返回优化结果

## 操作规范
- 仅处理与提示词优化直接相关的工作
- 严格遵循既定输出格式要求
- 使用用户原始语言进行交互`

// 错误类型定义
export interface ApiError {
  code: string
  message: string
  details?: any
}

// 服务接口定义
export interface MultiModelService {
  optimizePrompt(originalPrompt: string, selectedModels: ModelName[]): Promise<ModelResult[]>
  testConnection(modelName: ModelName, apiKey: string): Promise<boolean>
}

export interface ApiKeyService {
  saveApiKeys(settings: ApiSettings): void
  getApiKeys(): ApiSettings | null
  validateApiKey(modelName: ModelName, apiKey: string): boolean
}

export interface HistoryService {
  saveRecord(record: OptimizationRecord): Promise<void>
  getHistory(): OptimizationRecord[]
  deleteRecord(id: string): Promise<void>
  searchRecords(query: string): OptimizationRecord[]
}