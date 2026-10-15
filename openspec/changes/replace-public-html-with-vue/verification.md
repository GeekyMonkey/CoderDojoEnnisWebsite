# Public Vue migration verification

## Implemented

- All 13 static public HTML documents replaced by Vue routes; `/foo` and the root static redirect removed. No compatibility forwarding.
- Eleven pages use isolated public components and a standard layout. Lab and Tidy Towns remain standalone pages preserving original content and appearance.
- Four top-level CSS entries: application, public, Lab and Tidy Towns. A keyed head link selects one entry and replaces it during navigation. No area selector prefixes or global member CSS imports on public pages. Application fonts are included in its entry.
- Visit reuses the latest shared SessionCalendar component and existing anonymous `/api/calendar` feed, replacing the Google calendar. Public presentation uses native controls/public CSS and initializes no member calendar store. Future/past, notes, loading/empty/error/retry and cache preservation are supported. Member pod/management behavior remains in the member branch.
- Public API reads use TanStack Query stores for directory/calendar data. Existing endpoint contracts and map/form integrations are retained.
- System theme synchronization survives application-shell unmount/remount; a focused regression test covers this lifecycle.
- Latest develop `719c72a` merged, preserving member calendar work, updated font sizing/login links and the new club photograph.

## Passed

- `pnpm -C src build`: production Cloudflare Pages build.
- `pnpm dlx @fission-ai/openspec validate replace-public-html-with-vue --strict --no-interactive`.
- `git diff --check`.
- Focused Vitest: 8 files, 27 tests covering directory/public calendar validation, request deduplication/caching/cancellation, error recovery, raw endpoint contracts, public/member calendar boundaries, date ordering and application-theme lifecycle.
- Static audit: 13 Vue routes; 31 local links/assets resolve; privacy paragraphs/headings retained; all 63 public variables independently named. Text/accent/muted contrast on relevant public surfaces has minimum ratios 6.31:1 light and 7.05:1 dark.
- Browser: every standard public page at desktop and 360px, one h1 and no horizontal overflow. Exactly one selected area stylesheet link.
- Browser: public/application/Lab/Tidy Towns entries switch without accumulating area CSS. Public colors follow the dark OS preference even when the application preference is light or CRT. No member overlay on public pages.
- Browser: original Lab and Tidy Towns visual comparison. Lab retains Courier, original background/padding and 800px desktop table; Tidy Towns retains its 80% content width, 120px logos and original table sizes.
- Live anonymous directory: 21 project pages loaded.
- Live anonymous calendar: 7 future sessions and 10 past sessions loaded; tabs work, no Google calendar iframe/link or mentor management links.
- Keyboard: skip link moves focus to main; focus indicators visible on public actions.

The repository format and full test scripts were not run automatically.

## Remaining manual checks

- OS light-mode visual review and 200% text zoom. Browser controls exposed for this session support viewport sizing but not color-scheme emulation or effective browser zoom. Both CSS palettes and their contrast were checked statically; dark mode was inspected in the browser.
- Authenticated member workflows/theme review. Login and public transitions were checked; authenticated roles were covered by focused calendar/store tests rather than a signed-in browser run.
- Broad typecheck is blocked by existing sessionRecovery test-mock and Legacy SQL/type errors. No diagnostics remain in the changed public/calendar/theme files.

## Focused check command

From repository root, including PowerShell:

```powershell
pnpm -C src exec vitest run app/stores/public/usePublicDirectoryStore.test.ts app/stores/public/usePublicCalendarStore.test.ts app/components/Sessions/SessionCalendar.test.ts app/stores/useMemberCalendarStore.test.ts app/composables/useUiConfig.test.ts server/api/githubaccounts.test.ts server/api/calendar.test.ts shared/utils/CalendarEntries.test.ts
```
