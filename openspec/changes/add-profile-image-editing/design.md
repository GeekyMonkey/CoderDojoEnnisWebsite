## Decisions
- Use normalized pointer coordinates and one transform for dragging, cursor-anchored wheel zoom, and two-finger pinch/midpoint movement. Rebase gestures when fingers join or leave. Disable touch scrolling only on the preview and provide keyboard alternatives.
- Process uploads with the browser canvas into square PNGs, initially fitting the full image inside its destination, then deriving cropping and transparent padding from pan and zoom; validate PNG chunk CRCs, raster data, square dimensions, and bounded size on the server.
- Store photos and avatars as full square rasters. Apply circle/square display masks for each destination so swapping does not destroy corner data.
- Reuse member flags, profile authorization, and the coderdojo bucket. Read new PNG paths first with legacy JPEG fallback; no schema migration is required.
- Keep API operations in profile stores and share hydrated image revisions so successful saves and realtime refresh invalidate browser image URLs.
- Snapshot affected files before changes and restore them on storage or database failure.

## Verification
- Production build passed.
- Browser verification confirmed native mouse dragging, wheel zoom, circular/square framing, automatic transparent padding, and 800 x 800 PNG output.
- Synthetic touch-pointer sequences confirmed pinch zoom, stable framing when a finger leaves, subsequent one-finger panning, and cancellation; results were repeated at 390-pixel phone width. Physical-device testing was not performed.
- Added geometry, cursor-anchor, pinch midpoint movement, and pan/zoom-bound tests alongside existing PNG, authorization, upload, swap, delete, and rollback coverage. The test runner and formatter are left to the user per repository instructions.
- App/server type checks expose pre-existing Legacy and shared auto-import errors; changed files are checked for new diagnostics.
- Read-only Supabase bucket verification confirmed public image access, PNG support (no MIME restriction), and a 10 MiB file limit, above the 3 MB processed-image cap.
- Live Supabase image persistence has not been exercised; browser verification uses synthetic images and local action callbacks.

## Risks
- Supabase storage and member flags are not a distributed transaction. Recovery is best effort if storage itself fails, and concurrent edits to the same member images can race; the UI serializes its own actions, but different sessions should avoid simultaneous image edits.
- Legacy JPEG paths fall back on an image load failure; the first display of an unmigrated image may make an additional request.
