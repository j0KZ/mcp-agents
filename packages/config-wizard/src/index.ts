#!/usr/bin/env node

/**
 * @j0kz/mcp-config-wizard
 * Interactive CLI wizard for configuring MCP tools
 */

import { runWizard } from './wizard.js';
import { parseArgs } from './utils/args.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    const args = parseArgs();

    // Show help
    if (args.help) {
      showHelp();
      process.exit(0);
    }

    // Show version
    if (args.version) {
      console.log('1.0.0');
      process.exit(0);
    }

    // Run wizard
    await runWizard(args);

    logger.success('\n✨ Configuration complete!');
    logger.info('Next: Restart your editor to activate MCP tools');
  } catch (error) {
    logger.error('\n❌ Configuration failed');

    if (error instanceof Error) {
      logger.error(error.message);

      if (error.stack) {
        console.error(error.stack);
      }
    }

    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🎯 MCP Agents Configuration Wizard

Usage:
  npx @j0kz/mcp-config-wizard [options]

Options:
  --editor <name>       Specify editor (claude-code, cursor, windsurf, vscode, roo)
  --mcps <list>         Comma-separated MCP list (smart-reviewer,security-scanner,...)
  --dry-run             Show configuration without installing
  --force               Overwrite existing configuration
  --output <path>       Custom output path for config file
  --verbose             Detailed logging
  --help                Show this help message
  --version             Show version

Examples:
  # Interactive mode (recommended)
  npx @j0kz/mcp-config-wizard

  # Non-interactive mode
  npx mcp-configure --editor=claude-code --mcps=smart-reviewer,security-scanner

  # Dry run
  npx mcp-configure --dry-run

Supported Editors:
  - Claude Code (claude-code)
  - Cursor (cursor)
  - Windsurf (windsurf)
  - VS Code + Continue (vscode)
  - Roo Code (roo)

Available MCPs:
  - smart-reviewer       Code quality analysis
  - test-generator       Auto-generate tests
  - architecture-analyzer Dependency analysis
  - doc-generator        Documentation generation
  - security-scanner     Security vulnerability scanning
  - refactor-assistant   Code refactoring suggestions
  - api-designer         REST/GraphQL API design
  - db-schema            Database schema design

Documentation:
  https://github.com/j0KZ/mcp-agents
  `);
}

main();
