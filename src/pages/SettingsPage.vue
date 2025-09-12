<template>
  <div class="settings-page w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- 顶部导航 -->
    <div class="header bg-blue-600 text-white p-4 flex items-center justify-between">
      <h1 class="text-lg font-semibold">设置</h1>
      <button @click="goBack" class="flex items-center space-x-2 px-3 py-2 text-white bg-blue-500 hover:bg-blue-700 rounded-lg transition-colors duration-200">
        <i class="i-lucide-arrow-left w-5 h-5"></i>
        <span class="text-sm font-medium">返回</span>
      </button>
    </div>
    
    <!-- 标签页导航 -->
    <div class="tabs flex border-b">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors',
          activeTab === tab.key 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-600 hover:text-gray-900'
        ]"
      >
        <i :class="tab.icon" class="w-4 h-4 mr-2"></i>
        {{ tab.label }}
      </button>
    </div>
    
    <!-- 内容区域 -->
    <div class="content flex-1 p-6 overflow-y-auto">
      <!-- API配置 -->
      <div v-if="activeTab === 'api'" class="api-settings">
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-4">多模型API配置</h2>
          <p class="text-sm text-gray-600 mb-6">配置GLM4.5-air、KimiK2、DeepSeek V3.1等AI模型，用于提示词并发优化</p>
          
          <!-- 模型配置卡片 -->
          <div class="space-y-6">
            <div v-for="config in apiConfigs" :key="config.modelName" class="border rounded-lg p-4">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i class="i-lucide-brain w-4 h-4 text-blue-600"></i>
                  </div>
                  <div>
                    <h3 class="font-medium">{{ getModelDisplayName(config.modelName) }}</h3>
                    <p class="text-sm text-gray-500">{{ config.modelName }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span :class="getStatusClass(config.modelName)" class="px-2 py-1 text-xs rounded-full">
                    {{ getStatusText(config.modelName) }}
                  </span>
                  <label class="switch">
                    <input v-model="config.enabled" type="checkbox" @change="saveConfigs" />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
              
              <div v-if="config.enabled" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    API 密钥
                  </label>
                  <div class="flex space-x-2">
                    <input 
                      v-model="config.apiKey" 
                      :type="showApiKeys[config.modelName] ? 'text' : 'password'"
                      :placeholder="`请输入${getModelDisplayName(config.modelName)} API密钥`"
                      class="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      @blur="saveConfigs"
                    />
                    <button 
                      @click="toggleApiKeyVisibility(config.modelName)"
                      class="px-3 py-2 border rounded hover:bg-gray-50"
                    >
                      <i :class="showApiKeys[config.modelName] ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4"></i>
                    </button>
                    <button 
                      @click="testModelConnection(config.modelName)"
                      :disabled="testingModels[config.modelName] || !config.apiKey"
                      class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      <i v-if="testingModels[config.modelName]" class="i-lucide-loader-2 w-4 h-4 animate-spin"></i>
                      <i v-else class="i-lucide-zap w-4 h-4"></i>
                    </button>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      温度参数 ({{ config.temperature }})
                    </label>
                    <input 
                      v-model.number="config.temperature" 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1"
                      class="w-full"
                      @change="saveConfigs"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      超时时间 (秒)
                    </label>
                    <input 
                      v-model.number="config.timeout" 
                      type="number" 
                      min="5" 
                      max="60"
                      class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      @blur="saveConfigs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 全局操作 -->
          <div class="mt-6 flex space-x-2">
            <button @click="testAllConnections" :disabled="testingAll" class="btn-primary">
              <i v-if="testingAll" class="i-lucide-loader-2 w-4 h-4 mr-2 animate-spin"></i>
              <i v-else class="i-lucide-zap w-4 h-4 mr-2"></i>
              {{ testingAll ? '测试中...' : '测试所有连接' }}
            </button>
            <button @click="resetToDefaults" class="btn-secondary">
              <i class="i-lucide-refresh-cw w-4 h-4 mr-2"></i>
              重置为默认
            </button>
          </div>
          
          <div v-if="connectionStatus" :class="connectionStatusClass" class="mt-4 p-3 rounded">
            {{ connectionStatus }}
          </div>
        </div>
      </div>
      
      <!-- 系统设置 -->
      <div v-if="activeTab === 'system'" class="system-settings">
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-4">系统设置</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div>
                <h3 class="font-medium">开机自启动</h3>
                <p class="text-sm text-gray-600">系统启动时自动运行CodingPal</p>
              </div>
              <label class="switch">
                <input v-model="systemSettings.autoStart" type="checkbox" />
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div>
                <h3 class="font-medium">窗口置顶</h3>
                <p class="text-sm text-gray-600">保持窗口始终在最前面</p>
              </div>
              <label class="switch">
                <input v-model="systemSettings.alwaysOnTop" type="checkbox" />
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div>
                <h3 class="font-medium">最小化到系统托盘</h3>
                <p class="text-sm text-gray-600">关闭窗口时最小化到系统托盘</p>
              </div>
              <label class="switch">
                <input v-model="systemSettings.minimizeToTray" type="checkbox" />
                <span class="slider"></span>
              </label>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                监控间隔 (毫秒)
              </label>
              <input 
                v-model.number="systemSettings.monitoringInterval" 
                type="number" 
                min="1000" 
                max="30000" 
                step="1000"
                class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                界面主题
              </label>
              <select 
                v-model="systemSettings.theme" 
                class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="light">浅色主题</option>
                <option value="dark">深色主题</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>
            
            <button @click="saveSystemSettings" :disabled="saving" class="btn-primary">
              <i class="i-lucide-save w-4 h-4 mr-2"></i>
              {{ saving ? '保存中...' : '保存设置' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 关于 -->
      <div v-if="activeTab === 'about'" class="about-section">
        <div class="text-center">
          <div class="mb-4">
            <img src="/imgs/welcome.png" alt="CodingPal" class="w-24 h-18 mx-auto mb-4" />
            <h2 class="text-2xl font-bold text-gray-900">CodingPal</h2>
            <p class="text-gray-600">AI编程助手</p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">版本:</span>
                <span class="ml-2 font-mono">v0.1.0</span>
              </div>
              <div>
                <span class="text-gray-600">构建:</span>
                <span class="ml-2 font-mono">{{ buildDate }}</span>
              </div>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 mb-4">
            专为Windows桌面环境设计的AI编程助手软件，提供实时进程监控、GLM4.5 API集成和智能提示词优化功能。
          </p>
          
          <div class="flex justify-center space-x-2">
            <button class="btn-secondary text-sm">
              <i class="i-lucide-github w-4 h-4 mr-2"></i>
              GitHub
            </button>
            <button class="btn-secondary text-sm">
              <i class="i-lucide-help-circle w-4 h-4 mr-2"></i>
              帮助文档
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { invoke } from '@tauri-apps/api/core'
import { adjustWindowSize, WINDOW_PRESETS } from '../utils/windowManager'
import { storageService } from '../services/storage'
import { concurrentOptimizer } from '../services/concurrent-optimizer'
import { toast } from '../services/toast'
import type { ApiConfig, ModelName, SystemSettings } from '../types/prompt-optimizer'
import { MODEL_CONFIGS } from '../types/prompt-optimizer'

const router = useRouter()

// 响应式数据
const activeTab = ref('api')
const connectionStatus = ref('')
const connectionStatusClass = ref('')
const testingAll = ref(false)

// 标签页配置
const tabs = [
  { key: 'api', label: 'API配置', icon: 'i-lucide-cloud' },
  { key: 'system', label: '系统设置', icon: 'i-lucide-settings' },
  { key: 'about', label: '关于', icon: 'i-lucide-info' }
]

// API配置
const apiConfigs = ref<ApiConfig[]>([])
const showApiKeys = reactive<Record<string, boolean>>({})
const testingModels = reactive<Record<string, boolean>>({})
const modelStatuses = reactive<Record<string, 'online' | 'offline' | 'error' | 'unknown'>>({})
const saving = ref(false)

// 系统设置
const systemSettings = ref<SystemSettings>({
  autoStart: false,
  alwaysOnTop: false,
  minimizeToTray: true,
  monitoringInterval: 5000,
  theme: 'auto'
})

const buildDate = new Date().toLocaleDateString('zh-CN')

// 方法
const goBack = async () => {
  try {
    await adjustWindowSize(WINDOW_PRESETS.MAIN.width, WINDOW_PRESETS.MAIN.height) // 恢复主页窗口大小
  } catch (error) {
    console.error('恢复窗口大小失败:', error)
  }
  router.push('/')
}

// 获取模型显示名称
const getModelDisplayName = (modelName: string): string => {
  return MODEL_CONFIGS[modelName as ModelName]?.displayName || modelName
}

// 获取模型状态样式类
const getStatusClass = (modelName: string): string => {
  const status = modelStatuses[modelName] || 'unknown'
  switch (status) {
    case 'online': return 'bg-green-100 text-green-800'
    case 'offline': return 'bg-red-100 text-red-800'
    case 'error': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// 获取模型状态文本
const getStatusText = (modelName: string): string => {
  const status = modelStatuses[modelName] || 'unknown'
  switch (status) {
    case 'online': return '在线'
    case 'offline': return '离线'
    case 'error': return '错误'
    default: return '未知'
  }
}

// 切换API密钥可见性
const toggleApiKeyVisibility = (modelName: string) => {
  showApiKeys[modelName] = !showApiKeys[modelName]
}

// 加载API配置
const loadApiConfigs = () => {
  apiConfigs.value = storageService.getApiConfigs()
  // 初始化状态
  apiConfigs.value.forEach(config => {
    showApiKeys[config.modelName] = false
    testingModels[config.modelName] = false
    modelStatuses[config.modelName] = 'unknown'
  })
}

// 保存API配置
const saveConfigs = () => {
  try {
    storageService.saveApiConfigs(apiConfigs.value)
    toast.saveSuccess('API配置')
  } catch (error) {
    console.error('保存配置失败:', error)
    toast.error('保存失败，请稍后重试')
  }
}

// 测试单个模型连接
const testModelConnection = async (modelName: string) => {
  const config = apiConfigs.value.find(c => c.modelName === modelName)
  if (!config || !config.apiKey) {
    toast.warning('请先配置API密钥')
    return
  }
  
  testingModels[modelName] = true
  
  try {
    const isValid = await concurrentOptimizer.validateApiKey(config)
    modelStatuses[modelName] = isValid ? 'online' : 'offline'
    
    if (isValid) {
      toast.success(`${getModelDisplayName(modelName)} 连接测试成功`)
    } else {
      toast.error(`${getModelDisplayName(modelName)} 连接测试失败，请检查API密钥`)
    }
  } catch (error) {
    modelStatuses[modelName] = 'error'
    console.error(`${modelName} 连接测试失败:`, error)
    toast.handleApiError(error, `${getModelDisplayName(modelName)} 连接测试`)
  } finally {
    testingModels[modelName] = false
  }
}

// 测试所有连接
const testAllConnections = async () => {
  const enabledConfigs = apiConfigs.value.filter(c => c.enabled && c.apiKey)
  if (enabledConfigs.length === 0) {
    toast.warning('没有可测试的API配置')
    return
  }
  
  testingAll.value = true
  
  try {
    const results = await concurrentOptimizer.validateConfigs(enabledConfigs)
    let successCount = 0
    
    Object.entries(results).forEach(([modelName, isValid]) => {
      modelStatuses[modelName] = isValid ? 'online' : 'offline'
      if (isValid) successCount++
    })
    
    toast.batchOperation(successCount, enabledConfigs.length, 'API连接测试')
  } catch (error) {
    console.error('批量测试失败:', error)
    toast.error('批量测试失败，请稍后重试')
  } finally {
    testingAll.value = false
  }
}

// 重置为默认配置
const resetToDefaults = () => {
  toast.deleteConfirm('所有API配置', () => {
    apiConfigs.value = concurrentOptimizer.getRecommendedConfigs()
    saveConfigs()
    toast.success('API配置已重置为默认值')
  })
}

// 加载系统设置
const loadSettings = () => {
  const savedSettings = storageService.getSystemSettings()
  Object.assign(systemSettings.value, savedSettings)
}

const saveSystemSettings = async () => {
  saving.value = true
  try {
    storageService.saveSystemSettings(systemSettings.value)
    toast.saveSuccess('系统设置')
  } catch (error) {
    console.error('保存系统设置失败:', error)
    toast.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}



// 生命周期
onMounted(async () => {
  try {
    await adjustWindowSize(WINDOW_PRESETS.SETTINGS.width, WINDOW_PRESETS.SETTINGS.height) // 调整设置页面窗口大小
  } catch (error) {
    console.error('调整窗口大小失败:', error)
  }
  loadApiConfigs() // 加载API配置
  loadSettings() // 加载系统设置
})
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 
         transition-colors flex items-center justify-center disabled:opacity-50;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 
         transition-colors flex items-center justify-center disabled:opacity-50;
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
  background-color: #2563eb;
}

input:checked + .slider:before {
  transform: translateX(24px);
}
</style>