#!/usr/bin/env bash
# Count all tests across the monorepo

echo "=== Test Count Report ==="
echo ""

declare -A test_counts

packages=(
  "api-designer"
  "architecture-analyzer"
  "db-schema"
  "doc-generator"
  "orchestrator-mcp"
  "refactor-assistant"
  "security-scanner"
  "shared"
  "smart-reviewer"
  "test-generator"
)

total=0

for pkg in "${packages[@]}"; do
  count=$(npm test -w packages/$pkg 2>&1 | grep -oE "[0-9]+ passed" | head -1 | grep -oE "[0-9]+" || echo "0")
  if [ -z "$count" ]; then
    count=0
  fi
  echo "$pkg: $count tests"
  total=$((total + count))
done

echo ""
echo "==================================="
echo "TOTAL: $total tests"
echo "==================================="
