#!/bin/bash
# Claude Code Starter Kit - One-command installer
# Usage: curl -fsSL https://raw.githubusercontent.com/j0kz/mcp-agents/main/plugins/claude-code-starter/install.sh | bash

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}Claude Code Starter Kit${NC}"
echo "========================="
echo ""

# Check if we're in a project directory
if [ ! -f "package.json" ] && [ ! -f "requirements.txt" ] && [ ! -f "Cargo.toml" ] && [ ! -f "go.mod" ]; then
    echo -e "${YELLOW}Warning: No project file detected. Creating generic config.${NC}"
fi

# Create .claude directory structure
echo -e "${CYAN}Creating .claude/ directory structure...${NC}"
mkdir -p .claude/{commands,hooks,skills}

# Download plugin files
REPO_URL="https://raw.githubusercontent.com/j0kz/mcp-agents/main/plugins/claude-code-starter"

echo -e "${CYAN}Downloading commands...${NC}"
curl -fsSL "$REPO_URL/commands/setup.md" -o .claude/commands/starter-setup.md 2>/dev/null || echo "  - setup.md (skipped)"
curl -fsSL "$REPO_URL/commands/optimize.md" -o .claude/commands/starter-optimize.md 2>/dev/null || echo "  - optimize.md (skipped)"
curl -fsSL "$REPO_URL/commands/audit.md" -o .claude/commands/starter-audit.md 2>/dev/null || echo "  - audit.md (skipped)"
curl -fsSL "$REPO_URL/commands/quick-review.md" -o .claude/commands/starter-quick-review.md 2>/dev/null || echo "  - quick-review.md (skipped)"
curl -fsSL "$REPO_URL/commands/smart-commit.md" -o .claude/commands/starter-smart-commit.md 2>/dev/null || echo "  - smart-commit.md (skipped)"

echo -e "${CYAN}Downloading hooks...${NC}"
curl -fsSL "$REPO_URL/hooks/security-monitor.json" -o .claude/hooks/security-monitor.json 2>/dev/null || echo "  - security-monitor.json (skipped)"
curl -fsSL "$REPO_URL/hooks/auto-format.json" -o .claude/hooks/auto-format.json 2>/dev/null || echo "  - auto-format.json (skipped)"
curl -fsSL "$REPO_URL/hooks/test-runner.json" -o .claude/hooks/test-runner.json 2>/dev/null || echo "  - test-runner.json (skipped)"

echo -e "${CYAN}Downloading skills...${NC}"
curl -fsSL "$REPO_URL/skills/SKILL.md" -o .claude/skills/project-optimizer.md 2>/dev/null || echo "  - SKILL.md (skipped)"

# Create .claudeignore if it doesn't exist
if [ ! -f ".claudeignore" ]; then
    echo -e "${CYAN}Creating .claudeignore...${NC}"
    cat > .claudeignore << 'EOF'
# Dependencies
node_modules/
vendor/
.venv/
__pycache__/

# Build outputs
dist/
build/
.next/
target/

# Version control
.git/

# Large files
*.lock
*.log
coverage/
*.min.js
*.min.css

# IDE
.idea/
.vscode/
*.swp
EOF
fi

# Create basic CLAUDE.md if it doesn't exist
if [ ! -f "CLAUDE.md" ]; then
    echo -e "${CYAN}Creating CLAUDE.md template...${NC}"
    cat > CLAUDE.md << 'EOF'
# CLAUDE.md

## Project Overview

[Describe your project here]

## Build Commands

```bash
# Install dependencies
npm install  # or: pip install -r requirements.txt

# Run tests
npm test  # or: pytest

# Build
npm run build  # or: python -m build
```

## Important Directories

- `src/` - Source code
- `tests/` - Test files
- `docs/` - Documentation

## Conventions

- [Add your coding conventions here]
EOF
fi

# Check for Docker
if command -v docker &> /dev/null; then
    echo -e "${GREEN}Docker detected. MCP Gateway available for 95% token savings.${NC}"
    echo "  Run: docker compose -f docker-compose.mcp.yml up -d"
else
    echo -e "${YELLOW}Docker not detected. Install Docker for 95% token savings.${NC}"
fi

echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo "Available commands:"
echo "  /starter-setup        - Configure project"
echo "  /starter-optimize     - Optimize for tokens"
echo "  /starter-audit        - Health check"
echo "  /starter-quick-review - Pre-commit review"
echo "  /starter-smart-commit - Generate commit message"
echo ""
echo -e "${CYAN}Run '/starter-setup' to get started!${NC}"
