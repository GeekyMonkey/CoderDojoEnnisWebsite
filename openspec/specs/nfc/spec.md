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

### Requirement: Member NFC Tag Storage
The system SHALL store NFC tag serial numbers in the `coderdojo.members` database table as TEXT values in the format of colon-separated hexadecimal bytes (e.g., "04:7b:ac:32:29:5e:80").

#### Scenario: NFC tag stored in member record
- **WHEN** a member has an NFC tag assigned
- **THEN** the tag serial number is stored in the `nfc_tag` column as a TEXT value

#### Scenario: NFC tag uniqueness enforced
- **WHEN** attempting to assign an NFC tag that already exists for another member
- **THEN** the database rejects the operation via a unique constraint

#### Scenario: Member without NFC tag
- **WHEN** a member does not have an NFC tag assigned
- **THEN** the `nfc_tag` column value is NULL

### Requirement: NFC Tag Authentication Lookup
The system SHALL provide a data access method to retrieve a member by their NFC tag serial number, excluding deleted members.

#### Scenario: Member found by valid NFC tag
- **WHEN** querying for a member with a known NFC tag value
- **THEN** the system returns the matching member record

#### Scenario: Unknown NFC tag returns no match
- **WHEN** querying for a member with an unrecognized NFC tag value
- **THEN** the system returns null or no result

#### Scenario: Deleted member not returned
- **WHEN** querying for a member with a valid NFC tag but the member is marked as deleted
- **THEN** the system returns no result

### Requirement: Website Login Via NFC Tag
The system SHALL provide an API endpoint that accepts an NFC tag serial number and returns an authenticated session if the tag matches a known, non-deleted member.

#### Scenario: Successful NFC tag login
- **WHEN** a POST request is made to `/api/Auth/LoginNfcTag` with a valid NFC tag
- **THEN** the system returns the member details and session data

#### Scenario: Unknown NFC tag login fails
- **WHEN** a POST request is made to `/api/Auth/LoginNfcTag` with an unrecognized NFC tag
- **THEN** the system returns an error indicating the tag is not linked to a member

#### Scenario: Deleted member cannot login via NFC tag
- **WHEN** a POST request is made with an NFC tag belonging to a deleted member
- **THEN** the system returns an error indicating authentication failed

### Requirement: Attendance Sign-In Via NFC Tag
The system SHALL provide a POST API endpoint that accepts an NFC tag serial number and records attendance for the active session if the tag matches a known member.

#### Scenario: Successful attendance sign-in with NFC tag
- **WHEN** a POST request is made to `/api/MemberAttendance/SignInNfcTag` with a valid `nfcTag` value (and optional `testing` flag)
- **THEN** the system records attendance for the member and returns success response

#### Scenario: Unknown NFC tag attendance fails
- **WHEN** a POST request is made to `/api/MemberAttendance/SignInNfcTag` with an unrecognized `nfcTag`
- **THEN** the system returns an error indicating the tag is not linked to a member

#### Scenario: Testing mode attendance with NFC tag
- **WHEN** a POST request is made to `/api/MemberAttendance/SignInNfcTag` with `testing=true`
- **THEN** the system processes attendance in testing mode (following existing testing behavior)

### Requirement: NFC Tag API Testing
The system SHALL include Bruno API test requests for both NFC tag authentication endpoints to enable automated and manual testing.

#### Scenario: Auth login NFC tag test exists
- **WHEN** reviewing Bruno test requests under `bruno/CoderDojoEnnisApis/Auth/`
- **THEN** a test request named "Login NfcTag" (or similar) is present

#### Scenario: Attendance sign-in NFC tag test exists
- **WHEN** reviewing Bruno test requests under `bruno/CoderDojoEnnisApis/Attendance/`
- **THEN** a test request named "SignIn NfcTag" (or similar) is present

