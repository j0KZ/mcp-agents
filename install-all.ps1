# Install all 8 @j0kz MCP agents for Claude Code (PowerShell)

Write-Host "🚀 Installing all 8 @j0kz MCP Development Tools..." -ForegroundColor Cyan
Write-Host ""

# Array of all MCPs
$mcps = @(
    @{name="smart-reviewer"; package="@j0kz/smart-reviewer-mcp"},
    @{name="test-generator"; package="@j0kz/test-generator-mcp"},
    @{name="architecture-analyzer"; package="@j0kz/architecture-analyzer-mcp"},
    @{name="doc-generator"; package="@j0kz/doc-generator-mcp"},
    @{name="security-scanner"; package="@j0kz/security-scanner-mcp"},
    @{name="refactor-assistant"; package="@j0kz/refactor-assistant-mcp"},
    @{name="api-designer"; package="@j0kz/api-designer-mcp"},
    @{name="db-schema"; package="@j0kz/db-schema-mcp"}
)

# Install each MCP
foreach ($mcp in $mcps) {
    Write-Host "📦 Installing $($mcp.name)..." -ForegroundColor Green
    claude mcp add $mcp.name "npx $($mcp.package)" --scope user
}

Write-Host ""
Write-Host "✅ All 8 @j0kz MCPs installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 You can now use them in Claude Code:"
Write-Host "   - Ask to 'review my code'"
Write-Host "   - Ask to 'generate tests'"
Write-Host "   - Ask to 'analyze architecture'"
Write-Host "   - And more!"
Write-Host ""
Write-Host "📋 Check installation: claude mcp list"
