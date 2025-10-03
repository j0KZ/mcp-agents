# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **TypeScript monorepo** containing 8 Model Context Protocol (MCP) tools for AI-powered code analysis and generation. Each package is independently published to npm under the `@j0kz` scope and works with Claude Code, Cursor, Windsurf, and other MCP-compatible editors.

**The 8 MCP Tools:**
1. `smart-reviewer` - Code review and quality analysis
2. `test-generator` - Test suite generation
3. `architecture-analyzer` - Dependency and architecture analysis
4. `refactor-assistant` - Code refactoring tools
5. `api-designer` - REST/GraphQL API design
6. `db-schema` - Database schema design
7. `doc-generator` - Documentation generation
8. `security-scanner` - Security vulnerability scanning

**Shared Package:** `@j0kz/shared` (private) - Common utilities used by all tools including caching, performance monitoring, file system operations, and inter-MCP communication.

## Architecture & Code Organization

### Monorepo Structure
- **Root** manages workspace dependencies and shared build/test scripts
- **packages/** contains 8 published tools + 1 private shared package
- Each package has: `src/` (TypeScript), `dist/` (compiled), tests, and `mcp-server.ts` entrypoint

### Modular Architecture Pattern

**Recent Refactoring (refactor/complexity-reduction branch):**
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
  metadata: { /* ... */ }
};

// Or on error:
return {
  success: false,
  errors: [errorMessage]
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
