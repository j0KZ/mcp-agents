# MCP Agents Examples

Comprehensive examples and tutorials for all MCP tools.

## 📚 Quick Start

New to MCP Agents? Start here:

1. **[Getting Started](./tutorials/01-getting-started.md)** - Installation and first steps
2. **[Common Workflows](./tutorials/02-common-workflows.md)** - Real-world usage patterns
3. **[Advanced Usage](./tutorials/03-advanced-usage.md)** - Power user techniques
4. **[Best Practices](./tutorials/04-best-practices.md)** - Expert tips and guidelines

## 🛠️ Tool Examples

### [Test Generator](./test-generator/)
Generate comprehensive test suites automatically
- Basic test generation
- Edge cases and error handling
- Framework-specific examples (Jest, Vitest, Mocha)

### [Smart Reviewer](./smart-reviewer/)
AI-powered code review
- Pull request reviews
- Security-focused reviews
- Performance analysis
- Learning from feedback

### [API Designer](./api-designer/)
Design and document APIs
- REST API design
- OpenAPI spec generation
- Client SDK generation
- Mock server creation

### [Database Schema Designer](./db-schema/)
Design database schemas from requirements
- Schema generation (PostgreSQL, MySQL, MongoDB)
- ER diagram creation
- Migration file generation
- Index optimization

### [Refactor Assistant](./refactor-assistant/)
Modernize and improve code
- Callback to async/await conversion
- Conditional simplification
- Function extraction
- Design pattern application

### [Doc Generator](./doc-generator/)
Auto-generate documentation
- JSDoc comments
- API documentation
- README generation
- Changelog creation

### [Security Scanner](./security-scanner/)
Find security vulnerabilities
- SQL injection detection
- XSS vulnerabilities
- Hardcoded secrets
- OWASP Top 10 coverage

### [Architecture Analyzer](./architecture-analyzer/)
Analyze project structure
- Circular dependency detection
- Layer violation checks
- Dependency graph generation
- Code smell detection

## 🎯 Usage Patterns

### Pattern 1: TDD Workflow
```
1. Design API (API Designer)
2. Generate tests (Test Generator)
3. Implement code
4. Review (Smart Reviewer)
5. Scan for security (Security Scanner)
```

### Pattern 2: Legacy Code Modernization
```
1. Analyze architecture (Architecture Analyzer)
2. Add test coverage (Test Generator)
3. Refactor code (Refactor Assistant)
4. Security audit (Security Scanner)
5. Final review (Smart Reviewer)
```

### Pattern 3: New Feature Development
```
1. Design API (API Designer)
2. Design database (DB Schema Designer)
3. Generate docs (Doc Generator)
4. Implement with TDD
5. Security scan
6. Architecture check
```

## 💡 Quick Examples

### Generate Tests
```
Generate tests for src/calculator.js using vitest with edge cases
```

### Review Code
```
Review src/user-service.ts for security issues and performance problems
```

### Design API
```
Design a REST API for a blog with posts, comments, and users
```

### Scan Security
```
Scan src/ for vulnerabilities and generate a security report
```

### Refactor Code
```
Convert the callback functions in src/data-service.js to async/await
```

## 📖 Learning Path

### Beginner (Week 1-2)
- Start with Test Generator
- Learn basic prompts
- Generate simple tests
- Review outputs

### Intermediate (Week 3-4)
- Add Smart Reviewer
- Add Security Scanner
- Learn workflow patterns
- Combine multiple tools

### Advanced (Month 2-3)
- Master all 8 tools
- Create custom configurations
- CI/CD integration
- Team adoption

## 🎓 Tutorials by Use Case

### For Frontend Developers
- [API Designer] Design backend APIs
- [Test Generator] Generate component tests
- [Smart Reviewer] Review React/Vue code

### For Backend Developers
- [DB Schema Designer] Design databases
- [API Designer] Design REST/GraphQL APIs
- [Security Scanner] Find vulnerabilities

### For DevOps Engineers
- [Security Scanner] CI/CD integration
- [Architecture Analyzer] Monitor code quality
- [Doc Generator] Auto-generate docs

### For Team Leads
- [Smart Reviewer] Automated code reviews
- [Architecture Analyzer] Enforce standards
- [Security Scanner] Security compliance

## 🔧 Configuration Examples

See individual tool directories for configuration examples:
- `.testgenrc.js` - Test Generator config
- `.reviewrc.js` - Smart Reviewer rules
- `.mcprc.js` - Global MCP configuration

## 🤝 Contributing Examples

Have a great example or workflow? Contributions welcome!

1. Fork the repository
2. Add your example to appropriate directory
3. Update this README
4. Submit a pull request

## 📝 License

MIT - See LICENSE file for details

## 🔗 Links

- [GitHub Repository](https://github.com/j0KZ/mcp-agents)
- [NPM Packages](https://www.npmjs.com/~j0kz)
- [Documentation Wiki](https://github.com/j0KZ/mcp-agents/wiki)
- [Report Issues](https://github.com/j0KZ/mcp-agents/issues)
