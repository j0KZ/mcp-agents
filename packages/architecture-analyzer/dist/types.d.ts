export interface Module {
    name: string;
    path: string;
    imports: string[];
    exports: string[];
    linesOfCode: number;
    dependencies: string[];
}
export interface Dependency {
    from: string;
    to: string;
    type: 'import' | 'require' | 'dynamic';
}
export interface CircularDependency {
    cycle: string[];
    severity: 'warning' | 'error';
}
export interface LayerViolation {
    from: string;
    to: string;
    expectedLayer: string;
    actualLayer: string;
    description: string;
}
export interface ArchitectureMetrics {
    totalModules: number;
    totalDependencies: number;
    averageDependenciesPerModule: number;
    maxDependencies: number;
    circularDependencies: number;
    layerViolations: number;
    cohesion: number;
    coupling: number;
}
export interface ArchitectureAnalysis {
    projectPath: string;
    modules: Module[];
    dependencies: Dependency[];
    circularDependencies: CircularDependency[];
    layerViolations: LayerViolation[];
    metrics: ArchitectureMetrics;
    suggestions: string[];
    dependencyGraph: string;
    timestamp: string;
}
export interface AnalysisConfig {
    maxDepth?: number;
    excludePatterns?: string[];
    layerRules?: Record<string, string[]>;
    detectCircular?: boolean;
    generateGraph?: boolean;
}
//# sourceMappingURL=types.d.ts.map