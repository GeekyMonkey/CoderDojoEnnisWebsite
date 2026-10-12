## ADDED Requirements

### Requirement: Parent navigation and linked children
The system SHALL provide a parent home, shared My Profile, sorted active linked-child directory and real child routes with empty-state linking guidance.

#### Scenario: Parent with no linked children
- **WHEN** a parent opens My Kids
- **THEN** the portal advises contacting a mentor and does not display fabricated children

### Requirement: Relationship-scoped child read surfaces
The system SHALL show linked-child summary, passports, attendance, co-parent contacts, goals, belt and badge history, team roster and public peer profiles using Zod contracts and TanStack Query stores with realtime invalidation.

#### Scenario: Link removed while a parent is viewing a child
- **WHEN** a mentor removes the relationship
- **THEN** realtime invalidation clears cached child views and subsequent reads and writes are denied

#### Scenario: Display-only progress and peers
- **WHEN** a parent views goals, achievements or a team peer
- **THEN** no goal-editing, application, approval or peer-account mutation controls are available and peer DTOs exclude private account data

### Requirement: Narrow parent child editing
The system SHALL validate and atomically guard child birth year, login and external-handle edits against stale snapshots, case-insensitive login collisions and current relationship permissions. Reusable independent password and image editors SHALL enforce the same relationship boundary.

#### Scenario: Parent attempts privileged field changes
- **WHEN** an edit contains names, roles, team, registration or other unknown fields
- **THEN** it is rejected and the child record remains unchanged

#### Scenario: Concurrent edits
- **WHEN** another editor changes a field after the parent's snapshot
- **THEN** saving returns a conflict and retains the parent's draft for review and reload

### Requirement: Parent session joining
The system SHALL show upcoming public pods, shared host cards and calendar, and record only the authenticated parent's own Dublin-date attendance through validated joining.

#### Scenario: Parent joins a pod repeatedly
- **WHEN** a parent joins an eligible public pod concurrently or repeatedly
- **THEN** only one own attendance row is recorded and a validated URL with fallback is returned
