import { readFile, readdir, stat } from 'fs/promises';
import { join, relative, sep } from 'path';
import { Module, Dependency } from './types.js';

export class ProjectScanner {
  /**
   * Scan project directory and extract modules
   */
  async scanProject(
    projectPath: string,
    excludePatterns: string[] = ['node_modules', 'dist', '.git']
  ): Promise<{ modules: Module[]; dependencies: Dependency[] }> {
    const modules: Module[] = [];
    const files = await this.findSourceFiles(projectPath, excludePatterns);

    for (const file of files) {
      const module = await this.analyzeFile(file, projectPath);
      modules.push(module);
    }

    const dependencies = this.extractDependencies(modules);

    return { modules, dependencies };
  }

  /**
   * Find all source files in project
   */
  private async findSourceFiles(
    dir: string,
    excludePatterns: string[],
    files: string[] = []
  ): Promise<string[]> {
    const entries = await readdir(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);

      // Check if should exclude
      const shouldExclude = excludePatterns.some(pattern => fullPath.includes(pattern));
      if (shouldExclude) continue;

      if (stats.isDirectory()) {
        await this.findSourceFiles(fullPath, excludePatterns, files);
      } else if (this.isSourceFile(entry)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Check if file is a source file
   */
  private isSourceFile(filename: string): boolean {
    return /\.(js|ts|jsx|tsx|mjs|cjs)$/.test(filename);
  }

  /**
   * Analyze a single file
   */
  private async analyzeFile(filePath: string, projectPath: string): Promise<Module> {
    const content = await readFile(filePath, 'utf-8');
    const relativePath = relative(projectPath, filePath);

    const imports = this.extractImports(content);
    const exports = this.extractExports(content);
    const linesOfCode = content.split('\n').filter(line => line.trim().length > 0).length;

    return {
      name: this.getModuleName(relativePath),
      path: relativePath,
      imports,
      exports,
      linesOfCode,
      dependencies: imports.filter(imp => !this.isExternalDependency(imp)),
    };
  }

  /**
   * Extract import statements
   */
  private extractImports(content: string): string[] {
    const imports: string[] = [];

    // ES6 imports
    const es6ImportRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = es6ImportRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    // CommonJS requires
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    // Dynamic imports
    const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return [...new Set(imports)]; // Remove duplicates
  }

  /**
   * Extract export statements
   */
  private extractExports(content: string): string[] {
    const exports: string[] = [];

    // Named exports
    const namedExportRegex = /export\s+(?:const|let|var|function|class)\s+(\w+)/g;
    let match;
    while ((match = namedExportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    // Export destructuring
    const destructuredExportRegex = /export\s+\{([^}]+)\}/g;
    while ((match = destructuredExportRegex.exec(content)) !== null) {
      const names = match[1].split(',').map(n => n.trim().split(/\s+as\s+/)[0]);
      exports.push(...names);
    }

    // Default export
    if (/export\s+default/.test(content)) {
      exports.push('default');
    }

    return [...new Set(exports)];
  }

  /**
   * Extract dependencies between modules
   */
  private extractDependencies(modules: Module[]): Dependency[] {
    const dependencies: Dependency[] = [];
    const modulePathMap = new Map(modules.map(m => [m.path, m]));

    for (const module of modules) {
      for (const imp of module.imports) {
        // Resolve import path
        const resolvedPath = this.resolveImportPath(imp, module.path);
        if (modulePathMap.has(resolvedPath)) {
          dependencies.push({
            from: module.path,
            to: resolvedPath,
            type: this.getImportType(imp),
          });
        }
      }
    }

    return dependencies;
  }

  /**
   * Get module name from path
   */
  private getModuleName(path: string): string {
    return path.replace(/\.(js|ts|jsx|tsx|mjs|cjs)$/, '').replace(/\\/g, '/');
  }

  /**
   * Check if import is external dependency
   */
  private isExternalDependency(importPath: string): boolean {
    return !importPath.startsWith('.') && !importPath.startsWith('/');
  }

  /**
   * Resolve import path relative to current module
   */
  private resolveImportPath(importPath: string, currentPath: string): string {
    if (this.isExternalDependency(importPath)) {
      return importPath;
    }

    // Get current directory
    const currentDir = currentPath.split(sep).slice(0, -1).join(sep);
    let resolved = join(currentDir, importPath);

    // Normalize path separators
    resolved = resolved.replace(/\\/g, '/');

    // Handle TypeScript imports with .js extension (ES modules convention)
    if (!resolved.match(/\.(ts|tsx|js|jsx|mjs|cjs)$/)) {
      // Check if .js extension maps to .ts file
      if (resolved.endsWith('.js')) {
        resolved = resolved.replace(/\.js$/, '.ts');
      } else {
        // Try with .ts first (TypeScript monorepo)
        resolved = resolved + '.ts';
      }
    }

    return resolved;
  }

  /**
   * Get import type
   */
  private getImportType(_importPath: string): 'import' | 'require' | 'dynamic' {
    // This is a simplified heuristic
    return 'import';
  }
}
