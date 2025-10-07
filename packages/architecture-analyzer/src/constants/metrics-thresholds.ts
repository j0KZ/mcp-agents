/**
 * Metrics calculation thresholds and limits
 */

/**
 * Coupling thresholds
 */
export const COUPLING_THRESHOLDS = {
  /** High coupling score threshold (0-100, lower is better) */
  HIGH_COUPLING: 70,
  /** Dependencies per module that indicates high coupling */
  HIGH_DEPS_PER_MODULE: 5,
  /** Coupling normalization factor (5+ deps = 80% coupling) */
  NORMALIZATION_FACTOR: 80,
} as const;

/**
 * Cohesion thresholds
 */
export const COHESION_THRESHOLDS = {
  /** Low cohesion score threshold (0-100, higher is better) */
  LOW_COHESION: 50,
} as const;

/**
 * Dependency thresholds
 */
export const DEPENDENCY_THRESHOLDS = {
  /** Maximum dependencies per module before warning */
  MAX_DEPENDENCIES: 10,
  /** Maximum graph edges to display in visualization */
  MAX_GRAPH_EDGES: 50,
} as const;

/**
 * Module thresholds
 */
export const MODULE_THRESHOLDS = {
  /** Large codebase module count threshold */
  LARGE_CODEBASE: 100,
  /** Maximum depth for architecture analysis */
  MAX_ANALYSIS_DEPTH: 5,
} as const;
