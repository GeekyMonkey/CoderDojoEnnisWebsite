## 1. Review
- [x] Review develop profile specs, domain docs, stores, authorization, and legacy sections.
- [ ] Validate proposal with OpenSpec CLI when a runnable checkout is available.
- [x] Obtain proposal approval before implementation.

## 2. Implementation
- [x] Keep profile work in the Vue app; include only the explicitly approved image-handler/contract changes outside it.
- [x] Introduce shared profile rendering with explicit display/edit mode propagated to child components.
- [x] Add common personal and member routes; redirect old routes and update navigation.
- [x] Select fields from all assigned subject roles.
- [x] Add permission-aware edit action and preserve server access enforcement.
- [x] Move password changes into a dialog.
- [x] Add applicable legacy profile tabs and store-backed data loading.
- [x] Prioritize photos for mentors; restrict photo changes and deletion to verified mentors.
- [x] Replace swap with server-side avatar-to-photo copy that preserves the avatar.

## 3. Verification
- [ ] Verify self, mentor, linked parent-child, and unauthorized access cases.
- [ ] Verify display mode has no editing controls and other profiles initially display.
- [ ] Verify personal profile initially edits, multi-role fields, redirects, and password dialog.
- [ ] Run permitted type/lint checks; do not automatically run repository test or format commands.
- [x] Add role-field and photo-authorization/copy/recovery regression tests for manual execution.
- [x] Run available script/template syntax checks and whitespace checks.

## 4. Delivery
- [x] Publish feature branch and submit PR against develop after GitHub app installation.
- [x] Prepare local changes for patch delivery.
