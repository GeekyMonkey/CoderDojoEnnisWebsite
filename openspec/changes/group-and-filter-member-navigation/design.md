## Sidebar layout
The expanded sidebar shows the club logo, a full-width search field, role sections, and the existing footer user menu. The search field is labeled “Filter navigation” and has a clear action.

With multiple roles, section headings appear in the fixed order Mentor, Parent, Coder in every language, omitting unassigned roles. A heading uses semantic heading text, centred alignment, subdued colour, and distinct typography. It has no link, button, hover treatment, or tab stop. A thin theme-aware line separates each visible section from the previous one; there is no divider above the first section. A user with one role gets the same sorted navigation without an unnecessary role heading or divider.

For English, the Mentor section is ordered: Attendance, Coders, Maintenance, Mentor Home, Mentors, Parents, Reports, Sessions, Sign In Mode. Maintenance and Reports retain their existing expandable children, also alphabetised. Other roles follow the same sorting rule. Existing labels remain intact to avoid unrelated renaming.

The main navigation area scrolls as needed. The footer remains available for profile, theme, language, and logout actions. The mobile drawer uses the same sections and filter. Existing collapsed-sidebar support retains accessible icon navigation; the full search field and role headings appear in the expanded sidebar/drawer.

## Model and filtering
Build role sections from the existing navigation model and the currently assigned roles. Authorisation filtering happens before searching. Do not duplicate role permission logic or change routes.

Translate labels before sorting or filtering. Keep role sections in the fixed order Mentor, Parent, Coder. Use locale-aware alphabetical sorting for items within each section, including submenu entries. A trimmed, case-insensitive search matches displayed item labels; ignore diacritics where practical.

If a submenu label matches, keep that submenu and all its allowed children. If only children match, keep the submenu as context and show its matching children. Expand matching submenus while a search is active so results are immediately visible. Do not navigate when search text changes. Clear search restores the full sorted list and normal submenu behaviour.

Keep role headings whenever the account has multiple roles, even if the current search leaves only one matching role section. Hide empty sections and their dividers. Show an accessible, translated empty-result message when no sections remain. Do not filter the footer user menu.

Keep page-title lookup based on the complete allowed navigation so searching cannot blank the current page title.

## Implementation constraints
Use existing Nuxt UI v4 components, explicit TypeScript types, computed navigation data, and custom scoped CSS classes with theme variables. Check current v4 component contracts before implementation. Add translations in alphabetical order in all four existing locales. No new dependencies or API endpoints are needed.

## Verification
Cover all role combinations, including a single role, multiple roles, and no roles. Check translated ordering, mentor-only Maintenance/Reports placement, matching top-level and nested labels, clearing search, and empty-result rendering. Confirm role filtering is preserved and searching does not affect the current page title. Inspect desktop and mobile drawer layouts and keyboard use, including non-focusable role headings. Preserve unrelated pending homepage, login-link, image, and achievement-message changes. Do not run the repository's format or test scripts automatically.
