/**
 * Tests for readme-builder
 */

import { describe, it, expect } from 'vitest';
import {
  buildTitleSection,
  buildBadgesSection,
  buildTOCSection,
  buildInstallationSection,
  buildUsageSection,
  buildAPISection,
  buildContributingSection,
  buildLicenseSection,
} from '../src/helpers/readme-builder.js';
import type { ReadmeConfig } from '../src/types.js';

describe('buildTitleSection', () => {
  it('should build title from config.projectName', () => {
    const config: ReadmeConfig = { projectName: 'My Project' };
    const result = buildTitleSection('project', {}, config);

    expect(result).toContain('# My Project');
  });

  it('should fallback to packageJson.name', () => {
    const config: ReadmeConfig = {};
    const result = buildTitleSection('project', { name: 'pkg-name' }, config);

    expect(result).toContain('# pkg-name');
  });

  it('should fallback to projectName parameter', () => {
    const config: ReadmeConfig = {};
    const result = buildTitleSection('fallback-project', {}, config);

    expect(result).toContain('# fallback-project');
  });

  it('should fallback to "Project" when all else empty', () => {
    const config: ReadmeConfig = {};
    const result = buildTitleSection('', {}, config);

    expect(result).toContain('# Project');
  });

  it('should include description when present', () => {
    const config: ReadmeConfig = {};
    const result = buildTitleSection('test', { description: 'A test project' }, config);

    expect(result).toContain('A test project');
  });

  it('should not include description when absent', () => {
    const config: ReadmeConfig = {};
    const result = buildTitleSection('test', {}, config);

    expect(result.filter(s => s !== '')).toHaveLength(1);
  });
});

describe('buildBadgesSection', () => {
  it('should include version badge when present', () => {
    const config: ReadmeConfig = {};
    const result = buildBadgesSection({ version: '1.0.0' }, config);

    expect(result.join('')).toContain('version-1.0.0');
  });

  it('should include license badge from config', () => {
    const config: ReadmeConfig = { license: 'MIT' };
    const result = buildBadgesSection({}, config);

    expect(result.join('')).toContain('license-MIT');
  });

  it('should include license badge from packageJson', () => {
    const config: ReadmeConfig = {};
    const result = buildBadgesSection({ license: 'Apache-2.0' }, config);

    expect(result.join('')).toContain('license-Apache-2.0');
  });

  it('should return empty array when includeBadges is false', () => {
    const config: ReadmeConfig = { includeBadges: false };
    const result = buildBadgesSection({ version: '1.0.0', license: 'MIT' }, config);

    expect(result).toEqual([]);
  });

  it('should exclude version badge when badges.version is false', () => {
    const config: ReadmeConfig = { badges: { version: false } };
    const result = buildBadgesSection({ version: '1.0.0' }, config);

    expect(result.join('')).not.toContain('version-1.0.0');
  });

  it('should exclude license badge when badges.license is false', () => {
    const config: ReadmeConfig = { badges: { license: false }, license: 'MIT' };
    const result = buildBadgesSection({}, config);

    expect(result.join('')).not.toContain('license-MIT');
  });

  it('should return empty array when no badges to show', () => {
    const config: ReadmeConfig = {};
    const result = buildBadgesSection({}, config);

    expect(result).toEqual([]);
  });
});

describe('buildTOCSection', () => {
  it('should return empty when includeTOC is false', () => {
    const config: ReadmeConfig = { includeTOC: false };
    const result = buildTOCSection(config);

    expect(result).toEqual([]);
  });

  it('should return empty when includeTOC is undefined', () => {
    const config: ReadmeConfig = {};
    const result = buildTOCSection(config);

    expect(result).toEqual([]);
  });

  it('should include basic TOC items', () => {
    const config: ReadmeConfig = { includeTOC: true };
    const result = buildTOCSection(config);

    expect(result.join('\n')).toContain('## Table of Contents');
    expect(result.join('\n')).toContain('Installation');
    expect(result.join('\n')).toContain('Usage');
  });

  it('should include API when includeAPI is true', () => {
    const config: ReadmeConfig = { includeTOC: true, includeAPI: true };
    const result = buildTOCSection(config);

    expect(result.join('\n')).toContain('API');
  });

  it('should include Contributing when includeContributing is true', () => {
    const config: ReadmeConfig = { includeTOC: true, includeContributing: true };
    const result = buildTOCSection(config);

    expect(result.join('\n')).toContain('Contributing');
  });

  it('should not include API when includeAPI is false', () => {
    const config: ReadmeConfig = { includeTOC: true, includeAPI: false };
    const result = buildTOCSection(config);

    expect(result.join('\n')).not.toContain('[API]');
  });
});

describe('buildInstallationSection', () => {
  it('should include npm install command', () => {
    const config: ReadmeConfig = {};
    const result = buildInstallationSection({ name: 'my-package' }, config);

    expect(result.join('\n')).toContain('## Installation');
    expect(result.join('\n')).toContain('npm install my-package');
  });

  it('should use fallback package name', () => {
    const config: ReadmeConfig = {};
    const result = buildInstallationSection({}, config);

    expect(result.join('\n')).toContain('npm install package-name');
  });

  it('should return empty when includeInstallation is false', () => {
    const config: ReadmeConfig = { includeInstallation: false };
    const result = buildInstallationSection({ name: 'pkg' }, config);

    expect(result).toEqual([]);
  });
});

describe('buildUsageSection', () => {
  it('should include require statement', () => {
    const config: ReadmeConfig = {};
    const result = buildUsageSection({ name: 'my-pkg' }, config);

    expect(result.join('\n')).toContain('## Usage');
    expect(result.join('\n')).toContain("require('my-pkg')");
  });

  it('should sanitize package name for variable', () => {
    const config: ReadmeConfig = {};
    const result = buildUsageSection({ name: '@scope/my-pkg' }, config);

    expect(result.join('\n')).toContain('const scopemypkg');
  });

  it('should return empty when includeUsage is false', () => {
    const config: ReadmeConfig = { includeUsage: false };
    const result = buildUsageSection({ name: 'pkg' }, config);

    expect(result).toEqual([]);
  });

  it('should handle undefined name gracefully', () => {
    const config: ReadmeConfig = {};
    const result = buildUsageSection({}, config);

    expect(result.join('\n')).toContain('## Usage');
  });
});

describe('buildAPISection', () => {
  it('should include API heading when includeAPI is true', () => {
    const config: ReadmeConfig = { includeAPI: true };
    const result = buildAPISection(config);

    expect(result.join('\n')).toContain('## API');
    expect(result.join('\n')).toContain('Documentation coming soon...');
  });

  it('should return empty when includeAPI is false', () => {
    const config: ReadmeConfig = { includeAPI: false };
    const result = buildAPISection(config);

    expect(result).toEqual([]);
  });

  it('should return empty when includeAPI is undefined', () => {
    const config: ReadmeConfig = {};
    const result = buildAPISection(config);

    expect(result).toEqual([]);
  });
});

describe('buildContributingSection', () => {
  it('should include contributing section when enabled', () => {
    const config: ReadmeConfig = { includeContributing: true };
    const result = buildContributingSection(config);

    expect(result.join('\n')).toContain('## Contributing');
    expect(result.join('\n')).toContain('Contributions are welcome!');
  });

  it('should return empty when includeContributing is false', () => {
    const config: ReadmeConfig = { includeContributing: false };
    const result = buildContributingSection(config);

    expect(result).toEqual([]);
  });

  it('should return empty when includeContributing is undefined', () => {
    const config: ReadmeConfig = {};
    const result = buildContributingSection(config);

    expect(result).toEqual([]);
  });
});

describe('buildLicenseSection', () => {
  it('should include license from config', () => {
    const config: ReadmeConfig = { license: 'MIT' };
    const result = buildLicenseSection({}, config);

    expect(result.join('\n')).toContain('## License');
    expect(result.join('\n')).toContain('MIT License');
  });

  it('should include license from packageJson', () => {
    const config: ReadmeConfig = {};
    const result = buildLicenseSection({ license: 'Apache-2.0' }, config);

    expect(result.join('\n')).toContain('## License');
    expect(result.join('\n')).toContain('Apache-2.0 License');
  });

  it('should prefer config license over packageJson', () => {
    const config: ReadmeConfig = { license: 'MIT' };
    const result = buildLicenseSection({ license: 'Apache-2.0' }, config);

    expect(result.join('\n')).toContain('MIT License');
    expect(result.join('\n')).not.toContain('Apache-2.0');
  });

  it('should return empty when no license available', () => {
    const config: ReadmeConfig = {};
    const result = buildLicenseSection({}, config);

    expect(result).toEqual([]);
  });
});
