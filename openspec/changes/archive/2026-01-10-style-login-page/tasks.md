## 1. Implementation
- [x] 1.1 Confirm desired UX parity: keep/remove password show/hide toggle.
- [x] 1.2 Update [src/app/pages/(auth)/login.vue](src/app/pages/(auth)/login.vue) template to use `UPageCard` + `UAuthForm` (Nuxt UI AuthForm pattern).
- [x] 1.3 Keep the existing login submission logic intact (same endpoint, same payload shape, same redirect path).
- [x] 1.4 Use `UAuthForm` validation integration (schema/validate) while preserving current validation rules and messages where practical.
- [x] 1.5 Replace plain error rendering with a Nuxt UI alert (`UAlert`) via `UAuthForm` `validation` slot or equivalent.

## 2. Validation
- [x] 2.1 Manual smoke test:
  - Navigate to `/login` and confirm layout renders within `auth-layout`.
  - Submit invalid inputs and confirm validation shows.
  - Submit valid credentials and confirm redirect to `/logged_in` still occurs.
  - Confirm login failure shows the same `result.error` message content.
- [x] 2.2 Run formatting/lint/test as available for the workspace (exact commands to follow existing repo practice).
  - `pnpm exec vitest run`
  - Note: `pnpm exec biome format` reports `i18n/locales/*.ts` ignored by Biome config in this workspace.
