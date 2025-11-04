// 数据库功能测试脚本
const queries = require('./queries');
const { testConnection, closePool } = require('./config');

async function testDatabase() {
  console.log('🧪 开始测试数据库功能...\n');

  try {
    // 1. 测试连接
    console.log('1️⃣ 测试数据库连接...');
    const connected = await testConnection();
    if (!connected) {
      throw new Error('数据库连接失败');
    }
    console.log('✓ 数据库连接正常\n');

    // 2. 测试获取分类
    console.log('2️⃣ 测试获取分类...');
    const categories = await queries.getAllCategories();
    console.log(`✓ 成功获取 ${categories.length} 个分类`);
    categories.forEach(cat => {
      console.log(`  - ${cat.icon} ${cat.name} (${cat.color})`);
    });
    console.log();

    // 3. 测试创建任务
    console.log('3️⃣ 测试创建任务...');
    const taskId = await queries.createTask({
      title: '测试任务 - 完成项目文档',
      description: '这是一个测试任务，用于验证数据库功能',
      priority: 'high',
      status: 'pending',
      category_id: 1,
      user_id: 1,
      due_date: new Date(Date.now() + 86400000).toISOString() // 明天
    });
    console.log(`✓ 成功创建任务，ID: ${taskId}\n`);

    // 4. 测试获取任务
    console.log('4️⃣ 测试获取任务列表...');
    const tasks = await queries.getAllTasks();
    console.log(`✓ 成功获取 ${tasks.length} 个任务`);
    tasks.forEach(task => {
      console.log(`  - [${task.status}] ${task.title} (${task.priority})`);
    });
    console.log();

    // 5. 测试更新任务
    console.log('5️⃣ 测试更新任务...');
    await queries.updateTask(taskId, {
      status: 'in_progress',
      description: '任务描述已更新'
    });
    const updatedTask = await queries.getTaskById(taskId);
    console.log(`✓ 任务状态更新为: ${updatedTask.status}\n`);

    // 6. 测试番茄钟记录
    console.log('6️⃣ 测试创建番茄钟记录...');
    const sessionId = await queries.createPomodoroSession({
      task_id: taskId,
      user_id: 1,
      duration: 25,
      break_duration: 5,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 1500000).toISOString(), // 25分钟后
      completed: true
    });
    console.log(`✓ 成功创建番茄钟记录，ID: ${sessionId}\n`);

    // 7. 测试统计功能
    console.log('7️⃣ 测试统计功能...');
    const taskStats = await queries.getTaskStats();
    console.log('✓ 任务统计:');
    console.log(`  - 总任务数: ${taskStats.total_tasks}`);
    console.log(`  - 已完成: ${taskStats.completed_tasks}`);
    console.log(`  - 进行中: ${taskStats.in_progress_tasks}`);
    console.log(`  - 待办: ${taskStats.pending_tasks}`);
    console.log();

    const pomodoroStats = await queries.getTodayPomodoroStats();
    console.log('✓ 今日番茄钟统计:');
    console.log(`  - 总番茄钟: ${pomodoroStats.total_sessions}`);
    console.log(`  - 已完成: ${pomodoroStats.completed_sessions}`);
    console.log(`  - 总时长: ${pomodoroStats.total_minutes || 0} 分钟`);
    console.log();

    // 8. 测试完成任务
    console.log('8️⃣ 测试完成任务...');
    await queries.updateTask(taskId, { status: 'completed' });
    const completedTask = await queries.getTaskById(taskId);
    console.log(`✓ 任务已完成，完成时间: ${completedTask.completed_at}\n`);

    // 9. 清理测试数据（可选）
    console.log('9️⃣ 清理测试数据...');
    await queries.deleteTask(taskId);
    console.log('✓ 测试数据已清理\n');

    console.log('🎉 所有数据库功能测试通过！\n');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// 运行测试
if (require.main === module) {
  testDatabase();
}

module.exports = { testDatabase };

