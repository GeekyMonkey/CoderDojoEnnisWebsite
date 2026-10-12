# Master migration checklist

## Foundation and completed mentor workflows
- [x] Infrastructure: Supabase schema, Cloudflare Pages, automatic develop preview deployment.
- [x] Authentication: login/logout, Supabase sessions and role navigation; develop preview login verified.
- [x] Mentor attendance: session selection, filtering, search, presence toggles, totals and random coder selection.
- [x] Mentor sign-in mode: password, QR/member GUID and NFC sign-in surfaces.
- [x] Mentor badge/belt reviews: pending applications, history, approve/reject and undo.
- [x] Verify badge/belt decisions end to end using disposable applications, including own-child restrictions, independent mentor decisions and stale conflicts.

## Mentor priority queue
Feature 12 and features 1–4 reviewed and committed; feature 5 team management reviewed and approved for commit. Feature 6 achievement definitions reviewed, committed and merged into develop. Feature 7 has not started. All UI data access must go through TanStack Query stores, with realtime invalidation for other users.

- [x] 1. Coder management: searchable list, signup, full details/editing, teams, registration, logins and fingerprint ID.
- [x] 2. Coder progress: goals editing and individual attendance history (achievement history implemented).
- [x] 3. Parent relationships: search, link/unlink children and relationship views.
- [x] 4. Mentor/parent management: lists, signup, contact details, roles and mentor skills/categories.
- [x] 5. Team management: list/create/edit/delete teams, goals, notes and colours.
- [x] 6. Achievement definitions: belt/badge/category CRUD.
- [ ] 7. Session management: list/create/edit/delete, hosts, topic, URL and mentor-only flag.
- [x] 8. Duplicate accounts: merge coders/adults, preserving relationships and history.
- [ ] 9. Reports: recent belts, belt CSV, parent emails and mentor emails.
- [x] 10. Printing: coder/mentor passports, batch passports, certificates and team cards.
- [ ] 11. Data maintenance: inactive member/parent cleanup and registration purge.
- [x] 12. My Profile: role-neutral own-profile store and reusable UI, names/contact details, external handles, guarded save and password change; separate selected-user profile store and realtime refresh.
- [x] Review feature 12 code before starting feature 1.
- [x] Review the features 1–4 batch before progressing to feature 5.
- [x] Review feature 5 team management before progressing to feature 6.
- [x] Review feature 6 achievement definitions before progressing to feature 7.

## Other migration stories
- [ ] Public/upcoming sessions and session joining.
- [ ] Coder profile, goals, badge/belt viewing and applications, personal attendance.
- [ ] Parent dashboard, account editing and child management.
- [ ] Image upload/editing and remaining integrations (chatbot, etc.).
- [ ] Remaining tools/public pages.
- [ ] User-run test/format checks and feature-parity verification.
- [ ] Documentation and user guides.

Legacy sources remain reference-only. The 25 existing type diagnostics in legacy migration code are unchanged.

## Legacy screen discrepancies

This is the authoritative planning checklist. The screen audit is reference evidence only. D02, D03, D05 and D06 are implemented, verified and approved; D01 is won’t do; D04 is restored with the belt-application exception; D09–D15 and D25–D27 are reviewed, committed and pushed; D20–D24, D26 and D29 are reviewed, implemented and verified for publication; remaining items stay queued. Printing D20–D22 belongs to feature 10 and account merge D23 belongs to feature 8, rather than separate implementation batches.

- [x] **D01 · P2 · Login — Won’t do:** Remember Me will not be restored; retain current Supabase session behavior. User decision: 2026-10-11.
- [x] **D02 · P2 · Mentor home/reviews:** Display applicant presence and current-term registration. Legacy `Views/Mentor/Index.cshtml` marks both on pending rows; the round member photo uses a green presence outline, orange registered outline or red otherwise. Acceptance: both indicators track current attendance/member changes without refresh.
- [x] **D03 · P2 · Badge reviews/history:** Include category with achievement name and sort/group by category. Legacy `Index.cshtml` and `MemberBadges.cshtml` use category + achievement; the Zod-validated review contract now includes category ID/name, retained for historical definitions. Acceptance: equally named badges from different categories are distinguishable on every queue/history row.
- [x] **D04 · P2 · Current earned belt:** Show in badge applications, achievement history, coder directories and shared profiles, including multi-role coders. Exclude only pending belt application lists. Clarified by user 2026-10-12; restored using a shared current-belt component.
- [x] **D05 · P1 · Attendance:** Fix mentor details navigation. Attendance rows now use `/mentor/member/{id}` for all roles. Acceptance: clicking a mentor opens the reusable `/mentor/member/{id}` details page, including multi-role users.
- [x] **D06 · P2 · Attendance:** Add the legacy Signup shortcut and return to the selected attendance session after signup. Legacy `Views/Mentor/Attendance.cshtml` and `AttendanceRandom.cshtml` use `MemberSignup?PreviousPage=Attendance`; attendance now opens the shared store-backed signup form in a dialog without navigating away. Acceptance: preserve date/search/tab when returning.
- [x] **D07 · P2 · Attendance — Won’t do:** Do not add a combined attendance total; retain the separate coder/mentor counts. User decision: 2026-10-12.
- [ ] **D08 · P2 · Sign-in:** Restore the live team-grouped attendance board with mentor group and counts. Legacy `Views/Home/SignIn.cshtml` / `SignInQR.cshtml` maintain team lists via SignalR; new `mentor/SignIn.vue` concentrates on sign-in/welcome. Acceptance: board updates for sign-ins on other devices, with team colour/photo/name and counts.
- [x] **D09 · P2 · Coder directory:** Reusable team thumbnails and current earned belts are displayed and refresh through stores/realtime.
- [x] **D10 · P2 · Coder directory:** Current-session presence uses the reusable photo outline and legend: green present, orange registered, red other; remote changes refresh without navigation.
- [x] **D11 · P1 · Coder signup:** Attended defaults on for coders; signup validates the selected session and creates member/attendance atomically, without duplicate records.
- [x] **D12 · P2 · Profiles/member details:** Reusable display-mode GitHub, Scratch and Xbox links safely encode available handles across roles.
- [x] **D13 · P3 · Profile images:** Shared keyboard picker and drag/drop validation, generic cropper, and preparing/saving progress retain store-owned updates.
- [x] **D14 · P2 · Relationship search:** Result count and incremental loading make every eligible match reachable.
- [x] **D15 · P3 · Relationship lists:** Linked people and search matches use stable first-name/last-name ordering, including realtime updates.
- [ ] **D16 · P1 · Coder goals:** Display the next unearned belt with description, rejection feedback and pending application details. Legacy `Views/Mentor/MemberGoals.cshtml` computes `NextBelt`; new `MemberGoals` shows only editable short/long goals. Acceptance: derived progress updates after decisions and definition changes.
- [ ] **D17 · P1 · Coder goals:** Display selected badge goals, category/name/description and pending application state. Legacy `MemberGoals.cshtml` uses `GoalDate`; new goal component does not. Acceptance: distinguish badge goals from applications and awards without moving personal goal selection into mentor-only actions.
- [ ] **D18 · P1 · Member belt/badge history:** Show available/unearned definitions even when no member achievement record exists. Legacy `MemberBelts.cshtml` / `MemberBadges.cshtml` iterate the definition catalogue; new `AchievementReviewsData.getAchievementReviews` starts from member award/application rows. Acceptance: complete catalogue, descriptions and rejected/pending/earned status are available, retaining labels for deleted historical definitions.
- [ ] **D19 · P2 · Member history:** Restore separate earned/pending/available sections and badge-goal markers. Legacy history explicitly groups these and shows goal stars; current table combines records and its contract omits `goalDate`. Acceptance: readable grouping and actual goal state; an undated record must not automatically be assumed to be a selected goal.
- [x] **D20 · P2 · Coder directory/details:** Registered coder batch and individual ID actions use the shared sheet, including unassigned coders and scanner-compatible QR codes.
- [x] **D21 · P2 · Mentor directory/adult details:** Mentor batch and individual adult ID actions use the shared cards with role and skill labels.
- [x] **D22 · P2 · Coder details:** Belt certificate displays the latest earned belt, name and award month, with a responsive preview and A4 landscape print layout; no award disables printing.
- [x] **D23 · P1 · Coder/adult details:** Reusable merge search/field preview and combined role flags; mentor-only atomic transfer keeps survivor identity/credentials/images, transfers history/links/skills, rejects stale/concurrent requests and archives the duplicate. Redundant source history remains archived rather than being discarded.
- [x] **D24 · P1 · Review policy:** User-selected policy requires another mentor for a linked child’s belt and badge decisions. Approve/reject are blocked in the database and reflected in the UI; any mentor may undo a decision, including for their linked child; relationship realtime events refresh permissions.
- [x] **D25 · P1 · Team maintenance:** Directory/detail images and reusable upload/crop/delete controls use validated store actions, revision conflicts and realtime updates across clients.
- [x] **D26 · P2 · Team details:** Print ID and Print Team Card open responsive printable previews; member IDs include scanner-compatible QR codes, current belts and badge counts. Team IDs now use the shared sheet alongside D20–D22.
- [x] **D27 · P2 · Badge directory:** Categories are clearly labelled, sorted into groups and searchable, with an unavailable-category fallback.
- [ ] **D28 · P1 · Category maintenance:** Restore category image display/upload/edit, including directory thumbnails. Legacy `BadgeCategory.cshtml` / `BadgeCategories.cshtml`; definition contract/UI has no image field/action. Acceptance: share entity-image infrastructure with teams, retaining category-specific authorization and realtime invalidation.
- [x] **D29 · P1 · Undo policy:** Any active mentor may undo a belt or badge decision, including another mentor’s decision and one for their linked child. Server mentor authorization and stale-decision checks remain enforced; the UI permits undo independently of approval/rejection permissions.
- [ ] **D30 · P2 · Sign-in welcome:** Display previous login date/time. Legacy `Models/Member.cs` / `Models/Adult.cs` include it in `GetLoginMessage`; current welcome renders name/session count/team/notification strings, not that field. Acceptance: localize the timestamp and handle first login with null.
- [ ] **D31 · P1 · Sign-in welcome:** Include recent belt/badge rejection feedback, mentor and reapplication guidance, suppressing badge rejections after reapplication. Legacy `Models/Member.GetLoginMessage` does this; new `AttendanceService.generateNinjaNotifications` handles awards but not rejections. Acceptance: contextual welcome feedback updates after decisions; do not migrate these persistent messages to transient toasts.
- [ ] **D32 · P2 · Sign-in welcome:** Include award notes/awarding mentor and badge category in recent achievement messages. New service emits only belt colour or badge achievement; legacy messages include these additional fields. Acceptance: preserve readable structured text, avoid raw legacy HTML, and distinguish categories.
- [ ] **D33 · P2 · Sign-in welcome:** Restore the unassigned-team guidance and mentor group label. Legacy login messages tell an unassigned coder to contact a mentor and identify adults as Mentors; `TeamCard` renders nothing when there is no team. Acceptance: show role-appropriate group/fallback text without conflating parent-only users with mentors.

- [x] Review D02–D06 together before the next batch (approved for push 2026-10-12).
- [ ] Verify each discrepancy fix on desktop and phone, including display/edit modes and another signed-in browser without refreshing.
- [ ] Verify QR/NFC hardware and camera permissions on supported devices.
- [ ] Review existing attendance/auth API inputs against the Zod rule before extending them.

## D02–D06 verification (2026-10-11)

- Production build passed; local server starts on http://localhost:3005.
- Vue/TypeScript check: only the same 25 existing diagnostics under legacy API/SQL code. No legacy code changed.
- Mentor queue: application belt only; presence and registration conveyed by round photo outlines following user review.
- Realtime: toggled attendance in a second tab, observed the first tab update without refresh, then restored the original attendance.
- History: Alan Kelly’s individual awards remain visible; badge rows display Java/Scratch categories and sort by category, achievement and applicant.
- Mentor attendance row opens generic member details. Signup cancellation and successful passwordless disposable signup preserve date, mentor tab and search; fixture soft-deleted afterward.
- No database migration required. Automated test and format commands remain for the user to run.
- OpenSpec strict validation still fails on pre-existing requirement/scenario formatting in the migration specs; verified the unchanged develop checkout has the same failures.

- Review refinement: round photo status outlines (present green, registered orange, other red), separate reusable photo/avatar components with optional borderColor, photo cover mode, readable mobile sizing and stacked review rows.
- Pending belt applications omit the redundant status column; history retains it.
