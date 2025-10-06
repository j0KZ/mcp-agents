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

**Recent Refactoring (v1.0.27 - October 2025):**
**Phase 1-3** systematic refactoring completed with MCP-validated improvements:

**Security Scanner (Perfect Score 100/100 ⭐):**

- **Before**: Score 57/100, Complexity 71, Maintainability 11, 35 duplicate blocks
- **After**: Score 100/100, Complexity 33, Maintainability 38, 2 duplicate blocks
- **Improvements**: +75% score, -54% complexity, +245% maintainability, -94% duplicates
- **Changes**:
  - Extracted 30+ magic numbers into `constants/security-thresholds.ts` and `constants/secret-patterns.ts`
  - Created modular scanners: `scanners/owasp-scanner.ts`, `scanners/dependency-scanner.ts`
  - Added 6 utility functions in `utils.ts` to eliminate duplication
  - Expanded secret patterns from 9 to 20 (Google API, Stripe, Twilio, etc.)
  - Reduced from 395 to 209 lines (-47%)

**DB Schema Designer (Near Perfect 97/100 ⭐):**

- **Before**: Score 75/100, Complexity 83, Maintainability 14, 22 duplicate blocks
- **After**: Score 97/100, Complexity 42, Maintainability 31, 13 duplicate blocks
- **Improvements**: +29% score, -49% complexity, +121% maintainability, -41% duplicates
- **Changes**:
  - Extracted 27 magic numbers into `constants/schema-limits.ts` (8 categories)
  - Created `helpers/index-optimizer.ts` - 5 index suggestion functions (146 lines)
  - Created `helpers/normalization-helper.ts` - 5 normalization functions (119 lines)
  - Created `helpers/sql-builder.ts` - SQL generation utilities (46 lines)
  - Reduced from 411 to 262 lines (-36%)

**Refactor Assistant (Stable 67/100):**

- **Before**: Score 67/100, Complexity 84, Maintainability 12, 24 duplicate blocks
- **After**: Score 67/100, Complexity 78, Maintainability 13, 24 duplicate blocks
- **Improvements**: -7% complexity, +8% maintainability
- **Changes**:
  - Extracted 30 magic numbers into `constants/refactoring-limits.ts` (5 categories)
  - Created `utils/error-helpers.ts` - eliminated 6 duplicate error handlers
  - Already well-modularized from previous work, focused on constants and utilities
  - Reduced from 456 to 407 lines (-11%)

**Overall Phase 1-3 Impact:**

- ✅ +33% average score (66 → 88)
- ✅ -36% complexity reduction (79 → 51)
- ✅ +122% maintainability (12 → 27)
- ✅ -52% duplicate blocks (81 → 39)
- ✅ 0 security vulnerabilities (validated by Security Scanner MCP)
- ✅ 100% test pass rate (622/622 tests passing)
- ✅ 59% code coverage (deduplicated): 59% statements, 67% branches, 74% functions

**Previous Refactoring (refactor/complexity-reduction branch):**
Three major packages were refactored to reduce complexity by extracting logic into specialized modules:

1. **api-designer/src/**
   - `designer.ts` - Main exports (reduced from 1003 to 723 LOC)
   - `generators/openapi-generator.ts` - OpenAPI spec generation logic (394 LOC)
   - Pattern: Extract generation logic from orchestration

2. **refactor-assistant/src/**
   - `refactorer.ts` - Core refactoring operations (reduced from 787 to 638 LOC)
   - `patterns/index.ts` - All 10 design pattern implementations (303 LOC)
   - `core/extract-function.ts` - Function extraction logic
   - `analysis/metrics-calculator.ts` - Metrics and duplicate detection
   - Pattern: Separate patterns, analysis, and core operations

3. **smart-reviewer/src/**
   - `analyzer.ts` - Main CodeAnalyzer class (reduced from 472 to 182 LOC)
   - `analyzers/code-quality.ts` - Issue detection (153 LOC)
   - `analyzers/metrics.ts` - Metrics calculation and scoring (137 LOC)
   - `analyzers/patterns.ts` - Auto-fix application (35 LOC)
   - `analyzers/index.ts` - Exports all analyzer functions
   - Pattern: Extract detection, metrics, and fixes into focused modules

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

- Keep individual files under 500 LOC when possible
- Complexity threshold: aim for <50 per file
- Extract duplicate code blocks into shared functions
- Use named constants instead of magic numbers
- Document complex algorithms with comments

## Recent Changes (refactor/complexity-reduction)

The latest work reduced code complexity by 31.8% across three packages:

- Extracted specialized modules for generation, patterns, and analysis
- Updated dependencies to latest stable versions
- All 23 tests passing
- Zero breaking changes to public APIs

When modifying these packages, maintain the modular structure by keeping orchestration separate from implementation details.
