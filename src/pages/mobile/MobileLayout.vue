<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      
      <ion-tab-bar slot="bottom" class="mobile-tab-bar">
        <ion-tab-button 
          v-for="tab in tabs" 
          :key="tab.path"
          :tab="tab.name"
          :href="tab.path"
          class="mobile-tab-button"
        >
          <ion-icon :name="getIconName(tab.icon)" class="tab-icon"></ion-icon>
          <ion-label class="tab-label">{{ tab.title }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonRouterOutlet,
  IonIcon,
  IonLabel
} from '@ionic/vue'
import { 
  homeOutline, 
  handLeftOutline, 
  timeOutline, 
  settingsOutline
} from 'ionicons/icons'

// 底部导航配置
const tabs = [
  {
    path: '/mobile/home',
    name: 'home',
    title: 'AI优化',
    icon: 'home'
  },
  {
    path: '/mobile/gesture',
    name: 'gesture', 
    title: '手势识别',
    icon: 'hand'
  },
  {
    path: '/mobile/history',
    name: 'history',
    title: '历史记录', 
    icon: 'history'
  },
  {
    path: '/mobile/settings',
    name: 'settings',
    title: '设置',
    icon: 'settings'
  }
]

// 图标映射
const getIconName = (iconName: string) => {
  const iconMap: Record<string, string> = {
    home: homeOutline,
    hand: handLeftOutline,
    history: timeOutline,
    settings: settingsOutline
  }
  return iconMap[iconName] || homeOutline
}
</script>

<style scoped>
.mobile-tab-bar {
  --background: #ffffff;
  --border: 1px solid #e2e8f0;
  --color: #64748b;
  --color-selected: #1e40af;
  height: 60px;
}

.mobile-tab-button {
  --color: #64748b;
  --color-selected: #1e40af;
  --padding-top: 8px;
  --padding-bottom: 8px;
}

.tab-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.tab-label {
  font-size: 12px;
  font-weight: 500;
}

/* 深色主题 */
@media (prefers-color-scheme: dark) {
  .mobile-tab-bar {
    --background: #1e293b;
    --border: 1px solid #334155;
    --color: #94a3b8;
    --color-selected: #3b82f6;
  }
}
</style>