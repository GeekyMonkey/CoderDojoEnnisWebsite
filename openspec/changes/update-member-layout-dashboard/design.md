## Context
The signed-in member area currently uses a very simple layout that provides no navigational structure beyond what each page implements. The project already uses Nuxt UI and has role information available via Supabase user metadata (mentor/parent/coder).

This change introduces a Nuxt UI dashboard-style shell for member pages, inspired by the Nuxt UI dashboard template, while remaining aligned with the project’s existing theme and i18n patterns.

## Goals / Non-Goals

### Goals
- Provide a consistent member app shell with left navigation.
- Ensure the left navigation is responsive: persistent sidebar on desktop and a hamburger-triggered drawer on mobile.
- Provide a user menu in the sidebar footer with:
  - Theme selection
  - Language selection
  - Profile (placeholder)
  - Logout
- Render role-based navigation items using Supabase user metadata.
- Make it safe to add placeholders for future features.

### Non-Goals
- Implementing the feature pages behind placeholder items.
- Changing the overall authentication/session model.

## Decisions

### Use Nuxt UI Dashboard Components
Use Nuxt UI’s dashboard components as the primary building blocks (e.g., dashboard layout, sidebar, navbar, panels) to reduce custom CSS and match the Nuxt UI template.

### Single Navigation Model, Filtered by Role
Define a single navigation model (groups + links) and filter it at runtime based on the current user’s roles:
- Mentor: `isMentor === true`
- Parent: `isParent === true`
- Coder: `isNinja === true`

The filtering should support:
- Showing or hiding entire groups
- Showing or disabling individual links as placeholders

### Keep Routes Under Role Prefixes
To stay compatible with existing auth middleware patterns, member routes remain under top-level prefixes (`/mentor`, `/parent`, `/coder`). Placeholder routes should also live under these prefixes.

### User Menu Implementation
Implement the user menu as a Nuxt UI dropdown/menu component in the sidebar footer.
- Theme and language actions should reuse existing selection components/logic.
- Logout should route to the existing `/logout` page (auth layout), which signs out and redirects.

## Risks / Trade-offs
- Nuxt UI dashboard components can evolve; keep usage minimal and avoid deep customization.
- Role-based navigation must not leak links that lead to authorization failures; placeholders should be clearly disabled.

## Migration Plan
- Replace the current member layout.
- Introduce a navigation configuration and a role filter.
- Add placeholder pages where needed so navigation does not lead to 404.

## Open Questions
- For parent and coder roles, what are the initial “must-have” navigation items (beyond a basic Home link)?
- Should “Sign In Mode” navigate to the existing `/mentor/SignIn` page, or should it be embedded into the member dashboard shell?
- Should placeholder items be disabled-only, or should they navigate to a “Coming soon” placeholder page?
