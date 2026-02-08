# Change: Add Pending Belt Applications Component

## Why
Mentors need a clear, actionable view of pending belt applications to efficiently review and manage student progression. Currently, there is no dedicated interface for mentors to see which students have applied for belt advancement, making the review process difficult.

## What Changes
- **NEW** component: `components/Belts/ApplicationsPending.vue` displays pending belt applications in a table format for mentors
- **REFACTOR**: Extract `BeltColor` component from `MemberBelt` to enable reuse across different contexts
- **UPDATE**: Convert `MemberBelt` to a wrapper component that uses `BeltColor` internally
- **EXTEND**: `useMemberBeltsStore` to provide `PendingBeltApplications` computed property
- **UPDATE**: Mentor home page (`pages/(member)/mentor/index.vue`) to replace demo content with the new applications component
- **ADD**: i18n translations for belt application UI strings across all supported languages (en, fr, ga, uk)

## Impact

### Affected specs:
- **NEW**: `belt-applications-ui` - New capability for managing belt application display and interactions
- **MODIFIED**: Mentor home page content (demo content replaced)

### Affected code:
- `src/app/components/Belts/ApplicationsPending.vue` - **NEW**
- `src/app/components/Belts/BeltColor.vue` - **NEW** (extracted from MemberBelt)
- `src/app/components/Members/MemberBelt.vue` - **REFACTORED** (now wrapper)
- `src/app/stores/useMemberBeltsStore.ts` - **EXTENDED** (add PendingBeltApplications)
- `src/app/pages/(member)/mentor/index.vue` - **UPDATED** (replace TeamsList, Belts, and Badge Categories with ApplicationsPending)
- `src/i18n/locales/*.ts` - **UPDATED** (add belt application strings)

### Data model:
- Uses existing `MemberBeltModel` fields:
  - `applicationDate`: non-null for applications
  - `awarded`: null for pending applications
  - `rejectedDate`: null for pending applications
  - `beltId`: the belt color being applied for
  - `applicationNotes`: notes from the applicant
- Uses existing `BeltStore` for the belt color types and sort order

### User-visible changes:
- Mentor home page now shows pending belt applications instead of demo content
- Mentors can see coder names, teams, and requested belt colors at a glance
- Clicking a row expands application details inline
- Empty state message when no pending applications exist

## Dependencies / Assumptions
- Existing stores (`useMemberBeltsStore`, `useMembersStore`, `useTeamsStore`, `useBeltsStore`) provide all needed data
- Attendance table pattern from `pages/(member)/mentor/attendance.vue` can be adapted for belt applications
- Team icons are already available via `TeamModel`
- All four locales (en, fr, ga, uk) need translations
- Mentor-only access is enforced by existing page security (no new auth checks needed)
