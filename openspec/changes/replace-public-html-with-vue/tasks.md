## 1. Proposal
- [x] 1.1 Inventory all public HTML, placeholder routes and existing presentation boundaries.
- [x] 1.2 List all 13 replacement routes, new components and affected integration files.
- [x] 1.3 Validate the proposal with OpenSpec strict mode.
- [x] 1.4 Obtain proposal approval before implementation.

## 2. Public foundation
- [x] 2.1 Add public route metadata, public layout and isolated application shell.
- [x] 2.2 Add public navigation data, header/navigation/footer and shared page/content components.
- [x] 2.3 Add public stylesheet with independent variables, system light/dark, mobile and accessibility rules.
- [x] 2.4 Load exactly one of the four area stylesheet entries through the app head; preserve existing application appearance and CRT behavior without route-gating selectors.

## 3. Page migration
- [x] 3.1 Replace index.vue and remove foo.vue.
- [x] 3.2 Add About, Join and Visit; preserve supporters, donations, waiting-list and map embed; replace the Google calendar with the latest shared SessionCalendar public branch.
- [x] 3.3 Add Explore, Projects, News, Contact and Privacy; preserve content and integrations.
- [x] 3.4 Migrate the directory to a typed TanStack Query public store following member-store conventions; reuse the existing provider, pass cancellation signals, expose query state/refetch and retain response/link validation.
- [x] 3.8 Audit all public API interactions; route reads and any writes through public TanStack stores, with query invalidation for writes and no component-level requests.
- [x] 3.5 Add Chat and Gift ideas with dated historical context.
- [x] 3.7 Convert Lab and Tidy Towns into one Vue page each with `layout: false`; preserve existing layout/content/CSS, including Lab retro stylesheet appearance, with no shared components or public theme.
- [x] 3.6 Update all internal links/assets, remove all 13 old HTML documents and retire obsolete static public CSS/scripts after a reference audit; add no URL forwarding.

## 4. Verification
- [x] 4.1 Check 13 routes, placeholders, document links, assets and removal of compatibility behavior.
- [x] 4.2 Verify directory success/empty/error/retry, invalid-login, cache reuse, request deduplication, cancellation and background-refresh cases; verify the shared provider works on public routes without protected-page error redirects.
- [ ] 4.3 Complete OS light-mode visual inspection and 200% zoom. Desktop/360px dark-mode, contrast in both palettes and keyboard checks passed; see verification.md.
- [x] 4.7 Compare Lab and Tidy Towns with their source HTML for unchanged appearance and verify CSS isolation during route transitions.
- [ ] 4.4 Complete authenticated member browser checks. Public/auth/Lab/Tidy Towns stylesheet transitions and stored-theme isolation passed; shared member calendar behavior and theme lifecycle are covered by focused tests.
- [x] 4.5 Run a production build and focused checks; leave prohibited format/test commands to the user.
- [x] 4.6 Review final diff for preserved member behavior, privacy content, external integration contracts and unrelated-work exclusion.

## 5. Follow-up scope and publication
- [x] 5.1 Fetch/merge latest develop; preserve updated login links, club photo and member calendar work.
- [x] 5.2 Reuse SessionCalendar on Visit with native public presentation and an anonymous TanStack store; remove Google calendar.
- [x] 5.3 Verify future/past feeds, loading/error/empty states, cancellation/caching and public/member boundaries.
- [ ] 5.4 Push the feature branch and create a PR targeting develop.
