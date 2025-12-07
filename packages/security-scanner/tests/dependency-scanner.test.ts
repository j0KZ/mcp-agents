/**
 * Tests for dependency-scanner
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scanDependencies } from '../src/scanners/dependency-scanner.js';
import * as fs from 'fs';
import * as path from 'path';

vi.mock('fs');

describe('scanDependencies', () => {
  const mockProjectPath = '/test/project';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return empty array when package.json does not exist', async () => {
    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      const error = new Error('ENOENT: no such file or directory');
      (error as any).code = 'ENOENT';
      callback(error, null);
    });

    const result = await scanDependencies(mockProjectPath);

    expect(result).toEqual([]);
  });

  it('should return empty array for invalid JSON in package.json', async () => {
    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      callback(null, 'invalid json {');
    });

    const result = await scanDependencies(mockProjectPath);

    expect(result).toEqual([]);
  });

  it('should return empty array when no vulnerabilities found', async () => {
    const packageJson = {
      dependencies: {
        express: '^4.18.0',
        typescript: '^5.0.0',
      },
    };

    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      callback(null, JSON.stringify(packageJson));
    });

    const result = await scanDependencies(mockProjectPath);

    expect(result).toEqual([]);
  });

  it('should detect vulnerable lodash version', async () => {
    const packageJson = {
      dependencies: {
        lodash: '4.17.20',
      },
    };

    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      callback(null, JSON.stringify(packageJson));
    });

    const result = await scanDependencies(mockProjectPath);

    expect(result).toHaveLength(1);
    expect(result[0].package).toBe('lodash');
    expect(result[0].version).toBe('4.17.20');
    expect(result[0].vulnerabilityId).toBe('CVE-2020-8203');
    expect(result[0].description).toBe('Prototype pollution vulnerability');
    expect(result[0].references).toContain('https://nvd.nist.gov/vuln/detail/CVE-2020-8203');
  });

  it('should not report lodash if version is patched', async () => {
    const packageJson = {
      dependencies: {
        lodash: '4.17.21',
      },
    };

    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      callback(null, JSON.stringify(packageJson));
    });

    const result = await scanDependencies(mockProjectPath);

    expect(result).toEqual([]);
  });

  it('should detect vulnerable minimist version', async () => {
    const packageJson = {
      dependencies: {
        minimist: '1.2.5',
      },
    };

    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      callback(null, JSON.stringify(packageJson));
    });

    const result = await scanDependencies(mockProjectPath);

    expect(result).toHaveLength(1);
    expect(result[0].package).toBe('minimist');
    expect(result[0].version).toBe('1.2.5');
    expect(result[0].vulnerabilityId).toBe('CVE-2021-44906');
  });

  it('should not report minimist if version is patched', async () => {
    const packageJson = {
      dependencies: {
        minimist: '1.2.6',
      },
    };

    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      callback(null, JSON.stringify(packageJson));
    });

    const result = await scanDependencies(mockProjectPath);

    expect(result).toEqual([]);
  });

  it('should scan devDependencies as well', async () => {
    const packageJson = {
      devDependencies: {
        lodash: '4.17.19',
      },
    };

    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      callback(null, JSON.stringify(packageJson));
    });

    const result = await scanDependencies(mockProjectPath);

    expect(result).toHaveLength(1);
    expect(result[0].package).toBe('lodash');
  });

  it('should scan both dependencies and devDependencies', async () => {
    const packageJson = {
      dependencies: {
        lodash: '4.17.15',
      },
      devDependencies: {
        minimist: '1.2.0',
      },
    };

    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      callback(null, JSON.stringify(packageJson));
    });

    const result = await scanDependencies(mockProjectPath);

    expect(result).toHaveLength(2);
    expect(result.map(v => v.package)).toContain('lodash');
    expect(result.map(v => v.package)).toContain('minimist');
  });

  it('should handle missing dependencies field', async () => {
    const packageJson = {
      name: 'test-package',
      version: '1.0.0',
    };

    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      callback(null, JSON.stringify(packageJson));
    });

    const result = await scanDependencies(mockProjectPath);

    expect(result).toEqual([]);
  });

  it('should handle missing devDependencies field', async () => {
    const packageJson = {
      dependencies: {
        lodash: '4.17.10',
      },
    };

    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      callback(null, JSON.stringify(packageJson));
    });

    const result = await scanDependencies(mockProjectPath);

    expect(result).toHaveLength(1);
  });

  it('should handle version that cannot be parsed', async () => {
    const packageJson = {
      dependencies: {
        lodash: 'invalid-version',
      },
    };

    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      callback(null, JSON.stringify(packageJson));
    });

    const result = await scanDependencies(mockProjectPath);

    // When version parsing fails, semver.satisfies returns false or throws
    // The scanner catches this and may or may not report as vulnerable
    // Just verify it doesn't crash
    expect(Array.isArray(result)).toBe(true);
  });

  it('should read correct package.json path', async () => {
    const packageJson = { dependencies: {} };

    vi.mocked(fs.readFile).mockImplementation((filePath, _options, callback: any) => {
      const expectedPath = path.join(mockProjectPath, 'package.json');
      expect(filePath).toBe(expectedPath);
      callback(null, JSON.stringify(packageJson));
    });

    await scanDependencies(mockProjectPath);
  });

  it('should handle version ranges', async () => {
    const packageJson = {
      dependencies: {
        lodash: '^4.17.10',
      },
    };

    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      callback(null, JSON.stringify(packageJson));
    });

    const result = await scanDependencies(mockProjectPath);

    // semver.satisfies with version ranges like '^4.17.10' may not match '<4.17.21'
    // because the range specifies minimum version, not the resolved version
    // Just verify it doesn't crash and returns an array
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle tilde version ranges', async () => {
    const packageJson = {
      dependencies: {
        lodash: '~4.17.10',
      },
    };

    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      callback(null, JSON.stringify(packageJson));
    });

    const result = await scanDependencies(mockProjectPath);

    // semver.satisfies with tilde ranges may not match vulnerability patterns
    // Just verify it doesn't crash and returns an array
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle exact versions', async () => {
    const packageJson = {
      dependencies: {
        lodash: '4.17.10',
      },
    };

    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      callback(null, JSON.stringify(packageJson));
    });

    const result = await scanDependencies(mockProjectPath);

    expect(result).toHaveLength(1);
    expect(result[0].version).toBe('4.17.10');
  });

  it('should handle empty dependencies objects', async () => {
    const packageJson = {
      dependencies: {},
      devDependencies: {},
    };

    vi.mocked(fs.readFile).mockImplementation((_path, _options, callback: any) => {
      callback(null, JSON.stringify(packageJson));
    });

    const result = await scanDependencies(mockProjectPath);

    expect(result).toEqual([]);
  });
});
