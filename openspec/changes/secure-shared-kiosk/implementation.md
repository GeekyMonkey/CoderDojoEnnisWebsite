# F12 implementation record

Authorized mentor logout and an alternative kiosk cookie are implemented. See design.md for the API/cookie/registry boundaries. The source migration is 20261012214542_f12_bounded_kiosk.sql; shared Supabase applied version is 20261012215451. All 213 focused tests and the production build pass; type checking retains unrelated baseline diagnostics without errors in changed files. Strict validation of this change passes.

Live rollback verification established active mentor access, blocked old-session RLS access and restored fresh-session access. No real browser/Auth session or member data was permanently changed by these checks. The security advisor's informational no-policy notice for the private revocation registry is intentional: clients have no grants/policies and service-only code accesses it.

Hosted browser Back, reload, multi-tab, cookie expiry and actual Auth sign-out acceptance remain pending. This does not claim hosted deployment. F03 hardware APIs, the beta member redirect and F02 import remain unchanged. F13 live board is separate. Checklist status labels are terse, with verification qualifications retained in the evidence/outcome columns.
