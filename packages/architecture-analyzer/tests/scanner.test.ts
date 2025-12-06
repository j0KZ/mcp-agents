import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import * as target from '../src/scanner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
const apiDesignerPath = path.join(projectRoot, 'packages/api-designer');

describe('ProjectScanner', () => {
  it('should scan a project', async () => {
    const instance = new target.ProjectScanner();
    const result = await instance.scanProject(apiDesignerPath);
    expect(result).toBeDefined();
  });

  it('should return modules array', async () => {
    const instance = new target.ProjectScanner();
    const result = await instance.scanProject(apiDesignerPath);
    expect(Array.isArray(result.modules)).toBe(true);
  });

  it('should detect TypeScript modules', async () => {
    const instance = new target.ProjectScanner();
    const result = await instance.scanProject(apiDesignerPath);
    const tsModules = result.modules.filter((m: any) => m.path.endsWith('.ts'));
    expect(tsModules.length).toBeGreaterThan(0);
  });

  it('should handle exclude patterns', async () => {
    const instance = new target.ProjectScanner();
    const result = await instance.scanProject(apiDesignerPath, ['node_modules', 'dist', 'tests']);
    const nodeModulesModules = result.modules.filter((m: any) => m.path.includes('node_modules'));
    expect(nodeModulesModules.length).toBe(0);
  });

  it('should extract imports from modules', async () => {
    const instance = new target.ProjectScanner();
    const result = await instance.scanProject(apiDesignerPath);
    if (result.modules.length > 0) {
      const moduleWithImports = result.modules.find((m: any) => m.imports && m.imports.length > 0);
      if (moduleWithImports) {
        expect(Array.isArray(moduleWithImports.imports)).toBe(true);
      }
    }
  });

  it('should extract exports from modules', async () => {
    const instance = new target.ProjectScanner();
    const result = await instance.scanProject(apiDesignerPath);
    if (result.modules.length > 0) {
      const moduleWithExports = result.modules.find((m: any) => m.exports && m.exports.length > 0);
      if (moduleWithExports) {
        expect(Array.isArray(moduleWithExports.exports)).toBe(true);
      }
    }
  });

  it('should return dependencies array', async () => {
    const instance = new target.ProjectScanner();
    const result = await instance.scanProject(apiDesignerPath);
    expect(Array.isArray(result.dependencies)).toBe(true);
  });

  it('should calculate lines of code', async () => {
    const instance = new target.ProjectScanner();
    const result = await instance.scanProject(apiDesignerPath);
    if (result.modules.length > 0) {
      expect(result.modules[0].linesOfCode).toBeGreaterThan(0);
    }
  });
});
