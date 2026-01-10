# MCP setup (Context7 + Playwright)

This repo includes a workspace MCP configuration in `.vscode/mcp.json`.

## What you get

- **Context7**: up-to-date library documentation and examples in Copilot Chat.
- **Playwright MCP**: browser automation tools to open pages, click, fill forms, capture screenshots, etc.

## How to enable in VS Code

1. Open the Chat view.
2. Open the tool picker and enable tools for:
   - `context7`
   - `playwright`
3. If prompted, approve and trust the MCP servers.

## Using Context7

- Add `use context7` to prompts when you want library/API docs.
- If you know a Context7 library ID, include it (example): `use library /vercel/next.js`.

If you provided an API key when VS Code first prompted, it’s stored securely by VS Code.

## Using Playwright MCP

Ask Copilot to do things like:

- "Open https://example.com and take a full-page screenshot"
- "Go to our local dev site and verify the login form renders"
- "Click the 'Sign in' button and report any console errors"

By default the MCP server runs headless and writes artifacts under `.mcp/playwright/`.

## Troubleshooting

- Run **MCP: List Servers** → select a server → **Show Output** to view logs.
- If tools don’t appear, run **MCP: Reset Cached Tools**.
