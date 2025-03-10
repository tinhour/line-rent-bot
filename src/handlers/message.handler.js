const userService = require('../services/user.service');
const propertyService = require('../services/property.service');
const lineTemplate = require('../utils/line-template');

/**
 * 处理文本消息
 */
const handleTextMessage = async (lineClient, prisma, event) => {
  const { text } = event.message;
  const { userId } = event.source;

  try {
    // 首先确保用户存在于数据库中
    await userService.findOrCreateUser(prisma, lineClient, userId);

    // 根据消息内容处理不同的命令
    if (text.includes('我要找房') || text.includes('找房子')) {
      await handleFindHouse(lineClient, event.replyToken);
    } 
    else if (text.includes('刊登房源') || text.includes('出租房子')) {
      await handleListProperty(lineClient, event.replyToken);
    }
    else if (text.includes('我的房源')) {
      await handleMyProperties(lineClient, prisma, userId, event.replyToken);
    }
    else if (text.includes('我的询问')) {
      await handleMyInquiries(lineClient, prisma, userId, event.replyToken);
    }
    else if (text.includes('帮助') || text.includes('使用说明')) {
      await handleHelp(lineClient, event.replyToken);
    }
    else {
      // 默认回复
      await lineClient.replyMessage(event.replyToken, {
        type: 'text',
        text: '您好！请问有什么可以帮助您的吗？您可以输入"找房子"、"刊登房源"、"我的房源"、"我的询问"或"帮助"了解更多。'
      });
    }
  } catch (error) {
    console.error('处理消息时出错:', error);
    
    // 发送错误消息
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '抱歉，处理您的请求时发生错误。请稍后再试。'
    });
  }
};

/**
 * 处理"我要找房"命令
 */
const handleFindHouse = async (lineClient, replyToken) => {
  // 创建快速回复按钮，让用户选择地区
  const message = {
    type: 'text',
    text: '請選擇您想找的房子的地區：',
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '台北市',
            data: 'action=select_location&location=台北市',
            displayText: '台北市'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '新北市',
            data: 'action=select_location&location=新北市',
            displayText: '新北市'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '桃園市',
            data: 'action=select_location&location=桃園市',
            displayText: '桃園市'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '台中市',
            data: 'action=select_location&location=台中市',
            displayText: '台中市'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '高雄市',
            data: 'action=select_location&location=高雄市',
            displayText: '高雄市'
          }
        }
      ]
    }
  };

  await lineClient.replyMessage(replyToken, message);
};

/**
 * 处理"刊登房源"命令
 */
const handleListProperty = async (lineClient, replyToken) => {
  const message = {
    type: 'text',
    text: '請選擇您要出租的房子類型：',
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '整層住家',
            data: 'action=create_property&type=整層住家',
            displayText: '整層住家'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '獨立套房',
            data: 'action=create_property&type=獨立套房',
            displayText: '獨立套房'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '分租套房',
            data: 'action=create_property&type=分租套房',
            displayText: '分租套房'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '雅房',
            data: 'action=create_property&type=雅房',
            displayText: '雅房'
          }
        }
      ]
    }
  };

  await lineClient.replyMessage(replyToken, message);
};

/**
 * 处理"我的房源"命令
 */
const handleMyProperties = async (lineClient, prisma, userId, replyToken) => {
  try {
    // 获取用户信息
    const user = await userService.getUserByLineId(prisma, userId);
    
    if (!user) {
      return await lineClient.replyMessage(replyToken, {
        type: 'text',
        text: '無法找到您的用戶資訊，請重新嘗試。'
      });
    }

    // 获取用户的房源列表
    const properties = await propertyService.getPropertiesByOwnerId(prisma, user.id);
    
    if (properties.length === 0) {
      return await lineClient.replyMessage(replyToken, {
        type: 'text',
        text: '您目前沒有刊登任何房源。您可以輸入"刊登房源"來新增房源。'
      });
    }

    // 创建 Flex 消息模板显示房源列表
    const flexMessage = lineTemplate.createPropertyListTemplate(properties);
    
    await lineClient.replyMessage(replyToken, flexMessage);
  } catch (error) {
    console.error('获取我的房源时出错:', error);
    await lineClient.replyMessage(replyToken, {
      type: 'text',
      text: '獲取房源列表時發生錯誤，請稍後再試。'
    });
  }
};

/**
 * 处理"我的询问"命令
 */
const handleMyInquiries = async (lineClient, prisma, userId, replyToken) => {
  try {
    // 获取用户信息
    const user = await userService.getUserByLineId(prisma, userId);
    
    if (!user) {
      return await lineClient.replyMessage(replyToken, {
        type: 'text',
        text: '無法找到您的用戶資訊，請重新嘗試。'
      });
    }

    // 获取用户的询问列表
    const inquiries = await prisma.inquiry.findMany({
      where: {
        tenantId: user.id
      },
      include: {
        property: true,
        transaction: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (inquiries.length === 0) {
      return await lineClient.replyMessage(replyToken, {
        type: 'text',
        text: '您目前沒有任何租房詢問。您可以輸入"找房子"開始尋找房源。'
      });
    }

    // 创建 Flex 消息模板显示询问列表
    const flexMessage = lineTemplate.createInquiryListTemplate(inquiries);
    
    await lineClient.replyMessage(replyToken, flexMessage);
  } catch (error) {
    console.error('获取我的询问时出错:', error);
    await lineClient.replyMessage(replyToken, {
      type: 'text',
      text: '獲取詢問列表時發生錯誤，請稍後再試。'
    });
  }
};

/**
 * 处理"帮助"命令
 */
const handleHelp = async (lineClient, replyToken) => {
  const helpMessage = {
    type: 'text',
    text: '【LINE租房機器人使用說明】\n\n' +
          '【租客使用】\n' +
          '1. 輸入"找房子"開始篩選房源\n' +
          '2. 按照提示選擇地區、房型和價格\n' +
          '3. 瀏覽符合條件的房源\n' +
          '4. 點擊"聯繫房東"支付保證金\n' +
          '5. 支付成功後即可獲得房東聯絡方式\n\n' +
          '【房東使用】\n' +
          '1. 輸入"刊登房源"開始創建房源\n' +
          '2. 按照提示輸入房源資訊\n' +
          '3. 輸入"我的房源"查看已發布的房源\n' +
          '4. 當有租客想租您的房子時，您會收到通知\n' +
          '5. 支付10%保證金後即可獲得租客聯絡方式\n\n' +
          '如需更多協助，請聯繫客服。'
  };

  await lineClient.replyMessage(replyToken, helpMessage);
};

module.exports = {
  handleTextMessage
}; 