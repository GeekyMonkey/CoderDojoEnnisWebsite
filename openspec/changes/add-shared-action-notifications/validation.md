# Validation

Date: 2026-10-11. Worktree branch: codex/notifications-legacy-audit, created from develop d2adba6. Changes remain uncommitted for code review.

## Implementation
- Strict Zod-validated notification payloads, a per-Nuxt-app mitt bus, one presenter inside UApp, centralized severity/duration/icon/position/visibility policy and named overrides.
- One active toast per name/severity/message. Subscriptions are removed on unmount; owned messages clear on route changes and are not replayed.
- Migrated profile saves/password changes/image operations, member signup/account/goals/relationships/skills/password resets, team/definition saves/deletes and achievement decisions. Attendance toggle/QR/NFC failures now use the presenter; kiosk credential/scanner validation remains inline.
- Image success is published but suppressed by default, configurable in actionNotificationPolicy.ts. Image validation remains inline. No data API/store contract or database changes; existing store-mediated mutations and realtime invalidation are retained.
- Generic created/deleted/saved messages added in all four locales; profile/password-specific messages remain appropriate to their operations.

## Checks
- Production build passes; local Nuxt starts and login succeeds on http://localhost:3004 (requested 3003 was occupied).
- Vue type checking: 25 existing legacy diagnostics, no active application diagnostics.
- Strict OpenSpec validation and git diff --check pass.
- Browser: required team name stays inline, duplicate team name produces one error toast rather than an inline banner, repeated errors do not create duplicate messages, navigation clears transient feedback, team save returns to display mode with one success toast.
- Profile UI: native keyboard-accessible image buttons and matching square frames verified at the normal desktop viewport and 390px phone viewport; edit controls hide again after Cancel.
- Successful team save used a whitespace-only name draft normalized back to the existing Godot value; no substantive fixture data changed. Duplicate create was rejected; no test team created.
- Manual policy/bus check: image-success suppression, error visibility, configurable override, per-app isolation and remove/re-add subscription handling pass.
- Password resets and actual profile image persistence were not repeated as part of this notification-only change; their existing validated store actions remain intact and their event paths were source-reviewed/type-checked. QR/NFC hardware was not exercised.
- User-run pnpm test/format commands were not run automatically.

## Legacy audit
See ../replicate-legacy-features/discrepancies.md: 33 actionable discrepancies plus a screen matrix covering displayed fields, editing fields and buttons, with legacy/active source references. The legacy ASP.NET app was not run on this Linux machine. This is a source-based parity audit with selected new-browser checks, not a pixel comparison. Legacy code remains unchanged. Later batches 8 and 10 are cross-referenced; own-child review and decision-owner undo need policy decisions.
