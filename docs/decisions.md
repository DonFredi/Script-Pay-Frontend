# Architectural Decisions

Real decisions made in this codebase, reconstructed from its actual history and the rationale left in code comments — not a generic ADR template.

## ADR-001: Session state driven by the backend's own tokens, not Firebase's client SDK

**Status**: Accepted (replaces an earlier, broken design)

**Context**: An earlier version of `AuthProvider` tracked auth state via Firebase's `onAuthStateChanged`, but `login.api.ts` posts credentials straight to this app's own backend and receives a backend-issued token pair back — it never calls any Firebase client SDK method that would trigger that listener. Result: a "successful" login never actually set `isAuthenticated` to `true`.

**Decision**: Session state is driven entirely by the backend's own tokens. On mount, `AuthProvider` attempts a silent refresh (via the httpOnly `refresh_token` cookie) to recover a session across reloads/new tabs, then fetches `/profile`. `setSession()`/`clearSession()` are called directly by `useLogin`/`useRegister`/`useLogout` on success — no reliance on any external auth listener.

## ADR-002: `/api` prefix required on auth rewrites

**Status**: Accepted, fixing a real bug

**Context**: `next.config.ts` rewrites API calls to the backend. A bare `"/auth/:path*"` rewrite never fires, because `/auth/login`, `/auth/register`, etc. are *also* real Next.js pages (see `src/app/auth/`) — Next's filesystem router always wins over array-style rewrites.

**Decision**: Auth API calls are routed through `/api/auth/:path*` specifically, which has no colliding page route. This was the actual root cause of every login/register failure in an earlier debugging session — not a CORS or backend issue, despite initially looking like one.

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
