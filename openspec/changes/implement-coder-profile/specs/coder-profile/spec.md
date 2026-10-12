## ADDED Requirements
### Requirement: Own coder profile context
The system SHALL retain the reusable My Profile editor and display birth year, team image/goal, teammates and an own passport link, using the legacy Member/Profile screen as the baseline.

#### Scenario: Assigned coder opens profile
- **WHEN** the coder views their profile
- **THEN** the current team and sorted public roster are displayed through a realtime-backed store

#### Scenario: Unassigned coder
- **WHEN** the coder has no active team
- **THEN** the page advises contacting a mentor for assignment

### Requirement: Restricted teammate display
The system MUST only return an active teammate profile when the verified coder belongs to the same active team. It SHALL expose public identity, birth year, image flags, external handles and earned achievement descriptions/dates without contact details, credentials, application evidence or team maintenance notes.

#### Scenario: Unrelated member requested
- **WHEN** a coder requests a member outside their own team
- **THEN** the API returns 404

### Requirement: Coder passport
The system SHALL reuse the passport card with own-member achievement queries and scanner-compatible QR output.

#### Scenario: Passport data loads
- **WHEN** a coder opens the passport page
- **THEN** their own card is displayed and printing stays disabled until QR and award queries finish
