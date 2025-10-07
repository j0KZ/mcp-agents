/**
 * Coupling calculation utilities
 * Measures interdependence between modules
 */
import { Module, Dependency } from '../types.js';
/**
 * Calculate coupling score (0-100, lower is better)
 * Measures interdependence between modules
 *
 * @param modules - All modules in the project
 * @param dependencies - All dependencies between modules
 * @returns Coupling score (0-100)
 */
export declare function calculateCoupling(modules: Module[], dependencies: Dependency[]): number;
//# sourceMappingURL=coupling-calculator.d.ts.map