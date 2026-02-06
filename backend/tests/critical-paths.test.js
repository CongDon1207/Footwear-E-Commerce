const assert = require('node:assert/strict');
const test = require('node:test');

const mongoose = require('mongoose');
const auth = require('../src/middleware/authMiddleware');
const { requireAdmin } = require('../src/middleware/adminMiddleware');
const {
  register,
  login,
  refreshAccessToken,
  logout,
} = require('../src/controllers/authController');
const { createOrder } = require('../src/controllers/orders/orderCreateController');
const User = require('../src/models/User');
const RefreshToken = require('../src/models/RefreshToken');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

const createRes = () => {
  return {
    statusCode: 200,
    payload: null,
    cookies: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.payload = data;
      return this;
    },
    cookie(name, value) {
      this.cookies[name] = value;
    },
    clearCookie(name) {
      delete this.cookies[name];
    },
  };
};

test('auth middleware rejects invalid bearer token', () => {
  const req = { headers: { authorization: 'Bearer invalid-token' } };
  const res = createRes();

  auth(req, res, () => {});

  assert.equal(res.statusCode, 401);
  assert.equal(res.payload.message, 'Invalid token');
});

test('admin middleware blocks non-admin users', async () => {
  const originalFindById = User.findById;
  User.findById = () => ({
    select: async () => ({ role: 'user', status: 'active' }),
  });

  const req = { userId: 'user-1' };
  const res = createRes();

  await requireAdmin(req, res, () => {});

  assert.equal(res.statusCode, 403);
  assert.equal(res.payload.message, 'Admin access required');

  User.findById = originalFindById;
});

test('register sets cookie and returns auth contract', async () => {
  const originalFindOne = User.findOne;
  const originalUserSave = User.prototype.save;
  const originalTokenSave = RefreshToken.prototype.save;

  User.findOne = async () => null;
  User.prototype.save = async function saveMock() {
    this._id = this._id || new mongoose.Types.ObjectId();
    return this;
  };
  RefreshToken.prototype.save = async function saveMock() {
    return this;
  };

  const req = {
    body: {
      email: 'register@example.com',
      password: '123456',
      full_name: 'Register User',
    },
    ip: '127.0.0.1',
  };
  const res = createRes();

  await register(req, res, () => {});

  assert.equal(res.statusCode, 201);
  assert.equal(typeof res.payload.accessToken, 'string');
  assert.equal(typeof res.payload.user.email, 'string');
  assert.equal(typeof res.cookies.refreshToken, 'string');

  User.findOne = originalFindOne;
  User.prototype.save = originalUserSave;
  RefreshToken.prototype.save = originalTokenSave;
});

test('login/refresh/logout works with mocked persistence', async () => {
  const originalFindOne = User.findOne;
  const originalFindById = User.findById;
  const originalTokenFindOne = RefreshToken.findOne;
  const originalTokenCleanup = RefreshToken.cleanupUserTokens;
  const originalTokenSave = RefreshToken.prototype.save;

  const user = {
    _id: new mongoose.Types.ObjectId(),
    id: new mongoose.Types.ObjectId().toString(),
    email: 'login@example.com',
    role: 'user',
    status: 'active',
    full_name: 'Login User',
    avatar_url: null,
    comparePassword: async () => true,
  };

  User.findOne = async () => user;
  User.findById = async () => user;
  RefreshToken.prototype.save = async function saveMock() {
    return this;
  };
  RefreshToken.findOne = async ({ token }) => {
    if (token === 'valid-refresh') {
      return {
        user_id: user._id,
        isActive: true,
        revoke() {},
        save: async () => {},
      };
    }

    return null;
  };
  RefreshToken.cleanupUserTokens = async () => {};

  const loginReq = {
    body: { email: 'login@example.com', password: '123456' },
    ip: '127.0.0.1',
  };
  const loginRes = createRes();
  await login(loginReq, loginRes, () => {});
  assert.equal(loginRes.statusCode, 200);
  assert.equal(typeof loginRes.payload.accessToken, 'string');

  const refreshRes = createRes();
  await refreshAccessToken({ cookies: { refreshToken: 'valid-refresh' } }, refreshRes, () => {});
  assert.equal(refreshRes.statusCode, 200);
  assert.equal(typeof refreshRes.payload.accessToken, 'string');

  const logoutRes = createRes();
  await logout(
    { cookies: { refreshToken: 'valid-refresh' }, userId: user.id, ip: '127.0.0.1' },
    logoutRes,
    () => {}
  );
  assert.equal(logoutRes.statusCode, 200);
  assert.equal(logoutRes.payload.message, 'Logged out successfully');

  User.findOne = originalFindOne;
  User.findById = originalFindById;
  RefreshToken.findOne = originalTokenFindOne;
  RefreshToken.cleanupUserTokens = originalTokenCleanup;
  RefreshToken.prototype.save = originalTokenSave;
});

test('createOrder returns success payload with payment and totals', async () => {
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

  mongoose.startSession = originalStartSession;
  Product.findById = originalFindProduct;
  Order.generateOrderNumber = originalGenerateOrderNumber;
  Order.prototype.save = originalOrderSave;
});
