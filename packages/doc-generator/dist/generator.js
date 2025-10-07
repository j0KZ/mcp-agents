/**
 * Core documentation generation logic
 * @module generator
 */
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { DocError } from './types.js';
// Import extracted modules
import { parseSourceFile } from './parsers/source-parser.js';
import { generateJSDoc } from './generators/jsdoc-generator.js';
import { GIT_LIMITS } from './constants/doc-limits.js';
import { findSourceFiles } from './helpers/file-helpers.js';
import { groupCommitsByType, buildChangelogSections } from './helpers/changelog-builder.js';
import { buildTitleSection, buildBadgesSection, buildTOCSection, buildInstallationSection, buildUsageSection, buildAPISection, buildContributingSection, buildLicenseSection, } from './helpers/readme-builder.js';
// Re-export for backward compatibility
export { generateJSDoc };
/**
 * Generate README.md from source code
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
        // Build all sections using helper functions
        sections.push(...buildTitleSection(projectPath, packageJson, config));
        sections.push(...buildBadgesSection(packageJson, config));
        sections.push(...buildTOCSection(config));
        sections.push(...buildInstallationSection(packageJson, config));
        sections.push(...buildUsageSection(packageJson, config));
        sections.push(...buildAPISection(config));
        sections.push(...buildContributingSection(config));
        sections.push(...buildLicenseSection(packageJson, config));
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
 * Generate API documentation from source files
 */
export async function generateApiDocs(projectPath, _config = {}) {
    try {
        if (!fs.existsSync(projectPath)) {
            throw new DocError('Project path not found', 'PATH_NOT_FOUND', { projectPath });
        }
        const sourceFiles = findSourceFiles(projectPath);
        const sections = [];
        const warnings = [];
        let itemsDocumented = 0;
        sections.push('# API Documentation');
        sections.push('');
        for (const filePath of sourceFiles) {
            const { functions, classes, interfaces } = parseSourceFile(filePath);
            if (functions.length === 0 && classes.length === 0 && interfaces.length === 0) {
                continue;
            }
            const relativePath = path.relative(projectPath, filePath);
            sections.push(`## ${relativePath}`);
            sections.push('');
            // Document functions
            functions
                .filter(f => f.isExported)
                .forEach(func => {
                sections.push(`### ${func.name}()`);
                sections.push('');
                if (func.parameters.length > 0) {
                    sections.push('**Parameters:**');
                    sections.push('');
                    func.parameters.forEach(param => {
                        const typeStr = param.type?.raw || 'any';
                        const optionalStr = param.optional ? ' (optional)' : '';
                        sections.push(`- \`${param.name}\` (\`${typeStr}\`)${optionalStr}`);
                    });
                    sections.push('');
                }
                if (func.returnType) {
                    sections.push(`**Returns:** \`${func.returnType.raw}\``);
                    sections.push('');
                }
                itemsDocumented++;
            });
            // Document classes
            classes
                .filter(c => c.isExported)
                .forEach(cls => {
                sections.push(`### ${cls.name}`);
                sections.push('');
                if (cls.extends) {
                    sections.push(`Extends: \`${cls.extends}\``);
                    sections.push('');
                }
                itemsDocumented++;
            });
        }
        return {
            content: sections.join('\n'),
            filePath: path.join(projectPath, 'API.md'),
            format: 'markdown',
            metadata: {
                generatedAt: new Date().toISOString(),
                filesProcessed: sourceFiles.length,
                itemsDocumented,
                warnings,
            },
        };
    }
    catch (error) {
        if (error instanceof DocError) {
            throw error;
        }
        throw new DocError('Failed to generate API documentation', 'API_DOCS_GENERATION_FAILED', error);
    }
}
/**
 * Generate changelog from git history
 */
export async function generateChangelog(projectPath, config = {}) {
    try {
        if (!fs.existsSync(path.join(projectPath, '.git'))) {
            throw new DocError('Not a git repository', 'NOT_GIT_REPO', { projectPath });
        }
        const sections = [];
        const warnings = [];
        sections.push('# Changelog');
        sections.push('');
        try {
            const commitLimit = config.commitLimit || GIT_LIMITS.DEFAULT_COMMIT_LIMIT;
            const gitArgs = ['log', `--max-count=${commitLimit}`, '--pretty=format:%H|%s|%an|%ai'];
            const output = execFileSync('git', gitArgs, {
                cwd: projectPath,
                encoding: 'utf-8',
                maxBuffer: GIT_LIMITS.MAX_GIT_BUFFER,
            });
            const commits = output
                .trim()
                .split('\n')
                .filter(line => line);
            const grouped = groupCommitsByType(commits);
            const changelogSections = buildChangelogSections(grouped);
            sections.push(...changelogSections);
        }
        catch {
            warnings.push('Failed to read git history');
        }
        return {
            content: sections.join('\n'),
            filePath: path.join(projectPath, 'CHANGELOG.md'),
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
        throw new DocError('Failed to generate changelog', 'CHANGELOG_GENERATION_FAILED', error);
    }
}
//# sourceMappingURL=generator.js.map