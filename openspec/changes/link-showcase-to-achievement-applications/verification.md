## Delivered
- Ordered UUID arrays on badge and belt application records; empty by default.
- Own pending-application link updates with exact array baselines and database row locks; decided evidence remains read-only to coders.
- Owner-scoped showcase deletion cleanup across pending and historical applications. Read repair prunes against the current stored array, preserving remaining order and unrelated fields.
- Shared expandable project cards, Add/Delete link controls, hidden evidence in authorized evaluator projections, and shared row-free realtime invalidation through TanStack stores.
- Bruno create/update examples; translations in English, French, Irish and Ukrainian.

## Verification
- 33 focused tests across 10 files passed: application SQL, deletion cleanup, stale edits, decided-record restrictions, rejected/reapplication history, open-editor repair, owner validation, contracts, batched hidden-project projection, realtime refresh and repeated-card disclosure IDs.
- Production Nuxt build passed. `git diff --check` passed. Strict OpenSpec validation passed.
- Browser fixture checks passed for multiple-project submission, exact pending unlink payload, disclosure links, evaluator read-only hidden evidence, desktop/mobile sizing and card theme styling. Browser API writes were mocked; real authenticated hosted application writes were not exercised.
- Public-card browser checks passed for keyboard disclosure, balloon particles, transparent departure and reduced motion.
- Local PGlite checks execute the real migrations and atomic coder function. Stale updates and decisions are tested as successive transactions; true parallel-client contention was not exercised. Lock ordering was inspected against the existing decision function.
- Full `vue-tsc --noEmit` still reports existing errors only in session-recovery test mocks and legacy API/SQL files. No changed-feature errors reported.
- No full format or full test script was run.

## Database rollout
Applied `20261015102219_link_showcase_applications` to the configured Supabase project. Verified both columns are non-null UUID arrays with empty defaults, and the repair RPC is executable by service_role but not authenticated users. Security advisors reported no findings for the new functions; existing unrelated project notices remain.

Publication target: develop. User authorized committing and pushing all remaining changes.
