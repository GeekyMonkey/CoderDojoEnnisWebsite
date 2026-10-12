# Change: Restore mentor pod management

## Why
Mentors need to create, edit and remove the pods displayed by coder sessions. Legacy mentor Sessions and Session expose topic, URL, two hosts, mentor-only visibility and joining; saving opens or renews a pod for 2.5 hours.

## What Changes
- Reuse session cards, host photos, calendar and own-attendance joining.
- Add guarded mentor CRUD through strict APIs and a TanStack Query store, with focused host/field/form components and display/edit modes.
- Keep the legacy 2.5-hour renewal on save; default the primary host to the logged-in mentor.
- Preserve removed pods with soft deletion and refuse stale saves/deletes; validate active mentor hosts at commit time.
- Permit authenticated mentors to receive private-pod realtime events using fresh verified database membership, not editable metadata.

## Impact
Master mentor feature 7, additive pod lifecycle/RPC migration, reusable UI/contracts/stores, locales and Bruno requests. Legacy files remain unchanged. Automatic publication is authorized; parent stories follow this batch per the user's instruction.
