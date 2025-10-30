import { ArchitectureAnalysis, AnalysisConfig } from './types.js';
export declare class ArchitectureAnalyzer {
    private scanner;
    constructor();
    /**
     * Analyze project architecture
     */
    analyzeArchitecture(projectPath: string, config?: AnalysisConfig): Promise<ArchitectureAnalysis>;
    /**
     * Detect circular dependencies using Tarjan's algorithm (O(V+E) complexity)
     */
    private detectCircularDependencies;
    /**
     * Build adjacency list for dependency graph
     */
    private buildDependencyGraph;
    /**
     * Tarjan's algorithm for finding strongly connected components (and cycles)
     * Much more efficient: O(V+E) instead of O(V²)
     */
    private findCyclesTarjan;
    /**
     * Detect layer violations
     */
    private detectLayerViolations;
    /**
     * Get layer for a module
     */
    private getLayer;
    /**
     * Calculate architecture metrics
     */
    private calculateMetrics;
    /**
     * Generate dependency graph in Mermaid format
     */
    private generateDependencyGraph;
    /**
     * Sanitize node ID for Mermaid
     */
    private sanitizeNodeId;
}
//# sourceMappingURL=analyzer.d.ts.map