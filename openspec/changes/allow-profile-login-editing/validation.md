# Validation

- Production build passed.
- App and server type checks retain existing diagnostics outside changed files; changed files have no diagnostics.
- Applied service-role-only SECURITY INVOKER save_profile migration with an empty search path. Browser roles have no execution permission.
- Database rollback transaction verified save, case-insensitive duplicate rejection, stale snapshot rejection, privilege-field rejection and unchanged password/roles. No validation edits were committed to member records.
- Profile and mentor maintenance share advisory transaction lock 731101, serializing competing login claims across these supported write paths.
- Existing duplicate-login groups: 7. Preserved without cleanup; uniqueness enforced for newly chosen logins.
- Security advisor produced no findings naming save_profile; existing project findings are outside this change.
- Added schema and draft regression coverage, updated both Bruno profile-save requests. Automated test and format commands were not run, per project instructions.
- Mentor signup schema and inputs retain optional account login, without a second login input.
