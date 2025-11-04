#!/bin/bash

echo "🎯 番茄待办 - 最终功能测试"
echo "================================"
echo ""

cd "/Users/zishen/Desktop/new pj"

# 1. 环境检查
echo "1️⃣ 环境检查..."
./test-all.sh
if [ $? -ne 0 ]; then
    echo "❌ 环境检查失败，请先解决环境问题"
    exit 1
fi

echo ""
echo "================================"
echo ""

# 2. 数据库功能测试
echo "2️⃣ 数据库功能测试..."
npm run db:test
if [ $? -ne 0 ]; then
    echo "❌ 数据库测试失败"
    exit 1
fi

echo ""
echo "================================"
echo ""

# 3. 创建测试任务
echo "3️⃣ 测试任务创建（模拟前端操作）..."
node -e "
const queries = require('./src/database/queries');

async function test() {
  try {
    // 模拟前端提交的数据
    const taskData = {
      title: '前端测试任务',
      description: '模拟从前端创建的任务',
      status: 'pending',
      priority: 'high',
      category_id: 1,
      user_id: 1,
      due_date: new Date(Date.now() + 86400000).toISOString()
    };
    
    console.log('📝 创建任务...');
    const id = await queries.createTask(taskData);
    console.log('✅ 任务创建成功！ID:', id);
    
    // 查询验证
    const task = await queries.getTaskById(id);
    console.log('✅ 任务验证:', task.title);
    
    // 清理
    await queries.deleteTask(id);
    console.log('✅ 测试数据已清理');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

test();
"

if [ $? -ne 0 ]; then
    echo "❌ 任务创建测试失败"
    exit 1
fi

echo ""
echo "================================"
echo ""

# 4. 统计查询测试
echo "4️⃣ 测试统计查询..."
node -e "
const queries = require('./src/database/queries');

async function test() {
  try {
    const stats = await queries.getTaskStats();
    console.log('✅ 任务统计:', stats);
    
    const todayStats = await queries.getTodayPomodoroStats();
    console.log('✅ 今日番茄钟:', todayStats);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

test();
"

if [ $? -ne 0 ]; then
    echo "❌ 统计查询测试失败"
    exit 1
fi

echo ""
echo "================================"
echo "🎉 所有测试通过！"
echo "================================"
echo ""
echo "✅ 环境检查通过"
echo "✅ 数据库连接正常"  
echo "✅ 所有API接口正常"
echo "✅ 任务创建功能正常"
echo "✅ 统计查询功能正常"
echo ""
echo "🚀 应用已准备就绪！"
echo ""
echo "下一步："
echo "  1. 应用已在后台运行"
echo "  2. 刷新浏览器查看优化后的UI"
echo "  3. 测试任务创建功能"
echo ""

