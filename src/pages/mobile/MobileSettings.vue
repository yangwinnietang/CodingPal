<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>设置</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="settings-content">
      <!-- AI模型配置 -->
      <div class="settings-section">
        <ion-list class="settings-list">
          <ion-list-header>
            <ion-label>AI模型配置</ion-label>
          </ion-list-header>
          
          <ion-item button @click="openModelConfig">
            <ion-icon :icon="sparklesOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>模型选择</h3>
              <p>{{ currentModel }}</p>
            </ion-label>
            <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
          </ion-item>
          
          <ion-item button @click="openApiConfig">
            <ion-icon :icon="keyOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>API配置</h3>
              <p>配置API密钥和端点</p>
            </ion-label>
            <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
          </ion-item>
        </ion-list>
      </div>
      
      <!-- 手势识别设置 -->
      <div class="settings-section">
        <ion-list class="settings-list">
          <ion-list-header>
            <ion-label>手势识别</ion-label>
          </ion-list-header>
          
          <ion-item>
            <ion-icon :icon="handLeftOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>启用手势识别</h3>
              <p>开启摄像头手势检测功能</p>
            </ion-label>
            <ion-toggle 
              v-model="gestureEnabled" 
              slot="end"
              @ionChange="onGestureToggle"
            ></ion-toggle>
          </ion-item>
          
          <ion-item>
            <ion-icon :icon="speedometerOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>检测灵敏度</h3>
              <p>{{ sensitivity }}%</p>
            </ion-label>
          </ion-item>
          
          <ion-item>
            <ion-range 
              v-model="sensitivity"
              :min="50" 
              :max="100" 
              :step="5"
              :pin="true"
              @ionChange="onSensitivityChange"
            >
              <ion-label slot="start">50%</ion-label>
              <ion-label slot="end">100%</ion-label>
            </ion-range>
          </ion-item>
        </ion-list>
      </div>
      
      <!-- 应用设置 -->
      <div class="settings-section">
        <ion-list class="settings-list">
          <ion-list-header>
            <ion-label>应用设置</ion-label>
          </ion-list-header>
          
          <ion-item>
            <ion-icon :icon="moonOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>深色模式</h3>
              <p>跟随系统设置</p>
            </ion-label>
            <ion-toggle 
              v-model="darkMode" 
              slot="end"
              @ionChange="onDarkModeToggle"
            ></ion-toggle>
          </ion-item>
          
          <ion-item>
            <ion-icon :icon="phonePortraitOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>触觉反馈</h3>
              <p>按钮点击震动反馈</p>
            </ion-label>
            <ion-toggle 
              v-model="hapticEnabled" 
              slot="end"
              @ionChange="onHapticToggle"
            ></ion-toggle>
          </ion-item>
          
          <ion-item button @click="clearCache">
            <ion-icon :icon="trashOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>清除缓存</h3>
              <p>清除应用缓存数据</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
      
      <!-- 数据同步 -->
      <div class="settings-section">
        <ion-list class="settings-list">
          <ion-list-header>
            <ion-label>数据同步</ion-label>
          </ion-list-header>
          
          <ion-item>
            <ion-icon :icon="cloudOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>自动同步</h3>
              <p>自动备份到云端</p>
            </ion-label>
            <ion-toggle 
              v-model="autoSync" 
              slot="end"
              @ionChange="onAutoSyncToggle"
            ></ion-toggle>
          </ion-item>
          
          <ion-item button @click="syncNow" :disabled="isSyncing">
            <ion-icon :icon="syncOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>{{ isSyncing ? '同步中...' : '立即同步' }}</h3>
              <p>上次同步: {{ lastSyncTime }}</p>
            </ion-label>
            <ion-spinner v-if="isSyncing" slot="end" name="crescent"></ion-spinner>
          </ion-item>
        </ion-list>
      </div>
      
      <!-- 关于应用 -->
      <div class="settings-section">
        <ion-list class="settings-list">
          <ion-list-header>
            <ion-label>关于</ion-label>
          </ion-list-header>
          
          <ion-item button @click="showAbout">
            <ion-icon :icon="informationCircleOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>关于CodingPal</h3>
              <p>版本 1.0.0</p>
            </ion-label>
          </ion-item>
          
          <ion-item button @click="showPrivacy">
            <ion-icon :icon="shieldCheckmarkOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>隐私政策</h3>
              <p>查看隐私保护政策</p>
            </ion-label>
          </ion-item>
        </ion-list>
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
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonIcon,
  IonToggle,
  IonRange,
  IonSpinner,
  toastController,
  alertController
} from '@ionic/vue'
import {
  sparklesOutline,
  keyOutline,
  handLeftOutline,
  speedometerOutline,
  moonOutline,
  phonePortraitOutline,
  trashOutline,
  cloudOutline,
  syncOutline,
  informationCircleOutline,
  shieldCheckmarkOutline,
  chevronForwardOutline
} from 'ionicons/icons'
import { ref, onMounted } from 'vue'
import { Preferences } from '@capacitor/preferences'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

// 设置状态
const currentModel = ref('GPT-4')
const gestureEnabled = ref(true)
const sensitivity = ref(80)
const darkMode = ref(false)
const hapticEnabled = ref(true)
const autoSync = ref(true)
const isSyncing = ref(false)
const lastSyncTime = ref('从未同步')

// 加载设置
const loadSettings = async () => {
  try {
    const settings = await Preferences.get({ key: 'app_settings' })
    if (settings.value) {
      const parsed = JSON.parse(settings.value)
      gestureEnabled.value = parsed.gestureEnabled ?? true
      sensitivity.value = parsed.sensitivity ?? 80
      darkMode.value = parsed.darkMode ?? false
      hapticEnabled.value = parsed.hapticEnabled ?? true
      autoSync.value = parsed.autoSync ?? true
      lastSyncTime.value = parsed.lastSyncTime ?? '从未同步'
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 保存设置
const saveSettings = async () => {
  try {
    const settings = {
      gestureEnabled: gestureEnabled.value,
      sensitivity: sensitivity.value,
      darkMode: darkMode.value,
      hapticEnabled: hapticEnabled.value,
      autoSync: autoSync.value,
      lastSyncTime: lastSyncTime.value
    }
    await Preferences.set({ 
      key: 'app_settings', 
      value: JSON.stringify(settings) 
    })
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

// 触觉反馈
const hapticFeedback = async () => {
  if (hapticEnabled.value) {
    await Haptics.impact({ style: ImpactStyle.Light })
  }
}

// 手势识别开关
const onGestureToggle = async () => {
  await hapticFeedback()
  await saveSettings()
  
  const toast = await toastController.create({
    message: `手势识别已${gestureEnabled.value ? '开启' : '关闭'}`,
    duration: 2000,
    color: gestureEnabled.value ? 'success' : 'warning'
  })
  await toast.present()
}

// 灵敏度调节
const onSensitivityChange = async () => {
  await hapticFeedback()
  await saveSettings()
}

// 深色模式开关
const onDarkModeToggle = async () => {
  await hapticFeedback()
  await saveSettings()
  
  // 应用深色模式
  document.body.classList.toggle('dark', darkMode.value)
}

// 触觉反馈开关
const onHapticToggle = async () => {
  if (hapticEnabled.value) {
    await Haptics.impact({ style: ImpactStyle.Light })
  }
  await saveSettings()
}

// 自动同步开关
const onAutoSyncToggle = async () => {
  await hapticFeedback()
  await saveSettings()
}

// 打开模型配置
const openModelConfig = async () => {
  await hapticFeedback()
  
  const alert = await alertController.create({
    header: '选择AI模型',
    inputs: [
      { name: 'gpt4', type: 'radio', label: 'GPT-4', value: 'GPT-4', checked: currentModel.value === 'GPT-4' },
      { name: 'gpt35', type: 'radio', label: 'GPT-3.5', value: 'GPT-3.5', checked: currentModel.value === 'GPT-3.5' },
      { name: 'claude', type: 'radio', label: 'Claude', value: 'Claude', checked: currentModel.value === 'Claude' }
    ],
    buttons: [
      { text: '取消', role: 'cancel' },
      {
        text: '确定',
        handler: (data) => {
          if (data) {
            currentModel.value = data
          }
        }
      }
    ]
  })
  
  await alert.present()
}

// 打开API配置
const openApiConfig = async () => {
  await hapticFeedback()
  
  const toast = await toastController.create({
    message: 'API配置功能开发中',
    duration: 2000,
    color: 'medium'
  })
  await toast.present()
}

// 清除缓存
const clearCache = async () => {
  await hapticFeedback()
  
  const alert = await alertController.create({
    header: '清除缓存',
    message: '确定要清除所有缓存数据吗？此操作不可恢复。',
    buttons: [
      { text: '取消', role: 'cancel' },
      {
        text: '确定',
        role: 'destructive',
        handler: async () => {
          // 清除缓存逻辑
          const toast = await toastController.create({
            message: '缓存已清除',
            duration: 2000,
            color: 'success'
          })
          await toast.present()
        }
      }
    ]
  })
  
  await alert.present()
}

// 立即同步
const syncNow = async () => {
  await hapticFeedback()
  
  isSyncing.value = true
  
  try {
    // 模拟同步过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    lastSyncTime.value = new Date().toLocaleString('zh-CN')
    await saveSettings()
    
    const toast = await toastController.create({
      message: '同步完成',
      duration: 2000,
      color: 'success'
    })
    await toast.present()
  } catch (error) {
    const toast = await toastController.create({
      message: '同步失败，请重试',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    isSyncing.value = false
  }
}

// 显示关于信息
const showAbout = async () => {
  await hapticFeedback()
  
  const alert = await alertController.create({
    header: '关于CodingPal',
    message: 'CodingPal是一款AI驱动的提示词优化和手势识别应用。\n\n版本: 1.0.0\n开发者: CodingPal Team',
    buttons: ['确定']
  })
  
  await alert.present()
}

// 显示隐私政策
const showPrivacy = async () => {
  await hapticFeedback()
  
  const alert = await alertController.create({
    header: '隐私政策',
    message: '我们重视您的隐私保护。所有数据均在本地处理，不会上传到服务器。',
    buttons: ['确定']
  })
  
  await alert.present()
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-content {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 16px;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-list {
  margin: 0 16px;
  border-radius: 12px;
  overflow: hidden;
}

ion-list-header {
  padding-left: 0;
  padding-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 56px;
}

ion-item h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

ion-item p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #6b7280;
}

ion-range {
  padding: 0 16px;
}

/* 深色主题 */
@media (prefers-color-scheme: dark) {
  ion-list-header {
    color: #d1d5db;
  }
  
  ion-item h3 {
    color: #f9fafb;
  }
  
  ion-item p {
    color: #9ca3af;
  }
}
</style>