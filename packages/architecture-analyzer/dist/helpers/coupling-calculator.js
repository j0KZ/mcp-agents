/**
 * Coupling calculation utilities
 * Measures interdependence between modules
 */
import { COUPLING_THRESHOLDS } from '../constants/metrics-thresholds.js';
/**
 * Calculate coupling score (0-100, lower is better)
 * Measures interdependence between modules
 *
 * @param modules - All modules in the project
 * @param dependencies - All dependencies between modules
 * @returns Coupling score (0-100)
 */
export function calculateCoupling(modules, dependencies) {
    if (modules.length <= 1)
        return 0;
    // Average dependencies per module (normalized to 0-100 scale)
    // Threshold: HIGH_DEPS_PER_MODULE+ deps per module = high coupling (NORMALIZATION_FACTOR+)
    const avgDeps = dependencies.length / modules.length;
    const couplingScore = Math.min(100, (avgDeps / COUPLING_THRESHOLDS.HIGH_DEPS_PER_MODULE) * COUPLING_THRESHOLDS.NORMALIZATION_FACTOR);
    return Math.round(couplingScore);
}
//# sourceMappingURL=coupling-calculator.js.map