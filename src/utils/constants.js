/**
 * 用户类型常量
 */
const UserType = {
  LANDLORD: 'LANDLORD',
  TENANT: 'TENANT'
};

/**
 * 房源状态常量
 */
const PropertyStatus = {
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  UNAVAILABLE: 'UNAVAILABLE'
};

/**
 * 询问状态常量
 */
const InquiryStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED'
};

/**
 * 交易类型常量
 */
const TransactionType = {
  DEPOSIT: 'DEPOSIT',
  COMMISSION: 'COMMISSION'
};

/**
 * 交易状态常量
 */
const TransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

module.exports = {
  UserType,
  PropertyStatus,
  InquiryStatus,
  TransactionType,
  TransactionStatus
}; 