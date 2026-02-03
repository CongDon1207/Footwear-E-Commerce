const getBankInfo = () => {
  const name = process.env.BANK_NAME;
  const accountName = process.env.BANK_ACCOUNT_NAME;
  const accountNumber = process.env.BANK_ACCOUNT_NUMBER;

  if (!name || !accountName || !accountNumber) return null;

  return {
    name,
    accountName,
    accountNumber,
  };
};

const buildPaymentInfo = (order) => {
  if (!order || order.paymentMethod !== 'bank_transfer') return null;

  return {
    method: order.paymentMethod,
    status: order.paymentStatus,
    transferNote: order.orderNumber,
    bank: getBankInfo(),
  };
};

const toOrderResponse = (orderDoc) => {
  const order = orderDoc?.toObject ? orderDoc.toObject() : orderDoc;
  return {
    ...order,
    payment: buildPaymentInfo(order),
  };
};

module.exports = {
  getBankInfo,
  buildPaymentInfo,
  toOrderResponse,
};

