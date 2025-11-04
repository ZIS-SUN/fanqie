const mysql = require('mysql2/promise');
const { dbConfig } = require('./config');

// 数据库初始化脚本
async function initDatabase() {
  let connection;
  
  try {
    // 1. 连接到MySQL服务器（不指定数据库）
    console.log('正在连接到MySQL服务器...');
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    console.log('✓ 已连接到MySQL服务器');
    
    // 2. 创建数据库（如果不存在）
    console.log('正在创建数据库...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✓ 数据库 ${dbConfig.database} 已创建`);
    
    // 3. 使用数据库
    await connection.query(`USE ${dbConfig.database}`);
    
    // 4. 创建用户表
    console.log('正在创建用户表...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE,
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ 用户表已创建');
    
    // 5. 创建分类表
    console.log('正在创建分类表...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        color VARCHAR(20) DEFAULT '#1890ff',
        icon VARCHAR(50),
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ 分类表已创建');
    
    // 6. 创建任务表
    console.log('正在创建任务表...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        category_id INT,
        user_id INT,
        due_date DATETIME,
        remind_time DATETIME,
        completed_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_due_date (due_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ 任务表已创建');
    
    // 7. 创建番茄钟记录表
    console.log('正在创建番茄钟记录表...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pomodoro_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        task_id INT,
        user_id INT,
        duration INT NOT NULL COMMENT '番茄钟时长（分钟）',
        break_duration INT COMMENT '休息时长（分钟）',
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_task_id (task_id),
        INDEX idx_start_time (start_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ 番茄钟记录表已创建');
    
    // 8. 创建默认用户和分类
    console.log('正在创建默认数据...');
    
    // 检查是否已有用户
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      // 创建默认用户
      await connection.query(`
        INSERT INTO users (username, email) VALUES ('default_user', 'user@example.com')
      `);
      console.log('✓ 默认用户已创建');
      
      // 获取默认用户ID
      const [defaultUser] = await connection.query('SELECT id FROM users WHERE username = "default_user"');
      const userId = defaultUser[0].id;
      
      // 创建默认分类
      await connection.query(`
        INSERT INTO categories (name, color, icon, user_id) VALUES
        ('工作', '#1890ff', '💼', ${userId}),
        ('学习', '#52c41a', '📚', ${userId}),
        ('生活', '#faad14', '🏠', ${userId}),
        ('健康', '#f5222d', '❤️', ${userId}),
        ('其他', '#722ed1', '📌', ${userId})
      `);
      console.log('✓ 默认分类已创建');
    }
    
    console.log('\n🎉 数据库初始化完成！');
    console.log('数据库名称:', dbConfig.database);
    console.log('表：users, categories, tasks, pomodoro_sessions');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行初始化
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };

