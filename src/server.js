const app = require('./app');
const cron = require('node-cron');
const moment = require('moment');
const wechatService = require('./services/wechat');
const summaryService = require('./services/summary');

// 从环境变量获取配置，设置默认值
const PORT = process.env.PORT || 3000;
const PUSH_TIME = process.env.PUSH_TIME || '18:00';

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`每日汇总推送时间: ${PUSH_TIME}`);
  
  // 启动定时任务
  startCronJob();
});

// 设置定时任务
function startCronJob() {
  // 解析推送时间
  const [hour, minute] = PUSH_TIME.split(':').map(Number);
  
  // 每天指定时间执行 (分 时 * * *)
  const cronExpression = `${minute} ${hour} * * *`;
  
  // 安排定时任务
  const job = cron.schedule(cronExpression, async () => {
    console.log(`定时任务执行: ${new Date().toLocaleString()}`);
    
    try {
      // 生成今日汇总
      const summary = await summaryService.generateTodaySummary();
      
      if (summary.total === 0) {
        console.log('今日无发布内容，不发送汇总');
        return;
      }
      
      // 发送到企业微信
      const result = await wechatService.sendMarkdownMessage(summary.content);
      console.log('汇总推送结果:', result);
    } catch (error) {
      console.error('定时任务执行失败:', error);
    }
  }, {
    timezone: 'Asia/Shanghai' // 设置时区为北京时间
  });
  
  console.log(`定时任务已安排: ${cronExpression} (Asia/Shanghai时区)`);
  
  // 处理未捕获的异常
  process.on('uncaughtException', (err) => {
    console.error('未捕获的异常:', err);
    // 可以在这里添加重启服务或其他恢复逻辑
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
  });
}