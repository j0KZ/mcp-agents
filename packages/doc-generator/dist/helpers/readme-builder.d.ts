/**
 * README.md section builders
 */
import { ReadmeConfig } from '../types.js';
/**
 * Build README title section
 */
export declare function buildTitleSection(projectName: string, packageJson: any, config: ReadmeConfig): string[];
/**
 * Build badges section
 */
export declare function buildBadgesSection(packageJson: any, config: ReadmeConfig): string[];
/**
 * Build table of contents section
 */
export declare function buildTOCSection(config: ReadmeConfig): string[];
/**
 * Build installation section
 */
export declare function buildInstallationSection(packageJson: any, config: ReadmeConfig): string[];
/**
 * Build usage section
 */
export declare function buildUsageSection(packageJson: any, config: ReadmeConfig): string[];
/**
 * Build API section
 */
export declare function buildAPISection(config: ReadmeConfig): string[];
/**
 * Build contributing section
 */
export declare function buildContributingSection(config: ReadmeConfig): string[];
/**
 * Build license section
 */
export declare function buildLicenseSection(packageJson: any, config: ReadmeConfig): string[];
//# sourceMappingURL=readme-builder.d.ts.map