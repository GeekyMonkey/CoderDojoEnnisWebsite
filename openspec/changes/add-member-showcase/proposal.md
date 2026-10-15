# Change: Add member-managed public showcase

## Why
The public Projects page automatically lists GitHub accounts rather than projects members intentionally share. Replace it with an explicit showcase that members manage themselves.

## What Changes
- Add a member showcase table linking each entry to its owning member, with title, description, project type, URL, optional thumbnail, editable showcase date, and visibility.
- Offer Scratch, itch.io, Website, and GitHub profile project types, with project-type-specific options and instructions.
- Require server validation of the owning member’s GitHub Pages user site before a GitHub profile item can be visible; provide missing-username and Pages setup guidance.
- Default Add to a guided wizard: choose project type, select project/configure account, review imported details, then set date/visibility and save.
- List the owning member’s shared Scratch projects using their saved Scratch username, with profile setup and public-sharing guidance.
- Automatically populate title, description and thumbnail after Scratch or itch.io project selection; allow review and editing.
- Use TanStack stores for all client data access and realtime cache updates.
- Apply public-read RLS; permit writes by the linked member, their linked parent, or any mentor.
- Update already-open public pages immediately when entries change, without reload.
- Add Showcase for every member type (Coder, Parent, Mentor), using shared management/editor components and thin role-page wrappers.
- Default new entries to visible and today's date, except unvalidated GitHub profile items remain hidden; retain creation timestamps independently.
- Replace the public Projects page with a new Showcase page at `/showcase`; update public navigation and links.
- Publish only visible entries, newest showcase date first, with project-type, username and member-type filters. Default member type to Coder; offer Parent only when public parent entries exist.
- Do not seed entries from GitHub accounts.

## Impact
- New capability: member-showcase.
- Database migration, ownership controls, thumbnail storage, shared contracts, member/public APIs and GitHub validation and Bruno requests.
- Coder/Parent/Mentor navigation, shared showcase management/editor components, client stores, translations.
- Existing static public page, shared CSS, public TypeScript and generated script, public navigation labels.
- Supersedes GitHub-directory behavior in the pending redesign-public-pages proposal. Unlinked public pages remain outside scope.

## Approved public card presentation
Cards show project-type icon, member name, avatar (photo fallback), title and thumbnail. Clicking expands description and project link. Animate keyed card entry/exit/movement for filtering, sorting and realtime updates; respect reduced motion. Public projection explicitly includes member display name and image choice.

## Proposed database schema

```sql
create table coderdojo.member_showcase (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references coderdojo.members(id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  description text not null check (length(btrim(description)) > 0),
  project_type text not null
    check (project_type in ('scratch', 'itch', 'website', 'github_profile')),
  url text,
  thumbnail_path text,
  thumbnail_version integer not null default 0 check (thumbnail_version >= 0),
  showcase_date date not null
    default ((now() at time zone 'Europe/Dublin')::date),
  is_visible boolean not null default true,
  source_project_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint showcase_url_required check (
    (url is not null and url ~* '^https?://[^[:space:]]+$')
    or (project_type = 'github_profile' and not is_visible and url is null)
  )
);

create index member_showcase_owner_idx
  on coderdojo.member_showcase(member_id);
create index member_showcase_public_order_idx
  on coderdojo.member_showcase(showcase_date desc, created_at desc, id desc)
  where is_visible;
create index member_showcase_project_type_idx
  on coderdojo.member_showcase(project_type);

-- Server-controlled validation evidence; never exposed through public table reads.
create table coderdojo_private.showcase_github_validation (
  showcase_id uuid primary key
    references coderdojo.member_showcase(id) on delete cascade,
  github_username text not null,
  validated_url text not null,
  checked_at timestamptz not null,
  validation_status text not null
    check (validation_status in ('validated', 'not_published', 'unavailable', 'invalidated'))
);

alter table coderdojo.member_showcase enable row level security;
grant select on coderdojo.member_showcase to anon, authenticated;
grant insert, update, delete on coderdojo.member_showcase to authenticated;

create policy showcase_public_read on coderdojo.member_showcase
  for select to anon, authenticated using (true);

-- New private helper: current member owns the target, is its linked parent,
-- or is a mentor. Resolve identity/roles using existing trusted helpers.
create policy showcase_member_insert on coderdojo.member_showcase
  for insert to authenticated
  with check (coderdojo_private.can_write_showcase(member_id));
create policy showcase_member_update on coderdojo.member_showcase
  for update to authenticated
  using (coderdojo_private.can_write_showcase(member_id))
  with check (coderdojo_private.can_write_showcase(member_id));
create policy showcase_member_delete on coderdojo.member_showcase
  for delete to authenticated
  using (coderdojo_private.can_write_showcase(member_id));

alter table coderdojo_private.showcase_github_validation enable row level security;
revoke all on coderdojo_private.showcase_github_validation
  from public, anon, authenticated;
```

This is the proposed schema, not an executable migration yet. The migration must also define:
- `can_write_showcase(member_id)`: active authenticated member is the owner, their linked parent, or any mentor; use existing trusted identity and role helpers.
- A write trigger that keeps `member_id` and `created_at` immutable and maintains `updated_at`.
- A database publication guard that rejects visible GitHub profile entries unless private validation evidence matches the owner's current GitHub username and submitted URL. Newly unvalidated GitHub drafts are explicitly created with `is_visible = false`.
- Server-only validation writes, rechecked for each publication; direct member writes cannot create or alter validation evidence.
- A member GitHub-username-change trigger that invalidates evidence and hides affected entries.
- Live invalidation for entry changes and owner-role/account-eligibility changes.
- Public thumbnail storage; images remain publicly viewable independently of entry visibility, with writes restricted to authorized editors.

`source_project_id` records the Scratch/itch.io project identity when available. `thumbnail_path` identifies the public managed image as `<showcase-item-id>-ver<N>.png`; filenames use the showcase item ID and paths contain no member identifier, username or title. Member type and username are derived from the linked member, not duplicated in this table. HTTP(S) URLs also receive full application-level validation.

## Thumbnail deletion
Deleting a showcase item removes its thumbnails from storage. Database triggers enqueue obsolete image paths on deletion (including member cascades) and replacement. The server immediately attempts storage deletion and acknowledges successful cleanup; failures remain durably queued and are retried on subsequent showcase reads/writes. A private `coderdojo_private.showcase_image_cleanup` table stores `path text primary key` and `queued_at timestamptz default now()`; service-only cleanup functions expose queued paths and acknowledgement.

Cards zoom in when appearing. Disappearing cards pop like a balloon and emit decorative particles; filtering, sorting and live updates use these transitions. Reduced-motion mode suppresses zoom, popping and particles.

### Thumbnail version allocation
Store the current published `thumbnail_version` on each showcase entry. A private `showcase_thumbnail_versions` table records `showcase_id uuid primary key`, `member_id uuid references members(id)`, and `version integer`. An authorized database function atomically reserves the next version before upload. Failed uploads may skip a number; versions never reuse filenames. Objects live directly in the showcase bucket, for example `<showcase-item-id>-ver3.png`, without revision folders.
