# Auto-installer for My Claude Agents (Windows PowerShell)
# Usage: iwr https://YOUR-URL/auto-install.ps1 | iex

$ErrorActionPreference = "Stop"

Write-Host "🚀 My Claude Agents - Auto Installer" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$RepoUrl = "https://github.com/YOUR-USERNAME/my-claude-agents.git"
$InstallDir = "$env:USERPROFILE\.claude-agents"

# Check prerequisites
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

if (-not (Test-Command node)) {
    Write-Host "❌ Node.js is required but not installed. Visit https://nodejs.org/" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command git)) {
    Write-Host "❌ Git is required but not installed." -ForegroundColor Red
    exit 1
}

if (-not (Test-Command claude)) {
    Write-Host "❌ Claude Code CLI is required. Visit https://claude.ai/code" -ForegroundColor Red
    exit 1
}

# Install or update
if (Test-Path $InstallDir) {
    Write-Host "📦 Found existing installation, updating..." -ForegroundColor Yellow
    Set-Location $InstallDir
    git pull origin main
} else {
    Write-Host "📦 Cloning repository..." -ForegroundColor Yellow
    git clone $RepoUrl $InstallDir
    Set-Location $InstallDir
}

# Build
Write-Host ""
Write-Host "🔨 Building MCP agents..." -ForegroundColor Yellow
npm install
npm run build

# Verify build
Write-Host ""
Write-Host "✅ Verifying builds..." -ForegroundColor Green
$packages = @("smart-reviewer", "test-generator", "architecture-analyzer")
foreach ($pkg in $packages) {
    $serverPath = "packages\$pkg\dist\mcp-server.js"
    if (Test-Path $serverPath) {
        Write-Host "  ✓ $pkg built successfully" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $pkg build failed" -ForegroundColor Red
        exit 1
    }
}

# Add to Claude Code (user scope)
Write-Host ""
Write-Host "🔗 Adding MCPs to Claude Code (user scope)..." -ForegroundColor Yellow

$installPath = (Get-Location).Path
foreach ($pkg in $packages) {
    $serverPath = "$installPath\packages\$pkg\dist\mcp-server.js"
    try {
        claude mcp add $pkg node $serverPath --scope user 2>$null
        Write-Host "  ✓ $pkg added" -ForegroundColor Green
    } catch {
        Write-Host "  (warning: $pkg already exists, skipping)" -ForegroundColor DarkYellow
    }
}

# Verify installation
Write-Host ""
Write-Host "📊 Verifying MCP connections..." -ForegroundColor Cyan
claude mcp list

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your MCPs are now available in ALL Claude Code sessions." -ForegroundColor White
Write-Host ""
Write-Host "To update later, run:" -ForegroundColor Cyan
Write-Host "  cd $InstallDir; git pull; npm run build" -ForegroundColor White
Write-Host ""
Write-Host "To remove:" -ForegroundColor Cyan
Write-Host "  claude mcp remove smart-reviewer --scope user" -ForegroundColor White
Write-Host "  claude mcp remove test-generator --scope user" -ForegroundColor White
Write-Host "  claude mcp remove architecture-analyzer --scope user" -ForegroundColor White
Write-Host "  Remove-Item -Recurse -Force $InstallDir" -ForegroundColor White
