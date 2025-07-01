const express = require('express');
const router = express.Router();
const db = require('../db');

// 发布内容接口
router.post('/', (req, res, next) => {
  try {
    const { content, type, publisher } = req.body;
    
    // 验证参数
    if (!content || !type || !publisher) {
      return res.status(400).json({
        success: false,
        message: '参数不完整，需要content、type和publisher'
      });
    }
    
    if (type !== 'product' && type !== 'important') {
      return res.status(400).json({
        success: false,
        message: 'type必须是product或important'
      });
    }
    
    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: '内容长度不能超过2000字符'
      });
    }
    
    // 保存到数据库
    db.insertContent(content, type, publisher, (err, result) => {
      if (err) {
        return next(err);
      }
      
      res.json({
        success: true,
        message: '发布成功',
        data: result
      });
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;