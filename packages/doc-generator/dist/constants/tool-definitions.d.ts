/**
 * Doc Generator - Tool Definitions with Examples
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 */
import { ToolExample } from '@j0kz/shared';
export declare const GENERATE_JSDOC_EXAMPLES: ToolExample[];
export declare const GENERATE_README_EXAMPLES: ToolExample[];
export declare const GENERATE_API_DOCS_EXAMPLES: ToolExample[];
export declare const GENERATE_CHANGELOG_EXAMPLES: ToolExample[];
export declare const GENERATE_FULL_DOCS_EXAMPLES: ToolExample[];
export declare const DOC_GENERATOR_TOOLS: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            filePath: {
                type: "string";
                description: string;
            };
            config: {
                type: "object";
                properties: {
                    style: {
                        type: "string";
                        enum: string[];
                    };
                    addTodoTags: {
                        type: "boolean";
                    };
                    inferTypes: {
                        type: "boolean";
                    };
                    includePrivate: {
                        type: "boolean";
                    };
                    projectName?: undefined;
                    version?: undefined;
                    includeInstallation?: undefined;
                    includeUsage?: undefined;
                    includeAPI?: undefined;
                    includeBadges?: undefined;
                    includeTOC?: undefined;
                    groupByCategory?: undefined;
                    includeTypes?: undefined;
                    includeInterfaces?: undefined;
                    sortAlphabetically?: undefined;
                    repositoryUrl?: undefined;
                    commitLimit?: undefined;
                    fromTag?: undefined;
                    toTag?: undefined;
                    groupByType?: undefined;
                    conventionalCommits?: undefined;
                    includeAuthors?: undefined;
                    author?: undefined;
                    license?: undefined;
                    writeFiles?: undefined;
                };
            };
            response_format: any;
            projectPath?: undefined;
            sourceFiles?: undefined;
        };
        required: string[];
    };
    examples: ToolExample[];
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            projectPath: {
                type: "string";
                description: string;
            };
            config: {
                type: "object";
                properties: {
                    projectName: {
                        type: "string";
                    };
                    version: {
                        type: "string";
                    };
                    includeInstallation: {
                        type: "boolean";
                    };
                    includeUsage: {
                        type: "boolean";
                    };
                    includeAPI: {
                        type: "boolean";
                    };
                    includeBadges: {
                        type: "boolean";
                    };
                    includeTOC: {
                        type: "boolean";
                    };
                    style?: undefined;
                    addTodoTags?: undefined;
                    inferTypes?: undefined;
                    includePrivate?: undefined;
                    groupByCategory?: undefined;
                    includeTypes?: undefined;
                    includeInterfaces?: undefined;
                    sortAlphabetically?: undefined;
                    repositoryUrl?: undefined;
                    commitLimit?: undefined;
                    fromTag?: undefined;
                    toTag?: undefined;
                    groupByType?: undefined;
                    conventionalCommits?: undefined;
                    includeAuthors?: undefined;
                    author?: undefined;
                    license?: undefined;
                    writeFiles?: undefined;
                };
            };
            response_format: any;
            filePath?: undefined;
            sourceFiles?: undefined;
        };
        required: string[];
    };
    examples: ToolExample[];
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            projectPath: {
                type: "string";
                description: string;
            };
            config: {
                type: "object";
                properties: {
                    groupByCategory: {
                        type: "boolean";
                    };
                    includeTypes: {
                        type: "boolean";
                    };
                    includeInterfaces: {
                        type: "boolean";
                    };
                    sortAlphabetically: {
                        type: "boolean";
                    };
                    includeTOC: {
                        type: "boolean";
                    };
                    repositoryUrl: {
                        type: "string";
                    };
                    style?: undefined;
                    addTodoTags?: undefined;
                    inferTypes?: undefined;
                    includePrivate?: undefined;
                    projectName?: undefined;
                    version?: undefined;
                    includeInstallation?: undefined;
                    includeUsage?: undefined;
                    includeAPI?: undefined;
                    includeBadges?: undefined;
                    commitLimit?: undefined;
                    fromTag?: undefined;
                    toTag?: undefined;
                    groupByType?: undefined;
                    conventionalCommits?: undefined;
                    includeAuthors?: undefined;
                    author?: undefined;
                    license?: undefined;
                    writeFiles?: undefined;
                };
            };
            response_format: any;
            filePath?: undefined;
            sourceFiles?: undefined;
        };
        required: string[];
    };
    examples: ToolExample[];
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            projectPath: {
                type: "string";
                description: string;
            };
            config: {
                type: "object";
                properties: {
                    commitLimit: {
                        type: "number";
                    };
                    fromTag: {
                        type: "string";
                    };
                    toTag: {
                        type: "string";
                    };
                    groupByType: {
                        type: "boolean";
                    };
                    conventionalCommits: {
                        type: "boolean";
                    };
                    includeAuthors: {
                        type: "boolean";
                    };
                    style?: undefined;
                    addTodoTags?: undefined;
                    inferTypes?: undefined;
                    includePrivate?: undefined;
                    projectName?: undefined;
                    version?: undefined;
                    includeInstallation?: undefined;
                    includeUsage?: undefined;
                    includeAPI?: undefined;
                    includeBadges?: undefined;
                    includeTOC?: undefined;
                    groupByCategory?: undefined;
                    includeTypes?: undefined;
                    includeInterfaces?: undefined;
                    sortAlphabetically?: undefined;
                    repositoryUrl?: undefined;
                    author?: undefined;
                    license?: undefined;
                    writeFiles?: undefined;
                };
            };
            response_format: any;
            filePath?: undefined;
            sourceFiles?: undefined;
        };
        required: string[];
    };
    examples: ToolExample[];
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            projectPath: {
                type: "string";
                description: string;
            };
            sourceFiles: {
                type: "array";
                items: {
                    type: "string";
                };
                description: string;
            };
            config: {
                type: "object";
                properties: {
                    projectName: {
                        type: "string";
                    };
                    version: {
                        type: "string";
                    };
                    author: {
                        type: "string";
                    };
                    license: {
                        type: "string";
                    };
                    writeFiles: {
                        type: "boolean";
                    };
                    style?: undefined;
                    addTodoTags?: undefined;
                    inferTypes?: undefined;
                    includePrivate?: undefined;
                    includeInstallation?: undefined;
                    includeUsage?: undefined;
                    includeAPI?: undefined;
                    includeBadges?: undefined;
                    includeTOC?: undefined;
                    groupByCategory?: undefined;
                    includeTypes?: undefined;
                    includeInterfaces?: undefined;
                    sortAlphabetically?: undefined;
                    repositoryUrl?: undefined;
                    commitLimit?: undefined;
                    fromTag?: undefined;
                    toTag?: undefined;
                    groupByType?: undefined;
                    conventionalCommits?: undefined;
                    includeAuthors?: undefined;
                };
            };
            response_format: any;
            filePath?: undefined;
        };
        required: string[];
    };
    examples: ToolExample[];
})[];
//# sourceMappingURL=tool-definitions.d.ts.map