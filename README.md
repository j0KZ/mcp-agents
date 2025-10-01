# @j0kz MCP Agents

**Professional Model Context Protocol (MCP) agents for AI-powered development.**

[![NPM](https://img.shields.io/badge/npm-%40j0kz-CB3837?logo=npm)](https://www.npmjs.com/~j0kz)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)

Works with **Claude Code**, **Cursor**, **Windsurf**, **Roo Code**, **Continue**, and any MCP-compatible editor.

---

## 🤖 Agents Included

### 1. Smart Code Reviewer 🔍
**Package**: `@j0kz/smart-reviewer-mcp`

AI-powered code review with learning capabilities:
- Detects anti-patterns and code smells
- Suggests fixes with diffs
- Tracks code quality metrics
- Learns your team's coding style

### 2. Test Intelligence Generator 🧪
**Package**: `@j0kz/test-generator-mcp`

Automated comprehensive test generation:
- Generates unit and integration tests
- Creates edge case scenarios
- Estimates coverage
- Supports Jest, Vitest, Mocha, AVA

### 3. Architecture Analyzer 🏗️
**Package**: `@j0kz/architecture-analyzer-mcp`

Architecture analysis and visualization:
- Detects circular dependencies
- Identifies layer violations
- Generates dependency graphs (Mermaid)
- Suggests refactoring opportunities

---

## 🚀 Quick Start

### Install All (Claude Code)

```bash
claude mcp add smart-reviewer "npx @j0kz/smart-reviewer-mcp" --scope user
claude mcp add test-generator "npx @j0kz/test-generator-mcp" --scope user
claude mcp add architecture-analyzer "npx @j0kz/architecture-analyzer-mcp" --scope user
```

### Install Individual Package

```bash
# Just the code reviewer
npx @j0kz/smart-reviewer-mcp

# Just the test generator
npx @j0kz/test-generator-mcp

# Just the architecture analyzer
npx @j0kz/architecture-analyzer-mcp
```

### Verify Installation

```bash
claude mcp list
```

Expected output:
```
✓ smart-reviewer - Connected
✓ test-generator - Connected
✓ architecture-analyzer - Connected
```

---

## 🎯 Usage Examples

### In Claude Code

```bash
# Review code
claude> "Review this file for issues"

# Generate tests
claude> "Generate tests for src/utils.js with edge cases"

# Analyze architecture
claude> "Check for circular dependencies in my project"
```

### In Cursor/Windsurf/Roo Code

Simply chat with the AI:
```
User: "Review my recent changes"
AI: [Uses smart-reviewer MCP to analyze code]

User: "Generate tests for the auth module"
AI: [Uses test-generator MCP to create tests]

User: "Is my architecture clean?"
AI: [Uses architecture-analyzer MCP to check]
```

---

## 📦 Editor Compatibility

| Editor | Status | Installation |
|--------|--------|--------------|
| **Claude Code** | ✅ Native | `claude mcp add` |
| **Cursor** | ✅ Supported | Config file |
| **Windsurf** | ✅ Supported | Settings |
| **Roo Code** | ✅ Supported | CLI command |
| **Continue** | ✅ Supported | VS Code extension |
| **Zed** | 🔄 Planned | TBD |

See [EDITOR_COMPATIBILITY.md](EDITOR_COMPATIBILITY.md) for detailed setup instructions.

---

## 🛠️ Configuration

### Smart Reviewer Config

```json
{
  "smart-reviewer": {
    "severity": "strict",
    "autoFix": true,
    "customRules": "./my-rules.json"
  }
}
```

### Test Generator Config

```json
{
  "test-generator": {
    "framework": "jest",
    "coverage": 90,
    "includeEdgeCases": true
  }
}
```

### Architecture Analyzer Config

```json
{
  "architecture-analyzer": {
    "maxDepth": 3,
    "excludePatterns": ["node_modules", "dist"],
    "detectCircular": true,
    "generateGraph": true
  }
}
```

---

## 🔧 For Developers

### Build from Source

```bash
git clone https://github.com/j0kz/mcp-agents.git
cd mcp-agents
npm install
npm run build
```

### Development

```bash
# Watch mode
npm run dev

# Run tests
npm test

# Build specific package
npm run build:reviewer
npm run build:test-gen
npm run build:arch
```

---

## 📚 Documentation

- [Editor Compatibility Guide](EDITOR_COMPATIBILITY.md) - Setup for all editors
- [NPM Publishing Guide](NPM_PUBLISH_GUIDE.md) - For maintainers
- [Installation Guide](INSTALLATION.md) - Detailed setup
- [Distribution Options](docs/DISTRIBUTION.md) - Sharing options

---

## 🌟 Features

- ✅ **Universal MCP Support** - Works with any MCP-compatible editor
- ✅ **TypeScript** - Full type safety
- ✅ **Modular Design** - Use all or pick individual agents
- ✅ **Easy Installation** - One command via `npx`
- ✅ **Actively Maintained** - Regular updates
- ✅ **MIT Licensed** - Free for commercial use

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT © [j0kz](https://www.npmjs.com/~j0kz)

---

## 🔗 Links

- **NPM Profile**: https://www.npmjs.com/~j0kz
- **GitHub**: https://github.com/j0kz/mcp-agents
- **Issues**: https://github.com/j0kz/mcp-agents/issues
- **MCP Specification**: https://modelcontextprotocol.io/

---

## 📊 Stats

<!-- Will auto-update after publishing -->
```
npm: @j0kz/smart-reviewer-mcp
npm: @j0kz/test-generator-mcp
npm: @j0kz/architecture-analyzer-mcp
```

---

**Made with ❤️ for the AI coding community**
