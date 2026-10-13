# Change: Share big and small belt displays

## Why
Large belt displays vary between screens, cannot open belt details, and black belt text can be unreadable.

## What Changes
- Extend the existing BeltColor component with big and small modes.
- Big displays fill their container and open a dialog with the supplied belt description.
- Small displays preserve attendance-table styling and remain non-interactive.
- Correct contrasting text colours and migrate existing consumers.

## Impact
- Affected specs: belt-display.
- Affected code: BeltColor, member/profile wrappers, achievement views, tables, kiosk, print card, and translations.
- No additional API requests or authorization changes.

## Authorization
The user explicitly requested these behaviours and implementation in this conversation.
