## ADDED Requirements
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
