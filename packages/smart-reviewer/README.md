# @j0kz/smart-reviewer-mcp

> AI-powered code review with quality metrics and automated fixes

[![npm version](https://img.shields.io/npm/v/@j0kz/smart-reviewer-mcp)](https://www.npmjs.com/package/@j0kz/smart-reviewer-mcp)
[![Version](https://img.shields.io/badge/version-1.0.15-blue.svg)](https://github.com/j0KZ/mcp-agents/blob/main/CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎉 What's New in v1.0.15

- **📚 Comprehensive Examples**: New example files in [`examples/smart-reviewer/`](../../examples/smart-reviewer/)
- **🎯 Better Error Messages**: Improved validation and error handling
- **✅ Production Ready**: Enhanced code analysis and quality metrics

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
claude mcp add smart-reviewer "npx @j0kz/smart-reviewer-mcp" --scope user
```

**Cursor/Windsurf:** Add to `mcp_config.json`:
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

### Start Using Immediately

After setup, just chat naturally with your AI:

```
💬 You: "Review the auth.js file"
🤖 AI: *Analyzes code* Found 3 issues: unused variable, missing error handling, inconsistent formatting. Here are fixes...

💬 You: "Check code quality metrics for src/"
🤖 AI: Complexity: 8.5/10, Maintainability: 75%, Test Coverage: 82%. Suggestions: Extract method in processUser()...

💬 You: "What code smells are in this file?"
🤖 AI: Detected: Long method (calculateTotal - 150 lines), Feature Envy (uses Customer data), Duplicate code...
```

## ✨ Features

🔍 **Deep Code Analysis** - Find bugs, code smells, and anti-patterns
📊 **Quality Metrics** - Complexity, maintainability, coverage scores
🤖 **Auto-Fix** - Automatically apply suggested improvements
⚡ **Fast Reviews** - Analyze entire projects in seconds

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

**👉 [View complete collection on GitHub](https://github.com/j0KZ/mcp-agents)**

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
- [Open an issue](https://github.com/j0KZ/mcp-agents/issues)
- [Check full documentation](https://github.com/j0KZ/mcp-agents)

## 📄 License

MIT © [j0KZ](https://github.com/j0KZ)

---

**Explore more tools:** [github.com/j0KZ/mcp-agents](https://github.com/j0KZ/mcp-agents) | **npm:** [@j0kz](https://www.npmjs.com/~j0kz)
