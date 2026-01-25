## 1. Database Schema
- [x] 1.1 Create migration file `supabase/migrations/YYYYMMDDHHMMSS_coderdojo_add_nfc_tag_to_members.sql`
- [x] 1.2 Add `nfc_tag TEXT` column to `coderdojo.members` table with appropriate constraints
- [x] 1.3 Create unique index on `nfc_tag` column (where not null)
- [x] 1.4 Test migration applies cleanly

## 2. TypeScript Models
- [x] 2.1 Add `nfcTag: z.string().nullable()` to `MemberModelSchema` in `MemberModel.ts`
- [x] 2.2 Update `memberFromRecord` function to map `nfc_tag` database column to `nfcTag` model property
- [x] 2.3 Update `memberToRecord` function to map `nfcTag` model property to `nfc_tag` database column
- [x] 2.4 Update `MemberRecord` type import if needed

## 3. Data Access Layer
- [x] 3.1 Add `GetMemberByNfcTag` function to `MembersData.ts` following the pattern from `GetMemberByFingerprintId`
- [x] 3.2 Add appropriate error handling and logging

## 4. Authentication API Endpoint
- [x] 4.1 Create `src/server/api/Auth/LoginNfcTag.post.ts` endpoint
- [x] 4.2 Accept `nfcTag` parameter in request body
- [x] 4.3 Look up member by NFC tag using `GetMemberByNfcTag`
- [x] 4.4 Use `AuthService.loginWithNfcTag` or similar pattern (create if needed)
- [x] 4.5 Return member and session data on success
- [x] 4.6 Return appropriate error responses for invalid/unknown tags

## 5. Attendance Sign-In API Endpoint
- [x] 5.1 Create `src/server/api/MemberAttendance/SignInNfcTag.post.ts` endpoint
- [x] 5.2 Accept `nfcTag` (tag value) and optional `testing` flag in the request body
- [x] 5.3 Look up member by NFC tag
- [x] 5.4 Call `AttendanceService.signInMember` with found member
- [x] 5.5 Return attendance response or error

## 6. Bruno API Tests
- [x] 6.1 Create `bruno/CoderDojoEnnisApis/Auth/Login NfcTag.bru` test request
- [x] 6.2 Create `bruno/CoderDojoEnnisApis/Attendance/SignIn NfcTag.bru` test request
- [ ] 6.3 Test both endpoints manually to verify functionality

## 7. AuthService Updates (if needed)
- [x] 7.1 Review if `AuthService` needs a dedicated `loginWithNfcTag` method or if existing patterns suffice
- [x] 7.2 Implement any necessary service layer methods

## 8. Validation
- [x] 8.1 Run database migration on local environment
- [x] 8.2 Verify TypeScript compilation with no errors
- [ ] 8.3 Test auth login endpoint via Bruno
- [ ] 8.4 Test attendance sign-in endpoint via Bruno
- [ ] 8.5 Verify NFC tag format validation (if required)
