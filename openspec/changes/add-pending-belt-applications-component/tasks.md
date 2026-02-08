# Implementation Tasks

## 1. Foundation - Refactor BeltColor Component

- [x] 1.1 Create `src/app/components/Belts/BeltColor.vue` component
  - Extract belt color rendering logic from `MemberBelt.vue`
  - Accept props: `belt` (BeltModel or color string), `size` (optional), `labelOverride` (optional)
  - Support special colors: mentor, parent, noob, white, yellow, green, blue, red, black
  - Include CSS variables and styling from original MemberBelt
  - Handle hex code colors from BeltModel
- [x] 1.2 Refactor `src/app/components/Members/MemberBelt.vue` to use BeltColor
  - Keep same props interface: `member` (MemberModel), `size` (optional)
  - Look up member's current belt from store
  - Pass belt data to BeltColor component
  - Maintain special case handling (mentor/parent/noob)
- [x] 1.3 Test BeltColor in existing contexts
  - Verify MemberBelt still works on attendance page
  - Verify MemberBelt still works on sign-in page
  - Verify no visual regressions

## 2. Store Extension - Add Pending Applications

- [x] 2.1 Extend `src/app/stores/useMemberBeltsStore.ts`
  - Add `PendingBeltApplications` computed property
  - Filter for: `applicationDate !== null`, `awarded === null`, `rejectedDate === null`, `deleted === false`
  - This filtering logic should ideally be done in a new API endpoint that returns only pending applications.
  - The applications list should refresh automatically when member belts data changes (reactivity)
  - Sort by belt color (lookup from BeltsById), then by member name (lookup from MembersById)
  - Return enriched data structure with member and belt details
- [x] 2.2 Test store computed property
  - Verify filtering logic excludes awarded/rejected/deleted applications
  - Verify sorting works correctly
  - Verify realtime updates when applications change

## 3. i18n - Add Translations

- [x] 3.1 Add English translations to `src/i18n/locales/en.ts`
  - `beltApplications.heading`: "Belt Applications"
  - `beltApplications.empty`: "There are no pending belt applications."
  - `beltApplications.details.applicationDate`: "Applied"
  - `beltApplications.details.notes`: "Notes"
  - `coders.label`: "Coder Name"
  - `teams.label`: "Team"
  - `belts.label`: "Belt"
- [x] 3.2 Add French translations to `src/i18n/locales/fr.ts`
- [x] 3.3 Add Irish translations to `src/i18n/locales/ga.ts`
- [x] 3.4 Add Ukrainian translations to `src/i18n/locales/uk.ts`

## 4. ApplicationsPending Component

- [x] 4.1 Create `src/app/components/Belts/ApplicationsPending.vue`
  - Display heading using i18n `beltApplications.heading`
  - Show empty state message when no applications using i18n `beltApplications.empty`
  - Use stores: `useMemberBeltsStore`, `useMembersStore`, `useTeamsStore`, `useBeltsStore`
  - Access `PendingBeltApplications` from store
- [x] 4.2 Implement table structure
  - Use `@tanstack/vue-table` pattern from attendance page
  - Define columns: Photo, Coder Name, Team, Belt Color
  - Use `UTable` component from Nuxt UI
  - Apply similar styling to attendance table
- [x] 4.3 Implement table cells
  - Photo: Use `MemberAvatar` component
  - Coder Name: Display member's full name
  - Team: Display team name with team icon 'TeamLogo' component
  - Belt Color: Use new `BeltColor` component with application's belt (not member's current belt)
- [x] 4.4 Implement expandable row details
  - Add click handler to table rows
  - Track expanded row ID in component state
  - Render expanded panel below clicked row
  - Display: coder name, belt color, application date (formatted), application notes
- [x] 4.5 Style component
  - Use scoped SCSS
  - Match design patterns from attendance page
  - Ensure responsive layout
  - Handle empty state styling

## 5. Mentor Home Page Integration

- [x] 5.1 Update `src/app/pages/(member)/mentor/index.vue`
  - Remove `<TeamsList />` component
  - Add `<ApplicationsPending />` component
  - Verify page layout and styling
- [x] 5.2 Test mentor home page
  - Verify component displays correctly
  - Verify page security (mentor-only access)
  - Test with various data states (no applications, few applications, many applications)

## 6. Testing & Validation

- [x] 6.1 Manual testing
  - Test with no pending applications (empty state)
  - Test with multiple applications from different belts
  - Test row expansion/collapse
  - Test sorting (belt color, then name)
  - Test all translations (en, fr, ga, uk)
  - Test responsive layout on different screen sizes
- [ ] 6.2 Integration testing
  - Verify BeltColor component works in all contexts
  - Verify MemberBelt refactor didn't break existing pages
  - Verify store updates trigger component re-render
  - Verify team icons display correctly
- [ ] 6.3 Code quality
  - Run linter: `pnpm -C src lint`
  - Run formatter: `pnpm -C src format`
  - Run tests: `pnpm -C src test`
  - Fix any errors or warnings

## Dependencies

- Task 2 depends on Task 1 (store needs BeltsById, MembersById from related stores)
- Task 4 depends on Task 1 (ApplicationsPending uses BeltColor)
- Task 4 depends on Task 2 (ApplicationsPending uses PendingBeltApplications)
- Task 4 depends on Task 3 (ApplicationsPending uses i18n strings)
- Task 5 depends on Task 4 (mentor page uses ApplicationsPending)
- Task 6 depends on Tasks 1-5 (testing requires all implementation complete)

## Parallelizable Work

- Tasks 1, 2, and 3 can be done in parallel (independent of each other)
