# Flora — flower shop landing page

Responsive landing page for a flower shop with dynamic content, forms, modals, and a full-stack bouquets catalog backed by PostgreSQL.

Design: [Flora on Figma](https://www.figma.com/design/2Tj16H7IO7dq1ViTvIh57V/Flora?t=7olHeLo3vrfKuoc2-0)

## Live demo

| Resource | URL |
|----------|-----|
| Frontend (GitHub Pages) | https://rlevin-ctrl.github.io/UMT-markup-practice-Levin_Robert/ |
| Backend API (Render) | https://umt-markup-practice-levin-robert.onrender.com/api |
| Swagger UI | https://umt-markup-practice-levin-robert.onrender.com/api-docs |

## About the project

**Flora** is a single-page website for a flower shop. The frontend is built with HTML, CSS, and JavaScript (Vite). The bouquets section is connected to a real REST API on Express with PostgreSQL.

### Frontend features

- Responsive layout (mobile, tablet, desktop)
- Retina-ready images (`srcset`, `sizes`, 2x backgrounds)
- Top-Selling Bouquets and Feedback sliders (Swiper)
- Bouquets catalog with pagination, search, and detail modal
- Request and order modals, footer subscribe form
- Custom checkbox UI via SVG sprite

### Backend features

- CRUD for bouquets (Sequelize + PostgreSQL)
- Read-only lists for bestsellers and feedback
- Joi validation, centralized error handling
- Photo upload (Multer: temp → `public/photos`)
- Swagger documentation at `/api-docs`
- Deployed on Render with PostgreSQL

## Tech stack

**Frontend:** HTML5, CSS3, JavaScript (ES modules), Vite, Axios, Swiper, json-server (local mock)

**Backend:** Node.js, Express, Sequelize, PostgreSQL, Joi, Multer, Swagger UI

## Local development

### Frontend

```bash
npm install
npm run dev
```

Open http://localhost:4000/UMT-markup-practice-Levin_Robert/

For local frontend with the real API, create `.env`:

```env
VITE_API_MODE=server
VITE_API_BASE_URL=http://localhost:3000/api
VITE_BOUQUETS_API_URL=http://localhost:3000/api
```

Or run json-server only for offline mock:

```bash
npm run server
```

With json-server, keep `VITE_API_MODE=static` and `VITE_API_BASE_URL=/api`.

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
npm run build
```

Production build uses `.env.production`: all sections load data from the Render API (bouquets, bestsellers, feedback).

## Project structure

```
index.html
src/js/           # frontend modules
src/css/
public/images/
backend/          # Express API
db.json           # seed source for mock API and PostgreSQL
dist/             # production build for GitHub Pages
```

## Author

Robert Levin — [GitHub](https://github.com/rlevin-ctrl)
