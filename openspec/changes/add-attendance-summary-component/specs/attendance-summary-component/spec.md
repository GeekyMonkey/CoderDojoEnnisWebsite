# Attendance Summary Component

## ADDED Requirements

### Requirement: AttendanceSummary component displays a collection of team attendance cards
The system SHALL provide a reusable `AttendanceSummary` component that displays current-day attendance organized by team, with each card showing the team name as a heading and the members signed in for that team.

#### Scenario: Component renders team cards with member photos
- **WHEN** the `AttendanceSummary` component is rendered on the mentor sign-in page
- **THEN** the component SHALL display a card for each team that has at least one member signed in for today's session
- **AND** each card SHALL include the team name as a heading
- **AND** each card SHALL display member photo components for each signed-in member of that team

#### Scenario: Component uses current attendance data
- **WHEN** the component mounts and renders
- **THEN** it SHALL call the attendance store to retrieve members signed in for today's session date
- **AND** it SHALL only display members whose attendance date matches today's date (YYYY-MM-DD format)

### Requirement: AttendanceSummary always includes a mentors card
The system SHALL always display a dedicated `Mentors` card in the attendance summary, even if no mentors are currently signed in.

#### Scenario: Mentors card is always visible
- **WHEN** the `AttendanceSummary` component is rendered
- **THEN** a `Mentors` card SHALL always be displayed
- **AND** the `Mentors` card SHALL list all mentors (members with `isMentor: true`) who are signed in for today's session

#### Scenario: Mentors card is empty
- **WHEN** no mentors are currently signed in for today's session
- **THEN** the `Mentors` card SHALL still be displayed
- **AND** the card may show an empty state or placeholder

### Requirement: Team cards are conditionally visible based on signed-in members
The system SHALL show team cards only when at least one member of that team is signed in for today's session.

#### Scenario: Team card becomes visible when first member signs in
- **WHEN** a member of a team signs in for today's session
- **THEN** the corresponding team card SHALL appear in the display
- **AND** the card SHALL include that member's photo

#### Scenario: Team card is hidden when no members are signed in
- **WHEN** no members of a team are signed in for today's session
- **THEN** the team card SHALL NOT be displayed in the component

### Requirement: Component dynamically updates on sign-in
The system SHALL use the attendance store to maintain a realtime connection to attendance data, so the component reflects changes immediately when members sign in.

#### Scenario: Attendance summary refreshes on new sign-in
- **WHEN** a member signs in via the sign-in form or QR code
- **THEN** the attendance store SHALL invalidate relevant caches
- **AND** the `AttendanceSummary` component SHALL automatically re-render and display the newly signed-in member in the appropriate team card (or Mentors card)

#### Scenario: Component reacts to store changes
- **WHEN** store data indicates new attendance for today's session
- **THEN** the component's reactive properties SHALL update without requiring manual refresh or page reload

### Requirement: AttendanceSummary uses MemberAvatar for photo display
The system SHALL use the existing `MemberAvatar` component to display member images within each team card.

#### Scenario: Member photos are displayed consistently
- **WHEN** a signed-in member is displayed in a team card
- **THEN** a `MemberAvatar` component SHALL render the member's photo or avatar
- **AND** the avatar size SHALL be appropriate for a card layout (e.g., `md` size)

### Requirement: AttendanceSummaryTeam sub-component displays a single team's attendance
The system SHALL provide a reusable `AttendanceSummaryTeam` sub-component that renders a single team's attendance card with team information and member list.

#### Scenario: Team card displays team information in header
- **WHEN** the `AttendanceSummaryTeam` component is rendered
- **THEN** the card header SHALL display the team name
- **AND** the header SHALL include the team's color (from `TeamModel.hexcode`)
- **AND** the header MAY include the team's logo (if available in the future)

#### Scenario: Team card displays member avatars
- **WHEN** the `AttendanceSummaryTeam` component is rendered with a list of members
- **THEN** the card body SHALL display `MemberAvatar` components for each member
- **AND** the avatars SHALL be rendered in a horizontal layout suitable for a collection card

#### Scenario: Sub-component is reusable for mentors and teams
- **WHEN** the `AttendanceSummaryTeam` component is used by `AttendanceSummary`
- **THEN** it SHALL work for both regular team cards and a special "mentors" team card
- **AND** the component SHALL accept abstractions (team name, color, members) without hardcoding behavior

