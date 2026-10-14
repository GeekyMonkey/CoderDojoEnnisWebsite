## Navigation
Role sections remain in Mentor, Parent, Coder order. Their Home link is recognised by its role-root destination, rather than translated text, and is pinned first. Remaining items are sorted by translated labels. For English, Mentor becomes: Mentor Home, Attendance, Coders, Maintenance, Mentors, Parents, Reports, Sign In Mode.

Sessions is removed from all three role sections. A single Calendar link is placed in the sidebar footer immediately above the existing member-name menu. It is shared navigation, without a role heading or role duplication. It participates in the existing navigation filter: when it matches, it stays in that bottom position; when it does not, it is hidden. The no-matches state considers both role options and this shared link. The member-name/preferences menu is never filtered.

The shared Calendar destination is included in the unfiltered page-title map. Existing non-clickable role headings, separators, translated sorting, submenu search behavior, and mobile drawer behavior remain intact.

## Shared member routes
Add `/member/**` to the member layout's route rules and existing authentication middleware. Add the shared prefix to the existing logout and browser-history protection so logged-out or expired sessions cannot keep using a protected view through back/forward history.

The namespace has no Mentor, Parent, or Coder requirement at page-entry level. Existing API checks remain authoritative for each operation. Navigation role flags or editable user metadata do not grant server permissions.

When the current route is under `/member`, the club logo and profile action must resolve to an existing role Home/profile using Mentor, Parent, Coder precedence, rather than inventing missing `/member/profile` or `/member` pages. No additional shared pages beyond Calendar are introduced in this change; future `/member/**` pages follow the same shared-access convention.

## Own session calendar
Create `/member/calendar` with store-owned queries shared by all roles. The default Future tab contains today and later dates in ascending order. The Past tab contains dates from one calendar year before today, inclusive, up to yesterday, in descending order. Compute bounds in Europe/Dublin with the existing leap-day clamp. Use a deterministic ID tie-breaker for equal dates. Replace includePast in the API/query cache with a validated view=future|past contract; never download future entries for the Past list or old history for Future.

Highlight the first visible item in each ordered tab after permission filtering. It may be a note; use an accent border/marker and a short Next or Most recent label while retaining the type's background. Empty lists have no highlight. Pods remain above the tabs' dated list and do not affect the highlighted entry. Keep keyboard-accessible tab selection, distinct selected/focus styles, and mobile support.

Keep sessions date-only. Do not add start/end inputs or clock-based attendance gates. The assumed start is 10:00; exceptions belong in the optional description. Keep the concise empty-session state, without a Google iframe/link/fallback. Public pages are outside this change.

Dated entries have sessionType with exact values CODING, MENTOR_PLANNING, or NOTE, replacing their mentorsOnly field. The editor defaults to Coding. Display labels and icons are translated: code icon for Coding, people icon for Mentor planning, megaphone for Note. Notes have a different theme-variable background, including when highlighted. Mentor planning retains a distinct style and text label. Coding defaults to Coding Session; blank topics for other types use Mentor planning or Note. Topic defaults follow the selected type without overwriting entered custom topics.

Mentors retain create/edit/confirmed soft-delete controls, bounded validated text, and revision-based stale-write protection. Editing dates/types or deleting entries must never move or remove attendance. General CODING/NOTE entries are readable by every active member role; only current DB-verified mentors can read MENTOR_PLANNING, through both APIs and direct RLS reads. Refresh type-sensitive caches and realtime invalidations on edits, including changes from general to private and back. Audit the generic sessions read endpoint and compatibility model so removed boolean fields do not leak private entries or silently drop types.

Create a new forward migration; the previous migration has already been applied and must not be rewritten. Backfill existing mentors_only=false entries to CODING and true entries to MENTOR_PLANNING, preserving IDs, dates, topics, descriptions and deletion state. Rotate revisions so pre-amendment editors cannot overwrite migrated data. Update management RPC validation, RLS, grants, generated types, and metadata-only invalidation recipients to derive privacy from sessionType. Remove the redundant dated-session mentors_only column after replacing its dependencies. Keep session_pods.mentors_only and existing pod controls unchanged.

Confirmed same-date policy: multiple entries of any type may share a date, including multiple CODING entries. Remove global date uniqueness and do not add per-type date uniqueness. Keep independent IDs and revision checks for each row; editing/deleting one entry must not affect its neighbours. Use an ordinary date index for date filtering and stable date/ID ordering.

The one-time cutover import still replaces historical coding data for dates present in the import. For each imported date, replace the matching CODING entries with the imported historical coding entry; preserve all NOTE/MENTOR_PLANNING entries and all entries on dates absent from the import. This preserves all preloaded future entries, including multiple coding entries on one date. Use fresh IDs for imported records so legacy IDs cannot overwrite preserved rows. Update the import transaction to work without ON CONFLICT(session_date); date is no longer a unique record identity. Attendance remains one record per member/date regardless of how many calendar entries share that date.

All UI reads/writes stay behind stores with strict shared DTOs. Update all six Bruno requests and focused API/SQL/UI-helper tests for the new contracts. No new dependency is required.

## Pods above sessions
Render permitted active/unexpired pods above dated sessions using the existing pod stores and join behavior. Resolve capabilities from the loaded current profile, with Mentor, Parent, Coder precedence, and follow profile changes. When no permitted pods exist, omit the pod section and its heading; never show "no pods" text. Mentor Add pod remains available independently of pod count and the selected Future/Past tab.

Preserve pod rules: valid URL, required active mentor host, optional distinct active second mentor, current Dublin date, 150-minute expiry on creation/edit, private visibility, soft deletion, snapshot validation, and idempotent daily attendance on join. Pod joining continues to record today's attendance, never the date of a future calendar entry. Existing pod editors stay under `/mentor/sessions/new` and `/mentor/sessions/:sessionId`; their breadcrumbs/cancel/delete returns target `/member/calendar`. Label pod and dated-session actions distinctly.

## Attendance isolation and date cutoff
The base implementation verified that attendance date/statistics RPCs read member_attendances rather than planned sessions. Attendance has no session foreign key. Its future-date cutoff and write safeguard are already implemented. The existing sessions date uniqueness belongs to the base implementation and will be removed by the amendment's forward migration. See verification.md for the base results; the amendment must preserve date-based attendance and use the multiple-entry cutover rules above.

Planning, editing, deleting, or viewing a session must never insert, move, delete, or count attendance. Preserve date-based sign-in when no calendar session was pre-created. Exclude dates later than Dublin today in attendance RPCs and server selectors before choosing the current/most-recent date or calculating attendance aggregates. Audit attendance reports, member counts/milestones, explicit-date/range endpoints, and client selectors for alternate paths; apply the same cutoff to attendance reads/counts and reject attempts to mark future attendance present. Keep removal/correction of erroneous future attendance possible through authorised maintenance, without making it visible as a started session. Do not delete historical attendance or generate zero-attendance rows for planned dates.

Today's sessions are eligible throughout today, including before 10:00; the user requested a date cutoff rather than a start-time check. An existing future attendance row must not override today's/latest past attendance or inflate totals. With no qualifying attendance dates, preserve the existing empty state rather than selecting a future calendar date.

## Route consolidation
Remove the three previous session-list pages and use `/member/calendar` for all internal list links. The site has not been used, so no compatibility redirects or bookmark migration are needed. Existing mentor editor routes continue to work.

The Coders directory label and `/mentor/coders` rename were separately authorised during planning; they are not held behind this proposal. The old `/mentor/members` page is removed.

## Verification
Check Home-first behavior for all roles in all supported languages, remaining alphabetical order, one shared Calendar link, filter/empty-result behavior, footer placement, title lookup, and desktop/mobile layouts.

Check canonical Calendar access for each role and a multi-role account; calendar date filters, mentor CRUD/private visibility, pod placement and creation with none present, attendance independence; removal of the three old list pages and absence of compatibility redirects; logo/profile destinations on shared pages; and signed-out, expired-session, logout, and back/forward protection for `/member/**`.

Run appropriate focused checks and an available production build. Do not run the repository's format or test scripts automatically. Preserve all unrelated pending changes.

Add focused regression checks for today/tomorrow and Dublin midnight, one-year/leap-day boundaries, multiple entries on the same date and stale edits, non-mentor mutation denial and private-session read denial through all endpoints/RLS, deleted sessions, and stored future attendance rows. Prove that a future session without attendance does not change current attendance, date filters, counts, milestones, or reports; that future attendance is excluded; and that today's sign-in still works with or without a pre-created calendar entry.

## Amendment status
Base Calendar verification remains recorded in verification.md. The Future/Past tabs, highlight, and typed entries are proposed additions and are not implemented yet. The user confirmed multiple entries of every type on the same date. Only approval of the revised amendment remains pending.

## Reusable component and public feed (approved)
`SessionCalendar` defaults to a read-only public feed and has optional member/pod/management props. It contains no page layout or auth middleware. `useMemberCalendarStore` owns both public and member TanStack Query reads, keyed by audience/identity/roles and selected tab. The public API always uses the anonymous database client; column grants and RLS expose only coding/note presentation fields within the supported date window. Pods, revisions, hosts, joins and management remain protected. Anonymous updates are picked up by store polling; authenticated updates also use existing private metadata invalidations. Logout switches to the public key and immediately guards private cached content.
