const userService = require('../services/user.service');
const propertyService = require('../services/property.service');
const inquiryService = require('../services/inquiry.service');
const transactionService = require('../services/transaction.service');
const lineTemplate = require('../utils/line-template');
const querystring = require('querystring');
const { UserType, InquiryStatus, TransactionType, TransactionStatus } = require('../utils/constants');

/**
 * 处理 Postback 事件
 */
const handlePostback = async (lineClient, prisma, event) => {
  const { data } = event.postback;
  const { userId } = event.source;

  try {
    // 解析 postback 数据
    const params = querystring.parse(data);
    const action = params.action;

    // 确保用户存在
    const user = await userService.findOrCreateUser(prisma, lineClient, userId);

    // 根据不同的 action 执行对应的处理
    switch (action) {
      case 'select_location':
        await handleSelectLocation(lineClient, params.location, event.replyToken);
        break;
      
      case 'select_property_type':
        await handleSelectPropertyType(lineClient, params, event.replyToken);
        break;
      
      case 'select_price_range':
        await handleSelectPriceRange(lineClient, params, event.replyToken);
        break;
      
      case 'show_property_list':
        await handleShowPropertyList(lineClient, prisma, params, event.replyToken);
        break;
      
      case 'view_property_detail':
        await handleViewPropertyDetail(lineClient, prisma, params.propertyId, event.replyToken);
        break;
      
      case 'contact_landlord':
        await handleContactLandlord(lineClient, prisma, user.id, params.propertyId, event.replyToken);
        break;
      
      case 'create_property':
        await handleCreateProperty(lineClient, user, params.type, event.replyToken);
        break;
      
      case 'set_property_location':
        await handleSetPropertyLocation(lineClient, user, params, event.replyToken);
        break;
      
      case 'confirm_property_creation':
        await handleConfirmPropertyCreation(lineClient, prisma, user, params, event.replyToken);
        break;
      
      case 'pay_deposit':
        await handlePayDeposit(lineClient, prisma, user.id, params.inquiryId, event.replyToken);
        break;

      case 'pay_commission':
        await handlePayCommission(lineClient, prisma, user.id, params.inquiryId, event.replyToken);
        break;
      
      default:
        console.log(`未知的 postback action: ${action}`);
        await lineClient.replyMessage(event.replyToken, {
          type: 'text',
          text: '抱歉，无法处理您的请求。请重新尝试或输入"帮助"获取使用说明。'
        });
    }
  } catch (error) {
    console.error('处理 postback 时出错:', error);
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '抱歉，处理您的请求时发生错误。请稍后再试。'
    });
  }
};

/**
 * 处理选择地区后的操作
 */
const handleSelectLocation = async (lineClient, location, replyToken) => {
  const message = {
    type: 'text',
    text: `已選擇地區：${location}，請選擇房屋類型：`,
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '整層住家',
            data: `action=select_property_type&location=${location}&type=整層住家`,
            displayText: '整層住家'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '獨立套房',
            data: `action=select_property_type&location=${location}&type=獨立套房`,
            displayText: '獨立套房'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '分租套房',
            data: `action=select_property_type&location=${location}&type=分租套房`,
            displayText: '分租套房'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '雅房',
            data: `action=select_property_type&location=${location}&type=雅房`,
            displayText: '雅房'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '不限',
            data: `action=select_property_type&location=${location}&type=all`,
            displayText: '不限房型'
          }
        }
      ]
    }
  };

  await lineClient.replyMessage(replyToken, message);
};

/**
 * 处理选择房屋类型后的操作
 */
const handleSelectPropertyType = async (lineClient, params, replyToken) => {
  const { location, type } = params;
  
  const message = {
    type: 'text',
    text: `已選擇地區：${location}，房型：${type === 'all' ? '不限' : type}，請選擇價格範圍：`,
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '5000以下',
            data: `action=select_price_range&location=${location}&type=${type}&price=0-5000`,
            displayText: '5000元以下'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '5000-10000',
            data: `action=select_price_range&location=${location}&type=${type}&price=5000-10000`,
            displayText: '5000-10000元'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '10000-15000',
            data: `action=select_price_range&location=${location}&type=${type}&price=10000-15000`,
            displayText: '10000-15000元'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '15000-20000',
            data: `action=select_price_range&location=${location}&type=${type}&price=15000-20000`,
            displayText: '15000-20000元'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '20000以上',
            data: `action=select_price_range&location=${location}&type=${type}&price=20000-999999`,
            displayText: '20000元以上'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '不限價格',
            data: `action=select_price_range&location=${location}&type=${type}&price=all`,
            displayText: '不限價格'
          }
        }
      ]
    }
  };

  await lineClient.replyMessage(replyToken, message);
};

/**
 * 处理选择价格范围后的操作
 */
const handleSelectPriceRange = async (lineClient, params, replyToken) => {
  const { location, type, price } = params;
  
  let priceRangeText = '不限';
  if (price !== 'all') {
    const [min, max] = price.split('-');
    if (max === '999999') {
      priceRangeText = `${min}元以上`;
    } else if (min === '0') {
      priceRangeText = `${max}元以下`;
    } else {
      priceRangeText = `${min}-${max}元`;
    }
  }

  const message = {
    type: 'text',
    text: `搜索條件：\n地區：${location}\n房型：${type === 'all' ? '不限' : type}\n價格：${priceRangeText}\n\n點擊下方按鈕查看符合條件的房源`,
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '查看房源列表',
            data: `action=show_property_list&location=${location}&type=${type}&price=${price}`,
            displayText: '查看房源列表'
          }
        }
      ]
    }
  };

  await lineClient.replyMessage(replyToken, message);
};

/**
 * 处理显示房源列表
 */
const handleShowPropertyList = async (lineClient, prisma, params, replyToken) => {
  const { location, type, price } = params;
  
  try {
    // 构建查询条件
    const whereClause = {
      status: 'AVAILABLE'
    };
    
    if (location !== 'all') whereClause.location = location;
    if (type !== 'all') whereClause.type = type;
    
    if (price !== 'all') {
      const [min, max] = price.split('-').map(Number);
      whereClause.price = {
        gte: min,
        lte: max
      };
    }

    // 查询符合条件的房源
    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            displayName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10  // 限制结果数量
    });
    
    if (properties.length === 0) {
      return await lineClient.replyMessage(replyToken, {
        type: 'text',
        text: '抱歉，目前沒有符合您條件的房源。請嘗試調整搜索條件。',
        quickReply: {
          items: [
            {
              type: 'action',
              action: {
                type: 'message',
                label: '重新搜索',
                text: '找房子'
              }
            }
          ]
        }
      });
    }

    // 创建 Flex 消息模板显示房源列表
    const flexMessage = lineTemplate.createPropertySearchResultTemplate(properties);
    
    await lineClient.replyMessage(replyToken, flexMessage);
  } catch (error) {
    console.error('显示房源列表时出错:', error);
    await lineClient.replyMessage(replyToken, {
      type: 'text',
      text: '獲取房源列表時發生錯誤，請稍後再試。'
    });
  }
};

/**
 * 处理查看房源详情
 */
const handleViewPropertyDetail = async (lineClient, prisma, propertyId, replyToken) => {
  try {
    const property = await propertyService.getPropertyById(prisma, propertyId);
    
    if (!property) {
      return await lineClient.replyMessage(replyToken, {
        type: 'text',
        text: '抱歉，找不到該房源信息，可能已被下架。'
      });
    }

    // 创建房源详情的 Flex 消息
    const flexMessage = lineTemplate.createPropertyDetailTemplate(property);
    
    await lineClient.replyMessage(replyToken, flexMessage);
  } catch (error) {
    console.error('查看房源详情时出错:', error);
    await lineClient.replyMessage(replyToken, {
      type: 'text',
      text: '獲取房源詳情時發生錯誤，請稍後再試。'
    });
  }
};

/**
 * 处理联系房东
 */
const handleContactLandlord = async (lineClient, prisma, userId, propertyId, replyToken) => {
  try {
    // 获取房源信息
    const property = await propertyService.getPropertyById(prisma, propertyId);
    
    if (!property) {
      return await lineClient.replyMessage(replyToken, {
        type: 'text',
        text: '抱歉，找不到該房源信息，可能已被下架。'
      });
    }

    // 创建租房询问
    const inquiry = await inquiryService.createInquiry(prisma, {
      tenantId: userId,
      propertyId: propertyId,
      message: `租客对您的房源"${property.title}"感兴趣`
    });

    // 回复确认消息
    const depositAmount = property.price * 0.1; // 假设保证金为租金的10%
    
    const message = {
      type: 'text',
      text: `您已成功表達對房源"${property.title}"的興趣！\n\n為了獲取房東的聯絡方式，需要支付${depositAmount}元作為保證金。\n\n支付後，您將立即獲得房東資訊，並可直接聯絡。\n\n按下方按鈕進行支付：`,
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'postback',
              label: '支付保證金',
              data: `action=pay_deposit&inquiryId=${inquiry.id}`,
              displayText: '支付保證金'
            }
          },
          {
            type: 'action',
            action: {
              type: 'message',
              label: '暫不支付',
              text: '我的询问'
            }
          }
        ]
      }
    };

    await lineClient.replyMessage(replyToken, message);

    // 通知房东
    const notifyLandlordMessage = {
      type: 'text',
      text: `有租客對您的房源"${property.title}"感興趣！\n\n如需查看租客信息，請支付${depositAmount}元作為保證金。\n\n支付後，您將立即獲得租客聯繫方式。`,
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'postback',
              label: '支付保證金',
              data: `action=pay_commission&inquiryId=${inquiry.id}`,
              displayText: '支付保證金獲取租客聯絡方式'
            }
          }
        ]
      }
    };

    // 发送消息给房东
    await lineClient.pushMessage(property.owner.lineUserId, notifyLandlordMessage);
  } catch (error) {
    console.error('联系房东时出错:', error);
    await lineClient.replyMessage(replyToken, {
      type: 'text',
      text: '處理您的請求時發生錯誤，請稍後再試。'
    });
  }
};

/**
 * 处理创建房源
 */
const handleCreateProperty = async (lineClient, user, type, replyToken) => {
  // 创建临时会话状态，存储用户选择的房屋类型
  // 在实际应用中，应该使用数据库或缓存存储这些临时数据
  // 这里简化处理，直接返回下一步的消息
  
  const message = {
    type: 'text',
    text: `已選擇房屋類型：${type}，請選擇房屋所在地區：`,
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '台北市',
            data: `action=set_property_location&type=${type}&location=台北市`,
            displayText: '台北市'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '新北市',
            data: `action=set_property_location&type=${type}&location=新北市`,
            displayText: '新北市'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '桃園市',
            data: `action=set_property_location&type=${type}&location=桃園市`,
            displayText: '桃園市'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '台中市',
            data: `action=set_property_location&type=${type}&location=台中市`,
            displayText: '台中市'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '高雄市',
            data: `action=set_property_location&type=${type}&location=高雄市`,
            displayText: '高雄市'
          }
        }
      ]
    }
  };

  await lineClient.replyMessage(replyToken, message);
};

/**
 * 处理设置房源位置
 */
const handleSetPropertyLocation = async (lineClient, user, params, replyToken) => {
  const { type, location } = params;
  
  // 请求用户输入房源价格
  const message = {
    type: 'text',
    text: `已選擇房屋類型：${type}，地區：${location}\n\n請輸入月租金(數字)：`,
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '5000元',
            data: `action=confirm_property_creation&type=${type}&location=${location}&price=5000&title=${location}${type}`,
            displayText: '5000元'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '8000元',
            data: `action=confirm_property_creation&type=${type}&location=${location}&price=8000&title=${location}${type}`,
            displayText: '8000元'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '10000元',
            data: `action=confirm_property_creation&type=${type}&location=${location}&price=10000&title=${location}${type}`,
            displayText: '10000元'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '15000元',
            data: `action=confirm_property_creation&type=${type}&location=${location}&price=15000&title=${location}${type}`,
            displayText: '15000元'
          }
        },
        {
          type: 'action',
          action: {
            type: 'postback',
            label: '20000元',
            data: `action=confirm_property_creation&type=${type}&location=${location}&price=20000&title=${location}${type}`,
            displayText: '20000元'
          }
        }
      ]
    }
  };

  await lineClient.replyMessage(replyToken, message);
};

/**
 * 处理确认创建房源
 */
const handleConfirmPropertyCreation = async (lineClient, prisma, user, params, replyToken) => {
  const { type, location, price, title } = params;
  
  try {
    // 设置用户为房东
    await prisma.user.update({
      where: { id: user.id },
      data: { userType: UserType.LANDLORD }
    });
    
    // 创建房源
    const property = await propertyService.createProperty(prisma, {
      title: `${title}`,
      type,
      location,
      price: parseFloat(price),
      description: `${location}${type}，月租${price}元`,
      ownerId: user.id
    });
    
    // 回复确认消息
    const confirmMessage = {
      type: 'text',
      text: `恭喜！您的房源已成功發布：\n\n標題：${title}\n類型：${type}\n地區：${location}\n月租：${price}元\n\n租客對您的房源感興趣時，您將收到通知。`,
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'message',
              label: '查看我的房源',
              text: '我的房源'
            }
          },
          {
            type: 'action',
            action: {
              type: 'message',
              label: '發布新房源',
              text: '刊登房源'
            }
          }
        ]
      }
    };
    
    await lineClient.replyMessage(replyToken, confirmMessage);
  } catch (error) {
    console.error('创建房源时出错:', error);
    await lineClient.replyMessage(replyToken, {
      type: 'text',
      text: '創建房源時發生錯誤，請稍後再試。'
    });
  }
};

/**
 * 处理租客支付保证金
 */
const handlePayDeposit = async (lineClient, prisma, userId, inquiryId, replyToken) => {
  try {
    // 获取询问信息
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: {
        property: {
          include: {
            owner: true
          }
        },
        tenant: true
      }
    });
    
    if (!inquiry) {
      return await lineClient.replyMessage(replyToken, {
        type: 'text',
        text: '找不到相关询问记录。'
      });
    }
    
    // 计算保证金金额
    const depositAmount = inquiry.property.price * 0.1;
    
    // 创建交易记录
    const transaction = await transactionService.createTransaction(prisma, {
      type: TransactionType.DEPOSIT,
      amount: depositAmount,
      senderId: userId,
      receiverId: inquiry.property.ownerId,
      inquiryId: inquiryId,
      paymentMethod: 'LINE_PAY'
    });
    
    // 在真实环境中，这里应该调用支付系统API
    // 这里简化处理，直接更新交易状态为完成
    await transactionService.updateTransactionStatus(prisma, transaction.id, TransactionStatus.COMPLETED, 'dummy_payment_id');
    
    // 更新询问状态
    await inquiryService.updateInquiryStatus(prisma, inquiryId, InquiryStatus.APPROVED);
    
    // 回复成功消息，包含房东联系方式
    const message = {
      type: 'text',
      text: `保證金支付成功！\n\n以下是房東聯絡資訊：\n\n姓名：${inquiry.property.owner.displayName}\nLINE ID：${inquiry.property.owner.lineUserId}\n\n請直接聯絡房東進行後續洽談。`,
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'message',
              label: '查看我的询问',
              text: '我的询问'
            }
          }
        ]
      }
    };
    
    await lineClient.replyMessage(replyToken, message);
    
    // 通知房东
    const notifyLandlordMessage = {
      type: 'text',
      text: `租客已支付保證金！\n\n租客對您的房源"${inquiry.property.title}"感興趣，並已支付保證金。\n\n租客信息：\n姓名：${inquiry.tenant.displayName}\nLINE ID：${inquiry.tenant.lineUserId}\n\n請盡快與租客聯絡。`
    };
    
    await lineClient.pushMessage(inquiry.property.owner.lineUserId, notifyLandlordMessage);
  } catch (error) {
    console.error('处理支付保证金时出错:', error);
    await lineClient.replyMessage(replyToken, {
      type: 'text',
      text: '處理支付時發生錯誤，請稍後再試。'
    });
  }
};

/**
 * 处理房东支付佣金
 */
const handlePayCommission = async (lineClient, prisma, userId, inquiryId, replyToken) => {
  try {
    // 获取询问信息
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: {
        property: {
          include: {
            owner: true
          }
        },
        tenant: true
      }
    });
    
    if (!inquiry) {
      return await lineClient.replyMessage(replyToken, {
        type: 'text',
        text: '找不到相关询问记录。'
      });
    }
    
    // 计算佣金金额
    const commissionAmount = inquiry.property.price * 0.1;
    
    // 创建交易记录
    const transaction = await transactionService.createTransaction(prisma, {
      type: TransactionType.COMMISSION,
      amount: commissionAmount,
      senderId: userId,
      receiverId: inquiry.tenantId,
      inquiryId: inquiryId,
      paymentMethod: 'LINE_PAY'
    });
    
    // 在真实环境中，这里应该调用支付系统API
    // 这里简化处理，直接更新交易状态为完成
    await transactionService.updateTransactionStatus(prisma, transaction.id, TransactionStatus.COMPLETED, 'dummy_payment_id');
    
    // 回复成功消息，包含租客联系方式
    const message = {
      type: 'text',
      text: `保證金支付成功！\n\n以下是租客聯絡資訊：\n\n姓名：${inquiry.tenant.displayName}\nLINE ID：${inquiry.tenant.lineUserId}\n\n請直接聯絡租客進行後續洽談。`,
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'message',
              label: '查看我的房源',
              text: '我的房源'
            }
          }
        ]
      }
    };
    
    await lineClient.replyMessage(replyToken, message);
    
    // 通知租客
    const notifyTenantMessage = {
      type: 'text',
      text: `房東已支付保證金！\n\n房東已查看您對房源"${inquiry.property.title}"的興趣，並已支付保證金。\n\n房東信息：\n姓名：${inquiry.property.owner.displayName}\nLINE ID：${inquiry.property.owner.lineUserId}\n\n請等待房東聯絡，或主動聯絡房東。`
    };
    
    await lineClient.pushMessage(inquiry.tenant.lineUserId, notifyTenantMessage);
  } catch (error) {
    console.error('处理支付佣金时出错:', error);
    await lineClient.replyMessage(replyToken, {
      type: 'text',
      text: '處理支付時發生錯誤，請稍後再試。'
    });
  }
};

module.exports = {
  handlePostback
}; 