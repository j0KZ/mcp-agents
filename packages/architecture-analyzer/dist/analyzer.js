import { ProjectScanner } from './scanner.js';
import { CIRCULAR_DEPENDENCY_THRESHOLDS } from './constants/thresholds.js';
import { calculateCohesion } from './helpers/cohesion-calculator.js';
import { calculateCoupling } from './helpers/coupling-calculator.js';
import { generateSuggestions } from './helpers/suggestions-generator.js';
import { DEPENDENCY_THRESHOLDS } from './constants/metrics-thresholds.js';
export class ArchitectureAnalyzer {
    scanner;
    constructor() {
        this.scanner = new ProjectScanner();
    }
    /**
     * Analyze project architecture
     */
    async analyzeArchitecture(projectPath, config = {}) {
        const excludePatterns = config.excludePatterns || ['node_modules', 'dist', '.git', 'tests'];
        const { modules, dependencies } = await this.scanner.scanProject(projectPath, excludePatterns);
        const circularDependencies = config.detectCircular !== false ? this.detectCircularDependencies(modules, dependencies) : [];
        const layerViolations = config.layerRules
            ? this.detectLayerViolations(dependencies, config.layerRules)
            : [];
        const metrics = this.calculateMetrics(modules, dependencies, circularDependencies, layerViolations);
        const suggestions = generateSuggestions(metrics, circularDependencies, layerViolations);
        const dependencyGraph = config.generateGraph !== false ? this.generateDependencyGraph(modules, dependencies) : '';
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
    detectCircularDependencies(modules, dependencies) {
        const cycles = [];
        const graph = this.buildDependencyGraph(dependencies);
        for (const module of modules) {
            const visited = new Set();
            const path = [];
            this.findCycles(module.path, graph, visited, path, cycles);
        }
        // Remove duplicate cycles
        const uniqueCycles = this.deduplicateCycles(cycles);
        return uniqueCycles.map(cycle => ({
            cycle,
            severity: cycle.length > CIRCULAR_DEPENDENCY_THRESHOLDS.LONG_CYCLE_LENGTH ? 'error' : 'warning',
        }));
    }
    /**
     * Build adjacency list for dependency graph
     */
    buildDependencyGraph(dependencies) {
        const graph = new Map();
        for (const dep of dependencies) {
            if (!graph.has(dep.from)) {
                graph.set(dep.from, []);
            }
            graph.get(dep.from).push(dep.to);
        }
        return graph;
    }
    /**
     * Find cycles using DFS
     */
    findCycles(node, graph, visited, path, cycles) {
        if (path.includes(node)) {
            // Found a cycle
            const cycleStart = path.indexOf(node);
            const cycle = path.slice(cycleStart).concat(node);
            cycles.push({ cycle, severity: 'warning' });
            return;
        }
        if (visited.has(node))
            return;
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
    deduplicateCycles(cycles) {
        const seen = new Set();
        const unique = [];
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
    normalizeCycle(cycle) {
        // Find the lexicographically smallest element
        const minElement = cycle.reduce((min, curr) => (curr < min ? curr : min), cycle[0]);
        const minIndex = cycle.indexOf(minElement);
        return [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)];
    }
    /**
     * Detect layer violations
     */
    detectLayerViolations(dependencies, layerRules) {
        const violations = [];
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
    getLayer(modulePath, layerRules) {
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
    calculateMetrics(modules, dependencies, circularDependencies, layerViolations) {
        const totalModules = modules.length;
        const totalDependencies = dependencies.length;
        const dependenciesPerModule = modules.map(m => dependencies.filter(d => d.from === m.path).length);
        const averageDependenciesPerModule = totalModules > 0 ? Math.round(totalDependencies / totalModules) : 0;
        const maxDependencies = dependenciesPerModule.length > 0 ? Math.max(...dependenciesPerModule) : 0;
        // Cohesion: how related are modules (simplified)
        const cohesion = calculateCohesion(modules, dependencies);
        // Coupling: how interdependent are modules (simplified)
        const coupling = calculateCoupling(modules, dependencies);
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
     * Generate dependency graph in Mermaid format
     */
    generateDependencyGraph(modules, dependencies) {
        const lines = ['graph TD'];
        // Add nodes
        for (const module of modules) {
            const nodeId = this.sanitizeNodeId(module.path);
            const label = module.name.split('/').pop() || module.name;
            lines.push(`  ${nodeId}["${label}"]`);
        }
        // Add edges (limit to avoid overwhelming graph)
        const limitedDeps = dependencies.slice(0, DEPENDENCY_THRESHOLDS.MAX_GRAPH_EDGES);
        for (const dep of limitedDeps) {
            const fromId = this.sanitizeNodeId(dep.from);
            const toId = this.sanitizeNodeId(dep.to);
            lines.push(`  ${fromId} --> ${toId}`);
        }
        if (dependencies.length > DEPENDENCY_THRESHOLDS.MAX_GRAPH_EDGES) {
            lines.push(`  note["... and ${dependencies.length - DEPENDENCY_THRESHOLDS.MAX_GRAPH_EDGES} more dependencies"]`);
        }
        return lines.join('\n');
    }
    /**
     * Sanitize node ID for Mermaid
     */
    sanitizeNodeId(path) {
        return path.replace(/[^a-zA-Z0-9]/g, '_');
    }
}
//# sourceMappingURL=analyzer.js.map