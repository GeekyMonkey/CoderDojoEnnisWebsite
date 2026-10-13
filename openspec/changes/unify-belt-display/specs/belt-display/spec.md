## ADDED Requirements

### Requirement: Shared belt display modes
The application SHALL use one belt display component with big and small modes.

#### Scenario: Big belt display
- **WHEN** a belt is shown in big mode
- **THEN** it fills its container width and provides a keyboard-operable button opening a dialog with the supplied belt description
- **AND** missing descriptions and the no-belt state have localized fallback text

#### Scenario: Compact attendance and table displays
- **WHEN** a belt is shown in small mode
- **THEN** it retains the existing compact attendance styling, including labelled desktop and narrow mobile variants
- **AND** it does not open a dialog or change a surrounding table action

### Requirement: Readable belt text
Belt displays SHALL use readable text contrast across belt colours.

#### Scenario: Black belt
- **WHEN** a black belt is displayed
- **THEN** its label uses white text on the black background

#### Scenario: Custom colour
- **WHEN** a belt defines a three-digit or six-digit hexadecimal colour
- **THEN** its text uses whichever of black or white provides greater contrast
