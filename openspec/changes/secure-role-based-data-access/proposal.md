# Change: Secure role-based data access

## Why

The final parity audit found RLS disabled on 11 of 12 application tables, anonymous private-table reads, broad authenticated writes and credential-bearing realtime publications. New guarded APIs do not close older admin-client paths: Supabase service access bypasses RLS. This leaves profile privilege escalation, private member/application/attendance disclosure and destructive unauthenticated import paths open.

The user requires mentors to have full rights, parents and members to edit their own profiles, and **all images to remain public**. This proposal applies those rules to the complete feature list, including linked-child management, own achievements, teammate presentation, reporting, printing and realtime.

## What Changes

- Enable RLS on every existing `coderdojo` table; revoke broad anonymous access and all direct authenticated table writes; define explicit per-table read policies and controlled operation permissions.
- Give current active mentors full application administration of all 12 tables, including archived records, create/edit/archive/remove operations, relations, reviews, reports, printing, merge and maintenance. Keep supported operations behind validated APIs/RPCs so full administration does not bypass transaction invariants. Do not equate app administration with raw SQL/DDL/TRUNCATE or exposure of stored credentials.
- Permit every active bound parent/coder to edit their own login, first/last names, email, phone and external handles. Permit coder own goals/applications and parent linked-child operations exactly as described in the [policy matrix](policy-matrix.md). Protect roles, registration, team membership, scanner identifiers and system-managed fields.
- Establish a private immutable Supabase-user-to-member binding; use current database roles and active relationships rather than editable user metadata or role claims cached in a JWT. Preserve existing user accounts and sessions where identities reconcile.
- Separate private full-row access from public/teammate/host/linked-parent projections. Exclude hashes and device credentials from browser reads and event payloads. Ordinary authenticated reads use the user's token and RLS; document and strictly constrain the few privileged projection and mutation paths.
- Replace sensitive raw table realtime streams with authorized private invalidation channels and bounded authorized refetch. Add revocation/reconnect behavior. Keep public definition presentation and **public image downloads** working.
- Retain public image buckets/URLs, including photo, avatar, team and category images. Restrict image mutations to mentors, the profile owner or a parent of the active linked child; team/category writes are mentor-only. No signed-image-URL requirement or private-image migration.
- Keep the legacy import unchanged until production cutover by user decision; remove legacy import/read routes and decommission the old database at that cutover after final reconciliation. Preserve F03 attendance/kiosk API contracts as an accepted known vulnerability for the third-party hardware kiosk; close other old private member/belt lookup paths before release; retain legitimate login, kiosk/device and public directory contracts through narrow authenticated or deliberately public APIs.
- Add a complete direct-REST/API/RPC/storage/realtime positive/negative test matrix, rollout safeguards and a rollback that preserves protection.

**BREAKING:** anonymous/private raw reads, direct browser table mutations, old unguarded admin-client endpoints and wildcard sensitive realtime streams will cease to work. Legitimate users retain their supported app workflows through stores and guarded APIs. Public images remain publicly downloadable.

## Scope and policy choices

- Tables: `members`, `member_parents`, `member_attendances`, `member_badge_categories`, `member_badges`, `member_belts`, `badge_categories`, `badges`, `belts`, `teams`, `sessions`, `session_pods`.
- Supabase managed `auth.*` and `storage.*` are not new mentor-admin tables. Add only a private auth-binding table and policies on the app's storage/realtime surfaces; do not grant mentors auth-platform/DDL rights.
- Application CRUD means supported validated operations. Existing archive/merge safeguards remain; arbitrary hard-delete/correction UI is still parity decision Q01 and is not silently introduced here.
- Retain the existing business rule that mentors cannot approve/reject their own child's application, while any mentor may undo. This was presented as the recommended default in the clarification question; it is a reviewable assumption unless the user changes it. Full mentor administration otherwise applies everywhere.
- Parent linked-child edit rights remain birth year, login, handles, password reset and images. Parents read child goals/decisions/attendance; they do not apply/review awards on a child's behalf or assign relationships/roles.
- Public session listing remains Q05; this proposal does not expose pod URLs or mentor-only sessions anonymously. All images being public does not make their associated database rows/public contact details public.

## Impact

- Adds capabilities `database-access`, `realtime-access` and `image-access`. Existing `member-dashboard-ui`, `user-auth-ui`, attendance and NFC specs remain feature presentation contracts; current database-backed authorization becomes authoritative.
- Coordinates with completed profile/member/parent/coder/session/review/merge/maintenance changes. Their mutation invariants and store-based integration remain in force.
- Affected code: `src/server/db/DatabaseClient.ts`, actor/role helpers, private projection readers, every admin-client route, existing guarded RPCs, storage handlers, realtime composables and stores, image components, migration files and Bruno requests.
- Addresses audit F01/F04 and the identity/atomic-write/security portion of F05/F12. F02 remains deferred and F03 is accepted unchanged. It does not claim to complete the kiosk board, welcome content, all legacy integrations or the entire parity list.
- Evidence: [expected features](../../../docs/app-features.md), [final discrepancies](../replicate-legacy-features/final-parity-discrepancies.md), [baseline database snapshot](../replicate-legacy-features/final-parity-database-snapshot.json). Live metadata was rechecked read-only on 12 October 2026: 11 unprotected tables; public `coderdojo` image bucket; no storage.objects policies; Postgres 17.4. No production DDL/DML was performed.

## Delivery and acceptance

The proposal includes [technical design and rollout](design.md), [per-table and field rules](policy-matrix.md), [verification matrix](verification-matrix.md), [implementation tasks](tasks.md) and normative spec deltas. Completion requires every legitimate role feature to pass plus denial tests across direct REST, APIs, RPCs, storage and realtime; enabling RLS alone is not acceptance.

Status: **F01/F04 merged to develop; F01 database migration applied to shared Supabase**. See the [implementation and live verification record](implementation.md). The broader proposal is not fully implemented; successful hosted application deployment and end-to-end acceptance remain unconfirmed. Public image bucket settings are unchanged; F03 is accepted unchanged and F02 remains deferred.

## Accepted F03 exception — 12 October 2026

F03 is an explicitly accepted known vulnerability (12 October 2026): preserve the existing MemberAttendance/SetPresent, SignInGuid, SignInNfcTag and fingerprint API contracts and authorization behavior for the third-party hardware kiosk. Do not add authentication, device credentials or target restrictions as F03 remediation. Identifier-driven service-role requests can change attendance without a verified actor; fingerprint lookup also lacks an active-account filter. The user accepts this exposure and requests no remediation. This exception does not waive F01 database RLS or close F04/F05/F12 and other independent findings.
