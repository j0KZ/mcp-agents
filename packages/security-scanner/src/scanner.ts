/**
 * Security Scanner Core Implementation
 * Comprehensive security vulnerability detection engine
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { AnalysisCache, generateHash } from '@j0kz/shared';
import {
  SecurityFinding,
  ScanResult,
  ScanConfig,
  SeverityLevel,
  VulnerabilityType,
  DependencyVulnerability,
  FileScanContext,
} from './types.js';
import { scanForXSS as scanXSS } from './scanners/xss-scanner.js';
import { scanForSQLInjection as scanSQL } from './scanners/sql-injection-scanner.js';
import { scanForSecrets } from './scanners/secret-scanner.js';
import { scanOWASP as scanOWASPModule } from './scanners/owasp-scanner.js';
import { scanDependencies as scanDepsModule } from './scanners/dependency-scanner.js';
import { SEVERITY_WEIGHTS, SECURITY_SCORE } from './constants/security-thresholds.js';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Global cache instance for security scans
const scanCache = new AnalysisCache(300, 1800000); // 300 items, 30 min TTL

// Re-export scanner functions for backward compatibility
export { scanForSecrets } from './scanners/secret-scanner.js';

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
 * Delegates to the OWASP scanner module
 */
export async function scanOWASP(context: FileScanContext): Promise<SecurityFinding[]> {
  return await scanOWASPModule(context);
}

/**
 * Scan package.json for vulnerable dependencies
 * Delegates to the dependency scanner module
 */
export async function scanDependencies(projectPath: string): Promise<DependencyVulnerability[]> {
  return await scanDepsModule(projectPath);
}

/**
 * Scan a single file for all vulnerability types
 */
export async function scanFile(
  filePath: string,
  config: ScanConfig = {}
): Promise<SecurityFinding[]> {
  const content = await readFile(filePath, 'utf-8');
  const contentHash = generateHash(content);

  // Check cache
  const configKey = JSON.stringify(config);
  const cached = scanCache.get(filePath, 'security-scan', contentHash, configKey);
  if (cached) {
    return cached as SecurityFinding[];
  }

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
    size: stats.size,
  };

  const findings: SecurityFinding[] = [];

  if (config.scanSecrets !== false) {
    findings.push(...(await scanForSecrets(context, config.customPatterns)));
  }

  if (config.scanSQLInjection !== false) {
    findings.push(...(await scanForSQLInjection(context)));
  }

  if (config.scanXSS !== false) {
    findings.push(...(await scanForXSS(context)));
  }

  if (config.scanOWASP !== false) {
    findings.push(...(await scanOWASP(context)));
  }

  // Filter by minimum severity
  let result = findings;
  if (config.minSeverity) {
    const severityOrder = [
      SeverityLevel.INFO,
      SeverityLevel.LOW,
      SeverityLevel.MEDIUM,
      SeverityLevel.HIGH,
      SeverityLevel.CRITICAL,
    ];
    const minIndex = severityOrder.indexOf(config.minSeverity);

    result = findings.filter(f => severityOrder.indexOf(f.severity) >= minIndex);
  }

  // Cache the result
  scanCache.set(filePath, 'security-scan', contentHash, result, configKey);

  return result;
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
    'secret-scanner.ts',
  ];

  const excludePatterns = [...defaultExcludes, ...(config.excludePatterns || [])];

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
        const textExtensions = [
          '.js',
          '.ts',
          '.jsx',
          '.tsx',
          '.py',
          '.java',
          '.go',
          '.rb',
          '.php',
          '.cs',
          '.cpp',
          '.c',
          '.h',
          '.sql',
          '.sh',
          '.json',
          '.yaml',
          '.yml',
          '.xml',
          '.html',
          '.css',
          '.env',
        ];

        if (textExtensions.includes(ext)) {
          try {
            const fileFindings = await scanFile(fullPath, config);
            findings.push(...fileFindings);
            filesScanned++;
          } catch (error) {
            // Skip files that can't be read
            if (config.verbose) {
              // Sanitize path to prevent log injection
              const safePath = String(fullPath)
                .replace(/[\r\n]/g, '')
                .substring(0, 500);
              console.error(
                `Error scanning ${safePath}:`,
                error instanceof Error ? error.message : String(error)
              );
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
    [SeverityLevel.INFO]: 0,
  };

  const findingsByType: Record<VulnerabilityType, number> = {} as Record<VulnerabilityType, number>;

  for (const finding of findings) {
    findingsBySeverity[finding.severity]++;
    findingsByType[finding.type] = (findingsByType[finding.type] || 0) + 1;
  }

  // Calculate security score (0-100, higher is better)
  const totalWeight =
    findingsBySeverity[SeverityLevel.CRITICAL] * SEVERITY_WEIGHTS.CRITICAL +
    findingsBySeverity[SeverityLevel.HIGH] * SEVERITY_WEIGHTS.HIGH +
    findingsBySeverity[SeverityLevel.MEDIUM] * SEVERITY_WEIGHTS.MEDIUM +
    findingsBySeverity[SeverityLevel.LOW] * SEVERITY_WEIGHTS.LOW +
    findingsBySeverity[SeverityLevel.INFO] * SEVERITY_WEIGHTS.INFO;

  const securityScore = Math.max(
    SECURITY_SCORE.MIN,
    Math.min(SECURITY_SCORE.MAX, SECURITY_SCORE.MAX - totalWeight)
  );

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
    securityScore,
  };
}
