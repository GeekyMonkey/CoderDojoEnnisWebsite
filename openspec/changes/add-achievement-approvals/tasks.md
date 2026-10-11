## 1. Data and authorization
- [x] 1.1 Verify achievement foreign keys and the authenticated mentor identity mapping (generated schema and existing login account convention).
- [x] 1.2 Add server-side verified-session and database mentor authorization for the new reads and mutations.
- [x] 1.3 Add pending badge reads and member achievement history reads.
- [x] 1.4 Implement guarded approve, reject and undo operations for badges and belts.
- [x] 1.5 Add validated API endpoints and corresponding Bruno requests.

## 2. Client
- [x] 2.1 Extend belt store and add badge store with mutations, invalidation and realtime refresh.
- [x] 2.2 Add pending badge applications to the mentor dashboard.
- [x] 2.3 Add notes and approval/rejection controls with loading and error feedback.
- [x] 2.4 Add coder achievement histories and confirmed undo controls.
- [x] 2.5 Translate UI text in en, fr, ga and uk.

## 3. Verification
- [x] 3.1 Add meaningful coverage for authorization, state transitions, conflicts and preservation of application data (tests added; execution left to the user).
- [x] 3.2 Verify production compilation and dev/built preview startup.
- [ ] 3.3 Verify browser rendering and read-only application loading; document any checks needing disposable data.
- [x] 3.4 Update the migration checklist to reflect the implemented scope.

See `validation.md` for evidence and outstanding checks. Do not archive this change until authenticated UI and disposable-data verification are complete.
