## MODIFIED Requirements

### Requirement: Light/Dark Use Nuxt UI Defaults
Member and authentication pages SHALL use Nuxt UI/Tailwind default styling for `light` and `dark` as the starting point, with no custom palette redefinition. Shared-layout public pages SHALL use a separate public stylesheet and independent public palette variables following the operating system light/dark preference. The standalone Lab and Tidy Towns pages SHALL retain their existing CSS appearance without adopting the public theme.

#### Scenario: No custom palette baseline
- **WHEN** the `light` or `dark` theme is active on a member or authentication page
- **THEN** that page uses the framework defaults as the baseline styling

#### Scenario: Independent public palette
- **WHEN** a visitor loads a shared-layout public page
- **THEN** that page uses the public palette and does not depend on member palette variables or stored member theme selection

### Requirement: CRT Theme Preserved
The system SHALL keep the CRT theme available and unchanged for member and authentication pages. Public pages SHALL NOT receive CRT styling or overlays.

#### Scenario: CRT remains selectable
- **WHEN** a user selects the `crt` theme in the application
- **THEN** member and authentication pages apply the CRT styling and overlays

#### Scenario: Public page after CRT selection
- **WHEN** that user navigates to a shared-layout public page
- **THEN** the public OS light/dark palette applies without CRT styling or overlays
- **AND** returning to the application restores the stored CRT theme
