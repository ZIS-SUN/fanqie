# 番茄待办提醒 - 安装和运行指南

## 📋 前置要求

在开始之前，请确保你的系统已安装：

1. **Node.js** (v16 或更高版本)
   - 下载地址：https://nodejs.org/
   - 安装后在终端运行 `node --version` 检查版本

2. **MySQL 数据库** (v5.7 或更高版本)
   - 下载地址：https://dev.mysql.com/downloads/mysql/
   - 确保MySQL服务已启动
   - 默认配置：root/1234

## 🚀 快速开始

### 第一步：安装依赖

打开终端，进入项目目录，运行：

```bash
cd "/Users/zishen/Desktop/new pj"
npm install
```

等待所有依赖安装完成（可能需要几分钟）。

### 第二步：启动MySQL服务

确保MySQL服务正在运行：

**macOS:**
```bash
# 使用Homebrew安装的MySQL
brew services start mysql

# 或使用系统服务
sudo /usr/local/mysql/support-files/mysql.server start
```

**检查MySQL是否运行:**
```bash
mysql -u root -p1234 -e "SELECT 1"
```

如果能正常连接，说明MySQL已启动。

### 第三步：初始化数据库

运行以下命令创建数据库和表：

```bash
npm run db:init
```

你应该看到类似的输出：
```
✓ 数据库连接成功
✓ 数据库 pomodoro_db 已创建
✓ 用户表已创建
✓ 分类表已创建
✓ 任务表已创建
✓ 番茄钟记录表已创建
✓ 默认用户已创建
✓ 默认分类已创建

🎉 数据库初始化完成！
```

### 第四步：启动应用

```bash
npm start
```

首次启动可能需要一些时间，请耐心等待。启动成功后：
- React开发服务器会在 http://localhost:3000 启动
- Electron窗口会自动打开
- 你应该能看到番茄待办应用的主界面

## 🎯 功能使用指南

### 任务管理

1. **创建任务**
   - 点击右上角"新建任务"按钮
   - 填写任务标题（必填）和其他信息
   - 点击"保存"

2. **编辑任务**
   - 点击任务卡片右侧的编辑图标
   - 修改任务信息
   - 点击"保存"

3. **删除任务**
   - 点击任务卡片右侧的删除图标
   - 确认删除

4. **更新任务状态**
   - 使用任务卡片右侧的下拉菜单快速切换状态
   - 状态：待办 → 进行中 → 已完成

### 番茄钟

1. **开始番茄钟**
   - 切换到"番茄钟"页面
   - （可选）选择一个任务关联
   - 调整工作时长和休息时长
   - 点击"开始"按钮

2. **暂停/继续**
   - 点击"暂停"按钮暂停计时
   - 点击"继续"按钮恢复计时

3. **重置**
   - 点击"重置"按钮回到初始状态

4. **通知提醒**
   - 工作时间结束时会弹出通知
   - 休息时间结束时也会提醒

### 统计报告

切换到"统计报告"页面查看：
- 任务完成情况
- 今日番茄钟统计
- 近7天番茄钟趋势

## 🛠️ 故障排除

### 问题1：npm install 失败

**解决方案：**
```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

### 问题2：无法连接数据库

**检查清单：**
- MySQL服务是否启动？
- 用户名密码是否正确（root/1234）？
- 端口3306是否被占用？

**修改数据库配置：**
编辑 `src/database/config.js` 文件，修改数据库连接信息。

### 问题3：Electron窗口无法打开

**解决方案：**
```bash
# 单独启动React开发服务器
npm run start:react

# 在另一个终端启动Electron
npm run start:electron
```

### 问题4：端口3000被占用

**解决方案：**
```bash
# 查找占用端口的进程
lsof -i :3000

# 结束进程（替换PID为实际进程ID）
kill -9 PID

# 或更改端口（修改package.json中的端口）
```

## 📦 打包应用

开发完成后，可以打包成独立应用：

```bash
npm run package
```

打包后的文件在 `dist/` 目录下：
- macOS: `.dmg` 安装包
- Windows: `.exe` 安装程序

## 🔧 开发模式

如果需要同时查看React和Electron的调试工具：

1. React开发工具：在浏览器中访问 http://localhost:3000
2. Electron开发工具：应用会自动打开DevTools

## 💡 提示

- 第一次运行记得先执行 `npm run db:init` 初始化数据库
- 数据都存储在本地MySQL数据库中
- 关闭应用不会丢失数据
- 可以在设置中自定义番茄钟时长

## 📝 数据库表结构

- **users**: 用户信息
- **categories**: 任务分类（工作、学习、生活等）
- **tasks**: 任务列表
- **pomodoro_sessions**: 番茄钟记录

## 🎉 开始使用

现在一切都准备好了！运行 `npm start` 开始使用番茄待办提醒吧！

如有问题，请检查控制台输出或查看日志信息。

