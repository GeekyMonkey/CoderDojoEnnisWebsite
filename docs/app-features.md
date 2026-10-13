# Expected app features

Updated 12 October 2026 against commit `0a76125dcee12530c26baf87879219eb725db45a` and the live database metadata audit.

CoderDojo Ennis provides public information plus authenticated Coder, Parent, and Mentor portals. The public site currently uses static HTML; the authenticated portal app uses Nuxt 4, Nuxt UI 4, shared components/stores, Supabase authentication, Postgres, and storage.

This document describes the expected product behavior and current implementation coverage. **Present** means a counterpart exists in source; it does not certify deployed parity. **Gap** links to a confirmed discrepancy. **Decision** identifies behavior awaiting an explicit compatibility/product decision. The [final discrepancy list](../openspec/changes/replicate-legacy-features/final-parity-discrepancies.md) and [field/action coverage ledger](../openspec/changes/replicate-legacy-features/final-parity-coverage.md) qualify the statuses. The [master checklist](../openspec/changes/replicate-legacy-features/tasks.md) retains earlier implementation history.

## Roles and access

| Role | Expected access |
| --- | --- |
| Visitor | Public dojo information and an explicitly public GitHub/definition projection; no User credentials, contact directory, private applications or individual attendance. Public Session details are a pending scope decision (Q05). |
| Coder | Own account, goals, achievements, attendance, passport and eligible pod joining; safe public profiles for current teammates. |
| Parent | Own profile and attendance; only active linked children Coders and safe teammate profiles within those Coders' teams; permitted linked-Coder account/password/image changes, read-only goals and achievement decisions. |
| Mentor | Attendance administration, directories/signup, account roles and relationships, Mentor skills/goals, Achievement application review, definitions, teams, pods, reports, printing, merge and controlled maintenance. |
| Shared kiosk / scanner | A bounded sign-in authority that cannot recover mentor management privileges; supported credential/QR/NFC/fingerprint inputs and a scoped live attendance board. F03 hardware kiosk APIs are preserved as an accepted known vulnerability; F12 implements mentor logout and a bounded kiosk cookie; hosted acceptance is pending and the scoped live board remains F13. |

Users can hold multiple roles. Identity and privileges must be checked against the current account on the server; menu visibility and editable auth metadata are presentation hints. Archived accounts must not gain access or sign in. A Parent link must be checked for every linked-Coder request. Mentors must not approve/reject their own linked Coder's Achievement applications; any Mentor may undo decisions under the implemented policy, with current role and stale-state checks.

Expected boundaries must also hold for direct APIs, database REST and realtime. The F01 database migration is applied and F04 reader guards are merged to develop; hosted app acceptance remains pending. F02 is deferred and F03 is an accepted hardware kiosk vulnerability.

All images are public to download, including User photos/avatars and team/category images. Public downloads do not authorize uploads, deletions or private User-data access. The [full data-access proposal](../openspec/changes/secure-role-based-data-access/proposal.md) and [per-table/field matrix](../openspec/changes/secure-role-based-data-access/policy-matrix.md) specify full Mentor administration, own-profile editing, image mutation authority and rollout checks. These rules are proposed; the current security gaps remain open.

## Public site and integrations

| Feature | Expected fields/actions | Current status |
| --- | --- | --- |
| Public information | Home/about, joining, when/where, topics, news, contact/privacy, sponsor/media/tutorial content and links | Present as `/home.html` and static fragments; external content/destination freshness needs Q05/V04. Root redirects to the static page. |
| Coder and Mentor GitHub directory | Separate `Members` and `Mentors` lists containing first name, last name and GitHub login; active accounts only, nonempty handles, stable name ordering and GitHub page/avatar links | F09 implemented: current Supabase data supplies the existing public contract; no legacy API call. Hosted acceptance pending. |
| Chatbot definition exports | Badge compact ID/achievement/description/category; belt compact ID/name/hex/order/description, stable category/order sorting | Gap F10; compatibility or retirement decision required. |
| NFC utilities | Supported ReadNFC/WriteNFC downloads, installation/use instructions and an entry point | Gap F11; legacy downloads absent. |
| Legacy URLs/devices/external services | Supported bookmarks/print links/scanner payloads/session links and known WebHub/chat consumers | Q02: retain the member-subdomain legacy redirect through beta, remove it at production cutover before teardown; enumerate other consumers and implement compatibility or communicate retirement. |
| Public sessions | Explicitly approved publishable topic/date/host fields, listing/calendar, without mentor-only/private join authority | Decision Q05; authenticated session pages exist, public projection does not. |

Public GitHub disclosure is deliberately narrower than the internal User model. It must not become a general User-directory API.

## Authentication and profile

- Login accepts a supported login/name, and email where supported, plus password; NFC login is a separate supported flow. Full stored names, including compound given names and surnames, are supported even when another account has a matching login/email (F07). Passwords retain the accepted minimum of four characters; the separate username-length compatibility question remains open (F08).
- Successful portal login establishes a Supabase session, chooses an eligible role destination and rotates previous/current login timestamps. Portal login does not itself mark attendance. Timestamp rotation is restored (F06); hosted acceptance remains unconfirmed.
- Logout clears the session. Expired/revoked sessions return to login with recovery feedback; hard reload restores a valid session. Legacy cross-domain cookies and return URLs require a documented cutover decision (Q02).
- Shared profile fields are login, first name, last name, email, phone, GitHub login, Scratch name and Xbox gamertag, subject to role permissions. External links appear only when handles exist. Role/account privileges are edited only through mentor maintenance.
- Password change requires the current password for one's own profile; Mentor reset and Parent reset for a linked Coder have separate authorized flows with password/confirmation and validation. Credentials never appear in profile responses.
- Photo and Avatar are separate slots with upload, independent delete and swap. Photo crop is circular, avatar crop square; output is square PNG up to 800×800. Contain mode preserves transparent padding. Legacy JPEG fallback remains supported. Upload/progress/errors and image refresh belong to the shared store/component flow.
- Save/Cancel, loading/empty/error states and stale-draft protection apply to editable sections. Remote changes must not overwrite an unsaved draft; conflicting saves request a reload.

Profile/account flows are present. Import credential handling and private database exposure remain F01/F20; Q06 validation and credential-policy differences are accepted intentional improvements; storage reconciliation remains V03.

## Coder portal

| Feature | Expected fields/actions and effects | Coverage |
| --- | --- | --- |
| Home | Welcome/name, team or unassigned guidance, previous login, attendance count, current Belt, short/long Goals, activity links and team roster; recent Achievement decisions and feedback with Mentor names since previous-login day | Present; F06 login history restored, hosted acceptance pending. |
| Profile and teammates | Own permitted profile/handles/images; team name/colour/image/Goal/roster; peer public details and earned Badges and Belts without private contacts/evidence | Present with server team checks. |
| Goals | Edit short-term and long-term text; add/remove dated Badge goals, view progress/current and next Belt | Present; Goal changes are guarded against stale state. |
| Badges | Earned, pending, rejected and available Badges; category/name/description, Goal status, Achievement application and decision dates/notes/Mentor; application evidence at least five trimmed characters; retry after rejection | Present; no duplicate pending application, preserve existing Goal metadata and recorded deleted-definition history. |
| Belts | Current/earned Belts and progression, descriptions, Achievement application/decision evidence and dates; next available Belt application and reapplication | Present; eligibility and pending state are validated. |
| Attendance | Own attendance dates and total attendance count | Present; F21 closed by accepted one-million-row configuration; date consistency F22 remains open. |
| Joinable pods | Active eligible non-Mentor-only pods, topic/host/date/expiry, safe join/fallback link and empty-state calendar | Present; joining records today's own Attendance once, checks current expiry/visibility/URL and opens only a validated destination. |
| Passport | Own name/login/photo or avatar/team/QR/current belt/category badge counts and print readiness | Present; physical print/old-scanner verification V01/V04. |

Badge and Belt history retains Achievement application evidence, decision feedback, and reviewer identities. Archived definitions remain readable when referenced by historical achievements but cannot receive new applications.

## Parent portal

- Parent home links to the Parent's profile, linked Coders and joinable pods. The linked-Coder list shows active Coders with name, images, current Belt and attendance count.
- Linked-Coder details expose authorized profile/team/roster, Goals, Badges, Belts, Attendance and linked-Parent contacts. Goal and Achievement decision views are read-only for Parents.
- Linked-Coder account editing includes birth year, login, GitHub/Scratch/Xbox handles; names, team assignment, registration and roles are not Parent edits. Password reset and photo/avatar management have separate authorized actions.
- Linked-Parent contacts show each Coder's linked Parents; relationships are changed by Mentors. Parent peer profiles are limited to current teams of linked Coders.
- Passport printing is limited to linked active Coders. When a Parent joins a pod, it marks the Parent's own Attendance rather than silently marking a linked Coder present.

These flows are present. Every operation involving a linked Coder must recheck the Parent relationship server-side. Older unrestricted APIs are still F04.

## Mentor portal

| Feature | Expected fields/actions | Coverage |
| --- | --- | --- |
| Home/review queues | Pending Belt and Badge Achievement applications, applicant names/photos, categories/definitions/evidence and navigation to review | Present; F21 closed by accepted one-million-row configuration. |
| Attendance | Selected dojo date/year, Coder/Mentor tabs, team/name/registration/Belt/photo/count/presence; search/sort/filter, totals, manual present/absent, QR/NFC, signup in selected date, random present Coder | Present; F03 API authorization is accepted unchanged for the third-party hardware kiosk; F05 atomic sign-in persistence is implemented and database-verified; manual welcome F23 remains. |
| Directories and signup | Coder, Parent and Mentor lists; search, reusable presence/photo/team/Belt; create profile/account/password, initial role, optional Attendance; Coder/Parent follow-up navigation | Present; selected-date signup preserved. |
| Account maintenance | First/last names, login, email/phone/handles, birth year, fingerprint/NFC, coder/parent/mentor roles, registration, team, mentor vetting, password reset | Present; privileges are current-server-checked and snapshot-guarded. Login/scanner conflicts are serialized; historical duplicates retained under accepted Q06 compatibility. |
| Relationships and skills | Search/select eligible Parent/Coder; link/unlink from both views, confirmation; Mentor skills add/remove | Present, narrow actions with current eligibility checks. |
| Goals | View/edit short/long Goals and progress, history of selected Badge goals | Present. |
| Achievement review | Achievement application evidence, approve/reject with notes, dates/reviewer identity, undo; reject decisions on a linked Coder's own application; permit any-current-Mentor undo with stale-state protection | Present; history and recorded deleted definitions preserved. |
| Account merge | Choose survivor and duplicate, review field choices and confirmation; transfer links, Mentor skills, Attendance, achievements; union roles/registration/vetting and archive duplicate; preserve survivor identity/credentials/images | Present for active duplicates; archived recovery/merge F16. |
| Definitions | Belt name/hex/order/description; badge achievement/category/description; category name/description/image; search/list/create/edit/archive with usage/confirmation | Present; new-belt defaults F18. |
| Teams | Name/colour/Goal/notes/logo; list/search/create/edit/archive, roster/Coder navigation and printing | Present, bounded images and stale-state checks. |
| Pods | Topic, HTTP(S) URL, primary and optional second active mentor, mentor-only flag; list/create/edit/archive/join; host names/photos and expiry | Present; create/save refreshes expiry by 150 minutes. Creation timestamp/pod migration Q03. |
| Reports | Mentor/Parent email CSV; recent Belt screen/CSV with since filter (default 24 months), dates/notes/Belt/presence and Coder navigation | Present; archived history F17 remains open; F21 closed by accepted one-million-row configuration. CSV uses safe quoting; preview search does not limit the export. |
| Printing | Selected/batch/registered coder passports, mentor skill cards, team cards and belt certificates; compact UUID QR, identities/belt/categories/skill labels and readiness | Present; authorized role scope and V01/V04 print/device verification. |
| Controlled maintenance | Inactive Coder/unlinked-Parent archive and registration reset, as detailed below | Implemented; F01 remains open; F02 legacy import is retained until production cutover by user decision. |

### Controlled data maintenance

**Inactive Coder and Parent accounts:** preview active Coders without the Mentor role whose latest Attendance is strictly earlier than the Dublin calendar date one year ago. Never-attended Coders use the legacy old-date fallback and are eligible. Archive eligible Parents without active linked Coders remaining after this operation; protect combined-role Coders who remain active and protect Mentors. Archived accounts retain relationships and history rather than being physically deleted.

**Term registration reset:** preview and clear Term registration for all registered Coders, including archived Coders. Preserve fields for Users without the Coder role and all unrelated fields.

Both actions require a current mentor, explicit confirmation of a preview revision, an atomic apply, stale-preview conflict handling, result counts, retry/error feedback and shared store/realtime invalidation. These are the completed maintenance functions, not a permission to run them during audits.

### Shared attendance kiosk

Expected credential, compact UUID QR, NFC and fingerprint sign-in records one Attendance entry per User/Dublin day and rotates login history atomically. Return User identity, actual Attendance count and structured localized welcome/Achievement decision feedback only after a successful write.

The kiosk must show a live team-grouped Attendance board with Mentor group, names/photos/colours and counts, including changes from other devices. Welcome includes previous login, team or unassigned guidance and recent Achievement decision details with category, feedback, Mentor and reapplication guidance; suppress a Badge rejection after reapplication. Use previous-login calendar-day boundaries, and today's boundary for first login.

F03 is accepted unchanged for the third-party hardware kiosk, with the known authorization vulnerability documented. F05 atomic sign-in is implemented and database-verified. F12 mentor logout and bounded kiosk cookie are implemented; hosted acceptance remains pending. Remaining functional gaps: F13–F15. Fingerprint testing currently suppresses attendance creation but still rotates login dates and simulates a count increment; this is not a fully read-only dry run. Define its supported contract before cutover.

## Data, consistency and user feedback

- Combined User identities preserve legacy UUIDs, roles, contacts, logins, Term registration, Goals and reviewer/Parent/host relationships. Attendance for Users with and without the Coder role shares User/date records; Mentor skills share User/category links.
- Dojo-date Sessions and joinable session pods are separate concepts. Preserve approved pod creation/expiry/host/URL history under Q03.
- Keep historical Achievement application and decision dates, feedback, and reviewer details. Soft archival must preserve history; historical reports and duplicate recovery remain F16/F17.
- Database mutations enforce actor authorization, allowed fields, eligibility, uniqueness and concurrency. Sensitive table access/realtime must obey the same role boundaries. F01 broad grants are removed by the applied migration; end-to-end hosted app acceptance remains pending.
- F21 is closed by user-accepted configuration mitigation: the user reports setting Data API Max rows to **1,000,000**. Unpaged reads are unchanged; this is not an unlimited-result guarantee or independently verified load test. Retain existing paging and revisit if results approach the cap or response reliability fails. See the [closure note](../openspec/changes/replicate-legacy-features/final-parity-discrepancies.md#f21-closure-note--12-october-2026). Dates must use UTC instants and Dublin attendance days consistently (F22). Display dates in the user's locale.
- APIs return explicit failures; success is not inferred from swallowed database errors (F05). Components use stores for API access/cache invalidation/realtime; unsaved drafts survive remote changes and require reload on conflicts.
- Shared action feedback uses the centralized notification bus/presenter for save/create/delete and errors. Persistent Achievement decision and welcome information remains visible in contextual UI rather than disappearing into a toast. Existing locales are English, French, Irish and Ukrainian; kiosk service text still needs localization under F14.
- Migration must preserve Unicode, record identity and approved timestamps; remove fixed test credentials and reconcile all fields/relationships (F19/F20/V02). F02 is explicitly deferred: keep the legacy import and old database unchanged until production cutover, then remove legacy routes/dependencies and decommission the old database after final reconciliation and recovery-backup checks.

## Differences requiring explicit decisions

Raw scaffold CRUD, hard deletes, arbitrary Achievement history corrections, legacy routes/cross-domain cookies/external consumers, full pod creation timestamps, the unused Dojos table, public Sessions and stricter historical validation are tracked by Q01–Q06; Q06 stricter validation, current hashing/normalization and new-write conflict checks are accepted intentional improvements, while Q01–Q05 remain open decisions. Responsive layouts, entity-specific safe image editing, role-safe peer/print access and guarded mutation flows are the new design direction; obsolete or unsafe endpoints are not app requirements merely because legacy code contained them.

No feature or discrepancy is closed by writing this document. App-wide completion requires the [open findings and decisions](../openspec/changes/replicate-legacy-features/final-parity-discrepancies.md) plus legacy/new runtime, migration, storage/realtime and external-consumer verification V01–V04.

F04 legacy User/belt directories and Attendance read routes are Mentor-only in develop after PR #57. Own-profile Belt display uses the scoped Coder achievement API (or guarded Mentor history for Mentor viewers); linked-Coder/peer screens retain their scoped APIs. F03 hardware kiosk APIs are unchanged. Hosted deployment/acceptance remains pending.

Attendance sign-in commits daily Attendance and login-date rotation atomically, preserves concurrent account edits and returns the current committed User record/count. Repeat scans retain one daily Attendance entry. Fingerprint testing preserves its existing simulated count and persisted login-date rotation; it is not a read-only dry run.

F06 portal history is restored: successful password/NFC Portal logins rotate current/previous login dates after session creation without creating Attendance. Completion rechecks the active bound account and credential, preserves unrelated fields and returns the current User record. Failed credentials/session/history writes do not return successful login. Database migration/rollback checks are complete; hosted portal acceptance remains unconfirmed.

F12 shared sign-in now uses /mentor/SignIn only to start the bounded kiosk session and sign the mentor out, then replaces navigation with /kiosk/sign-in. The kiosk-only cookie expires at Dublin midnight or after 12 hours, whichever is sooner; it cannot authorize management. Returning to management requires fresh authentication. Password/QR/NFC attendance and scoped photo/belt/team welcome data remain available; the live board is separately tracked as F13. The hardware API contracts and beta member-subdomain redirect remain unchanged.
