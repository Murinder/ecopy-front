# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:5173 (HMR)
npm run build        # tsc -b && vite build → dist/
npm run preview      # Preview production build
npm run lint         # ESLint check
```

Docker/Nginx production image is built from `Dockerfile`; `nginx.conf` serves the SPA with `try_files $uri /index.html` for client-side routing. Docker image tags must be ASCII — Cyrillic tags are rejected by the Docker CLI.

## Entry Point

`src/App.tsx` is the **unused Vite default placeholder** — it is never rendered. The real entry is `src/main.tsx`, which mounts `<AppRouter />` wrapped in Redux `<Provider>` and `<BrowserRouter>`.

## Architecture

### Routing & Auth Guard

`src/routes/AppRouter.tsx` defines all routes. `PrivateRoute` checks `state.auth.token` — if absent, redirects to `/auth`. The only public route is `/auth`.

### Redux Store (`src/app/store.ts`)

One slice + five RTK Query API slices:

| Reducer key | Source | Purpose |
|---|---|---|
| `auth` | `authSlice` | Token, userId, userName, userRole; persisted to `localStorage` under key `"auth"` |
| `coreApi` | `coreApi` | Auth, profile, teachers, applications, dashboard |
| `projectApi` | `projectApi` | Projects, tasks (kanban) |
| `eventApi` | `eventApi` | Events, schedule/lessons, defenses |
| `reportApi` | `reportApi` | Report generation/listing |
| `ratingApi` | `ratingApi` | Student ratings/top list |

Always use `useAppDispatch()` and `useAppSelector()` from `src/app/hooks.ts` — never the raw Redux hooks.

### Auth Persistence

`authSlice` manually calls `saveToStorage(state)` inside every reducer action. There is no middleware or `redux-persist` — if you add a new field to `AuthState`, you must also add it to both `saveToStorage` and `loadFromStorage`.

### API Services (`src/services/`)

All services target `http://localhost:8080` (the API Gateway). JWT is attached via `prepareHeaders` in each `fetchBaseQuery`.

**Important inconsistency:** `ratingApi` endpoints return the DTO directly (not wrapped in `ApiResponse<T>`), while all other services return `ApiResponse<T>`. This is intentional per the current backend contract for the rating service.

`ApiResponse<T>` is duplicated in `coreApi`, `projectApi`, `eventApi`, and `reportApi`. The canonical shape is `{ success, code?, message?, data: T, timestamp? }`.

**RTK Query lazy hooks** (`useLazyXxxQuery`) must be explicitly included in the `export const { ... } = api` destructuring at the bottom of each service file — they are not exported automatically.

**`UserProfileDto` field naming:** the phone field is `phoneNumber` (not `phone`), matching `RegisterRequest`. When mapping profile data to local UI state (which may use `phone`) and back to the API, convert between the two names explicitly.

### Sidebar & Role-Based Navigation

`src/components/Sidebar.tsx` renders different nav items depending on `state.auth.userRole`. Three roles are handled:
- `"Студент"` — default/fallback
- `"Преподаватель"` — teacher portal
- `"Заведующий кафедрой"` — department head portal

**Note:** `Sidebar.tsx` imports its CSS module from `ProjectsPage.module.scss`, not its own file — all sidebar styles live there.

### Styling

SCSS modules per page (`*.module.scss` co-located with the page component). No global theme file; shared variables are not yet extracted.

### Charts

`recharts` is used for data visualization on dashboard/activity/rating pages.
