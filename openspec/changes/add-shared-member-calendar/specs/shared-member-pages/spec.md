## ADDED Requirements

### Requirement: Shared authenticated member namespace
Pages under `/member/**` SHALL be shared signed-in pages applicable to Mentor, Parent, and Coder users without requiring a particular role. They MUST use the member layout and existing authentication, session-expiry, logout, and browser-history protection. Shared page access MUST NOT broaden API permissions or trust editable metadata as server authorisation.

#### Scenario: Access with any member role
- **GIVEN** a signed-in user has any one or more member roles
- **WHEN** they open `/member/calendar`
- **THEN** the shared page is accessible in the member dashboard layout

#### Scenario: Signed-out or expired session
- **WHEN** a signed-out user or a user with an expired session opens a protected `/member/**` page
- **THEN** the existing authentication flow returns them to login

#### Scenario: Logout or history restoration
- **WHEN** a user logs out or restores a protected shared page through browser history
- **THEN** existing session verification and view-discard behavior also applies to `/member/**`

### Requirement: Canonical role-aware Calendar
The system SHALL provide `/member/calendar` as the canonical Calendar for every member role, containing the club's dated sessions and permitted active pods. UI data interactions SHALL use stores. Current profile capabilities SHALL use Mentor, Parent, Coder precedence and follow role changes. Mentor-only editors SHALL remain under `/mentor`. The member Calendar SHALL NOT embed or link to Google Calendar as a fallback.

#### Scenario: Mentor uses Calendar
- **WHEN** a current mentor opens Calendar
- **THEN** permitted pods and dated sessions are available with separate Add pod and Add session actions
- **AND** management actions retain mentor-only API checks

#### Scenario: Parent or Coder uses Calendar
- **WHEN** a non-mentor Parent or Coder opens Calendar
- **THEN** only general sessions and permitted pods are returned
- **AND** no mentor management permission is granted

#### Scenario: Empty Calendar
- **WHEN** no permitted sessions or pods exist
- **THEN** no Google Calendar fallback or empty-pod message is shown
- **AND** mentors can still add a session or pod

### Requirement: Single session list URL
The system SHALL use `/member/calendar` as the single session-list destination. The previous `/mentor/sessions`, `/parent/sessions`, and `/coder/sessions` list pages SHALL be removed without compatibility redirects. Internal list links and editor return links SHALL use the canonical Calendar destination. Existing mentor create/edit routes SHALL be retained.

#### Scenario: Old list pages are retired
- **WHEN** the shared Calendar is implemented
- **THEN** the three old list pages are removed
- **AND** no legacy redirect pages or rules are introduced for them
- **AND** all internal list links target `/member/calendar`

#### Scenario: Return from a mentor editor
- **WHEN** a mentor follows the session-list breadcrumb or a cancel/remove return action
- **THEN** the destination is `/member/calendar`
