## MODIFIED Requirements
### Requirement: Welcome panel is shown inline and persists until next username entry
After a successful sign-in, the system SHALL display an inline sign-in notification panel below the form containing the sign-in response messages (welcome message and any notification messages), and it SHALL remain visible until the username input value changes from empty to non-empty. When the member has a previous login timestamp, the panel SHALL also display it as a date and time formatted according to the active locale. When the member has no previous login timestamp, the panel SHALL omit that detail.

#### Scenario: Welcome panel appears after sign-in
- **WHEN** the sign-in request succeeds
- **THEN** the page SHALL render a sign-in notification panel below the form
- **AND** the notification panel SHALL include the sign-in response’s member welcome message
- **AND** the notification panel SHALL include any sign-in notification messages returned by the API

#### Scenario: Returning member sees previous login
- **WHEN** a member signs in and has a previous login timestamp
- **THEN** the panel displays the previous login as a localized date and time

#### Scenario: First-time member has no previous login detail
- **WHEN** a member signs in and has no previous login timestamp
- **THEN** the panel omits the previous-login detail

#### Scenario: Notification panel remains visible until next member types
- **GIVEN** a successful sign-in has just occurred
- **AND** the username input is currently empty
- **WHEN** the username input value changes from empty to non-empty (including typing or pasting)
- **THEN** the notification panel SHALL be hidden
