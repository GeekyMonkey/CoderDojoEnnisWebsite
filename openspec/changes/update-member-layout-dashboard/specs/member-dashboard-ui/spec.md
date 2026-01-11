## ADDED Requirements

### Requirement: Member area uses a dashboard-style app shell
The system SHALL render member pages within a Nuxt UI dashboard-style app shell that provides a left navigation sidebar and a main content area.

#### Scenario: Member visits a member page
- **WHEN** a signed-in member navigates to a route under `/mentor`, `/parent`, or `/coder`
- **THEN** the page SHALL be displayed inside the member dashboard shell
- **AND** the page’s content SHALL be rendered in the main content area

### Requirement: Left navigation is responsive
The member dashboard shell SHALL provide a left navigation sidebar on desktop and SHALL collapse navigation into a hamburger-triggered drawer on narrow screens.

#### Scenario: Desktop navigation
- **WHEN** the viewport is wide enough for desktop layout
- **THEN** the left navigation sidebar SHALL be visible

#### Scenario: Mobile navigation
- **WHEN** the viewport is narrow
- **THEN** the left navigation sidebar SHALL be hidden by default
- **AND** the UI SHALL provide a hamburger control to open navigation

### Requirement: Navigation supports placeholders
The member navigation model SHALL support placeholder menu items for features not yet implemented.

#### Scenario: Placeholder item is displayed
- **GIVEN** a navigation item is configured as a placeholder
- **WHEN** the member views the navigation
- **THEN** the item SHALL be visible with a clear “coming soon” state
- **AND** the item SHALL either be disabled or navigate to a dedicated placeholder page

### Requirement: Navigation is role-based
The system SHALL render navigation items based on the signed-in user’s roles derived from Supabase user metadata.

#### Scenario: Mentor navigation is shown for mentor users
- **GIVEN** the signed-in user metadata indicates `isMentor = true`
- **WHEN** the member dashboard shell renders navigation
- **THEN** mentor-specific navigation items SHALL be visible

#### Scenario: Mentor navigation is not shown for non-mentor users
- **GIVEN** the signed-in user metadata indicates `isMentor = false`
- **WHEN** the member dashboard shell renders navigation
- **THEN** mentor-specific navigation items SHALL NOT be visible

### Requirement: Mentor menu matches legacy structure
For mentor users, the navigation SHALL include menu items equivalent to the legacy mentor menu.

#### Scenario: Mentor sees legacy-equivalent items
- **GIVEN** the signed-in user metadata indicates `isMentor = true`
- **WHEN** the member dashboard shell renders navigation
- **THEN** the navigation includes the following items (some may be placeholders):
  - Home
  - Attendance
  - Members
  - Parents
  - Mentors
  - Ninja Pods
  - Maintenance
  - Reports
  - Sign In Mode

#### Scenario: Mentor can log out
- **GIVEN** the signed-in user metadata indicates `isMentor = true`
- **WHEN** the mentor opens the user menu
- **THEN** a logout action SHALL be available

### Requirement: User menu exists in the sidebar footer
The member dashboard shell SHALL provide a user menu in the sidebar footer for user-specific preferences and actions.

#### Scenario: User menu is available
- **WHEN** a signed-in member views the member dashboard shell
- **THEN** the sidebar footer SHALL display a user menu control

### Requirement: User menu includes theme and language controls
The user menu SHALL provide access to theme selection and language selection.

#### Scenario: User opens preferences
- **WHEN** the member opens the user menu
- **THEN** the menu SHALL provide actions to open theme selection and language selection

### Requirement: User menu includes logout
The user menu SHALL provide a logout action that signs the user out and returns them to the login page.

#### Scenario: User logs out
- **WHEN** the member triggers logout from the user menu
- **THEN** the system SHALL sign the user out
- **AND** the system SHALL navigate to `/login`
