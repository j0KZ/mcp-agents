# @j0kz/test-generator-mcp

> Generate comprehensive test suites with edge cases and mocks

[![npm version](https://img.shields.io/npm/v/@j0kz/test-generator-mcp)](https://www.npmjs.com/package/@j0kz/test-generator-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Quick Start

### ⭐ Option 1: Install ALL 8 Tools (Recommended)

Get the complete suite with ONE command:

**Claude Code:**
```bash
# Mac/Linux
curl -fsSL https://raw.githubusercontent.com/j0kz/mcp-agents/main/install-all.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/j0kz/mcp-agents/main/install-all.ps1 | iex
```

**Cursor/Windsurf:**
```bash
# Download complete config
curl -o ~/.cursor/mcp_config.json https://raw.githubusercontent.com/j0kz/mcp-agents/main/mcp_config_all.json

# Or for Windsurf
curl -o ~/.windsurf/mcp_config.json https://raw.githubusercontent.com/j0kz/mcp-agents/main/mcp_config_all.json
```

### Option 2: Install Only This Tool

**Claude Code:**
```bash
claude mcp add test-generator "npx @j0kz/test-generator-mcp" --scope user
```

**Cursor/Windsurf:** Add to `mcp_config.json`:
```json
{
  "mcpServers": {
    "test-generator": {
      "command": "npx",
      "args": ["@j0kz/test-generator-mcp"]
    }
  }
}
```

### Start Using Immediately

After setup, just chat naturally with your AI:

```
💬 You: "Generate tests for calculatePrice function"
🤖 AI: *Creates test file* Generated 15 tests covering: happy path, edge cases (negative prices, zero), error handling, boundary conditions...

💬 You: "Add tests for the UserService class"
🤖 AI: Created UserService.test.js with: 8 unit tests, 4 integration tests, mocked dependencies, 95% coverage...

💬 You: "What test cases am I missing for login.js?"
🤖 AI: Missing: Invalid email format, expired tokens, rate limiting, concurrent sessions, SQL injection attempts...
```

## ✨ Features

✨ **Smart Test Generation** - Creates complete test suites automatically
🎯 **Edge Case Detection** - Finds boundary conditions you might miss
🔧 **Mock Generation** - Auto-creates mocks for dependencies
📈 **Coverage Optimization** - Targets high coverage with minimal tests

## 📦 Complete @j0kz MCP Suite

Get all 8 professional development tools - install individually or all at once:

```bash
# 🎯 Code Quality Suite
npx @j0kz/smart-reviewer-mcp      # AI code review
npx @j0kz/test-generator-mcp      # Auto-generate tests
npx @j0kz/refactor-assistant-mcp  # Refactoring help

# 🏗️ Architecture & Design
npx @j0kz/architecture-analyzer-mcp  # Architecture analysis
npx @j0kz/api-designer-mcp           # API design
npx @j0kz/db-schema-mcp              # Database schemas

# 📚 Documentation & Security
npx @j0kz/doc-generator-mcp       # Auto-generate docs
npx @j0kz/security-scanner-mcp    # Security scanning
```

**👉 [View complete collection on GitHub](https://github.com/j0kz/mcp-agents)**

## 🎯 How It Works

1. **Install once** - Run the setup command for your editor
2. **Restart editor** - Reload to activate the MCP
3. **Chat naturally** - Just ask your AI assistant to help
4. **Get results** - The MCP tools work behind the scenes

No configuration files, no complex setup, no API keys needed!

## 🔧 Editor Support

| Editor | Status | Notes |
|--------|--------|-------|
| **Claude Code** | ✅ Full support | Recommended |
| **Cursor** | ✅ Full support | Native MCP |
| **Windsurf** | ✅ Full support | Built-in MCP |
| **Roo Code** | ✅ Full support | MCP compatible |
| **Continue** | ✅ Full support | MCP plugin |
| **Zed** | ✅ Full support | MCP support |

Any MCP-compatible editor works!

## ❓ Troubleshooting

**MCP not showing up?**
- Restart your editor after installation
- Check: `claude mcp list` (Claude Code) to verify connection

**Commands not working?**
- Make sure Node.js is installed (`node --version`)
- Try reinstalling: Remove and re-add the MCP

**Still stuck?**
- [Open an issue](https://github.com/j0kz/mcp-agents/issues)
- [Check full documentation](https://github.com/j0kz/mcp-agents)

## 📄 License

MIT © [j0kz](https://github.com/j0kz)

---

**Explore more tools:** [github.com/j0kz/mcp-agents](https://github.com/j0kz/mcp-agents) | **npm:** [@j0kz](https://www.npmjs.com/~j0kz)
