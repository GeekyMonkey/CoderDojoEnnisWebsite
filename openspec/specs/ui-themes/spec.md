# Spec: ui-themes

## Purpose
Define the supported UI theme IDs and the required behavior for system mapping, defaults, and opt-in themes.
## Requirements

(Populated via OpenSpec changes under `openspec/changes/**/specs/ui-themes/spec.md`.)

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

## Adding A Theme

### Requirements and constraints
- New theme IDs MUST be kebab-case and stable (treat as public API).
- `crt`-style themes that substantially change visuals SHOULD remain opt-in only.
- Default `system` mapping MUST resolve to `light` or `dark` and MUST NOT implicitly select novelty themes.

### Implementation checklist (in `src/`)
- Add theme assets under `src/app/assets/themes/<id>/` (CSS and optional TS theme model if used by the registry).
- Register the theme in the theme registry (currently `src/app/assets/themes/Themes.ts`) and ensure it is included in `src/app/assets/themes/Themes.css`.
- If the theme impacts selection logic or persistence, update `src/app/composables/useUiConfig.ts`.
- Ensure server-provided defaults and supported theme list remain correct (currently under `src/server/services/ThemesService.ts`).

### OpenSpec checklist
- Add a delta spec under `openspec/changes/<change-id>/specs/ui-themes/spec.md`.
- Include at least one `#### Scenario:` for any new/modified requirement.
- Run `openspec validate <change-id> --strict`.
