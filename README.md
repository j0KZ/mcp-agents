# @j0kz MCP Agents

**Professional Model Context Protocol (MCP) agents for AI-powered development.**

[![NPM](https://img.shields.io/badge/npm-%40j0kz-CB3837?logo=npm)](https://www.npmjs.com/~j0kz)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)

**8 Production-Ready MCP Agents** - Works with **Claude Code**, **Cursor**, **Windsurf**, **Roo Code**, **Continue**, and any MCP-compatible editor.

---

## 🤖 Complete Agent Suite

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

### 4. Documentation Generator 📄
**Package**: `@j0kz/doc-generator-mcp`

Auto-generate comprehensive documentation:
- Generate JSDoc/TSDoc comments
- Create README.md from code
- Build API documentation
- Generate changelogs from git

### 5. Security Scanner 🔒
**Package**: `@j0kz/security-scanner-mcp`

Find vulnerabilities and security issues:
- Detect hardcoded secrets (AWS keys, passwords)
- Find SQL injection & XSS vulnerabilities
- OWASP Top 10 checks
- Scan dependencies for CVEs

### 6. Refactoring Assistant 🔧
**Package**: `@j0kz/refactor-assistant-mcp`

Automated code refactoring:
- Extract functions intelligently
- Convert callbacks to async/await
- Simplify complex conditionals
- Apply 10 design patterns

### 7. API Designer 🌐
**Package**: `@j0kz/api-designer-mcp`

Design and document APIs:
- Generate OpenAPI/Swagger specs
- Design REST endpoints
- Create GraphQL schemas
- Generate API client code

### 8. Database Schema Designer 🗄️
**Package**: `@j0kz/db-schema-mcp`

Design and optimize database schemas:
- Design schemas (Postgres/MySQL/MongoDB)
- Generate migrations
- Create ER diagrams
- Optimize indexes and suggest normalizations

---

## 🚀 Quick Start

### Install All (Claude Code)

```bash
# Core Development Tools
claude mcp add smart-reviewer "npx @j0kz/smart-reviewer-mcp" --scope user
claude mcp add test-generator "npx @j0kz/test-generator-mcp" --scope user
claude mcp add architecture-analyzer "npx @j0kz/architecture-analyzer-mcp" --scope user

# Documentation & Security
claude mcp add doc-generator "npx @j0kz/doc-generator-mcp" --scope user
claude mcp add security-scanner "npx @j0kz/security-scanner-mcp" --scope user

# Refactoring & Design
claude mcp add refactor-assistant "npx @j0kz/refactor-assistant-mcp" --scope user
claude mcp add api-designer "npx @j0kz/api-designer-mcp" --scope user
claude mcp add db-schema "npx @j0kz/db-schema-mcp" --scope user
```

### Install Individual Package

```bash
# Just one MCP
npx @j0kz/doc-generator-mcp
npx @j0kz/security-scanner-mcp
# ... etc
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
✓ doc-generator - Connected
✓ security-scanner - Connected
✓ refactor-assistant - Connected
✓ api-designer - Connected
✓ db-schema - Connected
```

---

## 🎯 Usage Examples

### Code Quality Workflow

```bash
# 1. Review code quality
"Review this file for issues"

# 2. Check security
"Scan for security vulnerabilities"

# 3. Analyze architecture
"Check for circular dependencies"

# 4. Generate tests
"Generate tests with 90% coverage"
```

### Documentation Workflow

```bash
# 1. Generate JSDoc
"Add JSDoc comments to this file"

# 2. Create README
"Generate README for this project"

# 3. API documentation
"Generate API docs"

# 4. Changelog
"Create changelog from git history"
```

### Refactoring Workflow

```bash
# 1. Get suggestions
"Suggest refactorings for this code"

# 2. Extract function
"Extract this logic to a separate function"

# 3. Convert to async
"Convert these callbacks to async/await"

# 4. Apply patterns
"Apply factory pattern to this class"
```

### API Development Workflow

```bash
# 1. Design API
"Design REST API for user management"

# 2. Generate OpenAPI spec
"Generate OpenAPI specification"

# 3. Design database
"Design database schema for this API"

# 4. Generate migrations
"Create migration files"
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

See [EDITOR_COMPATIBILITY.md](EDITOR_COMPATIBILITY.md) for detailed setup instructions for all editors.

---

## 🛠️ Package Links

| Package | NPM | Features |
|---------|-----|----------|
| Smart Reviewer | [@j0kz/smart-reviewer-mcp](https://www.npmjs.com/package/@j0kz/smart-reviewer-mcp) | Code review, quality metrics |
| Test Generator | [@j0kz/test-generator-mcp](https://www.npmjs.com/package/@j0kz/test-generator-mcp) | Test generation, coverage |
| Architecture Analyzer | [@j0kz/architecture-analyzer-mcp](https://www.npmjs.com/package/@j0kz/architecture-analyzer-mcp) | Dependency analysis, graphs |
| Doc Generator | [@j0kz/doc-generator-mcp](https://www.npmjs.com/package/@j0kz/doc-generator-mcp) | JSDoc, README, API docs |
| Security Scanner | [@j0kz/security-scanner-mcp](https://www.npmjs.com/package/@j0kz/security-scanner-mcp) | Vulnerability scanning |
| Refactor Assistant | [@j0kz/refactor-assistant-mcp](https://www.npmjs.com/package/@j0kz/refactor-assistant-mcp) | Code refactoring |
| API Designer | [@j0kz/api-designer-mcp](https://www.npmjs.com/package/@j0kz/api-designer-mcp) | API design, OpenAPI |
| DB Schema Designer | [@j0kz/db-schema-mcp](https://www.npmjs.com/package/@j0kz/db-schema-mcp) | Database schema design |

---

## 📚 Documentation

- [Editor Compatibility Guide](EDITOR_COMPATIBILITY.md) - Setup for all editors
- [Publishing Guide](PUBLISH_ALL_8.md) - How to publish to NPM
- [NPM Publishing Guide](NPM_PUBLISH_GUIDE.md) - For maintainers
- [Installation Guide](INSTALLATION.md) - Detailed setup
- [Distribution Options](docs/DISTRIBUTION.md) - Sharing options

---

## 🌟 Features

- ✅ **Universal MCP Support** - Works with any MCP-compatible editor
- ✅ **TypeScript** - Full type safety
- ✅ **Modular Design** - Use all or pick individual agents
- ✅ **Easy Installation** - One command via `npx`
- ✅ **Production Ready** - Comprehensive error handling
- ✅ **Well Documented** - Extensive READMEs and examples
- ✅ **MIT Licensed** - Free for commercial use

---

## 🤝 Contributing

Contributions welcome! Please visit the [GitHub repository](https://github.com/j0kz/mcp-agents).

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

**Made with ❤️ for the AI coding community**
