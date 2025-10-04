/**
 * Cursor config generator
 * Uses same format as Claude Code
 */

import { generateClaudeCodeConfig } from './claude-code.js';
import type { WizardSelections } from '../wizard.js';

export function generateCursorConfig(selections: WizardSelections): any {
  // Cursor uses the same config format as Claude Code
  return generateClaudeCodeConfig(selections);
}
