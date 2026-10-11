# Change: Achievement definition maintenance

## Why
Mentors need the legacy belt, badge and category maintenance workflows in the new website.

## What Changes
- Shared directories and display-first detail pages with linked breadcrumbs.
- Belt names, hexadecimal colours, sort order and descriptions; badge achievements, descriptions and category selection; category names and descriptions.
- Strict Zod contracts and current-mentor APIs with transactional snapshot guards and soft deletion.
- TanStack Query caching, realtime refresh and protected unsaved drafts using shared components.
- Retain historical achievements after definition deletion; block category deletion while active badges or mentor skills reference it.

## Impact
- Master migration feature 6. Printing and image editing remain separate stories.
- Implementation authorized by user after team-management review; leave this batch uncommitted for review.
- Active implementation only; legacy remains reference material.
