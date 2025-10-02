# Quick Start Guide

Get up and running with MCP Agents in less than 5 minutes!

## 📋 Prerequisites

- **Node.js** 18+ and npm
- An MCP-compatible AI editor:
  - [Claude Code](https://claude.ai/claude-code) (recommended)
  - [Cursor](https://cursor.sh/)
  - [Windsurf](https://codeium.com/windsurf)
  - [Roo Code](https://roo.dev/)
  - Any MCP-compatible client

## 🚀 Installation Methods

### Method 1: Global Installation (Recommended)

```bash
# Install your preferred MCPs globally
npm install -g @j0kz/smart-reviewer-mcp
npm install -g @j0kz/test-generator-mcp
npm install -g @j0kz/architecture-analyzer-mcp
npm install -g @j0kz/security-scanner-mcp
```

### Method 2: npx (No Installation)

Use MCPs without installing:

```bash
npx @j0kz/smart-reviewer-mcp
```

### Method 3: Project-Level Installation

```bash
# In your project directory
npm install --save-dev @j0kz/smart-reviewer-mcp @j0kz/test-generator-mcp
```

## ⚙️ Configuration

### Claude Code

1. Open settings: `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)
2. Search for "MCP"
3. Add to `mcp_servers`:

```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "smart-reviewer-mcp",
      "args": []
    },
    "test-generator": {
      "command": "test-generator-mcp",
      "args": []
    },
    "architecture-analyzer": {
      "command": "architecture-analyzer-mcp",
      "args": []
    }
  }
}
```

Or using npx:

```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["-y", "@j0kz/smart-reviewer-mcp"]
    }
  }
}
```

### Cursor

1. Open settings: `File > Preferences > Settings`
2. Search for "MCP Servers"
3. Click "Edit in settings.json"
4. Add the same configuration as above

### Windsurf

1. Open `.windsurf/mcp_config.json` in your project
2. Add MCP server configuration:

```json
{
  "servers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["-y", "@j0kz/smart-reviewer-mcp"]
    }
  }
}
```

## ✅ Verify Installation

After configuration, restart your editor and verify MCPs are loaded:

### In Claude Code/Cursor
- Open command palette: `Ctrl+Shift+P`
- Type "MCP" to see available MCPs
- Or simply ask: "What MCP tools are available?"

### Test Smart Reviewer

Create a test file `test.js`:

```javascript
var x = 1;
if (x == 1) {
  console.log('test');
}
```

Ask your AI:
```
Review test.js and find issues
```

Expected response includes:
- ❌ Use `const` instead of `var`
- ❌ Use `===` instead of `==`
- ❌ Remove `console.log` before production

## 🎯 Your First Workflows

### Workflow 1: Code Review

```
1. Ask: "Review src/index.ts for code quality issues"
2. AI uses Smart Reviewer MCP
3. Get detailed analysis with auto-fix suggestions
4. Ask: "Apply the suggested fixes"
5. Code is automatically improved!
```

### Workflow 2: Generate Tests

```
1. Ask: "Generate tests for src/utils.ts"
2. AI uses Test Generator MCP
3. Get comprehensive test suite with edge cases
4. Tests are written to src/utils.test.ts
```

### Workflow 3: Architecture Analysis

```
1. Ask: "Analyze the architecture of this project"
2. AI uses Architecture Analyzer MCP
3. Get dependency graph and circular dependency detection
4. Receive actionable recommendations
```

## 🔧 Common Commands

### Smart Reviewer
```
- "Review this file for code quality"
- "Find all issues in src/"
- "Apply auto-fixes to this code"
- "Check code complexity of src/index.ts"
```

### Test Generator
```
- "Generate tests for this file"
- "Create Jest tests with edge cases"
- "Write tests for all functions in src/utils.ts"
```

### Architecture Analyzer
```
- "Analyze project architecture"
- "Find circular dependencies"
- "Generate dependency graph"
- "Check for layer violations"
```

### Security Scanner
```
- "Scan for security vulnerabilities"
- "Find hardcoded secrets"
- "Check for SQL injection risks"
- "Audit dependencies for CVEs"
```

### API Designer
```
- "Design a REST API for user management"
- "Generate OpenAPI spec for this project"
- "Create GraphQL schema for blog posts"
```

### DB Schema Designer
```
- "Design a database schema for e-commerce"
- "Generate PostgreSQL migration"
- "Create ER diagram for this schema"
```

### Doc Generator
```
- "Generate JSDoc for this file"
- "Create README for this project"
- "Generate API documentation"
```

### Refactor Assistant
```
- "Extract this code block to a function"
- "Convert callbacks to async/await"
- "Apply factory pattern to this code"
```

## 🚨 Troubleshooting

### MCP Not Appearing

**Problem**: MCP tools not showing up in editor

**Solution**:
1. Verify installation: `npm list -g | grep mcp`
2. Check configuration syntax (valid JSON)
3. Restart editor completely
4. Check editor logs for errors

### Command Not Found

**Problem**: `command not found: smart-reviewer-mcp`

**Solution**:
```bash
# Check npm global bin path
npm config get prefix

# Add to PATH (Linux/Mac)
echo 'export PATH="$PATH:$(npm config get prefix)/bin"' >> ~/.bashrc
source ~/.bashrc

# Or use npx
npx @j0kz/smart-reviewer-mcp
```

### Permission Errors

**Problem**: `EACCES: permission denied`

**Solution**:
```bash
# Fix npm permissions (Linux/Mac)
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Or use npx (no permissions needed)
npx @j0kz/smart-reviewer-mcp
```

### Slow Performance

**Problem**: MCPs running slowly

**Solution**:
- Use file-level operations instead of project-wide
- Enable caching (see [Performance Optimization](Performance-Optimization))
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096`

## 📚 Next Steps

Now that you're set up, explore:

1. **[Integration Patterns](Integration-Patterns)** - Chain multiple MCPs together
2. **[Performance Optimization](Performance-Optimization)** - Speed up with caching
3. **[Custom Workflows](Custom-Workflows)** - Build advanced pipelines
4. **[API Reference](API-Reference)** - Deep dive into MCP APIs

## 🎓 Learning Resources

- **[Examples](Examples)** - Real-world usage examples
- **[Recipes](Recipes)** - Common workflow patterns
- **[Best Practices](Best-Practices)** - Recommended approaches
- **[Video Tutorials](https://github.com/j0kz/mcp-agents#videos)** - Video guides

## 🆘 Get Help

- 📖 [Troubleshooting Guide](Troubleshooting)
- 💬 [GitHub Discussions](https://github.com/j0kz/mcp-agents/discussions)
- 🐛 [Report an Issue](https://github.com/j0kz/mcp-agents/issues)
- 📧 Contact: Open an issue on GitHub

---

**[← Back to Home](Home)** | **[Configuration Guide →](Configuration)**
