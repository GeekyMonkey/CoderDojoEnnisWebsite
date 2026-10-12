# Authorization design and rollout

## Context and decisions

The [matrix](policy-matrix.md) is the per-table/field contract. Existing application rights are implemented by Nuxt APIs and service-only transactional RPCs. RLS protects database reads made with user tokens; it cannot protect a route that executes an admin query. Therefore this is one coordinated database/API/realtime release, not an isolated ENABLE ROW LEVEL SECURITY migration.

Mentors retain all supported application administration, including archived targets, roles, links, reviews, scanner IDs, definitions, attendance, reports, print, merge and maintenance. All browser table writes are denied, including mentor writes; guarded operations preserve invariants. Parents and coders edit their own profiles. The user's clarification makes every image publicly downloadable; uploads and deletes still require authority.

## Identity and policy helpers

Create `private.member_auth_bindings(auth_user_id uuid primary key references auth.users(id), member_id uuid unique not null references coderdojo.members(id))`. Keep the schema outside the exposed API schemas; revoke PUBLIC/anon/authenticated table and schema privileges. Dedicated trusted identity lifecycle code creates/reconciles bindings; member profile/account editing cannot update them. The one-to-one mapping is independent of editable login/email and of the differently valued member/auth UUIDs.

Backfill existing confirmed synthetic `<member UUID>@coderdojoennis.com` identities, matching the existing parser, only where exactly one auth user maps to one member. Reject and report orphaned/ambiguous mappings without silently claiming identities. Preserve matching auth users and sessions. Provision bindings transactionally or through an idempotent trusted reconciliation before newly created login sessions can access private data. Archiving disables access through the current member row; merging must explicitly disable the source identity and reconcile the surviving binding without granting a second member's session access. Test current login/logout/reset flows before replacing the parser as the authorization source.

Implement narrowly scoped private helpers: current bound active member ID; current active mentor/parent/coder predicates; active linked-child predicate; authorized team predicate; authorized attendance date; historical badge/belt/category reference predicates. Names in the matrix are conceptual, not existing functions. Identity comes from `auth.uid()` inside the function. No helper accepts a caller-supplied actor identity. Relationship checks require an active parent and active coder child. Multi-role accounts receive the union of applicable grants.

Policy helpers that must read protected tables use SECURITY DEFINER with a dedicated least-privilege owner, `SET search_path = ''`, fully qualified names, no dynamic SQL and audited EXECUTE grants. Their owner must be able to perform those specific internal reads without recursive policy evaluation; do not casually apply FORCE RLS and break helper execution. They return only the needed identity/boolean, not arbitrary rows. Do not expose these helpers as public PostgREST RPCs. Keep existing mutation cores SECURITY INVOKER, service-only, with current database actor checks and empty search paths.

## Grants and RLS

Within a transactional migration, inventory and replace every existing policy, table/column grant, default grant and function EXECUTE grant. Enable RLS on all 12 application tables, including the already protected `session_pods`. Policies target `authenticated` or explicitly approved public definition reads, never an accidental PUBLIC catch-all. Remove the old broad pod policy.

Revoke table-level SELECT before granting approved SELECT columns; a table SELECT grant overrides column restrictions. Revoke INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER from anon/authenticated and remove permissive write policies. Grant required schema USAGE only. Revoke PUBLIC function EXECUTE before assigning operation-specific execution. Set owner-specific default privileges so future tables/functions do not reopen the surface; require explicit RLS/grants for every future exposed table. Inventory views and use `security_invoker=true` for ordinary views.

Apply the exact SELECT predicates in the matrix. Every authenticated predicate requires an active bound actor, including reads of active definitions. Anonymous reads are limited to approved active definition columns/public projections. Browser-visible member columns omit password hashes, scanner identifiers and other unsupported internal fields; sensitive columns remain available only in guarded operational DTOs. Teams omit notes from browser SELECT. Authorize historical references by the actor's readable awards/skills, not by any reference anywhere in the database.

For pods, preserve the current eligibility boundary: `ends_at > now()` when an end exists; otherwise `session_date >= current dojo date`. Define the dojo date consistently in Europe/Dublin across SQL/API so daylight-saving/timezone differences cannot expose expired pods. Mentors read expired/archived pods. Nonmentors read only active eligible non-mentor-only pods. Joining rechecks eligibility inside its transaction.

Avoid per-row repeated identity queries by using uncorrelated scalar helper evaluation where safe. Index binding/member-parent/member/team/attendance/history lookup columns only after checking existing indexes and EXPLAIN plans on realistic staging data. Never make a helper STABLE/IMMUTABLE in a way that caches roles across requests; fresh statements must reflect role/link/archive changes.

## Application data boundary

Add a request-scoped Supabase client using the validated user's bearer token for ordinary private reads. Keep the service key server-only. Stores continue to own API access, cache invalidation and realtime refresh. Remove `select('*')` where column grants or projections differ. Use shared exact response schemas so adding a database column cannot silently expose it.

Privileged exceptions are explicit: narrow linked-child, co-parent, teammate, host/reviewer and anonymous GitHub projections; validated mutations; bounded reporting/device flows. Each service reader verifies current actor/relationship/target and returns only the matrix's fields. A projection that needs rows hidden by base RLS is not implemented as an invoker view that accidentally returns nothing, nor as globally widened member access. Use a guarded exact DTO server reader or reviewed private projection function. Global mentor reports/print may use guarded mentor service readers; nonmentor aggregate readers use their documented scope.

Inventory every server route and RPC, including old table/list endpoints and aliases, not only newer guarded screens. By explicit user decision, leave `Legacy/CopyData` unchanged during development/migration. At production cutover, remove this endpoint and `Legacy/Teams` dependencies; after final data reconciliation, runtime dependency checks and recovery-backup preparation, decommission the old database. Do not decommission it during RLS development. F03 is an explicitly accepted known vulnerability (12 October 2026): preserve the existing MemberAttendance/SetPresent, SignInGuid, SignInNfcTag and fingerprint API contracts and authorization behavior for the third-party hardware kiosk. Do not add authentication, device credentials or target restrictions as F03 remediation. Identifier-driven service-role requests can change attendance without a verified actor; fingerprint lookup also lacks an active-account filter. The user accepts this exposure and requests no remediation. This exception does not waive F01 database RLS or close F04/F05/F12 and other independent findings.

Close `include_deleted`, private attendance/application evidence and generic list bypasses. Verify current-role checks immediately before mutation in the database transaction, so an API role check followed by service access cannot race revocation. Preserve advisory lock 731101, case-insensitive new login claims, duplicate historical logins, stale snapshots and privilege-field rejection in `save_profile`. Preserve review, signup, relation, merge, maintenance and attendance transaction effects. Reject unknown protected request properties, rather than silently spreading them into rows.

Attendance statistics/date RPCs must not retain public global EXECUTE. Implement guarded scope-specific readers, with mentor global, ordinary own/linked-child and approved aggregate results separated. Core maintain/signup/merge/review/profile/coder/join RPCs remain service-only and recheck the server-derived actor. A normal user cannot invoke them directly or pass a different actor ID.

## Realtime design

Remove sensitive tables from direct client-facing Postgres Changes publication/subscriptions. Do not rely on RLS to redact columns or protect raw DELETE events. Replace wildcard handlers and row logging with committed-operation invalidations containing only a permitted domain and version, without member IDs, contacts, hashes, evidence or row snapshots.

Use private Broadcast topics for `mentor`, `member:<bound member ID>` and explicitly authorized parent/child or team scopes only where required. Topic access policies on `realtime.messages` must authenticate current bindings/roles/relationships. Server-derived topics only; client-supplied subject IDs grant no rights. Only trusted backend producers can send invalidations; authenticated clients cannot spoof database-change broadcasts. A committed operation invalidates affected own/parent/team/mentor stores without sending private data to broader channels; rollbacks produce no successful-change event.

Broadcast authorization is cached during a connection: do not promise immediate role revocation solely from connection policy evaluation. Send only nonsensitive invalidations, reauthorize every refetch through current RLS/API checks, clear cached private data on authorization failure/logout, and force authenticated channel renewal at most every 60 seconds. Role/link/archive changes trigger trusted renewal where possible; test reconnect and refreshed-token behavior. An invalidation after revocation must never disclose a target ID or private row. If stricter immediate event revocation is required, use an actively revocable server transport before release. Definition-only public updates may remain public after explicit field review. Prevent publication/default subscriptions from adding sensitive future tables.

## Storage and public images

Keep the app bucket public and retain stable public URLs, legacy JPEG fallbacks and photo/avatar separation. Anyone with an image URL can fetch its bytes, including logged-out users and archived-member image URLs until the existing authorized lifecycle removes them. No signed URL or private-image migration. Public image metadata references in authorized DTOs are allowed; no global member/object directory follows from public downloads.

Deny direct client object writes and arbitrary listing. Validated image APIs use current mentor/self/linked-child permission; team/category image writes require mentor. Derive entity paths server-side, validate PNG dimensions/format/size, reject arbitrary buckets/paths and protect both source/destination of swaps. Preserve file/row consistency, revision changes, independent deletes and cleanup/retry behavior. Do not change unrelated public `monkeyschool` storage. Explicitly test public downloads after all grants/policies change.

## Rollout and rollback

1. Capture metadata/grants/policies/functions/publication membership and backups under restricted operator access. Establish staging role fixtures; inventory all consumers and identity conflicts. Do not copy passwords or personal records into the proposal/logs.
2. Close private service-route bypasses first as a compatible guard/removal release, excluding F02 legacy import, which remains unchanged until production cutover. Deploy identity reconciliation and guarded APIs that work before and after restricted grants, including safe user-token readers/projection fallbacks and approved device flows.
3. Deploy private invalidation consumers/producers and stop sensitive wildcard subscriptions. Confirm store refresh and all feature flows; remove sensitive publication membership before granting normal client channels access.
4. Apply the transactional binding/helper/RLS/grant/function/storage/realtime migration during a controlled cutover. Check grants independently of row policies. Restart/reconnect clients; clear authorization-sensitive caches. Do not leave a compatibility fallback that resumes generic service reads on RLS failure.
5. At production cutover, remove legacy import/read routes, reconcile the final migrated data, verify no remaining old-database runtime dependencies and retain the required recovery backup, then decommission the old database. Run the complete verification matrix in staging and limited controlled production checks. Repeat metadata/security advisor checks; verify all 12 tables and no newly opened functions/storage paths. Record evidence before marking F01–F04 resolved.

Abort on identity conflicts, unsupported consumers, any denial-test failure or broken essential feature. Roll back application presentation to the last guarded-compatible version or pause the affected workflow; retain RLS, revoked grants, closed destructive endpoints and removed sensitive publications. Never restore the insecure grants/policies as a convenience rollback. Restore data only through the restricted operator backup process if genuinely necessary.

## Review assumptions and deferred features

Retain own-child approve/reject restriction; any mentor may undo. The clarification is pending, so this is a visible default, not a newly approved exception. Public session directory and arbitrary hard-delete UI remain separate parity decisions. All image downloads being public is confirmed by the user. No application code, policies or deployment is included in this proposal delivery.

## Current official references

- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security): role bypass, policies, grants and invoker views.
- [Column privileges](https://supabase.com/docs/guides/database/postgres/column-level-security): row policies do not protect individual fields; table grants override column restrictions.
- [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes) and [Realtime authorization](https://supabase.com/docs/guides/realtime/authorization): raw event limitations and private channel authorization.
- [Public buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals) and [storage access](https://supabase.com/docs/guides/storage/security/access-control): public downloads and separately protected writes.
