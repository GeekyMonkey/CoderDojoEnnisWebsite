## ADDED Requirements

### Requirement: Complete public Vue page coverage
The system SHALL provide the 13 Vue routes and source-content mappings listed in this change's proposal, all under `(public)` with the public layout. It SHALL replace the root static redirect and remove the foo placeholder.

#### Scenario: Public page entry
- **WHEN** a visitor directly loads any of `/`, `/about`, `/join`, `/visit`, `/explore`, `/projects`, `/news`, `/contact`, `/privacy`, `/lab`, `/chat`, `/gift-ideas` or `/archive/tidy-towns-2020`
- **THEN** the corresponding Vue page uses the standard public layout without requiring portal login
- **AND** its content preserves the mapped HTML page's information and applicable integrations

### Requirement: Public component isolation
Public pages SHALL use public-only presentation components and a standard header, navigation, main region and footer. They SHALL NOT import member/auth presentation components or mount application theme overlays and notification presenters.

#### Scenario: Shared navigation
- **WHEN** a visitor navigates between public pages
- **THEN** shared navigation identifies the current page and exposes every public destination through primary or secondary links
- **AND** the public page uses no member presentation components

### Requirement: Independent public styling
Public presentation SHALL use a separate stylesheet, scoped public selectors and independent `--public-*` variables. Public Vue templates SHALL contain no inline styling or embedded style blocks. The public palette SHALL follow OS light/dark and SHALL be independent of member theme preferences, including CRT.

#### Scenario: Stored member CRT preference
- **WHEN** a visitor with a stored CRT preference opens a public page with a dark OS scheme
- **THEN** the public dark palette applies with no CRT palette, filters or overlay
- **AND** changing the OS scheme updates the public palette

#### Scenario: Repeated section transitions
- **WHEN** a visitor moves from a public page to login/member pages and back
- **THEN** each destination retains its own styling and applicable theme behavior
- **AND** public stylesheet rules do not affect application pages or change stored member preferences

### Requirement: Accessible responsive public pages
Public pages SHALL use semantic landmarks, a skip link, one h1, logical heading order, descriptive links, visible keyboard focus and accessible navigation. They SHALL support narrow screens, text zoom and reduced-motion preferences. Embedded content SHALL have a title and an external fallback link.

#### Scenario: Narrow keyboard navigation
- **WHEN** a visitor uses a keyboard at 360px width or 200% text zoom
- **THEN** navigation, content and actions remain readable and operable without page-wide horizontal overflow
- **AND** any collapsed navigation exposes its expanded state and closes on route selection

### Requirement: Public content and integration preservation
The system SHALL preserve existing joining, donation, supporter, contact/social, calendar/map, resource-download and GitHub project paths, privacy disclosures, lab roster, gift-link content and complete Tidy Towns results. Historical content SHALL be dated and labeled as archived. The chat page SHALL expose an explicit link to the existing external room.

#### Scenario: Moving dated pages
- **WHEN** a visitor opens Lab, Gift ideas or the Tidy Towns competition
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
