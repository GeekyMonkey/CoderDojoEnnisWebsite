## 1. Data and access
- [x] 1.1 Implement the proposed schema in proposal.md, including private GitHub validation evidence, required helpers/triggers, field constraints, stable ordering index, and public-read RLS and member/linked-parent/mentor write policies; no GitHub backfill.
- [x] 1.2 Add shared validated contracts and data access with explicit public field projection.
- [x] 1.3 Extend badge-category image patterns for owned showcase thumbnails, public thumbnail URLs, replacement/removal and cleanup.

## 2. API and stores
- [x] 2.1 Add authenticated member list/create/update/delete and image APIs; enforce member/linked-parent/mentor write permissions server-side.
- [x] 2.2 Add public visible-only showcase API and TanStack-backed project-type/username filtering with deterministic newest-first ordering.
- [x] 2.3 Add corresponding Bruno requests for every new endpoint.
- [x] 2.4 Route all client reads, writes and image actions through TanStack stores for all member-role and public views; no direct page fetches or bespoke stores.
- [x] 2.5 Add anonymous-compatible live invalidation for insert/update/delete/visibility/image changes, immediate public query refresh and reconnect recovery.

## 3. Coder and public UI
- [x] 3.1 Add Showcase navigation/page wrappers for Coder, Parent and Mentor; reuse shared management and add/edit components with editable date, visibility and thumbnail.
- [x] 3.4 Add project-type-specific controls/instructions for all four project types, including profile links, GitHub Pages setup help, validation/retry states and hidden drafts.
- [x] 3.2 Replace public Projects directory with showcase cards and top project-type/username/member-type controls; update linked labels and invitation copy.
- [x] 3.3 Build `/showcase`, update public links and remove the superseded Projects integration without compatibility requirements; use shared styling, system themes, accessible states, keyboard controls and mobile layout.

## 4. Verification
- [x] 4.1 Verify defaults, required fields, date editing, supported types and unsafe URL rejection.
- [x] 4.2 Verify public table SELECT, allowed linked-member/linked-parent/mentor writes, unrelated-member and anonymous write denials, immutable ownership, public-page visibility filtering, public image access independent of card visibility, minimal identity projection and no automatic GitHub inclusion.
- [x] 4.3 Verify combined filters, stable date ordering, upload/replace/remove cleanup, and live updates on an already-open anonymous public page without reload, including hide/delete and reconnect recovery.
- [x] 4.4 Verify CRUD for every member type and shared authorized member contexts and public loading/error/empty/no-match states in browser, including mobile and light/dark.
- [x] 4.5 Run appropriate focused checks and production build; do not automatically run `pnpm -C src format` or `pnpm -C src test`.

## 5. GitHub profile validation
- [x] 5.1 Add server validation using the owning member’s saved GitHub username, published Pages check, bounded requests and safe redirect handling.
- [x] 5.2 Add server-controlled validation metadata and database-enforced publication invariant; invalidate/hide on linked GitHub username changes.
- [x] 5.3 Expose validation through TanStack store actions with corresponding Bruno requests.
- [x] 5.4 Verify missing username, absent site, published site, timeout/rate-limit retry, hidden drafts, project type changes, owner-versus-editor identity and prevention of API/direct-table validation bypass.
- [x] 5.5 Verify GitHub account changes hide affected entries on already-open public pages and revalidation permits publication again.

## 6. Guided project selection
- [x] 6.1 Add default wizard navigation/state using the shared editor components; preserve drafts and save only on final confirmation.
- [x] 6.2 Add paginated shared Scratch project discovery using the target member’s saved scratchName; include setup links, public-sharing note and refresh.
- [x] 6.3 Add itch.io public URL resolution and selectable preview, without requiring account API credentials.
- [x] 6.4 Add normalized metadata import and validated managed-thumbnail ingestion for Scratch/itch.io through TanStack stores, with Bruno requests for new endpoints.
- [x] 6.5 Verify source ownership, pagination, missing username/projects, partial metadata, fetch failures, editable imports, project reselection and stale-response protection.
- [x] 6.6 Verify wizard and edit imports across all member roles and linked-parent/mentor contexts, including keyboard/mobile use.

## 7. Public member-type filter
- [x] 7.1 Add public role-category projection and member-type filtering, defaulting to Coder; handle multi-role owners without duplicate entries.
- [x] 7.2 Offer Parent only when publicly eligible parent entries exist across the full showcase, independently of other filters.
- [x] 7.3 Update available options live; reset a removed Parent selection to Coder while preserving other filters, including on owner-role changes.
- [x] 7.4 Verify default Coder, Mentor selection, Parent absence/presence, combined filters, multi-role ownership, and live option removal.

## 8. Project type terminology
- [x] 8.1 Use Project type in all UI labels/instructions, project_type in the database, and projectType in client contracts/stores; keep Member type distinct.

## 9. Develop evaluation
- [ ] 9.1 Complete hosted evaluation on develop with real member accounts and provider image uploads; local browser checks used fixture data.
