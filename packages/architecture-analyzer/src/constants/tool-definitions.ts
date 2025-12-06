/**
 * Architecture Analyzer - Tool Definitions with Examples
 *
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 * @see https://www.anthropic.com/engineering/advanced-tool-use
 */

import { ToolExample, RESPONSE_FORMAT_SCHEMA } from '@j0kz/shared';

// ============================================================================
// ANALYZE_ARCHITECTURE
// ============================================================================

export const ANALYZE_ARCHITECTURE_EXAMPLES: ToolExample[] = [
  {
    name: 'Full architecture analysis',
    description: 'Analyze complete project architecture with dependency graph',
    input: {
      projectPath: './src',
      config: {
        detectCircular: true,
        generateGraph: true,
      },
    },
    output: {
      summary: {
        totalModules: 45,
        totalDependencies: 128,
        circularDependencies: 2,
        layerViolations: 0,
        cohesion: '78%',
        coupling: '32%',
      },
      modules: [
        { path: 'src/core/index.ts', linesOfCode: 250, dependencies: 5 },
        { path: 'src/utils/helpers.ts', linesOfCode: 120, dependencies: 2 },
      ],
      mermaidGraph: 'graph TD\n  A[core] --> B[utils]\n  A --> C[types]',
    },
  },
  {
    name: 'Layer violation check',
    description: 'Check for architecture layer violations',
    input: {
      projectPath: './src',
      config: {
        layerRules: {
          presentation: ['business'],
          business: ['data'],
          data: [],
        },
        detectCircular: false,
      },
    },
    output: {
      summary: {
        totalModules: 30,
        layerViolations: 3,
      },
      layerViolations: [
        {
          from: 'src/presentation/UserView.ts',
          to: 'src/data/UserRepository.ts',
          message: 'Presentation layer should not import from Data layer directly',
        },
      ],
    },
  },
];

export const ANALYZE_ARCHITECTURE_DEFINITION = {
  name: 'analyze_architecture',
  description: `Analyze project architecture, detect circular dependencies, layer violations, and generate dependency graphs.
Keywords: architecture, dependencies, circular, layers, coupling, cohesion, mermaid, graph.
Use when: reviewing project structure, finding dependency issues, visualizing architecture.

Returns: Object containing:
- summary (object): {totalModules, totalDependencies, circularDependencies, layerViolations, cohesion, coupling}
- modules (array): List of {path, linesOfCode, dependencies}
- circularDependencies (array): Detected circular dependency chains
- layerViolations (array): Architecture rule violations
- mermaidGraph (string): Mermaid diagram of dependency graph`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      projectPath: {
        type: 'string' as const,
        description: 'Path to the project root directory',
      },
      config: {
        type: 'object' as const,
        description: 'Analysis configuration',
        properties: {
          maxDepth: {
            type: 'number' as const,
            description: 'Maximum depth for directory traversal',
          },
          excludePatterns: {
            type: 'array' as const,
            items: { type: 'string' as const },
            description: 'Patterns to exclude from analysis',
          },
          detectCircular: {
            type: 'boolean' as const,
            description: 'Detect circular dependencies',
          },
          generateGraph: {
            type: 'boolean' as const,
            description: 'Generate Mermaid dependency graph',
          },
          layerRules: {
            type: 'object' as const,
            description:
              'Layer dependency rules (e.g., {"presentation": ["business"], "business": ["data"]})',
          },
        },
      },
      response_format: RESPONSE_FORMAT_SCHEMA,
    },
    required: ['projectPath'],
  },
  examples: ANALYZE_ARCHITECTURE_EXAMPLES,
};

// ============================================================================
// GET_MODULE_INFO
// ============================================================================

export const GET_MODULE_INFO_EXAMPLES: ToolExample[] = [
  {
    name: 'Get module details',
    description: 'Get detailed information about a specific module',
    input: {
      projectPath: './src',
      modulePath: 'src/services/UserService.ts',
    },
    output: {
      module: {
        path: 'src/services/UserService.ts',
        name: 'UserService',
        linesOfCode: 185,
        exports: ['UserService', 'UserServiceConfig'],
      },
      dependencies: [
        { from: 'src/services/UserService.ts', to: 'src/types/User.ts', type: 'import' },
        { from: 'src/services/UserService.ts', to: 'src/utils/validator.ts', type: 'import' },
      ],
      dependents: [
        {
          from: 'src/controllers/UserController.ts',
          to: 'src/services/UserService.ts',
          type: 'import',
        },
      ],
      stats: {
        dependencyCount: 2,
        dependentCount: 1,
        linesOfCode: 185,
      },
    },
  },
  {
    name: 'Check core module',
    description: 'Analyze a core module with many dependents',
    input: {
      projectPath: '.',
      modulePath: 'src/core/index.ts',
    },
    output: {
      module: {
        path: 'src/core/index.ts',
        name: 'core',
        linesOfCode: 45,
      },
      stats: {
        dependencyCount: 8,
        dependentCount: 23,
        linesOfCode: 45,
      },
    },
  },
];

export const GET_MODULE_INFO_DEFINITION = {
  name: 'get_module_info',
  description: `Get detailed information about a specific module including dependencies and dependents.
Keywords: module, info, details, dependencies, dependents, imports, exports.
Use when: investigating a specific file, understanding module relationships.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      projectPath: {
        type: 'string' as const,
        description: 'Path to the project root',
      },
      modulePath: {
        type: 'string' as const,
        description: 'Relative path to the module',
      },
      response_format: RESPONSE_FORMAT_SCHEMA,
    },
    required: ['projectPath', 'modulePath'],
  },
  examples: GET_MODULE_INFO_EXAMPLES,
};

// ============================================================================
// FIND_CIRCULAR_DEPS
// ============================================================================

export const FIND_CIRCULAR_DEPS_EXAMPLES: ToolExample[] = [
  {
    name: 'Find circular dependencies',
    description: 'Detect all circular dependency chains in the project',
    input: {
      projectPath: './src',
    },
    output: {
      circularDependencies: [
        {
          cycle: ['src/a.ts', 'src/b.ts', 'src/c.ts', 'src/a.ts'],
          length: 3,
        },
        {
          cycle: ['src/utils/format.ts', 'src/utils/parse.ts', 'src/utils/format.ts'],
          length: 2,
        },
      ],
      count: 2,
    },
  },
  {
    name: 'No circular dependencies',
    description: 'Check project with clean architecture',
    input: {
      projectPath: './lib',
    },
    output: {
      circularDependencies: [],
      count: 0,
    },
  },
];

export const FIND_CIRCULAR_DEPS_DEFINITION = {
  name: 'find_circular_deps',
  description: `Find all circular dependencies in the project.
Keywords: circular, cycle, dependency, loop, recursive.
Use when: debugging import issues, cleaning up architecture.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      projectPath: {
        type: 'string' as const,
        description: 'Path to the project root',
      },
      response_format: RESPONSE_FORMAT_SCHEMA,
    },
    required: ['projectPath'],
  },
  examples: FIND_CIRCULAR_DEPS_EXAMPLES,
};

// ============================================================================
// ALL TOOL DEFINITIONS
// ============================================================================

export const ARCHITECTURE_ANALYZER_TOOLS = [
  ANALYZE_ARCHITECTURE_DEFINITION,
  GET_MODULE_INFO_DEFINITION,
  FIND_CIRCULAR_DEPS_DEFINITION,
];
