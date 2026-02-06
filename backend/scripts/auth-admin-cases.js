const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const auth = require('../src/middleware/authMiddleware');
const { requireAdmin } = require('../src/middleware/adminMiddleware');
const {
  register,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
} = require('../src/controllers/authController');
const User = require('../src/models/User');
const RefreshToken = require('../src/models/RefreshToken');
const { createRes } = require('./test-helpers');

const authAdminCases = [
  {
    name: 'auth middleware rejects invalid bearer token',
    testFn: async () => {
      const req = { headers: { authorization: 'Bearer invalid-token' } };
      const res = createRes();
      auth(req, res, () => {});
      assert.equal(res.statusCode, 401);
      assert.equal(res.payload.message, 'Invalid token');
    },
  },
  {
    name: 'admin middleware blocks requests without authenticated user id',
    testFn: async () => {
      const res = createRes();
      await requireAdmin({}, res, () => {});
      assert.equal(res.statusCode, 401);
      assert.equal(res.payload.message, 'Authentication required');
    },
  },
  {
    name: 'admin middleware blocks non-admin users',
    testFn: async () => {
      const originalFindById = User.findById;
      User.findById = () => ({
        select: async () => ({ role: 'user', status: 'active' }),
      });

      try {
        const req = { userId: 'user-1' };
        const res = createRes();
        await requireAdmin(req, res, () => {});
        assert.equal(res.statusCode, 403);
        assert.equal(res.payload.message, 'Admin access required');
      } finally {
        User.findById = originalFindById;
      }
    },
  },
  {
    name: 'register sets cookie and returns auth contract',
    testFn: async () => {
      const originalFindOne = User.findOne;
      const originalUserSave = User.prototype.save;
      const originalTokenSave = RefreshToken.prototype.save;

      try {
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
        let nextError = null;

        await register(req, res, (err) => {
          nextError = err;
        });

        assert.equal(nextError, null);
        assert.equal(res.statusCode, 201);
        assert.equal(typeof res.payload.accessToken, 'string');
        assert.equal(typeof res.payload.user.email, 'string');
        assert.equal(typeof res.payload.user.role, 'string');
        assert.equal(typeof res.cookies.refreshToken, 'string');
      } finally {
        User.findOne = originalFindOne;
        User.prototype.save = originalUserSave;
        RefreshToken.prototype.save = originalTokenSave;
      }
    },
  },
  {
    name: 'refresh endpoint rejects missing refresh token cookie',
    testFn: async () => {
      const res = createRes();
      await refreshAccessToken({ cookies: {} }, res, () => {});
      assert.equal(res.statusCode, 400);
      assert.equal(res.payload.message, 'Refresh token is required');
    },
  },
  {
    name: 'refresh endpoint rejects invalid refresh token',
    testFn: async () => {
      const originalTokenFindOne = RefreshToken.findOne;
      try {
        RefreshToken.findOne = async () => null;
        const res = createRes();
        await refreshAccessToken({ cookies: { refreshToken: 'bad-token' } }, res, () => {});
        assert.equal(res.statusCode, 401);
        assert.equal(res.payload.message, 'Invalid or expired refresh token');
      } finally {
        RefreshToken.findOne = originalTokenFindOne;
      }
    },
  },
  {
    name: 'login refresh logout flow works with mocked persistence',
    testFn: async () => {
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

      try {
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

        const loginRes = createRes();
        await login(
          { body: { email: 'login@example.com', password: '123456' }, ip: '127.0.0.1' },
          loginRes,
          () => {}
        );
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
      } finally {
        User.findOne = originalFindOne;
        User.findById = originalFindById;
        RefreshToken.findOne = originalTokenFindOne;
        RefreshToken.cleanupUserTokens = originalTokenCleanup;
        RefreshToken.prototype.save = originalTokenSave;
      }
    },
  },
  {
    name: 'logout-all revokes all user refresh tokens',
    testFn: async () => {
      const originalRevokeAll = RefreshToken.revokeAllUserTokens;
      let call = null;

      try {
        RefreshToken.revokeAllUserTokens = async (userId, ip) => {
          call = { userId, ip };
        };

        const res = createRes();
        await logoutAll({ userId: 'user-1', ip: '127.0.0.1' }, res, () => {});
        assert.equal(res.statusCode, 200);
        assert.equal(res.payload.message, 'Logged out from all devices successfully');
        assert.deepEqual(call, { userId: 'user-1', ip: '127.0.0.1' });
      } finally {
        RefreshToken.revokeAllUserTokens = originalRevokeAll;
      }
    },
  },
];

module.exports = {
  authAdminCases,
};
