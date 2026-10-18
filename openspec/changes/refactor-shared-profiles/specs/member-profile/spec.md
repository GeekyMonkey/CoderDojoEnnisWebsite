## ADDED Requirements

### Requirement: Shared Personal Profile Route
The system SHALL serve every role's personal profile at `/member/my-profile` using a thin page wrapper and shared profile components, initially in edit mode. Fields SHALL reflect all assigned subject roles.

#### Scenario: Multi-role member opens personal profile
- **WHEN** a member with multiple roles opens `/member/my-profile`
- **THEN** the shared profile opens in edit mode with all applicable fields and authorized editing actions.

#### Scenario: Old profile link
- **WHEN** a member follows a previous role-specific personal profile URL
- **THEN** the system redirects to `/member/my-profile`.

### Requirement: Authorized Profile Display and Editing
The system SHALL serve other profiles at `/member/member/[memberId]` initially in display mode, accessible to self, mentors, and authorized parent-child relations. Display components SHALL contain no editing features. A separate Edit action SHALL be available only when existing authorization permits editing. Child components SHALL receive the effective mode. Server authorization SHALL apply to all reads and mutations independently of UI mode.

#### Scenario: Authorized viewer opens another profile
- **WHEN** an authorized viewer opens another member's profile
- **THEN** the profile displays without editable fields or mutation controls and an Edit action appears only if permitted.

#### Scenario: Unauthorized request
- **WHEN** an unrelated unauthorized user requests profile data or attempts a mutation
- **THEN** the server denies access regardless of client mode.

### Requirement: Password Change Dialog
The system SHALL expose authorized password changes through a button that opens a dedicated dialog using existing password validation and permissions.

#### Scenario: Member changes password
- **WHEN** a member activates Change password
- **THEN** a dialog opens and submits through the existing store action, displaying validation and submission status.

### Requirement: Related Profile Sections
The system SHALL provide parent and mentor views of other profiles with applicable legacy sections in tabs: Details, Parents or Children, Badges, Belts, Goals, and Attendance. Section data SHALL load through stores and respect viewer permissions and subject roles.

#### Scenario: Parent views linked child
- **WHEN** a parent opens a linked child's profile
- **THEN** applicable legacy sections appear in tabs and editing actions require authorization and edit mode.

#### Scenario: Mentor views parent
- **WHEN** a mentor opens a parent's profile
- **THEN** applicable sections include child relationships and role-appropriate details.

### Requirement: Safeguarding Photo Permissions
The system SHALL allow only verified mentors to upload, replace, copy to, or delete photos. It SHALL preserve existing avatar editing permissions. The server SHALL reject unauthorized photo operations before accessing storage. Mentor views SHALL prioritize photos; coder and parent views SHALL prioritize avatars and display smaller secondary photos.

#### Scenario: Non-mentor attempts photo mutation
- **WHEN** a coder or parent directly requests a photo upload, deletion, or avatar-to-photo copy
- **THEN** every image endpoint rejects the request without touching storage or image flags.

#### Scenario: Mentor copies an avatar
- **WHEN** a mentor copies an existing avatar to the photo
- **THEN** only the photo is replaced and both the source avatar and its flag remain unchanged.

#### Scenario: Copy fails
- **WHEN** a copy fails after writing the photo
- **THEN** the previous photo is restored and the avatar is never written or deleted.

#### Scenario: Legacy swap request
- **WHEN** any client submits the removed swap operation
- **THEN** the server rejects the request without modifying images.
