// 导出任务数据为CSV或JSON

/**
 * 将任务数据导出为CSV格式
 * @param {Array} tasks - 任务列表
 * @returns {string} CSV格式的字符串
 */
export function exportTasksToCSV(tasks) {
  if (!tasks || tasks.length === 0) {
    return '';
  }

  // CSV表头
  const headers = [
    'ID',
    '标题',
    '描述',
    '状态',
    '优先级',
    '分类',
    '截止时间',
    '创建时间',
    '完成时间'
  ];

  // CSV行数据
  const rows = tasks.map(task => [
    task.id,
    `"${task.title}"`,
    `"${task.description || ''}"`,
    task.status,
    task.priority,
    task.category_name || '',
    task.due_date || '',
    task.created_at,
    task.completed_at || ''
  ]);

  // 组合CSV内容
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

/**
 * 将任务数据导出为JSON格式
 * @param {Array} tasks - 任务列表
 * @returns {string} JSON格式的字符串
 */
export function exportTasksToJSON(tasks) {
  return JSON.stringify(tasks, null, 2);
}

/**
 * 下载文件到本地
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 * @param {string} contentType - 文件类型
 */
export function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * 导出任务为CSV文件
 * @param {Array} tasks - 任务列表
 * @param {string} filename - 文件名（可选）
 */
export function exportTasksAsCSV(tasks, filename) {
  const csv = exportTasksToCSV(tasks);
  const date = new Date().toISOString().split('T')[0];
  const defaultFilename = `tasks-${date}.csv`;
  downloadFile(csv, filename || defaultFilename, 'text/csv;charset=utf-8;');
}

/**
 * 导出任务为JSON文件
 * @param {Array} tasks - 任务列表
 * @param {string} filename - 文件名（可选）
 */
export function exportTasksAsJSON(tasks, filename) {
  const json = exportTasksToJSON(tasks);
  const date = new Date().toISOString().split('T')[0];
  const defaultFilename = `tasks-${date}.json`;
  downloadFile(json, filename || defaultFilename, 'application/json;charset=utf-8;');
}

/**
 * 格式化时间统计数据
 * @param {number} minutes - 分钟数
 * @returns {string} 格式化后的时间字符串
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} 分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} 小时 ${mins} 分钟`;
}

/**
 * 计算任务完成率
 * @param {Object} stats - 任务统计数据
 * @returns {number} 完成率百分比
 */
export function calculateCompletionRate(stats) {
  if (!stats || stats.total_tasks === 0) {
    return 0;
  }
  return Math.round((stats.completed_tasks / stats.total_tasks) * 100);
}

