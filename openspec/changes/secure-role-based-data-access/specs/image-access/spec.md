## ADDED Requirements

### Requirement: Public image downloads
All application image bytes SHALL remain publicly downloadable, including member photos, avatars, team/category images and supported legacy JPEG fallbacks. The system SHALL preserve public bucket URL behavior without requiring a login or signed URL, including existing archived-member image URLs while their objects exist.

#### Scenario: Logged-out image download
- **WHEN** a logged-out visitor fetches an existing supported image URL
- **THEN** the system SHALL return the public image without authentication

### Requirement: Authorized image mutations
Only an active mentor, the member owner or an active parent linked to the active coder child SHALL mutate that member's photo/avatar. Only active mentors SHALL mutate team/category images. Server-derived paths, validated image processing and consistent row/file side effects SHALL remain enforced. Direct client storage mutation and arbitrary global object listing SHALL be denied.

#### Scenario: Parent replaces linked-child avatar
- **WHEN** an active parent submits a valid replacement for an active linked child's avatar
- **THEN** the system SHALL allow the validated replacement
- **AND** replacing an unrelated child's image or supplying an arbitrary storage path SHALL be denied

### Requirement: Public images do not broaden data access
Public downloads SHALL NOT grant private record access, upload/delete authority or a public member/object metadata directory. This change SHALL NOT alter unrelated applications' storage permissions.

#### Scenario: Visitor attempts overwrite
- **WHEN** a visitor who can download a public image attempts to overwrite, delete or globally list stored objects
- **THEN** the system SHALL deny those operations
