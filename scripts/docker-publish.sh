#!/bin/bash
# Docker Publish Script for MCP Agents
# Builds and pushes all MCP server containers to Docker Hub
#
# Usage: ./scripts/docker-publish.sh [--dry-run]
#
# Prerequisites:
# - Docker logged in: docker login
# - Docker buildx for multi-platform builds (optional)

set -euo pipefail

# Configuration
VERSION=$(node -p "require('./package.json').version")
REGISTRY="${DOCKER_REGISTRY:-docker.io/j0kz}"
DRY_RUN="${1:-}"

# All 10 MCP servers (matching packages/ directory)
PACKAGES=(
  "smart-reviewer"
  "test-generator"
  "architecture-analyzer"
  "security-scanner"
  "refactor-assistant"
  "api-designer"
  "db-schema"
  "doc-generator"
  "orchestrator-mcp"
  "auto-pilot"
)

echo "================================================"
echo "MCP Agents Docker Publisher"
echo "================================================"
echo "Version: $VERSION"
echo "Registry: $REGISTRY"
echo "Packages: ${#PACKAGES[@]}"
echo "================================================"

if [[ "$DRY_RUN" == "--dry-run" ]]; then
  echo "[DRY RUN] No images will be pushed"
fi

# Build and push each package
for pkg in "${PACKAGES[@]}"; do
  echo ""
  echo "----------------------------------------"
  echo "Building: $pkg"
  echo "----------------------------------------"

  IMAGE_NAME="$REGISTRY/mcp-$pkg"

  # Build the image
  docker build \
    --build-arg PACKAGE_NAME="$pkg" \
    -t "$IMAGE_NAME:$VERSION" \
    -t "$IMAGE_NAME:latest" \
    -f docker/base.Dockerfile \
    .

  if [[ "$DRY_RUN" != "--dry-run" ]]; then
    echo "Pushing: $IMAGE_NAME:$VERSION"
    docker push "$IMAGE_NAME:$VERSION"

    echo "Pushing: $IMAGE_NAME:latest"
    docker push "$IMAGE_NAME:latest"
  else
    echo "[DRY RUN] Would push: $IMAGE_NAME:$VERSION"
    echo "[DRY RUN] Would push: $IMAGE_NAME:latest"
  fi

  echo "Done: $pkg"
done

echo ""
echo "================================================"
echo "All packages processed!"
echo "================================================"
echo ""
echo "Images built:"
for pkg in "${PACKAGES[@]}"; do
  echo "  - $REGISTRY/mcp-$pkg:$VERSION"
done
