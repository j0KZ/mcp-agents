# Contributing to MCP Agent Toolkit

First off, thank you for considering contributing to the MCP Agent Toolkit! It's people like you that make this toolkit such a great tool for the AI developer community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- A code editor with TypeScript support
- Familiarity with MCP (Model Context Protocol)

### Repository Structure

```
my-claude-agents/
├── packages/              # 9 MCP tools + shared utilities
│   ├── smart-reviewer/    # Code review tool
│   ├── test-generator/    # Test generation tool
│   ├── architecture-analyzer/
│   ├── refactor-assistant/
│   ├── api-designer/
│   ├── db-schema/
│   ├── doc-generator/
│   ├── security-scanner/
│   ├── orchestrator-mcp/
│   └── shared/           # Shared utilities (private)
├── installer/            # Installation wizard
├── templates/            # CI/CD templates
├── examples/             # Usage examples
└── docs/                # Documentation
```

## Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/my-claude-agents.git
   cd my-claude-agents
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Build all packages**
   ```bash
   npm run build
   ```

5. **Run tests**
   ```bash
   npm test
   ```

6. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, editor)
- Relevant logs or error messages

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- A detailed description of the proposed functionality
- Examples of how it would be used
- Why this enhancement would be useful

### 🔧 Contributing Code

#### Areas We Need Help With

- **New MCP Tools**: Create new tools that follow our patterns
- **Test Coverage**: Add tests to reach 80% coverage
- **Documentation**: Improve docs, add examples, fix typos
- **Performance**: Optimize existing tools
- **Bug Fixes**: Fix issues from the issue tracker
- **Editor Support**: Add support for new MCP-compatible editors

## Development Workflow

### 1. Working on a Package

```bash
# Navigate to specific package
cd packages/smart-reviewer

# Make changes
# ...

# Run package tests
npm test

# Build the package
npm run build
```

### 2. Adding a New MCP Tool

1. Create directory in `packages/`
2. Copy structure from existing tool
3. Update `package.json`:
   ```json
   {
     "name": "@j0kz/your-tool-mcp",
     "version": "1.0.33",
     "type": "module",
     "main": "./dist/mcp-server.js",
     "bin": {
       "your-tool-mcp": "./dist/mcp-server.js"
     }
   }
   ```
4. Implement MCP server in `src/mcp-server.ts`
5. Add core logic in separate files
6. Import shared utilities from `@j0kz/shared`
7. Add comprehensive tests
8. Update root workspace

### 3. Version Management

**IMPORTANT**: We use centralized versioning!

```bash
# Update version for ALL packages
echo '{"version":"1.0.34"}' > version.json
npm run version:sync

# This updates all package.json files automatically
```

Never manually edit versions in individual package.json files!

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Provide proper types (avoid `any`)
- Use ES modules (`import`/`export`)

### Code Style

- Use Prettier for formatting (config provided)
- Use ESLint for linting (config provided)
- Follow existing patterns in the codebase
- Keep functions small and focused
- Extract constants and magic numbers
- Add JSDoc comments for public APIs

### File Organization

```typescript
// Good structure for an MCP tool
src/
├── mcp-server.ts      // MCP protocol implementation
├── analyzer.ts        // Core logic
├── types.ts          // TypeScript types
├── constants/        // Constants and configurations
│   └── thresholds.ts
├── utils/            // Utility functions
│   └── helpers.ts
└── analyzers/        // Modular components
    ├── metrics.ts
    └── patterns.ts
```

### Error Handling

```typescript
// Use structured error responses
return {
  success: false,
  errors: ['Detailed error message'],
  metadata: {
    errorCode: 'FILE_NOT_FOUND',
    suggestion: 'Check file path'
  }
};
```

## Testing Guidelines

### Test Requirements

- All new features must have tests
- Maintain minimum 75% coverage
- Test edge cases and error conditions
- Use meaningful test descriptions

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  describe('Scenario', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = myFunction(input);

      // Assert
      expect(result).toBe('expected');
    });

    it('should handle error case', () => {
      expect(() => myFunction(null)).toThrow();
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific package tests
npm test -w packages/smart-reviewer

# Watch mode
npm run dev
```

## Pull Request Process

### 1. Before Submitting

- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Coverage maintained (`npm run test:coverage`)
- [ ] Code formatted (`npm run format`)
- [ ] Commit messages follow conventional commits

### 2. PR Guidelines

- **Title**: Clear and descriptive
- **Description**:
  - What changes were made
  - Why they were made
  - How to test them
- **Link Issues**: Reference related issues
- **Small PRs**: Keep changes focused
- **Screenshots**: Include for UI changes

### 3. Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```bash
feat(security-scanner): add support for Python files
fix(db-schema): handle null requirements gracefully
docs: update installation guide for Windsurf
test(api-designer): add GraphQL schema tests
```

### 4. Review Process

1. Automated checks run (tests, linting)
2. Maintainer reviews code
3. Address feedback
4. Maintainer approves and merges

## Release Process

Releases are managed by maintainers:

1. **Update version**
   ```bash
   echo '{"version":"1.0.34"}' > version.json
   npm run version:sync
   ```

2. **Update documentation**
   - Update CHANGELOG.md
   - Update README badges
   - Update migration guides if needed

3. **Build and test**
   ```bash
   npm run build
   npm test
   npm run test:coverage
   ```

4. **Publish**
   ```bash
   npm run publish-all
   ```

5. **Tag release**
   ```bash
   git tag v1.0.34
   git push --tags
   ```

## Getting Help

- **Discord**: [Join our community](https://discord.gg/mcp-agents) (if available)
- **Issues**: [GitHub Issues](https://github.com/j0KZ/mcp-agents/issues)
- **Discussions**: [GitHub Discussions](https://github.com/j0KZ/mcp-agents/discussions)
- **Wiki**: [Documentation Wiki](https://github.com/j0KZ/mcp-agents/wiki)

## Recognition

Contributors are recognized in:
- CHANGELOG.md (for significant contributions)
- GitHub contributors page
- Special thanks in release notes

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MCP Agent Toolkit! 🎉