#!/bin/bash
# Install all 8 @j0kz MCP agents for Claude Code

echo "🚀 Installing all 8 @j0kz MCP Development Tools..."
echo ""

# Array of all MCPs
mcps=(
  "smart-reviewer:@j0kz/smart-reviewer-mcp"
  "test-generator:@j0kz/test-generator-mcp"
  "architecture-analyzer:@j0kz/architecture-analyzer-mcp"
  "doc-generator:@j0kz/doc-generator-mcp"
  "security-scanner:@j0kz/security-scanner-mcp"
  "refactor-assistant:@j0kz/refactor-assistant-mcp"
  "api-designer:@j0kz/api-designer-mcp"
  "db-schema:@j0kz/db-schema-mcp"
)

# Install each MCP
for mcp in "${mcps[@]}"; do
  IFS=':' read -r name package <<< "$mcp"
  echo "📦 Installing $name..."
  claude mcp add "$name" "npx $package" --scope user
done

echo ""
echo "✅ All 8 @j0kz MCPs installed successfully!"
echo ""
echo "🎉 You can now use them in Claude Code:"
echo "   - Ask to 'review my code'"
echo "   - Ask to 'generate tests'"
echo "   - Ask to 'analyze architecture'"
echo "   - And more!"
echo ""
echo "📋 Check installation: claude mcp list"
