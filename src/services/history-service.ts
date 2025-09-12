// 历史记录管理服务
import type { OptimizationRecord, ModelResult, HistoryService as IHistoryService } from '../types/prompt-optimizer'
import { STORAGE_KEYS } from '../types/prompt-optimizer'

// 历史记录管理服务实现类
export class HistoryService implements IHistoryService {
  private readonly MAX_RECORDS = 1000 // 最大记录数量

  // 生成唯一ID
  private generateId(): string {
    return `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 保存优化记录
  async saveRecord(record: OptimizationRecord): Promise<void> {
    try {
      const history = this.getHistory()
      
      // 设置记录ID和创建时间
      const newRecord: OptimizationRecord = {
        ...record,
        id: record.id || this.generateId(),
        createdAt: record.createdAt || new Date(),
        results: record.results.map(result => ({
          ...result,
          recordId: record.id || this.generateId()
        }))
      }
      
      // 添加到历史记录开头
      history.unshift(newRecord)
      
      // 限制记录数量
      if (history.length > this.MAX_RECORDS) {
        history.splice(this.MAX_RECORDS)
      }
      
      // 保存到本地存储
      localStorage.setItem(STORAGE_KEYS.OPTIMIZATION_HISTORY, JSON.stringify(history))
    } catch (error) {
      console.error('保存历史记录失败:', error)
      throw new Error('保存历史记录失败')
    }
  }

  // 获取所有历史记录
  getHistory(): OptimizationRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OPTIMIZATION_HISTORY)
      if (!stored) return []
      
      const records = JSON.parse(stored)
      // 确保日期对象正确解析
      return records.map((record: any) => ({
        ...record,
        createdAt: new Date(record.createdAt)
      }))
    } catch (error) {
      console.error('获取历史记录失败:', error)
      return []
    }
  }

  // 根据ID获取单个记录
  getRecordById(id: string): OptimizationRecord | null {
    const history = this.getHistory()
    return history.find(record => record.id === id) || null
  }

  // 删除记录
  async deleteRecord(id: string): Promise<void> {
    try {
      const history = this.getHistory()
      const filteredHistory = history.filter(record => record.id !== id)
      
      localStorage.setItem(STORAGE_KEYS.OPTIMIZATION_HISTORY, JSON.stringify(filteredHistory))
    } catch (error) {
      console.error('删除历史记录失败:', error)
      throw new Error('删除历史记录失败')
    }
  }

  // 批量删除记录
  async deleteRecords(ids: string[]): Promise<void> {
    try {
      const history = this.getHistory()
      const filteredHistory = history.filter(record => !ids.includes(record.id))
      
      localStorage.setItem(STORAGE_KEYS.OPTIMIZATION_HISTORY, JSON.stringify(filteredHistory))
    } catch (error) {
      console.error('批量删除历史记录失败:', error)
      throw new Error('批量删除历史记录失败')
    }
  }

  // 清空所有历史记录
  async clearHistory(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEYS.OPTIMIZATION_HISTORY)
    } catch (error) {
      console.error('清空历史记录失败:', error)
      throw new Error('清空历史记录失败')
    }
  }

  // 搜索记录
  searchRecords(query: string): OptimizationRecord[] {
    if (!query.trim()) return this.getHistory()
    
    const history = this.getHistory()
    const lowerQuery = query.toLowerCase()
    
    return history.filter(record => {
      // 搜索原始提示词
      if (record.originalPrompt.toLowerCase().includes(lowerQuery)) {
        return true
      }
      
      // 搜索优化结果
      return record.results.some(result => 
        result.optimizedPrompt.toLowerCase().includes(lowerQuery) ||
        result.modelName.toLowerCase().includes(lowerQuery)
      )
    })
  }

  // 按日期范围筛选记录
  getRecordsByDateRange(startDate: Date, endDate: Date): OptimizationRecord[] {
    const history = this.getHistory()
    
    return history.filter(record => {
      const recordDate = new Date(record.createdAt)
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  // 按模型筛选记录
  getRecordsByModel(modelName: string): OptimizationRecord[] {
    const history = this.getHistory()
    
    return history.filter(record => 
      record.selectedModels.includes(modelName) ||
      record.results.some(result => result.modelName === modelName)
    )
  }

  // 获取统计信息
  getStatistics() {
    const history = this.getHistory()
    
    if (history.length === 0) {
      return {
        totalRecords: 0,
        totalOptimizations: 0,
        modelUsage: {},
        averageResponseTime: 0,
        successRate: 0
      }
    }
    
    let totalOptimizations = 0
    let totalResponseTime = 0
    let successfulOptimizations = 0
    const modelUsage: Record<string, number> = {}
    
    history.forEach(record => {
      record.results.forEach(result => {
        totalOptimizations++
        totalResponseTime += result.responseTime
        
        if (!result.error) {
          successfulOptimizations++
        }
        
        modelUsage[result.modelName] = (modelUsage[result.modelName] || 0) + 1
      })
    })
    
    return {
      totalRecords: history.length,
      totalOptimizations,
      modelUsage,
      averageResponseTime: totalOptimizations > 0 ? Math.round(totalResponseTime / totalOptimizations) : 0,
      successRate: totalOptimizations > 0 ? Math.round((successfulOptimizations / totalOptimizations) * 100) : 0
    }
  }

  // 导出历史记录为JSON
  exportHistory(): string {
    const history = this.getHistory()
    return JSON.stringify(history, null, 2)
  }

  // 从JSON导入历史记录
  async importHistory(jsonData: string): Promise<void> {
    try {
      const importedRecords = JSON.parse(jsonData) as OptimizationRecord[]
      
      // 验证数据格式
      if (!Array.isArray(importedRecords)) {
        throw new Error('导入数据格式不正确')
      }
      
      const currentHistory = this.getHistory()
      
      // 合并记录，避免重复
      const existingIds = new Set(currentHistory.map(record => record.id))
      const newRecords = importedRecords.filter(record => !existingIds.has(record.id))
      
      const mergedHistory = [...newRecords, ...currentHistory]
      
      // 限制记录数量
      if (mergedHistory.length > this.MAX_RECORDS) {
        mergedHistory.splice(this.MAX_RECORDS)
      }
      
      localStorage.setItem(STORAGE_KEYS.OPTIMIZATION_HISTORY, JSON.stringify(mergedHistory))
    } catch (error) {
      console.error('导入历史记录失败:', error)
      throw new Error('导入历史记录失败：数据格式不正确')
    }
  }

  // 获取分页记录
  getPaginatedRecords(page: number, pageSize: number = 20) {
    const history = this.getHistory()
    const totalRecords = history.length
    const totalPages = Math.ceil(totalRecords / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    return {
      records: history.slice(startIndex, endIndex),
      currentPage: page,
      totalPages,
      totalRecords,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  }

  // 更新记录评分
  async updateRecordRating(recordId: string, resultId: string, rating: number): Promise<void> {
    try {
      const history = this.getHistory()
      const recordIndex = history.findIndex(record => record.id === recordId)
      
      if (recordIndex === -1) {
        throw new Error('记录不存在')
      }
      
      const resultIndex = history[recordIndex].results.findIndex(result => result.id === resultId)
      
      if (resultIndex === -1) {
        throw new Error('结果不存在')
      }
      
      history[recordIndex].results[resultIndex].userRating = rating
      
      localStorage.setItem(STORAGE_KEYS.OPTIMIZATION_HISTORY, JSON.stringify(history))
    } catch (error) {
      console.error('更新记录评分失败:', error)
      throw new Error('更新记录评分失败')
    }
  }

  // 获取最近的记录
  getRecentRecords(limit: number = 10): OptimizationRecord[] {
    const history = this.getHistory()
    return history.slice(0, limit)
  }

  // 检查存储空间使用情况
  getStorageInfo() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OPTIMIZATION_HISTORY) || '[]'
      const sizeInBytes = new Blob([data]).size
      const sizeInKB = Math.round(sizeInBytes / 1024)
      const sizeInMB = Math.round(sizeInKB / 1024 * 100) / 100
      
      return {
        recordCount: this.getHistory().length,
        sizeInBytes,
        sizeInKB,
        sizeInMB,
        maxRecords: this.MAX_RECORDS
      }
    } catch {
      return {
        recordCount: 0,
        sizeInBytes: 0,
        sizeInKB: 0,
        sizeInMB: 0,
        maxRecords: this.MAX_RECORDS
      }
    }
  }
}

// 导出单例实例
export const historyService = new HistoryService()