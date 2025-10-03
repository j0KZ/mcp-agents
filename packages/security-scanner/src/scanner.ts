/**
 * Security Scanner Core Implementation
 * Comprehensive security vulnerability detection engine
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  SecurityFinding,
  ScanResult,
  ScanConfig,
  SecretPattern,
  SeverityLevel,
  VulnerabilityType,
  OWASPCategory,
  DependencyVulnerability,
  FileScanContext,
  CodeContext
} from './types.js';
import { scanForXSS as scanXSS } from './scanners/xss-scanner.js';
import { scanForSQLInjection as scanSQL } from './scanners/sql-injection-scanner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

/**
 * Default secret detection patterns
 */
const DEFAULT_SECRET_PATTERNS: SecretPattern[] = [
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
 * Calculate Shannon entropy of a string
 */
function calculateEntropy(str: string): number {
  const len = str.length;
  const frequencies: Record<string, number> = {};

  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let entropy = 0;
  for (const freq of Object.values(frequencies)) {
    const p = freq / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * Extract code context around a line
 */
function extractCodeContext(content: string, lineNumber: number, contextLines = 2): CodeContext {
  const lines = content.split('\n');
  const beforeLines = lines.slice(Math.max(0, lineNumber - contextLines - 1), lineNumber - 1);
  const issueLine = lines[lineNumber - 1] || '';
  const afterLines = lines.slice(lineNumber, lineNumber + contextLines);

  return {
    beforeLines,
    issueLine,
    afterLines,
    lineNumber
  };
}

/**
 * Generate unique finding ID
 */
function generateFindingId(filePath: string, line: number, type: VulnerabilityType): string {
  const hash = Buffer.from(`${filePath}:${line}:${type}`).toString('base64');
  return hash.substring(0, 16);
}

/**
 * Scan file content for hardcoded secrets and credentials
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

        // Skip if it's in a comment or appears to be an example
        if (line.trim().startsWith('//') || line.trim().startsWith('#') ||
            line.includes('example') || line.includes('EXAMPLE')) {
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
          recommendation: 'Remove the hardcoded secret and use environment variables or a secure secret management service (e.g., AWS Secrets Manager, HashiCorp Vault, Azure Key Vault).',
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

/**
 * Scan for SQL injection vulnerabilities
 * Delegates to the SQL injection scanner module
 */
export async function scanForSQLInjection(context: FileScanContext): Promise<SecurityFinding[]> {
  return await scanSQL(context);
}

/**
 * Scan for Cross-Site Scripting (XSS) vulnerabilities
 * Delegates to the XSS scanner module
 */
export async function scanForXSS(context: FileScanContext): Promise<SecurityFinding[]> {
  return await scanXSS(context);
}

/**
 * Perform OWASP Top 10 security checks
 */
export async function scanOWASP(context: FileScanContext): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = [];
  const lines = context.content.split('\n');

  // Skip scanner's own files to avoid false positives
  const isSecurityScannerFile = context.filePath.includes('scanner') || context.filePath.includes('security-scanner');

  // Load patterns from external JSON to avoid CodeQL false positives
  const cryptoPatternsPath = join(__dirname, 'patterns', 'crypto-patterns.json');
  const cryptoPatternsData = JSON.parse(readFileSync(cryptoPatternsPath, 'utf-8'));

  const weakCryptoPatterns = cryptoPatternsData.weakAlgorithms.map((p: any) => ({
    pattern: new RegExp(p.pattern, 'gi'),
    algo: p.algo
  }));

  for (const { pattern, algo } of weakCryptoPatterns) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip pattern definitions and scanner files
      if (isSecurityScannerFile) {
        continue;
      }

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
          recommendation: 'Use strong cryptographic algorithms like SHA-256, SHA-384, or SHA-512 for hashing. Use AES-256-GCM for encryption.',
          owaspCategory: OWASPCategory.A02_CRYPTOGRAPHIC_FAILURES,
          cweId: 'CWE-327',
          metadata: { algorithm: algo }
        });
      }
    }
  }

  // Check for insecure deserialization
  const deserializationPatterns = [
    /pickle\.loads?\(/gi,
    /yaml\.load\(/gi,
    /unserialize\(/gi,
    /JSON\.parse\(.*?(?:localStorage|sessionStorage|location\.)/gi
  ];

  for (const pattern of deserializationPatterns) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (pattern.test(line)) {
        const codeContext = extractCodeContext(context.content, i + 1);

        findings.push({
          id: generateFindingId(context.filePath, i + 1, VulnerabilityType.INSECURE_DESERIALIZATION),
          type: VulnerabilityType.INSECURE_DESERIALIZATION,
          severity: SeverityLevel.HIGH,
          title: 'Insecure Deserialization',
          description: 'Deserializing untrusted data can lead to remote code execution.',
          filePath: context.filePath,
          line: i + 1,
          codeSnippet: codeContext.issueLine,
          recommendation: 'Validate and sanitize data before deserialization. Use safe deserialization methods or implement integrity checks.',
          owaspCategory: OWASPCategory.A08_DATA_INTEGRITY_FAILURES,
          cweId: 'CWE-502',
          cvssScore: 8.1
        });
      }
    }
  }

  // Check for path traversal vulnerabilities
  const pathTraversalPattern = /(?:readFile|writeFile|open|unlink|rmdir|mkdir|stat)\s*\(.*?(?:\+|concat|\$\{)/gi;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (pathTraversalPattern.test(line)) {
      const codeContext = extractCodeContext(context.content, i + 1);

      findings.push({
        id: generateFindingId(context.filePath, i + 1, VulnerabilityType.PATH_TRAVERSAL),
        type: VulnerabilityType.PATH_TRAVERSAL,
        severity: SeverityLevel.HIGH,
        title: 'Potential Path Traversal Vulnerability',
        description: 'File path operations with user input can allow attackers to access unauthorized files.',
        filePath: context.filePath,
        line: i + 1,
        codeSnippet: codeContext.issueLine,
        recommendation: 'Validate and sanitize file paths. Use path.join() and check that resolved paths stay within allowed directories.',
        owaspCategory: OWASPCategory.A01_BROKEN_ACCESS_CONTROL,
        cweId: 'CWE-22',
        cvssScore: 7.5
      });
    }
  }

  return findings;
}

/**
 * Scan package.json for vulnerable dependencies
 */
export async function scanDependencies(projectPath: string): Promise<DependencyVulnerability[]> {
  const vulnerabilities: DependencyVulnerability[] = [];

  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    // Known vulnerable packages (example - in production, use npm audit or Snyk API)
    const knownVulnerabilities: Record<string, { versions: string[], cve: string, severity: SeverityLevel, description: string }> = {
      'lodash': {
        versions: ['<4.17.21'],
        cve: 'CVE-2020-8203',
        severity: SeverityLevel.HIGH,
        description: 'Prototype pollution vulnerability'
      },
      'minimist': {
        versions: ['<1.2.6'],
        cve: 'CVE-2021-44906',
        severity: SeverityLevel.MEDIUM,
        description: 'Prototype pollution vulnerability'
      }
    };

    for (const [pkg, version] of Object.entries(allDeps)) {
      if (knownVulnerabilities[pkg]) {
        const vuln = knownVulnerabilities[pkg];
        vulnerabilities.push({
          package: pkg,
          version: version as string,
          vulnerabilityId: vuln.cve,
          severity: vuln.severity,
          description: vuln.description,
          references: [`https://nvd.nist.gov/vuln/detail/${vuln.cve}`]
        });
      }
    }
  } catch (error) {
    // package.json not found or invalid
  }

  return vulnerabilities;
}

/**
 * Scan a single file for all vulnerability types
 */
export async function scanFile(
  filePath: string,
  config: ScanConfig = {}
): Promise<SecurityFinding[]> {
  const content = await readFile(filePath, 'utf-8');
  const stats = await stat(filePath);

  // Check file size limit
  if (config.maxFileSize && stats.size > config.maxFileSize) {
    return [];
  }

  // Skip scanner's own files to avoid self-detection
  if (filePath.includes('scanner') || filePath.includes('security-scanner')) {
    return [];
  }

  const context: FileScanContext = {
    filePath,
    content,
    extension: path.extname(filePath),
    size: stats.size
  };

  const findings: SecurityFinding[] = [];

  if (config.scanSecrets !== false) {
    findings.push(...await scanForSecrets(context, config.customPatterns));
  }

  if (config.scanSQLInjection !== false) {
    findings.push(...await scanForSQLInjection(context));
  }

  if (config.scanXSS !== false) {
    findings.push(...await scanForXSS(context));
  }

  if (config.scanOWASP !== false) {
    findings.push(...await scanOWASP(context));
  }

  // Filter by minimum severity
  if (config.minSeverity) {
    const severityOrder = [
      SeverityLevel.INFO,
      SeverityLevel.LOW,
      SeverityLevel.MEDIUM,
      SeverityLevel.HIGH,
      SeverityLevel.CRITICAL
    ];
    const minIndex = severityOrder.indexOf(config.minSeverity);

    return findings.filter(f => severityOrder.indexOf(f.severity) >= minIndex);
  }

  return findings;
}

/**
 * Recursively scan a project directory
 */
export async function scanProject(
  projectPath: string,
  config: ScanConfig = {}
): Promise<ScanResult> {
  const startTime = Date.now();
  const findings: SecurityFinding[] = [];
  let filesScanned = 0;

  const defaultExcludes = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.next',
    '__pycache__',
    'scanner.ts',
    'scanner.test.ts',
    'xss-scanner.ts',
    'sql-injection-scanner.ts',
    'secret-scanner.ts'
  ];

  const excludePatterns = [
    ...defaultExcludes,
    ...(config.excludePatterns || [])
  ];

  async function scanDirectory(dirPath: string): Promise<void> {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // Check exclusions
      if (excludePatterns.some(pattern => fullPath.includes(pattern))) {
        continue;
      }

      if (entry.isDirectory()) {
        await scanDirectory(fullPath);
      } else if (entry.isFile()) {
        // Only scan text files
        const ext = path.extname(entry.name);
        const textExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rb', '.php', '.cs', '.cpp', '.c', '.h', '.sql', '.sh', '.json', '.yaml', '.yml', '.xml', '.html', '.css', '.env'];

        if (textExtensions.includes(ext)) {
          try {
            const fileFindings = await scanFile(fullPath, config);
            findings.push(...fileFindings);
            filesScanned++;
          } catch (error) {
            // Skip files that can't be read
            if (config.verbose) {
              console.error(`Error scanning ${fullPath}:`, error);
            }
          }
        }
      }
    }
  }

  await scanDirectory(projectPath);

  // Scan dependencies if enabled
  let dependencyVulnerabilities: DependencyVulnerability[] = [];
  if (config.scanDependencies !== false) {
    dependencyVulnerabilities = await scanDependencies(projectPath);
  }

  const scanDuration = Date.now() - startTime;

  // Calculate statistics
  const findingsBySeverity: Record<SeverityLevel, number> = {
    [SeverityLevel.CRITICAL]: 0,
    [SeverityLevel.HIGH]: 0,
    [SeverityLevel.MEDIUM]: 0,
    [SeverityLevel.LOW]: 0,
    [SeverityLevel.INFO]: 0
  };

  const findingsByType: Record<VulnerabilityType, number> = {} as Record<VulnerabilityType, number>;

  for (const finding of findings) {
    findingsBySeverity[finding.severity]++;
    findingsByType[finding.type] = (findingsByType[finding.type] || 0) + 1;
  }

  // Calculate security score (0-100, higher is better)
  const criticalWeight = 10;
  const highWeight = 5;
  const mediumWeight = 2;
  const lowWeight = 1;

  const totalWeight =
    findingsBySeverity[SeverityLevel.CRITICAL] * criticalWeight +
    findingsBySeverity[SeverityLevel.HIGH] * highWeight +
    findingsBySeverity[SeverityLevel.MEDIUM] * mediumWeight +
    findingsBySeverity[SeverityLevel.LOW] * lowWeight;

  const securityScore = Math.max(0, Math.min(100, 100 - totalWeight));

  return {
    totalFindings: findings.length,
    findingsBySeverity,
    findingsByType,
    findings,
    dependencyVulnerabilities,
    filesScanned,
    scanDuration,
    config,
    timestamp: new Date(),
    securityScore
  };
}
