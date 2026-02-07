# Tasks: add-attendance-summary-component

## 1. Specifications
- [ ] 1.1 Validate delta spec passes `openspec validate add-attendance-summary-component --strict`

## 2. Sub-component Implementation
- [ ] 2.1 Create sub-component `src/app/components/Attendance/AttendanceSummaryTeam.vue`
  - [ ] 2.1.1 Define TypeScript props:
    - [ ] `teamName` (string): Name of the team or "Mentors"
    - [ ] `teamColor` (string | null): Hex color code for the header
    - [ ] `members` (MemberModel[]): Array of members on the team
  - [ ] 2.1.2 Render team card with header bar containing:
    - [ ] 2.1.2.1 Team name
    - [ ] 2.1.2.2 Team color applied to header background
    - [ ] 2.1.2.3 Optional team logo placeholder for future expansion
  - [ ] 2.1.3 Render member avatars in card body using `MemberAvatar` with size `md`
  - [ ] 2.1.4 Add CSS styling for card layout and header bar

## 3. Parent Component Implementation
- [ ] 3.1 Create parent component `src/app/components/Attendance/AttendanceSummary.vue`
  - [ ] 3.1.1 Define TypeScript props (none required; component is self-contained)
  - [ ] 3.1.2 Fetch current session date from attendance store (`CurrentSessionDate`)
  - [ ] 3.1.3 Query session attendance for current date via store (`useSessionAttendanceForDate`)
  - [ ] 3.1.4 Merge attendance data with members, teams, and mentors data
  - [ ] 3.1.5 Organize members by team (and separately identify mentors)
  - [ ] 3.1.6 Create computed property for team list (teams with at least one member signed in)
  - [ ] 3.1.7 Create computed property for mentors list (members with `isMentor: true` signed in)
  - [ ] 3.1.8 Render mentors card via `AttendanceSummaryTeam` (always visible)
  - [ ] 3.1.9 Render team cards via `AttendanceSummaryTeam` (only when members present)

## 4. Page Integration
- [ ] 4.1 Update `src/app/pages/(member)/mentor/SignIn.vue`
  - [ ] 4.1.1 Import `AttendanceSummary` component
  - [ ] 4.1.2 Place component in the template (e.g., below the welcome card or in a new row)
  - [ ] 4.1.3 Ensure layout remains responsive and does not crowd the sign-in form

## 5. Testing & Validation
- [ ] 5.1 Manual smoke test: Open mentor sign-in page and verify components render
- [ ] 5.2 Manual test: Sign in a member and verify attendance summary updates realtime
- [ ] 5.3 Manual test: Sign in a mentor and verify mentors card updates with color and name
- [ ] 5.4 Manual test: Sign in members from different teams and verify team cards appear with correct colors
- [ ] 5.5 Manual test: Verify MemberAvatar displays correctly for each member
- [ ] 5.6 Optional: Add unit or snapshot tests for the components if applicable

## 6. Code Quality
- [ ] 6.1 Ensure components follow project TypeScript conventions (explicit types, simple comments)
- [ ] 6.2 Ensure components follow Vue SFC format (script setup, scoped styles)
- [ ] 6.3 Run linting and formatting checks
- [ ] 6.4 Verify no console errors or warnings

