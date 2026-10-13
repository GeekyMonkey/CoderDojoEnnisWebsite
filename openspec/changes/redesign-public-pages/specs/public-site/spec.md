## ADDED Requirements

### Requirement: Bounded standalone public pages
The public website SHALL provide its homepage and eight existing included information sections as independently accessible HTML pages with ordinary links and consistent navigation. Implementation MUST be confined to these nine documents and their new dedicated assets, leaving currently unlinked standalone pages and the member application unchanged.

#### Scenario: Navigate public information
- **WHEN** a visitor follows About, Join, Visit, Explore, Members and projects, News, Contact, or Privacy
- **THEN** a complete page loads at its preserved existing URL with a link back to the homepage and an identified current navigation item

#### Scenario: Preserve excluded pages
- **WHEN** the redesign is applied
- **THEN** Christmas, chat, lab, standalone project pages, existing downloads, and member/authentication pages remain unchanged

#### Scenario: Follow an existing modal link
- **WHEN** a visitor opens the homepage with a known legacy modal hash
- **THEN** the visitor reaches the corresponding standalone public page

### Requirement: Shared variable-based presentation
All redesigned public pages MUST load one shared stylesheet. Their HTML MUST contain no inline styles, style blocks, visual presentation attributes, or framework utility classes. The stylesheet SHALL define colors, type, spacing, and layout through reusable CSS custom properties and descriptive classes.

#### Scenario: Inspect page presentation
- **WHEN** any redesigned document is inspected
- **THEN** it links to the same public stylesheet and contains semantic markup and descriptive classes without embedded CSS

### Requirement: Browser-driven responsive themes
The public pages SHALL follow browser light/dark preferences without requiring a saved application preference or JavaScript. Layouts MUST remain readable and usable on mobile devices, with no horizontal page overflow at 360px viewport width.

#### Scenario: Use a dark browser preference
- **WHEN** the browser prefers a dark color scheme
- **THEN** public page variables resolve to a dark palette with readable text, links, and controls

#### Scenario: Use a light browser preference
- **WHEN** the browser prefers a light color scheme
- **THEN** public page variables resolve to a light palette with readable text, links, and controls

#### Scenario: Visit on a phone
- **WHEN** a visitor opens a public page at 360px viewport width
- **THEN** navigation, content, images, and actions fit the viewport and remain operable

### Requirement: Accessible semantic navigation
Every public document SHALL contain a descriptive title, a skip link, labeled navigation, a single main landmark, one h1, logical heading order, and appropriate semantic content elements. Interactive elements MUST support keyboard use, visible focus, and descriptive accessible names. Images MUST have appropriate alternative text and motion MUST honor browser reduced-motion preferences.

#### Scenario: Navigate by keyboard
- **WHEN** a visitor uses the keyboard to browse a public page
- **THEN** the visitor can skip navigation, identify focus, and activate all page actions

### Requirement: Concise public content and preserved integrations
The redesigned pages SHALL use concise public-facing copy while retaining material club information and existing joining, contact, sign-in, calendar, resource, supporter, donation, and GitHub directory behavior. Historical news SHALL be distinguished from current updates. Privacy edits MUST preserve material policy substance and MUST NOT invent operational or legal commitments.

#### Scenario: Plan a first visit
- **WHEN** a family reads Join and Visit
- **THEN** they can find age guidance, joining steps, existing session information, location, adult accompaniment guidance, and routes to confirm current availability

#### Scenario: Browse published projects
- **WHEN** a visitor opens Members and projects
- **THEN** the existing public directory is loaded with safe profile links and accessible loading, empty, and error states

#### Scenario: Read news or privacy
- **WHEN** a visitor opens News or Privacy
- **THEN** historical notes are clearly labeled and material privacy information remains available in readable sections
