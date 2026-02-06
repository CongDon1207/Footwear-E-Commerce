import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAdminRedirectPath,
  getProtectedRedirectPath,
} from '../../utils/routeGuards.js';

test('protected route redirects guest users to login', () => {
  assert.equal(
    getProtectedRedirectPath({ isAuthenticated: false, loading: false }),
    '/login'
  );
});

test('protected route allows authenticated users', () => {
  assert.equal(
    getProtectedRedirectPath({ isAuthenticated: true, loading: false }),
    null
  );
});

test('admin route redirects non-admin users to home', () => {
  assert.equal(
    getAdminRedirectPath({ isAuthenticated: true, loading: false, role: 'user' }),
    '/'
  );
});

test('admin route redirects guests to login', () => {
  assert.equal(
    getAdminRedirectPath({ isAuthenticated: false, loading: false, role: null }),
    '/login'
  );
});
