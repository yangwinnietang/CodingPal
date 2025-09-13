<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>手势识别</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleCamera" :disabled="!hasPermission">
            <ion-icon :icon="cameraOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="gesture-content">
      <!-- 摄像头预览区域 -->
      <div class="camera-section">
        <div class="camera-container" :class="{ active: isCameraActive }">
          <video 
            ref="videoRef" 
            class="camera-video"
            autoplay 
            muted 
            playsinline
          ></video>
          
          <canvas 
            ref="canvasRef" 
            class="gesture-canvas"
          ></canvas>
          
          <!-- 摄像头控制 -->
          <div class="camera-controls">
            <ion-button 
              v-if="!isCameraActive" 
              @click="startCamera"
              color="primary"
              class="start-btn"
            >
              <ion-icon :icon="playOutline" slot="start"></ion-icon>
              开始识别
            </ion-button>
            
            <ion-button 
              v-else
              @click="stopCamera"
              color="danger"
              class="stop-btn"
            >
              <ion-icon :icon="stopOutline" slot="start"></ion-icon>
              停止识别
            </ion-button>
            
            <ion-button 
              v-if="isCameraActive"
              @click="switchCamera"
              fill="outline"
              class="switch-btn"
            >
              <ion-icon :icon="cameraReverseOutline"></ion-icon>
            </ion-button>
          </div>
        </div>
      </div>
      
      <!-- 识别结果区域 -->
      <div class="result-section">
        <ion-card class="result-card">
          <ion-card-header>
            <ion-card-title>识别结果</ion-card-title>
          </ion-card-header>
          
          <ion-card-content>
            <div class="gesture-result">
              <div class="gesture-name">{{ currentGesture || '未识别' }}</div>
              <div class="gesture-confidence">置信度: {{ (confidence * 100).toFixed(1) }}%</div>
            </div>
            
            <ion-progress-bar 
              :value="confidence" 
              color="primary"
              class="confidence-bar"
            ></ion-progress-bar>
          </ion-card-content>
        </ion-card>
      </div>
      
      <!-- 手势列表 -->
      <div class="gestures-section">
        <ion-card class="gestures-card">
          <ion-card-header>
            <ion-card-title>支持的手势</ion-card-title>
          </ion-card-header>
          
          <ion-card-content>
            <div class="gestures-grid">
              <div 
                v-for="gesture in supportedGestures" 
                :key="gesture.name"
                class="gesture-item"
                :class="{ active: currentGesture === gesture.name }"
              >
                <div class="gesture-emoji">{{ gesture.emoji }}</div>
                <div class="gesture-label">{{ gesture.label }}</div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
      
      <!-- 权限提示 -->
      <div v-if="!hasPermission" class="permission-section">
        <ion-card class="permission-card">
          <ion-card-content class="permission-content">
            <ion-icon :icon="cameraOutline" class="permission-icon"></ion-icon>
            <h3>需要摄像头权限</h3>
            <p>请允许访问摄像头以使用手势识别功能</p>
            <ion-button @click="requestPermission" color="primary">
              授权摄像头
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonProgressBar,
  toastController
} from '@ionic/vue'
import {
  cameraOutline,
  playOutline,
  stopOutline,
  cameraReverseOutline
} from 'ionicons/icons'
import { ref, onMounted, onUnmounted } from 'vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()
const isCameraActive = ref(false)
const hasPermission = ref(false)
const currentGesture = ref('')
const confidence = ref(0)
const currentStream = ref<MediaStream | null>(null)
const facingMode = ref<'user' | 'environment'>('user')

// 支持的手势列表
const supportedGestures = [
  { name: 'fist', label: '握拳', emoji: '✊' },
  { name: 'five', label: '张开手掌', emoji: '✋' },
  { name: 'thumbup', label: '点赞', emoji: '👍' },
  { name: 'one', label: '食指', emoji: '☝️' },
  { name: 'two', label: '剪刀手', emoji: '✌️' },
  { name: 'three', label: '三', emoji: '🤟' },
  { name: 'gun', label: '手枪', emoji: '👉' },
  { name: 'love', label: '爱心', emoji: '🤟' },
  { name: 'yeah', label: '耶', emoji: '🤘' }
]

// 检查摄像头权限
const checkPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    stream.getTracks().forEach(track => track.stop())
    hasPermission.value = true
  } catch (error) {
    hasPermission.value = false
  }
}

// 请求摄像头权限
const requestPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    stream.getTracks().forEach(track => track.stop())
    hasPermission.value = true
    
    const toast = await toastController.create({
      message: '摄像头权限已授权',
      duration: 2000,
      color: 'success'
    })
    await toast.present()
  } catch (error) {
    const toast = await toastController.create({
      message: '摄像头权限被拒绝',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  }
}

// 启动摄像头
const startCamera = async () => {
  if (!hasPermission.value) {
    await requestPermission()
    return
  }
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facingMode.value,
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    })
    
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      currentStream.value = stream
      isCameraActive.value = true
      
      // 开始手势检测
      startGestureDetection()
      
      await Haptics.impact({ style: ImpactStyle.Light })
    }
  } catch (error) {
    console.error('启动摄像头失败:', error)
    const toast = await toastController.create({
      message: '启动摄像头失败',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  }
}

// 停止摄像头
const stopCamera = () => {
  if (currentStream.value) {
    currentStream.value.getTracks().forEach(track => track.stop())
    currentStream.value = null
  }
  
  isCameraActive.value = false
  currentGesture.value = ''
  confidence.value = 0
}

// 切换摄像头
const switchCamera = async () => {
  facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
  
  if (isCameraActive.value) {
    stopCamera()
    await new Promise(resolve => setTimeout(resolve, 100))
    await startCamera()
  }
}

// 切换摄像头按钮
const toggleCamera = () => {
  if (isCameraActive.value) {
    stopCamera()
  } else {
    startCamera()
  }
}

// 开始手势检测
const startGestureDetection = () => {
  // 模拟手势检测
  const detectGesture = () => {
    if (!isCameraActive.value) return
    
    // 随机模拟手势识别结果
    const randomGesture = supportedGestures[Math.floor(Math.random() * supportedGestures.length)]
    const randomConfidence = 0.7 + Math.random() * 0.3
    
    if (Math.random() > 0.7) { // 30%概率检测到手势
      currentGesture.value = randomGesture.name
      confidence.value = randomConfidence
    } else {
      currentGesture.value = ''
      confidence.value = 0
    }
    
    setTimeout(detectGesture, 500) // 每500ms检测一次
  }
  
  detectGesture()
}

onMounted(() => {
  checkPermission()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.gesture-content {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
}

.camera-section {
  position: relative;
  background: #000;
}

.camera-container {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-container.active {
  height: 400px;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gesture-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.camera-controls {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  align-items: center;
}

.start-btn,
.stop-btn {
  --border-radius: 24px;
  height: 48px;
  min-width: 120px;
}

.switch-btn {
  --border-radius: 50%;
  width: 48px;
  height: 48px;
}

.result-section,
.gestures-section {
  padding: 16px;
}

.result-card,
.gestures-card {
  margin: 0;
  border-radius: 12px;
}

.gesture-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.gesture-name {
  font-size: 18px;
  font-weight: 600;
  color: #1e40af;
}

.gesture-confidence {
  font-size: 14px;
  color: #64748b;
}

.confidence-bar {
  height: 6px;
  border-radius: 3px;
}

.gestures-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.gesture-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  transition: all 0.2s;
}

.gesture-item.active {
  background: #dbeafe;
  border: 2px solid #1e40af;
}

.gesture-emoji {
  font-size: 24px;
  margin-bottom: 4px;
}

.gesture-label {
  font-size: 12px;
  text-align: center;
  color: #475569;
}

.permission-section {
  padding: 16px;
}

.permission-card {
  margin: 0;
  border-radius: 12px;
}

.permission-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 16px;
}

.permission-icon {
  font-size: 48px;
  color: #64748b;
  margin-bottom: 16px;
}

.permission-content h3 {
  margin: 0 0 8px 0;
  color: #1e293b;
}

.permission-content p {
  margin: 0 0 24px 0;
  color: #64748b;
  line-height: 1.5;
}

/* 深色主题 */
@media (prefers-color-scheme: dark) {
  .gesture-item {
    background: #334155;
  }
  
  .gesture-item.active {
    background: #1e3a8a;
    border-color: #3b82f6;
  }
  
  .gesture-label {
    color: #cbd5e1;
  }
}
</style>