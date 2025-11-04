// 添加示例数据脚本
const queries = require('./queries');
const { closePool } = require('./config');

async function seedData() {
  console.log('📝 开始添加示例数据...\n');

  try {
    // 创建示例任务
    const tasks = [
      {
        title: '完成项目文档',
        description: '编写项目的README和技术文档',
        priority: 'high',
        status: 'in_progress',
        category_id: 1, // 工作
        user_id: 1,
        due_date: new Date(Date.now() + 86400000 * 2) // 2天后
      },
      {
        title: '学习React Hooks',
        description: '深入学习useState, useEffect, useContext等hooks',
        priority: 'medium',
        status: 'pending',
        category_id: 2, // 学习
        user_id: 1,
        due_date: new Date(Date.now() + 86400000 * 5) // 5天后
      },
      {
        title: '购买日用品',
        description: '牙膏、洗发水、纸巾等',
        priority: 'low',
        status: 'pending',
        category_id: 3, // 生活
        user_id: 1,
        due_date: new Date(Date.now() + 86400000 * 1) // 明天
      },
      {
        title: '健身房训练',
        description: '进行力量训练和有氧运动',
        priority: 'medium',
        status: 'completed',
        category_id: 4, // 健康
        user_id: 1,
        due_date: new Date(Date.now() - 86400000) // 昨天
      },
      {
        title: '准备团队会议',
        description: '整理会议议程和PPT',
        priority: 'high',
        status: 'in_progress',
        category_id: 1, // 工作
        user_id: 1,
        due_date: new Date(Date.now() + 86400000 * 3)
      },
      {
        title: '阅读技术书籍',
        description: '《深入浅出Node.js》第3-5章',
        priority: 'medium',
        status: 'pending',
        category_id: 2, // 学习
        user_id: 1,
        due_date: new Date(Date.now() + 86400000 * 7)
      },
      {
        title: '整理房间',
        description: '清洁卧室和书房',
        priority: 'low',
        status: 'completed',
        category_id: 3, // 生活
        user_id: 1,
        due_date: new Date(Date.now() - 86400000 * 2)
      },
      {
        title: '代码审查',
        description: '审查同事提交的PR',
        priority: 'high',
        status: 'pending',
        category_id: 1, // 工作
        user_id: 1,
        due_date: new Date(Date.now() + 86400000)
      }
    ];

    console.log('创建示例任务...');
    const taskIds = [];
    for (const task of tasks) {
      const taskId = await queries.createTask(task);
      taskIds.push(taskId);
      console.log(`✓ 创建任务: ${task.title}`);
    }
    console.log();

    // 创建一些历史番茄钟记录
    console.log('创建番茄钟记录...');
    const sessions = [
      {
        task_id: taskIds[0],
        user_id: 1,
        duration: 25,
        break_duration: 5,
        start_time: new Date(Date.now() - 3600000 * 5), // 5小时前
        end_time: new Date(Date.now() - 3600000 * 4.5),
        completed: true
      },
      {
        task_id: taskIds[0],
        user_id: 1,
        duration: 25,
        break_duration: 5,
        start_time: new Date(Date.now() - 3600000 * 3),
        end_time: new Date(Date.now() - 3600000 * 2.5),
        completed: true
      },
      {
        task_id: taskIds[1],
        user_id: 1,
        duration: 25,
        break_duration: 5,
        start_time: new Date(Date.now() - 3600000 * 1),
        end_time: new Date(Date.now() - 3600000 * 0.5),
        completed: true
      },
      // 昨天的记录
      {
        task_id: taskIds[3],
        user_id: 1,
        duration: 25,
        break_duration: 5,
        start_time: new Date(Date.now() - 86400000),
        end_time: new Date(Date.now() - 86400000 + 1500000),
        completed: true
      },
      {
        task_id: taskIds[3],
        user_id: 1,
        duration: 25,
        break_duration: 5,
        start_time: new Date(Date.now() - 86400000 + 2000000),
        end_time: new Date(Date.now() - 86400000 + 3500000),
        completed: true
      }
    ];

    for (const session of sessions) {
      await queries.createPomodoroSession(session);
    }
    console.log(`✓ 创建了 ${sessions.length} 个番茄钟记录`);
    console.log();

    // 显示统计
    const taskStats = await queries.getTaskStats();
    const todayStats = await queries.getTodayPomodoroStats();

    console.log('📊 数据统计:');
    console.log(`  - 总任务数: ${taskStats.total_tasks}`);
    console.log(`  - 已完成: ${taskStats.completed_tasks}`);
    console.log(`  - 进行中: ${taskStats.in_progress_tasks}`);
    console.log(`  - 待办: ${taskStats.pending_tasks}`);
    console.log();
    console.log(`  - 今日番茄钟: ${todayStats.completed_sessions}`);
    console.log(`  - 今日专注: ${todayStats.total_minutes || 0} 分钟`);
    console.log();

    console.log('🎉 示例数据添加完成！');
    console.log('现在可以运行 npm start 查看效果。\n');

  } catch (error) {
    console.error('❌ 添加示例数据失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// 运行脚本
if (require.main === module) {
  seedData();
}

module.exports = { seedData };

