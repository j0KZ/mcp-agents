# Publishing Guide

## Pre-publish Checklist

### Build All Packages

```bash
npm run build:all
```

### Test All Packages

```bash
cd packages/<package-name>
npm test
```

### Verify Package Contents

```bash
cd packages/<package-name>
npm pack --dry-run
```

## Publishing

### Individual Package

```bash
cd packages/<package-name>
npm publish --access public
```

### All Packages (use carefully)

```bash
./publish-all.sh
```

## Post-publish

1. Verify on npm: `https://www.npmjs.com/package/@j0kz/<package-name>`
2. Test installation: `npm install -g @j0kz/<package-name>`
3. Test MCP server: `<package-name> --version`

## Package List

- @j0kz/api-designer-mcp
- @j0kz/architecture-analyzer-mcp
- @j0kz/db-schema-mcp
- @j0kz/doc-generator-mcp
- @j0kz/refactor-assistant-mcp
- @j0kz/security-scanner-mcp
- @j0kz/smart-reviewer-mcp
- @j0kz/test-generator-mcp

## Notes

- All packages are scoped under `@j0kz`
- All packages have `publishConfig.access: public`
- License: MIT
- Repository: https://github.com/j0kz/mcp-agents
