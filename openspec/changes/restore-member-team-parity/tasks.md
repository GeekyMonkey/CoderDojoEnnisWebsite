# Batch execution

The authoritative feature checklist remains [the master planning document](../replicate-legacy-features/tasks.md), D09–D15 and D25–D27. This file records execution checks, not a second feature backlog.

- [x] Implement the authorized batch through reusable components and validated stores/APIs.
- [x] Apply the migration to the disposable test database.
- [x] Verify atomic attendance, image validation/conflicts, realtime views, responsive layouts and print previews.
- [x] Confirm production build and unchanged legacy-only type-check baseline; leave code ready for review.

Verification: atomic attendance rollback and idempotent QR sign-in; strict image validation and concurrent-write conflict handling; two-client presence/image refresh; 134 relationship matches reachable; category search; 390px directory layout; team/member print previews. Disposable test members/team were soft deleted after attendance, relationships and image cleanup. Production build and server start checked; TypeScript retains the 25 existing legacy errors only. No legacy files were edited, and the batch is uncommitted for review.
