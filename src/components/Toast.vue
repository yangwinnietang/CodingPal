<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="visible"
        :class="toastClasses"
        class="fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border p-4 flex items-start space-x-3"
      >
        <div class="flex-shrink-0">
          <i :class="iconClass" class="w-5 h-5"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p v-if="title" class="text-sm font-medium text-gray-900 mb-1">{{ title }}</p>
          <p class="text-sm text-gray-600">{{ message }}</p>
        </div>
        <button
          @click="close"
          class="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <i class="i-lucide-x w-4 h-4"></i>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 4000,
  persistent: false
})

const emit = defineEmits<{
  close: []
}>()

const visible = ref(false)
let timeoutId: NodeJS.Timeout | null = null

const toastClasses = computed(() => {
  const baseClasses = 'border-l-4'
  const typeClasses = {
    success: 'border-green-500 bg-green-50',
    error: 'border-red-500 bg-red-50',
    warning: 'border-yellow-500 bg-yellow-50',
    info: 'border-blue-500 bg-blue-50'
  }
  return `${baseClasses} ${typeClasses[props.type]}`
})

const iconClass = computed(() => {
  const iconMap = {
    success: 'i-lucide-check-circle text-green-500',
    error: 'i-lucide-x-circle text-red-500',
    warning: 'i-lucide-alert-triangle text-yellow-500',
    info: 'i-lucide-info text-blue-500'
  }
  return iconMap[props.type]
})

const close = () => {
  visible.value = false
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  setTimeout(() => {
    emit('close')
  }, 200)
}

const show = () => {
  visible.value = true
  
  if (!props.persistent && props.duration > 0) {
    timeoutId = setTimeout(() => {
      close()
    }, props.duration)
  }
}

defineExpose({
  show,
  close
})

onMounted(() => {
  show()
})
</script>