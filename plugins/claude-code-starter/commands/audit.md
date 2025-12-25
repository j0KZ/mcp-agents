---
description: Audit project health and Claude Code configuration
allowed-tools: ["Read", "Glob", "Grep", "Bash"]
---

# Project Audit

Perform comprehensive audit of this project:

## Checks

### 1. Configuration Health
- [ ] CLAUDE.md exists and is comprehensive
- [ ] .claude/settings.json is optimized
- [ ] .claudeignore covers large files
- [ ] Hooks are properly configured

### 2. Code Quality
- [ ] No console.log/print statements in production code
- [ ] No hardcoded secrets or API keys
- [ ] No TODO/FIXME comments older than 30 days
- [ ] Test coverage exists

### 3. Security
- [ ] No eval() or exec() usage
- [ ] No SQL string concatenation
- [ ] Dependencies are up to date
- [ ] No exposed credentials in git history

### 4. Performance
- [ ] No circular dependencies
- [ ] Bundle size is reasonable
- [ ] No memory leaks in tests

### 5. Token Efficiency
- [ ] MCP servers use dynamic loading
- [ ] Response format is concise
- [ ] Large files are ignored

## Output

Provide a scorecard:
- Configuration: X/10
- Code Quality: X/10
- Security: X/10
- Performance: X/10
- Token Efficiency: X/10

List actionable fixes for any issues found.
