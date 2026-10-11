# Validation

- Profile baseline committed as 7b17639 on develop. Maintenance batch remains uncommitted for user review.
- Production build passed and local Nuxt server rendered coder, parent and mentor directories and detail sections.
- Server and Vue type checks report only the same 25 untouched legacy diagnostics.
- Strict OpenSpec validation passed. No legacy source changes.
- API checks: anonymous directory 401; parent-only directory 403; mentor directory 200; unexpected queries/unknown fields and invalid IDs 400. Responses contain no password hashes.
- Disposable coder/parent/mentor signup 200, duplicate login 409, account and goal updates 200, stale snapshots 409.
- Concurrent repeated relationship and skill requests each produced one row. Reversed parent/coder roles and removal of a linked parent role rejected with 400. Unlink and skill removal returned 204.
- Disposable coder password confirmation mismatch 400; reset 204; login with the reset password succeeded. Temporary Supabase auth user removed. Six test members soft-deleted and login/password hashes cleared; temporary verification script credentials cleared.
- Browser: empty signup names show Zod errors; coder/parent/mentor account fields and relationship/progress/skill sections differ by viewed roles; UI parent search/link/unlink and mentor skill add/remove verified.
- Realtime: clean second goal view received remote marker without reload; dirty view retained its draft, showed conflict warning and disabled Save. Parent link and unlink reflected on both profile views without reload.
- Existing coder attendance history loaded 233 dates, with belt and badge histories available.
- Database function applied to the disposable Supabase project. Execute privilege verified false for anon/authenticated, true for service_role. Realtime already publishes all affected tables.
- Migration source: src/server/migrations/20261011_member_maintenance.sql. Apply it to other environments before deploying this batch. No existing tables changed.
- All ten new endpoint operations have Bruno requests. Added contract, draft protection, conflict mapping and realtime lifecycle coverage; test suite and formatter not run per project policy.
- Screenshot: /tmp/coderdojo-maintenance-detail.png. Full review diff: /tmp/coderdojo-maintenance-full.diff.
