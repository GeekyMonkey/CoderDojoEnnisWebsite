# Change: Update member layout to Nuxt UI dashboard shell

## Why
The current member layout is a minimal wrapper that does not provide navigation or a consistent signed-in “app shell”. This slows down navigation, does not match the legacy experience for mentors, and does not take advantage of Nuxt UI’s dashboard components.

## What Changes
- Replace the existing member layout with a Nuxt UI dashboard-style app shell inspired by the Nuxt UI dashboard template.
- Add a left navigation sidebar that collapses to a hamburger-triggered drawer on narrow screens.
- Add a bottom user menu (sidebar footer) that exposes user-specific actions and preferences:
  - Theme selection
  - Language selection
  - Profile (placeholder)
  - Logout
- Support role-based menu items (e.g., mentors see additional sections like Attendance and Sign In Mode).
- Allow placeholder menu items for not-yet-implemented features, with a clear “coming soon” state.

## Impact
- Affected specs:
  - New: `member-dashboard-ui`
  - Existing: `ui-themes` (referenced; no behavioral changes expected)
  - Existing: `user-auth-ui` (referenced for logout entrypoint; no behavioral changes expected)
- Affected code (planned during apply stage):
  - Member layout component currently at `src/app/layouts/member-layout.vue`
  - New UI components/composables for navigation config and role filtering
  - Potentially new placeholder pages/routes under the member area

## Non-Goals
- Implementing the underlying features behind placeholder links (e.g., Reports, Maintenance).
- Changing authentication behavior, session handling, or authorization rules.
- Redesigning the public site or the auth layout.
