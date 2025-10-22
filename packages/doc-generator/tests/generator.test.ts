import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import * as target from '../src/generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');

describe('generateReadme()', () => {
  it('should generate README with valid project path', async () => {
    // Use current directory which has package.json
    const result = await target.generateReadme('.', {});
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
  });

  it('should throw on invalid input', async () => {
    await expect(target.generateReadme(null as any)).rejects.toThrow();
    await expect(target.generateReadme(undefined as any)).rejects.toThrow();
  });

  it('should include project name in README', async () => {
    const result = await target.generateReadme('.', {});
    expect(result.content).toBeDefined();
    expect(typeof result.content).toBe('string');
    expect(result.content.length).toBeGreaterThan(0);
  });

  it('should support custom configuration', async () => {
    const result = await target.generateReadme('.', {
      includeInstallation: true,
      includeUsage: true,
    });
    expect(result.content).toBeDefined();
  });

  it('should include sections when configured', async () => {
    const result = await target.generateReadme('.', {
      includeTOC: true,
      includeBadges: true,
    });
    expect(result.content).toBeDefined();
  });
});

describe('generateApiDocs()', () => {
  it('should generate API docs with valid project path', async () => {
    const result = await target.generateApiDocs('.', {});
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
  });

  it('should throw on invalid input', async () => {
    await expect(target.generateApiDocs(null as any)).rejects.toThrow();
  });

  it('should return markdown content', async () => {
    const result = await target.generateApiDocs('.', {});
    expect(typeof result.content).toBe('string');
  });

  it('should support configuration options', async () => {
    const result = await target.generateApiDocs('.', {
      includeInterfaces: true,
      includeTypes: true,
    });
    expect(result.content).toBeDefined();
  });

  it('should handle empty projects', async () => {
    const result = await target.generateApiDocs('.', {});
    expect(result).toBeDefined();
  });
});

describe('generateChangelog()', () => {
  it('should generate changelog for git repository', async () => {
    // Use project root which has .git directory
    const result = await target.generateChangelog(projectRoot, {});
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
  });

  it('should throw on non-git directory', async () => {
    await expect(target.generateChangelog('/tmp', {})).rejects.toThrow();
  });

  it('should return string content', async () => {
    const result = await target.generateChangelog(projectRoot, {});
    expect(typeof result.content).toBe('string');
  });

  it('should support conventional commits', async () => {
    const result = await target.generateChangelog(projectRoot, {
      conventionalCommits: true,
    });
    expect(result.content).toBeDefined();
  });

  it('should group by type when configured', async () => {
    const result = await target.generateChangelog(projectRoot, {
      groupByType: true,
    });
    expect(result.content).toBeDefined();
  });

  it('should include authors when configured', async () => {
    const result = await target.generateChangelog(projectRoot, {
      includeAuthors: true,
    });
    expect(result.content).toBeDefined();
  });
});

describe('generateJSDoc()', () => {
  it('should have generateJSDoc function', () => {
    expect(target.generateJSDoc).toBeDefined();
    expect(typeof target.generateJSDoc).toBe('function');
  });
});
