## ADDED Requirements

### Requirement: Login page uses Nuxt UI AuthForm
The system SHALL render the `/login` page using Nuxt UI’s `UAuthForm` component as the primary form surface, following the layout pattern described in the Nuxt UI AuthForm documentation.

#### Scenario: User visits the login page
- **WHEN** a user navigates to `/login`
- **THEN** the page SHALL show a centered card containing a login form rendered by `UAuthForm`
- **AND** the page SHALL be displayed within the existing `auth-layout`

### Requirement: Login form remains behaviorally unchanged
The system SHALL NOT change login behavior while restyling the login page.

#### Scenario: User submits credentials
- **WHEN** a user submits a username and password
- **THEN** the system SHALL submit the same login request as before to `/api/Auth/Login`
- **AND** the system SHALL continue to set the Supabase session and redirect to `/logged_in` on success

### Requirement: No new login capabilities are introduced
The system SHALL NOT introduce new login capabilities as part of this styling change.

#### Scenario: Login page feature set
- **WHEN** a user views the login page
- **THEN** the page SHALL NOT display OAuth provider sign-in buttons
- **AND** the page SHALL NOT add new flows such as sign-up or password reset
