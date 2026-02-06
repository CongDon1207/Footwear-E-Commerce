import assert from 'node:assert/strict';
import test from 'node:test';

import { updateCartItems } from '../../utils/cartUtils.js';

test('cart utility removes item when quantity is zero', () => {
  const items = [
    { productId: 'p1', size: '42', quantity: 1, stock: 5 },
    { productId: 'p2', size: '41', quantity: 2, stock: 10 },
  ];

  const updated = updateCartItems(items, 'p1', '42', 0);
  assert.equal(updated.length, 1);
  assert.equal(updated[0].productId, 'p2');
});

test('cart utility clamps quantity to stock', () => {
  const items = [{ productId: 'p1', size: '42', quantity: 1, stock: 3 }];

  const updated = updateCartItems(items, 'p1', '42', 99);
  assert.equal(updated[0].quantity, 3);
});
