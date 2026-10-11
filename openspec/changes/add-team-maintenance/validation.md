# Validation

- Previous member maintenance batch committed and pushed on develop as e221d92.
- Production build passed; local Nuxt startup and team pages verified in the integrated browser.
- Vue type check: zero active-code errors; 25 pre-existing legacy diagnostics unchanged. No legacy files modified.
- Strict OpenSpec validation and git diff whitespace checks passed.
- Live API checks passed: anonymous 401; unexpected query, invalid ID/colour and protected fields 400; duplicate names 409.
- Two concurrent updates from the same snapshot produced one 200 and one 409; stale deletion returned 409.
- Assigned-team deletion rejected; unassigned team soft-deleted and excluded from active lists.
- Database function rejects non-mentor actors; execute permission verified false for anon/authenticated and true only for service_role.
- Browser verified required name validation, signup/edit/display, search and assigned member links. Shared linked breadcrumb headers verified for teams and member details.
- User reviewed and authorized committing feature 5 with the breadcrumb changes.
- Two browser views verified goal updates without reloading, preservation of dirty drafts with disabled save, discard/reload recovery and remote deletion visibility.
- Both disposable verification teams confirmed soft-deleted. Session test credentials cleared from the temporary validation script.
- Contract coverage added for normalization, protected fields, colour validation and complete snapshots. Unit suite and formatter not run automatically, per project instructions.

## Database migration
Apply src/server/migrations/20261011160426_team_maintenance.sql before deploying this batch to another database. Applied to disposable test project newsofwpimzmfbqsooka.

## Existing database advisor findings
No finding targets the new maintain_team function (security invoker, empty search path, service-role-only execution). Existing shared-schema findings remain outside this feature: exposed tables without RLS, older mutable-search-path functions, monkeyschool SECURITY DEFINER grants, auth settings and Postgres patches. Address as a dedicated data-access migration so existing realtime and read flows remain compatible.
- [RLS findings](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public)
- [Function search paths](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Function grants](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
- [Auth settings](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [Postgres updates](https://supabase.com/docs/guides/platform/upgrading)
