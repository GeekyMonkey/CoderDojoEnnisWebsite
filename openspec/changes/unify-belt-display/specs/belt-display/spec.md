## ADDED Requirements

### Requirement: Shared belt display sizes
The application SHALL use one belt display component with small, medium and large sizes.

#### Scenario: Large profile belt display
- **WHEN** a belt is shown on a profile page
- **THEN** it uses large size and fills its container width without page-specific sizing overrides and provides a keyboard-operable button opening a dialog with the supplied belt description
- **AND** missing descriptions and the no-belt state have localized fallback text

#### Scenario: Compact attendance and table displays
- **WHEN** a belt is shown in a table
- **THEN** it uses small size and retains the existing compact attendance styling
- **AND** a CSS container query shows the label when the belt component is at least 4rem wide and otherwise uses the narrow strip, independently of viewport width
- **AND** it does not open a dialog or change a surrounding table action

#### Scenario: Default medium display
- **WHEN** no belt size is supplied
- **THEN** the component uses medium size and supports the belt-description dialog

### Requirement: Readable belt text
Belt displays SHALL use readable text contrast across belt colours.

#### Scenario: Black belt
- **WHEN** a black belt is displayed
- **THEN** its label uses white text on the black background

#### Scenario: Custom colour
- **WHEN** a belt defines a three-digit or six-digit hexadecimal colour
- **THEN** its text uses whichever of black or white provides greater contrast
