## Context
The system already supports fingerprint ID authentication for attendance sign-in. We need to add NFC tag authentication as a similar alternative mechanism for both website login and attendance tracking. The existing `nfc` spec defines Web NFC scanning behavior in the browser but does not cover the backend data model or API patterns for NFC-based authentication.

## Goals / Non-Goals

### Goals
- Store NFC tag serial numbers in the member database
- Enable login to the website using NFC tags
- Enable attendance sign-in using NFC tags
- Follow existing patterns (fingerprint ID) for consistency
- Create testable API endpoints with Bruno requests

### Non-Goals
- NFC tag writing/programming capabilities (explicitly out of scope per existing `nfc` spec)
- UI changes for NFC scanning (existing Web NFC UI will be extended separately)
- Multi-tag support (one tag per member)
- Tag format validation beyond basic string storage

## Decisions

### Decision: Database Column Naming
- **Choice**: Use `nfc_tag` (snake_case) in database, `nfcTag` (camelCase) in TypeScript models
- **Rationale**: Follows existing convention seen in `fingerprint_id` → `fingerprintId` pattern
- **Alternatives considered**: Using `nfc_tag_id` or `nfc_serial_number` - rejected for simplicity

### Decision: NFC Tag Format
- **Choice**: Store as TEXT with format like "04:7b:ac:32:29:5e:80" (colon-separated hex bytes)
- **Rationale**: This is the standard format for NFC tag serial numbers (UID); flexible for various tag types
- **Alternatives considered**: 
  - Storing as binary/bytea - rejected for readability and API simplicity
  - Removing colons - rejected to maintain standard representation

### Decision: API Endpoints
- **Choice**: Create two separate endpoints following existing patterns:
  1. `/api/Auth/LoginNfcTag` (POST) - for website authentication
  2. `/api/MemberAttendance/SignInNfcTag` (POST) - for attendance sign-in
- **Rationale**: Mirrors the separation between `/api/Auth/Login` (password) and `/api/MemberAttendance/fingerprint` (attendance)
- **Alternatives considered**: Single unified endpoint - rejected to maintain clear separation of concerns between auth and attendance

### Decision: Unique Constraint
- **Choice**: Add a unique partial index on `nfc_tag WHERE nfc_tag IS NOT NULL`
- **Rationale**: Prevents duplicate NFC tags across members while allowing NULL values
- **Alternatives considered**: Unique constraint without partial index - would fail with multiple NULLs

### Decision: Service Layer Pattern
- **Choice**: Reuse existing `AuthService.loginWithPassword` pattern or create minimal `loginWithNfcTag` if needed
- **Rationale**: Leverage existing authentication flows; only the lookup mechanism differs
- **Alternatives considered**: Creating entirely separate auth flow - rejected as unnecessarily complex

## Risks / Trade-offs

### Risk: NFC Tag Collisions
- **Description**: If multiple members are assigned the same NFC tag serial, authentication will fail or be ambiguous
- **Mitigation**: Unique constraint on database column prevents this at the data layer

### Risk: Tag Format Variability
- **Description**: Different NFC tag types may have different UID formats
- **Mitigation**: Store as flexible TEXT; validation can be added later if needed

### Trade-off: No Format Validation
- **Trade-off**: We're not validating the NFC tag format (e.g., regex check for hex pattern)
- **Reasoning**: Keep initial implementation simple; validation can be added if issues arise
- **Impact**: Invalid data could be stored, but functional impact is low (lookup simply won't match)

## Migration Plan

### Implementation Steps
1. Create and apply database migration
2. Update TypeScript models and data access layer
3. Implement API endpoints
4. Add Bruno tests
5. Test locally with sample NFC tag values
6. Deploy to production

### Rollback
- If issues arise, the NFC tag column can remain in the database (as nullable) without impact
- API endpoints can be removed or disabled without affecting existing auth flows

### Data Migration
- No existing data migration needed (column is nullable)
- Members can have their NFC tags assigned through future member management UI (not in scope for this change)

## Open Questions
- None at this time. The pattern is well-established from the fingerprint ID implementation.
