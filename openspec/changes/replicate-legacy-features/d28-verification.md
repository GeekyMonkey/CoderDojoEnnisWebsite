# D28 category images

Implemented alone at the user's request; remaining discrepancies are deferred.

- Category directory thumbnails and detail display reuse CategoryImage.
- Focused CategoryImageEditor reuses the existing EntityImageEditor picker, drag/drop and cropper. Display mode stays separate from editing.
- Zod validates image actions in the TanStack Query store and API. Server validates processed square PNGs, up to 800 pixels.
- Category and team image APIs share immutable uploads, revision guards and cleanup. Category image actions require a current mentor.
- Migration adds has_image and image_revision, backfilling only categories with existing legacy JPG objects. Text saves preserve image metadata.
- Verified authorization, malformed/extra fields, upload, public image retrieval, concurrent uploads (one succeeds, one conflicts), stale deletion, deletion and existing team route behavior with disposable data.
- Verified an already-open detail screen shows external upload and deletion without reloading. Existing directory thumbnails and legacy JPG display load. Mobile at 390 pixels has no horizontal overflow.
- Production build passes. Type checking has the same 25 existing errors in legacy files; no new errors. Legacy code was not changed.
- Changes remain uncommitted for review on codex/category-image-parity.
