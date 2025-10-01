#!/bin/bash
# Publish all 8 MCP packages to NPM

echo "🚀 Publishing all 8 @j0kz MCP packages v1.0.2..."
echo ""

packages=(
  "smart-reviewer"
  "test-generator"
  "architecture-analyzer"
  "doc-generator"
  "security-scanner"
  "refactor-assistant"
  "api-designer"
  "db-schema"
)

for pkg in "${packages[@]}"; do
  echo "📦 Publishing @j0kz/${pkg}-mcp..."
  npm publish -w "packages/${pkg}" --access public
  if [ $? -eq 0 ]; then
    echo "✅ ${pkg} published successfully"
  else
    echo "❌ ${pkg} failed to publish"
  fi
  echo ""
done

echo "🎉 All packages published!"
echo "Visit: https://www.npmjs.com/~j0kz"
