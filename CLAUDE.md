# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🔧 MCP Tool Discovery

**50 tools across 9 servers.** Use tool discovery instead of loading all definitions.

**Key commands:**
- `search_tools({ query: "security" })` - Find tools by keyword
- `load_tool({ toolName: "design_api" })` - Load deferred tools
- `run_workflow({ workflow: "pre-commit", response_format: "concise" })` - Use workflows

**Response formats:** `minimal` (100 tokens), `concise` (500 tokens), `detailed` (5000 tokens)

**Full guide:** [`.claude/references/mcp-tools-guide.md`](.claude/references/mcp-tools-guide.md)

---

## 🌍 Universal Skills

**10 project-agnostic developer skills** available in [`docs/universal-skills/INDEX.md`](docs/universal-skills/INDEX.md) - work with ANY codebase, ANY language.

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

## Development Workflow

**Complete the entire job:** Audit → Fix → Document → Commit (don't wait to be asked multiple times)

**Before any task:**
1. Understand current state (read existing code, check scripts/, search @j0kz/shared)
2. Identify real gaps AND fixable issues
3. Design complete solution (not just first step)
4. Execute thoroughly (fix, document, verify, commit)

**Feature checklist:** Does this solve a real problem? Does something already solve this? Is this the right place? What's the minimum version?

**Full guide:** [`.claude/references/dev-workflow-guide.md`](.claude/references/dev-workflow-guide.md)

## Working with the Codebase

**Quick reference:** Adding MCP tools, modifying packages, code quality targets (<300 LOC, <50 complexity)

**Full guide:** [`.claude/references/project-specifics.md`](.claude/references/project-specifics.md)
