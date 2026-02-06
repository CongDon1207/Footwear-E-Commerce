import assert from 'node:assert/strict';

import {
  getAdminRedirectPath,
  getProtectedRedirectPath,
} from '../src/utils/routeGuards.js';
import { updateCartItems } from '../src/utils/cartUtils.js';
import {
  buildOrderSuccessPath,
  buildOrderPayload,
  validateCheckoutForm,
} from '../src/pages/checkout/checkoutUtils.js';

const runCase = async (name, testFn) => {
  try {
    await testFn();
    console.log(`PASS ${name}`);
    return true;
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message);
    return false;
  }
};

const baseFormData = {
  fullName: 'Smoke User',
  phone: '0987654321',
  address: '123 Main Street',
  city: 'HCM',
  district: 'District 1',
  ward: '',
  note: '',
  paymentMethod: 'cod',
};

const cases = [
  {
    name: 'protected route redirects guest users to login',
    testFn: () => {
      assert.equal(
        getProtectedRedirectPath({ isAuthenticated: false, loading: false }),
        '/login'
      );
    },
  },
  {
    name: 'admin route redirects non-admin users to home',
    testFn: () => {
      assert.equal(
        getAdminRedirectPath({ isAuthenticated: true, loading: false, role: 'user' }),
        '/'
      );
    },
  },
  {
    name: 'admin route redirects guest users to login',
    testFn: () => {
      assert.equal(
        getAdminRedirectPath({ isAuthenticated: false, loading: false, role: null }),
        '/login'
      );
    },
  },
  {
    name: 'protected route allows authenticated users',
    testFn: () => {
      assert.equal(
        getProtectedRedirectPath({ isAuthenticated: true, loading: false }),
        null
      );
    },
  },
  {
    name: 'cart utility removes item when quantity is zero',
    testFn: () => {
      const items = [
        { productId: 'p1', size: '42', quantity: 1, stock: 5 },
        { productId: 'p2', size: '41', quantity: 2, stock: 10 },
      ];
      const updated = updateCartItems(items, 'p1', '42', 0);
      assert.equal(updated.length, 1);
      assert.equal(updated[0].productId, 'p2');
    },
  },
  {
    name: 'cart utility updates item quantity within available stock',
    testFn: () => {
      const items = [{ productId: 'p1', size: '42', quantity: 1, stock: 3 }];
      const updated = updateCartItems(items, 'p1', '42', 2);
      assert.equal(updated[0].quantity, 2);
    },
  },
  {
    name: 'cart utility clamps quantity when exceeding stock',
    testFn: () => {
      const items = [{ productId: 'p1', size: '42', quantity: 1, stock: 3 }];
      const updated = updateCartItems(items, 'p1', '42', 20);
      assert.equal(updated[0].quantity, 3);
    },
  },
  {
    name: 'checkout validation flags invalid phone number',
    testFn: () => {
      const errors = validateCheckoutForm({ ...baseFormData, phone: '123' });
      assert.equal(errors.phone, 'Invalid phone number');
    },
  },
  {
    name: 'checkout validation accepts valid required fields',
    testFn: () => {
      const errors = validateCheckoutForm(baseFormData);
      assert.deepEqual(errors, {});
    },
  },
  {
    name: 'checkout payload maps items and shipping data',
    testFn: () => {
      const payload = buildOrderPayload(
        [{ productId: 'p1', size: '42', quantity: 2 }],
        baseFormData
      );
      assert.deepEqual(payload.items, [{ productId: 'p1', size: '42', quantity: 2 }]);
      assert.equal(payload.shippingAddress.fullName, 'Smoke User');
      assert.equal(payload.paymentMethod, 'cod');
    },
  },
  {
    name: 'checkout success path uses order number',
    testFn: () => {
      assert.equal(buildOrderSuccessPath('FW202602060001'), '/order-success/FW202602060001');
    },
  },
];

let failed = 0;
for (const item of cases) {
  const ok = await runCase(item.name, item.testFn);
  if (!ok) {
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`\n${failed} frontend smoke case(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${cases.length} frontend smoke case(s) passed.`);
