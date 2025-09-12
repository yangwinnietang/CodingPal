# CodingPal - AI编程助手

一个专为Windows桌面环境设计的AI编程助手软件，基于Tauri框架构建，提供实时进程监控、GLM4.5 API集成和智能提示词优化功能。

## 🚀 功能特性

### 核心功能
- **进程监控**: 实时监控Cursor、Trae、Qoder、Kiro等AI编程IDE进程
- **GLM4.5 API集成**: 提供专业的提示词优化功能
- **多任务管理**: 支持通过文件夹方式实现AI编程多任务并发处理
- **操作记录**: 完整记录用户所有操作历史日志
- **AI虚拟形象**: 使用imgs目录下的AI状态图片，实现陪伴式交互

### 界面设计
- **主界面**: 320x240px浮动窗口，显示AI虚拟形象和状态指示器
- **控制面板**: 进程监控面板、API配置管理、任务管理器
- **设置页面**: GLM4.5 API配置、系统设置、快捷键配置
- **历史记录**: 操作日志查看、提示词优化历史、统计数据

## 🛠️ 技术架构

### 前端技术栈
- **Vue 3** + TypeScript
- **UnoCSS** - 原子化CSS框架
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Lucide Icons** - 图标库

### 后端技术栈
- **Tauri 2.x** - 跨平台桌面应用框架
- **Rust** - 系统级编程语言
- **SQLite** - 轻量级数据库
- **Sysinfo** - 系统信息获取
- **Reqwest** - HTTP客户端

### 项目结构
```
CodingPal/
├── src/                    # Vue前端源码
│   ├── components/         # 可复用组件
│   ├── pages/             # 页面组件
│   │   ├── MainPage.vue   # 主界面
│   │   └── ControlPanel.vue # 控制面板
│   ├── stores/            # Pinia状态管理
│   ├── router/            # 路由配置
│   └── main.ts           # 应用入口
├── src-tauri/             # Rust后端源码
│   ├── src/
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

### GLM API集成相关
```rust
// 初始化GLM客户端
initialize_glm_client(api_key: String) -> Result<bool, String>

// 优化提示词
optimize_prompt_with_config(prompt: String, config: OptimizationConfig) -> Result<OptimizedPrompt, String>
```

### 文件系统管理相关
```rust
// 创建任务文件夹
create_task_folder(folder_name: String) -> Result<String, String>
```

## 🔧 配置说明

### 窗口配置
- 默认尺寸: 320x240px
- 最小尺寸: 280x200px
- 最大尺寸: 600x480px
- 特性: 无边框、透明背景、置顶显示

### 数据库配置
- 数据库文件: `codingpal.db`
- 支持表: settings, api_configs, process_history, optimization_history, task_folders

### API配置
- GLM4.5 API集成
- 支持自定义endpoint
- 请求统计和错误日志

## 📝 使用说明

### 基本操作
1. **启动应用**: 双击exe文件或运行开发命令
2. **进程监控**: 应用自动检测并监控AI编程IDE进程
3. **API配置**: 在设置页面配置GLM4.5 API密钥
4. **任务管理**: 通过控制面板创建和管理编程任务
5. **状态查看**: 主界面AI虚拟形象实时反映系统工作状态

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
- **内存**: 最低512MB可用内存
- **存储**: 最低100MB可用空间
- **网络**: 需要网络连接以使用GLM4.5 API功能

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
