#!/bin/bash
# Universal Claude Code Starter Kit Installer
# Works on macOS, Linux, and Windows (Git Bash/WSL)

set -e

echo "Installing Claude Code Starter Kit..."

# Check if CLAUDE.md exists
if [ -f "CLAUDE.md" ]; then
    echo "Warning: CLAUDE.md already exists!"
    read -p "Overwrite? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping CLAUDE.md"
    else
        cp CLAUDE.md CLAUDE.md.backup
        echo "Backed up existing CLAUDE.md"
    fi
fi

# Create .claude directory structure
mkdir -p .claude/skills

# Download or copy files
SCRIPT_DIR="$(dirname "$0")"

if [ -f "$SCRIPT_DIR/CLAUDE.md" ]; then
    # Local install from cloned repo
    cp "$SCRIPT_DIR/CLAUDE.md" ./CLAUDE.md 2>/dev/null || true
    cp -r "$SCRIPT_DIR/.claude/skills/"* ./.claude/skills/ 2>/dev/null || true
else
    echo "Error: Run this script from the starter-kit directory"
    exit 1
fi

echo ""
echo "Installation complete!"
echo ""
echo "Files created:"
echo "  - CLAUDE.md (customize for your project)"
echo "  - .claude/skills/ (10 universal skills)"
echo ""
echo "Next steps:"
echo "  1. Edit CLAUDE.md with your project details"
echo "  2. Add .claude/ to .gitignore if desired"
echo "  3. Start using Claude Code!"
echo ""
