<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue' // Ionic组件
import { onMounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'

// 移动端初始化
onMounted(async () => {
  if (Capacitor.isNativePlatform()) {
    // 隐藏状态栏在启动时
    await StatusBar.hide()
    // 延迟显示状态栏
    setTimeout(async () => {
      await StatusBar.show()
    }, 1000)
  }
})
</script>

<style>
/* 移动端全局样式 */
ion-app {
  --ion-background-color: #f8fafc;
  --ion-text-color: #1e293b;
  --ion-color-primary: #1e40af;
  --ion-color-primary-rgb: 30, 64, 175;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255, 255, 255;
  --ion-color-primary-shade: #1a369a;
  --ion-color-primary-tint: #3b82f6;
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  ion-app {
    --ion-background-color: #0f172a;
    --ion-text-color: #f1f5f9;
  }
}
</style>