# Change: Edit own mentor profile

## Why
The mentor profile route is a placeholder. Complete feature 12 first under the user's authorization to implement the mentor queue with code review after each feature.

## What Changes
- Read and edit the logged-in member's name regardless of role, email, phone and external account handles.
- Change a password after verifying the current password against the authenticated member.
- Route all UI requests through a TanStack Query store, invalidate shared member caches and receive realtime updates.
- Detect concurrent saves and preserve unsaved drafts when remote updates arrive.

## Impact
- New role-neutral own-profile and selected-profile endpoints with server-derived permissions, plus own password endpoint with Bruno requests.
- No legacy source or schema changes; privileged membership fields are not editable.
- Photo uploads and mentor category administration remain in their separate migration stories.

The user requested separate My Profile and User Profiles stores over MemberModel. Role-specific pages use shared presentation, while slots receive the viewed member and server permissions for role-specific sections.
