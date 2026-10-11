# Change: Add profile photo and avatar editing

## Why
Users need to manage both their profile photo and avatar from the reusable profile page, including cropping uploaded images.

## What Changes
- Display labelled Photo and Avatar slots side by side, with responsive sizing and empty placeholders.
- Display photos with a circular mask and avatars as squares; the crop editor previews the selected slot shape.
- Process every upload into a square image with neither dimension exceeding 800 pixels, with crop position and zoom controls.
- Use one pan/zoom editor with mouse drag and wheel, touch drag and pinch, and keyboard alternatives; derive cropping and transparent padding automatically without a fit selector.
- Preserve transparency in saved images using a suitable image format; allow preview, save, or cancel.
- Provide a swap button that exchanges both images, including when only one slot is populated.
- Provide a delete action for each populated slot.
- Route image operations through profile stores, with authenticated server authorization, storage validation, and cache refresh.

## Impact
- Affected specs: user-profile-images (new).
- Affected code: reusable Profile components, profile stores and APIs, member image storage and image URL refresh, translations, Bruno requests.
- Preserve hasPhoto/hasAvatar fields; adapt image storage formats and URL resolution to support transparency while retaining compatibility with existing JPEG images.
