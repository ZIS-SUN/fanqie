const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: '127.0.0.1', // 使用IPv4地址代替localhost，避免IPv6连接问题
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'pomodoro_db'
};

// 创建连接池
let pool = null;

// 获取数据库连接池
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    console.log('✓ 数据库连接成功 (' + dbConfig.host + ':' + dbConfig.port + ')');
    await connection.end();
    return true;
  } catch (error) {
    console.error('✗ 数据库连接失败:', error.message);
    console.error('   配置: ' + dbConfig.user + '@' + dbConfig.host + ':' + dbConfig.port);
    return false;
  }
}

// 执行查询
async function query(sql, params = []) {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('查询错误:', error);
    throw error;
  }
}

// 关闭连接池
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('数据库连接池已关闭');
  }
}

module.exports = {
  dbConfig,
  getPool,
  testConnection,
  query,
  closePool
};

