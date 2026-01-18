<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions

<!-- OPENSPEC:END -->

Important: Run all `openspec` commands from the repository root (the folder containing `openspec/`), not from `src/`. If you run from `src/`, the CLI may report missing `openspec/changes`

# Project Notes

- UI library: This repo uses `@nuxt/ui` version **4.3.0 or greater**. When looking up component APIs/slots (e.g. dashboard components), use the Nuxt UI v4 documentation
- Data access pattern: for new UI features and specs, page/components SHOULD perform API interactions via functions exposed by the relevant client-side stores (rather than calling APIs directly) so stores can own caching, invalidation, and realtime refresh behavior
- API testing: any new API endpoint added under `src/server/api/**` SHOULD have a corresponding Bruno request added under `bruno/` (for example under `bruno/CoderDojoEnnisApis/**`). The `seq` value in `.bru` files is optional and can be omitted
- Command policy: during agentic coding steps, do NOT run `pnpm -C src format` or `pnpm -C src test` automatically. The user will run these manually

# Coding Conventions
- Vue
  - Use `<script setup lang="ts">` syntax for all new Vue components and pages
  - Use `defineProps` and `defineEmits` for component props and events
  - Use `<style scoped lang="scss">` for component-specific styles unless styles must be global
  - Prefer computed properties and computed dictionaries over methods for template data access
  - Component properties should be specified in camelCase not kebab-case when possible

- TypeScript (including Vue scripts)
  - Use `type` aliases for object shapes and union types
  - Use `PascalCase` for types and interfaces
  - Use `camelCase` for variables, functions, and methods
  - Use `UPPER_SNAKE_CASE` for constants
  - All functions and variables MUST have explicit TypeScript types
  - All functions should have simple comments describing their purpose. Do not add params or return comments
  - Order of elements in a script: imports, props, emits, types, constants, refs/reactive, computed, properties, functions, lifecycle hooks, watchers

- CSS
  - Prefer using custom CSS classes over inline styles or tailwind utility classes in templates
  - Use css variables for colors, font sizes, and spacing where possible.

- Translations (json files under `src/locales/`)
  - Keep translation strings concise and clear
  - Try to prevent duplication of strings by using object type categorization
  - Alphabetize all categories and keys