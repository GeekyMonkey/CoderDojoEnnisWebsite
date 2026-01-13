# Tasks: add-mentor-attendance-page

## 1. Specifications
- [x] 1.1 Validate delta spec passes `openspec validate add-mentor-attendance-page --strict`
- [x] 1.2 Align attendance toggle to one endpoint: `POST /api/MemberAttendance/SetPresent` with `{ memberId, sessionDate, present }`

## 2. Data stores (normalized)
- [x] 2.1 Add `useMembersStore` consistent with other stores, returning all member data (not denormalized)
- [x] 2.2 Update `useTeamsStore` to continue exposing `Teams` (array) and also expose `TeamsById` (dictionary keyed on `id`)
- [x] 2.3 Update `useBeltsStore` to continue exposing `Belts` and also expose `BeltsById`
- [x] 2.4 Update `useBadgesStore` to continue exposing `Badges` and also expose `BadgesById` (keep `BadgesByCategory`)
- [x] 2.5 Update `useBadgeCategoriesStore` to continue exposing `BadgeCategories` and also expose `BadgeCategoriesById`

## 3. Backend support
- [x] 3.1 Ensure `/api/(tables)/members` (and any dependent list endpoints) returns the member data required by `useMembersStore`. This should be an array of the entire member model type
- [x] 3.2 Add attendance mutation endpoint(s) to mark a member present/absent for a session date (per the final spec/design)
- [x] 3.3 Add API-level validation (date format, memberId, auth assumptions) and consistent `ApiResponse` errors

## 4. Frontend page
- [x] 4.1 Replace placeholder at `src/app/pages/(member)/mentor/attendance.vue` with the new mentor attendance UI
- [x] 4.2 Implement header controls: session date dropdown (descending), include dropdown, search box
- [x] 4.3 Implement coders table using Nuxt UI table features:
  - [x] presence checkmark column toggles attendance via API
  - [x] columns: Name, Photo, Team, Belt Color
  - [x] sortable by Name, Team, Belt Color, Present (present-first; within groups sort by name)
  - [x] fixed header and fixed footer
  - [x] footer total: coders present
  - [x] footer action: show `Choose Random` button only when the current session date is selected AND there is at least one present coder; clicking navigates to `/mentor/coder/[member_id]`
- [x] 4.4 Implement mentors table beneath the coders table:
  - [x] presence checkmark column toggles attendance via API
  - [x] columns: Name, Photo
  - [x] sortable by Name and Present (present-first; within groups sort by name)
  - [x] fixed header and fixed footer
  - [x] footer total: mentors present
- [x] 4.5 Ensure filters apply to both tables:
  - [x] Include filter (`Present Members`, `Registered Members`, `All Members`)
  - [x] Search filter
- [x] 4.6 Ensure date-change rule updates “Include” option:
  - [x] non-current session -> Include becomes Present Members
  - [x] current session -> Include becomes Registered Members

## 5. Validation
- [ ] 5.1 Manual smoke test scenarios from the spec (date switching, toggling, sorting-by-present grouping, choose-random, totals)
- [x] 5.2 Add/extend targeted tests if the repo has an established pattern for testing these endpoints/components
