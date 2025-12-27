# CLAUDE.md - Context-Optimized Universal Starter Template

> **Drop this file in any project root to give Claude Code context and best practices.**
> **This template is optimized for 60-70% context token reduction.**

---

## Project Context

<!-- CUSTOMIZE: Add your project description -->

**Project:** [Your project name]
**Language:** [Primary language]
**Framework:** [Framework if any]
**Architecture:** [e.g., Monorepo, Microservices, Monolith]

**For detailed project commands and structure:** See [`.claude/references/project-specifics.md`](.claude/references/project-specifics.md)

---

## 🔧 MCP Tool Discovery

If using MCP tools, optimize context usage with tool discovery and response formats.

**Key commands:**
- `search_tools({ query: "security" })` - Find tools by keyword
- `load_tool({ toolName: "tool_name" })` - Load deferred tools
- `run_workflow({ workflow: "pre-commit", response_format: "concise" })` - Use workflows

**Response formats:** `minimal` (100 tokens), `concise` (500 tokens), `detailed` (5000 tokens)

**Full guide:** [`.claude/references/mcp-tools-guide.md`](.claude/references/mcp-tools-guide.md)

---

## ⚠️ CRITICAL SAFETY RULES

### NEVER Delete Files Without Explicit Confirmation

**When asked to "remove" or "delete" anything:**

1. **List all affected files/directories**
2. **Show total count and git status**
3. **Ask for explicit `YES DELETE` confirmation**
4. **Suggest alternatives:** archive folder, .gitignore, move to backup

**"Remove" could mean:**
- Remove from git tracking (keep files)
- Remove from documentation (keep code)
- Move to archive folder
- Comment out code

**ALWAYS ask for clarification before deleting.**

### Before Major Changes

- ✅ Read existing code first
- ✅ Understand the full context
- ✅ Check for related files
- ✅ Run tests after changes

---

## Development Workflow

**Complete the entire job:** Audit → Fix → Document → Commit (don't wait to be asked multiple times)

**Before any task:**
1. Understand current state (read existing code, check for existing solutions)
2. Identify real gaps AND fixable issues
3. Design complete solution (not just first step)
4. Execute thoroughly (fix, document, verify, commit)

**Feature checklist:** Does this solve a real problem? Does something already solve this? Is this the simplest solution?

**Full guide:** [`.claude/references/dev-workflow-guide.md`](.claude/references/dev-workflow-guide.md)

---

## Quick Commands

<!-- CUSTOMIZE: Add your actual commands -->

```bash
# Build
npm run build          # or: make build, cargo build, mvn package, etc.

# Test
npm test               # or: pytest, go test, cargo test, etc.

# Lint
npm run lint           # or: flake8, golint, rubocop, etc.

# Start dev
npm run dev            # or: python manage.py runserver, cargo run, etc.
```

---

## Code Organization

<!-- CUSTOMIZE: Describe your project structure -->

```
src/           # Main source code
tests/         # Test files
docs/          # Documentation
scripts/       # Build/automation scripts
.claude/       # Claude Code configuration
  ├── references/    # Detailed guides
  ├── workflows/     # MCP workflow presets
  └── skills/        # Custom skills (if any)
```

---

## Conventions

### Naming
<!-- CUSTOMIZE: Adjust to your language/framework -->

- **Files:** kebab-case (`user-service.ts`)
- **Functions:** camelCase (`getUserById`)
- **Classes:** PascalCase (`UserService`)
- **Constants:** UPPER_SNAKE (`MAX_RETRIES`)

### Git Commits

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
```

---

## Available Skills

<!-- Skills are in .claude/skills/ - Claude will use them automatically -->

| Skill               | Use When              | Optimization |
| ------------------- | --------------------- | ------------ |
| quick-pr-review     | Before creating PRs   | ✅ Optimized |
| debug-detective     | Hunting bugs          | ✅ Optimized |
| performance-hunter  | Finding bottlenecks   | ✅ Optimized |
| security-first      | Security audit        | ✅ Optimized |
| test-coverage-boost | Improving coverage    | ✅ Optimized |
| zero-to-hero        | Learning new codebase | ✅ Optimized |
| legacy-modernizer   | Updating old code     | ✅ Optimized |
| tech-debt-tracker   | Managing debt         | ✅ Optimized |
| dependency-doctor   | Package issues        | ✅ Optimized |
| api-integration     | Connecting APIs       | ✅ Optimized |

**All skills default to `concise` format for 90% token savings**

---

## Workflow Presets

Pre-configured workflows in `.claude/workflows/`:

- **pre-commit.json** - Quick checks (minimal format, ~30s)
- **pre-merge.json** - PR validation (concise format, ~2min)
- **deep-audit.json** - Full analysis (detailed format, ~5min)

---

## Notes

<!-- CUSTOMIZE: Add project-specific notes -->

---

## 📚 Reference Documentation

- **[MCP Tools Guide](.claude/references/mcp-tools-guide.md)** - Tool discovery & response format optimization
- **[Development Workflow](.claude/references/dev-workflow-guide.md)** - Best practices & complete-job mindset
- **[Project Specifics](.claude/references/project-specifics.md)** - Commands, structure, conventions (customize this!)

---

## Performance

This template provides:
- **46-49% reduction** in CLAUDE.md size (detailed content moved to references)
- **90-98% token savings** when using MCP tools with `concise`/`minimal` formats
- **75-80% overall context reduction** per session

**Total optimization: Load once, reference when needed!**
