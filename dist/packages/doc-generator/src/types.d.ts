/**
 * Type definitions for documentation generation
 * @module types
 */
/**
 * Severity level for documentation issues
 */
export type IssueSeverity = 'error' | 'warning' | 'info';
/**
 * Documentation configuration options
 */
export interface DocConfig {
    /**
     * Include private members in documentation
     * @default false
     */
    includePrivate?: boolean;
    /**
     * Include inherited members
     * @default true
     */
    includeInherited?: boolean;
    /**
     * Output format for documentation
     * @default 'markdown'
     */
    format?: 'markdown' | 'html' | 'json';
    /**
     * Custom template path for documentation
     */
    templatePath?: string;
    /**
     * Project name for documentation header
     */
    projectName?: string;
    /**
     * Project version
     */
    version?: string;
    /**
     * Author information
     */
    author?: string;
    /**
     * License type
     */
    license?: string;
    /**
     * Include table of contents
     * @default true
     */
    includeTOC?: boolean;
    /**
     * Maximum heading depth for TOC
     * @default 3
     */
    maxTOCDepth?: number;
    /**
     * Include examples in documentation
     * @default true
     */
    includeExamples?: boolean;
    /**
     * Include source code links
     * @default false
     */
    includeSourceLinks?: boolean;
    /**
     * Repository URL for source links
     */
    repositoryUrl?: string;
}
/**
 * JSDoc generation configuration
 */
export interface JSDocConfig extends DocConfig {
    /**
     * JSDoc style preference
     * @default 'standard'
     */
    style?: 'standard' | 'google' | 'typescript';
    /**
     * Add @todo tags for missing documentation
     * @default true
     */
    addTodoTags?: boolean;
    /**
     * Infer types from TypeScript
     * @default true
     */
    inferTypes?: boolean;
}
/**
 * README generation configuration
 */
export interface ReadmeConfig extends DocConfig {
    /**
     * Include installation section
     * @default true
     */
    includeInstallation?: boolean;
    /**
     * Include usage examples
     * @default true
     */
    includeUsage?: boolean;
    /**
     * Include API reference
     * @default true
     */
    includeAPI?: boolean;
    /**
     * Include contributing guidelines
     * @default false
     */
    includeContributing?: boolean;
    /**
     * Include badges (build, coverage, etc.)
     * @default true
     */
    includeBadges?: boolean;
    /**
     * Badge configuration
     */
    badges?: {
        build?: boolean;
        coverage?: boolean;
        version?: boolean;
        license?: boolean;
        downloads?: boolean;
    };
}
/**
 * API documentation configuration
 */
export interface ApiDocsConfig extends DocConfig {
    /**
     * Group documentation by category
     * @default true
     */
    groupByCategory?: boolean;
    /**
     * Include type definitions
     * @default true
     */
    includeTypes?: boolean;
    /**
     * Include interfaces
     * @default true
     */
    includeInterfaces?: boolean;
    /**
     * Include enums
     * @default true
     */
    includeEnums?: boolean;
    /**
     * Sort members alphabetically
     * @default false
     */
    sortAlphabetically?: boolean;
}
/**
 * Changelog generation configuration
 */
export interface ChangelogConfig {
    /**
     * Number of commits to include
     * @default 100
     */
    commitLimit?: number;
    /**
     * Starting version tag
     */
    fromTag?: string;
    /**
     * Ending version tag
     */
    toTag?: string;
    /**
     * Group changes by type (feat, fix, etc.)
     * @default true
     */
    groupByType?: boolean;
    /**
     * Include merge commits
     * @default false
     */
    includeMerges?: boolean;
    /**
     * Conventional commit format
     * @default true
     */
    conventionalCommits?: boolean;
    /**
     * Custom commit types mapping
     */
    commitTypes?: Record<string, string>;
    /**
     * Include commit authors
     * @default true
     */
    includeAuthors?: boolean;
    /**
     * Link to commit URLs
     * @default true
     */
    linkCommits?: boolean;
}
/**
 * Parsed function or method information
 */
export interface FunctionInfo {
    /**
     * Function name
     */
    name: string;
    /**
     * Function description
     */
    description?: string;
    /**
     * Function parameters
     */
    parameters: ParameterInfo[];
    /**
     * Return type information
     */
    returnType?: TypeInfo;
    /**
     * Whether function is async
     */
    isAsync: boolean;
    /**
     * Whether function is exported
     */
    isExported: boolean;
    /**
     * Access modifier (public, private, protected)
     */
    access?: 'public' | 'private' | 'protected';
    /**
     * JSDoc tags
     */
    tags?: Record<string, string[]>;
    /**
     * Code examples
     */
    examples?: string[];
    /**
     * Source file location
     */
    location?: {
        file: string;
        line: number;
        column: number;
    };
}
/**
 * Parameter information
 */
export interface ParameterInfo {
    /**
     * Parameter name
     */
    name: string;
    /**
     * Parameter type
     */
    type?: TypeInfo;
    /**
     * Parameter description
     */
    description?: string;
    /**
     * Whether parameter is optional
     */
    optional: boolean;
    /**
     * Default value
     */
    defaultValue?: string;
    /**
     * Whether parameter is rest parameter
     */
    rest: boolean;
}
/**
 * Type information
 */
export interface TypeInfo {
    /**
     * Type name
     */
    name: string;
    /**
     * Whether type is array
     */
    isArray: boolean;
    /**
     * Generic type parameters
     */
    generics?: TypeInfo[];
    /**
     * Union types
     */
    union?: TypeInfo[];
    /**
     * Raw type string
     */
    raw: string;
}
/**
 * Class information
 */
export interface ClassInfo {
    /**
     * Class name
     */
    name: string;
    /**
     * Class description
     */
    description?: string;
    /**
     * Extended class
     */
    extends?: string;
    /**
     * Implemented interfaces
     */
    implements?: string[];
    /**
     * Class properties
     */
    properties: PropertyInfo[];
    /**
     * Class methods
     */
    methods: FunctionInfo[];
    /**
     * Constructor information
     */
    constructor?: FunctionInfo;
    /**
     * Whether class is exported
     */
    isExported: boolean;
    /**
     * Whether class is abstract
     */
    isAbstract: boolean;
}
/**
 * Property information
 */
export interface PropertyInfo {
    /**
     * Property name
     */
    name: string;
    /**
     * Property type
     */
    type?: TypeInfo;
    /**
     * Property description
     */
    description?: string;
    /**
     * Access modifier
     */
    access?: 'public' | 'private' | 'protected';
    /**
     * Whether property is readonly
     */
    readonly: boolean;
    /**
     * Whether property is static
     */
    static: boolean;
    /**
     * Default value
     */
    defaultValue?: string;
}
/**
 * Interface information
 */
export interface InterfaceInfo {
    /**
     * Interface name
     */
    name: string;
    /**
     * Interface description
     */
    description?: string;
    /**
     * Extended interfaces
     */
    extends?: string[];
    /**
     * Interface properties
     */
    properties: PropertyInfo[];
    /**
     * Interface methods
     */
    methods: FunctionInfo[];
    /**
     * Whether interface is exported
     */
    isExported: boolean;
}
/**
 * Documentation generation result
 */
export interface DocResult {
    /**
     * Generated documentation content
     */
    content: string;
    /**
     * Output file path
     */
    filePath?: string;
    /**
     * Format of the documentation
     */
    format: 'markdown' | 'html' | 'json';
    /**
     * Generation metadata
     */
    metadata: {
        /**
         * Generation timestamp
         */
        generatedAt: string;
        /**
         * Files processed
         */
        filesProcessed: number;
        /**
         * Total items documented
         */
        itemsDocumented: number;
        /**
         * Warnings encountered
         */
        warnings: string[];
    };
}
/**
 * Changelog entry
 */
export interface ChangelogEntry {
    /**
     * Version number
     */
    version: string;
    /**
     * Release date
     */
    date: string;
    /**
     * Commit groups by type
     */
    groups: ChangelogGroup[];
    /**
     * Breaking changes
     */
    breaking?: string[];
}
/**
 * Changelog group (features, fixes, etc.)
 */
export interface ChangelogGroup {
    /**
     * Group type (feat, fix, docs, etc.)
     */
    type: string;
    /**
     * Group title
     */
    title: string;
    /**
     * Commits in this group
     */
    commits: ChangelogCommit[];
}
/**
 * Changelog commit information
 */
export interface ChangelogCommit {
    /**
     * Commit hash
     */
    hash: string;
    /**
     * Short hash (7 chars)
     */
    shortHash: string;
    /**
     * Commit subject
     */
    subject: string;
    /**
     * Commit body
     */
    body?: string;
    /**
     * Commit author
     */
    author?: string;
    /**
     * Commit date
     */
    date: string;
    /**
     * Related issues/PRs
     */
    references?: string[];
    /**
     * Breaking change flag
     */
    breaking: boolean;
}
/**
 * Documentation error
 */
export declare class DocError extends Error {
    code: string;
    details?: unknown | undefined;
    constructor(message: string, code: string, details?: unknown | undefined);
}
//# sourceMappingURL=types.d.ts.map