# S.T.A.L.K.E.R. AI — Frontend API Integration

Updated against the supplied SIH26189 backend API documentation.

## Fixed endpoint mismatches
- `/officerLogin` is now the documented auxiliary route; `/login` remains the authentication route used by the officer portal.
- `GET /tips/:id` and `GET /tips/:id/image` are treated as public routes.
- `PATCH /people/:id/flag` now sends the required `{ flagged: boolean }` body.
- `GET /suspects/:name/orphan-check` uses the documented route and name parameter.
- Vehicle connection lookup uses `GET /vehicles/:registration/connections` with an officer JWT.
- Global search uses `GET /search?q=` instead of filtering the tips list in the browser.
- Removed reliance on the undocumented `/dashboard/stats` route.

## Added Safe-Mesh
- Citizen flow can submit either a normal intelligence tip or a Safe-Mesh risk report.
- Officer `Risk Reports` page reviews the pending queue and calls approve/reject without a request body.
- Geolocation loads only approved Safe-Mesh reports for map pins.

## Added API helpers
All documented endpoints are represented in `frontend/src/api.js`, including cases, people, vehicles, graph connections, search, dashboard, analytics, Safe-Mesh, health and tip endpoints.

## Validation
All 26 JavaScript/JSX source files were parsed successfully with Babel JSX parsing. A production Vite build could not be executed in this Linux environment because the uploaded `node_modules` contains a Windows Rollup optional native dependency; this is an environment/dependency artifact rather than a source syntax error. Run `npm install` (or `npm ci`) in the frontend folder on the development machine before `npm run build`.
