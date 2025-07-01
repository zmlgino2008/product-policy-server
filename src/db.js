const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');

// 数据库文件路径
const dbPath = path.resolve(__dirname, '../database.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接错误:', err.message);
  } else {
    console.log('成功连接到SQLite数据库');
    initDatabase();
  }
});

// 初始化数据库表
function initDatabase() {
  // 创建内容表
  db.run(`CREATE TABLE IF NOT EXISTS contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    publisher TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('创建表失败:', err.message);
    } else {
      console.log('数据库表初始化完成');
    }
  });
}

// 插入发布内容
function insertContent(content, type, publisher, callback) {
  const createdAt = new Date().toISOString();
  db.run(
    'INSERT INTO contents (content, type, publisher, createdAt) VALUES (?, ?, ?, ?)',
    [content, type, publisher, createdAt],
    function(err) {
      if (err) {
        return callback(err);
      }
      callback(null, { id: this.lastID, createdAt });
    }
  );
}

// 获取所有历史记录
function getHistory(callback) {
  db.all(
    'SELECT id, content, type, publisher, createdAt FROM contents ORDER BY createdAt DESC',
    (err, rows) => {
      if (err) {
        return callback(err);
      }
      
      // 格式化数据
      const formattedRows = rows.map(row => ({
        ...row,
        typeLabel: row.type === 'product' ? '【产品政策】' : '【重要信息】',
        date: moment(row.createdAt).format('YYYY-MM-DD HH:mm:ss')
      }));
      
      callback(null, formattedRows);
    }
  );
}

// 获取今日汇总数据（按发布者分组）
function getTodaySummary(callback) {
  const today = moment().format('YYYY-MM-DD');
  const nextDay = moment().add(1, 'day').format('YYYY-MM-DD');
  
  db.all(
    `SELECT content, type, publisher FROM contents 
     WHERE createdAt >= ? AND createdAt < ? 
     ORDER BY publisher, createdAt`,
    [today, nextDay],
    (err, rows) => {
      if (err) {
        return callback(err);
      }
      
      // 按发布者分组
      const summary = {};
      rows.forEach(row => {
        if (!summary[row.publisher]) {
          summary[row.publisher] = [];
        }
        summary[row.publisher].push({
          type: row.type,
          typeLabel: row.type === 'product' ? '【产品政策】' : '【重要信息】',
          content: row.content
        });
      });
      
      // 转换为数组格式
      const result = {
        date: today,
        publishers: Object.keys(summary).map(publisher => ({
          name: publisher,
          contents: summary[publisher]
        })),
        total: rows.length
      };
      
      callback(null, result);
    }
  );
}

module.exports = {
  insertContent,
  getHistory,
  getTodaySummary
};