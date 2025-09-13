// 手势识别相关类型定义

// 手势类型
export type GestureType = 'fist' | 'five' | 'gun' | 'love' | 'one' | 'two' | 'six' | 'three' | 'thumbup' | 'yeah' | 'none' | 'unknown'

// 手势配置
export interface GestureConfig {
  threshold: number // 检测阈值 0.1-1.0
  fps: number // 帧率 15/30/60
  resolution: string // 分辨率 '640x480'|'1280x720'|'1920x1080'
}

// 手势识别结果
export interface GestureResult {
  type: GestureType
  confidence: number // 置信度 0-1
  timestamp: number
}

// 关键点坐标
export interface Point {
  x: number
  y: number
  z?: number
}

// 手势记录
export interface GestureRecord {
  id: number
  gesture: string // 手势名称
  icon: string // 手势图标
  confidence: number // 置信度百分比
  timestamp: string // 时间戳字符串
}

// 支持的手势定义
export interface SupportedGesture {
  type: GestureType
  name: string // 中文名称
  icon: string // emoji图标
  description?: string // 描述
}

// MediaPipe手部关键点索引
export const HAND_LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_FINGER_MCP: 5,
  INDEX_FINGER_PIP: 6,
  INDEX_FINGER_DIP: 7,
  INDEX_FINGER_TIP: 8,
  MIDDLE_FINGER_MCP: 9,
  MIDDLE_FINGER_PIP: 10,
  MIDDLE_FINGER_DIP: 11,
  MIDDLE_FINGER_TIP: 12,
  RING_FINGER_MCP: 13,
  RING_FINGER_PIP: 14,
  RING_FINGER_DIP: 15,
  RING_FINGER_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20
} as const

// 手势识别配置常量
export const GESTURE_CONFIG = {
  DEFAULT_THRESHOLD: 0.8,
  DEFAULT_FPS: 30,
  DEFAULT_RESOLUTION: '640x480',
  MAX_HISTORY_RECORDS: 50,
  FINGER_TIPS: [4, 8, 12, 16, 20], // 五个手指尖端的关键点索引
  FINGER_PIPS: [3, 6, 10, 14, 18] // 对应的PIP关节索引
} as const