# Contributing to @j0kz MCP Agents

Thank you for your interest in contributing! 🎉

## Quick Start

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/YOUR_USERNAME/mcp-agents.git`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes**
5. **Test your changes**: `npm run build && npm test`
6. **Commit**: `git commit -m "feat: add amazing feature"`
7. **Push**: `git push origin feature/your-feature-name`
8. **Open a Pull Request**

## Development Setup

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Test all packages
npm test

# Lint code
npm run lint
```

## Project Structure

```
mcp-agents/
├── packages/
│   ├── smart-reviewer/       # Code review MCP
│   ├── test-generator/       # Test generation MCP
│   ├── architecture-analyzer/# Architecture analysis MCP
│   ├── doc-generator/        # Documentation MCP
│   ├── security-scanner/     # Security scanning MCP
│   ├── refactor-assistant/   # Refactoring MCP
│   ├── api-designer/         # API design MCP
│   └── db-schema/            # Database design MCP
└── ...
```

## Adding a New MCP

1. Create a new package directory in `packages/`
2. Copy structure from existing package
3. Implement MCP server in `src/mcp-server.ts`
4. Add tools using MCP SDK
5. Write README with examples
6. Add to root README
7. Update install scripts

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Build/config changes

## Code Style

- TypeScript with strict mode
- Use ESLint and Prettier
- Write clear comments
- Add JSDoc for public APIs

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test with actual MCP clients

## Documentation

- Update README for changes
- Add usage examples
- Document new tools/features

## Questions?

- Open an issue for discussion
- Check existing issues first
- Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under MIT License.
