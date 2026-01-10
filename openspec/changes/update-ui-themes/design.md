## Context

The app currently defines three custom themes under `src/app/assets/themes/`: `bright`, `neon`, and `crt`. Theme selection is driven by a server-provided `themesConfig` and a client-side `useColorMode()` instance configured to write an HTML attribute (`theme`).

`bright` and `neon` define large sets of CSS variables (including Tailwind-style variables) and custom gradients. `crt` is intentionally bespoke and includes additional overlays.

## Goals

- Provide two standard themes: `light` and `dark`.
- Align `light`/`dark` with default Nuxt UI/Tailwind styling (minimize custom overrides).
- Keep `crt` as a separate theme with its current visuals.
- Preserve system-theme behavior (system → choose `light` or `dark`) using the existing selection logic.
- Support future theme additions without changing the overall theme-selection architecture.

## Non-Goals

- Reworking Nuxt UI configuration beyond what is necessary to restore default styling.
- Building a UI for authoring themes.

## Decisions

### Decision: Theme IDs
- Replace `bright` with `light`.
- Replace `neon` with `dark`.
- Keep `crt` unchanged.

Rationale: These IDs match common conventions and align with the built-in color-mode concept.

### Decision: Base styling for `light`/`dark`
- `light` and `dark` should use Nuxt UI/Tailwind defaults.
- The existing custom variable palettes and gradients from `bright`/`neon` will be discarded.
- Any styling tweaks can be added later once the baseline is stable.

Rationale: avoid maintaining a parallel set of palette variables.

### Decision: No preference migration
- No migration logic is required because there are no current users.

Rationale: avoid introducing complexity prematurely.

## Migration Plan

1. Introduce new theme definitions `light` and `dark` and include them in the server-provided theme list.
2. Remove or retire the `bright` and `neon` theme definitions and CSS imports.
3. Update the theme defaults in the server config to point at `light`/`dark`.
4. Update client initialization so system/auto/dark/light selects `dark`/`light` theme IDs.
5. Validate that `crt` remains selectable and unchanged.

## Risks / Trade-offs

- Visual changes: by removing custom gradients/variables, the app may look different.
- Mixed theme systems: the project currently uses `@nuxtjs/color-mode` and `@vueuse/core` `useColorMode()`; care is needed to avoid conflicting behaviors.

## Open Questions

## Resolved Decisions

### Decision: Default preference follows system
- Use `system` as the default color-mode preference when supported.

Rationale: matches user expectations and leverages existing system detection.

### Decision: CRT is opt-in only
- `crt` MUST NOT be selected automatically by system mapping or defaults.
- Users must explicitly choose `crt` as an alternate theme.

Rationale: `crt` is a novelty/alternate theme and should not surprise users.
