## 1. Inventory and preparation
- [ ] 1.1 Confirm proposal assumptions and review the complete table/field matrix against expected features and active changes.
- [ ] 1.2 Capture restricted metadata/grants/policies/functions/views/default privileges/storage/publications; prepare backup and staging fixtures.
- [ ] 1.3 Inventory every API alias, admin-client reader/writer, RPC caller, browser subscription and deployed consumer.
- [ ] 1.4 Reconcile confirmed existing auth identities; report conflicts/orphans; plan account/session-preserving binding lifecycle and merge behavior.

## 2. Close service-role bypasses
- [ ] 2.1 Record F02 as deferred: leave the current legacy import and old database unchanged until production cutover.
- [ ] 2.2 Guard old private list/history/include_deleted/manual attendance endpoints and all aliases.
- [ ] 2.3 Implement bounded active-target device/kiosk attendance authorization; preserve valid login/device contracts without arbitrary member/backdate rights.
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
