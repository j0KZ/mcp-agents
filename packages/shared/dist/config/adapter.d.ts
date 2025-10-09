/**
 * Universal Configuration Adapter
 * Normalizes any MCP config format to work across all IDEs
 * Automatically fixes common configuration issues
 */
export interface MCPServerConfig {
    type?: 'stdio' | 'sse' | 'websocket';
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    url?: string;
    [key: string]: unknown;
}
export interface NormalizedConfig {
    type: 'stdio' | 'sse' | 'websocket';
    command?: string;
    args: string[];
    env: Record<string, string>;
    url?: string;
}
export interface ConfigValidation {
    valid: boolean;
    normalized: NormalizedConfig | null;
    issues: string[];
    fixes: string[];
    warnings: string[];
}
export declare class ConfigAdapter {
    /**
     * Normalize any config format to standard MCP config
     */
    static normalize(config: MCPServerConfig): NormalizedConfig;
    /**
     * Validate and auto-fix configuration
     */
    static validate(config: MCPServerConfig): ConfigValidation;
    /**
     * Auto-fix common configuration issues
     */
    static autoFix(config: MCPServerConfig): {
        fixed: NormalizedConfig;
        changes: string[];
    };
    /**
     * Infer transport type from config structure
     */
    private static inferTransport;
    /**
     * Get default environment variables based on runtime
     */
    private static getDefaultEnv;
    /**
     * Generate IDE-specific config from universal config
     */
    static toIDEConfig(normalizedConfig: NormalizedConfig, targetIDE: 'claude' | 'cursor' | 'windsurf' | 'qoder' | 'vscode'): MCPServerConfig;
    /**
     * Detect config format (for migration)
     */
    static detectFormat(config: MCPServerConfig): 'claude' | 'qoder' | 'vscode' | 'generic';
}
//# sourceMappingURL=adapter.d.ts.map