/**
 * Secret Detection Scanner Module
 */
import { SecurityFinding, FileScanContext, SecretPattern } from '../types.js';
export declare const DEFAULT_SECRET_PATTERNS: SecretPattern[];
/**
 * Scan for hardcoded secrets and credentials
 */
export declare function scanForSecrets(context: FileScanContext, customPatterns?: SecretPattern[]): Promise<SecurityFinding[]>;
//# sourceMappingURL=secret-scanner.d.ts.map