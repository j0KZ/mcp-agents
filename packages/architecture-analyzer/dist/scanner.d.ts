import { Module, Dependency } from './types.js';
export declare class ProjectScanner {
    /**
     * Scan project directory and extract modules
     */
    scanProject(projectPath: string, excludePatterns?: string[]): Promise<{
        modules: Module[];
        dependencies: Dependency[];
    }>;
    /**
     * Find all source files in project
     */
    private findSourceFiles;
    /**
     * Check if file is a source file
     */
    private isSourceFile;
    /**
     * Analyze a single file
     */
    private analyzeFile;
    /**
     * Extract import statements
     */
    private extractImports;
    /**
     * Extract export statements
     */
    private extractExports;
    /**
     * Extract dependencies between modules
     */
    private extractDependencies;
    /**
     * Get module name from path
     */
    private getModuleName;
    /**
     * Check if import is external dependency
     */
    private isExternalDependency;
    /**
     * Resolve import path relative to current module
     */
    private resolveImportPath;
    /**
     * Get import type
     */
    private getImportType;
}
//# sourceMappingURL=scanner.d.ts.map