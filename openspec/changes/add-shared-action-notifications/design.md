## Context
UApp already provides Nuxt UI toast infrastructure. Existing components own unrelated inline success and failure messages.

## Decisions
- Components publish typed events containing a stable event name, severity and translated message. They do not specify toast duration, position or styling.
- A single application presenter consumes transient events and applies one policy table. Profile image success is suppressed by default; errors remain visible as toasts.
- Events are client-local and transient, not persisted or replayed after navigation. Presenter lifecycle cleanup prevents duplicate subscriptions.
- Migrate transient action feedback across the active application. Preserve field validation, load errors, remote-edit warnings and attendance welcome information inline.

## Risks / Trade-offs
- Removing inline error feedback can hide actionable context. Preserve validation errors alongside fields and only migrate transient operation outcomes.
- Multiple retries can produce noisy notifications. Centralize duplicate handling by event name and message.

## Verification
Check upload, swap, delete, save, password reset, achievement review and team/maintenance action outcomes; verify one toast per event, no inline success banners and configurable image-success suppression. Verify keyboard access and equal image sizing on desktop and phone.
