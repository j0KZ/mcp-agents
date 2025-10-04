/**
 * Dependency Vulnerability Scanner Module
 * Scans package.json for known vulnerable dependencies
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
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
    // Note: Version checking would require semver library for production use
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

    // TODO: Implement semver version range checking for production use
    // Currently reports all instances of listed packages regardless of version
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
