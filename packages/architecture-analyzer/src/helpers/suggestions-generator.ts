/**
 * Architecture improvement suggestions generator
 */

import { ArchitectureMetrics, CircularDependency, LayerViolation } from '../types.js';
import {
  COUPLING_THRESHOLDS,
  COHESION_THRESHOLDS,
  DEPENDENCY_THRESHOLDS,
  MODULE_THRESHOLDS,
} from '../constants/metrics-thresholds.js';

/**
 * Generate improvement suggestions based on metrics
 *
 * @param metrics - Architecture metrics
 * @param circularDependencies - Detected circular dependencies
 * @param layerViolations - Detected layer violations
 * @returns Array of suggestion strings
 */
export function generateSuggestions(
  metrics: ArchitectureMetrics,
  circularDependencies: CircularDependency[],
  layerViolations: LayerViolation[]
): string[] {
  const suggestions: string[] = [];

  // Circular dependencies
  if (metrics.circularDependencies > 0) {
    suggestions.push(
      `Found ${metrics.circularDependencies} circular dependencies. Break cycles by introducing interfaces or dependency injection.`
    );
  }

  // Layer violations
  if (metrics.layerViolations > 0) {
    suggestions.push(
      `Found ${metrics.layerViolations} layer violations. Review architecture boundaries and refactor dependencies.`
    );
  }

  // High coupling
  if (metrics.coupling > COUPLING_THRESHOLDS.HIGH_COUPLING) {
    suggestions.push(
      `High coupling detected (${metrics.coupling}/100). Consider reducing dependencies between modules.`
    );
  }

  // Low cohesion
  if (metrics.cohesion < COHESION_THRESHOLDS.LOW_COHESION) {
    suggestions.push(
      `Low cohesion detected (${metrics.cohesion}/100). Group related functionality into modules.`
    );
  }

  // Too many dependencies
  if (metrics.maxDependencies > DEPENDENCY_THRESHOLDS.MAX_DEPENDENCIES) {
    suggestions.push(
      `Some modules have too many dependencies (max: ${metrics.maxDependencies}). Consider breaking them down.`
    );
  }

  // Large codebase
  if (metrics.totalModules > MODULE_THRESHOLDS.LARGE_CODEBASE) {
    suggestions.push(
      `Large codebase (${metrics.totalModules} modules). Consider organizing into packages or workspaces.`
    );
  }

  return suggestions;
}
