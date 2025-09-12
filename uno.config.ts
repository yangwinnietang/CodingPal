import { defineConfig, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      collections: {
        lucide: () => import('@iconify-json/lucide/icons.json').then(i => i.default)
      }
    })
  ],
  theme: {
    colors: {
      primary: '#2563eb', // 深蓝色主色调
      background: '#f8fafc', // 浅灰色背景
      surface: '#ffffff',
      text: {
        primary: '#1f2937',
        secondary: '#6b7280'
      }
    }
  }
})