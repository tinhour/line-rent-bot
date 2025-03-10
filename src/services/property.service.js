const { PropertyStatus } = require('../utils/constants');

/**
 * 根据ID获取房源
 */
const getPropertyById = async (prisma, id) => {
  return await prisma.property.findUnique({
    where: {
      id: id
    },
    include: {
      owner: true
    }
  });
};

/**
 * 获取用户发布的房源
 */
const getPropertiesByOwnerId = async (prisma, ownerId) => {
  return await prisma.property.findMany({
    where: {
      ownerId: ownerId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

/**
 * 搜索房源
 */
const searchProperties = async (prisma, filters) => {
  const { location, type, minPrice, maxPrice } = filters;
  
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
  
  return await prisma.property.findMany({
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
    }
  });
};

/**
 * 创建房源
 */
const createProperty = async (prisma, propertyData) => {
  const { title, type, location, price, description, ownerId, imageUrls } = propertyData;
  
  return await prisma.property.create({
    data: {
      title,
      type,
      location,
      price,
      description,
      status: PropertyStatus.AVAILABLE,
      imageUrls: imageUrls ? JSON.stringify(imageUrls) : null,
      owner: {
        connect: {
          id: ownerId
        }
      }
    }
  });
};

/**
 * 更新房源状态
 */
const updatePropertyStatus = async (prisma, id, status) => {
  return await prisma.property.update({
    where: {
      id: id
    },
    data: {
      status: status
    }
  });
};

module.exports = {
  getPropertyById,
  getPropertiesByOwnerId,
  searchProperties,
  createProperty,
  updatePropertyStatus
}; 