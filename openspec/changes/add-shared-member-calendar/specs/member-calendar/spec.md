## ADDED Requirements

### Requirement: Date-only session list
Calendar SHALL provide Future and Past tabs, defaulting to Future. Future SHALL include today and later dates ascending. Past SHALL include dates from one calendar year ago through yesterday descending. Date bounds SHALL use Europe/Dublin, with inclusive year subtraction clamped for leap days and a stable ID tie-breaker for equal dates. The tabs SHALL replace the history checkbox.

#### Scenario: Default future dates
- **GIVEN** entries exist yesterday, today, and tomorrow
- **WHEN** Calendar opens
- **THEN** Future is selected with today before tomorrow and yesterday excluded

#### Scenario: Past year in reverse order
- **WHEN** Past is selected
- **THEN** yesterday appears before older entries
- **AND** dates exactly one calendar year ago are included, while older dates, today, and future dates are excluded

### Requirement: Highlight the leading visible entry
The first permitted entry in each ordered tab SHALL be highlighted with a visible Next or Most recent indicator. Permission filtering SHALL happen before highlight selection. A leading note SHALL retain its note background while highlighted. Empty lists SHALL have no highlight, and pods SHALL NOT affect which dated entry is highlighted.

#### Scenario: Next visible entry
- **GIVEN** a hidden mentor planning entry precedes a coding entry visible to a non-mentor
- **WHEN** that member opens Future
- **THEN** the coding entry is highlighted without disclosing the hidden entry

#### Scenario: Most recent past entry
- **WHEN** a member opens Past
- **THEN** its first visible entry is highlighted as Most recent

#### Scenario: Highlighted note
- **WHEN** a note is the first visible entry in a tab
- **THEN** the highlight is shown while its note background and note icon remain distinguishable

### Requirement: Session fields without time inputs
Sessions SHALL have a date, topic, optional description, and sessionType selected from CODING, MENTOR_PLANNING, or NOTE. CODING SHALL be the default type and default to the topic "Coding Session". The dated-entry type selector SHALL replace its mentor-only checkbox. There SHALL be no stored start/end times or time inputs; 10:00 is assumed and exceptions can be described in the description. The usual start-time message SHALL appear once above the Future list and SHALL NOT appear on individual cards or the Past tab.

#### Scenario: Topic and description
- **WHEN** a mentor creates a session without choosing a different topic
- **THEN** its topic defaults to "Coding Session"
- **AND** a description can explain a different start time without adding a time field

### Requirement: Mentor session management and privacy
Only active DB-verified mentors SHALL create, edit, or delete dated sessions. The system SHALL allow multiple entries of every type on a given date, with independent IDs and revisions, validate input, reject stale edits/deletes, and confirm deletion. Removing or changing a calendar session SHALL NOT remove or move attendance. Deleted sessions SHALL be excluded from Calendar.

#### Scenario: Mentor manages sessions
- **WHEN** an active mentor adds, edits, or confirms deletion of a session
- **THEN** the Calendar refreshes to show the saved state
- **AND** attendance records remain unchanged

#### Scenario: Multiple entries on one date
- **WHEN** a mentor adds multiple coding, planning, or note entries for the same date
- **THEN** every entry is saved independently without a duplicate-date error
- **AND** editing or deleting one does not change the others or attendance

#### Scenario: Stale edit
- **WHEN** a mentor submits an outdated edit snapshot
- **THEN** the operation fails with a useful error and does not overwrite existing data

### Requirement: Session types and private planning
MENTOR_PLANNING entries SHALL be unreadable by non-mentors through API and direct database reads. CODING and NOTE entries SHALL be readable by every active member role without prior attendance. Each type SHALL have a translated label and appropriate icon. Notes SHALL use a distinct background in every supported theme. Non-mentor mutations SHALL remain denied.

#### Scenario: Type selector
- **WHEN** a mentor creates or edits a dated entry
- **THEN** the type selector offers Coding, Mentor planning, and Note with exact stored values CODING, MENTOR_PLANNING, and NOTE
- **AND** no separate mentor-only toggle is shown for that entry

#### Scenario: Planning privacy and type changes
- **WHEN** an entry becomes MENTOR_PLANNING
- **THEN** non-mentors can no longer read it through any API or direct database read
- **AND** their cached lists refresh without private content in invalidations

#### Scenario: Informational notes
- **WHEN** a mentor creates a NOTE announcing a cancelled session
- **THEN** members see its note label, megaphone icon, and distinct background
- **AND** the note does not automatically change attendance or other calendar entries

#### Scenario: Type icons
- **WHEN** Calendar shows coding, planning, and note entries
- **THEN** they use code, people, and megaphone icons respectively alongside text labels

### Requirement: Preserve existing entries when introducing types
A forward migration SHALL map the existing dated-session mentors_only false values to CODING and true values to MENTOR_PLANNING, preserving IDs, dates, topics, descriptions, and deletion states. Revisions SHALL change to reject stale pre-migration drafts. Pod visibility fields and existing pod management rules SHALL remain unchanged.

#### Scenario: Backfill privacy and content
- **WHEN** the type migration runs
- **THEN** existing private entries remain private planning entries and general entries become coding entries
- **AND** stored content and IDs are preserved

### Requirement: Pods above sessions without empty messages
Calendar SHALL display permitted active pods above dated sessions only when such pods exist. It SHALL NOT show an empty-pod message or heading. Mentors SHALL have Add pod available even when there are no pods. Existing pod host, URL, expiry, visibility, edit/delete, and daily join-attendance rules SHALL be preserved, independently of the selected tab.

#### Scenario: No pods
- **WHEN** no permitted active pods exist
- **THEN** the pod list and heading are omitted without an empty-pod message
- **AND** mentors can use Add pod

#### Scenario: Pods exist
- **WHEN** permitted active pods exist
- **THEN** they appear above dated sessions
- **AND** joining records attendance for today using the existing idempotent rule

### Requirement: Future dates do not count as started attendance
Attendance current-session selection, session-date filters, statistics, reports, member counts, and milestones SHALL exclude dates after today in Europe/Dublin. Calendar planning and CRUD SHALL NOT create attendance. Today's attendance SHALL remain supported whether or not a calendar session was pre-created.

#### Scenario: Planned future session
- **GIVEN** a future calendar session exists without attendance
- **WHEN** attendance views and counts are loaded
- **THEN** the planned date does not become the current session or appear in attendance date filters or totals

#### Scenario: Existing future attendance
- **GIVEN** attendance exists today or earlier and an erroneous attendance row exists tomorrow
- **WHEN** current-session selectors, filters, counts, or reports are loaded
- **THEN** tomorrow is excluded and the latest eligible date is used

#### Scenario: Sign in today
- **WHEN** a member signs in today with or without a pre-created calendar session
- **THEN** attendance is recorded for today using existing idempotency and milestone rules
- **AND** future calendar entries remain unchanged

### Requirement: Attendance write dates
Future presence writes SHALL be rejected while authorised correction/removal of erroneous future records remains possible. This is a date cutoff and SHALL NOT gate today's attendance on the assumed 10:00 time.

#### Scenario: Future presence attempt
- **WHEN** an attendance request attempts to mark a member present after today
- **THEN** it is rejected without inserting future attendance

### Requirement: Preserve unmatched sessions at cutover
The one-time legacy cutover import SHALL create or replace CODING entries by imported date, preserving unmatched coding entries and all NOTE/MENTOR_PLANNING entries with their fields and IDs. It SHALL support multiple entries per date and SHALL NOT overwrite preserved entries through ID collisions. Other imported data MAY retain clear-and-replace behavior.

#### Scenario: Preserve a preloaded future session
- **GIVEN** a future session was entered before cutover and its date is absent from the legacy import
- **WHEN** the cutover import runs
- **THEN** that session and all its fields remain unchanged

#### Scenario: Replace an imported date
- **GIVEN** an existing CODING entry shares a date with an imported session
- **WHEN** the cutover import runs
- **THEN** the imported historical coding entry replaces the matching coding entries for that date
- **AND** notes and planning entries on that date remain unchanged
- **AND** multiple preloaded entries on dates absent from the import remain unchanged

#### Scenario: Other cutover data
- **WHEN** the one-time import clears and replaces other imported data
- **THEN** the session preservation exception does not change that behavior

### Requirement: Reusable public Calendar component
The Calendar SHALL be reusable on other pages without an authenticated layout or login requirement. Its default public mode SHALL show only coding and notes, with no pods, private planning, revisions, or management controls. Components SHALL obtain data through the shared TanStack Query store, which owns queries, caching, invalidation, and mutations. Member mode SHALL retain authenticated visibility and optionally expose pods and mentor management.

#### Scenario: Logged-out reuse
- **WHEN** a page embeds the default Calendar while logged out
- **THEN** Future/Past tabs and permitted public entries work through the store
- **AND** anonymous database reads cannot access private planning or management fields

#### Scenario: Multiple Calendar instances
- **WHEN** two public Calendar instances request the same tab
- **THEN** TanStack Query shares their cached request
- **AND** each component can choose its tab independently

#### Scenario: Logout
- **WHEN** a member Calendar loses authentication
- **THEN** private entries and management controls disappear immediately and subsequent reads use the public feed
