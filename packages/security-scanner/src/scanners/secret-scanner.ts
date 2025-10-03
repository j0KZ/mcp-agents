/**
 * Secret Detection Scanner Module
 */

import { SecurityFinding, FileScanContext, SeverityLevel, VulnerabilityType, OWASPCategory, SecretPattern } from '../types.js';
import { generateFindingId, extractCodeContext, calculateEntropy } from '../utils.js';

export const DEFAULT_SECRET_PATTERNS: SecretPattern[] = [
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: SeverityLevel.CRITICAL,
    description: 'AWS Access Key ID detected'
  },
  {
    name: 'AWS Secret Key',
    pattern: /aws_secret_access_key\s*=\s*['"]?([A-Za-z0-9/+=]{40})['"]?/gi,
    severity: SeverityLevel.CRITICAL,
    description: 'AWS Secret Access Key detected'
  },
  {
    name: 'GitHub Token',
    pattern: /gh[ps]_[a-zA-Z0-9]{36}/g,
    severity: SeverityLevel.CRITICAL,
    description: 'GitHub Personal Access Token detected'
  },
  {
    name: 'Generic API Key',
    pattern: /api[_-]?key\s*[:=]\s*['"]([a-zA-Z0-9_\-]{20,})['"]$/gi,
    severity: SeverityLevel.HIGH,
    description: 'Generic API key detected'
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH)\s+PRIVATE\s+KEY-----/g,
    severity: SeverityLevel.CRITICAL,
    description: 'Private cryptographic key detected'
  },
  {
    name: 'Password in Code',
    pattern: /password\s*[:=]\s*['"]([^'"]{8,})['"]$/gi,
    severity: SeverityLevel.HIGH,
    description: 'Hardcoded password detected'
  },
  {
    name: 'JWT Token',
    pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
    severity: SeverityLevel.HIGH,
    description: 'JWT token detected'
  },
  {
    name: 'Slack Token',
    pattern: /xox[baprs]-[0-9a-zA-Z-]{10,}/g,
    severity: SeverityLevel.CRITICAL,
    description: 'Slack token detected'
  },
  {
    name: 'Connection String',
    pattern: /(mongodb|mysql|postgresql):\/\/[^\s]+/gi,
    severity: SeverityLevel.HIGH,
    description: 'Database connection string detected'
  }
];

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
      const matches = line.matchAll(pattern.pattern);

      for (const match of matches) {
        const matchedText = match[0];

        // Skip false positives
        if (
          line.includes('example') ||
          line.includes('EXAMPLE') ||
          line.includes('test') ||
          line.includes('mock')
        ) {
          continue;
        }

        // Check entropy for high-entropy strings
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
          cweId: 'CWE-798',
          metadata: {
            patternName: pattern.name,
            matchedText: matchedText.substring(0, 20) + '...'
          }
        });
      }
    }
  }

  return findings;
}
