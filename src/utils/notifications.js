// 通知工具函数

/**
 * 显示桌面通知
 * @param {string} title - 通知标题
 * @param {string} body - 通知内容
 * @param {string} icon - 图标（可选）
 */
export async function showNotification(title, body, icon) {
  // 检查是否在Electron环境中
  if (window.electronAPI && window.electronAPI.showNotification) {
    try {
      await window.electronAPI.showNotification({ title, body });
    } catch (error) {
      console.error('显示通知失败:', error);
    }
  } 
  // 降级到浏览器通知API
  else if ('Notification' in window) {
    // 请求通知权限
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body, icon });
      }
    }
  }
}

/**
 * 番茄钟完成通知
 */
export function notifyPomodoroComplete(duration) {
  showNotification(
    '🎉 番茄钟完成！',
    `太棒了！你已经专注工作了 ${duration} 分钟。休息一下吧！`
  );
}

/**
 * 休息时间结束通知
 */
export function notifyBreakComplete() {
  showNotification(
    '⏰ 休息结束',
    '休息时间结束了，准备开始下一个番茄钟吧！'
  );
}

/**
 * 任务提醒通知
 * @param {Object} task - 任务对象
 */
export function notifyTaskReminder(task) {
  showNotification(
    '📋 任务提醒',
    `${task.title} - 该开始处理这个任务了！`
  );
}

/**
 * 任务即将到期通知
 * @param {Object} task - 任务对象
 */
export function notifyTaskDueSoon(task) {
  showNotification(
    '⚠️ 任务即将到期',
    `${task.title} 即将到期，请尽快完成！`
  );
}

/**
 * 每日总结通知
 * @param {Object} stats - 统计数据
 */
export function notifyDailySummary(stats) {
  showNotification(
    '📊 今日总结',
    `今天完成了 ${stats.completed_tasks} 个任务，专注了 ${stats.total_minutes} 分钟！`
  );
}

