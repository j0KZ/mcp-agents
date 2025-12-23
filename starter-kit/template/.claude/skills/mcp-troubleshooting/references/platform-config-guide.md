# Platform Configuration Guide

Complete configuration reference for all editors and platforms supporting MCP tools.

---

## Config File Format

### Standard MCP Config Structure

```json
{
  "mcpServers": {
    "tool-name": {
      "command": "npx",
      "args": ["@j0kz/tool-name-mcp"],
      "type": "stdio"
    }
  }
}
```

**Required fields:**
- `command`: Executable to run (`npx`, `node`, or global command)
- `args`: Array of arguments (package name, flags)

**Optional fields:**
- `type`: Communication type (`"stdio"` recommended for compatibility)
- `timeout`: Timeout in milliseconds (default: 30000)
- `env`: Environment variables

---

## Claude Code (claude.ai/code)

### Config Location

**Windows:**
```
%AppData%\Claude\claude_desktop_config.json
```

**Full path example:**
```
C:\Users\YourName\AppData\Roaming\Claude\claude_desktop_config.json
```

**Mac:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Full path example:**
```
/Users/YourName/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

**Full path example:**
```
/home/yourname/.config/Claude/claude_desktop_config.json
```

---

### Claude Code Config Format

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

**Important for Claude Code:**
- MUST include `"type": "stdio"`
- Config auto-created on first run
- Supports `claude mcp` CLI commands

---

### Claude Code CLI Commands

```bash
# Add MCP server
claude mcp add smart-reviewer "npx @j0kz/smart-reviewer-mcp" --scope user

# List configured servers
claude mcp list

# Remove server
claude mcp remove smart-reviewer

# Update config
claude mcp update smart-reviewer "npx @j0kz/smart-reviewer-mcp@latest"
```

---

## Cursor

### Config Location

**All platforms:**
```
~/.cursor/mcp_config.json
```

**Windows full path:**
```
C:\Users\YourName\.cursor\mcp_config.json
```

**Mac full path:**
```
/Users/YourName/.cursor/mcp_config.json
```

**Linux full path:**
```
/home/yourname/.cursor/mcp_config.json
```

---

### Cursor Config Format

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

**Notes:**
- Cursor has native MCP support
- `"type"` field optional (defaults to stdio)
- Create `~/.cursor/` directory if doesn't exist
- No CLI tools for Cursor MCP config

---

### Creating Cursor Config (if missing)

**Windows (PowerShell):**
```powershell
mkdir "$env:USERPROFILE\.cursor"
echo '{"mcpServers":{}}' > "$env:USERPROFILE\.cursor\mcp_config.json"
```

**Mac/Linux:**
```bash
mkdir -p ~/.cursor
echo '{"mcpServers":{}}' > ~/.cursor/mcp_config.json
```

---

## Windsurf

### Config Location

**All platforms:**
```
~/.windsurf/mcp_config.json
```

**Windows full path:**
```
C:\Users\YourName\.windsurf\mcp_config.json
```

**Mac full path:**
```
/Users/YourName/.windsurf/mcp_config.json
```

**Linux full path:**
```
/home/yourname/.windsurf/mcp_config.json
```

---

### Windsurf Config Format

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

**Notes:**
- Built-in MCP support
- Same format as Cursor
- Auto-detects MCP servers on startup

---

## VS Code (Continue Extension)

### Setup

1. **Install Continue extension:**
   - Open VS Code
   - Extensions (Ctrl+Shift+X)
   - Search "Continue"
   - Install

2. **Open Continue config:**
   - Command Palette (Ctrl+Shift+P)
   - "Continue: Open Config"
   - Or manually edit: `~/.continue/config.json`

---

### Continue Config Format

**Location:**
```
~/.continue/config.json
```

**Format:**
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

**Notes:**
- Continue extension required
- Separate from VS Code settings
- Supports MCP protocol natively

---

## Roo Code

### Config Location

**Check Roo Code documentation for:**
- Config file location (varies by version)
- MCP support status
- Configuration format

**Typical location:**
```
~/.roo/mcp_config.json
```

---

### Roo Code Config Format

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

---

## Zed

### MCP Support

**Status:** Full MCP support

**Config location:**
Check Zed documentation for current config path.

**Typical format:**
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

---

## Config Validation

### Validate JSON Syntax

**Mac/Linux:**
```bash
cat ~/.config/Claude/claude_desktop_config.json | python -m json.tool
```

**Windows (PowerShell):**
```powershell
Get-Content "$env:APPDATA\Claude\claude_desktop_config.json" | python -m json.tool
```

**Online validators:**
- https://jsonlint.com/
- https://jsonformatter.curiousconcept.com/

---

### Common Syntax Errors

**❌ Trailing comma:**
```json
{
  "mcpServers": {
    "smart-reviewer": { ... },  // ← Extra comma
  }
}
```

**✅ Correct:**
```json
{
  "mcpServers": {
    "smart-reviewer": { ... }  // ← No trailing comma
  }
}
```

**❌ Missing quotes:**
```json
{
  mcpServers: {  // ← Not quoted
    smart-reviewer: { ... }  // ← Not quoted
  }
}
```

**✅ Correct:**
```json
{
  "mcpServers": {
    "smart-reviewer": { ... }
  }
}
```

**❌ Comments (JSON doesn't support):**
```json
{
  // This is a comment  ← Invalid
  "mcpServers": { ... }
}
```

**✅ Correct:**
```json
{
  "mcpServers": { ... }
}
```

---

## Advanced Configuration

### Environment Variables

```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["@j0kz/smart-reviewer-mcp"],
      "env": {
        "NODE_ENV": "production",
        "DEBUG": "false"
      }
    }
  }
}
```

---

### Custom Timeouts

```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["@j0kz/smart-reviewer-mcp"],
      "timeout": 60000  // 60 seconds
    }
  }
}
```

**Default:** 30000ms (30 seconds)

**When to increase:**
- Large file analysis
- Slow network
- Complex operations

---

### Global vs npx Installation

**Using npx (recommended):**
```json
{
  "command": "npx",
  "args": ["@j0kz/smart-reviewer-mcp"]
}
```

**Benefits:**
- Always gets latest (if cache cleared)
- No global install needed
- Works anywhere

**Drawbacks:**
- Slower first run
- Requires network

**Using global install:**
```bash
# First install globally
npm install -g @j0kz/smart-reviewer-mcp

# Then configure
{
  "command": "smart-reviewer-mcp",
  "args": []
}
```

**Benefits:**
- Faster startup
- Works offline
- Predictable

**Drawbacks:**
- Manual updates
- Disk space

---

### Version Pinning

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

**When to pin:**
- Production environments
- Reproducible builds
- Avoid breaking changes

---

## Complete Configuration Example

### All 9 Tools Configured

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
    "architecture-analyzer": {
      "command": "npx",
      "args": ["@j0kz/architecture-analyzer-mcp"],
      "type": "stdio"
    },
    "security-scanner": {
      "command": "npx",
      "args": ["@j0kz/security-scanner-mcp"],
      "type": "stdio"
    },
    "api-designer": {
      "command": "npx",
      "args": ["@j0kz/api-designer-mcp"],
      "type": "stdio"
    },
    "db-schema": {
      "command": "npx",
      "args": ["@j0kz/db-schema-mcp"],
      "type": "stdio"
    },
    "doc-generator": {
      "command": "npx",
      "args": ["@j0kz/doc-generator-mcp"],
      "type": "stdio"
    },
    "refactor-assistant": {
      "command": "npx",
      "args": ["@j0kz/refactor-assistant-mcp"],
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

---

## Troubleshooting Config Issues

### Issue: Config file not loaded

**Check:**
1. File location correct for your editor
2. File name correct (case-sensitive on Linux/Mac)
3. JSON syntax valid
4. Editor fully restarted

**Debug:**
```bash
# Check file exists
ls -la ~/.config/Claude/claude_desktop_config.json

# Check permissions
ls -l ~/.config/Claude/claude_desktop_config.json

# Should be readable: -rw-r--r--
```

---

### Issue: Tools not appearing

**Verify config:**
```bash
# View config
cat ~/.config/Claude/claude_desktop_config.json

# Validate JSON
cat ~/.config/Claude/claude_desktop_config.json | python -m json.tool
```

**Check for:**
- Syntax errors (commas, quotes)
- Correct package names
- `"type": "stdio"` included (for Claude Code)

---

### Issue: Wrong config file

**Each editor has different location:**

| Editor | Config Path |
|--------|-------------|
| Claude Code | `%AppData%\Claude\` or `~/Library/Application Support/Claude/` |
| Cursor | `~/.cursor/` |
| Windsurf | `~/.windsurf/` |
| Continue (VS Code) | `~/.continue/` |

**Editing wrong file won't work!**

---

## Platform-Specific Tips

### Windows

**Use `%APPDATA%` environment variable:**
```powershell
# Open config directory
explorer "$env:APPDATA\Claude"

# Edit config
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

**Path separators:**
- Use `\` or `/` (both work)
- Escape in JSON: `"C:\\Users\\..."` or use `/`

---

### Mac

**Library folder hidden by default:**
```bash
# Show in Finder
open ~/Library/Application\ Support/Claude

# Edit with default editor
open -e ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

---

### Linux

**Standard XDG paths:**
```bash
# Config location
~/.config/Claude/

# Alternative locations (check documentation)
~/.local/share/Claude/
```

---

## Quick Reference

### Config Locations Table

| Platform | Editor | Path |
|----------|--------|------|
| Windows | Claude Code | `%AppData%\Claude\claude_desktop_config.json` |
| Mac | Claude Code | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Linux | Claude Code | `~/.config/Claude/claude_desktop_config.json` |
| All | Cursor | `~/.cursor/mcp_config.json` |
| All | Windsurf | `~/.windsurf/mcp_config.json` |
| All | Continue | `~/.continue/config.json` |

### Minimal Config Template

```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["@j0kz/smart-reviewer-mcp"],
      "type": "stdio"
    }
  }
}
```

---

## Related

- See `installation-guide.md` for installation steps
- See `debugging-strategies.md` for troubleshooting
- See main SKILL.md for complete troubleshooting guide

---

**Reference:** MCP configuration for @j0kz/mcp-agents
**Editors:** Claude Code, Cursor, Windsurf, Continue, Roo, Zed
**Project:** @j0kz/mcp-agents
