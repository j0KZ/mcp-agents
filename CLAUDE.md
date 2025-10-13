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

**TypeScript monorepo** with **9 MCP tools** + shared package + config wizard under `@j0kz` scope.

**Full details:** [`.claude/references/project-specifics.md`](.claude/references/project-specifics.md)

## Architecture & Code Organization

**Full details:** [`.claude/references/architecture-patterns.md`](.claude/references/architecture-patterns.md)

**Key Points:**
- **Monorepo:** 9 published MCP tools + shared package + config wizard
- **Modular pattern:** Extract constants/helpers/utilities when files exceed 300 LOC
- **Shared package:** `@j0kz/shared` provides FileSystemManager, AnalysisCache, PerformanceMonitor, MCPPipeline
- **MCP servers:** Thin orchestration layer delegating to core logic files

## Development Commands & Workflow

**Commands:** `npm run build`, `npm test`, `npm run dev`, `npm run publish-all`

**Automation:** version.json (single source), tools.json (metadata), automated test counting

**Full details:** [`.claude/references/project-specifics.md`](.claude/references/project-specifics.md)

## Important Patterns & Conventions

**Key patterns:** ES Modules (.js imports), security validation, structured error responses

**Full details:** [`.claude/references/project-specifics.md`](.claude/references/project-specifics.md)

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

**Check first:** Validation scripts, file operations (@j0kz/shared), MCPPipeline, performance monitoring

**Full list:** [`.claude/references/project-specifics.md`](.claude/references/project-specifics.md)

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

**Quick reference:** Adding MCP tools, modifying packages, code quality targets (<300 LOC, <50 complexity)

**Full guide:** [`.claude/references/project-specifics.md`](.claude/references/project-specifics.md)
