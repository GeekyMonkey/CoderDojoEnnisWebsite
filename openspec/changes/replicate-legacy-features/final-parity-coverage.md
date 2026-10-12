# Final parity coverage ledger — 12 October 2026

Read with [the discrepancy list](final-parity-discrepancies.md) and [expected features](../../../docs/app-features.md). Baseline commit: `0a76125dcee12530c26baf87879219eb725db45a`.

F21 references below describe the original completeness concern. It is now [closed by user-accepted configuration mitigation](final-parity-discrepancies.md#f21-closure-note--12-october-2026): the user reports a Data API Max rows setting of **1,000,000**; unpaged query code is unchanged.

## What this ledger establishes

All 112 checked-in Razor templates, 28 controller files (280 declared methods including helpers/lifecycle/disposal), 14 SSDL tables and 100 legacy columns are inventoried. Every current API route file is also inventoried. Fields below include editable, hidden and computed model references; control IDs are preserved in the JSON inventory. Commented-out actions are excluded. Generic CRUD overloads and helper methods are included, not counted as separate user features. Vendor libraries are excluded; application scripts, hubs, route config and models were inspected.

A mapped counterpart means source exists for the feature, not that every behavior is equivalent. Findings and decision IDs qualify the mapping. Templates from old scaffolds can be stale; they are not evidence that those screens successfully ran. This is a source and live-schema sweep, not a visual test of a running legacy deployment or a row-level data reconciliation.

## Workflow, fields, actions and side effects

| Legacy workflow | Current counterpart / fields and actions accounted for | Status and side effects |
| --- | --- | --- |
| Home login/logout | Auth login/NFC, logout, role landing and session recovery; username/password, errors | F06–F08: history rotation, compound names and credential length; Q02/Q06: return URL/cookie/hash compatibility |
| SignIn / SignInQR / fingerprint | Mentor SignIn, QR reader, NFC toggle, attendance API/service; member identity/name/count, photo/avatar, belt/team, speech/notifications | F03/F05/F12–F15; identifier contracts, actual attendance/date/login mutations, archived lookup, failure responses, role-safe kiosk and live board remain qualified |
| Mentor attendance/random | Selected date, team and mentor groups, search/sort/presence controls, total/member counts, registration/belt/photo; random present coder, QR/NFC, signup and selected-date context | Present; writes remain F03/F05, full reads F04/F21, dates F22; realtime store refresh replaces SignalR |
| Mentor directory/signup/detail | Members/parents/mentors; profile and account sections, roles, birth year, registration, team, fingerprint/NFC, vetting, password confirmation, attendance-on-create | Present; separate sections replace one big save form; narrow guarded RPCs prevent stale saves and privilege escalation |
| Parent-child linking and mentor skills | Search/select, create/remove relationship from either direction, skill category add/remove | Present; requires current mentor and eligible active records; relation races guarded |
| Adult/member merge | Survivor and duplicate selection, field choices, confirmation; role/registration/vetting union, relation/skill/attendance/history transfer and duplicate archival | Present; F16 archived selection. Soft archive and survivor credentials/images preserved deliberately rather than legacy hard deletion |
| Mentor goals/reviews | Short/long goals, belt progress, badge goal date; application notes/date, awarded/rejected dates, mentor IDs/names, notes, approve/reject/undo | Present; self-child decision block and any-mentor undo policy retained; stale decision guards, date parsing F22 and queue completeness F21 |
| Definitions | Belt name/hex/order/description; badge achievement/category/description; category name/description/image; list/search/create/edit/delete confirmation | Present, soft deletion preserves recorded history; F18 defaults; F21 complete joins; historical unavailable definitions labelled |
| Teams | Name/hex/goal/notes/image, search/create/edit/delete, roster/member navigation, ID/team-card printing | Present; archives rather than cascades roster deletion; images have bounded PNG processing and revisions |
| Pods | Topic/URL/primary and optional second mentor/mentor-only; create/edit/delete/list/join; host names/photos, expiry and empty calendar | Present; save refreshes expiry 150 minutes; joining records only actor attendance and validates URL/expiry/visibility; Q03 creation timestamp/import and Q05 public surface |
| Reports | Mentor/parent email CSV; recent belts since default 24 months, name/registration/photo/presence/belt/date/notes, CSV download | Present; safe quoted CSV, F17 archived recipients and F21 complete results |
| Data cleanup and term reset | Separate mentor preview/confirm/apply pages, candidate counts and result feedback | Present; legacy inactivity/never-attended cleanup and orphan-parent rules mapped to combined roles; protect mentors/remaining relationships; registration reset includes archived coders; stale preview and atomic server action |
| Coder home/profile/team | Welcome/name/team/unassigned/previous login/session count/current belt; recent awards/rejections; profile/handles/login, short/long goals, team goal/roster/public peer profile; separate photo/avatar | Present, portal history side effect F06; authorized peer projection; F14 concerns kiosk not this home |
| Coder achievements/goals | Badge category/description/state, goal toggle, dated applications/evidence and decisions, available badges, current/next belt and reapplication | Present; active definitions for new applications, preserve history for deleted definitions; structured feedback avoids raw HTML |
| Parent own account/children | Own contact/profile/password; linked active child names/photo/belt/count, account birth year/login/handles/password, separate images, child goals/history/attendance/parents/team/passport | Present; link authorization server-side, view-only child decisions/goals, Q06 historical constraints. Old documentation saying parent cannot edit login is inaccurate |
| Passport / certificate / team-card printing | Own coder card, linked-child card, mentor selected/batch cards, registered coders, team cards and belt certificates; names/login/team/QR/category badge counts/mentor skills/belt/date | Present; compact UUID QR payload, authenticated access, ready/print states; Q02 old URLs; V01 print layout and physical scanner validation |
| Public content / GitHub / chatbot / tools | Static public homepage/info/contact/join/privacy/topics/news/tutorials; current GitHub proxy; no chatbot-compatible exports/tools downloads | F09–F11; Q02/Q05 external routes and public session expectation |
| Raw MVC/API CRUD | Normal member/team/definition/link/attendance/review tasks have role-specific replacements | Q01 retirement/correction decision; unsafe raw credential editing and arbitrary hard deletes are not automatic requirements |
| Shared layout/mobile/scripts/hubs | Responsive Nuxt layouts, role navigation, loading/errors/drafts, stores/realtime invalidation, centralized action feedback | Browser override retired (Q04); F01 realtime exposure, F13 board and V03 cross-device visibility |

## Every legacy database column

The mapping accounts for storage, identity and effects, including fields never shown in a normal form. Live target types/defaults/nullability/constraints are recorded in [the metadata snapshot](final-parity-database-snapshot.json). A target column is not proof that source values were migrated. V02 covers that verification.

| Legacy table.field | Target | Use / qualification |
| --- | --- | --- |
| AdultAttendance.Id | member_attendances.id | UUID preserved for identity/links/compact QR; V02 collision/reconciliation check. |
| AdultAttendance.AdultId | member_attendances.member_id | Stored field; see workflow above. |
| AdultAttendance.Date | member_attendances.date | Dublin attendance calendar day; legacy member datetime reduced to date, F22/V02. |
| AdultBadgeCategory.Id | member_badge_categories.id | UUID preserved for identity/links/compact QR; V02 collision/reconciliation check. |
| AdultBadgeCategory.AdultId | member_badge_categories.member_id | Stored field; see workflow above. |
| AdultBadgeCategory.BadgeCategoryId | member_badge_categories.badge_category_id | Stored field; see workflow above. |
| Adults.Id | members.id | UUID preserved for identity/links/compact QR; V02 collision/reconciliation check. |
| Adults.FirstName | members.name_first | Profile/account field; F07/F08 credentials and F19 import Unicode. |
| Adults.LastName | members.name_last | Profile/account field; F07/F08 credentials and F19 import Unicode. |
| Adults.IsParent | members.is_parent | Stored field; see workflow above. |
| Adults.IsMentor | members.is_mentor | Stored field; see workflow above. |
| Adults.Email | members.email | Profile/account field; F07/F08 credentials and F19 import Unicode. |
| Adults.Phone | members.phone | Stored field; see workflow above. |
| Adults.Login | members.login | Profile/account field; F07/F08 credentials and F19 import Unicode. |
| Adults.PasswordHash | members.password_hash | Private credential; omitted from public models and legacy converter. F01/F20/Q06 migration/access policy. |
| Adults.GithubLogin | members.github_login | Stored field; see workflow above. |
| Adults.XboxGamertag | members.xbox_gamertag | Stored field; see workflow above. |
| Adults.Deleted | members.deleted | Soft archive/history visibility; F16/F17 and role-specific eligibility. |
| Adults.ScratchName | members.scratch_name | Stored field; see workflow above. |
| Adults.GardaVetted | members.garda_vetted | Stored field; see workflow above. |
| Adults.LoginDate | members.login_date | Welcome/decision boundaries; F06 portal rotation and F22 UTC convention. |
| Adults.LoginDatePrevious | members.login_date_previous | Welcome/decision boundaries; F06 portal rotation and F22 UTC convention. |
| Adults.FingerprintId | members.fingerprint_id | Mentor account/scanner identity; F03 active check, Q06 duplicates, V04 device contracts. |
| BadgeCategories.Id | badge_categories.id | UUID preserved for identity/links/compact QR; V02 collision/reconciliation check. |
| BadgeCategories.CategoryName | badge_categories.category_name | Stored field; see workflow above. |
| BadgeCategories.CategoryDescription | badge_categories.category_description | Stored field; see workflow above. |
| BadgeCategories.Deleted | badge_categories.deleted | Soft archive/history visibility; F16/F17 and role-specific eligibility. |
| Badges.Id | badges.id | UUID preserved for identity/links/compact QR; V02 collision/reconciliation check. |
| Badges.Achievement | badges.achievement | Stored field; see workflow above. |
| Badges.BadgeCategoryId | badges.badge_category_id | Stored field; see workflow above. |
| Badges.Deleted | badges.deleted | Soft archive/history visibility; F16/F17 and role-specific eligibility. |
| Badges.Description | badges.description | Stored field; see workflow above. |
| Belts.Id | belts.id | UUID preserved for identity/links/compact QR; V02 collision/reconciliation check. |
| Belts.Color | belts.color | Stored field; see workflow above. |
| Belts.Description | belts.description | Stored field; see workflow above. |
| Belts.HexCode | belts.hex_code | Stored field; see workflow above. |
| Belts.SortOrder | belts.sort_order | Stored field; see workflow above. |
| Belts.Deleted | belts.deleted | Soft archive/history visibility; F16/F17 and role-specific eligibility. |
| Dojos.Id | No target | UUID preserved for identity/links/compact QR; V02 collision/reconciliation check. |
| Dojos.DojoName | No target | No active consumer found; Q04 retirement/data retention decision. |
| MemberAttendance.Id | member_attendances.id | UUID preserved for identity/links/compact QR; V02 collision/reconciliation check. |
| MemberAttendance.MemberId | member_attendances.member_id | Stored field; see workflow above. |
| MemberAttendance.Date | member_attendances.date | Dublin attendance calendar day; legacy member datetime reduced to date, F22/V02. |
| MemberBadges.Id | member_badges.id | UUID preserved for identity/links/compact QR; V02 collision/reconciliation check. |
| MemberBadges.MemberId | member_badges.member_id | Stored field; see workflow above. |
| MemberBadges.BadgeId | member_badges.badge_id | Stored field; see workflow above. |
| MemberBadges.Awarded | member_badges.awarded | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBadges.AwardedByAdultId | member_badges.awarded_by_adult_id | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBadges.ApplicationNotes | member_badges.application_notes | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBadges.ApplicationDate | member_badges.application_date | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBadges.RejectedByAdultId | member_badges.rejected_by_adult_id | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBadges.RejectedNotes | member_badges.rejected_notes | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBadges.RejectedDate | member_badges.rejected_date | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBadges.AwardedNotes | member_badges.awarded_notes | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBadges.GoalDate | member_badges.goal_date | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBelts.Id | member_belts.id | UUID preserved for identity/links/compact QR; V02 collision/reconciliation check. |
| MemberBelts.MemberId | member_belts.member_id | Stored field; see workflow above. |
| MemberBelts.BeltId | member_belts.belt_id | Stored field; see workflow above. |
| MemberBelts.AwardedByAdultId | member_belts.awarded_by_adult_id | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBelts.ApplicationNotes | member_belts.application_notes | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBelts.AwardedNotes | member_belts.awarded_notes | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBelts.RejectedByAdultId | member_belts.rejected_by_adult_id | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBelts.RejectedNotes | member_belts.rejected_notes | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBelts.ApplicationDate | member_belts.application_date | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBelts.Awarded | member_belts.awarded | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberBelts.RejectedDate | member_belts.rejected_date | Achievement evidence/review or badge goal; F14/F15 welcome, F21/F22 completeness/dates. |
| MemberParent.Id | member_parents.id | UUID preserved for identity/links/compact QR; V02 collision/reconciliation check. |
| MemberParent.MemberId | member_parents.member_id | Stored field; see workflow above. |
| MemberParent.AdultId | member_parents.parent_id | Stored field; see workflow above. |
| Members.Id | members.id | UUID preserved for identity/links/compact QR; V02 collision/reconciliation check. |
| Members.FirstName | members.name_first | Profile/account field; F07/F08 credentials and F19 import Unicode. |
| Members.LastName | members.name_last | Profile/account field; F07/F08 credentials and F19 import Unicode. |
| Members.BirthYear | members.birth_year | Stored field; see workflow above. |
| Members.ScratchName | members.scratch_name | Stored field; see workflow above. |
| Members.XboxGamertag | members.xbox_gamertag | Stored field; see workflow above. |
| Members.Login | members.login | Profile/account field; F07/F08 credentials and F19 import Unicode. |
| Members.PasswordHash | members.password_hash | Private credential; omitted from public models and legacy converter. F01/F20/Q06 migration/access policy. |
| Members.GithubLogin | members.github_login | Stored field; see workflow above. |
| Members.Deleted | members.deleted | Soft archive/history visibility; F16/F17 and role-specific eligibility. |
| Members.LoginDate | members.login_date | Welcome/decision boundaries; F06 portal rotation and F22 UTC convention. |
| Members.LoginDatePrevious | members.login_date_previous | Welcome/decision boundaries; F06 portal rotation and F22 UTC convention. |
| Members.TeamId | members.team_id | Stored field; see workflow above. |
| Members.FingerprintId | members.fingerprint_id | Mentor account/scanner identity; F03 active check, Q06 duplicates, V04 device contracts. |
| Members.RegisteredCurrentTerm | members.registered_current_term | Stored field; see workflow above. |
| Members.GoalShortTerm | members.goal_short_term | Stored field; see workflow above. |
| Members.GoalLongTerm | members.goal_long_term | Stored field; see workflow above. |
| Sessions.Id | session_pods.id | UUID preserved for identity/links/compact QR; V02 collision/reconciliation check. |
| Sessions.CreatedDate | session_pods.session_date | Pod field counterpart; Q03 import and creation-instant retention decision. |
| Sessions.EndDate | session_pods.ends_at | Pod field counterpart; Q03 import and creation-instant retention decision. |
| Sessions.Url | session_pods.url | Pod field counterpart; Q03 import and creation-instant retention decision. |
| Sessions.Topic | session_pods.topic | Pod field counterpart; Q03 import and creation-instant retention decision. |
| Sessions.AdultId | session_pods.host_id | Pod field counterpart; Q03 import and creation-instant retention decision. |
| Sessions.Adult2Id | session_pods.host2_id | Pod field counterpart; Q03 import and creation-instant retention decision. |
| Sessions.MentorsOnly | session_pods.mentors_only | Pod field counterpart; Q03 import and creation-instant retention decision. |
| Teams.Id | teams.id | UUID preserved for identity/links/compact QR; V02 collision/reconciliation check. |
| Teams.TeamName | teams.team_name | Stored field; see workflow above. |
| Teams.HexCode | teams.hexcode | Stored field; see workflow above. |
| Teams.Deleted | teams.deleted | Soft archive/history visibility; F16/F17 and role-specific eligibility. |
| Teams.Goal | teams.goal | Stored field; see workflow above. |
| Teams.Notes | teams.notes | Stored field; see workflow above. |

### Additional current fields and structural changes

- Adults and coders share `members`: `is_ninja` identifies coders; adult role flags are preserved. Adult and coder attendance and adult skill categories share their respective member tables. All adult reviewer/parent/host references now point to members. IDs must remain collision-free across merged entity classes (V02).
- Added fields: member email/phone for coders, birth year/team/goals/registration for combined accounts, `nfc_tag`, `has_photo`, `has_avatar`; team/category `has_image` and `image_revision`; pod `deleted`. UI editability depends on role; server snapshots enforce allowed changes.
- `sessions` is the distinct attendance-date catalog with a unique date; `session_pods` is URL/host/expiry-based session management. Legacy Sessions maps to pods, not the attendance-date catalog (Q03).
- Legacy image URLs were computed Azure JPEG names; current entity storage is external to the database. Separate photo/avatar PNG processing, legacy JPEG fallback, team/category images and revision invalidation are mapped; object equality/permissions still require V03.
- Live FKs cascade child attendance/awards/links on physical member deletion, set reviewer/host/team references null where configured and cascade skill links on definition deletion. App archival avoids these destructive paths, but F01/F02 expose bypasses.
- Live attendance has unique `(member_id,date)`; nullable foreign keys and historical duplicates elsewhere remain possible. Controlled RPCs validate roles and links, serialize writes and compare stale snapshots; direct table grants bypass these protections (F01).
- All 17 live coderdojo functions and their definitions/grants are in the metadata snapshot. Mutation functions are SECURITY INVOKER with empty search path and service-only EXECUTE; the authenticated mentor-pod read helper is SECURITY DEFINER with empty search path. Older attendance-stat functions retain public execution. The trigger inventory is retained in the snapshot.

## Every legacy controller method

Methods include overloaded actions, helpers and lifecycle/disposal. Names and exact signatures are also in [the source inventory](final-parity-source-inventory.json). Mapping by family identifies the current entry point; the workflow/field tables above specify effects and exceptions.

| Controller | Methods | Current accounting |
| --- | --- | --- |
| src_legacy/Controllers/Api/AdultAttendanceController.cs | GetAdultAttendances, GetAdultAttendance, PutAdultAttendance, PostAdultAttendance, DeleteAdultAttendance, Dispose | Role-specific data APIs replace business workflows; generic HTTP CRUD compatibility Q01/Q02. Dispose is framework lifecycle. |
| src_legacy/Controllers/Api/AdultController.cs | GetAdults, GetAdult, PutAdult, PostAdult, DeleteAdult, Dispose | Role-specific data APIs replace business workflows; generic HTTP CRUD compatibility Q01/Q02. Dispose is framework lifecycle. |
| src_legacy/Controllers/Api/BadgeController.cs | GetBadges, GetBadge, PutBadge, PostBadge, DeleteBadge, Dispose | Role-specific data APIs replace business workflows; generic HTTP CRUD compatibility Q01/Q02. Dispose is framework lifecycle. |
| src_legacy/Controllers/Api/BeltController.cs | GetBelts, GetBelt, PutBelt, PostBelt, DeleteBelt, Dispose | Role-specific data APIs replace business workflows; generic HTTP CRUD compatibility Q01/Q02. Dispose is framework lifecycle. |
| src_legacy/Controllers/Api/GithubAccountsController.cs | GetMemberAttendances, Dispose | Public githubaccounts API, F09 contract/source gap. |
| src_legacy/Controllers/Api/MemberAttendanceController.cs | GetMemberAttendances, GetMemberAttendance, PutMemberAttendance, PostMemberAttendance, DeleteMemberAttendance, FingerprintSignIn, Dispose | MemberAttendance service/endpoints for fingerprint; attendance CRUD Q01; F03–F05/F15/F22. |
| src_legacy/Controllers/Api/MemberBadgeController.cs | GetMemberBadges, GetMemberBadge, PutMemberBadge, PostMemberBadge, DeleteMemberBadge, Dispose | Role-specific data APIs replace business workflows; generic HTTP CRUD compatibility Q01/Q02. Dispose is framework lifecycle. |
| src_legacy/Controllers/Api/MemberBeltController.cs | GetMemberBelts, GetMemberBelt, PutMemberBelt, PostMemberBelt, DeleteMemberBelt, Dispose | Role-specific data APIs replace business workflows; generic HTTP CRUD compatibility Q01/Q02. Dispose is framework lifecycle. |
| src_legacy/Controllers/Api/MemberController.cs | GetMembers, GetMember, PutMember, PostMember, DeleteMember, Dispose | Role-specific data APIs replace business workflows; generic HTTP CRUD compatibility Q01/Q02. Dispose is framework lifecycle. |
| src_legacy/Controllers/Api/MemberParentController.cs | GetMemberParents, GetMemberParent, PutMemberParent, PostMemberParent, DeleteMemberParent, Dispose | Role-specific data APIs replace business workflows; generic HTTP CRUD compatibility Q01/Q02. Dispose is framework lifecycle. |
| src_legacy/Controllers/Api/TeamController.cs | GetTeams, GetTeam, PutTeam, PostTeam, DeleteTeam, Dispose | Role-specific data APIs replace business workflows; generic HTTP CRUD compatibility Q01/Q02. Dispose is framework lifecycle. |
| src_legacy/Controllers/ChatbotController.cs | Badges, Belts | No compatible export; F10. |
| src_legacy/Controllers/Data/AdultAttendanceController.cs | Index, Details, Create, Create, Edit, Edit, Delete, DeleteConfirmed, Dispose | Role-specific Management/Parent/Coder APIs; arbitrary CRUD and correction actions Q01. Dispose is framework lifecycle. |
| src_legacy/Controllers/Data/AdultController.cs | Index, Details, Create, Create, Edit, Edit, Delete, DeleteConfirmed, Dispose | Role-specific Management/Parent/Coder APIs; arbitrary CRUD and correction actions Q01. Dispose is framework lifecycle. |
| src_legacy/Controllers/Data/BadgeController.cs | Index, Details, Create, Create, Edit, Edit, Delete, DeleteConfirmed, Dispose | Role-specific Management/Parent/Coder APIs; arbitrary CRUD and correction actions Q01. Dispose is framework lifecycle. |
| src_legacy/Controllers/Data/BeltController.cs | Index, Details, Create, Create, Edit, Edit, Delete, DeleteConfirmed, Dispose | Role-specific Management/Parent/Coder APIs; arbitrary CRUD and correction actions Q01. Dispose is framework lifecycle. |
| src_legacy/Controllers/Data/MemberAttendanceController.cs | Index, Details, Create, Create, Edit, Edit, Delete, DeleteConfirmed, Dispose | Role-specific Management/Parent/Coder APIs; arbitrary CRUD and correction actions Q01. Dispose is framework lifecycle. |
| src_legacy/Controllers/Data/MemberBadgeController.cs | Index, Details, Create, Create, Edit, Edit, Delete, DeleteConfirmed, Dispose | Role-specific Management/Parent/Coder APIs; arbitrary CRUD and correction actions Q01. Dispose is framework lifecycle. |
| src_legacy/Controllers/Data/MemberBeltController.cs | Index, Details, Create, Create, Edit, Edit, Delete, DeleteConfirmed, Dispose | Role-specific Management/Parent/Coder APIs; arbitrary CRUD and correction actions Q01. Dispose is framework lifecycle. |
| src_legacy/Controllers/Data/MemberDataController.cs | Index, Details, Create, Create, Edit, Edit, Delete, DeleteConfirmed, Dispose | Role-specific Management/Parent/Coder APIs; arbitrary CRUD and correction actions Q01. Dispose is framework lifecycle. |
| src_legacy/Controllers/Data/TeamController.cs | Index, Details, Create, Create, Edit, Edit, Delete, DeleteConfirmed, Dispose | Role-specific Management/Parent/Coder APIs; arbitrary CRUD and correction actions Q01. Dispose is framework lifecycle. |
| src_legacy/Controllers/HomeController.cs | Index, Tools, Login, Login, LogOut, Passport, PassportMentor, Passports, BeltCertificate, TeamCard, SignIn, SignInQR, SignInQR, SignIn, SignInMember, SignInAdult, GetSignedInMembers, GetSignedInAdults, ImageUpload, SessionPodLogin | Auth, mentor SignIn, Printing, Profiles and MemberSessions; F06–F15 and Q02/Q05. |
| src_legacy/Controllers/MemberController.cs | Index, ProfileSave, MemberGoalChange, Goals, Badges, BadgesAvailable, Belts, Attendance, BeltApplication, BadgeApplication, Sessions, TeamMember, OnActionExecuting, GetBadgeCategories | Coder context/actions/achievements/attendance/team/session APIs, MyProfilePage, CoderWelcome, Printing; F06/Q02. |
| src_legacy/Controllers/MentorController.cs | Index, DataCleanup, PurgeRegistrations, AttendanceRandom, Attendance, AttendanceChange, Adults, Parents, Mentors, Adult, AdultMerge, MemberMerge, ParentKids, AdultSignup, MentorSave, ParentSave, AdultSave, AdultSave, SearchMembersByName, SearchParentsByName, SearchAdultMergeByName, SearchMemberMergeByName, MergeAdults, MergeMembers, MemberSignup, Members, Member, MemberGoals, MemberSave, MemberParents, MemberAttendance, MemberBadges, MemberBelts, BadgeApprove, BadgeUndo, BadgeReject, BeltApprove, BeltReject, BeltUndo, DeleteRelationship, CreateRelationship, AddMember, SignInMode, Belts, BeltAdd, Belt, BeltSave, BeltDelete, BadgeCategories, BadgeCategoryAdd, BadgeCategory, BadgeCategorySave, BadgeCategoryDelete, Badges, BadgeAdd, Badge, GetBadgeCategories, BadgeSave, BadgeDelete, Sessions, SessionAdd, SessionEdit, SessionSave, SessionDelete, Teams, TeamAdd, Team, TeamSave, TeamDelete, OnActionExecuting, GetActiveMentors | Management, Achievements, mentor attendance, sessions, teams, definitions, printing and DataMaintenance; F03/F13–F18/Q01. |
| src_legacy/Controllers/MentorController_Reports.cs | ExportMentorEmails, ExportParentEmails, ExportCsv, RecentBelts, RecentBeltsCsv | Management/reports and MentorReport/store/CSV; F17/F21. |
| src_legacy/Controllers/ParentController.cs | Index, MyKids, MyKid, MyAccount, MyAccountSave, MemberBadges, MemberAttendance, Member, MemberSave, MemberParents, MemberGoals, MemberBelts, Sessions, TeamMember, OnActionExecuting | Parent children/account/images/password/achievements/attendance/team/session APIs, ParentHome/MyProfilePage; guarded own/linked-child access. |
| src_legacy/Controllers/ViewSwitcherController.cs | SwitchView | Responsive layout replaces browser override; Q04. |
| src_legacy/Controllers/_BaseController.cs | GetCurrentMember, GetCurrentAdult, OnActionExecuting, RedirectClient, TrimNullableString, DoMemberAttendanceChange, DoAdultAttendanceChange, MergeValues | requestMember/requestMentor/parentRequest, shared normalization, guarded RPCs, stores/realtime; attendance mutations F03/F05 and feedback F14. |

## Every Razor template and referenced field/action

Model fields include hidden IDs, computed properties and navigation collections. Full DOM-control and route inventories are in JSON. Framework/vendor mechanics are replaced by Nuxt forms/layouts rather than reproduced verbatim.

| Template | Model references | Actions/routes | Counterpart / qualification |
| --- | --- | --- |
| Data/Adult/Create.cshtml | Email, FirstName, GithubLogin, IsMentor, IsParent, LastName, Login, PasswordHash, Phone, XboxGamertag | Index | Guarded business workflows; raw scaffold Q01. |
| Data/Adult/Delete.cshtml | Email, FirstName, GithubLogin, IsMentor, IsParent, LastName, Login, PasswordHash, Phone, XboxGamertag | Index | Guarded business workflows; raw scaffold Q01. |
| Data/Adult/Details.cshtml | Email, FirstName, GithubLogin, Id, IsMentor, IsParent, LastName, Login, PasswordHash, Phone, XboxGamertag | Edit, Index | Guarded business workflows; raw scaffold Q01. |
| Data/Adult/Edit.cshtml | Email, FirstName, GithubLogin, Id, IsMentor, IsParent, LastName, Login, PasswordHash, Phone, XboxGamertag | Index | Guarded business workflows; raw scaffold Q01. |
| Data/Adult/Index.cshtml | Email, FirstName, GithubLogin, IsMentor, IsParent, LastName, Login, PasswordHash, Phone, XboxGamertag | Create, Delete, Details, Edit | Guarded business workflows; raw scaffold Q01. |
| Data/Badge/Create.cshtml | Achievement | Index | Guarded business workflows; raw scaffold Q01. |
| Data/Badge/Delete.cshtml | Achievement | Index | Guarded business workflows; raw scaffold Q01. |
| Data/Badge/Details.cshtml | Achievement, Id | Edit, Index | Guarded business workflows; raw scaffold Q01. |
| Data/Badge/Edit.cshtml | Achievement, Id | Index | Guarded business workflows; raw scaffold Q01. |
| Data/Badge/Index.cshtml | Achievement | Create, Delete, Details, Edit | Guarded business workflows; raw scaffold Q01. |
| Data/Belt/Create.cshtml | Color, Description | Index | Guarded business workflows; raw scaffold Q01. |
| Data/Belt/Delete.cshtml | Color, Description | Index | Guarded business workflows; raw scaffold Q01. |
| Data/Belt/Details.cshtml | Color, Description, Id | Edit, Index | Guarded business workflows; raw scaffold Q01. |
| Data/Belt/Edit.cshtml | Color, Description, Id | Index | Guarded business workflows; raw scaffold Q01. |
| Data/Belt/Index.cshtml | Color, Description | Create, Delete, Details, Edit | Guarded business workflows; raw scaffold Q01. |
| Data/MemberAttendance/Create.cshtml | Date, MemberId | Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberAttendance/Delete.cshtml | Date, Member | Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberAttendance/Details.cshtml | Date, Id, Member | Edit, Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberAttendance/Edit.cshtml | Date, Id, MemberId | Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberAttendance/Index.cshtml | Date, Member | Create, Delete, Details, Edit | Guarded business workflows; raw scaffold Q01. |
| Data/MemberBadge/Create.cshtml | Awarded, AwardedByAdultId, BadgeId, MemberId, Notes | Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberBadge/Delete.cshtml | Adult, Awarded, Badge, Member, Notes | Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberBadge/Details.cshtml | Adult, Awarded, Badge, Id, Member, Notes | Edit, Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberBadge/Edit.cshtml | Awarded, AwardedByAdultId, BadgeId, Id, MemberId, Notes | Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberBadge/Index.cshtml | Adult, Awarded, Badge, Member, Notes | Create, Delete, Details, Edit | Guarded business workflows; raw scaffold Q01. |
| Data/MemberBelt/Create.cshtml | Awarded, AwardedByAdultId, BeltId, MemberId | Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberBelt/Delete.cshtml | Adult, Awarded, Belt, Member | Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberBelt/Details.cshtml | Adult, Awarded, Belt, Id, Member | Edit, Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberBelt/Edit.cshtml | Awarded, AwardedByAdultId, BeltId, Id, MemberId | Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberBelt/Index.cshtml | Adult, Awarded, Belt, Member | Create, Delete, Details, Edit | Guarded business workflows; raw scaffold Q01. |
| Data/MemberData/Create.cshtml | BirthYear, FirstName, GithubLogin, LastName, Login, PasswordHash, ScratchName, XboxGamertag | Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberData/Delete.cshtml | BirthYear, FirstName, GithubLogin, LastName, Login, PasswordHash, ScratchName, XboxGamertag | Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberData/Details.cshtml | BirthYear, FirstName, GithubLogin, Id, LastName, Login, PasswordHash, ScratchName, XboxGamertag | Edit, Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberData/Edit.cshtml | BirthYear, FirstName, GithubLogin, Id, LastName, Login, PasswordHash, ScratchName, XboxGamertag | Index | Guarded business workflows; raw scaffold Q01. |
| Data/MemberData/Index.cshtml | BirthYear, FirstName, GithubLogin, LastName, Login, PasswordHash, ScratchName, XboxGamertag | Create, Delete, Details, Edit | Guarded business workflows; raw scaffold Q01. |
| Data/Team/Create.cshtml | Color, Description | Index | Guarded business workflows; raw scaffold Q01. |
| Data/Team/Delete.cshtml | Color, Description | Index | Guarded business workflows; raw scaffold Q01. |
| Data/Team/Details.cshtml | Color, Description, Id | Edit, Index | Guarded business workflows; raw scaffold Q01. |
| Data/Team/Edit.cshtml | Color, Description, Id | Index | Guarded business workflows; raw scaffold Q01. |
| Data/Team/Index.cshtml | Color, Description | Create, Delete, Details, Edit | Guarded business workflows; raw scaffold Q01. |
| Home/BeltCertificate.cshtml | Awarded, MemberBelts, MemberName | — | Printing/BeltCertificate; Q02 old route. |
| Home/Index.cshtml | — | — | Public /home.html (static information). |
| Home/Login.cshtml | Password, Username | Login | /login; F06–F08/Q02. |
| Home/Passport.cshtml | Awarded | — | Printing/MemberIdCard/PrintIdSheet; authorized scope, Q02. |
| Home/PassportMentor.cshtml | BadgeCategory | — | Printing/MemberIdCard/PrintIdSheet with skills; Q02. |
| Home/SignIn.cshtml | Adult, Deleted, HexCode, Id, ImageUrl, Member, Password, TeamName, Username | SignIn | /mentor/SignIn; F12–F15. |
| Home/SignInQR.cshtml | Adult, Deleted, HexCode, Id, ImageUrl, Member, Password, TeamName, Username | SignIn | QR mode in /mentor/SignIn; F12–F15. |
| Home/TeamCard.cshtml | FirstName, HexCode, ImageUrl, LastName, Members, TeamName | /content/Paper.css | Printing/TeamCard; Q02. |
| Home/Tools.cshtml | — | /Content/tools/ReadNFC.zip, /Content/tools/WriteNFC.zip | Missing tools/downloads F11. |
| Member/Attendance.cshtml | Date, FirstName, MemberAttendances | — | Coder pages/Profile/Coder/Achievements/MemberSessions/TeamRoster; workflow mappings above. F06/Q02. |
| Member/Badges.cshtml | Achievement, Awarded, Badge, BadgeCategory, BadgeId, Description, Id, MemberBadges, RejectedDate | — | Coder pages/Profile/Coder/Achievements/MemberSessions/TeamRoster; workflow mappings above. F06/Q02. |
| Member/BadgesAvailable.cshtml | Achievement, Awarded, Badge, BadgeCategoryId, BadgeId, CategoryName, Description, Id, MemberBadges, RejectedDate | /Member/BadgeApplication/@badge.Id.ToString( | Coder pages/Profile/Coder/Achievements/MemberSessions/TeamRoster; workflow mappings above. F06/Q02. |
| Member/Belts.cshtml | Awarded, Belt, BeltId, Color, Description, HexCode, Id, MemberBelts, RejectedDate | /Member/BeltApplication/@belt.Id.ToString( | Coder pages/Profile/Coder/Achievements/MemberSessions/TeamRoster; workflow mappings above. F06/Q02. |
| Member/Goals.cshtml | Achievement, Awarded, Badge, BadgeCategory, BadgeId, Belt, BeltId, Color, Description, GithubLogin, GoalLongTerm, GoalShortTerm, HexCode, Id, Login, MemberBadges, MemberBelts, RejectedDate, ScratchName, XboxGamertag | /Member/BadgeApplication/@badge.Id.ToString( | Coder pages/Profile/Coder/Achievements/MemberSessions/TeamRoster; workflow mappings above. F06/Q02. |
| Member/Index.cshtml | FirstName, GetLoginMessage | — | Coder pages/Profile/Coder/Achievements/MemberSessions/TeamRoster; workflow mappings above. F06/Q02. |
| Member/Profile.cshtml | BirthYear, FirstName, GithubLogin, GoalLongTerm, GoalShortTerm, Id, Login, MemberName, ScratchName, Team, XboxGamertag | /Member/TeamMember/@teamMember.Id.ToString() | Coder pages/Profile/Coder/Achievements/MemberSessions/TeamRoster; workflow mappings above. F06/Q02. |
| Member/Sessions.cshtml | — | — | Coder pages/Profile/Coder/Achievements/MemberSessions/TeamRoster; workflow mappings above. F06/Q02. |
| Member/TeamMember.cshtml | Awarded, Badge, Belt, BirthYear, FirstName, Id, LastName, MemberBadges, MemberBelts, MemberName, ScratchName, Team, XboxGamertag | /Member/TeamMember/@teamMember.Id.ToString() | Coder pages/Profile/Coder/Achievements/MemberSessions/TeamRoster; workflow mappings above. F06/Q02. |
| Member/_MemberMenu.cshtml | — | /Home/LogOut, /Member/Attendance, /Member/Badges, /Member/BadgesAvailable, /Member/Belts, /Member/Goals, /Member/Profile, /Member/Sessions | Coder pages/Profile/Coder/Achievements/MemberSessions/TeamRoster; workflow mappings above. F06/Q02. |
| Mentor/Adult.cshtml | BadgeCategories, BadgeCategoryId, Email, FingerprintId, FirstName, FullName, GithubLogin, Id, IsMentor, IsParent, LastName, Login, NewPassword, Phone, ScratchName, XboxGamertag | /Mentor/AdultMerge?AdultMode=@(adultMode)&id=@adult.Id.ToString( | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/AdultMerge.cshtml | Email, FirstName, FullName, Id, LastName, Phone | /Mentor/Adult/, /Mentor/MergeAdults, /Mentor/SearchAdultMergeByName | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/Adults.cshtml | — | — | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/Attendance.cshtml | IsAdult, Present | Attendance | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/AttendanceRandom.cshtml | Present | Attendance | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/Badge.cshtml | Achievement, BadgeCategoryId, Description, Id, MemberBadges | /Mentor/BadgeDelete, /Mentor/Badges, BadgeSave | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/BadgeCategories.cshtml | — | — | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/BadgeCategory.cshtml | CategoryDescription, CategoryName, Id | /Mentor/BadgeCategories, /Mentor/BadgeCategoryDelete, BadgeCategorySave | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/Badges.cshtml | — | — | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/Belt.cshtml | Color, Description, HexCode, Id, SortOrder | /Mentor/BeltDelete, /Mentor/Belts, BeltSave | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/Belts.cshtml | — | — | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/DataCleanup.cshtml | — | — | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/Index.cshtml | — | /Mentor/MemberBadges/@mb.MemberId.ToString(, /Mentor/MemberBelts/@mb.MemberId.ToString( | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/Member.cshtml | AttendedToday, BirthYear, FingerprintId, FirstName, GithubLogin, Id, LastName, Login, MemberName, NewPassword, RegisteredCurrentTerm, ScratchName, TeamId, XboxGamertag | /Mentor/MemberMerge?id=@member.Id.ToString(, MemberSave | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/MemberAttendance.cshtml | Date, MemberAttendances, MemberName | — | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/MemberBadges.cshtml | Achievement, AdultId, Awarded, Badge, BadgeCategory, BadgeId, Description, Id, MemberBadges, MemberName, MemberParents, RejectedDate | /Mentor/BadgeApprove/@badgeApplication.Id.ToString(, /Mentor/BadgeReject/@badgeApplication.Id.ToString(, /Mentor/BadgeUndo/@memberBadge.Id.ToString(, /Mentor/BadgeUndo/@rejection.Id.ToString( | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/MemberBelts.cshtml | AdultId, Awarded, Belt, BeltId, Color, Description, HexCode, Id, MemberBelts, MemberName, MemberParents, RejectedDate | /Mentor/BeltApprove/@beltApplication.Id.ToString(, /Mentor/BeltReject/@beltApplication.Id.ToString(, /Mentor/BeltUndo/@memberBelt.Id.ToString(, /Mentor/BeltUndo/@rejection.Id.ToString( | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/MemberGoals.cshtml | Achievement, Awarded, Badge, BadgeCategory, BadgeId, Belt, BeltId, Color, Description, GoalLongTerm, GoalShortTerm, HexCode, Id, MemberBadges, MemberBelts, MemberName, RejectedDate | — | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/MemberMerge.cshtml | BirthYear, FirstName, Id, LastName, MemberName, ScratchName | /Mentor/Member/, /Mentor/MergeMembers, /Mentor/SearchMemberMergeByName | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/MemberParents.cshtml | Adult, FirstName, Id, LastName, MemberName, MemberParents | /Mentor/Adult/, /Mentor/CreateRelationship, /Mentor/DeleteRelationship, /Mentor/SearchParentsByName | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/Members.cshtml | — | — | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/ParentKids.cshtml | FirstName, FullName, Id, LastName, Member, MemberParents | /Mentor/CreateRelationship, /Mentor/DeleteRelationship, /Mentor/Member/, /Mentor/SearchMembersByName | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/PurgeRegistrations.cshtml | — | — | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/RecentBelts.cshtml | — | — | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/Session.cshtml | Adult2Id, AdultId, CreatedDate, EndDate, Id, MentorsOnly, Topic, Url | /Mentor/SessionDelete, /Mentor/Sessions, SessionSave | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/Sessions.cshtml | — | — | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/Team.cshtml | FirstName, Goal, HexCode, Id, LastName, Members, Notes, TeamName | /Home/TeamCard/@(team.Id.ToString(, /Mentor/Member/@(member.Id.ToString()), /Mentor/TeamDelete, /Mentor/Teams, TeamSave | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/Teams.cshtml | — | — | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/_MemberMenu.cshtml | Id | /Mentor/Member/@memberId, /Mentor/MemberAttendance/@memberId, /Mentor/MemberBadges/@memberId, /Mentor/MemberBelts/@memberId, /Mentor/MemberGoals/@memberId, /Mentor/MemberParents/@memberId | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/_MentorMenu.cshtml | — | /Home/LogOut, /Mentor/SignInMode, Attendance, BadgeCategories, Badges, Belts, DataCleanup, ExportMentorEmails, ExportParentEmails, Index, Members, Mentors, Parents, PurgeRegistrations, RecentBelts, RecentBeltsCsv, Teams | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Mentor/_ParentMenu.cshtml | Id | /Mentor/Adult/@adultId, /Mentor/ParentKids/@adultId | Mentor pages and Maintenance/Definitions/Teams/Reports/Sessions/Achievements components; mapped workflow above. Merge F16, reports F17, belt defaults F18, attendance F03. |
| Parent/Index.cshtml | — | — | Parent pages/ChildPage/ChildAccount/ParentContacts/MemberSessions/Profile/Printing; link checks and read-only child progress. |
| Parent/Member.cshtml | BirthYear, FirstName, GithubLogin, Id, LastName, Login, MemberName, NewPassword, ScratchName, Team, XboxGamertag | /Parent/TeamMember/@teamMember.Id.ToString(, MemberSave | Parent pages/ChildPage/ChildAccount/ParentContacts/MemberSessions/Profile/Printing; link checks and read-only child progress. |
| Parent/MemberAttendance.cshtml | Date, MemberAttendances, MemberName | — | Parent pages/ChildPage/ChildAccount/ParentContacts/MemberSessions/Profile/Printing; link checks and read-only child progress. |
| Parent/MemberBadges.cshtml | Achievement, Awarded, Badge, BadgeCategory, BadgeId, Description, Id, MemberBadges, MemberName, RejectedDate | — | Parent pages/ChildPage/ChildAccount/ParentContacts/MemberSessions/Profile/Printing; link checks and read-only child progress. |
| Parent/MemberBelts.cshtml | Awarded, Belt, BeltId, Color, Description, HexCode, Id, MemberBelts, MemberName, RejectedDate | — | Parent pages/ChildPage/ChildAccount/ParentContacts/MemberSessions/Profile/Printing; link checks and read-only child progress. |
| Parent/MemberGoals.cshtml | Achievement, Awarded, Badge, BadgeCategory, BadgeId, Belt, BeltId, Color, Description, GoalLongTerm, GoalShortTerm, HexCode, Id, MemberBadges, MemberBelts, MemberName, RejectedDate | — | Parent pages/ChildPage/ChildAccount/ParentContacts/MemberSessions/Profile/Printing; link checks and read-only child progress. |
| Parent/MemberParents.cshtml | Adult, MemberName, MemberParents | — | Parent pages/ChildPage/ChildAccount/ParentContacts/MemberSessions/Profile/Printing; link checks and read-only child progress. |
| Parent/MyAccount.cshtml | Email, FirstName, Id, LastName, NewPassword, Phone | MyAccountSave | Parent pages/ChildPage/ChildAccount/ParentContacts/MemberSessions/Profile/Printing; link checks and read-only child progress. |
| Parent/MyKid.cshtml | BirthYear, FirstName, GithubLogin, Id, MemberAttendances, MemberName, ScratchName, XboxGamertag | — | Parent pages/ChildPage/ChildAccount/ParentContacts/MemberSessions/Profile/Printing; link checks and read-only child progress. |
| Parent/MyKids.cshtml | — | — | Parent pages/ChildPage/ChildAccount/ParentContacts/MemberSessions/Profile/Printing; link checks and read-only child progress. |
| Parent/Sessions.cshtml | — | — | Parent pages/ChildPage/ChildAccount/ParentContacts/MemberSessions/Profile/Printing; link checks and read-only child progress. |
| Parent/TeamMember.cshtml | Awarded, Badge, Belt, BirthYear, FirstName, Id, LastName, MemberBadges, MemberBelts, MemberName, ScratchName, Team, XboxGamertag | /Parent/TeamMember/@teamMember.Id.ToString() | Parent pages/ChildPage/ChildAccount/ParentContacts/MemberSessions/Profile/Printing; link checks and read-only child progress. |
| Parent/_MemberMenu.cshtml | Id | /Parent/Member/@memberId, /Parent/MemberAttendance/@memberId, /Parent/MemberBadges/@memberId, /Parent/MemberBelts/@memberId, /Parent/MemberGoals/@memberId, /Parent/MemberParents/@memberId, /Parent/Sessions | Parent pages/ChildPage/ChildAccount/ParentContacts/MemberSessions/Profile/Printing; link checks and read-only child progress. |
| Parent/_ParentMenu.cshtml | — | /Home/LogOut, /Parent/MyAccount, /Parent/MyKids, /Parent/Sessions, Index | Parent pages/ChildPage/ChildAccount/ParentContacts/MemberSessions/Profile/Printing; link checks and read-only child progress. |
| Shared/Error.cshtml | — | — | Nuxt layouts, responsive components, route navigation/error states and entity image editors; Q04/V01. |
| Shared/Redirect.cshtml | — | — | Nuxt layouts, responsive components, route navigation/error states and entity image editors; Q04/V01. |
| Shared/RedirectExternal.cshtml | — | — | Nuxt layouts, responsive components, route navigation/error states and entity image editors; Q04/V01. |
| Shared/_ImageEditable.cshtml | — | /Home/ImageUpload | Nuxt layouts, responsive components, route navigation/error states and entity image editors; Q04/V01. |
| Shared/_Layout.Mobile.cshtml | — | — | Nuxt layouts, responsive components, route navigation/error states and entity image editors; Q04/V01. |
| Shared/_Layout.cshtml | — | — | Nuxt layouts, responsive components, route navigation/error states and entity image editors; Q04/V01. |
| Shared/_ViewSwitcher.cshtml | — | SwitchView | Nuxt layouts, responsive components, route navigation/error states and entity image editors; Q04/V01. |
| _ViewStart.cshtml | — | — | Nuxt layout framework initialization. |

## Current API surface cross-check

Every route file is listed; the guard column records direct helper references and is not a complete transitive authorization analysis. Private role APIs delegate to verified actor/data functions. The older table/attendance/import route findings must be resolved even though newer APIs are guarded.

| Route source | Direct guard/request helpers | Accounting |
| --- | --- | --- |
| (tables)/badgeCategories/list.get.ts | No direct require/request helper reference | Definition/data lookup; private member/belt reads F04; completeness F21. |
| (tables)/badges/list.get.ts | No direct require/request helper reference | Definition/data lookup; private member/belt reads F04; completeness F21. |
| (tables)/belts/list.get.ts | No direct require/request helper reference | Definition/data lookup; private member/belt reads F04; completeness F21. |
| (tables)/memberBelts/byMemberId.get.ts | No direct require/request helper reference | Definition/data lookup; private member/belt reads F04; completeness F21. |
| (tables)/memberBelts/latest.get.ts | No direct require/request helper reference | Definition/data lookup; private member/belt reads F04; completeness F21. |
| (tables)/memberBelts/list.get.ts | No direct require/request helper reference | Definition/data lookup; private member/belt reads F04; completeness F21. |
| (tables)/memberBelts/pending.get.ts | No direct require/request helper reference | Definition/data lookup; private member/belt reads F04; completeness F21. |
| (tables)/members/list.get.ts | No direct require/request helper reference | Definition/data lookup; private member/belt reads F04; completeness F21. |
| (tables)/sessions/list.get.ts | No direct require/request helper reference | Definition/data lookup; private member/belt reads F04; completeness F21. |
| (tables)/teams/list.get.ts | No direct require/request helper reference | Definition/data lookup; private member/belt reads F04; completeness F21. |
| Achievements/Decision.post.ts | requireRequestMentor | Mentor or permitted member history/review; current review RPC. |
| Achievements/History.get.ts | requireRequestMentor | Mentor or permitted member history/review; current review RPC. |
| Achievements/Pending.get.ts | requireRequestMentor | Mentor or permitted member history/review; current review RPC. |
| Auth/Login.post.ts | No direct require/request helper reference | Credentials/session; F06–F08/Q06. |
| Auth/LoginNfcTag.post.ts | No direct require/request helper reference | Credentials/session; F06–F08/Q06. |
| Auth/PasswordChange.post.ts | No direct require/request helper reference | Credentials/session; F06–F08/Q06. |
| Coder/achievements/[kind].get.ts | requireRequestCoder | Current active coder scope; corresponding Coder workflow. |
| Coder/applications.post.ts | requireRequestCoder | Current active coder scope; corresponding Coder workflow. |
| Coder/attendance.get.ts | requireRequestMember | Current active coder scope; corresponding Coder workflow. |
| Coder/badge-goal.post.ts | requireRequestCoder | Current active coder scope; corresponding Coder workflow. |
| Coder/context.get.ts | requireRequestCoder | Current active coder scope; corresponding Coder workflow. |
| Coder/goals.patch.ts | requireRequestCoder | Current active coder scope; corresponding Coder workflow. |
| Coder/sessions/join.post.ts | requireRequestCoder | Current active coder scope; corresponding Coder workflow. |
| Coder/sessions.get.ts | requireRequestCoder | Current active coder scope; corresponding Coder workflow. |
| Coder/team-members/[memberId].get.ts | requireRequestCoder | Current active coder scope; corresponding Coder workflow. |
| Config/UiConfig.get.ts | No direct require/request helper reference | Public configuration response; validate no private secrets. |
| Legacy/CopyData.post.ts | No direct require/request helper reference | Import/legacy bridge; F02/Q03/F19/F20. |
| Legacy/Teams.get.ts | No direct require/request helper reference | Import/legacy bridge; F02/Q03/F19/F20. |
| Management/[memberId]/account.patch.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/[memberId]/attendance.get.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/[memberId]/goals.patch.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/[memberId]/merge.post.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/[memberId]/password.post.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/data-maintenance/[action].get.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/data-maintenance/index.post.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/definitions/[kind]/[definitionId]/image.post.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/definitions/[kind]/[definitionId].delete.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/definitions/[kind]/[definitionId].patch.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/definitions/[kind]/index.post.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/definitions/index.get.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/index.get.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/index.post.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/relationships.delete.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/relationships.post.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/reports/index.get.ts | requireRequestMentor | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/session-pods/[memberId].delete.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/session-pods/[memberId].patch.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/session-pods/index.get.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/session-pods/index.post.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/session-pods/join.post.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/skills.delete.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/skills.post.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/teams/[teamId]/image.post.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/teams/[teamId].delete.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/teams/[teamId].patch.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/teams/index.get.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| Management/teams/index.post.ts | No direct require/request helper reference | Current mentor access; service-only guarded operation where mutating; F16/F17/F21 qualifications. |
| MemberAttendance/SessionCurrent.get.ts | No direct require/request helper reference | Attendance/kiosk/stats; F03–F05/F15/F22. |
| MemberAttendance/SessionDate.get.ts | No direct require/request helper reference | Attendance/kiosk/stats; F03–F05/F15/F22. |
| MemberAttendance/SessionDateRange.get.ts | No direct require/request helper reference | Attendance/kiosk/stats; F03–F05/F15/F22. |
| MemberAttendance/SessionDates.get.ts | No direct require/request helper reference | Attendance/kiosk/stats; F03–F05/F15/F22. |
| MemberAttendance/SessionStats.get.ts | No direct require/request helper reference | Attendance/kiosk/stats; F03–F05/F15/F22. |
| MemberAttendance/SetPresent.post.ts | No direct require/request helper reference | Attendance/kiosk/stats; F03–F05/F15/F22. |
| MemberAttendance/SignIn.post.ts | No direct require/request helper reference | Attendance/kiosk/stats; F03–F05/F15/F22. |
| MemberAttendance/SignInGuid.post.ts | No direct require/request helper reference | Attendance/kiosk/stats; F03–F05/F15/F22. |
| MemberAttendance/SignInNfcTag.post.ts | No direct require/request helper reference | Attendance/kiosk/stats; F03–F05/F15/F22. |
| MemberAttendance/fingerprint.ts | No direct require/request helper reference | Attendance/kiosk/stats; F03–F05/F15/F22. |
| Parent/children/[memberId]/achievements/[kind].get.ts | requireRequestParent | Current parent/link scope; corresponding Parent workflow. |
| Parent/children/[memberId]/attendance.get.ts | requireLinkedChild, requireRequestParent | Current parent/link scope; corresponding Parent workflow. |
| Parent/children/[memberId]/images.post.ts | No direct require/request helper reference | Current parent/link scope; corresponding Parent workflow. |
| Parent/children/[memberId]/index.get.ts | requireRequestParent | Current parent/link scope; corresponding Parent workflow. |
| Parent/children/[memberId]/index.patch.ts | requireRequestParent | Current parent/link scope; corresponding Parent workflow. |
| Parent/children/[memberId]/password.post.ts | requireRequestParent | Current parent/link scope; corresponding Parent workflow. |
| Parent/children/index.get.ts | requireRequestParent | Current parent/link scope; corresponding Parent workflow. |
| Parent/sessions/index.get.ts | requireRequestParent | Current parent/link scope; corresponding Parent workflow. |
| Parent/sessions/join.post.ts | requireRequestParent | Current parent/link scope; corresponding Parent workflow. |
| Parent/team-members/[memberId].get.ts | requireRequestParent | Current parent/link scope; corresponding Parent workflow. |
| Profile/images.post.ts | No direct require/request helper reference | Current self/mentor profile access; bounded fields/images/password. |
| Profile/index.get.ts | requireRequestMember | Current self/mentor profile access; bounded fields/images/password. |
| Profile/index.patch.ts | requireRequestMember | Current self/mentor profile access; bounded fields/images/password. |
| Profile/password.post.ts | requireRequestMember | Current self/mentor profile access; bounded fields/images/password. |
| Profiles/[memberId]/images.post.ts | No direct require/request helper reference | Current self/mentor profile access; bounded fields/images/password. |
| Profiles/[memberId].get.ts | requireRequestMember | Current self/mentor profile access; bounded fields/images/password. |
| Profiles/[memberId].patch.ts | requireRequestMember | Current self/mentor profile access; bounded fields/images/password. |
| githubaccounts.get.ts | No direct require/request helper reference | Public directory; F09. |

## Domain helpers, scripts and runtime effects

| Legacy helper/effect | Current accounting |
| --- | --- |
| IUser.SetLoginDate, member/adult GetLoginMessage | Login history F06; CoderWelcome/coderRecentDecisions preserve coder home structure; AttendanceService needs F14/F15. |
| Member.MemberName / Adult.FullName / current belt / badge category aggregation | Shared member presentation; newest awarded belt; category badge counts and mentor skill names on cards. Category count order changed to alphabetical for current print cards; approve during V01 if count-descending order is important. |
| CoderDojoData.GeneratePasswordHash | New hash/session helpers; migration F20 and credential-policy Q06. |
| CoderDojoData.GetSessionDates, MemberAttendanceSet, AdultAttendanceSet | Shared attendance dates/stats helpers and unique member/date writes; manual write authority F03, atomic success F05, day convention F22. |
| BaseEntity.ImageUrl | Separate storage-aware image components and legacy fallback; image processing/server guards; V03 object migration and policy. |
| BaseController current actor, trim, redirects, MergeValues | Verified request actor/role helpers, typed normalization, safe client route changes and explicit merge RPC field policy. Blank-value/credential/image preservation differs intentionally; Q02/Q06. |
| AttendanceHub and CoderDojoServices.initAttendancePage | Supabase realtime invalidation, TanStack stores and table state replace broadcasts; F01 payload authority, F13 kiosk board, V03 cross-device checks. Manual presence welcome-popup gap is F23; validate the replacement in V01. |
| SessionHub.OnSessionChange | session_pods realtime/store invalidation; expiry and stale joining guarded. |
| CoderDojoServices FormSave/autofocus/missing-image/cache helpers | Nuxt form submit/loading/validation, image fallbacks and query-cache/draft lifecycle; responsive/UI verification V01. |
| RouteConfig, SignInModeFilter, forms auth/cookies | Nuxt routing/Supabase auth; F12 bounded kiosk, Q02 legacy consumer/alias decisions. |
| Analytics.js / third-party menus and session links | External public content/integrations; Q02/Q05/V04, no assumption that analytics or Brave referral links remain product requirements. |

## Live metadata verification

The checked-in snapshot contains all columns/types/defaults/nullability, constraints, indexes, policies, triggers, publication columns and all function definitions/EXECUTE grants. It contains no member rows or credentials. RLS and grant findings are metadata-verified on 12 October 2026; external REST exposure and deployed application behavior remain V03/V04. New controlled mutation functions are restricted correctly; older direct table grants and APIs are separate unresolved paths.
