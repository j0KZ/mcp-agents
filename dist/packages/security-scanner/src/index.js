/**
 * Security Scanner - Public API
 * Production-ready security vulnerability detection for source code
 */
export { 
// Core scanning functions
scanFile, scanProject, scanForSecrets, scanForSQLInjection, scanForXSS, scanOWASP, scanDependencies } from './scanner.js';
export { 
// Enums
SeverityLevel, VulnerabilityType, OWASPCategory } from './types.js';
// Version
export const VERSION = '1.0.0';
//# sourceMappingURL=index.js.map