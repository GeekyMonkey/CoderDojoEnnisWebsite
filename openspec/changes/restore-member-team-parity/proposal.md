# Restore member and team parity

## Why
The user selected master-checklist D09–D15 and D25–D27 for this batch. These restore directory context, signup attendance, reusable profile links/images, relationship search and team maintenance/printing behavior found in the legacy version.

## What Changes
- Add current-session directory presence and team logos, category labels and stable relationship paging/sorting.
- Create signup attendance atomically for an explicit selected date; coder signup defaults to attended today.
- Reuse validated picker/drop/decoding/crop tools across profiles and teams.
- Store immutable team images with optimistic revision checks, cached stores and realtime refresh.
- Add team card and team-member ID print previews with encoded member identities and current awards.

## Impact
- New mentor-only team image API and Bruno request.
- Migration adds team image metadata and a service-only signup transaction wrapper; existing teams retain legacy JPG display.
- No legacy source changes. Current belts remain hidden only in pending belt application lists. D01 and D07 remain won’t do.

## Authorization
The user explicitly authorized this scope by requesting D09–D15 and D25–D27 from the master checklist. No separate feature approval is pending; code review follows the completed batch.
