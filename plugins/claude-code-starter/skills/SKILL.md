# Project Optimizer Skill

## When to Activate

Activate this skill when:
- User starts a new project or mentions "new project"
- User asks about optimization, performance, or token usage
- User mentions slow responses or high token costs
- User asks about best practices or project setup
- Project lacks CLAUDE.md or .claude/ configuration

## Capabilities

### 1. Auto-Detection
- Detect project type (Node.js, Python, Rust, Go, etc.)
- Identify frameworks and tools in use
- Check for existing configuration

### 2. Configuration Generation
- Create optimized CLAUDE.md with project-specific instructions
- Set up .claudeignore for large files
- Configure .claude/settings.json for token efficiency

### 3. Token Optimization
- Recommend response_format settings
- Suggest MCP gateway if Docker available
- Configure dynamic tool loading

### 4. Security Hardening
- Enable security hooks by default
- Block dangerous code patterns
- Warn about exposed secrets

## Actions

When activated, offer to:
1. Run `/starter:setup` for full project configuration
2. Run `/starter:optimize` for token savings
3. Run `/starter:audit` for health check

## Context Clues

Look for these patterns:
- "new project", "starting fresh", "initialize"
- "slow", "expensive", "tokens", "optimize"
- "best practices", "configure", "setup"
- Missing CLAUDE.md in project root
