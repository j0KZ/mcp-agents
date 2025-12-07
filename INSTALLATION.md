# 🚀 Installation Guide - MCP Tools & Universal Skills

## Quick Install (Everything in One Command)

### Option 1: Install MCP Tools Only (Most Common)

```bash
npx @j0kz/mcp-agents@latest
```

- ✅ Installs 10 MCP tools in your AI editor
- ✅ Works in ANY project after installation
- ❌ Doesn't include skills documentation

### Option 2: Install Everything (Tools + Skills)

```bash
npx @j0kz/mcp-agents install
```

- ✅ Installs 10 MCP tools
- ✅ Downloads 10 universal skill guides
- ✅ Creates quick reference file

---

## 📦 What Gets Installed

### MCP Tools (Automated AI Tools)

These are **actual tools** that integrate with your AI editor:

- Smart Reviewer, Test Generator, Security Scanner
- Architecture Analyzer, API Designer, DB Schema Designer
- Doc Generator, Refactor Assistant, Orchestrator, Auto-Pilot

**Location**: Configured in your AI editor's settings
**Usage**: Natural language commands in Claude/Cursor/Windsurf

### Universal Skills (Documentation/Guides)

These are **markdown guides** for common development tasks:

- Quick PR Review, Debug Detective, Performance Hunter
- Legacy Modernizer, Zero to Hero, Test Coverage Boost
- Tech Debt Tracker, Dependency Doctor, Security First, API Integration

**Location**: `.claude/universal-skills/` in your project
**Usage**: Reference guides you can follow manually

---

## 🎯 Installation Commands

### Full Suite Installation

```bash
# Install everything (recommended for first-time users)
npx @j0kz/mcp-agents install

# What it does:
# 1. Configures MCP tools in your AI editor
# 2. Downloads universal skills to .claude/universal-skills/
# 3. Creates MCP-REFERENCE.md quick guide
```

### Individual Components

```bash
# Just MCP tools (no skills documentation)
npx @j0kz/mcp-agents tools
# OR
npx @j0kz/mcp-agents@latest

# Just universal skills (no MCP tools)
npx @j0kz/mcp-agents skills

# Just the installer config
npx @j0kz/mcp-agents@latest
```

### Platform-Specific Scripts

```bash
# Mac/Linux
curl -sL https://raw.githubusercontent.com/j0KZ/mcp-agents/main/scripts/quick-setup.sh | bash

# Windows PowerShell
iwr -useb https://raw.githubusercontent.com/j0KZ/mcp-agents/main/scripts/quick-setup.ps1 | iex

# Windows Command Prompt
npx @j0kz/mcp-agents install
```

---

## 🔧 Manual Installation

### Install MCP Tools Manually

```bash
# Step 1: Install globally
npm install -g @j0kz/mcp-agents

# Step 2: Configure your editor
npx @j0kz/mcp-agents@latest
```

### Download Skills Manually

```bash
# Clone just the skills
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/j0KZ/mcp-agents.git
cd mcp-agents
git sparse-checkout set .claude/universal-skills

# Or download as ZIP
curl -L https://github.com/j0KZ/mcp-agents/archive/main.zip -o skills.zip
unzip -j skills.zip "mcp-agents-main/.claude/universal-skills/*" -d .claude/universal-skills/
rm skills.zip
```

---

## 🏃 Quick Start After Installation

### Test MCP Tools

After restarting your editor:

```
"Check MCP server status"
"Review my package.json"
"Find security vulnerabilities"
```

### Use Universal Skills

```
"Apply the quick-pr-review checklist"
"Use debug-detective to find this bug"
"Follow zero-to-hero to understand this codebase"
```

---

## 📊 Installation Options Comparison

| Method                         | MCP Tools | Skills | Reference | Best For         |
| ------------------------------ | --------- | ------ | --------- | ---------------- |
| `npx @j0kz/mcp-agents@latest`  | ✅        | ❌     | ❌        | Quick tool setup |
| `npx @j0kz/mcp-agents install` | ✅        | ✅     | ✅        | Complete setup   |
| `npx @j0kz/mcp-agents tools`   | ✅        | ❌     | ✅        | Tools only       |
| `npx @j0kz/mcp-agents skills`  | ❌        | ✅     | ✅        | Skills only      |
| Manual install                 | Choose    | Choose | DIY       | Custom setup     |

---

## 🛠️ Troubleshooting

### MCP Tools Not Working

```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Reinstall
npx @j0kz/mcp-agents@latest

# 3. Restart editor completely
```

### Skills Not Downloading

```bash
# Check network
curl -I https://raw.githubusercontent.com/j0KZ/mcp-agents/main/.claude/universal-skills/INDEX.md

# Manual download
git clone https://github.com/j0KZ/mcp-agents.git temp
cp -r temp/.claude/universal-skills .claude/
rm -rf temp
```

### Version Conflicts

```bash
# Use specific version
npx @j0kz/mcp-agents@1.1.0

# Update to latest
npm update -g @j0kz/mcp-agents
```

---

## 🚀 Advanced Setup

### Add to Existing Project

```json
// package.json
{
  "scripts": {
    "setup:mcp": "npx @j0kz/mcp-agents install",
    "mcp:tools": "npx @j0kz/mcp-agents tools",
    "mcp:skills": "npx @j0kz/mcp-agents skills"
  }
}
```

### CI/CD Integration

```yaml
# .github/workflows/setup.yml
- name: Setup MCP Tools
  run: npx @j0kz/mcp-agents@latest

- name: Download Skills
  run: npx @j0kz/mcp-agents skills
```

### Docker Setup

```dockerfile
FROM node:18-alpine
RUN npx @j0kz/mcp-agents install
COPY . .
```

---

## 📚 What's Next?

After installation:

1. **Restart your AI editor** (required for MCP tools)
2. **Read `MCP-REFERENCE.md`** (created during install)
3. **Try a simple command**: "Review this file"
4. **Explore skills**: `.claude/universal-skills/INDEX.md`
5. **Check the Wiki**: https://github.com/j0KZ/mcp-agents/wiki

---

## 🆘 Get Help

- **Documentation**: [Wiki](https://github.com/j0KZ/mcp-agents/wiki)
- **Issues**: [GitHub Issues](https://github.com/j0KZ/mcp-agents/issues)
- **Discussions**: [GitHub Discussions](https://github.com/j0KZ/mcp-agents/discussions)

---

_Installation typically takes less than 1 minute!_ 🚀
