# @j0kz/mcp-config-wizard

> Interactive CLI wizard for configuring MCP tools in < 1 minute

[![npm](https://img.shields.io/npm/v/@j0kz/mcp-config-wizard)](https://www.npmjs.com/package/@j0kz/mcp-config-wizard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

## Quick Start

```bash
npx @j0kz/mcp-config-wizard
```

The wizard will:
1. ✅ Detect your editor and project type
2. ✅ Recommend relevant MCP tools
3. ✅ Generate configuration automatically
4. ✅ Install selected MCPs
5. ✅ Validate everything works

**Setup time:** < 1 minute

---

## Features

### 🎯 Smart Detection

- **Detects installed editors** (Claude Code, Cursor, Windsurf, VS Code)
- **Analyzes your project** (TypeScript/JavaScript, React, Node, etc.)
- **Identifies test framework** (Jest, Vitest, Mocha)
- **Suggests relevant MCPs** based on project type

### 🚀 Zero Configuration

- **Pre-selected defaults** based on detection
- **Smart recommendations** for your stack
- **One-click install** for all MCPs
- **Automatic config** for your editor

### ✅ Validation

- **Checks Node version** (18+ required)
- **Verifies editor exists**
- **Validates MCP compatibility**
- **Tests configuration** before finalizing

---

## Usage

### Interactive Mode (Recommended)

```bash
npx @j0kz/mcp-config-wizard
```

### Non-Interactive Mode

```bash
# Specify editor and MCPs
npx mcp-configure \
  --editor=claude-code \
  --mcps=smart-reviewer,security-scanner,test-generator

# Dry run (show config without installing)
npx mcp-configure --dry-run

# Force overwrite existing config
npx mcp-configure --force

# Custom output path
npx mcp-configure --output=./mcp-config.json
```

---

## Example Session

```
$ npx @j0kz/mcp-config-wizard

🎯 MCP Agents Configuration Wizard
───────────────────────────────────

✓ Detected: Claude Code
✓ Project: TypeScript + React
✓ Test Framework: Jest

? Which MCP tools do you want? (Space to select)
❯ ◉ Smart Reviewer (code quality)
  ◉ Security Scanner (vulnerabilities)
  ◉ Test Generator (auto-generate tests)
  ◯ Architecture Analyzer (dependencies)
  ◯ Refactor Assistant (improvements)

? Code review severity: Moderate (balanced)

✨ Configuration complete!

📁 Created: ~/.config/claude-code/mcp_settings.json
✅ Installed: 3 MCP packages
🎯 Next: Restart Claude Code

Try asking: "Review my code" or "Scan for vulnerabilities"
```

---

## Supported Editors

- **Claude Code** (Anthropic) - Full support
- **Cursor** (Anysphere) - Full support
- **Windsurf** (Codeium) - Full support
- **VS Code + Continue** - Full support
- **Roo Code** - Full support
- **Other MCP editors** - Manual config export

---

## CLI Options

| Flag | Description | Example |
|------|-------------|---------|
| `--editor` | Specify editor | `--editor=claude-code` |
| `--mcps` | Comma-separated MCP list | `--mcps=smart-reviewer,security-scanner` |
| `--dry-run` | Show config without installing | `--dry-run` |
| `--force` | Overwrite existing config | `--force` |
| `--output` | Custom output path | `--output=./config.json` |
| `--verbose` | Detailed logging | `--verbose` |
| `--help` | Show help | `--help` |

---

## Project Type Recommendations

The wizard suggests MCPs based on your project:

| Project Type | Recommended MCPs |
|--------------|------------------|
| **React App** | Smart Reviewer, Test Generator, Security Scanner |
| **Node.js API** | API Designer, DB Schema, Security Scanner |
| **Library/Package** | Smart Reviewer, Test Generator, Doc Generator |
| **Full-stack** | All 8 MCPs |

---

## Requirements

- **Node.js** 18.0.0 or higher
- **npm** (or yarn/pnpm)
- One of the supported editors installed

---

## Troubleshooting

### Config file not found

**Check editor config path:**
- Claude Code: `~/.config/claude-code/mcp_settings.json`
- Cursor: `~/.cursor/mcp_config.json` (Mac/Linux) or `%APPDATA%\Cursor\User\mcp_config.json` (Windows)
- Windsurf: `~/.windsurf/mcp_config.json`

### Permission denied

```bash
# Fix permissions (Mac/Linux)
chmod 755 ~/.config/claude-code/

# Run with sudo (not recommended)
sudo npx @j0kz/mcp-config-wizard
```

### MCP not working after config

1. **Restart your editor** (required)
2. **Check MCP status** in editor settings
3. **Verify Node version**: `node --version` (18+ required)

### Installation fails

```bash
# Clear npm cache
npm cache clean --force

# Try global install first
npm install -g @j0kz/smart-reviewer-mcp

# Then run wizard
npx @j0kz/mcp-config-wizard
```

---

## Advanced Usage

### Import Existing Config

```bash
npx mcp-configure --import=.eslintrc.json
```

### Team Presets

```bash
# Share config via URL
npx mcp-configure --preset=https://example.com/team-config.json
```

### CI/CD Mode

```bash
# Also generate GitHub Actions workflow
npx mcp-configure --with-ci
```

---

## Contributing

PRs welcome! See [CONTRIBUTING.md](../../docs/CONTRIBUTING.md)

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-editor`
3. Make changes and test
4. Submit pull request

---

## License

MIT © [j0KZ](https://github.com/j0KZ)

---

## Links

- **GitHub:** https://github.com/j0KZ/mcp-agents
- **npm:** https://www.npmjs.com/~j0kz
- **Issues:** https://github.com/j0KZ/mcp-agents/issues
- **Wiki:** https://github.com/j0KZ/mcp-agents/wiki

---

**Made with ❤️ for faster MCP setup**
