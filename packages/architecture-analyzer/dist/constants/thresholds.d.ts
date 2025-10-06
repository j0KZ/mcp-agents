/**
 * Constants for architecture analysis thresholds and limits
 */
export declare const CIRCULAR_DEPENDENCY_THRESHOLDS: {
    /** Cycle length threshold for error vs warning */
    readonly LONG_CYCLE_LENGTH: 3;
};
export declare const COHESION_THRESHOLDS: {
    /** Minimum cohesion score (0-100, higher is better) */
    readonly MIN_COHESION: 50;
    /** Maximum score value */
    readonly MAX_SCORE: 100;
    /** Default minimum value for empty calculations */
    readonly MIN_VALUE: 0;
    /** Single module - no cohesion calculation needed */
    readonly SINGLE_MODULE: 1;
};
export declare const COUPLING_THRESHOLDS: {
    /** High coupling warning threshold (0-100, lower is better) */
    readonly HIGH_COUPLING: 70;
    /** Dependencies per module threshold for high coupling calculation */
    readonly DEPS_PER_MODULE_THRESHOLD: 5;
    /** High coupling score multiplier */
    readonly HIGH_COUPLING_MULTIPLIER: 80;
    /** Maximum coupling score */
    readonly MAX_COUPLING: 100;
    /** Single or no modules - no coupling */
    readonly NO_COUPLING_THRESHOLD: 1;
};
export declare const DEPENDENCY_LIMITS: {
    /** Maximum dependencies per module before warning */
    readonly MAX_DEPENDENCIES_PER_MODULE: 10;
    /** Large codebase module count threshold */
    readonly LARGE_CODEBASE_MODULES: 100;
    /** Dependency graph display limit */
    readonly GRAPH_DEPENDENCY_LIMIT: 50;
};
export declare const PACKAGE_PATH_INDICES: {
    /** Index to extract package path (slice 0 to -1) */
    readonly PACKAGE_PATH_END: -1;
};
export declare const ARRAY_INDICES: {
    /** First element index */
    readonly FIRST_ELEMENT: 0;
};
//# sourceMappingURL=thresholds.d.ts.map