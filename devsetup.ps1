# One-time dev machine setup for this repo.
# Installs Biome globally (used by formatting scripts).
#
# Usage (PowerShell):
#   ./devsetup.ps1

$ErrorActionPreference = 'Stop'

function Require-Command([string]$Name) {
	if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
		throw "Required command '$Name' was not found in PATH. Install it first."
	}
}

Require-Command 'pnpm'

Write-Host "==> Ensuring pnpm global bin directory is configured" -ForegroundColor Cyan
try {
	# On a fresh machine pnpm may not have a global bin dir configured.
	# 'pnpm setup' creates PNPM_HOME and updates shell config.
	pnpm setup | Out-String | Write-Host
}
catch {
	Write-Warning "pnpm setup failed or is not supported in this environment: $($_.Exception.Message)"
	Write-Warning "If the next step fails with ERR_PNPM_NO_GLOBAL_BIN_DIR, run 'pnpm setup' manually, restart your terminal, and re-run this script."
}

Write-Host "==> Installing Biome globally" -ForegroundColor Cyan
pnpm add -g @biomejs/biome

Write-Host "==> Done" -ForegroundColor Green
Write-Host "If this was your first time running 'pnpm setup', restart your terminal so PNPM_HOME is on PATH." -ForegroundColor Yellow
