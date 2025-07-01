const express = require('express');
const router = express.Router();
const db = require('../db');
const wechatService = require('../services/wechat');
const summaryService = require('../services/summary');

// 获取今日汇总数据
router.get('/', (req, res, next) => {
  try {
    db.getTodaySummary((err, summary) => {
      if (err) {
        return next(err);
      }
      
      res.json({
        success: true,
        data: summary
      });
    });
  } catch (err) {
    next(err);
  }
});

// 手动发送今日汇总
router.post('/send', async (req, res, next) => {
  try {
    // 生成今日汇总
    const summary = await summaryService.generateTodaySummary();
    
    if (summary.total === 0) {
      return res.json({
        success: true,
        message: '今日无发布内容，不发送汇总'
      });
    }
    
    // 发送到企业微信
    const result = await wechatService.sendMarkdownMessage(summary.content);
    
    res.json({
      success: true,
      message: '汇总已发送',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;