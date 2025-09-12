<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { invoke } from '@tauri-apps/api/core'

// 初始化应用
onMounted(async () => {
  try {
    // 初始化数据库等
    console.log('CodingPal 应用启动')
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
})
</script>

<template>
  <div id="app" class="h-screen w-screen bg-transparent overflow-hidden">
    <RouterView />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: transparent;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>