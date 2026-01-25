## ADDED Requirements

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
