/**
 * Universal config generator
 * Works with ANY MCP-compatible IDE by including explicit type field
 */
const MCP_PACKAGES = {
    'smart-reviewer': '@j0kz/smart-reviewer-mcp',
    'test-generator': '@j0kz/test-generator-mcp',
    'architecture-analyzer': '@j0kz/architecture-analyzer-mcp',
    'doc-generator': '@j0kz/doc-generator-mcp',
    'security-scanner': '@j0kz/security-scanner-mcp',
    'refactor-assistant': '@j0kz/refactor-assistant-mcp',
    'api-designer': '@j0kz/api-designer-mcp',
    'db-schema': '@j0kz/db-schema-mcp',
    orchestrator: '@j0kz/orchestrator-mcp',
};
/**
 * Generate universal MCP config that works with ALL IDEs
 * Including Qoder, Claude Code, Cursor, Windsurf, VSCode, etc.
 */
export function generateUniversalConfig(selections) {
    const config = {
        mcpServers: {},
    };
    for (const mcp of selections.mcps) {
        const packageName = MCP_PACKAGES[mcp];
        if (!packageName)
            continue;
        // Universal format with EXPLICIT type field
        // This ensures compatibility with IDEs like Qoder that require it
        config.mcpServers[mcp] = {
            type: 'stdio', // EXPLICIT for maximum compatibility
            command: 'npx',
            args: [`${packageName}@^1.0.0`],
            env: {
                NODE_ENV: 'production',
                // MCP environment variables will be auto-detected by tools
                // but can be explicitly set here if needed
            },
        };
    }
    return config;
}
/**
 * Generate config for specific IDE with adaptations
 */
export function generateIDESpecificConfig(selections, ide) {
    const baseConfig = generateUniversalConfig(selections);
    // IDE-specific adjustments
    switch (ide) {
        case 'qoder':
        case 'vscode':
            // These IDEs REQUIRE explicit type field
            return baseConfig; // Already has type field
        case 'claude':
        case 'cursor':
        case 'windsurf':
        case 'roo':
            // These IDEs work better with cleaner config (type is optional)
            // But leaving it in for consistency doesn't hurt
            return baseConfig;
        default:
            return baseConfig;
    }
}
//# sourceMappingURL=universal.js.map