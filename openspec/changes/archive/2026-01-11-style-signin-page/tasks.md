## 1. Implementation
- [x] 1.1 Update the mentor sign-in page UI to use Nuxt UI components (card, form groups, inputs, buttons, alerts) aligned with the `/login` look.
- [x] 1.2 Switch the page to use `auth-layout` and ensure the page itself contains no navigation links/menus.
- [x] 1.3 Replace the browser `alert()` with an inline sign-in notification panel rendered below the form.
- [x] 1.4 On successful sign-in: clear inputs and programmatically focus the username field.
- [x] 1.5 Keep the sign-in notification panel visible after success until the username input value changes (including typing or pasting).
- [x] 1.6 Hide the session stats component for now (future feature).

## 2. Manual Checks
- [ ] 2.1 Navigate to the mentor sign-in page and confirm the UI matches the Nuxt UI styling approach used by `/login`.
- [ ] 2.2 Sign in successfully and confirm: notification panel shows, form clears, focus returns to username.
- [ ] 2.3 Start typing/pasting the next username and confirm the notification panel disappears on the first change.
