# Change: Style login page with Nuxt UI AuthForm

## Why
The current [src/app/pages/(auth)/login.vue](src/app/pages/(auth)/login.vue) page is functional but has minimal styling and does not yet align with the Nuxt UI design system used elsewhere.

This change restyles the login page using Nuxt UI components (specifically `UAuthForm`) to provide a consistent, modern baseline for future auth UI work.

## What Changes
- Replace the current bespoke `<form>` markup with a Nuxt UI `UAuthForm`-based layout.
- Wrap the form in Nuxt UI layout primitives (e.g., `UPageCard`) to match the Nuxt UI AuthForm example patterns.
- Map the current fields to AuthForm fields:
  - `username` (text)
  - `password` (password)
- Display the existing `errorMessage` using Nuxt UI components (e.g., `UAlert`) rather than plain text.

## What Does NOT Change (Non-Goals)
- No changes to login behavior, routes, or API contracts:
  - Still submits to `/api/Auth/Login` with `{ username, password }`.
  - Still sets the Supabase session and redirects to `/logged_in` on success.
- No new auth capabilities:
  - No OAuth providers.
  - No new “forgot password”, “sign up”, or related navigation.
  - No additional fields such as “remember me”.
- No changes to `auth-layout` footer controls (theme/language).

## Impact
- Affected code:
  - [src/app/pages/(auth)/login.vue](src/app/pages/(auth)/login.vue)
- Affected layout (no behavioral changes expected):
  - [src/app/layouts/auth-layout.vue](src/app/layouts/auth-layout.vue)
- New OpenSpec delta capability:
  - `user-auth-ui` (login page styling requirements)

## Open Questions
1. Should we preserve the current password show/hide toggle?
   - If yes, we may need to use `UAuthForm` slots / field customization to keep the toggle without introducing any new behavior.
   - If no, the restyle can use the default password input behavior from Nuxt UI.
2. Should the login form remain `username`-based (current) vs switch to “email” wording?
   - The current backend expects `username`, so this proposal assumes labels can still be localized as “username” while using `UAuthForm`.
