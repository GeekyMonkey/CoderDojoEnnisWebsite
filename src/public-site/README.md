# Public-site scripts

Static-page legacy hash navigation. The new `/showcase` page is a Vue page using TanStack stores and live updates; the automatic GitHub directory has been removed.

Rebuild this small navigation bundle from the repository root:

```powershell
pnpm -C src exec esbuild public-site/public-site.ts --bundle --target=es2022 --outfile=public/js/public-site.js
```
