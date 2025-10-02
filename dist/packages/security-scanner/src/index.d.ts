/**
 * Security Scanner - Public API
 * Production-ready security vulnerability detection for source code
 */
export { scanFile, scanProject, scanForSecrets, scanForSQLInjection, scanForXSS, scanOWASP, scanDependencies } from './scanner.js';
export { SecurityFinding, ScanResult, ScanConfig, SecretPattern, DependencyVulnerability, FileScanContext, CodeContext, SecurityReport, SeverityLevel, VulnerabilityType, OWASPCategory } from './types.js';
export declare const VERSION = "1.0.0";
//# sourceMappingURL=index.d.ts.map