## 1. Preparation
- [x] 1.1 Inspect existing navigation, three session entry points, store contracts, route rules, authentication, and logout/history protection.
- [x] 1.2 Define shared Calendar behavior, Home-first ordering, removal of old routes, and shared-route access.
- [x] 1.3 Obtain approval for the expanded Calendar, database/API, and attendance scope.

## 2. Implementation
- [x] 2.1 Pin each role's Home first, remove role Sessions entries, and add one shared Calendar item.
- [x] 2.2 Position Calendar above the member-name menu with search, title, collapsed-sidebar, and mobile-drawer support.
- [x] 2.3 Create the shared Calendar using store-owned dated-session reads, today/future defaults, and a one-year history checkbox.
- [x] 2.4 Remove the three old session-list pages and update internal links, editor return paths, labels, and translations.
- [x] 2.5 Apply the member layout and existing authentication/logout/history protection to `/member/**` for every member role.
- [x] 2.6 Resolve logo and profile actions correctly from shared member pages without changing server permissions.

- [x] 2.7 Add date-only session description/deletion storage, default topic, duplicate-date handling, protected read/mentor CRUD APIs, strict contracts, and Bruno requests.
- [x] 2.8 Add mentor session forms/confirmation, private-session styling/labels, RLS and API visibility, role refresh, and scoped realtime invalidation.
- [x] 2.9 Remove the member Google Calendar fallback; place active pods above sessions and keep mentor Add pod available when empty, preserving pod rules.
- [x] 2.10 Audit attendance RPCs, selectors, reports, counts/milestones, and explicit-date/range reads; exclude future attendance and reject future presence writes without changing historical records or today's sign-in.

- [x] 2.11 Adjust the one-time cutover session import to replace matching dates and preserve existing sessions whose dates are absent from the import; retain existing clearing behavior for other imported data.

## 3. Verification
- [x] 3.1 Cover Home-first ordering, shared-link uniqueness/filtering, alphabetical remainders, and translated labels.
- [x] 3.2 Cover shared-route authentication, session expiry/logout/history behavior, role combinations, and removal of old routes.
- [x] 3.3 Inspect Calendar behavior and sidebar placement on desktop and mobile.
- [x] 3.4 Run focused validation and a production build; document existing limitations and preserve unrelated work.
- [x] 3.5 Cover date bounds/Dublin midnight/leap years, default topic/description, duplicate dates/deletion/stale writes, mentor CRUD, and private-data denial through APIs and RLS.
- [x] 3.6 Cover empty/non-empty pods, Add pod availability, private pods, expiry, and unchanged idempotent joining.
- [x] 3.7 Cover future calendar and future attendance rows: current date, date filters, statistics, counts, milestones, reports, and today's sign-in with/without a planned session.
- [x] 3.8 Verify cutover import replaces matching dates, preserves unmatched preloaded sessions and their fields, and respects unique dates without overwriting preserved rows through ID collisions.

## 4. Session types and tab amendment (approved)
- [x] 4.1 Confirm same-date coexistence: multiple entries of every type are allowed on any date.
- [x] 4.10 Obtain approval for the revised schema/API amendment before implementation.
- [x] 4.2 Replace the history checkbox with Future/Past tabs, disjoint date windows, correct sort directions, and role-sensitive query keys.
- [x] 4.3 Highlight the first visible entry per tab after filtering, preserving note styling and leaving pods independent.
- [x] 4.4 Add a forward migration for CODING/MENTOR_PLANNING/NOTE, backfill existing rows, retain revision safety, and remove all date uniqueness and implement the agreed multiple-entry import rules.
- [x] 4.5 Update DTOs, APIs, RPCs, RLS, grants, generated types, generic session reads, realtime privacy, and all affected stores/Bruno requests.
- [x] 4.6 Replace the dated-entry mentor-only checkbox with the translated session-type selector; add type labels/icons, topic defaults, and theme-variable note styling. Keep pod flags unchanged.
- [x] 4.7 Verify both date windows/orderings, today/year/leap boundaries, equal-date ordering, leading-entry highlighting, notes, empty states, and hidden planning entries.
- [x] 4.8 Verify migrated IDs/content/privacy, type transitions, stale writes, multiple same-date entries of each type, independent edits/deletes, cutover preservation, and unchanged attendance/pod rules.
- [ ] 4.9 Recheck amendment cards at phone width. Desktop/keyboard, 81 focused tests, production build, strict OpenSpec validation, and verification notes are complete; the viewport override did not affect the current automation tab.

- [x] 4.11 Provide reusable public/member component modes with store-owned queries, anonymous RLS/column grants, cache deduplication, and logout privacy coverage.
