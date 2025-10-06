/**
 * OWASP Top 10 Security Scanner Module
 * Detects common security vulnerabilities from OWASP Top 10
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  SecurityFinding,
  FileScanContext,
  SeverityLevel,
  VulnerabilityType,
  OWASPCategory,
} from '../types.js';
import { DEPENDENCY_LIMITS, CWE_IDS, CVSS_SCORES } from '../constants/security-thresholds.js';
import { generateFindingId, extractCodeContext, isScannerFile } from '../utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Perform OWASP Top 10 security checks
 */
export async function scanOWASP(context: FileScanContext): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = [];
  const lines = context.content.split('\n');

  // Skip scanner's own files to avoid false positives
  if (isScannerFile(context.filePath)) {
    return findings;
  }

  // Load patterns from external JSON to avoid CodeQL false positives
  const cryptoPatternsPath = join(__dirname, '../patterns', 'crypto-patterns.json');
  const cryptoPatternsData = JSON.parse(readFileSync(cryptoPatternsPath, 'utf-8'));

  const weakCryptoPatterns = cryptoPatternsData.weakAlgorithms.map((p: any) => ({
    pattern: new RegExp(p.pattern, 'gi'),
    algo: p.algo,
  }));

  for (const { pattern, algo } of weakCryptoPatterns) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (pattern.test(line)) {
        const codeContext = extractCodeContext(context.content, i + 1);

        findings.push({
          id: generateFindingId(context.filePath, i + 1, VulnerabilityType.WEAK_CRYPTO),
          type: VulnerabilityType.WEAK_CRYPTO,
          severity: SeverityLevel.MEDIUM,
          title: `Weak Cryptographic Algorithm: ${algo}`,
          description: `Usage of ${algo} detected. This algorithm is cryptographically broken and should not be used.`,
          filePath: context.filePath,
          line: i + 1,
          codeSnippet: codeContext.issueLine,
          recommendation:
            'Use strong cryptographic algorithms like SHA-256, SHA-384, or SHA-512 for hashing. Use AES-256-GCM for encryption.',
          owaspCategory: OWASPCategory.A02_CRYPTOGRAPHIC_FAILURES,
          cweId: CWE_IDS.WEAK_CRYPTO,
          metadata: { algorithm: algo },
        });
      }
    }
  }

  // Check for insecure deserialization
  const deserializationPatterns = [
    /pickle\.loads?\(/gi,
    /yaml\.load\(/gi,
    /unserialize\(/gi,
    /JSON\.parse\(.{0,200}?(?:localStorage|sessionStorage|location\.)/gi,
  ];

  for (const pattern of deserializationPatterns) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (pattern.test(line)) {
        const codeContext = extractCodeContext(context.content, i + 1);

        findings.push({
          id: generateFindingId(
            context.filePath,
            i + 1,
            VulnerabilityType.INSECURE_DESERIALIZATION
          ),
          type: VulnerabilityType.INSECURE_DESERIALIZATION,
          severity: SeverityLevel.HIGH,
          title: 'Insecure Deserialization',
          description: 'Deserializing untrusted data can lead to remote code execution.',
          filePath: context.filePath,
          line: i + 1,
          codeSnippet: codeContext.issueLine,
          recommendation:
            'Validate and sanitize data before deserialization. Use safe deserialization methods or implement integrity checks.',
          owaspCategory: OWASPCategory.A08_DATA_INTEGRITY_FAILURES,
          cweId: CWE_IDS.INSECURE_DESERIALIZATION,
          cvssScore: CVSS_SCORES.INSECURE_DESERIALIZATION,
        });
      }
    }
  }

  // Check for path traversal vulnerabilities
  const pathTraversalPattern =
    /(?:readFile|writeFile|open|unlink|rmdir|mkdir|stat)\s?\(.{0,200}?(?:\+|concat|\$\{)/gi;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (pathTraversalPattern.test(line)) {
      const codeContext = extractCodeContext(context.content, i + 1);

      findings.push({
        id: generateFindingId(context.filePath, i + 1, VulnerabilityType.PATH_TRAVERSAL),
        type: VulnerabilityType.PATH_TRAVERSAL,
        severity: SeverityLevel.HIGH,
        title: 'Potential Path Traversal Vulnerability',
        description:
          'File path operations with user input can allow attackers to access unauthorized files.',
        filePath: context.filePath,
        line: i + 1,
        codeSnippet: codeContext.issueLine,
        recommendation:
          'Validate and sanitize file paths. Use path.join() and check that resolved paths stay within allowed directories.',
        owaspCategory: OWASPCategory.A01_BROKEN_ACCESS_CONTROL,
        cweId: CWE_IDS.PATH_TRAVERSAL,
        cvssScore: DEPENDENCY_LIMITS.DEFAULT_CVSS,
      });
    }
  }

  return findings;
}
