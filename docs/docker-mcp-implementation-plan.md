# Docker MCP Implementation Plan

## Executive Summary

Migrate the `@j0kz/mcp-agents` monorepo to Docker MCP Gateway architecture to achieve **75-95% token reduction** while maintaining backward compatibility.

**Current State**: 9 MCP servers as npm packages with stdio transport
**Target State**: Containerized MCP servers behind Docker MCP Gateway with dynamic tool discovery

---

## Architecture Overview

### Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Client (Claude)                      │
├─────────────────────────────────────────────────────────────┤
│                    Context Window (~50 tools)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Tool 1   │ │ Tool 2   │ │ Tool 3   │ │ ...50    │       │
│  │ ~200 tok │ │ ~200 tok │ │ ~200 tok │ │ ~200 tok │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                    Total: ~10,000+ tokens                    │
└─────────────────────────────────────────────────────────────┘
                              │
                    stdio transport (9 connections)
                              │
    ┌─────────────────────────┼─────────────────────────┐
    ▼                         ▼                         ▼
┌────────────┐         ┌────────────┐           ┌────────────┐
│ smart-     │         │ test-      │           │ orchestr-  │
│ reviewer   │         │ generator  │           │ ator       │
└────────────┘         └────────────┘           └────────────┘
```

### Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Client (Claude)                      │
├─────────────────────────────────────────────────────────────┤
│              Context Window (3 gateway tools)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │ mcp-find │ │ mcp-add  │ │code-mode │                     │
│  │ ~150 tok │ │ ~150 tok │ │ ~200 tok │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
│                    Total: ~500 tokens                        │
└─────────────────────────────────────────────────────────────┘
                              │
                    Single Gateway Connection
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Docker MCP Gateway                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Tool Registry (50 tools available, not loaded)     │    │
│  │  - Dynamic discovery via mcp-find                   │    │
│  │  - On-demand loading via mcp-add                    │    │
│  │  - Code composition via code-mode                   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
              Container Network (isolated)
                              │
    ┌─────────────────────────┼─────────────────────────┐
    ▼                         ▼                         ▼
┌────────────┐         ┌────────────┐           ┌────────────┐
│ Container  │         │ Container  │           │ Container  │
│ smart-     │         │ test-      │           │ orchestr-  │
│ reviewer   │         │ generator  │           │ ator       │
└────────────┘         └────────────┘           └────────────┘
```

### Token Savings Calculation

| Scenario | Before | After | Savings |
|----------|--------|-------|---------|
| All tools loaded | 10,000 tokens | 500 tokens | **95%** |
| Typical workflow (5 tools) | 10,000 tokens | 1,500 tokens | **85%** |
| Single tool use | 10,000 tokens | 700 tokens | **93%** |

---

## Phase 1: Containerization (Week 1-2)

### 1.1 Create Base Dockerfile Template

```dockerfile
# docker/base.Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY tsconfig*.json ./
COPY packages/shared ./packages/shared

ARG PACKAGE_NAME
COPY packages/${PACKAGE_NAME} ./packages/${PACKAGE_NAME}

# Install and build
RUN npm ci --workspace=@j0kz/shared --workspace=@j0kz/${PACKAGE_NAME}
RUN npm run build --workspace=@j0kz/shared --workspace=@j0kz/${PACKAGE_NAME}

# Production image
FROM node:20-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/${PACKAGE_NAME}/dist ./packages/${PACKAGE_NAME}/dist
COPY --from=builder /app/packages/${PACKAGE_NAME}/package.json ./packages/${PACKAGE_NAME}/

# Install production deps only
RUN npm ci --omit=dev --workspace=@j0kz/${PACKAGE_NAME}

ENV NODE_ENV=production

ENTRYPOINT ["node", "packages/${PACKAGE_NAME}/dist/index.js"]
```

### 1.2 Package-Specific Dockerfiles

Create `Dockerfile` in each package directory:

```
packages/
├── smart-reviewer/
│   └── Dockerfile
├── test-generator/
│   └── Dockerfile
├── code-analyzer/
│   └── Dockerfile
├── security-scanner/
│   └── Dockerfile
├── refactor-assistant/
│   └── Dockerfile
├── api-designer/
│   └── Dockerfile
├── db-schema/
│   └── Dockerfile
├── doc-generator/
│   └── Dockerfile
└── orchestrator/
    └── Dockerfile
```

### 1.3 Docker Compose for Local Development

```yaml
# docker-compose.mcp.yml
version: '3.8'

services:
  mcp-gateway:
    image: docker/mcp-gateway:latest
    ports:
      - "8811:8811"
    volumes:
      - ./docker/mcp-config:/config
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - MCP_CONFIG_PATH=/config/servers.json

  smart-reviewer:
    build:
      context: .
      dockerfile: packages/smart-reviewer/Dockerfile
    labels:
      - "mcp.server=true"
      - "mcp.name=smart-reviewer"
      - "mcp.description=AI-powered code review with security analysis"

  test-generator:
    build:
      context: .
      dockerfile: packages/test-generator/Dockerfile
    labels:
      - "mcp.server=true"
      - "mcp.name=test-generator"

  code-analyzer:
    build:
      context: .
      dockerfile: packages/code-analyzer/Dockerfile
    labels:
      - "mcp.server=true"
      - "mcp.name=code-analyzer"

  security-scanner:
    build:
      context: .
      dockerfile: packages/security-scanner/Dockerfile
    labels:
      - "mcp.server=true"
      - "mcp.name=security-scanner"

  refactor-assistant:
    build:
      context: .
      dockerfile: packages/refactor-assistant/Dockerfile
    labels:
      - "mcp.server=true"
      - "mcp.name=refactor-assistant"

  api-designer:
    build:
      context: .
      dockerfile: packages/api-designer/Dockerfile
    labels:
      - "mcp.server=true"
      - "mcp.name=api-designer"

  db-schema:
    build:
      context: .
      dockerfile: packages/db-schema/Dockerfile
    labels:
      - "mcp.server=true"
      - "mcp.name=db-schema"

  doc-generator:
    build:
      context: .
      dockerfile: packages/doc-generator/Dockerfile
    labels:
      - "mcp.server=true"
      - "mcp.name=doc-generator"

  orchestrator:
    build:
      context: .
      dockerfile: packages/orchestrator/Dockerfile
    labels:
      - "mcp.server=true"
      - "mcp.name=orchestrator"
    depends_on:
      - smart-reviewer
      - test-generator
      - security-scanner

networks:
  default:
    name: mcp-network
```

### 1.4 MCP Gateway Configuration

```json
// docker/mcp-config/servers.json
{
  "servers": {
    "smart-reviewer": {
      "transport": "docker",
      "container": "mcp-agents-smart-reviewer-1",
      "autoLoad": false,
      "categories": ["analysis", "review"],
      "tools": [
        "review_file",
        "review_diff",
        "analyze_architecture"
      ]
    },
    "test-generator": {
      "transport": "docker",
      "container": "mcp-agents-test-generator-1",
      "autoLoad": false,
      "categories": ["generation", "testing"],
      "tools": [
        "generate_tests",
        "generate_test_suite",
        "analyze_coverage"
      ]
    },
    "security-scanner": {
      "transport": "docker",
      "container": "mcp-agents-security-scanner-1",
      "autoLoad": false,
      "categories": ["security"],
      "tools": [
        "scan_file",
        "scan_secrets",
        "scan_owasp",
        "scan_dependencies"
      ]
    },
    "orchestrator": {
      "transport": "docker",
      "container": "mcp-agents-orchestrator-1",
      "autoLoad": true,
      "categories": ["orchestration"],
      "tools": [
        "run_workflow",
        "search_tools",
        "load_tool",
        "list_capabilities"
      ]
    }
  },
  "gateway": {
    "dynamicDiscovery": true,
    "codeMode": true,
    "defaultResponseFormat": "concise"
  }
}
```

---

## Phase 2: Gateway Integration (Week 2-3)

### 2.1 Enhanced Orchestrator for Gateway Mode

```typescript
// packages/orchestrator/src/gateway-mode.ts

interface GatewayConfig {
  endpoint: string;
  dynamicDiscovery: boolean;
  codeMode: boolean;
}

export class GatewayOrchestrator {
  private loadedTools: Set<string> = new Set();
  private gateway: MCPGatewayClient;

  constructor(config: GatewayConfig) {
    this.gateway = new MCPGatewayClient(config.endpoint);
  }

  /**
   * Find tools by query - does NOT load them into context
   */
  async findTools(query: string): Promise<ToolMetadata[]> {
    return this.gateway.call('mcp-find', { query });
  }

  /**
   * Load specific tool into context - only when needed
   */
  async loadTool(toolName: string, server: string): Promise<void> {
    if (this.loadedTools.has(`${server}:${toolName}`)) {
      return; // Already loaded
    }

    await this.gateway.call('mcp-add', {
      server,
      tools: [toolName]
    });

    this.loadedTools.add(`${server}:${toolName}`);
  }

  /**
   * Execute code against multiple tools - maximum efficiency
   */
  async executeCode(code: string, servers: string[]): Promise<any> {
    return this.gateway.call('code-mode', {
      code,
      servers,
      sandbox: true
    });
  }

  /**
   * Run workflow with minimal token usage
   */
  async runWorkflow(
    workflowName: string,
    params: WorkflowParams
  ): Promise<WorkflowResult> {
    // Use code-mode for complex workflows
    if (this.isComplexWorkflow(workflowName)) {
      return this.runWorkflowAsCode(workflowName, params);
    }

    // Simple workflows: load only needed tools
    const workflow = WORKFLOWS[workflowName];
    for (const step of workflow.steps) {
      await this.loadTool(step.tool, step.server);
    }

    return this.executeWorkflow(workflow, params);
  }

  private async runWorkflowAsCode(
    workflowName: string,
    params: WorkflowParams
  ): Promise<WorkflowResult> {
    const code = this.generateWorkflowCode(workflowName, params);
    const servers = this.getWorkflowServers(workflowName);

    // Execute entire workflow in sandbox - only results return
    const result = await this.executeCode(code, servers);

    return {
      ...result,
      tokensUsed: this.estimateTokens(result), // Much smaller!
    };
  }
}
```

### 2.2 Code-Mode Workflow Templates

```typescript
// packages/orchestrator/src/code-templates/pre-merge.ts

export const PRE_MERGE_WORKFLOW_CODE = `
// This runs in the code-mode sandbox
// Only the final summary returns to the model context

const results = {
  review: null,
  security: null,
  tests: null,
  architecture: null
};

// 1. Run security scan first (blocking issues)
results.security = await mcp.call('security-scanner', 'scan_file', {
  filePath: params.filePath,
  config: { response_format: 'minimal' }
});

if (results.security.criticalIssues > 0) {
  return {
    status: 'blocked',
    reason: 'Critical security issues found',
    details: results.security.issues.filter(i => i.severity === 'critical')
  };
}

// 2. Run remaining checks in parallel
const [review, tests, arch] = await Promise.all([
  mcp.call('smart-reviewer', 'review_file', {
    filePath: params.filePath,
    config: { response_format: 'concise' }
  }),
  mcp.call('test-generator', 'analyze_coverage', {
    filePath: params.filePath
  }),
  mcp.call('code-analyzer', 'analyze_architecture', {
    filePath: params.filePath,
    config: { response_format: 'minimal' }
  })
]);

results.review = review;
results.tests = tests;
results.architecture = arch;

// 3. Return summary only (not full results)
return {
  status: 'complete',
  summary: {
    reviewScore: results.review.score,
    securityIssues: results.security.totalIssues,
    testCoverage: results.tests.coverage,
    architectureScore: results.architecture.score
  },
  actionItems: [
    ...results.review.suggestions.slice(0, 3),
    ...results.security.issues.slice(0, 3)
  ]
};
`;
```

---

## Phase 3: Client Configuration (Week 3)

### 3.1 Claude Desktop Configuration

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "j0kz-mcp-gateway": {
      "command": "docker",
      "args": [
        "mcp", "gateway", "run",
        "--config", "/path/to/mcp-config/servers.json"
      ],
      "env": {
        "DOCKER_HOST": "unix:///var/run/docker.sock"
      }
    }
  }
}
```

### 3.2 VS Code Copilot Configuration

```json
// .vscode/mcp.json
{
  "servers": {
    "j0kz-gateway": {
      "type": "docker-mcp",
      "gateway": {
        "port": 8811,
        "dynamicDiscovery": true,
        "codeMode": true
      }
    }
  }
}
```

### 3.3 Backward Compatibility Layer

```typescript
// packages/shared/src/mcp-compat.ts

/**
 * Compatibility layer for non-Docker environments
 * Falls back to stdio transport if Docker not available
 */
export async function createMCPConnection(
  config: MCPConfig
): Promise<MCPConnection> {

  if (await isDockerAvailable()) {
    // Use Docker MCP Gateway (optimal)
    return new DockerGatewayConnection(config);
  }

  if (await isGatewayRunning(config.gatewayPort)) {
    // Use standalone gateway
    return new GatewayConnection(config);
  }

  // Fallback to stdio (backward compatible)
  console.warn('Docker not available, using stdio transport');
  return new StdioConnection(config);
}
```

---

## Phase 4: Publishing to Docker Hub (Week 4)

### 4.1 Build and Push Script

```bash
#!/bin/bash
# scripts/docker-publish.sh

VERSION=$(node -p "require('./package.json').version")
REGISTRY="docker.io/j0kz"

PACKAGES=(
  "smart-reviewer"
  "test-generator"
  "code-analyzer"
  "security-scanner"
  "refactor-assistant"
  "api-designer"
  "db-schema"
  "doc-generator"
  "orchestrator"
)

for pkg in "${PACKAGES[@]}"; do
  echo "Building $pkg..."
  docker build \
    --build-arg PACKAGE_NAME=$pkg \
    -t "$REGISTRY/mcp-$pkg:$VERSION" \
    -t "$REGISTRY/mcp-$pkg:latest" \
    -f docker/base.Dockerfile \
    .

  echo "Pushing $pkg..."
  docker push "$REGISTRY/mcp-$pkg:$VERSION"
  docker push "$REGISTRY/mcp-$pkg:latest"
done
```

### 4.2 Docker Hub MCP Catalog Submission

```yaml
# docker/mcp-catalog-submission.yaml
name: j0kz-mcp-agents
version: 1.0.0
description: |
  Production-ready MCP tools for code analysis, testing,
  security scanning, and AI-assisted development.

servers:
  - name: smart-reviewer
    image: j0kz/mcp-smart-reviewer
    categories: [analysis, review]

  - name: test-generator
    image: j0kz/mcp-test-generator
    categories: [generation, testing]

  - name: security-scanner
    image: j0kz/mcp-security-scanner
    categories: [security]

  - name: orchestrator
    image: j0kz/mcp-orchestrator
    categories: [orchestration]

features:
  dynamicDiscovery: true
  codeMode: true
  responseFormats: [minimal, concise, detailed]
```

---

## Migration Checklist

### Pre-Migration
- [ ] Docker Desktop 4.50+ installed
- [ ] All tests passing
- [ ] Current npm packages published

### Phase 1: Containerization
- [ ] Base Dockerfile created and tested
- [ ] All 9 packages containerized
- [ ] docker-compose.mcp.yml working locally
- [ ] Container health checks passing

### Phase 2: Gateway Integration
- [ ] Gateway configuration complete
- [ ] GatewayOrchestrator implemented
- [ ] Code-mode templates created
- [ ] Workflow tests passing

### Phase 3: Client Configuration
- [ ] Claude Desktop config documented
- [ ] VS Code config documented
- [ ] Backward compatibility tested
- [ ] Documentation updated

### Phase 4: Publishing
- [ ] Docker Hub images pushed
- [ ] MCP Catalog submission prepared
- [ ] CLAUDE.md updated with Docker instructions
- [ ] Release notes published

---

## Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial context tokens | ~10,000 | ~500 | **95% reduction** |
| Typical workflow tokens | ~15,000 | ~1,500 | **90% reduction** |
| Cold start time | ~2s | ~5s | Slightly slower |
| Subsequent calls | ~500ms | ~200ms | **60% faster** |
| Security isolation | Process | Container | **Much better** |

---

## References

- [Docker MCP Gateway Documentation](https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/)
- [Dynamic MCP Documentation](https://docs.docker.com/ai/mcp-catalog-and-toolkit/dynamic-mcp/)
- [Anthropic Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [Docker MCP Catalog](https://hub.docker.com/mcp)
