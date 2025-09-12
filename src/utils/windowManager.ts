import { getCurrentWindow } from '@tauri-apps/api/window'
import { LogicalSize } from '@tauri-apps/api/window'

// 窗口管理工具模块
export interface WindowSize {
  width: number
  height: number
}

// 调整窗口大小
export const adjustWindowSize = async (width: number, height: number): Promise<void> => {
  try {
    const window = getCurrentWindow()
    await window.setSize(new LogicalSize(width, height))
    console.log(`窗口大小已调整为: ${width}x${height}`)
  } catch (error) {
    console.error('调整窗口大小失败:', error)
    throw error
  }
}

// 获取当前窗口尺寸
export const getWindowSize = async (): Promise<WindowSize> => {
  try {
    const window = getCurrentWindow()
    const size = await window.outerSize()
    return {
      width: size.width,
      height: size.height
    }
  } catch (error) {
    console.error('获取窗口尺寸失败:', error)
    throw error
  }
}

// 窗口尺寸预设
export const WINDOW_PRESETS = {
  MAIN: { width: 320, height: 240 },
  SETTINGS: { width: 900, height: 650 },
  CONTROL_PANEL: { width: 950, height: 700 },
  PROMPT_OPTIMIZER: { width: 1200, height: 800 }
} as const

// 应用窗口预设
export const applyWindowPreset = async (preset: keyof typeof WINDOW_PRESETS): Promise<void> => {
  const { width, height } = WINDOW_PRESETS[preset]
  await adjustWindowSize(width, height)
}