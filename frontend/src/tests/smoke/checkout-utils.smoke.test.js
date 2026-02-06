import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildOrderPayload,
  validateCheckoutForm,
} from '../../pages/checkout/checkoutUtils.js';

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

test('checkout validation returns phone error for invalid number', () => {
  const errors = validateCheckoutForm({
    ...baseFormData,
    phone: '123',
  });

  assert.equal(errors.phone, 'Invalid phone number');
});

test('checkout validation accepts valid form data', () => {
  const errors = validateCheckoutForm(baseFormData);
  assert.deepEqual(errors, {});
});

test('checkout payload maps cart items and shipping info correctly', () => {
  const payload = buildOrderPayload(
    [{ productId: 'p1', size: '42', quantity: 2 }],
    baseFormData
  );

  assert.deepEqual(payload.items, [{ productId: 'p1', size: '42', quantity: 2 }]);
  assert.equal(payload.shippingAddress.fullName, 'Smoke User');
  assert.equal(payload.paymentMethod, 'cod');
});
