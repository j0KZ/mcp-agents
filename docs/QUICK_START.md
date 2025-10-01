# Quick Start Guide

Get your MCP agents up and running in 5 minutes!

## Installation

### 1. Clone and Setup
```bash
cd D:\Users\j0KZ\Documents\Coding
git clone <your-repo> my-claude-agents
cd my-claude-agents
npm install
```

### 2. Build Agents
```bash
npm run build
```

### 3. Install Globally
```bash
npm run install-global
```

### 4. Verify Installation
```bash
node scripts/verify-setup.js
```

Expected output:
```
✅ MCP config file found and valid

📊 Agent Status:
  ✅ smart-reviewer
  ✅ test-generator
  ✅ architecture-analyzer

✨ All agents are properly configured and built!
```

## First Usage

### Smart Code Reviewer
```bash
# Review a file
claude code "Review src/app.js for code quality issues"

# Expected: Detailed analysis with issues, metrics, and suggestions
```

### Test Generator
```bash
# Generate tests
claude code "Generate comprehensive tests for src/utils.js"

# Expected: Full test suite with edge cases
```

### Architecture Analyzer
```bash
# Analyze architecture
claude code "Analyze project architecture and detect circular dependencies"

# Expected: Architecture metrics and dependency graph
```

## Common Workflows

### Pre-Commit Workflow
```bash
# 1. Review changes
claude code "Review all modified files with smart-reviewer"

# 2. Generate/update tests
claude code "Generate tests for modified files with test-generator"

# 3. Check architecture
claude code "Verify no new circular dependencies"

# 4. Commit
git add .
git commit -m "feat: new feature with tests and review"
```

### New Feature Workflow
```bash
# 1. Generate tests first (TDD)
claude code "Generate tests for new authentication feature in src/auth.js"

# 2. Implement feature
claude code "Implement src/auth.js to pass the generated tests"

# 3. Review implementation
claude code "Review src/auth.js with smart-reviewer"

# 4. Verify architecture
claude code "Check if new auth module maintains good architecture"
```

### Refactoring Workflow
```bash
# 1. Analyze current state
claude code "Analyze architecture and identify refactoring opportunities"

# 2. Perform refactoring
# ... make changes ...

# 3. Verify improvements
claude code "Compare architecture metrics after refactoring"

# 4. Update tests
claude code "Regenerate tests for refactored modules"

# 5. Final review
claude code "Review refactored code for quality"
```

## Troubleshooting

### Agents Not Found
```bash
# Check configuration
cat ~/.config/claude-code/mcp_config.json

# Reinstall
npm run uninstall-global
npm run install-global
```

### Build Errors
```bash
# Clean and rebuild
rm -rf packages/*/dist
npm run build
```

### Permission Issues (Unix/Mac)
```bash
# Make scripts executable
chmod +x scripts/*.js
chmod +x packages/*/dist/mcp-server.js
```

## Next Steps

1. Read individual agent documentation:
   - [Smart Reviewer](../packages/smart-reviewer/docs/README.md)
   - [Test Generator](../packages/test-generator/docs/README.md)
   - [Architecture Analyzer](../packages/architecture-analyzer/docs/README.md)

2. Configure agents: Edit `~/.config/claude-code/agents.config.json`

3. Integrate with Git hooks: See [Git Integration Guide](./GIT_INTEGRATION.md)

4. Set up CI/CD: See [CI/CD Guide](./CICD_INTEGRATION.md)

## Support

- GitHub Issues: <your-repo>/issues
- Documentation: [Main README](../README.md)
- Examples: [docs/examples/](./examples/)
