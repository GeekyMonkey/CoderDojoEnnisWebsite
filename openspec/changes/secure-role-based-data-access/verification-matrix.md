# Acceptance and security verification

Proposal only: these are required implementation checks, not claimed results. Run isolated staging fixtures with real anon/authenticated tokens; service-role tests cannot establish that RLS works. Never automatically run `pnpm -C src test` or format; use targeted authorized checks and add Bruno requests for new endpoints.

## Fixtures and complete table coverage

Create active mentor M, parent P with child C1, unrelated parent P2 with C2, unlinked coder C3, teammate C4, multi-role parent/mentor PM, archived actor X, authenticated but unbound U, anonymous A. Include archived children/links, deleted and historical definitions, active/expired/mentor-only/archived pods and former teammates. Auth UUIDs deliberately differ from member IDs.

For **each** of the 12 tables in the policy matrix, exercise direct REST SELECT with A/U/X/M/P/C1/P2/C3/PM against own, linked, unrelated, current and archived fixtures as applicable. Expected row/column sets are exactly the SELECT matrix, including mentor archived access. For every role/table, attempt direct INSERT, PATCH/UPDATE, DELETE and upsert: all browser mutations must fail, including M. Test SQL grants separately for TRUNCATE/REFERENCES/TRIGGER using role simulation. No exposed view/RPC may recover a denied row/column.

| Table | Positive app/API case | Mandatory negative app/API case |
| --- | --- | --- |
| members | M account/role/archive/reset/merge administration; P/C1 eight own fields; P linked-child fields | C1/P inject role/vetting/team/scanner/deleted/hash/id; alter actor/target binding; P edits C2 |
| member_parents | M add/remove eligible links; P authorized child/co-parent projection | P/C1 self-assign link; P enumerates unrelated parent contacts |
| member_attendances | M manual presence/date/report; P own/C1 read; C1 authorized join | Nonmentor manual/backdated/remove presence; join as another member; unauthenticated SetPresent |
| member_badge_categories | M skill maintenance; authorized own/host skill presentation | Nonmentor skill mutation or global skill/member directory |
| member_badges | M review/undo; C1 own goal/apply/reapply; P child history; peer earned only | C1 approve/date/reviewer injection; P child apply; peer pending/evidence; M own-child approve/reject |
| member_belts | M review/undo; C1 eligible own next-belt apply; P child history | Skip prerequisites; nonmentor award/decision edit; unrelated evidence; own-child review |
| badge_categories | M maintain/archive/image; active public definition; authorized historical reference | Anonymous deleted category; unrelated historical leak; nonmentor definition/image edit |
| badges | M maintain/archive; active public definition; authorized history | Anonymous deleted badge; apply against archived definition; nonmentor definition edit |
| belts | M maintain/archive; active public definition; authorized history | Anonymous deleted belt; ineligible next-belt apply; nonmentor definition edit |
| teams | M notes/roster/logo/print; authorized safe team presentation | Browser SELECT notes; unrelated roster; nonmentor assignment/logo edit |
| sessions | M scoped catalog maintenance/report; authorized own/child dates | Global individual attendance directory; inconsistent delete; nonmentor date mutation |
| session_pods | M administer all; P/C1 eligible read/join as self | Anonymous URL; nonmentor mentor-only/expired/deleted pod; join as child/unrelated member |

## Cross-cutting checks

| Surface | Required result |
| --- | --- |
| Identity | Valid bindings work across existing sessions; no binding collision or email/metadata/actor-body impersonation; unbound/archived actors denied private access |
| Fresh roles/links | Revoke mentor/parent role, unlink/archive child, change team with JWT unchanged; subsequent reads/writes immediately use current committed state |
| Mutation races | Revoke privileges between initial route check and transaction; transaction denies protected mutation; no file/event side effects escape failed changes |
| Profile | Eight own fields save; concurrent case-insensitive login claims, stale snapshot and privilege-field rejection remain; historical duplicates preserved |
| Multi-role | PM receives union of parent/mentor grants, while global safety and own-child review restriction remain |
| Credential lifecycle | Existing-password own change; linked-child/mentor reset; source merge session disabled; binding reconciliation does not expose another member |
| Projections | Snapshot exact allowed keys for self/child/peer/co-parent/host/GitHub; added DB column cannot enter output; no hashes/device secrets/logged rows |
| RPC grants | anon/authenticated cannot execute any service-only core; scoped stats cannot return global private data; forged actor parameter denied even via guarded service path |
| Legacy routes | Before production, F02 remains unchanged by user decision. At production cutover, CopyData/legacy read routes unavailable and old-database dependencies removed; final reconciliation/recovery backup recorded before decommissioning. Old generic member/belt/attendance lists and include_deleted cannot bypass role checks; aliases covered |
| Device attendance | Valid scoped credential marks only active authorized target for current session/date; bad/archived credential, arbitrary target/backdate and repeated abuse denied |
| Transactions | Signup, join attendance, review/undo, relation, merge, reset/cleanup effects atomic; rollback has no successful-change invalidation |
| Pod times | Europe/Dublin midnight and daylight-saving cases match API/SQL; ends_at/null fallback boundaries and join-time recheck work |
| Grants/views | All 12 RLS flags true; no broad DML/SELECT/PUBLIC EXECUTE/default grants; invoker views cannot bypass; private helpers inaccessible as public RPCs |
| Performance | Representative mentor lists, parent histories, own dashboard and projections meet existing response budgets; inspect policy EXPLAIN/index use |

## Realtime and images

- M/P/C1 receive authorized invalidations and refresh correct stores after account/profile/image/link/review/attendance/team/pod changes. Unrelated users cannot subscribe to scoped channels or spoof producer messages.
- No sensitive table wildcard stream is available; INSERT/UPDATE/DELETE payloads contain no private rows or target IDs. Verify removal from publication and console/log redaction, including delete/old-record behavior.
- Unlink/revoke/archive/logout with a channel already connected: private refetch denied immediately; caches cleared on denial; renewal within 60 seconds; reconnect denied. Test offline reconnection and token refresh.
- Anonymous users download all member photo/avatar, team/category and legacy fallback image URLs without a session or signed URL. Previously public archived-member images remain public while they exist.
- M can mutate supported member/team/category images; owner can mutate own photo/avatar; P can mutate C1 photo/avatar. Anonymous, unrelated, archived, unbound and C1 targeting C2 cannot mutate or list globally.
- Attempt arbitrary bucket/path, compact-UUID substitution, revision traversal, wrong MIME/dimensions/oversize, swap into another entity and direct storage overwrite/delete. All denied before unauthorized file/row changes. Verify legitimate swaps, independent deletes, recovery and flags/revisions.
- The unrelated bucket's metadata/permissions remain unchanged.

## Release evidence

Record fixture case results, exact failed/successful status and output key sets, metadata grant/policy/function/publication snapshots, build/focused check results, image URL checks and security-advisor findings. Test supported features through stores/screens as well as HTTP. Pass both allowed-operation and denied-operation checks before deployment acceptance. Do not mark parity audit findings fixed just because this proposal validates.
