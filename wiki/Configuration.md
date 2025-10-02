# Configuration Guide

Complete configuration guide for all MCP-compatible editors.

## 📋 Configuration Overview

MCP Agents can be configured in two ways:
1. **Global installation** - Install once, use in all projects
2. **Project-level** - Install per project (recommended for teams)

## 🎯 Editor-Specific Configuration

### Claude Code

**Location**: Settings → MCP Servers

**Method 1: Using GUI**
1. Open Settings: `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)
2. Search for "MCP"
3. Click "Edit in settings.json"

**Method 2: Direct File Edit**

File location:
- **Windows**: `%APPDATA%\Claude Code\User\settings.json`
- **macOS**: `~/Library/Application Support/Claude Code/User/settings.json`
- **Linux**: `~/.config/claude-code/settings.json`

**Configuration**:

```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["-y", "@j0kz/smart-reviewer-mcp"]
    },
    "test-generator": {
      "command": "npx",
      "args": ["-y", "@j0kz/test-generator-mcp"]
    },
    "architecture-analyzer": {
      "command": "npx",
      "args": ["-y", "@j0kz/architecture-analyzer-mcp"]
    },
    "security-scanner": {
      "command": "npx",
      "args": ["-y", "@j0kz/security-scanner-mcp"]
    },
    "api-designer": {
      "command": "npx",
      "args": ["-y", "@j0kz/api-designer-mcp"]
    },
    "db-schema": {
      "command": "npx",
      "args": ["-y", "@j0kz/db-schema-mcp"]
    },
    "doc-generator": {
      "command": "npx",
      "args": ["-y", "@j0kz/doc-generator-mcp"]
    },
    "refactor-assistant": {
      "command": "npx",
      "args": ["-y", "@j0kz/refactor-assistant-mcp"]
    }
  }
}
```

### Cursor

**Location**: Settings → MCP Configuration

File location:
- **Windows**: `%APPDATA%\Cursor\User\settings.json`
- **macOS**: `~/Library/Application Support/Cursor/User/settings.json`
- **Linux**: `~/.config/cursor/settings.json`

**Configuration** (same as Claude Code):

```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["-y", "@j0kz/smart-reviewer-mcp"]
    }
  }
}
```

### Windsurf

**Location**: Project root `.windsurf/mcp_config.json`

```json
{
  "servers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["-y", "@j0kz/smart-reviewer-mcp"]
    },
    "test-generator": {
      "command": "npx",
      "args": ["-y", "@j0kz/test-generator-mcp"]
    }
  }
}
```

### Roo Code

**Location**: `.roo/mcp.json` in project root

```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["-y", "@j0kz/smart-reviewer-mcp"]
    }
  }
}
```

## 🔧 Installation Methods

### Method 1: npx (Recommended)

**Pros**:
- No installation needed
- Always uses latest version
- No PATH issues
- Works on all platforms

**Cons**:
- Slower first run
- Requires internet

**Configuration**:
```json
{
  "command": "npx",
  "args": ["-y", "@j0kz/smart-reviewer-mcp"]
}
```

### Method 2: Global Installation

**Pros**:
- Faster startup
- Works offline
- Specific version control

**Cons**:
- Need to install manually
- PATH configuration required
- Manual updates needed

**Installation**:
```bash
npm install -g @j0kz/smart-reviewer-mcp
```

**Configuration**:
```json
{
  "command": "smart-reviewer-mcp",
  "args": []
}
```

### Method 3: Local Project Installation

**Pros**:
- Version locked per project
- Team consistency
- No global pollution

**Cons**:
- Larger node_modules
- Duplicate installations

**Installation**:
```bash
npm install --save-dev @j0kz/smart-reviewer-mcp
```

**Configuration**:
```json
{
  "command": "npx",
  "args": ["@j0kz/smart-reviewer-mcp"]
}
```

## ⚙️ Advanced Configuration

### Custom Arguments

```json
{
  "smart-reviewer": {
    "command": "npx",
    "args": ["-y", "@j0kz/smart-reviewer-mcp"],
    "env": {
      "NODE_ENV": "production",
      "LOG_LEVEL": "debug"
    }
  }
}
```

### Memory Limits

For large projects:

```json
{
  "smart-reviewer": {
    "command": "node",
    "args": [
      "--max-old-space-size=4096",
      "node_modules/@j0kz/smart-reviewer-mcp/dist/mcp-server.js"
    ]
  }
}
```

### Timeout Configuration

```json
{
  "smart-reviewer": {
    "command": "npx",
    "args": ["-y", "@j0kz/smart-reviewer-mcp"],
    "timeout": 60000
  }
}
```

## 🎨 Per-Tool Configuration

### Smart Reviewer

```json
{
  "smart-reviewer": {
    "command": "npx",
    "args": ["-y", "@j0kz/smart-reviewer-mcp"],
    "config": {
      "severity": "strict",
      "autoFix": false,
      "excludePatterns": ["*.test.ts", "*.spec.ts"]
    }
  }
}
```

### Architecture Analyzer

```json
{
  "architecture-analyzer": {
    "command": "npx",
    "args": ["-y", "@j0kz/architecture-analyzer-mcp"],
    "config": {
      "detectCircular": true,
      "generateGraph": true,
      "maxDepth": 10
    }
  }
}
```

### Security Scanner

```json
{
  "security-scanner": {
    "command": "npx",
    "args": ["-y", "@j0kz/security-scanner-mcp"],
    "config": {
      "minSeverity": "medium",
      "scanSecrets": true,
      "scanDependencies": true
    }
  }
}
```

## 🔐 Environment Variables

### Setting Environment Variables

**Windows PowerShell**:
```powershell
$env:MCP_LOG_LEVEL = "debug"
```

**macOS/Linux**:
```bash
export MCP_LOG_LEVEL=debug
```

### Available Variables

| Variable | Values | Description |
|----------|--------|-------------|
| `MCP_LOG_LEVEL` | `error`, `warn`, `info`, `debug` | Logging verbosity |
| `MCP_CACHE_DIR` | Path | Cache directory location |
| `MCP_TIMEOUT` | Milliseconds | Default operation timeout |
| `NODE_ENV` | `production`, `development` | Environment mode |

## 📁 Project-Level Configuration

### .mcprc.json

Create in project root:

```json
{
  "excludePatterns": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "coverage/**"
  ],
  "severity": "moderate",
  "autoFix": false,
  "cache": true
}
```

### package.json Integration

```json
{
  "mcp": {
    "reviewRules": {
      "complexity": 15,
      "maintainability": 70
    },
    "excludePatterns": ["*.test.ts"]
  }
}
```

## 🔄 Multiple Configurations

### Development vs Production

**Development** (`.mcp.dev.json`):
```json
{
  "severity": "lenient",
  "autoFix": true,
  "verbose": true
}
```

**Production** (`.mcp.prod.json`):
```json
{
  "severity": "strict",
  "autoFix": false,
  "failOnError": true
}
```

### Team Shared Configuration

Commit `.mcprc.json` to git:

```json
{
  "version": "1.0.0",
  "extends": "@company/mcp-config",
  "rules": {
    "no-console": "error",
    "max-complexity": 10
  }
}
```

## ✅ Validation

### Check Configuration

```bash
# Validate JSON syntax
cat settings.json | jq .

# Check MCP is configured
grep -r "mcpServers" ~/.config/claude-code/

# Test MCP directly
npx @j0kz/smart-reviewer-mcp --help
```

### Common Mistakes

❌ **Trailing commas**:
```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["-y", "@j0kz/smart-reviewer-mcp"],  // Remove this comma
    }
  }
}
```

❌ **Wrong command path**:
```json
{
  "command": "smart-reviewer"  // Missing -mcp suffix
}
```

❌ **Missing quotes**:
```json
{
  "command": npx  // Should be "npx"
}
```

## 🚀 Quick Setup Wizard

Run this script to auto-configure:

```bash
#!/bin/bash
# setup-mcp.sh

EDITOR=$1

if [ "$EDITOR" = "claude-code" ]; then
  CONFIG_PATH="$HOME/.config/claude-code/settings.json"
elif [ "$EDITOR" = "cursor" ]; then
  CONFIG_PATH="$HOME/.config/cursor/settings.json"
else
  echo "Usage: ./setup-mcp.sh [claude-code|cursor]"
  exit 1
fi

# Backup existing config
cp "$CONFIG_PATH" "$CONFIG_PATH.backup"

# Add MCP configuration
jq '.mcpServers += {
  "smart-reviewer": {
    "command": "npx",
    "args": ["-y", "@j0kz/smart-reviewer-mcp"]
  }
}' "$CONFIG_PATH" > "$CONFIG_PATH.tmp"

mv "$CONFIG_PATH.tmp" "$CONFIG_PATH"

echo "✅ MCP configured for $EDITOR"
echo "Restart your editor to activate"
```

## 📖 See Also

- [Quick Start](Quick-Start) - Get started in 5 minutes
- [Troubleshooting](Troubleshooting) - Fix configuration issues
- [Integration Patterns](Integration-Patterns) - Advanced usage

---

**[← Back to Home](Home)** | **[Quick Start →](Quick-Start)**
