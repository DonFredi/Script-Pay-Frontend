# Architectural Decisions

Real decisions made in this codebase, reconstructed from its actual history and the rationale left in code comments — not a generic ADR template.

## ADR-001: Session state driven by the backend's own tokens, not Firebase's client SDK

**Status**: Accepted (replaces an earlier, broken design)

**Context**: An earlier version of `AuthProvider` tracked auth state via Firebase's `onAuthStateChanged`, but `login.api.ts` posts credentials straight to this app's own backend and receives a backend-issued token pair back — it never calls any Firebase client SDK method that would trigger that listener. Result: a "successful" login never actually set `isAuthenticated` to `true`.

**Decision**: Session state is driven entirely by the backend's own tokens. On mount, `AuthProvider` attempts a silent refresh (via the httpOnly `refresh_token` cookie) to recover a session across reloads/new tabs, then fetches `/profile`. `setSession()`/`clearSession()` are called directly by `useLogin`/`useRegister`/`useLogout` on success — no reliance on any external auth listener.

## ADR-002: `/api/backend` prefix required on all rewrites

**Status**: Accepted, fixing a real bug (revisited once — see below)

**Context**: `next.config.ts` rewrites API calls to the backend. A bare `"/auth/:path*"` rewrite never fires, because `/auth/login`, `/auth/register`, etc. are *also* real Next.js pages (see `src/app/auth/`) — Next's filesystem router always wins over array-style rewrites. The original fix routed only auth calls through a dedicated `/api/auth/:path*` prefix, leaving `/profile` and `/v1/*` as their own narrow rewrites.

**Decision**: All browser-side API calls are routed through one catch-all prefix, `/api/backend/:path*` — no real page ever lives under that path, so nothing can collide with it as the app grows. `clientConfig.api.apiUrl` sets axios's `baseURL` to `/api/backend` in the browser (and to the backend's absolute URL on the server, where there's no same-origin requirement). The earlier per-path rewrite list (`/api/auth/*`, `/api/profile*`, `/v1/*`) was itself a recurring bug source — it silently missed any new endpoint prefix and, in one incident, regressed to axios calling the backend's absolute URL directly, which broke CSRF-token and cookie visibility (see ADR-004) even though it wasn't the original login/register failure this ADR was written for (see ADR-006).

## ADR-003: Access token in memory, never `localStorage`

**Status**: Accepted

The access token lives only in a module-level variable in `api-client.ts`. A page reload loses it by design; `AuthProvider`'s silent-refresh-on-mount exists specifically to recover from that. The alternative (`localStorage`) would survive reloads for free but hands a stolen-via-XSS token directly to an attacker — this tradeoff is deliberate, not an oversight. See `docs/security.md`.

## ADR-004: One CSRF interceptor, not two

**Status**: Accepted, removing a dead duplicate

An earlier CSRF implementation existed in `middleware.ts`, reading a token from a `<meta>` tag that was never actually rendered anywhere, and relying on `document`, which doesn't exist in the Edge runtime — it could never have run. The real, working CSRF header injection lives in `src/shared/lib/api-client.ts`'s request interceptor, reading the `csrf-token` cookie via `document.cookie` (a real browser context). The dead middleware copy has been removed; don't reintroduce CSRF logic in `middleware.ts`.

## ADR-005: Edge middleware added as a second, faster layer — not a replacement for backend guards

**Status**: Accepted

**Context**: Before `middleware.ts` existed, every route-protection check in this codebase was `"use client"` (`ProtectedLayout`, `admin/layout.tsx`), meaning protection only activated after JS loaded and React rendered — and any Server Component data-fetching on a "protected" page would already have run on the server before a client-side redirect could stop it.

**Decision**: `middleware.ts` verifies the backend-issued JWT directly with `jose`, using the same secret the backend signs with — possible specifically because this app issues its own JWT rather than relying on Firebase's Admin SDK, which cannot run on the Edge runtime at all. The backend's own `AccessTokenGuard`/`RolesGuard` remain the actual authorization boundary on every request; this middleware is a fast, page-load-time first line of defense on top of that, not a replacement for it.

## ADR-006: Browser API calls must go through the same-origin proxy, never the backend's absolute URL

**Status**: Accepted, fixing a real regression

**Context**: `clientConfig.api.apiUrl` (`src/config/client.ts`) briefly regressed to a flat `clientEnv.NEXT_PUBLIC_API_URL` — the backend's absolute, cross-origin URL — for all environments, browser included. Symptom: login still "succeeded" (the JSON response body works fine cross-origin with CORS + credentials), but the dashboard/payments/transactions pages rendered blank and logout showed a "CSRF token missing" toast. Root cause: `Set-Cookie` response headers scope cookies to the *responding* server's own origin. Calling the backend's absolute URL directly from the browser set `access_token`/`refresh_token`/`csrf-token` on the backend's origin — invisible to this app's `document.cookie` reads and to `middleware.ts` inspecting request cookies on its own origin — even though the response body itself came back fine.

**Decision**: `apiUrl` is `typeof window !== "undefined" ? "/api/backend" : clientEnv.NEXT_PUBLIC_API_URL` — the browser always goes through the same-origin `/api/backend/:path*` rewrite (ADR-002); only server-side calls (SSR, route handlers, which have no cross-origin cookie problem to begin with) use the backend's absolute URL. Don't "simplify" `apiUrl` back to a single flat URL — that's exactly this regression.
