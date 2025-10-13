# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL SAFETY RULES - READ FIRST

### NEVER Delete Files Without Explicit Confirmation

**RULE 1: NEVER use `rm` or delete commands based on ambiguous user requests**

- ❌ WRONG: User says "remove it" → You delete files immediately
- ✅ CORRECT: User says "remove it" → You ask: "Do you want me to delete the files at [path]? This cannot be undone. Reply YES to confirm."

**RULE 2: ALWAYS confirm deletions with full context**

When user asks to remove/delete anything, respond with:
```
⚠️ DELETION CONFIRMATION REQUIRED

I will delete:
- [list all files/directories that will be deleted]
- [show total number of files]
- [indicate if they're in git or untracked]

⚠️ THIS CANNOT BE UNDONE

Type "YES DELETE" to confirm, or anything else to cancel.
```

**RULE 3: NEVER assume "remove" means delete**

"Remove" could mean:
- Remove from git tracking (but keep files)
- Remove from documentation (but keep code)
- Remove from build output (but keep source)
- Move to archive folder
- Comment out code

ALWAYS ask for clarification before deleting.

**RULE 4: For research/experimental code - TRIPLE CHECK**

If the code is in:
- `experimental/` folders
- `test-*/` directories
- Research/prototype code
- Code not in production

→ **EXTRA confirmation required** - explain what will be lost and ask if user wants to archive it first.

**RULE 5: Suggest alternatives before deletion**

Before deleting, suggest:
1. "Would you like me to move this to an archive folder instead?"
2. "Should I add this to .gitignore to hide it from git?"
3. "Do you want me to create a backup before deleting?"

---

## 📝 DOCUMENTATION & LOGGING REQUIREMENTS

### Automatic Work Documentation

**RULE 6: Document all significant work in recoverable logs**

For ANY substantial work (research, prototypes, experiments, new features), you MUST:

1. **Create the log file FIRST** before starting work:
   ```
   logs/work-{YYYY-MM-DD}-{description}.md
   ```

2. **Required log sections** (in this order):
   - **Header**: Title, Date, Status (In Progress/Completed/Blocked)
   - **Context** (if applicable): What led to this work, previous incidents, user requests
   - **Purpose**: What we're building and why
   - **Files Created/Modified**: Full list with paths and line numbers
   - **Key Implementation Details**: Subsections for each major component
   - **Code Snippets**: Core logic (not full files, but critical algorithms/patterns)
   - **Architecture Decisions**: Why certain approaches were chosen
   - **Verification**: Steps taken to prove it works
   - **Lessons Learned** (if applicable): What this prevents, what worked/didn't work
   - **Status Summary**: Final state and next steps

3. **Update workflow** (critical sequence):
   - **STEP 1**: Create log file BEFORE writing any code
   - **STEP 2**: Add initial sections (Purpose, Context)
   - **STEP 3**: Update after creating each significant file
   - **STEP 4**: Add code snippets as you implement key logic
   - **STEP 5**: Document decisions when making architectural choices
   - **STEP 6**: Add verification steps as you test
   - **STEP 7**: Finalize with lessons learned before ending session

**Example:** See [`logs/work-2025-10-12-bilingual-i18n.md`](logs/work-2025-10-12-bilingual-i18n.md) - comprehensive 503-line example

**Full template:** [`.claude/references/work-log-template.md`](.claude/references/work-log-template.md)

### When to Create Logs

**Create a work log when:**
- ✅ Building new research/experimental code
- ✅ Creating proof-of-concept implementations
- ✅ Developing features that span multiple files
- ✅ Working on anything not immediately committed to git
- ✅ User explicitly asks to document the work

**Don't create logs for:**
- ❌ Simple bug fixes (1-2 line changes)
- ❌ Routine maintenance tasks
- ❌ Documentation-only updates
- ❌ Running existing scripts

**Log benefits:** Recovery mechanism if files accidentally deleted, knowledge preservation, decision tracking

---

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

**Full details:** [`.claude/references/architecture-patterns.md`](.claude/references/architecture-patterns.md)

**Key Points:**
- **Monorepo:** 9 published MCP tools + shared package + config wizard
- **Modular pattern:** Extract constants/helpers/utilities when files exceed 300 LOC
- **Shared package:** `@j0kz/shared` provides FileSystemManager, AnalysisCache, PerformanceMonitor, MCPPipeline
- **MCP servers:** Thin orchestration layer delegating to core logic files

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

### Standardization & Automation

**CRITICAL: We use standardized patterns to eliminate manual updates**

See **[docs/STANDARDIZATION.md](docs/STANDARDIZATION.md)** for complete details.

#### ✅ Already Standardized (Use These!)

**1. Version Management** (via `version.json`)
```bash
# Single source of truth for ALL package versions
# Location: version.json at root
# Current: 1.0.35 (always check version.json)

# To release a new version:
1. Edit version.json ONLY
2. npm run version:sync        # Auto-updates all packages
3. Update CHANGELOG.md manually
4. npm run build && npm run publish-all
5. git commit -m "release: v1.0.X" && git tag v1.0.X && git push --tags
```

**2. Installation Commands** (always use `@latest`)
```bash
# ✅ CORRECT - Always use @latest in documentation
npx @j0kz/mcp-agents@latest
npx @j0kz/smart-reviewer-mcp@latest

# ❌ WRONG - Never hardcode versions
npx @j0kz/mcp-agents@1.0.35
```

**3. Test Count Updates** (automated script)
```bash
# After adding/removing tests, run:
npm run update:test-count

# This auto-updates:
# - README.md badge
# - wiki/Home.md badge
# - CHANGELOG.md metrics
```

**4. Tool Metadata** (centralized in `tools.json`)
```javascript
// Single source of truth for all 9 MCP tools
// Location: tools.json at root
// Contains: name, package, description, features, wiki links
// Use this for generating documentation
```

#### 📋 Standardization Rules

**URL Casing (IMPORTANT!):**
- GitHub URLs: `https://github.com/j0KZ/mcp-agents` (capital K, Z)
- npm packages: `@j0kz/package-name` (lowercase)
- Never mix these up!

**Version References:**
- ✅ Read from `version.json`
- ✅ Use `@latest` in docs
- ❌ Never hardcode version numbers

**Test Counts:**
- ✅ Run `npm run update:test-count`
- ❌ Never manually edit test counts

**Coverage Badges:**
- ✅ Use dynamic Codecov badge (auto-updates)
- ❌ Don't hardcode percentages

#### 🚀 Release Checklist

**Full process:** [`.claude/references/release-process.md`](.claude/references/release-process.md)

**Quick summary:** Update test counts → Edit version.json → Sync versions → Update CHANGELOG → Build → Publish → Tag → Push

#### ❌ Never Do These:

- ❌ Manually edit version in package.json files (use `version.json`)
- ❌ Hardcode version numbers in docs (use `@latest`)
- ❌ Manually update test counts (run `npm run update:test-count`)
- ❌ Use different versions across packages (all synced from `version.json`)
- ❌ Forget to run `npm run version:sync` after editing `version.json`

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

### Dependency Versions

**Current versions:** Check root `package.json` and `packages/shared/package.json`

**Key dependencies:** `@modelcontextprotocol/sdk`, `typescript`, `vitest`, `lru-cache` (in shared)

## Development Process & Best Practices

### Proactive Problem-Solving Mindset

**CRITICAL: Complete the entire job, don't wait to be asked multiple times**

When given a task, think through the COMPLETE workflow and execute all logical follow-up steps:

#### The "Audit → Fix → Document" Pattern

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

#### Anticipate Logical Next Steps

When you discover problems during analysis, **automatically fix them** if:
- ✅ The fix is obvious (outdated docs, wrong counts, etc.)
- ✅ The fix is safe (documentation, non-breaking changes)
- ✅ It's part of completing the task (audit → update docs)

**Never make the user ask you 2-3 times to finish a job.**

#### Before Starting Any Task

**1. Understand Current State FIRST**
   ```bash
   # Before proposing any new feature, check:
   - Read relevant existing code
   - Check scripts/ directory for existing automation
   - Search @j0kz/shared for existing utilities
   - Review tools.json for tool capabilities
   - Check documentation for accuracy
   ```

**2. Identify Real Gaps AND Fixable Issues**
   - What's actually missing vs what already exists?
   - What's wrong that you can fix immediately?
   - Is this solving a real problem or adding complexity?
   - Can existing code be enhanced instead of adding new code?

**3. Design Complete Solution (Not Just First Step)**
   - Think: "What are ALL the steps to truly complete this?"
   - Example: Audit → Fix Issues → Update Docs → Commit
   - Don't stop halfway and wait for the user to prompt you again
   - Start with the smallest change that solves the ENTIRE problem

**4. Execute Thoroughly**
   - Fix what you find during analysis
   - Update all related documentation
   - Run verification steps
   - Commit everything together
   - Present complete results, not partial work

### Feature Audit Checklist

Before implementing any feature, validate:

| Question | Check |
|----------|-------|
| **Does this solve a real problem?** | Not "might be nice" - actual pain point |
| **Does something already solve this?** | Search codebase, scripts/, shared/src/ |
| **Is this the right place?** | Right package? Or better in shared? Or different tool? |
| **What's the minimum version?** | Can it be simpler? Smaller? Reuse more? |
| **Will users understand it?** | Simple API? Not too many options? |

### Common Existing Features (Check Before Building)

**Validation & Checks:**
- ✅ Version sync: `npm run version:sync` and `version:check-shared`
- ✅ Test counting: `npm run update:test-count`
- ✅ File validation: `packages/shared/src/validation.ts` (340+ lines)
- ✅ Path security: `packages/shared/src/security/path-validator.ts`

**File Operations:**
- ✅ File system: `packages/shared/src/fs/` (FileSystemManager, FileWatcher, BatchOperations)
- ✅ Caching: `packages/shared/src/cache/` (AnalysisCache with LRU)
- ✅ Smart resolver: Path resolution and normalization

**Workflow & Pipeline:**
- ✅ MCPPipeline: `packages/shared/src/integration/` with retry, error handling, dependencies
- ✅ Orchestrator workflows: Pre-built workflows in `packages/orchestrator-mcp/src/workflows.ts`
- ✅ Error recovery: `continueOnError` flag already in MCPPipeline

**Performance:**
- ✅ Performance monitoring: `packages/shared/src/performance/`
- ✅ Memory profiler: Built into shared package
- ✅ Batch processing: Parallel file operations

### Anti-Patterns to Avoid

❌ **Don't Do This:**
1. Create new package when existing one can be enhanced
2. Build validation that already exists in scripts/
3. Add features without checking what workflows actually do
4. Copy competitor features without understanding if they apply
5. Add "nice to have" features that create complexity
6. Design solutions before understanding the problem
7. Create backups/rollback for read-only operations

✅ **Do This Instead:**
1. Enhance existing packages (add to orchestrator, not new package)
2. Reuse existing scripts (npm run version:sync, etc.)
3. Understand tool domain (read-only? generates files? modifies code?)
4. Evaluate if competitor features match your use case
5. Only add features that solve actual problems
6. Audit codebase first, design second
7. Only backup when actually modifying critical files

## Working with the Codebase

### Adding a New MCP Tool

1. Create directory in `packages/your-tool/`
2. Add `package.json` with proper bin/main/types fields
3. Create `src/mcp-server.ts` implementing MCP protocol
4. Add core logic in separate files
5. Import shared utilities from `@j0kz/shared`
6. Add tests using Vitest
7. Add to root workspace in root `package.json`
8. **Add to `tools.json`** - Register the new tool:
   ```json
   {
     "id": "your-tool",
     "name": "Your Tool Name",
     "package": "@j0kz/your-tool-mcp",
     "description": "What it does",
     "category": "analysis|generation|refactoring|design|orchestration",
     "features": ["Feature 1", "Feature 2"],
     "wikiPage": "Your-Tool"
   }
   ```
9. Run `npm run version:sync` to auto-set version
10. Update wiki page count (9 → 10 tools) using search & replace

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
