# attendance-signin-ui Specification

## Purpose
TBD - created by archiving change style-signin-page. Update Purpose after archive.
## Requirements
### Requirement: Attendance sign-in page uses Nuxt UI and auth layout
The system SHALL render the mentor attendance sign-in page using Nuxt UI components as the primary form surface and display it within the existing `auth-layout`.

#### Scenario: Mentor opens the attendance sign-in page
- **WHEN** a user navigates to the mentor attendance sign-in page
- **THEN** the page SHALL show a centered card containing a username/password sign-in form
- **AND** the page SHALL be displayed within the existing `auth-layout`
- **AND** the page SHALL NOT display additional page navigation links or menus

### Requirement: Attendance sign-in request remains behaviorally unchanged
The system SHALL submit the same attendance sign-in request as before while restyling the page.

#### Scenario: User submits attendance sign-in credentials
- **WHEN** a user submits a username and password on the mentor attendance sign-in page
- **THEN** the system SHALL POST the credentials to `/api/MemberAttendance/SignIn`
- **AND** the system SHALL continue to treat a successful response as a successful attendance sign-in

### Requirement: Successful sign-in resets the form for the next member
After a successful sign-in, the system SHALL clear the username and password inputs and focus the username field for the next member.

#### Scenario: Sign-in succeeds
- **WHEN** the sign-in request succeeds
- **THEN** the username input SHALL be cleared
- **AND** the password input SHALL be cleared
- **AND** focus SHALL be placed on the username input

### Requirement: Welcome panel is shown inline and persists until next username entry
After a successful sign-in, the system SHALL display an inline sign-in notification panel below the form containing the sign-in response messages (welcome message and any notification messages), and it SHALL remain visible until the username input value changes from empty to non-empty.

#### Scenario: Welcome panel appears after sign-in
- **WHEN** the sign-in request succeeds
- **THEN** the page SHALL render a sign-in notification panel below the form
- **AND** the notification panel SHALL include the sign-in response’s member welcome message
- **AND** the notification panel SHALL include any sign-in notification messages returned by the API

#### Scenario: Notification panel remains visible until next member types
- **GIVEN** a successful sign-in has just occurred
- **AND** the username input is currently empty
- **WHEN** the username input value changes from empty to non-empty (including typing or pasting)
- **THEN** the notification panel SHALL be hidden

### Requirement: Errors are shown inline (no browser alerts)
The system SHALL display sign-in errors inline using Nuxt UI alert components and SHALL NOT use browser alert dialogs.

#### Scenario: Sign-in fails
- **WHEN** the sign-in request fails
- **THEN** the page SHALL display an inline error alert
- **AND** the page SHALL NOT show a browser alert dialog

### Requirement: Mentor sign-in supports webcam QR capture using member GUID
The sign-in page SHALL render a QR code reader (above the existing cards) that uses the device webcam to decode a QR payload containing the member GUID and initiate sign-in without requiring manual username entry.

#### Scenario: QR decode signs in by GUID
- **WHEN** the QR reader decodes a QR code containing a member GUID
- **THEN** the page SHALL call `/api/MemberAttendance/SignInGuid` with that GUID
- **AND** the response SHALL be handled identically to the existing sign-in flow (welcome/notifications panel)
- **AND** the username/password form SHALL remain available for manual entry as today

### Requirement: QR reader exposes explicit start/stop controls with clear status
The QR reader SHALL provide user-initiated start/stop controls and indicate when the camera is active or idle so users can control camera access; while idle it SHALL show a placeholder without accessing the camera.

#### Scenario: User starts and stops scanning
- **WHEN** the user activates the QR reader
- **THEN** the webcam feed SHALL start and the UI SHALL indicate the scanner is active
- **AND** prior to activation, a placeholder SHALL be shown instead of the live camera view
- **WHEN** the user stops the QR reader
- **THEN** the webcam feed SHALL stop and the UI SHALL indicate the scanner is idle

### Requirement: QR reader handles camera permission and availability gracefully
The sign-in page SHALL keep the manual form usable if camera access is denied/unavailable and SHALL surface an inline error near the scanner instead of modal alerts.

#### Scenario: Camera permission denied or unavailable
- **WHEN** camera permission is denied or the device has no available camera
- **THEN** the page SHALL display an inline error/notice near the QR reader
- **AND** the QR reader SHALL stop attempting to scan
- **AND** the username/password form SHALL remain usable without camera access

### Requirement: QR reader component is reusable for other pages
The QR reader SHALL be implemented as `components/common/QrCodeReader.vue` that emits a decode event with the decoded GUID text and an error event for camera/scan failures, so it can be reused in future contexts.

#### Scenario: Consumer handles decode events
- **WHEN** the component emits a decode event with decoded text
- **THEN** consuming pages SHALL be able to receive the GUID payload and use it (e.g., to call the GUID sign-in API or populate an input)
- **AND** the component SHALL NOT force navigation or submission behavior on its own

