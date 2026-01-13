# mentor-attendance-page Specification

## Purpose
TBD - created by archiving change add-mentor-attendance-page. Update Purpose after archive.
## Requirements
### Requirement: Mentor attendance page provides session controls
The system SHALL render a mentor attendance management page at `/mentor/attendance` that provides header controls for session selection, inclusion filtering, and searching.

#### Scenario: Mentor opens the page
- **WHEN** a user navigates to `/mentor/attendance`
- **THEN** the page SHALL show a session date selector populated with all known attendance session dates in descending order
- **AND** the most recent session date SHALL be auto-selected
- **AND** the page SHALL show an “Include” selector with options: `Present Members`, `Registered Members`, `All Members`
- **AND** the default “Include” selection SHALL be `Registered Members`
- **AND** the page SHALL show a search input that filters the displayed member rows

#### Scenario: Include selector updates when date changes
- **GIVEN** the page has loaded session dates and the “current session date”
- **WHEN** the selected session date changes
- **THEN** the “Include” selection SHALL change to `Present Members` if the selected date is not the current session date
- **AND** the “Include” selection SHALL change to `Registered Members` if the selected date is the current session date

### Requirement: Page uses stores for all API interactions
The system SHALL perform all API interactions required by the mentor attendance page via functions exposed by the relevant client-side stores, and the page SHALL NOT call attendance-related APIs directly.

#### Scenario: Page loads data through stores
- **WHEN** the mentor attendance page needs session dates, current session data, attendance for a selected date, or member/team/belt data
- **THEN** the page SHALL call the relevant store function(s) to load that data
- **AND** the store(s) SHALL own any cache invalidation, query invalidation, or realtime refresh behavior

### Requirement: Mentor attendance page shows a members table with fixed header and footer
The system SHALL display two Nuxt UI tables beneath the header controls:
- a coders table
- a mentors table (beneath the coders table)

Both tables SHALL list members according to the selected filters and provide a fixed header and fixed footer.

#### Scenario: Mentor views the coders table
- **WHEN** the page is displayed
- **THEN** the coders table SHALL include a first column that indicates whether each coder is present for the selected session date
- **AND** the coders table SHALL include columns: `Name`, `Photo`, `Team`, `Belt Color`
- **AND** the coders table header SHALL be fixed while the coders table body scrolls
- **AND** the coders table footer SHALL be fixed while the coders table body scrolls

#### Scenario: Mentor views the mentors table
- **WHEN** the page is displayed
- **THEN** the mentors table SHALL include a first column that indicates whether each mentor is present for the selected session date
- **AND** the mentors table SHALL include columns: `Name`, `Photo`
- **AND** the mentors table header SHALL be fixed while the mentors table body scrolls
- **AND** the mentors table footer SHALL be fixed while the mentors table body scrolls

### Requirement: Members table supports sorting
The system SHALL support sorting for both tables.

#### Scenario: Mentor sorts by name
- **WHEN** the mentor selects sorting by name
- **THEN** the selected table rows SHALL be ordered by member name

#### Scenario: Mentor sorts by team
- **WHEN** the mentor selects sorting by team
- **THEN** the coders table rows SHALL be ordered by team

#### Scenario: Mentor sorts by belt color
- **WHEN** the mentor selects sorting by belt color
- **THEN** the coders table rows SHALL be ordered by belt color

#### Scenario: Mentor sorts by present
- **WHEN** the mentor selects sorting by present
- **THEN** present members SHALL appear before not-present members
- **AND** within each present/not-present group, members SHALL be ordered alphabetically by name

#### Scenario: Mentor sorts mentors by present
- **WHEN** the mentor selects sorting by present in the mentors table
- **THEN** present mentors SHALL appear before not-present mentors
- **AND** within each present/not-present group, mentors SHALL be ordered alphabetically by name

### Requirement: Include filter determines the displayed population
The system SHALL filter which members are displayed in both tables based on the selected “Include” value.

#### Scenario: Include is Present Members
- **GIVEN** a session date is selected
- **WHEN** the “Include” selection is `Present Members`
- **THEN** the coders table SHALL display only coders who are present for that session date
- **AND** the mentors table SHALL display only mentors who are present for that session date

#### Scenario: Include is Registered Members
- **WHEN** the “Include” selection is `Registered Members`
- **THEN** the coders table SHALL display only coders whose `registeredCurrentTerm` flag is true
- **AND** the mentors table SHALL display only mentors whose `registeredCurrentTerm` flag is true

#### Scenario: Include is All Members
- **WHEN** the “Include” selection is `All Members`
- **THEN** the coders table SHALL display all non-deleted coders
- **AND** the mentors table SHALL display all non-deleted mentors

### Requirement: Search filters the displayed rows
The system SHALL provide a search input that filters the displayed rows in both tables.

#### Scenario: Mentor searches by name
- **GIVEN** the members table is visible
- **WHEN** the mentor enters a search string
- **THEN** the coders table SHALL only display coders whose name matches the search string
- **AND** the mentors table SHALL only display mentors whose name matches the search string

### Requirement: Presence toggle updates attendance via API
The system SHALL allow mentors to toggle a member’s attendance for the selected session date by interacting with the presence indicator in the first column of either table.

#### Scenario: Mentor marks a member present
- **GIVEN** a member is currently not present for the selected session date
- **WHEN** the mentor clicks the presence indicator for that member
- **THEN** the page SHALL call a store function that performs `POST /api/MemberAttendance/SetPresent` with `{ memberId, sessionDate, present: true }`
- **AND** the member SHALL be shown as present after a successful response

#### Scenario: Mentor marks a member absent
- **GIVEN** a member is currently present for the selected session date
- **WHEN** the mentor clicks the presence indicator for that member
- **THEN** the page SHALL call a store function that performs `POST /api/MemberAttendance/SetPresent` with `{ memberId, sessionDate, present: false }`
- **AND** the member SHALL be shown as not present after a successful response

### Requirement: Choose Random is available for the most recent session
The system SHALL provide a “Choose Random” action in the coders table footer when the selected session date is the most recent session.

When invoked, the system SHALL select a random present coder and navigate the mentor to that coder’s detail page at `/mentor/coder/[member_id]`.

#### Scenario: Choose Random button is visible
- **GIVEN** the selected session date is the most recent session date
- **AND** there is at least one present coder
- **WHEN** the page is displayed
- **THEN** the coders table footer SHALL display a `Choose Random` button

#### Scenario: Choose Random button is not visible for non-current sessions
- **GIVEN** the selected session date is not the most recent session date
- **WHEN** the page is displayed
- **THEN** the coders table footer SHALL NOT display a `Choose Random` button

#### Scenario: Choose Random button is not visible when there are no present coders
- **GIVEN** the selected session date is the most recent session date
- **AND** there are zero present coders
- **WHEN** the page is displayed
- **THEN** the coders table footer SHALL NOT display a `Choose Random` button

#### Scenario: Choose Random selects a present coder
- **GIVEN** the selected session date is the most recent session date
- **AND** there is at least one displayed member who is present and is a coder
- **WHEN** the mentor clicks `Choose Random`
- **THEN** the page SHALL select one eligible member at random
- **AND** the page SHALL navigate to `/mentor/coder/[member_id]` for the selected member

### Requirement: Footer totals show mentors and coders present
The system SHALL show totals in fixed table footers for mentors present and coders present for the selected session date.

#### Scenario: Footer totals are shown
- **GIVEN** a session date is selected
- **WHEN** the members table is displayed
- **THEN** the mentors table footer SHALL display the count of present mentors
- **AND** the coders table footer SHALL display the count of present coders

