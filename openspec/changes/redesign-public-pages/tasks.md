## 1. Preparation
- [x] 1.1 Map active homepage sections, linked privacy content, and excluded standalone pages.
- [x] 1.2 Define page URLs, visual direction, stylesheet boundary, and acceptance criteria.
- [x] 1.3 Obtain proposal approval before implementation.

## 2. Implementation
- [x] 2.1 Create the shared variable-based public stylesheet with browser-driven light/dark palettes and mobile layouts.
- [x] 2.2 Rebuild the homepage with concise content, existing branding, and normal page navigation.
- [x] 2.3 Convert all eight included fragments into standalone semantic pages sharing the same navigation and stylesheet.
- [x] 2.4 Preserve joining, sign-in, contact, supporters, donations, calendar, resource downloads, and archived news paths.
- [x] 2.5 Preserve the existing public GitHub directory with safe rendering and accessible loading, empty, and failure states.
- [x] 2.6 Preserve known homepage modal-hash destinations with public-only compatibility code.

## 3. Verification
- [x] 3.1 Check local links and assets, document structure, shared stylesheet use, and absence of inline/embedded CSS or presentation attributes.
- [x] 3.2 Inspect all pages on desktop and mobile in both color schemes; verify keyboard navigation, zoom, contrast, and overflow.
- [x] 3.3 Verify GitHub directory states, normal navigation, and historical modal hashes.
- [x] 3.4 Run an available production build without running the prohibited format/test scripts.
- [x] 3.5 Audit the final diff to confirm excluded files and application behavior remain untouched.
