## 1. Member dashboard shell
- [ ] 1.1 Implement a Nuxt UI dashboard-style shell in the member layout, using Nuxt UI dashboard components (sidebar + main content panel).
- [ ] 1.2 Add responsive behavior: sidebar collapses to a hamburger-triggered drawer on narrow screens.
- [ ] 1.3 Ensure the layout renders the page content via the default slot.

## 2. Navigation model and role filtering
- [ ] 2.1 Define a typed navigation model (groups + links) that supports placeholders (disabled/coming-soon state).
- [ ] 2.2 Implement role-based filtering using Supabase user metadata (mentor/parent/coder).
- [ ] 2.3 Add a mentor navigation set based on the legacy menu (Home, Attendance, Members, Parents, Mentors, Ninja Pods, Maintenance, Reports, Sign In Mode, Logout).

## 3. User menu (sidebar footer)
- [ ] 3.1 Add a user menu in the sidebar footer with: profile (placeholder), theme, language, logout.
- [ ] 3.2 Reuse the existing theme and language selection logic/components.
- [ ] 3.3 Wire logout to the existing `/logout` page.

## 4. Placeholder routes
- [ ] 4.1 Create placeholder pages for any nav links that do not yet exist (under the appropriate role prefix).
- [ ] 4.2 Make placeholders clearly indicate “not implemented yet”.

## 5. Validation
- [ ] 5.1 Add unit tests for the navigation role-filter function (Vitest).
- [ ] 5.2 Run `pnpm -C src test` (or repo equivalent) for the affected test suite.
- [ ] 5.3 Run formatting/linting as configured in the repo.

## 6. OpenSpec
- [ ] 6.1 Ensure the change validates with `openspec validate update-member-layout-dashboard --strict`.
