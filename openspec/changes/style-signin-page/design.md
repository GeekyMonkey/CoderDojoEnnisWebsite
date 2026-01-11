## Context
This page is used in a high-throughput, shared-device scenario at the start of club meetings. The UX must minimize friction between sign-ins and avoid disruptive UI (like browser alerts).

## Goals / Non-Goals
- Goals:
  - Nuxt UI-based visual refresh similar to `/login`.
  - Fast reset-and-focus behavior after successful sign-in.
  - Welcome panel persists until the next member begins entering a username.
- Non-Goals:
  - No changes to authentication/attendance backend APIs.
  - No new auth flows (sign-up, password reset, OAuth).

## Decisions
- Form surface: Use Nuxt UI components (e.g., `UPageCard`, `UForm`/`UAuthForm` patterns, `UInput`, `UButton`, `UAlert`) to match existing `/login` styling.
- Sign-in notification panel persistence: Model a simple UI state machine:
  - `idle` (no notification panel shown)
  - `notification-visible` (after success, notification panel shown)
  - `notification-dismissed` (after username becomes non-empty)
  
  Transition rule: after a success, hide the notification panel when the username input value changes from `""` → non-empty (typing, paste, or autofill).
- Focus management: After success, clear inputs then focus username using `nextTick()`/template ref.
- Layout controls: Keep the existing `auth-layout` footer controls (theme/language) available on this page; do not alter `auth-layout` as part of this change.

## Risks / Trade-offs
None identified.

## Open Questions
None.
