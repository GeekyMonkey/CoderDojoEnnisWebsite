# Change: Share small, medium and large belt displays

## Why
Large belt displays vary between screens, cannot open belt details, and black belt text can be unreadable.

## What Changes
- Extend the existing BeltColor component with small, medium and large sizes.
- Large profile displays fill their container by default and open a dialog with the supplied belt description.
- All tables use small displays, whose labels respond to component width through CSS container queries. Small displays remain non-interactive.
- Medium is the default size and also supports the details dialog.
- Remove page-specific belt sizing overrides and viewport-based label decisions.
- Correct contrasting text colours and migrate existing consumers.

## Impact
- Affected specs: belt-display.
- Affected code: BeltColor, member/profile wrappers, achievement views, tables, kiosk, print card, and translations.
- No additional API requests or authorization changes.

## Authorization
The user explicitly requested these behaviours and implementation in this conversation.
