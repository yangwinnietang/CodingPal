<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>CodingPal - AI优化</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="mobile-content">
      <!-- 输入区域 -->
      <div class="input-section">
        <ion-card class="input-card">
          <ion-card-header>
            <ion-card-title>提示词输入</ion-card-title>
            <ion-card-subtitle>输入您需要优化的提示词</ion-card-subtitle>
          </ion-card-header>
          
          <ion-card-content>
            <ion-textarea
              v-model="inputText"
              placeholder="请输入您的提示词..."
              :rows="6"
              class="input-textarea"
            ></ion-textarea>
            
            <div class="action-buttons">
              <ion-button 
                expand="block" 
                color="primary"
                @click="optimizePrompt"
                :disabled="!inputText.trim() || isLoading"
                class="optimize-btn"
              >
                <ion-icon :icon="sparklesOutline" slot="start"></ion-icon>
                {{ isLoading ? '优化中...' : '开始优化' }}
              </ion-button>
              
              <div class="secondary-actions">
                <ion-button 
                  fill="outline" 
                  size="small"
                  @click="clearInput"
                  :disabled="!inputText.trim()"
                >
                  <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                  清空
                </ion-button>
                
                <ion-button 
                  fill="outline" 
                  size="small"
                  @click="pasteFromClipboard"
                >
                  <ion-icon :icon="clipboardOutline" slot="start"></ion-icon>
                  粘贴
                </ion-button>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
      
      <!-- 结果区域 -->
      <div v-if="optimizedText" class="result-section">
        <ion-card class="result-card">
          <ion-card-header>
            <ion-card-title>优化结果</ion-card-title>
            <ion-card-subtitle>AI优化后的提示词</ion-card-subtitle>
          </ion-card-header>
          
          <ion-card-content>
            <div class="result-text">{{ optimizedText }}</div>
            
            <div class="result-actions">
              <ion-button 
                expand="block" 
                fill="outline"
                @click="copyResult"
                class="copy-btn"
              >
                <ion-icon :icon="copyOutline" slot="start"></ion-icon>
                复制结果
              </ion-button>
              
              <ion-button 
                expand="block" 
                fill="outline"
                @click="shareResult"
                class="share-btn"
              >
                <ion-icon :icon="shareOutline" slot="start"></ion-icon>
                分享结果
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-section">
        <ion-card class="loading-card">
          <ion-card-content class="loading-content">
            <ion-spinner name="crescent" color="primary"></ion-spinner>
            <p>AI正在优化您的提示词...</p>
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
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonTextarea,
  IonButton,
  IonIcon,
  IonSpinner,
  toastController
} from '@ionic/vue'
import {
  sparklesOutline,
  trashOutline,
  clipboardOutline,
  copyOutline,
  shareOutline
} from 'ionicons/icons'
import { ref } from 'vue'
import { Clipboard } from '@capacitor/clipboard'
import { Share } from '@capacitor/share'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

const inputText = ref('') // 输入文本
const optimizedText = ref('') // 优化结果
const isLoading = ref(false) // 加载状态

// 优化提示词
const optimizePrompt = async () => {
  if (!inputText.value.trim()) return
  
  isLoading.value = true
  await Haptics.impact({ style: ImpactStyle.Light })
  
  try {
    // 模拟AI优化过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    optimizedText.value = `优化后的提示词：${inputText.value}\n\n添加了更多细节和上下文信息，使其更加清晰和具体。`
    
    const toast = await toastController.create({
      message: '优化完成！',
      duration: 2000,
      color: 'success'
    })
    await toast.present()
  } catch (error) {
    const toast = await toastController.create({
      message: '优化失败，请重试',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    isLoading.value = false
  }
}

// 清空输入
const clearInput = () => {
  inputText.value = ''
  optimizedText.value = ''
}

// 从剪贴板粘贴
const pasteFromClipboard = async () => {
  try {
    const { value } = await Clipboard.read()
    inputText.value = value
  } catch (error) {
    console.error('粘贴失败:', error)
  }
}

// 复制结果
const copyResult = async () => {
  try {
    await Clipboard.write({ string: optimizedText.value })
    await Haptics.impact({ style: ImpactStyle.Light })
    
    const toast = await toastController.create({
      message: '已复制到剪贴板',
      duration: 1500,
      color: 'success'
    })
    await toast.present()
  } catch (error) {
    console.error('复制失败:', error)
  }
}

// 分享结果
const shareResult = async () => {
  try {
    await Share.share({
      title: 'CodingPal优化结果',
      text: optimizedText.value,
      dialogTitle: '分享优化结果'
    })
  } catch (error) {
    console.error('分享失败:', error)
  }
}
</script>

<style scoped>
.mobile-content {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 16px;
}

.input-section,
.result-section,
.loading-section {
  margin-bottom: 16px;
}

.input-card,
.result-card,
.loading-card {
  margin: 0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.input-textarea {
  --background: #f8fafc;
  --color: #1e293b;
  --border-radius: 8px;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  margin-bottom: 16px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.optimize-btn {
  --border-radius: 8px;
  height: 48px;
  font-weight: 600;
}

.secondary-actions {
  display: flex;
  gap: 8px;
}

.secondary-actions ion-button {
  flex: 1;
  --border-radius: 6px;
}

.result-text {
  background: #f1f5f9;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  line-height: 1.6;
  color: #334155;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.copy-btn,
.share-btn {
  --border-radius: 8px;
  height: 44px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 16px;
}

.loading-content p {
  margin: 0;
  color: #64748b;
  text-align: center;
}

/* 深色主题 */
@media (prefers-color-scheme: dark) {
  .input-textarea {
    --background: #334155;
    --color: #f1f5f9;
  }
  
  .result-text {
    background: #334155;
    color: #f1f5f9;
  }
}
</style>