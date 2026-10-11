## ADDED Requirements
### Requirement: Shared action notification events
The application SHALL publish transient operation outcomes through a typed notification event interface and SHALL render eligible events through one application-level toast presenter. Presentation policy SHALL be controlled in one place.

#### Scenario: Action outcome
- **WHEN** a migrated action completes or fails
- **THEN** its component SHALL publish an event with its name, severity and translated message
- **AND** the shared presenter SHALL decide visibility, duration and styling
- **AND** the component SHALL NOT render an inline success banner

#### Scenario: Profile image success
- **WHEN** an image is uploaded, swapped or deleted successfully
- **THEN** a success event SHALL be published
- **AND** central policy SHALL suppress that toast by default
- **AND** no inline success message SHALL appear

#### Scenario: Failure and duplicate events
- **WHEN** an operation fails repeatedly with the same event name and message
- **THEN** an error toast SHALL be visible
- **AND** central policy SHALL prevent simultaneous duplicate toasts

#### Scenario: Contextual feedback
- **WHEN** a message represents field validation, a load state, a concurrent edit warning or attendance welcome information
- **THEN** it SHALL remain in its relevant page context

#### Scenario: Presenter lifecycle
- **WHEN** the application presenter is unmounted and mounted again
- **THEN** stale subscriptions SHALL be removed
- **AND** each event SHALL be handled once
