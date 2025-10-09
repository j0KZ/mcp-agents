# MCP Agent Toolkit

<div align="center">

**Enterprise-grade AI development tools for Claude, Cursor, Windsurf, Qoder & all MCP-compatible editors**

🌍 **Multi-language Support**: Works in English and Spanish | Funciona en inglés y español

[![CI](https://github.com/j0KZ/mcp-agents/workflows/CI/badge.svg)](https://github.com/j0KZ/mcp-agents/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@j0kz/mcp-agents.svg)](https://www.npmjs.com/package/@j0kz/mcp-agents)
[![Version](https://img.shields.io/badge/version-1.0.35-blue.svg)](https://github.com/j0KZ/mcp-agents/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![codecov](https://codecov.io/gh/j0KZ/mcp-agents/branch/main/graph/badge.svg)](https://codecov.io/gh/j0KZ/mcp-agents)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)

[![Tests](https://img.shields.io/badge/tests-366_passing-success.svg)](https://github.com/j0KZ/mcp-agents/actions)
[![Performance](https://img.shields.io/badge/performance-2.18x_faster-brightgreen.svg)](docs/PHASE3_SUMMARY.md)
[![Code Quality](https://img.shields.io/badge/code_quality-A+-brightgreen.svg)](https://github.com/j0KZ/mcp-agents/actions/workflows/codeql.yml)
[![Security](https://img.shields.io/badge/security-100%25_secure-shield.svg)](https://github.com/j0KZ/mcp-agents/security)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](CONTRIBUTING.md)
[![Wiki](https://img.shields.io/badge/docs-wiki-blue)](https://github.com/j0KZ/mcp-agents/wiki)

</div>

---

## 🚀 One-Line Installation

```bash
npx @j0kz/mcp-agents@latest
```

That's it! The installer automatically:
- ✅ Detects your editor (Claude, Cursor, Windsurf, Qoder, VS Code, Roo, etc.)
- ✅ Configures all 9 MCP tools with universal compatibility
- ✅ Adds proper `type: stdio` for maximum compatibility
- ✅ Clears npm cache to prevent issues
- ✅ Fixes malformed config files
- ✅ Works in English and Spanish

**Restart your editor and start using AI-powered development tools immediately!**

<details>
<summary>📱 Supported Editors</summary>

```bash
npx @j0kz/mcp-agents@latest           # Auto-detect
npx @j0kz/mcp-agents@latest claude    # Claude Code
npx @j0kz/mcp-agents@latest cursor    # Cursor
npx @j0kz/mcp-agents@latest windsurf  # Windsurf
npx @j0kz/mcp-agents@latest qoder     # Qoder
npx @j0kz/mcp-agents@latest vscode    # VS Code
npx @j0kz/mcp-agents@latest roo       # Roo Code
```

</details>

---

## 🎯 What You Get

<table>
<tr>
<td width="33%">

### 🔍 Code Quality
- **Smart Reviewer** - AI code review
- **Test Generator** - Comprehensive tests
- **Refactor Assistant** - Clean code

</td>
<td width="33%">

### 🏗️ Architecture
- **Architecture Analyzer** - Dependencies
- **API Designer** - REST/GraphQL
- **DB Schema** - Database design

</td>
<td width="33%">

### 🛡️ Security & Docs
- **Security Scanner** - Vulnerability scan
- **Doc Generator** - Auto documentation
- **Orchestrator** - Workflow automation

</td>
</tr>
</table>

---

## 💡 Real-World Usage

Just chat naturally with your AI assistant after installation:

<table>
<tr>
<td width="50%">

### Code Review (English / Español)
```
"Review my auth.js file"
"Revisar mi archivo auth.js"
"What code smells are in this?"
"Check for performance issues"
```

### Testing
```
"Generate tests for calculatePrice"
"Generar pruebas para calculatePrice"
"Add edge cases to my tests"
"Create integration tests"
```

### Security
```
"Scan for vulnerabilities"
"Escanear vulnerabilidades"
"Check for SQL injection"
"Find hardcoded secrets"
```

</td>
<td width="50%">

### Architecture
```
"Analyze project structure"
"Analizar estructura del proyecto"
"Find circular dependencies"
"Generate dependency graph"
```

### API Design
```
"Design REST API for users"
"Diseñar API REST para usuarios"
"Generate OpenAPI spec"
"Create GraphQL schema"
```

### Documentation
```
"Generate README"
"Generar README"
"Add JSDoc comments"
"Create API documentation"
```

</td>
</tr>
</table>

---

## 📊 Performance & Quality Metrics

<div align="center">

| Metric | Value | Status |
|--------|-------|--------|
| **Performance** | 2.18x faster | 🚀 Optimized |
| **Test Coverage** | 75% | ✅ Enforced |
| **Code Quality** | Score 88/100 | ⭐ Excellent |
| **Security** | 0 vulnerabilities | 🛡️ Hardened |
| **Tests** | 366 passing | ✅ Complete |
| **Complexity** | -36% reduction | 📈 Improved |

</div>

---

## 🔧 Tool Capabilities

<details>
<summary><b>🎯 Smart Reviewer</b> - AI-powered code review</summary>

```javascript
// Example usage
"Review this file for issues"

// Output
✓ Found 3 issues:
  - Unused variable 'temp' on line 42
  - Missing error handling in async function
  - Potential memory leak in event listener

✓ Auto-fixes available for 2 issues
```

**Features:**
- Quality metrics (complexity, maintainability)
- Auto-fix generation using Pareto principle
- Pattern detection and best practices
- Performance bottleneck identification

</details>

<details>
<summary><b>🧪 Test Generator</b> - Comprehensive test suites</summary>

```javascript
// Example usage
"Generate tests for the UserService class"

// Output
✓ Generated 24 tests:
  - Happy path scenarios (8)
  - Edge cases (6)
  - Error handling (5)
  - Boundary conditions (5)
```

**Features:**
- Multiple framework support (Jest, Mocha, Vitest)
- Edge case detection
- Mock generation
- Coverage optimization

</details>

<details>
<summary><b>🏗️ Architecture Analyzer</b> - Dependency analysis</summary>

```javascript
// Example usage
"Analyze project architecture"

// Output
✓ Analysis complete:
  - 2 circular dependencies found
  - 3 layer violations detected
  - Suggested refactoring for 5 modules
  - Generated Mermaid dependency graph
```

**Features:**
- Circular dependency detection
- Layer violation analysis
- Dependency graphs (Mermaid)
- Module complexity metrics

</details>

<details>
<summary><b>🛡️ Security Scanner</b> - Vulnerability detection</summary>

```javascript
// Example usage
"Scan for security vulnerabilities"

// Output
✓ Security scan complete:
  - SQL injection risk in query.js:45
  - XSS vulnerability in template.html:12
  - Hardcoded API key in config.js:8
  - 2 outdated dependencies with CVEs
```

**Features:**
- OWASP Top 10 detection
- Secret scanning (20+ patterns)
- SQL injection & XSS detection
- Dependency vulnerability checks

</details>

<details>
<summary><b>📚 More Tools</b> - Click to expand</summary>

### API Designer
- REST & GraphQL API design
- OpenAPI 3.0 generation
- Client SDK generation
- Mock server creation

### DB Schema Designer
- SQL & NoSQL schema design
- Migration generation
- ER diagram creation
- Index optimization

### Doc Generator
- README generation
- JSDoc comments
- API documentation
- Changelog creation

### Refactor Assistant
- Extract functions/methods
- Convert callbacks to async/await
- Apply design patterns
- Remove dead code

### Orchestrator
- Chain multiple tools
- Pre-built workflows
- CI/CD integration
- Batch operations

</details>

---

## 🚀 CI/CD Integration

Add automated quality checks to your pipeline:

### GitHub Actions
```bash
# Quick setup
curl -o .github/workflows/mcp-quality.yml \
  https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/github-actions/mcp-basic.yml
```

### Pre-commit Hooks
```bash
npx @j0kz/mcp-hooks-generator basic
```

### GitLab CI
```yaml
include:
  - remote: 'https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/gitlab-ci/mcp-quality-gate.gitlab-ci.yml'
```

[📚 Full CI/CD Guide](docs/development/CI_CD_TEMPLATES.md)

---

## 📦 Features Comparison

<table>
<thead>
<tr>
<th>Feature</th>
<th>MCP Agent Toolkit</th>
<th>Traditional Tools</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Installation</b></td>
<td>✅ One command</td>
<td>❌ Multiple tools & configs</td>
</tr>
<tr>
<td><b>AI Integration</b></td>
<td>✅ Native MCP support</td>
<td>❌ Manual integration</td>
</tr>
<tr>
<td><b>Performance</b></td>
<td>✅ 2.18x faster with caching</td>
<td>❌ No intelligent caching</td>
</tr>
<tr>
<td><b>Coverage</b></td>
<td>✅ 9 tools in one package</td>
<td>❌ Separate installations</td>
</tr>
<tr>
<td><b>Updates</b></td>
<td>✅ Synchronized versions</td>
<td>❌ Version conflicts</td>
</tr>
<tr>
<td><b>Editor Support</b></td>
<td>✅ All MCP editors</td>
<td>❌ Limited support</td>
</tr>
</tbody>
</table>

---

## 🎯 Quick Start Examples

### 1. Code Quality Check
```bash
"Review all files in src/ and generate tests for uncovered functions"
```

### 2. Security Audit
```bash
"Scan the entire project for security vulnerabilities and generate a report"
```

### 3. API Documentation
```bash
"Generate OpenAPI documentation for all endpoints in server.js"
```

### 4. Architecture Review
```bash
"Analyze dependencies and find circular references"
```

### 5. Database Design
```bash
"Design a schema for a blog with users, posts, and comments"
```

---

## 📚 Documentation

<div align="center">

| Resource | Description |
|----------|-------------|
| [**📖 Wiki**](https://github.com/j0KZ/mcp-agents/wiki) | Complete documentation |
| [**🚀 Quick Start**](https://github.com/j0KZ/mcp-agents/wiki/Quick-Start) | Get started in 5 minutes |
| [**🔧 Configuration**](https://github.com/j0KZ/mcp-agents/wiki/Configuration) | Editor setup guides |
| [**💡 Examples**](examples/) | Real-world usage patterns |
| [**🐛 Troubleshooting**](https://github.com/j0KZ/mcp-agents/wiki/Troubleshooting) | Common issues & solutions |

</div>

---

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Clone the repo
git clone https://github.com/j0KZ/mcp-agents.git

# Install dependencies
npm install

# Run tests
npm test

# Build all packages
npm run build
```

---

## 📈 Project Stats

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/j0KZ/mcp-agents?style=social)](https://github.com/j0KZ/mcp-agents)
[![GitHub forks](https://img.shields.io/github/forks/j0KZ/mcp-agents?style=social)](https://github.com/j0KZ/mcp-agents/fork)
[![GitHub issues](https://img.shields.io/github/issues/j0KZ/mcp-agents)](https://github.com/j0KZ/mcp-agents/issues)
[![GitHub PRs](https://img.shields.io/github/issues-pr/j0KZ/mcp-agents)](https://github.com/j0KZ/mcp-agents/pulls)

</div>

---

## 📄 License

MIT © [j0KZ](https://github.com/j0KZ)

Each package is independently licensed under MIT.

---

<div align="center">

**Made with ❤️ for the AI developer community**

[Report Bug](https://github.com/j0KZ/mcp-agents/issues) · [Request Feature](https://github.com/j0KZ/mcp-agents/issues) · [Join Discussion](https://github.com/j0KZ/mcp-agents/discussions)

</div>