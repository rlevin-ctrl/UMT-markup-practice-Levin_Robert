# Flora — Stage 2 Submission

Responsive landing page with dynamic data rendering, forms, modal workflow, and API-driven pagination/filtering.

## Live Demo

- GitHub Pages: `ADD_YOUR_GH_PAGES_LINK_HERE`
- Repository: `ADD_YOUR_REPO_LINK_HERE`
- Figma: [Flora](https://www.figma.com/design/2Tj16H7IO7dq1ViTvIh57V/Flora?t=7olHeLo3vrfKuoc2-0)

## Tech Stack

- HTML5, CSS3, JavaScript (ES Modules)
- [Vite](https://vite.dev/)
- [Axios](https://axios-http.com/)
- [Swiper](https://swiperjs.com/)
- [json-server](https://www.npmjs.com/package/json-server)

## Project Features (Scope 2)

- Retina-ready content images (`srcset`, `sizes`) and background-image media queries (`min-resolution: 2dppx`)
- Modal window with backdrop and request form (`is-open` flow, close by button/backdrop/Esc)
- Footer subscribe form with semantic fields
- Custom checkbox UI via SVG sprite
- Dynamic rendering from API for:
  - Top-Selling Bouquets slider
  - Feedback slider
  - Bouquets catalog
- Bouquets pagination via `Show More`
- Bouquets filtering/search with state reset to first page
- Empty/end/error states without page reload

## API Modes

This project supports 2 API modes:

1. `server` mode (development): requests go through Vite proxy to `json-server`
2. `static` mode (production): API collections are emitted to static JSON files in `dist/api`

### Environment Variables

- `.env`
  - `VITE_API_MODE=server`
  - `VITE_API_BASE_URL=/api`
- `.env.production`
  - `VITE_API_MODE=static`
  - `VITE_API_BASE_URL=/api`

## Local Run

Install dependencies:

```bash
npm install
```

Run mock backend:

```bash
npm run server
```

In another terminal, run frontend:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Data Source

- Local source for mock API: `db.json`
- Production static API output: `dist/api/*.json`
