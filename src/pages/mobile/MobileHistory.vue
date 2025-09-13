<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>历史记录</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="clearAllHistory">
            <ion-icon :icon="trashOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="history-content">
      <!-- 搜索栏 -->
      <div class="search-section">
        <ion-searchbar
          v-model="searchText"
          placeholder="搜索历史记录..."
          @ionInput="onSearch"
          class="history-searchbar"
        ></ion-searchbar>
      </div>
      
      <!-- 筛选标签 -->
      <div class="filter-section">
        <ion-segment 
          v-model="activeFilter" 
          @ionChange="onFilterChange"
          class="filter-segment"
        >
          <ion-segment-button value="all">
            <ion-label>全部</ion-label>
          </ion-segment-button>
          <ion-segment-button value="ai">
            <ion-label>AI优化</ion-label>
          </ion-segment-button>
          <ion-segment-button value="gesture">
            <ion-label>手势识别</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>
      
      <!-- 历史记录列表 -->
      <div class="records-section">
        <ion-refresher slot="fixed" @ionRefresh="refreshHistory">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>
        
        <div v-if="filteredRecords.length === 0" class="empty-state">
          <ion-icon :icon="documentTextOutline" class="empty-icon"></ion-icon>
          <h3>暂无记录</h3>
          <p>{{ getEmptyMessage() }}</p>
        </div>
        
        <ion-list v-else class="records-list">
          <ion-item-sliding 
            v-for="record in filteredRecords" 
            :key="record.id"
            class="record-item-sliding"
          >
            <ion-item button @click="viewRecord(record)" class="record-item">
              <ion-icon 
                :icon="getRecordIcon(record.type)" 
                slot="start" 
                :color="getRecordColor(record.type)"
                class="record-icon"
              ></ion-icon>
              
              <ion-label class="record-label">
                <h3>{{ getRecordTitle(record) }}</h3>
                <p>{{ getRecordDescription(record) }}</p>
                <div class="record-meta">
                  <span class="record-time">{{ formatTime(record.createdAt) }}</span>
                  <ion-chip 
                    v-if="record.confidence" 
                    :color="getConfidenceColor(record.confidence)"
                    class="confidence-chip"
                  >
                    {{ (record.confidence * 100).toFixed(0) }}%
                  </ion-chip>
                </div>
              </ion-label>
            </ion-item>
            
            <ion-item-options side="end">
              <ion-item-option @click="shareRecord(record)" color="primary">
                <ion-icon :icon="shareOutline" slot="icon-only"></ion-icon>
              </ion-item-option>
              <ion-item-option @click="deleteRecord(record)" color="danger">
                <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
        
        <!-- 加载更多 -->
        <ion-infinite-scroll 
          v-if="hasMore"
          @ionInfinite="loadMore"
          threshold="100px"
        >
          <ion-infinite-scroll-content
            loading-spinner="bubbles"
            loading-text="加载更多..."
          >
          </ion-infinite-scroll-content>
        </ion-infinite-scroll>
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
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonChip,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  toastController,
  alertController
} from '@ionic/vue'
import {
  trashOutline,
  documentTextOutline,
  sparklesOutline,
  handLeftOutline,
  shareOutline
} from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { Share } from '@capacitor/share'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

// 历史记录类型
interface HistoryRecord {
  id: string
  type: 'ai' | 'gesture'
  title: string
  content: string
  originalText?: string
  optimizedText?: string
  gestureType?: string
  confidence?: number
  createdAt: Date
}

const searchText = ref('')
const activeFilter = ref('all')
const records = ref<HistoryRecord[]>([])
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 20

// 模拟历史记录数据
const generateMockRecords = (): HistoryRecord[] => {
  const mockRecords: HistoryRecord[] = []
  
  // AI优化记录
  for (let i = 0; i < 15; i++) {
    mockRecords.push({
      id: `ai_${i}`,
      type: 'ai',
      title: `AI优化记录 ${i + 1}`,
      content: `原始提示词：写一个关于${['春天', '夏天', '秋天', '冬天'][i % 4]}的诗\n优化后：请创作一首描绘${['春天', '夏天', '秋天', '冬天'][i % 4]}美景的现代诗歌，要求语言优美，意境深远。`,
      originalText: `写一个关于${['春天', '夏天', '秋天', '冬天'][i % 4]}的诗`,
      optimizedText: `请创作一首描绘${['春天', '夏天', '秋天', '冬天'][i % 4]}美景的现代诗歌，要求语言优美，意境深远。`,
      createdAt: new Date(Date.now() - i * 3600000) // 每小时一条
    })
  }
  
  // 手势识别记录
  const gestures = ['thumbup', 'fist', 'five', 'one', 'two', 'three']
  const gestureNames = ['点赞', '握拳', '张开手掌', '食指', '剪刀手', '三']
  
  for (let i = 0; i < 10; i++) {
    const gestureIndex = i % gestures.length
    mockRecords.push({
      id: `gesture_${i}`,
      type: 'gesture',
      title: `手势识别：${gestureNames[gestureIndex]}`,
      content: `识别到手势：${gestureNames[gestureIndex]}`,
      gestureType: gestures[gestureIndex],
      confidence: 0.7 + Math.random() * 0.3,
      createdAt: new Date(Date.now() - (i + 15) * 3600000)
    })
  }
  
  return mockRecords.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

// 筛选后的记录
const filteredRecords = computed(() => {
  let filtered = records.value
  
  // 按类型筛选
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(record => record.type === activeFilter.value)
  }
  
  // 按搜索文本筛选
  if (searchText.value.trim()) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(record => 
      record.title.toLowerCase().includes(search) ||
      record.content.toLowerCase().includes(search)
    )
  }
  
  return filtered
})

// 获取记录图标
const getRecordIcon = (type: string) => {
  return type === 'ai' ? sparklesOutline : handLeftOutline
}

// 获取记录颜色
const getRecordColor = (type: string) => {
  return type === 'ai' ? 'primary' : 'success'
}

// 获取记录标题
const getRecordTitle = (record: HistoryRecord) => {
  return record.title
}

// 获取记录描述
const getRecordDescription = (record: HistoryRecord) => {
  if (record.type === 'ai') {
    return record.originalText || record.content.substring(0, 50) + '...'
  } else {
    return `识别手势：${record.gestureType}`
  }
}

// 获取置信度颜色
const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return 'success'
  if (confidence >= 0.7) return 'warning'
  return 'danger'
}

// 格式化时间
const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

// 获取空状态消息
const getEmptyMessage = () => {
  if (activeFilter.value === 'ai') return '暂无AI优化记录'
  if (activeFilter.value === 'gesture') return '暂无手势识别记录'
  return '暂无历史记录，开始使用应用吧！'
}

// 搜索
const onSearch = () => {
  // 搜索逻辑已在computed中处理
}

// 筛选变化
const onFilterChange = async () => {
  await Haptics.impact({ style: ImpactStyle.Light })
}

// 刷新历史记录
const refreshHistory = async (event: any) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 重新加载数据
  records.value = generateMockRecords()
  currentPage.value = 1
  hasMore.value = true
  
  event.target.complete()
  
  const toast = await toastController.create({
    message: '刷新完成',
    duration: 1500,
    color: 'success'
  })
  await toast.present()
}

// 加载更多
const loadMore = async (event: any) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟加载更多数据
  if (currentPage.value >= 3) {
    hasMore.value = false
  } else {
    currentPage.value++
    // 这里可以加载更多数据
  }
  
  event.target.complete()
}

// 查看记录详情
const viewRecord = async (record: HistoryRecord) => {
  await Haptics.impact({ style: ImpactStyle.Light })
  
  const alert = await alertController.create({
    header: record.title,
    message: record.content,
    buttons: ['确定']
  })
  
  await alert.present()
}

// 分享记录
const shareRecord = async (record: HistoryRecord) => {
  await Haptics.impact({ style: ImpactStyle.Light })
  
  try {
    await Share.share({
      title: record.title,
      text: record.content,
      dialogTitle: '分享记录'
    })
  } catch (error) {
    console.error('分享失败:', error)
  }
}

// 删除记录
const deleteRecord = async (record: HistoryRecord) => {
  await Haptics.impact({ style: ImpactStyle.Medium })
  
  const alert = await alertController.create({
    header: '删除记录',
    message: '确定要删除这条记录吗？',
    buttons: [
      { text: '取消', role: 'cancel' },
      {
        text: '删除',
        role: 'destructive',
        handler: () => {
          records.value = records.value.filter(r => r.id !== record.id)
          
          toastController.create({
            message: '记录已删除',
            duration: 2000,
            color: 'success'
          }).then(toast => toast.present())
        }
      }
    ]
  })
  
  await alert.present()
}

// 清空所有历史记录
const clearAllHistory = async () => {
  await Haptics.impact({ style: ImpactStyle.Medium })
  
  const alert = await alertController.create({
    header: '清空历史记录',
    message: '确定要清空所有历史记录吗？此操作不可恢复。',
    buttons: [
      { text: '取消', role: 'cancel' },
      {
        text: '清空',
        role: 'destructive',
        handler: () => {
          records.value = []
          
          toastController.create({
            message: '历史记录已清空',
            duration: 2000,
            color: 'success'
          }).then(toast => toast.present())
        }
      }
    ]
  })
  
  await alert.present()
}

onMounted(() => {
  records.value = generateMockRecords()
})
</script>

<style scoped>
.history-content {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
}

.search-section {
  padding: 16px;
  background: var(--ion-color-light);
}

.history-searchbar {
  --background: #ffffff;
  --border-radius: 12px;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-section {
  padding: 0 16px 16px 16px;
  background: var(--ion-color-light);
}

.filter-segment {
  --background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.records-section {
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 18px;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.records-list {
  margin: 0;
}

.record-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 72px;
}

.record-icon {
  font-size: 24px;
  margin-right: 12px;
}

.record-label h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.record-label p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.record-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.record-time {
  font-size: 12px;
  color: #9ca3af;
}

.confidence-chip {
  height: 20px;
  font-size: 11px;
  font-weight: 600;
}

/* 深色主题 */
@media (prefers-color-scheme: dark) {
  .history-searchbar {
    --background: #374151;
  }
  
  .filter-segment {
    --background: #374151;
  }
  
  .empty-state h3 {
    color: #f9fafb;
  }
  
  .empty-state p {
    color: #d1d5db;
  }
  
  .record-label h3 {
    color: #f9fafb;
  }
  
  .record-label p {
    color: #d1d5db;
  }
  
  .record-time {
    color: #9ca3af;
  }
}
</style>