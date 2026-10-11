## ADDED Requirements

### Requirement: Separate profile photo and avatar
The reusable user profile SHALL show separate labelled Photo and Avatar slots side by side and SHALL restrict editing to users authorized to edit that profile.

#### Scenario: View images
- **WHEN** a user opens a profile
- **THEN** both slots SHALL show the corresponding saved image or an empty placeholder
- **AND** photos SHALL display with a circular mask and avatars SHALL display as squares
- **AND** editing controls SHALL only appear when the viewer can edit the profile

### Requirement: Upload and crop profile images
Authorized users SHALL be able to select an image for either slot, adjust its framing through pan and zoom gestures, and save or cancel. The editor SHALL preview photos with a circular mask and avatars as squares, with no separate fit selector. The system SHALL validate image type and size and show actionable errors without replacing an existing saved image on failure.

#### Scenario: Save a cropped image
- **WHEN** a user selects a supported image, adjusts its crop, and saves
- **THEN** the processed square image SHALL persist in the chosen slot with neither dimension exceeding 800 pixels
- **AND** profile and member image displays SHALL refresh without a page reload

#### Scenario: Cancel or fail an upload
- **WHEN** a user cancels cropping or an upload fails validation or persistence
- **THEN** the saved images SHALL remain unchanged

### Requirement: Resize and preserve transparency
The system SHALL process every upload into a square raster no larger than 800 pixels per axis. Pan and zoom SHALL determine cropping and transparent padding automatically while preserving aspect ratio. Saved formats SHALL preserve transparency, and the server SHALL validate image dimensions and format.

#### Scenario: Crop a large image
- **WHEN** a user saves a crop from an image larger than 800 pixels on either axis
- **THEN** the selected area SHALL be cropped and resized into a square no larger than 800 by 800 pixels

#### Scenario: Reveal transparent padding
- **WHEN** a user zooms out so the rectangular image fits inside its destination display shape
- **THEN** the entire image SHALL remain visible without distortion
- **AND** unused square areas SHALL be transparent in the saved image
- **AND** neither saved dimension SHALL exceed 800 pixels

#### Scenario: Preview the destination shape
- **WHEN** a user edits a photo or avatar at any pan and zoom setting
- **THEN** the preview SHALL use a circular mask for a photo and a square for an avatar
- **AND** transparent padding SHALL be distinguishable in the editor

### Requirement: Direct pan and zoom interaction
The editor SHALL support mouse dragging to pan, wheel zoom about the cursor, one-finger touch panning, and two-finger pinch zoom with simultaneous midpoint movement. It SHALL support keyboard panning and zooming and preserve framing when fingers join, leave, or are cancelled.

#### Scenario: Desktop framing
- **WHEN** a user drags or scrolls over the preview
- **THEN** the image SHALL pan or zoom around the mouse cursor
- **AND** scrolling outside the preview SHALL remain available

#### Scenario: Mobile framing
- **WHEN** a user drags with one finger or pinches with two fingers over the preview
- **THEN** the image SHALL pan or zoom smoothly without scrolling the page
- **AND** switching between one and two fingers SHALL retain the current framing

### Requirement: Swap photo and avatar
Authorized users SHALL be able to exchange the photo and avatar using one swap button, including moving an image into an empty slot. The action SHALL be disabled when both slots are empty or an image operation is in progress.

#### Scenario: Swap saved images
- **WHEN** a user swaps two populated slots
- **THEN** the photo SHALL become the avatar and the avatar SHALL become the photo
- **AND** both image flags and visible image caches SHALL match the saved result
- **AND** each image SHALL use its destination slot display shape, circular for Photo and square for Avatar

#### Scenario: Swap into an empty slot
- **WHEN** a user swaps with only one populated slot
- **THEN** the existing image SHALL move to the other slot and its former slot SHALL become empty

### Requirement: Delete either image
Authorized users SHALL be able to delete each populated image independently, with failures reported and successful deletion reflected across profile and member views.

#### Scenario: Delete the photo
- **WHEN** a user deletes the photo successfully
- **THEN** the Photo slot SHALL show its empty placeholder
- **AND** the avatar SHALL remain unchanged

#### Scenario: Reject unauthorized changes
- **WHEN** a user attempts to upload, swap, or delete images for a profile they cannot edit
- **THEN** the server SHALL reject the operation without changing images or member records
