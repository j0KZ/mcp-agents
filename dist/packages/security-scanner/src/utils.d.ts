/**
 * Security Scanner Utility Functions
 */
import { VulnerabilityType, CodeContext } from './types.js';
/**
 * Generate unique finding ID
 */
export declare function generateFindingId(filePath: string, line: number, type: VulnerabilityType): string;
/**
 * Extract code context around issue
 */
export declare function extractCodeContext(content: string, lineNumber: number): CodeContext;
/**
 * Calculate Shannon entropy for string
 */
export declare function calculateEntropy(str: string): number;
/**
 * Check if file should be scanned
 */
export declare function shouldScanFile(filePath: string, excludePatterns: string[]): boolean;
//# sourceMappingURL=utils.d.ts.map