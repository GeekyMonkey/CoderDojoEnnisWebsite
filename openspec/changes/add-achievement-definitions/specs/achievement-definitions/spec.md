## ADDED Requirements
### Requirement: Achievement definition maintenance
The system SHALL allow current mentors to list, search, create, edit and soft-delete belts, badges and badge categories through shared store functions and strict Zod contracts, with display-first details and linked directory breadcrumbs.

#### Scenario: Edit a belt
- **WHEN** a mentor edits a belt
- **THEN** its name, validated hexadecimal colour, integer sort order and description can be saved

#### Scenario: Edit a badge
- **WHEN** a mentor edits a badge
- **THEN** its achievement, description and active category can be saved

#### Scenario: Edit a category
- **WHEN** a mentor edits a category
- **THEN** its name and description can be saved

#### Scenario: Reject unauthorized or invalid changes
- **WHEN** a non-mentor or invalid request submits a write
- **THEN** the server rejects it without modifying records

### Requirement: Safe concurrent definition changes
The system SHALL reject stale saves and deletes, preserve dirty drafts during realtime updates, retain historical achievements when definitions are soft-deleted, and reject deletion of categories referenced by active badges or mentor skills.

#### Scenario: Concurrent saves
- **WHEN** two mentors save the same original snapshot
- **THEN** one succeeds and the stale write returns a conflict

#### Scenario: Remote update
- **WHEN** another mentor changes a definition
- **THEN** clean views refresh without reload and dirty drafts remain with save disabled until reload

#### Scenario: Delete an awarded definition
- **WHEN** a mentor confirms deletion of a belt or badge already awarded
- **THEN** its definition leaves active lists while its achievement history remains visible

#### Scenario: Delete a referenced category
- **WHEN** a category still has active badges or mentor skills
- **THEN** deletion is rejected until those references are reassigned or removed
