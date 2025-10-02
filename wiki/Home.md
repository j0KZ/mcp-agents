# MCP Agents Wiki

Welcome to the **MCP Agents** wiki! This is your comprehensive guide to using, integrating, and extending our suite of professional MCP (Model Context Protocol) tools for AI code editors.

<div align="center">

![MCP Agents](https://img.shields.io/badge/MCP-Agents-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-3178c6?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

## 📚 Table of Contents

### Getting Started
- **[Quick Start Guide](Quick-Start)** - Get up and running in 5 minutes
- **[Installation](Installation)** - Detailed installation instructions
- **[Configuration](Configuration)** - Configure MCPs for your editor
- **[First Steps](First-Steps)** - Your first MCP workflow

### MCP Tools Documentation

#### Code Quality & Analysis
- **[Smart Reviewer](Smart-Reviewer)** - AI-powered code review with auto-fixes
- **[Architecture Analyzer](Architecture-Analyzer)** - Detect circular dependencies and layer violations
- **[Test Generator](Test-Generator)** - Automated test generation with edge cases

#### Security & Performance
- **[Security Scanner](Security-Scanner)** - Find vulnerabilities and secrets
- **[Refactor Assistant](Refactor-Assistant)** - Extract functions, apply design patterns

#### API & Database Design
- **[API Designer](API-Designer)** - Generate OpenAPI specs and GraphQL schemas
- **[DB Schema Designer](DB-Schema-Designer)** - Design database schemas and migrations

#### Documentation
- **[Doc Generator](Doc-Generator)** - Auto-generate JSDoc, README, and API docs

### Integration & Advanced Usage

- **[Shared Utilities](Shared-Utilities)** - Modular shared package documentation
- **[Integration Patterns](Integration-Patterns)** - Chain MCPs together
- **[Performance Optimization](Performance-Optimization)** - Caching and batch processing
- **[Event-Driven Architecture](Event-Driven-Architecture)** - Real-time MCP communication
- **[Custom Workflows](Custom-Workflows)** - Build your own pipelines

### IDE Integration

- **[Claude Code](IDE-Claude-Code)** - Setup for Claude Code
- **[Cursor](IDE-Cursor)** - Setup for Cursor
- **[Windsurf](IDE-Windsurf)** - Setup for Windsurf
- **[Roo Code](IDE-Roo-Code)** - Setup for Roo Code
- **[Generic MCP Client](IDE-Generic)** - Any MCP-compatible editor

### Development

- **[Contributing](Contributing)** - How to contribute
- **[Development Setup](Development-Setup)** - Set up local development
- **[Architecture](Architecture)** - System architecture overview
- **[API Reference](API-Reference)** - Complete API documentation
- **[Testing Guide](Testing-Guide)** - Writing and running tests

### Troubleshooting & Support

- **[Common Issues](Common-Issues)** - FAQ and solutions
- **[Troubleshooting](Troubleshooting)** - Debug MCP issues
- **[Performance Tips](Performance-Tips)** - Optimize MCP performance
- **[Error Codes](Error-Codes)** - Error code reference

### Resources

- **[Examples](Examples)** - Real-world usage examples
- **[Recipes](Recipes)** - Common workflow recipes
- **[Best Practices](Best-Practices)** - Recommended patterns
- **[Changelog](Changelog)** - Version history
- **[Roadmap](Roadmap)** - Future plans

---

## 🚀 Quick Links

| Tool | Description | npm Package |
|------|-------------|-------------|
| [Smart Reviewer](Smart-Reviewer) | AI-powered code review | [@j0kz/smart-reviewer-mcp](https://www.npmjs.com/package/@j0kz/smart-reviewer-mcp) |
| [Test Generator](Test-Generator) | Automated test generation | [@j0kz/test-generator-mcp](https://www.npmjs.com/package/@j0kz/test-generator-mcp) |
| [Architecture Analyzer](Architecture-Analyzer) | Architecture analysis | [@j0kz/architecture-analyzer-mcp](https://www.npmjs.com/package/@j0kz/architecture-analyzer-mcp) |
| [Security Scanner](Security-Scanner) | Security vulnerability scanning | [@j0kz/security-scanner-mcp](https://www.npmjs.com/package/@j0kz/security-scanner-mcp) |
| [API Designer](API-Designer) | API design and generation | [@j0kz/api-designer-mcp](https://www.npmjs.com/package/@j0kz/api-designer-mcp) |
| [DB Schema Designer](DB-Schema-Designer) | Database schema design | [@j0kz/db-schema-mcp](https://www.npmjs.com/package/@j0kz/db-schema-mcp) |
| [Doc Generator](Doc-Generator) | Documentation generation | [@j0kz/doc-generator-mcp](https://www.npmjs.com/package/@j0kz/doc-generator-mcp) |
| [Refactor Assistant](Refactor-Assistant) | Code refactoring | [@j0kz/refactor-assistant-mcp](https://www.npmjs.com/package/@j0kz/refactor-assistant-mcp) |

---

## 🎯 What are MCP Agents?

MCP Agents is a suite of **8 professional-grade tools** that extend AI code editors with powerful capabilities:

### Core Features

✅ **Code Quality**
- Smart code review with auto-fixes
- Architecture analysis and dependency graphs
- Automated test generation

✅ **Security**
- Vulnerability scanning (OWASP Top 10)
- Secret detection and hardcoded credentials
- Dependency security auditing

✅ **Design Tools**
- API design (REST, GraphQL, OpenAPI)
- Database schema design (PostgreSQL, MySQL, MongoDB)
- Mock server generation

✅ **Productivity**
- Automatic documentation generation
- Code refactoring assistance
- Design pattern application

✅ **Integration**
- Modular architecture with shared utilities
- Pipeline and workflow orchestration
- Event-driven communication

---

## 🏁 Getting Started in 3 Steps

### Step 1: Install

```bash
# Install globally
npm install -g @j0kz/smart-reviewer-mcp @j0kz/test-generator-mcp

# Or use npx (no installation)
npx @j0kz/smart-reviewer-mcp
```

### Step 2: Configure

Add to your MCP client configuration (e.g., Claude Code, Cursor):

```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["-y", "@j0kz/smart-reviewer-mcp"]
    },
    "test-generator": {
      "command": "npx",
      "args": ["-y", "@j0kz/test-generator-mcp"]
    }
  }
}
```

### Step 3: Use

In your AI editor:
```
Review the file src/index.ts and suggest improvements
```

The AI will automatically use the Smart Reviewer MCP to provide detailed code analysis!

---

## 💡 Example Workflows

### Workflow 1: Code Quality Pipeline

```
1. Ask AI to analyze architecture → Architecture Analyzer runs
2. Ask AI to review code quality → Smart Reviewer runs
3. Ask AI to generate tests → Test Generator runs
4. Ask AI to refactor issues → Refactor Assistant runs
```

### Workflow 2: API Development

```
1. Describe your API → API Designer generates OpenAPI spec
2. Design database → DB Schema Designer creates schema
3. Generate mock server → API Designer creates implementation
4. Add tests → Test Generator creates test suite
```

### Workflow 3: Security Audit

```
1. Scan for vulnerabilities → Security Scanner analyzes code
2. Generate security tests → Test Generator creates security tests
3. Document findings → Doc Generator creates report
4. Fix issues → Refactor Assistant suggests fixes
```

---

## 🔗 External Resources

- **[GitHub Repository](https://github.com/j0kz/mcp-agents)** - Source code
- **[npm Organization](https://www.npmjs.com/~j0kz)** - Published packages
- **[Issue Tracker](https://github.com/j0kz/mcp-agents/issues)** - Bug reports and features
- **[MCP Protocol](https://modelcontextprotocol.io)** - Official MCP documentation

---

## 🤝 Community

- 🐛 [Report a Bug](https://github.com/j0kz/mcp-agents/issues/new?template=bug_report.md)
- 💡 [Request a Feature](https://github.com/j0kz/mcp-agents/issues/new?template=feature_request.md)
- 📖 [Improve Documentation](https://github.com/j0kz/mcp-agents/wiki)
- 🤝 [Contributing Guide](Contributing)

---

## 📄 License

This project is licensed under the [MIT License](https://github.com/j0kz/mcp-agents/blob/main/LICENSE).

---

<div align="center">

**[Get Started](Quick-Start)** | **[Browse Tools](Smart-Reviewer)** | **[View Examples](Examples)** | **[Get Help](Troubleshooting)**

Made with ❤️ by the MCP community

</div>
