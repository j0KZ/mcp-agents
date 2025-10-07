/**
 * README.md section builders
 */

import { ReadmeConfig } from '../types.js';

/**
 * Build README title section
 */
export function buildTitleSection(projectName: string, packageJson: any, config: ReadmeConfig): string[] {
  const sections: string[] = [];
  sections.push(`# ${config.projectName || packageJson.name || projectName || 'Project'}`);
  sections.push('');

  if (packageJson.description) {
    sections.push(packageJson.description);
    sections.push('');
  }

  return sections;
}

/**
 * Build badges section
 */
export function buildBadgesSection(packageJson: any, config: ReadmeConfig): string[] {
  const sections: string[] = [];

  if (config.includeBadges === false) {
    return sections;
  }

  const badges: string[] = [];

  if (config.badges?.version !== false && packageJson.version) {
    badges.push(`![Version](https://img.shields.io/badge/version-${packageJson.version}-blue)`);
  }

  if (config.badges?.license !== false && (config.license || packageJson.license)) {
    badges.push(
      `![License](https://img.shields.io/badge/license-${config.license || packageJson.license}-green)`
    );
  }

  if (badges.length > 0) {
    sections.push(badges.join(' '));
    sections.push('');
  }

  return sections;
}

/**
 * Build table of contents section
 */
export function buildTOCSection(config: ReadmeConfig): string[] {
  const sections: string[] = [];

  if (!config.includeTOC) {
    return sections;
  }

  sections.push('## Table of Contents');
  sections.push('');
  sections.push('- [Installation](#installation)');
  sections.push('- [Usage](#usage)');
  if (config.includeAPI) sections.push('- [API](#api)');
  if (config.includeContributing) sections.push('- [Contributing](#contributing)');
  sections.push('');

  return sections;
}

/**
 * Build installation section
 */
export function buildInstallationSection(packageJson: any, config: ReadmeConfig): string[] {
  const sections: string[] = [];

  if (config.includeInstallation === false) {
    return sections;
  }

  sections.push('## Installation');
  sections.push('');
  sections.push('```bash');
  sections.push(`npm install ${packageJson.name || 'package-name'}`);
  sections.push('```');
  sections.push('');

  return sections;
}

/**
 * Build usage section
 */
export function buildUsageSection(packageJson: any, config: ReadmeConfig): string[] {
  const sections: string[] = [];

  if (config.includeUsage === false) {
    return sections;
  }

  sections.push('## Usage');
  sections.push('');
  sections.push('```javascript');
  sections.push(
    `const ${packageJson.name?.replace(/[@/-]/g, '')} = require('${packageJson.name}');`
  );
  sections.push('```');
  sections.push('');

  return sections;
}

/**
 * Build API section
 */
export function buildAPISection(config: ReadmeConfig): string[] {
  const sections: string[] = [];

  if (!config.includeAPI) {
    return sections;
  }

  sections.push('## API');
  sections.push('');
  sections.push('Documentation coming soon...');
  sections.push('');

  return sections;
}

/**
 * Build contributing section
 */
export function buildContributingSection(config: ReadmeConfig): string[] {
  const sections: string[] = [];

  if (!config.includeContributing) {
    return sections;
  }

  sections.push('## Contributing');
  sections.push('');
  sections.push('Contributions are welcome! Please feel free to submit a Pull Request.');
  sections.push('');

  return sections;
}

/**
 * Build license section
 */
export function buildLicenseSection(packageJson: any, config: ReadmeConfig): string[] {
  const sections: string[] = [];

  if (!config.license && !packageJson.license) {
    return sections;
  }

  sections.push('## License');
  sections.push('');
  sections.push(
    `This project is licensed under the ${config.license || packageJson.license} License.`
  );
  sections.push('');

  return sections;
}
