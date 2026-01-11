# Change: Style mentor attendance sign-in page

## Why
The mentor attendance sign-in page is functional, but its UI is currently inconsistent with the newer Nuxt UI-based `/login` page and isn’t optimized for rapid, repeated sign-ins at the start of club meetings.

This change restyles the page using Nuxt UI components and adds a kiosk-friendly flow: after each successful sign-in, the form resets and focuses the username field for the next member while keeping the sign-in notification panel visible until the next member begins entering a username.

## What Changes
- Restyle the mentor sign-in page using Nuxt UI components (similar visual pattern to `/login`).
- Replace the browser `alert()` with an inline sign-in notification panel rendered below the form.
- After a successful sign-in:
  - Clear username and password inputs.
  - Place focus on the username field for the next member.
  - Keep the sign-in notification panel visible until the username input value changes (including typing or pasting).
- Display the page using the existing `auth-layout` and avoid adding any page navigation links/menus.

## What Does NOT Change
- The sign-in API call and semantics remain unchanged (still POSTs to `/api/MemberAttendance/SignIn`).
- No new authentication capabilities are introduced (no sign-up, reset password, OAuth).
- No backend changes are required for this restyling/UX improvement.

## Impact
- Affected capability (new): `attendance-signin-ui`.
- Affected code (anticipated):
  - `src/app/pages/(member)/mentor/SignIn.vue`


## Open Questions
None.
