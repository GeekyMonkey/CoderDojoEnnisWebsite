## ADDED Requirements

### Requirement: Authorized invalidation channels
The system SHALL replace sensitive raw table events with private authorized invalidations and current-authority refetch. Channel access SHALL derive from active bindings, roles and relationships. Only trusted producers SHALL send change invalidations, which SHALL contain no private row payload or subject identifiers outside their authorized scope.

#### Scenario: User attempts another member's channel
- **WHEN** an unrelated user subscribes to a member or parent-child channel or spoofs a change broadcast
- **THEN** channel policies SHALL deny that operation

### Requirement: No sensitive raw events
Sensitive tables SHALL NOT remain available through client-facing wildcard Postgres Changes subscriptions or publications. The system SHALL NOT rely on row policies to redact columns or protect raw DELETE events. Failed mutations SHALL NOT publish successful-change events.

#### Scenario: Member record deleted
- **WHEN** a member record changes or is deleted
- **THEN** authorized stores SHALL receive only safe invalidation and refetch their approved projections
- **AND** no credential-bearing old/new row SHALL reach clients or logs

### Requirement: Revocation and cache lifecycle
Private refetch SHALL use current authority on every request. The system SHALL clear private caches on logout or authorization denial and renew private channel authorization at most every sixty seconds; cached connection authorization SHALL NOT be treated as immediate revocation enforcement.

#### Scenario: Parent unlinked while connected
- **WHEN** an already connected parent's child link is removed
- **THEN** subsequent private child refetch SHALL be denied immediately after the change commits
- **AND** cached data SHALL clear on denial and channel renewal SHALL remove access within sixty seconds
- **AND** residual invalidations SHALL reveal no private row or target identifier
