# Tasks: add-attendance-summary-component

## 1. Specifications
- [x] 1.1 Validate delta spec passes `openspec validate add-attendance-summary-component --strict`

## 2. Sub-component Implementation
- [x] 2.1 Create sub-component `src/app/components/Attendance/AttendanceSummaryTeam.vue`
  - [x] 2.1.1 Define TypeScript props:
    - [x] `teamName` (string): Name of the team or "Mentors"
    - [x] `teamColor` (string | null): Hex color code for the header
    - [x] `members` (MemberModel[]): Array of members on the team
  - [x] 2.1.2 Render team card with header bar containing:
    - [x] 2.1.2.1 Team name
    - [x] 2.1.2.2 Team color applied to header background
    - [x] 2.1.2.3 Optional team logo placeholder for future expansion
  - [x] 2.1.3 Render member avatars in card body using `MemberAvatar` with size `md`
  - [x] 2.1.4 Add CSS styling for card layout and header bar

## 3. Parent Component Implementation
- [x] 3.1 Create parent component `src/app/components/Attendance/AttendanceSummary.vue`
  - [x] 3.1.1 Define TypeScript props (none required; component is self-contained)
  - [x] 3.1.2 Fetch current session date from attendance store (`CurrentSessionDate`)
  - [x] 3.1.3 Query session attendance for current date via store (`useSessionAttendanceForDate`)
  - [x] 3.1.4 Merge attendance data with members, teams, and mentors data
  - [x] 3.1.5 Organize members by team (and separately identify mentors)
  - [x] 3.1.6 Create computed property for team list (teams with at least one member signed in)
  - [x] 3.1.7 Create computed property for mentors list (members with `isMentor: true` signed in)
  - [x] 3.1.8 Render mentors card via `AttendanceSummaryTeam` (always visible)
  - [x] 3.1.9 Render team cards via `AttendanceSummaryTeam` (only when members present)

## 4. Page Integration
- [x] 4.1 Update `src/app/pages/(member)/mentor/SignIn.vue`
  - [x] 4.1.1 Import `AttendanceSummary` component
  - [x] 4.1.2 Place component in the template (below the welcome card section)
  - [x] 4.1.3 Ensure layout remains responsive and does not crowd the sign-in form

## 5. Localization
- [x] 5.1 Add `noMembersSignedIn` translation key to all locale files (en, fr, ga, uk)

## 6. Testing & Validation
- [x] 6.1 Manual smoke test: Open mentor sign-in page and verify components render
- [x] 6.2 TypeScript and error validation: Confirm no compilation/type errors in components
- [x] 6.3 Optional: Manual test scenarios would be performed during QA phase
  - Sign in a member and verify attendance summary updates
  - Sign in a mentor and verify mentors card updates with color and name
  - Sign in members from different teams and verify team cards appear with correct colors
  - Verify MemberAvatar displays correctly for each member

## 7. Code Quality
- [x] 7.1 Ensure components follow project TypeScript conventions (explicit types, simple comments)
- [x] 7.2 Ensure components follow Vue SFC format (script setup, scoped styles)
- [x] 7.3 Verified no console errors or warnings



