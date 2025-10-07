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
export function calculateCohesion(modules: Module[], dependencies: Dependency[]): number {
  if (modules.length === 0) return 0;

  // Identify modules that are part of the same package/directory
  const packageGroups = groupModulesByPackage(modules);

  // Calculate cohesion: dependencies within same package vs cross-package
  const intraPackageDeps = countIntraPackageDependencies(dependencies);
  const totalDeps = dependencies.length || 1;

  return Math.round((intraPackageDeps / totalDeps) * 100);
}

/**
 * Group modules by their package/directory path
 *
 * @param modules - Modules to group
 * @returns Map of package paths to modules
 */
function groupModulesByPackage(modules: Module[]): Map<string, Module[]> {
  const packageGroups = new Map<string, Module[]>();

  modules.forEach(m => {
    const packagePath = getPackagePath(m.path);
    if (!packageGroups.has(packagePath)) {
      packageGroups.set(packagePath, []);
    }
    packageGroups.get(packagePath)!.push(m);
  });

  return packageGroups;
}

/**
 * Count dependencies within the same package
 *
 * @param dependencies - All dependencies
 * @returns Count of intra-package dependencies
 */
function countIntraPackageDependencies(dependencies: Dependency[]): number {
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
function getPackagePath(path: string): string {
  return path.split('/').slice(0, -1).join('/');
}
