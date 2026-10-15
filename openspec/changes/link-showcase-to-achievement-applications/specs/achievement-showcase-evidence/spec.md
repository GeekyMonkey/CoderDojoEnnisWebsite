## ADDED Requirements

### Requirement: Application showcase GUID arrays
Badge and belt application records SHALL store zero or more showcase GUIDs in non-null `showcase_item_ids uuid[]`, defaulting to an empty array. IDs SHALL be unique, contain no null elements and retain selection order. Existing applications SHALL remain valid with no links.

#### Scenario: Submit several showcase links
- **WHEN** a coder submits a valid badge or belt application with several owned showcase items
- **THEN** the application stores those item GUIDs in selection order alongside its existing evidence notes

#### Scenario: Existing application
- **WHEN** the migration is applied to an existing application
- **THEN** its showcase GUID array is empty and existing evidence and decisions are unchanged

### Requirement: Coder Add and Delete link controls
The application form SHALL let a coder press Add to select an existing own showcase entry and Delete to remove a selected link. Hidden own entries SHALL be selectable. Already attached items SHALL not be selectable twice. These actions SHALL use TanStack stores and SHALL NOT delete the underlying showcase item or thumbnail.

#### Scenario: Add and remove selected evidence
- **WHEN** a coder adds two showcase items and deletes one link before submitting
- **THEN** only the remaining GUID is submitted and both showcase items still exist

#### Scenario: Cancel selection
- **WHEN** a coder cancels the showcase picker
- **THEN** the application's selected links are unchanged

### Requirement: Guarded pending link editing
A coder SHALL be able to add or remove links on their own pending application. The server and database write boundary SHALL validate newly attached IDs against the application owner, reject stale updates and prevent evidence changes after a decision. Existing application notes, dates, progression and decision permissions SHALL be maintained.

#### Scenario: Another owner's showcase
- **WHEN** a coder submits a new link to another member's showcase item
- **THEN** the write is rejected without changing the application

#### Scenario: Decision races with editing
- **WHEN** a mentor decides an application before the coder's attachment update commits
- **THEN** the attachment update is rejected and decided evidence remains unchanged

#### Scenario: Stale selection
- **WHEN** two sessions edit the same pending selection from the same original GUID array
- **THEN** the first update succeeds and the stale second update is rejected and refreshed

#### Scenario: Reapply after rejection
- **WHEN** a coder reapplies with a different showcase selection
- **THEN** the new application stores the new selection and the rejected application retains its historical GUID array

### Requirement: Reusable showcase evidence cards
A shared showcase item card SHALL render on the public showcase, coder application screens and evaluator screens. It SHALL display project identity and thumbnail, expand to show description and an external project link, and support coder link-removal actions outside its disclosure button. Disclosure IDs SHALL be unique per rendered card instance.

#### Scenario: Evaluate linked showcase evidence
- **WHEN** an authorized evaluator opens a badge or belt application
- **THEN** linked projects appear as reusable showcase cards alongside the application notes, including linked hidden items
- **AND** the evaluator can inspect descriptions and open project links

#### Scenario: Same project in multiple applications
- **WHEN** several displayed applications reference the same showcase item
- **THEN** each card's disclosure controls its own unique details region

### Requirement: Self-healing showcase references
Missing showcase IDs SHALL be removed automatically from stored badge and belt application arrays, including pending, awarded and rejected records. Showcase deletion SHALL prune references transactionally; migration cleanup and authorized-read repair SHALL also remove dangling IDs. Repairs SHALL preserve valid IDs, their order, concurrent additions, notes, dates and decisions. Open views SHALL refresh through TanStack stores.

#### Scenario: Referenced showcase item is deleted
- **WHEN** a linked showcase item is deleted
- **THEN** its GUID is removed from all referencing badge and belt applications owned by that showcase member in the same transaction
- **AND** valid remaining links retain their order, other members’ applications remain unchanged and open views refresh

#### Scenario: Already-missing reference is encountered
- **WHEN** migration cleanup or an authorized application read encounters a GUID with no showcase record
- **THEN** that GUID is atomically removed from the stored array without rendering an unavailable-item marker
- **AND** an array with no remaining valid IDs becomes an empty UUID array

#### Scenario: Repair races with a valid addition
- **WHEN** a valid showcase link is added while missing IDs are being repaired
- **THEN** repair prunes only missing IDs from the current stored array and retains the concurrent valid addition

#### Scenario: Repair a decided application
- **WHEN** an awarded or rejected application contains a missing showcase ID
- **THEN** system repair removes that ID while preserving the application's notes, dates and decision
- **AND** coders still cannot edit decided application evidence themselves

### Requirement: Updated linked evidence
Linked cards SHALL resolve current showcase details through authorized TanStack-backed review data. Showcase updates SHALL refresh displayed evidence without discarding a coder's unsaved valid link selection.

#### Scenario: Project details change
- **WHEN** a linked showcase item's title, description or thumbnail changes
- **THEN** open evidence views refresh the linked card through their stores
