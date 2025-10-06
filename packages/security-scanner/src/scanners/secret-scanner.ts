/**
 * Secret Detection Scanner Module
 * Detects hardcoded secrets and credentials in source code
 */

import {
  SecurityFinding,
  FileScanContext,
  VulnerabilityType,
  OWASPCategory,
  SecretPattern,
} from '../types.js';
import { DEFAULT_SECRET_PATTERNS } from '../constants/secret-patterns.js';
import { PATTERN_LIMITS, CWE_IDS } from '../constants/security-thresholds.js';
import {
  generateFindingId,
  extractCodeContext,
  calculateEntropy,
  shouldSkipLine,
  truncateSensitive,
} from '../utils.js';

/**
 * Scan for hardcoded secrets and credentials
 */
export async function scanForSecrets(
  context: FileScanContext,
  customPatterns: SecretPattern[] = []
): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = [];
  const patterns = [...DEFAULT_SECRET_PATTERNS, ...customPatterns];
  const lines = context.content.split('\n');

  for (const pattern of patterns) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip comments and examples
      if (shouldSkipLine(line)) {
        continue;
      }

      const matches = line.matchAll(pattern.pattern);

      for (const match of matches) {
        const matchedText = match[0];

        // Check entropy for high-entropy strings (potential secrets)
        if (pattern.entropyThreshold) {
          const entropy = calculateEntropy(matchedText);
          if (entropy < pattern.entropyThreshold) {
            continue;
          }
        }

        const codeContext = extractCodeContext(context.content, i + 1);

        findings.push({
          id: generateFindingId(context.filePath, i + 1, VulnerabilityType.SECRET_EXPOSURE),
          type: VulnerabilityType.SECRET_EXPOSURE,
          severity: pattern.severity,
          title: `${pattern.name} Detected`,
          description: `${pattern.description}. Hardcoded secrets should never be committed to source code.`,
          filePath: context.filePath,
          line: i + 1,
          column: match.index,
          codeSnippet: codeContext.issueLine,
          recommendation:
            'Remove the hardcoded secret and use environment variables or a secure secret management service (e.g., AWS Secrets Manager, HashiCorp Vault, Azure Key Vault).',
          owaspCategory: OWASPCategory.A02_CRYPTOGRAPHIC_FAILURES,
          cweId: CWE_IDS.HARDCODED_CREDENTIALS,
          metadata: {
            patternName: pattern.name,
            matchedText: truncateSensitive(matchedText, PATTERN_LIMITS.SECRET_PREVIEW_LENGTH),
          },
        });
      }
    }
  }

  return findings;
}
