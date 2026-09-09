# VectorVision — SIH Internal Round Prototype

This bundle contains:

- `frontend/` — React + Vite frontend with the complete prototype flow.
- `backend/` — optional Fastify reference backend matching the API contract.

## IMPORTANT: existing Render backend

Your backend teammate already has a live Fastify + Neo4j + Postgres backend. **Use that backend for the SIH prototype.**

The only place you must configure its URL is:

`frontend/.env`

Copy `.env.example` to `.env` and set:

`VITE_API_URL=https://YOUR-RENDER-URL.onrender.com`

Do not put the JWT token or database credentials in `.env`.

## Frontend flow

1. `/` — entry page
2. `/report` — citizen tip submission (`POST /tips`)
3. `/official/login` — officer login (`POST /login`)
4. `/official/dashboard` — pending tips (`GET /tips?status=pending`)
5. `/official/tips/:id` — tip detail (`GET /tips/:id`)
6. `/official/investigate` — vehicle graph (`GET /vehicles/:registration/connections`)
7. Verify button (`PATCH /connections/verify`)

## Run frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

On macOS/Linux:

```bash
cp .env.example .env
npm install
npm run dev
```

## Backend reference

Only use `backend/` if your team wants a local reference implementation. Your teammate's existing Render backend should remain the source of truth for the SIH project.

If you do run this reference backend:

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

The reference credentials default to:

- username: `demo_officer`
- password: `demo12345`

Change these before any real deployment.

## One backend improvement to request

Ask your backend teammate to return `submittedAt` as an ISO string, for example:

`2026-08-27T10:01:12.000Z`

instead of Neo4j's nested `{ low, high }` integer structure. The frontend already handles both.

## CORS

The Render backend must allow the deployed frontend origin. For local development it should allow:

`http://localhost:5173`

For deployment, add the actual frontend URL.

## Notes

The frontend intentionally does not pretend that FIR/ML endpoints exist. The documented backend says those endpoints are not built yet, so the internal-round prototype focuses on the working tip → officer → investigation → verification story.
