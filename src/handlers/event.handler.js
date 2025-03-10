const userService = require('../services/user.service');

/**
 * 处理关注事件
 */
const handleFollowEvent = async (lineClient, prisma, event) => {
  const { userId } = event.source;

  try {
    // 获取用户个人资料
    const profile = await lineClient.getProfile(userId);
    
    // 在数据库中创建或更新用户
    await userService.createOrUpdateUser(prisma, {
      lineUserId: userId,
      displayName: profile.displayName
    });
    
    // 发送欢迎消息
    const welcomeMessage = {
      type: 'text',
      text: `${profile.displayName}，歡迎使用LINE租房機器人！\n\n這裡可以幫您：\n1. 尋找適合的租屋\n2. 發布您的房源\n\n請選擇您想要的服務：`,
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'message',
              label: '找房子',
              text: '我要找房'
            }
          },
          {
            type: 'action',
            action: {
              type: 'message',
              label: '刊登房源',
              text: '刊登房源'
            }
          },
          {
            type: 'action',
            action: {
              type: 'message',
              label: '使用說明',
              text: '使用說明'
            }
          }
        ]
      }
    };
    
    await lineClient.replyMessage(event.replyToken, welcomeMessage);
  } catch (error) {
    console.error('处理关注事件时出错:', error);
  }
};

module.exports = {
  handleFollowEvent
}; 