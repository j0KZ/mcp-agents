/**
 * Config generators index with universal config support
 */

import { generateClaudeCodeConfig } from './claude-code.js';
import { generateCursorConfig } from './cursor.js';
import { generateUniversalConfig, generateIDESpecificConfig } from './universal.js';
import type { WizardSelections } from '../wizard.js';
import type { SupportedEditor } from '../detectors/editor.js';

export async function generateConfig(selections: WizardSelections): Promise<any> {
  const editor = selections.editor as SupportedEditor;

  // Use universal config generator for maximum compatibility
  switch (editor) {
    case 'claude-code':
      return generateIDESpecificConfig(selections, 'claude');

    case 'cursor':
      return generateIDESpecificConfig(selections, 'cursor');

    case 'windsurf':
      return generateIDESpecificConfig(selections, 'windsurf');

    case 'vscode':
      // VS Code with Continue uses MCP wrapper
      return { mcp: generateIDESpecificConfig(selections, 'vscode').mcpServers };

    case 'roo':
      return generateIDESpecificConfig(selections, 'roo');

    case 'qoder':
      // Qoder REQUIRES explicit type field
      return generateIDESpecificConfig(selections, 'qoder');

    default:
      // Fallback to universal config for unknown IDEs
      console.warn(`Unknown editor: ${editor}, using universal config`);
      return generateUniversalConfig(selections);
  }
}
