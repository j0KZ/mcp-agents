# @j0kz/doc-generator-mcp

> Auto-generate JSDoc, README, and API documentation from code

[![npm version](https://img.shields.io/npm/v/@j0kz/doc-generator-mcp)](https://www.npmjs.com/package/@j0kz/doc-generator-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Quick Start (30 seconds)

### One-Time Setup

Pick your editor and run **ONE** command:

**Claude Code:**
```bash
claude mcp add doc-generator "npx @j0kz/doc-generator-mcp" --scope user
```

**Cursor:** Add to `~/.cursor/mcp_config.json`
```json
{
  "mcpServers": {
    "doc-generator": {
      "command": "npx",
      "args": ["@j0kz/doc-generator-mcp"]
    }
  }
}
```

**Windsurf / Roo Code / Continue:** Similar config - [see full guide](https://github.com/j0kz/mcp-agents#editor-setup)

### Start Using Immediately

After setup, just chat naturally with your AI:

```
💬 You: "Document the API endpoints in server.js"
🤖 AI: *Generates OpenAPI spec* Created swagger.json with 12 endpoints, parameters, responses, and examples...

💬 You: "Create JSDoc comments for UserService"
🤖 AI: *Adds documentation* Added @param, @returns, @throws for all 8 methods with descriptions and type info...

💬 You: "Generate README for this project"
🤖 AI: *Analyzes code* Created README with: Overview, Installation, API Reference, Usage Examples, Configuration...
```

## ✨ Features

📝 **JSDoc Generation** - Complete function and class documentation
📚 **README Creation** - Professional project documentation
🔌 **API Docs** - OpenAPI/Swagger specs from code
⚡ **Markdown Tables** - Clean documentation formatting

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
