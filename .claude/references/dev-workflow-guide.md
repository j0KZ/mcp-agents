# Development Process & Best Practices

This guide outlines the development workflow and best practices for working on the MCP agents monorepo.

---

## Proactive Problem-Solving Mindset

**CRITICAL: Complete the entire job, don't wait to be asked multiple times**

When given a task, think through the COMPLETE workflow and execute all logical follow-up steps.

### The "Audit → Fix → Document" Pattern

**❌ BAD (Requires Multiple Prompts):**

```
User: "audit the project"
You: [runs audit, finds test count is wrong] "Test count is 366 but should be 388"
User: "update the documentation"
You: [updates README] "Updated README"
User: "update the wiki too"
You: [updates wiki] "Updated wiki"
```

**✅ GOOD (Complete Job in One Go):**

```
User: "audit the project"
You:
1. [runs audit, finds test count is wrong]
2. [fixes test counter script]
3. [updates README, CHANGELOG, package docs]
4. [updates wiki and publishes]
5. [commits everything]
"Audit complete! Found test count was wrong (366→388). Fixed:
- Test counter script (ANSI handling)
- All documentation (README, CHANGELOG, tools.json)
- Wiki (published to GitHub)
All changes committed."

Note: Only ask before destructive actions (delete, force push, npm publish)
```

---

## Anticipate Logical Next Steps

When you discover problems during analysis, **automatically fix them** if:

- ✅ The fix is obvious (outdated docs, wrong counts, etc.)
- ✅ The fix is safe (documentation, non-breaking changes)
- ✅ It's part of completing the task (audit → update docs)

**Never make the user ask you 2-3 times to finish a job.**

---

## Before Starting Any Task

### 1. Understand Current State FIRST

```bash
# Before proposing any new feature, check:
- Read relevant existing code
- Check scripts/ directory for existing automation
- Search @j0kz/shared for existing utilities
- Review tools.json for tool capabilities
- Check documentation for accuracy
```

### 2. Identify Real Gaps AND Fixable Issues

- What's actually missing vs what already exists?
- What's wrong that you can fix immediately?
- Is this solving a real problem or adding complexity?
- Can existing code be enhanced instead of adding new code?

### 3. Design Complete Solution (Not Just First Step)

- Think: "What are ALL the steps to truly complete this?"
- Example: Audit → Fix Issues → Update Docs → Commit
- Don't stop halfway and wait for the user to prompt you again
- Start with the smallest change that solves the ENTIRE problem

### 4. Execute Thoroughly

- Fix what you find during analysis
- Update all related documentation
- Run verification steps
- Commit everything together
- Present complete results, not partial work

---

## Feature Audit Checklist

Before implementing any feature, validate:

| Question                               | Check                                                  |
| -------------------------------------- | ------------------------------------------------------ |
| **Does this solve a real problem?**    | Not "might be nice" - actual pain point                |
| **Does something already solve this?** | Search codebase, scripts/, shared/src/                 |
| **Is this the right place?**           | Right package? Or better in shared? Or different tool? |
| **What's the minimum version?**        | Can it be simpler? Smaller? Reuse more?                |
| **Will users understand it?**          | Simple API? Not too many options?                      |

---

## Common Existing Features (Check Before Building)

### Automation Scripts (`scripts/` directory)

- `sync-versions.js` - Single source of truth for version numbers
- `update-test-count.js` - Auto-count tests across packages
- `coverage-dashboard.js` - Generate coverage reports
- `validate-skills.js` - Validate skill file format
- `index-skills.js` - Auto-generate skills index

### Shared Utilities (`@j0kz/shared`)

- **FileSystemManager** - Validated file operations
- **AnalysisCache** - Performance caching
- **PerformanceMonitor** - Execution timing
- **MCPPipeline** - Multi-tool orchestration
- **formatResponse** - Response format optimization
- **validatePath** - Security path validation

### MCP Protocol Helpers

- `createMCPResponse()` - Standard response wrapper
- `createErrorResponse()` - Error handling
- `RESPONSE_FORMAT_SCHEMA` - Response format type definitions

### Validation & Quality

- Pre-commit hooks (if configured)
- Test coverage tracking
- Code quality metrics (<300 LOC, <50 complexity)

**Full list:** See [project-specifics.md](./project-specifics.md)

---

## Anti-Patterns to Avoid

### ❌ Don't Do This:

1. **Create new package when existing one can be enhanced**
   - Example: Adding new analysis tool when smart-reviewer can be extended

2. **Build validation that already exists in scripts/**
   - Example: Writing custom version sync when `npm run version:sync` exists

3. **Add features without checking what workflows actually do**
   - Example: Adding workflow tool without understanding orchestrator-mcp

4. **Copy competitor features without understanding if they apply**
   - Example: Adding features from generic code review tools that don't fit MCP context

5. **Add "nice to have" features that create complexity**
   - Example: Adding 10 configuration options when 2 would suffice

6. **Design solutions before understanding the problem**
   - Example: Proposing architecture before reading existing code

7. **Create backups/rollback for read-only operations**
   - Example: Backing up files before running analysis tools

### ✅ Do This Instead:

1. **Enhance existing packages** (add to orchestrator, not new package)
   - Example: Add new workflow to orchestrator-mcp

2. **Reuse existing scripts** (npm run version:sync, etc.)
   - Example: Use `npm run update:test-count` instead of manual updates

3. **Understand tool domain** (read-only? generates files? modifies code?)
   - Example: smart-reviewer = read-only analysis, test-generator = file creation

4. **Evaluate if competitor features match your use case**
   - Example: Does this feature make sense for MCP protocol context?

5. **Only add features that solve actual problems**
   - Example: Add features based on user pain points, not hypothetical scenarios

6. **Audit codebase first, design second**
   - Example: Read existing implementations before proposing changes

7. **Only backup when actually modifying critical files**
   - Example: Backup before refactoring, not before analysis

---

## Code Quality Standards

### File Size Limits

- **Target:** <300 lines per file
- **Action:** Extract constants, helpers, utilities when exceeded
- **Pattern:** Create separate files (e.g., `constants.ts`, `helpers.ts`, `utils.ts`)

### Complexity Limits

- **Target:** <50 cyclomatic complexity
- **Action:** Refactor complex functions into smaller units
- **Tool:** Use `analyze_architecture` to identify violations

### Testing Requirements

- **Coverage target:** >80% for new code
- **Pattern:** Co-locate tests with source (`*.test.ts` next to `*.ts`)
- **Command:** `npm test` or `npx vitest run`

### Documentation Standards

- **JSDoc:** Required for public APIs
- **README:** Required for each package
- **CHANGELOG:** Update on feature/breaking changes
- **Examples:** Include usage examples in docs

---

## Git Workflow

### Commit Message Format

```
type(scope): description

Examples:
feat(smart-reviewer): add severity filtering
fix(test-generator): handle edge case in assertions
docs(readme): update installation instructions
chore(deps): bump typescript to 5.3.0
```

### Branch Naming

```
feat/feature-name
fix/bug-description
docs/update-readme
chore/dependency-update
```

### Pull Request Process

1. **Before PR:** Run `npm test` and `npm run build`
2. **PR Description:** Explain what, why, and how
3. **Link Issues:** Reference related issues
4. **Review:** Address all feedback before merging

---

## Package Development Workflow

### Adding a New MCP Tool

1. **Check if it belongs in existing package first**
2. Create package directory: `packages/new-tool-name/`
3. Copy structure from existing tool (smart-reviewer is good template)
4. Update `package.json` with @j0kz scope
5. Add to root `package.json` workspaces
6. Update `tools.json` with metadata
7. Add tests in `src/*.test.ts`
8. Document in package `README.md`
9. Build: `npm run build --workspace=@j0kz/new-tool-name`
10. Test: `npm test --workspace=@j0kz/new-tool-name`

### Modifying Existing Packages

1. **Read existing code first** - understand current implementation
2. **Check shared utilities** - reuse FileSystemManager, AnalysisCache, etc.
3. **Follow existing patterns** - maintain consistency
4. **Update tests** - add/modify test cases
5. **Update docs** - README, JSDoc, CHANGELOG
6. **Verify build** - `npm run build`
7. **Run tests** - `npm test`

---

## Debugging & Troubleshooting

### Common Issues

**Build Errors:**
```bash
npm run build --workspace=@j0kz/package-name
```

**Test Failures:**
```bash
npm test --workspace=@j0kz/package-name -- --reporter=verbose
```

**Type Errors:**
```bash
npx tsc --noEmit
```

**Linting Issues:**
```bash
npx eslint packages/package-name/src/
```

### Performance Issues

Use PerformanceMonitor from @j0kz/shared:
```typescript
import { PerformanceMonitor } from '@j0kz/shared';

const monitor = new PerformanceMonitor();
monitor.start('operation-name');
// ... your code
monitor.end('operation-name');
console.log(monitor.getReport());
```

---

## Working with the Codebase

### Quick Reference

- **Adding MCP tools:** See "Adding a New MCP Tool" above
- **Modifying packages:** See "Modifying Existing Packages" above
- **Code quality targets:** <300 LOC, <50 complexity
- **Test coverage target:** >80%
- **Build command:** `npm run build`
- **Test command:** `npm test`
- **Publish:** `npm run publish-all` (requires approval)

### Full Details

For complete information about:
- Package structure
- Development commands
- Automation scripts
- Shared utilities
- Architecture patterns

**See:** [project-specifics.md](./project-specifics.md) and [architecture-patterns.md](./architecture-patterns.md)

---

## Summary: The Complete Job Mindset

When given ANY task:

1. ✅ **Understand** - Read existing code, check for existing solutions
2. ✅ **Identify** - Find real gaps AND fixable issues
3. ✅ **Design** - Plan complete solution (not just first step)
4. ✅ **Execute** - Fix, document, verify, commit
5. ✅ **Complete** - Present full results, not partial work

**Goal:** User says "do X" → You complete X + logical follow-ups in one session

**Only ask before:** Destructive actions (delete, force push, npm publish)
