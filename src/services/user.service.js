const { UserType } = require('../utils/constants');

/**
 * 根据 LINE 用户 ID 获取用户
 */
const getUserByLineId = async (prisma, lineUserId) => {
  return await prisma.user.findUnique({
    where: {
      lineUserId: lineUserId
    }
  });
};

/**
 * 创建或更新用户
 */
const createOrUpdateUser = async (prisma, userData) => {
  const { lineUserId, displayName } = userData;
  
  return await prisma.user.upsert({
    where: {
      lineUserId: lineUserId
    },
    update: {
      displayName: displayName
    },
    create: {
      lineUserId: lineUserId,
      displayName: displayName
    }
  });
};

/**
 * 查找或创建用户
 */
const findOrCreateUser = async (prisma, lineClient, lineUserId) => {
  let user = await getUserByLineId(prisma, lineUserId);
  
  if (!user) {
    try {
      // 获取用户信息
      const profile = await lineClient.getProfile(lineUserId);
      
      // 创建新用户
      user = await createOrUpdateUser(prisma, {
        lineUserId: lineUserId,
        displayName: profile.displayName
      });
    } catch (error) {
      console.error('创建用户时出错:', error);
      throw error;
    }
  }
  
  return user;
};

/**
 * 更新用户类型
 */
const updateUserType = async (prisma, userId, userType) => {
  return await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      userType: userType
    }
  });
};

module.exports = {
  getUserByLineId,
  createOrUpdateUser,
  findOrCreateUser,
  updateUserType
}; 