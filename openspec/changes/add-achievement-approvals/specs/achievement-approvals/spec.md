## ADDED Requirements

### Requirement: Mentor application review
The system SHALL show pending badge and belt applications on the mentor dashboard with applicant, requested achievement, application date and application notes. Badge and belt details SHALL be available on the mentor coder detail page.

#### Scenario: Review pending applications
- **WHEN** an authenticated mentor opens the dashboard
- **THEN** pending badge and belt applications are shown with loading, error and empty states
- **AND** awarded, rejected and deleted records are excluded

### Requirement: Approve or reject an application
The system SHALL let mentors approve or reject pending badge and belt applications with trimmed non-empty notes, recording UTC decision time and the server-derived mentor identity while preserving original application details.

#### Scenario: Approve a pending application
- **WHEN** a mentor approves a pending application with notes
- **THEN** the achievement is awarded with the decision date, mentor and notes
- **AND** it leaves the pending list and appears in the member's history

#### Scenario: Reject a pending application
- **WHEN** a mentor confirms rejection of a pending application with notes
- **THEN** rejection date, mentor and notes are recorded
- **AND** it leaves the pending list and appears in the member's history

#### Scenario: Reject invalid or conflicting decisions
- **WHEN** notes are blank, an ID is invalid, or the application has already been decided
- **THEN** the server rejects the request without changing the record
- **AND** the client displays an actionable error and refreshes stale data

### Requirement: Undo a decision
The system SHALL allow a mentor to undo an approval or rejection of an application from the member's achievement history after confirmation.

#### Scenario: Undo a decided application
- **WHEN** a mentor confirms undo for a decided application
- **THEN** awarded and rejected timestamps, actor IDs and decision notes are cleared
- **AND** original application details remain and the application returns to pending

### Requirement: Verified mentor authorization
The system SHALL require verified authentication and current database mentor status for all approval reads and mutations introduced by this capability. The server SHALL derive actor identity and SHALL NOT trust editable role metadata or client-supplied actor IDs.

#### Scenario: Non-mentor attempts a decision
- **WHEN** an unauthenticated, inactive or non-mentor user requests an approval operation
- **THEN** access is denied and no achievement data changes

### Requirement: Store-owned refresh and translated feedback
The system SHALL perform client API interactions through achievement stores, invalidate related queries after successful decisions, refresh via realtime changes, and translate user-facing controls and feedback in all supported languages.

#### Scenario: Successful decision refreshes the UI
- **WHEN** a decision succeeds
- **THEN** pending lists, member history and affected latest-belt displays refresh without a page reload
- **AND** repeat submission is disabled while the request is in progress
