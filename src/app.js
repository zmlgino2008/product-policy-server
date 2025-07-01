const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件配置
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码请求体

// 静态文件服务（用于部署前端文件，如果需要）
app.use(express.static(path.join(__dirname, '../public')));

// API路由
app.use('/api/publish', require('./routes/publish'));
app.use('/api/history', require('./routes/history'));
app.use('/api/summary', require('./routes/summary'));

// 根路由
app.get('/', (req, res) => {
  res.send('产品政策发布系统后端服务正在运行');
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;