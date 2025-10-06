# Getting Started with MCP Agents

Welcome! This tutorial will get you up and running with MCP Agents in minutes.

## Prerequisites

- Node.js 18+ installed
- Claude Code, Cursor, Windsurf, or Roo Code editor
- npm or yarn package manager

## Installation

### Option 1: Install Individual Tools (Recommended)

Install only the tools you need:

```bash
# Test Generator
npm install -g @j0kz/test-generator-mcp

# Smart Code Reviewer
npm install -g @j0kz/smart-reviewer-mcp

# API Designer
npm install -g @j0kz/api-designer-mcp

# Database Schema Designer
npm install -g @j0kz/db-schema-mcp

# Refactor Assistant
npm install -g @j0kz/refactor-assistant-mcp

# Documentation Generator
npm install -g @j0kz/doc-generator-mcp

# Security Scanner
npm install -g @j0kz/security-scanner-mcp

# Architecture Analyzer
npm install -g @j0kz/architecture-analyzer-mcp
```

### Option 2: Install All Tools

```bash
npm install -g @j0kz/test-generator-mcp @j0kz/smart-reviewer-mcp @j0kz/api-designer-mcp @j0kz/db-schema-mcp @j0kz/refactor-assistant-mcp @j0kz/doc-generator-mcp @j0kz/security-scanner-mcp @j0kz/architecture-analyzer-mcp
```

## Configuration

### For Claude Code

Add to your MCP settings (`~/.config/claude/mcp_settings.json`):

```json
{
  "mcpServers": {
    "test-generator": {
      "command": "test-generator-mcp"
    },
    "smart-reviewer": {
      "command": "smart-reviewer-mcp"
    },
    "api-designer": {
      "command": "api-designer-mcp"
    },
    "db-schema": {
      "command": "db-schema-mcp"
    },
    "refactor-assistant": {
      "command": "refactor-assistant-mcp"
    },
    "doc-generator": {
      "command": "doc-generator-mcp"
    },
    "security-scanner": {
      "command": "security-scanner-mcp"
    },
    "architecture-analyzer": {
      "command": "architecture-analyzer-mcp"
    }
  }
}
```

### For Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "servers": {
    "test-generator": {
      "command": "test-generator-mcp"
    }
  }
}
```

### For Windsurf

Add to your Windsurf settings.

### For Roo Code

Configure in Roo Code's MCP settings panel.

## First Steps

### 1. Generate Your First Test

Create a simple JavaScript file:

```javascript
// math.js
export function add(a, b) {
  return a + b;
}
```

Then ask Claude:

```
Generate tests for math.js using vitest
```

You'll get:

```javascript
import { describe, it, expect } from 'vitest';
import { add } from './math.js';

describe('add', () => {
  it('should add two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should handle zero', () => {
    expect(add(0, 5)).toBe(5);
  });

  it('should add negative numbers', () => {
    expect(add(-2, 3)).toBe(1);
  });
});
```

### 2. Design Your First API

Ask Claude:

```
Design a REST API for a blog with posts and comments
```

You'll get complete endpoint specifications, request/response examples, and OpenAPI specs!

### 3. Scan for Security Issues

Ask Claude:

```
Scan my project for security vulnerabilities
```

Get instant feedback on SQL injection, XSS, hardcoded secrets, and more.

## Common Commands

```
# Generate tests
"Generate tests for src/calculator.js"

# Review code
"Review src/user-service.js for bugs and security issues"

# Design API
"Design a REST API for user management"

# Create database schema
"Design a PostgreSQL schema for an e-commerce site"

# Refactor code
"Convert this callback code to async/await"

# Generate docs
"Generate JSDoc comments for src/utils.js"

# Security scan
"Scan src/ for vulnerabilities"

# Architecture analysis
"Check for circular dependencies in src/"
```

## Tips for Success

1. **Be Specific**: Instead of "review my code", say "review UserService.ts for performance issues"

2. **Provide Context**: "This is an Express.js API with MongoDB" helps tools give better suggestions

3. **Iterate**: Start with one tool, learn it well, then add more

4. **Combine Tools**: Use security-scanner → refactor-assistant → test-generator workflow

5. **Check Output**: Always review generated code before committing

## Troubleshooting

### Tool Not Found

```bash
# Verify installation
npm list -g | grep j0kz

# Reinstall if needed
npm install -g @j0kz/test-generator-mcp --force
```

### Permission Issues

```bash
# On macOS/Linux, use sudo
sudo npm install -g @j0kz/test-generator-mcp
```

### MCP Server Won't Start

- Check that Node.js 18+ is installed: `node --version`
- Verify the tool is in your PATH: `which test-generator-mcp`
- Check MCP settings JSON syntax

## Next Steps

- 📖 Read [Common Workflows](./02-common-workflows.md)
- 🚀 Explore [Advanced Usage](./03-advanced-usage.md)
- ✨ Learn [Best Practices](./04-best-practices.md)

## Getting Help

- 📚 [GitHub Wiki](https://github.com/j0KZ/mcp-agents/wiki)
- 🐛 [Report Issues](https://github.com/j0KZ/mcp-agents/issues)
- 💬 Ask questions in discussions

Happy coding! 🎉
