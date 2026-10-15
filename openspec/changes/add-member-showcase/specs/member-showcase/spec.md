## ADDED Requirements

### Requirement: Explicit showcase records
Each showcase entry SHALL link to its owning member and include title, description, project type, URL, editable date, visibility, optional thumbnail and creation/update timestamps. Project types SHALL be Scratch, itch.io, Website and GitHub profile. Defaults SHALL be visible and today, except unvalidated GitHub profiles remain hidden. URLs MUST use HTTP(S); an unconfigured hidden GitHub draft MAY omit its URL.

#### Scenario: Create an entry
- **WHEN** a member creates a valid non-GitHub showcase entry without overriding date or visibility
- **THEN** it belongs to that member, has today's showcase date and is visible

#### Scenario: Validate a submission
- **WHEN** required text is missing, the project type is unsupported, the date is invalid, or the URL uses an unsafe scheme
- **THEN** the submission is rejected without storing an invalid entry

#### Scenario: No automatic inclusion
- **WHEN** a member has a GitHub account but has created no showcase entries
- **THEN** that account contributes no items to the showcase

### Requirement: Shared member showcase management
Showcase SHALL be available to every member type through Coder, Parent and Mentor navigation/pages. A shared management component and shared add/edit editor SHALL list the target member’s entries, including hidden entries, and support adding, editing and deleting through TanStack stores. Thin role-page wrappers SHALL reuse these components. Every mutation SHALL enforce the write permissions below on the server and in RLS.

#### Scenario: Edit date and visibility
- **WHEN** a coder changes an owned entry's title, description, project type, URL, showcase date or visibility
- **THEN** those changes persist and the coder list refreshes
- **AND** the original creation timestamp remains unchanged

#### Scenario: Delete an entry
- **WHEN** a coder deletes an owned entry
- **THEN** it disappears from their list and public results

#### Scenario: Attempt unauthorized mutation
- **WHEN** an unauthenticated caller or unrelated non-mentor member attempts to mutate an entry
- **THEN** access is denied and the entry and ownership remain unchanged

### Requirement: Public read and linked writer RLS
The showcase table SHALL enable RLS and grant public SELECT. INSERT, UPDATE and DELETE SHALL be permitted only to the linked member, a parent linked to that member, or any mentor. Ownership SHALL remain immutable, and UPDATE policies SHALL validate both existing and resulting rows. Public read permission SHALL not grant access to private member data. Visibility SHALL control showcase page inclusion rather than table read access.

#### Scenario: Read the table publicly
- **WHEN** an anonymous visitor reads the showcase table
- **THEN** SELECT is permitted, including hidden rows
- **AND** the showcase page still includes only visible entries

#### Scenario: Authorized writers
- **WHEN** the linked member, their linked parent, or any mentor creates, edits or deletes an entry for that member
- **THEN** the operation is permitted by RLS and server authorization

#### Scenario: Prevent ownership transfer
- **WHEN** a writer attempts to change an existing entry's owning member
- **THEN** the update is rejected

### Requirement: Optional showcase thumbnail
Members SHALL be able to attach, replace and remove a thumbnail using the established badge-category image workflow with linked-member, linked-parent or mentor write authorization and existing file validation. Thumbnails SHALL be publicly viewable independently of entry visibility. Replaced, removed and deleted assets SHALL be cleaned safely.

#### Scenario: Manage a thumbnail
- **WHEN** a coder uploads, replaces or removes a valid thumbnail on an owned entry
- **THEN** the saved entry and refreshed views show the resulting image state

#### Scenario: Hide an image-bearing entry
- **WHEN** an entry becomes hidden
- **THEN** public showcase results exclude its card
- **AND** its thumbnail remains publicly viewable through its storage URL

### Requirement: Intentional public showcase
The public Projects page SHALL be replaced by a new Showcase page at `/showcase`, with public navigation and links updated. Legacy URLs and directory behavior SHALL have no preservation requirement. It SHALL show only visible entries from active owners with title, description, project type, URL, showcase date, username and optional thumbnail. It SHALL NOT expose private account fields or automatically list GitHub accounts.

#### Scenario: Browse the showcase
- **WHEN** a visitor opens the public showcase
- **THEN** visible entries appear in descending showcase-date order with deterministic creation-time and ID tie breakers
- **AND** hidden entries and deleted or archived owners' entries are absent

#### Scenario: Change visibility
- **WHEN** a coder hides or republishes an entry
- **THEN** already-open public pages immediately exclude or include it respectively through realtime TanStack store updates without reload or polling

### Requirement: Public showcase filters and presentation
The showcase SHALL provide project-type, username and member-type filters at the top. Username search SHALL match the club login case-insensitively by partial text, and all filters SHALL combine while preserving newest-first ordering. The page SHALL retain shared public CSS, system light/dark mode, semantic accessible controls and mobile usability, with loading, error/retry, empty and no-match states.

#### Scenario: Combine filters
- **WHEN** a visitor selects Scratch and searches for part of a username
- **THEN** only visible Scratch entries with matching usernames appear, newest showcase date first

#### Scenario: Clear filters
- **WHEN** the visitor clears project type and username filters
- **THEN** all visible entries appear in the default order

#### Scenario: No results or loading failure
- **WHEN** the showcase is empty, filters match nothing, or fetching fails
- **THEN** a distinct accessible state explains the result, with retry offered for failure

### Requirement: TanStack data access and live public updates
All client showcase reads, mutations and image actions SHALL use TanStack stores following repository conventions. Public pages SHALL subscribe to live changes and immediately refresh store results after inserts, updates, deletes and thumbnail or visibility changes, retaining active filters and sort order. Reconnection SHALL refresh results to recover missed changes.

#### Scenario: Observe another user's edit
- **WHEN** an authorized writer saves an entry while an anonymous visitor has the showcase open
- **THEN** the visible result updates automatically without reload or polling
- **AND** active filters and newest-first ordering still apply

#### Scenario: Recover a disconnected visitor
- **WHEN** a public visitor reconnects after missing showcase changes
- **THEN** the TanStack query refreshes and displays current results

### Requirement: Project-type-specific showcase editor
Both add and edit forms SHALL show project-type-specific options and instructions below the project type selector. Scratch SHALL offer the linked account’s shared projects, itch.io SHALL resolve a supplied public project URL for selection, and Website SHALL request its public URL. GitHub profile SHALL show the owning member’s saved GitHub username, derived Pages address, validation controls/status and relevant setup guidance.

#### Scenario: Select a project type
- **WHEN** a member selects or changes the project type in add or edit
- **THEN** the corresponding options and instructions appear below the selector
- **AND** incompatible GitHub validation state is cleared

#### Scenario: Reuse across roles
- **WHEN** a Coder, Parent or Mentor opens their own Showcase page
- **THEN** the same management and editor components provide their entries and actions

### Requirement: Validated GitHub profile publication
A GitHub profile entry SHALL NOT be visible unless the server has validated a published GitHub Pages user site belonging to the owning member’s saved GitHub username. Validation metadata SHALL be server-controlled and bound to that username and site. Every publication SHALL recheck validation. API and direct database writes SHALL enforce this invariant for every writer, including mentors. Hidden drafts SHALL remain saveable before setup is complete.

#### Scenario: Missing saved GitHub username
- **WHEN** the owning member has no GitHub username saved on their account
- **THEN** the editor explains how to add it and links to the appropriate profile editor
- **AND** GitHub profile publication remains disabled while hidden drafts can be saved

#### Scenario: No published Pages site
- **WHEN** the server confirms that the linked GitHub account has no published user site
- **THEN** the editor offers setup guidance or the official GitHub Pages instructions and a recheck action
- **AND** the entry cannot be made visible

#### Scenario: Valid published Pages site
- **WHEN** the server confirms the owning member’s user site is published
- **THEN** the GitHub profile entry can be made visible using the validated site address
- **AND** an intentionally hidden draft is not automatically published

#### Scenario: Validation unavailable
- **WHEN** GitHub validation times out or is rate-limited
- **THEN** the editor preserves the form, shows a retryable validation error and keeps publication disabled
- **AND** it does not claim the user has no site

#### Scenario: Parent or mentor validates for another member
- **WHEN** an authorized parent or mentor validates an entry for another member
- **THEN** the server checks the owning member’s saved GitHub username rather than the editor’s account

#### Scenario: Prevent forged validation
- **WHEN** a client attempts to publish with fabricated validation metadata or bypass validation through direct table access
- **THEN** publication is rejected

#### Scenario: Linked GitHub account changes
- **WHEN** the owning member changes or removes their saved GitHub username
- **THEN** prior GitHub profile validation is invalidated and affected entries become hidden until revalidated
- **AND** open public showcase pages update immediately through TanStack stores

### Requirement: Guided add wizard
Add SHALL default to a wizard guiding the member through project type selection, project selection or account setup, details, and final date/visibility review. Navigation SHALL preserve draft state. Creation SHALL occur only after explicit final save. Edit SHALL reuse the same project-type-specific controls and import behavior.

#### Scenario: Navigate the wizard
- **WHEN** a member starts Add and moves forward or back
- **THEN** the current step and relevant guidance are displayed and entered values are retained
- **AND** no showcase entry is created until final save

### Requirement: Shared Scratch project selection
The Scratch picker SHALL list the owning member’s public shared projects using their saved Scratch username, with pagination and refresh. The list SHALL load automatically when the Scratch picker opens with a saved username, including edit mode and after linked-account changes. Selected projects SHALL be verified against that account. Missing usernames SHALL prompt club-profile setup. Sharing guidance SHALL explain that missing projects need to be made public on Scratch.

#### Scenario: No Scratch username
- **WHEN** the owning member has no saved Scratch username
- **THEN** show instructions and a link to set it in their club profile before loading projects

#### Scenario: Browse and select a shared project
- **WHEN** the owning member has a valid Scratch username
- **THEN** load their shared projects with further pages available and allow selection
- **AND** a parent or mentor editor sees the owning member’s projects

#### Scenario: Project is missing
- **WHEN** the member views the project picker
- **THEN** show “Project missing? Share it publicly on Scratch, then refresh this list.” and a refresh action
- **AND** distinguish an empty list from an upstream loading error

### Requirement: Automatic project details
Selecting a Scratch or itch.io project SHALL automatically populate its title, description and thumbnail from public metadata through TanStack store actions. Members SHALL be able to review/edit imported text and replace/remove the image. Imported images SHALL use the managed thumbnail pipeline. Missing fields SHALL allow manual completion.

#### Scenario: Import project metadata
- **WHEN** a member selects a Scratch project or confirms a resolved public itch.io project
- **THEN** populate the project URL, title, description and available thumbnail without manual copying
- **AND** allow reviewing and editing those values before save

#### Scenario: Incomplete metadata or failed fetch
- **WHEN** a source omits a field or metadata retrieval fails
- **THEN** preserve draft values, explain the missing details or retryable failure and allow manual completion of available project details

#### Scenario: Avoid overwriting edits
- **WHEN** a member changes the selected project after editing imported fields
- **THEN** obtain explicit confirmation before replacing edited values
- **AND** stale responses from earlier selections cannot overwrite the current project

### Requirement: Public member-type filtering
The public member-type filter SHALL default to Coder and offer Coder and Mentor. Parent SHALL be offered only when an active parent owns at least one publicly eligible entry, independently of other filters. Entries from multi-role owners SHALL match each applicable role without duplication. Member-type filtering SHALL combine with project type and username.

#### Scenario: Default member type
- **WHEN** a visitor initially opens the public showcase
- **THEN** Coder is selected and only publicly eligible coder entries appear, newest first
- **AND** if none match, show the normal empty or no-match state

#### Scenario: Exclude unavailable Parent option
- **WHEN** no publicly eligible entries belong to active parents
- **THEN** Parent is absent from the member-type options
- **AND** hidden parent entries do not make it available

#### Scenario: Keep Parent available independently of other filters
- **WHEN** publicly eligible parent entries exist but the current project type or username filter excludes them
- **THEN** Parent remains an available member-type option

#### Scenario: Match multiple member roles
- **WHEN** an entry owner is both a parent and mentor
- **THEN** their entry matches either corresponding member-type selection and appears once in its results

#### Scenario: Remove the last Parent entry live
- **WHEN** the last publicly eligible parent entry is hidden, deleted or loses eligibility
- **THEN** open public pages remove the Parent option immediately
- **AND** a current Parent selection resets to Coder while retaining project-type and username filters

### Requirement: Explicit project type naming
The UI SHALL label the showcase classification “Project type”. The database column SHALL be named `project_type`, with `projectType` used in camelCase client contracts. Generic `type` SHALL NOT name this field. Member type SHALL remain a separate filter.

#### Scenario: Inspect classification naming
- **WHEN** a member uses the editor or public filters, or a developer inspects the schema and contracts
- **THEN** the classification is labeled Project type, stored as `project_type`, and exposed as `projectType`

### Requirement: Expandable animated showcase cards
Each public card SHALL show a project-type icon with accessible label, member name, avatar preferred over photo, title and thumbnail. Activating its keyboard-accessible disclosure SHALL reveal description and project link. Cards SHALL animate entry, exit and movement after filtering, sorting and live updates, respecting reduced-motion preferences.

#### Scenario: Expand a card
- **WHEN** a visitor clicks or keyboard-activates a card disclosure
- **THEN** its description and external project link appear with expanded state conveyed accessibly

#### Scenario: Animate changing results
- **WHEN** filters, sorting or incoming data change the results
- **THEN** keyed cards animate appearing, disappearing and moving without losing disclosure state for retained entries
- **AND** reduced-motion users receive immediate changes without movement

### Requirement: Delete stored thumbnails
Deleting a showcase entry SHALL remove its thumbnails from storage. Failed storage removal SHALL remain durably queued for retry, including entry deletion through member cascades. Acknowledgement SHALL follow successful storage deletion only.

#### Scenario: Delete an image-bearing entry
- **WHEN** an entry with a thumbnail is deleted
- **THEN** its stored thumbnail is removed and is no longer retrievable

#### Scenario: Retry failed storage cleanup
- **WHEN** storage removal fails after entry deletion
- **THEN** the obsolete path remains in a private durable queue for retry on subsequent showcase reads or writes

Cards zoom in when appearing. Disappearing cards pop like a balloon and emit decorative particles; filtering, sorting and live updates use these transitions. Reduced-motion mode suppresses zoom, popping and particles.

### Requirement: Versioned showcase image filenames
Images in the public showcase bucket SHALL use the showcase item ID as filename (`<showcase-item-id>-ver3.png`) with an increasing numeric version suffix. Paths SHALL contain no member ID, username or project title.

#### Scenario: Upload or replace a thumbnail
- **WHEN** a member uploads or imports a thumbnail
- **THEN** it is stored as `<showcase-item-id>-ver<N>.png`
- **AND** replacement retires the previous stored path for cleanup

#### Scenario: Replace an image without filename collisions
- **WHEN** thumbnail uploads overlap or an earlier upload fails
- **THEN** each upload reserves a distinct increasing version for that showcase item
- **AND** filenames are never reused, even when a failed upload leaves a gap in the sequence
