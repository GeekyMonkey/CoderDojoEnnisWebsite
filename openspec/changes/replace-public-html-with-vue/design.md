## Context
`develop` already contains the nine-page static redesign. Four additional HTML pages remain. `(public)/index.vue` redirects to `/home.html`; `foo.vue` is a placeholder. Route groups do not provide layout or CSS isolation automatically.

`nuxt.config.ts` globally includes `app.css` and `Themes.css`. `app.css` imports Tailwind/Nuxt UI and styles html/body/elements globally. CRT CSS targets `html[theme="crt"]`. `app.vue` initializes `useUiConfig`, wraps every route in `UApp`, mounts notifications, and always renders `ThemeFooter`, which teleports the CRT overlay into the body. Merely adding a public layout is insufficient.

## Decisions
### Routing and content
Use the 13-route map in proposal.md and `definePageMeta({ layout: "public-layout", siteSection: "public" })` on public pages. Remove the root redirect and placeholder; do not add aliases or route rules forwarding HTML URLs or old hashes. Replace every internal HTML link with its Vue destination, including meaningful anchors such as `/join#volunteer`.

Retain current photography, resource files, supporter links, donation form fields, waiting-list form, calendar/map sources, social/contact links and directory behavior. Convert old relative assets to absolute asset paths: Tidy Towns images remain under `/pages/assets/`. Keep asset URLs distinct from migrated document URLs. Use Vue templates/typed data; do not inject legacy HTML with `v-html` or carry over AngularJS/jQuery/Bootstrap.

Retain historical roster/entries and product-link content with archive notices and dates. Missing project links render as text. The chat page exposes the existing external room as a link; it does not embed a chat service or implement messaging. Privacy disclosures are migrated without substantive policy changes.

### Shell and component boundary
`app.vue` selects the public shell or `ApplicationShell` from route metadata. Public rendering consists of NuxtLayout/NuxtPage and does not mount UApp, application notifications, ThemeFooter or initialize member UI configuration. `ApplicationShell` retains the existing application behavior for member/auth routes. Existing global plugins and middleware are audited for presentation effects; authorization behavior is preserved.

Use explicit imports for Public components to avoid the existing broad component auto-import configuration binding similarly named member components. Shared Vue/Nuxt primitives and generic TypeScript utilities are allowed; member presentation components and theme stores are not. Public controls use native semantic HTML and public classes rather than Nuxt UI member styles.

Primary navigation retains Home, About, Visit, Join, Explore, Projects, News and Contact. The footer provides Privacy and secondary routes to Lab, Chat, Gift ideas and the Tidy Towns archive. Share typed link data between header/footer; use `aria-current="page"`. A mobile menu, if collapsed, is a native button with expanded state, keyboard operation and close-on-navigation behavior. Keep navigation usable at 360px and 200% zoom.

### CSS isolation and themes
Use one public stylesheet at `src/app/assets/css/public.css`, imported by the public layout. Put all public visual rules there, including responsive components; no inline styles or embedded style blocks in public Vue templates. Scope rules to `.public-site` and narrowly to `html[data-site-section="public"]` / its body when document styling is required. Use `--public-*` variables for background, surfaces, text, muted text, links, accents, borders, focus, fonts, spacing, radii and shadows. Neither public CSS nor components depend on `--ui-*` or member theme variables.

Public light mode is the baseline; `prefers-color-scheme: dark` overrides the public tokens. Set the resolved native `color-scheme` within the public scope, independent of member color-mode classes, the `theme` attribute and persisted CRT selection. No public theme selector or preference persistence is needed.

Set the document section marker reactively from the app route so client navigation restores the destination scope. Gate existing member/auth document selectors and CRT CSS to the application section. Audit framework preflight and component styles: framework-generated CSS may remain globally loaded, but public elements receive explicit public defaults and no member rule may alter their computed appearance. Prevent public selectors from matching member/auth pages even after a public layout stylesheet has loaded. Do not rely on CSS chunks being unloaded during navigation.

Preserve application theme IDs, defaults, preferences and CRT behavior. The ui-themes delta scopes its palette baseline to application pages and explicitly allows a separate public palette. This narrow stylesheet/shell integration is necessary; member business components are not redesigned.

### Public directory
Move the current directory helper into a reactive public store. It owns validated fetching, cache, concurrent-request deduplication, loading, error, retry and empty state. Public pages/components call the store, never fetch the endpoint directly. Preserve the published Members/Mentors fields and existing GitHub-login validation; display labels use Coder/Mentor terminology. Render text with Vue escaping and construct links only from validated GitHub logins. Do not use protected member stores or retrieve private account data. No realtime subscription is needed for this existing small public directory.

### Delivery
Work on `feature/public-vue-pages`, branched from `develop` commit `4fbf40f`, in a separate worktree. The primary checkout has unrelated staged/unstaged work and is not modified. This turn produces a proposal only. Implement after approval; remove static files and obsolete script sources only after auditing references and preserving assets. Rollback is a Git revert of the eventual implementation.

## Verification
- Validate the proposal with OpenSpec strict mode from the repository root.
- During implementation, verify every route and all migrated links/assets; verify the old documents and compatibility redirects are absent.
- Exercise directory success, empty, error/retry and invalid-login responses.
- Inspect all 13 pages in light/dark at desktop and 360px mobile; check keyboard navigation, skip links, heading structure, embeds, contrast, zoom and overflow.
- Test direct public entry and repeated public/login/member transitions with stored light, dark and CRT preferences. Compare member styling/overlays before and after; verify public colors follow the OS and public styles do not affect application pages.
- Run the production build and focused static checks. Do not automatically run `pnpm -C src format` or `pnpm -C src test`; record any user-run checks separately.

## Risks
Global framework resets and teleporting CRT effects can defeat superficial CSS separation; route-marker scoping and cross-route browser checks are required. Old bookmarks will stop working by design. Historical links may no longer resolve; preserve their archive context rather than silently inventing updated recommendations. Coordinate the small app-shell/config diff with concurrent member work when merging.
