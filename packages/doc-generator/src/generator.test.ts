import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { generateJSDoc, generateReadme } from './generator.js';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

describe('Doc Generator', () => {
  const testFile = path.join(tmpdir(), 'test-code-' + Date.now() + '.ts');
  const testProjectDir = path.join(tmpdir(), 'test-project-' + Date.now());

  beforeAll(() => {
    fs.writeFileSync(
      testFile,
      `
      export function testFunction(param: string): number {
        return param.length;
      }
    `
    );

    // Create test project directory
    fs.mkdirSync(testProjectDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
    if (fs.existsSync(testProjectDir)) {
      fs.rmSync(testProjectDir, { recursive: true, force: true });
    }
  });

  describe('JSDoc Generation', () => {
    it('should generate JSDoc', async () => {
      const result = await generateJSDoc(testFile, {});
      expect(result.content).toContain('Function to test function');
      expect(result.content).toContain('@param {string} param');
      expect(result.content).toContain('@returns {number}');
      expect(result.content).toContain('The calculated number');
    });

    it('should handle async functions', async () => {
      const asyncFile = path.join(tmpdir(), 'async-test-' + Date.now() + '.ts');
      fs.writeFileSync(
        asyncFile,
        `export async function fetchData(url: string): Promise<string> {
          return fetch(url).then(r => r.text());
        }`
      );

      const result = await generateJSDoc(asyncFile, {});
      expect(result.content).toContain('@param');
      expect(result.content).toContain('@returns');

      fs.unlinkSync(asyncFile);
    });

    it('should handle functions with multiple parameters', async () => {
      const multiParamFile = path.join(tmpdir(), 'multi-param-' + Date.now() + '.ts');
      fs.writeFileSync(
        multiParamFile,
        `export function calculate(a: number, b: number, c: string): number {
          return a + b;
        }`
      );

      const result = await generateJSDoc(multiParamFile, {});
      expect(result.content).toContain('@param {number} a');
      expect(result.content).toContain('@param {number} b');
      expect(result.content).toContain('@param {string} c');

      fs.unlinkSync(multiParamFile);
    });

    it('should handle functions with no parameters', async () => {
      const noParamFile = path.join(tmpdir(), 'no-param-' + Date.now() + '.ts');
      fs.writeFileSync(
        noParamFile,
        `export function getConfig(): object {
          return {};
        }`
      );

      const result = await generateJSDoc(noParamFile, {});
      expect(result.content).toContain('@returns');
      expect(result.content).not.toContain('@param');

      fs.unlinkSync(noParamFile);
    });

    it('should handle classes', async () => {
      const classFile = path.join(tmpdir(), 'class-test-' + Date.now() + '.ts');
      fs.writeFileSync(
        classFile,
        `export class TestClass {
          constructor(name: string) {}
          getName(): string { return ''; }
        }`
      );

      const result = await generateJSDoc(classFile, {});
      expect(result.content).toContain('class');

      fs.unlinkSync(classFile);
    });
  });

  describe('README Generation', () => {
    it('should generate README', async () => {
      const result = await generateReadme(process.cwd(), {
        projectName: 'Test Project',
      });
      expect(result.content).toContain('# Test Project');
    });

    it('should include badges when enabled', async () => {
      const pkgPath = path.join(testProjectDir, 'package.json');
      fs.writeFileSync(
        pkgPath,
        JSON.stringify({ name: 'test-pkg', version: '1.0.0', license: 'MIT' })
      );

      const result = await generateReadme(testProjectDir, {
        includeBadges: true,
      });

      expect(result.content).toContain('![Version]');
      expect(result.content).toContain('![License]');
    });

    it('should include table of contents when enabled', async () => {
      const result = await generateReadme(testProjectDir, {
        includeTOC: true,
      });

      expect(result.content).toContain('## Table of Contents');
      expect(result.content).toContain('[Installation]');
      expect(result.content).toContain('[Usage]');
    });

    it('should handle missing package.json gracefully', async () => {
      const emptyDir = path.join(tmpdir(), 'empty-' + Date.now());
      fs.mkdirSync(emptyDir);

      const result = await generateReadme(emptyDir, {
        projectName: 'Custom Name',
      });

      expect(result.content).toContain('# Custom Name');

      fs.rmSync(emptyDir, { recursive: true });
    });

    it('should include installation section when enabled', async () => {
      const result = await generateReadme(testProjectDir, {
        includeInstallation: true,
      });

      expect(result.content).toContain('## Installation');
    });

    it('should include usage section when enabled', async () => {
      const result = await generateReadme(testProjectDir, {
        includeUsage: true,
      });

      expect(result.content).toContain('## Usage');
    });

    it('should handle invalid project path', async () => {
      await expect(generateReadme('/nonexistent/path/to/project', {})).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid file paths in JSDoc', async () => {
      await expect(generateJSDoc('/nonexistent/file.ts', {})).rejects.toThrow();
    });

    it('should handle malformed TypeScript', async () => {
      const malformedFile = path.join(tmpdir(), 'malformed-' + Date.now() + '.ts');
      fs.writeFileSync(malformedFile, 'this is not valid typescript {{{');

      const result = await generateJSDoc(malformedFile, {});
      // Should still return a result, possibly with warnings
      expect(result).toBeDefined();

      fs.unlinkSync(malformedFile);
    });
  });
});
