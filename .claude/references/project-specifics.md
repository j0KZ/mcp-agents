# Project Specifics

## Package Structure

| Package | Scope | Description |
|---------|-------|-------------|
| `smart-reviewer` | `@j0kz/smart-reviewer-mcp` | AI-powered code review with learning |
| `test-generator` | `@j0kz/test-generator-mcp` | Automated test generation with edge cases |
| `architecture-analyzer` | `@j0kz/architecture-analyzer-mcp` | Circular deps, layer violations, diagrams |
| `security-scanner` | `@j0kz/security-scanner-mcp` | OWASP, secrets, vulnerabilities |
| `refactor-assistant` | `@j0kz/refactor-assistant-mcp` | Extract functions, simplify code |
| `api-designer` | `@j0kz/api-designer-mcp` | OpenAPI/Swagger, GraphQL schemas |
| `db-schema` | `@j0kz/db-schema-mcp` | Database schemas, migrations |
| `doc-generator` | `@j0kz/doc-generator-mcp` | JSDoc, README, changelog |
| `orchestrator-mcp` | `@j0kz/orchestrator-mcp` | Chain tools into workflows |
| `auto-pilot` | `@j0kz/auto-pilot` | Zero-effort automation |
| `shared` | `@j0kz/shared` | Common utilities for all packages |
| `config-wizard` | `@j0kz/mcp-config-wizard` | Interactive CLI setup |

## Development Commands

### Build & Test
```bash
npm run build          # Build all packages
npm test               # Run all tests
npm run test:coverage  # Run with coverage
npm run lint           # ESLint check
npm run format         # Prettier format
```

### Version Management
```bash
npm run version:sync          # Sync all package versions
npm run version:check-shared  # Verify @j0kz/shared version
npm run update:test-count     # Update test count in docs
```

### Publishing
```bash
npm run publish-all    # Build and publish all packages
```

### Skills Management
```bash
npm run skills:index     # Generate skill index
npm run skills:validate  # Validate skill structure
```

## Automation Scripts (scripts/)

| Script | Purpose |
|--------|---------|
| `sync-versions.js` | Sync version across all packages |
| `enforce-shared-version.js` | Ensure consistent @j0kz/shared version |
| `update-test-count.js` | Count tests and update README |
| `coverage-dashboard.js` | Generate coverage report |
| `validate-skills.js` | Validate skill file structure |
| `generate-skill-index.js` | Auto-generate skill INDEX.md |

## Version Management

- **Single source:** `version.json` at root
- **Sync command:** `npm run version:sync` updates all package.json files
- **Current version:** 1.1.1

## Common Existing Features

Before building new features, check these existing utilities:

### In @j0kz/shared
- `FileSystemManager` - File read/write with caching
- `AnalysisCache` - Results caching
- `PerformanceMonitor` - Timing and metrics
- `MCPPipeline` - Tool chaining
- `validatePath()` - Security path validation
- `createMCPResponse()` - Structured MCP responses

### In scripts/
- Version sync already automated
- Test counting already automated
- Coverage dashboard exists
- Skill validation exists

## Code Quality Targets

- **Max file size:** 300 LOC (extract to helpers/constants)
- **Max complexity:** 50 (use modular pattern)
- **ES Modules:** Always use `.js` extension in imports
- **Security:** Always validate paths, never execute user input

## Adding a New MCP Tool

1. Create `packages/<name>/` with:
   - `src/index.ts` - Exports
   - `src/mcp-server.ts` - MCP server setup
   - `src/<name>.ts` - Core logic
   - `src/types.ts` - TypeScript types
   - `package.json` - With `@j0kz/<name>-mcp` scope

2. Update root:
   - Add to `tools.json`
   - Add to `docker-compose.mcp.yml`
   - Run `npm run version:sync`

3. Test:
   - `npm run build -w @j0kz/<name>-mcp`
   - `npm test -w @j0kz/<name>-mcp`
