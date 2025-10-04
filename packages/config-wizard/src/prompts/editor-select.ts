/**
 * Editor selection prompt
 */

import type { SupportedEditor } from '../detectors/editor.js';

export function editorPrompt(detectedEditor: SupportedEditor) {
  return {
    type: 'list',
    name: 'editor',
    message: 'Select your editor:',
    choices: [
      { name: 'Claude Code (Anthropic)', value: 'claude-code' },
      { name: 'Cursor (Anysphere)', value: 'cursor' },
      { name: 'Windsurf (Codeium)', value: 'windsurf' },
      { name: 'VS Code + Continue', value: 'vscode' },
      { name: 'Roo Code', value: 'roo' }
    ],
    default: detectedEditor || 'claude-code'
  };
}
