const axios = require('axios');

// 发送文本消息到企业微信机器人
async function sendTextMessage(content) {
  try {
    const response = await axios.post(process.env.WEBHOOK_URL, {
      "msgtype": "text",
      "text": {
        "content": content
      }
    });
    return response.data;
  } catch (error) {
    console.error('发送企业微信消息失败:', error);
    throw new Error('发送消息失败: ' + (error.response?.data?.errmsg || error.message));
  }
}

// 发送Markdown消息到企业微信机器人
async function sendMarkdownMessage(content) {
  try {
    const response = await axios.post(process.env.WEBHOOK_URL, {
      "msgtype": "markdown",
      "markdown": {
        "content": content
      }
    });
    return response.data;
  } catch (error) {
    console.error('发送企业微信Markdown消息失败:', error);
    throw new Error('发送消息失败: ' + (error.response?.data?.errmsg || error.message));
  }
}

module.exports = {
  sendTextMessage,
  sendMarkdownMessage
};