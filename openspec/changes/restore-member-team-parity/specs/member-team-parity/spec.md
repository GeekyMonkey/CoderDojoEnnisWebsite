## ADDED Requirements

### Requirement: Directory context and reusable profile controls
The system SHALL display coder team logos, earned belts and latest-session presence, and provide safely encoded external profile links and shared validated image-picker/drop/crop controls across roles and entities. Pending belt application lists SHALL omit the current belt.

#### Scenario: Presence changes in another session
- **WHEN** another mentor records attendance
- **THEN** the directory photo outline and status update through query-store invalidation without refreshing the page

#### Scenario: External handle display
- **WHEN** a viewed member has a GitHub, Scratch or Xbox handle
- **THEN** its reusable link targets the service's HTTPS destination with an encoded handle

### Requirement: Atomic signup attendance
The system SHALL create a member and optional attendance record atomically using a validated explicit date. Coder signup SHALL default to attended today, while signup from attendance SHALL use the selected session.

#### Scenario: Invalid attendance date
- **WHEN** signup requests an invalid or future attendance date
- **THEN** the server rejects it and no member or attendance row is created

### Requirement: Reachable and stable relationships and categories
The system SHALL provide access to every eligible relationship search result and stable first-name, surname and identity ordering, and SHALL display and search badge category labels with a fallback for unavailable categories.

#### Scenario: More than twenty relationship matches
- **WHEN** a search matches more than twenty eligible people
- **THEN** the result count and load-more control make every matching person reachable

### Requirement: Concurrent team images
The system SHALL restrict team image writes to current mentors, validate actual cropped PNG content, publish immutable storage objects with an expected-revision check, and refresh shared image metadata across clients.

#### Scenario: Simultaneous uploads
- **WHEN** two mentors upload against the same team image revision
- **THEN** exactly one revision is published and the losing writer receives a conflict without replacing the winner's object

### Requirement: Team print previews
The system SHALL provide separate team-card and member-ID previews, with current team membership, images, awarded belts, badge category counts and compact member UUID QR codes. Print controls SHALL wait for required card queries and QR generation.

#### Scenario: Print team member IDs
- **WHEN** a mentor chooses Print IDs on a team
- **THEN** the preview includes one printable ID per active assigned member ordered by name

#### Scenario: Print team card
- **WHEN** a mentor chooses Print team card
- **THEN** the preview uses an A6 landscape layout with team colour, logo, name and assigned members
