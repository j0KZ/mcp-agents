/**
 * Claude Code config generator
 */

import type { WizardSelections } from '../wizard.js';

const MCP_PACKAGES: Record<string, string> = {
  'smart-reviewer': '@j0kz/smart-reviewer-mcp',
  'test-generator': '@j0kz/test-generator-mcp',
  'architecture-analyzer': '@j0kz/architecture-analyzer-mcp',
  'doc-generator': '@j0kz/doc-generator-mcp',
  'security-scanner': '@j0kz/security-scanner-mcp',
  'refactor-assistant': '@j0kz/refactor-assistant-mcp',
  'api-designer': '@j0kz/api-designer-mcp',
  'db-schema': '@j0kz/db-schema-mcp'
};

export function generateClaudeCodeConfig(selections: WizardSelections): any {
  const config: any = {
    mcpServers: {}
  };

  for (const mcp of selections.mcps) {
    const packageName = MCP_PACKAGES[mcp];
    if (!packageName) continue;

    config.mcpServers[mcp] = {
      command: "npx",
      args: [`${packageName}@^1.0.0`]
    };
  }

  return config;
}
