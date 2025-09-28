Page security analysis

Date: 2025-09-28

Overview

This document records an analysis of how page security and redirects to login are implemented in the codebase.

Key files inspected

- `src/app/middleware/auth.global.ts` — global route middleware that enforces protected sections and performs auth checks.
- `src/app/stores/useAuthStore.ts` — an in-memory auth store (user, initializing, ready, roles, ...).
- `src/app/plugins/auth-listener.client.ts` — loads initial session and subscribes to Supabase auth state changes to populate store.
- `src/app/plugins/supabase-init.client.ts` — proactively calls `getSession()` to help populate `useSupabaseUser()` on hard reloads.
- `src/app/pages/SignIn.client.vue` — the sign-in page that posts credentials and calls `supabaseClient.auth.setSession(...)` on success.
- `src/server/utils/authUtils.ts` — server-side helpers that sign users into Supabase (admin create if needed) and return a session.

How security is enforced

- Global route middleware (`auth.global.ts`) runs on every route navigation.
- The middleware only enforces authentication for specific top-level path segments: `mentor`, `coder`, and `parent`.
- When a route is in one of those protected sections the middleware determines if the user is authenticated by:
  - Prefer using `authStore.ready.value ? authStore.isAuthenticated.value : await isAuthenticated()`.
  - `authStore.isAuthenticated` is `computed(() => !!user.value)` in the store.
  - Fallback `isAuthenticated()` checks `useSupabaseUser().value?.aud === "authenticated"`, and if not present it calls `supabaseClient.auth.getSession()` and treats presence of `data.session.user` as authenticated.
- If not authenticated, the middleware returns `navigateTo("/login")` which redirects to the login page.

Login flow

- `SignIn.client.vue` sends credentials to `/api/Auth/Login`.
- The server calls `LoginToSupabase(...)` in `src/server/utils/authUtils.ts` which:
  - Derives a Supabase email and password for the member and attempts `supabase.auth.signInWithPassword`.
  - If sign-in fails it may delete an old user and admin-create a fresh Supabase user with metadata, then sign-in again.
  - Returns an auth token/session object from Supabase.
- The client receives the session, calls `supabaseClient.auth.setSession(session)`, and then the Supabase auth state listener updates `useAuthStore()` user ref. The sign-in page then redirects to `/logged_in`.

Race conditions and mitigation

- On a hard reload the Supabase user ref and the auth store may not be populated when `auth.global` first runs, producing a false-negative authentication check and an unwanted redirect.
- Mitigations present in the code:
  - `auth-listener.client.ts` calls `getSession()` and then `store.markReady()` to populate the store early.
  - `supabase-init.client.ts` calls `client.auth.getSession()` proactively to populate `useSupabaseUser()`.
  - `auth.global.ts` will wait up to ~500ms while `authStore.initializing` is true before proceeding to reduce spurious redirects.

Edge cases and recommendations

- Expired or revoked sessions will cause the middleware to redirect to login. This is expected.
- Role checks are not implemented here; the middleware only gates based on top-level path section.
  - If you need role-based access (mentor-only pages), add server-provided role metadata or check `useSupabaseUser().value.user_metadata`/ `useAuthStore().roles` and enforce it in the middleware.
- If users see sporadic redirects on hard reloads increase the initialization wait duration or hook middleware to wait for the auth-store `ready` more robustly (e.g., use an awaitable promise that resolves once the listener marks ready rather than a busy loop).
- Consider switching to route meta protection rather than hard-coded top-level sections for more flexible per-page rules.

Files/Lines of interest (quick reference)

- `src/app/middleware/auth.global.ts` — contains `return navigateTo("/login")` when redirect needed.
- `src/app/plugins/auth-listener.client.ts` — initial session load and listener.
- `src/app/pages/SignIn.client.vue` — posts to `/api/Auth/Login` and calls `setSession(...)` and `router.replace("/logged_in")` on success.
- `src/server/utils/authUtils.ts` — `LoginToSupabase` implements server sign-in and admin-create logic when required.

Next steps (optional)

- Convert protection to page-level `definePageMeta({ requiresAuth: true, roles: ['mentor'] })` and update middleware to read meta. This would allow fine-grained role checks per page.
- Add explicit role-checking in middleware and wire `roles` into the `useAuthStore()`.
- Add logging around the session restoration path to diagnose intermittent redirect complaints.

End of analysis
