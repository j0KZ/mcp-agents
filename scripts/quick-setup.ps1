# ============================================
# MCP Tools + Universal Skills Quick Setup
# ============================================
# PowerShell version for Windows users
# ============================================

$ErrorActionPreference = "Stop"

# Colors
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Yellow }

Write-Success @"
╔════════════════════════════════════════╗
║   MCP Tools + Skills Quick Setup       ║
╚════════════════════════════════════════╝
"@

# Check for Node.js
try {
    $nodeVersion = node --version
    Write-Success "✓ Node.js detected: $nodeVersion"
} catch {
    Write-Error "❌ Node.js is not installed!"
    Write-Host "Please install Node.js 18+ from https://nodejs.org"
    exit 1
}

# Step 1: Install MCP Tools
Write-Info "`nStep 1: Installing MCP Tools..."
Write-Host "This will configure your AI editor with 10 MCP tools`n"

try {
    npx @j0kz/mcp-agents@latest
    Write-Success "✅ MCP Tools installed successfully!"
} catch {
    Write-Error "❌ MCP Tools installation failed"
    exit 1
}

# Step 2: Ask about Universal Skills
Write-Info "`nStep 2: Universal Skills Documentation"
Write-Host "Would you like to download the universal skills guides?"
Write-Host "These are 10 markdown guides for common development tasks.`n"

$downloadSkills = Read-Host "Download universal skills? (y/N)"

if ($downloadSkills -eq 'y' -or $downloadSkills -eq 'Y') {
    Write-Info "Downloading universal skills..."

    # Create directory
    New-Item -ItemType Directory -Force -Path ".claude/universal-skills" | Out-Null

    $skills = @(
        "quick-pr-review",
        "debug-detective",
        "performance-hunter",
        "legacy-modernizer",
        "zero-to-hero",
        "test-coverage-boost",
        "tech-debt-tracker",
        "dependency-doctor",
        "security-first",
        "api-integration"
    )

    $baseUrl = "https://raw.githubusercontent.com/j0KZ/mcp-agents/main/.claude/universal-skills"

    # Download INDEX.md
    Invoke-WebRequest -Uri "$baseUrl/INDEX.md" -OutFile ".claude/universal-skills/INDEX.md"

    # Download each skill
    foreach ($skill in $skills) {
        Write-Host "  Downloading $skill..."
        New-Item -ItemType Directory -Force -Path ".claude/universal-skills/$skill" | Out-Null
        Invoke-WebRequest -Uri "$baseUrl/$skill/SKILL.md" -OutFile ".claude/universal-skills/$skill/SKILL.md"
    }

    Write-Success "✅ Universal skills downloaded to .claude/universal-skills/"
} else {
    Write-Host "Skipping universal skills download."
    Write-Host "`nYou can always view them online at:"
    Write-Host "https://github.com/j0KZ/mcp-agents/tree/main/.claude/universal-skills"
}

# Step 3: Create quick reference
Write-Info "`nCreating quick reference file..."

@'
# MCP Tools & Skills Quick Reference

## Installed MCP Tools (10)

Use these by asking your AI naturally:
- "Review this file for issues"
- "Generate tests for this function"
- "Find security vulnerabilities"
- "Check for circular dependencies"
- "Design a REST API for users"
- "Create database schema"
- "Generate documentation"
- "Refactor this code"
- "Run complete code quality check"
- "Start auto-pilot mode"

## Universal Skills (10)

Located in `.claude/universal-skills/`:
1. **quick-pr-review** - Pre-PR checklist
2. **debug-detective** - Systematic debugging
3. **performance-hunter** - Find bottlenecks
4. **legacy-modernizer** - Modernize old code
5. **zero-to-hero** - Master any codebase
6. **test-coverage-boost** - Increase coverage
7. **tech-debt-tracker** - Manage technical debt
8. **dependency-doctor** - Fix package issues
9. **security-first** - Security checklist
10. **api-integration** - Connect to APIs

## Quick Commands

```bash
# Check MCP tools status
"Check MCP server status"

# Use a skill
"Apply the debug-detective skill to find this bug"

# Run security audit
"Run security-first checklist"
```

## Need Help?

- MCP Tools Docs: https://github.com/j0KZ/mcp-agents/wiki
- Universal Skills: .claude/universal-skills/INDEX.md
- Report Issues: https://github.com/j0KZ/mcp-agents/issues
'@ | Out-File -FilePath "mcp-quick-reference.md" -Encoding UTF8

Write-Success "✅ Created mcp-quick-reference.md"

# Final summary
Write-Success @"

╔════════════════════════════════════════╗
║        ✅ Setup Complete!              ║
╚════════════════════════════════════════╝
"@

Write-Host "`nWhat's been set up:"
Write-Host "  ✅ MCP Tools configured in your AI editor"

if ($downloadSkills -eq 'y' -or $downloadSkills -eq 'Y') {
    Write-Host "  ✅ Universal skills downloaded locally"
}

Write-Host "  ✅ Quick reference guide created"
Write-Info "`n⚠️  IMPORTANT: Restart your AI editor to load MCP tools`n"

Write-Host "To get started:"
Write-Host "  1. Restart your editor (Claude/Cursor/Windsurf)"
Write-Host '  2. Try: "Review my package.json"'
Write-Host "  3. Read: mcp-quick-reference.md`n"

Write-Success "Happy coding! 🚀"