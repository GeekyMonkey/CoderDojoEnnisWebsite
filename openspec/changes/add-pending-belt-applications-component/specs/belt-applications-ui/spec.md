## ADDED Requirements

### Requirement: ApplicationsPending component displays pending belt applications in a table
The system SHALL provide an `ApplicationsPending` component that displays all pending belt applications in a table format, showing coder name, team (with icon), and applied belt color.

#### Scenario: Display pending applications table
- **WHEN** a mentor views the mentor home page
- **THEN** the `ApplicationsPending` component SHALL display a table with columns for coder name, team, and belt color
- **AND** each row SHALL represent one pending belt application
- **AND** the table SHALL be sorted first by belt color, then by member name

#### Scenario: Show team with icon in table
- **WHEN** a pending application row is displayed
- **THEN** the team column SHALL show the team name
- **AND** the team column SHALL include the team icon if available

#### Scenario: Display belt color for application
- **WHEN** a pending application row is displayed
- **THEN** the belt color column SHALL show the belt color being applied for (from the application)
- **AND** the belt color SHALL be rendered using the `BeltColor` component
- **AND** the belt color SHALL NOT be the member's current belt color

### Requirement: ApplicationsPending displays heading and empty state
The system SHALL display a heading "Belt Applications" above the table and show "There are no pending belt applications." when no applications exist.

#### Scenario: Display heading
- **WHEN** the `ApplicationsPending` component is rendered
- **THEN** a heading with the text "Belt Applications" SHALL be displayed above the table

#### Scenario: Display empty state
- **WHEN** no pending belt applications exist
- **THEN** the message "There are no pending belt applications." SHALL be displayed
- **AND** the table SHALL NOT be rendered

### Requirement: All belt application UI text is translated
The system SHALL provide translations for all belt application UI strings in all supported languages (en, fr, ga, uk).

#### Scenario: Translations available for all languages
- **WHEN** the user's locale is set to any supported language (en, fr, ga, uk)
- **THEN** the "Belt Applications" heading SHALL be displayed in that language
- **AND** the "There are no pending belt applications." message SHALL be displayed in that language
- **AND** all table column headers SHALL be displayed in that language

### Requirement: Clicking belt application row expands details panel
The system SHALL allow users to click on a belt application row to expand an inline details panel showing the full application information.

#### Scenario: Row click expands details
- **WHEN** a mentor clicks on a belt application row
- **THEN** an expanded panel SHALL appear within the table below that row
- **AND** the panel SHALL display the application details including application notes

#### Scenario: Details panel shows application information
- **WHEN** a belt application details panel is expanded
- **THEN** the panel SHALL display the applicant's name
- **AND** the panel SHALL display the belt color being applied for
- **AND** the panel SHALL display the application date
- **AND** the panel SHALL display the application notes if present

### Requirement: BeltColor component displays belt color indicator
The system SHALL provide a reusable `BeltColor` component that displays a belt color indicator independent of member data.

#### Scenario: BeltColor accepts belt data directly
- **WHEN** the `BeltColor` component is rendered
- **THEN** it SHALL accept a `BeltModel` or belt color string as a prop
- **AND** it SHALL render the belt color indicator with appropriate styling
- **AND** it SHALL accept an optional `size` prop ("sm", "md", "lg")

#### Scenario: BeltColor used in multiple contexts
- **WHEN** the `BeltColor` component is used
- **THEN** it SHALL work in the `MemberBelt` component context (showing member's current belt)
- **AND** it SHALL work in the `ApplicationsPending` component context (showing applied belt)
- **AND** it SHALL work in any other context requiring belt color display

### Requirement: MemberBelt component wraps BeltColor
The system SHALL refactor `MemberBelt` to be a wrapper around `BeltColor`, maintaining backward compatibility.

#### Scenario: MemberBelt uses BeltColor internally
- **WHEN** the `MemberBelt` component is rendered
- **THEN** it SHALL look up the member's current belt from the store
- **AND** it SHALL pass the belt data to the `BeltColor` component
- **AND** it SHALL maintain the same prop interface (accepting `member` and `size`)

#### Scenario: MemberBelt maintains existing behavior
- **WHEN** the `MemberBelt` component is used in existing pages
- **THEN** it SHALL display the member's current belt color
- **AND** it SHALL maintain all existing styling and size options
- **AND** it SHALL handle special cases (mentor, parent, noob) as before

### Requirement: MemberBeltsStore provides pending applications list
The system SHALL extend `useMemberBeltsStore` to provide a `PendingBeltApplications` computed property listing all pending belt applications.

#### Scenario: PendingBeltApplications filters correctly
- **WHEN** the `PendingBeltApplications` computed property is accessed
- **THEN** it SHALL return only member belt records where `applicationDate` is not null
- **AND** it SHALL filter out records where `awarded` is not null
- **AND** it SHALL filter out records where `rejectedDate` is not null
- **AND** it SHALL filter out deleted records

#### Scenario: PendingBeltApplications sorts correctly
- **WHEN** the `PendingBeltApplications` list is generated
- **THEN** the results SHALL be sorted first by belt color
- **AND** within each belt color, SHALL be sorted by member name alphabetically

### Requirement: Mentor home page displays ApplicationsPending component
The system SHALL replace the demo content on the mentor home page with the `ApplicationsPending` component.

#### Scenario: ApplicationsPending replaces demo content
- **WHEN** a mentor navigates to the mentor home page
- **THEN** the `ApplicationsPending` component SHALL be displayed
- **AND** the `TeamsList` component SHALL NOT be displayed
- **AND** no other demo content (belts, badge categories) SHALL be displayed
