## ADDED Requirements
### Requirement: Personal goals
The system SHALL let an active coder edit their own short/long term goals using exact snapshots and select/remove unearned badge goals. It SHALL show the next belt and selected badge descriptions, pending evidence and rejection feedback, following the legacy Goals and BadgesAvailable views.

#### Scenario: Stale personal goal
- **WHEN** another session changes the goals before a save
- **THEN** the API rejects the stale save and the store refreshes

#### Scenario: Badge goal upgrade
- **WHEN** a coder applies for a badge already selected as a goal
- **THEN** the existing unapplied goal record is upgraded and its goal date is retained

### Requirement: Achievement viewing
The system SHALL display own earned and pending badge/belt history, category and description, evidence, award/rejection dates, mentor names and feedback. Active unearned definitions SHALL be browsable and recorded deleted achievements SHALL remain visible in history.

#### Scenario: Mentor decides elsewhere
- **WHEN** a mentor reviews an application while a coder page is open
- **THEN** the coder store refreshes the decision without reloading the page

### Requirement: Guarded own-member applications
The API MUST derive identity from the verified active coder session, validate 5-4000 trimmed evidence characters and active definitions, and prevent application for earned achievements or belts other than the next active unearned belt. Duplicate concurrent submissions MUST return the same pending application; reapplication after rejection MUST preserve historical evidence and decisions.

#### Scenario: Concurrent duplicate submissions
- **WHEN** two sessions submit the same personal achievement
- **THEN** exactly one pending application exists and both responses identify it

#### Scenario: Coder skips belt progression
- **WHEN** a coder applies for a belt beyond the next unearned belt
- **THEN** the API rejects the request

#### Scenario: Reapply after rejection
- **WHEN** a coder submits revised evidence for a rejected achievement
- **THEN** a new pending application is recorded and the earlier rejection remains visible
