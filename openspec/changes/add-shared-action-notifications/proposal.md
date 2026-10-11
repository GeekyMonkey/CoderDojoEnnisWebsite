# Change: Centralize action feedback as notification events

## Why
Profile image controls need compact action feedback, and the site currently implements action messages independently. A shared event-driven toast presenter will let notification behavior be adjusted in one place.

## What Changes
- Add a typed application notification event publisher and one presenter mounted inside UApp.
- Centralize toast duration, placement, severity styling, duplicate handling and success visibility policy.
- Route transient success and failure feedback for profile images, profile/password updates, mentor maintenance, achievement review and team actions through the shared publisher.
- Remove inline action success banners, including images saved. Profile image success events are silent by default, configurable centrally.
- Keep validation errors, data-loading states, concurrent-edit warnings and the attendance kiosk welcome panel inline because they guide an ongoing interaction.

## Impact
- Affected specs: action-notifications (new).
- Affected code: app root, new notification composable/presenter, action feedback components.
- No API, storage or database changes.
