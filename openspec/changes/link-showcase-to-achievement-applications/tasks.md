## 1. Persistence and authorization
- [x] 1.1 Add uuid-array columns to member_badges/member_belts and update generated/shared types.
- [x] 1.2 Extend atomic application creation with validated, ordered, unique own-showcase IDs and existing duplicate/progression safeguards.
- [x] 1.3 Add guarded link updates for the coder's exact pending application, including stale-array and concurrent-decision protection.
- [x] 1.4 Add member-scoped deletion-trigger pruning across both badge and belt applications, initial dangling-ID cleanup and atomic read-repair fallback without changing notes, dates, decisions or valid links.

## 2. Data access
- [x] 2.1 Extend application contracts, coder actions API and TanStack stores; add/update corresponding Bruno requests.
- [x] 2.2 Batch-resolve linked showcase items in authorized review projections, including hidden items; prune missing references before returning results.
- [x] 2.3 Refresh application/reviewer stores after link or showcase changes while retaining unsaved selections.

## 3. Shared card and UI
- [x] 3.1 Make ShowcaseCard styling work in public and application themes, with instance-unique disclosure IDs and an action slot.
- [x] 3.2 Add showcase picker and linked-card Add/Delete actions to badge and belt application forms.
- [x] 3.3 Support Add/Delete on existing pending applications and read-only evidence on decided records.
- [x] 3.4 Display linked cards in all evaluator application evidence views, with description and project link.

## 4. Verification
- [x] 4.1 Verify multiple links, deduplication, empty-array defaults, own/other/hidden/deleted showcase cases and add/remove persistence.
- [x] 4.2 Verify stale updates, duplicate submissions, concurrent decisions, decided-record user-edit restrictions, system-only pruning on historical records and rejection/reapplication history.
- [x] 4.3 Verify reusable cards on public/coder/evaluator pages, unique disclosure IDs, keyboard use and responsive themes.
- [x] 4.4 Run focused checks, production build and strict OpenSpec validation; do not run the full format/test scripts automatically.

- [x] 4.5 Verify self-healing for deleted and already-missing IDs, empty arrays, stable remaining order, concurrent valid additions and realtime refresh.

Verification evidence and limits: [verification.md](verification.md).
