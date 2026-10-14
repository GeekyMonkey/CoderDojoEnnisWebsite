# Change: Calendar tabs and session types

## Why
Members need a clear separation between upcoming and past entries. The Calendar also needs to distinguish coding sessions, private mentor planning, and announcements such as cancelled sessions.

The shared Calendar base implementation is already complete on develop. This amendment updates that implementation; the existing navigation, member access, attendance safeguards, and pod rules remain in scope as recorded in the specs and verification.md.

## What Changes
- Replace the history checkbox with Future and Past tabs. Future is the default: today onward, ascending. Past covers the previous calendar year through yesterday, descending. All date boundaries use Europe/Dublin.
- Highlight the first visible entry in each tab: Next in Future and Most recent in Past. Select the highlight after permission filtering. Equal dates use stable ID ordering; notes can be highlighted without losing their note background. Pods do not consume this highlight.
- Replace the dated-entry mentor-only checkbox with a session type selector: CODING, MENTOR_PLANNING, or NOTE. Coding is the default type, with Coding Session as its default topic. Type defaults do not overwrite custom topics.
- Show each type with an icon and translated text label: code for Coding, people for Mentor planning, and megaphone for Note. Notes have a distinct background in all supported themes.
- Allow multiple entries of every type on a given date, including multiple coding sessions. Each has its own ID, content, type, and revision, and can be edited or deleted independently.
- Keep mentor planning visible only to current mentors, enforced through APIs and database policies. Coding and notes are visible to all member roles. Mentors retain all create/edit/delete controls.
- Keep entries date-only. 10:00 remains the assumed coding-session start; exceptions belong in the description. Notes are informational: announcing cancellation does not automatically change attendance or another entry.
- Preserve active pods above the dated list, the always-available mentor Add pod action, and existing pod host/URL/expiry/join/private rules. Pod visibility keeps its existing mentor-only control.

## Migration and cutover
Add a new forward migration; do not rewrite the applied base migration. Existing general entries become CODING and existing mentor-only entries become MENTOR_PLANNING. Preserve IDs, dates, topics, descriptions, and deletion state. Rotate revisions to reject old editor drafts.

Remove session-date uniqueness without adding uniqueness by type. Update management RPCs, read contracts, RLS, realtime privacy, generated database types, stores, translations, and Bruno requests together.

The one-time legacy import replaces matching historical CODING entries by imported date. Notes and planning entries are preserved, as are all entries on dates absent from the import. This includes multiple preloaded future entries sharing one date. Imported records use fresh IDs so they cannot overwrite preserved rows through ID collisions. Other cutover data can still be cleared and replaced.

Attendance remains date-based and independent of the number or type of Calendar entries. Future dates still do not count as started attendance.

## Scope and verification
Affected specs: member-calendar, shared-member-pages, and the existing member-dashboard-ui delivery in this change.

Verify disjoint tab windows and sort directions; year/leap-day/Dublin date boundaries; leading-entry highlighting after permission filtering; note styles/icons; multiple entries of each type on one date; independent edits/deletes; migrated privacy/content; type transitions and stale writes; cutover preservation; unchanged attendance and pod rules; mobile and keyboard behavior.

Run focused tests, a production build, strict OpenSpec validation, and update verification notes. No new dependency is planned. Public pages and unrelated staged work remain untouched.

## Status
The user confirmed multiple entries of any type on the same date. The revised proposal passes strict validation and awaits approval. No code or database changes have been applied for this amendment.

The session-type/tab amendment is approved, including a reusable Calendar component that also works logged out. Public reuse uses the same TanStack Query store with an anonymous, read-only coding/note feed; member pages retain private planning, pods and mentor controls according to current authorization.
