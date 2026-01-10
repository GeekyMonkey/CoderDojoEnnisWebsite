# CoderDojo Ennis Public Website

This is the publicly visible information about our Dojo.

The source code is built on the Nuxt 4 framework.  But the actual content is not taking advantage of this.  It is simply static html, styles, and iamges in the /src/public folder.

Feel free to make content changes or more major changes to actual Vue/Nuxt components.  Pull Requests welcome.

## Getting started (developers)

This repo uses pnpm workspaces. The Nuxt app lives under `src/`.

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

See `docs/mcp.md`.
