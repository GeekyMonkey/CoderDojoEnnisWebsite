## ADDED Requirements
### Requirement: Coder personal attendance
The system SHALL display a coder's total unique attended sessions and dates newest first through a shared store-backed component, matching the legacy attendance screen's purpose.

#### Scenario: Coder views attendance
- **WHEN** an active coder visits their attendance page
- **THEN** only their own attendance dates and total are shown
- **AND** dates are localized and newest first

#### Scenario: Remote attendance changes
- **WHEN** a mentor records attendance while the coder page is open
- **THEN** the store refreshes the coder's attendance without a page reload

### Requirement: Own-member attendance authorization
The API MUST derive the member ID from the verified session and require an active coder database record. It MUST reject all query parameters and unauthenticated or non-coder requests.

#### Scenario: Selected member query rejected
- **WHEN** a coder supplies a memberId query parameter
- **THEN** the API returns 400 without revealing another member's attendance

#### Scenario: Non-coder denied
- **WHEN** a signed-in member without the coder role requests coder attendance
- **THEN** the API returns 403
