# Change: Complete member maintenance batch (features 1–4)

## Why
Mentors need the coder and adult maintenance workflows from the legacy application. The user has explicitly authorized implementing features 1–4 together after reviewing My Profile.

## What Changes
- Searchable coder, parent and mentor directories, signup, shared details, role-aware account settings and password reset.
- Coder goals, individual attendance history and existing achievement history.
- Searchable parent/child relationship views with link/unlink actions.
- Adult roles and mentor skill/category assignments.
- Zod contracts, authenticated mentor APIs, TanStack Query stores, reusable display/edit sections and realtime refresh.

## Impact
- Active src code and Bruno API requests; legacy sources remain read-only.
- A service-role-only transactional database function provides conflict-safe updates and idempotent relationships/skills.
- Batch implementation authorized by the user; code review follows completion. Batch changes remain uncommitted for review.
