/**
 * Security Scanner Core Implementation
 * Comprehensive security vulnerability detection engine
 */
import { SecurityFinding, ScanResult, ScanConfig, SecretPattern, DependencyVulnerability, FileScanContext } from './types.js';
/**
 * Scan file content for hardcoded secrets and credentials
 */
export declare function scanForSecrets(context: FileScanContext, customPatterns?: SecretPattern[]): Promise<SecurityFinding[]>;
/**
 * Scan for SQL injection vulnerabilities
 * Delegates to the SQL injection scanner module
 */
export declare function scanForSQLInjection(context: FileScanContext): Promise<SecurityFinding[]>;
/**
 * Scan for Cross-Site Scripting (XSS) vulnerabilities
 * Delegates to the XSS scanner module
 */
export declare function scanForXSS(context: FileScanContext): Promise<SecurityFinding[]>;
/**
 * Perform OWASP Top 10 security checks
 */
export declare function scanOWASP(context: FileScanContext): Promise<SecurityFinding[]>;
/**
 * Scan package.json for vulnerable dependencies
 */
export declare function scanDependencies(projectPath: string): Promise<DependencyVulnerability[]>;
/**
 * Scan a single file for all vulnerability types
 */
export declare function scanFile(filePath: string, config?: ScanConfig): Promise<SecurityFinding[]>;
/**
 * Recursively scan a project directory
 */
export declare function scanProject(projectPath: string, config?: ScanConfig): Promise<ScanResult>;
//# sourceMappingURL=scanner.d.ts.map