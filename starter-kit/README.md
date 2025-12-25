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
| **Universal Skills**   | 31 developer skills                                      | Yes     |
| **Slash Commands**     | 5 productivity commands (/setup, /optimize, etc.)        | Yes     |
| **Automation Hooks**   | Security monitor, auto-format, test runner               | Yes     |
| **MCP Configs**        | Docker gateway + essential servers (95% token savings)   | Yes     |
| **References**         | Work logs, patterns, troubleshooting guides              | Yes     |
| **MCP Tools**          | 9 @j0kz MCP tools (smart-reviewer, test-generator, etc.) | No      |
| **hcom-agents**        | Agent coordination + token efficiency                    | No      |
| **Dashboard**          | claude-comms live events & visualization                 | No      |

## What Gets Installed

```
your-project/
├── CLAUDE.md                    # Universal template
└── .claude/
    ├── settings.json            # MCP tools config (if selected)
    ├── commands/                # 5 slash commands
    │   ├── setup.md             # /setup - initialize project
    │   ├── optimize.md          # /optimize - 95% token savings
    │   ├── audit.md             # /audit - health scorecard
    │   ├── quick-review.md      # /quick-review - 30-sec pre-commit
    │   └── smart-commit.md      # /smart-commit - semantic commits
    ├── hooks/                   # 3 automation hooks
    │   ├── security-monitor.json  # Block dangerous patterns
    │   ├── auto-format.json       # Auto-format on save
    │   └── test-runner.json       # Run tests on change
    ├── mcp-configs/             # MCP server configs
    │   ├── docker-gateway.json    # Docker MCP Gateway (95% savings)
    │   └── essential-servers.json # Core MCP servers
    └── skills/                  # 31 universal skills
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

## Slash Commands

| Command | Description | Time |
|---------|-------------|------|
| `/setup` | Initialize project with optimal config | 2 min |
| `/optimize` | Configure for 95% token savings | 1 min |
| `/audit` | Health scorecard (config, security, quality) | 30 sec |
| `/quick-review` | Pre-commit review | 30 sec |
| `/smart-commit` | Generate semantic commit message | 10 sec |

## Security Hooks

Automatically blocks dangerous patterns:

| Pattern | Action |
|---------|--------|
| `eval()` / `exec()` | BLOCKED |
| SQL string concatenation | BLOCKED |
| `chmod 777` | BLOCKED |
| Hardcoded secrets | WARNING |
| `innerHTML` / `dangerouslySetInnerHTML` | WARNING |
| `pickle.load` / `os.system` | WARNING |

## Token Optimization (Docker MCP Gateway)

| Mode | Context Tokens | Savings |
|------|----------------|---------|
| Standard (all tools) | ~10,000 | 0% |
| Gateway (dynamic) | ~1,500 | 85% |
| Code-mode (sandbox) | ~500 | **95%** |

Enable with: `/optimize` or manually start Docker gateway.

## Design Principles

- **Project-agnostic** - no specific tech stack assumptions
- **Language-neutral** - works with any programming language
- **Modular** - install only what you need
- **Self-contained** - no external dependencies required
- **Security-first** - dangerous patterns blocked by default
- **Token-efficient** - 95% savings with Docker gateway
