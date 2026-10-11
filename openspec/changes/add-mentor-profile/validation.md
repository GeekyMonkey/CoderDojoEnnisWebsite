# Validation

- Production build passed; development profile page loaded and rendered after authenticated login.
- Vue and server type checks report only the 25 untouched legacy migration diagnostics. No errors in the new profile files.
- API checks against the disposable database: anonymous read 401, privileged field injection 400, authenticated read/save success, stale snapshot 409, incorrect current password 400.
- Successful password change verified by logging in with the temporary password; original password restored. The endpoint uses an empty 204 response and the store normalizes the unavailable result to null.
- A remote profile update was observed in a second clean browser view without reload. A dirty view retained its unsaved first name, displayed a conflict warning and disabled Save. Original profile values restored.
- Members are already in the Supabase realtime publication; no schema changes required.
- Schema validation and realtime listener/cache invalidation tests added. No test suite or formatter executed, per project command policy.
- UI translations added for en/fr/ga/uk. Screenshot: /tmp/coderdojo-mentor-profile.png.
- No legacy changes. No credentials or tokens committed. Temporary verification scripts cleared.
- Implementation remains uncommitted for user code review. Other mentor features have not been started.

## Reusable profile follow-up
- Extracted role-neutral MemberProfile contracts, ProfileDetails, ProfilePasswordForm and useProfileDraft.
- Mentor, parent and coder pages share MyProfilePage; display mode is the default. No API calls in reusable UI components.
- Zod validates profile fields, password confirmation, API request/query inputs and parsed member responses at the store boundary.
- Browser checked default display mode, switching to edit mode, empty name/password rejection and cancelling without a mutation.
- Prior authenticated save, concurrency and realtime checks remain applicable to the unchanged persistence guards and realtime store subscription.
- Follow-up authenticated API checks: read 200, unexpected query fields 400, unchanged password 400; no data mutated. Rebuild passed, with only preserved legacy type diagnostics.

## Own and selected profiles
- My Profile resolves the authenticated member regardless of role. User Profiles accepts a validated member ID and shares the query/mutation/realtime implementation.
- Reusable own and selected profile components expose slots for UI differences based on the viewed member and returned permissions.
- Live API verification: parent own read/save 200; parent accessing another member 403; mentor reading the selected parent 200 with password permission false; stale selected-profile save 409. Original parent data restored.
- Production build passed. Added role-independent authorization and access-policy coverage; tests remain unexecuted per project policy.
