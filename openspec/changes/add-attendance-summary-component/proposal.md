# Proposal: add-attendance-summary-component

## Summary
Add reusable attendance components to display current-day attendance organized by team cards with member photos:
- `AttendanceSummary`: Container component that displays attendance by team
- `AttendanceSummaryTeam`: Sub-component that displays a single team's attendance with team logo and color in the header

Use these on the mentor sign-in page to provide visual feedback of who's signed in during a session.

## Motivation
Mentors running a session need visual confirmation of who has signed in so far. By displaying a summary of signed-in members organized by team, mentors can:
- Quickly see who's present without switching pages.
- Monitor attendance as members sign in in real-time.
- Organize attendance data by team for clarity.

## Scope

### In scope:
- New reusable `AttendanceSummary` parent component that orchestrates team-based attendance display.
- New `AttendanceSummaryTeam` sub-component that renders a single team card with:
  - Team name, logo, and color in the header bar
  - Member avatars in the card body
- A dedicated mentors card (via `AttendanceSummaryTeam`) that is always visible.
- Team cards (via `AttendanceSummaryTeam`) that appear only when at least one team member is signed in.
- Integration with the existing attendance store for realtime updates.
- Use of `MemberAvatar` component for displaying member photos.
- Integration of the components into the mentor sign-in page (`/mentor/SignIn.vue`).

### Out of scope:
- Changes to the sign-in form itself or authentication flow.
- Modifications to the attendance or member stores (only consuming existing data).
- Styling overrides beyond maintaining consistency with the sign-in page layout.
- Hover/click interactions on members (display-only in this phase).

## Impact
- New OpenSpec capability: `attendance-summary-component`.
- Frontend updates:
  - New components:
    - `src/app/components/Attendance/AttendanceSummary.vue` (parent container)
    - `src/app/components/Attendance/AttendanceSummaryTeam.vue` (team card sub-component)
  - Updated page: `src/app/pages/(member)/mentor/SignIn.vue` to include the new components.
- No backend changes required.
- Ties into existing attendance store realtime invalidation and data flow.

## Dependencies / Assumptions
- **Attendance Store API**: Existing `useMemberAttendanceStore()` provides:
  - `CurrentSessionDate` computed property returning today's date in YYYY-MM-DD format.
  - `useSessionAttendanceForDate(date)` query hook returning member IDs signed in for that date.
  - Realtime cache invalidation when attendance changes (via Supabase Realtime).
- **Members Store API**: Existing `useMembersStore()` provides:
  - `Members` ref containing all member data.
  - `MembersById` computed dictionary for lookup by ID.
- **Teams Store API**: Existing `useTeamsStore()` provides:
  - `TeamsById` computed dictionary for lookup by ID.
- **Member Data**: Members include `isMentor` boolean flag to identify mentors.
- **MemberAvatar Component**: Existing `components/Members/MemberAvatar.vue` accepts a `MemberModel` and `size` prop.

## Open Questions / Clarifications

### Answered:
- **Mentors always visible?** Yes, the Mentors card is always shown even if empty.
- **Team filtering logic?** Show team cards only when `memberIds.length > 0` for that team, excluding the mentors "team".
- **Member ordering within cards?** Proposal does not mandate ordering; implementation can use store's natural order or sort alphabetically.
- **Card layout/styling?** Use Nuxt UI components (e.g., `UPageCard`) or plain divs with CSS classes for consistency with the existing sign-in page.
- **Empty state presentation?** Mentors card may show "No mentors signed in" or be visually distinct when empty; Team cards are simply not rendered when empty.

