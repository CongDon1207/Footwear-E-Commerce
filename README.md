# Footwear E-Commerce

Monorepo for the footwear e-commerce app with:
- `backend` (Node.js + Express + MongoDB)
- `frontend` (React + Vite)

## Workspace Scripts

Run from repository root:

```bash
npm run lint
npm run test
npm run build
npm run check
```

What they do:
- `lint`: backend syntax check + frontend ESLint
- `test`: backend critical-path runner + frontend smoke runner
- `build`: frontend Vite production build
- `check`: lint + test + build

## CI

Pull requests run `.github/workflows/ci.yml`:
- `lint` job: install backend/frontend dependencies and run workspace lint
- `test` job: install backend/frontend dependencies and run workspace tests
- `build` job: install frontend dependencies and run production build
