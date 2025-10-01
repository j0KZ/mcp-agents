#!/bin/bash
# Auto-installer for My Claude Agents
# Usage: curl -fsSL <URL> | bash

set -e

echo "🚀 My Claude Agents - Auto Installer"
echo "===================================="
echo ""

# Configuration
REPO_URL="https://github.com/YOUR-USERNAME/my-claude-agents.git"
INSTALL_DIR="$HOME/.claude-agents"

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Visit https://nodejs.org/"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ Git is required but not installed."; exit 1; }
command -v claude >/dev/null 2>&1 || { echo "❌ Claude Code CLI is required. Visit https://claude.ai/code"; exit 1; }

# Install or update
if [ -d "$INSTALL_DIR" ]; then
  echo "📦 Found existing installation, updating..."
  cd "$INSTALL_DIR"
  git pull origin main
else
  echo "📦 Cloning repository..."
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# Build
echo ""
echo "🔨 Building MCP agents..."
npm install
npm run build

# Verify build
echo ""
echo "✅ Verifying builds..."
for pkg in smart-reviewer test-generator architecture-analyzer; do
  if [ -f "packages/$pkg/dist/mcp-server.js" ]; then
    echo "  ✓ $pkg built successfully"
  else
    echo "  ✗ $pkg build failed"
    exit 1
  fi
done

# Add to Claude Code (user scope for all projects)
echo ""
echo "🔗 Adding MCPs to Claude Code (user scope)..."

claude mcp add smart-reviewer node "$INSTALL_DIR/packages/smart-reviewer/dist/mcp-server.js" --scope user 2>/dev/null || echo "  (smart-reviewer already exists, skipping)"
claude mcp add test-generator node "$INSTALL_DIR/packages/test-generator/dist/mcp-server.js" --scope user 2>/dev/null || echo "  (test-generator already exists, skipping)"
claude mcp add architecture-analyzer node "$INSTALL_DIR/packages/architecture-analyzer/dist/mcp-server.js" --scope user 2>/dev/null || echo "  (architecture-analyzer already exists, skipping)"

# Verify installation
echo ""
echo "📊 Verifying MCP connections..."
claude mcp list

echo ""
echo "✅ Installation complete!"
echo ""
echo "Your MCPs are now available in ALL Claude Code sessions."
echo ""
echo "To update later, run:"
echo "  cd $INSTALL_DIR && git pull && npm run build"
echo ""
echo "To remove:"
echo "  claude mcp remove smart-reviewer --scope user"
echo "  claude mcp remove test-generator --scope user"
echo "  claude mcp remove architecture-analyzer --scope user"
echo "  rm -rf $INSTALL_DIR"
