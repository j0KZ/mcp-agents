/**
 * Security Scanner Utility Functions
 */

import crypto from 'crypto';
import { VulnerabilityType, CodeContext } from './types.js';
import { FILE_LIMITS, PATTERN_LIMITS } from './constants/security-thresholds.js';

/**
 * Generate unique finding ID
 */
export function generateFindingId(filePath: string, line: number, type: VulnerabilityType): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${filePath}:${line}:${type}`)
    .digest('base64')
    .substring(0, 16)
    .replace(/[+/=]/g, '');
  return hash;
}

/**
 * Extract code context around issue
 */
export function extractCodeContext(
  content: string,
  lineNumber: number,
  contextLines = FILE_LIMITS.CONTEXT_LINES
): CodeContext {
  const lines = content.split('\n');
  const index = lineNumber - 1;

  const beforeLines = lines.slice(Math.max(0, index - contextLines), index);
  const issueLine = lines[index] || '';
  const afterLines = lines.slice(index + 1, Math.min(lines.length, index + contextLines + 1));

  return {
    beforeLines: beforeLines,
    issueLine: issueLine.substring(0, FILE_LIMITS.MAX_LINE_LENGTH),
    afterLines: afterLines,
    lineNumber: lineNumber,
  };
}

/**
 * Calculate Shannon entropy for string
 */
export function calculateEntropy(str: string): number {
  if (!str || str.length === 0) return 0;

  const frequencies: Record<string, number> = {};
  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let entropy = 0;
  const len = str.length;

  for (const freq of Object.values(frequencies)) {
    const probability = freq / len;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}

/**
 * Check if file should be scanned
 */
export function shouldScanFile(filePath: string, excludePatterns: string[]): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');

  for (const pattern of excludePatterns) {
    if (normalizedPath.includes(pattern)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a line should be skipped (comments, examples, etc.)
 */
export function shouldSkipLine(line: string): boolean {
  const trimmed = line.trim();

  // Skip comments
  if (
    trimmed.startsWith('//') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('*')
  ) {
    return true;
  }

  // Skip lines that appear to be examples
  const lowerLine = line.toLowerCase();
  if (
    lowerLine.includes('example') ||
    lowerLine.includes('sample') ||
    lowerLine.includes('test') ||
    lowerLine.includes('todo') ||
    lowerLine.includes('fixme') ||
    lowerLine.includes('mock')
  ) {
    return true;
  }

  return false;
}

/**
 * Truncate sensitive data for display in reports
 */
export function truncateSensitive(
  text: string,
  maxLength = PATTERN_LIMITS.SECRET_PREVIEW_LENGTH
): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

/**
 * Check if a file path belongs to the security scanner itself
 * Used to avoid self-detection of patterns
 */
export function isScannerFile(filePath: string): boolean {
  return filePath.includes('scanner') || filePath.includes('security-scanner');
}

/**
 * Check if a line should be skipped during XSS scanning
 * Skips pattern definitions, comments, and test code
 */
export function shouldSkipXSSLine(line: string): boolean {
  if (
    line.includes('pattern:') ||
    line.includes('description:') ||
    line.trim().startsWith('//') ||
    line.trim().startsWith('*') ||
    line.includes('const dangerousCode')
  ) {
    return true;
  }
  return false;
}
