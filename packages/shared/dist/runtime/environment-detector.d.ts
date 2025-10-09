/**
 * Environment Detection System
 * Automatically detects IDE, locale, transport, and runtime environment
 * Works with any MCP-compatible editor without configuration
 */
export interface RuntimeEnvironment {
    ide: string;
    ideVersion: string | null;
    transport: 'stdio' | 'sse' | 'websocket' | 'unknown';
    locale: string;
    platform: NodeJS.Platform;
    arch: string;
    nodeVersion: string;
    workingDir: string;
    homeDir: string;
    projectRoot: string | null;
    caseSensitiveFS: boolean;
    pathSeparator: string;
}
export declare class EnvironmentDetector {
    /**
     * Detect complete runtime environment
     */
    static detect(): RuntimeEnvironment;
    /**
     * Detect which IDE is running this MCP server
     */
    private static detectIDE;
    /**
     * Detect IDE version if available
     */
    private static detectIDEVersion;
    /**
     * Detect transport mechanism from actual I/O
     */
    private static detectTransport;
    /**
     * Detect user's locale/language preference
     */
    private static detectLocale;
    /**
     * Detect project root directory (where package.json or .git exists)
     */
    private static detectProjectRoot;
    /**
     * Check if filesystem is case-sensitive
     */
    private static isFilesystemCaseSensitive;
    /**
     * Get parent process name (best-effort)
     */
    private static getParentProcessName;
    /**
     * Get detailed environment info for debugging
     */
    static getDebugInfo(): Record<string, unknown>;
    /**
     * Check if running in specific IDE
     */
    static isIDE(ideName: string): boolean;
    /**
     * Check if running in known MCP-compatible IDE
     */
    static isKnownIDE(): boolean;
}
//# sourceMappingURL=environment-detector.d.ts.map