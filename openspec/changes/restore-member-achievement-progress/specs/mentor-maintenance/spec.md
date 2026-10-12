## ADDED Requirements

### Requirement: Member achievement progress
The system SHALL display the next active belt not earned by the member, its description, previous rejection feedback and pending application details. Selected unearned badge goals SHALL show category, name, description and pending applications without enabling mentor-only personal goal selection.

#### Scenario: Progress changes
- **WHEN** achievement decisions, selected goals or definitions change
- **THEN** all open member progress views update through store-owned realtime invalidation without refresh

### Requirement: Complete grouped achievement history
The system SHALL include active belt and badge definitions with no member record, retain recorded deleted definitions, group earned, pending and available achievements, and identify badge goals only from an actual goal date.

#### Scenario: No achievements recorded
- **WHEN** an active member has no achievement records
- **THEN** their available catalogue contains every active definition without requiring database writes

#### Scenario: Historical definitions and goal markers
- **WHEN** a recorded definition is deleted or a badge goal has a pending application
- **THEN** historical labels remain visible and pending rows retain their actual goal marker
- **AND** an undated record is not treated as a selected goal
