---
description: Initialize project with optimized Claude Code configuration
allowed-tools: ["Read", "Write", "Edit", "Bash", "Glob"]
---

# Project Setup

Analyze this project and set up optimal Claude Code configuration:

## Tasks

1. **Detect Project Type**
   - Check for package.json (Node.js), requirements.txt (Python), Cargo.toml (Rust), go.mod (Go), etc.
   - Identify frameworks: React, Next.js, Django, FastAPI, etc.

2. **Create CLAUDE.md** (if not exists)
   - Add project-specific instructions
   - Document build/test commands
   - List important directories and patterns

3. **Configure .claude/settings.json**
   - Set appropriate model for project size
   - Configure allowed tools
   - Set up file ignore patterns for node_modules, dist, etc.

4. **Set Up Hooks**
   - Pre-commit: lint + format
   - Post-tool: auto-test on code changes
   - Security: block dangerous patterns

5. **Configure MCP Servers** (if @j0kz packages available)
   - smart-reviewer for code review
   - security-scanner for vulnerability detection
   - test-generator for test creation

Report what was configured and any manual steps needed.
