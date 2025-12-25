# Claude Code Starter Kit

Zero-config optimization for Claude Code. Get **95% token savings** and **security hardening** out of the box.

## Quick Install

```bash
# One-command install
npx @j0kz/claude-code-starter init

# Or via Claude Code plugin system
/plugin install j0kz/mcp-agents/plugins/claude-code-starter
```

## What's Included

### Slash Commands

| Command | Description |
|---------|-------------|
| `/starter:setup` | Initialize project with optimal config |
| `/starter:optimize` | Configure for 95% token savings |
| `/starter:audit` | Health check & scorecard |
| `/starter:quick-review` | 30-second pre-commit review |
| `/starter:smart-commit` | Generate semantic commit messages |

### Security Hooks

Automatically blocks dangerous patterns:
- `eval()` / `exec()` usage
- SQL string concatenation
- Hardcoded secrets
- `innerHTML` XSS vectors
- Unsafe file permissions

### Auto-Formatting

Detects and uses your project's formatter:
- **Node.js**: Prettier
- **Python**: Black / Ruff
- **Rust**: rustfmt
- **Go**: gofmt

### Test Runner

Runs related tests after code changes:
- Jest/Vitest for TypeScript/JavaScript
- Pytest for Python

### MCP Gateway (Docker)

If Docker is available, enables:
- Dynamic tool discovery (`mcp-find`)
- On-demand loading (`mcp-add`)
- Sandbox execution (`code-mode`)

## Token Savings

| Mode | Context Tokens | Savings |
|------|----------------|---------|
| Standard | ~10,000 | 0% |
| Gateway | ~1,500 | 85% |
| Code-mode | ~500 | **95%** |

## Project Structure

```
plugins/claude-code-starter/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── commands/
│   ├── setup.md             # /starter:setup
│   ├── optimize.md          # /starter:optimize
│   ├── audit.md             # /starter:audit
│   ├── quick-review.md      # /starter:quick-review
│   └── smart-commit.md      # /starter:smart-commit
├── hooks/
│   ├── security-monitor.json
│   ├── auto-format.json
│   └── test-runner.json
├── skills/
│   └── SKILL.md             # Auto-activated optimizer
└── mcp-configs/
    ├── docker-gateway.json
    └── essential-servers.json
```

## Manual Setup

If you prefer manual configuration:

1. Copy `.claude-plugin/` to your project's `.claude/plugins/starter/`
2. Copy `hooks/` to `.claude/hooks/`
3. Copy `mcp-configs/essential-servers.json` to `.claude/mcp.json`

## Requirements

- Claude Code 1.0+
- Node.js 18+ (for MCP servers)
- Docker Desktop 4.50+ (optional, for gateway)

## License

MIT
