<template>
  <div class="gesture-page min-h-screen bg-gray-50 p-6">
    <!-- 顶部导航 -->
    <div class="top-nav flex items-center justify-between mb-6">
      <div class="flex items-center space-x-4">
        <button @click="goBack" class="back-btn flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
          <i class="i-lucide-arrow-left w-5 h-5 text-gray-600"></i>
          <span class="text-gray-700">返回</span>
        </button>
        <h1 class="text-2xl font-bold text-gray-800">手势识别</h1>
      </div>
      <div class="nav-tabs flex space-x-2">
        <button @click="activeTab = 'detection'" :class="tabClass('detection')">实时检测</button>
        <button @click="activeTab = 'config'" :class="tabClass('config')">配置设置</button>
        <button @click="activeTab = 'history'" :class="tabClass('history')">历史记录</button>
      </div>
    </div>

    <!-- 实时检测页面 -->
    <div v-if="activeTab === 'detection'" class="detection-content">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 摄像头预览区域 -->
        <div class="lg:col-span-2">
          <div class="camera-container bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-800">摄像头预览</h2>
              <div class="controls flex space-x-2">
                <button @click="toggleCamera" :class="cameraButtonClass">
                  <i :class="cameraIcon" class="w-4 h-4"></i>
                  <span>{{ cameraButtonText }}</span>
                </button>
              </div>
            </div>
            <div class="camera-wrapper relative bg-gray-900 rounded-lg overflow-hidden" style="aspect-ratio: 4/3;">
              <video ref="videoRef" class="w-full h-full object-cover" autoplay muted></video>
              <canvas ref="canvasRef" class="absolute inset-0 w-full h-full pointer-events-none"></canvas>
              <div v-if="!isCameraActive" class="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                <div class="text-center text-white">
                  <i class="i-lucide-camera-off w-12 h-12 mx-auto mb-2 opacity-50"></i>
                  <p class="text-sm opacity-75">点击开启摄像头开始检测</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 检测结果区域 -->
        <div class="detection-results space-y-4">
          <!-- 当前手势 -->
          <div class="result-card bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">当前手势</h3>
            <div class="gesture-display text-center">
              <div class="gesture-icon text-6xl mb-2">{{ currentGestureIcon }}</div>
              <div class="gesture-name text-xl font-bold text-blue-600 mb-2">{{ currentGestureName }}</div>
              <div class="confidence-bar bg-gray-200 rounded-full h-2 mb-2">
                <div class="confidence-fill bg-blue-500 h-2 rounded-full transition-all duration-300" :style="{ width: confidence + '%' }"></div>
              </div>
              <div class="confidence-text text-sm text-gray-600">置信度: {{ confidence.toFixed(1) }}%</div>
            </div>
          </div>

          <!-- 检测状态 -->
          <div class="status-card bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">检测状态</h3>
            <div class="status-items space-y-3">
              <div class="status-item flex items-center justify-between">
                <span class="text-gray-600">摄像头状态</span>
                <span :class="cameraStatusClass">{{ cameraStatusText }}</span>
              </div>
              <div class="status-item flex items-center justify-between">
                <span class="text-gray-600">检测引擎</span>
                <span :class="engineStatusClass">{{ engineStatusText }}</span>
              </div>
              <div class="status-item flex items-center justify-between">
                <span class="text-gray-600">帧率</span>
                <span class="text-blue-600 font-medium">{{ fps }} FPS</span>
              </div>
            </div>
          </div>

          <!-- 支持的手势 -->
          <div class="gestures-card bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">支持的手势</h3>
            <div class="gestures-grid grid grid-cols-3 gap-2">
              <div v-for="gesture in supportedGestures" :key="gesture.type" class="gesture-item text-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="text-2xl mb-1">{{ gesture.icon }}</div>
                <div class="text-xs text-gray-600">{{ gesture.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 配置设置页面 -->
    <div v-if="activeTab === 'config'" class="config-content">
      <div class="max-w-2xl mx-auto">
        <div class="config-card bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-6">检测配置</h2>
          <div class="config-items space-y-6">
            <div class="config-item">
              <label class="block text-sm font-medium text-gray-700 mb-2">检测阈值</label>
              <input v-model="config.threshold" type="range" min="0.1" max="1" step="0.1" class="w-full">
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1</span>
                <span class="font-medium">{{ config.threshold }}</span>
                <span>1.0</span>
              </div>
            </div>
            <div class="config-item">
              <label class="block text-sm font-medium text-gray-700 mb-2">检测帧率</label>
              <select v-model="config.fps" class="w-full p-2 border border-gray-300 rounded-lg">
                <option value="15">15 FPS</option>
                <option value="30">30 FPS</option>
                <option value="60">60 FPS</option>
              </select>
            </div>
            <div class="config-item">
              <label class="block text-sm font-medium text-gray-700 mb-2">摄像头分辨率</label>
              <select v-model="config.resolution" class="w-full p-2 border border-gray-300 rounded-lg">
                <option value="640x480">640x480</option>
                <option value="1280x720">1280x720</option>
                <option value="1920x1080">1920x1080</option>
              </select>
            </div>
          </div>
          <div class="mt-6 flex space-x-4">
            <button @click="saveConfig" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">保存配置</button>
            <button @click="resetConfig" class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">重置默认</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录页面 -->
    <div v-if="activeTab === 'history'" class="history-content">
      <div class="history-card bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">识别历史</h2>
        <div class="history-list space-y-3">
          <div v-for="record in historyRecords" :key="record.id" class="history-item flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-4">
              <div class="text-2xl">{{ record.icon }}</div>
              <div>
                <div class="font-medium text-gray-800">{{ record.gesture }}</div>
                <div class="text-sm text-gray-600">{{ record.timestamp }}</div>
              </div>
            </div>
            <div class="text-sm text-gray-600">{{ record.confidence }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Hands, type Results } from '@mediapipe/hands'
import { Camera } from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { invoke } from '@tauri-apps/api/core'
import type { GestureConfig, GestureRecord, SupportedGesture } from '@/types/gesture'
import { recognizeGesture, GestureSmoothing } from '@/utils/gestureRecognition'
import { GESTURE_CONFIG } from '@/types/gesture'

const router = useRouter()

// 响应式数据
const activeTab = ref('detection')
const isCameraActive = ref(false)
const isEngineReady = ref(false)
const currentGesture = ref('none')
const confidence = ref(0)
const fps = ref(0)

// DOM引用
const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()

// MediaPipe实例
let hands: Hands | null = null
let camera: Camera | null = null
let gestureSmoothing = new GestureSmoothing()

// 配置
const config = ref<GestureConfig>({
  threshold: GESTURE_CONFIG.DEFAULT_THRESHOLD,
  fps: GESTURE_CONFIG.DEFAULT_FPS,
  resolution: GESTURE_CONFIG.DEFAULT_RESOLUTION
})

// 支持的手势类型
const supportedGestures: SupportedGesture[] = [
  { type: 'fist', name: '握拳', icon: '✊' },
  { type: 'five', name: '张开', icon: '✋' },
  { type: 'gun', name: '手枪', icon: '👉' },
  { type: 'love', name: '爱心', icon: '💖' },
  { type: 'one', name: '食指', icon: '☝️' },
  { type: 'six', name: '六', icon: '🤙' },
  { type: 'three', name: '三', icon: '✌️' },
  { type: 'thumbup', name: '点赞', icon: '👍' },
  { type: 'yeah', name: '耶', icon: '✌️' }
]

// 历史记录
const historyRecords = ref<GestureRecord[]>([
  { id: 1, gesture: '点赞', icon: '👍', confidence: 95.2, timestamp: '2024-01-15 14:30:25' },
  { id: 2, gesture: '握拳', icon: '✊', confidence: 88.7, timestamp: '2024-01-15 14:29:18' },
  { id: 3, gesture: '张开', icon: '✋', confidence: 92.1, timestamp: '2024-01-15 14:28:45' }
])

// 计算属性
const currentGestureIcon = computed(() => {
  const gesture = supportedGestures.find(g => g.type === currentGesture.value)
  return gesture ? gesture.icon : '❓'
})

const currentGestureName = computed(() => {
  const gesture = supportedGestures.find(g => g.type === currentGesture.value)
  return gesture ? gesture.name : '未识别'
})

const tabClass = (tab: string) => {
  const baseClass = 'px-4 py-2 rounded-lg font-medium transition-colors'
  return activeTab.value === tab 
    ? `${baseClass} bg-blue-600 text-white`
    : `${baseClass} bg-white text-gray-600 hover:bg-gray-50`
}

const cameraButtonClass = computed(() => {
  const baseClass = 'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors'
  return isCameraActive.value
    ? `${baseClass} bg-red-600 text-white hover:bg-red-700`
    : `${baseClass} bg-blue-600 text-white hover:bg-blue-700`
})

const cameraIcon = computed(() => {
  return isCameraActive.value ? 'i-lucide-camera-off' : 'i-lucide-camera'
})

const cameraButtonText = computed(() => {
  return isCameraActive.value ? '关闭摄像头' : '开启摄像头'
})

const cameraStatusClass = computed(() => {
  return isCameraActive.value ? 'text-green-600 font-medium' : 'text-red-600 font-medium'
})

const cameraStatusText = computed(() => {
  return isCameraActive.value ? '已连接' : '未连接'
})

const engineStatusClass = computed(() => {
  return isEngineReady.value ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'
})

const engineStatusText = computed(() => {
  return isEngineReady.value ? '就绪' : '加载中'
})

// 方法
const goBack = () => {
  router.push('/')
}

const toggleCamera = async () => {
  if (isCameraActive.value) {
    stopCamera()
  } else {
    await startCamera()
  }
}

const startCamera = async () => {
  try {
    if (!videoRef.value || !canvasRef.value) return
    
    // 初始化MediaPipe Hands
    hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    })
    
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: config.value.threshold,
      minTrackingConfidence: 0.5
    })
    
    hands.onResults(onResults)
    
    // 初始化摄像头
    camera = new Camera(videoRef.value, {
      onFrame: async () => {
        if (hands && videoRef.value) {
          await hands.send({ image: videoRef.value })
        }
      },
      width: 640,
      height: 480
    })
    
    await camera.start()
    isCameraActive.value = true
    isEngineReady.value = true
    
  } catch (error) {
    console.error('启动摄像头失败:', error)
  }
}

const stopCamera = () => {
  if (camera) {
    camera.stop()
    camera = null
  }
  if (hands) {
    hands.close()
    hands = null
  }
  isCameraActive.value = false
  isEngineReady.value = false
  currentGesture.value = 'none'
  confidence.value = 0
}

const onResults = (results: Results) => {
  if (!canvasRef.value) return
  
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')!
  
  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      // 绘制关键点和连接线 - 使用MediaPipe的连接定义
      const connections = [
        [0,1],[1,2],[2,3],[3,4], // 拇指
        [0,5],[5,6],[6,7],[7,8], // 食指
        [0,9],[9,10],[10,11],[11,12], // 中指
        [0,13],[13,14],[14,15],[15,16], // 无名指
        [0,17],[17,18],[18,19],[19,20], // 小指
        [5,9],[9,13],[13,17] // 手掌连接
      ]
      
      // 绘制连接线
      ctx.strokeStyle = '#00FF00'
      ctx.lineWidth = 2
      for (const [start, end] of connections) {
        const startPoint = landmarks[start]
        const endPoint = landmarks[end]
        ctx.beginPath()
        ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height)
        ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height)
        ctx.stroke()
      }
      
      // 绘制关键点
      ctx.fillStyle = '#FF0000'
      for (const landmark of landmarks) {
        ctx.beginPath()
        ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 3, 0, 2 * Math.PI)
        ctx.fill()
      }
      
      // 识别手势
      const gestureResult = recognizeGesture(landmarks)
      const smoothedGesture = gestureSmoothing.smooth(gestureResult)
      
      if (smoothedGesture) {
        currentGesture.value = smoothedGesture.type
        confidence.value = smoothedGesture.confidence * 100
        
        // 记录到历史
        if (smoothedGesture.confidence > config.value.threshold) {
          addToHistory(smoothedGesture)
        }
      }
    }
  }
  
  // 更新FPS
  updateFPS()
}

// 手势识别现在使用外部工具函数

const addToHistory = async (gesture: any) => {
  try {
    // 保存到数据库
    await invoke('save_gesture_record', {
      gestureType: gesture.type,
      confidence: gesture.confidence,
      keypoints: null, // 可以后续添加关键点数据
      frameWidth: null,
      frameHeight: null
    })
    
    // 更新本地显示
    const newRecord = {
      id: Date.now(),
      gesture: currentGestureName.value,
      icon: currentGestureIcon.value,
      confidence: Math.round(gesture.confidence * 100),
      timestamp: new Date().toLocaleString('zh-CN')
    }
    
    historyRecords.value.unshift(newRecord)
    if (historyRecords.value.length > 50) {
      historyRecords.value = historyRecords.value.slice(0, 50)
    }
  } catch (error) {
    console.error('保存手势记录失败:', error)
  }
}

let lastTime = Date.now()
let frameCount = 0

const updateFPS = () => {
  frameCount++
  const now = Date.now()
  if (now - lastTime >= 1000) {
    fps.value = frameCount
    frameCount = 0
    lastTime = now
  }
}

const saveConfig = async () => {
  try {
    // 保存到本地存储
    localStorage.setItem('gestureConfig', JSON.stringify(config.value))
    
    // 保存到数据库
    for (const gesture of supportedGestures) {
      await invoke('update_gesture_config', {
        config: {
          id: null,
          name: gesture.name,
          gesture_type: gesture.type,
          threshold: config.value.threshold,
          enabled: true
        }
      })
    }
    
    // 更新MediaPipe配置
    if (hands) {
      hands.setOptions({
        minDetectionConfidence: config.value.threshold
      })
    }
    
    console.log('配置保存成功')
  } catch (error) {
    console.error('保存配置失败:', error)
  }
}

const resetConfig = () => {
  config.value = {
    threshold: GESTURE_CONFIG.DEFAULT_THRESHOLD,
    fps: GESTURE_CONFIG.DEFAULT_FPS,
    resolution: GESTURE_CONFIG.DEFAULT_RESOLUTION
  }
}

// 加载手势配置
const loadGestureConfigs = async () => {
  try {
    const configs = await invoke('get_gesture_configs')
    console.log('加载的手势配置:', configs)
  } catch (error) {
    console.error('加载手势配置失败:', error)
  }
}

// 加载历史记录
const loadGestureHistory = async () => {
  try {
    const history = await invoke('get_gesture_history', {
      limit: 20,
      offset: 0
    })
    console.log('加载的历史记录:', history)
    // 可以更新historyRecords.value
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 生命周期
onMounted(async () => {
  // 加载保存的配置
  const savedConfig = localStorage.getItem('gestureConfig')
  if (savedConfig) {
    config.value = JSON.parse(savedConfig)
  }
  
  // 设置canvas尺寸
  if (canvasRef.value) {
    canvasRef.value.width = 640
    canvasRef.value.height = 480
  }
  
  // 加载数据库中的配置和历史记录
  await loadGestureConfigs()
  await loadGestureHistory()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
/* 自定义样式 */
.gesture-page {
  font-family: 'Inter', system-ui, sans-serif;
}

.camera-wrapper {
  position: relative;
  background: #1a1a1a;
}

.confidence-fill {
  transition: width 0.3s ease;
}

.gesture-item:hover {
  transform: translateY(-2px);
}

.history-item {
  transition: all 0.2s ease;
}

.history-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 滑块样式 */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style>