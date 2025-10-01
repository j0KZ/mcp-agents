#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const packages = [
  {
    name: 'smart-reviewer-mcp',
    displayName: 'Smart Reviewer',
    description: 'AI-powered code review with quality metrics and automated fixes',
    example1: 'Review the auth.js file',
    example1Result: '*Analyzes code* Found 3 issues: unused variable, missing error handling, inconsistent formatting. Here are fixes...',
    example2: 'Check code quality metrics for src/',
    example2Result: 'Complexity: 8.5/10, Maintainability: 75%, Test Coverage: 82%. Suggestions: Extract method in processUser()...',
    example3: 'What code smells are in this file?',
    example3Result: 'Detected: Long method (calculateTotal - 150 lines), Feature Envy (uses Customer data), Duplicate code...',
    features: [
      '🔍 **Deep Code Analysis** - Find bugs, code smells, and anti-patterns',
      '📊 **Quality Metrics** - Complexity, maintainability, coverage scores',
      '🤖 **Auto-Fix** - Automatically apply suggested improvements',
      '⚡ **Fast Reviews** - Analyze entire projects in seconds'
    ]
  },
  {
    name: 'test-generator-mcp',
    displayName: 'Test Generator',
    description: 'Generate comprehensive test suites with edge cases and mocks',
    example1: 'Generate tests for calculatePrice function',
    example1Result: '*Creates test file* Generated 15 tests covering: happy path, edge cases (negative prices, zero), error handling, boundary conditions...',
    example2: 'Add tests for the UserService class',
    example2Result: 'Created UserService.test.js with: 8 unit tests, 4 integration tests, mocked dependencies, 95% coverage...',
    example3: 'What test cases am I missing for login.js?',
    example3Result: 'Missing: Invalid email format, expired tokens, rate limiting, concurrent sessions, SQL injection attempts...',
    features: [
      '✨ **Smart Test Generation** - Creates complete test suites automatically',
      '🎯 **Edge Case Detection** - Finds boundary conditions you might miss',
      '🔧 **Mock Generation** - Auto-creates mocks for dependencies',
      '📈 **Coverage Optimization** - Targets high coverage with minimal tests'
    ]
  },
  {
    name: 'architecture-analyzer-mcp',
    displayName: 'Architecture Analyzer',
    description: 'Detect circular dependencies, layer violations, and generate dependency graphs',
    example1: 'Analyze project architecture',
    example1Result: '*Scans codebase* Found: 2 circular dependencies (auth ↔ user), 3 layer violations (UI calls Database directly)...',
    example2: 'Generate dependency graph for src/services',
    example2Result: '*Creates Mermaid diagram* [Shows visual graph] AuthService → UserService → Database, PaymentService → External API...',
    example3: 'What architectural issues should I fix first?',
    example3Result: 'Priority 1: Break circular dependency in auth module. Priority 2: Add service layer between UI and Database...',
    features: [
      '🔍 **Circular Dependency Detection** - Find and break dependency cycles',
      '📐 **Layer Violation Analysis** - Enforce clean architecture',
      '📊 **Visual Dependency Graphs** - Mermaid diagrams of your code structure',
      '🎯 **Refactoring Suggestions** - Actionable improvement recommendations'
    ]
  },
  {
    name: 'doc-generator-mcp',
    displayName: 'Documentation Generator',
    description: 'Auto-generate JSDoc, README, and API documentation from code',
    example1: 'Document the API endpoints in server.js',
    example1Result: '*Generates OpenAPI spec* Created swagger.json with 12 endpoints, parameters, responses, and examples...',
    example2: 'Create JSDoc comments for UserService',
    example2Result: '*Adds documentation* Added @param, @returns, @throws for all 8 methods with descriptions and type info...',
    example3: 'Generate README for this project',
    example3Result: '*Analyzes code* Created README with: Overview, Installation, API Reference, Usage Examples, Configuration...',
    features: [
      '📝 **JSDoc Generation** - Complete function and class documentation',
      '📚 **README Creation** - Professional project documentation',
      '🔌 **API Docs** - OpenAPI/Swagger specs from code',
      '⚡ **Markdown Tables** - Clean documentation formatting'
    ]
  },
  {
    name: 'security-scanner-mcp',
    displayName: 'Security Scanner',
    description: 'Scan for vulnerabilities, OWASP issues, and security best practices',
    example1: 'Scan for security vulnerabilities',
    example1Result: '*Analyzing code* Found: SQL injection risk in query builder, XSS in template, hardcoded API key, outdated dependency...',
    example2: 'Check OWASP Top 10 compliance',
    example2Result: 'Issues: A03:Injection (2 cases), A05:Security Misconfiguration (JWT secret in code), A06:Outdated Components...',
    example3: 'What security issues are critical?',
    example3Result: 'CRITICAL: SQL injection in /api/users. HIGH: Hardcoded credentials in config.js. MEDIUM: Missing rate limiting...',
    features: [
      '🛡️ **Vulnerability Detection** - SQL injection, XSS, CSRF, and more',
      '📋 **OWASP Top 10** - Check compliance with security standards',
      '🔒 **Secrets Detection** - Find hardcoded credentials and API keys',
      '🔍 **Dependency Scanning** - Detect vulnerable packages'
    ]
  },
  {
    name: 'refactor-assistant-mcp',
    displayName: 'Refactoring Assistant',
    description: 'Intelligent code refactoring with pattern detection and suggestions',
    example1: 'Refactor this function to be more readable',
    example1Result: '*Analyzes code* Suggestions: Extract 3 methods, rename variables (x→userId), remove nested ifs, add early returns...',
    example2: 'Extract reusable patterns from these files',
    example2Result: '*Finds patterns* Common code in formatDate (used 8x), validation logic (5x). Created shared utils with 40% code reduction...',
    example3: 'How can I improve this class design?',
    example3Result: 'Apply: Single Responsibility (split UserManager), Dependency Injection (remove hardcoded DB), Strategy pattern for validators...',
    features: [
      '♻️ **Smart Refactoring** - Extract methods, rename, remove duplication',
      '🎯 **Pattern Detection** - Find code smells and anti-patterns',
      '📏 **SOLID Principles** - Enforce clean code practices',
      '🔄 **Safe Transformations** - Preserve behavior while improving structure'
    ]
  },
  {
    name: 'api-designer-mcp',
    displayName: 'API Designer',
    description: 'Design REST and GraphQL APIs with OpenAPI generation',
    example1: 'Design a REST API for user management',
    example1Result: '*Creates design* Endpoints: GET/POST /users, GET/PUT/DELETE /users/:id, POST /users/:id/verify. Includes auth, validation...',
    example2: 'Generate OpenAPI spec for my Express app',
    example2Result: '*Analyzes routes* Created openapi.yaml with: 15 endpoints, request/response schemas, authentication, error codes...',
    example3: 'Review API design best practices',
    example3Result: 'Issues: Missing versioning (/v1/), inconsistent naming (getUser vs fetch_order), no rate limiting, missing HATEOAS links...',
    features: [
      '🎨 **API Design** - Create REST and GraphQL APIs from requirements',
      '📄 **OpenAPI Generation** - Auto-generate Swagger/OpenAPI specs',
      '✅ **Best Practices** - RESTful conventions, versioning, error handling',
      '🔍 **Design Review** - Check API consistency and completeness'
    ]
  },
  {
    name: 'db-schema-mcp',
    displayName: 'Database Schema Designer',
    description: 'Design database schemas with migrations and relationship analysis',
    example1: 'Design a schema for an e-commerce app',
    example1Result: '*Creates schema* Tables: users, products, orders, order_items with relationships, indexes, constraints. Includes migration SQL...',
    example2: 'Generate migrations for PostgreSQL',
    example2Result: '*Analyzes changes* Created: 001_create_users.sql, 002_add_indexes.sql, 003_add_constraints.sql with rollback support...',
    example3: 'Optimize this database schema',
    example3Result: 'Suggestions: Add index on user_id (used in 80% of queries), denormalize order_total, partition orders by date...',
    features: [
      '🗄️ **Schema Design** - Create optimized database structures',
      '🔄 **Migration Generation** - SQL migrations with up/down scripts',
      '🔗 **Relationship Analysis** - Detect and fix relationship issues',
      '⚡ **Performance Optimization** - Index suggestions and query optimization'
    ]
  }
];

const template = (pkg) => `# @j0kz/${pkg.name}

> ${pkg.description}

[![npm version](https://img.shields.io/npm/v/@j0kz/${pkg.name})](https://www.npmjs.com/package/@j0kz/${pkg.name})
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Quick Start (30 seconds)

### One-Time Setup

Pick your editor and run **ONE** command:

**Claude Code:**
\`\`\`bash
claude mcp add ${pkg.name.replace('-mcp', '')} "npx @j0kz/${pkg.name}" --scope user
\`\`\`

**Cursor:** Add to \`~/.cursor/mcp_config.json\`
\`\`\`json
{
  "mcpServers": {
    "${pkg.name.replace('-mcp', '')}": {
      "command": "npx",
      "args": ["@j0kz/${pkg.name}"]
    }
  }
}
\`\`\`

**Windsurf / Roo Code / Continue:** Similar config - [see full guide](https://github.com/j0kz/mcp-agents#editor-setup)

### Start Using Immediately

After setup, just chat naturally with your AI:

\`\`\`
💬 You: "${pkg.example1}"
🤖 AI: ${pkg.example1Result}

💬 You: "${pkg.example2}"
🤖 AI: ${pkg.example2Result}

💬 You: "${pkg.example3}"
🤖 AI: ${pkg.example3Result}
\`\`\`

## ✨ Features

${pkg.features.map(f => f).join('\n')}

## 📦 Complete @j0kz MCP Suite

Get all 8 professional development tools - install individually or all at once:

\`\`\`bash
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
\`\`\`

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
- Check: \`claude mcp list\` (Claude Code) to verify connection

**Commands not working?**
- Make sure Node.js is installed (\`node --version\`)
- Try reinstalling: Remove and re-add the MCP

**Still stuck?**
- [Open an issue](https://github.com/j0kz/mcp-agents/issues)
- [Check full documentation](https://github.com/j0kz/mcp-agents)

## 📄 License

MIT © [j0kz](https://github.com/j0kz)

---

**Explore more tools:** [github.com/j0kz/mcp-agents](https://github.com/j0kz/mcp-agents) | **npm:** [@j0kz](https://www.npmjs.com/~j0kz)
`;

console.log('🔄 Generating simple, clear READMEs for all 8 packages...\n');

packages.forEach(pkg => {
  const readmePath = path.join(__dirname, 'packages', pkg.name.replace('-mcp', ''), 'README.md');
  const content = template(pkg);

  fs.writeFileSync(readmePath, content, 'utf-8');
  console.log(`✅ Updated ${pkg.name}/README.md`);
});

console.log('\n✨ All READMEs updated with simple, clear instructions!\n');
console.log('Next steps:');
console.log('1. Review the READMEs');
console.log('2. npm run build');
console.log('3. npm version patch --workspaces --no-git-tag-version');
console.log('4. Publish to NPM');
