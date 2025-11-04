# 项目文件结构

```
new pj/
│
├── 📄 package.json              # 项目配置和依赖
├── 📄 .gitignore               # Git忽略文件
├── 📄 README.md                # 项目说明文档
├── 📄 SETUP.md                 # 详细安装指南
├── 📄 快速开始.md              # 3分钟快速入门
├── 📄 prd.md                   # 产品需求文档
├── 📄 start.sh                 # 一键启动脚本
│
├── 📁 public/                  # 静态资源
│   └── index.html              # HTML入口文件
│
└── 📁 src/                     # 源代码
    │
    ├── 📄 index.js             # React入口文件
    ├── 📄 index.css            # 全局样式
    ├── 📄 App.js               # 主应用组件
    ├── 📄 App.css              # 应用样式
    │
    ├── 📁 main/                # Electron主进程
    │   ├── main.js             # 主进程入口
    │   └── preload.js          # 预加载脚本（安全桥接）
    │
    ├── 📁 database/            # 数据库相关
    │   ├── config.js           # 数据库连接配置
    │   ├── init-db.js          # 数据库初始化脚本
    │   └── queries.js          # SQL查询封装
    │
    └── 📁 components/          # React组件
        ├── TaskList.js         # 任务列表组件
        ├── PomodoroTimer.js    # 番茄钟组件
        └── Statistics.js       # 统计报告组件
```

## 📦 构建后的文件

运行 `npm run build` 后会生成：

```
├── 📁 build/                   # React构建输出
└── 📁 dist/                    # Electron打包输出
    ├── 番茄待办提醒.app        # macOS应用
    ├── 番茄待办提醒.dmg        # macOS安装包
    └── ...
```

## 🗄️ 数据库表结构

- **users** - 用户信息表
- **categories** - 任务分类表（工作、学习、生活等）
- **tasks** - 任务列表表
- **pomodoro_sessions** - 番茄钟记录表

## 🔧 关键文件说明

### package.json
项目配置文件，包含：
- 项目依赖（React、Electron、Ant Design、MySQL等）
- 运行脚本（start、build、package等）
- Electron打包配置

### src/main/main.js
Electron主进程，负责：
- 创建应用窗口
- 处理IPC通信（与前端通信）
- 数据库操作桥接
- 系统通知

### src/main/preload.js
安全桥接脚本，暴露API给前端：
- 任务管理API
- 番茄钟API
- 统计API
- 通知API

### src/database/config.js
数据库连接配置：
- 主机：localhost
- 端口：3306
- 用户：root
- 密码：1234
- 数据库：pomodoro_db

### src/database/init-db.js
数据库初始化脚本：
- 创建数据库
- 创建表结构
- 初始化默认数据

### src/database/queries.js
SQL查询封装，提供：
- 任务CRUD操作
- 分类管理
- 番茄钟记录
- 统计查询

### src/App.js
主应用组件：
- 左侧导航菜单
- 页面路由切换
- 数据加载管理

### src/components/TaskList.js
任务列表组件：
- 任务展示（支持筛选）
- 任务创建/编辑
- 任务状态更新
- 任务删除

### src/components/PomodoroTimer.js
番茄钟组件：
- 倒计时功能
- 开始/暂停/重置
- 工作/休息切换
- 关联任务选择
- 今日统计展示

### src/components/Statistics.js
统计报告组件：
- 任务完成统计
- 番茄钟统计
- 近7天趋势
- 数据可视化

## 🚀 开发命令

```bash
npm install          # 安装依赖
npm run db:init      # 初始化数据库
npm start            # 启动开发模式
npm run build        # 构建生产版本
npm run package      # 打包为可执行文件
```

## 📝 注意事项

1. 首次运行前必须执行 `npm run db:init` 初始化数据库
2. 确保MySQL服务正在运行
3. 默认数据库账号：root/1234（可在config.js中修改）
4. 开发模式下会自动打开DevTools
5. 生产打包需要先构建React应用

