# Flora Backend

Express REST API for Flora bouquets with PostgreSQL, Sequelize, Joi validation, Multer uploads and Swagger.

## Requirements

- Node.js 20+
- PostgreSQL (local or [Render](https://render.com))

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill `.env`:

```env
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/flora
APP_URL=http://localhost:3000
CLIENT_ORIGIN=http://localhost:4000
```

## Run locally

```bash
npm run dev
```

Seed database from root `db.json`:

```bash
npm run seed
```

## API

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bouquets` | List (`page`, `limit`, `q`) |
| GET | `/bouquets/:id` | Get one |
| POST | `/bouquets` | Create (Joi validated) |
| PUT | `/bouquets/:id` | Update |
| DELETE | `/bouquets/:id` | Delete |
| PATCH | `/bouquets/:id/favorite` | Toggle favorite |
| PATCH | `/bouquets/:id/photo` | Upload photo (`multipart/form-data`, field `photo`) |

Swagger UI: `http://localhost:3000/api-docs`

Static photos: `http://localhost:3000/photos/<filename>`

## Deploy on Render

1. Create **PostgreSQL** database on Render.
2. Create **Web Service** from this `backend` folder.
3. Set environment variables:
   - `DATABASE_URL` — from Render Postgres
   - `APP_URL` — your Render service URL
   - `CLIENT_ORIGIN` — GitHub Pages URL
   - `NODE_ENV=production`
4. Build command: `npm install`
5. Start command: `npm start`
6. After deploy run seed once (Render shell): `npm run seed`

## Architecture

```
backend/
  server.js              # entry point
  src/
    app.js               # express app
    db/sequelize.js      # DB connection
    models/Bouquet.js    # Sequelize model
    controllers/         # HTTP layer
    services/            # business logic
    schemas/             # Joi validation
    middleware/          # validateBody, uploadPhoto, errorHandler
    helpers/             # HttpError, gravatar, photoStorage
  swagger/swagger.json
  temp/                  # Multer temp uploads
  public/photos/         # permanent photos
```
