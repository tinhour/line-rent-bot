const { TransactionStatus } = require('../utils/constants');

/**
 * 创建交易
 */
const createTransaction = async (prisma, transactionData) => {
  const { type, amount, senderId, receiverId, inquiryId, paymentMethod } = transactionData;
  
  return await prisma.transaction.create({
    data: {
      type,
      amount,
      status: TransactionStatus.PENDING,
      paymentMethod,
      sender: {
        connect: {
          id: senderId
        }
      },
      receiver: {
        connect: {
          id: receiverId
        }
      },
      ...(inquiryId && {
        inquiry: {
          connect: {
            id: inquiryId
          }
        }
      })
    }
  });
};

/**
 * 更新交易状态
 */
const updateTransactionStatus = async (prisma, transactionId, status, paymentId) => {
  return await prisma.transaction.update({
    where: {
      id: transactionId
    },
    data: {
      status,
      paymentId
    }
  });
};

/**
 * 获取用户的交易历史
 */
const getUserTransactions = async (prisma, userId) => {
  return await prisma.transaction.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    include: {
      sender: true,
      receiver: true,
      inquiry: {
        include: {
          property: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

/**
 * 根据 ID 获取交易详情
 */
const getTransactionById = async (prisma, transactionId) => {
  return await prisma.transaction.findUnique({
    where: {
      id: transactionId
    },
    include: {
      sender: true,
      receiver: true,
      inquiry: {
        include: {
          property: true,
          tenant: true
        }
      }
    }
  });
};

module.exports = {
  createTransaction,
  updateTransactionStatus,
  getUserTransactions,
  getTransactionById
}; 