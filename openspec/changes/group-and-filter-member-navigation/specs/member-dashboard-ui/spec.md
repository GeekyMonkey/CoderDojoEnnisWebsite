## ADDED Requirements

### Requirement: Role sections in member navigation
The member sidebar SHALL group allowed navigation options by the signed-in user's assigned roles, in the fixed order Mentor, Parent, Coder in every language, omitting unassigned roles. Maintenance and Reports MUST appear within Mentor. When the user has multiple roles, each visible section SHALL have a centred, visually distinct, non-interactive role heading and a thin divider before every section after the first. A single-role sidebar SHALL omit redundant role headings and dividers.

#### Scenario: User has multiple roles
- **GIVEN** the user has Mentor, Parent, and Coder roles
- **WHEN** the sidebar renders
- **THEN** the sections appear in Mentor, Parent, Coder order, each with a centred heading that is neither clickable nor keyboard-focusable
- **AND** thin dividers separate visible role sections
- **AND** Maintenance and Reports are contained in Mentor

#### Scenario: User has one role
- **GIVEN** the user has only the Parent role
- **WHEN** the sidebar renders
- **THEN** only allowed Parent options appear without a redundant role heading or divider

#### Scenario: User lacks mentor permissions
- **GIVEN** the user does not have the Mentor role
- **WHEN** the sidebar renders or a navigation search is performed
- **THEN** Mentor options, Maintenance, and Reports remain absent

### Requirement: Alphabetical member navigation
Navigation items within each role and submenu children SHALL be alphabetised using their displayed translated labels and the current locale.

#### Scenario: Mentor views English navigation
- **WHEN** a mentor views the unfiltered sidebar in English
- **THEN** the role's items appear in this order: Attendance, Coders, Maintenance, Mentor Home, Mentors, Parents, Reports, Sessions, Sign In Mode
- **AND** the Maintenance and Reports children are alphabetised

#### Scenario: User changes language
- **WHEN** the user changes the application language
- **THEN** translated item labels are sorted for that locale while role sections remain in Mentor, Parent, Coder order

### Requirement: Filter member navigation
The expanded sidebar and mobile drawer SHALL provide an accessible search field above role navigation that filters permitted options by displayed labels. Filtering SHALL be trimmed and case-insensitive, include nested options, retain their parent submenu as context, and reveal matching children without extra clicks. Matching a submenu label SHALL retain its permitted children. Searching MUST NOT navigate, change permissions, filter the footer user menu, or change the current page title.

#### Scenario: Find a nested option
- **WHEN** a mentor searches for a label found only within Maintenance or Reports
- **THEN** the matching nested option and its expanded parent submenu appear within Mentor
- **AND** unrelated options and empty role sections are hidden

#### Scenario: Search matches a submenu
- **WHEN** a mentor searches for Maintenance
- **THEN** Maintenance and all of its permitted children appear expanded within Mentor

#### Scenario: No navigation options match
- **WHEN** the search matches no permitted options
- **THEN** the sidebar displays a translated no-matches message with a way to clear the search
- **AND** no empty role headings or stray dividers appear

#### Scenario: Clear the search
- **WHEN** the user clears the navigation search
- **THEN** all permitted sections return in Mentor, Parent, Coder order with items alphabetised within each section
- **AND** the current page and title remain unchanged

#### Scenario: Filter navigation in the mobile drawer
- **WHEN** the user opens navigation on a narrow screen
- **THEN** the same accessible search and role sections are available within the drawer
