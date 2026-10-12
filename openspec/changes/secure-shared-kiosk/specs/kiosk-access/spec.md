## ADDED Requirements
### Requirement: Bounded shared kiosk session
The application SHALL replace a mentor portal session with a signed HttpOnly kiosk cookie granting only kiosk access, expiring at Dublin day change or after 12 hours, whichever occurs first.

#### Scenario: Mentor starts shared sign-in
- **WHEN** an active mentor enters sign-in mode
- **THEN** their originating session is revoked and blocked at API/RLS boundaries, client auth and private caches are cleared, and a kiosk-only cookie allows the dedicated page.

#### Scenario: Return to management
- **WHEN** the kiosk user navigates Back, reloads or opens a management URL
- **THEN** the previous mentor session grants no access and management requires fresh authentication.

#### Scenario: Invalid kiosk cookie
- **WHEN** the cookie is missing, altered, expired or from a previous Dublin day
- **THEN** kiosk status/sign-in is denied and a mentor must authenticate to start again.

#### Scenario: Capability boundary
- **WHEN** a kiosk cookie is presented to management APIs or cross-origin kiosk mutations
- **THEN** access is denied and the cookie does not grant a Supabase identity.

#### Scenario: Existing hardware consumers
- **WHEN** an existing F03 hardware client uses its current APIs
- **THEN** its contracts and authorization behavior remain unchanged.
