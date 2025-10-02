/**
 * Core documentation generation logic
 * @module generator
 */
import { JSDocConfig, ReadmeConfig, ApiDocsConfig, ChangelogConfig, DocResult } from './types.js';
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
export declare function generateJSDoc(filePath: string, config?: JSDocConfig): Promise<DocResult>;
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
export declare function generateReadme(projectPath: string, config?: ReadmeConfig): Promise<DocResult>;
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
export declare function generateApiDocs(projectPath: string, config?: ApiDocsConfig): Promise<DocResult>;
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
export declare function generateChangelog(projectPath: string, config?: ChangelogConfig): Promise<DocResult>;
//# sourceMappingURL=generator.d.ts.map