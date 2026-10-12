## ADDED Requirements

### Requirement: Member printing
The system SHALL print IDs for registered coders, mentors, individual members and team members using one reusable card. It SHALL provide a certificate for an earned belt and preserve team-card printing.

#### Scenario: Registered coder batch
- **WHEN** a mentor opens the registered coder print action
- **THEN** all registered active coders are included, regardless of directory paging or team assignment
- **AND** printing waits for QR and award data

#### Scenario: Earned belt certificate
- **WHEN** a mentor opens a coder's belt certificate
- **THEN** the latest earned belt, recipient name and award month are displayed
- **AND** no certificate is printable without an earned belt

### Requirement: Duplicate account merge
The system SHALL validate a previewed survivor and duplicate, lock both records, reject stale or incompatible choices, transfer history and relationships without losing duplicate records, and soft-delete the duplicate atomically. Survivor identity, credentials and images SHALL remain unchanged.

#### Scenario: Merge duplicate
- **WHEN** a mentor confirms field choices for two compatible active accounts
- **THEN** selected profile/account fields and combined role flags are applied to the survivor
- **AND** attendance, parent links, skills and achievement histories are transferred, retaining redundant history on the archived source
- **AND** all affected clients refresh through stores and realtime

#### Scenario: Conflict
- **WHEN** either previewed account has changed or the duplicate is already archived
- **THEN** the entire operation fails without partial transfers

### Requirement: Linked-child review restriction
The system SHALL prevent a mentor from approving or rejecting either a belt or badge application for their linked child, enforce this atomically on the server, and show the restriction in the UI. Any active mentor SHALL be allowed to undo a belt or badge decision, including another mentor’s decision and one for their linked child, subject to current-state validation.

#### Scenario: Own child
- **WHEN** a mentor attempts to approve or reject an application for their linked child
- **THEN** the server rejects it and the UI directs them to another mentor

#### Scenario: Relationship changes
- **WHEN** a parent link changes in another client
- **THEN** review permissions refresh without reloading the page

#### Scenario: Any mentor undoes a decision
- **WHEN** an active mentor undoes an existing belt or badge decision, including another mentor’s decision or their linked child’s decision
- **THEN** the decision is cleared if its expected state still matches
- **AND** a stale decision or non-mentor request is rejected
