/**
 * Core documentation generation logic
 * @module generator
 */
import { ReadmeConfig, ApiDocsConfig, ChangelogConfig, DocResult } from './types.js';
import { generateJSDoc } from './generators/jsdoc-generator.js';
export { generateJSDoc };
/**
 * Generate README.md from source code
 */
export declare function generateReadme(projectPath: string, config?: ReadmeConfig): Promise<DocResult>;
/**
 * Generate API documentation from source files
 */
export declare function generateApiDocs(projectPath: string, _config?: ApiDocsConfig): Promise<DocResult>;
/**
 * Generate changelog from git history
 */
export declare function generateChangelog(projectPath: string, config?: ChangelogConfig): Promise<DocResult>;
//# sourceMappingURL=generator.d.ts.map