#!/bin/bash

# ============================================
# MCP Tools + Universal Skills Quick Setup
# ============================================
# This script installs MCP tools and optionally
# downloads universal skills documentation
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   MCP Tools + Skills Quick Setup        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

OS=$(detect_os)

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js detected: $(node --version)"

# Step 1: Install MCP Tools
echo ""
echo -e "${YELLOW}Step 1: Installing MCP Tools...${NC}"
echo "This will configure your AI editor with 10 MCP tools"
echo ""

npx @j0kz/mcp-agents@latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MCP Tools installed successfully!${NC}"
else
    echo -e "${RED}❌ MCP Tools installation failed${NC}"
    exit 1
fi

# Step 2: Ask about Universal Skills
echo ""
echo -e "${YELLOW}Step 2: Universal Skills Documentation${NC}"
echo "Would you like to download the universal skills guides?"
echo "These are 10 markdown guides for common development tasks."
echo ""
read -p "Download universal skills? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Downloading universal skills...${NC}"

    # Create directory
    mkdir -p .claude/universal-skills

    # Download skills
    SKILLS=(
        "quick-pr-review"
        "debug-detective"
        "performance-hunter"
        "legacy-modernizer"
        "zero-to-hero"
        "test-coverage-boost"
        "tech-debt-tracker"
        "dependency-doctor"
        "security-first"
        "api-integration"
    )

    BASE_URL="https://raw.githubusercontent.com/j0KZ/mcp-agents/main/.claude/universal-skills"

    # Download INDEX.md
    curl -sL "$BASE_URL/INDEX.md" -o .claude/universal-skills/INDEX.md

    # Download each skill
    for skill in "${SKILLS[@]}"; do
        echo "  Downloading $skill..."
        mkdir -p ".claude/universal-skills/$skill"
        curl -sL "$BASE_URL/$skill/SKILL.md" -o ".claude/universal-skills/$skill/SKILL.md"
    done

    echo -e "${GREEN}✅ Universal skills downloaded to .claude/universal-skills/${NC}"
else
    echo "Skipping universal skills download."
    echo ""
    echo "You can always view them online at:"
    echo "https://github.com/j0KZ/mcp-agents/tree/main/.claude/universal-skills"
fi

# Step 3: Create quick reference
echo ""
echo -e "${YELLOW}Creating quick reference file...${NC}"

cat > mcp-quick-reference.md << 'EOF'
# MCP Tools & Skills Quick Reference

## Installed MCP Tools (10)

Use these by asking your AI naturally:
- "Review this file for issues"
- "Generate tests for this function"
- "Find security vulnerabilities"
- "Check for circular dependencies"
- "Design a REST API for users"
- "Create database schema"
- "Generate documentation"
- "Refactor this code"
- "Run complete code quality check"
- "Start auto-pilot mode"

## Universal Skills (10)

Located in `.claude/universal-skills/`:
1. **quick-pr-review** - Pre-PR checklist
2. **debug-detective** - Systematic debugging
3. **performance-hunter** - Find bottlenecks
4. **legacy-modernizer** - Modernize old code
5. **zero-to-hero** - Master any codebase
6. **test-coverage-boost** - Increase coverage
7. **tech-debt-tracker** - Manage technical debt
8. **dependency-doctor** - Fix package issues
9. **security-first** - Security checklist
10. **api-integration** - Connect to APIs

## Quick Commands

```bash
# Check MCP tools status
"Check MCP server status"

# Use a skill
"Apply the debug-detective skill to find this bug"

# Run security audit
"Run security-first checklist"
```

## Need Help?

- MCP Tools Docs: https://github.com/j0KZ/mcp-agents/wiki
- Universal Skills: .claude/universal-skills/INDEX.md
- Report Issues: https://github.com/j0KZ/mcp-agents/issues
EOF

echo -e "${GREEN}✅ Created mcp-quick-reference.md${NC}"

# Final summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ✅ Setup Complete!               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "What's been set up:"
echo "  ✅ MCP Tools configured in your AI editor"

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  ✅ Universal skills downloaded locally"
fi

echo "  ✅ Quick reference guide created"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Restart your AI editor to load MCP tools${NC}"
echo ""
echo "To get started:"
echo '  1. Restart your editor (Claude/Cursor/Windsurf)'
echo '  2. Try: "Review my package.json"'
echo '  3. Read: mcp-quick-reference.md'
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"