# LINE 租房机器人

基于 Node.js 和 Prisma 开发的 LINE 租房服务机器人，帮助租客找房源，房东刊登房源，并撮合双方交易。

## 功能特点

- **租客功能**
  - 按地区、房型、价格筛选房源
  - 查看房源详情
  - 支付保证金获取房东联系方式
  - 查看自己的租房询问记录

- **房东功能**
  - 发布出租房源
  - 管理自己的房源
  - 当有租客想租房时收到通知
  - 支付保证金获取租客联系方式

- **系统功能**
  - 基于 LINE Bot 的交互界面
  - 支付系统集成（LINE Pay / 信用卡 / 银行转账）
  - 数据库存储用户、房源、询问和交易信息

## 技术栈

- Node.js
- Express
- Prisma (ORM)
- SQLite (数据库)
- LINE Bot SDK
- LINE Pay API

## 快速开始

### 前置条件

- Node.js (v14+)
- 有效的 LINE 开发者账号和 Channel
- 有效的 LINE Pay 商家账号（可选）

### 安装与设置

1. 克隆代码库：

```bash
git clone https://github.com/tinhour/line-rent-bot.git
cd line-rent-bot
```

2. 安装依赖：

```bash
npm install
```

3. 设置环境变量：

复制 `.env.example` 文件为 `.env`，并填入你的 LINE Channel 信息：

```
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret
```

4. 初始化数据库：

```bash
npx prisma migrate dev
```

5. 启动服务：

```bash
npm run dev
```

6. 配置 LINE Bot Webhook URL：

在 LINE Developers 控制台中，将 Webhook URL 设置为：
`https://your-domain.com/webhook`

## 使用说明

### 租客使用流程

1. 添加 LINE Bot 为好友
2. 输入「我要找房」开始搜索
3. 按照提示选择地区、房型和价格范围
4. 查看符合条件的房源列表
5. 点击「联系房东」并支付保证金
6. 获取房东联系方式，进行直接沟通

### 房东使用流程

1. 添加 LINE Bot 为好友
2. 输入「刊登房源」开始创建
3. 按照提示输入房源信息（地点、类型、价格）
4. 成功创建房源后，等待租客询问
5. 有租客询问时，可支付保证金查看租客联系方式

## 项目结构

```
line-rent-bot/
├── prisma/                 # Prisma 数据库模型
├── src/
│   ├── handlers/           # LINE Bot 事件处理程序
│   ├── routes/             # Express 路由
│   ├── services/           # 业务逻辑服务
│   ├── utils/              # 工具函数
│   └── index.js            # 应用入口
├── .env                    # 环境变量
├── .env.example            # 环境变量示例
├── package.json            # 项目依赖
└── README.md               # 项目说明
```

## 许可证

MIT 