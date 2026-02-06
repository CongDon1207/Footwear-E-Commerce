# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- 2026-02-06: Expand stability quality gates at `.github/workflows/ci.yml`, `backend/scripts/*`, and `frontend/scripts/test-smoke.js` - split CI into parallel lint/test/build jobs and extend critical-path smoke coverage without API contract changes (completed).
- 2026-02-06: Fix duplicate Mongoose model indexes at `backend/src/models/Order.js` and `backend/src/models/RefreshToken.js` - remove redundant index definitions to silence startup warnings without changing API behavior (completed).
- 2026-02-06: Implement stability baseline at root/backend/frontend paths - add quality scripts, CI checks, smoke/critical test runners, and split `Profile`/`Dashboard` into smaller page modules (completed).
- 2026-02-06: Add project structure index at `docs/structure.md` - provide source-of-truth map for faster task navigation (completed).
- 2026-02-05: Remove redundant wrappers/docs/temp files at `frontend/src/pages/*`, `backend/*.md`, and cleanup paths - reduce repository noise without runtime behavior changes (completed).
- 2026-02-03: Fix deals admin middleware usage at `backend/src/routes/dealRoutes.js` - use `requireAdmin` function to prevent router handler errors (completed).
- 2026-02-03: Silence dotenv injection logs at `backend/server.js` - use `dotenv.config({ quiet: true })` (completed).
- 2026-02-02: Fix product write authorization at `backend/src/routes/productRoutes.js` - admin-only create/update/delete (completed).
- 2026-02-02: Align admin orders search/pagination at `backend/src/controllers/admin/adminOrdersController.js` - support `search` and legacy `orderNumber` alias (completed).
- 2026-02-02: Refactor admin controllers at `backend/src/controllers/admin/*` - keep files under 300 LOC (completed).
- 2026-02-02: Refactor checkout and order detail pages at `frontend/src/pages/checkout/*` and `frontend/src/pages/orders/detail/*` - keep files under 300 LOC (completed).
- 2026-02-02: Update order success copy and bank transfer instructions at `frontend/src/pages/OrderSuccess.jsx` - remove unimplemented email claim (completed).
- 2026-01-31: Update typography from Varela Round to Rubik for better e-commerce readability at `frontend/src/index.css` - improved heading weights and font rendering
- 2026-01-31: Change focus ring opacity from 20% to 40% at `frontend/src/index.css` - better keyboard navigation visibility
- 2026-01-31: Fix CSS transitions to use specific properties instead of `all` at `frontend/src/index.css` - improved performance
- 2026-01-31: Fix pagination button touch targets from 40px to 44px at `frontend/src/pages/Products.jsx` - better mobile accessibility

### Added
- 2026-02-02: Add payment history tracking at `backend/src/models/Order.js` - audit payment status changes (completed).
- 2026-02-02: Add admin payment status update endpoint at `backend/src/controllers/admin/adminOrdersController.js` - `PATCH /api/admin/orders/:id/payment-status` (completed).
- 2026-02-02: Add bank transfer response payload at `backend/src/controllers/orderController.js` - return bank details + transfer note when available (completed).
- 2026-02-02: Add verified review flag at `backend/src/models/Product.js` - persist verified purchase indicator (completed).
- 2026-02-02: Add review controllers split at `backend/src/controllers/reviews/*` - fix delivered purchase verification and keep files under 300 LOC (completed).
- 2026-02-02: Add admin orders payment update UI at `frontend/src/pages/admin/orders/*` - update payment status from dashboard (completed).
- 2026-01-31: Add OrderDetail page at `frontend/src/pages/OrderDetail.jsx` - order tracking with progress steps, status timeline, shipping/payment info
- 2026-01-31: Add AdminProtectedRoute at `frontend/src/components/AdminProtectedRoute.jsx` - role-based route protection for admin pages
- 2026-01-31: Add Admin Dashboard at `frontend/src/pages/admin/AdminDashboard.jsx` - metrics overview with revenue, orders, products, users stats
- 2026-01-31: Add Admin Orders page at `frontend/src/pages/admin/AdminOrders.jsx` - order list with status update modal and valid transitions
- 2026-01-31: Add Admin Products page at `frontend/src/pages/admin/AdminProducts.jsx` - product list with edit modal and active toggle
- 2026-01-31: Add Admin Users page at `frontend/src/pages/admin/AdminUsers.jsx` - user list with role display and ban/activate actions
- 2026-01-31: Add AdminLayout at `frontend/src/pages/admin/AdminLayout.jsx` - responsive sidebar layout with navigation
- 2026-01-31: Add Product Recommendations API at `backend/src/controllers/productController.js` - rule-based recommendations (same category, on-sale priority)
- 2026-01-31: Add ProductRecommendations component at `frontend/src/components/products/ProductRecommendations.jsx` - "You May Also Like" section on product detail
- 2026-01-31: Add Skeleton Loading component at `frontend/src/components/ui/Skeleton.jsx` - better loading UX with content placeholders
- 2026-01-31: Add `prefers-reduced-motion` support at `frontend/src/index.css` - accessibility for users with motion sensitivity
- 2026-01-31: Add z-index scale CSS variables at `frontend/src/index.css` - better stacking context management
- 2026-01-31: Add Newsletter form validation and feedback at `frontend/src/pages/Home.jsx` - improved form UX with loading, success, and error states
