# Design: VEX team workspace

## Context
- Auth uses Supabase sessions. Each member logs in as `<memberId>@coderdojoennis.com`, and the role flags are copied into `user_metadata`.
- Existing server data access uses the service-role client in `server/db/*Data.ts`. Existing APIs do not check the caller.
- Client stores (TanStack Query) own fetching and realtime invalidation through the `coderdojo:all` channel.

## Decisions
- **Identity and permissions.** VEX APIs require `Authorization: Bearer <access token>`. The server validates the token with `auth.getUser`, takes the member id from the auth email (set server-side), and loads the member row. Mentor-only actions check `members.is_mentor`. `user_metadata` is not trusted because users can edit it. The client uses the metadata only to decide which buttons to show.
- **Writes through the API, reads allowed by RLS.** The new tables have RLS enabled with `select` for `authenticated` only. This lets realtime events reach logged-in clients while all writes go through validated server endpoints, matching existing tables.
- **One current season.** Enforced by a partial unique index. Saving a season as current clears the flag on the others.
- **One current sprint per season.** Saving a sprint as `current` marks the previous current sprint `complete`, which matches the weekly cycle.
- **Task ownership.** `vex_task_members` is a link table to `members`, and the task save replaces the full owner list. There is a quick "I'll help" / "Leave" toggle on each card.
- **Deleting tasks.** Soft delete, allowed for the member who created the task or a mentor.
- **Resource categories.** These are a fixed list in code (`VEX_RESOURCE_CATEGORIES`) with translated labels. Resources themselves are rows in the database that mentors can manage. `season_id = null` means the resource applies to every season.
- **Routes.** `/vex` (home), `/vex/this-week` (resolves the current sprint), `/vex/sprint/:id`, `/vex/season/:slug` (archive) and `/vex/resources`. History and previous seasons are listed on the home page instead of having separate nav entries.

## Risks / Trade-offs
- Categories in code need a deploy to add a new category, but this keeps translations simple.
- No optimistic updates. Quick status changes wait for the server and then invalidate. This is acceptable for a small team.
