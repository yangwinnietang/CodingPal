<template>
  <div class="settings-page w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- 顶部导航 -->
    <div class="header bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <i class="i-lucide-settings w-5 h-5"></i>
        </div>
        <h1 class="text-lg font-semibold">设置</h1>
      </div>
      <button @click="goBack" class="flex items-center space-x-2 px-3 py-2 text-white bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200">
        <i class="i-lucide-arrow-left w-5 h-5"></i>
        <span class="text-sm font-medium">返回</span>
      </button>
    </div>
    
    <!-- 标签页导航 -->
    <div class="tabs flex border-b bg-gray-50">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'px-6 py-3 text-sm font-medium transition-all duration-200 flex items-center space-x-2',
          activeTab === tab.key 
            ? 'border-b-2 border-blue-600 text-blue-600 bg-white' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        ]"
      >
        <i :class="tab.icon" class="w-4 h-4"></i>
        <span>{{ tab.label }}</span>
      </button>
    </div>
    
    <!-- 内容区域 -->
    <div class="content flex-1 p-6 overflow-y-auto">
      <!-- API配置 -->
      <div v-if="activeTab === 'api'" class="api-settings">
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-2">多模型API配置</h2>
          <p class="text-gray-600 mb-6">配置GLM4.5-Air、KimiK2、DeepSeek V3.1等AI模型的API密钥，用于提示词并发优化</p>
          
          <!-- 模型配置卡片 -->
          <div class="space-y-6">
            <div v-for="modelName in modelNames" :key="modelName" class="border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <i class="i-lucide-brain w-5 h-5 text-white"></i>
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg">{{ MODEL_CONFIGS[modelName].displayName }}</h3>
                    <p class="text-sm text-gray-500">{{ MODEL_CONFIGS[modelName].rateLimit }} RPM · 温度 {{ MODEL_CONFIGS[modelName].defaultTemperature }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <span :class="getConnectionStatusClass(modelName)" class="px-3 py-1 text-xs font-medium rounded-full">
                    {{ getConnectionStatusText(modelName) }}
                  </span>
                </div>
              </div>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    API 密钥
                  </label>
                  <div class="flex space-x-2">
                    <div class="flex-1 relative">
                      <input 
                        :value="getApiKey(modelName)"
                        @input="updateApiKey(modelName, ($event.target as HTMLInputElement).value)"
                        :type="showApiKeys[modelName] ? 'text' : 'password'"
                        :placeholder="getApiKeyPlaceholder(modelName)"
                        class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                      />
                      <button 
                        @click="toggleApiKeyVisibility(modelName)"
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <i :class="showApiKeys[modelName] ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4"></i>
                      </button>
                    </div>
                    <button 
                      @click="testConnection(modelName)"
                      :disabled="pageState.testingConnections[modelName] || !getApiKey(modelName)"
                      class="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      :title="'测试 ' + MODEL_CONFIGS[modelName].displayName + ' 连接'"
                    >
                      <i v-if="pageState.testingConnections[modelName]" class="i-lucide-loader-2 w-4 h-4 animate-spin"></i>
                      <i v-else class="i-lucide-zap w-4 h-4"></i>
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">请从官方平台获取API密钥，密钥将被加密存储</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 模型参数配置 -->
          <div class="mt-8 border rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4">模型参数</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  温度参数 ({{ modelParameters.temperature }})
                </label>
                <input 
                  v-model.number="modelParameters.temperature" 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  @change="saveModelParameters"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>保守 (0.0)</span>
                  <span>创新 (1.0)</span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  最大令牌数
                </label>
                <input 
                  v-model.number="modelParameters.maxTokens" 
                  type="number" 
                  min="100" 
                  max="4000"
                  step="100"
                  class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  @blur="saveModelParameters"
                />
              </div>
            </div>
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                系统提示词
              </label>
              <textarea 
                v-model="modelParameters.systemPrompt" 
                rows="3"
                placeholder="自定义系统提示词（留空使用默认）"
                class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                @blur="saveModelParameters"
              ></textarea>
            </div>
          </div>
          
          <!-- 全局操作 -->
          <div class="mt-8 flex flex-wrap gap-3">
            <button @click="testAllConnections" :disabled="isTestingAll" class="btn-primary">
              <i v-if="isTestingAll" class="i-lucide-loader-2 w-4 h-4 mr-2 animate-spin"></i>
              <i v-else class="i-lucide-zap w-4 h-4 mr-2"></i>
              {{ isTestingAll ? '测试中...' : '测试所有连接' }}
            </button>
            <button @click="resetApiSettings" class="btn-secondary">
              <i class="i-lucide-refresh-cw w-4 h-4 mr-2"></i>
              重置API设置
            </button>
            <button @click="exportSettings" class="btn-secondary">
              <i class="i-lucide-download w-4 h-4 mr-2"></i>
              导出配置
            </button>
            <button @click="importSettings" class="btn-secondary">
              <i class="i-lucide-upload w-4 h-4 mr-2"></i>
              导入配置
            </button>
          </div>
          
          <!-- 连接状态提示 -->
          <div v-if="connectionMessage" :class="connectionMessageClass" class="mt-6 p-4 rounded-lg">
            <div class="flex items-center">
              <i :class="connectionMessageIcon" class="w-5 h-5 mr-3"></i>
              <span>{{ connectionMessage }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 用户偏好 -->
      <div v-if="activeTab === 'preferences'" class="preferences-settings">
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-2">用户偏好</h2>
          <p class="text-gray-600 mb-6">个性化您的使用体验</p>
          
          <div class="space-y-6">
            <div class="border rounded-xl p-6">
              <h3 class="text-lg font-semibold mb-4">界面设置</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium">主题模式</h4>
                    <p class="text-sm text-gray-600">选择您偏好的界面主题</p>
                  </div>
                  <select v-model="userPreferences.theme" @change="saveUserPreferences" class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="light">浅色</option>
                    <option value="dark">深色</option>
                    <option value="auto">跟随系统</option>
                  </select>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium">语言</h4>
                    <p class="text-sm text-gray-600">界面显示语言</p>
                  </div>
                  <select v-model="userPreferences.language" @change="saveUserPreferences" class="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English</option>
                  </select>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium">自动保存</h4>
                    <p class="text-sm text-gray-600">自动保存优化结果到历史记录</p>
                  </div>
                  <label class="switch">
                    <input v-model="userPreferences.autoSave" type="checkbox" @change="saveUserPreferences" />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 关于 -->
      <div v-if="activeTab === 'about'" class="about-settings">
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-2">关于</h2>
          <p class="text-gray-600 mb-6">多模型提示词优化智能体</p>
          
          <div class="space-y-6">
            <div class="border rounded-xl p-6 text-center">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="i-lucide-sparkles w-8 h-8 text-white"></i>
              </div>
              <h3 class="text-xl font-semibold mb-2">CodingPal</h3>
              <p class="text-gray-600 mb-4">多模型提示词优化智能体</p>
              <p class="text-sm text-gray-500">版本 1.0.0</p>
            </div>
            
            <div class="border rounded-xl p-6">
              <h3 class="text-lg font-semibold mb-4">支持的模型</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="modelName in modelNames" :key="modelName" class="text-center p-4 bg-gray-50 rounded-lg">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i class="i-lucide-brain w-4 h-4 text-blue-600"></i>
                  </div>
                  <h4 class="font-medium">{{ MODEL_CONFIGS[modelName].displayName }}</h4>
                  <p class="text-xs text-gray-500 mt-1">{{ MODEL_CONFIGS[modelName].rateLimit }} RPM</p>
                </div>
              </div>
            </div>
            
            <div class="border rounded-xl p-6">
              <h3 class="text-lg font-semibold mb-4">功能特性</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-start space-x-3">
                  <i class="i-lucide-zap w-5 h-5 text-blue-600 mt-0.5"></i>
                  <div>
                    <h4 class="font-medium">并发优化</h4>
                    <p class="text-sm text-gray-600">同时调用多个AI模型进行提示词优化</p>
                  </div>
                </div>
                <div class="flex items-start space-x-3">
                  <i class="i-lucide-shield w-5 h-5 text-green-600 mt-0.5"></i>
                  <div>
                    <h4 class="font-medium">安全存储</h4>
                    <p class="text-sm text-gray-600">API密钥加密存储，保护您的隐私</p>
                  </div>
                </div>
                <div class="flex items-start space-x-3">
                  <i class="i-lucide-history w-5 h-5 text-purple-600 mt-0.5"></i>
                  <div>
                    <h4 class="font-medium">历史记录</h4>
                    <p class="text-sm text-gray-600">自动保存优化历史，支持搜索和导出</p>
                  </div>
                </div>
                <div class="flex items-start space-x-3">
                  <i class="i-lucide-star w-5 h-5 text-yellow-600 mt-0.5"></i>
                  <div>
                    <h4 class="font-medium">智能评分</h4>
                    <p class="text-sm text-gray-600">对优化结果进行评分，持续改进</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { adjustWindowSize, WINDOW_PRESETS } from '../utils/windowManager'
import { apiKeyService } from '../services/api-key-service'
import { multiModelService } from '../services/multi-model-service'
import { toast } from '../services/toast'
import type { ModelName, SettingsPageState, ApiSettings, UserConfig } from '../types/prompt-optimizer'
import { MODEL_CONFIGS, STORAGE_KEYS } from '../types/prompt-optimizer'

const router = useRouter()

// 页面状态
const pageState = reactive<SettingsPageState>({
  apiSettings: {
    glmApiKey: '',
    kimiApiKey: '',
    deepseekApiKey: '',
    modelParameters: {
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: ''
    }
  },
  testingConnections: {
    'GLM4.5-Air': false,
    'KimiK2': false,
    'DeepSeek V3.1': false,
    'glm-4-air': false,
    'moonshot-v1-8k': false,
    'deepseek-chat': false,
    'glm-4.5-air': false,
    'kimi-k2': false
  },
  connectionStatus: {
    'GLM4.5-Air': 'disconnected',
    'KimiK2': 'disconnected',
    'DeepSeek V3.1': 'disconnected',
    'glm-4-air': 'disconnected',
    'moonshot-v1-8k': 'disconnected',
    'deepseek-chat': 'disconnected',
    'glm-4.5-air': 'disconnected',
    'kimi-k2': 'disconnected'
  }
})

// 响应式数据
const activeTab = ref('api')
const showApiKeys = reactive<Record<ModelName, boolean>>({
  'GLM4.5-Air': false,
  'KimiK2': false,
  'DeepSeek V3.1': false,
  'glm-4-air': false,
  'moonshot-v1-8k': false,
  'deepseek-chat': false,
  'glm-4.5-air': false,
  'kimi-k2': false
})
const connectionMessage = ref('')
const connectionMessageClass = ref('')
const connectionMessageIcon = ref('')

// 用户偏好
const userPreferences = reactive({
  theme: 'light' as 'light' | 'dark' | 'auto',
  language: 'zh-CN',
  autoSave: true
})

// 模型参数（从pageState中提取，便于双向绑定）
const modelParameters = computed({
  get: () => pageState.apiSettings.modelParameters,
  set: (value) => {
    pageState.apiSettings.modelParameters = value
  }
})

// 标签页配置
const tabs = [
  { key: 'api', label: 'API配置', icon: 'i-lucide-key' },
  { key: 'preferences', label: '用户偏好', icon: 'i-lucide-user' },
  { key: 'about', label: '关于', icon: 'i-lucide-info' }
]

// 模型名称列表
const modelNames: ModelName[] = ['glm-4.5-air', 'kimi-k2', 'deepseek-chat']

// 计算属性
const isTestingAll = computed(() => {
  return Object.values(pageState.testingConnections).some(testing => testing)
})

// 方法
const goBack = () => {
  router.push('/')
}

const getApiKey = (modelName: ModelName): string => {
  switch (modelName) {
    case 'glm-4.5-air': return pageState.apiSettings.glmApiKey
    case 'kimi-k2': return pageState.apiSettings.kimiApiKey
    case 'deepseek-chat': return pageState.apiSettings.deepseekApiKey
    default: return ''
  }
}

const updateApiKey = (modelName: ModelName, value: string) => {
  switch (modelName) {
    case 'glm-4.5-air':
      pageState.apiSettings.glmApiKey = value
      break
    case 'kimi-k2':
      pageState.apiSettings.kimiApiKey = value
      break
    case 'deepseek-chat':
      pageState.apiSettings.deepseekApiKey = value
      break
  }
  saveApiSettings()
}

const getApiKeyPlaceholder = (modelName: ModelName): string => {
  switch (modelName) {
    case 'glm-4.5-air': return '请输入智谱AI API密钥'
    case 'kimi-k2': return '请输入月之暗面 API密钥 (sk-...)'
    case 'deepseek-chat': return '请输入DeepSeek API密钥 (sk-...)'
    default: return '请输入API密钥'
  }
}

const toggleApiKeyVisibility = (modelName: ModelName) => {
  showApiKeys[modelName] = !showApiKeys[modelName]
}

const getConnectionStatusClass = (modelName: ModelName): string => {
  const status = pageState.connectionStatus[modelName]
  switch (status) {
    case 'connected': return 'bg-green-100 text-green-800'
    case 'testing': return 'bg-yellow-100 text-yellow-800'
    case 'disconnected': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getConnectionStatusText = (modelName: ModelName): string => {
  const status = pageState.connectionStatus[modelName]
  switch (status) {
    case 'connected': return '已连接'
    case 'testing': return '测试中'
    case 'disconnected': return '未连接'
    default: return '未知'
  }
}

const testConnection = async (modelName: ModelName) => {
  const apiKey = getApiKey(modelName)
  if (!apiKey) {
    toast.error('请先输入API密钥')
    return
  }

  pageState.testingConnections[modelName] = true
  pageState.connectionStatus[modelName] = 'testing'

  try {
    const isConnected = await multiModelService.testConnection(modelName, apiKey)
    pageState.connectionStatus[modelName] = isConnected ? 'connected' : 'disconnected'
    
    // 保存连接状态到localStorage
    localStorage.setItem('api_connection_status', JSON.stringify(pageState.connectionStatus))
    
    if (isConnected) {
      toast.success(`${MODEL_CONFIGS[modelName].displayName} 连接成功`)
    } else {
      toast.error(`${MODEL_CONFIGS[modelName].displayName} 连接失败`)
    }
  } catch (error) {
    pageState.connectionStatus[modelName] = 'disconnected'
    // 保存连接状态到localStorage
    localStorage.setItem('api_connection_status', JSON.stringify(pageState.connectionStatus))
    toast.error(`${MODEL_CONFIGS[modelName].displayName} 连接测试失败`)
  } finally {
    pageState.testingConnections[modelName] = false
  }
}

const testAllConnections = async () => {
  const apiKeys = {
    'glm-4.5-air': pageState.apiSettings.glmApiKey,
    'kimi-k2': pageState.apiSettings.kimiApiKey,
    'deepseek-chat': pageState.apiSettings.deepseekApiKey
  }

  // 只测试有API密钥的模型
  const modelsToTest = modelNames.filter(modelName => apiKeys[modelName])
  
  if (modelsToTest.length === 0) {
    toast.error('请先配置至少一个API密钥')
    return
  }

  // 并发测试所有连接
  const testPromises = modelsToTest.map(modelName => testConnection(modelName))
  await Promise.allSettled(testPromises)

  // 显示总体结果
  const connectedCount = modelsToTest.filter(modelName => 
    pageState.connectionStatus[modelName] === 'connected'
  ).length
  
  connectionMessage.value = `连接测试完成：${connectedCount}/${modelsToTest.length} 个模型连接成功`
  connectionMessageClass.value = connectedCount === modelsToTest.length 
    ? 'bg-green-50 text-green-800 border border-green-200' 
    : connectedCount > 0 
    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
    : 'bg-red-50 text-red-800 border border-red-200'
  connectionMessageIcon.value = connectedCount === modelsToTest.length 
    ? 'i-lucide-check-circle' 
    : connectedCount > 0 
    ? 'i-lucide-alert-circle'
    : 'i-lucide-x-circle'
    
  // 3秒后清除消息
  setTimeout(() => {
    connectionMessage.value = ''
  }, 3000)
}

const saveApiSettings = () => {
  try {
    apiKeyService.saveApiKeys(pageState.apiSettings)
  } catch (error) {
    toast.error('保存API设置失败')
  }
}

const saveModelParameters = () => {
  try {
    apiKeyService.updateModelParameters(pageState.apiSettings.modelParameters)
    toast.success('模型参数已保存')
  } catch (error) {
    toast.error('保存模型参数失败')
  }
}

const saveUserPreferences = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(userPreferences))
    toast.success('用户偏好已保存')
  } catch (error) {
    toast.error('保存用户偏好失败')
  }
}

const resetApiSettings = () => {
  if (confirm('确定要重置所有API设置吗？此操作不可撤销。')) {
    pageState.apiSettings = {
      glmApiKey: '',
      kimiApiKey: '',
      deepseekApiKey: '',
      modelParameters: {
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: ''
      }
    }
    
    // 重置连接状态
    modelNames.forEach(modelName => {
      pageState.connectionStatus[modelName] = 'disconnected'
    })
    
    apiKeyService.clearApiKeys()
    toast.success('API设置已重置')
  }
}

const exportSettings = () => {
  try {
    const settings = {
      apiSettings: pageState.apiSettings,
      userPreferences,
      exportTime: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `codingpal-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('设置已导出')
  } catch (error) {
    toast.error('导出设置失败')
  }
}

const importSettings = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string)
        
        if (settings.apiSettings) {
          pageState.apiSettings = { ...pageState.apiSettings, ...settings.apiSettings }
          saveApiSettings()
        }
        
        if (settings.userPreferences) {
          Object.assign(userPreferences, settings.userPreferences)
          saveUserPreferences()
        }
        
        toast.success('设置已导入')
      } catch (error) {
        toast.error('导入设置失败：文件格式不正确')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

const loadSettings = () => {
  // 加载API设置
  const apiSettings = apiKeyService.getApiKeys()
  if (apiSettings) {
    pageState.apiSettings = apiSettings
  }
  
  // 加载用户偏好
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
    if (stored) {
      Object.assign(userPreferences, JSON.parse(stored))
    }
  } catch (error) {
    console.error('加载用户偏好失败:', error)
  }
  
  // 加载API连接状态
  try {
    const connectionStatus = localStorage.getItem('api_connection_status')
    if (connectionStatus) {
      Object.assign(pageState.connectionStatus, JSON.parse(connectionStatus))
    }
  } catch (error) {
    console.error('加载连接状态失败:', error)
  }
}

// 生命周期
onMounted(() => {
  // 调整窗口大小
  adjustWindowSize(WINDOW_PRESETS.SETTINGS.width, WINDOW_PRESETS.SETTINGS.height)
  
  // 加载设置
  loadSettings()
  
  // 清除连接消息
  setTimeout(() => {
    connectionMessage.value = ''
  }, 100)
})

// 页面卸载时自动保存连接状态
onBeforeUnmount(() => {
  try {
    localStorage.setItem('api_connection_status', JSON.stringify(pageState.connectionStatus))
  } catch (error) {
    console.error('保存连接状态失败:', error)
  }
})
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #3b82f6;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.settings-page {
  min-height: calc(100vh - 2rem);
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
}
</style>