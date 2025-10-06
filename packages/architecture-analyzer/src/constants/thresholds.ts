/**
 * Constants for architecture analysis thresholds and limits
 */

export const CIRCULAR_DEPENDENCY_THRESHOLDS = {
  /** Cycle length threshold for error vs warning */
  LONG_CYCLE_LENGTH: 3,
} as const;

export const COHESION_THRESHOLDS = {
  /** Minimum cohesion score (0-100, higher is better) */
  MIN_COHESION: 50,
  /** Maximum score value */
  MAX_SCORE: 100,
  /** Default minimum value for empty calculations */
  MIN_VALUE: 0,
  /** Single module - no cohesion calculation needed */
  SINGLE_MODULE: 1,
} as const;

export const COUPLING_THRESHOLDS = {
  /** High coupling warning threshold (0-100, lower is better) */
  HIGH_COUPLING: 70,
  /** Dependencies per module threshold for high coupling calculation */
  DEPS_PER_MODULE_THRESHOLD: 5,
  /** High coupling score multiplier */
  HIGH_COUPLING_MULTIPLIER: 80,
  /** Maximum coupling score */
  MAX_COUPLING: 100,
  /** Single or no modules - no coupling */
  NO_COUPLING_THRESHOLD: 1,
} as const;

export const DEPENDENCY_LIMITS = {
  /** Maximum dependencies per module before warning */
  MAX_DEPENDENCIES_PER_MODULE: 10,
  /** Large codebase module count threshold */
  LARGE_CODEBASE_MODULES: 100,
  /** Dependency graph display limit */
  GRAPH_DEPENDENCY_LIMIT: 50,
} as const;

export const PACKAGE_PATH_INDICES = {
  /** Index to extract package path (slice 0 to -1) */
  PACKAGE_PATH_END: -1,
} as const;

export const ARRAY_INDICES = {
  /** First element index */
  FIRST_ELEMENT: 0,
} as const;
