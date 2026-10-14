## ADDED Requirements

### Requirement: Complete public Vue page coverage
The system SHALL provide the 13 Vue routes and source-content mappings listed in this change's proposal, all under `(public)`, with 11 using the public layout and Lab/Tidy Towns using no shared layout. It SHALL replace the root static redirect and remove the foo placeholder.

#### Scenario: Public page entry
- **WHEN** a visitor directly loads any of `/`, `/about`, `/join`, `/visit`, `/explore`, `/projects`, `/news`, `/contact`, `/privacy`, `/lab`, `/chat`, `/gift-ideas` or `/archive/tidy-towns-2020`
- **THEN** the corresponding Vue page uses the standard public layout, except Lab and Tidy Towns which use no shared layout, without requiring portal login
- **AND** its content preserves the mapped HTML page's information and applicable integrations

### Requirement: Public component isolation
The 11 shared-layout public pages SHALL use public-only presentation components and a standard header, navigation, main region and footer. Lab and Tidy Towns SHALL preserve their own page structures without shared presentation components. They SHALL NOT import member/auth presentation components or mount application theme overlays and notification presenters.

#### Scenario: Shared navigation
- **WHEN** a visitor navigates between public pages
- **THEN** shared navigation identifies the current page and exposes every public destination through primary or secondary links
- **AND** the public page uses no member presentation components

### Requirement: Independent public styling
The 11 shared-layout public pages SHALL use a separate area stylesheet and independent `--public-*` variables. Their Vue templates SHALL contain no inline styling or embedded style blocks. Lab and Tidy Towns SHALL preserve their existing CSS declarations in their own area entries, including Lab retro stylesheet appearance. The public palette SHALL follow OS light/dark and SHALL be independent of member theme preferences, including CRT.

#### Scenario: Stored member CRT preference
- **WHEN** a visitor with a stored CRT preference opens a shared-layout public page with a dark OS scheme
- **THEN** the public dark palette applies with no CRT palette, filters or overlay
- **AND** changing the OS scheme updates the public palette

#### Scenario: Repeated section transitions
- **WHEN** a visitor moves from a public page to login/member pages and back
- **THEN** each destination retains its own styling and applicable theme behavior
- **AND** public stylesheet rules do not affect application pages or change stored member preferences

### Requirement: Accessible responsive public pages
The 11 shared-layout public pages SHALL use semantic landmarks, a skip link, one h1, logical heading order, descriptive links, visible keyboard focus and accessible navigation. They SHALL support narrow screens, text zoom and reduced-motion preferences. Embedded content SHALL have a title and an external fallback link.

#### Scenario: Narrow keyboard navigation
- **WHEN** a visitor uses a keyboard at 360px width or 200% text zoom
- **THEN** navigation, content and actions remain readable and operable without page-wide horizontal overflow
- **AND** any collapsed navigation exposes its expanded state and closes on route selection

### Requirement: Public content and integration preservation
The system SHALL preserve existing joining, donation, supporter, contact/social, session-calendar/map, resource-download and GitHub project paths, privacy disclosures, lab roster, gift-link content and complete Tidy Towns results. Historical content on the shared-layout pages SHALL be dated and labeled as archived. Lab and Tidy Towns SHALL retain their existing content and date presentation unchanged. The chat page SHALL expose an explicit link to the existing external room.

#### Scenario: Moving dated pages
- **WHEN** a visitor opens Gift ideas
- **THEN** historical content and existing links remain available with their original date context
- **AND** past offers, events and products are not presented as current availability or recommendations

#### Scenario: Privacy and joining content
- **WHEN** a visitor opens Privacy, Join, About or Visit
- **THEN** existing policy disclosures, joining instructions, donation form contract and the map remain available, while the shared session calendar replaces Google calendar

### Requirement: Store-owned public directory
The public directory SHALL access `/api/githubaccounts` through a typed TanStack Query public store following member-store patterns. TanStack SHALL own caching, request deduplication, retry and request state; the store SHALL own response validation and expose refetch. The directory SHALL render only existing public fields with safe text and validated GitHub links, with loading, empty, error and retry states.

#### Scenario: Directory request fails then succeeds
- **WHEN** the directory request fails and the visitor retries
- **THEN** an accessible error state is replaced by validated directory data on success
- **AND** components do not fetch data directly or expose private account fields

#### Scenario: Empty or invalid entries
- **WHEN** the endpoint returns empty lists or entries with invalid GitHub logins
- **THEN** empty sections display an empty state and invalid entries are excluded
- **AND** rendered links target only validated GitHub accounts

### Requirement: Retire static public URLs without forwarding
The system SHALL remove the 13 replaced HTML documents and legacy modal-hash forwarding. Public links SHALL target the new Vue routes. It SHALL NOT add redirects or aliases for retired document URLs.

#### Scenario: Old document URLs
- **WHEN** a visitor requests a retired HTML URL or uses an old homepage modal bookmark
- **THEN** no compatibility redirect or alias forwards that request to a replacement page
- **AND** current public navigation uses the new Vue routes

### Requirement: Standalone Lab conversion
The Lab HTML SHALL be converted into one `src/app/pages/(public)/lab.vue` with `layout: false`. Its existing layout, header, footer, content, project table and CSS appearance SHALL be preserved without shared components, public theme variables, new archive notices or visual redesign. Its original CSS declarations SHALL be retained in a Lab area stylesheet, preserving the retro stylesheet asset and appearance.

#### Scenario: Lab direct entry
- **WHEN** a visitor loads `/lab`
- **THEN** the original Lab layout, content and CSS appearance are preserved in one Vue page
- **AND** no shared layout, navigation, public light/dark theme or member overlay is applied

#### Scenario: Lab route transitions
- **WHEN** a visitor moves between Lab, shared-layout public pages and application pages
- **THEN** Lab retains its original appearance and its CSS does not affect the other pages

### Requirement: Standalone Tidy Towns conversion
The Tidy Towns HTML SHALL be converted into one `src/app/pages/(public)/archive/tidy-towns-2020.vue` with `layout: false`. Its existing layout, content, winners, entries, asset references and embedded CSS appearance SHALL be preserved without shared components, public theme variables, new archive notices or visual redesign. Its original CSS declarations SHALL be retained in a Tidy Towns area stylesheet, adapting only the content selector for Nuxt’s wrapper structure.

#### Scenario: Tidy Towns direct entry
- **WHEN** a visitor loads `/archive/tidy-towns-2020`
- **THEN** the original competition layout, content and CSS appearance are preserved in one Vue page
- **AND** no shared layout, navigation, public light/dark theme or member overlay is applied

#### Scenario: Tidy Towns route transitions
- **WHEN** a visitor moves between Tidy Towns, Lab, shared-layout public pages and application pages
- **THEN** each retains its own appearance and standalone CSS does not leak across routes

### Requirement: TanStack-based public API access
All programmatic public-page API reads SHALL use store-owned TanStack Query queries following the member data-store patterns and the existing query provider. Any programmatic API writes SHALL use store-owned TanStack mutations and invalidate affected public query keys. Pages and components SHALL consume public store functions/state rather than make API calls or own queries directly. External links, iframes and native third-party form submissions SHALL retain their existing behavior.

#### Scenario: Public read lifecycle
- **WHEN** multiple public consumers request the same API data
- **THEN** the public store uses a stable public query key and TanStack cache/deduplication
- **AND** its query function passes the supplied AbortSignal to the request and exposes typed reactive data and query state

#### Scenario: Anonymous query failure
- **WHEN** a public API query fails
- **THEN** the public page shows an error and offers store-owned refetch
- **AND** no protected member store or protected-page login redirect is required

#### Scenario: Cached data refresh
- **WHEN** a public query refreshes previously loaded data
- **THEN** valid cached content remains visible while fetching and on refresh failure
- **AND** the store exposes the refresh state and error

#### Scenario: Public API write
- **WHEN** a migrated public page has a programmatic API write
- **THEN** a public store executes a TanStack mutation and invalidates the affected public queries

### Requirement: Shared session calendar on Visit
Visit SHALL reuse the latest shared SessionCalendar component to replace the Google calendar iframe and link. Its public branch SHALL use an anonymous TanStack public store, the existing `/api/calendar` endpoint and shared date/filtering helpers, with native controls and independent public CSS. It SHALL NOT initialize protected member stores or render pods, planning sessions or management controls. The member branch SHALL retain its existing behavior.

#### Scenario: Anonymous future and past views
- **WHEN** a visitor opens Visit and switches between future and past sessions
- **THEN** the shared calendar renders the selected anonymous feed through a view-specific public query key
- **AND** public CSS controls its appearance without member theme dependencies

#### Scenario: Feed refresh fails
- **WHEN** refreshing a previously loaded public calendar fails
- **THEN** cached sessions remain visible with an error and store-owned retry action
- **AND** the page does not redirect to login

### Requirement: One active area stylesheet
The app SHALL select exactly one top-level area stylesheet for application, public, Lab or Tidy Towns routes. On client navigation it SHALL replace the previous area link rather than accumulate area styles. Area entries SHALL use ordinary selectors without route-gating prefixes. Existing scoped component styles SHALL retain their encapsulation.

#### Scenario: Cross-area navigation
- **WHEN** a visitor navigates between public, application, Lab and Tidy Towns pages
- **THEN** exactly one selected area stylesheet link remains active
- **AND** the previous area's global styles no longer apply
