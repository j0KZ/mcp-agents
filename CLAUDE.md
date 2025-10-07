# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **TypeScript monorepo** containing **11 packages** for AI-powered code analysis and generation. Each package is independently published to npm under the `@j0kz` scope (except `shared` which is private) and works with Claude Code, Cursor, Windsurf, and other MCP-compatible editors.

**The 9 Core MCP Tools:**

1. `smart-reviewer` - Code review and quality analysis
2. `test-generator` - Test suite generation
3. `architecture-analyzer` - Dependency and architecture analysis
4. `refactor-assistant` - Code refactoring tools
5. `api-designer` - REST/GraphQL API design
6. `db-schema` - Database schema design
7. `doc-generator` - Documentation generation
8. `security-scanner` - Security vulnerability scanning
9. `orchestrator-mcp` - MCP workflow orchestration and chaining

**Supporting Packages:**

- `@j0kz/shared` (private) - Common utilities used by all tools including caching, performance monitoring, file system operations, and inter-MCP communication
- `config-wizard` - Installation and configuration wizard for MCP tools

## Architecture & Code Organization

### Monorepo Structure

- **Root** manages workspace dependencies and shared build/test scripts
- **packages/** contains 9 published tools + 1 private shared package
- Each package has: `src/` (TypeScript), `dist/` (compiled), tests, and `mcp-server.ts` entrypoint

### Modular Architecture Pattern

**Standard Refactoring Pattern (Established 2025):**

All MCP packages follow a consistent modularization approach:

1. **Extract Constants** → `constants/` directory
   - Magic numbers, thresholds, patterns
   - Single source of truth for configuration values
   - Makes tuning behavior trivial

2. **Extract Helpers** → `helpers/` directory
   - Complex calculations (30+ lines)
   - Reusable business logic
   - Independently testable functions

3. **Extract Utilities** → `utils/` directory
   - Cross-cutting concerns (error handling, validation)
   - Eliminate code duplication
   - Shared across multiple modules

**Example: Well-Modularized Package Structure**
```
packages/security-scanner/src/
├── mcp-server.ts          # MCP protocol (orchestration only)
├── scanner.ts             # Main class (delegates to modules)
├── constants/
│   ├── security-thresholds.ts
│   └── secret-patterns.ts
├── scanners/              # Specialized scanners
│   ├── owasp-scanner.ts
│   └── dependency-scanner.ts
└── utils.ts               # Shared utilities
```

**Refactoring Results (2025 Systematic Cleanup):**

4 packages refactored following the pattern above:
- **security-scanner**: 395 → 209 LOC (-47%), Score 57 → 100
- **db-schema**: 411 → 262 LOC (-36%), Score 75 → 97
- **refactor-assistant**: 456 → 407 LOC (-11%), Score 67 → 67 (already clean)
- **architecture-analyzer**: 382 → 287 LOC (-25%), estimated Score 65 → 85

**Cumulative Impact:**
- -36% average complexity reduction
- +122% maintainability improvement
- -52% duplicate code blocks eliminated
- 0 test failures, 0 breaking changes

**When to Apply This Pattern:**
- File exceeds 300 LOC
- More than 5 magic numbers
- Functions exceed 30 lines
- Duplicate code blocks detected
- Complexity score >70

### Shared Package Integration

Each tool imports from `@j0kz/shared` for common functionality:

- **FileSystemManager** - File operations with caching
- **AnalysisCache** - LRU cache for analysis results (30min TTL)
- **PerformanceMonitor** - Performance tracking and metrics
- **MCPPipeline/MCPIntegration** - Inter-MCP communication
- **Path validation** - Security utilities for preventing traversal attacks

Example usage:

```typescript
import { FileSystemManager, AnalysisCache, PerformanceMonitor } from '@j0kz/shared';
```

### MCP Server Pattern

Every tool follows the same MCP server structure:

- `src/mcp-server.ts` - Entrypoint that implements MCP protocol
- Exposes tools via `@modelcontextprotocol/sdk`
- Main logic in separate files (e.g., `analyzer.ts`, `generator.ts`, `scanner.ts`)
- Uses `ListToolsRequestSchema` and `CallToolRequestSchema` from MCP SDK

## Development Commands

### Building

```bash
# Build all packages
npm run build

# Build specific package
npm run build:reviewer
npm run build:test-gen
npm run build:arch

# Or build individual package
npm run build -w packages/smart-reviewer
```

### Testing

```bash
# Run all tests (uses vitest for each package)
npm test

# Run tests for specific package
npm run test -w packages/smart-reviewer

# Run tests in CI mode
npm run test:ci

# Run with coverage
npm run test:coverage
```

**Test Configuration:** Each package uses Vitest with the root `vitest.config.ts`:

- 30-second timeout per test
- Parallel execution (max 4 threads)
- v8 coverage provider
- Excludes: node_modules, dist, mcp-server.ts

### Development

```bash
# Watch mode for development
npm run dev

# Watch specific package
npm run dev -w packages/smart-reviewer
```

### Publishing

```bash
# Build and publish all packages (requires npm auth)
npm run publish-all
```

### Version Management

**CRITICAL: All packages use a single source of truth for versions**

This monorepo uses **`version.json`** as the single source of truth for all package versions:

- ✅ **Global version file:** `version.json` at root
- ✅ **Current version:** `1.0.25` (check version.json)
- ✅ **Auto-sync script:** Syncs all packages from version.json
- ✅ **Why:** Single place to update, impossible to have version mismatches

**To release a new version:**

```bash
# 1. Update version.json
echo '{"version":"1.0.26","description":"Global version for all MCP packages"}' > version.json

# 2. Sync all packages automatically
npm run version:sync

# 3. Update CHANGELOG and README
# - Update version badge in README.md
# - Add new section to CHANGELOG.md

# 4. Build and publish
npm run build
npm run publish-all
cd installer && npm publish

# 5. Commit and tag
git add .
git commit -m "release: v1.0.26"
git tag v1.0.26
git push && git push --tags
```

**Adding new MCP packages:**

1. Create in `packages/your-package/`
2. Run `npm run version:sync` - it will automatically get the global version
3. No manual version management needed!

**Never:**

- ❌ Manually edit version in package.json files
- ❌ Use different versions across packages
- ❌ Forget to run `npm run version:sync` after updating version.json

## Important Patterns & Conventions

### Import/Export Style

- **ES Modules only** (`"type": "module"` in all package.json)
- Import TypeScript files with `.js` extension: `import { foo } from './bar.js'`
- This is required for TypeScript ESM compilation

### Security Considerations

- **Input validation**: All file paths validated to prevent traversal attacks
- **ReDoS protection**: Regex patterns use bounded quantifiers (e.g., `{1,500}`)
- **Size limits**: Input code limited to 100KB in refactoring operations
- **Line length checks**: Skip lines >1000 chars to prevent ReDoS

### Error Handling Pattern

All tools return structured results with success/failure indicators:

```typescript
return {
  success: true,
  data: result,
  metadata: {
    /* ... */
  },
};

// Or on error:
return {
  success: false,
  errors: [errorMessage],
};
```

### Dependency Versions (as of v1.0.16)

- `@anthropic-ai/sdk`: ^0.64.0
- `@modelcontextprotocol/sdk`: ^1.18.2
- `lru-cache`: ^11.0.2 (in shared package)
- `typescript`: ^5.3.3
- `vitest`: ^3.2.4

## Working with the Codebase

### Adding a New MCP Tool

1. Create directory in `packages/`
2. Add `package.json` with proper bin/main/types fields
3. Create `src/mcp-server.ts` implementing MCP protocol
4. Add core logic in separate files
5. Import shared utilities from `@j0kz/shared`
6. Add tests using Vitest
7. Add to root workspace in root `package.json`

### Modifying Existing Tools

- Keep main files focused on orchestration
- Extract complex logic into separate modules (see refactoring pattern above)
- Use shared utilities instead of duplicating code
- Maintain backward compatibility in public APIs
- Update tests to verify changes

### Code Quality Targets

- Keep individual files under 300 LOC when possible (500 max)
- Complexity threshold: aim for <50 per file
- Extract duplicate code blocks into shared functions
- Use named constants instead of magic numbers
- Document complex algorithms with comments
- Follow the modular architecture pattern above for consistency
