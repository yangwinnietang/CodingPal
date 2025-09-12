<template>
  <div class="help-page w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- 顶部导航 -->
    <div class="header bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <i class="i-lucide-help-circle w-5 h-5"></i>
        </div>
        <h1 class="text-lg font-semibold">使用帮助</h1>
      </div>
      <button @click="goBack" class="flex items-center space-x-2 px-3 py-2 text-white bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200">
        <i class="i-lucide-arrow-left w-5 h-5"></i>
        <span class="text-sm font-medium">返回</span>
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-4xl mx-auto p-6">
        <!-- 快速开始 -->
        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4 flex items-center">
            <i class="i-lucide-rocket w-5 h-5 mr-2 text-blue-600"></i>
            快速开始
          </h2>
          <div class="bg-blue-50 rounded-lg p-4 mb-4">
            <p class="text-gray-700 mb-3">欢迎使用多模型提示词优化智能体！按照以下步骤快速开始：</p>
            <ol class="list-decimal list-inside space-y-2 text-gray-700">
              <li>在设置页面配置API密钥（支持GLM4.5-Air、KimiK2、DeepSeek V3.1）</li>
              <li>在主页输入您的原始提示词</li>
              <li>选择要使用的AI模型</li>
              <li>点击"开始优化"按钮</li>
              <li>查看并比较不同模型的优化结果</li>
            </ol>
          </div>
        </section>

        <!-- 功能介绍 -->
        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4 flex items-center">
            <i class="i-lucide-features w-5 h-5 mr-2 text-green-600"></i>
            功能介绍
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border rounded-lg p-4">
              <h3 class="font-medium mb-2 flex items-center">
                <i class="i-lucide-brain w-4 h-4 mr-2 text-purple-600"></i>
                多模型并发优化
              </h3>
              <p class="text-sm text-gray-600">同时使用多个AI模型优化您的提示词，获得更全面的优化建议。</p>
            </div>
            <div class="border rounded-lg p-4">
              <h3 class="font-medium mb-2 flex items-center">
                <i class="i-lucide-history w-4 h-4 mr-2 text-blue-600"></i>
                历史记录管理
              </h3>
              <p class="text-sm text-gray-600">自动保存优化历史，支持搜索、收藏和导出功能。</p>
            </div>
            <div class="border rounded-lg p-4">
              <h3 class="font-medium mb-2 flex items-center">
                <i class="i-lucide-settings w-4 h-4 mr-2 text-gray-600"></i>
                灵活配置
              </h3>
              <p class="text-sm text-gray-600">支持自定义API参数、超时时间等高级设置。</p>
            </div>
            <div class="border rounded-lg p-4">
              <h3 class="font-medium mb-2 flex items-center">
                <i class="i-lucide-shield w-4 h-4 mr-2 text-green-600"></i>
                安全可靠
              </h3>
              <p class="text-sm text-gray-600">API密钥本地加密存储，确保您的数据安全。</p>
            </div>
          </div>
        </section>

        <!-- 支持的模型 -->
        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4 flex items-center">
            <i class="i-lucide-cpu w-5 h-5 mr-2 text-orange-600"></i>
            支持的AI模型
          </h2>
          <div class="space-y-4">
            <div class="border rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium">GLM4.5-Air</h3>
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">智谱AI</span>
              </div>
              <p class="text-sm text-gray-600 mb-2">智谱AI推出的高性能语言模型，擅长中文理解和生成。</p>
              <div class="text-xs text-gray-500">
                <span class="mr-4">• 响应速度快</span>
                <span class="mr-4">• 中文优化强</span>
                <span>• 成本效益高</span>
              </div>
            </div>
            <div class="border rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium">KimiK2</h3>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">月之暗面</span>
              </div>
              <p class="text-sm text-gray-600 mb-2">月之暗面开发的大语言模型，支持超长上下文处理。</p>
              <div class="text-xs text-gray-500">
                <span class="mr-4">• 长文本处理</span>
                <span class="mr-4">• 逻辑推理强</span>
                <span>• 多语言支持</span>
              </div>
            </div>
            <div class="border rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium">DeepSeek V3.1</h3>
                <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">深度求索</span>
              </div>
              <p class="text-sm text-gray-600 mb-2">深度求索推出的开源大模型，在代码和数学领域表现优异。</p>
              <div class="text-xs text-gray-500">
                <span class="mr-4">• 代码生成强</span>
                <span class="mr-4">• 数学推理好</span>
                <span>• 开源透明</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 常见问题 -->
        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4 flex items-center">
            <i class="i-lucide-message-circle-question w-5 h-5 mr-2 text-red-600"></i>
            常见问题
          </h2>
          <div class="space-y-4">
            <div class="border rounded-lg">
              <button 
                @click="toggleFaq(0)"
                class="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
              >
                <span class="font-medium">如何获取API密钥？</span>
                <i :class="openFaqs.includes(0) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-4 h-4"></i>
              </button>
              <div v-if="openFaqs.includes(0)" class="px-4 pb-4">
                <div class="text-sm text-gray-600 space-y-2">
                  <p><strong>GLM4.5-Air：</strong>访问智谱AI官网注册账号，在控制台获取API Key</p>
                  <p><strong>KimiK2：</strong>访问月之暗面官网，注册开发者账号后获取API密钥</p>
                  <p><strong>DeepSeek V3.1：</strong>访问深度求索官网，注册后在API管理页面获取密钥</p>
                </div>
              </div>
            </div>
            
            <div class="border rounded-lg">
              <button 
                @click="toggleFaq(1)"
                class="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
              >
                <span class="font-medium">为什么优化失败？</span>
                <i :class="openFaqs.includes(1) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-4 h-4"></i>
              </button>
              <div v-if="openFaqs.includes(1)" class="px-4 pb-4">
                <div class="text-sm text-gray-600 space-y-2">
                  <p>可能的原因包括：</p>
                  <ul class="list-disc list-inside ml-4 space-y-1">
                    <li>API密钥无效或已过期</li>
                    <li>网络连接问题</li>
                    <li>API服务暂时不可用</li>
                    <li>请求超时（可在设置中调整超时时间）</li>
                    <li>输入的提示词过长或包含敏感内容</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div class="border rounded-lg">
              <button 
                @click="toggleFaq(2)"
                class="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
              >
                <span class="font-medium">如何选择合适的模型？</span>
                <i :class="openFaqs.includes(2) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-4 h-4"></i>
              </button>
              <div v-if="openFaqs.includes(2)" class="px-4 pb-4">
                <div class="text-sm text-gray-600 space-y-2">
                  <p>根据您的需求选择：</p>
                  <ul class="list-disc list-inside ml-4 space-y-1">
                    <li><strong>中文内容优化：</strong>推荐GLM4.5-Air</li>
                    <li><strong>长文本处理：</strong>推荐KimiK2</li>
                    <li><strong>代码相关：</strong>推荐DeepSeek V3.1</li>
                    <li><strong>综合对比：</strong>建议同时使用多个模型</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div class="border rounded-lg">
              <button 
                @click="toggleFaq(3)"
                class="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
              >
                <span class="font-medium">数据安全如何保障？</span>
                <i :class="openFaqs.includes(3) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-4 h-4"></i>
              </button>
              <div v-if="openFaqs.includes(3)" class="px-4 pb-4">
                <div class="text-sm text-gray-600 space-y-2">
                  <ul class="list-disc list-inside space-y-1">
                    <li>API密钥采用AES加密算法本地存储</li>
                    <li>所有数据仅在本地处理，不上传到第三方服务器</li>
                    <li>历史记录存储在本地浏览器中</li>
                    <li>支持一键清除所有本地数据</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 技术支持 -->
        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4 flex items-center">
            <i class="i-lucide-headphones w-5 h-5 mr-2 text-indigo-600"></i>
            技术支持
          </h2>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-gray-700 mb-3">如果您在使用过程中遇到问题，可以通过以下方式获取帮助：</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center space-x-3">
                <i class="i-lucide-github w-5 h-5 text-gray-600"></i>
                <div>
                  <p class="font-medium">GitHub Issues</p>
                  <p class="text-sm text-gray-600">提交Bug报告或功能建议</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <i class="i-lucide-mail w-5 h-5 text-gray-600"></i>
                <div>
                  <p class="font-medium">邮件支持</p>
                  <p class="text-sm text-gray-600">发送详细问题描述</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 版本信息 -->
        <section>
          <h2 class="text-xl font-semibold mb-4 flex items-center">
            <i class="i-lucide-info w-5 h-5 mr-2 text-gray-600"></i>
            版本信息
          </h2>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">当前版本：</span>
                <span class="font-medium">v1.0.0</span>
              </div>
              <div>
                <span class="text-gray-600">更新时间：</span>
                <span class="font-medium">2024-01-15</span>
              </div>
              <div>
                <span class="text-gray-600">技术栈：</span>
                <span class="font-medium">Vue 3 + TypeScript</span>
              </div>
              <div>
                <span class="text-gray-600">许可证：</span>
                <span class="font-medium">MIT License</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const openFaqs = ref<number[]>([])

const goBack = () => {
  router.push('/')
}

const toggleFaq = (index: number) => {
  const idx = openFaqs.value.indexOf(index)
  if (idx > -1) {
    openFaqs.value.splice(idx, 1)
  } else {
    openFaqs.value.push(index)
  }
}
</script>

<style scoped>
/* 自定义样式 */
</style>