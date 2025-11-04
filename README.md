# 🍅 番茄待办提醒

一款基于 Electron + React + MySQL 的桌面应用，结合番茄工作法和任务管理功能。

## 功能特性

- ✅ 任务管理（增删改查、优先级、分类）
- 🍅 番茄钟计时（可自定义时间）
- 🔔 桌面通知提醒
- 📊 工作统计和报告
- 🎨 鸿蒙极简设计风格
- 💾 MySQL数据持久化

## 技术栈

- **前端**: React 18 + Ant Design 5
- **桌面框架**: Electron 27
- **数据库**: MySQL 8.0
- **Node.js**: v16+

## 🚀 快速开始

### 方式一：一键启动（推荐）

```bash
./start.sh
```

脚本会自动检查环境、安装依赖、初始化数据库并启动应用！

### 方式二：手动启动

#### 1. 安装依赖

```bash
npm install
```

#### 2. 配置数据库

确保本地MySQL服务已启动，默认配置：
- Host: 127.0.0.1
- Port: 3306
- User: root
- Password: 1234
- Database: pomodoro_db

#### 3. 初始化数据库

```bash
npm run db:init
```

#### 4. 添加示例数据（可选）

```bash
npm run db:seed
```

#### 5. 启动应用

```bash
npm start
```

应用会自动打开窗口，支持热重载。

#### 6. 打包应用

```bash
npm run build
npm run package
```

打包后的文件在 `dist/` 目录下。

## 📚 完整文档

- 📖 [快速开始.md](./快速开始.md) - 3分钟入门指南
- 📖 [SETUP.md](./SETUP.md) - 详细安装配置指南
- 📖 [启动应用.md](./启动应用.md) - 启动和故障排除
- 📖 [测试步骤.md](./测试步骤.md) - 功能测试清单
- 📖 [功能清单.md](./功能清单.md) - 完整功能列表
- 📖 [测试报告.md](./测试报告.md) - 测试结果报告
- 📖 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 项目结构说明

## 项目结构

```
project/
├── src/
│   ├── main/              # Electron主进程
│   │   ├── main.js        # 主进程入口
│   │   └── preload.js     # 预加载脚本
│   ├── database/          # 数据库配置
│   │   ├── config.js      # 数据库连接配置
│   │   ├── init-db.js     # 数据库初始化脚本
│   │   └── queries.js     # SQL查询封装
│   └── components/        # React组件
├── public/                # 静态资源
├── build/                 # 构建输出
└── package.json           # 项目配置
```

## 开发指南

### 数据库表结构

- **users**: 用户表
- **tasks**: 任务表
- **categories**: 分类表
- **pomodoro_sessions**: 番茄钟记录表

详见 `src/database/init-db.js`

### 主要模块

1. **任务管理**: 创建、编辑、删除、分类任务
2. **番茄钟**: 25/5分钟工作/休息循环
3. **通知系统**: 任务提醒和番茄钟提醒
4. **统计报告**: 日/周/月统计分析

## 🧪 测试

```bash
npm test              # 环境检查
npm run db:test       # 数据库测试
npm run test:all      # 完整测试
```

## 许可证

MIT
