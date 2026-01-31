# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- 2026-01-31: Update typography from Varela Round to Rubik for better e-commerce readability at `frontend/src/index.css` - improved heading weights and font rendering
- 2026-01-31: Change focus ring opacity from 20% to 40% at `frontend/src/index.css` - better keyboard navigation visibility
- 2026-01-31: Fix CSS transitions to use specific properties instead of `all` at `frontend/src/index.css` - improved performance
- 2026-01-31: Fix pagination button touch targets from 40px to 44px at `frontend/src/pages/Products.jsx` - better mobile accessibility

### Added
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
