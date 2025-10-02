/**
 * XSS (Cross-Site Scripting) Scanner Module
 */

import { SecurityFinding, FileScanContext, SeverityLevel, VulnerabilityType, OWASPCategory } from '../types.js';
import { generateFindingId, extractCodeContext } from '../utils.js';

const CVSS_SCORE_XSS = 7.5;

const XSS_PATTERNS = [
  {
    pattern: /eval\s*\(/gi,
    description: 'eval() usage (potential code injection)'
  },
  {
    pattern: /dangerouslySetInnerHTML/gi,
    description: 'React dangerouslySetInnerHTML usage'
  },
  {
    pattern: /v-html\s*=/gi,
    description: 'Vue v-html directive (potential XSS)'
  },
  {
    pattern: /\.innerHTML\s*=/gi,
    description: 'Direct innerHTML manipulation'
  },
  {
    pattern: /document\.write\s*\(/gi,
    description: 'document.write() usage'
  }
];

/**
 * Scan for Cross-Site Scripting (XSS) vulnerabilities
 */
export async function scanForXSS(context: FileScanContext): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = [];
  const lines = context.content.split('\n');

  // Skip scanner's own files to avoid false positives
  if (context.filePath.includes('scanner') || context.filePath.includes('security-scanner')) {
    return findings;
  }

  for (const { pattern, description } of XSS_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip pattern definitions, comments, and test strings
      if (
        line.includes('pattern:') ||
        line.includes('description:') ||
        line.trim().startsWith('//') ||
        line.trim().startsWith('*') ||
        line.includes('const dangerousCode')
      ) {
        continue;
      }

      const matches = line.matchAll(pattern);

      for (const match of matches) {
        const codeContext = extractCodeContext(context.content, i + 1);

        findings.push({
          id: generateFindingId(context.filePath, i + 1, VulnerabilityType.XSS),
          type: VulnerabilityType.XSS,
          severity: SeverityLevel.HIGH,
          title: 'Potential Cross-Site Scripting (XSS) Vulnerability',
          description: `${description}. This can allow attackers to inject malicious scripts.`,
          filePath: context.filePath,
          line: i + 1,
          column: match.index,
          codeSnippet: codeContext.issueLine,
          recommendation:
            'Sanitize user input before rendering. Use textContent instead of innerHTML, or use a sanitization library like DOMPurify.',
          owaspCategory: OWASPCategory.A03_INJECTION,
          cweId: 'CWE-79',
          cvssScore: CVSS_SCORE_XSS,
          metadata: {
            detectedPattern: description
          }
        });
      }
    }
  }

  return findings;
}
