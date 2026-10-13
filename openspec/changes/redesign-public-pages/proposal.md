# Change: Redesign the public homepage and linked information pages

## Why
The public website uses a dated tile menu and modal fragments that depend on AngularJS, jQuery, and Bootstrap. Families and volunteers need concise information, real page links, and a comfortable experience on phones and in their preferred color scheme.

## What Changes
- Rebuild `/home.html` and its eight included sections as nine standalone, semantic HTML documents.
- Keep the existing section URLs: `/_about.html`, `/_contact.html`, `/_join.html`, `/_members.html`, `/_news.html`, `/_privacy.html`, `/_topics.html`, and `/_whenwhere.html`. These become directly accessible pages with normal navigation.
- Put all presentation in one new `/css/public.css` stylesheet, with custom properties for colors, typography, spacing, sizing, borders, and layout. No inline styles, style blocks, presentation attributes, framework classes, or CSS dependencies in these documents.
- Follow browser light/dark preferences using `prefers-color-scheme`; provide responsive layouts, accessible keyboard navigation, and reduced-motion support.
- Rewrite general information into short, modern copy. Preserve useful club facts, joining and contact paths, resource downloads, supporter acknowledgements, and the public GitHub directory. Present dated administration notes as an archive.
- Keep privacy information readable and concise without inventing data-handling commitments or changing the substance of the existing policy.
- Remove legacy frontend dependencies from the redesigned documents. Keep shared legacy assets in place because excluded pages may still use them.

## Scope
Included: `src/public/home.html`, the eight `src/public/_*.html` fragments included by that homepage, and new assets used exclusively by these documents. Privacy is included because About links to it.

Excluded: `src/public/xmas/**`, `src/public/chat.html`, `src/public/lab.html`, `src/public/pages/**` (including `2020-TidyTowns.html`), tutorials and downloads, member/authenticated Vue pages, API/database behavior, Nuxt configuration, and the existing root redirect to `/home.html`. Excluded files remain unchanged and standalone project pages are not added to the redesigned navigation.

## Impact
- Affected specs: new `public-site` capability; no changes to member application themes.
- Affected code: nine existing static documents, one new stylesheet, and a small public-only script if needed for the existing directory or old modal-hash compatibility.
- Related work: `replicate-legacy-features` mentions broader public session and integration parity. This redesign preserves existing public integrations and does not implement new session projections or resolve those broader policy decisions.
- Approval status: approved by the user on 2026-10-13; implementation requested on `develop`.
