# Change: Group member navigation by role and add a filter

## Why
People with multiple roles see a long, mixed sidebar. Role sections and a navigation filter will make it easier to find the right page.

## What Changes
- Add a search field at the top of sidebar navigation, below the club logo.
- Group navigation in the fixed order Mentor, Parent, Coder, including only the user's assigned roles. When the user has multiple roles, show centred, non-clickable role headings with a thin divider before each later section.
- Keep the role order Mentor, Parent, Coder in every language. Sort items within each role alphabetically using their translated labels. Sort Maintenance and Reports child items too.
- Put Maintenance and Reports in the Mentor section, alongside other mentor options, instead of pinning them at the bottom.
- Filter visible navigation labels as the user types. Include nested options and open matching submenus automatically during a search.
- Hide sections without matches and display a translated “No matching pages” message when nothing matches. Clearing search restores the full navigation.
- Use the same grouping and filtering on desktop and in the mobile drawer.

## Scope
Affected spec: `member-dashboard-ui`.

Affected implementation: `src/app/layouts/member-layout.vue`, `src/app/utils/memberNavigation.ts`, its existing focused tests, and translations in `src/i18n/locales/{en,fr,ga,uk}.ts`.

Role membership continues to use the existing profile-first logic and metadata fallback. Existing URLs, page permissions, active-page indicators, and the footer user menu remain unchanged. The filter searches navigation options only; it does not query page content or any API.

Approval status: approved by the user on 2026-10-14.
