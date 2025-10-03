# @j0kz MCP Development Toolkit

> **8 powerful AI development tools for Claude Code, Cursor, Windsurf, and all MCP-compatible editors**

[![npm](https://img.shields.io/badge/npm-%40j0kz-red)](https://www.npmjs.com/~j0kz)
[![Version](https://img.shields.io/badge/version-1.0.20-blue.svg)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)
[![Wiki](https://img.shields.io/badge/docs-wiki-blue)](https://github.com/j0KZ/mcp-agents/wiki)
[![GitHub](https://img.shields.io/badge/github-mcp--agents-black)](https://github.com/j0KZ/mcp-agents)

## 🎉 What's New in v1.0.20

- **🚀 One-Command Installer**: Install all 8 tools instantly
  - New package: `@j0kz/mcp-agents`
  - Run: `npx @j0kz/mcp-agents` and you're done!
  - Auto-configures Claude Code, Cursor, or Windsurf
  - Built-in troubleshooting with `clear-cache` command
- **📦 Simplified Installation**: No more manual config editing
  - Automatically updates MCP settings
  - Works cross-platform (Windows, macOS, Linux)
  - See [Quick Install](#-quick-install) below

[View Full Changelog](CHANGELOG.md#1020---2025-10-03)

---

## ⚡ Quick Install

Install all 8 tools **instantly** with one command:

```bash
# For Claude Code (default)
npx @j0kz/mcp-agents

# For Cursor
npx @j0kz/mcp-agents cursor

# For Windsurf
npx @j0kz/mcp-agents windsurf
```

**That's it!** Restart your editor and all 8 MCP tools will be ready to use.

<details>
<summary>📖 More installation options</summary>

```bash
# List all available tools
npx @j0kz/mcp-agents list

# Clear cache if having issues
npx @j0kz/mcp-agents clear-cache

# Show help
npx @j0kz/mcp-agents help
```

Or use the [manual installation guide](#-installation) below.
</details>

---

## 📜 Previous Releases

### v1.0.19 - Dist Rebuild
- Rebuilt dist files with correct @j0kz/shared imports
- Fixed ERR_MODULE_NOT_FOUND errors completely

### v1.0.18 - Shared Package Published
- Published @j0kz/shared package to npm
- Updated all package.json dependencies
- Fixed ERR_MODULE_NOT_FOUND error

### v1.0.17 - Code Quality Improvements
- Major complexity reduction in API Designer (67% reduction)
- Enhanced accuracy in Smart Reviewer
- All 37 tests passing with zero breaking changes
- Better maintainability with modular architecture

### v1.0.16 - Dependency Updates
- Major dependency updates (Anthropic SDK, MCP SDK, Vitest)
- Zero vulnerabilities
- Enhanced test infrastructure

### v1.0.15 - Security & Examples
- Security hardened with ReDoS vulnerability fixes
- 19 comprehensive examples and tutorials
- Performance benchmarking infrastructure
- Structured error codes

## 🚀 Installation

Choose your AI-powered code editor below and follow the simple installation steps:

<details>
<summary><b>🎨 Claude Code (Anthropic)</b> - Click to expand</summary>

### Automatic Installation (Recommended)

**Mac/Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/j0KZ/mcp-agents/main/install-all.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/j0KZ/mcp-agents/main/install-all.ps1 | iex
```

### Manual Installation

```bash
# Install all 8 tools individually
claude mcp add smart-reviewer "npx @j0kz/smart-reviewer-mcp" --scope user
claude mcp add test-generator "npx @j0kz/test-generator-mcp" --scope user
claude mcp add architecture-analyzer "npx @j0kz/architecture-analyzer-mcp" --scope user
claude mcp add doc-generator "npx @j0kz/doc-generator-mcp" --scope user
claude mcp add security-scanner "npx @j0kz/security-scanner-mcp" --scope user
claude mcp add refactor-assistant "npx @j0kz/refactor-assistant-mcp" --scope user
claude mcp add api-designer "npx @j0kz/api-designer-mcp" --scope user
claude mcp add db-schema "npx @j0kz/db-schema-mcp" --scope user
```

**✅ Verify Installation:**
```bash
claude mcp list
```

You should see all 8 tools marked as "✓ Connected"

</details>

<details>
<summary><b>⚡ Cursor (Anysphere)</b> - Click to expand</summary>

### Option 1: Automatic Setup

**Mac/Linux:**
```bash
curl -o ~/.cursor/mcp_config.json https://raw.githubusercontent.com/j0KZ/mcp-agents/main/mcp_config_all.json
```

**Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/j0KZ/mcp-agents/main/mcp_config_all.json" -OutFile "$env:APPDATA\Cursor\User\mcp_config.json"
```

### Option 2: Manual Setup

1. Open Cursor Settings (Ctrl/Cmd + ,)
2. Search for "MCP" or "Model Context Protocol"
3. Click "Edit in settings.json"
4. Add this configuration:

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
    },
    "architecture-analyzer": {
      "command": "npx",
      "args": ["@j0kz/architecture-analyzer-mcp"]
    },
    "doc-generator": {
      "command": "npx",
      "args": ["@j0kz/doc-generator-mcp"]
    },
    "security-scanner": {
      "command": "npx",
      "args": ["@j0kz/security-scanner-mcp"]
    },
    "refactor-assistant": {
      "command": "npx",
      "args": ["@j0kz/refactor-assistant-mcp"]
    },
    "api-designer": {
      "command": "npx",
      "args": ["@j0kz/api-designer-mcp"]
    },
    "db-schema": {
      "command": "npx",
      "args": ["@j0kz/db-schema-mcp"]
    }
  }
}
```

**Then restart Cursor!**

</details>

<details>
<summary><b>🌊 Windsurf (Codeium)</b> - Click to expand</summary>

### Option 1: Automatic Setup

**Mac/Linux:**
```bash
curl -o ~/.windsurf/mcp_config.json https://raw.githubusercontent.com/j0KZ/mcp-agents/main/mcp_config_all.json
```

**Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/j0KZ/mcp-agents/main/mcp_config_all.json" -OutFile "$env:APPDATA\Windsurf\User\mcp_config.json"
```

### Option 2: Manual Setup

1. Open Windsurf Settings
2. Navigate to "Extensions" → "Model Context Protocol"
3. Click "Edit MCP Settings"
4. Add the same JSON configuration as shown in the Cursor section above

**Then restart Windsurf!**

</details>

<details>
<summary><b>🦘 Roo Code (Roo-Cline)</b> - Click to expand</summary>

### Installation

```bash
# Install via Roo Code CLI
roo mcp add smart-reviewer npx @j0kz/smart-reviewer-mcp
roo mcp add test-generator npx @j0kz/test-generator-mcp
roo mcp add architecture-analyzer npx @j0kz/architecture-analyzer-mcp
roo mcp add doc-generator npx @j0kz/doc-generator-mcp
roo mcp add security-scanner npx @j0kz/security-scanner-mcp
roo mcp add refactor-assistant npx @j0kz/refactor-assistant-mcp
roo mcp add api-designer npx @j0kz/api-designer-mcp
roo mcp add db-schema npx @j0kz/db-schema-mcp
```

**Then restart Roo Code!**

</details>

<details>
<summary><b>🔄 Continue.dev</b> - Click to expand</summary>

### Installation

1. Open VS Code
2. Install the Continue extension from the marketplace
3. Open Continue settings (click Continue icon → ⚙️)
4. Edit `~/.continue/config.json` and add:

```json
{
  "mcp": [
    {
      "name": "smart-reviewer",
      "command": "npx",
      "args": ["@j0kz/smart-reviewer-mcp"]
    },
    {
      "name": "test-generator",
      "command": "npx",
      "args": ["@j0kz/test-generator-mcp"]
    },
    {
      "name": "architecture-analyzer",
      "command": "npx",
      "args": ["@j0kz/architecture-analyzer-mcp"]
    },
    {
      "name": "doc-generator",
      "command": "npx",
      "args": ["@j0kz/doc-generator-mcp"]
    },
    {
      "name": "security-scanner",
      "command": "npx",
      "args": ["@j0kz/security-scanner-mcp"]
    },
    {
      "name": "refactor-assistant",
      "command": "npx",
      "args": ["@j0kz/refactor-assistant-mcp"]
    },
    {
      "name": "api-designer",
      "command": "npx",
      "args": ["@j0kz/api-designer-mcp"]
    },
    {
      "name": "db-schema",
      "command": "npx",
      "args": ["@j0kz/db-schema-mcp"]
    }
  ]
}
```

**Then restart VS Code!**

</details>

<details>
<summary><b>⚡ Zed (Zed Industries)</b> - Click to expand</summary>

### Installation

1. Open Zed
2. Press `Cmd/Ctrl + ,` to open Settings
3. Navigate to "Language Models" → "Model Context Protocol"
4. Add the MCP servers configuration:

```json
{
  "context_servers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["@j0kz/smart-reviewer-mcp"]
    },
    "test-generator": {
      "command": "npx",
      "args": ["@j0kz/test-generator-mcp"]
    },
    "architecture-analyzer": {
      "command": "npx",
      "args": ["@j0kz/architecture-analyzer-mcp"]
    },
    "doc-generator": {
      "command": "npx",
      "args": ["@j0kz/doc-generator-mcp"]
    },
    "security-scanner": {
      "command": "npx",
      "args": ["@j0kz/security-scanner-mcp"]
    },
    "refactor-assistant": {
      "command": "npx",
      "args": ["@j0kz/refactor-assistant-mcp"]
    },
    "api-designer": {
      "command": "npx",
      "args": ["@j0kz/api-designer-mcp"]
    },
    "db-schema": {
      "command": "npx",
      "args": ["@j0kz/db-schema-mcp"]
    }
  }
}
```

**Then restart Zed!**

</details>

<details>
<summary><b>🎯 Trae (AI Code Editor)</b> - Click to expand</summary>

### Installation

1. Open Trae
2. Go to Settings → Extensions → Model Context Protocol
3. Click "Add MCP Server" or edit the MCP configuration file
4. Add this configuration:

**Configuration Format:**
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
    },
    "architecture-analyzer": {
      "command": "npx",
      "args": ["@j0kz/architecture-analyzer-mcp"]
    },
    "doc-generator": {
      "command": "npx",
      "args": ["@j0kz/doc-generator-mcp"]
    },
    "security-scanner": {
      "command": "npx",
      "args": ["@j0kz/security-scanner-mcp"]
    },
    "refactor-assistant": {
      "command": "npx",
      "args": ["@j0kz/refactor-assistant-mcp"]
    },
    "api-designer": {
      "command": "npx",
      "args": ["@j0kz/api-designer-mcp"]
    },
    "db-schema": {
      "command": "npx",
      "args": ["@j0kz/db-schema-mcp"]
    }
  }
}
```

**Note:** The property name is `mcpServers` (camelCase), not `mcp_servers`.

**Then restart Trae!**

</details>

<details>
<summary><b>🔧 Any MCP-Compatible Editor</b> - Click to expand</summary>

### Generic Installation

If your editor supports MCP but isn't listed above:

1. Find your editor's MCP configuration file location
2. Add this configuration (adjust format as needed):

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
    },
    "architecture-analyzer": {
      "command": "npx",
      "args": ["@j0kz/architecture-analyzer-mcp"]
    },
    "doc-generator": {
      "command": "npx",
      "args": ["@j0kz/doc-generator-mcp"]
    },
    "security-scanner": {
      "command": "npx",
      "args": ["@j0kz/security-scanner-mcp"]
    },
    "refactor-assistant": {
      "command": "npx",
      "args": ["@j0kz/refactor-assistant-mcp"]
    },
    "api-designer": {
      "command": "npx",
      "args": ["@j0kz/api-designer-mcp"]
    },
    "db-schema": {
      "command": "npx",
      "args": ["@j0kz/db-schema-mcp"]
    }
  }
}
```

3. Restart your editor

**Need help?** [Open an issue](https://github.com/j0KZ/mcp-agents/issues) with your editor name!

</details>

---

## 📦 The 8 Tools

### 🎯 Code Quality Suite

#### [@j0kz/smart-reviewer-mcp](https://www.npmjs.com/package/@j0kz/smart-reviewer-mcp)
AI-powered code review with quality metrics and automated fixes

**Example:**
```
💬 "Review the auth.js file"
🤖 Found 3 issues: unused variable on line 42, missing error handling,
   inconsistent formatting. Here are the fixes...
```

#### [@j0kz/test-generator-mcp](https://www.npmjs.com/package/@j0kz/test-generator-mcp)
Generate comprehensive test suites with edge cases and mocks

**Example:**
```
💬 "Generate tests for calculatePrice function"
🤖 Generated 15 tests covering: happy path, edge cases (negative prices,
   zero), error handling, boundary conditions...
```

#### [@j0kz/refactor-assistant-mcp](https://www.npmjs.com/package/@j0kz/refactor-assistant-mcp)
Intelligent code refactoring with pattern detection

**Example:**
```
💬 "Refactor this function to be more readable"
🤖 Suggestions: Extract 3 methods, rename variables (x→userId),
   remove nested ifs, add early returns...
```

---

### 🏗️ Architecture & Design

#### [@j0kz/architecture-analyzer-mcp](https://www.npmjs.com/package/@j0kz/architecture-analyzer-mcp)
Detect circular dependencies, layer violations, and generate dependency graphs

**Example:**
```
💬 "Analyze project architecture"
🤖 Found: 2 circular dependencies (auth ↔ user),
   3 layer violations (UI calls Database directly)...
```

#### [@j0kz/api-designer-mcp](https://www.npmjs.com/package/@j0kz/api-designer-mcp)
Design REST and GraphQL APIs with OpenAPI generation

**Example:**
```
💬 "Design a REST API for user management"
🤖 Created design: GET/POST /users, GET/PUT/DELETE /users/:id,
   POST /users/:id/verify. Includes auth, validation...
```

#### [@j0kz/db-schema-mcp](https://www.npmjs.com/package/@j0kz/db-schema-mcp)
Database schema design with migrations and relationship analysis

**Example:**
```
💬 "Design a schema for an e-commerce app"
🤖 Created schema: users, products, orders, order_items
   with relationships, indexes, constraints...
```

---

### 📚 Documentation & Security

#### [@j0kz/doc-generator-mcp](https://www.npmjs.com/package/@j0kz/doc-generator-mcp)
Auto-generate JSDoc, README, and API documentation from code

**Example:**
```
💬 "Document the API endpoints in server.js"
🤖 Generated OpenAPI spec with 12 endpoints, parameters,
   responses, and examples...
```

#### [@j0kz/security-scanner-mcp](https://www.npmjs.com/package/@j0kz/security-scanner-mcp)
Scan for vulnerabilities, OWASP issues, and security best practices

**Example:**
```
💬 "Scan for security vulnerabilities"
🤖 Found: SQL injection risk in query builder, XSS in template,
   hardcoded API key, outdated dependency...
```

---

## 🎯 How It Works

1. **Run the install command** (one line, see above)
2. **Restart your editor**
3. **Chat naturally** - Just ask your AI assistant
4. **Get results** - The tools work behind the scenes

No API keys, no complex config, no accounts needed!

---

## 💡 Usage Examples

After installation, just chat naturally:

```bash
# Code Review
"Review my code for issues"
"What code smells are in this file?"
"Check code quality metrics"

# Testing
"Generate tests for this function"
"What test cases am I missing?"
"Create integration tests"

# Architecture
"Analyze project architecture"
"Find circular dependencies"
"Generate dependency graph"

# Documentation
"Generate API documentation"
"Add JSDoc comments"
"Create README"

# Security
"Scan for security issues"
"Check OWASP Top 10 compliance"
"Find hardcoded secrets"

# Refactoring
"Refactor this code"
"Extract reusable patterns"
"Improve class design"

# API Design
"Design a REST API for..."
"Generate OpenAPI spec"
"Review API best practices"

# Database
"Design database schema"
"Generate migrations"
"Optimize this schema"
```

### 📘 New Examples & Tutorials

Check out the [`examples/`](examples/) directory for comprehensive guides:

- **[Getting Started Tutorial](examples/tutorials/01-getting-started.md)** - Your first steps with the toolkit
- **[Common Workflows](examples/tutorials/02-common-workflows.md)** - Real-world usage patterns
- **[Advanced Usage](examples/tutorials/03-advanced-usage.md)** - Power user techniques
- **[Best Practices](examples/tutorials/04-best-practices.md)** - Tips for optimal results

Each tool has dedicated examples with sample code and expected outputs!

---

## 🔧 Editor Support

| Editor | Status | Installation Method |
|--------|--------|---------------------|
| **Claude Code** | ✅ Full support | Use install script (recommended) |
| **Cursor** | ✅ Full support | Download mcp_config_all.json |
| **Windsurf** | ✅ Full support | Download mcp_config_all.json |
| **Roo Code** | ✅ Full support | MCP-compatible config |
| **Continue** | ✅ Full support | MCP plugin support |
| **Zed** | ✅ Full support | Native MCP support |

**Any MCP-compatible editor works!**

---

## 📥 Individual Installation

Want just one tool? Install individually:

```bash
# Claude Code
claude mcp add smart-reviewer "npx @j0kz/smart-reviewer-mcp" --scope user
claude mcp add test-generator "npx @j0kz/test-generator-mcp" --scope user
claude mcp add architecture-analyzer "npx @j0kz/architecture-analyzer-mcp" --scope user
claude mcp add doc-generator "npx @j0kz/doc-generator-mcp" --scope user
claude mcp add security-scanner "npx @j0kz/security-scanner-mcp" --scope user
claude mcp add refactor-assistant "npx @j0kz/refactor-assistant-mcp" --scope user
claude mcp add api-designer "npx @j0kz/api-designer-mcp" --scope user
claude mcp add db-schema "npx @j0kz/db-schema-mcp" --scope user
```

For Cursor/Windsurf, add individual entries to `mcp_config.json` - [see config template](mcp_config_all.json).

---

## ✅ Verify Installation

**Claude Code:**
```bash
claude mcp list
```

You should see all 8 tools marked as "✓ Connected"

**Cursor/Windsurf:**
Check your editor's MCP settings panel

---

## 📚 Documentation

### Comprehensive Wiki

Visit our [**Wiki**](https://github.com/j0KZ/mcp-agents/wiki) for complete documentation:

- **[Quick Start Guide](https://github.com/j0KZ/mcp-agents/wiki/Quick-Start)** - Get started in 5 minutes
- **[Configuration](https://github.com/j0KZ/mcp-agents/wiki/Configuration)** - Editor setup for Claude Code, Cursor, Windsurf, Roo Code
- **[Integration Patterns](https://github.com/j0KZ/mcp-agents/wiki/Integration-Patterns)** - Chain MCPs together for powerful workflows
- **[Troubleshooting](https://github.com/j0KZ/mcp-agents/wiki/Troubleshooting)** - Common issues and solutions

### Tool Documentation

- [Smart Reviewer](https://github.com/j0KZ/mcp-agents/wiki/Smart-Reviewer) - Code review and quality analysis
- [Architecture Analyzer](https://github.com/j0KZ/mcp-agents/wiki/Architecture-Analyzer) - Dependency and architecture analysis
- [Test Generator](https://www.npmjs.com/package/@j0kz/test-generator-mcp) - Automated test generation
- [Security Scanner](https://www.npmjs.com/package/@j0kz/security-scanner-mcp) - Security vulnerability scanning
- [API Designer](https://www.npmjs.com/package/@j0kz/api-designer-mcp) - REST and GraphQL API design
- [DB Schema](https://www.npmjs.com/package/@j0kz/db-schema-mcp) - Database schema design
- [Doc Generator](https://www.npmjs.com/package/@j0kz/doc-generator-mcp) - Auto-generate documentation
- [Refactor Assistant](https://www.npmjs.com/package/@j0kz/refactor-assistant-mcp) - Code refactoring

### Additional Resources

- **[Modularity Implementation](docs/MODULARITY_IMPLEMENTATION.md)** - Technical details on shared utilities
- **[Editor Compatibility](docs/EDITOR_COMPATIBILITY.md)** - Full compatibility matrix
- **[Security Policy](docs/SECURITY.md)** - Security guidelines and reporting
- **[Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute to the project
- **[Code of Conduct](docs/CODE_OF_CONDUCT.md)** - Community guidelines
- **[Roadmap](docs/ROADMAP.md)** - Future plans and features

---

## ❓ Troubleshooting

### MCPs not showing up?
1. **Restart your editor** after installation
2. **Check Node.js** is installed: `node --version`
3. **Verify installation**: `claude mcp list` (Claude Code)
4. **See [Troubleshooting Guide](https://github.com/j0KZ/mcp-agents/wiki/Troubleshooting)** for detailed solutions

### Commands not working?
1. Make sure you restarted the editor
2. Try asking more specific questions
3. Check MCP connection status

### Still stuck?
- [Open an issue](https://github.com/j0KZ/mcp-agents/issues)
- Check individual package READMEs for detailed docs

---

## 🏗️ Project Structure

```
mcp-agents/
├── packages/
│   ├── smart-reviewer/       # Code review & quality
│   ├── test-generator/       # Test suite generation
│   ├── architecture-analyzer/# Dependency analysis
│   ├── doc-generator/        # Documentation tools
│   ├── security-scanner/     # Security scanning
│   ├── refactor-assistant/   # Refactoring tools
│   ├── api-designer/         # API design
│   └── db-schema/            # Database design
├── install-all.sh            # Mac/Linux installer
├── install-all.ps1           # Windows installer
└── mcp_config_all.json       # Complete MCP config
```

Each package is independently published to npm under the `@j0kz` scope.

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT © [j0KZ](https://github.com/j0KZ)

Each package is independently licensed under MIT.

---

## 🔗 Links

- **npm:** [@j0kz](https://www.npmjs.com/~j0kz)
- **GitHub:** [j0KZ/mcp-agents](https://github.com/j0KZ/mcp-agents)
- **Issues:** [Report a bug](https://github.com/j0KZ/mcp-agents/issues)
- **MCP Protocol:** [modelcontextprotocol.io](https://modelcontextprotocol.io/)

---

## 🌟 Star This Repo

If you find these tools useful, please star the repo to help others discover it!

---

**Made with ❤️ for the AI developer community**
