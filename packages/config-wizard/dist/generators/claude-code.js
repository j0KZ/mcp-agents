/**
 * Claude Code config generator with universal config adaptation
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
export function generateClaudeCodeConfig(selections) {
    const config = {
        mcpServers: {},
    };
    for (const mcp of selections.mcps) {
        const packageName = MCP_PACKAGES[mcp];
        if (!packageName)
            continue;
        // Universal config format that works everywhere
        // Claude Code infers stdio, so type field can be omitted
        config.mcpServers[mcp] = {
            command: 'npx',
            args: [`${packageName}@^1.0.0`],
            // Note: type: 'stdio' is implicit for Claude Code
            // Will be added explicitly for IDEs that require it (Qoder, VSCode)
        };
    }
    return config;
}
//# sourceMappingURL=claude-code.js.map