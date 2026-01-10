# Project Context

## Purpose
CoderDojo Ennis Website is a modern, maintainable platform for managing CoderDojo club activities, attendance, member data, and public information. It aims to provide a secure, scalable, and user-friendly experience for club members, mentors, and parents, with robust integration to external services.

## Tech Stack
- Nuxt 4 (Vue 3)
- NuxtUI (UI components)
- TypeScript
- Supabase (database & auth)
- Cloudflare Workers (serverless backend)
- Vitest (testing)
- pnpm (package management)
- Static HTML (for legacy/public pages)
- TailwindCSS (used sparingly, only in reusable components)

## Project Conventions

## Repository Layout
- All active implementation changes MUST be made under `src/`.
- `src_legacy/` is strictly reference material for the previous solution's features and SHOULD NOT be modified (except for occasional documentation notes if explicitly requested).
- `nui/` is strictly reference material for a clean Nuxt UI setup and SHOULD NOT be modified.

### Code Style
Use TypeScript for all new code.
Vue/Nuxt components for all features (unless static HTML is required).
Use NuxtUI for UI components.
TailwindCSS used sparingly, only in reusable components.
Prefer reusable CSS style classes over Tailwind or inline styles.
Clean, well-documented code; avoid duplication.
Semantic versioning for releases.
Linting and formatting enforced before merge.

### Architecture Patterns
Framework-first: All features as Vue/Nuxt components.
Static content in `src/public`.
API contracts and data models defined in backend, shared via TypeScript interfaces.
Configuration and environment variables for service integration.
Observability: Logging and error handling in Nuxt config and backend.

### Testing Strategy
Test-first discipline: Tests written before implementation.
Vitest for all unit/integration tests.
Red-Green-Refactor cycle enforced.
All tests, linting, and formatting must pass before merge.

### Git Workflow
PRs required for all changes; code review and approval mandatory.
Automated deployment on commit to master.
Quality gates: Lint, format, and test checks in CI pipeline.
Public contributions via PR; MIT license.

## Domain Context
CoderDojo club management: attendance, member data, badges, belts, teams.
Secure access for adults, mentors, parents, and members.
Integration with external APIs/services (Supabase, Cloudflare).

## Important Constraints
MIT license.
Static hosting via Cloudflare Pages.
Automated deployment on master branch commit.
Compliance with public contribution and review standards.

## External Dependencies
Supabase (database, authentication)
Cloudflare Workers (serverless backend)
TailwindCSS (used sparingly, only in reusable components)
NuxtUI (UI components)
Vitest (testing)
pnpm (package management)
