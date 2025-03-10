const { InquiryStatus } = require('../utils/constants');

/**
 * 创建房源询问
 */
const createInquiry = async (prisma, inquiryData) => {
  const { tenantId, propertyId, message } = inquiryData;
  
  return await prisma.inquiry.create({
    data: {
      tenant: {
        connect: {
          id: tenantId
        }
      },
      property: {
        connect: {
          id: propertyId
        }
      },
      message,
      status: InquiryStatus.PENDING
    },
    include: {
      property: {
        include: {
          owner: true
        }
      }
    }
  });
};

/**
 * 获取租客的询问列表
 */
const getTenantInquiries = async (prisma, tenantId) => {
  return await prisma.inquiry.findMany({
    where: {
      tenantId: tenantId
    },
    include: {
      property: true,
      transaction: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

/**
 * 获取房东收到的询问列表
 */
const getLandlordInquiries = async (prisma, ownerId) => {
  return await prisma.inquiry.findMany({
    where: {
      property: {
        ownerId: ownerId
      }
    },
    include: {
      tenant: true,
      property: true,
      transaction: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

/**
 * 更新询问状态
 */
const updateInquiryStatus = async (prisma, inquiryId, status) => {
  return await prisma.inquiry.update({
    where: {
      id: inquiryId
    },
    data: {
      status: status
    }
  });
};

/**
 * 获取询问详情
 */
const getInquiryById = async (prisma, inquiryId) => {
  return await prisma.inquiry.findUnique({
    where: {
      id: inquiryId
    },
    include: {
      tenant: true,
      property: {
        include: {
          owner: true
        }
      },
      transaction: true
    }
  });
};

module.exports = {
  createInquiry,
  getTenantInquiries,
  getLandlordInquiries,
  updateInquiryStatus,
  getInquiryById
}; 