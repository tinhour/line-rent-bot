const { InquiryStatus } = require('./constants');

/**
 * 创建房源列表模板
 */
const createPropertyListTemplate = (properties) => {
  const bubbles = properties.map(property => {
    return {
      type: 'bubble',
      hero: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: property.title,
            weight: 'bold',
            size: 'xl',
            color: '#ffffff',
            wrap: true
          },
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              {
                type: 'text',
                text: `${property.location} | ${property.type}`,
                color: '#ffffff',
                size: 'md',
                flex: 0,
                wrap: true
              }
            ],
            spacing: 'lg'
          },
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              {
                type: 'text',
                text: `月租：${property.price} 元`,
                color: '#ffffff',
                size: 'xl',
                flex: 0,
                wrap: true,
                weight: 'bold'
              }
            ],
            spacing: 'lg',
            margin: 'md'
          }
        ],
        backgroundColor: '#27ACB2',
        paddingAll: '20px',
        height: '150px',
        justifyContent: 'center'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: property.description || '无描述',
                wrap: true,
                color: '#8C8C8C',
                size: 'sm'
              }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: `刊登日期：${new Date(property.createdAt).toLocaleDateString()}`,
                wrap: true,
                color: '#8C8C8C',
                size: 'xs'
              }
            ],
            margin: 'md'
          }
        ],
        spacing: 'md',
        paddingAll: '12px'
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '查看详情',
              data: `action=view_property_detail&propertyId=${property.id}`,
              displayText: '查看详情'
            },
            height: 'sm',
            style: 'primary'
          }
        ]
      }
    };
  });

  return {
    type: 'flex',
    altText: '您的房源列表',
    contents: {
      type: 'carousel',
      contents: bubbles
    }
  };
};

/**
 * 创建房源搜索结果模板
 */
const createPropertySearchResultTemplate = (properties) => {
  const bubbles = properties.map(property => {
    return {
      type: 'bubble',
      hero: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: property.title,
            weight: 'bold',
            size: 'xl',
            color: '#ffffff',
            wrap: true
          },
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              {
                type: 'text',
                text: `${property.location} | ${property.type}`,
                color: '#ffffff',
                size: 'md',
                flex: 0,
                wrap: true
              }
            ],
            spacing: 'lg'
          },
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              {
                type: 'text',
                text: `月租：${property.price} 元`,
                color: '#ffffff',
                size: 'xl',
                flex: 0,
                wrap: true,
                weight: 'bold'
              }
            ],
            spacing: 'lg',
            margin: 'md'
          }
        ],
        backgroundColor: '#0367D3',
        paddingAll: '20px',
        height: '150px',
        justifyContent: 'center'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `房東：${property.owner.displayName}`,
            wrap: true,
            weight: 'bold',
            size: 'md'
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: property.description || '无描述',
                wrap: true,
                color: '#8C8C8C',
                size: 'sm',
                maxLines: 2
              }
            ],
            margin: 'md'
          }
        ],
        spacing: 'md',
        paddingAll: '12px'
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '查看详情',
              data: `action=view_property_detail&propertyId=${property.id}`,
              displayText: '查看详情'
            },
            height: 'sm',
            style: 'primary'
          },
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '联系房东',
              data: `action=contact_landlord&propertyId=${property.id}`,
              displayText: '联系房东'
            },
            height: 'sm',
            style: 'secondary',
            margin: 'md'
          }
        ]
      }
    };
  });

  return {
    type: 'flex',
    altText: '房源搜索结果',
    contents: {
      type: 'carousel',
      contents: bubbles
    }
  };
};

/**
 * 创建房源详情模板
 */
const createPropertyDetailTemplate = (property) => {
  return {
    type: 'flex',
    altText: '房源详情',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: property.title,
            weight: 'bold',
            size: 'xl',
            wrap: true
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '地区',
                    color: '#aaaaaa',
                    size: 'sm',
                    flex: 1
                  },
                  {
                    type: 'text',
                    text: property.location,
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 5
                  }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '类型',
                    color: '#aaaaaa',
                    size: 'sm',
                    flex: 1
                  },
                  {
                    type: 'text',
                    text: property.type,
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 5
                  }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '价格',
                    color: '#aaaaaa',
                    size: 'sm',
                    flex: 1
                  },
                  {
                    type: 'text',
                    text: `${property.price} 元/月`,
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 5
                  }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '房东',
                    color: '#aaaaaa',
                    size: 'sm',
                    flex: 1
                  },
                  {
                    type: 'text',
                    text: property.owner.displayName,
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 5
                  }
                ]
              }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            contents: [
              {
                type: 'text',
                text: '描述',
                color: '#aaaaaa',
                size: 'sm'
              },
              {
                type: 'text',
                text: property.description || '无描述',
                wrap: true,
                color: '#666666',
                size: 'sm',
                margin: 'md'
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'postback',
              label: '联系房东',
              data: `action=contact_landlord&propertyId=${property.id}`,
              displayText: '联系房东'
            }
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '返回搜索',
              text: '我要找房'
            }
          }
        ],
        flex: 0
      }
    }
  };
};

/**
 * 创建询问列表模板
 */
const createInquiryListTemplate = (inquiries) => {
  const bubbles = inquiries.map(inquiry => {
    let statusText = '';
    let statusColor = '';
    
    switch (inquiry.status) {
      case InquiryStatus.PENDING:
        statusText = '待处理';
        statusColor = '#FF8000';
        break;
      case InquiryStatus.APPROVED:
        statusText = '已批准';
        statusColor = '#00B900';
        break;
      case InquiryStatus.REJECTED:
        statusText = '已拒绝';
        statusColor = '#FF0000';
        break;
      case InquiryStatus.COMPLETED:
        statusText = '已完成';
        statusColor = '#0000FF';
        break;
      default:
        statusText = '未知状态';
        statusColor = '#888888';
    }
    
    return {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: inquiry.property.title,
            weight: 'bold',
            size: 'lg',
            wrap: true
          },
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              {
                type: 'text',
                text: statusText,
                color: statusColor,
                size: 'sm',
                weight: 'bold'
              }
            ],
            margin: 'md'
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '地区',
                    color: '#aaaaaa',
                    size: 'sm',
                    flex: 1
                  },
                  {
                    type: 'text',
                    text: inquiry.property.location,
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 5
                  }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '价格',
                    color: '#aaaaaa',
                    size: 'sm',
                    flex: 1
                  },
                  {
                    type: 'text',
                    text: `${inquiry.property.price} 元/月`,
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 5
                  }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '询问日',
                    color: '#aaaaaa',
                    size: 'sm',
                    flex: 1
                  },
                  {
                    type: 'text',
                    text: new Date(inquiry.createdAt).toLocaleDateString(),
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 5
                  }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: inquiry.status === 'PENDING' ? 'primary' : 'secondary',
            height: 'sm',
            action: {
              type: 'postback',
              label: inquiry.status === 'PENDING' ? '支付保证金' : '查看详情',
              data: inquiry.status === 'PENDING' 
                ? `action=pay_deposit&inquiryId=${inquiry.id}` 
                : `action=view_property_detail&propertyId=${inquiry.property.id}`,
              displayText: inquiry.status === 'PENDING' ? '支付保证金' : '查看详情'
            },
            disabled: inquiry.status !== 'PENDING' && inquiry.status !== 'APPROVED'
          }
        ],
        flex: 0
      }
    };
  });

  return {
    type: 'flex',
    altText: '您的租房询问列表',
    contents: {
      type: 'carousel',
      contents: bubbles
    }
  };
};

module.exports = {
  createPropertyListTemplate,
  createPropertySearchResultTemplate,
  createPropertyDetailTemplate,
  createInquiryListTemplate
}; 