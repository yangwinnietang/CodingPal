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
          <h2 class="text-lg font-semibold mb-4">GLM4.5 API 配置</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                API 密钥
              </label>
              <div class="flex space-x-2">
                <input 
                  v-model="apiSettings.apiKey" 
                  :type="showApiKey ? 'text' : 'password'"
                  placeholder="请输入GLM4.5 API密钥"
                  class="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button 
                  @click="showApiKey = !showApiKey"
                  class="px-3 py-2 border rounded hover:bg-gray-50"
                >
                  <i :class="showApiKey ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                模型选择
              </label>
              <select 
                v-model="apiSettings.model" 
                class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="glm-4-plus">GLM-4-Plus</option>
                <option value="glm-4">GLM-4</option>
                <option value="glm-3-turbo">GLM-3-Turbo</option>
              </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  温度参数 ({{ apiSettings.temperature }})
                </label>
                <input 
                  v-model.number="apiSettings.temperature" 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  最大Token数
                </label>
                <input 
                  v-model.number="apiSettings.maxTokens" 
                  type="number" 
                  min="100" 
                  max="4000"
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div class="flex space-x-2">
              <button @click="testConnection" :disabled="testing" class="btn-primary">
                <i class="i-lucide-zap w-4 h-4 mr-2"></i>
                {{ testing ? '测试中...' : '测试连接' }}
              </button>
              <button @click="saveApiSettings" :disabled="saving" class="btn-secondary">
                <i class="i-lucide-save w-4 h-4 mr-2"></i>
                {{ saving ? '保存中...' : '保存设置' }}
              </button>
            </div>
            
            <div v-if="connectionStatus" :class="connectionStatusClass" class="p-3 rounded">
              {{ connectionStatus }}
            </div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { invoke } from '@tauri-apps/api/core'
import { adjustWindowSize, WINDOW_PRESETS } from '../utils/windowManager'

const router = useRouter()

// 响应式数据
const activeTab = ref('api')
const showApiKey = ref(false)
const testing = ref(false)
const saving = ref(false)
const connectionStatus = ref('')
const connectionStatusClass = ref('')

// 标签页配置
const tabs = [
  { key: 'api', label: 'API配置', icon: 'i-lucide-cloud' },
  { key: 'system', label: '系统设置', icon: 'i-lucide-settings' },
  { key: 'about', label: '关于', icon: 'i-lucide-info' }
]

// API设置
const apiSettings = ref({
  apiKey: '',
  model: 'glm-4-plus',
  temperature: 0.7,
  maxTokens: 2048
})

// 系统设置
const systemSettings = ref({
  autoStart: false,
  alwaysOnTop: true,
  minimizeToTray: true,
  monitoringInterval: 5000,
  theme: 'light'
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

const loadSettings = async () => {
  try {
    // 加载API设置
    const apiKey = await invoke('get_setting', { key: 'glm_api_key' })
    if (apiKey) apiSettings.value.apiKey = apiKey as string
    
    // 加载系统设置
    const autoStart = await invoke('get_setting', { key: 'auto_start' })
    if (autoStart) systemSettings.value.autoStart = autoStart === 'true'
    
    const alwaysOnTop = await invoke('get_setting', { key: 'window_always_on_top' })
    if (alwaysOnTop) systemSettings.value.alwaysOnTop = alwaysOnTop === 'true'
    
    const interval = await invoke('get_setting', { key: 'monitoring_interval' })
    if (interval) systemSettings.value.monitoringInterval = parseInt(interval as string)
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

const testConnection = async () => {
  if (!apiSettings.value.apiKey.trim()) {
    connectionStatus.value = '请先输入API密钥'
    connectionStatusClass.value = 'bg-red-100 text-red-800'
    return
  }
  
  testing.value = true
  connectionStatus.value = ''
  
  try {
    const result = await invoke('initialize_glm_client', { 
      apiKey: apiSettings.value.apiKey 
    })
    
    if (result) {
      connectionStatus.value = 'API连接测试成功！'
      connectionStatusClass.value = 'bg-green-100 text-green-800'
    } else {
      connectionStatus.value = 'API连接测试失败，请检查密钥是否正确'
      connectionStatusClass.value = 'bg-red-100 text-red-800'
    }
  } catch (error) {
    connectionStatus.value = `连接失败: ${error}`
    connectionStatusClass.value = 'bg-red-100 text-red-800'
  } finally {
    testing.value = false
  }
}

const saveApiSettings = async () => {
  saving.value = true
  
  try {
    await invoke('set_setting', { key: 'glm_api_key', value: apiSettings.value.apiKey })
    await invoke('set_setting', { key: 'glm_model', value: apiSettings.value.model })
    await invoke('set_setting', { key: 'glm_temperature', value: apiSettings.value.temperature.toString() })
    await invoke('set_setting', { key: 'glm_max_tokens', value: apiSettings.value.maxTokens.toString() })
    
    connectionStatus.value = 'API设置保存成功！'
    connectionStatusClass.value = 'bg-green-100 text-green-800'
  } catch (error) {
    connectionStatus.value = `保存失败: ${error}`
    connectionStatusClass.value = 'bg-red-100 text-red-800'
  } finally {
    saving.value = false
  }
}

const saveSystemSettings = async () => {
  saving.value = true
  
  try {
    await invoke('set_setting', { key: 'auto_start', value: systemSettings.value.autoStart.toString() })
    await invoke('set_setting', { key: 'window_always_on_top', value: systemSettings.value.alwaysOnTop.toString() })
    await invoke('set_setting', { key: 'minimize_to_tray', value: systemSettings.value.minimizeToTray.toString() })
    await invoke('set_setting', { key: 'monitoring_interval', value: systemSettings.value.monitoringInterval.toString() })
    await invoke('set_setting', { key: 'theme', value: systemSettings.value.theme })
    
    connectionStatus.value = '系统设置保存成功！'
    connectionStatusClass.value = 'bg-green-100 text-green-800'
  } catch (error) {
    connectionStatus.value = `保存失败: ${error}`
    connectionStatusClass.value = 'bg-red-100 text-red-800'
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
  loadSettings()
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