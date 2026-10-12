## 1. Inventory and preparation
- [ ] 1.1 Confirm proposal assumptions and review the complete table/field matrix against expected features and active changes.
- [ ] 1.2 Capture restricted metadata/grants/policies/functions/views/default privileges/storage/publications; prepare backup and staging fixtures.
- [ ] 1.3 Inventory every API alias, admin-client reader/writer, RPC caller, browser subscription and deployed consumer.
- [ ] 1.4 Reconcile confirmed existing auth identities; report conflicts/orphans; plan account/session-preserving binding lifecycle and merge behavior.

## 2. Close service-role bypasses
- [ ] 2.1 Record F02 as deferred: leave the current legacy import and old database unchanged until production cutover.
- [ ] 2.2 Guard old private list/history/include_deleted endpoints and aliases outside the accepted F03 kiosk/attendance exception.
- [x] 2.3 Record F03 as accepted known vulnerability / do not change: retain third-party hardware kiosk APIs and existing authorization behavior. No F03 hardening is planned.
- [ ] 2.4 Recheck actor/role/link/target in transactional mutations; preserve existing profile locks, stale checks and operation side effects.

## 3. Identity, readers and database policies
- [ ] 3.1 Add private auth-binding table, trusted reconciliation/provisioning and narrowly owned identity/link/history helpers.
- [ ] 3.2 Introduce request-token read clients; exact DTOs and guarded projection/report exceptions; update readers/stores and remove wildcard row exposure.
- [ ] 3.3 Apply all 12 SELECT policies, explicit column grants and default-deny browser DML; review views and default privileges.
- [ ] 3.4 Revoke public/broad RPC EXECUTE; scope statistics; preserve service-only guarded mutation cores.
- [ ] 3.5 Verify indexes and plans; align pod eligibility with Europe/Dublin and transaction-time checks.

## 4. Public images and realtime
- [ ] 4.1 Preserve public buckets/URLs/JPEG fallbacks; enforce mentor/self/linked-child member-image and mentor-only entity-image mutation guards.
- [ ] 4.2 Deny direct storage mutations/global listing; derive paths server-side; verify swap/delete/revision/file-row recovery.
- [ ] 4.3 Replace sensitive wildcard subscriptions/publications with authorized private invalidations and exact store refetch.
- [ ] 4.4 Add producer restrictions, topic policies, authorization-sensitive cache clearing and channel renewal within 60 seconds.

## 5. Verification and release
- [ ] 5.1 Add appropriate focused authorization tests and Bruno requests for new endpoints; execute the complete verification matrix with actual role tokens.
- [ ] 5.2 Verify legitimate UI/store workflows, all direct REST/RPC/API negatives, public image downloads and connected-channel revocation.
- [ ] 5.3 Run production build/focused checks and metadata/security advisor review; document evidence and unresolved issues.
- [ ] 5.4 At production cutover remove CopyData/legacy read dependencies, complete final reconciliation and recovery-backup checks, then decommission the old database; execute coordinated cutover and retain protective grants/policies/route closure on rollback.
- [ ] 5.5 Update expected features/security docs and audit finding status only after implementation and acceptance; archive proposal after deployment.

## F01 branch delivery (approved 12 October 2026)
- [x] Commit/push current documentation to develop before creating the isolated F01 worktree.
- [x] Implement all 12 table read policies/column grants and deny direct client writes; service-only RPC grants and fixed attendance search paths.
- [x] Implement protected identity binding, compatible login provisioning and request-token profile/pod/history readers.
- [x] Replace raw sensitive publications/subscriptions with scoped private invalidations, renewal and observer cache clearing; preserve public images.
- [x] Guard related legacy global private read routes and add headers/identity API Bruno request.
- [x] Run synthetic database authorization, focused app/lifecycle tests, production build and changed-file type checks; capture read-only reconciliation/advisor baseline.
- [ ] Apply to hosted staging and verify actual REST/Broadcast/public image/UI behavior; shared deployment is not performed by this branch delivery.
- [ ] Complete remaining broader proposal tasks and production cutover, including deferred F02 retirement.

Evidence and limitations: [F01 implementation record](implementation.md). Original full-proposal tasks above remain unchecked where this pass does not complete their full acceptance criteria.

## Shared database application (authorized 12 October 2026)
- [x] Merge PR #57 to develop and push the merge.
- [x] Apply f01_role_based_rls to GeekyMonkeyData and confirm migration history, table grants/RLS/bindings/publications/policies, current actor role scopes and rolled-back hosted trigger execution.
- [ ] Confirm successful hosted app deployment and complete authenticated REST/Broadcast/UI acceptance.
