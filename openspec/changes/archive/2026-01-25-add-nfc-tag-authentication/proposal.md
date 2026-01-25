# Change: Add NFC Tag Authentication

## Why
Members need an alternative authentication method using NFC tags (similar to existing fingerprint IDs) for both website login and attendance sign-in. NFC tags provide a convenient, touchless authentication mechanism that complements the existing Web NFC scanning capabilities specified in the `nfc` spec.

## What Changes
- Add `nfc-tag` column to the `coderdojo.members` database table to store NFC tag serial numbers (format: "04:7b:ac:32:29:5e:80")
- Add `nfcTag` property to the `MemberModel` TypeScript interface and schema
- Create database lookup method `GetMemberByNfcTag` similar to `GetMemberByFingerprintId`
- Create API endpoint `/api/Auth/LoginNfcTag` for website authentication via NFC tag
- Create API endpoint `/api/MemberAttendance/SignInNfcTag` for attendance sign-in via NFC tag (POST)
- Add Bruno test requests for both new endpoints

## Impact
- Affected specs: `nfc` (extends existing Web NFC spec with backend data model and API requirements)
- Affected code:
  - Database: `supabase/migrations/` (new migration file)
  - Models: `src/shared/types/models/MemberModel.ts`
  - Data access: `src/server/db/MembersData.ts`
  - API: `src/server/api/Auth/LoginNfcTag.post.ts`, `src/server/api/MemberAttendance/nfctag.ts`
  - Tests: `bruno/CoderDojoEnnisApis/Auth/`, `bruno/CoderDojoEnnisApis/Attendance/`
