# Project Structure

This document is the quick index for the `footwear-ecommerce` monorepo.

## Root

- `package.json`: workspace quality scripts (`lint`, `test`, `build`, `check`).
- `README.md`: run instructions and CI overview.
- `CHANGELOG.md`: release notes and completed changes.
- `HANDOFF.md`: latest implementation status and verification notes.
- `.github/workflows/ci.yml`: pull request quality pipeline.

## Backend (`backend/`)

- `server.js`: server bootstrap entrypoint.
- `src/app.js`: Express app factory/configuration.
- `config/database.js`: MongoDB connection.
- `src/routes/*.js`: API route registration.
- `src/controllers/`: request handlers grouped by domain.
- `src/middleware/`: auth/admin/error/upload middleware.
- `src/models/`: Mongoose models.
- `scripts/lint.js`: backend syntax-check script.
- `scripts/test.js`: backend critical-path runner orchestrator.
- `scripts/auth-admin-cases.js`: auth/admin critical-path test cases.
- `scripts/order-cases.js`: order critical-path test cases.
- `scripts/test-helpers.js`: shared response/test helpers for script-based tests.
- `tests/critical-paths.test.js`: backend contract/flow assertions used by test strategy.

## Frontend (`frontend/`)

- `src/main.jsx`: app bootstrap.
- `src/App.jsx`: router layout and top-level routes.
- `src/context/`: shared app state (`AuthContext`, `CartContext`, `WishlistContext`).
- `src/components/`: reusable UI and route guards.
- `src/pages/`: route pages.
- `src/pages/profile/`: extracted `Profile` page sections/helpers.
- `src/pages/dashboard/`: extracted `Dashboard` page sections/config.
- `src/pages/checkout/checkoutUtils.js`: checkout validation/payload helpers.
- `src/utils/routeGuards.js`: protected/admin route guard logic.
- `src/utils/cartUtils.js`: cart quantity/update helpers.
- `scripts/test-smoke.js`: frontend smoke test runner.
- `src/tests/smoke/*.js`: utility-level smoke tests (non-Playwright).

## CI and Quality Flow

1. `lint` job installs dependencies in `backend` and `frontend`, then runs workspace lint.
2. `test` job installs dependencies in `backend` and `frontend`, then runs critical/smoke tests.
3. `build` job installs frontend dependencies and builds Vite production bundle.
