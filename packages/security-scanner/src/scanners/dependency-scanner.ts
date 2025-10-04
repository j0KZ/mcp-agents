/**
 * Dependency Vulnerability Scanner Module
 * Scans package.json for known vulnerable dependencies
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as semver from 'semver';
import { DependencyVulnerability, SeverityLevel } from '../types.js';

const readFile = promisify(fs.readFile);

/**
 * Scan package.json for vulnerable dependencies
 */
export async function scanDependencies(projectPath: string): Promise<DependencyVulnerability[]> {
  const vulnerabilities: DependencyVulnerability[] = [];

  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

    // Use nullish coalescing to prevent TypeError when dependencies are undefined
    const allDeps = {
      ...(packageJson.dependencies ?? {}),
      ...(packageJson.devDependencies ?? {})
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

    // Check each dependency against known vulnerabilities using semver
    for (const [pkg, version] of Object.entries(allDeps)) {
      if (knownVulnerabilities[pkg]) {
        const vuln = knownVulnerabilities[pkg];

        // Check if installed version matches any vulnerable version range
        const isVulnerable = vuln.versions.some(range => {
          try {
            return semver.satisfies(version as string, range);
          } catch (error) {
            // If version parsing fails, report as potentially vulnerable
            return true;
          }
        });

        if (isVulnerable) {
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
    }
  } catch (error) {
    // package.json not found or invalid
  }

  return vulnerabilities;
}
