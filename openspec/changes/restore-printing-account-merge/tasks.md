# Execution checks

Feature status lives only in the master checklist D20–D24, D26 and D29.

- [x] Implement shared printing and certificates.
- [x] Implement validated account-merge preview and atomic transfer.
- [x] Enforce the approved own-child review policy.
- [x] Verify API conflicts, transfers, authorization, realtime and responsive previews.
- [x] Confirm build/start and the unchanged legacy type baseline; leave diff for review.

Verification: malformed and unauthorized merge requests rejected; incompatible accounts rejected; stale previews return 409 with no partial transfer; UI coder merge refreshed an independent directory without reloading; concurrent adult merge produced one success and one conflict, transferring children, skills and combined roles; archived sessions rejected. Own-child belt and badge approve/reject return 403; D29 permits any active mentor to undo, including for their linked child, independent mentor approval/undo work and stale decisions return 409. Database timestamps are normalized to UTC for conflict comparisons.

Printing: 72 registered coder IDs and 18 mentor IDs became ready (including all QR codes); unassigned individual ID, certificate content and 390px layout checked. D26 team IDs/cards retained. Preview/layout verification only; no physical printer was invoked. Disposable accounts were soft deleted after history/link/auth cleanup. Build/start and the 25 existing legacy-only type errors checked; no legacy code edits. New code remains uncommitted for review.

Security verification: new functions are security invoker with a fixed empty search path and service-only execution. Supabase advisors report existing project findings outside this change: [RLS configuration](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public) and [older function search paths](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable). Neither new function is reported.

D29 verification: rolled-back database checks passed for belt and badge approvals and rejections undone by another mentor who is the linked parent. Own-child approval/rejection, non-mentor undo and stale undo remained blocked. Production build and strict OpenSpec validation passed.
