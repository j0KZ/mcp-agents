import { ArchitectureAnalysis, AnalysisConfig } from './types.js';
export declare class ArchitectureAnalyzer {
    private scanner;
    constructor();
    /**
     * Analyze project architecture
     */
    analyzeArchitecture(projectPath: string, config?: AnalysisConfig): Promise<ArchitectureAnalysis>;
    /**
     * Detect circular dependencies
     */
    private detectCircularDependencies;
    /**
     * Build adjacency list for dependency graph
     */
    private buildDependencyGraph;
    /**
     * Find cycles using DFS
     */
    private findCycles;
    /**
     * Remove duplicate cycles
     */
    private deduplicateCycles;
    /**
     * Normalize cycle for comparison
     */
    private normalizeCycle;
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
     * Calculate cohesion score (0-100, higher is better)
     * Measures how well modules work together within the same package
     */
    private calculateCohesion;
    /**
     * Calculate coupling score (0-100, lower is better)
     * Measures interdependence between modules
     */
    private calculateCoupling;
    /**
     * Generate improvement suggestions
     */
    private generateSuggestions;
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