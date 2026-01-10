# Tasks: update-ui-themes

## 1. Preparation
- [x] 1.1 Confirm all theme references to `bright`/`neon` in `src/` (components, services, config, CSS).
- [x] 1.2 Identify how `@nuxtjs/color-mode` and `@vueuse/core` `useColorMode()` interact in this repo.

## 2. Theme Definition Changes
- [x] 2.1 Add new theme definitions `light` and `dark` (replacing `bright` and `neon`).
- [x] 2.2 Keep `crt` theme definition and CSS unchanged.
- [x] 2.3 Discard `bright`/`neon` custom theme CSS (remove their imports and files if appropriate).
- [x] 2.4 Update theme registry (`Themes.ts`) and stylesheet imports (`Themes.css`).

## 3. Defaults and System Mapping
- [x] 3.1 Update server defaults so `defaultLightThemeId` is `light` and `defaultDarkThemeId` is `dark`.
- [x] 3.2 Ensure client init maps `system/auto` to `light` or `dark` theme IDs.
- [x] 3.3 Update Nuxt color-mode default preference to follow system.
- [x] 3.4 Ensure `crt` is never selected automatically (opt-in only).

## 4. Backwards Compatibility
- [x] 4.1 No user preference migration required (no current users).
- [x] 4.2 Ensure unknown/invalid stored themes fall back safely.

## 5. Validation
- [x] 5.1 Manual: verify switching between `light`, `dark`, and `crt` works.
- [x] 5.2 Manual: verify OS light/dark changes select `light`/`dark` when preference is system.

## 6. Documentation
- [x] 6.1 Document theme IDs (`light`, `dark`, `crt`) and how to add future themes.
