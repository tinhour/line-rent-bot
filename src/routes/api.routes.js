const express = require('express');
const { PropertyStatus, InquiryStatus, TransactionStatus } = require('../utils/constants');

module.exports = (prisma) => {
  const router = express.Router();

  // 获取所有房源
  router.get('/properties', async (req, res) => {
    try {
      const { location, type, minPrice, maxPrice } = req.query;
      
      // 构建查询条件
      const whereClause = {
        status: PropertyStatus.AVAILABLE
      };
      
      if (location) whereClause.location = location;
      if (type) whereClause.type = type;
      
      if (minPrice || maxPrice) {
        whereClause.price = {};
        if (minPrice) whereClause.price.gte = parseFloat(minPrice);
        if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
      }

      const properties = await prisma.property.findMany({
        where: whereClause,
        include: {
          owner: {
            select: {
              id: true,
              displayName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(properties);
    } catch (error) {
      console.error('获取房源失败:', error);
      res.status(500).json({ error: '获取房源失败' });
    }
  });

  // 获取特定房源
  router.get('/properties/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const property = await prisma.property.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              displayName: true
            }
          }
        }
      });

      if (!property) {
        return res.status(404).json({ error: '房源不存在' });
      }

      res.json(property);
    } catch (error) {
      console.error('获取房源详情失败:', error);
      res.status(500).json({ error: '获取房源详情失败' });
    }
  });

  // 创建房源
  router.post('/properties', async (req, res) => {
    try {
      const { lineUserId, title, location, type, price, description, imageUrls } = req.body;

      // 查找用户
      const user = await prisma.user.findUnique({ where: { lineUserId } });
      
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      // 创建房源
      const property = await prisma.property.create({
        data: {
          title,
          location,
          type,
          price: parseFloat(price),
          description,
          imageUrls: imageUrls ? JSON.stringify(imageUrls) : null,
          owner: {
            connect: { id: user.id }
          }
        }
      });

      res.status(201).json(property);
    } catch (error) {
      console.error('创建房源失败:', error);
      res.status(500).json({ error: '创建房源失败' });
    }
  });

  // 创建租房询问
  router.post('/inquiries', async (req, res) => {
    try {
      const { propertyId, lineUserId, message } = req.body;

      // 查找用户
      const user = await prisma.user.findUnique({ where: { lineUserId } });
      
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      // 创建询问
      const inquiry = await prisma.inquiry.create({
        data: {
          message,
          tenant: {
            connect: { id: user.id }
          },
          property: {
            connect: { id: propertyId }
          }
        },
        include: {
          property: {
            include: {
              owner: true
            }
          }
        }
      });

      res.status(201).json(inquiry);
    } catch (error) {
      console.error('创建房源询问失败:', error);
      res.status(500).json({ error: '创建房源询问失败' });
    }
  });

  // 创建交易
  router.post('/transactions', async (req, res) => {
    try {
      const { inquiryId, type, amount, senderId, receiverId, paymentMethod } = req.body;

      const transaction = await prisma.transaction.create({
        data: {
          type,
          amount: parseFloat(amount),
          paymentMethod,
          sender: {
            connect: { id: senderId }
          },
          receiver: {
            connect: { id: receiverId }
          },
          ...(inquiryId && {
            inquiry: {
              connect: { id: inquiryId }
            }
          })
        }
      });

      res.status(201).json(transaction);
    } catch (error) {
      console.error('创建交易失败:', error);
      res.status(500).json({ error: '创建交易失败' });
    }
  });

  // 更新交易状态
  router.patch('/transactions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, paymentId } = req.body;

      const transaction = await prisma.transaction.update({
        where: { id },
        data: {
          status,
          paymentId,
          ...(status === TransactionStatus.COMPLETED && {
            inquiry: {
              update: {
                status: InquiryStatus.APPROVED
              }
            }
          })
        }
      });

      res.json(transaction);
    } catch (error) {
      console.error('更新交易状态失败:', error);
      res.status(500).json({ error: '更新交易状态失败' });
    }
  });

  return router;
}; 