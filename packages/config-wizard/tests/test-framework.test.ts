/**
 * Tests for test-framework detector
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectTestFramework } from '../src/detectors/test-framework.js';
import fs from 'fs-extra';
import path from 'path';

vi.mock('fs-extra');

describe('detectTestFramework', () => {
  const mockCwd = '/test/project';
  const originalCwd = process.cwd;

  beforeEach(() => {
    vi.clearAllMocks();
    process.cwd = () => mockCwd;
  });

  afterEach(() => {
    process.cwd = originalCwd;
  });

  it('should return null if package.json does not exist', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    const result = await detectTestFramework();

    expect(result).toBeNull();
  });

  it('should detect vitest from dependencies', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      return p === pkgPath;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: { vitest: '^1.0.0' },
    });

    const result = await detectTestFramework();

    expect(result).toBe('vitest');
  });

  it('should detect jest from dependencies', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      return p === pkgPath;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: { jest: '^29.0.0' },
    });

    const result = await detectTestFramework();

    expect(result).toBe('jest');
  });

  it('should detect jest from @types/jest', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      return p === pkgPath;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: { '@types/jest': '^29.0.0' },
    });

    const result = await detectTestFramework();

    expect(result).toBe('jest');
  });

  it('should detect mocha from dependencies', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      return p === pkgPath;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: { mocha: '^10.0.0' },
    });

    const result = await detectTestFramework();

    expect(result).toBe('mocha');
  });

  it('should detect ava from dependencies', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      return p === pkgPath;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: { ava: '^5.0.0' },
    });

    const result = await detectTestFramework();

    expect(result).toBe('ava');
  });

  it('should detect vitest from vitest.config.ts', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    const configPath = path.join(mockCwd, 'vitest.config.ts');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      if (p === pkgPath) return true;
      if (p === configPath) return true;
      return false;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: {},
    });

    const result = await detectTestFramework();

    expect(result).toBe('vitest');
  });

  it('should detect vitest from vitest.config.js', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    const configPath = path.join(mockCwd, 'vitest.config.js');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      if (p === pkgPath) return true;
      if (p === configPath) return true;
      return false;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: {},
    });

    const result = await detectTestFramework();

    expect(result).toBe('vitest');
  });

  it('should detect jest from jest.config.js', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    const configPath = path.join(mockCwd, 'jest.config.js');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      if (p === pkgPath) return true;
      if (p === configPath) return true;
      return false;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: {},
    });

    const result = await detectTestFramework();

    expect(result).toBe('jest');
  });

  it('should detect jest from jest.config.ts', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    const configPath = path.join(mockCwd, 'jest.config.ts');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      if (p === pkgPath) return true;
      if (p === configPath) return true;
      return false;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: {},
    });

    const result = await detectTestFramework();

    expect(result).toBe('jest');
  });

  it('should detect mocha from .mocharc.json', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    const configPath = path.join(mockCwd, '.mocharc.json');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      if (p === pkgPath) return true;
      if (p === configPath) return true;
      return false;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: {},
    });

    const result = await detectTestFramework();

    expect(result).toBe('mocha');
  });

  it('should detect ava from ava.config.js', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    const configPath = path.join(mockCwd, 'ava.config.js');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      if (p === pkgPath) return true;
      if (p === configPath) return true;
      return false;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: {},
    });

    const result = await detectTestFramework();

    expect(result).toBe('ava');
  });

  it('should detect vitest from test script', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      return p === pkgPath;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: {},
      scripts: { test: 'vitest run' },
    });

    const result = await detectTestFramework();

    expect(result).toBe('vitest');
  });

  it('should detect jest from test script', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      return p === pkgPath;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: {},
      scripts: { test: 'jest --coverage' },
    });

    const result = await detectTestFramework();

    expect(result).toBe('jest');
  });

  it('should detect mocha from test script', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      return p === pkgPath;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: {},
      scripts: { test: 'mocha tests/**/*.spec.js' },
    });

    const result = await detectTestFramework();

    expect(result).toBe('mocha');
  });

  it('should detect ava from test script', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      return p === pkgPath;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: {},
      scripts: { test: 'ava' },
    });

    const result = await detectTestFramework();

    expect(result).toBe('ava');
  });

  it('should return null if no framework detected', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      return p === pkgPath;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: {},
      scripts: {},
    });

    const result = await detectTestFramework();

    expect(result).toBeNull();
  });

  it('should prioritize vitest over other frameworks', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      return p === pkgPath;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: {
        vitest: '^1.0.0',
        jest: '^29.0.0',
      },
    });

    const result = await detectTestFramework();

    expect(result).toBe('vitest');
  });

  it('should handle missing scripts object', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      return p === pkgPath;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      devDependencies: {},
      // No scripts object
    });

    const result = await detectTestFramework();

    expect(result).toBeNull();
  });

  it('should handle dependencies in both dependencies and devDependencies', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      return p === pkgPath;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      dependencies: { jest: '^29.0.0' },
      devDependencies: {},
    });

    const result = await detectTestFramework();

    expect(result).toBe('jest');
  });

  it('should handle undefined dependencies objects', async () => {
    const pkgPath = path.join(mockCwd, 'package.json');
    vi.mocked(fs.pathExists).mockImplementation(async p => {
      return p === pkgPath;
    });
    vi.mocked(fs.readJSON).mockResolvedValue({
      // No dependencies or devDependencies
      scripts: { test: 'jest' },
    });

    const result = await detectTestFramework();

    expect(result).toBe('jest');
  });
});
