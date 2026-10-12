# Dependency security fixes on develop

Overrides install simple-git 4.0.2 and @simple-git/argv-parser 2.0.1 for Nuxt DevTools, and esbuild 0.28.2 for fontless. DevTools remains disabled in Nuxt configuration.

Two upstream dependencies have no published patched release as of 2026-10-12:

- `braces@3.0.3`: bound parsed brace nesting to 64 levels before recursive AST visitors can exhaust the stack. Normal glob expansion is preserved. Advisory: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- `node-forge@1.4.0`: require the nested DigestAlgorithm sequence to contain only its algorithm identifier and optional parameters. This extends the existing outer DigestInfo element-count validation. Normal RSA signature verification is preserved. Advisory: https://github.com/advisories/GHSA-86w9-cpqp-85rv

pnpm applies the tracked patches during installation. Run `node scripts/check-dependency-patches.cjs` from the repository root to verify installation, normal behavior, and rejection of both attack inputs. Replace these patches with upstream fixes when published.

`pnpm audit` still reports these two original package versions because it does not inspect local patches. No advisories are suppressed. Its remaining moderate `sprintf-js` finding comes through `@types/mssql`/`tedious`, used by the retained legacy SQL adapter. That adapter and legacy dependencies were left unchanged under the requested scope.
