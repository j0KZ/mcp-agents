# Windows Setup Guide

Complete setup instructions for Windows users.

## Prerequisites

1. **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
2. **npm**: Comes with Node.js
3. **Claude Code CLI**: Install from [Anthropic](https://claude.ai/claude-code)

## Installation Steps

### 1. Open PowerShell or Command Prompt

```powershell
# Navigate to your projects directory
cd D:\Users\j0KZ\Documents\Coding
```

### 2. Clone or Copy Project

If you have this as a git repository:
```powershell
git clone <your-repo-url> my-claude-agents
cd my-claude-agents
```

If you already have the folder:
```powershell
cd my-claude-agents
```

### 3. Install Dependencies

```powershell
npm install
```

### 4. Build All Agents

```powershell
npm run build
```

**Expected output:**
```
> my-claude-agents@1.0.0 build
> npm run build --workspaces

Building smart-reviewer... ✓
Building test-generator... ✓
Building architecture-analyzer... ✓
```

### 5. Install Globally for Claude Code

```powershell
npm run install-global
```

**Expected output:**
```
🚀 Installing My Claude Agents globally...

📁 Creating config directory...
🔨 Building all agents...
✅ Build completed

📝 Registering MCP servers...
  ✅ smart-reviewer
  ✅ test-generator
  ✅ architecture-analyzer

✅ Configuration saved to: C:\Users\<YourUser>\.config\claude-code\mcp_config.json

✨ Installation complete!
```

### 6. Verify Installation

```powershell
node scripts\verify-setup.js
```

**Expected output:**
```
✅ MCP config file found and valid

📊 Agent Status:
  ✅ smart-reviewer
  ✅ test-generator
  ✅ architecture-analyzer

✨ All agents are properly configured and built!
```

## Windows-Specific Configuration

### Config File Location

The MCP configuration is stored at:
```
C:\Users\<YourUser>\.config\claude-code\mcp_config.json
```

### Manual Configuration (if needed)

If automatic installation fails, manually edit the config file:

```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "node",
      "args": ["D:\\Users\\j0KZ\\Documents\\Coding\\my-claude-agents\\packages\\smart-reviewer\\dist\\mcp-server.js"],
      "description": "Smart Code Reviewer"
    },
    "test-generator": {
      "command": "node",
      "args": ["D:\\Users\\j0KZ\\Documents\\Coding\\my-claude-agents\\packages\\test-generator\\dist\\mcp-server.js"],
      "description": "Test Intelligence Generator"
    },
    "architecture-analyzer": {
      "command": "node",
      "args": ["D:\\Users\\j0KZ\\Documents\\Coding\\my-claude-agents\\packages\\architecture-analyzer\\dist\\mcp-server.js"],
      "description": "Architecture Analyzer"
    }
  }
}
```

**Important**: Use double backslashes (`\\`) in paths for Windows!

## Testing the Installation

### Test Each Agent

```powershell
# Navigate to any project
cd D:\Users\j0KZ\Documents\Coding\YourProject

# Test Smart Reviewer
claude code "Review src/app.js with smart-reviewer"

# Test Test Generator
claude code "Generate tests for src/utils.js with test-generator"

# Test Architecture Analyzer
claude code "Analyze architecture with architecture-analyzer"
```

## Troubleshooting Windows Issues

### Issue: "command not found: node"

**Solution:**
1. Ensure Node.js is installed
2. Add Node.js to PATH:
   - Search "Environment Variables" in Windows
   - Edit "Path" variable
   - Add: `C:\Program Files\nodejs\`
3. Restart PowerShell

### Issue: "Access Denied" during installation

**Solution:**
Run PowerShell as Administrator:
1. Right-click PowerShell
2. Select "Run as Administrator"
3. Run installation again

### Issue: Scripts cannot be loaded (Execution Policy)

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Paths with spaces causing problems

**Solution:**
Use quotes around paths:
```powershell
cd "D:\My Projects\my-claude-agents"
```

### Issue: MCP config not found

**Solution:**
Create directory manually:
```powershell
mkdir $env:USERPROFILE\.config\claude-code
```

Then run installation again.

### Issue: Agents not appearing in Claude Code

**Solution:**
1. Close Claude Code completely
2. Reopen Claude Code
3. Run: `claude mcp list` to verify
4. If still not showing, check config file exists and is valid JSON

## Updating Agents

### Pull Latest Changes
```powershell
cd D:\Users\j0KZ\Documents\Coding\my-claude-agents
git pull origin main
```

### Rebuild and Reinstall
```powershell
npm run build
npm run install-global
```

### Verify Update
```powershell
node scripts\verify-setup.js
```

## Uninstalling

```powershell
cd D:\Users\j0KZ\Documents\Coding\my-claude-agents
npm run uninstall-global
```

To completely remove:
```powershell
# Delete the project folder
rm -r D:\Users\j0KZ\Documents\Coding\my-claude-agents

# Delete config (optional)
rm $env:USERPROFILE\.config\claude-code\mcp_config.json
```

## PowerShell Aliases (Optional)

Add to your PowerShell profile (`$PROFILE`):

```powershell
# Open profile
notepad $PROFILE

# Add these aliases
function ccr { claude code "Review modified files with smart-reviewer" }
function cct { claude code "Generate tests for modified files" }
function cca { claude code "Check architecture for issues" }
function ccq { claude code "Full quality check" }
```

Reload profile:
```powershell
. $PROFILE
```

Now you can use:
```powershell
ccr  # Quick review
cct  # Quick test generation
cca  # Quick architecture check
ccq  # Full quality check
```

## Windows Subsystem for Linux (WSL)

If you prefer using WSL:

```bash
# In WSL terminal
cd /mnt/d/Users/j0KZ/Documents/Coding/my-claude-agents
npm install
npm run build
npm run install-global
```

Config will be at: `~/.config/claude-code/mcp_config.json`

## Next Steps

1. Read [Quick Start Guide](docs/QUICK_START.md)
2. Try [Sample Commands](docs/examples/sample-commands.sh)
3. Explore [Workflow Examples](docs/examples/WORKFLOW_EXAMPLES.md)
4. Set up [Git Hooks](docs/GIT_INTEGRATION.md) (Windows compatible)

## Support

- Windows-specific issues: Create issue with "Windows" tag
- General help: See main [README](README.md)
- Example commands: [sample-commands.sh](docs/examples/sample-commands.sh)

## Tips for Windows Users

1. **Use PowerShell**: Better than Command Prompt for npm scripts
2. **WSL Option**: Consider WSL for Unix-like experience
3. **Path Issues**: Always use double backslashes in JSON configs
4. **Git Bash**: Alternative to PowerShell if you prefer Unix commands
5. **Admin Rights**: Some operations may require admin privileges

---

**Congratulations!** Your MCP agents are now globally available in Claude Code on Windows! 🎉
