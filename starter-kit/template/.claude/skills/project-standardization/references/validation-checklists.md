# Validation Checklists

## Pre-Commit Checklist

Before committing version changes:
- [ ] Edited `version.json` only (never package.json directly)
- [ ] Ran `npm run version:sync`
- [ ] Ran `npm run version:check-shared`
- [ ] Updated `CHANGELOG.md` manually with changes
- [ ] Ran `npm test` (all tests pass)
- [ ] Updated test count if tests changed: `npm run update:test-count`
- [ ] Ran `npm run build` (builds successfully)
- [ ] Verified URL casing (GitHub: j0KZ, npm: j0kz)

## Pre-Publish Checklist

Before publishing packages:
- [ ] All packages built (`dist/` directories exist)
- [ ] All tests passing across workspaces
- [ ] Documentation updated:
  - [ ] README.md with latest features
  - [ ] CHANGELOG.md with version notes
  - [ ] Test count badges accurate
- [ ] Wiki synchronized with README
- [ ] Git commit created with conventional format
- [ ] Git tag created (`v1.1.0` format)
- [ ] tools.json updated if features changed

## Post-Publish Checklist

After publishing:
- [ ] Verify on npm: `npm view @j0kz/mcp-agents version`
- [ ] Test installation: `npx @j0kz/mcp-agents@latest`
- [ ] Push git tags: `git push --tags`
- [ ] Update GitHub release (optional)
- [ ] Verify all packages published:
  ```bash
  npm view @j0kz/smart-reviewer-mcp version
  npm view @j0kz/test-generator-mcp version
  # ... check all 11 packages
  ```
- [ ] Test installer: `npx @j0kz/mcp-agents@latest`
- [ ] Check npm page renders correctly

## Workspace Management Validation

When adding new package:
- [ ] Package created under `packages/` directory
- [ ] package.json includes proper:
  - [ ] Name: `@j0kz/[tool-name]-mcp`
  - [ ] Version matches version.json
  - [ ] Dependencies include `@j0kz/shared`
- [ ] Added to root workspace configuration
- [ ] Verified with: `npm ls --workspaces`
- [ ] Updated tools.json with new tool metadata
- [ ] Created MCP server file structure:
  ```
  packages/new-tool/
  ├── src/
  │   ├── mcp-server.ts
  │   ├── constants/
  │   ├── helpers/
  │   └── utils/
  ├── tests/
  ├── package.json
  └── vitest.config.ts
  ```

## tools.json Validation

When updating tools.json:
- [ ] Version matches version.json
- [ ] Tool entry includes all required fields:
  - [ ] id (lowercase, kebab-case)
  - [ ] name (Title Case)
  - [ ] package (@j0kz/[name]-mcp)
  - [ ] description (concise, clear)
  - [ ] category (valid category)
  - [ ] features (3-5 key features)
  - [ ] wikiPage (PascalCase)
- [ ] Categories section updated if new category
- [ ] No duplicate tool IDs
- [ ] Package names match actual npm packages

## Common Command Quick Reference

```bash
# Version management
npm run version:sync              # Sync all versions
npm run version:check-shared      # Verify shared versions

# Testing
npm test                          # Run all tests
npm run update:test-count         # Update test badges

# Building
npm run build                     # Build all packages
npm run dev                       # Watch mode

# Publishing
npm run publish-all               # Publish all packages

# Validation
npm run skills:validate           # Validate all skills
npm run skills:index              # Update skill index
```

## Script File Locations

Critical automation scripts:
```
scripts/sync-versions.js          # Version synchronization
scripts/update-test-count.js      # Test count automation
scripts/enforce-shared-version.js # Shared package validation
scripts/generate-skill-index.js   # Skill catalog generation
scripts/validate-skills.js        # Skill validation
```

## Getting Help

Check current state:
```bash
cat version.json                  # Current version
npm run version:check-shared      # Package consistency
git status                        # Uncommitted changes
npm ls --workspaces              # Workspace structure
```

Review automation:
```bash
ls scripts/                       # List all scripts
cat scripts/sync-versions.js      # Read script details
```