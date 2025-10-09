/**
 * Config generators index with universal config support
 */
import { generateUniversalConfig, generateIDESpecificConfig } from './universal.js';
export async function generateConfig(selections) {
    const editor = selections.editor;
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
//# sourceMappingURL=index.js.map