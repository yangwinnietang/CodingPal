// 手势识别工具函数
import type { GestureType, GestureResult, Point } from '@/types/gesture'
import { GESTURE_CONFIG, HAND_LANDMARKS } from '@/types/gesture'




// 计算两点之间的距离
export const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

// 计算向量角度
export const calculateAngle = (p1: Point, p2: Point, p3: Point): number => {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y }
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y }
  
  const dot = v1.x * v2.x + v1.y * v2.y
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)
  
  const cosAngle = dot / (mag1 * mag2)
  return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI)
}

// 检查手指是否伸直
export const isFingerExtended = (landmarks: Point[], fingerTip: number, fingerPip: number, fingerMcp: number): boolean => {
  const tip = landmarks[fingerTip]
  const pip = landmarks[fingerPip]
  const mcp = landmarks[fingerMcp]
  
  // 对于拇指，使用不同的逻辑
  if (fingerTip === HAND_LANDMARKS.THUMB_TIP) {
    return tip.x > pip.x // 拇指向右伸展
  }
  
  // 其他手指：检查tip是否在pip上方
  return tip.y < pip.y
}

// 检查手指是否弯曲
export const isFingerBent = (landmarks: Point[], fingerTip: number, fingerPip: number, fingerMcp: number): boolean => {


  const angle = calculateAngle(landmarks[fingerTip], landmarks[fingerPip], landmarks[fingerMcp])



  return angle < 90 // 角度小于90度认为是弯曲








}

// 主要手势识别函数
export const recognizeGesture = (landmarks: Point[]): GestureResult => {
  if (!landmarks || landmarks.length < 21) {
    return { type: 'none', confidence: 0, timestamp: Date.now() }
  }
  
  // 检查每个手指的状态
  const thumbExtended = isFingerExtended(landmarks, HAND_LANDMARKS.THUMB_TIP, HAND_LANDMARKS.THUMB_IP, HAND_LANDMARKS.THUMB_MCP)
  const indexExtended = isFingerExtended(landmarks, HAND_LANDMARKS.INDEX_FINGER_TIP, HAND_LANDMARKS.INDEX_FINGER_PIP, HAND_LANDMARKS.INDEX_FINGER_MCP)
  const middleExtended = isFingerExtended(landmarks, HAND_LANDMARKS.MIDDLE_FINGER_TIP, HAND_LANDMARKS.MIDDLE_FINGER_PIP, HAND_LANDMARKS.MIDDLE_FINGER_MCP)
  const ringExtended = isFingerExtended(landmarks, HAND_LANDMARKS.RING_FINGER_TIP, HAND_LANDMARKS.RING_FINGER_PIP, HAND_LANDMARKS.RING_FINGER_MCP)
  const pinkyExtended = isFingerExtended(landmarks, HAND_LANDMARKS.PINKY_TIP, HAND_LANDMARKS.PINKY_PIP, HAND_LANDMARKS.PINKY_MCP)
  
  const extendedCount = [thumbExtended, indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length
  
  // 手势识别逻辑
  let gestureType: GestureType = 'none'
  let confidence = 0.8
  
  // 握拳：所有手指都弯曲
  if (extendedCount === 0) {
    gestureType = 'fist'
    confidence = 0.9
  }
  // 张开手掌：所有手指都伸直
  else if (extendedCount === 5) {
    gestureType = 'five'
    confidence = 0.9
  }
  // 食指：只有食指伸直
  else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    gestureType = 'one'
    confidence = 0.85
  }
  // 胜利手势：食指和中指伸直
  else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {

    gestureType = 'two'



    confidence = 0.85
  }
  // 三个手指：食指、中指、无名指伸直
  else if (indexExtended && middleExtended && ringExtended && !pinkyExtended) {
    gestureType = 'three'
    confidence = 0.8
  }
  // 点赞：只有拇指伸直
  else if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    gestureType = 'thumbup'
    confidence = 0.9
  }
  // 手枪手势：拇指和食指伸直
  else if (thumbExtended && indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    gestureType = 'gun'
    confidence = 0.8
  }
  // 六：拇指和小指伸直
  else if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
    gestureType = 'six'
    confidence = 0.8
  }
  // 爱心手势：特殊检测逻辑
  else if (detectLoveGesture(landmarks)) {
    gestureType = 'love'
    confidence = 0.7
  }
  // 耶手势：食指和中指呈V字形
  else if (detectYeahGesture(landmarks)) {
    gestureType = 'yeah'
    confidence = 0.75
  }
  else {
    gestureType = 'unknown'
    confidence = 0.5
  }
  
  return {
    type: gestureType,
    confidence,
    timestamp: Date.now()
  }
}

// 检测爱心手势
const detectLoveGesture = (landmarks: Point[]): boolean => {
  // 简化的爱心检测：双手拇指和食指形成心形
  // 这里使用简单的距离检测
  const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP]
  const indexTip = landmarks[HAND_LANDMARKS.INDEX_FINGER_TIP]
  
  const distance = calculateDistance(thumbTip, indexTip)
  return distance < 0.1 // 拇指和食指距离很近
}

// 检测耶手势（V字手势）
const detectYeahGesture = (landmarks: Point[]): boolean => {
  const indexTip = landmarks[HAND_LANDMARKS.INDEX_FINGER_TIP]
  const middleTip = landmarks[HAND_LANDMARKS.MIDDLE_FINGER_TIP]
  const indexPip = landmarks[HAND_LANDMARKS.INDEX_FINGER_PIP]
  const middlePip = landmarks[HAND_LANDMARKS.MIDDLE_FINGER_PIP]
  
  // 检查食指和中指是否伸直且分开
  const indexExtended = indexTip.y < indexPip.y
  const middleExtended = middleTip.y < middlePip.y
  
  if (!indexExtended || !middleExtended) return false
  
  // 检查两指之间的角度
  const wrist = landmarks[HAND_LANDMARKS.WRIST]
  const angle = calculateAngle(indexTip, wrist, middleTip)
  
  return angle > 15 && angle < 60 // V字形角度范围
}

// 手势平滑处理（减少抖动）
export class GestureSmoothing {
  private history: GestureResult[] = []
  private maxHistory = 5
  
  smooth(result: GestureResult): GestureResult {
    this.history.push(result)
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }
    
    // 如果历史记录中同一手势出现次数超过阈值，则认为稳定
    const gestureCount = this.history.filter(h => h.type === result.type).length
    const threshold = Math.ceil(this.maxHistory * 0.6)
    
    if (gestureCount >= threshold) {
      const avgConfidence = this.history
        .filter(h => h.type === result.type)
        .reduce((sum, h) => sum + h.confidence, 0) / gestureCount
      
      return {
        type: result.type,
        confidence: avgConfidence,
        timestamp: result.timestamp
      }
    }
    
    return result
  }
  
  reset() {
    this.history = []
  }
}

// 手势识别统计
export class GestureStats {
  private stats = new Map<GestureType, number>()
  
  record(gesture: GestureType) {
    const count = this.stats.get(gesture) || 0
    this.stats.set(gesture, count + 1)
  }
  
  getStats() {
    return Object.fromEntries(this.stats)
  }
  
  getMostFrequent(): GestureType | null {
    let maxCount = 0
    let mostFrequent: GestureType | null = null
    
    for (const [gesture, count] of this.stats) {
      if (count > maxCount) {
        maxCount = count
        mostFrequent = gesture
      }
    }
    
    return mostFrequent
  }
  
  reset() {
    this.stats.clear()
  }
}
