# Change: Complete coder profiles and teammate display

## Why
Legacy coder profiles include birth year, team goals, a roster and a printable passport. Teammate pages display public identity, handles and earned achievements. Current coder profiles lacked this role-specific context.

## What Changes
- Add own-coder context and same-team read-only profiles with strict contracts and restricted public fields.
- Reuse My Profile, external links, photos, team images and passport card components.
- Support own-member achievement history for the coder passport without mentor API access.
- Keep data requests and realtime invalidation in stores.

## Impact
Coder profile/teammate/passport pages, own-history API, shared image/presentation types. No schema change. Authorized by the user's instruction to complete remaining coder tasks and automatically publish verified batches.
