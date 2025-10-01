# My Claude Agents

Personal MCP agents for Claude Code - globally available across all projects.

## 🤖 Agents Included

### 1. Smart Code Reviewer 🔍
Intelligent code review with learning capabilities
- Detects anti-patterns and code smells
- Learns your team's coding style
- Suggests fixes with diffs
- Tracks code quality metrics

### 2. Test Intelligence Generator 🧪
Automated test generation with edge cases
- Generates comprehensive unit tests
- Creates integration test scenarios
- Calculates coverage estimation
- Supports Jest, Vitest, Mocha

### 3. Architecture Analyzer 🏗️
Architecture analysis and visualization
- Detects architecture violations
- Generates dependency graphs
- Identifies circular dependencies
- Suggests refactoring opportunities

## 🚀 Quick Start

### Installation

```bash
# Clone or download this repository
git clone <your-repo-url> my-claude-agents
cd my-claude-agents

# Install dependencies
npm install

# Build all agents
npm run build

# Install globally for Claude Code
npm run install-global
```

### Verify Installation

```bash
# Check MCP servers are registered
claude mcp list

# Should show:
# ✓ smart-reviewer (active)
# ✓ test-generator (active)
# ✓ architecture-analyzer (active)
```

## 📖 Usage

### In Claude Code CLI

```bash
# Use Smart Code Reviewer
claude code "Review this file with smart-reviewer: src/app.js"

# Use Test Generator
claude code "Generate tests for src/utils.js with test-generator"

# Use Architecture Analyzer
claude code "Analyze architecture with architecture-analyzer"
```

### In Claude Code Interactive Mode

```
User: "Review all my changes before commit"
Claude: Uses smart-reviewer automatically

User: "Generate tests for the new feature"
Claude: Uses test-generator automatically

User: "Check if my architecture is clean"
Claude: Uses architecture-analyzer automatically
```

### With SPARC Workflows

```bash
# Agents integrate seamlessly with SPARC
npx claude-flow sparc tdd "New feature with auto-review and tests"

# Claude Code orchestrates:
# 1. Specification
# 2. Test generation (test-generator)
# 3. Implementation
# 4. Code review (smart-reviewer)
# 5. Architecture check (architecture-analyzer)
```

## 🔧 Configuration

Each agent can be configured via environment variables or config files:

```bash
# ~/.config/claude-code/agents.config.json
{
  "smart-reviewer": {
    "severity": "strict",
    "autoFix": true,
    "customRules": "./my-rules.json"
  },
  "test-generator": {
    "framework": "jest",
    "coverage": 90,
    "includeEdgeCases": true
  },
  "architecture-analyzer": {
    "maxDepth": 3,
    "excludePatterns": ["node_modules", "dist"]
  }
}
```

## 🛠️ Development

```bash
# Build individual agent
npm run build:reviewer
npm run build:test-gen
npm run build:arch

# Run tests
npm test

# Watch mode for development
npm run dev
```

## 📦 Project Structure

```
my-claude-agents/
├── packages/
│   ├── smart-reviewer/       # Code review agent
│   ├── test-generator/        # Test generation agent
│   └── architecture-analyzer/ # Architecture analysis agent
├── shared/                    # Shared types and utilities
├── config/                    # Configuration files
└── scripts/                   # Installation scripts
```

## 🔄 Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and reinstall
npm run build
npm run install-global
```

## 🗑️ Uninstallation

```bash
npm run uninstall-global
```

## 📝 License

MIT
