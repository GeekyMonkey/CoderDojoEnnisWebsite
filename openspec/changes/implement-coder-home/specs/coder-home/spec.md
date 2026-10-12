## ADDED Requirements

### Requirement: Personal coder welcome
The system SHALL show first-time or returning welcome, team guidance, last login, unique attendance count and current belt using own-member stores.

#### Scenario: Returning coder
- **WHEN** a coder opens home
- **THEN** their previous login, team and attendance count are displayed with links to their coder tasks

#### Scenario: Unassigned first-time coder
- **WHEN** a coder has no team or previous login
- **THEN** the page displays a first welcome and mentor assignment guidance without manufacturing a login date

### Requirement: Recent achievement feedback
The system SHALL show award and rejection feedback since the UTC date of the previous login, or today for first login, including mentor attribution. Badge rejection messages SHALL be suppressed while the same badge has a pending reapplication.

#### Scenario: Reapplication
- **WHEN** a recently rejected badge has been reapplied for
- **THEN** its rejection is omitted from home while full history remains on the badge screens

#### Scenario: Remote decision
- **WHEN** a mentor reviews an application in another session
- **THEN** the coder's welcome feedback refreshes without reloading
