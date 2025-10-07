/**
 * Metrics calculation thresholds and limits
 */
/**
 * Coupling thresholds
 */
export declare const COUPLING_THRESHOLDS: {
    /** High coupling score threshold (0-100, lower is better) */
    readonly HIGH_COUPLING: 70;
    /** Dependencies per module that indicates high coupling */
    readonly HIGH_DEPS_PER_MODULE: 5;
    /** Coupling normalization factor (5+ deps = 80% coupling) */
    readonly NORMALIZATION_FACTOR: 80;
};
/**
 * Cohesion thresholds
 */
export declare const COHESION_THRESHOLDS: {
    /** Low cohesion score threshold (0-100, higher is better) */
    readonly LOW_COHESION: 50;
};
/**
 * Dependency thresholds
 */
export declare const DEPENDENCY_THRESHOLDS: {
    /** Maximum dependencies per module before warning */
    readonly MAX_DEPENDENCIES: 10;
    /** Maximum graph edges to display in visualization */
    readonly MAX_GRAPH_EDGES: 50;
};
/**
 * Module thresholds
 */
export declare const MODULE_THRESHOLDS: {
    /** Large codebase module count threshold */
    readonly LARGE_CODEBASE: 100;
    /** Maximum depth for architecture analysis */
    readonly MAX_ANALYSIS_DEPTH: 5;
};
//# sourceMappingURL=metrics-thresholds.d.ts.map