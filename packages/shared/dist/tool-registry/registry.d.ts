/**
 * Tool Registry - Complete catalog of all MCP tools
 * Part of Anthropic Advanced Tool Use best practices (Nov 2025)
 * Phase 3: Deferred Loading Architecture
 */
import type { ToolMetadata } from './types.js';
/**
 * Complete registry of all tools across the @j0kz MCP ecosystem
 * Organized by frequency for optimal loading strategies
 */
export declare const TOOL_REGISTRY: ToolMetadata[];
/**
 * Get tools filtered by frequency
 */
export declare function getToolsByFrequency(frequency: 'high' | 'medium' | 'low'): ToolMetadata[];
/**
 * Get tools filtered by server
 */
export declare function getToolsByServer(server: string): ToolMetadata[];
/**
 * Get tools filtered by category
 */
export declare function getToolsByCategory(category: string): ToolMetadata[];
/**
 * Get immediate (high-frequency) tools that should always be loaded
 */
export declare function getImmediateTools(): ToolMetadata[];
/**
 * Get deferred (medium + low frequency) tools
 */
export declare function getDeferredTools(): ToolMetadata[];
/**
 * Get tools with explicit defer_loading flag
 * These tools should only be loaded when explicitly requested via load_tool
 * Anthropic Advanced Tool Use best practice (Nov 2025)
 */
export declare function getExplicitlyDeferredTools(): ToolMetadata[];
/**
 * Find a tool by name
 */
export declare function findToolByName(name: string): ToolMetadata | undefined;
/**
 * Get total count of tools in registry
 */
export declare function getToolCount(): number;
/**
 * Category information for progressive disclosure
 */
export interface CategoryInfo {
    name: string;
    description: string;
    toolCount: number;
    examples: string[];
}
/**
 * Get category statistics for progressive disclosure
 * Phase 4: Progressive Disclosure - Category Index
 */
export declare function getCategoryStats(): CategoryInfo[];
/**
 * Get tools for a specific MCP server with frequency info
 */
export declare function getServerTools(server: string): Array<{
    name: string;
    frequency: string;
    description: string;
}>;
/**
 * Get list of all MCP server names
 */
export declare function getServerNames(): string[];
//# sourceMappingURL=registry.d.ts.map