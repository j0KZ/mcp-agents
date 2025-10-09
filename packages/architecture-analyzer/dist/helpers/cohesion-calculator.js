/**
 * Cohesion calculation utilities
 * Measures how well modules work together within the same package
 */
/**
 * Calculate cohesion score (0-100, higher is better)
 * Measures how well modules work together within the same package
 *
 * @param modules - All modules in the project
 * @param dependencies - All dependencies between modules
 * @returns Cohesion score (0-100)
 */
export function calculateCohesion(modules, dependencies) {
    if (modules.length === 0)
        return 0;
    // Calculate cohesion: dependencies within same package vs cross-package
    const intraPackageDeps = countIntraPackageDependencies(dependencies);
    const totalDeps = dependencies.length || 1;
    return Math.round((intraPackageDeps / totalDeps) * 100);
}
/**
 * Count dependencies within the same package
 *
 * @param dependencies - All dependencies
 * @returns Count of intra-package dependencies
 */
function countIntraPackageDependencies(dependencies) {
    let intraPackageDeps = 0;
    dependencies.forEach(d => {
        const fromPackage = getPackagePath(d.from);
        const toPackage = getPackagePath(d.to);
        if (fromPackage === toPackage) {
            intraPackageDeps++;
        }
    });
    return intraPackageDeps;
}
/**
 * Extract package path from module path
 *
 * @param path - Full module path
 * @returns Package path (directory without filename)
 */
function getPackagePath(path) {
    return path.split('/').slice(0, -1).join('/');
}
//# sourceMappingURL=cohesion-calculator.js.map