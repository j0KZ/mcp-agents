# Architecture Patterns

## Monorepo Structure

```
mcp-agents/
├── packages/
│   ├── shared/           # Common utilities (@j0kz/shared)
│   ├── smart-reviewer/   # MCP server package
│   ├── test-generator/   # MCP server package
│   └── ...               # 9 more packages
├── scripts/              # Automation scripts
├── docs/                 # Documentation
├── starter-kit/          # Project templates
└── docker/               # Docker configs
```

## MCP Server Package Pattern

Each MCP server follows this structure:

```
packages/<name>/
├── src/
│   ├── index.ts          # Public exports
│   ├── mcp-server.ts     # MCP protocol handler (thin layer)
│   ├── <name>.ts         # Core business logic
│   ├── types.ts          # TypeScript interfaces
│   ├── constants/        # Configuration constants
│   │   └── index.ts
│   └── helpers/          # Utility functions (if >300 LOC)
│       └── index.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Key Architectural Principles

### 1. Thin MCP Layer
- `mcp-server.ts` handles MCP protocol only
- All logic delegated to core files
- Easy to test core logic independently

### 2. Modular Extraction
When files exceed 300 LOC, extract to:
- `constants/` - Configuration, magic numbers
- `helpers/` - Pure utility functions
- `analyzers/` or `generators/` - Domain-specific modules

### 3. Shared Package First
Before adding code to a package, check if it belongs in `@j0kz/shared`:
- File operations → `fs/FileSystemManager`
- Caching → `cache/AnalysisCache`
- Performance → `performance/PerformanceMonitor`
- MCP utilities → `mcp-protocol/`

## Shared Package Structure

```
packages/shared/src/
├── index.ts              # All public exports
├── fs/                   # File system utilities
├── cache/                # Caching layer
├── performance/          # Metrics & monitoring
├── mcp-protocol/         # MCP helpers
├── validation.ts         # Path & input validation
├── helpers/              # General utilities
├── constants/            # Shared constants
└── types.ts              # Shared types
```

## Import Conventions

### ES Modules (Required)
```typescript
// Always use .js extension
import { FileSystemManager } from '@j0kz/shared/fs/index.js';
import { CONSTANTS } from './constants/index.js';

// NOT this (will fail):
import { FileSystemManager } from '@j0kz/shared/fs';
```

### Shared Package Imports
```typescript
// Preferred: import from main index
import { FileSystemManager, validatePath } from '@j0kz/shared';

// Also valid: direct submodule import
import { AnalysisCache } from '@j0kz/shared/cache/index.js';
```

## MCP Response Pattern

All MCP tools return structured responses:

```typescript
import { createMCPResponse } from '@j0kz/shared';

// Success
return createMCPResponse({
  success: true,
  data: result,
  metadata: { duration, cached }
});

// Error
return createMCPResponse({
  success: false,
  error: 'Description',
  code: 'ERROR_CODE'
});
```

## Security Patterns

### Path Validation (Required)
```typescript
import { validatePath } from '@j0kz/shared';

// Always validate user-provided paths
const safePath = validatePath(userPath, projectRoot);
if (!safePath) {
  throw new Error('Invalid path');
}
```

### Never Execute User Input
```typescript
// NEVER do this:
exec(userCommand);

// Instead, use predefined commands:
const allowedCommands = { lint: 'npm run lint', test: 'npm test' };
exec(allowedCommands[userChoice]);
```

## Testing Pattern

```typescript
// tests/<name>.test.ts
import { describe, it, expect } from 'vitest';
import { CoreLogic } from '../src/<name>.js';

describe('CoreLogic', () => {
  it('should handle valid input', () => {
    const result = CoreLogic.process(validInput);
    expect(result.success).toBe(true);
  });

  it('should reject invalid input', () => {
    expect(() => CoreLogic.process(invalidInput)).toThrow();
  });
});
```

## Anti-Patterns to Avoid

| Don't | Do Instead |
|-------|------------|
| Put logic in mcp-server.ts | Extract to core file |
| Create 500+ LOC files | Split into modules |
| Duplicate utilities | Add to @j0kz/shared |
| Skip path validation | Always use validatePath() |
| Use require() | Use ES Module imports |
| Hardcode values | Use constants/ directory |
