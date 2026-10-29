# CraveBite — Food Delivery Application

CraveBite is a responsive food-delivery demo with a React + Vite frontend and a Spring Boot REST API backed by MySQL.

## Project structure

- `frontend/` — React 19, Vite 7, CSS, and repository-owned SVG food artwork.
- `backend/` — Spring Boot 3, Java 17, Spring Data JPA, and MySQL.
- `Dockerfile` and `render.yaml` — Render backend deployment configuration.

## Features

- Restaurant and food browsing
- Search, category filters, restaurant filters, and vegetarian-only filtering
- Cart quantity controls and totals
- Checkout through the Spring Boot API
- Demo-menu seeding/updating without deleting existing database records
- Server-side menu lookup and price calculation for orders

## Run the frontend locally

```bash
cd frontend
npm install
npm run dev
```

To create the production build:

```bash
npm run build
```

Optional environment variable:

- `VITE_API_BASE_URL` — the backend base URL, without a trailing slash. It defaults to `https://cravebite-backend-spring.onrender.com`.

## Deploy the frontend to Vercel

1. Connect/install the GitHub integration in Vercel, then import this repository.
2. Select **Vite** as the framework.
3. Set **Root Directory** to `frontend`.
4. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
5. Set `VITE_API_BASE_URL` to the live Render backend URL.
6. Deploy and test the menu, filters, cart, and checkout.

There is currently no verified live-demo URL. The old GitHub Pages link was removed because the frontend is a Vite application inside `frontend/`, not a root-level static HTML site.

## Deploy the backend to Render

The Render Blueprint uses the root `Dockerfile` and configures `/health` as the service health check. Configure these environment variables in Render:

| Variable | Value |
|---|---|
| `DB_HOST` | Your database host from Aiven |
| `DB_PORT` | Your database port (Blueprint default: `13147`) |
| `DB_NAME` | Your database name (Blueprint default: `defaultdb`) |
| `DB_USER` | Your database username (Blueprint default: `avnadmin`) |
| `DB_PASSWORD` | Your database password |

Never commit real credentials. Use `/health` to check the service process and `/ready` to check database connectivity.

## Demo limitations

- Checkout records demo orders; authentication, payment processing, and live delivery tracking are not implemented.
- Login and Sign Up are presentation-only controls.
- Run a live frontend/backend integration test before describing the app as production-ready.

## Author

A Punith Kumar — [GitHub](https://github.com/ArigalaPunithKumar)
