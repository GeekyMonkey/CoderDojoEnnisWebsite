# Restore mentor data maintenance

## Why
Master migration feature 11 still links to placeholder pages. Mentors need the legacy inactive-account cleanup and end-of-term registration reset.

## What Changes
- Replace both placeholders with a shared, translated preview and confirmation interface.
- Restore the complete legacy controller/model/view rules, including never-attended coders, strict one-year cutoff, orphan parents, soft deletion, archived coder registrations and result counts.
- Adapt separate legacy Member/Adult tables to unified roles: never archive mentors or an active coder through their parent role; count inactive coder/parents once as coders.
- Use validated TanStack Query store actions and realtime invalidation.
- Apply in a service-only, mentor-authorized database transaction, rejecting stale previews and serializing attendance, role and link writes while applying.

## Impact
- Existing mentor maintenance routes; new Management preview/apply APIs and Bruno requests.
- Additive `coderdojo.maintain_data` function and generated TypeScript function contract.
- No hard deletion, password changes or history removal.

Implementation authorized by the user's request on 2026-10-12 to complete both functions and check the legacy implementation. Verification must not run maintenance against real accounts.
