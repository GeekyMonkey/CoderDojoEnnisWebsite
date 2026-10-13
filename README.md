# CoderDojo Ennis Website and Member App

Public dojo information and authenticated coder, parent and mentor portals, built with Nuxt 4, Nuxt UI 4 and Supabase. The public information site currently uses static HTML under `src/public/`; the member portals use Vue components, store-backed APIs and Postgres workflows.

- [Expected app features and implementation status](docs/app-features.md)
- [Proposed per-table RLS and data-access rules](openspec/changes/secure-role-based-data-access/proposal.md)
- [Final legacy discrepancy list](openspec/changes/replicate-legacy-features/final-parity-discrepancies.md)
- [Field, action and database coverage ledger](openspec/changes/replicate-legacy-features/final-parity-coverage.md)
- [Master legacy implementation checklist](openspec/changes/replicate-legacy-features/tasks.md)
- [Historical legacy feature notes](docs/legacy/previous-features.md)

The core role portals are implemented; the final audit records remaining behavioral, integration and database-access gaps. See the feature document before treating app-wide legacy parity as complete.

## Getting started (developers)

This repo uses pnpm workspaces. The Nuxt app lives under `src/`.

Use Node 24 LTS, version 24.15.0 or newer within the 24.x line. The repository pins 24.21.0 in `.node-version` and `.nvmrc`; this release has passed the three-day cooldown. Build environments, including Cloudflare Pages, should use the same version.

With fnm installed, run these commands from the repository root in PowerShell:

```powershell
fnm install
fnm use
node --version
```

pnpm requires dependency releases to be at least 4,320 minutes (three days) old. This also applies when verifying an existing lockfile: installs and builds can be blocked if pinned releases are still cooling down. Existing version-specific exceptions are listed in `pnpm-workspace.yaml`; do not add broad package exceptions for routine updates.

### One-time setup (Biome)

We use Biome for formatting. Some environments (e.g. Cloudflare Pages) don't support `pnpm add -g` during install, so we do **not** rely on package install hooks to install Biome globally.

Run this once on your dev machine:

1. From the repo root, run `./devsetup.ps1`

If `pnpm setup` was needed, restart your terminal after running it so `PNPM_HOME` is on your `PATH`.

### Typical workflow

- Install deps: `pnpm install`
- Dev server: `pnpm dev`
- Build: `pnpm build`
- Format: `pnpm format`

### MCP (Docs + browser automation)

This workspace includes MCP server configuration for:

- Context7 (up-to-date library docs in Copilot Chat)
- Playwright MCP (browser automation for quick UI checks)

See [docs/agents/mcp.md](docs/agents/mcp.md).
