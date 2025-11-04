const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const { testConnection } = require('../database/config');
const queries = require('../database/queries');

let mainWindow = null;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 20, y: 20 },
    backgroundColor: '#f5f5f7',
    vibrancy: 'sidebar', // macOS毛玻璃效果
    transparent: false,
    hasShadow: true,
    frame: true
  });

  // 开发模式加载本地服务器，生产模式加载打包文件
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../../build/index.html')}`;
  mainWindow.loadURL(startUrl);

  // 开发模式下打开开发者工具
  if (process.env.ELECTRON_START_URL) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 应用准备就绪
app.whenReady().then(async () => {
  console.log('应用启动中...');
  
  // 测试数据库连接
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('无法连接到数据库，请检查MySQL服务是否启动');
  }
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ==================== IPC 处理程序 ====================

// 任务相关
ipcMain.handle('get-all-tasks', async () => {
  try {
    return await queries.getAllTasks();
  } catch (error) {
    console.error('获取任务失败:', error);
    throw error;
  }
});

ipcMain.handle('get-tasks-by-status', async (event, status) => {
  try {
    return await queries.getTasksByStatus(status);
  } catch (error) {
    console.error('获取任务失败:', error);
    throw error;
  }
});

ipcMain.handle('get-task-by-id', async (event, taskId) => {
  try {
    return await queries.getTaskById(taskId);
  } catch (error) {
    console.error('获取任务失败:', error);
    throw error;
  }
});

ipcMain.handle('create-task', async (event, taskData) => {
  try {
    const taskId = await queries.createTask(taskData);
    return { success: true, id: taskId };
  } catch (error) {
    console.error('创建任务失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-task', async (event, taskId, taskData) => {
  try {
    await queries.updateTask(taskId, taskData);
    return { success: true };
  } catch (error) {
    console.error('更新任务失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-task', async (event, taskId) => {
  try {
    await queries.deleteTask(taskId);
    return { success: true };
  } catch (error) {
    console.error('删除任务失败:', error);
    return { success: false, error: error.message };
  }
});

// 分类相关
ipcMain.handle('get-all-categories', async () => {
  try {
    return await queries.getAllCategories();
  } catch (error) {
    console.error('获取分类失败:', error);
    throw error;
  }
});

ipcMain.handle('create-category', async (event, categoryData) => {
  try {
    const categoryId = await queries.createCategory(categoryData);
    return { success: true, id: categoryId };
  } catch (error) {
    console.error('创建分类失败:', error);
    return { success: false, error: error.message };
  }
});

// 番茄钟相关
ipcMain.handle('create-pomodoro-session', async (event, sessionData) => {
  try {
    const sessionId = await queries.createPomodoroSession(sessionData);
    return { success: true, id: sessionId };
  } catch (error) {
    console.error('创建番茄钟记录失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-pomodoro-session', async (event, sessionId, sessionData) => {
  try {
    await queries.updatePomodoroSession(sessionId, sessionData);
    return { success: true };
  } catch (error) {
    console.error('更新番茄钟记录失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-today-pomodoro-stats', async () => {
  try {
    return await queries.getTodayPomodoroStats();
  } catch (error) {
    console.error('获取统计失败:', error);
    throw error;
  }
});

ipcMain.handle('get-week-pomodoro-stats', async () => {
  try {
    return await queries.getWeekPomodoroStats();
  } catch (error) {
    console.error('获取统计失败:', error);
    throw error;
  }
});

// 统计相关
ipcMain.handle('get-task-stats', async () => {
  try {
    return await queries.getTaskStats();
  } catch (error) {
    console.error('获取统计失败:', error);
    throw error;
  }
});

ipcMain.handle('get-today-completed-tasks', async () => {
  try {
    return await queries.getTodayCompletedTasks();
  } catch (error) {
    console.error('获取统计失败:', error);
    throw error;
  }
});

// 通知相关
ipcMain.handle('show-notification', async (event, { title, body }) => {
  try {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title,
        body,
        silent: false
      });
      notification.show();
      return { success: true };
    } else {
      return { success: false, error: '系统不支持通知' };
    }
  } catch (error) {
    console.error('显示通知失败:', error);
    return { success: false, error: error.message };
  }
});

console.log('Electron主进程已启动');

