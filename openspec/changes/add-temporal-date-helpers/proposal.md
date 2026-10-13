# Change: Add Temporal date and time helpers and show previous kiosk login

## Why
The kiosk sign-in welcome omits the previous login timestamp even though it is already included in the member response. Date and time formatting is currently repeated inline, and the app has no shared relative-time formatter.

## What Changes
- Add shared date-only, time-only, date-and-time, and relative-time formatting helpers in the existing date utilities, implemented with JavaScript Temporal values and locale-aware `Intl` formatters.
- Use the shared date-and-time helper for the previous-login timestamp already shown on coder home, and display the same localized detail in the kiosk welcome after a successful sign-in. Omit it when there is no previous login.
- Mark discrepancy D30 complete when the implementation is finished.

## Impact
- Affected specs: attendance-signin-ui, member-dashboard-ui
- Affected code: `src/shared/utils/DateHelpers.ts`, kiosk sign-in page, coder welcome component, English translation strings, and the migration checklist.
- The `temporal-polyfill` ponyfill uses native Temporal when available and supplies it in browsers that do not yet support it.
