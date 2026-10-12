# Verification

Legacy baseline: MemberController.Attendance resolves the current member; Views/Member/Attendance.cshtml shows the session total and descending dates. The new screen uses the existing shared history component, counts unique dates and localizes their display.

- Production build passes.
- Type checking: 25 pre-existing diagnostics, all in legacy migration code; no new diagnostics.
- Coder API returns only the authenticated member's records, in descending date order, matching a direct database read.
- Unauthenticated requests return 401; non-coders return 403; unexpected selected-member query returns 400.
- Coder cannot use the mentor attendance route; mentor route still works for an active mentor.
- Browser realtime verification: temporary attendance insertion changed total from 68 to 69 and placed the new date first; removal restored 68 without refreshing. Test attendance row was removed.
- Mobile at 390 × 844 pixels renders the sidebar toggle, total and readable date list without horizontal overflow.
- Shared TanStack Query store validates response with Zod and exposes null while unavailable. No API calls are made in the UI.
- Feature is uncommitted on codex/coder-attendance for review. D28 was separately committed and pushed to develop at c59ab4e.
