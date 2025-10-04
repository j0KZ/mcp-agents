/**
 * Config generators index
 */
import { generateClaudeCodeConfig } from './claude-code.js';
import { generateCursorConfig } from './cursor.js';
export async function generateConfig(selections) {
    const editor = selections.editor;
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
//# sourceMappingURL=index.js.map