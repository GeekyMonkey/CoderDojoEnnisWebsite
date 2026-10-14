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
The 11 shared-layout public pages SHALL use a separate stylesheet, scoped public selectors and independent `--public-*` variables. Their Vue templates SHALL contain no inline styling or embedded style blocks. Lab and Tidy Towns SHALL preserve their existing CSS instead, including embedded rules and Lab retro stylesheet appearance. The public palette SHALL follow OS light/dark and SHALL be independent of member theme preferences, including CRT.

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
The system SHALL preserve existing joining, donation, supporter, contact/social, calendar/map, resource-download and GitHub project paths, privacy disclosures, lab roster, gift-link content and complete Tidy Towns results. Historical content on the shared-layout pages SHALL be dated and labeled as archived. Lab and Tidy Towns SHALL retain their existing content and date presentation unchanged. The chat page SHALL expose an explicit link to the existing external room.

#### Scenario: Moving dated pages
- **WHEN** a visitor opens Gift ideas
- **THEN** historical content and existing links remain available with their original date context
- **AND** past offers, events and products are not presented as current availability or recommendations

#### Scenario: Privacy and joining content
- **WHEN** a visitor opens Privacy, Join, About or Visit
- **THEN** existing policy disclosures, joining instructions, donation form contract and relevant embedded services remain available

### Requirement: Store-owned public directory
The public directory SHALL access the existing `/api/githubaccounts` endpoint through a public store owning fetching, caching, validation and request state. It SHALL render only the existing public fields with safe text and validated GitHub links and provide loading, empty, error and retry states.

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
The Lab HTML SHALL be converted into one `src/app/pages/(public)/lab.vue` with `layout: false`. Its existing layout, header, footer, content, project table and CSS appearance SHALL be preserved without shared components, public theme variables, new archive notices or visual redesign. Its CSS SHALL be isolated from other routes using only mechanical selector scoping where needed, preserving existing declarations and the retro stylesheet asset.

#### Scenario: Lab direct entry
- **WHEN** a visitor loads `/lab`
- **THEN** the original Lab layout, content and CSS appearance are preserved in one Vue page
- **AND** no shared layout, navigation, public light/dark theme or member overlay is applied

#### Scenario: Lab route transitions
- **WHEN** a visitor moves between Lab, shared-layout public pages and application pages
- **THEN** Lab retains its original appearance and its CSS does not affect the other pages

### Requirement: Standalone Tidy Towns conversion
The Tidy Towns HTML SHALL be converted into one `src/app/pages/(public)/archive/tidy-towns-2020.vue` with `layout: false`. Its existing layout, content, winners, entries, asset references and embedded CSS appearance SHALL be preserved without shared components, public theme variables, new archive notices or visual redesign. Its CSS SHALL be isolated from other routes using only mechanical selector scoping where needed, preserving existing declarations.

#### Scenario: Tidy Towns direct entry
- **WHEN** a visitor loads `/archive/tidy-towns-2020`
- **THEN** the original competition layout, content and CSS appearance are preserved in one Vue page
- **AND** no shared layout, navigation, public light/dark theme or member overlay is applied

#### Scenario: Tidy Towns route transitions
- **WHEN** a visitor moves between Tidy Towns, Lab, shared-layout public pages and application pages
- **THEN** each retains its own appearance and standalone CSS does not leak across routes
