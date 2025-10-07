/**
 * Cohesion calculation utilities
 * Measures how well modules work together within the same package
 */
import { Module, Dependency } from '../types.js';
/**
 * Calculate cohesion score (0-100, higher is better)
 * Measures how well modules work together within the same package
 *
 * @param modules - All modules in the project
 * @param dependencies - All dependencies between modules
 * @returns Cohesion score (0-100)
 */
export declare function calculateCohesion(modules: Module[], dependencies: Dependency[]): number;
//# sourceMappingURL=cohesion-calculator.d.ts.map