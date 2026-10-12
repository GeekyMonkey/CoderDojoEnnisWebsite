# Parent P01–P13 verification

## Legacy baseline and implementation

The complete legacy `ParentController` and all `Views/Parent` files were reviewed before implementation. The master checklist records each P01–P13 feature. The new parent portal implements own account, sorted active linked children, child summary and passport, narrow account/password/image editing, read-only goals and badge/belt evidence, attendance, co-parent contacts, safe team-peer profiles and public session joining.

Shared components now own achievement grouping, goal display, team-peer presentation, session presentation and separate photo/avatar processing. Parent data access stays in Zod-validated TanStack Query stores with distinct authenticated cache keys and scope-cleaned realtime listeners. The shared peer roster includes the viewing child, preserving the legacy other-team-members list, and its public-profile link resolves under the same relationship authorization. Shared printing and achievement evidence translations use role-neutral categories.

## API and database checks

Disposable parent-only, co-parent, linked child, unrelated child and peer accounts verify:
- Own profile read/save succeeds without mentor privileges; Management is denied.
- Child directory/context, co-parent contacts and peer DTOs expose only their explicit response fields; team maintenance notes, private peer credentials and scanner IDs are absent.
- Every child/history/attendance/peer read rejects unrelated children or removed relationships; strict queries and unknown body fields are rejected.
- Narrow account saves retain privileged fields, reject stale snapshots and case-insensitive duplicate logins, and validate birth year/handles.
- Password reset changes the child application credential; new-password login succeeds and the old password fails. Password hashes never appear in child responses.
- PNG upload, photo/avatar swap and independent deletion succeed; invalid PNG and unrelated-child image changes are denied. Storage recovery is reused when guarded flag persistence fails.
- Public pods exclude mentor-only sessions; concurrent parent joins create one own Dublin-date attendance and do not mark the child present.
- Valid old JWTs do not bypass current role or relationship revocation. Direct service-RPC tests also reject unknown privilege fields and removed links.
- Function privileges explicitly deny anon/authenticated execution and grant only service_role. Security advisor adds no finding for the new function.

Fixtures are removed or archived after verification; no existing child/team/achievement data is changed by tests. Russ Painter's existing account retains mentor and now has parent/coder roles at the user's explicit request; sign-in and all three navigation groups are verified.

## Browser checks

The production server loads in the integrated browser. Parent-only navigation and real linked-child cards, child summary/handles/team, read-only goals and achievement evidence, account save, photo/avatar controls, attendance order, co-parent contacts, public peer profile, passport QR readiness and session joining/fallback are verified. At 390px, account and image screens fit with no horizontal page overflow; mobile account proof is saved at `/tmp/parent-account-mobile.png`.

A badge award written in another session changes Awarded (1) / Pending (1) to Awarded (2) / Pending (0) without refreshing. Removing the parent-child link in another session clears the child's name, fields and controls and displays an access/load error without refreshing.

## Build and checks

Production Cloudflare build passes. The Node production build starts and passes the parent API integration checks. An existing extensionless crypto-js SHA256 import was corrected to `.js` so the Node production entrypoint starts under ESM. Type checking retains only the 25 existing legacy API/migration diagnostics. OpenSpec strict validation and git diff whitespace checks pass. No legacy code was edited and the user-run full test/format commands were not executed.

The dev server intermittently stalled during hot rebuilds; verification used the stable production build. Earlier integrated-browser navigation timeouts recovered against that server.
