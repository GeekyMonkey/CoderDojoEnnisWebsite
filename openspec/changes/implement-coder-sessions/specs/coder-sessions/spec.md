## ADDED Requirements

### Requirement: Upcoming coder sessions
The system SHALL display non-mentor sessions that have not ended, ordered by topic, with date, end time, safe joining URL and up to two active mentor host photos/names. Pods without end time SHALL use their Dublin calendar date as the availability boundary without rewriting history.

#### Scenario: No sessions
- **WHEN** no upcoming sessions exist
- **THEN** the coder sees the legacy dojo calendar fallback

#### Scenario: Remote change or timed expiry
- **WHEN** another user edits a session or its end time passes
- **THEN** its card refreshes or disappears through store invalidation and periodic refresh without page reload

### Requirement: Authorized session joining
The system SHALL accept only a session UUID and record the authenticated active coder's Dublin-today attendance atomically and idempotently. It SHALL reject mentor-only, expired, missing or unsafe-URL sessions and recheck the URL at mutation time.

#### Scenario: Repeated joins
- **WHEN** the coder joins twice or concurrently
- **THEN** exactly one own attendance row exists for today and both valid joins return the validated URL

#### Scenario: Invalid join
- **WHEN** a caller supplies another member's ID, an unsafe URL or an unavailable session
- **THEN** no attendance is recorded and the caller receives a validation or availability error

#### Scenario: Browser popup fallback
- **WHEN** the successful join cannot open its new window
- **THEN** a direct fallback link to the validated URL remains available
