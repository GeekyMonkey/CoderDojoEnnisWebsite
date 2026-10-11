# Change: Allow login editing on the profile page

## Why
Login is currently display-only in self profiles. Members should be able to update it alongside their profile details.

## What Changes
- Show a Login input first in profile edit mode and plain text in view mode.
- Extend the existing store save contract and guarded profile snapshot with login.
- Reuse account-login validation (trimmed letters, digits, dots, underscores and hyphens; at most 100 characters), requiring a non-empty login for self-profile edits.
- Reject case-insensitive login conflicts against other active members, including concurrent saves, with actionable feedback.
- Preserve session/member identity, password and roles when login changes.
- Keep mentor signup/account maintenance compatible with their existing optional login handling.

## Impact
- Affected specs: profile-login (new); extends the allowed-field behavior in add-mentor-profile.
- Affected code: shared profile schema, draft, field inputs, profile save service, uniqueness enforcement and existing Bruno save requests.
- Existing mentor maintenance and profile saves share advisory transaction lock 731101. Seven existing duplicate-login groups were found; their logins are preserved until changed, with no destructive cleanup or unique-index migration.
