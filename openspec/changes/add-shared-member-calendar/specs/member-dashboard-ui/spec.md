## MODIFIED Requirements

### Requirement: Member area uses a dashboard-style app shell
The system SHALL render member pages within a Nuxt UI dashboard-style app shell that provides a left navigation sidebar and a main content area.

#### Scenario: Member visits a member page
- **WHEN** a signed-in member navigates to a route under `/mentor`, `/parent`, `/coder`, or `/member`
- **THEN** the page SHALL be displayed inside the member dashboard shell
- **AND** the page's content SHALL be rendered in the main content area

## ADDED Requirements

### Requirement: Home first in role navigation
Navigation items within each role SHALL place that role's Home first, overriding alphabetical ordering for that link. Remaining items and all submenu children SHALL be alphabetised using their displayed translated labels and the current locale. Role sections SHALL remain in Mentor, Parent, Coder order, excluding roles the user does not hold.

#### Scenario: Mentor views English navigation
- **WHEN** a mentor views the unfiltered sidebar in English
- **THEN** items appear in this order: Mentor Home, Attendance, Coders, Maintenance, Mentors, Parents, Reports, Sign In Mode
- **AND** Maintenance and Reports children are alphabetised
- **AND** Sessions is absent from every role section

#### Scenario: User changes language
- **WHEN** the user changes the application language
- **THEN** each role's Home remains first regardless of its translated label
- **AND** remaining translated item labels are sorted for that locale while sections remain in Mentor, Parent, Coder order

### Requirement: Shared Calendar navigation
The sidebar SHALL provide exactly one Calendar option linked to `/member/calendar`, shared across all member roles and positioned at the bottom of navigation immediately above the member-name menu. Calendar SHALL participate in navigation filtering and unfiltered page-title lookup without filtering the user menu.

#### Scenario: User has several roles
- **WHEN** the user views the sidebar
- **THEN** one Calendar link appears above their name
- **AND** no role section contains a Sessions link

#### Scenario: User searches for Calendar
- **WHEN** Calendar matches the navigation filter
- **THEN** its single shared link remains in its bottom position
- **AND** the sidebar does not report no matches

#### Scenario: User filters other options
- **WHEN** the filter does not match Calendar
- **THEN** the Calendar link is hidden while the member-name menu remains available

#### Scenario: Shared page profile and home links
- **WHEN** the current page is under `/member`
- **THEN** the profile action and club logo lead to valid existing profile/Home routes using the user's Mentor, Parent, Coder precedence
