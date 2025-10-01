# @j0kz/refactor-assistant-mcp

> Intelligent code refactoring with pattern detection and suggestions

[![npm version](https://img.shields.io/npm/v/@j0kz/refactor-assistant-mcp)](https://www.npmjs.com/package/@j0kz/refactor-assistant-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Quick Start (30 seconds)

### One-Time Setup

Pick your editor and run **ONE** command:

**Claude Code:**
```bash
claude mcp add refactor-assistant "npx @j0kz/refactor-assistant-mcp" --scope user
```

**Cursor:** Add to `~/.cursor/mcp_config.json`
```json
{
  "mcpServers": {
    "refactor-assistant": {
      "command": "npx",
      "args": ["@j0kz/refactor-assistant-mcp"]
    }
  }
}
```

**Windsurf / Roo Code / Continue:** Similar config - [see full guide](https://github.com/j0kz/mcp-agents#editor-setup)

### Start Using Immediately

After setup, just chat naturally with your AI:

```
💬 You: "Refactor this function to be more readable"
🤖 AI: *Analyzes code* Suggestions: Extract 3 methods, rename variables (x→userId), remove nested ifs, add early returns...

💬 You: "Extract reusable patterns from these files"
🤖 AI: *Finds patterns* Common code in formatDate (used 8x), validation logic (5x). Created shared utils with 40% code reduction...

💬 You: "How can I improve this class design?"
🤖 AI: Apply: Single Responsibility (split UserManager), Dependency Injection (remove hardcoded DB), Strategy pattern for validators...
```

## ✨ Features

♻️ **Smart Refactoring** - Extract methods, rename, remove duplication
🎯 **Pattern Detection** - Find code smells and anti-patterns
📏 **SOLID Principles** - Enforce clean code practices
🔄 **Safe Transformations** - Preserve behavior while improving structure

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
