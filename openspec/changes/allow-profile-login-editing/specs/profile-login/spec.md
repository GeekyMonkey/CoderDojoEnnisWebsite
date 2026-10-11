## ADDED Requirements
### Requirement: Editable profile login
Authorized members SHALL edit their login through the existing profile store in edit mode. View mode SHALL show login as plain text. Self-profile saves SHALL require a trimmed non-empty login of at most 100 characters using letters, digits, dots, underscores or hyphens.

#### Scenario: Save login
- **WHEN** an authorized member saves a valid available login
- **THEN** the login SHALL be persisted and refreshed in profile views
- **AND** member identity, current session, roles and password SHALL remain unchanged

#### Scenario: Invalid or duplicate login
- **WHEN** a login is invalid or a newly chosen login conflicts case-insensitively with another active member
- **THEN** the save SHALL fail with actionable feedback without changing profile fields
- **AND** simultaneous conflicting saves SHALL NOT create duplicate active logins

#### Scenario: Stale login snapshot
- **WHEN** the stored login changes after the edit draft was loaded
- **THEN** the save SHALL fail with a concurrency conflict

#### Scenario: Cancel edit
- **WHEN** the member cancels editing
- **THEN** the original login SHALL be restored in the draft

#### Scenario: Mentor maintenance compatibility
- **WHEN** a mentor creates or maintains a member with an optional login
- **THEN** existing optional-login behavior SHALL remain supported

#### Scenario: Existing duplicate login
- **WHEN** a member saves other profile fields without changing an existing duplicate login
- **THEN** the existing login SHALL be preserved
- **AND** choosing a different login SHALL enforce uniqueness
