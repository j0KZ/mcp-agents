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
     * Detect circular dependencies using Tarjan's algorithm (O(V+E) complexity)
     */
    detectCircularDependencies(modules, dependencies) {
        const graph = this.buildDependencyGraph(dependencies);
        // Use Tarjan's algorithm for much better performance
        const tarjanCycles = this.findCyclesTarjan(graph);
        return tarjanCycles.map(cycle => ({
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
            const neighbors = graph.get(dep.from);
            if (neighbors) {
                neighbors.push(dep.to);
            }
        }
        return graph;
    }
    /**
     * Tarjan's algorithm for finding strongly connected components (and cycles)
     * Much more efficient: O(V+E) instead of O(V²)
     */
    findCyclesTarjan(graph) {
        const cycles = [];
        const index = new Map();
        const lowlink = new Map();
        const onStack = new Set();
        const stack = [];
        let currentIndex = 0;
        // Helper function for Tarjan's DFS
        const strongConnect = (node) => {
            // Set the depth index for node to the smallest unused index
            index.set(node, currentIndex);
            lowlink.set(node, currentIndex);
            currentIndex++;
            stack.push(node);
            onStack.add(node);
            // Consider successors of node
            const neighbors = graph.get(node) || [];
            for (const neighbor of neighbors) {
                if (!index.has(neighbor)) {
                    // Successor has not yet been visited; recurse on it
                    strongConnect(neighbor);
                    const nodeLowlink = lowlink.get(node) ?? currentIndex;
                    const neighborLowlink = lowlink.get(neighbor) ?? currentIndex;
                    lowlink.set(node, Math.min(nodeLowlink, neighborLowlink));
                }
                else if (onStack.has(neighbor)) {
                    // Successor is in stack and hence in the current SCC
                    const nodeLowlink = lowlink.get(node) ?? currentIndex;
                    const neighborIndex = index.get(neighbor) ?? currentIndex;
                    lowlink.set(node, Math.min(nodeLowlink, neighborIndex));
                }
            }
            // If node is a root node, pop the stack and get SCC
            if (lowlink.get(node) === index.get(node)) {
                const scc = [];
                let w;
                do {
                    w = stack.pop();
                    if (w) {
                        onStack.delete(w);
                        scc.push(w);
                    }
                } while (w && w !== node);
                // Only keep SCCs with more than one node (these are cycles)
                if (scc.length > 1) {
                    // Reverse to get proper cycle order
                    cycles.push(scc.reverse());
                }
            }
        };
        // Run Tarjan's algorithm on all unvisited nodes
        for (const node of graph.keys()) {
            if (!index.has(node)) {
                strongConnect(node);
            }
        }
        return cycles;
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
        // Performance optimization: Pre-calculate dependency map for O(1) lookups
        const dependencyCountMap = new Map();
        for (const dep of dependencies) {
            const count = dependencyCountMap.get(dep.from) || 0;
            dependencyCountMap.set(dep.from, count + 1);
        }
        const dependenciesPerModule = modules.map(m => dependencyCountMap.get(m.path) || 0);
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