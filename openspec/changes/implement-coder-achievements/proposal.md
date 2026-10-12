# Change: Restore coder goals and achievement applications

## Why
Legacy coder screens let coders plan goals, inspect earned/pending achievements and apply with project evidence. The new routes were placeholders despite completed mentor review workflows.

## What Changes
- Reuse the shared text-goal editor and focused achievement cards/evidence forms.
- Display category-sorted earned/available/pending badges, ordered belts, goal markers and complete feedback.
- Add strict own-coder goal/application APIs and an atomic service-only RPC for stale snapshots, duplicate prevention, goal upgrades and next-belt enforcement.
- Refresh coder and mentor stores through realtime and explicit invalidation.

## Impact
C03-C06 coder routes, contracts, stores, Bruno requests and coder_action migration. Legacy source remains unchanged. The user's current instruction authorizes automatic publication of verified batches.
