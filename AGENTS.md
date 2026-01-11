<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Important: Run all `openspec` commands from the repository root (the folder containing `openspec/`), not from `src/`. If you run from `src/`, the CLI may report missing `openspec/changes`.

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Project Notes

- UI library: This repo uses `@nuxt/ui` version **4.3.0 or greater**. When looking up component APIs/slots (e.g. dashboard components), use the Nuxt UI v4 documentation.