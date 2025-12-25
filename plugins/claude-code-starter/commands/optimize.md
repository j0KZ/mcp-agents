---
description: Optimize Claude Code for maximum token efficiency (75-95% savings)
allowed-tools: ["Read", "Write", "Edit", "Bash"]
---

# Token Optimization

Configure this project for maximum token efficiency:

## Optimization Levels

### Level 1: Basic (50% savings)
- Add `.claudeignore` for large/generated files
- Configure `response_format: concise` in settings
- Set up file size limits

### Level 2: MCP Gateway (85% savings)
- Check if Docker is available: `docker --version`
- If available, configure Docker MCP Gateway
- Set `autoLoad: false` for all MCP servers
- Use `mcp-find` for dynamic tool discovery

### Level 3: Code-Mode (95% savings)
- Enable sandbox execution for workflows
- Configure pre-built workflow templates:
  - pre-commit: review + security scan
  - pre-merge: full analysis
  - quality-audit: comprehensive report

## Actions

1. Create/update `.claudeignore`:
```
node_modules/
dist/
build/
.git/
*.lock
*.log
coverage/
.next/
__pycache__/
```

2. Update `.claude/settings.json` with token-optimized config

3. If Docker available, create `docker-compose.mcp.yml` from template

Report current token usage estimate and savings achieved.
