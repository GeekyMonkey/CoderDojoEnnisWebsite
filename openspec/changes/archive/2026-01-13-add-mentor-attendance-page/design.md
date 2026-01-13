## Context
The current `/mentor/attendance` route is a placeholder. Attendance session data already exists via `useMemberAttendanceStore()` which queries:
- `GET /api/MemberAttendance/Sessions` for session dates/stat summaries
- `GET /api/MemberAttendance/SessionCurrent` for the current (most recent) session and memberIds
- `GET /api/MemberAttendance/SessionDate` for a selected date’s memberIds

The mentor attendance page requires a roster (member rows with name, team, belt color, role flags) and mutation endpoints to toggle attendance.

## Goals
- Keep implementation minimal and aligned with existing API conventions under `src/server/api/MemberAttendance/*`.
- Use existing session endpoints for date population and “current session” detection.
- Make toggling attendance idempotent via explicit present/absent endpoints (UI decides which to call based on current state).

## Non-Goals
- Introduce a new photo storage system.
- Add new global navigation or overhaul the member layout.

## Key Decisions
- **Current session definition**: the “current session date” is `GET /api/MemberAttendance/SessionCurrent`’s `sessionDate`.
- **Session date dropdown source**: derive options from `GET /api/MemberAttendance/Sessions` and sort descending by date.
- **Roster source**: use normalized, client-side stores rather than a denormalized roster payload.
  - Add a `useMembersStore` that loads all member data (not denormalized) and exposes `Members`.
  - Use `teamId` on members as a lookup key into a teams dictionary exposed by the teams store.
  - Keep existing “array” exposures for list rendering, but add dictionary lookups for O(1) joins:
    - `useTeamsStore` SHALL expose `Teams` (array) and `TeamsById` (dictionary keyed by `id`).
    - `useBeltsStore` SHALL expose `Belts` and `BeltsById`.
    - `useBadgesStore` SHALL expose `Badges` and `BadgesById`.
    - `useBadgeCategoriesStore` SHALL expose `BadgeCategories` and `BadgeCategoriesById`.
- **Photo column**: render an avatar (initials) by default; if a photo URL becomes available later, it can be used as the avatar source.
- **Presence toggling**: one endpoint:
  - `POST /api/MemberAttendance/SetPresent` with `{ memberId, sessionDate, present (boolean) }`
  Returns response consistent with existing API patterns.

## Risks / Trade-offs
- Loading all members into a normalized store simplifies server shape but increases client payload size; caching and realtime invalidation should keep the UX responsive.
- “Choose Random” requires a clear definition of “coder”: proposal assumes `MemberModel.isNinja === true`.
- “Choose Random” is rendered in the coders table footer and navigates to the mentor coder detail page (`/mentor/coder/[member_id]`).

## Confirmed assumptions
- “Registered Members” includes any non-deleted member with `registeredCurrentTerm === true`, regardless of role.
