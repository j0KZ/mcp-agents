# Registration & Publishing Checklist

## Pre-Registration Validation

### 1. Package Structure
- [ ] Directory created: `packages/{tool-name}/`
- [ ] Source files in `src/` directory
- [ ] Tests in `tests/` directory
- [ ] Build output in `dist/` directory
- [ ] README.md with examples
- [ ] LICENSE file (MIT)

### 2. Package.json Requirements
```json
{
  "name": "@j0kz/{tool}-mcp",        // ✓ Correct scope
  "version": "1.1.0",                // ✓ From version.json
  "type": "module",                  // ✓ ES modules
  "main": "./dist/index.js",         // ✓ Entry point
  "bin": {                           // ✓ CLI executable
    "{tool}-mcp": "dist/mcp-server.js"
  }
}
```

### 3. File Size Validation
```bash
# Check all files are under 300 LOC
find src -name "*.ts" -exec wc -l {} \; | sort -n

# Verify mcp-server.ts is thin
wc -l src/mcp-server.ts  # Should be < 150 LOC
```

## tools.json Registration

### Required Entry

Add to root `tools.json`:

```json
{
  "id": "your-tool",              // Lowercase, kebab-case
  "name": "Your Tool Name",       // Title case
  "package": "@j0kz/your-tool-mcp", // npm package name
  "description": "Brief description of functionality",
  "category": "analysis",         // Valid category
  "features": [                   // 3-5 key features
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  "wikiPage": "Your-Tool"        // PascalCase wiki page
}
```

### Valid Categories
- `analysis` - Code analysis, metrics, quality
- `generation` - Code/test generation
- `refactoring` - Code transformation
- `design` - API/DB design
- `orchestration` - Workflow coordination

## Version Synchronization

### CRITICAL: Never Set Version Manually

```bash
# 1. Check current version
cat version.json
# Output: {"version": "1.1.0"}

# 2. Sync all packages
npm run version:sync

# Expected output:
# ✅ packages/your-tool → 1.1.0
# ✅ 13 file(s) updated to version 1.1.0

# 3. Verify shared dependency
npm run version:check-shared

# Expected: ✅ All packages use shared@^1.1.0
```

### What Gets Updated
- All package.json files
- installer/index.js VERSION constant
- Dependency on @j0kz/shared

## Workspace Registration

### Add to Root package.json

```json
{
  "workspaces": [
    "packages/*",        // Already covers new package
    "installer"
  ]
}
```

### Verify Workspace

```bash
# Install dependencies
npm install

# List workspaces
npm ls --workspaces

# Should show:
# @j0kz/mcp-agents@1.1.0
# ├── @j0kz/your-tool-mcp@1.1.0
# └── ... other packages
```

## Build Verification

### Build Steps

```bash
# 1. Build TypeScript
npm run build -w packages/your-tool

# 2. Verify dist structure
ls -la packages/your-tool/dist/
# Should contain:
# - mcp-server.js (executable)
# - main-logic.js
# - helpers/*.js
# - types.d.ts files

# 3. Test the build
node packages/your-tool/dist/mcp-server.js
# Should output: "Your Tool MCP server running on stdio"
```

## Test Validation

### Run All Tests

```bash
# Package tests
npm test -w packages/your-tool

# With coverage
npm run test:coverage -w packages/your-tool

# Coverage should be:
# - Lines: >70%
# - Functions: >70%
# - Branches: >70%
```

### Update Global Test Count

```bash
# After adding tests
npm run update:test-count

# Updates:
# - README.md badge
# - wiki/Home.md
# - CHANGELOG.md
```

## Import Validation

### Check .js Extensions

```bash
# All imports must use .js
grep -r "from '\./.*'" packages/your-tool/src/

# Should return nothing (all should have .js)
# ✅ from './helper.js'
# ❌ from './helper'
```

## Pre-Publish Checklist

### Local Testing

```bash
# 1. Test as MCP server
cd packages/your-tool
npm start

# 2. Test with sample input
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | npm start

# 3. Verify package contents
npm pack --dry-run
# Check only includes: dist/, README.md, LICENSE
```

### Final Validation

- [ ] All tests passing
- [ ] Coverage >70%
- [ ] No files >300 LOC
- [ ] mcp-server.ts <150 LOC
- [ ] Imports use .js extension
- [ ] Registered in tools.json
- [ ] Version synced from version.json
- [ ] README with examples
- [ ] Build creates dist/
- [ ] Package.json has "type": "module"

## Publishing Process

### 1. Build All Packages

```bash
# From root
npm run build
```

### 2. Publish to npm

```bash
# Requires npm authentication
npm run publish-all

# Or individually
cd packages/your-tool
npm publish
```

### 3. Verify Publication

```bash
# Check npm registry
npm view @j0kz/your-tool-mcp

# Test installation
npx @j0kz/your-tool-mcp@latest
```

### 4. Git Operations

```bash
# Commit
git add .
git commit -m "feat: add your-tool MCP package"

# Tag
git tag v1.1.0
git push origin main
git push --tags
```

## Post-Publish Verification

### npm Registry

```bash
# Verify latest version
npm view @j0kz/your-tool-mcp version
# Should show: 1.1.0

# Check all files published
npm view @j0kz/your-tool-mcp files
```

### Installation Test

```bash
# Global install
npm install -g @j0kz/your-tool-mcp

# Run
your-tool-mcp

# Via npx
npx @j0kz/your-tool-mcp@latest
```

### Update Documentation

- [ ] Update main README.md if needed
- [ ] Add to tools comparison table
- [ ] Update wiki with tool page
- [ ] Add to CHANGELOG.md

## Common Issues

### Issue: Version Mismatch

```bash
# Error: @j0kz/shared version mismatch
# Fix:
npm run version:sync
npm run version:check-shared
```

### Issue: Build Fails

```bash
# Error: Cannot find module './helper'
# Fix: Add .js extension
# from './helper' → from './helper.js'
```

### Issue: Workspace Not Found

```bash
# Error: Unknown workspace
# Fix: Run from root
cd ../..  # Go to monorepo root
npm install
```

### Issue: Tests Fail After Build

```bash
# Error: Cannot find dist/
# Fix: Build first
npm run build
npm test
```

## Success Indicators

✅ Package appears on npmjs.com
✅ Installation works globally
✅ MCP server starts correctly
✅ Tools list includes your tool
✅ All tests pass with >70% coverage
✅ No files exceed 300 LOC
✅ Follows modular architecture