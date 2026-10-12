# Change: Implement coder personal attendance

## Why
The coder attendance route is a placeholder. The legacy coder screen shows total attended sessions and dates newest first.

## What Changes
- Reuse the shared attendance history component and TanStack Query store for the current coder.
- Add a strict own-member API that verifies the current database coder role and rejects selected member IDs.
- Retain realtime invalidation and translated, localized date display.

## Impact
- Coder attendance route, shared history component/store, Bruno request.
- No database migration or legacy changes.
- Authorized by the user's instruction to focus on coder use cases using legacy implementations as the baseline. Remaining discrepancies stay deferred.
