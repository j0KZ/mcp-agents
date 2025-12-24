/**
 * Docker MCP Gateway Integration
 *
 * This module provides Docker MCP Gateway support for the Orchestrator:
 *
 * - Dynamic tool discovery (mcp-find)
 * - On-demand tool loading (mcp-add)
 * - Code-mode sandbox execution
 * - Automatic mode detection
 *
 * Token Savings:
 * - Standard mode: ~10,000 tokens (all 50 tools loaded)
 * - Gateway mode: ~1,500 tokens (dynamic loading)
 * - Code-mode: ~500 tokens (sandbox execution)
 *
 * Usage:
 * ```typescript
 * import { createOrchestrator } from './gateway/index.js';
 *
 * const orchestrator = await createOrchestrator();
 * const result = await orchestrator.runWorkflow('pre-merge', {
 *   files: ['src/index.ts'],
 *   projectPath: '/path/to/project'
 * });
 *
 * console.log(`Saved ${result.tokensSaved} tokens!`);
 * ```
 */
export * from './types.js';
export { MCPGatewayClient, isDockerAvailable, isGatewayRunning, } from './gateway-client.js';
export { PRE_COMMIT_CODE, PRE_MERGE_CODE, QUALITY_AUDIT_CODE, getCodeTemplate, getWorkflowServers, } from './code-templates.js';
export { GatewayOrchestrator, createOrchestrator, } from './gateway-orchestrator.js';
//# sourceMappingURL=index.d.ts.map