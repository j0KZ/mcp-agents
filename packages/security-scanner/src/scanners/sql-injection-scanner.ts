/**
 * SQL Injection Scanner Module
 */

import { SecurityFinding, FileScanContext, SeverityLevel, VulnerabilityType, OWASPCategory } from '../types.js';
import { generateFindingId, extractCodeContext } from '../utils.js';
import { CVSS_SCORES, CWE_IDS } from '../constants/security-thresholds.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load patterns from external JSON to avoid CodeQL false positives
const patternsData = JSON.parse(
  readFileSync(join(__dirname, '../patterns/sql-patterns.json'), 'utf-8')
);

const SQL_INJECTION_PATTERNS = patternsData.patterns.map((p: any) => ({
  pattern: new RegExp(p.pattern, 'gi'),
  description: p.description
}));

/**
 * Scan for SQL injection vulnerabilities
 */
export async function scanForSQLInjection(context: FileScanContext): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = [];
  const lines = context.content.split('\n');

  for (const { pattern, description } of SQL_INJECTION_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const matches = line.matchAll(pattern);

      for (const match of matches) {
        const codeContext = extractCodeContext(context.content, i + 1);

        findings.push({
          id: generateFindingId(context.filePath, i + 1, VulnerabilityType.SQL_INJECTION),
          type: VulnerabilityType.SQL_INJECTION,
          severity: SeverityLevel.CRITICAL,
          title: 'Potential SQL Injection Vulnerability',
          description: `${description}. This pattern is vulnerable to SQL injection attacks.`,
          filePath: context.filePath,
          line: i + 1,
          column: match.index,
          codeSnippet: codeContext.issueLine,
          recommendation:
            'Use parameterized queries or prepared statements instead of string concatenation. Example: db.query("SELECT * FROM users WHERE id = ?", [userId])',
          owaspCategory: OWASPCategory.A03_INJECTION,
          cweId: CWE_IDS.SQL_INJECTION,
          cvssScore: CVSS_SCORES.SQL_INJECTION,
          metadata: {
            detectedPattern: description
          }
        });
      }
    }
  }

  return findings;
}
