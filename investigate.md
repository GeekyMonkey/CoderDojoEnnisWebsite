# Nuxt UI Stack Overflow Investigation

## Context
- Issue: `src` app (client-rendered) hits a stack overflow in browser when using Nuxt UI components such as `UHeader`; `UFooter` appears fine. `nui` reference app works.
- Goal: note differences between `nui` and `src` and outline investigation avenues before any code changes.

## Notable Differences (nui vs src)
- **Dependencies**: `src` adds Supabase (`@nuxtjs/supabase`, `@supabase/supabase-js`), i18n, color-mode, Google Fonts, Icon, Vue Query, Tailwind 4.1, Nitrogen Cloudflare preset, and many utilities. `nui` is leaner and sticks to `@nuxt/ui`, `@nuxt/scripts`, `@vueuse/nuxt`, date-fns, and Unovis.
- **Nuxt config**: `src` sets `compatibilityDate: "2025-05-15"`, Cloudflare Pages nitro preset, color-mode preference `neon` with class suffix, custom aliases, Google Fonts preload, i18n config, and custom component auto-imports; `nui` has minimal config, `compatibilityDate: '2024-07-11'`, no SSR, `@nuxt/scripts`, and basic eslint settings ([src/nuxt.config.ts](src/nuxt.config.ts), [nui/nuxt.config.ts](nui/nuxt.config.ts)).
- **App shell**: `src` `app.vue` loads `useUiConfig` (fetch + color-mode setup) before rendering, wraps content in `UApp`, and teleports a `ThemeFooter` overlay outside `UApp` ([src/app/app.vue](src/app/app.vue), [src/app/components/Themes/ThemeFooter.vue](src/app/components/Themes/ThemeFooter.vue)). `nui` `app.vue` just sets head/SEO and renders `UApp` with `NuxtLayout` ([nui/app/app.vue](nui/app/app.vue)).
- **App config**: `src` overrides Nuxt UI modal slots/variants and icon collection defaults ([src/app/app.config.ts](src/app/app.config.ts)); `nui` only sets primary/neutral colors ([nui/app/app.config.ts](nui/app/app.config.ts)).
- **Layouts/pages**: `src` layouts are simple wrappers; `auth-layout` injects `UFooter` plus theme/language controls, and the login page is the only known `UHeader` usage ([src/app/layouts/auth-layout.vue](src/app/layouts/auth-layout.vue), [src/app/pages/(auth)/login.vue](src/app/pages/(auth)/login.vue)). `nui` default layout uses `UDashboardSidebar`, `UDashboardNavbar`, navigation menus, and a `UHeader` example on the home page ([nui/app/layouts/default.vue](nui/app/layouts/default.vue), [nui/app/pages/index.vue](nui/app/pages/index.vue)).
- **Theming mechanics**: `src` fetches a remote `UiConfig` and mutates color mode with custom `modes` and `attribute: 'theme'` via `useColorMode` ([src/app/composables/useUiConfig.ts](src/app/composables/useUiConfig.ts)); `nui` relies on default Nuxt UI/unocss theming.

## Avenues to Explore
1. **Color-mode/theming recursion**: Verify whether `useUiConfig` + custom color modes (`attribute: 'theme'`, nonstandard mode IDs) interacts badly with Nuxt UI’s token resolution or `UHeader` client hydration. Temporarily disable the dynamic theme init or force a static mode to see if the overflow disappears.
2. **Global CSS/tooling collisions**: `src` ships Tailwind 4 preview and multiple CSS files (`assets/css/app.css`, `assets/themes/Themes.css`) vs `nui`’s single `main.css`. Check for global selectors or resets affecting `UHeader` internals or causing infinite CSS variable fallbacks.
3. **Wrapper structure**: In `src`, `ThemeFooter` is teleported outside `UApp` and `UHeader` lives inside an `auth-layout` that also renders a `UFooter`. Confirm whether multiple root-level wrappers or teleport overlays trigger layout effects/ResizeObservers that recurse.
4. **Module/version drift**: Compare exact versions (`nuxt` pinned vs caret, `@nuxt/ui` pinned, `@nuxt/scripts` absent, Cloudflare nitro preset present). Reproduce with `nui`’s dependency set inside `src` (or vice versa) to isolate a version/config interaction.
5. **Page-level reproduction**: Drop the `nui` home page `UHeader` snippet into `src` without `useUiConfig`/auth layout to see if minimal usage still overflows. If not, layer back `useUiConfig`, then the `auth-layout`, then `ThemeFooter` to find the trigger.
6. **Runtime extensions**: `src` enables `@nuxtjs/i18n`, `@nuxtjs/google-fonts`, Supabase auth, vue-query, and custom aliases. Validate whether any plugin injects providers or global mixins that could affect component instantiation (e.g., repeated renders, infinite watchers).
7. **Browser-only instrumentation**: Since the bug is client-only, reproduce in dev with source maps and capture the stack trace (call stack in devtools) to see if overflow stems from `useColorMode`, an injected plugin, or a Nuxt UI composable.

## Next Steps (no code changes yet)
- Reproduce the stack overflow with devtools open and collect the call stack + component tree.
- Toggle off dynamic theme init (`useUiConfig`) and extra modules one by one to spot the offending interaction.
- Align `src` runtime with `nui` (temporarily remove Tailwind 4/global CSS, switch compatibilityDate, disable Cloudflare preset) to see when the issue clears.
