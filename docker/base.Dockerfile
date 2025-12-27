# Base Dockerfile for MCP Servers
# Usage: docker build --build-arg PACKAGE_DIR=smart-reviewer --build-arg PACKAGE_SCOPE=smart-reviewer-mcp -f docker/base.Dockerfile .

FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace configuration files
COPY package*.json ./
COPY tsconfig*.json ./

# Copy shared package (dependency for all MCP servers)
COPY packages/shared ./packages/shared

# Package directory and npm scope name passed as build arguments
ARG PACKAGE_DIR
ARG PACKAGE_SCOPE
COPY packages/${PACKAGE_DIR} ./packages/${PACKAGE_DIR}

# Install dependencies and build
RUN npm ci --workspace=@j0kz/shared --workspace=@j0kz/${PACKAGE_SCOPE}
RUN npm run build --workspace=@j0kz/shared --workspace=@j0kz/${PACKAGE_SCOPE}

# Production image - minimal footprint
FROM node:20-alpine AS runtime

WORKDIR /app

# ARG must be redeclared after FROM
ARG PACKAGE_DIR
ARG PACKAGE_SCOPE
ARG MCP_DESCRIPTION="MCP Server"

# Copy built artifacts from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/${PACKAGE_DIR}/dist ./packages/${PACKAGE_DIR}/dist
COPY --from=builder /app/packages/${PACKAGE_DIR}/package.json ./packages/${PACKAGE_DIR}/

# Copy root package.json and node_modules from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev 2>/dev/null || true

# Set production environment
ENV NODE_ENV=production

# Store package dir as ENV for runtime access (ARG not available at runtime)
ENV MCP_PACKAGE=${PACKAGE_DIR}

# Docker MCP Gateway metadata label for server discovery
# This allows the gateway to discover and run this container as an MCP server
LABEL io.docker.server.metadata="{ \
  \"name\": \"${PACKAGE_SCOPE}\", \
  \"description\": \"${MCP_DESCRIPTION}\", \
  \"command\": [\"node\", \"packages/${PACKAGE_DIR}/dist/mcp-server.js\"] \
}"

# Health check - verify node process is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD pgrep -x node || exit 1

# Use shell form to expand ENV variable at runtime
# MCP servers use mcp-server.js as entry point (not index.js which is library export)
ENTRYPOINT ["sh", "-c", "node packages/${MCP_PACKAGE}/dist/mcp-server.js"]
