# Table, field and operation rules

## Meaning of rights

An actor is an active, non-anonymous Supabase user bound to an active member row. `C` means coder (`is_ninja`), `P` parent (`is_parent`), `M` mentor (`is_mentor`); combine grants for multi-role accounts. All predicates re-read database state. An archived actor has no private rights even with an unexpired JWT; mentors can administer archived target records.

**Mentors have full application rights on every table below.** Their administration is performed through supported server APIs/transactional RPCs, including deletes/archives where the workflow supports them. Every actor's direct browser table INSERT/UPDATE/DELETE is denied. This keeps application rights while enforcing field, consistency, stale-state and review rules. RLS/SELECT grants protect direct reads; API/RPC checks protect service-role operations that bypass RLS.

`Self` means the bound member ID, not `auth.uid()` (these UUIDs are different). `Child` means an active coder with a current `member_parents` link to the active parent. `Peer` means an active coder teammate, or a teammate of an active linked child. No arbitrary UUID request establishes any of these relationships.

## Complete application permission matrix

| Table | Mentor | Parent | Coder/member | Visitor |
| --- | --- | --- | --- | --- |
| `members` | Read/administer all active and archived accounts; create; edit profile/account/roles/vetting/team/registration/scanner IDs; reset passwords; merge/archive under guarded workflows | Read/edit own profile; read child projection; edit linked child's narrow account fields, password and images; read authorized peer, co-parent contact and host projections | Read/edit own profile; edit own short/long goals; read safe current teammate and eligible host projections | Public GitHub projection only: first/last names and nonempty handle of active coders/mentors; images public independently |
| `member_parents` | Read/create/remove links; validate active eligible roles; merge transfers; preserve history | Read own parent links and the other links/parent contacts for an authorized child; no create/update/delete | No raw links/contact directory; no link mutation | None |
| `member_attendances` | Read all histories/current totals; set/remove presence for selected dates; record signup/merge effects | Read own and active linked-child history/count; join eligible pod records own attendance only; no manual create/edit/delete/backdate | Read own history/count; join eligible pod records own attendance only; no manual create/edit/delete/backdate | No direct database access; existing F03 service-backed hardware kiosk APIs remain unchanged under the accepted vulnerability exception |
| `member_badge_categories` | Read/add/remove eligible mentor skill links; merge transfers | Own skills read if held; safe mentor skill labels for eligible host/peer/card presentation; no mutation unless also mentor | Own skills read if held; safe mentor skill labels where displayed; no mutation unless also mentor | No raw links; definition/category public text is separate |
| `member_badges` | All histories/applications; approve/reject/undo and authorized maintenance/merge; retain own-child approve/reject restriction | Read own history and active linked-child evidence/decisions; peer earned-award projection only; no child goals/application/review mutation | Own badge goal add/remove, application/reapplication; read own full history; teammate earned-award projection only; never write decisions/reviewer/date fields | None |
| `member_belts` | All histories/applications; approve/reject/undo and authorized maintenance/merge; retain own-child approve/reject restriction | Read own history and active linked-child evidence/decisions; peer earned-award projection only; no application/review mutation | Own eligible next-belt application/reapplication and full history; teammate earned-award projection only; never write decisions/reviewer/date fields | None |
| `badge_categories` | Read/create/edit/archive; image replacement/removal | Read active categories and historical categories referenced by readable records; no mutation | Same | Read active definition text/image metadata only if public definition export is retained; no mutation |
| `badges` | Read/create/edit/archive; category selection | Read active definitions and historical referenced definitions; no mutation | Same; own application/goal action is on `member_badges`, not definition edits | Active badge definition export only; no mutation |
| `belts` | Read/create/edit/archive; name/hex/order/description | Read active and authorized historically referenced belts; no mutation | Same; own application action is on `member_belts` | Active belt definition export only; no mutation |
| `teams` | Read all including archived; create/edit/archive; notes, roster via account changes, logo, print | Read safe team presentation for linked children; no notes or assignment/edit/delete | Read safe own-team presentation and roster; no notes or assignment/edit/delete | Image downloads only; no team database directory |
| `sessions` | Read/administer attendance-date catalog; create/edit/remove where consistent with attendance; no pod URLs stored here | Read date catalog scoped to own/child attendance or a bounded aggregate/calendar projection; no mutation | Read dates scoped to own attendance/calendar projection; no mutation | None |
| `session_pods` | Read all including mentor-only, expired/archived; create/edit/archive/join; topic/URL/hosts/visibility/expiry | Read active unexpired non-mentor-only pods; join as self only | Same | None until separate public-session decision; no public URL/host/private pod leakage |

Null/unresolved foreign keys never grant access. Recorded deleted definitions may be read through authorized history, without permitting new applications. Archived target children/peers/pods are not accessible to nonmentors. Keeping an image public does not override these row rules.

## Exact base-table RLS SELECT matrix

Base SELECT grants use explicit columns/projections, not `select('*')` over mixed-sensitivity data. All base tables have RLS enabled; all base-table writes for `anon`/`authenticated` are revoked. Non-listed reads default deny. `activeActor()` is required for every authenticated policy. `mentor()` includes activeActor.

| Table | Raw SELECT policy for signed-in users | Signed-out/raw access | Projection exceptions |
| --- | --- | --- | --- |
| `members` | `mentor() OR id = currentMemberId()`; do not allow raw child/peer/co-parent rows | Deny | Child/peer/co-parent/host/GitHub views require narrow authorized readers, described below. Never grant `password_hash`, `nfc_tag` or `fingerprint_id` to browser roles; mentor scanner administration uses guarded API projection. |
| `member_parents` | `mentor() OR (parent() AND parent_id = currentMemberId() AND childActive(member_id))` | Deny | Parent can read child-related co-parent names/contacts through the specific projection, not raw global links. |
| `member_attendances` | `mentor() OR member_id = currentMemberId() OR linkedActiveChild(member_id)` | Deny | Aggregate calendar/kiosk counts use a separate scope, not a global list of IDs. |
| `member_badge_categories` | `mentor() OR member_id = currentMemberId()` | Deny | Host/mentor skill names via safe projection where feature needs them. |
| `member_badges` | `mentor() OR member_id = currentMemberId() OR linkedActiveChild(member_id)` | Deny | Peer projection includes earned award fields only; no pending/rejection/application evidence. |
| `member_belts` | Same as badges | Deny | Same public earned-award projection boundary. |
| `badge_categories` | `mentor() OR not deleted OR authorizedHistoricalCategory(id)` | Active rows only, approved public text/metadata columns | Historical predicate checks permitted awards/skills; deleted categories are not globally public. |
| `badges` | `mentor() OR not deleted OR authorizedHistoricalBadge(id)` | Active rows only, approved definition columns | Anonymous export contains only its documented fields. |
| `belts` | `mentor() OR not deleted OR authorizedHistoricalBelt(id)` | Active rows only, approved definition columns | Same. |
| `teams` | `mentor() OR (not deleted AND authorizedTeam(id))` | Deny | Browser columns exclude `notes`; mentor full notes available through guarded management API. Archived team presentation needed by readable history is a specific safe reader, not global archive SELECT. |
| `sessions` | `mentor() OR authorizedAttendanceDate(session_date)` | Deny | No global individual presence directory; approved bounded aggregate counts/calendar may be server projected. |
| `session_pods` | `mentor() OR (not deleted AND not mentors_only AND unexpired())` | Deny | Authorized users can receive eligible joining URL and safe host projection; privileged pod rows remain mentor-only. |

Active public definitions are deliberately readable. For their authenticated branch, even `not deleted` requires a valid active bound actor; an unrelated Supabase account is not an app member. `anon` public-definition access is separately explicit and read-only. Public APIs should use their public client/path, not generic service SELECT.

## Own-profile column contract

| Fields | Parent/coder editing self | Mentor administration | Enforcement |
| --- | --- | --- | --- |
| `login`, `name_first`, `name_last`, `email`, `phone`, `github_login`, `scratch_name`, `xbox_gamertag` | Allow | Allow for any target | Existing profile validation, immutable target identity, login collision lock and expected snapshot |
| `goal_short_term`, `goal_long_term` | Coder own goal action only; parent-only account has no child-goal edit permission | Allow | Separate guarded goals operation |
| `birth_year` | Not added to ordinary self-profile form by this proposal; parent can edit linked child's birth year | Allow | Existing child/mentor account contract |
| `is_ninja`, `is_parent`, `is_mentor`, `garda_vetted`, `team_id`, `registered_current_term`, `fingerprint_id`, `nfc_tag`, `deleted` | Deny | Allow through corresponding account/archive workflow | Current mentor role, eligibility/uniqueness and stale-state guards |
| `id`, auth binding, login timestamps, image flags/revisions, stored password hash | No direct editing | No arbitrary profile editing; lifecycle/password/image/mapping operations only | Immutable IDs; atomic login rotation; validated image lifecycle; protected credential reset/identity mapping |

Own password change requires existing-password validation; parent linked-child or mentor reset uses their authorized reset path. Neither hashes nor raw device credentials appear in generic profile reads, public views or events. Users cannot impersonate another account by changing the body `id`, metadata, login, email or binding.

No `USING (id = currentMemberId())` UPDATE policy alone is sufficient: it would permit role and protected-column changes. Self updates use a narrow RPC/API contract; authenticated table UPDATE remains denied even for own rows.

## Projection field boundaries

- **Own profile:** approved self fields plus account presentation/goals/role/team/registration state required by own screens; no hash or raw device credentials.
- **Mentor maintenance:** all operational member fields needed to administer any account, including scanner IDs and archived state; credential reset capability, never a readable hash.
- **Linked child:** current `ChildMember` contract: identity/names/birth year/login/handles/images/role presentation/team/goals; belts/attendance summary and authorized full achievement history. No extra child contact/scanner/vetting fields solely because raw SELECT could return them.
- **Co-parent contact:** ID/name/email/phone only for parents currently linked to a child the requesting parent may view. No scanner/login/roles/other-child directory.
- **Peer:** existing `PublicMember`/`PublicAward` projection for a current authorized team: identity/names/birth year/handles/image flags/role presentation and earned-award presentation. No private contacts/login/attendance/goal text/pending/rejected evidence. Birth year preserves the current feature contract; it is not an anonymous disclosure.
- **Host/reviewer:** identity/name/public image/approved skill names as needed for an eligible pod or readable achievement. No full member row.
- **Anonymous GitHub directory:** first name, last name and GitHub login split into active coder/mentor lists; no member UUID/contact/login/role/scanner/history fields.

Projection exceptions cannot be implemented by widening `members` RLS to all teammates and then hoping components hide fields. Use audited server readers with exact DTOs or narrowly scoped private SECURITY DEFINER projection functions with current identity/link checks. A broad public SECURITY DEFINER view/RPC is prohibited. Ordinary views are `security_invoker=true` and cannot grant a row unavailable under underlying RLS.

## Images and storage objects

All image bytes remain public, including photo/avatar/team/category images and legacy JPEG fallbacks. Preserve public buckets and existing public URL behavior; no signed URL required for downloads. This does not grant object metadata listing or mutation rights.

| Object class in app bucket | Download | Create/replace/swap/delete | Metadata listing |
| --- | --- | --- | --- |
| `Members/Photos/Member_<compact UUID>.png` (and legacy JPEG) | Anyone | Active mentor, owner or active linked-child parent through validated image API | Mentor administration; self/linked-child exact paths only |
| `Members/Avatars/Member_<compact UUID>.png` (and legacy JPEG) | Anyone | Same | Same |
| `Teams/Team_<compact UUID>[_<revision>].png` (and JPEG fallback) | Anyone | Active mentor only | Authorized entity image reader or mentor administration |
| `BadgeCategories/BadgeCategory_<compact UUID>[_<revision>].png` (and JPEG fallback) | Anyone | Active mentor only | Same |
| Other public image assets | Anyone | Explicit mentor-managed supported asset workflow only; no arbitrary upload endpoint | No public global object listing required |

Keep `storage.objects` direct client writes denied. The server derives bucket/path/subject/revision from authorized entity IDs, validates PNG output, and executes authorized upload/replace/delete/swap with recovery. A request body cannot supply an arbitrary bucket/path or alter a filename to another owner. Do not modify the unrelated `monkeyschool` bucket or its app permissions. There are currently no storage.objects policies; public-bucket downloads work independently of row SELECT policies. If future direct client uploads are introduced, require a separately reviewed policy covering INSERT+SELECT+UPDATE for replacements, DELETE and both source/destination paths for moves; do not add that direct upload path in this change.

## RPC and system access

| Function class | Who can call | Required guard |
| --- | --- | --- |
| Policy identity/link/history helpers | Approved authenticated policies/private internal callers; narrow public definition helpers where necessary | `auth.uid()` bound in function, current active role/link, no caller-supplied actor; fixed search path, reviewed owner/EXECUTE |
| Existing `maintain_*`, `signup_member`, `merge_members`, `decide_achievement`, `save_profile`, `coder_action`, `join_*` cores | Service role from verified operation APIs only | Server-derived actor; database current-role/target/link checks; constrained fields and transaction state; no browser/public EXECUTE |
| Attendance date/stat functions | Mentor global stats; authorized own/child/calendar reader | Remove anonymous/global authenticated EXECUTE unless function itself enforces the appropriate scope; exact projection only |
| Private identity binding table | Dedicated internal identity lifecycle, not browser or ordinary mentor CRUD | One-to-one mapping, protected backfill, no self-rebinding, no public schema exposure |
| Legacy import retained during migration | Existing implementation unchanged until production cutover by explicit user decision | At production remove CopyData/legacy read routes, verify reconciliation and no runtime dependencies, retain recovery backup, then decommission old database; not ordinary mentor CRUD |
| Kiosk/device attendance | Existing F03 service-backed API contracts, unchanged for third-party hardware kiosk | Accepted known vulnerability: no verified actor/device boundary on existing identifier/manual attendance requests; do not harden as F03 remediation |

Service role is not a user role and is never sent to browsers. Mentors' full app rights do not include changing auth platform bindings, database schema, audit integrity or public-service keys.
