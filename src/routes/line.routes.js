const express = require('express');
const line = require('@line/bot-sdk');
const messageHandler = require('../handlers/message.handler');
const eventHandler = require('../handlers/event.handler');
const postbackHandler = require('../handlers/postback.handler');

module.exports = (lineClient, prisma) => {
  const router = express.Router();

  // LINE Bot 配置
  const lineConfig = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
  };

  // 中间件，用于验证 LINE 请求
  router.use(line.middleware(lineConfig));

  // LINE Webhook 端点
  router.post('/', async (req, res) => {
    try {
      const events = req.body.events;
      
      if (events.length === 0) {
        return res.status(200).send('No events');
      }

      // 处理每个事件
      await Promise.all(events.map(async (event) => {
        try {
          // 根据事件类型分发到不同的处理程序
          switch (event.type) {
            case 'message':
              if (event.message.type === 'text') {
                await messageHandler.handleTextMessage(lineClient, prisma, event);
              }
              break;
            case 'postback':
              await postbackHandler.handlePostback(lineClient, prisma, event);
              break;
            case 'follow':
              await eventHandler.handleFollowEvent(lineClient, prisma, event);
              break;
            default:
              console.log(`未处理的事件类型: ${event.type}`);
          }
        } catch (err) {
          console.error(`处理事件时发生错误: ${err.message}`);
        }
      }));

      return res.status(200).send('OK');
    } catch (err) {
      console.error(`Webhook 错误: ${err.message}`);
      return res.status(500).send(`Webhook 错误: ${err.message}`);
    }
  });

  return router;
}; 