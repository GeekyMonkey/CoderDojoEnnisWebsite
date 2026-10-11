# Validation

## Worktree
- Branch: codex/achievement-definitions, based on develop commit a6f39c8.
- Workspace: /home/russp/.codex/worktrees/achievement-definitions/CoderDojoEnnisWebsite.
- Local dev server: http://localhost:3002. Main checkout changes were left untouched.
- This batch remains uncommitted for user review before feature 7.

## Checks
- Production build passed; local startup and all three directories/detail routes verified in the integrated browser.
- Vue type check: zero active-code diagnostics, with 25 pre-existing legacy diagnostics unchanged. Legacy files remain untouched.
- Strict OpenSpec validation and git diff whitespace checks passed.
- Live API checks passed for category, belt and badge creation/editing/deletion; protected fields, empty names, invalid hexadecimal colour, fractional sort order, invalid kind/ID and missing category rejected.
- Anonymous requests returned 401; unexpected queries 400; duplicate names 409. Database function rejects non-mentor actors.
- Two concurrent edits from one baseline produced one 200 and one 409. Stale saves and deletes returned 409.
- Active-category validation passed. Categories referenced by active badges or mentor skills could not be deleted.
- Award-count reads confirmed each disposable awarded definition had one award.
- Disposable belt and badge awards remained visible in a member's History API response after their definitions were soft-deleted. Temporary award records and skill links were then removed.
- All five disposable API/browser definitions verified soft-deleted with no active verification definitions remaining.
- Browser checked required name and category validation, category selection, display-first detail views, linked breadcrumbs and deletion confirmation.
- Two independent views verified realtime edits without reload, dirty description preservation with disabled save, discard/reload recovery and remote deletion visibility.
- Meaningful contract tests added but not automatically executed. pnpm test and format were not run, per project instructions.

## Database migration
- Applied src/server/migrations/20261011182039_achievement_definitions.sql to disposable test project newsofwpimzmfbqsooka.
- Adds only maintain_definition and its execution grants. No table restructuring, legacy data import or bulk data transformation.
- Execution privilege verified false for anon/authenticated and true for service_role; security invoker with an empty search path.
- Other databases require this migration before deploying this batch.

## Existing database advisor findings
No advisor finding targets maintain_definition. Existing shared-schema RLS, function grants/search paths, auth configuration and Postgres patch findings remain outside this feature and match the prior batch baseline.
- [RLS findings](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public)
- [Function search paths](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Function grants](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
- [Auth settings](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [Postgres updates](https://supabase.com/docs/guides/platform/upgrading)
