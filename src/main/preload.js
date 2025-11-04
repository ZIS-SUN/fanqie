const { contextBridge, ipcRenderer } = require('electron');

// 安全地暴露API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 任务相关
  getAllTasks: () => ipcRenderer.invoke('get-all-tasks'),
  getTasksByStatus: (status) => ipcRenderer.invoke('get-tasks-by-status', status),
  getTaskById: (taskId) => ipcRenderer.invoke('get-task-by-id', taskId),
  createTask: (taskData) => ipcRenderer.invoke('create-task', taskData),
  updateTask: (taskId, taskData) => ipcRenderer.invoke('update-task', taskId, taskData),
  deleteTask: (taskId) => ipcRenderer.invoke('delete-task', taskId),
  
  // 分类相关
  getAllCategories: () => ipcRenderer.invoke('get-all-categories'),
  createCategory: (categoryData) => ipcRenderer.invoke('create-category', categoryData),
  
  // 番茄钟相关
  createPomodoroSession: (sessionData) => ipcRenderer.invoke('create-pomodoro-session', sessionData),
  updatePomodoroSession: (sessionId, sessionData) => ipcRenderer.invoke('update-pomodoro-session', sessionId, sessionData),
  getTodayPomodoroStats: () => ipcRenderer.invoke('get-today-pomodoro-stats'),
  getWeekPomodoroStats: () => ipcRenderer.invoke('get-week-pomodoro-stats'),
  
  // 统计相关
  getTaskStats: () => ipcRenderer.invoke('get-task-stats'),
  getTodayCompletedTasks: () => ipcRenderer.invoke('get-today-completed-tasks'),
  
  // 通知相关
  showNotification: (data) => ipcRenderer.invoke('show-notification', data)
});

console.log('Preload script loaded');

