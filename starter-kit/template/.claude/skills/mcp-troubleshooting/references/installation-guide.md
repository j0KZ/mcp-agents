# MCP Tools Installation Guide

Complete step-by-step installation guide for @j0kz/mcp-agents on all platforms and editors.

---

## Prerequisites

### Required Software

**Node.js (version 18+)**
```bash
# Check version
node --version

# Should output: v18.x.x or v20.x.x or higher
```

**Install Node.js:**
- **Windows:** Download from [nodejs.org](https://nodejs.org/) or `winget install OpenJS.NodeJS`
- **Mac:** `brew install node` or download from nodejs.org
- **Linux:** `sudo apt install nodejs npm` (Ubuntu/Debian)

**npm (comes with Node.js)**
```bash
# Check version
npm --version

# Should output: 9.x.x or higher
```

**npx (comes with npm 5.2+)**
```bash
# Check version
npx --version
```

---

## Quick Installation (Recommended)

### Install All 9 Tools at Once

**Claude Code:**
```bash
# Mac/Linux
curl -fsSL https://raw.githubusercontent.com/j0kz/mcp-agents/main/install-all.sh | bash

# Windows (PowerShell - Run as Administrator)
irm https://raw.githubusercontent.com/j0kz/mcp-agents/main/install-all.ps1 | iex
```

**What this does:**
1. Downloads installer script
2. Checks prerequisites (Node.js, npm)
3. Detects your editor (Claude Code, Cursor, Windsurf)
4. Locates config file
5. Adds all 9 MCP tools to config
6. Verifies installation

**Expected output:**
```
✓ Node.js detected: v20.10.0
✓ npm detected: 10.2.3
✓ Editor detected: Claude Code
✓ Config file: C:\Users\YourName\AppData\Roaming\Claude\claude_desktop_config.json
✓ Adding 9 MCP tools...
✓ Installation complete!

Next steps:
1. Restart Claude Code
2. Ask: "What MCP tools are available?"
```

---

## Individual Tool Installation

### Claude Code

**Method 1: CLI (Recommended)**
```bash
claude mcp add smart-reviewer "npx @j0kz/smart-reviewer-mcp" --scope user
claude mcp add test-generator "npx @j0kz/test-generator-mcp" --scope user
claude mcp add orchestrator "npx @j0kz/orchestrator-mcp" --scope user
# ... repeat for other tools
```

**Method 2: Manual Config Edit**

1. **Open config file:**
   - Windows: `%AppData%\Claude\claude_desktop_config.json`
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. **Add tools:**
   ```json
   {
     "mcpServers": {
       "smart-reviewer": {
         "command": "npx",
         "args": ["@j0kz/smart-reviewer-mcp"],
         "type": "stdio"
       },
       "test-generator": {
         "command": "npx",
         "args": ["@j0kz/test-generator-mcp"],
         "type": "stdio"
       },
       "orchestrator": {
         "command": "npx",
         "args": ["@j0kz/orchestrator-mcp"],
         "type": "stdio"
       }
     }
   }
   ```

3. **Save and restart Claude Code**

---

### Cursor

1. **Open config file:**
   ```bash
   # Mac/Linux
   ~/.cursor/mcp_config.json

   # Windows
   %USERPROFILE%\.cursor\mcp_config.json
   ```

2. **Add tools:**
   ```json
   {
     "mcpServers": {
       "smart-reviewer": {
         "command": "npx",
         "args": ["@j0kz/smart-reviewer-mcp"]
       },
       "test-generator": {
         "command": "npx",
         "args": ["@j0kz/test-generator-mcp"]
       }
     }
   }
   ```

3. **Save and restart Cursor**

**Note:** Cursor has native MCP support, no additional plugins needed.

---

### Windsurf

1. **Open config file:**
   ```bash
   # All platforms
   ~/.windsurf/mcp_config.json
   ```

2. **Add tools (same format as Cursor):**
   ```json
   {
     "mcpServers": {
       "smart-reviewer": {
         "command": "npx",
         "args": ["@j0kz/smart-reviewer-mcp"]
       }
     }
   }
   ```

3. **Save and restart Windsurf**

---

### VS Code (with Continue extension)

1. **Install Continue extension:**
   - Open VS Code
   - Extensions → Search "Continue"
   - Install

2. **Open Continue settings:**
   - Open Command Palette (Ctrl+Shift+P)
   - "Continue: Open Config"

3. **Add MCP tools:**
   ```json
   {
     "mcpServers": {
       "smart-reviewer": {
         "command": "npx",
         "args": ["@j0kz/smart-reviewer-mcp"]
       }
     }
   }
   ```

4. **Restart VS Code**

---

### Roo Code

1. **Check Roo Code documentation** for MCP config location

2. **Add tools (standard format):**
   ```json
   {
     "mcpServers": {
       "smart-reviewer": {
         "command": "npx",
         "args": ["@j0kz/smart-reviewer-mcp"]
       }
     }
   }
   ```

3. **Restart editor**

---

## Verification Steps

### Step 1: Restart Editor

**Important:** Close ALL windows, not just current tab

**How to fully restart:**
- **Windows:** Close all editor windows, check system tray for background processes
- **Mac:** Quit application (Cmd+Q), not just close window
- **Linux:** Kill all editor processes: `pkill -f "editor-name"`

---

### Step 2: Verify Tools Loaded

**Claude Code:**
```bash
# In terminal
claude mcp list

# Or ask in chat
"What MCP tools are available?"
```

**Expected output:**
```
Available MCP servers:
- smart-reviewer
- test-generator
- architecture-analyzer
- security-scanner
- api-designer
- db-schema
- doc-generator
- refactor-assistant
- orchestrator
```

**Other editors:**
Ask in chat: "What MCP tools do you have access to?"

---

### Step 3: Test a Tool

**Simple test:**
```
💬 You: "Review my package.json file"
🤖 AI: *Uses smart-reviewer tool*
```

**Expected behavior:**
- AI uses the MCP tool
- Returns analysis/results
- No "tool not found" errors

---

## Troubleshooting Installation

### Issue: "Node.js not found"

```bash
# Verify installation
node --version

# If not installed:
# Windows: winget install OpenJS.NodeJS
# Mac: brew install node
# Linux: sudo apt install nodejs npm

# Restart terminal after installation
```

---

### Issue: "Permission denied"

**Mac/Linux:**
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Retry installation
npx @j0kz/mcp-agents@latest
```

**Windows:**
```powershell
# Run PowerShell as Administrator
# Right-click PowerShell → "Run as Administrator"

# Then run installer
irm https://raw.githubusercontent.com/j0kz/mcp-agents/main/install-all.ps1 | iex
```

---

### Issue: "Config file not found"

**Create manually:**

**Claude Code (Windows):**
```powershell
# Create directory if needed
mkdir "$env:APPDATA\Claude"

# Create empty config
echo '{"mcpServers":{}}' > "$env:APPDATA\Claude\claude_desktop_config.json"
```

**Claude Code (Mac):**
```bash
# Create directory if needed
mkdir -p ~/Library/Application\ Support/Claude

# Create empty config
echo '{"mcpServers":{}}' > ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Cursor/Windsurf:**
```bash
# Create directory
mkdir -p ~/.cursor  # or ~/.windsurf

# Create empty config
echo '{"mcpServers":{}}' > ~/.cursor/mcp_config.json
```

---

### Issue: "Network timeout"

```bash
# Increase npm timeout
npm config set fetch-timeout 60000

# Try different registry
npm config set registry https://registry.npmjs.org/

# Retry
npx @j0kz/mcp-agents@latest
```

---

### Issue: "Tools installed but not working"

**1. Clear npm cache:**
```bash
npm cache clean --force

# Clear npx cache
rm -rf ~/.npm/_npx  # Mac/Linux
del /s /q "%APPDATA%\npm-cache\_npx"  # Windows
```

**2. Verify config syntax:**
```bash
# Validate JSON (Mac/Linux)
cat ~/.config/Claude/claude_desktop_config.json | python -m json.tool

# Validate JSON (Windows)
type "%AppData%\Claude\claude_desktop_config.json" | python -m json.tool
```

**3. Check for syntax errors:**
- No trailing commas
- All strings quoted
- No comments (JSON doesn't support)
- Valid JSON structure

**4. Reinstall:**
```bash
npx @j0kz/mcp-agents@latest
```

**5. Restart editor (fully close ALL windows)**

---

## Advanced Installation

### Global Installation (Faster Startup)

**Install globally:**
```bash
npm install -g @j0kz/smart-reviewer-mcp
npm install -g @j0kz/test-generator-mcp
# ... other tools
```

**Update config to use global:**
```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "smart-reviewer-mcp",  // No npx
      "args": []
    }
  }
}
```

**Benefits:**
- Faster tool startup
- No npx overhead
- Works offline

**Drawbacks:**
- Manual updates required
- Takes disk space

---

### Version Pinning

**Pin to specific version:**
```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["@j0kz/smart-reviewer-mcp@1.0.36"]
    }
  }
}
```

**When to use:**
- Production environments
- Need reproducible builds
- Avoid unexpected updates

**When NOT to use:**
- Development (want latest features)
- Auto-update preferred

---

### Multiple Environments

**Development config:**
```json
{
  "mcpServers": {
    "smart-reviewer-dev": {
      "command": "npx",
      "args": ["@j0kz/smart-reviewer-mcp@latest"]
    },
    "smart-reviewer-stable": {
      "command": "npx",
      "args": ["@j0kz/smart-reviewer-mcp@1.0.36"]
    }
  }
}
```

---

## Post-Installation

### Update Tools

```bash
# Clear cache to get latest
npm cache clean --force

# Reinstall (gets latest versions)
npx @j0kz/mcp-agents@latest
```

---

### Uninstall Tools

**Remove from config:**
1. Open config file
2. Delete tool entries from `mcpServers`
3. Save and restart editor

**Clean up global installs:**
```bash
npm uninstall -g @j0kz/smart-reviewer-mcp
npm uninstall -g @j0kz/test-generator-mcp
```

---

## Quick Reference

### Config File Locations

| Platform | Editor | Path |
|----------|--------|------|
| Windows | Claude Code | `%AppData%\Claude\claude_desktop_config.json` |
| Mac | Claude Code | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Linux | Claude Code | `~/.config/Claude/claude_desktop_config.json` |
| All | Cursor | `~/.cursor/mcp_config.json` |
| All | Windsurf | `~/.windsurf/mcp_config.json` |

### Installation Commands

```bash
# Quick install (all tools)
curl -fsSL https://raw.githubusercontent.com/j0kz/mcp-agents/main/install-all.sh | bash

# Individual tool (Claude Code)
claude mcp add [name] "npx @j0kz/[name]-mcp" --scope user

# Clear cache
npm cache clean --force

# Verify installation
claude mcp list
```

---

## Related

- See `platform-config-guide.md` for config file details
- See `debugging-strategies.md` for troubleshooting
- See main SKILL.md for complete troubleshooting guide

---

**Reference:** Installation workflows for @j0kz/mcp-agents
**Installer:** install-all.sh, install-all.ps1
**Project:** @j0kz/mcp-agents
