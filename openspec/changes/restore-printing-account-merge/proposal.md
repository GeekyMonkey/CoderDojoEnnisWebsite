# Restore printing, account merge and review policy

## Why
D20–D24 complete missing mentor maintenance actions. The user explicitly requested this batch and selected blocking reviews of a mentor's own child for both belts and badges.

## What Changes
- Extend shared ID printing to registered coders, mentors and individual accounts; add earned belt certificates; retain D26 team printing.
- Preview and atomically merge duplicate accounts, preserving the survivor's identity, credentials and images, transferring history/relationships/skills and archiving the duplicate.
- Enforce the linked-child review restriction in database decisions and expose it to the UI; invalidate on relationship changes.

## Impact
Shared printing components, maintenance stores/APIs, service-only database functions, Bruno requests and the master checklist. No legacy changes. Authorization: the user's explicit implementation request approves this scope; new work remains uncommitted for review.
