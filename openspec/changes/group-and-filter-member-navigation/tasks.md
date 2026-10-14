## 1. Preparation
- [x] 1.1 Inspect the existing sidebar, navigation model, role filtering, translations, and dashboard specification.
- [x] 1.2 Define role headings, alphabetical ordering, mentor submenu placement, and search behaviour.
- [x] 1.3 Obtain proposal approval before implementation.

## 2. Implementation
- [x] 2.1 Build translated sections in Mentor, Parent, Coder order, with alphabetically sorted items from the existing permitted navigation.
- [x] 2.2 Add filtering of top-level and nested items, including submenu expansion during search.
- [x] 2.3 Render centred non-interactive role headings and thin dividers for multiple roles.
- [x] 2.4 Place Maintenance and Reports within Mentor and remove the separate bottom menu.
- [x] 2.5 Add an accessible top-of-navigation search field, clear action, and empty-result message in all four locales.
- [x] 2.6 Preserve page-title lookup, active links, permissions, responsive drawer behaviour, and the footer user menu.

## 3. Verification
- [x] 3.1 Extend focused navigation coverage for role combinations, ordering, nested matches, and clearing search.
- [x] 3.2 Inspect desktop and mobile drawer behaviour, keyboard access, and translated labels.
- [x] 3.3 Validate Vue/TypeScript changes and an available production build without running the prohibited format/test scripts.
- [x] 3.4 Audit the diff to preserve unrelated pending work.
