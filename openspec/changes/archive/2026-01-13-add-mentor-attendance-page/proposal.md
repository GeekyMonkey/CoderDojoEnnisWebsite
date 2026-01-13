# Proposal: add-mentor-attendance-page

## Summary
Add a mentor-facing attendance management page at `/mentor/attendance` that lets mentors view and edit per-session attendance via sortable Nuxt UI tables and a small set of header controls (session date, include filter, search).

## Motivation
Mentors need a single place to:
- Review attendance for any session date.
- Quickly mark a member present/absent.
- Filter to present/registered/all members.
- Randomly select a present coder during the current session.

## Scope
In scope:
- New `/mentor/attendance` page UI (replacing current placeholder).
- Session date selector populated from known attendance sessions, newest-first.
- “Include” selector with the required options and automatic behavior when the date changes.
- Search filter for the displayed member rows.
- A Nuxt UI table showing members for the selected date with fixed header/footer, sorting, and a presence toggle.
- A “Choose Random” action in the coders table footer during the current session.
- Attendance toggle calls a dedicated attendance API and refreshes UI state.

Out of scope:
- Any changes to the attendance sign-in page spec/behavior.
- Broader member management features beyond what this page needs to render rows.
- Role enforcement changes (this proposal assumes existing route-level protection remains as-is).

## Impact
- New OpenSpec capability: `mentor-attendance-page`.
- Frontend updates under `src/app/pages/(member)/mentor/attendance.vue` and related components/stores.
- Backend updates likely required to support presence toggling and to provide a member roster suitable for the table.

## Dependencies / Assumptions
- Attendance session stats and current session data are available via existing endpoints:
  - `GET /api/MemberAttendance/Sessions`
  - `GET /api/MemberAttendance/SessionCurrent`
  - `GET /api/MemberAttendance/SessionDate?sessionDate=YYYY-MM-DD`
- Member data includes at least: name, `registeredCurrentTerm`, `isMentor`, `isNinja` (used for “coder”), plus team and belt info (or can be derived via joins).

## Open Questions
## Confirmed assumptions
- Photo column: there is no known stored photo URL field; the default approach will be an avatar/initials (optionally upgraded later if a photo URL becomes available).
- “All Members”: deleted members are excluded.
