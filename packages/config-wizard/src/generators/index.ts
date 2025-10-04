/**
 * Config generators index
 */

import { generateClaudeCodeConfig } from './claude-code.js';
import { generateCursorConfig } from './cursor.js';
import type { WizardSelections } from '../wizard.js';
import type { SupportedEditor } from '../detectors/editor.js';

export async function generateConfig(selections: WizardSelections): Promise<any> {
  const editor = selections.editor as SupportedEditor;

  switch (editor) {
    case 'claude-code':
      return generateClaudeCodeConfig(selections);

    case 'cursor':
      return generateCursorConfig(selections);

    case 'windsurf':
      // Windsurf uses same format as Cursor/Claude Code
      return generateCursorConfig(selections);

    case 'vscode':
      // VS Code with Continue uses similar format
      return { mcp: generateClaudeCodeConfig(selections).mcpServers };

    case 'roo':
      // Roo Code uses same format
      return generateClaudeCodeConfig(selections);

    default:
      throw new Error(`Unsupported editor: ${editor}`);
  }
}
