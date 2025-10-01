# Installation Guide

Complete installation instructions for My Claude Agents.

## Prerequisites

1. **Node.js 18+**: [Download](https://nodejs.org/)
2. **Claude Code CLI**: [Install from Anthropic](https://claude.ai/claude-code)

## Quick Installation

### 1. Clone/Navigate to Project

```bash
cd D:\Users\j0KZ\Documents\Coding\my-claude-agents
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build All Agents

```bash
npm run build
```

### 4. Add MCP Servers to Claude Code

**For Current Project:**
```bash
claude mcp add smart-reviewer node "D:/Users/j0KZ/Documents/Coding/my-claude-agents/packages/smart-reviewer/dist/mcp-server.js"
claude mcp add test-generator node "D:/Users/j0KZ/Documents/Coding/my-claude-agents/packages/test-generator/dist/mcp-server.js"
claude mcp add architecture-analyzer node "D:/Users/j0KZ/Documents/Coding/my-claude-agents/packages/architecture-analyzer/dist/mcp-server.js"
```

**For Other Projects:**

Navigate to the project and run the same commands:
```bash
cd /path/to/your/project
claude mcp add smart-reviewer node "D:/Users/j0KZ/Documents/Coding/my-claude-agents/packages/smart-reviewer/dist/mcp-server.js"
claude mcp add test-generator node "D:/Users/j0KZ/Documents/Coding/my-claude-agents/packages/test-generator/dist/mcp-server.js"
claude mcp add architecture-analyzer node "D:/Users/j0KZ/Documents/Coding/my-claude-agents/packages/architecture-analyzer/dist/mcp-server.js"
```

### 5. Verify Installation

```bash
claude mcp list
```

Expected output:
```
✓ smart-reviewer - Connected
✓ test-generator - Connected
✓ architecture-analyzer - Connected
```

## Automated Installation Scripts

### Windows (PowerShell)

Create `add-agents.ps1` in any project:

```powershell
# add-agents.ps1
$agentsPath = "D:/Users/j0KZ/Documents/Coding/my-claude-agents"

Write-Host "🚀 Adding My Claude Agents..."
Write-Host ""

claude mcp add smart-reviewer node "$agentsPath/packages/smart-reviewer/dist/mcp-server.js"
Write-Host "✅ smart-reviewer added"

claude mcp add test-generator node "$agentsPath/packages/test-generator/dist/mcp-server.js"
Write-Host "✅ test-generator added"

claude mcp add architecture-analyzer node "$agentsPath/packages/architecture-analyzer/dist/mcp-server.js"
Write-Host "✅ architecture-analyzer added"

Write-Host ""
Write-Host "📊 Verifying installation..."
claude mcp list
```

Usage:
```powershell
.\add-agents.ps1
```

### Unix/Mac/Linux (Bash)

Create `add-agents.sh`:

```bash
#!/bin/bash
AGENTS_PATH="D:/Users/j0KZ/Documents/Coding/my-claude-agents"

echo "🚀 Adding My Claude Agents..."
echo

claude mcp add smart-reviewer node "$AGENTS_PATH/packages/smart-reviewer/dist/mcp-server.js"
echo "✅ smart-reviewer added"

claude mcp add test-generator node "$AGENTS_PATH/packages/test-generator/dist/mcp-server.js"
echo "✅ test-generator added"

claude mcp add architecture-analyzer node "$AGENTS_PATH/packages/architecture-analyzer/dist/mcp-server.js"
echo "✅ architecture-analyzer added"

echo
echo "📊 Verifying installation..."
claude mcp list
```

Make executable and run:
```bash
chmod +x add-agents.sh
./add-agents.sh
```

## Testing Installation

### Quick Test

```bash
# Create a test file
echo "var x = 10; console.log(x);" > test-file.js

# Review it
claude code "Review test-file.js with smart-reviewer"

# Expected: Detailed review with issues detected
```

### Full Test Suite

```bash
# Test Smart Reviewer
claude code "Review any .js file in this project with smart-reviewer"

# Test Test Generator
claude code "Generate tests for a simple function"

# Test Architecture Analyzer
claude code "Analyze this project's architecture"
```

## Configuration File Locations

Claude Code stores MCP configuration in:

- **Per-project**: `.claude.json` in project root
- **Global**: Check with `claude config list`

Example `.claude.json`:
```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "node",
      "args": ["D:/Users/j0KZ/Documents/Coding/my-claude-agents/packages/smart-reviewer/dist/mcp-server.js"]
    },
    "test-generator": {
      "command": "node",
      "args": ["D:/Users/j0KZ/Documents/Coding/my-claude-agents/packages/test-generator/dist/mcp-server.js"]
    },
    "architecture-analyzer": {
      "command": "node",
      "args": ["D:/Users/j0KZ/Documents/Coding/my-claude-agents/packages/architecture-analyzer/dist/mcp-server.js"]
    }
  }
}
```

## Updating Agents

When you make changes to the agents:

```bash
# 1. Rebuild
cd D:\Users\j0KZ\Documents\Coding\my-claude-agents
npm run build

# 2. The MCP servers automatically use the updated code
# No need to re-add them unless paths changed

# 3. Restart Claude Code if needed
```

## Removing Agents

From current project:
```bash
claude mcp remove smart-reviewer
claude mcp remove test-generator
claude mcp remove architecture-analyzer
```

## Troubleshooting

### Agents Not Appearing

1. **Verify build**:
   ```bash
   cd D:\Users\j0KZ\Documents\Coding\my-claude-agents
   npm run build
   ```

2. **Check paths exist**:
   ```bash
   ls packages/*/dist/mcp-server.js
   ```

3. **Re-add servers**:
   ```bash
   claude mcp remove smart-reviewer
   claude mcp add smart-reviewer node "D:/Users/j0KZ/Documents/Coding/my-claude-agents/packages/smart-reviewer/dist/mcp-server.js"
   ```

4. **Check connection**:
   ```bash
   claude mcp list
   ```

### Connection Errors

If you see "Connection failed":

1. Check Node.js is installed: `node --version`
2. Verify file exists: `ls <path-to-mcp-server.js>`
3. Check file is executable
4. Review Claude Code logs

### Path Issues

**Windows**: Use forward slashes `/` in paths, not backslashes `\`
```bash
# ✅ Correct
"D:/Users/j0KZ/Documents/Coding/my-claude-agents/..."

# ❌ Wrong
"D:\Users\j0KZ\Documents\Coding\my-claude-agents\..."
```

## Next Steps

1. ✅ Agents installed and connected
2. 📖 Read [Quick Start Guide](docs/QUICK_START.md)
3. 🧪 Try [Sample Commands](docs/examples/sample-commands.sh)
4. 🚀 Explore [Workflow Examples](docs/examples/WORKFLOW_EXAMPLES.md)

## Support

- Issues: Create GitHub issue
- Documentation: [Main README](README.md)
- Examples: [docs/examples/](docs/examples/)
