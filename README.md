# Flora — flower shop (monorepo)

Responsive landing page for a flower shop with dynamic content, forms, modals, and a full-stack catalog backed by PostgreSQL.

Design: [Flora on Figma](https://www.figma.com/design/2Tj16H7IO7dq1ViTvIh57V/Flora?t=7olHeLo3vrfKuoc2-0)

## Live demo

| Resource | URL |
|----------|-----|
| Frontend (GitHub Pages) | https://rlevin-ctrl.github.io/UMT-markup-practice-Levin_Robert/ |
| Backend API (Render) | https://umt-markup-practice-levin-robert.onrender.com/api |
| Swagger UI | https://umt-markup-practice-levin-robert.onrender.com/api-docs |

## Project structure

```
backend/          # Express API (Render root directory)
frontend/         # Vite landing page (HTML, CSS, JS)
docs/             # production build for GitHub Pages (generated)
```

## Local development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:4000/UMT-markup-practice-Levin_Robert/

For the real API locally, create `frontend/.env`:

```env
VITE_API_MODE=server
VITE_API_BASE_URL=http://localhost:3000/api
VITE_BOUQUETS_API_URL=http://localhost:3000/api
```

Or from repo root:

```bash
npm run dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
# set DATABASE_URL in .env
npm run seed
npm run dev
```

API: http://localhost:3000/api — Swagger: http://localhost:3000/api-docs

### Production build

```bash
cd frontend
npm run build
```

Build output goes to `/docs` in the repo root (GitHub Pages).

Production uses `frontend/.env.production`: all sections load data from the Render API.

## Author

Robert Levin — [GitHub](https://github.com/rlevin-ctrl)
