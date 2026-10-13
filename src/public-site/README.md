# Public-site scripts

TypeScript source for the static public site's existing GitHub directory and legacy modal bookmarks. The generated bundle is committed so static HTML works without the Nuxt application.

From the repository root (including PowerShell):

```powershell
pnpm -C src exec esbuild public-site/public-site.ts --bundle --target=es2022 --outfile=public/js/public-site.js
```

The directory store owns fetching, caching, validation, and request state. The page code renders text nodes and validated GitHub links. These scripts do not modify styles or member application behavior.
