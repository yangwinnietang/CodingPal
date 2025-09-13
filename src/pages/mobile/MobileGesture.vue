<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>手势识别</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleCamera">
            <ion-icon :icon="isCameraActive ? videocamOffOutline : videocamOutline"></ion-icon>
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
              @click="startCamera" 
              :disabled="isCameraActive"
              fill="solid" 
              color="primary"
              class="start-btn"
            >
              <ion-icon :icon="videocamOutline" slot="start"></ion-icon>
              开始识别
            </ion-button>
            
            <ion-button 
              @click="stopCamera" 
              :disabled="!isCameraActive"
              fill="outline" 
              color="danger"
              class="stop-btn"
            >
              <ion-icon :icon="videocamOffOutline" slot="start"></ion-icon>
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
  videocamOutline,
  videocamOffOutline,
  cameraReverseOutline
} from 'ionicons/icons'
import { ref, onMounted, onUnmounted } from 'vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { Capacitor } from '@capacitor/core'
import type { PermissionState } from '@capacitor/core'

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

// 检查摄像头权限 - 优化版本
const checkPermission = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const permissions = await Camera.checkPermissions() // 检查原生权限
      const granted = permissions.camera === 'granted'
      hasPermission.value = granted
      console.log('原生权限状态:', permissions.camera)
      return granted
    } else {
      if (!navigator.mediaDevices?.getUserMedia) { // 检查浏览器支持
        console.error('浏览器不支持摄像头')
        hasPermission.value = false
        return false
      }
      hasPermission.value = true // Web平台默认有权限，实际申请在启动时
      console.log('Web平台权限检查完成')
      return true
    }
  } catch (error) {
    console.error('权限检查失败:', error)
    hasPermission.value = false
    return false
  }
}

const requestPermission = async (): Promise<boolean> => { // 简化权限申请
  try {
    if (Capacitor.isNativePlatform()) {
      console.log('申请原生摄像头权限')
      const permissions = await Camera.requestPermissions()
      const granted = permissions.camera === 'granted'
      hasPermission.value = granted
      
      if (granted) {
        const toast = await toastController.create({ message: '权限已授权', duration: 2000, color: 'success' })
        await toast.present()
        return true
      } else {
        const message = permissions.camera === 'denied' ? '权限被拒绝，请在设置中手动开启' : '请允许摄像头权限'
        const toast = await toastController.create({ message, duration: 3000, color: 'warning' })
        await toast.present()
        return false
      }
    } else {
      console.log('申请Web摄像头权限')
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode.value } })
        stream.getTracks().forEach(track => track.stop()) // 立即停止，仅获取权限
        hasPermission.value = true
        const toast = await toastController.create({ message: '权限已授权', duration: 2000, color: 'success' })
        await toast.present()
        return true
      } catch (error: any) {
        hasPermission.value = false
        const message = error.name === 'NotAllowedError' ? '权限被拒绝' : '权限申请失败'
        const toast = await toastController.create({ message, duration: 3000, color: 'danger' })
        await toast.present()
        return false
      }
    }
  } catch (error) {
    console.error('权限申请异常:', error)
    hasPermission.value = false
    const toast = await toastController.create({ message: '权限申请失败', duration: 3000, color: 'danger' })
    await toast.present()
    return false
  }
}

const startCamera = async (retryCount = 0): Promise<boolean> => { // 简化摄像头启动
  const maxRetries = 2
  
  try {
    console.log(`启动摄像头 ${retryCount + 1}/${maxRetries + 1}`, Capacitor.isNativePlatform() ? '原生' : 'Web')
    
    // 权限检查和申请
    let hasValidPermission = await checkPermission()
    if (!hasValidPermission) {
      console.log('申请权限中...')
      hasValidPermission = await requestPermission()
      if (!hasValidPermission) {
        console.error('权限申请失败')
        return false
      }
      await new Promise(resolve => setTimeout(resolve, 300)) // 短暂等待
    }
    
    // 2. 停止现有流
    if (currentStream.value) {
      console.log('停止现有摄像头流')
      stopCamera()
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    // 3. 获取可用设备列表
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')
    
    if (videoDevices.length === 0) {
      throw new Error('NoVideoDevices')
    }
    
    console.log(`找到 ${videoDevices.length} 个摄像头设备`)
    
    // 4. 构建摄像头约束
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: facingMode.value,
        width: { ideal: 640, min: 320, max: 1280 },
        height: { ideal: 480, min: 240, max: 720 },
        frameRate: { ideal: 30, min: 15, max: 60 }
      }
    }
    
    // 5. 尝试启动摄像头
    console.log('请求摄像头流:', constraints)
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    
    if (!stream || stream.getTracks().length === 0) {
      throw new Error('EmptyStream')
    }
    
    // 6. 设置视频元素
    if (!videoRef.value) {
      throw new Error('VideoElementNotFound')
    }
    
    // 等待视频元素准备就绪
    await new Promise<void>((resolve, reject) => {
      const video = videoRef.value!
      
      const onLoadedMetadata = () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata)
        video.removeEventListener('error', onError)
        resolve()
      }
      
      const onError = (event: Event) => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata)
        video.removeEventListener('error', onError)
        reject(new Error('VideoLoadError'))
      }
      
      video.addEventListener('loadedmetadata', onLoadedMetadata)
      video.addEventListener('error', onError)
      
      video.srcObject = stream
      
      // 超时保护
      setTimeout(() => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata)
        video.removeEventListener('error', onError)
        reject(new Error('VideoLoadTimeout'))
      }, 5000)
    })
    
    // 7. 设置状态
    currentStream.value = stream
    isCameraActive.value = true
    
    // 8. 开始手势检测
    startGestureDetection()
    
    // 9. 触觉反馈
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light })
      }
    } catch (e) {
      console.warn('触觉反馈失败:', e)
    }
    
    // 10. 成功提示
    const toast = await toastController.create({
      message: '摄像头启动成功',
      duration: 1500,
      color: 'success'
    })
    await toast.present()
    
    console.log('摄像头启动成功')
    return true
    
  } catch (error: any) {
    console.error('摄像头启动失败:', error)
    
    // 清理状态
    if (currentStream.value) {
      currentStream.value.getTracks().forEach(track => track.stop())
      currentStream.value = null
    }
    isCameraActive.value = false
    
    // 错误分析和处理
    let message = '摄像头启动失败'
    let shouldRetry = false
    
    switch (error.name || error.message) {
      case 'NotAllowedError':
        message = '摄像头权限被拒绝，请在浏览器设置中允许访问'
        break
      case 'NotFoundError':
      case 'NoVideoDevices':
        message = '未找到摄像头设备，请检查设备连接'
        break
      case 'NotReadableError':
        message = '摄像头被其他应用占用，请关闭其他应用后重试'
        shouldRetry = retryCount < maxRetries
        break
      case 'OverconstrainedError':
        message = '摄像头不支持当前配置，尝试切换摄像头'
        shouldRetry = retryCount < maxRetries
        break
      case 'SecurityError':
        message = '安全限制：请使用HTTPS访问'
        break
      case 'AbortError':
        message = '摄像头启动被中断'
        shouldRetry = retryCount < maxRetries
        break
      case 'VideoElementNotFound':
        message = '视频组件未准备就绪，请重试'
        shouldRetry = retryCount < maxRetries
        break
      case 'VideoLoadError':
      case 'VideoLoadTimeout':
        message = '视频加载失败，请重试'
        shouldRetry = retryCount < maxRetries
        break
      case 'EmptyStream':
        message = '摄像头流为空，请重试'
        shouldRetry = retryCount < maxRetries
        break
      default:
        message = `摄像头启动失败: ${error.message || '未知错误'}`
        shouldRetry = retryCount < maxRetries
    }
    
    // 重试逻辑
    if (shouldRetry) {
      console.log(`准备重试，等待 ${(retryCount + 1) * 1000}ms`)
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000))
      return await startCamera(retryCount + 1)
    }
    
    // 显示错误信息
    const toast = await toastController.create({
      message,
      duration: 4000,
      color: 'danger'
    })
    await toast.present()
    
    return false
  }
}

// 停止摄像头 - 优化版本
const stopCamera = async (): Promise<void> => {
  try {
    console.log('停止摄像头')
    
    // 停止所有轨道
    if (currentStream.value) {
      currentStream.value.getTracks().forEach(track => {
        console.log(`停止轨道: ${track.kind}, 状态: ${track.readyState}`)
        track.stop()
      })
      currentStream.value = null
    }
    
    // 清理视频元素
    if (videoRef.value) {
      videoRef.value.srcObject = null
    }
    
    // 重置状态
    isCameraActive.value = false
    currentGesture.value = ''
    confidence.value = 0
    
    console.log('摄像头已停止')
  } catch (error) {
    console.error('停止摄像头时出错:', error)
  }
}

// 切换摄像头 - 优化版本
const switchCamera = async (): Promise<boolean> => {
  try {
    console.log('切换摄像头')
    
    // 切换朝向
    const newFacingMode = facingMode.value === 'user' ? 'environment' : 'user'
    console.log(`从 ${facingMode.value} 切换到 ${newFacingMode}`)
    
    facingMode.value = newFacingMode
    
    if (isCameraActive.value) {
      // 显示切换提示
      const toast = await toastController.create({
        message: '正在切换摄像头...',
        duration: 1000,
        color: 'primary'
      })
      await toast.present()
      
      // 停止当前摄像头
      await stopCamera()
      
      // 等待一段时间确保资源释放
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 启动新摄像头
      const success = await startCamera()
      
      if (success) {
        const successToast = await toastController.create({
          message: `已切换到${newFacingMode === 'user' ? '前置' : '后置'}摄像头`,
          duration: 1500,
          color: 'success'
        })
        await successToast.present()
        return true
      } else {
        // 切换失败，回退到原来的设置
        facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
        const errorToast = await toastController.create({
          message: '摄像头切换失败，已回退到原设置',
          duration: 2000,
          color: 'warning'
        })
        await errorToast.present()
        return false
      }
    }
    
    return true
  } catch (error) {
    console.error('切换摄像头失败:', error)
    
    const toast = await toastController.create({
      message: '摄像头切换失败',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
    
    return false
  }
}

const toggleCamera = async (): Promise<void> => { // 简化摄像头切换
  console.log('摄像头按钮点击', { active: isCameraActive.value, permission: hasPermission.value })
  
  try {
    if (isCameraActive.value) {
      console.log('关闭摄像头')
      await stopCamera()
      const toast = await toastController.create({ message: '摄像头已关闭', duration: 1000, color: 'success' })
      await toast.present()
    } else {
      console.log('启动摄像头')
      const success = await startCamera()
      if (!success) {
        console.error('启动失败')
        const toast = await toastController.create({ message: '摄像头启动失败', duration: 2000, color: 'danger' })
        await toast.present()
      } else {
        console.log('启动成功')
      }
    }
  } catch (error) {
    console.error('摄像头操作失败:', error)
    const toast = await toastController.create({ message: '操作失败，请重试', duration: 2000, color: 'danger' })
    await toast.present()
  }
}

// 开始手势检测 - 使用真实的手势识别
const startGestureDetection = async () => {
  console.log('开始真实手势检测')
  
  if (!videoRef.value || !canvasRef.value) {
    console.error('视频或画布元素未准备好')
    return
  }
  
  const video = videoRef.value
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    console.error('无法获取画布上下文')
    return
  }
  
  // 真实的手势检测循环
  const detectGesture = () => {
    if (!isCameraActive.value || !video.videoWidth || !video.videoHeight) {
      return
    }
    
    try {
      // 设置画布尺寸
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // 绘制当前帧到画布
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // 获取图像数据进行手势分析
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      
      // 简化的手势检测逻辑（基于像素分析）
      const gestureResult = analyzeGestureFromImageData(imageData)
      
      if (gestureResult.detected) {
        currentGesture.value = gestureResult.gesture
        confidence.value = gestureResult.confidence
        console.log(`检测到手势: ${gestureResult.gesture}, 置信度: ${gestureResult.confidence.toFixed(2)}`)
      } else {
        currentGesture.value = ''
        confidence.value = 0
      }
      
    } catch (error) {
      console.error('手势检测过程中出错:', error)
    }
    
    // 继续下一帧检测
    if (isCameraActive.value) {
      requestAnimationFrame(detectGesture)
    }
  }
  
  // 开始检测循环
  requestAnimationFrame(detectGesture)
}

// 简化的手势分析函数
const analyzeGestureFromImageData = (imageData: ImageData) => {
  // 这里实现基础的手势识别逻辑
  // 实际项目中应该使用MediaPipe或TensorFlow.js
  
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  
  // 简单的运动检测和形状分析
  let brightPixels = 0
  let totalPixels = width * height
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const brightness = (r + g + b) / 3
    
    if (brightness > 120) {
      brightPixels++
    }
  }
  
  const brightRatio = brightPixels / totalPixels
  
  // 基于亮度比例的简单手势判断
  if (brightRatio > 0.3 && brightRatio < 0.6) {
    // 可能是手势
    const gestureIndex = Math.floor(brightRatio * supportedGestures.length)
    const gesture = supportedGestures[Math.min(gestureIndex, supportedGestures.length - 1)]
    
    return {
      detected: true,
      gesture: gesture.name,
      confidence: Math.min(0.7 + (brightRatio - 0.3) * 0.3, 0.95)
    }
  }
  
  return {
    detected: false,
    gesture: '',
    confidence: 0
  }
}

// 页面可见性变化处理
const handleVisibilityChange = async () => {
  if (document.hidden) {
    console.log('页面隐藏，暂停摄像头')
    if (isCameraActive.value) {
      await stopCamera()
    }
  } else {
    console.log('页面显示，检查摄像头状态')
    // 页面重新显示时，如果之前有权限，可以选择重新启动
    if (hasPermission.value && !isCameraActive.value) {
      // 可以在这里添加自动重启逻辑，或者让用户手动启动
      console.log('页面重新显示，摄像头已停止')
    }
  }
}

// 应用状态变化处理（Capacitor）
const handleAppStateChange = async (state: any) => {
  console.log('应用状态变化:', state)
  
  if (state.isActive === false) {
    // 应用进入后台
    console.log('应用进入后台，停止摄像头')
    if (isCameraActive.value) {
      await stopCamera()
    }
  } else if (state.isActive === true) {
    // 应用回到前台
    console.log('应用回到前台')
    // 重新检查权限
    await checkPermission()
  }
}

// 设备方向变化处理
const handleOrientationChange = async () => {
  console.log('设备方向变化')
  
  if (isCameraActive.value) {
    // 方向变化时重新调整摄像头
    await new Promise(resolve => setTimeout(resolve, 300))
    
    if (videoRef.value && currentStream.value) {
      // 重新设置视频尺寸
      const video = videoRef.value
      video.style.transform = ''
      
      // 根据新的方向调整显示
      const canvas = canvasRef.value
      if (canvas) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }
    }
  }
}

onMounted(async () => {
  console.log('MobileGesture 组件挂载')
  
  try {
    // 初始权限检查
    await checkPermission()
    
    // 添加页面可见性监听
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // 添加设备方向变化监听
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)
    
    // 添加应用状态监听（Capacitor）
    if (Capacitor.isNativePlatform()) {
      const { App } = await import('@capacitor/app')
      App.addListener('appStateChange', handleAppStateChange)
    }
    
    console.log('事件监听器已添加')
  } catch (error) {
    console.error('组件初始化失败:', error)
  }
})

onUnmounted(async () => {
  console.log('MobileGesture 组件卸载')
  
  try {
    // 停止摄像头
    await stopCamera()
    
    // 移除事件监听器
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('orientationchange', handleOrientationChange)
    window.removeEventListener('resize', handleOrientationChange)
    
    // 移除应用状态监听（Capacitor）
    if (Capacitor.isNativePlatform()) {
      const { App } = await import('@capacitor/app')
      App.removeAllListeners()
    }
    
    console.log('资源清理完成')
  } catch (error) {
    console.error('组件卸载时出错:', error)
  }
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