## ADDED Requirements

### Requirement: Inactive account cleanup
The system SHALL allow active mentors to preview and confirm archival of inactive coders and parents without deleting history.

#### Scenario: Legacy eligibility and role protection
- **GIVEN** the current date in Europe/Dublin
- **WHEN** a mentor previews member cleanup
- **THEN** active non-mentor coders with last attendance strictly before one year ago SHALL be selected, using 2000-01-01 when no attendance exists
- **AND** parent accounts with no children remaining active after cleanup SHALL be selected unless they retain an active coder or mentor role
- **AND** an inactive coder with a parent role SHALL be counted only once as a coder
- **AND** accounts already archived SHALL not be selected

#### Scenario: Confirmed archival
- **GIVEN** a reviewed, unchanged preview and explicit confirmation
- **WHEN** the mentor applies cleanup
- **THEN** the selected accounts SHALL be marked deleted atomically
- **AND** attendance, awards, links, skills, images and credentials SHALL remain stored
- **AND** the actual coder and parent counts SHALL be displayed

### Requirement: Current-term registration reset
The system SHALL allow active mentors to preview and confirm resetting current-term registration for coders.

#### Scenario: Legacy registration scope
- **WHEN** a mentor previews registration reset
- **THEN** every registered coder SHALL be selected, including archived and multi-role coders
- **AND** adult-only accounts SHALL not be selected

#### Scenario: Confirmed reset
- **GIVEN** a reviewed, unchanged preview and explicit confirmation
- **WHEN** the mentor applies registration reset
- **THEN** selected current-term registration flags SHALL be cleared atomically and the affected count displayed
- **AND** account roles, history and archival state SHALL remain unchanged

### Requirement: Maintenance authorization and consistency
The system SHALL validate maintenance inputs, require a current active mentor in both API and database, reject stale previews, and refresh related views through stores.

#### Scenario: Stale confirmation
- **GIVEN** attendance, relationships, names, roles or registrations change the affected preview
- **WHEN** a mentor submits the previous revision
- **THEN** the system SHALL return a conflict without partial changes and require a fresh review

#### Scenario: Read-only previews and guarded access
- **WHEN** a preview is loaded or refreshed
- **THEN** no accounts SHALL be changed
- **AND** unauthenticated, inactive or non-mentor actors SHALL not read or apply maintenance
- **AND** anonymous and authenticated database roles SHALL not execute the service-only function

#### Scenario: Shared store and repeat operations
- **WHEN** maintenance succeeds or another client changes relevant records
- **THEN** TanStack Query stores SHALL invalidate affected cached views and preview queries
- **AND** repeat operations with no eligible records SHALL return zero counts without modifying other records
