# Change: Mentor team maintenance

## Why
Mentors need the legacy team directory and team editing workflow in the new website.

## What Changes
- Searchable teams and display-first details with names, goals, notes, colours and assigned member links.
- Shared validated form for creation and editing; mentor-only APIs, guarded transactional writes and soft deletion.
- TanStack Query store owns requests and realtime invalidation; unsaved drafts survive remote changes.

## Impact
- Affected capability: team-maintenance; master checklist feature 5.
- Active code only; printing and image editing remain in their later migration stories.
- User authorized progressing after approving features 1–4; pause for review after feature 5.
