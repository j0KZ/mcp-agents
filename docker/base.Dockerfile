# Base Dockerfile for MCP Servers
# Usage: docker build --build-arg PACKAGE_NAME=smart-reviewer -f docker/base.Dockerfile .

FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace configuration files
COPY package*.json ./
COPY tsconfig*.json ./

# Copy shared package (dependency for all MCP servers)
COPY packages/shared ./packages/shared

# Package name passed as build argument
ARG PACKAGE_NAME
COPY packages/${PACKAGE_NAME} ./packages/${PACKAGE_NAME}

# Install dependencies and build
RUN npm ci --workspace=@j0kz/shared --workspace=@j0kz/${PACKAGE_NAME}
RUN npm run build --workspace=@j0kz/shared --workspace=@j0kz/${PACKAGE_NAME}

# Production image - minimal footprint
FROM node:20-alpine AS runtime

WORKDIR /app

# ARG must be redeclared after FROM
ARG PACKAGE_NAME

# Copy built artifacts from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/${PACKAGE_NAME}/dist ./packages/${PACKAGE_NAME}/dist
COPY --from=builder /app/packages/${PACKAGE_NAME}/package.json ./packages/${PACKAGE_NAME}/

# Copy root package files for workspace resolution
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --workspace=@j0kz/${PACKAGE_NAME}

# Set production environment
ENV NODE_ENV=production

# Store package name as ENV for runtime access (ARG not available at runtime)
ENV MCP_PACKAGE=${PACKAGE_NAME}

# Health check - verify node process is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD pgrep -x node || exit 1

# Use shell form to expand ENV variable at runtime
ENTRYPOINT ["sh", "-c", "node packages/${MCP_PACKAGE}/dist/index.js"]
