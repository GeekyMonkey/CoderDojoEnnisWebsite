## ADDED Requirements
### Requirement: Own mentor profile
The system SHALL derive the profile identity from a verified session and active database member status and SHALL allow only names, contact details and external handles to be updated.
#### Scenario: Save own details
- **WHEN** a member saves valid profile fields
- **THEN** only that logged-in member's allowed fields SHALL change
- **AND** blank optional fields SHALL be stored as null
#### Scenario: Reject another identity or privileged fields
- **WHEN** an update supplies a member ID or membership flags
- **THEN** the server SHALL reject the request
### Requirement: Reactive profile stores
The UI SHALL access data through a TanStack Query store and SHALL refresh cached profiles and member displays when realtime member updates arrive.
#### Scenario: Remote update
- **WHEN** another session updates a member
- **THEN** active member views SHALL refresh without a page reload
- **AND** dirty profile drafts SHALL be preserved with a conflict notice
### Requirement: Guard concurrent editing
The system SHALL reject saves whose expected profile fields differ from stored values.
#### Scenario: Stale save
- **WHEN** another session has changed an editable field since the profile was loaded
- **THEN** the server SHALL return a conflict without overwriting those changes
### Requirement: Own password change
The system SHALL verify the current password against the authenticated member before changing the stored password hash.
#### Scenario: Invalid current password
- **WHEN** the current password is incorrect
- **THEN** the stored hash SHALL remain unchanged

### Requirement: Reusable profile presentation
Profile details and password forms SHALL be reusable across member roles and SHALL receive store actions rather than perform API requests. Profile details SHALL default to display-only mode.
#### Scenario: View profile
- **WHEN** a profile is displayed in view mode
- **THEN** values SHALL appear as text with no editable inputs or password form
#### Scenario: Edit profile
- **WHEN** an authorized user switches to edit mode
- **THEN** Zod SHALL validate every profile and password input before any store mutation
- **AND** cancelling SHALL discard local edits and restore display mode

### Requirement: Separate own and selected profile stores
The system SHALL provide a role-independent My Profile store resolved from the verified session and a User Profiles store keyed by selected member identity, sharing query and mutation behavior.
#### Scenario: Own profile for any role
- **WHEN** an active coder, parent or mentor loads My Profile
- **THEN** the server SHALL resolve that member from the verified session without accepting a target ID
#### Scenario: Another member's profile
- **WHEN** a member requests a selected profile other than their own
- **THEN** the server SHALL require current mentor privileges
- **AND** the response SHALL include server-derived editing permissions
#### Scenario: Role-specific presentation
- **WHEN** a profile is viewed
- **THEN** shared components SHALL expose the viewed MemberModel and permissions to role-specific sections
- **AND** password changes SHALL remain available only for one's own profile
