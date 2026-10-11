# Completed-screen legacy discrepancy checklist

Audit date: 2026-10-11. Baseline: develop d2adba6, plus the notification worktree changes.

## Scope and evidence
This is a source comparison of the legacy Razor views/controllers against the active Vue pages, shared components, stores and API contracts. It covers the screens marked completed in the master checklist: login, mentor home/reviews, attendance/random selection, sign-in, coder/parent/mentor directories and signup, member details, goals, relationships, attendance history, My Profile for every role, team maintenance, and belt/badge/category maintenance. The legacy ASP.NET site was not run on this Linux machine; this is not a claim of side-by-side visual verification. Browser verification of selected new screens supplements the source comparison.

Unchecked items below are discrepancies, not an assertion that the whole workflow is missing. P1 = broken navigation or missing workflow/data; P2 = missing displayed information/action; P3 = presentation or convenience. Each item names the legacy evidence and the active implementation to change. Implement through Zod contracts and TanStack Query stores, with realtime updates, using reusable components. Keep legacy sources unchanged.

## Screen coverage: displayed fields, edit inputs and buttons

| Completed screen | Legacy fields/actions checked | Active equivalent and parity result |
| --- | --- | --- |
| Login | Username, password, Remember Me, Login | `(auth)/login.vue`: username/password/Login exist; Remember Me is absent (D01). NFC login is additional. |
| Mentor home | Pending belt/badge applicants, picture, current belt stripe, presence/registration, category + achievement, details link | `mentor/index.vue`, `Achievements/ReviewList.vue`: both queues and links exist; context missing (D02–D04). |
| Attendance and random selection | Session date, search, coder/mentor lists, present checkbox, totals, team/belt/photo, Signup, Choose Random, member details | `mentor/attendance.vue`: selection/filter/search/toggle/totals/random exist; Signup shortcut and mentor link need work (D05–D07). |
| Sign-in password/QR | Credentials, submit, scanner, team attendance groups/counts, welcome and member message | `mentor/SignIn.vue`: password/QR/NFC and welcome/counts exist; team attendance board and welcome details incomplete (D08, D30–D33). |
| Coder directory | Search, photo, team image, belt stripe, present/registration, Signup, Print IDs | `Maintenance/MemberDirectory.vue`: search/photo/team name/registration/signup exist; D09–D10, D20. |
| Adult directories | Search, photo/name, Signup, mentor Print IDs | Same directory by role: search/signup/details exist; print queue D21. |
| Coder signup | Names, birth year, team, registration, Attended Today, login/password/confirmation, fingerprint, GitHub/Scratch/Xbox | `MemberSignup`, `AccountFields`, `ProfileFieldInputs`: persistent fields exist; Attended Today missing (D11). Extra contact/role inputs are available. |
| Adult signup/details | Names, email, phone, parent/mentor flags, login/password/confirmation, fingerprint, external handles, skills, image, Save, Print ID, Merge | `MemberDetail`, `MemberAccount`, `UserProfile`, `PasswordResetForm`, `MemberSkills`: fields/role flags/skills/image/password exist; external links and planned buttons D12, D21–D23. |
| Coder details | Names, birth year, team, registration, login/fingerprint/external handles, image, password reset, Save, Print ID/Cert, Merge | Same reusable detail components preserve fields with display/edit modes; D12, D20, D22–D23. |
| My Profile | Legacy `Parent/MyAccount`: names/email/phone/image/password/Save | `Profile/MyProfilePage` reused for coder/parent/mentor: fields, display/edit/cancel/save, photo/avatar and password exist. Requiring current password is intentional. D12–D13 cover external links/upload convenience. |
| Parent/child relationships | Linked names, view details, search candidates, add, confirmed remove | `MemberRelationships`: link/unlink/details/search exist; candidate paging and ordering D14–D15. |
| Mentor skills | Category checkbox selections and Save | `MemberSkills`: selected skills display and independent Add/Remove actions exist; no missing stored field. Separate immediate actions replace the legacy bulk Save. |
| Coder goals | Short/long text, next belt/description/rejections/application, badge goals/category/description/pending | `MemberGoals` adds text editing; progress display is incomplete (D16–D17). |
| Individual attendance | Total sessions and descending dates | `MemberAttendanceHistory`: total and descending dates exist; no missing field or action identified. |
| Belt/badge history/review | Earned/pending/available, description, goal marker, application/decision date/notes/mentor, approve/reject/undo | `ReviewList`: decisions and record history exist; catalogue/grouping/context and relationship rule differences D03, D18–D19, D24, D29. |
| Team directory/details/create | Name/hex/goal/notes/member links/image, New/Save/Delete confirmation, Print ID/Team Card | `TeamDirectory`, `TeamDetail`, `TeamFields`: textual fields and CRUD exist; image/printing D25–D26. |
| Belt directory/details/create | Name/hex/order/description, coloured list, New/Save/Delete confirmation | Definition components preserve all fields and actions; no missing field identified. New display mode and award count added. |
| Badge directory/details/create | Category groups, achievement/description/category, New/Save/Delete + award count | Definition components preserve edit fields/delete warning; grouped list/category context missing (D27). |
| Category directory/details/create | Name/description/image, New/Save/Delete | Definition components preserve text fields and CRUD; image missing (D28). Related badge links and reference deletion guards are additional. |

Active paths in this table are relative to `src/app/`; legacy paths below are relative to `src_legacy/`.

## Discrepancy to-do list

### Navigation and attendance
- [ ] **D01 · P2 · Login:** Restore a Remember Me choice or explicitly approve replacing it with the current Supabase session behavior. Legacy `Views/Home/Login.cshtml` has `Remember`; new `pages/(auth)/login.vue` has only username/password. Acceptance: session persistence choices are explicit and tested; do not merely add an unwired checkbox.
- [ ] **D02 · P2 · Mentor home/reviews:** Display applicant presence and current-term registration. Legacy `Views/Mentor/Index.cshtml` marks both on pending rows; new `Achievements/ReviewList.vue` has neither. Acceptance: both indicators track current attendance/member changes without refresh.
- [ ] **D03 · P2 · Badge reviews/history:** Include category with achievement name and sort/group by category. Legacy `Index.cshtml` and `MemberBadges.cshtml` use category + achievement; new review contract only provides achievement label. Acceptance: equally named badges from different categories are distinguishable on every queue/history row.
- [ ] **D04 · P2 · Mentor home/reviews:** Restore the applicant's current earned-belt indicator. New belt review rows show the belt being requested, not the applicant's current belt; badge review rows lack the legacy current-belt stripe. Acceptance: requested and earned belt information are unambiguous.
- [ ] **D05 · P1 · Attendance:** Fix mentor details navigation. `pages/(member)/mentor/attendance.vue` builds `/mentor/mentor/{id}`, but no matching route exists. Acceptance: clicking a mentor opens the reusable `/mentor/member/{id}` details page, including multi-role users.
- [ ] **D06 · P2 · Attendance:** Add the legacy Signup shortcut and return to the selected attendance session after signup. Legacy `Views/Mentor/Attendance.cshtml` and `AttendanceRandom.cshtml` use `MemberSignup?PreviousPage=Attendance`; new attendance has no signup action. Acceptance: preserve date/search/tab when returning.
- [ ] **D07 · P2 · Attendance:** Restore one combined total attendance count, alongside the separate coder/mentor counts. Legacy counts all present people; new attendance displays separate coder/mentor counts. Acceptance: combined and role counts use the same selected session, avoiding double counting multi-role users.
- [ ] **D08 · P2 · Sign-in:** Restore the live team-grouped attendance board with mentor group and counts. Legacy `Views/Home/SignIn.cshtml` / `SignInQR.cshtml` maintain team lists via SignalR; new `mentor/SignIn.vue` concentrates on sign-in/welcome. Acceptance: board updates for sign-ins on other devices, with team colour/photo/name and counts.

### Member/profile data and controls
- [ ] **D09 · P2 · Coder directory:** Show current earned belt and team image/logo. Legacy `Views/Mentor/Members.cshtml` has a belt stripe and team image; new directory shows avatar and team name only. Acceptance: reuse belt/team presentation components and react to awards/team changes.
- [ ] **D10 · P2 · Coder directory:** Show present status for the current session. Legacy member rows have `Present`; new directory does not read attendance. Registration is present as a badge, so that field is not missing. Acceptance: presence updates without navigation or refresh.
- [ ] **D11 · P1 · Coder signup:** Restore Attended Today, enabled by default, and save attendance when selected. Legacy `MentorController.MemberSignup/MemberSave` does this; current `MemberSignup`/`NewMember` contract has no attendance input. Acceptance: one validated creation workflow with explicit selected-session semantics, realtime attendance and no duplicate attendance records.
- [ ] **D12 · P2 · Profiles/member details:** Add reusable external-link controls for GitHub, Scratch and Xbox handles. Legacy `Views/Mentor/Member.cshtml` / `Adult.cshtml` have Go to my ... buttons; `ProfileDetails` only renders strings. Acceptance: links are visible in display mode when a handle is available, safely constructed and consistently reused across user roles. Review the obsolete Xbox URL/avatar endpoint before restoring it.
- [ ] **D13 · P3 · Profile images:** Restore drag/drop upload convenience and useful upload progress if retained. Legacy `_ImageEditable.cshtml` supports drop and progress; new `ProfileImages.vue` uses file selection/crop/loading only. Acceptance: keyboard file picker remains usable and drop input shares validation/store actions.
- [ ] **D14 · P2 · Relationship search:** Remove the hard 20-result dead end. New `MemberRelationships.candidates` truncates to 20 with no count/next-page control. Acceptance: every matching eligible parent/coder can be reached without guessing a narrower spelling.
- [ ] **D15 · P3 · Relationship lists:** Sort linked people consistently by name. Legacy relationship views order by first name; current `linked` preserves relationship fetch order. Acceptance: stable alphabetical ordering survives realtime changes.
- [ ] **D16 · P1 · Coder goals:** Display the next unearned belt with description, rejection feedback and pending application details. Legacy `Views/Mentor/MemberGoals.cshtml` computes `NextBelt`; new `MemberGoals` shows only editable short/long goals. Acceptance: derived progress updates after decisions and definition changes.
- [ ] **D17 · P1 · Coder goals:** Display selected badge goals, category/name/description and pending application state. Legacy `MemberGoals.cshtml` uses `GoalDate`; new goal component does not. Acceptance: distinguish badge goals from applications and awards without moving personal goal selection into mentor-only actions.

### Achievement catalogue and review
- [ ] **D18 · P1 · Member belt/badge history:** Show available/unearned definitions even when no member achievement record exists. Legacy `MemberBelts.cshtml` / `MemberBadges.cshtml` iterate the definition catalogue; new `AchievementReviewsData.getAchievementReviews` starts from member award/application rows. Acceptance: complete catalogue, descriptions and rejected/pending/earned status are available, retaining labels for deleted historical definitions.
- [ ] **D19 · P2 · Member history:** Restore separate earned/pending/available sections and badge-goal markers. Legacy history explicitly groups these and shows goal stars; current table combines records and its contract omits `goalDate`. Acceptance: readable grouping and actual goal state; an undated record must not automatically be assumed to be a selected goal.
- [ ] **D24 · P1 · Review policy decision:** Decide whether a mentor may review their own child. Legacy belt view hides approve/reject for linked children; badge view contains a temporary first-name exception. New review UI/server has no parent-link guard. Acceptance: one documented policy enforced server-side and reflected in UI; do not copy the name-based exception. Legacy server enforcement was also incomplete, so this requires a product decision rather than blind parity.

- [ ] **D29 · P1 · Undo policy decision:** Legacy `MemberBelts.cshtml` / `MemberBadges.cshtml` show Undo only to the mentor who made the decision. Current review UI offers it to every mentor and server checks state, not decision ownership. Acceptance: document the intended policy and enforce it in the API and UI. Do not restore the legacy UI-only restriction without server enforcement.
- [ ] **D30 · P2 · Sign-in welcome:** Display previous login date/time. Legacy `Models/Member.cs` / `Models/Adult.cs` include it in `GetLoginMessage`; current welcome renders name/session count/team/notification strings, not that field. Acceptance: localize the timestamp and handle first login with null.
- [ ] **D31 · P1 · Sign-in welcome:** Include recent belt/badge rejection feedback, mentor and reapplication guidance, suppressing badge rejections after reapplication. Legacy `Models/Member.GetLoginMessage` does this; new `AttendanceService.generateNinjaNotifications` handles awards but not rejections. Acceptance: contextual welcome feedback updates after decisions; do not migrate these persistent messages to transient toasts.
- [ ] **D32 · P2 · Sign-in welcome:** Include award notes/awarding mentor and badge category in recent achievement messages. New service emits only belt colour or badge achievement; legacy messages include these additional fields. Acceptance: preserve readable structured text, avoid raw legacy HTML, and distinguish categories.
- [ ] **D33 · P2 · Sign-in welcome:** Restore the unassigned-team guidance and mentor group label. Legacy login messages tell an unassigned coder to contact a mentor and identify adults as Mentors; `TeamCard` renders nothing when there is no team. Acceptance: show role-appropriate group/fallback text without conflating parent-only users with mentors.

### Buttons already represented by later migration batches
These are missing on completed screens, but should reuse the planned batch implementations rather than create duplicate projects.
- [ ] **D20 · P2 · Coder directory/details → batch 10:** Print IDs for registered coders and individual Print ID. Legacy `Members.cshtml` / `Member.cshtml`; no active actions/routes.
- [ ] **D21 · P2 · Mentor directory/adult details → batch 10:** Batch mentor Print IDs and individual adult Print ID. Legacy `Adults.cshtml` / `Adult.cshtml`; no active actions/routes.
- [ ] **D22 · P2 · Coder details → batch 10:** Print Belt Certificate. Legacy `Member.cshtml`; no active button.
- [ ] **D23 · P1 · Coder/adult details → batch 8:** Merge account action. Legacy `Member.cshtml` / `Adult.cshtml`; no active button or merge workflow.
- [ ] **D25 · P1 · Team maintenance:** Restore team image display and upload/edit support, including directory thumbnails. Legacy `Team.cshtml` uses `_ImageEditable`, `Teams.cshtml` uses `ImageUrl`; new team store/contracts have no image action. Acceptance: reusable entity-image subcomponents and store-owned image updates across clients.
- [ ] **D26 · P2 · Team details → batch 10:** Print ID and Print Team Card. Legacy `Team.cshtml`; no active buttons/routes.
- [ ] **D27 · P2 · Badge directory:** Restore category grouping or equivalent clearly displayed category labels. Legacy `Badges.cshtml` uses category dividers; `DefinitionDirectory` sorts by name and omits category. Acceptance: users can locate/distinguish badges by category without opening each record.
- [ ] **D28 · P1 · Category maintenance:** Restore category image display/upload/edit, including directory thumbnails. Legacy `BadgeCategory.cshtml` / `BadgeCategories.cshtml`; definition contract/UI has no image field/action. Acceptance: share entity-image infrastructure with teams, retaining category-specific authorization and realtime invalidation.

## Differences to retain unless explicitly changed
- Reusable display-first profile/detail screens and explicit Edit/Cancel replace legacy always-edit forms.
- All user role flags are checkboxes; contact fields/external handles are shared, not mentor-specific.
- Guarded snapshots, protected drafts, soft deletion and dependency guards improve over unconditional legacy writes/deletes.
- Password change requires the current password; administrative password reset is a separate component.
- New attendance year/filter controls and NFC support are additions, not discrepancies.
- Image success feedback is deliberately silent under central notification policy.
- Skills use independent Add/Remove actions; relationship edits require explicit edit mode and confirmation.

## Follow-up verification
- [ ] Exercise every discrepancy fix on desktop and phone with display and edit modes.
- [ ] Check another signed-in browser updates without refresh for fields, lists and counts.
- [ ] Verify belt/badge decisions using disposable applications (existing master-checklist item).
- [ ] Hardware QR/NFC and camera-permission checks need supported devices; source parity is not hardware verification.
- [ ] Review old attendance/auth API inputs against the Zod rule before extending them (existing sign-in endpoints use typed readBody plus manual checks).

Session maintenance, duplicate-merge screens, reports, printing, cleanup, parent dashboard/children and coder self-service screens are still incomplete in the master checklist. Their overall missing functionality is tracked there; the relevant buttons on completed screens are cross-referenced above. Public/tools pages are outside this completed mentor-workflow audit. No missing core field was identified for belt definitions, team text fields, adult contact/account fields, skills assignment or individual attendance history.
