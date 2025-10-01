# @j0kz MCP Development Toolkit

> **8 powerful AI development tools for Claude Code, Cursor, Windsurf, and all MCP-compatible editors**

[![npm](https://img.shields.io/badge/npm-%40j0kz-red)](https://www.npmjs.com/~j0kz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)

## 🚀 Install All 8 Tools (One Command)

### Claude Code

**Mac/Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/j0kz/mcp-agents/main/install-all.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/j0kz/mcp-agents/main/install-all.ps1 | iex
```

### Cursor / Windsurf

```bash
# Cursor
curl -o ~/.cursor/mcp_config.json https://raw.githubusercontent.com/j0kz/mcp-agents/main/mcp_config_all.json

# Windsurf
curl -o ~/.windsurf/mcp_config.json https://raw.githubusercontent.com/j0kz/mcp-agents/main/mcp_config_all.json
```

**Then restart your editor!**

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

## ❓ Troubleshooting

### MCPs not showing up?
1. **Restart your editor** after installation
2. **Check Node.js** is installed: `node --version`
3. **Verify installation**: `claude mcp list` (Claude Code)

### Commands not working?
1. Make sure you restarted the editor
2. Try asking more specific questions
3. Check MCP connection status

### Still stuck?
- [Open an issue](https://github.com/j0kz/mcp-agents/issues)
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

MIT © [j0kz](https://github.com/j0kz)

Each package is independently licensed under MIT.

---

## 🔗 Links

- **npm:** [@j0kz](https://www.npmjs.com/~j0kz)
- **GitHub:** [j0kz/mcp-agents](https://github.com/j0kz/mcp-agents)
- **Issues:** [Report a bug](https://github.com/j0kz/mcp-agents/issues)
- **MCP Protocol:** [modelcontextprotocol.io](https://modelcontextprotocol.io/)

---

## 🌟 Star This Repo

If you find these tools useful, please star the repo to help others discover it!

---

**Made with ❤️ for the AI developer community**
