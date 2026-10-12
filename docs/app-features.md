# Expected app features

Updated 12 October 2026 against commit `0a76125dcee12530c26baf87879219eb725db45a` and the live database metadata audit.

CoderDojo Ennis provides public information plus authenticated coder, parent and mentor portals. The public site currently uses static HTML; the member app uses Nuxt 4, Nuxt UI 4, shared components/stores, Supabase authentication, Postgres and storage.

This document describes the expected product behavior and current implementation coverage. **Present** means a counterpart exists in source; it does not certify deployed parity. **Gap** links to a confirmed discrepancy. **Decision** identifies behavior awaiting an explicit compatibility/product decision. The [final discrepancy list](../openspec/changes/replicate-legacy-features/final-parity-discrepancies.md) and [field/action coverage ledger](../openspec/changes/replicate-legacy-features/final-parity-coverage.md) qualify the statuses. The [master checklist](../openspec/changes/replicate-legacy-features/tasks.md) retains earlier implementation history.

## Roles and access

| Role | Expected access |
| --- | --- |
| Visitor | Public dojo information and an explicitly public GitHub/definition projection; no member credentials, contact directory, private applications or individual attendance. Public session details are a pending scope decision (Q05). |
| Coder / Ninja | Own account, goals, achievements, attendance, passport and eligible session joining; safe public profiles for current teammates. |
| Parent | Own profile and session attendance; only active linked children and safe teammate profiles within those children's teams; permitted child account/password/image changes, read-only goals and achievement decisions. |
| Mentor | Attendance administration, directories/signup, account roles and relationships, skills/goals, award review, definitions, teams, pods, reports, printing, merge and controlled maintenance. |
| Shared kiosk / scanner | A bounded sign-in authority that cannot recover mentor management privileges; supported credential/QR/NFC/fingerprint inputs and a scoped live attendance board. Current lifecycle is incomplete (F03/F12/F13). |

Accounts can hold multiple roles. Identity and privileges must be checked against the current database account on the server; menu visibility and editable auth metadata are presentation hints. Archived accounts must not gain access or sign in. A parent link must be checked for every child request. Mentors must not approve/reject their own child's award applications; any mentor may undo decisions under the implemented policy, with current role and stale-state checks.

Expected boundaries must also hold for direct APIs, database REST and realtime. Current older routes and broad database grants do not yet meet this expectation (F01–F04).

All images are public to download, including member photos/avatars and team/category images. Public downloads do not authorize uploads, deletions or private member-data access. The [full data-access proposal](../openspec/changes/secure-role-based-data-access/proposal.md) and [per-table/field matrix](../openspec/changes/secure-role-based-data-access/policy-matrix.md) specify full mentor administration, own-profile editing, image mutation authority and rollout checks. These rules are proposed; the current security gaps remain open.

## Public site and integrations

| Feature | Expected fields/actions | Current status |
| --- | --- | --- |
| Public information | Home/about, joining, when/where, topics, news, contact/privacy, sponsor/media/tutorial content and links | Present as `/home.html` and static fragments; external content/destination freshness needs Q05/V04. Root redirects to the static page. |
| Member/volunteer GitHub directory | Separate `Members` and `Mentors` lists containing first name, last name and GitHub login; active accounts only, nonempty handles, stable name ordering and GitHub page/avatar links | Gap F09: proxy rejects the object contract used by the public page and relies on legacy hosting. |
| Chatbot definition exports | Badge compact ID/achievement/description/category; belt compact ID/name/hex/order/description, stable category/order sorting | Gap F10; compatibility or retirement decision required. |
| NFC utilities | Supported ReadNFC/WriteNFC downloads, installation/use instructions and an entry point | Gap F11; legacy downloads absent. |
| Legacy URLs/devices/external services | Supported bookmarks/print links/scanner payloads/session links and known WebHub/chat consumers | Decision Q02; enumerate consumers and implement compatibility or communicate retirement. |
| Public sessions | Explicitly approved publishable topic/date/host fields, listing/calendar, without mentor-only/private join authority | Decision Q05; authenticated session pages exist, public projection does not. |

Public GitHub disclosure is deliberately narrower than the internal member model. It must not become a general member-directory API.

## Authentication and profile

- Login accepts a supported login/name, and email where supported, plus password; NFC login is a separate supported flow. Full stored names, including compound names, and imported credential lengths need compatibility fixes (F07/F08).
- Successful portal login establishes a Supabase session, chooses an eligible role destination and rotates previous/current login timestamps. Portal login does not itself mark attendance. Timestamp rotation is currently missing (F06).
- Logout clears the session. Expired/revoked sessions return to login with recovery feedback; hard reload restores a valid session. Legacy cross-domain cookies and return URLs require a documented cutover decision (Q02).
- Shared profile fields are login, first name, last name, email, phone, GitHub login, Scratch name and Xbox gamertag, subject to role permissions. External links appear only when handles exist. Role/account privileges are edited only through mentor maintenance.
- Password change requires the current password for one's own profile; mentor reset and linked-child parent reset have separate authorized flows with password/confirmation and validation. Credentials never appear in profile responses.
- Photo and Avatar are separate slots with upload, independent delete and swap. Photo crop is circular, avatar crop square; output is square PNG up to 800×800. Contain mode preserves transparent padding. Legacy JPEG fallback remains supported. Upload/progress/errors and image refresh belong to the shared store/component flow.
- Save/Cancel, loading/empty/error states and stale-draft protection apply to editable sections. Remote changes must not overwrite an unsaved draft; conflicting saves request a reload.

Profile/account flows are present. Import credential handling and private database exposure remain F01/F20; Q06 validation and credential-policy differences are accepted intentional improvements; storage reconciliation remains V03.

## Coder portal

| Feature | Expected fields/actions and effects | Coverage |
| --- | --- | --- |
| Home | Welcome/name, team or unassigned guidance, previous login, session count, current belt, short/long goals, activity links and team roster; recent awards/rejections with notes and mentor names since previous-login day | Present; depends on F06 login-history fix. |
| Profile and teammates | Own permitted profile/handles/images; team name/colour/image/goal/roster; peer public details and earned awards without private contacts/evidence | Present with server team checks. |
| Goals | Edit short-term and long-term text; add/remove dated badge goals, view progress/current and next belt | Present; goal changes are guarded against stale state. |
| Badges | Earned, pending, rejected and available badges; category/name/description, goal status, application and decision dates/notes/mentor; application evidence at least five trimmed characters; retry after rejection | Present; no duplicate pending application, preserve existing goal metadata and recorded deleted-definition history. |
| Belts | Current/earned belts and progression, descriptions, application/decision evidence and dates; next eligible belt application and reapplication | Present; server validates eligibility and pending state. |
| Attendance | Own dates and total session count | Present; F21 closed by accepted one-million-row configuration; date consistency F22 remains open. |
| Sessions | Active eligible non-mentor-only pods, topic/host/date/expiry, safe join/fallback link and empty-state calendar | Present; joining records today's own attendance once, checks current expiry/visibility/URL and opens only a validated destination. |
| Passport | Own name/login/photo or avatar/team/QR/current belt/category badge counts and print readiness | Present; physical print/old-scanner verification V01/V04. |

Badge and belt history retains application notes, award/rejection notes and reviewer identities. Archived definitions remain readable when referenced by historical awards but cannot receive new applications.

## Parent portal

- Parent home links to own profile, linked children and sessions. Children list shows active linked coders with name, images, current belt and attendance count.
- Child detail exposes authorized profile/team/roster, goals, badges, belts, attendance and linked-parent contacts. Goal and achievement decision views are read-only for parents.
- Child account editing includes birth year, login, GitHub/Scratch/Xbox handles; names, team assignment, registration and roles are not parent edits. Password reset and photo/avatar management have separate authorized actions.
- Child parents view displays linked-parent contacts; relationships are changed by mentors. Parent peer profiles are limited to current teams of linked children.
- Passport printing is limited to linked active children. Parent session joining marks the parent's own attendance, rather than silently marking a child present.

These flows are present. Every linked-child operation must recheck the relationship server-side. Older unrestricted APIs are still F04.

## Mentor portal

| Feature | Expected fields/actions | Coverage |
| --- | --- | --- |
| Home/review queues | Pending belt and badge applications, applicant names/photos, categories/definitions/evidence and navigation to review | Present; F21 closed by accepted one-million-row configuration. |
| Attendance | Selected session/year/date, coder/mentor tabs, team/name/registration/belt/photo/count/presence; search/sort/filter, totals, manual present/absent, QR/NFC, signup in selected date, random present coder | Present; authorization/atomic persistence F03/F05 and manual welcome F23 remain. |
| Directories and signup | Coder, parent and mentor lists; search, reusable presence/photo/team/belt; create profile/account/password, initial role, optional attendance; child/parent follow-up navigation | Present; selected-date signup preserved. |
| Account maintenance | First/last names, login, email/phone/handles, birth year, fingerprint/NFC, coder/parent/mentor roles, registration, team, mentor vetting, password reset | Present; privileges are current-server-checked and snapshot-guarded. Login/scanner conflicts are serialized; historical duplicates retained under accepted Q06 compatibility. |
| Relationships and skills | Search/select eligible parent/child; link/unlink from both views, confirmation; mentor category skills add/remove | Present, narrow actions with current eligibility checks. |
| Goals | View/edit short/long goals and progress, history of selected badge goals | Present. |
| Achievement review | Application evidence, approve/reject with notes, dates/reviewer identity, undo; reject linked-own-child decision actions; permit any-current-mentor undo with stale-state protection | Present; history and recorded deleted definitions preserved. |
| Account merge | Choose survivor and duplicate, review field choices and confirmation; transfer links, skills, attendance, achievements; union roles/registration/vetting and archive duplicate; preserve survivor identity/credentials/images | Present for active duplicates; archived recovery/merge F16. |
| Definitions | Belt name/hex/order/description; badge achievement/category/description; category name/description/image; search/list/create/edit/archive with usage/confirmation | Present; new-belt defaults F18. |
| Teams | Name/colour/goal/notes/logo; list/search/create/edit/archive, roster/member navigation and printing | Present, bounded images and stale-state checks. |
| Pods | Topic, HTTP(S) URL, primary and optional second active mentor, mentor-only flag; list/create/edit/archive/join; host names/photos and expiry | Present; create/save refreshes expiry by 150 minutes. Creation timestamp/pod migration Q03. |
| Reports | Mentor/parent email CSV; recent belt screen/CSV with since filter (default 24 months), dates/notes/belt/presence and member navigation | Present; archived history F17 remains open; F21 closed by accepted one-million-row configuration. CSV uses safe quoting; preview search does not limit the export. |
| Printing | Selected/batch/registered coder passports, mentor skill cards, team cards and belt certificates; compact UUID QR, identities/belt/categories/skill labels and readiness | Present; authorized role scope and V01/V04 print/device verification. |
| Controlled maintenance | Inactive coder/orphan-parent archive and registration reset, as detailed below | Implemented; F01 remains open; F02 legacy import is retained until production cutover by user decision. |

### Controlled data maintenance

**Inactive members:** preview active coders without mentor role whose latest attendance is strictly earlier than the Dublin calendar date one year ago. Never-attended coders use the legacy old-date fallback and are eligible. Archive eligible non-mentor parents with no active children remaining after this operation; protect combined-role coders who remain active and protect mentors. Archive flags retain relationships/history rather than physically deleting them.

**Term registration reset:** preview and clear registration for all registered coders, including archived coders. Preserve adult-only and unrelated fields.

Both actions require a current mentor, explicit confirmation of a preview revision, an atomic apply, stale-preview conflict handling, result counts, retry/error feedback and shared store/realtime invalidation. These are the completed maintenance functions, not a permission to run them during audits.

### Shared attendance kiosk

Expected credential, compact UUID QR, NFC and fingerprint sign-in records one attendance row per account/Dublin day and rotates login history atomically. Return identity, actual session count and structured localized welcome/decision feedback only after a successful write.

The kiosk must show a live team-grouped attendance board with mentor group, names/photos/colours and counts, including changes from other devices. Welcome includes previous login, team or unassigned guidance and recent award/rejection detail with category, notes, mentor and reapplication guidance; suppress badge rejection after reapplication. Use previous-login calendar-day boundaries, and today's boundary for first login.

Current gaps: F03/F05/F12–F15. Fingerprint testing currently suppresses attendance creation but still rotates login dates and simulates a count increment; this is not a fully read-only dry run. Define its supported contract before cutover.

## Data, consistency and user feedback

- Combined member identities preserve legacy UUIDs, roles, contacts, logins, registration, goals and reviewer/parent/host relationships. Adult and coder attendance share member/date records; mentor skills share member/category links.
- Attendance-date `sessions` and joinable `session_pods` are separate concepts. Preserve approved pod creation/expiry/host/URL history under Q03.
- Keep historical application, goal, award and rejection dates/notes/reviewer fields. Soft archival must preserve history; historical reports and duplicate recovery remain F16/F17.
- Database mutations enforce actor authorization, allowed fields, eligibility, uniqueness and concurrency. Sensitive table access/realtime must obey the same role boundaries. Broad current grants remain F01.
- F21 is closed by user-accepted configuration mitigation: the user reports setting Data API Max rows to **1,000,000**. Unpaged reads are unchanged; this is not an unlimited-result guarantee or independently verified load test. Retain existing paging and revisit if results approach the cap or response reliability fails. See the [closure note](../openspec/changes/replicate-legacy-features/final-parity-discrepancies.md#f21-closure-note--12-october-2026). Dates must use UTC instants and Dublin attendance days consistently (F22). Display dates in the user's locale.
- APIs return explicit failures; success is not inferred from swallowed database errors (F05). Components use stores for API access/cache invalidation/realtime; unsaved drafts survive remote changes and require reload on conflicts.
- Shared action feedback uses the centralized notification bus/presenter for save/create/delete and errors. Persistent award/rejection/welcome information remains visible in contextual UI rather than disappearing into a toast. Existing locales are English, French, Irish and Ukrainian; kiosk service text still needs localization under F14.
- Migration must preserve Unicode, record identity and approved timestamps; remove fixed test credentials and reconcile all fields/relationships (F19/F20/V02). F02 is explicitly deferred: keep the legacy import and old database unchanged until production cutover, then remove legacy routes/dependencies and decommission the old database after final reconciliation and recovery-backup checks.

## Differences requiring explicit decisions

Raw scaffold CRUD, hard deletes, arbitrary award corrections, legacy routes/cross-domain cookies/external consumers, full pod creation timestamps, the unused Dojos table, public sessions and stricter historical validation are tracked by Q01–Q06; Q06 stricter validation, current hashing/normalization and new-write conflict checks are accepted intentional improvements, while Q01–Q05 remain open decisions. Responsive layouts, entity-specific safe image editing, role-safe peer/print access and guarded mutation flows are the new design direction; obsolete or unsafe endpoints are not app requirements merely because legacy code contained them.

No feature or discrepancy is closed by writing this document. App-wide completion requires the [open findings and decisions](../openspec/changes/replicate-legacy-features/final-parity-discrepancies.md) plus legacy/new runtime, migration, storage/realtime and external-consumer verification V01–V04.
