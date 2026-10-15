## Context
The public `/_members.html` page currently consumes `/api/githubaccounts` through `src/public-site/directoryStore.ts`. Coder pages use role-scoped server APIs and client stores. Badge category thumbnails use `changeEntityImage` and validated image actions.

## Decisions
- Store entries in `coderdojo.member_showcase`, linked to `members.id`. Keep ownership immutable. Include title, description, `project_type` (`scratch`, `itch`, `website`, `github_profile`), URL, nullable thumbnail reference, date-only showcase date, visibility, and creation/update timestamps.
- Interpret username as the club profile login (`members.login`), not the GitHub handle. Public output includes username, the requested member display name, avatar/photo choice and showcase fields; exclude email, birth details and internal account data.
- Use Scratch, itch.io, Website, and GitHub profile as display labels. Require a valid HTTP(S) URL; render plain text and safe external links, without embedding remote projects.
- Default the editable date to the creation calendar date using the established date helpers. Sort descending by showcase date, then creation timestamp and ID for stable ties. Editing a description does not promote an older item.
- Enable RLS on the new table: public SELECT for anonymous and authenticated readers; INSERT, UPDATE and DELETE only for the linked member, a parent linked to that member, or any mentor. Use existing trusted identity, parent-link and mentor predicates. Validate both existing and resulting row ownership on UPDATE; ownership remains immutable. Apply the same write authorization to image operations and API handlers.
- Public table read includes hidden rows; visibility controls inclusion on the public showcase page, not confidentiality of the underlying record. The public store filters visible entries and active owners. Public reads must not grant access to unrelated private member fields.
- Reuse badge-category image validation, processing and upload controls with showcase-specific ownership checks and storage paths. Permit upload, replacement and removal. Use a public thumbnail bucket; hidden entries’ images may still be viewed directly. Clean obsolete assets safely after successful replacement/deletion.
- Use a minimal public projection and filter visibility and deleted/archived owners for showcase results. Subscribe anonymous public visitors to showcase changes, including hide and delete events. Broadcast minimal invalidation signals without private account data; invalidate/refetch the TanStack showcase query immediately. Updates must appear on already-open public pages without reload or polling. Refetch after reconnect to recover missed events. Avoid stale HTTP/CDN caching.
- All client data access SHALL use the existing TanStack store patterns: reads, mutations, image actions, cache updates and realtime invalidation. Pages/components must not fetch directly or introduce bespoke stores. Integrate the public showcase with TanStack too, adapting the standalone page bootstrap as needed. Preserve active filters while live results update.
- Build the new public Showcase at `/showcase` and update navigation and inbound public links. Replace the old Projects page and its directory integration; no legacy URL compatibility, redirects or preservation requirement. Use shared variable-based CSS, system themes and semantic mobile layout.
- Combine project type filtering and case-insensitive partial username matching. Empty filters show all visible entries. Filtering never exposes hidden items.

## Migration and rollout
Create an empty table; no automatic GitHub import. Add schema/access/storage support before deploying dependent APIs and pages. Replace the existing Projects integration; remove obsolete directory code/assets/endpoints after checking references. No backward-compatibility requirement applies.

## Assumptions for review
- GitHub profile means the member’s published GitHub Pages user site, not merely their github.com profile.
- Username means the club login, and ordering uses the editable showcase date.
- Provide own-entry Showcase links for Coder, Parent and Mentor pages. Reuse the same components for authorized member contexts; ownership/access rules remain consistent across roles.

## Shared member UI
Use a reusable showcase management component accepting the target member identity, with shared entry list and add/edit form components. Thin Coder, Parent and Mentor page wrappers supply context and navigation; do not duplicate forms or data logic. Every member type can manage its own entries. Linked-parent/mentor access to another member uses the same component and existing authorized member contexts. All interactions go through TanStack stores.

## Project-type-specific editor
Show relevant controls and concise instructions directly below the project type selector on both add and edit. Scratch offers a paginated picker of the owning member’s shared projects; itch.io accepts a public project URL and resolves it into a selectable preview; Website requests the public site URL. GitHub profile shows the owning member’s saved GitHub username, derived Pages address, validation status/action and setup guidance. A change of project type clears incompatible validation state. Common title, description, date and thumbnail fields remain available.

## GitHub profile validation
- Read the owning member’s saved GitHub username server-side, including when a parent or mentor is editing. Never substitute the editor’s GitHub account or trust client-supplied validation flags.
- If the username is absent, keep the item hidden and explain how to add it in the owning member’s profile, linking to the appropriate existing profile editor. Allow saving an incomplete GitHub item as hidden with a nullable derived URL until the account is configured; other types require their URL.
- Validate the member’s GitHub Pages user site at `https://<username>.github.io/` on the server. Confirm an actual published site, not just an existing GitHub account or repository. Use bounded requests and validated GitHub hosts; any supported custom-domain redirects must be checked safely, never fetched as arbitrary client URLs.
- Store validation status, checked username, validated URL and timestamp in the private `showcase_github_validation` table described in proposal.md. Recheck before any operation publishing a GitHub profile item. Enforce the validation invariant at the database write boundary too, so direct authenticated table writes cannot bypass it or forge validation metadata. Mentors follow the same publication requirement.
- Default visibility to hidden until validation succeeds for this project type. Permit hidden drafts; successful validation enables the normal visibility toggle without automatically publishing a deliberately hidden draft.
- Distinguish missing username, site not published, checking, validated and transient validation failure. On failure keep publication disabled, preserve form data and offer retry. When the site is absent, show concise setup instructions and link to the official GitHub Pages quickstart: https://docs.github.com/en/pages/quickstart . A timeout or rate limit must not be described as proof that no site exists.
- Changing/removing the linked GitHub username invalidates its validation and hides affected GitHub profile entries until revalidated; propagate this to open public pages through the same realtime store flow. Changing away from this project type removes its validation requirement.

## Reference
GitHub Pages user sites use the `<username>.github.io` repository/address convention: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site .

## Guided add flow and project import
- Default Add to wizard mode: choose project type → select project or complete account/site setup → review/edit details → review date/visibility and save. Show Back/Next and the current step, retain draft state on navigation and errors, and save only on explicit final confirmation. Reuse the same project type controls and field components in edit mode. No shell wizard or credential setup is involved.
- Read the owning member’s existing `scratchName` profile field. If absent, explain how to enter their Scratch username in their club profile and link to the appropriate profile editor. Refresh the store after profile changes; parent/mentor editors use the target member’s account.
- Fetch shared Scratch projects server-side from `https://api.scratch.mit.edu/users/{username}/projects` with limit/offset pagination. Return normalized project IDs, canonical URLs, title, description and image. Verify selected projects belong to that saved username and are public. Include every page via load-more or equivalent; do not interpret the first response as the entire collection.
- Show: “Project missing? Share it publicly on Scratch, then refresh this list.” Include a refresh action and concise sharing guidance. Distinguish missing username, invalid account, no shared projects and upstream failure. A network failure must not be presented as proof that a project is private.
- For itch.io, accept a public project URL, resolve public page metadata on the server, and show a project preview to select/confirm. Do not promise an anonymous account-wide picker: itch.io’s documented `/profile/games` API requires credentials. No itch.io API key/OAuth setup is required for this flow.
- After selecting/confirming either a Scratch or itch.io project, automatically populate title, description and image from fetched metadata, alongside its canonical URL/source ID. Scratch uses its title, description and project image; itch.io uses page title, description and cover metadata. Render imported descriptions as plain text. Keep imported values editable and allow replacement/removal of the thumbnail.
- Import the selected image through the established validated thumbnail pipeline into managed storage, applying size/type limits and ownership checks. Retain source identity for refetching without relying on permanent third-party hotlinks.
- If metadata or an image is absent, populate available fields and clearly request the missing details manually; preserve existing user edits on failed imports. If selection changes after edits, require explicit replacement rather than silently overwriting them. Late responses for a previous selection must never overwrite the current selection.
- All discovery/import calls use TanStack store functions. Server fetches validate platform hosts, redirect targets, content type, body/image size and timeouts. Return bounded normalized metadata, not arbitrary HTML. Expose retryable errors.

## Discovery evidence
- Scratch Foundation’s API reference documents public shared-project discovery and pagination: https://github.com/scratchfoundation/scratch-rest-api/wiki/Projects . A live request to `/users/mres/projects?limit=1&offset=0` returned title, description, image/images and public/is_published fields on 2026-10-15.
- itch.io’s documented account project API requires authentication: https://itch.io/docs/api/serverside . Creator guidance identifies title, short description and cover image as listing metadata: https://itch.io/docs/creators/getting-started . A live public Celeste page check on 2026-10-15 exposed twitter:title, og:description and og:image; public metadata extraction remains a best-effort integration with manual completion when fields are absent.

## Public member-type filter
- Add a member-type control alongside project type and username, with Coder selected on initial load. Offer Coder and Mentor; include Parent only when at least one currently public showcase item belongs to an active parent.
- Determine Parent availability from all publicly eligible showcase items, independently of the currently selected member type, project type or username search. Hidden items and inactive owners do not count. Return only public role categories, not private profile details.
- Members can hold multiple roles: an item matches each role its owner currently holds and appears once in the selected results. Do not arbitrarily assign a single primary role.
- Combine member type, project type and username filtering, preserving newest-first ordering. Keep Coder as the default even if it has no entries; show the normal no-match state.
- Recompute Parent availability on realtime changes. If Parent is selected when its last public entry disappears, remove the option and reset the selection to Coder. Preserve the other filters. Refresh role eligibility when an owner’s roles change.

## Naming
Use “Project type” for editor, wizard and public filter labels, `project_type` for the database column, and `projectType` for camelCase contracts/store fields. Keep “Member type” distinct.

## Database schema
The proposed tables, columns, indexes and RLS policies are specified in [proposal.md](proposal.md#proposed-database-schema). Validation evidence lives in a private table so public reads cannot expose or forge it.

Cards zoom in when appearing. Disappearing cards pop like a balloon and emit decorative particles; filtering, sorting and live updates use these transitions. Reduced-motion mode suppresses zoom, popping and particles.

## Thumbnail filenames
Store each public thumbnail as `<showcase-item-id>-ver<N>.png` in the `showcase` bucket. The filename identifies the showcase item; the version suffix breaks caches, and atomically reserved per-item versions prevent replacement races. Paths contain no member identifier, username or title. Deletion and replacement remove the exact stored paths through the cleanup queue.
