# Verification — 2026-10-13

Implemented in `/home/russp/Code/CoderDojo/CoderDojoEnnisWebsite` on `develop`.

## Publication change
- Removed the X/Twitter link from Contact at the user’s request. Facebook and email remain.

## Content and style revision
- Replaced promotional headings with direct page titles and short explanations aimed at 12-year-olds.
- Added purple actions, blue/yellow/pink/purple cards, stronger borders, offset shadows, and a dot background through the existing shared stylesheet.
- Retained browser-driven dark mode and the complete published privacy statement.

## Passed
- Production Nuxt/Cloudflare Pages build. Existing member-component/import duplication warnings remain outside this change.
- Strict TypeScript checks for the new standalone public scripts.
- Nine standalone documents with one h1, one main landmark, one current-page navigation marker, and exactly one stylesheet: `/css/public.css`.
- No inline CSS, style blocks, framework presentation classes, or legacy modal markup in the redesigned documents.
- All local links and assets resolve. The full published privacy statement is preserved word-for-word, with a short overview and expandable full statement.
- Browser checks for all nine pages at 360px and 1440px in light and dark mode: 36 layouts without horizontal overflow. Screenshots reviewed for the homepage and all page introductions.
- Keyboard skip navigation and focus behavior; 200% text-size checks; reduced-motion preference. Expanded news and privacy content also fits the phone viewport at 200% text size.
- Palette text contrast: minimum 6.31:1 in light mode and 7.05:1 in dark mode across the main surfaces. Primary action contrast also exceeds 4.5:1.
- Existing GitHub directory UI: success, empty, failure, retry, malformed usernames, inert HTML-like profile names, and unavailable avatars. Verified with intercepted responses matching the existing API contract; no authenticated/database changes made.
- Sixteen historical links: eight modal hashes in both `#NameModal` and `#/NameModal` forms reach the corresponding pages.
- Tracked-file diff restricted to the nine approved HTML files; new files restricted to the dedicated stylesheet, public script sources/bundle, and this OpenSpec change. Christmas, chat, lab, standalone project pages, tutorials/downloads, member application, legacy shared assets, and API files unchanged.
- `git diff --check`.

## Boundaries
- No repository format or test scripts run.
- Third-party calendar/map embeds were isolated during repeatable browser layout checks. Their existing source URLs were preserved and checked structurally; live third-party availability and live directory data were not independently verified.

## Rebuild the public bundle
From the repository root:

```powershell
pnpm -C src exec esbuild public-site/public-site.ts --bundle --target=es2022 --outfile=public/js/public-site.js
```
