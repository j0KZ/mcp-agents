#!/bin/bash

echo "🚀 Installing My Claude Agents as MCP servers for Claude Code..."
echo

# Get the project root directory (parent of scripts folder)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📂 Project root: $PROJECT_ROOT"
echo

echo "Adding smart-reviewer..."
claude mcp add smart-reviewer node "$PROJECT_ROOT/packages/smart-reviewer/dist/mcp-server.js"
if [ $? -ne 0 ]; then
    echo "❌ Failed to add smart-reviewer"
    exit 1
fi
echo "✅ smart-reviewer added"
echo

echo "Adding test-generator..."
claude mcp add test-generator node "$PROJECT_ROOT/packages/test-generator/dist/mcp-server.js"
if [ $? -ne 0 ]; then
    echo "❌ Failed to add test-generator"
    exit 1
fi
echo "✅ test-generator added"
echo

echo "Adding architecture-analyzer..."
claude mcp add architecture-analyzer node "$PROJECT_ROOT/packages/architecture-analyzer/dist/mcp-server.js"
if [ $? -ne 0 ]; then
    echo "❌ Failed to add architecture-analyzer"
    exit 1
fi
echo "✅ architecture-analyzer added"
echo

echo
echo "✨ Installation complete!"
echo
echo "🔍 Verifying installation..."
claude mcp list
echo
echo "📚 Usage examples:"
echo "  claude code \"Review src/app.js with smart-reviewer\""
echo "  claude code \"Generate tests for src/utils.js\""
echo "  claude code \"Analyze project architecture\""
echo
