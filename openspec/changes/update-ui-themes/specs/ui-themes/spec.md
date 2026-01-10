## ADDED Requirements

### Requirement: Supported Theme IDs
The system SHALL support the following built-in theme IDs:
- `light`
- `dark`
- `crt`

#### Scenario: Themes list is provided to the UI
- **WHEN** the UI loads the UI configuration
- **THEN** the configuration includes theme entries for `light`, `dark`, and `crt`

### Requirement: Bright/Neon Themes Removed
The system SHALL NOT expose theme IDs `bright` or `neon`.

#### Scenario: Deprecated themes are not listed
- **WHEN** the UI loads the UI configuration
- **THEN** the configuration does not include theme entries for `bright` or `neon`

### Requirement: System Theme Mapping
When the user preference is set to follow the operating system theme, the system SHALL select `light` or `dark` accordingly.

#### Scenario: System prefers dark
- **WHEN** the OS reports a dark color scheme
- **THEN** the active theme resolves to `dark`

#### Scenario: System prefers light
- **WHEN** the OS reports a light color scheme
- **THEN** the active theme resolves to `light`

#### Scenario: CRT is never auto-selected
- **WHEN** the user preference is set to follow the operating system theme
- **THEN** the active theme resolves to `light` or `dark` and never `crt`

### Requirement: Default Theme IDs
The system SHALL provide defaults for light and dark operation using `light` and `dark`.

#### Scenario: Defaults are present
- **WHEN** the server provides the UI themes configuration
- **THEN** `defaultLightThemeId` is `light` and `defaultDarkThemeId` is `dark`

### Requirement: Default Preference Follows System
When supported by the runtime configuration, the system SHALL default the color-mode preference to `system`.

#### Scenario: Default preference is system
- **WHEN** a new user loads the application with no prior preference
- **THEN** the color-mode preference defaults to `system`

### Requirement: Light/Dark Use Nuxt UI Defaults
The system SHALL use Nuxt UI/Tailwind default styling for `light` and `dark` as the starting point, with no custom palette redefinition.

#### Scenario: No custom palette baseline
- **WHEN** the `light` or `dark` theme is active
- **THEN** the UI uses the framework defaults as the baseline styling

### Requirement: CRT Theme Preserved
The system SHALL keep the `crt` theme available and unchanged.

#### Scenario: CRT remains selectable
- **WHEN** a user selects the `crt` theme
- **THEN** the application applies the CRT styling and overlays
