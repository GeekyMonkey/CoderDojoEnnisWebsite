# Tasks: add-mentor-attendance-page

## 1. Specifications
- [x] 1.1 Validate delta spec passes `openspec validate add-mentor-attendance-page --strict`
- [x] 1.2 Align attendance toggle to one endpoint: `POST /api/MemberAttendance/SetPresent` with `{ memberId, sessionDate, present }`

## 2. Data stores (normalized)
- [ ] 2.1 Add `useMembersStore` consistent with other stores, returning all member data (not denormalized)
- [ ] 2.2 Update `useTeamsStore` to continue exposing `Teams` (array) and also expose `TeamsById` (dictionary keyed on `id`)
- [ ] 2.3 Update `useBeltsStore` to continue exposing `Belts` and also expose `BeltsById`
- [ ] 2.4 Update `useBadgesStore` to continue exposing `Badges` and also expose `BadgesById` (keep `BadgesByCategory`)
- [ ] 2.5 Update `useBadgeCategoriesStore` to continue exposing `BadgeCategories` and also expose `BadgeCategoriesById`

## 3. Backend support
- [x] 3.1 Ensure `/api/(tables)/members` (and any dependent list endpoints) returns the member data required by `useMembersStore`. This should be an array of the entire member model type
- [x] 3.2 Add attendance mutation endpoint(s) to mark a member present/absent for a session date (per the final spec/design)
- [x] 3.3 Add API-level validation (date format, memberId, auth assumptions) and consistent `ApiResponse` errors

## 4. Frontend page
- [ ] 4.1 Replace placeholder at `src/app/pages/(member)/mentor/attendance.vue` with the new mentor attendance UI
- [ ] 4.2 Implement header controls: session date dropdown (descending), include dropdown, search box, and conditional “Choose Random”
- [ ] 4.3 Implement coders table using Nuxt UI table features:
  - [ ] presence checkmark column toggles attendance via API
  - [ ] columns: Name, Photo, Team, Belt Color
  - [ ] sortable by Name, Team, Belt Color, Present (present-first; within groups sort by name)
  - [ ] fixed header and fixed footer
  - [ ] footer total: coders present
- [ ] 4.4 Implement mentors table beneath the coders table:
  - [ ] presence checkmark column toggles attendance via API
  - [ ] columns: Name, Photo
  - [ ] sortable by Name and Present (present-first; within groups sort by name)
  - [ ] fixed header and fixed footer
  - [ ] footer total: mentors present
- [ ] 4.5 Ensure filters apply to both tables:
  - [ ] Include filter (`Present Members`, `Registered Members`, `All Members`)
  - [ ] Search filter
- [ ] 4.6 Ensure date-change rule updates “Include” option:
  - [ ] non-current session -> Include becomes Present Members
  - [ ] current session -> Include becomes Registered Members

## 5. Validation
- [ ] 5.1 Manual smoke test scenarios from the spec (date switching, toggling, sorting-by-present grouping, choose-random, totals)
- [ ] 5.2 Add/extend targeted tests if the repo has an established pattern for testing these endpoints/components
