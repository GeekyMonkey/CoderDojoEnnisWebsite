# Change: Add webcam QR scanner to mentor sign-in (GUID-based)

## Why
- Speed up mentor sign-in by allowing QR scanning instead of manual username entry.
- Reduce data entry errors while keeping the existing username/password flow intact.

## What Changes
- Add a reusable `components/common/QrCodeReader.vue` that uses the device webcam to decode QR codes (based on `vue-qrcode-reader`), with clear start/stop controls and inline error states.
- Integrate the QR reader at the top of the mentor sign-in page; when a QR code is scanned, send the decoded member GUID to a new backend endpoint.
- Add a new API endpoint `/api/MemberAttendance/SignInGuid` that mirrors `/api/MemberAttendance/SignIn` behavior but accepts only the member GUID; reuse the same response handling on the client.
- Handle camera permission errors gracefully (inline message, no modal alerts) and keep the page usable without camera access.
- Add minimal UX affordances (instructions, loading/active indicator) to show scanner status.

## Impact
- Affected specs: attendance-signin-ui
- Affected code: components/common/QrCodeReader.vue; app/pages/(member)/mentor/SignIn.vue; related composables/tests as needed
