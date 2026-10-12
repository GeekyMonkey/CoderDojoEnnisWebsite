# F01 implementation pass — 12 October 2026

Branch: `codex/f01-role-based-rls`, isolated managed worktree. The preceding audit/proposal documentation was pushed to develop at `347773b`. This pass implements F01 direct database protection and its identity/realtime dependencies. It does not complete every task in the broader proposal.

## Delivered

- Transactional migration `src/server/migrations/20261012181831_f01_role_based_rls.sql`: RLS on all 12 application tables; explicit read-column grants; row scopes matching the table matrix; anonymous active definitions only; no browser INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER, including mentors. Mentors retain supported administration through guarded service APIs/RPCs, including archived reads.
- Private one-to-one auth-user/member bindings, reconciliation of confirmed synthetic identities, fail-closed orphan/duplicate checks, active/current role and link helpers. Anonymous auth identities and archived/roleless/unbound actors have no private rights. Existing matching auth users/sessions are retained.
- Request identity uses the protected binding rather than editable auth email or metadata. Successful custom login provisions a binding through a fresh service client; signing in changes the first client's active token, so it must not provision the service-only binding. Session objects/tokens are removed from login debug output.
- Ordinary profile, pod and attendance-history reads use a request-token client with no service fallback. Full member rows remain hidden from children/peers/parents; existing explicit guarded server projections remain in place. Browser column reads omit password hashes, scanner IDs and team notes. Existing mutation locks, stale checks and review rules remain intact.
- All coderdojo raw table publications removed without touching unrelated schema publications. Private per-member Broadcast topics carry only table/operation invalidations. Scoped recipients include mentors, own members, linked parents and authorized team contexts; pending award evidence never appears in events.
- App-local subscription/auth state, 60-second channel renewal, committed-change/reconnect refetch, strict payload validation, denial/logout/role-change cache clearing. Mounted query observers are notified that data is gone before cache removal. Single-table attendance and generic table stores refetch instead of depending on row payloads/IDs.
- Scoped restrictive storage policies deny client listing/writes in the coderdojo bucket, preserving public image bytes/URLs and unrelated bucket permissions. Current validated image mutation APIs remain the supported path.
- Service-only exposed operation/stat RPCs; fixed empty search paths on existing attendance stat functions. Private policy helpers and the two service-only identity functions use finite fixed-schema SECURITY DEFINER bodies owned by the migration owner (`postgres`). This follows the existing Supabase helper ownership pattern: managed service_role cannot SELECT auth.users. No broad auth.users read grant was added. A separate BYPASSRLS owner role was not introduced.
- Legacy service-backed member/belt/team and global attendance read routes require a current mentor; stores send bearer headers. This closes related generic read bypasses but preserves the accepted F03 hardware kiosk API exception; F04 remains separate. New `/api/Auth/Identity` has a Bruno request.

## Explicitly unchanged/deferred

F02 CopyData and Legacy/Teams code and the old database remain unchanged until production cutover. A later destructive full import deletes binding rows with deleted members; users must complete the existing custom login again to provision the new binding. The import was not invoked or tested against live data. F19/F20 remain open.

F03 scanner/manual attendance APIs remain unchanged as a known vulnerability accepted for the third-party hardware kiosk. The browser kiosk lifecycle finding F12, global attendance transaction issue F05, public GitHub/export gaps and final production retirement remain separate work. RLS cannot restrict those service-role paths by itself. F21 stays closed under the user's accepted one-million-row configuration.

## Pre-application verification and deployment boundary (historical)

- Synthetic PostgreSQL/PGlite fixtures exercise actual roles, grants, RLS, service-only RPC execution, self-profile save/stale/protected fields, role/link/archive/anonymous revocation, historical definitions, pod expiry/Dublin date fallback, scoped row-free events and transaction rollback. No live personal records are copied into fixtures.
- The F01 baseline passed 87 focused tests across 12 files, covering request identity, mentor, login provisioning, profile/maintenance/store, private read middleware, realtime lifecycle and PostgreSQL authorization. Client dependencies vue/h3 are explicitly pinned to the versions already in the lockfile so a fresh install can resolve existing tests; PGlite is a pinned dev dependency.
- Production build passed. Typecheck retains existing legacy API/SQL and sessionRecovery.test diagnostics; changed-file diagnostics are checked separately. The prohibited broad test/format scripts were not run.
- Read-only shared-database reconciliation preflight: 21 eligible synthetic auth identities, zero orphaned identities and zero duplicate groups. Shared security-advisor results remain baseline findings because this migration is not applied: [RLS disabled](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public) and [mutable function search path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable).

**At branch review, not yet applied to shared Supabase or deployed. See the application record below for current database status.** The migration is a checked-in release artifact under src, matching the existing application migration convention; the ignored shared migration repository is not modified or pushed automatically. Before deployment, copy the reviewed artifact into the approved shared migration workflow, rehearse in a hosted staging project, run real REST/JWT/Broadcast/storage and UI checks, then perform a coordinated migration/app cutover. PGlite verifies Postgres authorization but not the hosted gateway, WAL transport or public storage HTTP service. No million-row tests or database decommissioning were performed.

Do not run old raw realtime clients after publication removal. Do not restore insecure grants/publications on rollback; use a guarded-compatible app or pause the affected workflow. Keep F01 open in the deployed-state audit until hosted acceptance checks pass. Keep the broader proposal's unimplemented tasks unchecked.

## F04 mentor-only read follow-up — 12 October 2026

User approved making the older full-directory/history/attendance reads mentor-only. The middleware now also covers SessionCurrent and SessionDateRange; together with SessionDate, SessionDates and SessionStats this covers all five attendance reader routes. Member/belt/team directories retain their mentor gate. Path case, encoded characters and trailing slashes are normalized. Guards run before service-backed handlers and use current binding/role verification.

Own-profile current belt no longer constructs broad member/belt directory stores. A scoped store resolves current identity and calls the existing own coder achievement or guarded mentor history API, selecting the latest earned belt and refreshing after belt/award invalidations. Unauthorized targets and request denials have no broad fallback. Parent linked-child/peer responses already supply their authorized belt projections. ApplicationFeedback and MemberProgress broad-directory uses are only instantiated in mentor flows; coder goals disable this component and use their own scoped lists.

F03 SetPresent/sign-in/fingerprint contracts and F02 import remain unchanged. No new endpoints or database migration were added. Shared deployment and hosted API/UI verification remain pending.

Follow-up validation: all 103 focused tests across 13 files pass, production build passes, strict OpenSpec validation passes and git diff checks are clean. Full typecheck retains the existing unrelated diagnostics; there are no diagnostics for the changed middleware, store or profile components. Hosted acceptance was not performed.

## Shared database application — 12 October 2026

User explicitly requested pushing develop and applying database migrations. PR #57 was merged to develop at `0ebab1896cfa7d5ea4b368bf881abf6619b632ec` and pushed. The existing GeekyMonkeyData project (`newsofwpimzmfbqsooka`) received `f01_role_based_rls`, recorded as version `20261012200254`. All preceding application migrations were already recorded; no reset, legacy import or decommissioning was performed.

Live verification confirms 12/12 application tables have RLS, 21 protected bindings, 12 invalidation triggers, zero coderdojo raw-row publications, three realtime policies and four scoped storage policies. Password/scanner column reads, browser member writes and client identity-binding RPC execution are denied; service identity RPC execution is allowed. The coderdojo bucket remains public.

Hosted PostgreSQL role checks passed for every existing bound actor, unbound private reads and anonymous member denial/active definition access. The actual realtime trigger/send function executed during a rolled-back no-op member update; neither that update nor its broadcast was committed. These checks do not substitute for end-to-end client JWT/Broadcast/UI tests.

Security advisors no longer report coderdojo RLS-disabled tables or mutable attendance-function search paths. The private binding table intentionally has RLS with no client policy ([advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)); access remains service/helper-only. Unrelated monkeyschool functions and existing project-wide Auth/Postgres settings were left unchanged.

Database migration application is complete. The older Cloudflare PR check failed, and the develop merge has no confirmed successful deployment check. Hosted application deployment, authenticated REST/private channel reconnect and role-specific UI acceptance remain unconfirmed. F01/F04 acceptance stays pending for those checks; F03 remains accepted unchanged and F02 remains deferred.

## F05 atomic attendance sign-in — 12 October 2026

The service-only SECURITY INVOKER `coderdojo.sign_in_attendance` operation takes the existing member ID, attendance day and testing flag. It follows advisory lock 731101 then the member row lock, rereads the account, inserts daily attendance idempotently, rotates only login_date/login_date_previous, counts attendance and returns the committed member projection without password_hash. UTC login timestamps are explicit in the response. No caller profile snapshot is written. Missing/deleted-by-hard-delete targets fail; existing archived/roleless targets remain compatible with the accepted F03 exception. Browser RPC execution is denied.

AttendanceService uses this single commit response; write errors, unavailable clients and missing/malformed responses fail. API URLs, input/output shapes and F03 authentication behavior remain unchanged. Fingerprint testing continues to skip attendance insertion, rotate login dates and simulate count+1; this is not a read-only mode. Post-commit welcome/award reads remain separate response enrichment.

Synthetic PostgreSQL tests verify rollback on either write failure, repeat idempotency, preservation of newer profile/role/archive/scanner/credential fields, testing semantics, missing-member failure and service-only execution. Service tests cover fresh committed projection, failure handling and unchanged testing arguments. True multi-connection concurrency and full hardware/hosted API acceptance are not claimed by the single-connection PGlite suite.

Validation: 118 focused tests across 15 files, production build and strict OpenSpec validation pass. Full typecheck retains existing unrelated diagnostics, with none in the changed service/tests. Migration f05_atomic_attendance_signin is applied to GeekyMonkeyData as 20261012201836. Hosted service-role invocation, repeat idempotency, date rotation, unchanged unrelated fields and hash-free response pass in a rolled-back transaction; client/anonymous RPC execution is denied. Security advisors report no new coderdojo findings. Full hardware/hosted API deployment acceptance remains unconfirmed.
