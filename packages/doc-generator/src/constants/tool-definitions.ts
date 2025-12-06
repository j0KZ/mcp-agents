/**
 * Doc Generator - Tool Definitions with Examples
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 */

import { ToolExample, RESPONSE_FORMAT_SCHEMA } from '@j0kz/shared';

export const GENERATE_JSDOC_EXAMPLES: ToolExample[] = [
  {
    name: 'Generate JSDoc for file',
    description: 'Add JSDoc comments to TypeScript file',
    input: {
      filePath: 'src/utils/validator.ts',
      config: { style: 'typescript', inferTypes: true },
    },
    output: {
      filePath: 'src/utils/validator.ts',
      functions: 3,
      classes: 1,
      documented: [
        {
          name: 'validateEmail',
          jsdoc:
            '/**\n * Validates an email address\n * @param email - The email to validate\n * @returns True if valid\n */',
        },
      ],
      coverage: '85%',
    },
  },
];

export const GENERATE_README_EXAMPLES: ToolExample[] = [
  {
    name: 'Generate project README',
    description: 'Create comprehensive README from package.json',
    input: {
      projectPath: './',
      config: {
        projectName: 'My Awesome Project',
        includeInstallation: true,
        includeUsage: true,
        includeAPI: true,
        includeBadges: true,
      },
    },
    output: {
      filePath: 'README.md',
      sections: ['Installation', 'Usage', 'API', 'Contributing', 'License'],
      content:
        '# My Awesome Project\n\n[![npm](https://img.shields.io/npm/v/...)]...\n\n## Installation\n\n```bash\nnpm install my-awesome-project\n```',
    },
  },
];

export const GENERATE_API_DOCS_EXAMPLES: ToolExample[] = [
  {
    name: 'Generate API documentation',
    description: 'Extract API docs from source files',
    input: {
      projectPath: './src',
      config: {
        groupByCategory: true,
        includeTypes: true,
        includeTOC: true,
        repositoryUrl: 'https://github.com/user/repo',
      },
    },
    output: {
      filePath: 'API.md',
      classes: 5,
      functions: 23,
      interfaces: 12,
      content:
        '# API Reference\n\n## Table of Contents\n\n- [Classes](#classes)\n  - [UserService](#userservice)\n...',
    },
  },
];

export const GENERATE_CHANGELOG_EXAMPLES: ToolExample[] = [
  {
    name: 'Generate changelog from git',
    description: 'Create changelog using conventional commits',
    input: {
      projectPath: './',
      config: {
        commitLimit: 50,
        groupByType: true,
        conventionalCommits: true,
        includeAuthors: true,
      },
    },
    output: {
      filePath: 'CHANGELOG.md',
      commits: 50,
      features: 12,
      fixes: 8,
      content:
        '# Changelog\n\n## [1.2.0] - 2024-11-24\n\n### Features\n\n- feat: Add user authentication\n- feat: Implement caching layer\n\n### Bug Fixes\n\n- fix: Resolve memory leak',
    },
  },
];

export const GENERATE_FULL_DOCS_EXAMPLES: ToolExample[] = [
  {
    name: 'Generate complete documentation',
    description: 'Generate all documentation at once',
    input: {
      projectPath: './',
      sourceFiles: ['src/index.ts', 'src/utils.ts'],
      config: {
        projectName: 'My Library',
        version: '1.0.0',
        writeFiles: true,
      },
    },
    output: {
      success: true,
      message: 'Full documentation suite generated successfully',
      filesWritten: true,
      results: {
        readme: { filePath: 'README.md' },
        apiDocs: { filePath: 'API.md', classes: 3, functions: 15 },
        changelog: { filePath: 'CHANGELOG.md', commits: 25 },
        jsdoc: [{ file: 'src/index.ts', result: { functions: 5 } }],
      },
    },
  },
];

export const DOC_GENERATOR_TOOLS = [
  {
    name: 'generate_jsdoc',
    description: `Generate JSDoc comments for a TypeScript/JavaScript file. Analyzes functions, classes, and interfaces to produce comprehensive JSDoc documentation with parameter types, return values, and suggestions for missing documentation.
Keywords: jsdoc, comments, documentation, typescript, javascript, annotations.
Use when: documenting code, improving IDE hints, API documentation.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        filePath: {
          type: 'string' as const,
          description: 'Path to the source file to generate JSDoc for',
        },
        config: {
          type: 'object' as const,
          properties: {
            style: { type: 'string' as const, enum: ['standard', 'google', 'typescript'] },
            addTodoTags: { type: 'boolean' as const },
            inferTypes: { type: 'boolean' as const },
            includePrivate: { type: 'boolean' as const },
          },
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['filePath'],
    },
    examples: GENERATE_JSDOC_EXAMPLES,
  },
  {
    name: 'generate_readme',
    description: `Generate a comprehensive README.md file from project source code and package.json. Creates sections for installation, usage, API reference, badges, table of contents, and more.
Keywords: readme, documentation, markdown, installation, usage, badges.
Use when: creating project documentation, updating README, open source projects.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectPath: { type: 'string' as const, description: 'Path to the project root directory' },
        config: {
          type: 'object' as const,
          properties: {
            projectName: { type: 'string' as const },
            version: { type: 'string' as const },
            includeInstallation: { type: 'boolean' as const },
            includeUsage: { type: 'boolean' as const },
            includeAPI: { type: 'boolean' as const },
            includeBadges: { type: 'boolean' as const },
            includeTOC: { type: 'boolean' as const },
          },
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['projectPath'],
    },
    examples: GENERATE_README_EXAMPLES,
  },
  {
    name: 'generate_api_docs',
    description: `Generate comprehensive API documentation from TypeScript/JavaScript source files. Extracts classes, interfaces, functions, parameters, and return types to create detailed API reference documentation.
Keywords: api, documentation, reference, classes, interfaces, types.
Use when: creating API reference, library documentation, SDK docs.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectPath: {
          type: 'string' as const,
          description: 'Path to the project source directory',
        },
        config: {
          type: 'object' as const,
          properties: {
            groupByCategory: { type: 'boolean' as const },
            includeTypes: { type: 'boolean' as const },
            includeInterfaces: { type: 'boolean' as const },
            sortAlphabetically: { type: 'boolean' as const },
            includeTOC: { type: 'boolean' as const },
            repositoryUrl: { type: 'string' as const },
          },
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['projectPath'],
    },
    examples: GENERATE_API_DOCS_EXAMPLES,
  },
  {
    name: 'generate_changelog',
    description: `Generate a changelog from git commit history using conventional commit format. Groups commits by type (features, fixes, docs, etc.) and optionally includes breaking changes, authors, and commit links.
Keywords: changelog, git, commits, conventional, releases, history.
Use when: preparing releases, documenting changes, maintaining changelog.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectPath: { type: 'string' as const, description: 'Path to the git repository' },
        config: {
          type: 'object' as const,
          properties: {
            commitLimit: { type: 'number' as const },
            fromTag: { type: 'string' as const },
            toTag: { type: 'string' as const },
            groupByType: { type: 'boolean' as const },
            conventionalCommits: { type: 'boolean' as const },
            includeAuthors: { type: 'boolean' as const },
          },
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['projectPath'],
    },
    examples: GENERATE_CHANGELOG_EXAMPLES,
  },
  {
    name: 'generate_full_docs',
    description: `Generate complete documentation suite including JSDoc, README, API documentation, and changelog all at once. This is a convenience tool that runs all documentation generators and saves the results to appropriate files.
Keywords: full, complete, all, documentation, suite.
Use when: initial documentation, comprehensive update, release preparation.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectPath: { type: 'string' as const, description: 'Path to the project root directory' },
        sourceFiles: {
          type: 'array' as const,
          items: { type: 'string' as const },
          description: 'Array of source files for JSDoc',
        },
        config: {
          type: 'object' as const,
          properties: {
            projectName: { type: 'string' as const },
            version: { type: 'string' as const },
            author: { type: 'string' as const },
            license: { type: 'string' as const },
            writeFiles: { type: 'boolean' as const },
          },
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['projectPath'],
    },
    examples: GENERATE_FULL_DOCS_EXAMPLES,
  },
];
