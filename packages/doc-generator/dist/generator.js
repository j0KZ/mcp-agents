/**
 * Core documentation generation logic
 * @module generator
 */
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { DocError, } from './types.js';
/**
 * Parse TypeScript/JavaScript file to extract documentation information
 * @param filePath - Path to the source file
 * @returns Parsed code information
 */
function parseSourceFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const functions = [];
    const classes = [];
    const interfaces = [];
    // Simple regex-based parsing (production implementation would use TypeScript Compiler API)
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\((.*?)\)(?:\s*:\s*([^{]+))?\s*{/g;
    const classRegex = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?\s*{/g;
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+([\w,\s]+))?\s*{/g;
    let match;
    // Parse functions
    while ((match = functionRegex.exec(content)) !== null) {
        const [, name, params, returnType] = match;
        const parameters = params
            .split(',')
            .map((p) => p.trim())
            .filter((p) => p)
            .map((param) => {
            const [paramName, paramType] = param.split(':').map((s) => s.trim());
            const isOptional = paramName.includes('?');
            const isRest = paramName.startsWith('...');
            const cleanName = paramName.replace(/[?\.]/g, '');
            return {
                name: cleanName,
                type: paramType ? { name: paramType, isArray: paramType.includes('[]'), raw: paramType } : undefined,
                optional: isOptional,
                rest: isRest,
            };
        });
        functions.push({
            name,
            parameters,
            returnType: returnType ? { name: returnType.trim(), isArray: returnType.includes('[]'), raw: returnType.trim() } : undefined,
            isAsync: match[0].includes('async'),
            isExported: match[0].includes('export'),
        });
    }
    // Parse classes
    while ((match = classRegex.exec(content)) !== null) {
        const [, name, extendsClass, implementsInterfaces] = match;
        classes.push({
            name,
            extends: extendsClass,
            implements: implementsInterfaces?.split(',').map((i) => i.trim()),
            properties: [],
            methods: [],
            constructor: undefined,
            isExported: match[0].includes('export'),
            isAbstract: match[0].includes('abstract'),
        });
    }
    // Parse interfaces
    while ((match = interfaceRegex.exec(content)) !== null) {
        const [, name, extendsInterfaces] = match;
        interfaces.push({
            name,
            extends: extendsInterfaces?.split(',').map((i) => i.trim()),
            properties: [],
            methods: [],
            isExported: match[0].includes('export'),
        });
    }
    return { functions, classes, interfaces };
}
/**
 * Generate JSDoc comments for a source file
 * @param filePath - Path to the source file
 * @param config - JSDoc generation configuration
 * @returns Generated JSDoc documentation
 * @throws {DocError} If file cannot be read or parsed
 *
 * @example
 * ```typescript
 * const jsdoc = await generateJSDoc('./src/utils.ts', {
 *   style: 'typescript',
 *   inferTypes: true
 * });
 * console.log(jsdoc.content);
 * ```
 */
export async function generateJSDoc(filePath, config = {}) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new DocError('File not found', 'FILE_NOT_FOUND', { filePath });
        }
        const { functions, classes, interfaces } = parseSourceFile(filePath);
        const warnings = [];
        let itemsDocumented = 0;
        const jsdocContent = [];
        // Generate JSDoc for functions
        functions.forEach(func => {
            jsdocContent.push('/**');
            jsdocContent.push(` * ${func.description || `Function: ${func.name}`}`);
            func.parameters.forEach(param => {
                const typeStr = param.type?.raw || 'any';
                const optionalStr = param.optional ? '=' : '';
                jsdocContent.push(` * @param {${typeStr}} ${optionalStr}${param.name} - ${param.description || 'Parameter description'}`);
            });
            if (func.returnType) {
                jsdocContent.push(` * @returns {${func.returnType.raw}} Return value description`);
            }
            if (config.addTodoTags && !func.description) {
                jsdocContent.push(' * @todo Add function description');
                warnings.push(`Missing description for function: ${func.name}`);
            }
            jsdocContent.push(' */');
            jsdocContent.push('');
            itemsDocumented++;
        });
        // Generate JSDoc for classes
        classes.forEach(cls => {
            jsdocContent.push('/**');
            jsdocContent.push(` * ${cls.description || `Class: ${cls.name}`}`);
            if (cls.extends) {
                jsdocContent.push(` * @extends ${cls.extends}`);
            }
            cls.implements?.forEach(iface => {
                jsdocContent.push(` * @implements ${iface}`);
            });
            if (config.addTodoTags && !cls.description) {
                jsdocContent.push(' * @todo Add class description');
                warnings.push(`Missing description for class: ${cls.name}`);
            }
            jsdocContent.push(' */');
            jsdocContent.push('');
            itemsDocumented++;
        });
        // Generate JSDoc for interfaces
        interfaces.forEach(iface => {
            jsdocContent.push('/**');
            jsdocContent.push(` * ${iface.description || `Interface: ${iface.name}`}`);
            if (config.addTodoTags && !iface.description) {
                jsdocContent.push(' * @todo Add interface description');
                warnings.push(`Missing description for interface: ${iface.name}`);
            }
            jsdocContent.push(' */');
            jsdocContent.push('');
            itemsDocumented++;
        });
        return {
            content: jsdocContent.join('\n'),
            filePath,
            format: 'markdown',
            metadata: {
                generatedAt: new Date().toISOString(),
                filesProcessed: 1,
                itemsDocumented,
                warnings,
            },
        };
    }
    catch (error) {
        if (error instanceof DocError) {
            throw error;
        }
        throw new DocError('Failed to generate JSDoc', 'JSDOC_GENERATION_FAILED', error);
    }
}
/**
 * Generate README.md from source code
 * @param projectPath - Path to the project root
 * @param config - README generation configuration
 * @returns Generated README content
 * @throws {DocError} If project path is invalid
 *
 * @example
 * ```typescript
 * const readme = await generateReadme('./my-project', {
 *   includeBadges: true,
 *   includeInstallation: true
 * });
 * fs.writeFileSync('README.md', readme.content);
 * ```
 */
export async function generateReadme(projectPath, config = {}) {
    try {
        if (!fs.existsSync(projectPath)) {
            throw new DocError('Project path not found', 'PATH_NOT_FOUND', { projectPath });
        }
        const packageJsonPath = path.join(projectPath, 'package.json');
        let packageJson = {};
        if (fs.existsSync(packageJsonPath)) {
            packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        }
        const sections = [];
        const warnings = [];
        // Title
        sections.push(`# ${config.projectName || packageJson.name || 'Project'}`);
        sections.push('');
        // Description
        if (packageJson.description) {
            sections.push(packageJson.description);
            sections.push('');
        }
        // Badges
        if (config.includeBadges !== false) {
            const badges = [];
            if (config.badges?.version !== false && packageJson.version) {
                badges.push(`![Version](https://img.shields.io/badge/version-${packageJson.version}-blue)`);
            }
            if (config.badges?.license !== false && (config.license || packageJson.license)) {
                const license = config.license || packageJson.license;
                badges.push(`![License](https://img.shields.io/badge/license-${license}-green)`);
            }
            if (badges.length > 0) {
                sections.push(badges.join(' '));
                sections.push('');
            }
        }
        // Table of Contents
        if (config.includeTOC !== false) {
            sections.push('## Table of Contents');
            sections.push('');
            sections.push('- [Installation](#installation)');
            sections.push('- [Usage](#usage)');
            if (config.includeAPI !== false) {
                sections.push('- [API](#api)');
            }
            if (config.includeContributing) {
                sections.push('- [Contributing](#contributing)');
            }
            sections.push('- [License](#license)');
            sections.push('');
        }
        // Installation
        if (config.includeInstallation !== false) {
            sections.push('## Installation');
            sections.push('');
            sections.push('```bash');
            sections.push(`npm install ${packageJson.name || 'package-name'}`);
            sections.push('```');
            sections.push('');
        }
        // Usage
        if (config.includeUsage !== false) {
            sections.push('## Usage');
            sections.push('');
            sections.push('```typescript');
            sections.push(`import { YourClass } from '${packageJson.name || 'package-name'}';`);
            sections.push('');
            sections.push('// Your usage example here');
            sections.push('```');
            sections.push('');
            warnings.push('Add actual usage examples to the README');
        }
        // API Reference
        if (config.includeAPI !== false) {
            sections.push('## API');
            sections.push('');
            sections.push('### Functions');
            sections.push('');
            sections.push('Documentation for exported functions will be generated here.');
            sections.push('');
        }
        // Contributing
        if (config.includeContributing) {
            sections.push('## Contributing');
            sections.push('');
            sections.push('Contributions are welcome! Please feel free to submit a Pull Request.');
            sections.push('');
        }
        // License
        sections.push('## License');
        sections.push('');
        sections.push(`This project is licensed under the ${config.license || packageJson.license || 'MIT'} License.`);
        sections.push('');
        return {
            content: sections.join('\n'),
            filePath: path.join(projectPath, 'README.md'),
            format: 'markdown',
            metadata: {
                generatedAt: new Date().toISOString(),
                filesProcessed: 1,
                itemsDocumented: sections.length,
                warnings,
            },
        };
    }
    catch (error) {
        if (error instanceof DocError) {
            throw error;
        }
        throw new DocError('Failed to generate README', 'README_GENERATION_FAILED', error);
    }
}
/**
 * Generate comprehensive API documentation
 * @param projectPath - Path to the project source directory
 * @param config - API documentation configuration
 * @returns Generated API documentation
 * @throws {DocError} If source directory is invalid
 *
 * @example
 * ```typescript
 * const apiDocs = await generateApiDocs('./src', {
 *   groupByCategory: true,
 *   includeTypes: true
 * });
 * console.log(apiDocs.content);
 * ```
 */
export async function generateApiDocs(projectPath, config = {}) {
    try {
        if (!fs.existsSync(projectPath)) {
            throw new DocError('Source path not found', 'PATH_NOT_FOUND', { projectPath });
        }
        const allFunctions = [];
        const allClasses = [];
        const allInterfaces = [];
        let filesProcessed = 0;
        // Recursively find all TypeScript/JavaScript files
        const findSourceFiles = (dir) => {
            const files = [];
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    files.push(...findSourceFiles(fullPath));
                }
                else if (entry.isFile() && /\.(ts|js|tsx|jsx)$/.test(entry.name)) {
                    files.push(fullPath);
                }
            }
            return files;
        };
        const sourceFiles = findSourceFiles(projectPath);
        // Parse all source files
        for (const file of sourceFiles) {
            const { functions, classes, interfaces } = parseSourceFile(file);
            allFunctions.push(...functions);
            allClasses.push(...classes);
            allInterfaces.push(...interfaces);
            filesProcessed++;
        }
        const sections = [];
        sections.push('# API Documentation');
        sections.push('');
        sections.push(`Generated on ${new Date().toLocaleString()}`);
        sections.push('');
        // Table of Contents
        if (config.includeTOC !== false) {
            sections.push('## Table of Contents');
            sections.push('');
            if (allClasses.length > 0)
                sections.push('- [Classes](#classes)');
            if (allInterfaces.length > 0)
                sections.push('- [Interfaces](#interfaces)');
            if (allFunctions.length > 0)
                sections.push('- [Functions](#functions)');
            sections.push('');
        }
        // Classes
        if (config.includeTypes !== false && allClasses.length > 0) {
            sections.push('## Classes');
            sections.push('');
            allClasses.forEach(cls => {
                sections.push(`### ${cls.name}`);
                sections.push('');
                if (cls.description) {
                    sections.push(cls.description);
                    sections.push('');
                }
                if (cls.extends) {
                    sections.push(`**Extends:** \`${cls.extends}\``);
                    sections.push('');
                }
                if (cls.implements && cls.implements.length > 0) {
                    sections.push(`**Implements:** ${cls.implements.map(i => `\`${i}\``).join(', ')}`);
                    sections.push('');
                }
            });
        }
        // Interfaces
        if (config.includeInterfaces !== false && allInterfaces.length > 0) {
            sections.push('## Interfaces');
            sections.push('');
            allInterfaces.forEach(iface => {
                sections.push(`### ${iface.name}`);
                sections.push('');
                if (iface.description) {
                    sections.push(iface.description);
                    sections.push('');
                }
            });
        }
        // Functions
        if (allFunctions.length > 0) {
            sections.push('## Functions');
            sections.push('');
            allFunctions.forEach(func => {
                sections.push(`### ${func.name}`);
                sections.push('');
                if (func.description) {
                    sections.push(func.description);
                    sections.push('');
                }
                if (func.parameters.length > 0) {
                    sections.push('**Parameters:**');
                    sections.push('');
                    func.parameters.forEach(param => {
                        const typeStr = param.type?.raw || 'any';
                        const optionalStr = param.optional ? ' (optional)' : '';
                        sections.push(`- \`${param.name}\` (\`${typeStr}\`)${optionalStr} - ${param.description || 'No description'}`);
                    });
                    sections.push('');
                }
                if (func.returnType) {
                    sections.push(`**Returns:** \`${func.returnType.raw}\``);
                    sections.push('');
                }
            });
        }
        return {
            content: sections.join('\n'),
            filePath: path.join(projectPath, 'API.md'),
            format: 'markdown',
            metadata: {
                generatedAt: new Date().toISOString(),
                filesProcessed,
                itemsDocumented: allFunctions.length + allClasses.length + allInterfaces.length,
                warnings: [],
            },
        };
    }
    catch (error) {
        if (error instanceof DocError) {
            throw error;
        }
        throw new DocError('Failed to generate API documentation', 'API_DOC_GENERATION_FAILED', error);
    }
}
/**
 * Generate changelog from git commit history
 * @param projectPath - Path to the git repository
 * @param config - Changelog generation configuration
 * @returns Generated changelog
 * @throws {DocError} If not a git repository or git command fails
 *
 * @example
 * ```typescript
 * const changelog = await generateChangelog('./', {
 *   conventionalCommits: true,
 *   groupByType: true
 * });
 * fs.writeFileSync('CHANGELOG.md', changelog.content);
 * ```
 */
export async function generateChangelog(projectPath, config = {}) {
    try {
        if (!fs.existsSync(projectPath)) {
            throw new DocError('Project path not found', 'PATH_NOT_FOUND', { projectPath });
        }
        const gitDir = path.join(projectPath, '.git');
        if (!fs.existsSync(gitDir)) {
            throw new DocError('Not a git repository', 'NOT_GIT_REPO', { projectPath });
        }
        // Get git log
        const commitLimit = config.commitLimit || 100;
        const gitLogFormat = '--pretty=format:%H|%h|%s|%b|%an|%ai';
        // Sanitize tag inputs to prevent command injection
        const sanitizeGitRef = (ref) => {
            // Only allow alphanumeric, dots, hyphens, underscores, and slashes (valid git ref characters)
            if (!/^[a-zA-Z0-9._\/-]+$/.test(ref)) {
                throw new DocError('Invalid git reference', 'INVALID_GIT_REF', { ref });
            }
            return ref;
        };
        const gitArgs = ['-C', projectPath, 'log', gitLogFormat, '-n', commitLimit.toString()];
        if (config.fromTag) {
            const fromTag = sanitizeGitRef(config.fromTag);
            const toTag = config.toTag ? sanitizeGitRef(config.toTag) : '';
            gitArgs.push(`${fromTag}..${toTag}`);
        }
        let gitOutput;
        try {
            // Use execFileSync for safer command execution (prevents shell injection)
            gitOutput = execFileSync('git', gitArgs, { encoding: 'utf-8' });
        }
        catch (error) {
            throw new DocError('Git command failed', 'GIT_ERROR', error);
        }
        const commits = gitOutput
            .trim()
            .split('\n')
            .filter(line => line)
            .map(line => {
            const [hash, shortHash, subject, body, author, date] = line.split('|');
            // Parse conventional commit format
            const conventionalMatch = subject.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/);
            const message = conventionalMatch?.[3] || subject;
            // Check for breaking changes
            const breaking = subject.includes('BREAKING CHANGE') || body.includes('BREAKING CHANGE');
            return {
                hash,
                shortHash,
                subject: message,
                body,
                author,
                date,
                breaking,
                references: [], // Would parse from commit message
            };
        });
        // Group commits by type
        const typeMap = {
            feat: 'Features',
            fix: 'Bug Fixes',
            docs: 'Documentation',
            style: 'Styles',
            refactor: 'Code Refactoring',
            perf: 'Performance Improvements',
            test: 'Tests',
            build: 'Build System',
            ci: 'Continuous Integration',
            chore: 'Chores',
            revert: 'Reverts',
            other: 'Other Changes',
            ...config.commitTypes,
        };
        const groups = [];
        const groupedCommits = new Map();
        commits.forEach(commit => {
            const type = commit.subject.match(/^(\w+):/)?.[1] || 'other';
            if (!groupedCommits.has(type)) {
                groupedCommits.set(type, []);
            }
            groupedCommits.get(type).push(commit);
        });
        groupedCommits.forEach((commits, type) => {
            groups.push({
                type,
                title: typeMap[type] || type,
                commits,
            });
        });
        // Build changelog content
        const sections = [];
        sections.push('# Changelog');
        sections.push('');
        sections.push('All notable changes to this project will be documented in this file.');
        sections.push('');
        const entry = {
            version: config.toTag || 'Unreleased',
            date: new Date().toISOString().split('T')[0],
            groups,
        };
        sections.push(`## [${entry.version}] - ${entry.date}`);
        sections.push('');
        groups.forEach(group => {
            sections.push(`### ${group.title}`);
            sections.push('');
            group.commits.forEach(commit => {
                let line = `- ${commit.subject}`;
                if (config.includeAuthors !== false && commit.author) {
                    line += ` (${commit.author})`;
                }
                if (config.linkCommits !== false) {
                    line += ` [\`${commit.shortHash}\`]`;
                }
                sections.push(line);
            });
            sections.push('');
        });
        return {
            content: sections.join('\n'),
            filePath: path.join(projectPath, 'CHANGELOG.md'),
            format: 'markdown',
            metadata: {
                generatedAt: new Date().toISOString(),
                filesProcessed: 1,
                itemsDocumented: commits.length,
                warnings: [],
            },
        };
    }
    catch (error) {
        if (error instanceof DocError) {
            throw error;
        }
        throw new DocError('Failed to generate changelog', 'CHANGELOG_GENERATION_FAILED', error);
    }
}
//# sourceMappingURL=generator.js.map