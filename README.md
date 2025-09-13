<div align="center">
  <img src="cover/cover.jpg" alt="CodingPal Cover" width="100%" />
</div>

# CodingPal - AI编程助手 | AI Programming Assistant

[English](#english) | [中文](#中文)

---

## 中文

一个跨平台的AI编程助手软件，支持Windows桌面和Android移动端，基于Tauri和Capacitor框架构建，提供实时进程监控、多模型API并发提示词优化、手势识别和智能编程辅助功能。

## 🌟 平台支持

### 🖥️ Windows桌面端
- **Tauri 2.x框架**: 基于Rust的高性能桌面应用
- **原生系统集成**: 进程监控、系统托盘、快捷键支持
- **浮动窗口**: 320x240px可调整大小的浮动窗口
- **硬件加速**: 支持GPU加速的手势识别和3D渲染

### 📱 Android移动端
- **Capacitor框架**: 跨平台移动应用开发
- **Material Design**: 遵循Google Material Design设计规范
- **原生功能**: 摄像头、存储、分享、通知等原生API
- **离线优先**: 本地数据存储，支持离线使用

## 🚀 功能特性

### 🎯 核心功能
- **进程监控**: 实时监控Cursor、Trae、Qoder、Kiro等AI编程IDE进程
- **多模型API并发优化**: 支持GLM-4、Moonshot、DeepSeek等多个AI模型同时优化提示词
- **智能提示词优化器**: 提供专业的提示词优化功能，支持模板和历史记录
- **多任务管理**: 支持通过文件夹方式实现AI编程多任务并发处理
- **操作记录**: 完整记录用户所有操作历史日志和优化结果
- **AI虚拟形象**: 使用imgs目录下的AI状态图片，实现陪伴式交互
- **手势识别**: 基于MediaPipe的21个关键点检测，支持10种静态手势识别
- **实时视觉交互**: 通过摄像头实现手势控制和交互功能
- **跨平台支持**: 同时支持Windows桌面应用和Android移动应用
- **原生性能**: 桌面端使用Rust+Tauri，移动端使用Capacitor原生集成

### 🎨 界面设计
- **主界面**: 320x240px浮动窗口，显示AI虚拟形象和状态指示器
- **控制面板**: 进程监控面板、API配置管理、任务管理器
- **提示词优化器**: 专业的提示词优化界面，支持多模型并发优化
- **历史记录**: 操作日志查看、提示词优化历史、统计数据
- **设置页面**: 多模型API配置、系统设置、快捷键配置
- **手势识别页面**: 实时摄像头预览、手势检测、配置管理、历史记录
- **移动端界面**: Material Design风格的移动端UI，支持底部导航和原生体验
- **响应式设计**: 桌面端和移动端都采用响应式设计，适配不同屏幕尺寸

### ⚡ 新增特性
- **并发优化**: 同时使用多个AI模型优化提示词，提高效率和质量
- **模型对比**: 实时对比不同AI模型的优化结果
- **智能模板**: 内置多种提示词模板，快速生成专业提示词
- **响应时间统计**: 实时显示各模型的响应时间和性能指标
- **错误处理**: 完善的错误处理和重试机制
- **手势交互**: 支持fist、five、gun、love、one、two、six、three、thumbup、yeah等10种手势
- **实时检测**: 基于MediaPipe和WebRTC摄像头访问，支持21个手部关键点实时检测
- **手势平滑**: 内置手势平滑算法，减少检测抖动，提高识别准确性
- **3D可视化**: 集成Three.js实现手部关键点3D可视化
- **消息通知**: 集成Sonner提供优雅的消息提示体验
- **移动端原生功能**: 支持摄像头、剪贴板、分享、触觉反馈等原生功能
- **离线支持**: 移动端支持离线使用和数据同步

## 🛠️ 技术架构

### 前端技术栈
- **Vue 3** + TypeScript - 现代化前端框架
- **UnoCSS** - 原子化CSS框架
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Axios** - HTTP客户端
- **Lucide Icons** - 图标库
- **MediaPipe** - 手势识别和关键点检测
- **WebRTC** - 摄像头访问和视频流处理
- **Three.js** - 3D图形渲染和可视化
- **Sonner** - 优雅的消息提示组件

### 后端技术栈
- **Tauri 2.x** - 跨平台桌面应用框架
- **Rust** - 系统级编程语言
- **SQLite** - 轻量级数据库
- **Sysinfo** - 系统信息获取
- **Reqwest** - HTTP客户端

### 支持的AI模型
- **GLM-4.5-Air** - 智谱AI的高性能模型
- **KimiK2-0905** - Kimi的长文本处理模型
- **DeepSeek-Chat** - DeepSeek的对话模型

### 项目结构
```
CodingPal/
├── src/                    # Vue前端源码
│   ├── components/         # 可复用组件
│   │   └── Toast.vue      # 消息提示组件
│   ├── pages/             # 页面组件
│   │   ├── MainPage.vue   # 主界面
│   │   ├── ControlPanel.vue # 控制面板
│   │   ├── PromptOptimizer.vue # 提示词优化器
│   │   ├── PromptHistory.vue # 优化历史
│   │   ├── SettingsPage.vue # 设置页面
│   │   └── GesturePage.vue # 手势识别页面
│   ├── services/          # 业务服务
│   │   ├── api-client.ts  # API客户端
│   │   ├── concurrent-optimizer.ts # 并发优化器
│   │   ├── storage.ts     # 存储服务
│   │   └── toast.ts       # 消息服务
│   ├── types/             # 类型定义
│   │   ├── prompt-optimizer.ts # 优化器类型
│   │   └── gesture.ts     # 手势识别类型
│   ├── utils/             # 工具函数
│   │   ├── windowManager.ts # 窗口管理
│   │   └── gestureRecognition.ts # 手势识别算法
│   ├── stores/            # Pinia状态管理
│   ├── router/            # 路由配置
│   └── main.ts           # 应用入口
├── src-tauri/             # Rust后端源码
│   ├── src/
│   │   ├── services/      # 后端服务
│   │   │   ├── database.rs # 数据库服务
│   │   │   ├── glm_api.rs # GLM API服务
│   │   │   └── process_monitor.rs # 进程监控
│   │   ├── gesture_service.rs # 手势识别服务
│   │   ├── lib.rs        # 核心功能实现
│   │   └── main.rs       # 应用入口
│   ├── Cargo.toml        # Rust依赖配置
│   └── tauri.conf.json   # Tauri配置
├── imgs/                  # AI虚拟形象图片
│   ├── rest.png          # 休息状态
│   ├── thinking.png      # 思考状态
│   ├── welcome.png       # 欢迎状态
│   └── working.png       # 工作状态
└── package.json          # 前端依赖配置
```

## 📦 安装与运行

### 环境要求
- Node.js 18+
- Rust 1.77.2+
- Windows 10/11
- 摄像头设备（用于手势识别功能）
- 现代浏览器（支持WebRTC和MediaPipe）

### 开发环境设置

1. **安装依赖**
```bash
npm install
```

2. **开发模式运行**
```bash
npm run tauri:dev
```

3. **构建生产版本**
```bash
npm run tauri:build
```

### 可用脚本

- `npm run dev` - 启动Vite开发服务器
- `npm run build` - 构建前端资源
- `npm run tauri:dev` - 启动Tauri开发模式
- `npm run tauri:build` - 构建桌面应用exe文件
- `npm run lint` - 代码检查
- `npm run lint:fix` - 自动修复代码问题

## 🎯 核心API

### 进程监控相关
```rust
// 获取IDE进程列表
get_ide_processes() -> Result<Vec<IDEProcess>, String>
```

### 多模型API集成相关
```typescript
// 并发优化提示词
async optimize(prompt: string, configs: ApiConfig[]): Promise<OptimizationResult[]>

// 验证API密钥
async validateApiKey(config: ApiConfig): Promise<boolean>

// 获取模型状态
async getModelStatus(modelName: string): Promise<'online' | 'offline' | 'error'>
```

### 手势识别相关
```rust
// 获取手势配置
get_gesture_configs() -> Result<Vec<GestureConfig>, String>

// 保存手势记录
save_gesture_record(gesture_type: String, confidence: f64) -> Result<i64, String>

// 获取手势历史
get_gesture_history(limit: Option<i32>) -> Result<Vec<GestureRecord>, String>

// 获取手势统计
get_gesture_stats() -> Result<GestureStats, String>
```

### 文件系统管理相关
```rust
// 创建任务文件夹
create_task_folder(folder_name: String) -> Result<String, String>

// 保存优化历史
save_optimization_history(history: PromptHistory) -> Result<String, String>
```

## 📱 Android移动端开发

### 移动端特性
- **跨平台支持**: 基于Capacitor框架，将Vue3应用打包为原生Android应用
- **移动端UI**: 使用Ionic Framework组件，提供原生移动端体验
- **手势识别**: 移动端摄像头手势检测，支持前后摄像头切换
- **离线存储**: SQLite本地数据库，支持离线使用
- **原生功能**: 集成摄像头、剪贴板、分享、触觉反馈等原生功能
- **Material Design**: 遵循Material Design设计规范

### Android开发环境配置

1. **安装Android Studio**
   - 下载并安装Android Studio
   - 安装Android SDK (API Level 24+)
   - 配置ANDROID_HOME环境变量

2. **配置SDK路径**
   ```bash
   # 编辑 android/local.properties 文件
   sdk.dir=C:\Users\YourUsername\AppData\Local\Android\Sdk
   ```

3. **安装Capacitor依赖**
   ```bash
   npm install @capacitor/core @capacitor/android
   npm install @ionic/vue @ionic/vue-router
   npm install @capacitor/camera @capacitor/clipboard @capacitor/share
   ```

### 构建Android APK

1. **自动构建脚本**
   ```bash
   # 运行自动构建脚本
   .\build-android.bat
   ```

2. **手动构建步骤**
   ```bash
   # 1. 构建Web应用
   npm run build
   
   # 2. 同步到Android项目
   npx cap sync android
   
   # 3. 构建APK
   cd android
   .\gradlew assembleDebug
   ```

3. **APK输出位置**
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

### 移动端页面结构
```
src/pages/mobile/
├── MobileLayout.vue      # 移动端布局组件
├── MobileHome.vue        # AI优化主页面
├── MobileGesture.vue     # 手势识别页面
├── MobileSettings.vue    # 设置页面
└── MobileHistory.vue     # 历史记录页面
```

### 移动端技术栈
- **Capacitor 5.0** - 跨平台移动应用框架
- **Ionic Vue** - 移动端UI组件库
- **Vue 3 + TypeScript** - 前端框架
- **TensorFlow Lite** - 移动端AI推理
- **MediaPipe** - 手势识别
- **SQLite** - 本地数据存储

### Android权限配置
```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### 移动端功能特性
- **底部导航**: Material Design风格的Tab导航
- **手势识别**: 支持前后摄像头，实时手势检测
- **触觉反馈**: 按钮点击震动反馈
- **分享功能**: 原生分享API集成
- **剪贴板**: 复制粘贴功能
- **离线模式**: 本地数据缓存和同步
- **响应式设计**: 适配不同屏幕尺寸

## 🔧 配置说明

### 窗口配置
- 默认尺寸: 320x240px
- 最小尺寸: 280x200px
- 最大尺寸: 600x480px
- 特性: 无边框、透明背景、置顶显示

### 数据库配置
- 数据库文件: `codingpal.db`
- 支持表: settings, api_configs, process_history, optimization_history, task_folders, gesture_configs, gesture_records, keypoint_data

### API配置
- 多模型API集成（GLM-4、Moonshot、DeepSeek）
- 支持自定义endpoint和参数配置
- 并发请求和响应时间统计
- 完善的错误处理和重试机制

### 响应式字体配置
- **字体大小**: 使用clamp()函数实现响应式字体，支持text-xs(12-14px)、text-sm(14-16px)、text-lg(16-18px)、text-xl(18-20px)
- **自适应范围**: 字体在320px-1920px屏幕宽度范围内平滑缩放，已优化为更适合阅读的尺寸
- **配置文件**: tailwind.config.js中的fontSize配置项定义了所有响应式字体规则
- **使用方法**: 在Vue组件中直接使用Tailwind字体类，如class="text-lg"即可获得响应式效果
- **最新调整**: 已将text-lg和text-xl的字体大小适当降低，提供更好的阅读体验和页面布局效果

## 📝 使用说明

### 基本操作
1. **启动应用**: 双击exe文件或运行开发命令
2. **进程监控**: 应用自动检测并监控AI编程IDE进程
3. **API配置**: 在设置页面配置多个AI模型的API密钥
4. **提示词优化**: 使用提示词优化器进行多模型并发优化
5. **历史管理**: 查看和管理提示词优化历史记录
6. **任务管理**: 通过控制面板创建和管理编程任务
7. **状态查看**: 主界面AI虚拟形象实时反映系统工作状态
8. **手势识别**: 点击手势识别按钮进入手势识别页面
9. **摄像头权限**: 首次使用需要授权摄像头访问权限
10. **手势配置**: 在配置页面调整检测阈值和参数
11. **手势历史**: 查看手势识别历史记录和统计数据

### 手势识别功能
- **支持手势**: 握拳(fist)、张开(five)、手枪(gun)、爱心(love)、食指(one)、二指(two)、六(six)、三(three)、点赞(thumbup)、耶(yeah)
- **检测精度**: 基于MediaPipe 21个手部关键点的高精度检测
- **实时性能**: 支持15-60FPS的实时检测，可配置分辨率
- **配置选项**: 可调节检测阈值(0.1-1.0)、帧率(15/30/60)、分辨率(640x480/1280x720/1920x1080)等参数
- **数据存储**: 自动保存手势识别历史和统计数据到SQLite数据库
- **平滑算法**: 内置手势平滑处理，减少误检和抖动
- **3D可视化**: 使用Three.js渲染手部关键点3D模型
- **实时反馈**: 显示置信度、检测状态和性能指标

### 提示词优化功能
1. **输入提示词**: 在优化器页面输入原始提示词
2. **选择模型**: 启用需要使用的AI模型
3. **并发优化**: 系统同时调用多个模型进行优化
4. **结果对比**: 实时查看不同模型的优化结果
5. **保存收藏**: 将满意的结果保存到历史记录

### 快捷操作
- 点击设置按钮: 打开设置页面
- 点击控制面板按钮: 打开控制面板
- 点击最小化按钮: 最小化到系统托盘

### AI状态说明
- **欢迎状态** (welcome.png): 应用启动时显示
- **休息状态** (rest.png): 无IDE进程运行时显示
- **思考状态** (thinking.png): 检测到IDE进程但CPU使用率较低
- **工作状态** (working.png): 检测到IDE进程且CPU使用率较高

## 🔒 系统要求

- **操作系统**: Windows 10/11 (64位)
- **内存**: 最低1GB可用内存（手势识别需要更多内存）
- **存储**: 最低200MB可用空间
- **网络**: 需要网络连接以使用AI API功能
- **摄像头**: USB摄像头或内置摄像头（用于手势识别）
- **显卡**: 支持硬件加速的显卡（推荐，用于更好的性能）

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📞 支持与反馈

如有问题或建议，请通过以下方式联系：
- 创建 GitHub Issue
- 发送邮件至项目维护者

---

**CodingPal** - 让AI编程更高效，让开发更智能！

---

## English

A cross-platform AI programming assistant supporting both Windows desktop and Android mobile platforms, built with Tauri and Capacitor frameworks, providing real-time process monitoring, multi-model API concurrent prompt optimization, gesture recognition, and intelligent programming assistance.

## 🌟 Platform Support

### 🖥️ Windows Desktop
- **Tauri 2.x Framework**: High-performance desktop app based on Rust
- **Native System Integration**: Process monitoring, system tray, hotkey support
- **Floating Window**: Resizable 320x240px floating window
- **Hardware Acceleration**: GPU-accelerated gesture recognition and 3D rendering

### 📱 Android Mobile
- **Capacitor Framework**: Cross-platform mobile app development
- **Material Design**: Following Google Material Design guidelines
- **Native Features**: Camera, storage, sharing, notifications and other native APIs
- **Offline First**: Local data storage with offline support

## 🚀 Features

### 🎯 Core Functions
- **Process Monitoring**: Real-time monitoring of AI programming IDEs like Cursor, Trae, Qoder, Kiro
- **Multi-Model Concurrent Optimization**: Support for GLM-4, Moonshot, DeepSeek and other AI models for simultaneous prompt optimization
- **Smart Prompt Optimizer**: Professional prompt optimization with templates and history management
- **Multi-Task Management**: Support for AI programming multi-task concurrent processing through folder management
- **Operation Records**: Complete logging of all user operations and optimization results
- **AI Avatar**: Interactive AI companion using status images from imgs directory
- **Gesture Recognition**: MediaPipe-based 21-point hand landmark detection supporting 10 static gestures
- **Real-time Visual Interaction**: Camera-based gesture control and interaction features
- **Cross-platform Support**: Supports both Windows desktop and Android mobile applications
- **Native Performance**: Desktop uses Rust+Tauri, mobile uses Capacitor native integration

### 🎨 Interface Design
- **Main Interface**: 320x240px floating window with AI avatar and status indicators
- **Control Panel**: Process monitoring panel, API configuration management, task manager
- **Prompt Optimizer**: Professional prompt optimization interface with multi-model concurrent optimization
- **History Records**: Operation logs, prompt optimization history, and statistics
- **Settings Page**: Multi-model API configuration, system settings, hotkey configuration

### ⚡ New Features
- **Concurrent Optimization**: Use multiple AI models simultaneously to optimize prompts for better efficiency and quality
- **Model Comparison**: Real-time comparison of optimization results from different AI models
- **Smart Templates**: Built-in prompt templates for quick professional prompt generation
- **Response Time Statistics**: Real-time display of response times and performance metrics for each model
- **Error Handling**: Comprehensive error handling and retry mechanisms
- **Gesture Interaction**: Support for fist, five, gun, love, one, two, six, three, thumbup, yeah gestures
- **Real-time Detection**: MediaPipe and WebRTC-based real-time 21-point hand landmark detection
- **Gesture Smoothing**: Built-in gesture smoothing algorithms to reduce detection jitter
- **3D Visualization**: Three.js integration for 3D hand landmark visualization
- **Elegant Notifications**: Sonner integration for beautiful message notifications
- **Mobile Native Features**: Support for camera, clipboard, sharing, haptic feedback and other native features
- **Offline Support**: Mobile app supports offline usage and data synchronization

## 🛠️ Technical Architecture

### Frontend Stack
- **Vue 3** + TypeScript - Modern frontend framework
- **UnoCSS** - Atomic CSS framework
- **Pinia** - State management
- **Vue Router** - Routing management
- **Axios** - HTTP client
- **Lucide Icons** - Icon library
- **MediaPipe** - Hand gesture recognition and landmark detection
- **WebRTC** - Camera access and video stream processing
- **Three.js** - 3D graphics rendering and visualization
- **Sonner** - Elegant toast notification component

### Backend Stack
- **Tauri 2.x** - Cross-platform desktop application framework
- **Rust** - Systems programming language
- **SQLite** - Lightweight database
- **Sysinfo** - System information retrieval
- **Reqwest** - HTTP client

### Supported AI Models
- **GLM-4-Air** - High-performance model from Zhipu AI
- **Moonshot-v1-8k** - Long-text processing model from Kimi
- **DeepSeek-Chat** - Conversational model from DeepSeek

## 📦 Installation & Running

### Requirements
- Node.js 18+
- Rust 1.77.2+
- Windows 10/11
- Camera device (for gesture recognition features)
- Modern browser (supporting WebRTC and MediaPipe)

### Development Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Run Development Mode**
```bash
npm run tauri:dev
```

3. **Build Production Version**
```bash
npm run tauri:build
```

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build frontend assets
- `npm run tauri:dev` - Start Tauri development mode
- `npm run tauri:build` - Build desktop application exe file
- `npm run lint` - Code linting
- `npm run lint:fix` - Auto-fix code issues

## 🎯 Core APIs

### Process Monitoring
```rust
// Get IDE process list
get_ide_processes() -> Result<Vec<IDEProcess>, String>
```

### Multi-Model API Integration
```typescript
// Concurrent prompt optimization
async optimize(prompt: string, configs: ApiConfig[]): Promise<OptimizationResult[]>

// Validate API key
async validateApiKey(config: ApiConfig): Promise<boolean>

// Get model status
async getModelStatus(modelName: string): Promise<'online' | 'offline' | 'error'>
```

### File System Management
```rust
// Create task folder
create_task_folder(folder_name: String) -> Result<String, String>

// Save optimization history
save_optimization_history(history: PromptHistory) -> Result<String, String>
```

## 🔧 Configuration

### Window Configuration
- Default size: 320x240px
- Minimum size: 280x200px
- Maximum size: 600x480px
- Features: Borderless, transparent background, always on top

### Database Configuration
- Database file: `codingpal.db`
- Supported tables: settings, api_configs, process_history, optimization_history, task_folders

### API Configuration
- Multi-model API integration (GLM-4, Moonshot, DeepSeek)
- Support for custom endpoints and parameter configuration
- Concurrent requests and response time statistics
- Comprehensive error handling and retry mechanisms

## 📝 Usage Guide

### Basic Operations
1. **Launch Application**: Double-click exe file or run development command
2. **Process Monitoring**: Application automatically detects and monitors AI programming IDE processes
3. **API Configuration**: Configure multiple AI model API keys in settings page
4. **Prompt Optimization**: Use prompt optimizer for multi-model concurrent optimization
5. **History Management**: View and manage prompt optimization history records
6. **Task Management**: Create and manage programming tasks through control panel
7. **Status Monitoring**: Main interface AI avatar reflects real-time system working status

### Prompt Optimization Features
1. **Input Prompt**: Enter original prompt in optimizer page
2. **Select Models**: Enable AI models you want to use
3. **Concurrent Optimization**: System calls multiple models simultaneously for optimization
4. **Compare Results**: View optimization results from different models in real-time
5. **Save Favorites**: Save satisfactory results to history records

### Keyboard Shortcuts
- Click Settings Button: Open settings page
- Click Control Panel Button: Open control panel
- Click Minimize Button: Minimize to system tray

### AI Status Indicators
- **Welcome Status** (welcome.png): Displayed when application starts
- **Rest Status** (rest.png): Displayed when no IDE processes are running
- **Thinking Status** (thinking.png): Displayed when IDE processes detected but CPU usage is low
- **Working Status** (working.png): Displayed when IDE processes detected and CPU usage is high

## 🔒 System Requirements

- **Operating System**: Windows 10/11 (64-bit)
- **Memory**: Minimum 1GB available memory (gesture recognition requires more memory)
- **Storage**: Minimum 200MB available space
- **Network**: Internet connection required for AI API functionality
- **Camera**: USB camera or built-in camera (for gesture recognition)
- **Graphics**: Hardware-accelerated graphics card (recommended for better performance)

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support & Feedback

For questions or suggestions, please contact us through:
- Create a GitHub Issue
- Email project maintainers

---

**CodingPal** - Making AI programming more efficient and development smarter!
