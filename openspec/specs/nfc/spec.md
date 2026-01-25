# Spec: nfc

## Purpose
Define the Web NFC (NDEF) usage for member sign-in and attendance flows. Scope is read-only scanning on supported mobile browsers (Chrome for Android) in secure contexts; tag writing is intentionally out of scope until a dedicated flow is specified.

## Requirements

### Requirement: Supported Runtime Scope
The system SHALL enable Web NFC features only when running in a secure context on Chrome for Android (or other user agents exposing `NDEFReader`).

#### Scenario: Unsupported platform hides NFC controls
- **WHEN** the UI loads on a browser without `NDEFReader` or in an insecure context
- **THEN** NFC controls are hidden or disabled and manual sign-in remains available

### Requirement: Scan Opt-In And Permission Handling
The system SHALL require an explicit user action to start NFC scanning and SHALL surface permission prompts and errors without blocking manual sign-in or attendance actions.

#### Scenario: User starts scanning
- **WHEN** the user taps "Start NFC scan" on a supported device
- **THEN** the browser permission prompt appears (if needed) and scanning begins while manual entry stays usable

#### Scenario: Permission denied gracefully handled
- **WHEN** the user denies the NFC permission
- **THEN** scanning stops, an error message is shown, and manual sign-in/attendance remains available

### Requirement: Tag Payload Format
The system SHALL treat the first text NDEF record payload as the member tag ID value, using the UTF-8 string exactly as stored.

#### Scenario: Text record parsed as member tag ID
- **WHEN** a tag with a text record payload `12345` is read
- **THEN** the value `12345` is used as the member tag ID for lookup

### Requirement: Sign-In Screen NFC Flow
The system SHALL allow signing in a member by tapping a tag on the sign-in screen when the member tag ID matches a known member.

#### Scenario: Recognized tag signs in member
- **WHEN** the sign-in screen is open, NFC scanning is active, and a tag with a known member tag ID is tapped
- **THEN** the member is signed in using the standard sign-in flow and a success confirmation is shown

#### Scenario: Unknown tag shows error
- **WHEN** the sign-in screen is open, NFC scanning is active, and a tag with an unrecognized tag ID is tapped
- **THEN** no sign-in occurs and an error state indicates the tag is not linked to a member

### Requirement: Attendance Screen NFC Flow
The system SHALL allow marking attendance by tapping a member tag on the attendance screen when the member tag ID is recognized.

#### Scenario: Recognized tag records attendance
- **WHEN** the attendance screen is open, NFC scanning is active, and a tag with a known member tag ID is tapped
- **THEN** the attendance entry for the active session is recorded using the existing attendance flow

#### Scenario: Unknown tag shows error
- **WHEN** the attendance screen is open, NFC scanning is active, and a tag with an unrecognized tag ID is tapped
- **THEN** no attendance entry is recorded and an error state indicates the tag is not linked to a member

### Requirement: Tag Writing Not Exposed
The system SHALL NOT expose NFC tag writing or modification in the UI until a dedicated member maintenance flow is specified.

#### Scenario: No tag writing controls available
- **WHEN** users access sign-in, attendance, or member maintenance screens
- **THEN** no controls are shown for writing or modifying NFC tags

### Requirement: Type Support For Web NFC
The codebase SHALL include the Web NFC type definitions so TypeScript can compile NFC usage without custom ambient declarations.

#### Scenario: Types are available to the compiler
- **WHEN** the project is built
- **THEN** `@types/w3c-web-nfc` (or equivalent) is installed and `w3c-web-nfc` is listed under `types` in `tsconfig.json`
