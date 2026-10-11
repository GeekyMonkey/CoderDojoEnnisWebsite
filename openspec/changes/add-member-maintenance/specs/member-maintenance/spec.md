## ADDED Requirements
### Requirement: Role-aware member maintenance
The system SHALL provide mentor-only searchable coder, parent and mentor directories, member creation and editing of common profile fields, login, fingerprint ID, birth year, team, registration and adult roles through validated store actions. Password resets SHALL be a separate reusable form. Display mode SHALL be the default.

#### Scenario: Signup and editing
- **WHEN** a verified mentor creates or edits a member
- **THEN** Zod rejects unknown fields and invalid input, the server checks referenced teams and duplicates, and the member appears in the appropriate directory

#### Scenario: Concurrent editing
- **WHEN** another session has changed the section being saved
- **THEN** the stale save is rejected without overwriting the other change

### Requirement: Coder progress
The system SHALL provide guarded short/long-term goal editing, individual attendance dates and existing badge/belt history for the selected coder.

#### Scenario: View coder progress
- **WHEN** a mentor selects a coder
- **THEN** their goals, attendance history and achievement history are available through stores

### Requirement: Parent relationships and mentor skills
The system SHALL provide searchable parent-child linking/unlinking and mentor category assignment/removal. Links SHALL validate active role-compatible endpoints and remain idempotent under concurrent requests.

#### Scenario: Link from either relationship view
- **WHEN** a mentor links a parent and coder from either profile
- **THEN** both relationship views reflect the same link and a repeated request does not add a duplicate

#### Scenario: Remove a skill
- **WHEN** a mentor removes an assigned category
- **THEN** the assignment is removed and other active views update

### Requirement: Authorization and realtime
All maintenance API requests SHALL verify the session and current database mentor role, validate query/route/body inputs with Zod, and return no password hashes. UI components SHALL use TanStack Query stores for data and mutations, with realtime invalidation and lifecycle cleanup. Dirty drafts SHALL be preserved on remote updates.

#### Scenario: Unauthorized maintenance
- **WHEN** an anonymous, parent-only or coder-only session calls maintenance APIs
- **THEN** the request is rejected without mutation

#### Scenario: Remote update
- **WHEN** another session changes a member, relationship, attendance or skill
- **THEN** active clean views refresh without page reload and unsaved edits are not silently replaced
