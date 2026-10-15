## ADDED Requirements

### Requirement: VEX section is available to every logged-in member
The system SHALL provide a `/vex` section inside the member layout that any authenticated member (mentor, coder or parent) can open, and SHALL redirect unauthenticated visitors to the login page.

#### Scenario: Member opens VEX home
- **WHEN** a logged-in coder selects VEX → VEX Home in the navigation
- **THEN** the VEX home page is shown with the current season, this week's sprint, getting-started links and sprint history

#### Scenario: Visitor is not logged in
- **WHEN** an unauthenticated visitor requests `/vex`
- **THEN** they are redirected to `/login`

### Requirement: Seasons are data, with one current season
The system SHALL store VEX seasons as records (label, programme, competition name, slug, description, dates and a current flag), SHALL allow at most one current season, and SHALL list the other seasons as an archive.

#### Scenario: Mentor starts a new season
- **WHEN** a mentor saves a new season with "This is the current season" ticked
- **THEN** that season becomes current and the previous season appears under "Previous seasons"

### Requirement: Mentors set the weekly macro objective
The system SHALL let mentors create and edit a sprint's week number, title, objective, supporting notes, Dojo date, review date and status, and SHALL NOT require mentors to define the tasks. Setting a sprint to Current SHALL mark the season's previous current sprint as Complete.

#### Scenario: Objective not yet set
- **WHEN** a sprint has no objective
- **THEN** the page shows "No objective has been set for this week yet."

#### Scenario: Non-mentor attempts to edit a sprint
- **WHEN** a member who is not a mentor calls the sprint save API
- **THEN** the request is rejected

### Requirement: Members manage sprint tasks with shared responsibility
The system SHALL let any logged-in member add and edit tasks in a sprint. Each task has a title, one or more owners chosen from existing members, a status (To do, In progress, Done), and optional notes and a link. Only the task's creator or a mentor SHALL be able to remove a task.

#### Scenario: Member joins a task
- **WHEN** a member presses "I'll help" on a task
- **THEN** they are added as an owner alongside any existing owners

#### Scenario: Review what was found out
- **WHEN** tasks have notes or links
- **THEN** they are listed under "What did we find out?", and unfinished ones are flagged as possible carry-overs

### Requirement: Data-driven resources
The system SHALL show VEX resources grouped by category. Each resource has a title, description, URL, type, order, active flag and optional season. Mentors SHALL be able to add, edit, hide and remove resources without code changes. The page SHALL explain that members can start in VEXcode VR before the physical kit arrives, and that Virtual Driving Skills requires a VEX IQ (2nd generation) Controller.

#### Scenario: Hidden resource
- **WHEN** a mentor marks a resource as not shown to members
- **THEN** non-mentors no longer see it, and mentors see it labelled "Hidden"
