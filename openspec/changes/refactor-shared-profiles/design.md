## Decisions
- Use the existing singular `/member` prefix and member layout. Route pages delegate to shared profile containers.
- Resolve the viewer through the existing own-profile store, then mount the mentor or linked-parent container. Existing endpoints remain responsible for access checks.
- Render shared profile fields as text in display mode. Pass the profile mode to account, goals, relationships, skills, images, and achievement decisions. Switching to display discards local section drafts.
- Compose fields from every assigned subject role rather than selecting a single role page. Preserve hidden field values in existing guarded update snapshots.
- Keep narrow parent child-account editing through the existing parent store; do not grant parents mentor account/role controls.
- Password changes/resets use existing actions inside dedicated dialogs.
- Copy avatars on the server. Snapshot source and destination, write only the photo, and recover only destination files on failure. Reject all non-mentor photo mutations before storage access. Retire swap requests.
- Reuse the existing storage boundary: direct client mutations are blocked by restrictive policies; the verified server handler owns writes. No new migration is needed.

## Scope and validation limits
- Retain existing restricted teammate routes and passport routes.
- No live database or deployment changes.
- Full Nuxt build, type checking, browser checks, and OpenSpec CLI validation require unavailable dependencies/network access in this workspace.
