## Context
- Mentor sign-in page currently uses a username/password form plus inline success panel. We want to add an optional QR-based capture using the device webcam that returns a member GUID.
- Library candidate: `vue-qrcode-reader` (per user request/demo) to simplify camera access and decoding across browsers.

## Goals / Non-Goals
- Goals: Simple webcam QR capture to fetch sign-in by member GUID; reusable component for other pages; graceful fallback when camera unavailable or denied.
- Non-Goals: Auto-submit password flows, store camera streams, or redesign overall sign-in form beyond adding GUID flow.

## Decisions
- Use `vue-qrcode-reader` for QR decoding; wrap it in `components/common/QrCodeReader.vue` to hide library-specific APIs and emit a simple `decoded` event (decoded text is the member GUID).
- Provide explicit start/stop controls to release the camera stream; show active/idle state and inline permission errors.
- Render a static placeholder while idle; do not access the camera until the user explicitly starts scanning.
- On decode, call new endpoint `/api/MemberAttendance/SignInGuid` with the GUID and reuse the existing sign-in response handling UI; keep manual username/password flow intact.

## Risks / Trade-offs
- Camera permission denial: must show inline error and leave manual form usable. Mitigation: render form unchanged, guard decode handler.
- Browser support differences: `vue-qrcode-reader` covers most modern browsers; document manual QA for mobile/desktop.
- Performance: keep scanner suspended by default; activate only when user starts it to avoid unnecessary camera usage.
- Backend change: new endpoint must mirror existing SignIn behavior; ensure shared logic to avoid drift.

## Open Questions
- None (scanner remains idle with placeholder until user starts it).
