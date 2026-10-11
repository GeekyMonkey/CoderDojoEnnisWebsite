## Approach
Reuse the existing belt table and introduce an equivalent pending badge view. Add reusable decision controls with notes, loading state, success/error feedback, and confirmation for rejection and undo. Provide earned/rejected history on the existing mentor coder detail route so undo remains accessible after a row leaves the pending list.

Keep requests in `useMemberBeltsStore` and a new `useMemberBadgesStore`. Mutations invalidate pending, member history, and latest belt queries as applicable. Subscribe to existing realtime events for cross-client refresh.

## Authorization
Validate the session server-side with Supabase Auth. Resolve the member from a server-controlled identity mapping and check their active mentor status against the database; do not authorize using editable user_metadata. Derive the acting mentor ID on the server and never accept it from the request body. Verify existing awarded/rejected foreign keys before implementation; if they reference a separate adults table, explicitly map the mentor identity rather than inserting an incompatible member ID.

## State Transitions
Approve/reject only applications with application_date set and awarded/rejected_date unset. Update only decision fields, guarded by the expected state so concurrent decisions cannot overwrite each other. Return a conflict when the record has changed. Undo only a decided application and clear both awarded and rejected date, actor and notes fields; keep application_date and application_notes.

Use UTC timestamps and validated UUIDs. Require trimmed, non-empty decision notes to match the legacy UI. Reject missing/deleted subjects and unknown IDs with explicit errors. Do not log credentials or auth tokens.

## Verification
Cover authorization failures, invalid inputs, successful decisions, undo, stale/concurrent decisions, preservation of application details and cache invalidation. Add Bruno requests for every new endpoint. Compile the production build and verify dev and built preview startup. Leave the repository's formatter and test commands to the user, per AGENTS.md. Do not exercise write endpoints against real member records without an explicitly designated test record.
