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
                badges.push(`![License](https://img.shields.io/badge/license-${config.license || packageJson.license}-green)`);
            }
            if (badges.length > 0) {
                sections.push(badges.join(' '));
                sections.push('');
            }
        }
        // Table of Contents
        if (config.includeTOC) {
            sections.push('## Table of Contents');
            sections.push('');
            sections.push('- [Installation](#installation)');
            sections.push('- [Usage](#usage)');
            if (config.includeAPI)
                sections.push('- [API](#api)');
            if (config.includeContributing)
                sections.push('- [Contributing](#contributing)');
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
            sections.push('```javascript');
            sections.push(`const ${packageJson.name?.replace(/[@\/\-]/g, '')} = require('${packageJson.name}');`);
            sections.push('```');
            sections.push('');
        }
        // API Reference
        if (config.includeAPI) {
            sections.push('## API');
            sections.push('');
            sections.push('Documentation coming soon...');
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
        if (config.license || packageJson.license) {
            sections.push('## License');
            sections.push('');
            sections.push(`This project is licensed under the ${config.license || packageJson.license} License.`);
            sections.push('');
        }
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
            const commitLimit = config.commitLimit || 100;
            const gitArgs = ['log', `--max-count=${commitLimit}`, '--pretty=format:%H|%s|%an|%ai'];
            const output = execFileSync('git', gitArgs, {
                cwd: projectPath,
                encoding: 'utf-8',
                maxBuffer: 10 * 1024 * 1024,
            });
            const commits = output
                .trim()
                .split('\n')
                .filter(line => line);
            const grouped = {
                feat: [],
                fix: [],
                docs: [],
                other: [],
            };
            commits.forEach(line => {
                const [hash, message] = line.split('|');
                const shortHash = hash.substring(0, 7);
                if (message.startsWith('feat:')) {
                    grouped.feat.push(`- ${message.replace('feat:', '').trim()} (\`${shortHash}\`)`);
                }
                else if (message.startsWith('fix:')) {
                    grouped.fix.push(`- ${message.replace('fix:', '').trim()} (\`${shortHash}\`)`);
                }
                else if (message.startsWith('docs:')) {
                    grouped.docs.push(`- ${message.replace('docs:', '').trim()} (\`${shortHash}\`)`);
                }
                else {
                    grouped.other.push(`- ${message} (\`${shortHash}\`)`);
                }
            });
            if (grouped.feat.length > 0) {
                sections.push('## Features');
                sections.push('');
                sections.push(...grouped.feat);
                sections.push('');
            }
            if (grouped.fix.length > 0) {
                sections.push('## Bug Fixes');
                sections.push('');
                sections.push(...grouped.fix);
                sections.push('');
            }
            if (grouped.docs.length > 0) {
                sections.push('## Documentation');
                sections.push('');
                sections.push(...grouped.docs);
                sections.push('');
            }
            if (grouped.other.length > 0) {
                sections.push('## Other Changes');
                sections.push('');
                sections.push(...grouped.other);
                sections.push('');
            }
        }
        catch (error) {
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
// Helper functions
function findSourceFiles(dirPath, fileList = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
                findSourceFiles(filePath, fileList);
            }
        }
        else if (file.match(/\.(ts|js|tsx|jsx)$/) && !file.match(/\.test\.|\.spec\./)) {
            fileList.push(filePath);
        }
    });
    return fileList;
}
//# sourceMappingURL=generator.js.map