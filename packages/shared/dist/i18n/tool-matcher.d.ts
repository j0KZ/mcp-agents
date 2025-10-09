/**
 * Language-Agnostic Tool Name Matching
 * Supports Spanish and English tool names
 * Maps natural language commands to canonical tool names
 */
export interface ToolNameMapping {
    canonical: string;
    aliases: string[];
    description: {
        en: string;
        es: string;
    };
}
/**
 * Tool name mappings for all MCP tools
 * Supports Spanish and English variations
 */
export declare const TOOL_NAME_MAPPINGS: Record<string, ToolNameMapping>;
/**
 * Match user input to canonical tool name
 * Case-insensitive, handles Spanish and English
 */
export declare function matchToolName(input: string): string | null;
/**
 * Get all aliases for a canonical tool name
 */
export declare function getToolAliases(canonical: string): string[];
/**
 * Get tool description in specific language
 */
export declare function getToolDescription(canonical: string, language: 'en' | 'es'): string;
/**
 * Check if a tool name exists (in any language)
 */
export declare function isValidToolName(name: string): boolean;
//# sourceMappingURL=tool-matcher.d.ts.map