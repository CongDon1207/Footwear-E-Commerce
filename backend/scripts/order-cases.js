const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderByNumber,
} = require('../src/controllers/orderController');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const { createRes } = require('./test-helpers');

const orderCases = [
  {
    name: 'createOrder returns success payload with payment and totals',
    testFn: async () => {
      const originalStartSession = mongoose.startSession;
      const originalFindProduct = Product.findById;
      const originalGenerateOrderNumber = Order.generateOrderNumber;
      const originalOrderSave = Order.prototype.save;

      const session = {
        startTransaction: () => {},
        commitTransaction: async () => {},
        abortTransaction: async () => {},
        endSession: () => {},
      };

      try {
        mongoose.startSession = async () => session;
        Product.findById = () => ({
          session: async () => ({
            _id: new mongoose.Types.ObjectId(),
            name: 'Mock Product',
            price: 1000000,
            discount: 10,
            isActive: true,
            sizes: [{ size: '42', stock: 5 }],
            save: async () => {},
          }),
        });
        Order.generateOrderNumber = async () => 'FW-MOCK-001';
        Order.prototype.save = async function saveMock() {
          this._id = this._id || new mongoose.Types.ObjectId();
          this.createdAt = new Date();
          return this;
        };

        const req = {
          userId: new mongoose.Types.ObjectId().toString(),
          body: {
            items: [{ productId: new mongoose.Types.ObjectId().toString(), size: '42', quantity: 1 }],
            shippingAddress: {
              fullName: 'Order User',
              phone: '0987654321',
              address: '123 Main Street',
              city: 'HCM',
              district: 'District 1',
            },
            paymentMethod: 'cod',
          },
        };
        const res = createRes();

        await createOrder(req, res, () => {});
        assert.equal(res.statusCode, 201);
        assert.equal(res.payload.order.orderNumber, 'FW-MOCK-001');
        assert.equal(typeof res.payload.order.total, 'number');
        assert.equal(res.payload.order.status, 'pending');
      } finally {
        mongoose.startSession = originalStartSession;
        Product.findById = originalFindProduct;
        Order.generateOrderNumber = originalGenerateOrderNumber;
        Order.prototype.save = originalOrderSave;
      }
    },
  },
  {
    name: 'order query blocks users from accessing another user order by id and number',
    testFn: async () => {
      const originalFindOne = Order.findOne;

      try {
        Order.findOne = async () => null;

        const byIdRes = createRes();
        await getOrderById(
          { userId: 'user-a', params: { id: new mongoose.Types.ObjectId().toString() } },
          byIdRes,
          () => {}
        );
        assert.equal(byIdRes.statusCode, 404);
        assert.equal(byIdRes.payload.message, 'Order not found');

        const byNumberRes = createRes();
        await getOrderByNumber(
          { userId: 'user-a', params: { orderNumber: 'FW-SECRET-001' } },
          byNumberRes,
          () => {}
        );
        assert.equal(byNumberRes.statusCode, 404);
        assert.equal(byNumberRes.payload.message, 'Order not found');
      } finally {
        Order.findOne = originalFindOne;
      }
    },
  },
  {
    name: 'getMyOrders returns paginated response contract',
    testFn: async () => {
      const originalFind = Order.find;
      const originalCountDocuments = Order.countDocuments;

      try {
        const orders = [{ orderNumber: 'FW-1' }, { orderNumber: 'FW-2' }];
        Order.find = () => ({
          sort: () => ({
            skip: () => ({
              limit: () => ({
                select: async () => orders,
              }),
            }),
          }),
        });
        Order.countDocuments = async () => 2;

        const res = createRes();
        await getMyOrders({ userId: 'user-a', query: { page: '1', limit: '10' } }, res, () => {});

        assert.equal(res.statusCode, 200);
        assert.equal(res.payload.orders.length, 2);
        assert.equal(res.payload.pagination.total, 2);
        assert.equal(res.payload.pagination.page, 1);
      } finally {
        Order.find = originalFind;
        Order.countDocuments = originalCountDocuments;
      }
    },
  },
  {
    name: 'getOrderByNumber returns payment block for bank transfer orders',
    testFn: async () => {
      const originalFindOne = Order.findOne;

      try {
        Order.findOne = async () => ({
          toObject: () => ({
            orderNumber: 'FW-BANK-001',
            paymentMethod: 'bank_transfer',
            paymentStatus: 'pending',
          }),
        });

        const res = createRes();
        await getOrderByNumber(
          { userId: 'user-a', params: { orderNumber: 'FW-BANK-001' } },
          res,
          () => {}
        );

        assert.equal(res.statusCode, 200);
        assert.equal(res.payload.order.orderNumber, 'FW-BANK-001');
        assert.equal(res.payload.order.payment.transferNote, 'FW-BANK-001');
      } finally {
        Order.findOne = originalFindOne;
      }
    },
  },
];

module.exports = {
  orderCases,
};
