## ADDED Requirements

### Requirement: Mentor pod maintenance
The system SHALL provide mentor-only pod list, create, display, edit and removal screens with topic, URL, up to two distinct active mentor hosts and mentor-only visibility. New pods SHALL default to the logged-in mentor as primary host. Saving SHALL open or renew the pod for 2.5 hours, matching legacy behavior.

#### Scenario: Create or renew
- **WHEN** an active mentor saves valid pod fields
- **THEN** the stored pod is available for 2.5 hours and relevant users see the change without reloading

#### Scenario: Remote edit during drafting
- **WHEN** another mentor changes a pod while a draft is dirty
- **THEN** the draft remains intact, save is disabled until reload, and the API rejects its stale snapshot

#### Scenario: Remove
- **WHEN** a mentor confirms removal using a current snapshot
- **THEN** the pod is archived, absent from active lists and cannot be joined; existing attendance is retained

### Requirement: Mentor visibility and joining
The system SHALL allow mentors to browse and join both public and mentor-only pods while coders see and join only public pods. Joining SHALL record only the verified user's own Dublin-today attendance idempotently.

#### Scenario: Role changes
- **WHEN** a user's mentor role is removed
- **THEN** fresh API/RPC authorization and private-pod row policy deny mentor access despite an older valid session token
