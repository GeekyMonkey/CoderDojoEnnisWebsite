# Change: Replace every public HTML page with isolated Vue pages

## Why
Public content duplicates navigation and page structure across static HTML documents. The placeholder `(public)` routes can host reusable Vue pages, but the current application shell and global member CSS would leak styling and theme behavior into them.

## What Changes
- Replace all 13 HTML documents under `src/public/` with Nuxt pages under `src/app/pages/(public)/`.
- Add a standard public layout, public-only navigation and content components, and a separate variable-based public stylesheet supporting system light/dark.
- Isolate public presentation from member/auth components, theme preferences, global CSS selectors, and the CRT overlay.
- Preserve current content and working integrations using Vue templates and a public directory store; update internal links to the new routes.
- **BREAKING**: retire old HTML URLs and modal-hash compatibility. No forwarding, redirect aliases, or old-URL support.
- Replace the root redirect and remove the `/foo` placeholder.
- This follows the completed `redesign-public-pages` change and expands its nine-page scope to all public HTML. Its static-document and URL-preservation decisions do not apply to this change.

## Affected Pages
Route-group names do not appear in URLs. Each page uses `public-layout`.

| Source under `src/public/` | New URL | Vue page under `src/app/pages/(public)/` | Content / behavior |
| --- | --- | --- | --- |
| `home.html` | `/` | `index.vue` | Introduction, club photography, joining/visit actions, topic cards |
| `_about.html` | `/about` | `about.vue` | Club, Teams, conduct, supporters, existing PayPal donation form |
| `_join.html` | `/join` | `join.vue` | Waiting-list form, joining steps, volunteer contact and anchor |
| `_whenwhere.html` | `/visit` | `visit.vue` | Times, venue, supervision guidance, calendar and map |
| `_topics.html` | `/explore` | `explore.vue` | Topic groups, tutorials and local downloads |
| `_members.html` | `/projects` | `projects.vue` | Public Coder/Mentor GitHub directory and portal-login action |
| `_news.html` | `/news` | `news.vue` | Facebook updates and dated mentor-note archive |
| `_contact.html` | `/contact` | `contact.vue` | Email, Facebook, joining/visit links |
| `_privacy.html` | `/privacy` | `privacy.vue` | Existing policy content and disclosures |
| `lab.html` | `/lab` | `lab.vue` | 2024 lab plan, prerequisites and project roster; marked historical |
| `chat.html` | `/chat` | `chat.vue` | Club chat introduction and explicit link to existing hack.chat room |
| `xmas/index.html` | `/gift-ideas` | `gift-ideas.vue` | 2024 gift categories, images and existing product links; marked historical |
| `pages/2020-TidyTowns.html` | `/archive/tidy-towns-2020` | `archive/tidy-towns-2020.vue` | Competition description, winners and complete entries |

`foo.vue` is removed without a replacement. `/chat` uses the standard public layout and an explicit external action instead of automatically redirecting visitors. Archived products, sales, software versions and events are retained as dated content, without presenting them as current recommendations.

## New Layout and Components
Public components live only in `src/app/components/Public/` and use explicit imports. They do not import member, auth, Common, Modals, Themes or other application presentation components.

| File | Responsibility / pages |
| --- | --- |
| `src/app/layouts/public-layout.vue` | Public wrapper, stylesheet, skip link, header, main slot and footer; all pages |
| `Public/PublicHeader.vue` | Branding, portal-login link and primary navigation |
| `Public/PublicNavigation.vue` | Responsive primary links, active state and keyboard-accessible mobile navigation |
| `Public/PublicFooter.vue` | Contact/privacy links and secondary discovery links to lab, chat, gifts and archive |
| `Public/PublicPageIntro.vue` | One page title and short introduction |
| `Public/PublicCard.vue` | Repeated topic/resource/project/product cards using props and slots |
| `Public/PublicCallToAction.vue` | Shared joining, visiting and volunteering actions |
| `Public/PublicSupporters.vue` | Supporter logos and links; About |
| `Public/PublicDonationForm.vue` | Existing PayPal form contract; About |
| `Public/PublicEmbed.vue` | Responsive titled iframe with external fallback link; Visit |
| `Public/PublicProjectDirectory.vue` | Directory sections and loading/empty/error/retry states; Projects |
| `Public/PublicDirectoryEntry.vue` | Safely rendered public GitHub entry |
| `Public/PublicArchiveNotice.vue` | Date and archive context; News, Lab, Gifts, Tidy Towns |
| `Public/PublicProjectTable.vue` | Small semantic tables via typed columns/rows or slots; Lab and Tidy Towns, no pagination |
| `Public/PublicGiftCard.vue` | Gift image, description and existing product link; Gifts |
| `src/app/components/Application/ApplicationShell.vue` | Application-only extraction of current UApp, notifications, UI-config bootstrap and ThemeFooter; never used by public pages |

Keep unique page copy in page templates; extract components for repeated structure or a distinct behavior rather than making every paragraph a component.

## Impact
- New capability: `public-website`; amended capability: `ui-themes` to make the independent public palette explicit.
- New supporting files: `src/app/assets/css/public.css`, `src/app/data/publicNavigation.ts`, `src/app/stores/public/usePublicDirectoryStore.ts`.
- Integration boundary: `src/app/app.vue`, `src/nuxt.config.ts`, `src/app/assets/css/app.css`, theme CSS under `src/app/assets/themes/`, and existing auth/member layout styling as needed for selector isolation. Existing member workflows and appearance remain acceptance criteria.
- Retire the 13 static HTML documents, `src/public/css/public.css`, `src/public/js/public-site.js` and `src/public-site/` after their behavior is migrated and references audited. Keep images, downloads, and assets still referenced by Vue pages.
- Existing `/api/githubaccounts` contract remains unchanged; no new endpoint or database work.
- No changes to login URLs, protected-route authorization, deployment configuration, global SSR mode or unrelated member features.
