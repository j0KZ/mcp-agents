/**
 * XSS (Cross-Site Scripting) Scanner Module
 */

import { SecurityFinding, FileScanContext, SeverityLevel, VulnerabilityType, OWASPCategory } from '../types.js';
import { generateFindingId, extractCodeContext, isScannerFile, shouldSkipXSSLine } from '../utils.js';
import { CVSS_SCORES, CWE_IDS } from '../constants/security-thresholds.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load patterns from external JSON to avoid CodeQL false positives
const patternsData = JSON.parse(
  readFileSync(join(__dirname, '../patterns/xss-patterns.json'), 'utf-8')
);

const XSS_PATTERNS = patternsData.patterns.map((p: any) => ({
  pattern: new RegExp(p.pattern, 'gi'),
  description: p.description
}));

/**
 * Scan for Cross-Site Scripting (XSS) vulnerabilities
 */
export async function scanForXSS(context: FileScanContext): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = [];
  const lines = context.content.split('\n');

  // Skip scanner's own files to avoid false positives
  if (isScannerFile(context.filePath)) {
    return findings;
  }

  for (const { pattern, description } of XSS_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip pattern definitions, comments, and test strings
      if (shouldSkipXSSLine(line)) {
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
          cweId: CWE_IDS.XSS,
          cvssScore: CVSS_SCORES.XSS,
          metadata: {
            detectedPattern: description
          }
        });
      }
    }
  }

  return findings;
}
