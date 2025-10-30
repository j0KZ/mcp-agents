/**
 * ContextDetector: Automatically detects project type, framework, and configuration
 * Smart enough to understand any project without configuration
 */
export interface ProjectContext {
    language: 'typescript' | 'javascript' | 'python' | 'go' | 'rust' | 'java' | 'unknown';
    framework: string;
    packageManager: 'npm' | 'yarn' | 'pnpm' | 'none';
    testRunner: string;
    hasGit: boolean;
    hasDocker: boolean;
    hasCI: boolean;
    fileCount: number;
    structure: 'monorepo' | 'single' | 'unknown';
    buildTool: string;
    linter: string;
    formatter: string;
    dependencies: string[];
    isProduction: boolean;
    mcpTools: string[];
}
export declare class ContextDetector {
    private cache;
    /**
     * Detect everything about the current project
     */
    detect(): Promise<ProjectContext>;
    /**
     * Detect primary programming language
     */
    private detectLanguage;
    /**
     * Detect package manager
     */
    private detectPackageManager;
    /**
     * Detect framework
     */
    private detectFramework;
    /**
     * Detect test runner
     */
    private detectTestRunner;
    /**
     * Detect version control
     */
    private detectVersionControl;
    /**
     * Detect containerization
     */
    private detectContainerization;
    /**
     * Detect CI/CD setup
     */
    private detectCI;
    /**
     * Detect project structure
     */
    private detectProjectStructure;
    /**
     * Detect build tools
     */
    private detectBuildTools;
    /**
     * Detect linters
     */
    private detectLinters;
    /**
     * Detect installed MCP tools
     */
    private detectMCPTools;
    /**
     * Count source files
     */
    private countSourceFiles;
    /**
     * Check if this is a production project
     */
    private isProductionProject;
    /**
     * Read package.json safely
     */
    private readPackageJson;
    /**
     * Get file type for a path
     */
    getFileType(filePath: string): Promise<string>;
}
//# sourceMappingURL=context-detector.d.ts.map