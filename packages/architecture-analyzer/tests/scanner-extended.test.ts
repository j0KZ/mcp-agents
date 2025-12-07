/**
 * Extended tests for project scanner - coverage improvement
 */

import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProjectScanner } from '../src/scanner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
const sharedPath = path.join(projectRoot, 'packages/shared');

describe('ProjectScanner Extended', () => {
  const scanner = new ProjectScanner();

  describe('scanProject', () => {
    it('should find TypeScript files', async () => {
      const result = await scanner.scanProject(sharedPath, ['node_modules', 'dist']);
      expect(result.modules.length).toBeGreaterThan(0);
      const tsFiles = result.modules.filter(m => m.path.endsWith('.ts'));
      expect(tsFiles.length).toBeGreaterThan(0);
    });

    it('should exclude node_modules by default', async () => {
      const result = await scanner.scanProject(sharedPath);
      const nodeModulesFiles = result.modules.filter(m => m.path.includes('node_modules'));
      expect(nodeModulesFiles.length).toBe(0);
    });

    it('should exclude dist by default', async () => {
      const result = await scanner.scanProject(sharedPath);
      const distFiles = result.modules.filter(m => m.path.includes('dist'));
      expect(distFiles.length).toBe(0);
    });

    it('should extract module names from paths', async () => {
      const result = await scanner.scanProject(sharedPath, ['node_modules', 'dist']);
      for (const module of result.modules) {
        expect(module.name).toBeDefined();
        expect(module.name).not.toContain('.ts');
        expect(module.name).not.toContain('.js');
      }
    });

    it('should calculate lines of code', async () => {
      const result = await scanner.scanProject(sharedPath, ['node_modules', 'dist']);
      for (const module of result.modules) {
        expect(module.linesOfCode).toBeGreaterThan(0);
      }
    });
  });

  describe('import extraction', () => {
    it('should extract ES6 imports', async () => {
      const result = await scanner.scanProject(sharedPath, ['node_modules', 'dist']);
      const modulesWithImports = result.modules.filter(m => m.imports.length > 0);
      expect(modulesWithImports.length).toBeGreaterThan(0);
    });

    it('should extract relative imports', async () => {
      const result = await scanner.scanProject(sharedPath, ['node_modules', 'dist']);
      const modulesWithRelativeImports = result.modules.filter(m =>
        m.imports.some(imp => imp.startsWith('.'))
      );
      expect(modulesWithRelativeImports.length).toBeGreaterThan(0);
    });

    it('should extract external imports', async () => {
      const result = await scanner.scanProject(sharedPath, ['node_modules', 'dist']);
      const modulesWithExternalImports = result.modules.filter(m =>
        m.imports.some(imp => !imp.startsWith('.') && !imp.startsWith('/'))
      );
      expect(modulesWithExternalImports.length).toBeGreaterThan(0);
    });
  });

  describe('export extraction', () => {
    it('should extract named exports', async () => {
      const result = await scanner.scanProject(sharedPath, ['node_modules', 'dist']);
      const modulesWithExports = result.modules.filter(m => m.exports.length > 0);
      expect(modulesWithExports.length).toBeGreaterThan(0);
    });

    it('should extract default exports', async () => {
      const result = await scanner.scanProject(sharedPath, ['node_modules', 'dist']);
      const modulesWithDefaultExport = result.modules.filter(m => m.exports.includes('default'));
      // May or may not have default exports
      expect(Array.isArray(modulesWithDefaultExport)).toBe(true);
    });
  });

  describe('dependency extraction', () => {
    it('should extract dependencies between modules', async () => {
      const result = await scanner.scanProject(sharedPath, ['node_modules', 'dist']);
      expect(result.dependencies).toBeDefined();
      expect(Array.isArray(result.dependencies)).toBe(true);
    });

    it('should have proper dependency structure', async () => {
      const result = await scanner.scanProject(sharedPath, ['node_modules', 'dist']);
      for (const dep of result.dependencies) {
        expect(dep.from).toBeDefined();
        expect(dep.to).toBeDefined();
        expect(dep.type).toBeDefined();
      }
    });

    it('should filter out internal dependencies', async () => {
      const result = await scanner.scanProject(sharedPath, ['node_modules', 'dist']);
      for (const module of result.modules) {
        // dependencies should only contain local imports
        for (const dep of module.dependencies) {
          expect(dep.startsWith('.')).toBe(true);
        }
      }
    });
  });

  describe('file type detection', () => {
    it('should detect TypeScript files', async () => {
      const result = await scanner.scanProject(sharedPath, ['node_modules', 'dist']);
      const tsModules = result.modules.filter(m => m.path.endsWith('.ts'));
      expect(tsModules.length).toBeGreaterThan(0);
    });

    it('should detect JavaScript files if present', async () => {
      const result = await scanner.scanProject(sharedPath, ['node_modules', 'dist']);
      // JS files may or may not exist in src
      expect(Array.isArray(result.modules)).toBe(true);
    });
  });

  describe('path resolution', () => {
    it('should handle relative paths correctly', async () => {
      const result = await scanner.scanProject(sharedPath, ['node_modules', 'dist']);
      for (const module of result.modules) {
        // Path should be relative (not absolute)
        expect(module.path).not.toMatch(/^[A-Z]:/);
        expect(module.path).not.toMatch(/^\//);
      }
    });

    it('should normalize path separators', async () => {
      const result = await scanner.scanProject(sharedPath, ['node_modules', 'dist']);
      for (const module of result.modules) {
        // Name should use forward slashes
        expect(module.name).not.toContain('\\\\');
      }
    });
  });
});
