# Shared member Calendar verification

Implemented on develop, 2026-10-14. All unrelated staged work was preserved; no commit or push was made for this implementation.

## Delivered
- `/member/calendar` replaces the three role session-list pages without legacy redirects. The Calendar link is above the member-name menu, participates in filtering, and does not repeat within role sections. Each role Home comes first; the remaining entries stay alphabetic.
- Shared member routes receive member layout, authentication, expiry/logout/history protection, and valid role Home/profile destinations.
- Date-only sessions include today and future dates by default, with a checkbox extending the lower bound by one calendar year. Default topic: Coding Session. Descriptions carry any exceptions to the assumed 10:00 start.
- Mentor session create/edit/confirmed soft-delete uses strict contracts, fresh DB mentor checks, revision conflicts, private/no-store reads, and RLS. Private sessions and pods have a visible text label and alternate styling.
- Active pods appear first. Empty pod sections are omitted; mentor Add pod remains available. Existing pod host/URL/expiry/private/join rules remain intact. Fixed the existing optional-host select's empty-string item, which Nuxt UI rejects, so adding a pod with no second host works.
- Attendance dates, current-session selection, statistics, histories/counts and sign-in milestones exclude future dates. Future attendance writes are rejected by a database trigger. Calendar CRUD never writes attendance.
- One-time session import merges by date, replaces matching dates and preserves unmatched preloaded rows and fields. It ignores incoming legacy IDs to prevent collisions with preserved entries. Other cutover clearing behavior remains unchanged.
- All six new endpoints have Bruno requests in bruno/CoderDojoEnnisApis/Calendar.

## Automated checks
- 61 focused tests passed across eight files: memberCalendar SQL fixtures, MemberCalendarData, shared Calendar endpoint boundaries, CalendarDates, memberNavigation, auth.global, kiosk-navigation, and atomicAttendance.
- Real PostgreSQL behavior exercised with PGlite: mentor/non-mentor/archived permissions; direct authenticated RLS reads and write denial; duplicate dates; stale edits/deletes; soft deletion/reuse without attendance loss; cutover matching/unmatched dates and ID collisions; future attendance exclusion; idempotent sign-in and pod join; pod privacy/expiry/distinct hosts; metadata-only invalidation.
- Date helpers cover inclusive lower bounds, leap-day year subtraction and Dublin midnight. Endpoint checks cover all three member roles, roleless/expired sessions, strict query validation, and mentor requirements for every management endpoint.
- Production Nuxt build passed (23.8 seconds). OpenSpec strict validation and git diff --check passed.
- Full vue-tsc still reports the existing sessionRecovery.test.ts mock typing and Legacy API/SQL model errors. No Calendar or HostSelect errors were reported; the build passed.

## Browser and HTTP checks
- Authenticated multi-role localhost browser: Home-first role sections, a single correctly placed Calendar footer link, and Calendar-only filtering in the mobile drawer.
- Created a temporary private dated session, edited its description, and confirmed the saved date/text/private presentation. Inspected the explicit delete confirmation; deletion semantics were exercised in the SQL tests.
- Created a temporary private pod using the current mentor as primary host and no second host, then verified its active card above dated sessions. No real pod join was performed in the browser, to avoid creating attendance; joining was exercised in the database fixture.
- Verified the history checkbox includes the permitted past year while retaining future sessions, and that the default empty Calendar has Add pod/Add session with no empty-pod message or Google fallback.
- Verified responsive layout at 375 x 812; mobile action labels become accessible labelled icons so the Calendar title remains visible. Reset the viewport afterwards.
- GET /api/member/calendar without authentication returned HTTP 401.
- Screenshots: /tmp/member-calendar-desktop.jpg shows the cleaned Calendar with past-year sessions enabled. /tmp/member-calendar-mobile.jpg shows the temporary verification cards before cleanup.

## Database and cleanup
- Applied migration 20261014190639_member_calendar.sql to the repository-configured Supabase project, newsofwpimzmfbqsooka. Local migration version matches hosted migration history.
- Security advisors before/after showed no new findings. Existing findings concern the unrelated monkeyschool schema, Auth settings, database version, and intentionally closed private tables.
- Removed only the two temporary verification rows by exact IDs plus their temporary topics. Confirmed both are gone and the original 355 session rows remain. No cutover import was run and no existing attendance was changed.

## Approved session-type/tab and reusable-component amendment
Implemented 2026-10-14. The earlier sections record base verification; the following supersedes the checkbox, duplicate-date, and private-flag behavior described above.

- Future defaults to today onward ascending; Past covers the previous calendar year through yesterday descending. Equal dates use an ID tie-breaker. The first permitted entry is highlighted and labelled Next/Most recent, including notes, without changing note background.
- Dated entries now use CODING, MENTOR_PLANNING, or NOTE; type selector, icons and translated labels replace the mentor-only toggle. Multiple entries of every type on a date are independent. Pods retain their original visibility fields and management rules.
- `SessionCalendar` is reusable without an authenticated page layout. Default `<SessionCalendar />` is public/read-only; member dashboard opts into `memberMode`, `showPods`, and `showManagement`. All API access remains in `useMemberCalendarStore`, using TanStack Query audience/role/tab keys, shared caching, invalidation and polling. Components contain no direct API reads.
- `/api/calendar` uses the anonymous client regardless of supplied Authorization. Anonymous column grants/RLS expose only coding/note display fields within the supported year window. Public mode excludes pods, management/revisions and private planning. Logout immediately strips private cached data and selects the public query.
- Forward migration `20261014210009_calendar_entry_types.sql` applied to configured project `newsofwpimzmfbqsooka`; version matches hosted history. Backfill preserves IDs/dates/content/deletion/privacy and rotates revisions. Date uniqueness removed. Import replaces all matching coding entries on imported dates, preserving notes/planning and unmatched preloaded entries. Attendance stays date-based and unchanged by Calendar entries.
- 81 focused tests passed across 12 files, covering migration backfill, anonymous/RLS/write denial, type transitions and invalidations, multiple entries, stale updates, import preservation, date ordering/bounds, real TanStack Query deduplication/logout, APIs, attendance, pods and navigation.
- Production build passed in 23.7 seconds. Full vue-tsc reports only existing sessionRecovery mock and Legacy API/SQL typing errors; no new Calendar errors. Strict OpenSpec validation and git diff --check passed.
- Browser: added coding/note entries on the same date, verified type choices/default topics, private planning styling, code/people/megaphone icons, keyboard tab switching, newest-first history and highlighted note styling. A temporary public preview embedded only `<SessionCalendar />` outside member layout and showed no planning or edit controls. Logged-out behavior is additionally covered by the real-query store tests and unauthenticated HTTP checks.
- Public HTTP future/past feeds returned 200 with safe columns, no pod or planning data; protected member feed remains authenticated.
- Removed only the four temporary verification rows by exact ID/topic and the temporary preview source. Original session count remains 355, with identical before/after content/privacy hash `8c2604c5d4c7e55302f74f22a238f8e6`. No cutover import or attendance changes were performed on hosted data. Screenshot of temporary type examples: `/tmp/member-calendar-types.jpg`.
- Security advisors showed the same existing unrelated findings.
- All work remains uncommitted/unpushed on develop; unrelated staged changes preserved.

Amendment mobile recheck limitation: the current browser viewport override did not change the automation tab dimensions, so the new cards were inspected at desktop width only. The earlier base mobile check remains recorded above; a fresh phone-width check is still pending.
