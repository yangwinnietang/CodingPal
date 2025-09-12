<template>
  <div class="main-container relative w-full h-full bg-transparent">
    <!-- 拖动区域 -->
    <div 
      class="drag-region absolute inset-0 z-10 cursor-move"
      data-tauri-drag-region
      :class="{ 'dragging': isDragging }"
      @mousedown.left="startWindowDrag"
      @mouseup="handleDragEnd"
      @mouseleave="handleDragEnd"
    ></div>
    
    <!-- AI虚拟形象显示区域 -->
    <div class="ai-avatar-container flex items-center justify-center h-full relative z-20 pointer-events-none">
      <img 
        :src="currentAvatarImage" 
        :alt="currentStatus"
        class="w-48 h-36 object-contain transition-all duration-300"
      />
    </div>
    
    <!-- 状态指示器 - 卡通可爱风格 -->
    <div class="status-indicator absolute bottom-3 left-3 flex items-center space-x-2 z-30 pointer-events-auto bg-white bg-opacity-90 rounded-full px-3 py-2 shadow-lg" data-tauri-drag-region="no-drag">
      <div :class="statusDotClass" class="w-3 h-3 rounded-full shadow-sm"></div>
      <span class="text-sm font-medium text-gray-700">{{ statusText }}</span>
    </div>
    
    <!-- 快捷操作按钮组 - 卡通可爱风格 -->
    <div class="action-buttons absolute bottom-3 right-3 flex space-x-2 z-30 pointer-events-auto" data-tauri-drag-region="no-drag">
      <button 
        @click="openControlPanel"
        class="cute-btn control-btn" 
        title="控制面板"
      >
        <i class="i-lucide-settings w-5 h-5"></i>
      </button>
      <button 
        @click="openSettings"
        class="cute-btn settings-btn" 
        title="设置"
      >
        <i class="i-lucide-cog w-5 h-5"></i>
      </button>
      <button 
        @click="minimizeWindow"
        class="cute-btn minimize-btn" 
        title="最小化"
      >
        <i class="i-lucide-minus w-5 h-5"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'

const router = useRouter()

// 状态管理
const currentStatus = ref<'rest' | 'thinking' | 'welcome' | 'working'>('welcome')
const ideProcesses = ref<any[]>([])
const monitoringInterval = ref<NodeJS.Timeout | null>(null)

// 拖动状态管理
const isDragging = ref(false)

// 计算属性
const currentAvatarImage = computed(() => {
  return `/imgs/${currentStatus.value}.png`
})

const statusText = computed(() => {
  const statusMap = {
    rest: '休息中',
    thinking: '思考中',
    welcome: '欢迎使用',
    working: '工作中'
  }
  return statusMap[currentStatus.value]
})

const statusDotClass = computed(() => {
  const classMap = {
    rest: 'bg-gray-400',
    thinking: 'bg-yellow-400 animate-pulse',
    welcome: 'bg-blue-400',
    working: 'bg-green-400 animate-pulse'
  }
  return classMap[currentStatus.value]
})

// 方法
const openControlPanel = () => {
  router.push('/control-panel')
}

const openSettings = () => {
  router.push('/settings')
}

const minimizeWindow = async () => {
  try {
    const window = getCurrentWindow()
    await window.minimize()
  } catch (error) {
    console.error('最小化窗口失败:', error)
  }
}

// 拖动功能 - 使用data-tauri-drag-region属性，无需JavaScript处理
// 但保留拖动状态管理用于视觉反馈
const handleDragStart = () => {
  isDragging.value = true
}

const handleDragEnd = () => {
  isDragging.value = false
}

// 左键拖动窗口
const startWindowDrag = async (e: MouseEvent) => {
  try {
    isDragging.value = true
    const window = getCurrentWindow()
    await window.startDragging()
  } catch (error) {
    console.error('窗口拖动失败:', error)
  } finally {
    isDragging.value = false
  }
}

// 保存窗口位置
const saveWindowPosition = async () => {
  try {
    const window = getCurrentWindow()
    const position = await window.outerPosition()
    localStorage.setItem('windowPosition', JSON.stringify(position))
  } catch (error) {
    console.error('保存窗口位置失败:', error)
  }
}

// 恢复窗口位置
const restoreWindowPosition = async () => {
  try {
    const savedPosition = localStorage.getItem('windowPosition')
    if (savedPosition) {
      const position = JSON.parse(savedPosition)
      const window = getCurrentWindow()
      await window.setPosition(position)
    }
  } catch (error) {
    console.error('恢复窗口位置失败:', error)
  }
}

const monitorProcesses = async () => {
  try {
    const processes = await invoke('get_ide_processes')
    ideProcesses.value = processes as any[]
    
    // 根据进程状态更新AI状态
    if (ideProcesses.value.length > 0) {
      const hasHighCpuUsage = ideProcesses.value.some(p => p.cpu_usage > 50)
      currentStatus.value = hasHighCpuUsage ? 'working' : 'thinking'
    } else {
      currentStatus.value = 'rest'
    }
  } catch (error) {
    console.error('监控进程失败:', error)
    currentStatus.value = 'rest'
  }
}

// 生命周期
onMounted(() => {
  // 启动时显示欢迎状态
  setTimeout(() => {
    currentStatus.value = 'rest'
  }, 2000)
  
  // 恢复窗口位置
  restoreWindowPosition()
  
  // 开始进程监控
  monitorProcesses()
  monitoringInterval.value = setInterval(monitorProcesses, 5000)
  
  // 监听窗口移动事件，保存位置
  const currentWindow = getCurrentWindow()
  currentWindow.listen('tauri://move', () => {
    saveWindowPosition()
  })
})

onUnmounted(() => {
  if (monitoringInterval.value) {
    clearInterval(monitoringInterval.value)
  }
})
</script>

<style scoped>
.main-container {
  border-radius: 12px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 卡通可爱风格按钮 */
.cute-btn {
  @apply w-12 h-12 rounded-full flex items-center justify-center 
         transition-all duration-300 shadow-lg backdrop-blur-sm
         border-2 border-white border-opacity-50;
  transform-origin: center;
}

.cute-btn:hover {
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.cute-btn:active {
  transform: scale(0.95);
}

/* 不同按钮的颜色主题 - 修改为与状态指示器相同的背景样式 */
.control-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #374151;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 1);
}

.settings-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #374151;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 1);
}

.minimize-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #374151;
}

.minimize-btn:hover {
  background: rgba(255, 255, 255, 1);
}

/* 旧样式保留作为备用 */
.action-btn {
  @apply w-8 h-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 
         flex items-center justify-center transition-all duration-200 
         text-gray-700 hover:text-gray-900 backdrop-blur-sm;
}

.action-btn:hover {
  transform: scale(1.1);
}

/* 拖动区域样式 */
.drag-region {
  user-select: none;
  -webkit-user-select: none;
  background: rgba(255, 255, 255, 0.05);
  -webkit-app-region: drag;
}

.drag-region.dragging {
  cursor: grabbing;
}

.drag-region:hover {
  cursor: move;
}

/* 确保按钮和状态指示器可以正常交互 */
.action-buttons,
.status-indicator {
  pointer-events: auto;
}

.ai-avatar-container {
  pointer-events: none;
}

/* 防止拖动区域覆盖交互元素 */
.drag-region {
  pointer-events: auto;
}

.action-buttons,
.status-indicator {
  pointer-events: auto;
  -webkit-app-region: no-drag;
}

.action-buttons *,
.status-indicator * {
  pointer-events: auto;
  -webkit-app-region: no-drag;
}
</style>