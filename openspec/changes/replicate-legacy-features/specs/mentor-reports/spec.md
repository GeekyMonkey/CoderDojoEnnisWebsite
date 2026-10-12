## ADDED Requirements

### Requirement: Mentor reports
The system SHALL provide mentor-only recent belt awards, belt CSV, parent email CSV and mentor email CSV using client stores with realtime invalidation. Recent belts SHALL default to the last two years, allow an inclusive start date, show names, photos, belt colours, award dates, notes and attendance/registration indicators, and link to member details. Email reports SHALL include active members with the relevant role and a nonempty email, ordered by first and last name. Archived belt definitions SHALL remain visible in recorded awards. Report queries SHALL use single reads suited to the small tables.

#### Scenario: Recent awards and exports
- **WHEN** a mentor selects an award start date
- **THEN** the report shows active members' awards on or after that date, newest first
- **AND** the CSV contains first name, last name, belt, award date and notes for all report results regardless of preview search

#### Scenario: Email exports
- **WHEN** a mentor downloads a parent or mentor email report
- **THEN** the CSV contains first name, last name and email address for active members with that role and a nonempty email

#### Scenario: Guarded reports
- **WHEN** a caller lacks a current active mentor role or supplies malformed filters
- **THEN** the server rejects the request and returns no report data

#### Scenario: Remote updates and CSV content
- **WHEN** another user changes a member, belt definition or award
- **THEN** the store refreshes the report
- **AND** downloaded CSV preserves Unicode, commas, quotes and multiline notes while protecting against spreadsheet formula execution
