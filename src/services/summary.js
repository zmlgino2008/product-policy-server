const db = require('../db');
const moment = require('moment');

// 生成今日汇总内容
async function generateTodaySummary() {
  return new Promise((resolve, reject) => {
    db.getTodaySummary((err, summaryData) => {
      if (err) {
        return reject(err);
      }
      
      if (summaryData.total === 0) {
        return resolve({
          total: 0,
          content: ''
        });
      }
      
      // 构建Markdown内容
      let markdownContent = `### 今日政策汇总 (${summaryData.date})\n\n`;
      
      summaryData.publishers.forEach(publisher => {
        markdownContent += `#### ${publisher.name}\n`;
        
        publisher.contents.forEach((item, index) => {
          markdownContent += `${index + 1}. ${item.typeLabel} ${item.content.substring(0, 100)}${item.content.length > 100 ? '...' : ''}\n\n`;
        });
      });
      
      markdownContent += `**总计**: ${summaryData.total}条记录`;
      
      resolve({
        total: summaryData.total,
        content: markdownContent
      });
    });
  });
}

module.exports = {
  generateTodaySummary
};