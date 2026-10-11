## ADDED Requirements
### Requirement: Mentor team maintenance
The system SHALL allow current mentors to list, search, create, edit and soft-delete teams with names, goals, notes and validated hexadecimal colours through client stores and strict Zod API contracts.

#### Scenario: View a team
- **WHEN** a mentor opens a team
- **THEN** its fields and assigned member links are displayed before editing

#### Scenario: Reject invalid or unauthorized writes
- **WHEN** an invalid field, unexpected field or non-mentor request is submitted
- **THEN** the server rejects it without modifying the team

#### Scenario: Delete a team safely
- **WHEN** a mentor confirms deletion of an unassigned team
- **THEN** it is soft-deleted; assigned teams are rejected until members are reassigned

### Requirement: Concurrent team editing
The system SHALL refresh team views and dependent member lookups after remote changes without overwriting unsaved drafts, and SHALL reject stale updates and deletes.

#### Scenario: Remote edit with a clean view
- **WHEN** another mentor changes a team
- **THEN** clean views refresh without reloading the page

#### Scenario: Remote edit with unsaved fields
- **WHEN** another mentor changes a team while the local form is dirty
- **THEN** the local draft remains and saving is disabled until it is reloaded
