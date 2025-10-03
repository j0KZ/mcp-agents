# MCP Editor Compatibility Guide

Your @j0kz MCP agents work with **any editor that supports the Model Context Protocol (MCP)**.

## ✅ Confirmed Compatible Editors

### 1. **Claude Code** (Anthropic)
- ✅ Full native support
- ✅ Best integration

**Installation:**
```bash
# Install all 3 MCPs globally
claude mcp add smart-reviewer "npx @j0kz/smart-reviewer-mcp" --scope user
claude mcp add test-generator "npx @j0kz/test-generator-mcp" --scope user
claude mcp add architecture-analyzer "npx @j0kz/architecture-analyzer-mcp" --scope user
```

### 2. **Cursor** (cursor.sh)
- ✅ Supports MCP via configuration
- ✅ AI-powered editing

**Installation:**
Add to Cursor's MCP config (`~/.cursor/mcp_config.json`):
```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["@j0kz/smart-reviewer-mcp"]
    },
    "test-generator": {
      "command": "npx",
      "args": ["@j0kz/test-generator-mcp"]
    },
    "architecture-analyzer": {
      "command": "npx",
      "args": ["@j0kz/architecture-analyzer-mcp"]
    }
  }
}
```

### 3. **Windsurf** (Codeium)
- ✅ Supports MCP
- ✅ Multi-file editing

**Installation:**
Add to Windsurf settings:
```json
{
  "mcp": {
    "servers": {
      "smart-reviewer": {
        "command": "npx @j0kz/smart-reviewer-mcp"
      },
      "test-generator": {
        "command": "npx @j0kz/test-generator-mcp"
      },
      "architecture-analyzer": {
        "command": "npx @j0kz/architecture-analyzer-mcp"
      }
    }
  }
}
```

### 4. **Roo Code** (roo-cline)
- ✅ MCP integration
- ✅ Autonomous coding

**Installation:**
Configure in Roo Code settings:
```bash
# Via Roo Code CLI
roo mcp add smart-reviewer npx @j0kz/smart-reviewer-mcp
roo mcp add test-generator npx @j0kz/test-generator-mcp
roo mcp add architecture-analyzer npx @j0kz/architecture-analyzer-mcp
```

### 5. **Continue** (continue.dev)
- ✅ MCP support via plugins
- ✅ VS Code extension

**Installation:**
Add to Continue config (`.continue/config.json`):
```json
{
  "mcp": [
    {
      "name": "smart-reviewer",
      "command": "npx",
      "args": ["@j0kz/smart-reviewer-mcp"]
    },
    {
      "name": "test-generator",
      "command": "npx",
      "args": ["@j0kz/test-generator-mcp"]
    },
    {
      "name": "architecture-analyzer",
      "command": "npx",
      "args": ["@j0kz/architecture-analyzer-mcp"]
    }
  ]
}
```

### 6. **Zed** (zed.dev)
- ✅ MCP integration planned/available
- ✅ High-performance editor

**Installation:**
Check Zed docs for latest MCP configuration format.

---

## 📦 Package URLs

Available on NPM:
- **Smart Reviewer**: https://www.npmjs.com/package/@j0kz/smart-reviewer-mcp
- **Test Generator**: https://www.npmjs.com/package/@j0kz/test-generator-mcp
- **Architecture Analyzer**: https://www.npmjs.com/package/@j0kz/architecture-analyzer-mcp

---

## 🎯 Usage (Editor-Agnostic)

Once installed, use these tools through your editor's AI chat:

### Smart Reviewer
```
"Review this file for code quality issues"
"Check for anti-patterns in src/utils.js"
"Suggest improvements for this function"
```

### Test Generator
```
"Generate unit tests for this function"
"Create test cases with edge cases for src/api.js"
"Generate integration tests for the auth module"
```

### Architecture Analyzer
```
"Analyze the project architecture"
"Find circular dependencies"
"Check for layer violations"
"Generate a dependency graph"
```

---

## 🔧 Manual Configuration (Any Editor)

If your editor supports MCP but isn't listed:

1. **Find your editor's MCP config location**
2. **Add MCP servers:**

```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["@j0kz/smart-reviewer-mcp"]
    },
    "test-generator": {
      "command": "npx",
      "args": ["@j0kz/test-generator-mcp"]
    },
    "architecture-analyzer": {
      "command": "npx",
      "args": ["@j0kz/architecture-analyzer-mcp"]
    }
  }
}
```

3. **Restart your editor**

---

## 🆚 Editor Comparison

| Editor | MCP Support | Installation | Performance | Best For |
|--------|-------------|--------------|-------------|----------|
| **Claude Code** | ⭐⭐⭐⭐⭐ | Native CLI | Excellent | MCP-first workflows |
| **Cursor** | ⭐⭐⭐⭐ | Config file | Very Good | AI pair programming |
| **Windsurf** | ⭐⭐⭐⭐ | Settings | Very Good | Multi-file edits |
| **Roo Code** | ⭐⭐⭐⭐ | CLI | Excellent | Autonomous coding |
| **Continue** | ⭐⭐⭐ | VS Code ext | Good | VS Code users |
| **Zed** | ⭐⭐⭐ | TBD | Excellent | Performance-focused |

---

## ❓ Troubleshooting

### MCPs Not Showing Up

1. **Verify installation:**
   ```bash
   npx @j0kz/smart-reviewer-mcp --version
   ```

2. **Check Node.js version:**
   ```bash
   node --version  # Should be 18+
   ```

3. **Restart editor completely**

4. **Check editor logs** for MCP connection errors

### Connection Errors

- Ensure `npx` is in your PATH
- Try absolute path instead of `npx`:
  ```json
  {
    "command": "node",
    "args": ["/path/to/global/node_modules/@j0kz/smart-reviewer-mcp/dist/mcp-server.js"]
  }
  ```

---

## 🌐 Universal MCP Client

For testing or custom integrations, use the MCP inspector:

```bash
npx @modelcontextprotocol/inspector npx @j0kz/smart-reviewer-mcp
```

This opens a web interface to test MCP tools directly.

---

## 📚 Resources

- **MCP Specification**: https://modelcontextprotocol.io/
- **NPM Profile**: https://www.npmjs.com/~j0kz
- **GitHub**: https://github.com/j0kz/mcp-agents
- **Issues**: https://github.com/j0kz/mcp-agents/issues
