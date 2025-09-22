# CoderDojo Ennis Website Constitution

## Core Principles

### I. Framework-First
All new features MUST be implemented as Vue/Nuxt components unless static content is required. The project is built on Nuxt 4 (Vue 3), with static HTML content in `src/public` and a structure ready for future expansion using Vue/Nuxt components.

### II. CLI & Automation
Development and deployment MUST be managed via CLI commands (`yarn install`, `yarn dev`, `yarn build`, etc.). Automated deployment occurs on commit to master.

### III. Test-First Discipline (NON-NEGOTIABLE)
Testing MUST be enforced via `vitest`. TDD is optional per feature phase: tests MUST be written before implementation. Red-Green-Refactor cycle strictly enforced.

### IV. Integration & Contracts
Integration with Supabase, Cloudflare Workers, and other services MUST be managed via configuration files and environment variables. API contracts and data models MUST be defined in the backend and shared via TypeScript interfaces.

### V. Observability & Versioning
Logging and error handling MUST be present in the Nuxt config and backend. Semantic versioning MUST be used for constitution and package releases.

### VI. Simplicity & Maintainability
Code MUST be clean, well-documented, and follow best practices. Complexity MUST be minimized; features should be as simple as possible while meeting requirements. Code reviews MUST focus on maintainability and readability. Care should be taken to avoid duplicate solutions to the same problem. Code reuse is important.

## Additional Constraints
Technology Stack: Nuxt 4, Vue 3, TailwindCSS, Supabase, Cloudflare Workers, Drizzle ORM, TypeScript.
Compliance: MIT license, public contributions via PR.
Deployment: Static hosting via Cloudflare Pages, automated on master branch commit.

## Development Workflow
Code Review: PRs required for changes, with review and approval.
Quality Gates: Linting, formatting, and tests MUST pass before merge.
Continuous Integration: Automated build and deploy pipeline.

## Governance

This constitution supersedes all other practices. Amendments require documentation, approval, and a migration plan. All PRs/reviews MUST verify compliance with principles. Versioning follows semantic rules (major/minor/patch).

<!--
Sync Impact Report
Version change: 1.0.0 → 1.1.0
Modified principles: All principle names and descriptions updated for project context
Added sections: Additional Constraints, Development Workflow
Removed sections: None
Templates requiring updates:
	✅ plan-template.md
	✅ spec-template.md
	✅ tasks-template.md
	⚠ commands/ (directory missing, manual check required)
Follow-up TODOs:
	TODO(RATIFICATION_DATE): Original adoption date required
-->

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date required | **Last Amended**: 2025-09-22