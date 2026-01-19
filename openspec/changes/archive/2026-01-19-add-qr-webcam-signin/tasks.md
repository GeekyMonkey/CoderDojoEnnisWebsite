## 1. Implementation
- [x] 1.1 Add dependency for QR decoding (vue-qrcode-reader) and document any build/runtime flags if needed.
- [x] 1.2 Create `components/common/QrCodeReader.vue` with start/stop controls, active state, decode event (decoded GUID), and inline error handling for permissions/unavailable camera.
- [x] 1.3 Add backend endpoint `/api/MemberAttendance/SignInGuid` that mirrors `/api/MemberAttendance/SignIn` behavior but accepts only the member GUID and returns the same response shape; share logic where possible.
- [x] 1.4 Integrate QrCodeReader into `app/pages/(member)/mentor/SignIn.vue` above the existing cards; on decode, call the new GUID endpoint and keep manual username/password flow unchanged.
- [x] 1.5 Add i18n strings or inline copy for scanner instructions and error states.

## 2. Validation
- [ ] 2.1 Exercise manual QA: allow/deny camera permissions, verify decoded GUID triggers sign-in via new endpoint, confirm form still works without camera, verify mobile/desktop webcam access.
- [ ] 2.2 Run backend/API tests for `/api/MemberAttendance/SignInGuid` (mirror existing SignIn cases).
- [ ] 2.3 Run `openspec validate add-qr-webcam-signin --strict` and ensure all checks pass.
