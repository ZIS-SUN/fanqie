const { query } = require('./config');

// 辅助函数：格式化日期时间为MySQL格式
function formatDateTime(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// ==================== 任务相关查询 ====================

// 获取所有任务
async function getAllTasks(userId = 1) {
  const sql = `
    SELECT t.*, c.name as category_name, c.color as category_color
    FROM tasks t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
  `;
  return await query(sql, [userId]);
}

// 根据状态获取任务
async function getTasksByStatus(status, userId = 1) {
  const sql = `
    SELECT t.*, c.name as category_name, c.color as category_color
    FROM tasks t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ? AND t.status = ?
    ORDER BY t.created_at DESC
  `;
  return await query(sql, [userId, status]);
}

// 获取单个任务
async function getTaskById(taskId) {
  const sql = `
    SELECT t.*, c.name as category_name, c.color as category_color
    FROM tasks t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `;
  const result = await query(sql, [taskId]);
  return result[0];
}

// 创建任务
async function createTask(taskData) {
  // 确保所有字段都不是undefined，用null代替
  const cleanData = {
    title: taskData.title || null,
    description: taskData.description || null,
    status: taskData.status || 'pending',
    priority: taskData.priority || 'medium',
    category_id: taskData.category_id !== undefined ? taskData.category_id : null,
    user_id: taskData.user_id || 1,
    due_date: taskData.due_date ? formatDateTime(taskData.due_date) : null,
    remind_time: taskData.remind_time ? formatDateTime(taskData.remind_time) : null
  };
  
  const sql = `
    INSERT INTO tasks (title, description, status, priority, category_id, user_id, due_date, remind_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [
    cleanData.title,
    cleanData.description,
    cleanData.status,
    cleanData.priority,
    cleanData.category_id,
    cleanData.user_id,
    cleanData.due_date,
    cleanData.remind_time
  ]);
  return result.insertId;
}

// 更新任务
async function updateTask(taskId, taskData) {
  const fields = [];
  const values = [];
  
  if (taskData.title !== undefined) {
    fields.push('title = ?');
    values.push(taskData.title);
  }
  if (taskData.description !== undefined) {
    fields.push('description = ?');
    values.push(taskData.description);
  }
  if (taskData.status !== undefined) {
    fields.push('status = ?');
    values.push(taskData.status);
    
    // 如果状态改为completed，记录完成时间
    if (taskData.status === 'completed') {
      fields.push('completed_at = NOW()');
    }
  }
  if (taskData.priority !== undefined) {
    fields.push('priority = ?');
    values.push(taskData.priority);
  }
  if (taskData.category_id !== undefined) {
    fields.push('category_id = ?');
    values.push(taskData.category_id);
  }
  if (taskData.due_date !== undefined) {
    fields.push('due_date = ?');
    values.push(formatDateTime(taskData.due_date));
  }
  if (taskData.remind_time !== undefined) {
    fields.push('remind_time = ?');
    values.push(formatDateTime(taskData.remind_time));
  }
  
  if (fields.length === 0) return false;
  
  values.push(taskId);
  const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
  return true;
}

// 删除任务
async function deleteTask(taskId) {
  const sql = 'DELETE FROM tasks WHERE id = ?';
  await query(sql, [taskId]);
  return true;
}

// ==================== 分类相关查询 ====================

// 获取所有分类
async function getAllCategories(userId = 1) {
  const sql = 'SELECT * FROM categories WHERE user_id = ? ORDER BY id';
  return await query(sql, [userId]);
}

// 创建分类
async function createCategory(categoryData) {
  const sql = 'INSERT INTO categories (name, color, icon, user_id) VALUES (?, ?, ?, ?)';
  const result = await query(sql, [
    categoryData.name,
    categoryData.color || '#1890ff',
    categoryData.icon || null,
    categoryData.user_id || 1
  ]);
  return result.insertId;
}

// ==================== 番茄钟相关查询 ====================

// 创建番茄钟记录
async function createPomodoroSession(sessionData) {
  const sql = `
    INSERT INTO pomodoro_sessions (task_id, user_id, duration, break_duration, start_time, end_time, completed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [
    sessionData.task_id || null,
    sessionData.user_id || 1,
    sessionData.duration,
    sessionData.break_duration || 5,
    formatDateTime(sessionData.start_time),
    formatDateTime(sessionData.end_time),
    sessionData.completed || false
  ]);
  return result.insertId;
}

// 更新番茄钟记录
async function updatePomodoroSession(sessionId, sessionData) {
  const sql = 'UPDATE pomodoro_sessions SET end_time = ?, completed = ? WHERE id = ?';
  await query(sql, [formatDateTime(sessionData.end_time), sessionData.completed, sessionId]);
  return true;
}

// 获取今日番茄钟统计
async function getTodayPomodoroStats(userId = 1) {
  const sql = `
    SELECT 
      COUNT(*) as total_sessions,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_sessions,
      SUM(duration) as total_minutes
    FROM pomodoro_sessions
    WHERE user_id = ? AND DATE(start_time) = CURDATE()
  `;
  const result = await query(sql, [userId]);
  return result[0];
}

// 获取近7天番茄钟统计
async function getWeekPomodoroStats(userId = 1) {
  const sql = `
    SELECT 
      DATE(start_time) as date,
      COUNT(*) as total_sessions,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_sessions,
      SUM(duration) as total_minutes
    FROM pomodoro_sessions
    WHERE user_id = ? AND start_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY DATE(start_time)
    ORDER BY date
  `;
  return await query(sql, [userId]);
}

// ==================== 统计相关查询 ====================

// 获取任务统计
async function getTaskStats(userId = 1) {
  const sql = `
    SELECT 
      COUNT(*) as total_tasks,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks
    FROM tasks
    WHERE user_id = ?
  `;
  const result = await query(sql, [userId]);
  return result[0];
}

// 获取今日完成的任务
async function getTodayCompletedTasks(userId = 1) {
  const sql = `
    SELECT COUNT(*) as count
    FROM tasks
    WHERE user_id = ? AND DATE(completed_at) = CURDATE()
  `;
  const result = await query(sql, [userId]);
  return result[0].count;
}

module.exports = {
  // 任务相关
  getAllTasks,
  getTasksByStatus,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  
  // 分类相关
  getAllCategories,
  createCategory,
  
  // 番茄钟相关
  createPomodoroSession,
  updatePomodoroSession,
  getTodayPomodoroStats,
  getWeekPomodoroStats,
  
  // 统计相关
  getTaskStats,
  getTodayCompletedTasks
};

