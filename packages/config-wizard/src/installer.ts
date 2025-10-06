/**
 * MCP package installer
 */

import { execa } from 'execa';
import { spinner } from './utils/spinner.js';
import { logger } from './utils/logger.js';

const MCP_PACKAGES: Record<string, string> = {
  'smart-reviewer': '@j0kz/smart-reviewer-mcp',
  'test-generator': '@j0kz/test-generator-mcp',
  'architecture-analyzer': '@j0kz/architecture-analyzer-mcp',
  'doc-generator': '@j0kz/doc-generator-mcp',
  'security-scanner': '@j0kz/security-scanner-mcp',
  'refactor-assistant': '@j0kz/refactor-assistant-mcp',
  'api-designer': '@j0kz/api-designer-mcp',
  'db-schema': '@j0kz/db-schema-mcp',
};

export async function installMCPs(mcps: string[], verbose = false): Promise<void> {
  const spin = spinner('Installing MCP packages...');

  try {
    for (const mcp of mcps) {
      const packageName = MCP_PACKAGES[mcp];
      if (!packageName) {
        logger.warn(`Unknown MCP: ${mcp}`);
        continue;
      }

      spin.text = `Installing ${mcp}...`;

      await execa('npm', ['install', '-g', `${packageName}@^1.0.0`], {
        stdio: verbose ? 'inherit' : 'pipe',
      });
    }

    spin.succeed(`Installed ${mcps.length} MCP packages`);
  } catch (error) {
    spin.fail('Installation failed');
    throw error;
  }
}
