# Claude Code Starter Kit

Universal starter kit with interactive component selection for any project.

## Quick Install

```bash
# Interactive mode - choose what to install
npx @j0kz/claude-starter

# Install everything (skills + MCP tools + hcom-agents)
npx @j0kz/claude-starter --all

# Force overwrite existing files
npx @j0kz/claude-starter --force
```

## Prerequisites (for Python components)

For **hcom-agents** and **dashboard** components, you need a Python package manager:

### Recommended: Install uv (fast Python package manager)

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Or via pip
pip install uv
```

The installer automatically detects uv and uses it for faster installs. Falls back to pip if uv is not available.

## Available Components

| Component              | Description                                              | Default |
| ---------------------- | -------------------------------------------------------- | ------- |
| **CLAUDE.md Template** | Universal starter template                               | Yes     |
| **Universal Skills**   | 10 developer skills                                      | Yes     |
| **MCP Tools**          | 9 @j0kz MCP tools (smart-reviewer, test-generator, etc.) | No      |
| **References**         | Work logs, patterns, troubleshooting guides              | Yes     |
| **MCP Tools**          | 9 @j0kz MCP tools                                        | No      |
| **hcom-agents**        | Agent coordination + token efficiency                    | No      |
| **Dashboard**          | claude-comms live events & visualization                 | No      |

---

## 🚀 **NEW: Context-Optimized Starter Kit**

**This starter kit is now optimized for 60-70% context token reduction!**

### Performance Benefits

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| **CLAUDE.md size** | ~300-500 lines | ~190 lines | **46-49%** |
| **MCP tool calls** | ~5000 tokens | ~500 tokens | **90%** |
| **Full workflow** | ~15,000 tokens | ~1,500 tokens | **90%** |
| **Total per session** | ~20,000-25,000 tokens | ~4,000-5,000 tokens | **75-80%** |

### What's Optimized

✅ **Condensed CLAUDE.md** - Critical info only, details in references
✅ **Reference Architecture** - Detailed guides loaded on-demand
✅ **Workflow Presets** - Pre-configured with optimal response formats
✅ **Skills Optimization** - All 10 skills default to `concise` format
✅ **MCP Tool Discovery** - Load tools only when needed

### New File Structure

```
your-project/
├── CLAUDE.md                              # Optimized template (190 lines)
└── .claude/
    ├── references/                        # 📚 Detailed guides (loaded on-demand)
    │   ├── mcp-tools-guide.md            # Tool discovery & optimization
    │   ├── dev-workflow-guide.md         # Development best practices
    │   └── project-specifics.md          # YOUR custom commands/structure
    ├── workflows/                         # ⚡ Pre-configured workflows
    │   ├── pre-commit.json               # Quick checks (minimal, ~30s)
    │   ├── pre-merge.json                # PR validation (concise, ~2min)
    │   └── deep-audit.json               # Full analysis (detailed, ~5min)
    └── skills/                            # ✨ 10 universal skills (all optimized)
        ├── quick-pr-review/
        ├── debug-detective/
        └── ... (8 more)
```

### How It Works

**Load once, reference when needed:**
1. Claude reads the condensed CLAUDE.md (~190 lines)
2. Detailed guides in `.claude/references/` are loaded only when needed
3. MCP tools use `concise` format by default (90% token savings)
4. Workflow presets bundle common tasks with optimal settings

**Result:** Same powerful features, fraction of the context!

---

## What Gets Installed

```
your-project/
├── CLAUDE.md                    # Universal template
└── .claude/
    ├── settings.json            # MCP tools config (if selected)
    └── skills/                  # 10 universal skills
        ├── quick-pr-review/
        ├── debug-detective/
        ├── performance-hunter/
        ├── security-first/
        ├── test-coverage-boost/
        ├── zero-to-hero/
        ├── legacy-modernizer/
        ├── tech-debt-tracker/
        ├── dependency-doctor/
        └── api-integration/
```

## MCP Tools (Optional)

When you select MCP tools, these are configured in `.claude/settings.json`:

| Tool                  | Purpose                               |
| --------------------- | ------------------------------------- |
| smart-reviewer        | Code review with auto-fix suggestions |
| test-generator        | Generate comprehensive test suites    |
| architecture-analyzer | Dependency graphs, circular deps      |
| security-scanner      | OWASP vulnerability scanning          |
| refactor-assistant    | Safe code refactoring                 |
| doc-generator         | API documentation generation          |
| orchestrator-mcp      | Workflow automation                   |
| api-designer          | REST/GraphQL API design               |
| db-schema             | Database schema design                |

## Dashboard (Optional)

Installs claude-comms for:

- Live event monitoring
- Session visualization
- Chat transcripts
- Recursive clone capability

## hcom-agents (Optional)

Installs agent coordination layer with:

- 5 built-in agents (orchestrator, reviewer, tester, architect, security)
- Claude Code hooks integration
- Token budget management
- Decision persistence

## Skills Overview

| Skill               | Purpose              | Time      |
| ------------------- | -------------------- | --------- |
| quick-pr-review     | Pre-PR checklist     | 30 sec    |
| debug-detective     | Systematic debugging | 5-30 min  |
| performance-hunter  | Find bottlenecks     | 10-60 min |
| security-first      | OWASP protection     | 1 hour    |
| test-coverage-boost | 0% to 80% coverage   | 1-5 days  |
| zero-to-hero        | Master any codebase  | 30 min    |
| legacy-modernizer   | Update old code      | varies    |
| tech-debt-tracker   | Track debt           | 1 hour    |
| dependency-doctor   | Fix packages         | 30 min    |
| api-integration     | Connect APIs         | 2 hours   |

## After Installation

1. **Edit CLAUDE.md** with your project details
2. **Use skills** with Claude: "Use debug-detective to find this bug"
3. **Restart Claude Code** if you installed MCP tools
4. **Start dashboard** if installed: `claude-comms start`

## Design Principles

- **Project-agnostic** - no specific tech stack assumptions
- **Language-neutral** - works with any programming language
- **Modular** - install only what you need
- **Self-contained** - no external dependencies required
