/**
 * SQL Injection Scanner Module
 */

import { SecurityFinding, FileScanContext, SeverityLevel, VulnerabilityType, OWASPCategory } from '../types.js';
import { generateFindingId, extractCodeContext } from '../utils.js';

const CVSS_SCORE_SQL_INJECTION = 9.8;

const SQL_INJECTION_PATTERNS = [
  {
    pattern: /(?:execute|exec|query|sql)\s*\(\s*['""`].*?\$\{.*?\}.*?['""`]\s*\)/gi,
    description: 'String interpolation in SQL query'
  },
  {
    pattern: /(?:execute|exec|query|sql)\s*\(\s*.*?\+.*?\)/gi,
    description: 'String concatenation in SQL query'
  },
  {
    pattern: /SELECT\s+.*?\s+FROM\s+.*?\s+WHERE\s+.*?\+/gi,
    description: 'Direct SQL concatenation detected'
  },
  {
    pattern: /INSERT\s+INTO\s+.*?\s+VALUES\s*\(.*?\+/gi,
    description: 'SQL INSERT with concatenation'
  }
];

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
          cweId: 'CWE-89',
          cvssScore: CVSS_SCORE_SQL_INJECTION,
          metadata: {
            detectedPattern: description
          }
        });
      }
    }
  }

  return findings;
}
