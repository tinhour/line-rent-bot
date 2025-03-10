const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const line = require('@line/bot-sdk');
const { PrismaClient } = require('@prisma/client');

// 加载环境变量
dotenv.config();

// 创建 Prisma 客户端
const prisma = new PrismaClient();

// LINE Bot 配置
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

// 创建 LINE Bot 客户端
const lineClient = new line.Client(lineConfig);

// 创建 Express 应用
const app = express();
app.use(bodyParser.json());

// 导入路由
const lineRoutes = require('./routes/line.routes');
const apiRoutes = require('./routes/api.routes');

// 使用路由
app.use('/webhook', lineRoutes(lineClient, prisma));
app.use('/api', apiRoutes(prisma));

// 健康检查
app.get('/', (req, res) => {
  res.send('LINE 租房机器人正在运行中');
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器已启动，运行在端口 ${PORT}`);
});

// 处理应用关闭时的数据库连接
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = { prisma, lineClient }; 