# Proposal: update-ui-themes

## Summary

Replace the current custom themes `bright` and `neon` with standard `light` and `dark` themes aligned with Nuxt UI/Tailwind defaults, while keeping the existing `crt` theme intact.

## Motivation

The current theme set is overly custom and duplicates what Nuxt UI/Tailwind already provide for light/dark modes. Simplifying to `light`/`dark` reduces maintenance, improves consistency with the Nuxt UI design system, and makes future theme additions easier.

## Scope

- Replace `bright` → `light` and `neon` → `dark` across theme definitions, server theme configuration, and UI theme selection.
- Base `light` and `dark` on Nuxt UI/Tailwind defaults (no custom theme-variable palettes to start).
- Keep `crt` theme behavior and styling as-is.
- Discard the custom styles previously defined for `bright`/`neon` (these can be reintroduced later as incremental adjustments if needed).

## Non-Goals

- Redesigning the overall UI or changing component layouts.
- Changing the `crt` theme styling/overlays.
- Introducing a full theme marketplace or remote theme loading.

## Impact

- There are no current users, so no user-preference migration is required.
- Default preference should follow system theme (existing system detection logic remains the source of truth).
- `crt` remains available but is opt-in only (never auto-selected).
- Theme IDs used in UI config and CSS selectors will change.

## Dependencies

- Nuxt UI and Tailwind defaults remain available via existing modules (`@nuxt/ui`, `@nuxtjs/color-mode`).

## Risks

- Removing theme CSS overrides may change contrast/visuals in subtle ways.
- Incorrect migration could leave some users stuck on an invalid theme id.

## Notes

- Implementation changes MUST be applied only under `src/`.
- `src_legacy/` is reference-only.
- `\nui` can be used as a reference for a clean Nuxt UI setup
