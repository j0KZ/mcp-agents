# Quick Install - My Claude Agents

Install all 3 MCP agents (Smart Reviewer, Test Generator, Architecture Analyzer) for Claude Code in one command.

## 🚀 One-Line Install

### Windows (PowerShell)
```powershell
iwr https://raw.githubusercontent.com/YOUR-USERNAME/my-claude-agents/main/scripts/auto-install.ps1 | iex
```

### macOS/Linux
```bash
curl -fsSL https://raw.githubusercontent.com/YOUR-USERNAME/my-claude-agents/main/scripts/auto-install.sh | bash
```

---

## 📦 What Gets Installed

**3 MCP agents available globally across ALL your Claude Code projects:**

1. **Smart Reviewer** - AI code review with learning
2. **Test Generator** - Auto-generate comprehensive tests
3. **Architecture Analyzer** - Detect architecture issues

---

## ✅ Verify Installation

```bash
claude mcp list
```

You should see:
```
✓ smart-reviewer - Connected
✓ test-generator - Connected
✓ architecture-analyzer - Connected
```

---

## 🎯 Usage Examples

```bash
# Review code
claude code "Review this file for issues"

# Generate tests
claude code "Generate tests for src/utils.js"

# Analyze architecture
claude code "Check for circular dependencies"
```

---

## 🔄 Update

```bash
cd ~/.claude-agents
git pull
npm run build
```

---

## 🗑️ Uninstall

```bash
# Remove MCPs
claude mcp remove smart-reviewer --scope user
claude mcp remove test-generator --scope user
claude mcp remove architecture-analyzer --scope user

# Remove files
rm -rf ~/.claude-agents  # macOS/Linux
Remove-Item -Recurse ~/.claude-agents  # Windows
```

---

## 📚 Full Documentation

- [Installation Guide](INSTALLATION.md)
- [Distribution Options](docs/DISTRIBUTION.md)
- [Main README](README.md)
