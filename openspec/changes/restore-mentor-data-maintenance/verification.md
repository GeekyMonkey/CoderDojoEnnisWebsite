# Verification — 2026-10-12

## Legacy review

Read `src_legacy/Controllers/MentorController.cs` DataCleanup/PurgeRegistrations, `src_legacy/Models/Member.cs` LastAttendance, both result views and the mentor menu.

- Cleanup soft-deletes active coders with max attendance strictly before local today minus one year. No attendance defaults to 2000-01-01, so newly created never-attended coders are eligible, matching legacy behavior.
- Then archive parent accounts with no children remaining active. Preserve mentor accounts and active coder roles in the unified member table. Inactive multi-role coder/parents are counted once as coders.
- Registration reset clears every registered coder, including archived and mentor/coder accounts. Adult-only registration flags stay unchanged.
- No history, links, images, skills, credentials or auth accounts are removed by either function.
- Confirmation and strict stale-preview checks replace the legacy destructive GET behavior.

## Database

Additive migration `20261012144531_mentor_data_maintenance.sql` applied to the configured `newsofwpimzmfbqsooka` project. Verified security invoker, empty search path, no anon/authenticated execution and service_role execution.

The fixture script at `scripts/verification/mentor-data-maintenance.sql` ran in a rolled-back transaction against temporary copies of the three tables and the exact migration function with only its schema replaced by pg_temp. Assertions passed for:

- old, never-attended, exact-boundary and recently attended coders;
- already archived accounts, orphan parents, parents of active children, mentor parents and multi-role coders;
- no writes on preview, non-mentor/archived mentor rejection, invalid action and missing confirmation;
- attendance/link/registration changes invalidating a reviewed snapshot without partial changes;
- actual apply counts, retained attendance/relationships, empty and repeat operations;
- reset including archived coders and leaving adult-only registration unchanged.

Read-only live previews returned 72 coders / 89 parents for cleanup and 80 registrations for reset. No real-account cleanup/reset was run.

## API and UI

Production Node server started on port 3017. Disposable mentor authenticated through the normal login API.

- Both authenticated previews return 200 and applied=false.
- Missing session returns 401; revoked mentor role returns 403 despite the existing JWT.
- Unknown actions, unexpected queries/body properties and malformed revisions return 400.
- Stale apply revision returns 409.
- Desktop and 390px views render translated titles, cutoff/scope, counts, readable scrollable tables and reachable controls without horizontal page overflow.
- Apply stays disabled until the review checkbox is checked. Cancel discards the captured preview.
- Archiving a separate disposable parent immediately invalidated the review via realtime and disabled Apply while showing the changed-preview warning, without reloading the page.
- Cleanup never invoked against real accounts. Completion count behavior verified in isolated database fixtures; live UI review stopped before applying.
- Disposable test accounts and auth session cleaned up after verification.

## Build and validation

- Cloudflare Pages production build and Node production build passed.
- Strict OpenSpec validation for restore-mentor-data-maintenance passed.
- Typecheck has no diagnostics in changed files. It reports 29 diagnostics in unchanged files: four in app/utils/sessionRecovery.test.ts plus 25 legacy migration diagnostics.
- User-run test/format commands were not invoked.
- Existing Supabase advisor findings remain outside this change; maintain_data is service-only and has a fixed empty search path.
