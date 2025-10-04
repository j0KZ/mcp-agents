/**
 * Cursor config generator
 * Uses same format as Claude Code
 */
import { generateClaudeCodeConfig } from './claude-code.js';
export function generateCursorConfig(selections) {
    // Cursor uses the same config format as Claude Code
    return generateClaudeCodeConfig(selections);
}
//# sourceMappingURL=cursor.js.map