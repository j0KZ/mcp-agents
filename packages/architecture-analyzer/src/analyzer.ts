import { ProjectScanner } from './scanner.js';
import {
  Module,
  Dependency,
  CircularDependency,
  LayerViolation,
  ArchitectureMetrics,
  ArchitectureAnalysis,
  AnalysisConfig,
} from './types.js';
import { CIRCULAR_DEPENDENCY_THRESHOLDS } from './constants/thresholds.js';

export class ArchitectureAnalyzer {
  private scanner: ProjectScanner;

  constructor() {
    this.scanner = new ProjectScanner();
  }

  /**
   * Analyze project architecture
   */
  async analyzeArchitecture(
    projectPath: string,
    config: AnalysisConfig = {}
  ): Promise<ArchitectureAnalysis> {
    const excludePatterns = config.excludePatterns || ['node_modules', 'dist', '.git', 'tests'];
    const { modules, dependencies } = await this.scanner.scanProject(projectPath, excludePatterns);

    const circularDependencies =
      config.detectCircular !== false ? this.detectCircularDependencies(modules, dependencies) : [];

    const layerViolations = config.layerRules
      ? this.detectLayerViolations(dependencies, config.layerRules)
      : [];

    const metrics = this.calculateMetrics(
      modules,
      dependencies,
      circularDependencies,
      layerViolations
    );
    const suggestions = this.generateSuggestions(metrics, circularDependencies, layerViolations);

    const dependencyGraph =
      config.generateGraph !== false ? this.generateDependencyGraph(modules, dependencies) : '';

    return {
      projectPath,
      modules,
      dependencies,
      circularDependencies,
      layerViolations,
      metrics,
      suggestions,
      dependencyGraph,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Detect circular dependencies
   */
  private detectCircularDependencies(
    modules: Module[],
    dependencies: Dependency[]
  ): CircularDependency[] {
    const cycles: CircularDependency[] = [];
    const graph = this.buildDependencyGraph(dependencies);

    for (const module of modules) {
      const visited = new Set<string>();
      const path: string[] = [];
      this.findCycles(module.path, graph, visited, path, cycles);
    }

    // Remove duplicate cycles
    const uniqueCycles = this.deduplicateCycles(cycles);

    return uniqueCycles.map(cycle => ({
      cycle,
      severity:
        cycle.length > CIRCULAR_DEPENDENCY_THRESHOLDS.LONG_CYCLE_LENGTH ? 'error' : 'warning',
    }));
  }

  /**
   * Build adjacency list for dependency graph
   */
  private buildDependencyGraph(dependencies: Dependency[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    for (const dep of dependencies) {
      if (!graph.has(dep.from)) {
        graph.set(dep.from, []);
      }
      graph.get(dep.from)!.push(dep.to);
    }

    return graph;
  }

  /**
   * Find cycles using DFS
   */
  private findCycles(
    node: string,
    graph: Map<string, string[]>,
    visited: Set<string>,
    path: string[],
    cycles: CircularDependency[]
  ): void {
    if (path.includes(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      const cycle = path.slice(cycleStart).concat(node);
      cycles.push({ cycle, severity: 'warning' });
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    path.push(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      this.findCycles(neighbor, graph, visited, [...path], cycles);
    }
  }

  /**
   * Remove duplicate cycles
   */
  private deduplicateCycles(cycles: CircularDependency[]): string[][] {
    const seen = new Set<string>();
    const unique: string[][] = [];

    for (const cycle of cycles) {
      const normalized = this.normalizeCycle(cycle.cycle);
      const key = normalized.join('->');

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(cycle.cycle);
      }
    }

    return unique;
  }

  /**
   * Normalize cycle for comparison
   */
  private normalizeCycle(cycle: string[]): string[] {
    // Find the lexicographically smallest element
    const minElement = cycle.reduce((min, curr) => (curr < min ? curr : min), cycle[0]);
    const minIndex = cycle.indexOf(minElement);
    return [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)];
  }

  /**
   * Detect layer violations
   */
  private detectLayerViolations(
    dependencies: Dependency[],
    layerRules: Record<string, string[]>
  ): LayerViolation[] {
    const violations: LayerViolation[] = [];

    for (const dep of dependencies) {
      const fromLayer = this.getLayer(dep.from, layerRules);
      const toLayer = this.getLayer(dep.to, layerRules);

      if (fromLayer && toLayer) {
        const allowedLayers = layerRules[fromLayer] || [];

        if (!allowedLayers.includes(toLayer)) {
          violations.push({
            from: dep.from,
            to: dep.to,
            expectedLayer: allowedLayers.join(' or '),
            actualLayer: toLayer,
            description: `${fromLayer} should not depend on ${toLayer}`,
          });
        }
      }
    }

    return violations;
  }

  /**
   * Get layer for a module
   */
  private getLayer(modulePath: string, layerRules: Record<string, string[]>): string | null {
    for (const layer of Object.keys(layerRules)) {
      if (modulePath.includes(layer)) {
        return layer;
      }
    }
    return null;
  }

  /**
   * Calculate architecture metrics
   */
  private calculateMetrics(
    modules: Module[],
    dependencies: Dependency[],
    circularDependencies: CircularDependency[],
    layerViolations: LayerViolation[]
  ): ArchitectureMetrics {
    const totalModules = modules.length;
    const totalDependencies = dependencies.length;

    const dependenciesPerModule = modules.map(
      m => dependencies.filter(d => d.from === m.path).length
    );

    const averageDependenciesPerModule =
      totalModules > 0 ? Math.round(totalDependencies / totalModules) : 0;

    const maxDependencies =
      dependenciesPerModule.length > 0 ? Math.max(...dependenciesPerModule) : 0;

    // Cohesion: how related are modules (simplified)
    const cohesion = this.calculateCohesion(modules, dependencies);

    // Coupling: how interdependent are modules (simplified)
    const coupling = this.calculateCoupling(modules, dependencies);

    return {
      totalModules,
      totalDependencies,
      averageDependenciesPerModule,
      maxDependencies,
      circularDependencies: circularDependencies.length,
      layerViolations: layerViolations.length,
      cohesion,
      coupling,
    };
  }

  /**
   * Calculate cohesion score (0-100, higher is better)
   * Measures how well modules work together within the same package
   */
  private calculateCohesion(modules: Module[], dependencies: Dependency[]): number {
    if (modules.length === 0) return 0;

    // Identify modules that are part of the same package/directory
    const packageGroups = new Map<string, Module[]>();

    modules.forEach(m => {
      const packagePath = m.path.split('/').slice(0, -1).join('/');
      if (!packageGroups.has(packagePath)) {
        packageGroups.set(packagePath, []);
      }
      packageGroups.get(packagePath)!.push(m);
    });

    // Calculate cohesion: dependencies within same package vs cross-package
    let intraPackageDeps = 0;
    dependencies.forEach(d => {
      const fromPackage = d.from.split('/').slice(0, -1).join('/');
      const toPackage = d.to.split('/').slice(0, -1).join('/');
      if (fromPackage === toPackage) {
        intraPackageDeps++;
      }
    });

    const totalDeps = dependencies.length || 1;
    return Math.round((intraPackageDeps / totalDeps) * 100);
  }

  /**
   * Calculate coupling score (0-100, lower is better)
   * Measures interdependence between modules
   */
  private calculateCoupling(modules: Module[], dependencies: Dependency[]): number {
    if (modules.length <= 1) return 0;

    // Average dependencies per module (normalized to 0-100 scale)
    // Threshold: 5+ deps per module = high coupling (80+)
    const avgDeps = dependencies.length / modules.length;
    const couplingScore = Math.min(100, (avgDeps / 5) * 80);

    return Math.round(couplingScore);
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(
    metrics: ArchitectureMetrics,
    _circularDependencies: CircularDependency[],
    _layerViolations: LayerViolation[]
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
    if (metrics.coupling > 70) {
      suggestions.push(
        `High coupling detected (${metrics.coupling}/100). Consider reducing dependencies between modules.`
      );
    }

    // Low cohesion
    if (metrics.cohesion < 50) {
      suggestions.push(
        `Low cohesion detected (${metrics.cohesion}/100). Group related functionality into modules.`
      );
    }

    // Too many dependencies
    if (metrics.maxDependencies > 10) {
      suggestions.push(
        `Some modules have too many dependencies (max: ${metrics.maxDependencies}). Consider breaking them down.`
      );
    }

    // Large codebase
    if (metrics.totalModules > 100) {
      suggestions.push(
        `Large codebase (${metrics.totalModules} modules). Consider organizing into packages or workspaces.`
      );
    }

    return suggestions;
  }

  /**
   * Generate dependency graph in Mermaid format
   */
  private generateDependencyGraph(modules: Module[], dependencies: Dependency[]): string {
    const lines: string[] = ['graph TD'];

    // Add nodes
    for (const module of modules) {
      const nodeId = this.sanitizeNodeId(module.path);
      const label = module.name.split('/').pop() || module.name;
      lines.push(`  ${nodeId}["${label}"]`);
    }

    // Add edges (limit to avoid overwhelming graph)
    const limitedDeps = dependencies.slice(0, 50);
    for (const dep of limitedDeps) {
      const fromId = this.sanitizeNodeId(dep.from);
      const toId = this.sanitizeNodeId(dep.to);
      lines.push(`  ${fromId} --> ${toId}`);
    }

    if (dependencies.length > 50) {
      lines.push(`  note["... and ${dependencies.length - 50} more dependencies"]`);
    }

    return lines.join('\n');
  }

  /**
   * Sanitize node ID for Mermaid
   */
  private sanitizeNodeId(path: string): string {
    return path.replace(/[^a-zA-Z0-9]/g, '_');
  }
}
