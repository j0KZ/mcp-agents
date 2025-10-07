/**
 * Architecture improvement suggestions generator
 */
import { ArchitectureMetrics, CircularDependency, LayerViolation } from '../types.js';
/**
 * Generate improvement suggestions based on metrics
 *
 * @param metrics - Architecture metrics
 * @param circularDependencies - Detected circular dependencies
 * @param layerViolations - Detected layer violations
 * @returns Array of suggestion strings
 */
export declare function generateSuggestions(metrics: ArchitectureMetrics, circularDependencies: CircularDependency[], layerViolations: LayerViolation[]): string[];
//# sourceMappingURL=suggestions-generator.d.ts.map