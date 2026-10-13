# Legacy screen audit reference

All actionable discrepancies and verification tasks are tracked solely in [the master checklist](tasks.md). D01 is won’t do; D02–D06 are implemented in the current batch. The comparison below records the original audit, not current implementation status.

# Original completed-screen comparison

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
| Sign-in password/QR | Credentials, submit, scanner, team attendance groups/counts, welcome and member message | `mentor/SignIn.vue`: password/QR/NFC and welcome/counts exist; team attendance board and remaining welcome details incomplete (D08, D31–D33). Previous-login timestamp is now shown on the kiosk. |
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

## Differences to retain unless explicitly changed
- Reusable display-first profile/detail screens and explicit Edit/Cancel replace legacy always-edit forms.
- All user role flags are checkboxes; contact fields/external handles are shared, not mentor-specific.
- Guarded snapshots, protected drafts, soft deletion and dependency guards improve over unconditional legacy writes/deletes.
- Password change requires the current password; administrative password reset is a separate component.
- New attendance year/filter controls and NFC support are additions, not discrepancies.
- Image success feedback is deliberately silent under central notification policy.
- Skills use independent Add/Remove actions; relationship edits require explicit edit mode and confirmation.

## Follow-up verification

Session maintenance, duplicate-merge screens, reports, printing, cleanup, parent dashboard/children and coder self-service screens are still incomplete in the master checklist. Their overall missing functionality is tracked there; the relevant buttons on completed screens are cross-referenced above. Public/tools pages are outside this completed mentor-workflow audit. No missing core field was identified for belt definitions, team text fields, adult contact/account fields, skills assignment or individual attendance history.
