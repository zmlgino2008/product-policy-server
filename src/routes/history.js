const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取历史记录接口
router.get('/', (req, res, next) => {
  try {
    db.getHistory((err, records) => {
      if (err) {
        return next(err);
      }
      
      res.json({
        success: true,
        data: records
      });
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;