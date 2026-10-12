## ADDED Requirements

### Requirement: Complete table authorization
The system SHALL enable RLS and explicit least-privilege grants on all twelve coderdojo tables: members, member_parents, member_attendances, member_badge_categories, member_badges, member_belts, badge_categories, badges, belts, teams, sessions and session_pods. The system SHALL enforce the per-table read and application-operation matrix in this change and deny non-listed access.

#### Scenario: Unrelated user queries private data
- **WHEN** an anonymous, unbound, archived or unrelated user queries private rows through REST, a view, RPC or API
- **THEN** the system SHALL deny access or return only the explicitly authorized projection
- **AND** no service-role route SHALL bypass that boundary

### Requirement: Current bound identity
The system SHALL derive authorization from a protected one-to-one auth-user/member binding and current active database roles and relationships. Editable metadata, request actor IDs and stale JWT role claims SHALL NOT establish authority.

#### Scenario: Role revoked with an existing token
- **WHEN** a mentor role is revoked while its JWT remains valid
- **THEN** subsequent private reads and transactional administration SHALL use the current reduced permissions

### Requirement: Full mentor application administration
Active mentors SHALL have full supported application administration across all twelve tables, including active and archived targets, account roles, relations, definitions, attendance, reviews, reporting, printing, merge and maintenance. Transaction and credential safeguards SHALL remain enforced. The existing restriction against approving or rejecting their own child's application SHALL remain, while mentor undo SHALL remain allowed.

#### Scenario: Mentor manages an archived account
- **WHEN** an active mentor uses an authorized maintenance workflow against an archived target
- **THEN** the system SHALL permit the supported operation and preserve its validation and atomic side effects

#### Scenario: Mentor reviews own child
- **WHEN** a mentor attempts to approve or reject their own child's application
- **THEN** the system SHALL reject the decision in the transaction and UI
- **AND** an authorized undo SHALL remain available under the existing rule

### Requirement: Own profile and protected fields
Active parents and coders SHALL be able to edit their own login, first name, last name, email, phone and GitHub/Scratch/Xbox handles through validated profile operations. The system SHALL reject unauthorized roles, registration, vetting, team, scanner, archive, identity, password-hash or lifecycle-field edits. Existing uniqueness, advisory-lock and stale-snapshot safeguards SHALL remain.

#### Scenario: Parent saves own profile
- **WHEN** an active parent submits valid own profile fields
- **THEN** the system SHALL save them
- **AND** injecting is_mentor or another target identity SHALL fail without partial changes

### Requirement: Linked child and own coder operations
The system SHALL allow active parents to read authorized linked-child histories and edit linked-child birth year, login, handles, password and images through their existing narrow operations. Coders SHALL manage only their own goals and eligible applications. Nonmentors SHALL NOT assign relationships, roles or award decisions. F03 kiosk API compatibility SHALL remain an accepted exception; direct attendance DML SHALL stay denied.

#### Scenario: Parent link removed
- **WHEN** a parent requests a child operation after the link is removed
- **THEN** the system SHALL deny that operation even if the child was previously cached

### Requirement: Safe read projections
The system SHALL expose exact authorized self, child, teammate, co-parent and host/reviewer projections without widening raw member access. Peer awards SHALL include earned presentation only. Stored password hashes SHALL NOT be exposed to browser roles, APIs, events or logs; device credentials SHALL appear only in authorized operational flows.

#### Scenario: Teammate requests achievement history
- **WHEN** a coder views an authorized teammate's achievements
- **THEN** the system SHALL return earned presentation fields only
- **AND** pending evidence, contact details and raw account data SHALL remain unavailable

### Requirement: Deliberate public access
Anonymous database access SHALL be limited to explicitly approved active definition fields and the safe active GitHub directory projection. Public image downloads SHALL NOT authorize private member records, team directories, pod URLs or global storage listing.

#### Scenario: Visitor knows an image URL
- **WHEN** a visitor downloads a member image and requests the associated private member row
- **THEN** the image SHALL download publicly
- **AND** the private row SHALL remain denied

### Requirement: Guarded mutation and execution
All anon/authenticated direct table mutations SHALL be denied, including mentor direct mutations. Supported edits SHALL run through guarded service-only operations with server-derived actors and transaction-time role/link/target checks. Public/global statistics execution SHALL be removed or secured. Existing F03 attendance/kiosk APIs SHALL remain unchanged for third-party hardware compatibility; their unverified actor/identifier authority is an explicitly accepted known vulnerability.

#### Scenario: Direct REST privilege escalation
- **WHEN** any browser role attempts a direct table update or service-only RPC call
- **THEN** database grants SHALL deny it
- **AND** valid authorized application edits SHALL still work through their guarded API

### Requirement: Pod and attendance scope
Nonmentors SHALL read and join only active unexpired non-mentor-only pods as themselves. Current attendance/date/history reads SHALL be limited to own or linked-child scope or an explicitly approved aggregate. Existing F03 hardware kiosk APIs SHALL retain their current contracts and authorization behavior under the accepted known-vulnerability exception; this change SHALL NOT require new device credentials or target restrictions for those APIs.

#### Scenario: Pod expires before joining
- **WHEN** an eligible pod expires between display and join
- **THEN** the transactional join SHALL deny it without recording attendance

### Requirement: Protected rollout
The system SHALL pass the full positive and negative verification matrix before acceptance, and rollback SHALL preserve restricted grants, RLS, service-route guards and removal of sensitive raw publications.

#### Scenario: Deployment check fails
- **WHEN** an authorization or essential feature check fails during cutover
- **THEN** the affected workflow SHALL be paused or reverted to a guarded-compatible application version
- **AND** insecure grants or unauthenticated routes SHALL NOT be restored

### Requirement: Legacy retirement at production cutover
The legacy import SHALL remain unchanged during development/migration by explicit user decision. At production cutover the system SHALL remove legacy import/read routes and decommission the old database after final reconciliation, runtime dependency removal and recovery-backup checks.

#### Scenario: Development RLS work
- **WHEN** authorization changes are prepared before production cutover
- **THEN** F02 legacy import and the old database SHALL remain unchanged

#### Scenario: Production retirement
- **WHEN** the final migration is reconciled and old-database runtime dependencies are removed at production cutover
- **THEN** legacy import/read endpoints SHALL be removed and the old database decommissioned with the required recovery backup retained

### Requirement: Atomic attendance sign-in
Attendance sign-in SHALL commit daily attendance and login-date rotation in one service-only transaction, using the current stored account and updating no unrelated account fields. Failures SHALL NOT produce success. Repeated sign-ins SHALL retain one member/date attendance row. Existing F03 API authorization, archived-target compatibility and fingerprint testing semantics SHALL remain unchanged.

#### Scenario: Attendance or login-date persistence fails
- **WHEN** either write fails during sign-in
- **THEN** both writes SHALL roll back and the API SHALL report failure

#### Scenario: Account changed after kiosk lookup
- **WHEN** profile, role, archive or credential fields change after the initial member lookup
- **THEN** sign-in SHALL preserve those current fields and return the committed current member projection

#### Scenario: Fingerprint testing mode
- **WHEN** testing mode is requested
- **THEN** attendance SHALL remain unpersisted while login dates rotate and the displayed count is simulated under the existing contract

### Requirement: Successful portal login history
Successful password and NFC portal logins SHALL rotate login_date_previous/login_date through a service-only operation after session creation, without creating attendance or overwriting unrelated account fields. The transaction SHALL recheck the active bound account and the verified credential. Failed credential/session/persistence steps SHALL NOT return login success. Attendance credential validation alone SHALL NOT rotate portal history.

#### Scenario: First and repeated portal logins
- **WHEN** an active account completes its first or a repeated password/NFC login
- **THEN** previous login SHALL be the stored old login date (null on first login) and current login SHALL be the committed UTC time
- **AND** welcome decisions SHALL continue to use the previous-login boundary

#### Scenario: Login cannot complete
- **WHEN** credentials or session creation fail, the account is archived or credentials change before completion, or history persistence fails
- **THEN** login SHALL report failure without rotating dates for that failed operation

#### Scenario: Attendance password validation
- **WHEN** the kiosk validates credentials before attendance sign-in
- **THEN** validation alone SHALL NOT rotate history; the existing attendance operation SHALL own its date effects
